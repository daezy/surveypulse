# Multi-Question Survey Support Documentation

## Overview

The LLM Survey Analysis System now supports **multi-question surveys** like the Stack Overflow Developer Survey, allowing you to analyze structured datasets with multiple questions per participant.

## Features

### ✅ What's Supported

1. **Multi-Question CSV Upload**

   - Upload CSV files with multiple columns (questions)
   - Each row represents one participant's responses
   - Automatic question detection from column headers

2. **Per-Question Analysis**

   - Individual analysis for each question
   - Summarization, sentiment, topics, and open problems per question
   - Response count tracking

3. **Cross-Question Insights**

   - Common themes across all questions
   - Pattern detection between questions
   - Holistic survey understanding
   - Relationship identification

4. **Backward Compatibility**
   - Simple single-response surveys still work
   - Automatic survey type detection
   - Seamless user experience

## How It Works

### File Format Requirements

#### Multi-Question CSV

```csv
Question 1,Question 2,Question 3
Response 1 for Q1,Response 1 for Q2,Response 1 for Q3
Response 2 for Q1,Response 2 for Q2,Response 2 for Q3
...
```

**Example**: `sample-data/multi-question-survey.csv`

```csv
What challenges do you face?,What tools do you wish existed?,What needs more research?
"Debugging is hard","Better debugging tools","Automated debugging research"
"Technical debt","AI code review tools","Code quality methodologies"
...
```

#### Simple CSV (Backward Compatible)

```csv
response
Response 1
Response 2
...
```

### Upload Methods

#### Method 1: File Upload (Recommended)

```bash
POST /api/v1/surveys/upload-file
Content-Type: multipart/form-data

file: multi-question-survey.csv
```

The system automatically:

1. Detects multiple columns
2. Creates questions from headers
3. Extracts participant responses
4. Preprocesses data per question

#### Method 2: API JSON Upload

```json
POST /api/v1/surveys/upload
{
  "title": "Developer Experience Survey 2024",
  "description": "Multi-question survey about developer challenges",
  "survey_type": "structured",
  "questions": [
    {
      "question_id": "q_1",
      "question_text": "What challenges do you face?",
      "question_type": "open_ended",
      "is_analyzed": true
    },
    {
      "question_id": "q_2",
      "question_text": "What tools do you need?",
      "question_type": "open_ended",
      "is_analyzed": true
    }
  ],
  "structured_responses": [
    {
      "q_1": "Debugging complex systems",
      "q_2": "Better debugging tools"
    },
    {
      "q_1": "Managing technical debt",
      "q_2": "AI code review tools"
    }
  ]
}
```

## Analysis Output Structure

### Structured Survey Response

```json
{
  "survey_id": "...",
  "survey_type": "structured",
  "question_analyses": [
    {
      "question_id": "q_1",
      "question_text": "What challenges do you face?",
      "summary": "Developers face challenges in debugging...",
      "key_findings": [
        "Debugging complexity is a major issue",
        "Technical debt management is difficult"
      ],
      "sentiment": {
        "label": "negative",
        "score": -0.65,
        "confidence": 0.85
      },
      "topics": [
        {
          "topic": "Debugging Challenges",
          "keywords": ["debugging", "errors", "bugs"],
          "frequency": 15
        }
      ],
      "open_problems": [
        {
          "title": "Automated Debugging",
          "description": "Need for intelligent debugging tools",
          "category": "tooling",
          "priority": "high"
        }
      ],
      "response_count": 20
    },
    {
      "question_id": "q_2",
      "question_text": "What tools do you wish existed?",
      ...
    }
  ],
  "cross_question_insights": {
    "common_themes": [
      "Developer productivity",
      "Tool limitations",
      "Automation needs"
    ],
    "key_patterns": [
      "Challenges mentioned in Q1 align with tool requests in Q2",
      "Security concerns appear across multiple questions"
    ],
    "overall_insights": "Survey reveals a strong need for...",
    "cross_question_findings": [
      "Debugging challenges correlate with testing difficulties",
      "Documentation issues mentioned alongside collaboration problems"
    ]
  },
  "total_questions_analyzed": 4,
  "total_responses_analyzed": 80,
  "processing_time": 45.2
}
```

## Use Cases

### 1. Stack Overflow Developer Survey Style

- Multiple open-ended questions per developer
- Analyze experiences, challenges, and preferences
- Cross-reference responses for deeper insights

### 2. User Experience Research

- Product feedback across different features
- Pain point identification per feature area
- Holistic user satisfaction analysis

### 3. Academic Research

- Multi-faceted research questions
- Comprehensive data collection
- Structured qualitative analysis

### 4. Employee Feedback

- Multiple categories (culture, tools, processes)
- Department-specific insights
- Organization-wide pattern detection

## Technical Implementation

### Data Model

#### SurveyQuestion Schema

```python
{
  "question_id": str,
  "question_text": str,
  "question_type": str,  # open_ended, multiple_choice, rating
  "is_analyzed": bool    # Whether to analyze with LLM
}
```

#### Structured Survey Document

```python
{
  "_id": ObjectId,
  "title": str,
  "survey_type": "structured",
  "questions": [SurveyQuestion],
  "total_participants": int,
  "processed_data": {
    "q_1": {
      "question_text": str,
      "responses": [str],
      "response_count": int
    }
  },
  "status": "pending|processing|completed",
  "created_at": datetime,
  "updated_at": datetime
}
```

### Analysis Pipeline

1. **Upload Phase**

   ```
   CSV Upload → Column Detection → Question Extraction → Response Mapping
   ```

2. **Preprocessing Phase**

   ```
   Per-Question Processing → Text Cleaning → Deduplication → Tokenization
   ```

3. **Analysis Phase**

   ```
   Individual Question Analysis → LLM Processing → Result Aggregation
   ```

4. **Cross-Analysis Phase**
   ```
   Theme Detection → Pattern Identification → Insight Generation
   ```

## Configuration

### Question Settings

Questions can be configured individually:

```python
{
  "question_id": "q_custom",
  "question_text": "Your question here",
  "question_type": "open_ended",
  "is_analyzed": True  # Set to False to skip LLM analysis
}
```

### Analysis Options

Control which analyses to perform:

```python
{
  "analyze_per_question": True,
  "generate_cross_insights": True,
  "min_responses_per_question": 3,  # Skip questions with fewer responses
  "include_sentiment": True,
  "include_topics": True,
  "include_open_problems": True
}
```

## Performance Considerations

### Token Usage

- Multi-question surveys use more API tokens
- Each question is analyzed separately
- Cross-question analysis adds one additional API call
- **Estimate**: ~500-1000 tokens per question

### Processing Time

- Depends on number of questions and responses
- Parallel processing where possible
- **Estimate**: 10-20 seconds per question

### Best Practices

1. **Question Selection**: Mark only relevant questions for analysis (`is_analyzed: true`)
2. **Response Filtering**: Remove empty or invalid responses during preprocessing
3. **Batching**: Process large surveys in smaller batches if needed
4. **Caching**: Results are stored in database for repeat access

## Example Workflows

### Workflow 1: Upload and Analyze Stack Overflow Survey

```bash
# 1. Upload CSV file
curl -X POST "http://localhost:8000/api/v1/surveys/upload-file" \
  -F "file=@stackoverflow-survey-2024.csv"

# Response:
# {
#   "survey_id": "abc123",
#   "survey_type": "structured",
#   "total_questions": 10,
#   "total_participants": 50
# }

# 2. Trigger analysis
curl -X POST "http://localhost:8000/api/v1/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{"survey_id": "abc123", "analysis_types": ["full_analysis"]}'

# 3. Get results
curl "http://localhost:8000/api/v1/analysis/abc123/results"
```

### Workflow 2: Frontend Upload

1. Go to Upload page
2. Select CSV file with multiple columns
3. System detects multi-question format automatically
4. Shows preview of detected questions
5. Upload and analyze
6. View per-question results and cross-insights

## Migration from Simple Surveys

Existing simple surveys continue to work without changes. The system automatically:

- Detects survey type from data structure
- Routes to appropriate analysis pipeline
- Returns compatible response format

## Limitations

### Current Limitations

1. **Text-Only**: Only analyzes open-ended text responses
2. **Column Limit**: Best performance with <20 questions per survey
3. **Response Limit**: Optimal with 3-1000 responses per question
4. **Language**: Optimized for English text

### Not Yet Supported

- Multiple-choice question analysis (planned)
- Rating scale aggregation (planned)
- Demographic cross-referencing (planned)
- Real-time streaming analysis (planned)

## Future Enhancements

### Planned Features

- [ ] Support for multiple-choice questions
- [ ] Demographic filtering and comparison
- [ ] Temporal analysis (survey evolution over time)
- [ ] Export to research paper format
- [ ] Automated report generation
- [ ] Question recommendation engine
- [ ] Response quality scoring

## Troubleshooting

### Issue: "No questions detected"

**Cause**: CSV has only one column or no header row  
**Solution**: Ensure CSV has header row and multiple columns

### Issue: "Insufficient responses for question X"

**Cause**: Question has fewer than 3 responses  
**Solution**: Either collect more data or mark question as `is_analyzed: false`

### Issue: "Processing takes too long"

**Cause**: Many questions or large response counts  
**Solution**:

- Reduce number of questions analyzed
- Use smaller sample size
- Process in batches

### Issue: "Cross-question insights are generic"

**Cause**: Insufficient variation between question responses  
**Solution**: Ensure questions cover different aspects of the topic

## API Reference

### Endpoints

#### Upload Structured Survey

```
POST /api/v1/surveys/upload
Body: SurveyUpload (with survey_type="structured")
Returns: Survey metadata with question count
```

#### Upload Multi-Question CSV

```
POST /api/v1/surveys/upload-file
Body: multipart/form-data with CSV file
Returns: Auto-detected survey structure
```

#### Analyze Structured Survey

```
POST /api/v1/analysis/analyze
Body: {"survey_id": "...", "analysis_types": ["full_analysis"]}
Returns: Analysis task started
```

#### Get Structured Results

```
GET /api/v1/analysis/{survey_id}/results
Returns: QuestionAnalysis[] + CrossQuestionInsights
```

## Research Applications

### Academic Benefits

1. **Comprehensive Analysis**: Analyze multiple research questions simultaneously
2. **Pattern Detection**: Discover relationships between different questions
3. **Triangulation**: Cross-validate findings across questions
4. **Efficiency**: Automated analysis saves research time

### Chapter 3 Alignment

This feature directly supports the methodology requirements:

**3.3 Data Collection Methods**
✅ Supports Stack Overflow and Nigerian developer surveys  
✅ Handles diverse response formats  
✅ Preserves question context

**3.4 System Architecture**
✅ Modular design accommodates structured data  
✅ Scalable to multiple questions  
✅ Maintains data flow integrity

**3.5 System Requirements**
✅ Functional requirement: Multi-format support  
✅ Non-functional: Performance optimization  
✅ Accuracy: Per-question and cross-question analysis

**3.7 Evaluation Techniques**
✅ Quantitative: Metrics per question  
✅ Qualitative: Cross-question insights  
✅ Comparative: Simple vs. structured surveys

## Support

For questions or issues with multi-question surveys:

1. Check sample data in `sample-data/multi-question-survey.csv`
2. Review API documentation at `/docs`
3. Check logs for detailed error messages
4. Consult TESTING.md for validation procedures

---

**Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Feature Status**: ✅ Production Ready
