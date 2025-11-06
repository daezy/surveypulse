# 🚀 SurveyPulse Deployment Guide for Render

Complete guide to deploy your SurveyPulse platform (FastAPI + React + MongoDB) on Render.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Render account (free tier available at [render.com](https://render.com))
- [x] MongoDB Atlas account (free tier at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- [x] OpenAI API key

---

## 🗂️ Part 1: Prepare Your Repository

### 1.1 Create Required Configuration Files

#### **Backend: Create `render.yaml`** (Optional - for Blueprint)

Create a file at the root of your project:

```yaml
# /render.yaml
services:
  # Backend API Service
  - type: web
    name: surveypulse-backend
    env: python
    region: oregon
    plan: free
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: MONGODB_URI
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: ALLOWED_ORIGINS
        value: https://surveypulse-frontend.onrender.com
      - key: DEBUG
        value: false

  # Frontend Static Site
  - type: web
    name: surveypulse-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: "cd frontend && npm install && npm run build"
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://surveypulse-backend.onrender.com/api/v1
```

#### **Backend: Create/Update `requirements.txt`**

Ensure it's at `backend/requirements.txt`:

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-dotenv==1.0.1
openai==1.50.0
httpx==0.27.0
httpcore==1.0.5
pymongo==4.9.1
motor==3.6.0
pydantic==2.9.2
pydantic-settings==2.6.0
python-multipart==0.0.6
pandas==2.2.3
numpy==2.1.0
nltk==3.9.1
textblob==0.18.0
scikit-learn==1.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dateutil==2.8.2
aiofiles==23.2.1
reportlab==4.0.9
openpyxl==3.1.2
gunicorn==21.2.0
```

#### **Frontend: Update `.env` Configuration**

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api/v1
```

### 1.2 Update Backend CORS Configuration

Update `backend/app/core/config.py`:

```python
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    # Project
    PROJECT_NAME: str = "SurveyPulse API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False  # Changed to False for production

    # API
    API_V1_STR: str = "/api/v1"

    # CORS - Allow production frontend
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://surveypulse-frontend.onrender.com",  # Add your frontend URL
        "https://*.onrender.com",  # Allow all Render preview deployments
    ]

    # Database - Use environment variable for production
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = "survey_analysis"

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_MAX_TOKENS: int = 4096
    OPENAI_TEMPERATURE: float = 0.7

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # File Upload
    MAX_UPLOAD_SIZE: int = 250 * 1024 * 1024  # 250MB
    ALLOWED_EXTENSIONS: List[str] = [".csv", ".txt", ".json"]

    # Analysis
    MAX_RESPONSES_PER_BATCH: int = 50
    SENTIMENT_THRESHOLD: float = 0.1

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
```

### 1.3 Update Frontend API Configuration

Update `frontend/src/services/api.js`:

```javascript
import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ... rest of your API code
```

### 1.4 Create `.gitignore` (if not exists)

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
.env
.venv

# Node
node_modules/
dist/
.env.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### 1.5 Push to GitHub

```bash
cd "/Users/admin/Projects/Personal/Final year project"
git init
git add .
git commit -m "Initial commit - SurveyPulse platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/surveypulse.git
git push -u origin main
```

---

## 🗄️ Part 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in/Sign up
3. Click **"Build a Database"**
4. Select **"M0 FREE"** tier
5. Choose a cloud provider (AWS) and region (closest to you)
6. Click **"Create Cluster"**

### 2.2 Configure Database Access

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `surveypulse_admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **"Atlas Admin"**
7. Click **"Add User"**

### 2.3 Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict to Render's IP ranges
4. Click **"Confirm"**

### 2.4 Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Python**, Version: **3.12 or later**
5. Copy the connection string:
   ```
   mongodb+srv://surveypulse_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: `survey_analysis`
   ```
   mongodb+srv://surveypulse_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/survey_analysis?retryWrites=true&w=majority
   ```

---

## 🎨 Part 3: Deploy Frontend (Static Site)

### 3.1 Create Frontend Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `surveypulse-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3.2 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

```
VITE_API_BASE_URL=https://surveypulse-backend.onrender.com/api/v1
```

⚠️ **Note**: You'll update this after deploying the backend in the next step.

### 3.3 Deploy

1. Click **"Create Static Site"**
2. Wait for deployment (3-5 minutes)
3. Your frontend URL will be: `https://surveypulse-frontend.onrender.com`
4. **Save this URL** - you'll need it for backend CORS!

---

## ⚙️ Part 4: Deploy Backend (Web Service)

### 4.1 Create Backend Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `surveypulse-backend`
   - **Region**: Same as frontend (e.g., Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4.2 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key               | Value                                       | Secret |
| ----------------- | ------------------------------------------- | ------ |
| `PYTHON_VERSION`  | `3.11.0`                                    | No     |
| `MONGODB_URI`     | `mongodb+srv://...` (from Part 2.4)         | Yes ✓  |
| `OPENAI_API_KEY`  | `sk-...` (your OpenAI key)                  | Yes ✓  |
| `SECRET_KEY`      | Generate random string                      | Yes ✓  |
| `ALLOWED_ORIGINS` | `https://surveypulse-frontend.onrender.com` | No     |
| `DEBUG`           | `false`                                     | No     |
| `DATABASE_NAME`   | `survey_analysis`                           | No     |

**To generate SECRET_KEY**, run in terminal:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4.3 Configure Health Check (Optional)

1. Scroll to **"Health Check Path"**
2. Set to: `/api/v1/health`

### 4.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your backend URL will be: `https://surveypulse-backend.onrender.com`

### 4.5 Test Backend

Visit: `https://surveypulse-backend.onrender.com/api/v1/health`

You should see:

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-06T..."
}
```

---

## 🔗 Part 5: Connect Frontend to Backend

### 5.1 Update Frontend Environment Variable

1. Go to your **Frontend service** on Render
2. Click **"Environment"** tab
3. Update `VITE_API_BASE_URL`:
   ```
   https://surveypulse-backend.onrender.com/api/v1
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy

### 5.2 Update Backend CORS

1. Go to your **Backend service** on Render
2. Click **"Environment"** tab
3. Update `ALLOWED_ORIGINS` to include your actual frontend URL:
   ```
   https://surveypulse-frontend.onrender.com,https://*.onrender.com
   ```
4. Click **"Save Changes"**
5. Backend will redeploy

---

## ✅ Part 6: Verify Deployment

### 6.1 Test the Platform

1. Visit your frontend: `https://surveypulse-frontend.onrender.com`
2. Upload a test survey file
3. Start analysis
4. Check results

### 6.2 Check Logs

**Backend logs:**

1. Go to Render Dashboard → surveypulse-backend
2. Click **"Logs"** tab
3. Monitor for errors

**Frontend logs:**

1. Go to Render Dashboard → surveypulse-frontend
2. Click **"Logs"** tab

### 6.3 Monitor MongoDB

1. Go to MongoDB Atlas Dashboard
2. Click **"Database"** → **"Browse Collections"**
3. Check `survey_analysis` database
4. Verify collections: `surveys`, `analysis_results`

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Symptom**: Frontend can't connect to backend

**Solution**:

1. Check `ALLOWED_ORIGINS` in backend includes frontend URL
2. Ensure no trailing slash in URLs
3. Check browser console for exact error

### Issue: Database Connection Failed

**Symptom**: Backend logs show MongoDB connection error

**Solution**:

1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas Network Access allows 0.0.0.0/0
3. Verify database user credentials
4. Check if IP allowlist needs updating

### Issue: OpenAI API Error

**Symptom**: Analysis fails with API error

**Solution**:

1. Verify `OPENAI_API_KEY` is set correctly
2. Check OpenAI account has credits
3. Check API key permissions

### Issue: Build Failed

**Symptom**: Deployment fails during build

**Solution**:

1. Check `requirements.txt` has all dependencies
2. Verify Python version is 3.11
3. Check `package.json` has correct scripts
4. Review build logs for specific errors

### Issue: Static Files Not Loading

**Symptom**: Frontend shows blank page

**Solution**:

1. Check "Publish Directory" is set to `dist`
2. Verify build command completed successfully
3. Check browser console for 404 errors
4. Ensure `vite.config.js` has correct base path

---

## 🚀 Performance Optimization

### Backend Optimizations

1. **Enable Caching**: Add Redis for session/response caching
2. **Database Indexing**: Add indexes to MongoDB collections
3. **Connection Pooling**: Configure MongoDB connection pool

### Frontend Optimizations

1. **Static Asset Caching**: Render handles this automatically
2. **Code Splitting**: Vite does this by default
3. **CDN**: Render serves from global CDN

---

## 💰 Pricing (Free Tier Limits)

### Render Free Tier:

- ✅ Static Sites: Unlimited
- ✅ Web Services: 750 hours/month
- ⚠️ Services spin down after 15 min inactivity (cold starts)
- ⚠️ First request after inactivity takes 30-60 seconds

### MongoDB Atlas Free Tier (M0):

- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Unlimited connections

### To Avoid Cold Starts (Paid Plan):

Upgrade to Render **Starter** plan ($7/month) for:

- No cold starts
- Always-on service
- More RAM/CPU

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Restrict to specific domains in production
3. **MongoDB**: Use IP allowlist (not 0.0.0.0/0)
4. **HTTPS**: Render provides SSL certificates automatically
5. **API Keys**: Rotate OpenAI key periodically
6. **Rate Limiting**: Add rate limiting to API endpoints

---

## 📊 Monitoring & Logs

### Set Up Monitoring

1. **Render Dashboard**: Check logs and metrics
2. **MongoDB Atlas**: Monitor database performance
3. **Error Tracking**: Consider adding Sentry for error tracking

### Log Retention

- Render keeps logs for 7 days on free tier
- Download important logs regularly
- Consider external log service for production

---

## 🔄 Continuous Deployment

Render automatically redeploys on git push:

```bash
# Make changes locally
git add .
git commit -m "Update feature X"
git push origin main

# Render auto-deploys both services
```

---

## 📝 Custom Domain (Optional)

1. Go to Render service → **Settings**
2. Click **"Custom Domains"**
3. Add your domain: `app.yourdomain.com`
4. Follow DNS instructions
5. Render provisions SSL automatically

---

## ✨ Quick Commands Reference

```bash
# Generate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Test MongoDB connection locally
mongosh "mongodb+srv://..."

# Check backend health
curl https://surveypulse-backend.onrender.com/api/v1/health

# View Render logs (using Render CLI)
render logs -s surveypulse-backend
```

---

## 🎉 You're Done!

Your SurveyPulse platform is now live at:

- 🌐 Frontend: `https://surveypulse-frontend.onrender.com`
- ⚙️ Backend: `https://surveypulse-backend.onrender.com`

**Next Steps:**

1. Test all features thoroughly
2. Monitor logs for first 24-48 hours
3. Set up error tracking (Sentry)
4. Configure custom domain (optional)
5. Upgrade to paid plan if needed (avoid cold starts)

---

## 📞 Support Resources

- Render Docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- FastAPI Deployment: [fastapi.tiangolo.com/deployment](https://fastapi.tiangolo.com/deployment)
- Vite Production: [vitejs.dev/guide/build.html](https://vitejs.dev/guide/build.html)

---

**Created for SurveyPulse - AI-Powered Survey Analysis Platform**  
Last Updated: November 6, 2025
