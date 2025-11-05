#!/usr/bin/env python3
"""
Check current surveys in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()


async def check_surveys():
    """Check all surveys"""

    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    print("=" * 80)
    print("ALL SURVEYS")
    print("=" * 80)

    surveys = await db.surveys.find().sort("_id", -1).limit(5).to_list(length=5)

    if not surveys:
        print("No surveys found!")
        return

    print(f"\nFound {len(surveys)} recent survey(s):\n")

    for idx, survey in enumerate(surveys, 1):
        print(f"Survey #{idx}")
        print(f"  ID: {survey['_id']}")
        print(f"  Name: {survey.get('name', 'N/A')}")
        print(f"  Type: {survey.get('survey_type', 'simple')}")
        print(f"  Status: {survey.get('status')}")
        print(
            f"  Total Responses: {survey.get('total_responses', survey.get('total_participants', 0))}"
        )

        if survey.get("survey_type") == "structured":
            print(f"  Questions: {len(survey.get('questions', []))}")

        if survey.get("status") == "processing" and "progress" in survey:
            progress = survey["progress"]
            print(
                f"  Progress: {progress.get('percentage', 0)}% - {progress.get('message', 'N/A')}"
            )

        if survey.get("error"):
            print(f"  Error: {survey.get('error')}")

        print()

    client.close()


if __name__ == "__main__":
    asyncio.run(check_surveys())
