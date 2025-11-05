# Debugging Malformed Summary Display Issue

## Issue Description

Some questions show their summary as a stringified JSON object instead of plain text:

```
Summary
{ "summary": "The survey responses...", "key_findings": [...] }
```

Instead of:

```
Summary
The survey responses from software developers reveal...
```

## Root Cause Analysis

### Database Check

✅ Ran script to check database - **NO malformed summaries found**

- All summaries in database are stored correctly as plain strings
- No stringified JSON objects in the summary field

### Possible Causes

1. **Old/Cached Frontend Data**

   - Browser might be displaying cached data from before the fix
   - Solution: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

2. **API Response Serialization Issue**

   - FastAPI might be double-serializing the response
   - Solution: Check API response in Network tab

3. **Frontend Display Logic**
   - Component might be calling JSON.stringify on the data
   - Solution: Added safeguard helper function

## Fixes Applied

### 1. Frontend Safeguard (AnalysisResults.jsx)

Added `getSafeText()` helper function that:

- Detects if summary is accidentally stringified JSON
- Automatically extracts the actual summary text
- Returns plain text in all cases

```javascript
const getSafeText = (value) => {
  if (!value) return "";
  if (typeof value !== "string") return String(value);

  // Check if it's accidentally a stringified JSON object
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.includes('"summary"')) {
    try {
      const parsed = JSON.parse(trimmed);
      // If it has a summary field, use that
      if (parsed.summary) return parsed.summary;
    } catch (e) {
      // If parsing fails, return as is
    }
  }

  return value;
};
```

Applied to both:

- Question summaries in structured surveys
- Executive summary in simple surveys

### 2. Database Verification Scripts

Created scripts to check and fix data:

- `check_format.py` - Verify summary format in database
- `fix_malformed_summaries.py` - Find and fix any malformed data

## How to Verify the Fix

### Step 1: Clear Browser Cache

```bash
# In browser:
- Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- Or: DevTools → Application → Clear storage
```

### Step 2: Check Network Response

1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to analysis results page
4. Find the API request for analysis results
5. Check the Response tab
6. Verify summary is plain text, not JSON string

### Step 3: Check Database Directly

```bash
cd backend
./venv/bin/python check_format.py
```

Should show:

```
✅ Summary is a plain string (not JSON)
```

### Step 4: Test New Analysis

1. Upload a new survey
2. Run analysis
3. Check results display correctly

## Verification Checklist

- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] Check Network tab API response format
- [ ] Verify database has correct format
- [ ] Test with newly created analysis
- [ ] Check both structured and simple surveys

## If Issue Persists

### Debug Steps

1. **Check API Response:**

   ```bash
   # Get an analysis ID from the database
   curl http://localhost:8000/api/v1/analysis/{SURVEY_ID}/results | python3 -m json.tool
   ```

   Look for the summary field - should be plain text, not JSON string.

2. **Check Browser Console:**

   - Open DevTools Console
   - Look for any errors or warnings
   - Check if data is being transformed anywhere

3. **Compare Old vs New Analysis:**
   - Create a fresh analysis
   - Compare with older analysis that shows the issue
   - Identify when the format changed

### Quick Fix Script

If you find specific analyses with malformed data:

```bash
cd backend
./venv/bin/python fix_malformed_summaries.py
```

This will:

- Find all analyses with stringified JSON in summary
- Parse the JSON and extract the actual summary text
- Update the database with correct format

## Prevention

The safeguard function in AnalysisResults.jsx now handles this edge case automatically, so even if malformed data exists, it will display correctly.

## Technical Details

### Before (Bug):

```json
{
  "summary": "{ \"summary\": \"The actual text...\", \"key_findings\": [...] }",
  "key_findings": []
}
```

### After (Fixed):

```json
{
  "summary": "The actual text...",
  "key_findings": ["Finding 1", "Finding 2", ...]
}
```

## Files Modified

1. **frontend/src/components/AnalysisResults.jsx**

   - Added `getSafeText()` helper function
   - Applied to all summary displays
   - Handles edge case of stringified JSON

2. **backend/check_format.py**

   - Verifies summary format in database
   - Shows type and structure of data

3. **backend/fix_malformed_summaries.py**
   - Finds malformed summaries
   - Automatically fixes them
   - Updates database

## Status

✅ **Fix Applied** - Frontend now handles edge case automatically
✅ **Database Verified** - No malformed data found
⏳ **Testing Required** - Clear cache and verify in browser

---

**Next Step:** Clear your browser cache (Cmd+Shift+R) and check if the issue is resolved!
