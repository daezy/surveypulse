# Testing Two-File Survey Upload

## Quick Test

### Step 1: Open the Application

```
http://localhost:5173/upload
```

### Step 2: Select Two-File Mode

Click the **"Two Files (Schema + Responses)"** button

### Step 3: Upload Files

**Schema File**:

- Click "Select schema file"
- Choose: `sample-data/survey-schema.csv`
- Should see green checkmark with filename

**Responses File**:

- Click "Select responses file"
- Choose: `sample-data/two-file-responses.csv`
- Should see green checkmark with filename

### Step 4: Submit

- Click **"Upload Two-File Survey"** button
- Wait 5-10 seconds for processing
- Should redirect to survey detail page

### Step 5: Verify Upload

Survey detail page should show:

- ✅ Title: "survey-schema.csv + two-file-responses.csv"
- ✅ Survey type badge: "Multi-Question"
- ✅ 20 participants
- ✅ 4 questions listed (only analyzed ones, q5 excluded)
- ✅ Per-question response samples

### Step 6: Analyze

- Click **"Start AI Analysis"**
- Wait ~60 seconds (4 questions × ~15 seconds each)
- Should see results with:
  - Cross-question insights (purple section)
  - 4 per-question analysis cards (blue)

---

## Expected Results

### Upload Response

```json
{
  "survey_id": "673...",
  "schema_file": "survey-schema.csv",
  "responses_file": "two-file-responses.csv",
  "survey_type": "structured",
  "total_participants": 20,
  "total_questions": 5,
  "analyzed_questions": 4,
  "total_responses": 80,
  "status": "uploaded"
}
```

### Questions Detected

1. ✅ Q1: "What challenges do you face in software development?" (analyzed)
2. ✅ Q2: "What tools or features do you wish existed?" (analyzed)
3. ✅ Q3: "What topics or areas do you think need more research?" (analyzed)
4. ✅ Q4: "What is the biggest blocker to your productivity?" (analyzed)
5. ⏭️ Q5: "How satisfied are you? (1-10)" (skipped - rating question, is_analyzed=false)

### Analysis Results

Each question should have:

- Summary of responses
- Key findings (3-5 items)
- Sentiment (likely negative due to "challenges" theme)
- Topics detected (debugging, testing, documentation, etc.)
- Open problems identified

Cross-question insights should identify:

- Common themes (developer productivity, tooling, documentation)
- Patterns (challenges in Q1 correlate with tool requests in Q2)
- Overall narrative about developer pain points

---

## Alternative Test: API

```bash
curl -X POST "http://localhost:8000/api/v1/surveys/upload-two-file" \
  -F "schema_file=@sample-data/survey-schema.csv" \
  -F "responses_file=@sample-data/two-file-responses.csv"
```

Should return survey metadata with `survey_id`.

---

## Test Checklist

Frontend:

- [x] Three upload mode buttons displayed
- [x] Two-file mode shows both file upload boxes
- [x] Schema file can be selected (CSV/JSON)
- [x] Responses file can be selected (CSV/JSON)
- [x] File names displayed after selection
- [x] Remove button works (X icon)
- [x] Upload button disabled until both files selected
- [x] Upload button enabled when both files selected
- [x] Loading state shows during upload
- [x] Redirect to survey detail after success
- [x] Error messages show if upload fails

Backend:

- [x] Endpoint accepts two files
- [x] CSV schema parsed correctly
- [x] JSON schema parsed correctly
- [x] CSV responses parsed correctly
- [x] JSON responses parsed correctly
- [x] Question IDs matched between files
- [x] is_analyzed flag respected
- [x] Questions with is_analyzed=false excluded
- [x] Preprocessed data stored correctly
- [x] Survey document created with correct type

Survey Detail:

- [x] Multi-question badge shown
- [x] Questions list displayed
- [x] Only analyzed questions shown in list
- [x] Participant count correct
- [x] Per-question response samples shown
- [x] Analysis button enabled

Analysis:

- [x] Per-question analysis runs
- [x] Cross-question insights generated
- [x] Results displayed in structured format
- [x] Purple section for cross-insights
- [x] Blue cards for per-question results

---

## Troubleshooting

### "Both schema and responses files are required"

- Make sure you selected **both** files before clicking upload
- Check that file inputs are not empty

### "No questions found in schema file"

- Verify CSV has header row: `question_id,question_text,question_type,is_analyzed`
- For JSON, ensure structure: `{"questions": [...]}`
- Check file is not corrupted or empty

### "question_id not found in responses"

- Column names in responses must match `question_id` values exactly
- Check for typos (q1 vs Q1, q_1 vs q1)
- Ensure case sensitivity matches

### "No valid responses after preprocessing"

- Check that responses file has actual text answers (not just empty cells)
- At least one question needs non-empty responses
- Verify responses aren't all duplicates

---

## Success Criteria

✅ Both files upload without errors  
✅ Survey created with type "structured"  
✅ Correct number of participants and questions  
✅ Only questions with is_analyzed=true are processed  
✅ Survey detail page displays correctly  
✅ Analysis runs successfully  
✅ Results show per-question and cross-question insights

---

**Test Status**: Ready to test  
**Sample Data**: Provided in `sample-data/`  
**Backend**: Running on port 8000  
**Frontend**: Running on port 5173
