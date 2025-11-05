#!/usr/bin/env python3
"""
Fix malformed JSON summaries in analyses
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
from bson import ObjectId


async def fix_malformed():
    # MongoDB URI from environment
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.survey_analysis

    analyses = await db.analyses.find({"survey_type": "structured"}).to_list(length=100)

    total_fixed = 0
    analyses_updated = 0

    for analysis in analyses:
        analysis_id = analysis["_id"]
        needs_update = False
        updated_questions = []

        for qa in analysis.get("question_analyses", []):
            summary = qa.get("summary", "")

            # Check if it's malformed JSON
            if isinstance(summary, str):
                trimmed = summary.strip()
                if trimmed.startswith("{") and '"summary"' in summary:
                    try:
                        # Try to parse as JSON
                        parsed = json.loads(summary)
                        if isinstance(parsed, dict) and "summary" in parsed:
                            print(
                                f'✅ Fixing: {qa.get("question_text", "Unknown")[:60]}...'
                            )
                            qa["summary"] = parsed["summary"]
                            if "key_findings" in parsed:
                                qa["key_findings"] = parsed["key_findings"]
                            needs_update = True
                            total_fixed += 1
                    except Exception as e:
                        print(f"❌ Error parsing: {e}")

            updated_questions.append(qa)

        if needs_update:
            result = await db.analyses.update_one(
                {"_id": analysis_id}, {"$set": {"question_analyses": updated_questions}}
            )
            analyses_updated += 1
            print(f"   📝 Updated analysis {analysis_id}")
            print()

    print(f"=" * 60)
    print(f"Total summaries fixed: {total_fixed}")
    print(f"Total analyses updated: {analyses_updated}")
    print(f"=" * 60)
    client.close()


if __name__ == "__main__":
    import sys

    sys.path.insert(0, "/Users/admin/Projects/Personal/Final year project/backend")
    from dotenv import load_dotenv

    load_dotenv("/Users/admin/Projects/Personal/Final year project/backend/.env")

    asyncio.run(fix_malformed())
