# 📦 SurveyPulse Deployment Package

**Everything you need to deploy SurveyPulse to Render**

---

## 📚 Documentation Files

### 🚀 Quick Start (Recommended for First-Time Deployers)

**[QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md)**

- 15-minute deployment guide
- Minimal steps, maximum results
- Perfect for getting started fast

### 📖 Complete Guide (Detailed Instructions)

**[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)**

- Comprehensive step-by-step instructions
- Troubleshooting section
- Performance optimization tips
- Security best practices

### ✅ Deployment Checklist

**[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**

- Interactive checklist format
- Track your progress
- Don't miss any steps
- Includes verification tests

---

## 🛠️ Configuration Files

### `render.yaml`

Blueprint for one-click deployment on Render. Automatically configures both frontend and backend services.

### `frontend/.env.production`

Production environment variables for the React frontend.

### `deploy-setup.sh`

Automated setup script that:

- Initializes git repository
- Generates SECRET_KEY
- Checks required files
- Pushes to GitHub (optional)

**Usage:**

```bash
./deploy-setup.sh
```

---

## 🎯 Choose Your Deployment Path

### Path 1: Blueprint Deployment (Easiest) ⚡️

**Time: 15 minutes**

1. Run setup script: `./deploy-setup.sh`
2. Push to GitHub
3. Go to Render → New → Blueprint
4. Select your repo
5. Add 3 environment variables
6. Deploy!

**Follow:** [QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md)

---

### Path 2: Manual Deployment (More Control) 🎛️

**Time: 30 minutes**

1. Deploy backend service manually
2. Deploy frontend service manually
3. Configure CORS
4. Test thoroughly

**Follow:** [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)

---

### Path 3: Checklist-Guided (Comprehensive) ✅

**Time: 35 minutes**

1. Use interactive checklist
2. Track each step
3. Verify everything works
4. Complete post-deployment tests

**Follow:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 📋 Required Accounts

Before you start, sign up for these free services:

1. **Render** - https://render.com (Hosting)
2. **MongoDB Atlas** - https://mongodb.com/cloud/atlas (Database)
3. **GitHub** - https://github.com (Code repository)
4. **OpenAI** - https://openai.com (API for analysis)

---

## 🔑 Environment Variables You'll Need

### Backend (3 required):

```env
MONGODB_URI=mongodb+srv://...           # From MongoDB Atlas
OPENAI_API_KEY=sk-...                   # From OpenAI
SECRET_KEY=<generated>                   # From deploy-setup.sh
```

### Frontend (1 required):

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     End Users                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTPS
                      │
         ┌────────────▼──────────────┐
         │   Render Static Site      │
         │  (React + Vite Frontend)  │
         │ surveypulse-frontend      │
         └────────────┬──────────────┘
                      │
                      │ API Calls
                      │
         ┌────────────▼──────────────┐
         │   Render Web Service      │
         │  (FastAPI Backend)        │
         │ surveypulse-backend       │
         └───┬──────────────────┬────┘
             │                  │
             │                  │
    ┌────────▼────────┐  ┌─────▼──────┐
    │  MongoDB Atlas  │  │  OpenAI    │
    │   (Database)    │  │    API     │
    └─────────────────┘  └────────────┘
```

---

## 🚀 Quick Commands Reference

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Run deployment setup
./deploy-setup.sh

# Test MongoDB connection
mongosh "mongodb+srv://..."

# Check backend health
curl https://surveypulse-backend.onrender.com/api/v1/health

# View backend logs (if you have Render CLI)
render logs -s surveypulse-backend

# Push updates to trigger redeploy
git add .
git commit -m "Update feature"
git push origin main
```

---

## 📈 Deployment Timeline

| Phase         | Duration    | Description                    |
| ------------- | ----------- | ------------------------------ |
| Setup         | 5 min       | MongoDB, GitHub, prepare files |
| Backend       | 10 min      | Deploy FastAPI service         |
| Frontend      | 5 min       | Deploy React static site       |
| Configuration | 5 min       | CORS, env vars                 |
| Testing       | 10 min      | Verify everything works        |
| **Total**     | **~35 min** | Complete deployment            |

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ Backend health check returns `{"status":"healthy"}`
- ✅ Frontend loads without console errors
- ✅ Can upload a survey file
- ✅ Analysis completes successfully
- ✅ Can view results and download PDF
- ✅ MongoDB shows data in collections

---

## 🐛 Common Issues & Quick Fixes

| Issue                          | Quick Fix                                               |
| ------------------------------ | ------------------------------------------------------- |
| **CORS error**                 | Update `ALLOWED_ORIGINS` in backend env vars            |
| **Database connection failed** | Check `MONGODB_URI` string, verify IP allowlist         |
| **API timeout**                | Cold start after 15min idle (free tier)                 |
| **Build failed**               | Check logs, verify `requirements.txt` or `package.json` |
| **502 Bad Gateway**            | Backend still deploying, wait 2-3 min                   |
| **Blank frontend**             | Check `VITE_API_BASE_URL`, inspect browser console      |

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)

- **Render**: Free (750 hours/month, cold starts)
- **MongoDB Atlas**: Free M0 (512MB storage)
- **Total**: **$0/month**

⚠️ **Limitation**: Services sleep after 15 min inactivity (30-60s cold start)

### Production Tier (Recommended for Live Use)

- **Render Starter**: $7/month (no cold starts)
- **MongoDB M10**: $0 (M0 sufficient for most use cases)
- **Total**: **$7/month**

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong `SECRET_KEY` (32+ characters)
- [ ] Mark all sensitive env vars as "SECRET" in Render
- [ ] Restrict CORS to specific domains in production
- [ ] Use MongoDB IP allowlist (not 0.0.0.0/0 in production)
- [ ] Rotate API keys periodically
- [ ] Enable 2FA on all accounts

---

## 📞 Get Help

### Documentation

- 📘 **Quick Start**: [QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md)
- 📗 **Full Guide**: [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)
- 📋 **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

### External Resources

- 🌐 **Render Docs**: https://render.com/docs
- 🍃 **MongoDB Docs**: https://docs.atlas.mongodb.com
- ⚡ **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment
- ⚙️ **Vite Production**: https://vitejs.dev/guide/build.html

---

## 🎉 Ready to Deploy?

Pick your path and follow the guide:

1. **Fast & Easy**: [QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md) ⚡️
2. **Detailed**: [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) 📖
3. **Methodical**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) ✅

**Good luck with your deployment! 🚀**

---

**Package Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Platform**: SurveyPulse - AI-Powered Survey Analysis
