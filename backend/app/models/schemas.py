from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SurveyStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisType(str, Enum):
    SUMMARIZATION = "summarization"
    SENTIMENT = "sentiment"
    TOPIC_DETECTION = "topic_detection"
    OPEN_PROBLEMS = "open_problems"
    FULL_ANALYSIS = "full_analysis"


class SurveyQuestion(BaseModel):
    """Individual survey question"""

    question_id: str
    question_text: str
    question_type: str = "open_ended"  # open_ended, multiple_choice, rating, etc.
    is_analyzed: bool = True  # Whether this question should be analyzed by LLM


class SurveyResponse(BaseModel):
    """Individual survey response - can be simple text or structured"""

    response_id: str
    text: Optional[str] = None  # For simple single-response surveys
    structured_responses: Optional[Dict[str, str]] = (
        None  # For multi-question surveys: {question_id: answer}
    )
    metadata: Optional[Dict[str, Any]] = {}


class SurveyUpload(BaseModel):
    """Survey upload request - supports both simple and multi-question surveys"""

    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    survey_type: str = (
        "simple"  # simple (single question) or structured (multi-question)
    )

    # For simple surveys (backward compatible)
    responses: Optional[List[str]] = None

    # For multi-question surveys
    questions: Optional[List[SurveyQuestion]] = None
    structured_responses: Optional[List[Dict[str, str]]] = (
        None  # List of {question_id: answer}
    )


class SurveyDocument(BaseModel):
    """Survey document in database - supports both simple and multi-question surveys"""

    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    survey_type: str = "simple"  # simple or structured

    # For simple surveys
    total_responses: int

    # For multi-question surveys
    questions: Optional[List[SurveyQuestion]] = None
    total_participants: Optional[int] = None

    status: SurveyStatus = SurveyStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class SentimentResult(BaseModel):
    """Sentiment analysis result"""

    label: str  # positive, negative, neutral
    score: float
    confidence: float


class TopicResult(BaseModel):
    """Topic detection result"""

    topic: str
    keywords: List[str]
    frequency: int
    sample_responses: List[str]


class OpenProblem(BaseModel):
    """Identified open research problem"""

    title: str
    description: str
    category: str
    supporting_responses: List[str]
    priority: str  # high, medium, low


class QuestionAnalysis(BaseModel):
    """Analysis result for a specific question in multi-question surveys"""

    question_id: str
    question_text: str
    summary: Optional[str] = None
    key_findings: Optional[List[str]] = None
    sentiment: Optional[SentimentResult] = None
    topics: Optional[List[TopicResult]] = None
    open_problems: Optional[List[OpenProblem]] = None
    response_count: int


class AnalysisResult(BaseModel):
    """Complete analysis result - supports both simple and multi-question surveys"""

    survey_id: str
    analysis_type: AnalysisType
    survey_type: str = "simple"  # simple or structured

    # For simple surveys (backward compatible)
    summary: Optional[str] = None
    key_findings: Optional[List[str]] = None
    overall_sentiment: Optional[SentimentResult] = None
    sentiment_distribution: Optional[Dict[str, int]] = None
    topics: Optional[List[TopicResult]] = None
    open_problems: Optional[List[OpenProblem]] = None

    # For multi-question surveys
    question_analyses: Optional[List[QuestionAnalysis]] = None
    cross_question_insights: Optional[Dict[str, Any]] = (
        None  # Insights across questions
    )

    # Metadata
    total_responses_analyzed: int
    processing_time: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class AnalysisRequest(BaseModel):
    """Analysis request"""

    survey_id: str
    analysis_types: List[AnalysisType]
    options: Optional[Dict[str, Any]] = {}


class AnalysisResponse(BaseModel):
    """Analysis response"""

    analysis_id: str
    survey_id: str
    status: str
    message: str
    result: Optional[AnalysisResult] = None
