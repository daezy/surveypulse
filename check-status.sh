#!/bin/bash

# System Status Checker for LLM Survey Analysis System
# Run this script to check if everything is working properly

echo "=================================================="
echo "   LLM Survey Analysis System - Status Check     "
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Frontend
echo "🔍 Checking Frontend Server..."
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running at http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running${NC}"
    echo -e "${YELLOW}   Start with: cd frontend && npm run dev${NC}"
fi
echo ""

# Check Backend
echo "🔍 Checking Backend Server..."
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
    
    # Check MongoDB
    echo "🔍 Checking MongoDB Connection..."
    DB_STATUS=$(curl -s http://localhost:8000/api/health/db | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$DB_STATUS" == "connected" ]; then
        echo -e "${GREEN}✅ MongoDB is connected${NC}"
    else
        echo -e "${RED}❌ MongoDB connection failed${NC}"
    fi
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo -e "${YELLOW}   Start with: cd backend && source venv/bin/activate && python -m uvicorn main:app --reload${NC}"
fi
echo ""

# Check OpenAI API Key
echo "🔍 Checking OpenAI Configuration..."
if grep -q "your_openai_api_key_here" backend/.env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  OpenAI API key not configured${NC}"
    echo -e "${YELLOW}   Edit backend/.env and add your API key${NC}"
else
    if grep -q "OPENAI_API_KEY=" backend/.env 2>/dev/null; then
        echo -e "${GREEN}✅ OpenAI API key is configured${NC}"
    else
        echo -e "${RED}❌ .env file not found${NC}"
    fi
fi
echo ""

# Check Dependencies
echo "🔍 Checking Dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend dependencies not installed${NC}"
    echo -e "${YELLOW}   Run: cd frontend && npm install${NC}"
fi

if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✅ Backend virtual environment created${NC}"
else
    echo -e "${RED}❌ Backend virtual environment not found${NC}"
    echo -e "${YELLOW}   Run: cd backend && python3 -m venv venv${NC}"
fi
echo ""

# Summary
echo "=================================================="
echo "                    SUMMARY                       "
echo "=================================================="
echo ""
echo "📱 Frontend:     http://localhost:5173"
echo "🔌 Backend API:  http://localhost:8000"
echo "📚 API Docs:     http://localhost:8000/docs"
echo ""
echo "📝 Next Steps:"
echo "   1. Ensure both servers are running"
echo "   2. Add OpenAI API key to backend/.env"
echo "   3. Upload sample data from sample-data/ folder"
echo "   4. Test AI analysis features"
echo ""
echo "=================================================="
