# Testing & Validation Guide

This guide explains how to test and validate the LLM Survey Analysis System.

## Testing Strategy

The system uses a multi-layered testing approach:

1. **Manual Testing** - UI and functionality testing
2. **API Testing** - Endpoint validation via Swagger
3. **Integration Testing** - End-to-end workflow validation
4. **Performance Testing** - Load and response time testing

---

## 1. Manual Testing

### Test Case 1: Upload Survey (File)

**Steps:**

1. Navigate to Upload page
2. Select file upload mode
3. Upload `sample-data/developer-feedback.txt`
4. Verify success message
5. Check dashboard shows new survey

**Expected Result:**

- File uploads successfully
- Survey appears in dashboard
- Response count is accurate (50 responses)

### Test Case 2: Upload Survey (Manual)

**Steps:**

1. Navigate to Upload page
2. Select manual entry mode
3. Enter title: "Test Survey"
4. Enter 5-10 sample responses
5. Submit form

**Expected Result:**

- Survey is created
- Redirects to survey detail page
- All responses are saved

### Test Case 3: Run Analysis

**Steps:**

1. Open a survey from dashboard
2. Click "Start AI Analysis"
3. Select "Full Analysis"
4. Submit

**Expected Result:**

- Analysis starts (status: processing)
- Progress indicator shown
- Completes within 1-3 minutes
- Results display correctly

### Test Case 4: View Results

**Steps:**

1. Open completed survey
2. Verify all sections display:
   - Summary
   - Key findings
   - Sentiment analysis
   - Topics
   - Open problems

**Expected Result:**

- All analysis sections present
- Charts render correctly
- Data is accurate and relevant

### Test Case 5: Export Results

**Steps:**

1. Click "Export Results"
2. Check downloaded JSON file

**Expected Result:**

- JSON file downloads
- Contains complete analysis data
- Valid JSON format

---

## 2. API Testing

### Using Swagger UI

1. Navigate to: http://localhost:8000/docs
2. Test each endpoint using the interactive UI

### Health Check

```bash
curl http://localhost:8000/api/v1/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "service": "LLM Survey Analysis API"
}
```

### Upload Survey

```bash
curl -X POST http://localhost:8000/api/v1/surveys/upload \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Survey",
    "description": "API test",
    "responses": [
      "Great product",
      "Needs improvement",
      "Very satisfied"
    ]
  }'
```

**Expected Response:**

```json
{
  "survey_id": "...",
  "title": "Test Survey",
  "total_responses": 3,
  "status": "uploaded"
}
```

### Get Surveys

```bash
curl http://localhost:8000/api/v1/surveys/
```

**Expected Response:**

```json
{
  "surveys": [...],
  "total": 5
}
```

### Start Analysis

```bash
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "survey_id": "your_survey_id",
    "analysis_types": ["full_analysis"]
  }'
```

### Get Analysis Results

```bash
curl http://localhost:8000/api/v1/analysis/{survey_id}/results
```

---

## 3. Integration Testing

### End-to-End Workflow

**Scenario: Complete Survey Analysis Flow**

1. **Setup**

   - Ensure backend and frontend are running
   - Database is connected
   - OpenAI API key is valid

2. **Execute**

   - Upload sample survey
   - Start analysis
   - Wait for completion
   - View results
   - Export data

3. **Validation**
   - Check database for survey record
   - Verify analysis document exists
   - Confirm results are meaningful
   - Validate exported JSON

### Database Verification

```bash
# Connect to MongoDB
mongo

# Switch to database
use survey_analysis

# Check surveys
db.surveys.find().pretty()

# Check analyses
db.analyses.find().pretty()

# Count documents
db.surveys.countDocuments()
db.analyses.countDocuments()
```

---

## 4. Performance Testing

### Response Time Testing

**Backend API:**

```bash
# Health check response time
time curl http://localhost:8000/api/v1/health

# Expected: < 100ms
```

**Analysis Time:**

- Small survey (10-20 responses): 20-40 seconds
- Medium survey (50-100 responses): 1-2 minutes
- Large survey (200+ responses): 3-5 minutes

### Load Testing (Basic)

```bash
# Install Apache Bench
brew install apache-bench

# Test health endpoint
ab -n 100 -c 10 http://localhost:8000/api/v1/health

# Test survey list
ab -n 50 -c 5 http://localhost:8000/api/v1/surveys/
```

**Expected Results:**

- Success rate: 100%
- Average response time: < 200ms
- No server errors

---

## 5. Data Validation

### Input Validation Tests

**Test Invalid File Types:**

```bash
# Try uploading .pdf file
# Expected: Error message "Unsupported file type"
```

**Test Empty Survey:**

```bash
curl -X POST http://localhost:8000/api/v1/surveys/upload \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Empty Survey",
    "responses": []
  }'

# Expected: 400 Bad Request
```

**Test Missing Required Fields:**

```bash
curl -X POST http://localhost:8000/api/v1/surveys/upload \
  -H "Content-Type: application/json" \
  -d '{
    "responses": ["Test"]
  }'

# Expected: 422 Validation Error
```

### Output Validation

**Check Analysis Quality:**

1. Upload survey with clear themes
2. Run analysis
3. Verify:
   - Summary captures main points
   - Sentiment matches tone
   - Topics are relevant
   - Keywords are accurate

---

## 6. Error Handling Tests

### Test Network Errors

1. Stop backend server
2. Try operations from frontend
3. Verify error messages display

**Expected:**

- Graceful error messages
- No app crashes
- User can retry

### Test Database Errors

1. Stop MongoDB
2. Try uploading survey
3. Check error handling

**Expected:**

- Appropriate error message
- Backend logs error
- Service recovers when DB reconnects

### Test OpenAI API Errors

**Invalid API Key:**

1. Set wrong OPENAI_API_KEY
2. Try analysis
3. Check error handling

**Expected:**

- Clear error message
- Survey status set to "failed"
- No partial results saved

---

## 7. Security Testing

### Input Sanitization

**Test SQL/NoSQL Injection:**

```bash
# Try malicious input
curl -X POST http://localhost:8000/api/v1/surveys/upload \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test\"; DROP TABLE surveys;--",
    "responses": ["test"]
  }'

# Expected: Input sanitized, no injection
```

### CORS Testing

```bash
# Try cross-origin request
curl -X GET http://localhost:8000/api/v1/surveys/ \
  -H "Origin: http://malicious-site.com"

# Expected: CORS policy enforced
```

---

## 8. UI/UX Testing

### Responsive Design

**Test on different screen sizes:**

- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Expected:**

- Layout adapts correctly
- No horizontal scrolling
- Touch targets are appropriate size

### Accessibility

**Test keyboard navigation:**

1. Navigate using Tab key
2. Activate buttons with Enter/Space
3. Close modals with Escape

**Expected:**

- All interactive elements accessible
- Focus indicators visible
- Logical tab order

### Browser Compatibility

Test on:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 9. Automated Testing (Future)

### Backend Unit Tests

```python
# tests/test_preprocessing.py
def test_clean_text():
    preprocessor = DataPreprocessor()
    result = preprocessor.clean_text("Test <html> text!!!")
    assert result == "test text"

# tests/test_api.py
def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Frontend Unit Tests

```javascript
// src/__tests__/utils.test.js
import { formatDate, getSentimentColor } from "../lib/utils";

test("formats date correctly", () => {
  const date = "2024-01-01T00:00:00Z";
  expect(formatDate(date)).toContain("January");
});

test("returns correct sentiment color", () => {
  expect(getSentimentColor("positive")).toContain("green");
});
```

---

## 10. Test Checklist

### Pre-Deployment Checklist

- [ ] All manual tests pass
- [ ] API endpoints tested via Swagger
- [ ] End-to-end workflow validated
- [ ] Performance benchmarks met
- [ ] Error handling works correctly
- [ ] Security tests pass
- [ ] UI/UX responsive on all devices
- [ ] Browser compatibility confirmed
- [ ] Sample data analysis successful
- [ ] Export functionality works
- [ ] Documentation accurate

### Post-Deployment Checklist

- [ ] Production health check passes
- [ ] Can upload survey in production
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] No console errors
- [ ] Database connections stable
- [ ] API response times acceptable
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] Environment variables set

---

## Troubleshooting Tests

If tests fail, check:

1. **Services Running**: Backend, Frontend, MongoDB
2. **Environment Variables**: Correctly set in .env
3. **API Key**: Valid OpenAI key with credits
4. **Network**: No firewall blocking requests
5. **Ports**: 5173 (frontend), 8000 (backend) available
6. **Dependencies**: All packages installed
7. **Database**: MongoDB accessible and populated

---

## Reporting Issues

When reporting bugs, include:

- Test case that failed
- Expected vs actual result
- Error messages
- Console logs
- Environment details (OS, browser, versions)
- Steps to reproduce

---

**Testing is crucial for ensuring system reliability and user satisfaction!**

Last Updated: November 2024
