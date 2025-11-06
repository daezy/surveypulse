# 🚀 Quick Start: Deploy SurveyPulse to Render

**5-minute deployment guide** - For the full detailed guide, see [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)

---

## Step 1: Prepare MongoDB (5 min)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create **FREE M0 cluster**
3. Create database user (save password!)
4. Add IP: **0.0.0.0/0** (allow all)
5. Get connection string:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/survey_analysis
   ```

---

## Step 2: Run Setup Script

```bash
cd "/Users/admin/Projects/Personal/Final year project"
./deploy-setup.sh
```

This will:

- ✅ Initialize git
- ✅ Generate SECRET_KEY
- ✅ Check required files
- ✅ Push to GitHub (optional)

---

## Step 3: Deploy to Render (5 min)

### Option A: One-Click Blueprint Deployment ⚡️

1. Push code to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com)
3. Click **"New +"** → **"Blueprint"**
4. Select your GitHub repo
5. Render will auto-detect `render.yaml`
6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SECRET_KEY`: Generated from setup script
7. Click **"Apply"**

### Option B: Manual Deployment

**Backend:**

1. New + → Web Service
2. Connect GitHub repo
3. Root Directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (same as above)

**Frontend:**

1. New + → Static Site
2. Connect GitHub repo
3. Root Directory: `frontend`
4. Build: `npm install && npm run build`
5. Publish: `dist`
6. Add env var: `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`

---

## Step 4: Update CORS (1 min)

After both are deployed:

1. Copy your frontend URL: `https://surveypulse-frontend.onrender.com`
2. Go to backend service → Environment
3. Update `ALLOWED_ORIGINS`:
   ```
   https://surveypulse-frontend.onrender.com,https://*.onrender.com
   ```
4. Save (auto-redeploys)

---

## ✅ Done!

Visit: `https://surveypulse-frontend.onrender.com`

### Expected URLs:

- **Frontend**: `https://surveypulse-frontend.onrender.com`
- **Backend**: `https://surveypulse-backend.onrender.com`
- **API Health**: `https://surveypulse-backend.onrender.com/api/v1/health`

---

## 🐛 Quick Troubleshooting

| Issue             | Fix                                           |
| ----------------- | --------------------------------------------- |
| CORS error        | Update `ALLOWED_ORIGINS` in backend           |
| Database error    | Check `MONGODB_URI` connection string         |
| API error         | Verify `OPENAI_API_KEY` is valid              |
| Build failed      | Check logs in Render dashboard                |
| Cold start (slow) | First request after 15min is slow (free tier) |

---

## 📊 Environment Variables Needed

### Backend (3 required):

```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
SECRET_KEY=<generated-from-script>
```

### Frontend (1 required):

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

---

## 💡 Pro Tips

- **Logs**: Check Render dashboard → Logs tab for errors
- **Cold starts**: Free tier sleeps after 15 min → upgrade to $7/month to avoid
- **Custom domain**: Render → Settings → Custom Domains
- **Auto-deploy**: Pushes to `main` branch auto-deploy
- **Rollback**: Render → Manual Deploy → Select previous commit

---

## 📞 Need Help?

- Full guide: [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)
- Render docs: [render.com/docs](https://render.com/docs)
- MongoDB docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Total Time: ~15 minutes** ⚡️
