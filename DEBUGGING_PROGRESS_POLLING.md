# Testing Real-Time Progress Tracking

## Issue Report

User noticed that during survey analysis, no requests are going through to the backend.

## Changes Made to Debug

### 1. Frontend Logging (SurveyDetailPage.jsx)

Added comprehensive console logging to track:

- When polling starts/stops
- Each status check request
- Status responses received
- Progress updates
- Completion/failure events

**Console Output Pattern:**

```
🔄 Starting polling for survey: {surveyId}
📡 Polling status for survey: {surveyId}
✅ Status received: {status}
📊 Progress updated: {progress}
🛑 Stopping polling for survey: {surveyId}
```

### 2. API Service Logging (api.js)

Added axios interceptors to log all API requests/responses:

- Request interceptor logs outgoing requests
- Response interceptor logs successful responses
- Error interceptor logs failed requests

**Console Output Pattern:**

```
🚀 API Request: GET /api/v1/analysis/{surveyId}/status
✅ API Response: /api/v1/analysis/{surveyId}/status {data}
❌ API Response Error: {error}
```

### 3. Backend Logging (analysis.py)

Added logging to status endpoint to track incoming requests:

**Log Pattern:**

```
📡 Status check requested for survey: {surveyId}
✅ Status response for {surveyId}: status={status}, progress={percentage}%
```

### 4. Fixed useEffect Dependencies

Added `surveyId` to the dependency array to ensure polling works correctly:

```javascript
}, [survey?.status, surveyId])  // Added surveyId
```

## How to Test

### 1. Open Browser Console

- Open Developer Tools (F12 or Cmd+Option+I)
- Go to Console tab
- Clear console

### 2. Start New Analysis

1. Upload a survey or select existing one
2. Click "Start Analysis"
3. Watch the console output

### 3. Expected Console Output

**Frontend (Browser Console):**

```
🔄 Starting polling for survey: 690b291fbc1be9c491439f57
🚀 API Request: GET /api/v1/analysis/690b291fbc1be9c491439f57/status
✅ API Response: /api/v1/analysis/690b291fbc1be9c491439f57/status {status: "processing", progress: {...}}
📊 Progress updated: {step: "analyzing_questions", percentage: 25, ...}
📡 Polling status for survey: 690b291fbc1be9c491439f57
🚀 API Request: GET /api/v1/analysis/690b291fbc1be9c491439f57/status
... (continues every 2 seconds)
```

**Backend (Terminal):**

```
INFO:app.api.routes.analysis:📡 Status check requested for survey: 690b291fbc1be9c491439f57
INFO:app.api.routes.analysis:✅ Status response for 690b291fbc1be9c491439f57: status=processing, progress=25%
... (repeats every 2 seconds)
```

## Potential Issues & Solutions

### Issue 1: No Polling Starts

**Symptom:** Console shows no "🔄 Starting polling" message
**Cause:** Survey status might not be "processing"
**Solution:** Check survey status after starting analysis

### Issue 2: Polling Stops Immediately

**Symptom:** Console shows "🛑 Stopping polling" right after starting
**Cause:** Component unmounted or survey status changed
**Solution:** Check if survey stays in "processing" state

### Issue 3: No Network Requests

**Symptom:** Console shows polling logs but no "🚀 API Request" logs
**Cause:** API function not being called correctly
**Solution:** Check getAnalysisStatus function implementation

### Issue 4: CORS Errors

**Symptom:** Console shows CORS-related errors
**Cause:** Backend CORS settings might not include frontend origin
**Solution:** Check ALLOWED_ORIGINS in backend config

### Issue 5: 404 Errors

**Symptom:** API returns 404 for status endpoint
**Cause:** Survey ID might be invalid or survey doesn't exist
**Solution:** Verify survey exists in database using check_surveys.py

## Verification Steps

1. **Check Backend is Running:**

   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. **Check Frontend is Running:**

   ```bash
   curl http://localhost:5173
   ```

3. **Manually Test Status Endpoint:**

   ```bash
   curl http://localhost:8000/api/v1/analysis/{SURVEY_ID}/status
   ```

4. **Check Backend Logs:**

   - Watch the terminal running uvicorn
   - Should see INFO logs for status checks

5. **Check Browser Network Tab:**
   - Open DevTools → Network tab
   - Filter by "status"
   - Should see requests every 2 seconds during analysis

## Next Steps

1. **Run Analysis:** Start a new survey analysis
2. **Monitor Console:** Watch browser console for logs
3. **Monitor Terminal:** Watch backend logs
4. **Report Findings:** Check if requests are actually going through or if they're being blocked

## Expected Behavior

✅ **When Analysis Starts:**

- Frontend detects status="processing"
- Polling interval starts
- Status requests sent every 2 seconds
- Backend receives and logs requests
- Progress updates reflected in UI

✅ **During Analysis:**

- Continuous polling every 2 seconds
- Progress bar updates with real data
- Status messages update from backend
- Question counter increments

✅ **When Analysis Completes:**

- Final status="completed" received
- Polling stops
- Success toast appears
- Results displayed

## Files Modified

1. `/frontend/src/pages/SurveyDetailPage.jsx` - Added polling logs
2. `/frontend/src/services/api.js` - Added request/response interceptors
3. `/backend/app/api/routes/analysis.py` - Added status endpoint logging
