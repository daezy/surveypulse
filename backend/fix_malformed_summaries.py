#!/usr/bin/env python3
"""
Find and fix analyses with stringified JSON in summary field
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
from dotenv import load_dotenv

load_dotenv()


async def find_and_fix_malformed_summaries():
    """Find analyses where summary is a stringified JSON"""

    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    print("=" * 80)
    print("SEARCHING FOR MALFORMED SUMMARIES")
    print("=" * 80)
    print()

    # Get all structured analyses
    analyses = await db.analyses.find({"survey_type": "structured"}).to_list(length=100)

    malformed_count = 0
    fixed_count = 0

    for analysis in analyses:
        analysis_id = analysis["_id"]
        question_analyses = analysis.get("question_analyses", [])

        needs_update = False
        updated_questions = []

        for qa in question_analyses:
            summary = qa.get("summary", "")

            # Check if summary is a stringified JSON (more flexible check)
            if isinstance(summary, str):
                trimmed = summary.strip()
                if trimmed.startswith("{") and (
                    '"summary"' in summary or "'summary'" in summary
                ):
                    try:
                        parsed = json.loads(summary)

                        # Check if it has the expected structure
                        if "summary" in parsed and "key_findings" in parsed:
                            malformed_count += 1
                            needs_update = True

                            print(f"Found malformed summary in analysis {analysis_id}")
                            print(
                                f"  Question: {qa.get('question_text', 'N/A')[:50]}..."
                            )
                            print()

                            # Fix the structure
                            qa["summary"] = parsed["summary"]
                            qa["key_findings"] = parsed["key_findings"]

                    except json.JSONDecodeError:
                        # Not a JSON string, leave as is
                        pass

            updated_questions.append(qa)

        # Update the database if needed
        if needs_update:
            await db.analyses.update_one(
                {"_id": analysis_id}, {"$set": {"question_analyses": updated_questions}}
            )
            fixed_count += 1
            print(f"✅ Fixed analysis {analysis_id}")
            print()

    print("=" * 80)
    print(f"Total malformed summaries found: {malformed_count}")
    print(f"Total analyses fixed: {fixed_count}")
    print("=" * 80)

    client.close()


if __name__ == "__main__":
    asyncio.run(find_and_fix_malformed_summaries())
