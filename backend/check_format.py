#!/usr/bin/env python3
"""
Check the structure of question analyses in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
from dotenv import load_dotenv

load_dotenv()


async def check_question_analysis():
    """Check the format of question analyses"""

    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    print("=" * 80)
    print("QUESTION ANALYSIS FORMAT CHECK")
    print("=" * 80)
    print()

    # Get most recent analysis with structured data
    analysis = await db.analyses.find_one(
        {"survey_type": "structured"}, sort=[("_id", -1)]
    )

    if not analysis:
        print("No structured survey analysis found!")
        return

    print(f"Analysis ID: {analysis['_id']}")
    print(f"Survey Type: {analysis.get('survey_type')}")
    print(f"Total Questions: {len(analysis.get('question_analyses', []))}")
    print()

    # Check first question analysis
    if analysis.get("question_analyses"):
        qa = analysis["question_analyses"][0]

        print("=" * 80)
        print("FIRST QUESTION ANALYSIS STRUCTURE")
        print("=" * 80)
        print()

        print(f"Question: {qa.get('question_text', 'N/A')}")
        print(f"Response Count: {qa.get('response_count', 0)}")
        print()

        print("Summary field type:", type(qa.get("summary")))
        print("Summary field value:")
        print("-" * 80)
        summary = qa.get("summary", "")
        print(summary[:500] if len(summary) > 500 else summary)
        print("-" * 80)
        print()

        # Check if summary is a stringified JSON
        if isinstance(qa.get("summary"), str):
            try:
                parsed = json.loads(qa.get("summary"))
                print("⚠️  WARNING: Summary is a stringified JSON object!")
                print("It should be a plain string, not JSON.")
                print()
                print("Parsed structure:")
                print(json.dumps(parsed, indent=2)[:500])
            except json.JSONDecodeError:
                print("✅ Summary is a plain string (not JSON)")

        print()
        print("Key Findings type:", type(qa.get("key_findings")))
        print(
            "Key Findings count:",
            (
                len(qa.get("key_findings", []))
                if isinstance(qa.get("key_findings"), list)
                else "N/A"
            ),
        )

        if qa.get("key_findings"):
            print("First key finding:")
            kf = (
                qa.get("key_findings")[0]
                if isinstance(qa.get("key_findings"), list)
                else qa.get("key_findings")
            )
            print(f"  {kf}")

    print()
    print("=" * 80)

    client.close()


if __name__ == "__main__":
    asyncio.run(check_question_analysis())
