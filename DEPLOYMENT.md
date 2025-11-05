# Deployment Guide

## Deploying to Production

This guide covers deploying the LLM Survey Analysis System to production environments.

## Prerequisites

- Git repository (GitHub, GitLab, etc.)
- OpenAI API key
- MongoDB Atlas account (for cloud database)
- Deployment accounts:
  - **Frontend**: Vercel, Netlify, or similar
  - **Backend**: Render, Railway, or similar

## Environment Configuration

### Production Environment Variables

#### Backend (.env)

```env
DEBUG=False
ENVIRONMENT=production
OPENAI_API_KEY=your_production_api_key
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_NAME=survey_analysis_prod
SECRET_KEY=very-secure-random-key-here
ALLOWED_ORIGINS=["https://your-frontend-domain.com"]
```

#### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-api.com
```

## Backend Deployment (Render)

### 1. Prepare for Deployment

Create `render.yaml` in the backend directory:

```yaml
services:
  - type: web
    name: llm-survey-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
      - key: OPENAI_API_KEY
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: SECRET_KEY
        generateValue: true
```

### 2. Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: llm-survey-backend
   - **Root Directory**: backend
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Click "Create Web Service"

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment

Create `vercel.json` in the frontend directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Deploy to Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Or via Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
5. Add environment variable: `VITE_API_URL`
6. Click "Deploy"

## Database Setup (MongoDB Atlas)

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Choose a region close to your backend
4. Wait for cluster to be created

### 2. Configure Access

1. **Database Access**: Create a database user
2. **Network Access**: Add `0.0.0.0/0` (for development) or your backend IP
3. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### 3. Update Backend Environment

Add the connection string to your backend environment variables.

## Alternative Deployment Options

### Backend Alternatives

#### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Heroku

```bash
heroku create llm-survey-backend
git push heroku main
heroku config:set OPENAI_API_KEY=your_key
```

### Frontend Alternatives

#### Netlify

```bash
cd frontend
npm run build
npx netlify-cli deploy --prod --dir=dist
```

#### GitHub Pages (Static only)

Not recommended for this app due to API requirements.

## Post-Deployment Steps

### 1. Update CORS Settings

Update backend `ALLOWED_ORIGINS` with your frontend URL:

```python
ALLOWED_ORIGINS = [
    "https://your-app.vercel.app",
    "https://www.yourdomain.com"
]
```

### 2. Test Deployment

1. Visit your frontend URL
2. Upload a test survey
3. Run analysis
4. Check API logs for errors

### 3. Monitor Performance

- Set up error tracking (Sentry, LogRocket)
- Monitor API usage (OpenAI dashboard)
- Check database metrics (MongoDB Atlas)

## Security Checklist

- [ ] All API keys stored in environment variables
- [ ] DEBUG mode disabled in production
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Database has authentication enabled
- [ ] Strong SECRET_KEY set
- [ ] Rate limiting configured (if needed)

## Cost Optimization

### OpenAI API

- Use `gpt-3.5-turbo` instead of `gpt-4` for lower costs
- Implement response caching
- Set token limits

### Database

- Use MongoDB Atlas free tier (512MB)
- Create indexes for frequently queried fields
- Implement data retention policies

### Hosting

- Use free tiers:
  - Render: 750 hours/month free
  - Vercel: Unlimited free deployments
  - MongoDB Atlas: 512MB free

## Troubleshooting

### Issue: CORS Errors

**Solution**: Add frontend URL to `ALLOWED_ORIGINS` in backend config

### Issue: Database Connection Timeout

**Solution**: Check MongoDB Atlas network access settings

### Issue: Build Failures

**Solution**: Check Node/Python versions match local development

## Monitoring & Maintenance

### Health Checks

Set up automated health checks:

```bash
curl https://your-backend.com/api/v1/health
```

### Logs

- **Render**: View logs in dashboard
- **Vercel**: Check function logs
- **MongoDB**: Enable Atlas monitoring

### Updates

```bash
# Update dependencies
cd backend && pip install --upgrade -r requirements.txt
cd frontend && npm update
```

## Backup Strategy

### Database Backups

MongoDB Atlas provides automated backups. For manual backups:

```bash
mongodump --uri="your_connection_string"
```

### Code Backups

Ensure code is version controlled in Git with regular commits.

---

**Production Ready!** 🚀

Your LLM Survey Analysis System is now deployed and ready for use.
