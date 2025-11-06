#!/bin/bash

# SurveyPulse - Quick Deployment Setup Script
# This script helps prepare your project for Render deployment

echo "🚀 SurveyPulse Deployment Setup"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
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
backend/.env

# Node
node_modules/
dist/
.env.local
.env.production.local
frontend/.env.local

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
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

# Check for required files
echo ""
echo "🔍 Checking required files..."

files_ok=true

if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ backend/requirements.txt not found"
    files_ok=false
else
    echo "✅ backend/requirements.txt exists"
fi

if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json not found"
    files_ok=false
else
    echo "✅ frontend/package.json exists"
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found"
    files_ok=false
else
    echo "✅ render.yaml exists"
fi

if [ "$files_ok" = false ]; then
    echo ""
    echo "⚠️  Some required files are missing. Please create them before deploying."
    exit 1
fi

# Generate a secret key
echo ""
echo "🔐 Generating SECRET_KEY for backend..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)
echo "Generated SECRET_KEY: $SECRET_KEY"
echo "(Save this - you'll need it for Render environment variables)"

# Checklist
echo ""
echo "📋 Pre-Deployment Checklist:"
echo "=============================="
echo ""
echo "[ ] 1. MongoDB Atlas cluster created"
echo "[ ] 2. MongoDB connection string obtained"
echo "[ ] 3. OpenAI API key ready"
echo "[ ] 4. GitHub repository created"
echo "[ ] 5. Render account created"
echo "[ ] 6. SECRET_KEY saved: $SECRET_KEY"
echo ""

# Ask if user wants to commit and push
read -p "Do you want to commit and push to GitHub now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/surveypulse.git): " repo_url
    
    if [ ! -z "$repo_url" ]; then
        echo ""
        echo "📤 Adding all files and committing..."
        git add .
        git commit -m "Initial commit - SurveyPulse platform ready for deployment"
        
        echo "🔗 Adding remote origin..."
        git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
        
        echo "⬆️  Pushing to GitHub..."
        git push -u origin main
        
        echo ""
        echo "✅ Code pushed to GitHub successfully!"
    else
        echo "❌ Repository URL not provided. Skipping push."
    fi
else
    echo ""
    echo "ℹ️  Skipping GitHub push. You can do it manually later with:"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin YOUR_REPO_URL"
    echo "   git push -u origin main"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next Steps:"
echo "1. Go to https://render.com/dashboard"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Add environment variables in Render:"
echo "   - MONGODB_URI"
echo "   - OPENAI_API_KEY"
echo "   - SECRET_KEY: $SECRET_KEY"
echo ""
echo "📚 Full guide: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
