# Setup Guide - LLM Survey Analysis System

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (3.9 or higher) - [Download](https://www.python.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## Installation Steps

### 1. Clone or Navigate to Project

```bash
cd "/Users/admin/Projects/Personal/Final year project"
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or using virtual environment (recommended):

```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=survey_analysis
SECRET_KEY=your-secret-key-here
DEBUG=True
```

⚠️ **Important**: Replace `sk-your-actual-openai-api-key-here` with your real OpenAI API key!

### 3. Frontend Setup

#### Install Node Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Frontend Environment

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
```

Content should be:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### 5. Running the Application

#### Option 1: Run Both Together (from root directory)

```bash
# From project root
npm install  # Install concurrently
npm run dev
```

This will start both frontend (port 5173) and backend (port 8000) simultaneously.

#### Option 2: Run Separately

**Terminal 1 - Backend:**

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative API Docs**: http://localhost:8000/redoc

## Verification

### Test Backend Health

```bash
curl http://localhost:8000/api/v1/health
```

Should return:

```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "service": "LLM Survey Analysis API"
}
```

### Test Frontend

Open http://localhost:5173 in your browser. You should see the landing page.

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution**: Ensure MongoDB is running:

```bash
# Check if MongoDB is running
# macOS/Linux:
ps aux | grep mongod

# Or try starting it:
mongod --dbpath /path/to/data/directory
```

### Issue: OpenAI API Errors

**Solution**:

- Verify your API key is correct
- Check you have credits in your OpenAI account
- Ensure no spaces or quotes around the key in `.env`

### Issue: Port Already in Use

**Solution**: Kill the process or change the port:

```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in backend:
uvicorn main:app --reload --port 8001
```

### Issue: Module Not Found Errors

**Solution**: Reinstall dependencies:

```bash
# Backend
cd backend
pip install -r requirements.txt --force-reinstall

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:

- Frontend: Vite automatically reloads on file changes
- Backend: uvicorn `--reload` flag enables auto-restart

### Testing API Endpoints

Use the Swagger UI at http://localhost:8000/docs to test API endpoints interactively.

### Viewing Database

Use MongoDB Compass (GUI) or mongo shell:

```bash
mongo
use survey_analysis
db.surveys.find()
db.analyses.find()
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Need Help?

- Check the main [README.md](./README.md)
- Review error logs in the terminal
- Ensure all environment variables are set correctly

---

**Next Steps**: Once running, visit http://localhost:5173 and upload your first survey!
