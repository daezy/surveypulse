# System Architecture Diagrams

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                    (React + Tailwind CSS)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Home    │  │Dashboard │  │  Upload  │  │Survey Detail │   │
│  │  Page    │  │  Page    │  │  Page    │  │    Page      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            Shared Components & UI Library              │    │
│  │   (Cards, Buttons, Charts, Forms, Visualizations)      │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/REST API (Axios)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND API LAYER                            │
│                     (FastAPI + Python)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Health  │  │ Surveys  │  │ Analysis │  │   Upload     │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │   Handler    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  Business Logic Layer                  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Data Preprocessing Service                          │    │
│  │  • LLM Service (OpenAI Integration)                    │    │
│  │  • Prompt Engineering                                  │    │
│  │  • Result Synthesis                                    │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           │ MongoDB Driver                │ OpenAI API
           │                               │
┌──────────▼──────────┐         ┌─────────▼────────────┐
│   MongoDB Database  │         │   OpenAI GPT API     │
│                     │         │                      │
│  • surveys          │         │  • gpt-3.5-turbo    │
│  • analyses         │         │  • gpt-4            │
│  • users (future)   │         │                      │
└─────────────────────┘         └──────────────────────┘
```

## Detailed Backend Architecture

```
backend/
│
├── main.py (FastAPI App Instance)
│   ├── Startup/Shutdown Events
│   ├── CORS Middleware
│   ├── Exception Handlers
│   └── Router Registration
│
├── app/
│   │
│   ├── core/
│   │   ├── config.py
│   │   │   ├── Settings Class (Environment Variables)
│   │   │   ├── Database Config
│   │   │   ├── OpenAI Config
│   │   │   └── Security Settings
│   │   │
│   │   └── database.py
│   │       ├── MongoDB Connection
│   │       ├── Connection Pool
│   │       └── Database Instance
│   │
│   ├── models/
│   │   └── schemas.py
│   │       ├── SurveyUpload (Request)
│   │       ├── SurveyDocument (Database)
│   │       ├── AnalysisRequest (Request)
│   │       ├── AnalysisResult (Response)
│   │       ├── SentimentResult
│   │       ├── TopicResult
│   │       └── OpenProblem
│   │
│   ├── services/
│   │   ├── preprocessing.py
│   │   │   ├── DataPreprocessor Class
│   │   │   │   ├── clean_text()
│   │   │   │   ├── remove_duplicates()
│   │   │   │   ├── tokenize()
│   │   │   │   ├── remove_stopwords()
│   │   │   │   └── prepare_for_llm()
│   │   │
│   │   └── llm_service.py
│   │       ├── LLMService Class
│   │       │   ├── generate_completion()
│   │       │   ├── summarize_responses()
│   │       │   ├── analyze_sentiment()
│   │       │   ├── detect_topics()
│   │       │   ├── extract_open_problems()
│   │       │   └── full_analysis()
│   │
│   └── api/
│       └── routes/
│           ├── health.py
│           │   ├── GET /health
│           │   └── GET /status
│           │
│           ├── surveys.py
│           │   ├── POST /upload
│           │   ├── POST /upload-file
│           │   ├── GET /
│           │   ├── GET /{id}
│           │   └── DELETE /{id}
│           │
│           └── analysis.py
│               ├── POST /analyze
│               ├── GET /{survey_id}/results
│               ├── GET /{survey_id}/status
│               └── DELETE /{analysis_id}
```

## Frontend Component Hierarchy

```
App (Router)
│
├── Layout (Navigation + Footer)
│   │
│   ├── Header/Navigation
│   │   ├── Logo
│   │   ├── Dashboard Link
│   │   ├── Upload Link
│   │   └── GitHub Link
│   │
│   ├── Main Content Area
│   │   │
│   │   ├── HomePage
│   │   │   ├── Hero Section
│   │   │   ├── Features Grid
│   │   │   ├── How It Works
│   │   │   └── CTA Section
│   │   │
│   │   ├── DashboardPage
│   │   │   ├── Stats Cards
│   │   │   ├── Survey List
│   │   │   └── Actions (View, Delete)
│   │   │
│   │   ├── UploadPage
│   │   │   ├── Mode Toggle (File/Manual)
│   │   │   ├── File Upload (Dropzone)
│   │   │   ├── Manual Entry Form
│   │   │   └── Info Section
│   │   │
│   │   └── SurveyDetailPage
│   │       ├── Header + Actions
│   │       ├── Survey Info Card
│   │       ├── Analysis Controls
│   │       ├── AnalysisResults Component
│   │       │   ├── Summary Section
│   │       │   ├── Key Findings
│   │       │   ├── Sentiment Analysis
│   │       │   │   ├── Overall Sentiment
│   │       │   │   └── Pie Chart
│   │       │   ├── Topic Detection
│   │       │   │   ├── Bar Chart
│   │       │   │   └── Topics List
│   │       │   └── Open Problems
│   │       └── Sample Responses
│   │
│   └── Footer
│
└── UI Components (Reusable)
    ├── Card (Header, Content, Footer)
    ├── Button (variants, sizes)
    ├── Input (text, file)
    ├── Badge (status indicators)
    ├── Progress (loading bars)
    └── Charts (Recharts)
```

## Data Flow Diagram

```
┌──────────────┐
│     USER     │
└──────┬───────┘
       │
       │ 1. Upload Survey
       ▼
┌──────────────────────┐
│   Upload Page        │
│  (File/Manual Entry) │
└──────┬───────────────┘
       │
       │ 2. POST /api/v1/surveys/upload
       ▼
┌──────────────────────┐
│  Backend API         │
│  • Validate Data     │
│  • Preprocess Text   │
│  • Clean & Normalize │
└──────┬───────────────┘
       │
       │ 3. Insert Document
       ▼
┌──────────────────────┐
│  MongoDB             │
│  surveys collection  │
└──────┬───────────────┘
       │
       │ 4. Return Survey ID
       ▼
┌──────────────────────┐
│  Dashboard Page      │
│  Display Survey      │
└──────┬───────────────┘
       │
       │ 5. User Clicks "Analyze"
       ▼
┌──────────────────────┐
│  Survey Detail Page  │
│  POST /analyze       │
└──────┬───────────────┘
       │
       │ 6. Background Task Started
       ▼
┌──────────────────────┐
│  LLM Service         │
│  • Format Prompts    │
│  • Call OpenAI API   │
│  • Parse Responses   │
└──────┬───────────────┘
       │
       │ 7. OpenAI API Calls
       ▼
┌──────────────────────┐
│  OpenAI GPT          │
│  • Summarization     │
│  • Sentiment         │
│  • Topics            │
│  • Problems          │
└──────┬───────────────┘
       │
       │ 8. Return Results
       ▼
┌──────────────────────┐
│  Backend             │
│  • Process Results   │
│  • Store in DB       │
│  • Update Status     │
└──────┬───────────────┘
       │
       │ 9. Save Analysis
       ▼
┌──────────────────────┐
│  MongoDB             │
│  analyses collection │
└──────┬───────────────┘
       │
       │ 10. Frontend Polls Status
       ▼
┌──────────────────────┐
│  GET /results        │
└──────┬───────────────┘
       │
       │ 11. Fetch & Display
       ▼
┌──────────────────────┐
│  AnalysisResults     │
│  • Summary           │
│  • Charts            │
│  • Visualizations    │
└──────────────────────┘
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  React 18  │  Vite  │  Tailwind CSS  │  Radix UI           │
│  React Router  │  Axios  │  Recharts  │  React Hot Toast   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JSON)
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      APPLICATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  FastAPI  │  Pydantic  │  Python 3.9+  │  Uvicorn          │
│  Motor (Async MongoDB)  │  OpenAI SDK  │  NLTK  │ TextBlob │
└─────────────────────────────────────────────────────────────┘
                         │                  │
                         │                  │
         ┌───────────────┴──────┐    ┌─────▼──────────┐
         │                      │    │                │
┌────────▼──────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  DATA LAYER       │  │  AI LAYER       │  │  EXTERNAL API   │
├───────────────────┤  ├─────────────────┤  ├─────────────────┤
│  MongoDB 6.0+     │  │  OpenAI GPT     │  │  Authentication │
│  • surveys        │  │  • GPT-3.5      │  │  (Future)       │
│  • analyses       │  │  • GPT-4        │  │                 │
│  • indexes        │  │  Prompt Engine  │  │                 │
└───────────────────┘  └─────────────────┘  └─────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         PRODUCTION                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Vercel CDN     │         │   Render.com     │
│  (Frontend)      │◄────────┤   (Backend API)  │
│                  │  HTTPS  │                  │
│  • React Build   │         │  • FastAPI       │
│  • Static Assets │         │  • Python        │
│  • Edge Caching  │         │  • Auto-scaling  │
└──────────────────┘         └────────┬─────────┘
                                      │
                                      │ Secure Connection
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
           ┌────────▼────────┐               ┌─────────▼────────┐
           │  MongoDB Atlas  │               │   OpenAI API     │
           │  (Database)     │               │   (LLM Service)  │
           │                 │               │                  │
           │  • Cloud Hosted │               │  • API Gateway   │
           │  • Auto Backup  │               │  • Rate Limits   │
           │  • Replicas     │               │  • Token Usage   │
           └─────────────────┘               └──────────────────┘
```

---

These diagrams provide a comprehensive visual understanding of the system architecture!
