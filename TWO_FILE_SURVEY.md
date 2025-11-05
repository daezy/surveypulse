# Two-File Survey Upload Feature

## Overview

Many professional survey platforms (Google Forms, Qualtrics, SurveyMonkey, TypeForm, etc.) export survey data as **two separate files**:

1. **Schema/Questions File** - Defines the survey structure and questions
2. **Responses File** - Contains participant answers mapped to question IDs

This feature allows you to upload and analyze such surveys directly without manual data transformation.

---

## 🎯 Use Cases

### Supported Survey Platforms

- ✅ **Google Forms** - Exports as separate question definitions and responses
- ✅ **Qualtrics** - Professional research survey platform
- ✅ **SurveyMonkey** - Business and market research surveys
- ✅ **TypeForm** - Interactive form responses
- ✅ **Microsoft Forms** - Enterprise survey tool
- ✅ **Stack Overflow Developer Survey** - Annual developer surveys
- ✅ **Custom Surveys** - Any survey with separate schema/response files

### When to Use Two-File Upload

- Survey questions and responses are in separate files
- You want to selectively analyze only certain questions
- Question metadata (type, analysis flags) needs to be specified
- Multiple survey versions share the same schema
- Responses file is very large (easier to manage separately)

---

## 📁 File Formats

### Schema File Structure

**CSV Format** (`survey-schema.csv`):

```csv
question_id,question_text,question_type,is_analyzed
q1,What challenges do you face in software development?,open_ended,true
q2,What tools do you wish existed?,open_ended,true
q3,How satisfied are you? (1-10),rating,false
```

**JSON Format** (`survey-schema.json`):

```json
{
  "questions": [
    {
      "question_id": "q1",
      "question_text": "What challenges do you face in software development?",
      "question_type": "open_ended",
      "is_analyzed": true
    },
    {
      "question_id": "q2",
      "question_text": "What tools do you wish existed?",
      "question_type": "open_ended",
      "is_analyzed": true
    }
  ]
}
```

#### Schema Fields

| Field           | Required | Type    | Description                                                                           |
| --------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `question_id`   | Yes      | string  | Unique identifier for the question (e.g., "q1", "q2")                                 |
| `question_text` | Yes      | string  | The actual question text shown to participants                                        |
| `question_type` | No       | string  | Type of question: "open_ended", "multiple_choice", "rating" (default: "open_ended")   |
| `is_analyzed`   | No       | boolean | Whether to analyze with AI (default: true). Set to false for rating/numeric questions |

### Responses File Structure

**CSV Format** (`two-file-responses.csv`):

```csv
participant_id,q1,q2,q3
p001,"Debugging is difficult","Better debugging tools",8
p002,"Managing tech debt","AI code review",7
p003,"Performance issues","Advanced profiler",9
```

**JSON Format**:

```json
{
  "responses": [
    {
      "participant_id": "p001",
      "q1": "Debugging is difficult",
      "q2": "Better debugging tools",
      "q3": "8"
    },
    {
      "participant_id": "p002",
      "q1": "Managing tech debt",
      "q2": "AI code review",
      "q3": "7"
    }
  ]
}
```

#### Response Fields

- **participant_id** (optional): Unique identifier for each participant
- **Question columns**: One column per question, column name must match `question_id` from schema
- Missing answers are handled gracefully (skipped in analysis)

---

## 🚀 How to Use

### Method 1: Web Interface (Recommended)

1. **Go to Upload Page**

   ```
   http://localhost:5173/upload
   ```

2. **Select "Two Files" Mode**

   - Click the "Two Files (Schema + Responses)" button

3. **Upload Schema File**

   - Click "Select schema file"
   - Choose your questions definition file (CSV or JSON)
   - See file name displayed when selected

4. **Upload Responses File**

   - Click "Select responses file"
   - Choose your participant responses file (CSV or JSON)
   - See file name displayed when selected

5. **Submit**
   - Click "Upload Two-File Survey"
   - System processes both files and creates structured survey
   - Automatically redirected to survey detail page

### Method 2: API/cURL

```bash
curl -X POST "http://localhost:8000/api/v1/surveys/upload-two-file" \
  -F "schema_file=@survey-schema.csv" \
  -F "responses_file=@two-file-responses.csv"
```

**Response**:

```json
{
  "survey_id": "673abc123def456",
  "schema_file": "survey-schema.csv",
  "responses_file": "two-file-responses.csv",
  "survey_type": "structured",
  "total_participants": 20,
  "total_questions": 4,
  "analyzed_questions": 4,
  "total_responses": 80,
  "status": "uploaded",
  "message": "Two-file survey uploaded successfully with 4 questions"
}
```

### Method 3: Python/JavaScript

**Python**:

```python
import requests

url = "http://localhost:8000/api/v1/surveys/upload-two-file"
files = {
    'schema_file': open('survey-schema.csv', 'rb'),
    'responses_file': open('two-file-responses.csv', 'rb')
}
response = requests.post(url, files=files)
print(response.json())
```

**JavaScript**:

```javascript
const formData = new FormData();
formData.append("schema_file", schemaFile);
formData.append("responses_file", responsesFile);

const response = await fetch(
  "http://localhost:8000/api/v1/surveys/upload-two-file",
  {
    method: "POST",
    body: formData,
  }
);
const result = await response.json();
```

---

## 📊 Sample Data

### Included Sample Files

1. **`sample-data/survey-schema.csv`**

   - 5 questions about developer challenges
   - Mix of open-ended (analyzed) and rating (not analyzed) questions
   - Ready-to-use format

2. **`sample-data/two-file-responses.csv`**
   - 20 participants with complete responses
   - Realistic developer survey data
   - Maps to schema file questions

### Try It Now

```bash
# Navigate to upload page
open http://localhost:5173/upload

# Select "Two Files" mode
# Upload: sample-data/survey-schema.csv
# Upload: sample-data/two-file-responses.csv
# Click "Upload Two-File Survey"
```

---

## 🔍 How It Works

### Processing Pipeline

```
1. Schema File Upload
   ↓
   Parse & Validate Questions
   ↓
   Extract: question_id, question_text, question_type, is_analyzed

2. Responses File Upload
   ↓
   Parse & Validate Participant Answers
   ↓
   Map Responses to Question IDs

3. Data Alignment
   ↓
   Match responses to questions
   ↓
   Filter: Only analyzed questions (is_analyzed=true)

4. Preprocessing
   ↓
   Clean & tokenize text per question
   ↓
   Remove duplicates & empty responses

5. Storage
   ↓
   Create structured survey document
   ↓
   Store in MongoDB with processed data

6. Analysis (when triggered)
   ↓
   Per-question LLM analysis
   ↓
   Cross-question insights generation
```

### Data Processing Details

**Question Filtering**:

- Only questions with `is_analyzed=true` are sent to AI
- Rating/numeric questions can be excluded by setting `is_analyzed=false`
- Reduces processing time and API costs

**Response Matching**:

- Responses matched to questions via `question_id`
- Missing/empty responses skipped gracefully
- Partial responses allowed (participants can skip questions)

**Error Handling**:

- Invalid question IDs detected and reported
- Malformed CSV/JSON handled with clear error messages
- Schema-response mismatch validation

---

## ✨ Advantages Over Single-File Upload

| Feature                | Single File                | Two Files                                    |
| ---------------------- | -------------------------- | -------------------------------------------- |
| **Question Control**   | Auto-detected from headers | Explicit control via schema                  |
| **Question Types**     | All treated as open-ended  | Can specify types (open_ended, rating, etc.) |
| **Selective Analysis** | All questions analyzed     | Choose which to analyze (`is_analyzed` flag) |
| **Question Metadata**  | Limited                    | Full metadata support                        |
| **Reusability**        | Schema embedded            | Schema reusable across surveys               |
| **Large Datasets**     | Single large file          | Separate manageable files                    |
| **Platform Support**   | Simple surveys             | Professional survey platforms                |

---

## 🎨 UI Features

### Upload Page Enhancements

**Three Upload Modes**:

1. **Single File** - Traditional one-file upload
2. **Two Files** - Schema + Responses (NEW)
3. **Manual Entry** - Type responses directly

**Visual Indicators**:

- ✅ Green checkmark when files selected
- 📄 File names displayed
- ❌ Remove button to clear selection
- 💡 Format hints below each upload box

**Validation**:

- Both files required before submission
- Accepted formats: CSV, JSON
- Clear error messages for invalid files

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "question_id not found in responses"  
**Cause**: Question IDs in schema don't match column names in responses  
**Solution**: Ensure column headers in responses file exactly match question_id values

**Issue**: "No questions found in schema file"  
**Cause**: Schema file is empty or incorrectly formatted  
**Solution**: Check CSV headers or JSON structure matches expected format

**Issue**: "No responses found in responses file"  
**Cause**: Responses file is empty or all responses are blank  
**Solution**: Ensure at least one participant has answered at least one question

**Issue**: "No valid responses after preprocessing"  
**Cause**: All responses were filtered out (duplicates, empty, invalid)  
**Solution**: Check response quality, ensure substantial text answers

### Validation Checklist

Schema File:

- [x] Has required columns: question_id, question_text
- [x] All question_ids are unique
- [x] At least one question has is_analyzed=true
- [x] CSV has header row / JSON is properly formatted

Responses File:

- [x] Has participant_id column (optional but recommended)
- [x] Has columns matching schema question_ids
- [x] At least one row of responses
- [x] Responses are not all empty

---

## 📈 Performance Considerations

### File Size Limits

- **Schema File**: Typically small (<1 MB)
- **Responses File**: Can be large (up to 100 MB supported)
- **Recommended**: <1000 participants per upload for optimal performance

### Processing Time

- **Schema Parsing**: ~1 second
- **Responses Parsing**: ~1-5 seconds (depends on size)
- **Data Alignment**: ~2-10 seconds
- **Total Upload**: 5-20 seconds typically

### Optimization Tips

1. **Remove unused columns** from responses file
2. **Set is_analyzed=false** for non-text questions
3. **Split very large surveys** into multiple batches
4. **Use CSV over JSON** for faster parsing

---

## 🎓 Examples

### Example 1: Google Forms Export

**Schema File** (questions.csv):

```csv
question_id,question_text,question_type,is_analyzed
q1,What did you like most about the product?,open_ended,true
q2,What could be improved?,open_ended,true
q3,How likely are you to recommend? (1-10),rating,false
```

**Responses File** (responses.csv):

```csv
participant_id,q1,q2,q3
user_001,"Great user interface","Need better documentation",9
user_002,"Fast performance","More integrations needed",8
user_003,"Easy to use","Mobile app improvements",10
```

### Example 2: Stack Overflow Survey

**Schema File**:

```csv
question_id,question_text,question_type,is_analyzed
dev_challenges,What are your biggest development challenges?,open_ended,true
wanted_tools,What tools do you wish existed?,open_ended,true
productivity,What blocks your productivity?,open_ended,true
years_exp,Years of programming experience,numeric,false
```

**Responses File**:

```csv
participant_id,dev_challenges,wanted_tools,productivity,years_exp
dev_12345,"Legacy code maintenance","Better refactoring tools","Technical debt",8
dev_67890,"API integration complexity","Unified API platform","Documentation gaps",5
```

### Example 3: Academic Research Survey

**Schema File** (JSON):

```json
{
  "questions": [
    {
      "question_id": "research_q1",
      "question_text": "What are the main challenges in your research?",
      "question_type": "open_ended",
      "is_analyzed": true
    },
    {
      "question_id": "research_q2",
      "question_text": "What methodologies do you use?",
      "question_type": "open_ended",
      "is_analyzed": true
    }
  ]
}
```

---

## 🔐 Security & Privacy

### Data Handling

- Files processed in-memory (not saved to disk during upload)
- Temporary storage cleared after processing
- Survey data stored securely in MongoDB
- Participant IDs can be anonymized

### Best Practices

1. **Remove PII** before upload (names, emails, phone numbers)
2. **Use generic IDs** (p001, p002 instead of real names)
3. **Anonymize sensitive data** in responses
4. **Don't include** demographic data that could identify individuals

---

## 📚 API Reference

### Endpoint

```
POST /api/v1/surveys/upload-two-file
```

### Parameters

| Parameter      | Type | Required | Description                         |
| -------------- | ---- | -------- | ----------------------------------- |
| schema_file    | File | Yes      | Questions schema (CSV or JSON)      |
| responses_file | File | Yes      | Participant responses (CSV or JSON) |

### Response

```json
{
  "survey_id": "string",
  "schema_file": "string",
  "responses_file": "string",
  "survey_type": "structured",
  "total_participants": "number",
  "total_questions": "number",
  "analyzed_questions": "number",
  "total_responses": "number",
  "status": "uploaded",
  "message": "string"
}
```

### Error Responses

**400 Bad Request** - Invalid file format or missing data

```json
{
  "detail": "Error message explaining the issue"
}
```

---

## 🎉 Summary

The two-file survey upload feature enables:

- ✅ Support for professional survey platform exports
- ✅ Explicit control over question analysis
- ✅ Reusable question schemas
- ✅ Better organization of large surveys
- ✅ Compatibility with Google Forms, Qualtrics, SurveyMonkey, etc.

**Next Steps**:

1. Try the sample data in `sample-data/`
2. Export your survey from your platform
3. Format as schema + responses files
4. Upload and analyze!

---

**Feature Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: November 3, 2025
