# Complete Setup Guide - AI Resume Builder

This guide will walk you through setting up the AI Resume Builder from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [ML Model Training](#ml-model-training)
4. [ML Enhancement Setup](#ml-enhancement-setup)
5. [Frontend Setup](#frontend-setup)
6. [Testing the Application](#testing-the-application)
7. [Common Issues](#common-issues)

---

## 1. Prerequisites

### Required Software

1. **Python 3.12+**
   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify: `py --version` or `python --version`

2. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Install LTS version
   - Verify: `node --version` and `npm --version`

3. **Git** (optional but recommended)
   - Download from: https://git-scm.com/
   - Verify: `git --version`

4. **Code Editor** (recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any editor of your choice

---

## 2. Backend Setup

### Step 2.1: Navigate to Backend Directory

```powershell
cd "c:\AI Resume Builder\backend"
```

### Step 2.2: Create Virtual Environment

```powershell
# Create virtual environment
py -m venv venv

# Activate it (PowerShell)
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Verify activation:** Your prompt should show `(venv)` prefix:
```
(venv) PS C:\AI Resume Builder\backend>
```

### Step 2.3: Install Dependencies

```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt

# Install additional ML dependencies
pip install beautifulsoup4 lxml
```

**Expected output:**
```
Successfully installed fastapi-0.115.0 uvicorn-0.31.1 sqlalchemy-2.0.36 ...
```

### Step 2.4: Configure Environment Variables

```powershell
# Copy example environment file
Copy-Item .env.example .env

# Edit .env file
notepad .env
```

**Minimum configuration:**
```env
# Database (SQLite - no changes needed for local dev)
DATABASE_URL=sqlite+aiosqlite:///./ai_resume_builder.db

# JWT (you can keep defaults for development)
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# AI Provider (optional for basic features)
AI_PROVIDER=gemini
AI_API_KEY=your-api-key-here  # Optional
AI_MODEL=gemini-1.5-flash

# Application
APP_NAME=AI Resume Builder
APP_ENV=development
DEBUG=True
```

**To get AI API keys (optional):**
- **Gemini**: https://ai.google.dev/
- **OpenAI**: https://platform.openai.com/api-keys

### Step 2.5: Verify Backend Setup

```powershell
# Test import
python -c "from app.main import app; print('Backend imports OK!')"
```

**Expected output:**
```
Backend imports OK!
```

---

## 3. ML Model Training

### Step 3.1: Verify Dataset

```powershell
# Verify your local training dataset
Get-Item data\Resume.csv | Select-Object Name, Length
```

Resume datasets are intentionally excluded from Git because they contain raw resume records. Provide an approved local dataset at `backend/data/Resume.csv` before training.

### Step 3.2: Train Basic Model

```powershell
# Make sure virtual environment is activated
# Train the model
python -m app.ml.train
```

**Expected output:**
```
============================================================
AI RESUME BUILDER - ML TRAINING PIPELINE
============================================================

Loading dataset from: backend\data\Resume.csv
✓ Loaded 2484 resumes

Preprocessing text...
✓ Preprocessing complete

Training model...
✓ Model trained

Evaluating model...
Accuracy:  0.6519
Precision: 0.6264
Recall:    0.6022
F1 Score:  0.5922

✓ Model saved: backend\models\trained\classifier.pkl
✓ Vectorizer saved: backend\models\trained\vectorizer.pkl
✓ Label encoder saved: backend\models\trained\label_encoder.pkl

============================================================
TRAINING COMPLETE!
============================================================
```

**Training time:** ~2-3 minutes

### Step 3.3: Verify Model Files

```powershell
# Check if model files were created
Get-ChildItem models\trained\
```

**Expected output:**
```
    Directory: C:\AI Resume Builder\backend\models\trained
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---           1/5/2025   4:00 PM        1234567 classifier.pkl
-a---           1/5/2025   4:00 PM        5678901 vectorizer.pkl
-a---           1/5/2025   4:00 PM         123456 label_encoder.pkl
```

---

## 4. ML Enhancement Setup

### Step 4.1: Run Setup Script

```powershell
# Navigate to project root
cd ..

# Run ML setup verification
python scripts\setup_ml.py
```

**Expected output:**
```
============================================================
ML ENHANCEMENT SETUP
============================================================

Checking Python version...
✓ Python 3.12.x

Checking dependencies...
✓ scikit-learn
✓ pandas
✓ numpy
✓ beautifulsoup4
✓ matplotlib
✓ seaborn

Checking dataset...
✓ Dataset found: C:\AI Resume Builder\backend\data\Resume.csv
✓ Dataset shape: 2484 resumes, 2 columns
✓ Categories: 24 unique

Checking directories...
✓ backend/models/trained
✓ scripts

Checking ML module files...
✓ backend/app/ml/advanced_preprocessing.py
✓ backend/app/ml/skill_extraction.py
✓ backend/app/ml/job_matching.py
✓ backend/app/ml/enhanced_predict.py
✓ scripts/train_models.py
✓ scripts/evaluate_models.py
✓ scripts/predict.py

Checking trained models...
✓ Models already trained

============================================================
SETUP SUMMARY
============================================================
✓ Python version: OK
✓ Dependencies: OK
✓ Dataset: OK
✓ Directories: OK
✓ ML modules: OK
✓ Models: TRAINED

============================================================

✅ SETUP COMPLETE!

You can now:
- Make predictions: python scripts/predict.py --file resume.txt
- Evaluate models: python scripts/evaluate_models.py
- Use API endpoints: See ML_ENHANCEMENT_GUIDE.md
============================================================
```

### Step 4.2: Train Enhanced Models

```powershell
# Activate virtual environment (if not already)
cd backend
.\venv\Scripts\Activate.ps1

# Train with enhanced pipeline
cd ..
python scripts\train_models.py
```

**What this does:**
- Applies advanced preprocessing (HTML cleaning, normalization)
- Compares 4 algorithms (Logistic Regression, SVM, Naive Bayes, Random Forest)
- Performs 5-fold cross-validation
- Selects best model
- Saves enhanced model artifacts
- Generates detailed training report

**Expected output:**
```
╔====================================================================╗
║          AI RESUME BUILDER - ML TRAINING PIPELINE                  ║
╚====================================================================╝

============================================================
LOADING DATASET
============================================================

📂 Loading data from: backend\data\Resume.csv

✓ Loaded 2484 resumes

📊 Dataset Statistics:
   Total records: 2484
   Total categories: 24
   ...

============================================================
TRAINING: Logistic Regression
============================================================

⏳ Training model...
⏳ Making predictions...
⏳ Performing 5-fold cross-validation...

📊 Results:
   Training time: 2.45s
   
   Accuracy:          0.6523
   Precision (macro): 0.6264
   ...

============================================================
TRAINING: Linear SVM
============================================================
...

╔====================================================================╗
║                    MODEL COMPARISON                                ║
╚====================================================================╝

               Model  Accuracy  F1 (Macro)  F1 (Weighted)  CV F1  Train Time (s)
Logistic Regression    0.6523      0.5892         0.5922  0.6234           2.45
         Linear SVM    0.6482      0.5845         0.5889  0.6187           3.12
        Naive Bayes    0.6234      0.5567         0.5678  0.5923           0.89
      Random Forest    0.6145      0.5423         0.5543  0.5812          12.34

🏆 Best Model: Logistic Regression
   F1-Score (Weighted): 0.5922
   Accuracy: 0.6523

============================================================
SAVING MODEL ARTIFACTS
============================================================

✓ Saved model artifacts:
   backend\models\trained\classifier.pkl
   backend\models\trained\vectorizer.pkl
   backend\models\trained\label_encoder.pkl
   backend\models\metadata\model_metadata.json

╔====================================================================╗
║                    TRAINING COMPLETE!                              ║
╚====================================================================╝

✓ Model ready for production use
✓ Final performance: F1=0.5922, Accuracy=0.6523
✓ Use 'python scripts/evaluate_models.py' to see detailed evaluation
```

**Training time:** ~5-10 minutes

### Step 4.3: Evaluate Models

```powershell
python scripts\evaluate_models.py
```

**What this does:**
- Loads trained model
- Calculates comprehensive metrics
- Generates confusion matrix plot
- Performs per-class analysis
- Identifies common misclassifications
- Saves evaluation report

**Output files created:**
- `backend/models/trained/confusion_matrix.png`
- `backend/models/trained/evaluation_report.txt`

### Step 4.4: Test Predictions

```powershell
# Test with inline text
python scripts\predict.py --resume "Software Engineer with 5 years of Python, Java, and cloud experience. Expert in AWS, Docker, Kubernetes."

# Test with file
python scripts\predict.py --file path\to\resume.txt

# Show top 10 predictions
python scripts\predict.py --resume "Data Scientist..." --top-k 10
```

**Expected output:**
```
============================================================
RESUME CATEGORY PREDICTION
============================================================

⏳ Loading model...
✓ Model loaded successfully

⏳ Analyzing resume...

============================================================
PREDICTION RESULTS
============================================================

🎯 Predicted Category: INFORMATION-TECHNOLOGY
   Confidence: 78.45%

📊 Top 5 Predictions:
   1. INFORMATION-TECHNOLOGY       ████████████████████████████░░░░ 78.45%
   2. DATA-SCIENCE                 ████████░░░░░░░░░░░░░░░░░░░░░░░░ 12.34%
   3. ENGINEERING                  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  5.67%
   4. CONSULTANT                   ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  2.11%
   5. BUSINESS-DEVELOPMENT         █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  1.43%

============================================================
```

---

## 5. Frontend Setup

### Step 5.1: Navigate to Frontend Directory

```powershell
cd frontend
```

### Step 5.2: Install Dependencies

```powershell
npm install
```

**Expected output:**
```
added 456 packages, and audited 457 packages in 1m

123 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**Installation time:** ~2-5 minutes depending on internet speed

### Step 5.3: Configure Environment

```powershell
# Create .env file
New-Item -Path .env -ItemType File

# Edit .env
notepad .env
```

**Add this content:**
```env
VITE_API_URL=http://localhost:8000
```

### Step 5.4: Verify Frontend Setup

```powershell
# Test build system
npm run build

# Check for errors
```

**Expected output:**
```
vite v6.0.0 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-def456.js     123.45 kB │ gzip: 45.67 kB
✓ built in 3.45s
```

---

## 6. Testing the Application

### Step 6.1: Start Backend

```powershell
# Open first terminal/PowerShell window
cd "c:\AI Resume Builder\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Will watch for changes in these directories: ['C:\\AI Resume Builder\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Backend running at:** http://localhost:8000

### Step 6.2: Test Backend API

Open browser and visit:
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/health

**Using PowerShell:**
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "ml_model": "loaded",
  "ai_provider": "not_configured"
}
```

### Step 6.3: Start Frontend

```powershell
# Open second terminal/PowerShell window
cd "c:\AI Resume Builder\frontend"
npm run dev
```

**Expected output:**
```
VITE v6.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ Frontend running at:** http://localhost:5173

### Step 6.4: Test Complete Flow

1. **Open Frontend:** http://localhost:5173
2. **Register Account:** Click "Get Started" or "Sign Up"
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@#
3. **Login:** Use credentials from registration
4. **Create Resume:** Dashboard → "Create New Resume"
5. **Test ML Prediction:** Save resume and check category prediction
6. **Test ATS Analysis:** Use ATS Checker feature

### Step 6.5: Test ML Endpoints

```powershell
# Register and get token first
$registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method Post -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"Test123!@#"}'

$token = $registerResponse.access_token

# Test ML prediction
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    resume_text = "Software Engineer with 5 years of experience in Python, Java, and cloud technologies"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/ml/predict-category" -Method Post -Headers $headers -Body $body
```

**Expected response:**
```json
{
  "predicted_category": "INFORMATION-TECHNOLOGY",
  "confidence": 0.8456,
  "top_predictions": [
    {
      "category": "INFORMATION-TECHNOLOGY",
      "confidence": 0.8456
    },
    {
      "category": "DATA-SCIENCE",
      "confidence": 0.0923
    }
  ]
}
```

---

## 7. Common Issues

### Issue 1: Virtual Environment Activation Error

**Problem:**
```
.\venv\Scripts\Activate.ps1 : File cannot be loaded because running scripts is disabled
```

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 2: Module Not Found Error

**Problem:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 3: ML Model Not Found

**Problem:**
```
FileNotFoundError: ML model not found in backend/models/trained/
```

**Solution:**
```powershell
# Train the model
python -m app.ml.train

# Or use enhanced training
python scripts\train_models.py
```

### Issue 4: Port Already in Use

**Problem:**
```
ERROR:    [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)
```

**Solution:**
```powershell
# Use different port
uvicorn app.main:app --reload --port 8001

# Or kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Issue 5: Database Connection Error

**Problem:**
```
sqlalchemy.exc.OperationalError: unable to open database file
```

**Solution:**
```powershell
# Check DATABASE_URL in .env
# Make sure you have write permissions in backend directory
# Try deleting ai_resume_builder.db and restart
```

### Issue 6: AI Features Not Working

**Problem:**
```
AI provider not configured
```

**Solution:**
```env
# Add to backend/.env
AI_PROVIDER=gemini
AI_API_KEY=your-actual-api-key-here
AI_MODEL=gemini-1.5-flash
```

### Issue 7: Frontend Build Errors

**Problem:**
```
npm ERR! code ELIFECYCLE
```

**Solution:**
```powershell
# Clear cache and reinstall
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json
npm install
```

### Issue 8: CORS Errors in Browser

**Problem:**
```
Access to XMLHttpRequest at 'http://localhost:8000' blocked by CORS policy
```

**Solution:**
```python
# Check backend/app/main.py CORS settings
# Make sure frontend URL is in allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    ...
)
```

---

## 📝 Quick Reference Commands

### Backend Commands
```powershell
cd backend
.\venv\Scripts\Activate.ps1                # Activate virtual env
pip install -r requirements.txt            # Install dependencies
python -m app.ml.train                     # Train basic model
python ..\scripts\train_models.py          # Train enhanced model
uvicorn app.main:app --reload              # Start backend
```

### Frontend Commands
```powershell
cd frontend
npm install                                # Install dependencies
npm run dev                                # Start development server
npm run build                              # Build for production
npm run lint                               # Lint code
```

### ML Commands
```powershell
python scripts\setup_ml.py                 # Setup verification
python scripts\train_models.py             # Train models
python scripts\evaluate_models.py          # Evaluate models
python scripts\predict.py --resume "text"  # Make prediction
```

---

## ✅ Verification Checklist

- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] ML model trained successfully
- [ ] Enhanced ML models trained
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access API docs at http://localhost:8000/docs
- [ ] Can access frontend at http://localhost:5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can create resume
- [ ] ML predictions working
- [ ] ATS analysis working

---

## 🎉 Next Steps

Once everything is set up:

1. **Explore the API:** http://localhost:8000/docs
2. **Read ML Enhancement Guide:** `ML_ENHANCEMENT_GUIDE.md`
3. **Check Features Documentation:** `docs/FEATURES.md`
4. **Customize the application** for your needs
5. **Deploy to production** when ready

---

## 📞 Need Help?

If you encounter issues not covered here:

1. Check the main `README.md`
2. Review `ML_ENHANCEMENT_GUIDE.md` for ML-specific issues
3. Check terminal/console output for error messages
4. Verify all prerequisites are met
5. Try the troubleshooting steps above

---

**Happy Building! 🚀**
