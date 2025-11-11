#!/usr/bin/env python3
"""
Manual script to trigger analysis for a specific survey
Usage: python trigger_analysis.py
"""
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv(backend_path / ".env")

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Import after path is set
from app.services.llm_service import LLMService
from app.models.schemas import AnalysisType
import time
from datetime import datetime


async def trigger_analysis(survey_id: str):
    """Manually trigger analysis for a survey"""

    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        logger.error("MONGODB_URI not found in environment variables")
        return

    logger.info(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    try:
        # Test connection
        await client.admin.command("ping")
        logger.info("✅ Connected to MongoDB")

        # Get survey
        logger.info(f"Fetching survey {survey_id}...")
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})

        if not survey:
            logger.error(f"❌ Survey {survey_id} not found!")
            return

        survey_type = survey.get("survey_type", "simple")
        logger.info(f"✅ Found survey: {survey.get('title', 'Untitled')}")
        logger.info(f"   Type: {survey_type}")
        logger.info(f"   Status: {survey.get('status')}")

        # Update status to processing
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {
                "$set": {
                    "status": "processing",
                    "progress": {
                        "step": "initializing",
                        "message": "Starting manual analysis...",
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

        logger.info("🚀 Starting analysis...")
        start_time = time.time()

        # Initialize LLM service
        llm_service = LLMService()

        result_data = {
            "survey_id": survey_id,
            "survey_type": survey_type,
            "created_at": datetime.utcnow(),
        }

        # Handle structured surveys
        if survey_type == "structured":
            processed_data = survey.get("processed_data", {})

            if not processed_data:
                logger.error("❌ No processed data found for structured survey")
                return

            logger.info(f"📊 Analyzing {len(processed_data)} questions...")

            # Progress callback
            async def progress_callback(
                step, message, current_question, total_questions
            ):
                percentage = (
                    10 + int((current_question / total_questions) * 70)
                    if total_questions > 0
                    else 10
                )
                logger.info(f"   Progress: {percentage}% - {message}")
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

            # Analyze
            structured_result = await llm_service.analyze_structured_survey(
                processed_data, progress_callback=progress_callback
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

        # Handle simple surveys
        else:
            responses = survey.get("responses", [])
            logger.info(f"📊 Analyzing {len(responses)} responses...")

            result_data["total_responses_analyzed"] = len(responses)

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

        processing_time = time.time() - start_time
        result_data["processing_time"] = processing_time

        logger.info(f"⏱️  Analysis completed in {processing_time:.2f} seconds")

        # Save analysis
        logger.info("💾 Saving analysis results...")
        analysis_result = await db.analyses.insert_one(result_data)

        # Update survey status
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

        logger.info(f"✅ Analysis saved with ID: {analysis_result.inserted_id}")
        logger.info(f"✅ Survey status updated to: completed")

        # Print summary
        logger.info("\n" + "=" * 80)
        logger.info("ANALYSIS SUMMARY")
        logger.info("=" * 80)

        if survey_type == "structured":
            logger.info(
                f"Questions analyzed: {result_data.get('total_questions_analyzed', 0)}"
            )
            logger.info(
                f"Total responses: {result_data.get('total_responses_analyzed', 0)}"
            )
        else:
            logger.info(f"Summary: {result_data.get('summary', '')[:200]}...")
            logger.info(f"Key findings: {len(result_data.get('key_findings', []))}")
            logger.info(f"Topics detected: {len(result_data.get('topics', []))}")
            logger.info(f"Problems found: {len(result_data.get('open_problems', []))}")

        logger.info(f"Processing time: {processing_time:.2f}s")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"❌ Error during analysis: {str(e)}", exc_info=True)

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

    finally:
        client.close()
        logger.info("🔌 Disconnected from MongoDB")


if __name__ == "__main__":
    # Survey ID to analyze
    SURVEY_ID = "691390a576b9b852b31e5160"

    print("\n" + "=" * 80)
    print("MANUAL ANALYSIS TRIGGER")
    print("=" * 80)
    print(f"Survey ID: {SURVEY_ID}")
    print("=" * 80 + "\n")

    # Run analysis
    asyncio.run(trigger_analysis(SURVEY_ID))
