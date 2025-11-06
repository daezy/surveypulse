from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List
import csv
import json
import io
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.core.deps import get_current_active_user
from app.models.schemas import SurveyUpload, SurveyDocument, SurveyStatus
from app.models.user import User
from app.services.preprocessing import DataPreprocessor

router = APIRouter()
preprocessor = DataPreprocessor()


@router.post("/upload")
async def upload_survey(
    survey: SurveyUpload,
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user),
):
    """Upload survey responses - supports both simple and multi-question surveys"""

    # Handle simple surveys (backward compatible)
    if survey.survey_type == "simple" and survey.responses:
        if not survey.responses:
            raise HTTPException(status_code=400, detail="No responses provided")

        # Preprocess responses
        cleaned_responses = preprocessor.preprocess_batch(survey.responses)

        if not cleaned_responses:
            raise HTTPException(
                status_code=400, detail="No valid responses after preprocessing"
            )

        # Create simple survey document
        survey_doc = {
            "title": survey.title,
            "description": survey.description,
            "survey_type": "simple",
            "total_responses": len(cleaned_responses),
            "responses": cleaned_responses,
            "status": SurveyStatus.PENDING.value,
            "user_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await db.surveys.insert_one(survey_doc)
        survey_id = str(result.inserted_id)

        return {
            "survey_id": survey_id,
            "title": survey.title,
            "survey_type": "simple",
            "total_responses": len(cleaned_responses),
            "status": "uploaded",
            "message": "Survey uploaded successfully",
        }

    # Handle multi-question surveys (Stack Overflow style)
    elif (
        survey.survey_type == "structured"
        and survey.questions
        and survey.structured_responses
    ):
        if not survey.questions:
            raise HTTPException(
                status_code=400, detail="No questions provided for structured survey"
            )

        if not survey.structured_responses:
            raise HTTPException(
                status_code=400, detail="No structured responses provided"
            )

        # Preprocess each question's responses
        processed_data = {}
        for question in survey.questions:
            if question.is_analyzed:  # Only process questions marked for analysis
                question_responses = []
                for response_dict in survey.structured_responses:
                    if question.question_id in response_dict:
                        answer = response_dict[question.question_id]
                        if answer and isinstance(answer, str) and answer.strip():
                            question_responses.append(answer)

                if question_responses:
                    cleaned = preprocessor.preprocess_batch(question_responses)
                    processed_data[question.question_id] = {
                        "question_text": question.question_text,
                        "question_type": question.question_type,
                        "responses": cleaned,
                        "response_count": len(cleaned),
                    }

        if not processed_data:
            raise HTTPException(
                status_code=400, detail="No valid responses after preprocessing"
            )

        # Create structured survey document
        survey_doc = {
            "title": survey.title,
            "description": survey.description,
            "survey_type": "structured",
            "questions": [q.dict() for q in survey.questions],
            "total_participants": len(survey.structured_responses),
            "processed_data": processed_data,
            "total_responses": sum(
                data["response_count"] for data in processed_data.values()
            ),
            "status": SurveyStatus.PENDING.value,
            "user_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await db.surveys.insert_one(survey_doc)
        survey_id = str(result.inserted_id)

        return {
            "survey_id": survey_id,
            "title": survey.title,
            "survey_type": "structured",
            "total_participants": len(survey.structured_responses),
            "total_questions": len(survey.questions),
            "analyzed_questions": len(processed_data),
            "total_responses": survey_doc["total_responses"],
            "status": "uploaded",
            "message": "Structured survey uploaded successfully",
        }

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid survey format. Provide either 'responses' for simple surveys or 'questions' and 'structured_responses' for multi-question surveys",
        )


@router.post("/upload-two-file")
async def upload_two_file_survey(
    schema_file: UploadFile = File(...),
    responses_file: UploadFile = File(...),
    title: str = Form(None),
    description: str = Form(None),
    tags: str = Form(None),
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user),
):
    """Upload survey with separate schema and responses files with optional metadata

    Schema file format (CSV/JSON):
    - CSV: question_id, question_text, question_type, is_analyzed
    - JSON: [{"question_id": "q1", "question_text": "...", ...}]

    Responses file format (CSV/JSON):
    - CSV: participant_id, q1, q2, q3, ...
    - JSON: [{"participant_id": "p1", "q1": "answer", "q2": "answer", ...}]

    Args:
        schema_file: File containing survey questions/schema
        responses_file: File containing participant responses
        title: Custom title for the survey (optional)
        description: Description of the survey (optional)
        tags: Comma-separated tags (optional)

    Supports large files (up to 250MB)
    """

    if not schema_file.filename or not responses_file.filename:
        raise HTTPException(
            status_code=400, detail="Both schema and responses files are required"
        )

    # Check file size limits (250MB max)
    MAX_SIZE = 250 * 1024 * 1024  # 250MB

    # Read files with size checking
    try:
        schema_content = await schema_file.read()
        if len(schema_content) > MAX_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Schema file too large. Maximum size is 250MB, got {len(schema_content) / (1024*1024):.1f}MB",
            )

        responses_content = await responses_file.read()
        if len(responses_content) > MAX_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Responses file too large. Maximum size is 250MB, got {len(responses_content) / (1024*1024):.1f}MB",
            )
    except MemoryError:
        raise HTTPException(
            status_code=413,
            detail="File too large to process. Please split into smaller files or contact support.",
        )

    try:
        # Parse schema file
        schema_ext = schema_file.filename.lower().split(".")[-1]
        questions = []

        if schema_ext == "csv":
            # Parse CSV efficiently for large files
            schema_csv = list(
                csv.DictReader(io.StringIO(schema_content.decode("utf-8")))
            )
            if not schema_csv:
                raise HTTPException(status_code=400, detail="Schema file is empty")

            for row in schema_csv:
                questions.append(
                    {
                        "question_id": row.get("question_id", row.get("id", "")),
                        "question_text": row.get(
                            "question_text", row.get("text", row.get("question", ""))
                        ),
                        "question_type": row.get(
                            "question_type", row.get("type", "open_ended")
                        ),
                        "is_analyzed": str(row.get("is_analyzed", "true")).lower()
                        in ["true", "1", "yes"],
                    }
                )
        elif schema_ext == "json":
            schema_json = json.loads(schema_content.decode("utf-8"))
            if isinstance(schema_json, list):
                questions = schema_json
            elif isinstance(schema_json, dict) and "questions" in schema_json:
                questions = schema_json["questions"]
        else:
            raise HTTPException(
                status_code=400, detail="Schema file must be CSV or JSON"
            )

        if not questions:
            raise HTTPException(
                status_code=400, detail="No questions found in schema file"
            )

        # Parse responses file (already read above with size checking)
        responses_ext = responses_file.filename.lower().split(".")[-1]
        structured_responses = []

        # Import logger for large file processing
        import logging

        logger = logging.getLogger(__name__)

        if responses_ext == "csv":
            # Log file size for large files
            file_size_mb = len(responses_content) / (1024 * 1024)
            if file_size_mb > 50:
                logger.info(f"Processing large responses file: {file_size_mb:.1f}MB")

            # Decode and parse CSV
            csv_text = responses_content.decode("utf-8")
            responses_csv = csv.DictReader(io.StringIO(csv_text))

            # Process rows efficiently
            row_count = 0
            for row in responses_csv:
                response_dict = {}
                for question in questions:
                    qid = question["question_id"]
                    if qid in row and row[qid]:
                        response_dict[qid] = str(row[qid]).strip()
                if response_dict:
                    structured_responses.append(response_dict)

                row_count += 1
                # Log progress for very large files (every 10,000 rows)
                if file_size_mb > 100 and row_count % 10000 == 0:
                    logger.info(f"Processed {row_count} participant responses...")

            if file_size_mb > 50:
                logger.info(f"Completed processing {row_count} total participants")
        elif responses_ext == "json":
            responses_json = json.loads(responses_content.decode("utf-8"))
            if isinstance(responses_json, list):
                structured_responses = responses_json
            elif isinstance(responses_json, dict) and "responses" in responses_json:
                structured_responses = responses_json["responses"]
        else:
            raise HTTPException(
                status_code=400, detail="Responses file must be CSV or JSON"
            )

        if not structured_responses:
            raise HTTPException(
                status_code=400, detail="No responses found in responses file"
            )

        # Process each question's responses
        processed_data = {}
        for question in questions:
            if question.get("is_analyzed", True):
                question_responses = []
                for response_dict in structured_responses:
                    if question["question_id"] in response_dict:
                        answer = response_dict[question["question_id"]]
                        if answer and isinstance(answer, str) and answer.strip():
                            question_responses.append(answer)

                if question_responses:
                    cleaned = preprocessor.preprocess_batch(question_responses)
                    processed_data[question["question_id"]] = {
                        "question_text": question["question_text"],
                        "question_type": question.get("question_type", "open_ended"),
                        "responses": cleaned,
                        "response_count": len(cleaned),
                    }

        if not processed_data:
            raise HTTPException(
                status_code=400, detail="No valid responses after preprocessing"
            )

        # Parse tags if provided
        tag_list = []
        if tags and tags.strip():
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]

        # Generate friendly title and description only if not provided
        if not title or not title.strip():
            # Use schema filename without extension as base
            base_name = schema_file.filename.rsplit(".", 1)[0]
            # Replace common separators with spaces and title-case
            title = base_name.replace("_", " ").replace("-", " ").title()
            print(f"✨ Auto-generated title: {title}")
        else:
            title = title.strip()
            print(f"✅ Using provided title: {title}")

        if not description or not description.strip():
            description = f"Two-file survey with {len(questions)} questions and {len(structured_responses)} participant responses"
            print(f"✨ Auto-generated description: {description}")
        else:
            description = description.strip()
            print(f"✅ Using provided description: {description}")

        # Create structured survey document
        survey_doc = {
            "title": title,
            "description": description,
            "tags": tag_list,
            "survey_type": "structured",
            "questions": questions,
            "total_participants": len(structured_responses),
            "processed_data": processed_data,
            "total_responses": sum(
                data["response_count"] for data in processed_data.values()
            ),
            "status": SurveyStatus.PENDING.value,
            "user_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await db.surveys.insert_one(survey_doc)
        survey_id = str(result.inserted_id)

        return {
            "survey_id": survey_id,
            "schema_file": schema_file.filename,
            "responses_file": responses_file.filename,
            "survey_type": "structured",
            "total_participants": len(structured_responses),
            "total_questions": len(questions),
            "analyzed_questions": len(processed_data),
            "total_responses": survey_doc["total_responses"],
            "status": "uploaded",
            "message": f"Two-file survey uploaded successfully with {len(questions)} questions",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing files: {str(e)}")


@router.post("/upload-file")
async def upload_survey_file(
    file: UploadFile = File(...),
    title: str = Form(None),
    description: str = Form(None),
    tags: str = Form(None),
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user),
):
    """Upload survey from file (CSV, TXT, JSON) with optional metadata

    Args:
        file: Survey file (CSV, TXT, or JSON)
        title: Custom title for the survey (optional, defaults to filename)
        description: Description of the survey (optional)
        tags: Comma-separated tags (optional)
    """

    # Debug logging
    print(f"📥 Received upload - File: {file.filename}")
    print(f"📝 Title received: {repr(title)}")
    print(f"📝 Description received: {repr(description)}")
    print(f"🏷️ Tags received: {repr(tags)}")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Check file extension
    ext = file.filename.lower().split(".")[-1]
    if ext not in ["csv", "txt", "json"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload CSV, TXT, or JSON",
        )

    # Read file content
    content = await file.read()

    try:
        responses = []

        if ext == "csv":
            # Parse CSV - supports both simple (single column) and structured (multi-column/multi-question)
            csv_content = content.decode("utf-8")
            csv_reader_list = list(csv.DictReader(io.StringIO(csv_content)))

            if not csv_reader_list:
                raise HTTPException(status_code=400, detail="CSV file is empty")

            # Check if this is a multi-question survey (multiple columns)
            headers = list(csv_reader_list[0].keys())

            # If multiple substantive columns, treat as structured survey
            substantive_columns = [
                h for h in headers if h.strip() and not h.lower().startswith("id")
            ]

            if len(substantive_columns) > 1:
                # Multi-question survey detected
                survey_type = "structured"
                questions = []
                structured_responses = []

                # Create questions from headers
                for idx, col in enumerate(substantive_columns):
                    questions.append(
                        {
                            "question_id": f"q_{idx+1}",
                            "question_text": col,
                            "question_type": "open_ended",
                            "is_analyzed": True,
                        }
                    )

                # Extract responses
                for row in csv_reader_list:
                    response_dict = {}
                    for idx, col in enumerate(substantive_columns):
                        if col in row and row[col]:
                            response_dict[f"q_{idx+1}"] = str(row[col]).strip()
                    if response_dict:
                        structured_responses.append(response_dict)

                # Process structured data
                processed_data = {}
                for question in questions:
                    question_responses = []
                    for response_dict in structured_responses:
                        if question["question_id"] in response_dict:
                            answer = response_dict[question["question_id"]]
                            if answer:
                                question_responses.append(answer)

                    if question_responses:
                        cleaned = preprocessor.preprocess_batch(question_responses)
                        processed_data[question["question_id"]] = {
                            "question_text": question["question_text"],
                            "question_type": question["question_type"],
                            "responses": cleaned,
                            "response_count": len(cleaned),
                        }

                # Parse tags if provided
                tag_list = []
                if tags and tags.strip():
                    tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]

                # Generate friendly title and description only if not provided
                if not title or not title.strip():
                    # Remove file extension and make title-case
                    base_name = file.filename.rsplit(".", 1)[0]
                    # Replace common separators with spaces and title-case
                    title = base_name.replace("_", " ").replace("-", " ").title()
                    print(f"✨ Auto-generated title: {title}")
                else:
                    title = title.strip()
                    print(f"✅ Using provided title: {title}")

                if not description or not description.strip():
                    description = f"Survey with {len(questions)} questions and {len(structured_responses)} participant responses"
                    print(f"✨ Auto-generated description: {description}")
                else:
                    description = description.strip()
                    print(f"✅ Using provided description: {description}")

                # Create structured survey document
                survey_doc = {
                    "title": title,
                    "description": description,
                    "tags": tag_list,
                    "survey_type": "structured",
                    "questions": questions,
                    "total_participants": len(structured_responses),
                    "processed_data": processed_data,
                    "total_responses": sum(
                        data["response_count"] for data in processed_data.values()
                    ),
                    "status": SurveyStatus.PENDING.value,
                    "user_id": current_user.id,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }

                result = await db.surveys.insert_one(survey_doc)
                survey_id = str(result.inserted_id)

                return {
                    "survey_id": survey_id,
                    "filename": file.filename,
                    "survey_type": "structured",
                    "total_participants": len(structured_responses),
                    "total_questions": len(questions),
                    "total_responses": survey_doc["total_responses"],
                    "status": "uploaded",
                    "message": f"Multi-question survey with {len(questions)} questions uploaded successfully",
                }
            else:
                # Single column/question - simple survey
                for row in csv_reader_list:
                    # Look for common column names
                    for col in ["response", "text", "feedback", "comment", "answer"]:
                        if col in [k.lower() for k in row.keys()]:
                            actual_col = [k for k in row.keys() if k.lower() == col][0]
                            responses.append(row[actual_col])
                            break
                    else:
                        # If no matching column, use the first column
                        if substantive_columns:
                            responses.append(row[substantive_columns[0]])
                        else:
                            responses.append(list(row.values())[0])

        elif ext == "txt":
            # Parse TXT (one response per line)
            txt_content = content.decode("utf-8")
            responses = [
                line.strip() for line in txt_content.split("\n") if line.strip()
            ]

        elif ext == "json":
            # Parse JSON
            json_content = json.loads(content.decode("utf-8"))

            if isinstance(json_content, list):
                # List of strings or objects
                for item in json_content:
                    if isinstance(item, str):
                        responses.append(item)
                    elif isinstance(item, dict):
                        # Look for response field
                        for key in ["response", "text", "feedback", "comment"]:
                            if key in item:
                                responses.append(item[key])
                                break
            elif isinstance(json_content, dict):
                # Single object with responses array
                if "responses" in json_content:
                    responses = json_content["responses"]

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    if not responses:
        raise HTTPException(status_code=400, detail="No responses found in file")

    # Preprocess responses
    cleaned_responses = preprocessor.preprocess_batch(responses)

    # Parse tags if provided
    tag_list = []
    if tags and tags.strip():
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]

    # Generate friendly title and description only if not provided
    if not title or not title.strip():
        # Remove file extension and make title-case
        base_name = file.filename.rsplit(".", 1)[0]
        # Replace common separators with spaces and title-case
        title = base_name.replace("_", " ").replace("-", " ").title()
        print(f"✨ Auto-generated title: {title}")
    else:
        title = title.strip()
        print(f"✅ Using provided title: {title}")

    if not description or not description.strip():
        description = f"Survey with {len(cleaned_responses)} responses"
        print(f"✨ Auto-generated description: {description}")
    else:
        description = description.strip()
        print(f"✅ Using provided description: {description}")

    # Create survey document
    survey_doc = {
        "title": title,
        "description": description,
        "tags": tag_list,
        "survey_type": "simple",
        "total_responses": len(cleaned_responses),
        "responses": cleaned_responses,
        "status": SurveyStatus.PENDING.value,
        "user_id": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.surveys.insert_one(survey_doc)
    survey_id = str(result.inserted_id)

    return {
        "survey_id": survey_id,
        "filename": file.filename,
        "total_responses": len(cleaned_responses),
        "status": "uploaded",
    }


@router.get("/")
async def get_surveys(
    db=Depends(get_database), current_user: User = Depends(get_current_active_user)
):
    """Get all surveys for the current user"""

    cursor = db.surveys.find({"user_id": current_user.id}).sort("created_at", -1)
    surveys = []

    async for doc in cursor:
        surveys.append(
            {
                "survey_id": str(doc["_id"]),
                "title": doc["title"],
                "description": doc.get("description"),
                "tags": doc.get("tags", []),
                "survey_type": doc.get("survey_type", "simple"),
                "total_responses": doc["total_responses"],
                "total_participants": doc.get("total_participants"),
                "questions": doc.get("questions", []),
                "status": doc["status"],
                "created_at": doc["created_at"].isoformat(),
            }
        )

    return {"surveys": surveys, "total": len(surveys)}


@router.get("/{survey_id}")
async def get_survey(
    survey_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user),
):
    """Get survey details"""

    try:
        doc = await db.surveys.find_one(
            {"_id": ObjectId(survey_id), "user_id": current_user.id}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid survey ID")

    if not doc:
        raise HTTPException(status_code=404, detail="Survey not found")

    return {
        "survey_id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc.get("description"),
        "tags": doc.get("tags", []),
        "survey_type": doc.get("survey_type", "simple"),
        "total_responses": doc["total_responses"],
        "total_participants": doc.get("total_participants"),
        "questions": doc.get("questions", []),
        "responses": doc.get("responses", []),
        "processed_data": doc.get("processed_data", {}),
        "status": doc["status"],
        "created_at": doc["created_at"].isoformat(),
        "updated_at": doc["updated_at"].isoformat(),
    }


@router.delete("/{survey_id}")
async def delete_survey(
    survey_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a survey"""

    try:
        result = await db.surveys.delete_one(
            {"_id": ObjectId(survey_id), "user_id": current_user.id}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid survey ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Also delete associated analyses
    await db.analyses.delete_many({"survey_id": survey_id})

    return {"message": "Survey deleted successfully"}
