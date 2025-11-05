# Project Structure

```
Final year project/
│
├── README.md                          # Main project documentation
├── SETUP.md                           # Detailed setup instructions
├── QUICKSTART.md                      # Quick start guide
├── DEPLOYMENT.md                      # Deployment instructions
├── package.json                       # Root package file for monorepo
├── .gitignore                         # Git ignore rules
│
├── backend/                           # FastAPI Backend
│   ├── main.py                        # Application entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment template
│   ├── .env                          # Environment variables (create this)
│   │
│   └── app/
│       ├── __init__.py
│       │
│       ├── core/                      # Core configurations
│       │   ├── __init__.py
│       │   ├── config.py             # App settings & environment variables
│       │   └── database.py           # MongoDB connection setup
│       │
│       ├── models/                    # Data models & schemas
│       │   ├── __init__.py
│       │   └── schemas.py            # Pydantic models for API
│       │
│       ├── services/                  # Business logic
│       │   ├── __init__.py
│       │   ├── preprocessing.py      # Text cleaning & preparation
│       │   └── llm_service.py        # OpenAI LLM integration
│       │
│       └── api/
│           ├── __init__.py
│           └── routes/                # API endpoints
│               ├── __init__.py
│               ├── health.py         # Health check endpoints
│               ├── surveys.py        # Survey CRUD operations
│               └── analysis.py       # Analysis operations
│
├── frontend/                          # React Frontend
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Node dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── .env.example                   # Environment template
│   ├── .env.local                    # Environment variables (create this)
│   │
│   ├── public/                        # Static assets
│   │   └── vite.svg
│   │
│   └── src/
│       ├── main.jsx                   # Application entry point
│       ├── App.jsx                    # Main app component
│       ├── index.css                  # Global styles
│       │
│       ├── lib/
│       │   └── utils.js              # Utility functions
│       │
│       ├── services/
│       │   └── api.js                # API service layer
│       │
│       ├── components/
│       │   ├── Layout.jsx            # Main layout component
│       │   ├── AnalysisResults.jsx   # Results display component
│       │   │
│       │   └── ui/                   # Reusable UI components
│       │       ├── card.jsx
│       │       ├── button.jsx
│       │       ├── input.jsx
│       │       ├── badge.jsx
│       │       └── progress.jsx
│       │
│       └── pages/                     # Main application pages
│           ├── HomePage.jsx          # Landing page
│           ├── DashboardPage.jsx     # Survey list dashboard
│           ├── UploadPage.jsx        # Upload survey page
│           └── SurveyDetailPage.jsx  # Survey detail & analysis
│
└── sample-data/                       # Sample datasets for testing
    └── developer-feedback.txt        # Sample survey responses
```

## Key Components

### Backend Structure

#### Core Module

- **config.py**: Application settings, API keys, database URIs
- **database.py**: MongoDB connection and management

#### Models Module

- **schemas.py**: Pydantic models for data validation
  - SurveyUpload, SurveyDocument
  - AnalysisRequest, AnalysisResult
  - SentimentResult, TopicResult, OpenProblem

#### Services Module

- **preprocessing.py**: Data cleaning and text normalization

  - Text cleaning
  - Duplicate removal
  - Tokenization
  - Keyword extraction

- **llm_service.py**: OpenAI integration
  - Summarization
  - Sentiment analysis
  - Topic detection
  - Open problem extraction

#### API Routes

- **health.py**: System health checks
- **surveys.py**: Survey management (CRUD)
- **analysis.py**: Analysis operations

### Frontend Structure

#### Pages

- **HomePage**: Landing page with features overview
- **DashboardPage**: List all surveys with stats
- **UploadPage**: Upload survey data (file or manual)
- **SurveyDetailPage**: View survey & analysis results

#### Components

- **Layout**: Navigation, header, footer
- **AnalysisResults**: Display analysis with charts
- **UI Components**: Reusable design system components

#### Services

- **api.js**: Axios-based API client for backend communication

#### Utilities

- **utils.js**: Helper functions for formatting, downloads, etc.

## Data Flow

```
User Upload → Frontend → Backend API → Preprocessing → LLM Analysis → MongoDB → Frontend Display
```

### Detailed Flow

1. **Upload**: User uploads survey data
2. **Validation**: Backend validates and cleans data
3. **Storage**: Survey saved to MongoDB
4. **Analysis Request**: User triggers analysis
5. **Background Processing**: LLM analyzes responses
6. **Result Storage**: Analysis results saved to database
7. **Display**: Frontend fetches and visualizes results

## Database Collections

### surveys

```json
{
  "_id": "ObjectId",
  "title": "Survey Title",
  "description": "Description",
  "total_responses": 50,
  "responses": ["response1", "response2", ...],
  "status": "completed",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### analyses

```json
{
  "_id": "ObjectId",
  "survey_id": "survey_id",
  "summary": "Executive summary...",
  "key_findings": ["finding1", "finding2", ...],
  "overall_sentiment": {
    "label": "positive",
    "score": 0.85,
    "confidence": 0.92
  },
  "sentiment_distribution": {
    "positive": 30,
    "negative": 5,
    "neutral": 15
  },
  "topics": [
    {
      "topic": "Performance",
      "keywords": ["speed", "fast", "slow"],
      "frequency": "high",
      "sample_responses": ["..."]
    }
  ],
  "open_problems": [
    {
      "title": "Problem Title",
      "description": "Description",
      "category": "Category",
      "priority": "high",
      "supporting_responses": ["..."]
    }
  ],
  "total_responses_analyzed": 50,
  "processing_time": 45.2,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Technology Stack

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: MongoDB (Motor async driver)
- **LLM**: OpenAI GPT-3.5/4
- **NLP**: NLTK, TextBlob
- **Validation**: Pydantic

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Radix UI
- **Charts**: Recharts
- **Routing**: React Router
- **HTTP**: Axios
- **Notifications**: React Hot Toast

### Development Tools

- **API Documentation**: Swagger/ReDoc (auto-generated)
- **Code Quality**: ESLint, Pylint
- **Version Control**: Git
- **Package Management**: npm, pip

## Environment Variables

### Backend (.env)

```env
DEBUG=True
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=survey_analysis
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Health

- `GET /api/v1/health` - Health check
- `GET /api/v1/status` - System status

### Surveys

- `POST /api/v1/surveys/upload` - Upload survey (JSON)
- `POST /api/v1/surveys/upload-file` - Upload survey file
- `GET /api/v1/surveys/` - List all surveys
- `GET /api/v1/surveys/{id}` - Get survey details
- `DELETE /api/v1/surveys/{id}` - Delete survey

### Analysis

- `POST /api/v1/analysis/analyze` - Start analysis
- `GET /api/v1/analysis/{survey_id}/results` - Get results
- `GET /api/v1/analysis/{survey_id}/status` - Check status
- `DELETE /api/v1/analysis/{id}` - Delete analysis

## Development Workflow

1. **Local Development**

   ```bash
   npm run dev  # Runs both frontend and backend
   ```

2. **Testing**

   - Manual testing via UI
   - API testing via Swagger docs
   - Unit tests (to be added)

3. **Deployment**
   - Backend → Render/Railway
   - Frontend → Vercel/Netlify
   - Database → MongoDB Atlas

## Future Enhancements

- [ ] User authentication system
- [ ] Multiple LLM provider support
- [ ] Fine-tuned models for SE domain
- [ ] Batch processing for large datasets
- [ ] Real-time analysis progress
- [ ] Advanced visualization options
- [ ] Export to PDF reports
- [ ] Collaborative features
- [ ] API rate limiting
- [ ] Comprehensive test suite

---

**Last Updated**: November 2024
