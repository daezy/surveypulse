#!/usr/bin/env python3
"""
Debug script to check survey analysis errors
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


async def check_failed_surveys():
    """Check for failed surveys and show error details"""

    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    print("=" * 80)
    print("FAILED SURVEYS REPORT")
    print("=" * 80)
    print()

    # Find all failed surveys
    failed_surveys = (
        await db.surveys.find({"status": "failed"})
        .sort("_id", -1)
        .limit(10)
        .to_list(length=10)
    )

    if not failed_surveys:
        print("✅ No failed surveys found!")
        return

    print(f"Found {len(failed_surveys)} failed survey(s):\n")

    for idx, survey in enumerate(failed_surveys, 1):
        print(f"Survey #{idx}")
        print(f"  ID: {survey['_id']}")
        print(f"  Name: {survey.get('name', 'N/A')}")
        print(f"  Type: {survey.get('survey_type', 'simple')}")
        print(f"  Status: {survey.get('status')}")
        print(f"  Error: {survey.get('error', 'No error message')}")
        print(f"  Created: {survey.get('created_at', 'N/A')}")
        print(f"  Updated: {survey.get('updated_at', 'N/A')}")

        # Show progress if available
        if "progress" in survey:
            progress = survey["progress"]
            print(f"  Last Progress:")
            print(f"    - Step: {progress.get('step', 'N/A')}")
            print(f"    - Message: {progress.get('message', 'N/A')}")
            print(f"    - Percentage: {progress.get('percentage', 0)}%")
            print(
                f"    - Question: {progress.get('current_question', 0)}/{progress.get('total_questions', 0)}"
            )

        print()

    print("=" * 80)
    print("\nTroubleshooting Tips:")
    print("1. Check if OpenAI API key is valid")
    print("2. Verify MongoDB connection")
    print("3. Check backend logs for detailed error traces")
    print("4. Ensure survey has valid processed_data (for structured surveys)")
    print("=" * 80)

    client.close()


if __name__ == "__main__":
    asyncio.run(check_failed_surveys())
