from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List
from datetime import datetime
from bson import ObjectId
import time
import logging

from app.core.database import get_database
from app.core.deps import get_current_active_user
from app.models.schemas import AnalysisRequest, AnalysisType, SurveyStatus
from app.models.user import User
from app.services.llm_service import LLMService
from app.services.preprocessing import DataPreprocessor

logger = logging.getLogger(__name__)

router = APIRouter()
llm_service = LLMService()
preprocessor = DataPreprocessor()


async def perform_analysis_task(survey_id: str, analysis_types: List[AnalysisType], db):
    """Background task to perform analysis - supports both simple and structured surveys"""

    try:
        # Get survey data
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            return

        # Determine survey type first
        survey_type = survey.get("survey_type", "simple")

        # Update status to processing with initial progress
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {
                "$set": {
                    "status": SurveyStatus.PROCESSING.value,
                    "progress": {
                        "step": "initializing",
                        "message": "Starting analysis...",
                        "current_question": 0,
                        "total_questions": (
                            len(survey.get("questions", []))
                            if survey_type == "structured"
                            else 1
                        ),
                        "percentage": 0,
                        "last_updated": datetime.utcnow(),
                    },
                }
            },
        )
        start_time = time.time()

        result_data = {
            "survey_id": survey_id,
            "survey_type": survey_type,
            "created_at": datetime.utcnow(),
        }

        # Handle structured multi-question surveys
        if survey_type == "structured":
            processed_data = survey.get("processed_data", {})

            if not processed_data:
                raise Exception("No processed data found for structured survey")

            # Update progress: starting structured analysis
            await db.surveys.update_one(
                {"_id": ObjectId(survey_id)},
                {
                    "$set": {
                        "progress.step": "analyzing_questions",
                        "progress.message": "Analyzing individual questions...",
                        "progress.percentage": 10,
                        "progress.last_updated": datetime.utcnow(),
                    }
                },
            )

            # Perform structured analysis with progress callback
            async def progress_callback(
                step, message, current_question, total_questions
            ):
                percentage = (
                    10 + int((current_question / total_questions) * 70)
                    if total_questions > 0
                    else 10
                )
                await db.surveys.update_one(
                    {"_id": ObjectId(survey_id)},
                    {
                        "$set": {
                            "progress.step": step,
                            "progress.current_question": current_question,
                            "progress.total_questions": total_questions,
                            "progress.message": message,
                            "progress.percentage": percentage,
                            "progress.last_updated": datetime.utcnow(),
                        }
                    },
                )

            structured_result = await llm_service.analyze_structured_survey(
                processed_data, progress_callback=progress_callback
            )

            # Update progress: cross-question analysis
            await db.surveys.update_one(
                {"_id": ObjectId(survey_id)},
                {
                    "$set": {
                        "progress.step": "cross_analysis",
                        "progress.message": "Generating cross-question insights...",
                        "progress.percentage": 85,
                        "progress.last_updated": datetime.utcnow(),
                    }
                },
            )

            result_data.update(
                {
                    "question_analyses": structured_result.get("question_analyses", []),
                    "cross_question_insights": structured_result.get(
                        "cross_question_insights", {}
                    ),
                    "total_questions_analyzed": structured_result.get(
                        "total_questions_analyzed", 0
                    ),
                    "total_responses_analyzed": survey.get("total_responses", 0),
                }
            )

        # Handle simple single-question surveys (backward compatible)
        else:
            responses = survey.get("responses", [])
            result_data["total_responses_analyzed"] = len(responses)

            # Update progress: analyzing simple survey
            await db.surveys.update_one(
                {"_id": ObjectId(survey_id)},
                {
                    "$set": {
                        "progress.step": "analyzing",
                        "progress.message": f"Analyzing {len(responses)} responses...",
                        "progress.percentage": 20,
                        "progress.last_updated": datetime.utcnow(),
                    }
                },
            )

            # Perform requested analyses
            for analysis_type in analysis_types:
                if analysis_type == AnalysisType.SUMMARIZATION:
                    summary_result = await llm_service.summarize_responses(responses)
                    result_data["summary"] = summary_result.get("summary")
                    result_data["key_findings"] = summary_result.get("key_findings")

                elif analysis_type == AnalysisType.SENTIMENT:
                    sentiment_result = await llm_service.analyze_sentiment(responses)
                    result_data["overall_sentiment"] = sentiment_result.get(
                        "overall_sentiment"
                    )
                    result_data["sentiment_distribution"] = sentiment_result.get(
                        "distribution"
                    )
                    result_data["sentiment_explanation"] = sentiment_result.get(
                        "explanation"
                    )

                elif analysis_type == AnalysisType.TOPIC_DETECTION:
                    topics_result = await llm_service.detect_topics(responses)
                    result_data["topics"] = topics_result

                elif analysis_type == AnalysisType.OPEN_PROBLEMS:
                    problems_result = await llm_service.extract_open_problems(responses)
                    result_data["open_problems"] = problems_result

                elif analysis_type == AnalysisType.FULL_ANALYSIS:
                    full_result = await llm_service.full_analysis(responses)
                    result_data.update(
                        {
                            "summary": full_result.get("summary"),
                            "key_findings": full_result.get("key_findings"),
                            "overall_sentiment": full_result["sentiment"].get(
                                "overall_sentiment"
                            ),
                            "sentiment_distribution": full_result["sentiment"].get(
                                "distribution"
                            ),
                            "topics": full_result.get("topics"),
                            "open_problems": full_result.get("open_problems"),
                        }
                    )

        processing_time = time.time() - start_time
        result_data["processing_time"] = processing_time

        # Update progress: finalizing
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {
                "$set": {
                    "progress.step": "finalizing",
                    "progress.message": "Finalizing results and preparing visualizations...",
                    "progress.percentage": 95,
                    "progress.last_updated": datetime.utcnow(),
                }
            },
        )

        # Save analysis result
        analysis_result = await db.analyses.insert_one(result_data)

        # Update survey status to completed
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {
                "$set": {
                    "status": SurveyStatus.COMPLETED.value,
                    "updated_at": datetime.utcnow(),
                    "last_analysis_id": str(analysis_result.inserted_id),
                }
            },
        )

    except Exception as e:
        # Log the error for debugging
        logger.error(f"Analysis failed for survey {survey_id}: {str(e)}", exc_info=True)

        # Update status to failed
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {
                "$set": {
                    "status": SurveyStatus.FAILED.value,
                    "error": str(e),
                    "updated_at": datetime.utcnow(),
                }
            },
        )


@router.post("/analyze")
async def start_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Start analysis of survey responses"""

    # Verify survey exists and belongs to user
    try:
        survey = await db.surveys.find_one({"_id": ObjectId(request.survey_id), "user_id": current_user.id})
    except:
        raise HTTPException(status_code=400, detail="Invalid survey ID")

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Add background task
    background_tasks.add_task(
        perform_analysis_task, request.survey_id, request.analysis_types, db
    )

    return {
        "message": "Analysis started",
        "survey_id": request.survey_id,
        "analysis_types": [at.value for at in request.analysis_types],
        "status": "processing",
    }


@router.get("/{survey_id}/results")
async def get_analysis_results(
    survey_id: str, 
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get analysis results for a survey"""
    
    # Verify survey belongs to user
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id), "user_id": current_user.id})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Get the latest analysis for this survey
    analysis = await db.analyses.find_one(
        {"survey_id": survey_id}, sort=[("created_at", -1)]
    )

    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this survey")

    # Convert ObjectId to string
    analysis["_id"] = str(analysis["_id"])
    analysis["created_at"] = analysis["created_at"].isoformat()

    return analysis


@router.get("/{survey_id}/all-results")
async def get_all_analysis_results(
    survey_id: str, 
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all analysis results for a survey"""
    
    # Verify survey belongs to user
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id), "user_id": current_user.id})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    cursor = db.analyses.find({"survey_id": survey_id}).sort("created_at", -1)
    results = []

    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        results.append(doc)

    return {"analyses": results, "total": len(results)}


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str, 
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an analysis result"""
    
    # Get the analysis to verify ownership
    try:
        analysis = await db.analyses.find_one({"_id": ObjectId(analysis_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")
        
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Verify the survey belongs to the user
    survey = await db.surveys.find_one({"_id": ObjectId(analysis["survey_id"]), "user_id": current_user.id})
    if not survey:
        raise HTTPException(status_code=403, detail="Not authorized to delete this analysis")

    result = await db.analyses.delete_one({"_id": ObjectId(analysis_id)})

    return {"message": "Analysis deleted successfully"}


@router.get("/{survey_id}/status")
async def get_analysis_status(
    survey_id: str, 
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current status of survey analysis"""
    
    # Verify survey belongs to user
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id), "user_id": current_user.id})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    logger.info(f"📡 Status check requested for survey: {survey_id}")

    try:
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid survey ID")

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    status_response = {
        "survey_id": survey_id,
        "status": survey.get("status"),
        "progress": survey.get("progress", {}),
        "updated_at": survey.get("updated_at", datetime.utcnow()).isoformat(),
    }

    logger.info(
        f"✅ Status response for {survey_id}: status={status_response['status']}, progress={status_response['progress'].get('percentage', 0)}%"
    )

    return status_response
