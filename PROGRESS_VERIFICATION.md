# Real-Time Progress Tracking - Verification Checklist

## Quick Start Testing

### 1. Backend Verification

```bash
cd backend
# Check if progress fields are in place
grep -n "progress\." app/api/routes/analysis.py
# Should show multiple progress field updates

# Check callback implementation
grep -n "progress_callback" app/services/llm_service.py
# Should show callback parameter and usage
```

### 2. Start Services

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 3. Test Flow

#### Upload Survey

1. Go to http://localhost:5173
2. Click "Upload New Survey"
3. Use sample data: `sample-data/multi-question-survey.csv`
4. Click "Upload & Analyze"

#### Watch Progress

1. Navigate to survey detail page
2. Click "Start Analysis"
3. **Observe:**
   - Progress bar appears and updates
   - Percentage increases from 0% → 100%
   - Status messages change in real-time
   - Question counter increments (1 of 10, 2 of 10, etc.)
   - Status indicators light up as steps complete
   - Timestamp updates every 2 seconds

### 4. Expected Progress Flow

```
✓ Preprocessing (0-10%)
  └─ "Preprocessing survey data..."

✓ Analyzing Questions (10-80%)
  └─ "Analyzing question 1/10: What are the main..."
  └─ "Analyzing question 2/10: How do you rate..."
  └─ ... (continues for all questions)

✓ Cross-Question Insights (80-85%)
  └─ "Generating cross-question insights..."

✓ Finalizing (95%)
  └─ "Finalizing results and preparing visualizations..."

✓ Completed (100%)
  └─ Results displayed
```

## Verification Points

### Backend API

- [ ] `/api/analysis/status/{survey_id}` returns `progress` object
- [ ] Progress object contains: step, message, percentage, current_question, total_questions, last_updated
- [ ] Progress updates during analysis (check database or API responses)
- [ ] Callback function invoked at each question
- [ ] Final status shows 100% completion

### Frontend UI

- [ ] Progress state updates from API polling
- [ ] Progress bar animates smoothly (0-100%)
- [ ] Percentage display matches backend value
- [ ] Question counter shows "X of Y" format
- [ ] Status indicators change color based on step
- [ ] Live activity shows real backend messages
- [ ] Timestamp updates regularly
- [ ] No console errors during polling

### User Experience

- [ ] No static/fake progress (all data from backend)
- [ ] Progress updates every 2 seconds
- [ ] Smooth transitions between steps
- [ ] Clear messaging at each stage
- [ ] Progress resets for new analysis
- [ ] Completion triggers success toast

## Common Issues & Solutions

### Issue 1: No Progress Updates

**Symptom:** Progress bar stays at 0%
**Check:**

```bash
# Verify backend is sending progress
curl http://localhost:8000/api/analysis/status/{survey_id}
# Should include "progress" field
```

**Solution:** Check database connection and progress callback implementation

### Issue 2: Progress Stuck

**Symptom:** Progress stops at certain percentage
**Check:** Backend logs for errors

```bash
# Check for LLM API errors
grep -i "error" backend.log
```

**Solution:** Verify OpenAI API key and rate limits

### Issue 3: Progress Jumps/Resets

**Symptom:** Progress bar jumps back or resets unexpectedly
**Check:** Frontend polling logic and state management
**Solution:** Ensure progress state updates correctly and doesn't reset on re-renders

### Issue 4: Slow Updates

**Symptom:** Progress updates take too long
**Check:** Polling interval in `SurveyDetailPage.jsx`

```javascript
}, 2000) // Should be 2000ms (2 seconds)
```

**Solution:** Verify interval is 2000ms, not 5000ms or higher

## Performance Metrics

### Expected Timing (10-question survey)

- **Preprocessing:** ~5 seconds
- **Per Question:** ~30-45 seconds
- **Total Questions:** ~5-7 minutes
- **Cross-Insights:** ~30 seconds
- **Finalizing:** ~10 seconds
- **Total Time:** ~6-8 minutes

### Progress Update Rate

- **Polling Frequency:** Every 2 seconds
- **Backend Updates:** On every question analyzed
- **Database Writes:** ~10-15 during full analysis
- **Network Overhead:** <1KB per status check

## Database Verification

### Check Progress in MongoDB

```javascript
// In MongoDB shell or Compass
db.surveys.findOne(
    { _id: ObjectId("your_survey_id") },
    { progress: 1 }
)

// Should return:
{
    "progress": {
        "step": "analyzing_questions",
        "message": "Analyzing question 3/10: ...",
        "current_question": 3,
        "total_questions": 10,
        "percentage": 35,
        "last_updated": ISODate("2024-12-...")
    }
}
```

## API Response Example

### GET /api/analysis/status/{survey_id}

```json
{
  "survey_id": "676abc123def456789",
  "status": "processing",
  "progress": {
    "step": "analyzing_questions",
    "message": "Analyzing question: What are the main challenges...",
    "current_question": 4,
    "total_questions": 10,
    "percentage": 42,
    "last_updated": "2024-12-01T10:30:45.123Z"
  },
  "last_analysis_id": null,
  "created_at": "2024-12-01T10:28:00.000Z",
  "updated_at": "2024-12-01T10:30:45.123Z"
}
```

## Success Criteria

### ✅ Implementation Complete When:

1. Progress bar updates in real-time during analysis
2. Percentage accurately reflects backend progress (not simulated)
3. Status messages show actual processing steps
4. Question counter increments correctly
5. No frontend errors in console
6. Backend progress callbacks execute without errors
7. Database contains progress data during analysis
8. Completion triggers proper state cleanup
9. Multiple analyses can run sequentially without issues
10. Progress is responsive (updates visible within 2-3 seconds)

## Browser DevTools Checklist

### Network Tab

- [ ] Status API called every 2 seconds during processing
- [ ] Response includes `progress` object
- [ ] No 404 or 500 errors
- [ ] Response time < 200ms

### Console Tab

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] Progress state updates logged (if debugging enabled)

### React DevTools

- [ ] `progress` state updates properly
- [ ] No unnecessary re-renders
- [ ] State cleanup on completion

## Documentation Cross-Reference

- **Implementation:** REALTIME_PROGRESS_TRACKING.md
- **Architecture:** ARCHITECTURE.md (async task system)
- **Testing:** TESTING.md (integration tests)
- **Troubleshooting:** TROUBLESHOOTING_TWO_FILE.md (error handling)

---

**Status:** Ready for Testing ✅  
**Last Updated:** December 2024  
**Next Steps:** Run verification tests and validate in production
