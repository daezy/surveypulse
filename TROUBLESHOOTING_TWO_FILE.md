# Troubleshooting Two-File Upload Errors

## Common 400 Bad Request Errors

### Error: "Both schema and responses files are required"

**Cause**: One or both files are missing from the upload

**Solutions**:

1. Make sure you selected **both** files before clicking upload
2. Check that file input fields show the file names
3. Try re-selecting both files
4. Refresh the page and try again

**Frontend Check**:

```javascript
// Both should be truthy before upload
console.log("Schema file:", schemaFile);
console.log("Responses file:", responsesFile);
```

---

### Error: "Schema file must be CSV or JSON"

**Cause**: Schema file has wrong extension

**Solutions**:

1. Only `.csv` or `.json` files accepted
2. Rename file to have correct extension
3. Don't use `.txt`, `.xlsx`, or other formats

**Valid Extensions**:

- ✅ `survey-schema.csv`
- ✅ `survey-schema.json`
- ❌ `survey-schema.txt`
- ❌ `survey-schema.xlsx`

---

### Error: "Responses file must be CSV or JSON"

**Cause**: Responses file has wrong extension

**Solutions**:

1. Only `.csv` or `.json` files accepted
2. Rename file to have correct extension
3. Convert Excel files to CSV first

**Valid Extensions**:

- ✅ `responses.csv`
- ✅ `responses.json`
- ❌ `responses.txt`
- ❌ `responses.xlsx`

---

### Error: "No questions found in schema file"

**Cause**: Schema file is empty or incorrectly formatted

**Solutions**:

**For CSV**:

1. Must have header row: `question_id,question_text,question_type,is_analyzed`
2. Must have at least one data row
3. Check for BOM or encoding issues

**Correct CSV**:

```csv
question_id,question_text,question_type,is_analyzed
q1,What challenges do you face?,open_ended,true
q2,What tools do you need?,open_ended,true
```

**For JSON**:

1. Must be valid JSON (check with jsonlint.com)
2. Must have `questions` array
3. Each question must have required fields

**Correct JSON**:

```json
{
  "questions": [
    {
      "question_id": "q1",
      "question_text": "What challenges do you face?",
      "question_type": "open_ended",
      "is_analyzed": true
    }
  ]
}
```

---

### Error: "No responses found in responses file"

**Cause**: Responses file is empty or has no data rows

**Solutions**:

1. Make sure file has at least one participant row
2. Check that cells aren't all empty
3. Verify CSV has data after header row

**For CSV**:

```csv
participant_id,q1,q2
p001,"Answer 1","Answer 2"
p002,"Answer 3","Answer 4"
```

**For JSON**:

```json
{
  "responses": [
    { "participant_id": "p001", "q1": "Answer 1", "q2": "Answer 2" }
  ]
}
```

---

### Error: "question_id not found in responses"

**Cause**: Column names in responses don't match question IDs in schema

**Solutions**:

1. Question IDs must match **exactly** (case-sensitive)
2. Check for typos: `q1` vs `Q1` vs `q_1`
3. Ensure no extra spaces in column names

**Schema**:

```csv
question_id,question_text
q1,What is your name?
q2,What is your role?
```

**Responses** (must match):

```csv
participant_id,q1,q2
p001,"John","Developer"
```

**Common Mismatches**:

- ❌ Schema: `q1`, Responses: `Q1` (case mismatch)
- ❌ Schema: `q1`, Responses: `q_1` (underscore)
- ❌ Schema: `q1`, Responses: `question1` (different format)

---

### Error: "No valid responses after preprocessing"

**Cause**: All responses were filtered out during cleaning

**Solutions**:

1. Make sure responses contain actual text (not just numbers or symbols)
2. Check that at least one question has substantial answers
3. Verify responses aren't all duplicates
4. Ensure at least 3 characters per response

**Bad Responses**:

```csv
participant_id,q1,q2
p001,"","" ← Empty
p002,"N/A","N/A" ← Will be filtered
p003,".","-" ← Too short
```

**Good Responses**:

```csv
participant_id,q1,q2
p001,"Debugging is hard","Better tools needed"
p002,"Legacy code issues","Refactoring support"
```

---

### Error: "Error parsing file: ..."

**Cause**: File has encoding issues or is corrupted

**Solutions**:

1. Save file as UTF-8 encoding
2. Remove special characters or emojis
3. Check for hidden characters or BOM
4. Re-export from source platform

**Excel Users**:

1. Open file in Excel
2. File → Save As
3. Choose "CSV UTF-8 (Comma delimited)"
4. Save and upload

---

## Testing & Debugging

### Verify Files Locally

**Check CSV Format**:

```bash
# View first 5 lines
head -5 survey-schema.csv

# Check encoding
file -I survey-schema.csv

# Count rows
wc -l survey-schema.csv
```

**Check JSON Format**:

```bash
# Validate JSON
cat survey-schema.json | python3 -m json.tool

# Or use online tool: jsonlint.com
```

### Test with cURL

```bash
# Test with sample data
curl -X POST "http://localhost:8000/api/v1/surveys/upload-two-file" \
  -F "schema_file=@sample-data/survey-schema.csv" \
  -F "responses_file=@sample-data/two-file-responses.csv"

# Should return success with survey_id
# If 400 error, shows detailed error message
```

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try upload
4. Look for error messages in red
5. Check Network tab for response details

### Check Backend Logs

**Terminal where backend is running**:

- Look for error messages after upload attempt
- Should show detailed traceback if error occurs
- Check for `HTTPException` with detail message

---

## Quick Fixes

### Fix #1: Use Sample Data First

Before troubleshooting your own files, test with provided samples:

```
sample-data/survey-schema.csv
sample-data/two-file-responses.csv
```

If samples work ✅ → Your files have format issue  
If samples fail ❌ → System issue, check setup

### Fix #2: Validate Your Files

**Schema CSV Requirements**:

- ✅ Has header: `question_id,question_text,question_type,is_analyzed`
- ✅ At least one question row
- ✅ No empty question_id or question_text
- ✅ is_analyzed is "true" or "false"

**Responses CSV Requirements**:

- ✅ Has column headers matching question IDs
- ✅ At least one participant row
- ✅ At least one non-empty answer

### Fix #3: Simplify First

Start with minimal files:

**Minimal Schema** (schema-test.csv):

```csv
question_id,question_text,question_type,is_analyzed
q1,What is your feedback?,open_ended,true
```

**Minimal Responses** (responses-test.csv):

```csv
participant_id,q1
p1,"Great product"
p2,"Needs improvement"
```

If this works, gradually add more questions/responses.

---

## Success Checklist

Before uploading, verify:

- [ ] Both files selected (green checkmarks visible)
- [ ] Files have .csv or .json extension
- [ ] Schema has required columns (question_id, question_text)
- [ ] Responses has columns matching question IDs
- [ ] At least one participant with non-empty answer
- [ ] Question IDs match exactly (case-sensitive)
- [ ] Files saved as UTF-8 encoding
- [ ] No special/hidden characters

---

## Still Having Issues?

### Get Detailed Error

**Using Browser**:

1. Open DevTools (F12) → Network tab
2. Try upload
3. Click on failed request
4. Go to "Response" tab
5. Copy full error message

**Using cURL**:

```bash
curl -v -X POST "http://localhost:8000/api/v1/surveys/upload-two-file" \
  -F "schema_file=@your-schema.csv" \
  -F "responses_file=@your-responses.csv" \
  2>&1 | grep -A 20 "< HTTP"
```

### Check File Contents

**First 3 lines of schema**:

```bash
head -3 sample-data/survey-schema.csv
```

Should show:

```
question_id,question_text,question_type,is_analyzed
q1,What challenges do you face in software development?,open_ended,true
q2,What tools or features do you wish existed to help with your work?,open_ended,true
```

**First 3 lines of responses**:

```bash
head -3 sample-data/two-file-responses.csv
```

Should show:

```
participant_id,q1,q2,q3,q4,q5
p001,"Debugging complex distributed systems","Better distributed tracing tools","Microservices orchestration patterns","Flaky tests",8
p002,"Managing technical debt across legacy codebases","AI-powered refactoring assistant","Legacy code modernization strategies","Context switching between projects",6
```

---

## Contact/Support

If you've verified all of the above and still getting 400 errors:

1. Check that backend server is running (http://localhost:8000/api/v1/health)
2. Check that MongoDB is connected
3. Restart backend server
4. Clear browser cache
5. Try different browser
6. Check the documentation: `TWO_FILE_SURVEY.md`

---

**Last Updated**: November 3, 2025  
**Status**: Active troubleshooting guide
