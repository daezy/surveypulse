# 🎯 SurveyPulse Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

---

## ☐ Pre-Deployment Preparation

### MongoDB Atlas Setup

- [ ] Create MongoDB Atlas account
- [ ] Create M0 Free Cluster
- [ ] Create database user (save credentials!)
  - Username: `_________________`
  - Password: `_________________`
- [ ] Configure Network Access (0.0.0.0/0)
- [ ] Get connection string
- [ ] Test connection string locally

**MongoDB Connection String:**

```
mongodb+srv://_____:_____@cluster0.xxxxx.mongodb.net/survey_analysis?retryWrites=true&w=majority
```

### OpenAI Setup

- [ ] Have OpenAI API key ready
- [ ] Verify API key has credits
- [ ] Test API key locally

**OpenAI API Key:**

```
sk-proj-________________________________________________
```

### GitHub Setup

- [ ] Create GitHub repository
- [ ] Repository is public or Render has access
- [ ] Push all code to `main` branch

**GitHub Repository URL:**

```
https://github.com/___________/___________
```

### Local Testing

- [ ] Backend runs locally (`uvicorn main:app`)
- [ ] Frontend runs locally (`npm run dev`)
- [ ] Frontend can connect to backend
- [ ] Upload survey works
- [ ] Analysis completes successfully
- [ ] No console errors

---

## ☐ Deployment Files Ready

- [ ] `render.yaml` exists at project root
- [ ] `backend/requirements.txt` has all dependencies
- [ ] `frontend/package.json` has build scripts
- [ ] `frontend/.env.production` created
- [ ] `.gitignore` includes `.env` files
- [ ] No sensitive data in git

---

## ☐ Backend Deployment

### Create Web Service

- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select repository: `_________________`
- [ ] Configure service:
  - Name: `surveypulse-backend`
  - Region: `Oregon (US West)`
  - Branch: `main`
  - Root Directory: `backend`
  - Runtime: `Python 3`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Add Environment Variables

- [ ] `PYTHON_VERSION` = `3.11.0`
- [ ] `MONGODB_URI` = `mongodb+srv://...` (SECRET)
- [ ] `OPENAI_API_KEY` = `sk-...` (SECRET)
- [ ] `SECRET_KEY` = `<generated>` (SECRET)
- [ ] `DEBUG` = `false`
- [ ] `DATABASE_NAME` = `survey_analysis`
- [ ] `ALLOWED_ORIGINS` = `https://surveypulse-frontend.onrender.com`

**Generated SECRET_KEY:**

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Result: `_________________________________________________`

### Configure & Deploy

- [ ] Health Check Path: `/api/v1/health`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Check logs for errors
- [ ] Test health endpoint

**Backend URL:**

```
https://surveypulse-backend.onrender.com
```

**Health Check:**

```
https://surveypulse-backend.onrender.com/api/v1/health
```

Expected: `{"status":"healthy","database":"connected",...}`

---

## ☐ Frontend Deployment

### Create Static Site

- [ ] Click "New +" → "Static Site"
- [ ] Connect GitHub repository
- [ ] Select repository: `_________________`
- [ ] Configure site:
  - Name: `surveypulse-frontend`
  - Region: `Oregon (US West)`
  - Branch: `main`
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

### Add Environment Variables

- [ ] `VITE_API_BASE_URL` = `https://surveypulse-backend.onrender.com/api/v1`

### Configure & Deploy

- [ ] Click "Create Static Site"
- [ ] Wait for deployment (3-5 min)
- [ ] Check build logs
- [ ] Visit frontend URL

**Frontend URL:**

```
https://surveypulse-frontend.onrender.com
```

---

## ☐ Post-Deployment Configuration

### Update CORS

- [ ] Go to Backend service → Environment
- [ ] Update `ALLOWED_ORIGINS` with actual frontend URL:
  ```
  https://surveypulse-frontend.onrender.com,https://*.onrender.com
  ```
- [ ] Save (auto-redeploys)

### Update Frontend API URL

- [ ] Go to Frontend service → Environment
- [ ] Verify `VITE_API_BASE_URL` points to backend:
  ```
  https://surveypulse-backend.onrender.com/api/v1
  ```
- [ ] Save (auto-redeploys if needed)

---

## ☐ Testing & Verification

### Backend Testing

- [ ] Health endpoint returns 200 OK
- [ ] Database connection successful
- [ ] Can list surveys (empty array OK)
- [ ] No errors in logs

### Frontend Testing

- [ ] Homepage loads correctly
- [ ] Dashboard loads
- [ ] Upload page accessible
- [ ] No console errors
- [ ] Can connect to backend

### End-to-End Testing

- [ ] Upload test survey file
- [ ] Survey appears in dashboard
- [ ] Start analysis
- [ ] Analysis completes successfully
- [ ] View results
- [ ] Download PDF works
- [ ] No errors throughout

**Test Survey File:**

```
Sample data files in: sample-data/
- survey-data.json
- survey-responses.csv
```

---

## ☐ Monitoring Setup

### Render Dashboard

- [ ] Bookmark backend dashboard
- [ ] Bookmark frontend dashboard
- [ ] Set up deploy notifications (Settings → Notifications)
- [ ] Check metrics regularly

### MongoDB Atlas

- [ ] Monitor database size
- [ ] Check connection count
- [ ] Review slow queries
- [ ] Set up alerts (optional)

### Error Tracking (Optional)

- [ ] Set up Sentry
- [ ] Add Sentry DSN to backend
- [ ] Test error reporting

---

## ☐ Performance & Optimization

### Backend

- [ ] Review cold start times (free tier)
- [ ] Check response times
- [ ] Monitor database performance
- [ ] Consider upgrading if slow (Starter = $7/month)

### Frontend

- [ ] Test on mobile devices
- [ ] Check page load times
- [ ] Verify all assets load
- [ ] Test dark mode

---

## ☐ Security Review

- [ ] No `.env` files in git
- [ ] All secrets marked as "SECRET" in Render
- [ ] CORS properly configured
- [ ] MongoDB IP allowlist configured
- [ ] HTTPS enabled (automatic on Render)
- [ ] API keys rotated if exposed

---

## ☐ Documentation

- [ ] Update README with deployment info
- [ ] Document environment variables
- [ ] Add architecture diagram
- [ ] Create user guide

---

## ☐ Custom Domain (Optional)

- [ ] Purchase domain
- [ ] Add custom domain in Render
- [ ] Configure DNS records
- [ ] Wait for SSL provisioning
- [ ] Test custom domain

**Custom Domain:**

```
Frontend: app.yourdomain.com → _________________
Backend:  api.yourdomain.com → _________________
```

---

## 🚨 Troubleshooting Reference

| Issue                      | Solution                                   |
| -------------------------- | ------------------------------------------ |
| CORS error                 | Update ALLOWED_ORIGINS in backend env vars |
| Database connection failed | Check MONGODB_URI, verify IP allowlist     |
| Build failed               | Review logs, check dependencies            |
| 502 Bad Gateway            | Backend still deploying or crashed         |
| API timeout                | Cold start (15min idle), upgrade to paid   |
| Frontend blank page        | Check VITE_API_BASE_URL, check console     |

---

## 📊 Deployment Timeline

| Task                | Estimated Time |
| ------------------- | -------------- |
| MongoDB setup       | 5 min          |
| GitHub push         | 2 min          |
| Backend deployment  | 10 min         |
| Frontend deployment | 5 min          |
| CORS update         | 3 min          |
| Testing             | 10 min         |
| **Total**           | **~35 min**    |

---

## ✅ Final Verification

- [ ] Backend URL works: `https://surveypulse-backend.onrender.com`
- [ ] Frontend URL works: `https://surveypulse-frontend.onrender.com`
- [ ] Full user flow works (upload → analyze → results)
- [ ] No errors in Render logs
- [ ] No errors in browser console
- [ ] MongoDB shows data
- [ ] Ready for users! 🎉

---

## 📞 Support Contacts

**Render Support:**

- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Community: https://community.render.com

**MongoDB Support:**

- Atlas: https://cloud.mongodb.com
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

---

**Deployment Date:** `___/___/2025`  
**Deployed By:** `_________________`  
**Version:** `1.0.0`

---

🎉 **Congratulations on deploying SurveyPulse!**

Next steps:

1. Share your app URL with users
2. Monitor logs for first 24-48 hours
3. Gather feedback
4. Plan next features
