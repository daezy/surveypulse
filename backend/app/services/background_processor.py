"""
Background task scheduler for automatic survey processing
"""

import asyncio
import logging
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import time

from app.core.config import settings
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class SurveyProcessor:
    """Background processor for pending surveys"""

    def __init__(self):
        self.llm_service = LLMService()
        self.is_running = False
        self.task = None

    async def process_pending_surveys(self, db):
        """Find and process all surveys with status 'pending'"""

        try:
            # Find all pending surveys
            pending_surveys = await db.surveys.find({"status": "pending"}).to_list(
                length=10
            )

            if not pending_surveys:
                return

            logger.info(f"🔄 Auto-processing {len(pending_surveys)} pending survey(s)")

            # Process each survey
            for survey in pending_surveys:
                survey_id = str(survey["_id"])
                survey_type = survey.get("survey_type", "simple")

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
                            raise Exception("No processed data found")

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

                        structured_result = (
                            await self.llm_service.analyze_structured_survey(
                                processed_data, progress_callback=progress_callback
                            )
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

                    else:
                        responses = survey.get("responses", [])
                        result_data["total_responses_analyzed"] = len(responses)

                        full_result = await self.llm_service.full_analysis(responses)
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

                    result_data["processing_time"] = time.time() - start_time

                    # Save analysis
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

                    logger.info(
                        f"✅ Auto-processed survey {survey_id} in {result_data['processing_time']:.2f}s"
                    )

                except Exception as e:
                    logger.error(
                        f"❌ Error auto-processing survey {survey_id}: {str(e)}"
                    )
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

        except Exception as e:
            logger.error(f"❌ Error in auto-processor: {str(e)}")

    async def run_periodic(self, db, interval=60):
        """Run the processor periodically"""
        self.is_running = True
        logger.info(f"🤖 Auto-processor started (checking every {interval}s)")

        while self.is_running:
            try:
                await self.process_pending_surveys(db)
            except Exception as e:
                logger.error(f"Error in periodic processor: {e}")

            # Wait before next check
            await asyncio.sleep(interval)

    def start(self, db, interval=60):
        """Start the background processor"""
        if self.task is None or self.task.done():
            self.task = asyncio.create_task(self.run_periodic(db, interval))
            logger.info("🚀 Background survey processor started")

    async def stop(self):
        """Stop the background processor"""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("🛑 Background survey processor stopped")


# Global instance
survey_processor = SurveyProcessor()
