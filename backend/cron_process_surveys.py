#!/usr/bin/env python3
"""
Cron job to automatically process surveys with status "pending"
Run this script periodically (e.g., every minute) to auto-analyze surveys

Usage:
  python cron_process_surveys.py

Add to crontab:
  * * * * * cd /path/to/project/backend && python cron_process_surveys.py >> /var/log/survey_cron.log 2>&1
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
import logging
from datetime import datetime
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from app.services.llm_service import LLMService


async def process_pending_surveys():
    """Find and process all surveys with status 'pending'"""

    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        logger.error("❌ MONGODB_URI not found in environment variables")
        return

    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    try:
        # Test connection
        await client.admin.command("ping")
        logger.info("✅ Connected to MongoDB")

        # Find all pending surveys
        pending_surveys = await db.surveys.find({"status": "pending"}).to_list(
            length=100
        )

        if not pending_surveys:
            logger.info("✅ No pending surveys found. All caught up!")
            return

        logger.info(f"📋 Found {len(pending_surveys)} pending survey(s)")

        # Initialize LLM service once
        llm_service = LLMService()

        # Process each survey
        for survey in pending_surveys:
            survey_id = str(survey["_id"])
            survey_title = survey.get("title", "Untitled")
            survey_type = survey.get("survey_type", "simple")

            logger.info(f"\n{'='*80}")
            logger.info(f"🚀 Processing: {survey_title} (ID: {survey_id})")
            logger.info(f"   Type: {survey_type}")
            logger.info(f"{'='*80}")

            try:
                # Update status to processing
                await db.surveys.update_one(
                    {"_id": ObjectId(survey_id)},
                    {
                        "$set": {
                            "status": "processing",
                            "progress": {
                                "step": "initializing",
                                "message": "Starting automated analysis...",
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

                # Handle structured surveys
                if survey_type == "structured":
                    processed_data = survey.get("processed_data", {})

                    if not processed_data:
                        logger.error(
                            f"❌ No processed data found for survey {survey_id}"
                        )
                        await db.surveys.update_one(
                            {"_id": ObjectId(survey_id)},
                            {
                                "$set": {
                                    "status": "failed",
                                    "error": "No processed data",
                                }
                            },
                        )
                        continue

                    total_questions = len(processed_data)
                    logger.info(f"   📊 Analyzing {total_questions} questions...")

                    # Progress callback
                    async def progress_callback(
                        step, message, current_question, total_questions
                    ):
                        percentage = (
                            10 + int((current_question / total_questions) * 70)
                            if total_questions > 0
                            else 10
                        )
                        logger.info(f"      {percentage}% - {message}")
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

                    # Analyze structured survey
                    structured_result = await llm_service.analyze_structured_survey(
                        processed_data, progress_callback=progress_callback
                    )

                    result_data.update(
                        {
                            "question_analyses": structured_result.get(
                                "question_analyses", []
                            ),
                            "cross_question_insights": structured_result.get(
                                "cross_question_insights", {}
                            ),
                            "total_questions_analyzed": structured_result.get(
                                "total_questions_analyzed", 0
                            ),
                            "total_responses_analyzed": survey.get(
                                "total_responses", 0
                            ),
                        }
                    )

                    logger.info(
                        f"   ✅ Analyzed {result_data['total_questions_analyzed']} questions"
                    )

                # Handle simple surveys
                else:
                    responses = survey.get("responses", [])
                    logger.info(f"   📊 Analyzing {len(responses)} responses...")

                    result_data["total_responses_analyzed"] = len(responses)

                    # Progress update
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

                    # Full analysis
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

                    logger.info(f"   ✅ Analysis complete")

                processing_time = time.time() - start_time
                result_data["processing_time"] = processing_time

                # Save analysis
                await db.surveys.update_one(
                    {"_id": ObjectId(survey_id)},
                    {
                        "$set": {
                            "progress.step": "finalizing",
                            "progress.message": "Saving results...",
                            "progress.percentage": 95,
                            "progress.last_updated": datetime.utcnow(),
                        }
                    },
                )

                analysis_result = await db.analyses.insert_one(result_data)

                # Update survey status to completed
                await db.surveys.update_one(
                    {"_id": ObjectId(survey_id)},
                    {
                        "$set": {
                            "status": "completed",
                            "updated_at": datetime.utcnow(),
                            "last_analysis_id": str(analysis_result.inserted_id),
                        }
                    },
                )

                logger.info(
                    f"   ✅ Completed in {processing_time:.2f}s - Analysis ID: {analysis_result.inserted_id}"
                )

            except Exception as e:
                logger.error(
                    f"   ❌ Error processing survey {survey_id}: {str(e)}",
                    exc_info=True,
                )

                # Update survey status to failed
                await db.surveys.update_one(
                    {"_id": ObjectId(survey_id)},
                    {
                        "$set": {
                            "status": "failed",
                            "error": str(e),
                            "updated_at": datetime.utcnow(),
                        }
                    },
                )

        logger.info(f"\n{'='*80}")
        logger.info(
            f"✅ Batch processing complete! Processed {len(pending_surveys)} survey(s)"
        )
        logger.info(f"{'='*80}\n")

    except Exception as e:
        logger.error(f"❌ Fatal error in cron job: {str(e)}", exc_info=True)

    finally:
        client.close()
        logger.info("🔌 Disconnected from MongoDB")


if __name__ == "__main__":
    logger.info(f"\n{'='*80}")
    logger.info(f"CRON JOB: AUTO-PROCESS PENDING SURVEYS")
    logger.info(f"Started at: {datetime.utcnow().isoformat()}")
    logger.info(f"{'='*80}\n")

    asyncio.run(process_pending_surveys())

    logger.info(f"Finished at: {datetime.utcnow().isoformat()}\n")
