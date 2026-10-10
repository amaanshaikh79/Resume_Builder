# Getting Started with AI Resume Builder

Welcome! This guide will help you start using your AI Resume Builder immediately.

---

## 🚀 Quick Start (5 Minutes)

### 1. Backend is Already Running!

Your backend server is currently running at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs

### 2. Test the API (Choose One Method)

#### Option A: Use the Interactive Documentation
1. Open http://localhost:8000/docs in your browser
2. Try the `/api/health` endpoint - click "Try it out" then "Execute"
3. You'll see the system status

#### Option B: Use PowerShell
```powershell
# Test health check
Invoke-WebRequest -Uri http://localhost:8000/api/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Option C: Use Python Test Script
```powershell
cd backend
.\venv\Scripts\Activate.ps1
py test_api.py
```

---

## 📚 Complete Workflow Example

### Step 1: Register a User
```powershell
$body = @{
    name = "Jane Developer"
    email = "jane@example.com"
    password = "secure123456"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:8000/api/auth/register `
    -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

$token = ($response.Content | ConvertFrom-Json).access_token
Write-Host "Token: $token"
```

### Step 2: Create a Resume
```powershell
$body = @{
    title = "My Software Engineer Resume"
    template = "modern"
    resume_data = @{
        personal = @{
            fullName = "Jane Developer"
            email = "jane@example.com"
            phone = "555-0123"
            location = "San Francisco, CA"
        }
        summary = "Experienced software engineer with 5 years building scalable applications"
        experience = @(
            @{
                jobTitle = "Senior Software Engineer"
                company = "Tech Corp"
                startDate = "2020-01"
                endDate = "2025-01"
                bulletPoints = @(
                    "Led development of microservices architecture serving 1M+ users"
                    "Improved system performance by 60% through optimization"
                    "Mentored team of 4 junior developers"
                )
            }
        )
        education = @(
            @{
                degree = "BS Computer Science"
                institution = "University of California"
                endYear = "2019"
            }
        )
        skills = @(
            @{ name = "Python"; level = "expert" }
            @{ name = "React"; level = "advanced" }
            @{ name = "AWS"; level = "advanced" }
        )
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri http://localhost:8000/api/resumes `
    -Method POST -Body $body -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} -UseBasicParsing

$resume = $response.Content | ConvertFrom-Json
Write-Host "Resume ID: $($resume.id)"
```

### Step 3: Get ML Category Prediction
```powershell
$body = @{
    resume_text = "Experienced Software Engineer with 7+ years in full-stack development. Expertise in Python, JavaScript, React, Node.js, AWS, and Docker. Led development of scalable microservices."
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:8000/api/ml/predict-category `
    -Method POST -Body $body -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} -UseBasicParsing

$prediction = $response.Content | ConvertFrom-Json
Write-Host "Predicted Category: $($prediction.predicted_category)"
Write-Host "Confidence: $([math]::Round($prediction.confidence * 100, 2))%"
```

### Step 4: Analyze Resume for ATS
```powershell
$body = @{
    resumeData = @{
        personal = @{
            fullName = "Jane Developer"
            email = "jane@example.com"
            phone = "555-0123"
        }
        summary = "Experienced software engineer"
        experience = @(
            @{
                jobTitle = "Senior Engineer"
                company = "Tech Corp"
                startDate = "2020"
                endDate = "2025"
                bulletPoints = @("Led team", "Improved performance")
            }
        )
        skills = @(
            @{ name = "Python" }
            @{ name = "React" }
        )
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri http://localhost:8000/api/ats/analyze `
    -Method POST -Body $body -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} -UseBasicParsing

$ats = $response.Content | ConvertFrom-Json
Write-Host "ATS Score: $($ats.overallScore)/100"
Write-Host "Strengths: $($ats.strengths -join ', ')"
```

---

## 🤖 Enable AI Features

AI features are ready but need an API key to work.

### Option 1: Google Gemini (Free Tier Available)
1. Get API key from https://makersuite.google.com/app/apikey
2. Edit `backend/.env`:
```env
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key-here
AI_MODEL=gemini-1.5-flash
```
3. Restart backend

### Option 2: OpenAI
1. Get API key from https://platform.openai.com/api-keys
2. Edit `backend/.env`:
```env
AI_PROVIDER=openai
AI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
```
3. Restart backend

### Test AI Features
```powershell
# Generate Professional Summary
$body = @{
    jobTitle = "Software Engineer"
    experienceLevel = "senior"
    skills = @("Python", "React", "AWS")
    tone = "professional"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/api/ai/summary `
    -Method POST -Body $body -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} -UseBasicParsing
```

---

## 📖 Using the Interactive API Docs

The best way to explore the API is through the interactive documentation:

1. Open http://localhost:8000/docs
2. Click on any endpoint to expand it
3. Click "Try it out"
4. Fill in the parameters
5. Click "Execute"
6. See the response

### Endpoints to Try:
- `GET /api/health` - No auth required
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get token
- `GET /api/resumes` - List resumes (needs auth)
- `POST /api/ml/predict-category` - ML prediction (needs auth)
- `POST /api/ats/analyze` - ATS analysis (needs auth)

---

## 🔧 Common Tasks

### Start Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Stop Backend
Press `Ctrl+C` in the terminal running the server

### Run Tests
```powershell
cd backend
.\venv\Scripts\Activate.ps1
py test_api.py
```

### Retrain ML Model
```powershell
cd backend
.\venv\Scripts\Activate.ps1
py -m app.ml.train
```

### View Database
```powershell
cd backend
sqlite3 ai_resume_builder.db
.tables
.schema users
SELECT * FROM users;
.quit
```

---

## 🎯 Real-World Use Cases

### Use Case 1: Resume Category Detection
**Scenario**: You have a resume and want to know which job category it belongs to.

**Solution**: Use `/api/ml/predict-category`

**Result**: Get category with confidence score (e.g., "INFORMATION-TECHNOLOGY" with 85% confidence)

### Use Case 2: Resume Optimization
**Scenario**: You want to improve your resume's ATS score.

**Solution**: 
1. Submit resume to `/api/ats/analyze`
2. Get detailed feedback and suggestions
3. Update resume based on suggestions
4. Re-analyze to see improvement

### Use Case 3: Job Application
**Scenario**: Applying for a specific job and want to tailor your resume.

**Steps**:
1. Analyze job description with `/api/ats/analyze-job`
2. See matched/missing skills
3. Get AI suggestions for improvements
4. Use `/api/ai/improve-experience` to enhance descriptions
5. Generate custom cover letter with `/api/ai/cover-letter`

---

## 📊 Understanding the Responses

### ML Prediction Response
```json
{
  "predicted_category": "ENGINEERING",
  "confidence": 0.65,
  "top_predictions": [
    {"category": "ENGINEERING", "confidence": 0.65},
    {"category": "INFORMATION-TECHNOLOGY", "confidence": 0.15},
    {"category": "CONSULTANT", "confidence": 0.08}
  ]
}
```
- **predicted_category**: Most likely job category
- **confidence**: How certain the model is (0-1)
- **top_predictions**: Top 5 categories with scores

### ATS Analysis Response
```json
{
  "overallScore": 82.5,
  "keywordsScore": 85.0,
  "skillsScore": 90.0,
  "formattingScore": 80.0,
  "experienceScore": 78.0,
  "readabilityScore": 85.0,
  "strengths": ["Strong technical skills", "Clear structure"],
  "weaknesses": ["Limited education details"],
  "suggestions": ["Add more certifications", "Include metrics"]
}
```
- **Scores**: 0-100 scale (higher is better)
- **80+**: Excellent
- **60-79**: Good
- **Below 60**: Needs improvement

---

## 🐛 Troubleshooting

### Backend Won't Start
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Use different port
uvicorn app.main:app --reload --port 8001
```

### ML Model Not Found
```powershell
# Retrain the model
cd backend
.\venv\Scripts\Activate.ps1
py -m app.ml.train
```

### Database Errors
```powershell
# Delete and recreate database
cd backend
Remove-Item ai_resume_builder.db
# Restart backend (it will recreate the database)
```

### AI Features Not Working
- Check that `AI_API_KEY` is set in `.env`
- Verify API key is valid
- Check `AI_PROVIDER` matches your key type

---

## 🎓 Next Steps

### For Developers
1. Explore the code in `backend/app/`
2. Read the API schemas in `backend/app/schemas/`
3. Check ML pipeline in `backend/app/ml/`
4. Review AI prompts in `backend/app/ai/prompts.py`

### For Users
1. Try all endpoints in interactive docs
2. Create test resumes
3. Experiment with AI features
4. Compare ATS scores

### For Frontend Developers
1. Review `frontend/` structure
2. Check `package.json` for dependencies
3. Read API schemas for data structures
4. Start implementing pages

---

## 📝 Key Files Reference

### Configuration
- `backend/.env` - Environment variables
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies

### Documentation
- `README.md` - Complete project documentation
- `PROJECT_SUMMARY.md` - Implementation details
- `GETTING_STARTED.md` - This file

### Code
- `backend/app/main.py` - FastAPI application
- `backend/app/api/` - API endpoints
- `backend/app/ml/train.py` - ML training
- `backend/test_api.py` - Test suite

### Data
- `Resume.csv`, `Resume.zip`, and `backend/data/Resume.csv` are local-only and are not tracked in Git to avoid publishing raw resume records.
- Place a suitable, approved dataset at `backend/data/Resume.csv` before training.
- `backend/models/trained/` - ML model artifacts

---

## 🎉 You're All Set!

Your AI Resume Builder backend is fully operational with:
✅ User authentication
✅ Resume management
✅ ML-powered categorization
✅ ATS analysis
✅ AI-ready infrastructure

**Start Building!**
Open http://localhost:8000/docs and explore the API.

---

## 💡 Pro Tips

1. **Use Interactive Docs**: Fastest way to test endpoints
2. **Save Your Token**: Store JWT token for multiple requests
3. **Check Health Endpoint**: Monitor system status
4. **Read Error Messages**: API returns detailed error information
5. **Use Test Script**: `test_api.py` demonstrates all features
6. **Enable AI Features**: Add API key for full experience
7. **Monitor Logs**: Watch terminal for request/response details
8. **Experiment Safely**: SQLite database can be easily reset

---

**Need Help?**
- Check `README.md` for detailed documentation
- Review `PROJECT_SUMMARY.md` for technical details
- Explore API docs at http://localhost:8000/docs
- Run test suite: `py test_api.py`

**Happy Building! 🚀**
