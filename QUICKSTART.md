# Quick Start Guide - LLM Survey Analysis System

Welcome! This guide will help you get started quickly.

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Navigate to project
cd "/Users/admin/Projects/Personal/Final year project"

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Step 2: Set Up Environment

**Backend (.env file):**

Create `backend/.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=survey_analysis
SECRET_KEY=change-this-to-a-random-secret-key
DEBUG=True
```

**Frontend (.env.local file):**

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

### Step 3: Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or run manually
mongod --dbpath ~/data/db
```

### Step 4: Run the Application

**Option A - Run Both Together:**

```bash
# From project root
npm install  # Install concurrently
npm run dev
```

**Option B - Run Separately:**

Terminal 1:

```bash
cd backend
python -m uvicorn main:app --reload
```

Terminal 2:

```bash
cd frontend
npm run dev
```

### Step 5: Open the App

Visit: **http://localhost:5173**

---

## 📖 Using the System

### 1. Upload Survey Data

**Option 1 - Upload File:**

- Click "Upload" in navigation
- Drag & drop or select a file (CSV, TXT, or JSON)
- Click "Upload & Analyze"

**Option 2 - Manual Entry:**

- Click "Manual Entry" tab
- Enter survey title
- Paste responses (one per line)
- Click "Submit & Analyze"

### 2. Start Analysis

- View your survey in the dashboard
- Click "View" on the survey
- Click "Start AI Analysis"
- Wait for processing (1-3 minutes)

### 3. View Results

Once complete, you'll see:

- **Summary**: AI-generated overview
- **Key Findings**: Main insights
- **Sentiment Analysis**: Positive/Negative/Neutral breakdown
- **Topics**: Identified themes
- **Open Problems**: Research gaps and challenges

### 4. Export Results

Click "Export Results" to download analysis as JSON.

---

## 📁 Sample Data

Try the sample data in `sample-data/developer-feedback.txt`:

1. Go to Upload page
2. Select "Upload File" mode
3. Upload `developer-feedback.txt`
4. Start analysis

---

## 🔧 Configuration Options

### Adjust LLM Settings

Edit `backend/app/core/config.py`:

```python
OPENAI_MODEL = "gpt-3.5-turbo"  # or "gpt-4"
OPENAI_MAX_TOKENS = 2000
OPENAI_TEMPERATURE = 0.7
```

### Modify Analysis Types

In `backend/app/services/llm_service.py`, customize prompts for:

- Summarization
- Sentiment analysis
- Topic detection
- Problem identification

---

## 📊 Understanding Results

### Sentiment Labels

- **Positive**: Favorable feedback, satisfaction
- **Negative**: Complaints, dissatisfaction
- **Neutral**: Factual statements, mixed feelings

### Topic Frequency

- **High**: Mentioned frequently across responses
- **Medium**: Moderate occurrence
- **Low**: Mentioned occasionally

### Problem Priority

- **High**: Critical issues, frequently mentioned
- **Medium**: Important but less urgent
- **Low**: Minor concerns

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 8000 is in use
lsof -ti:8000 | xargs kill -9

# Verify Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Won't Start

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be v18+
```

### MongoDB Connection Error

```bash
# Verify MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### OpenAI API Error

- Verify API key is correct (no spaces)
- Check OpenAI account has credits
- Try using a different model:
  ```env
  OPENAI_MODEL=gpt-3.5-turbo
  ```

---

## 💡 Tips & Best Practices

### Data Quality

- Ensure responses are meaningful (3+ words)
- Remove duplicates before upload
- Use English language for best results

### Analysis Quality

- Upload 20+ responses for better insights
- Be specific in survey questions
- Include diverse perspectives

### Performance

- Use `gpt-3.5-turbo` for faster/cheaper analysis
- Batch small surveys together
- Monitor token usage in OpenAI dashboard

---

## 🎓 Research Context

This system implements the methodology described in Chapter 3:

1. **Data Collection**: Upload survey responses
2. **Preprocessing**: Automatic cleaning and normalization
3. **LLM Analysis**: AI-powered insights extraction
4. **Visualization**: Charts and summaries
5. **Evaluation**: Accuracy and relevance metrics

### Evaluation Metrics

The system evaluates:

- Processing time
- Response coverage
- Insight relevance
- User satisfaction

---

## 📚 Additional Resources

- **Full Documentation**: See [README.md](./README.md)
- **Setup Guide**: See [SETUP.md](./SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Docs**: http://localhost:8000/docs

---

## 🆘 Getting Help

If you encounter issues:

1. Check the console for errors
2. Review error messages in terminal
3. Verify environment variables are set
4. Ensure all services are running

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend health check returns "healthy"
✅ Frontend loads without errors
✅ You can upload a survey
✅ Analysis completes successfully
✅ Results display with visualizations

---

**Happy Analyzing! 🚀**

Built for Software Engineering Research | Final Year Project 2024
