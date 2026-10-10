# Quick Reference - AI Resume Builder

## 🚀 Quick Start Commands

### First Time Setup
```powershell
# Backend
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.ml.train
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Daily Development
```powershell
# Start Backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Start Frontend (new terminal)
cd frontend
npm run dev
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/health |

---

## 📁 Project Structure

```
AI Resume Builder/
├── backend/           # FastAPI Backend
│   ├── app/           # Application code
│   │   ├── api/       # API endpoints
│   │   ├── ml/        # ML models
│   │   ├── ai/        # AI providers
│   │   ├── models/    # Database models
│   │   └── core/      # Core utilities
│   ├── data/          # Dataset (Resume.csv)
│   ├── models/        # Trained ML models
│   └── venv/          # Virtual environment
│
├── frontend/          # React Frontend
│   ├── src/           # Source code
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   └── services/  # API services
│   └── dist/          # Production build
│
├── scripts/           # ML Training Scripts
│   ├── setup_ml.py
│   ├── train_models.py
│   ├── evaluate_models.py
│   └── predict.py
│
└── docs/              # Documentation
```

---

## 🔧 Common Commands

### Backend Commands
```powershell
# Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Train basic model (one-time)
python -m app.ml.train

# Start development server
uvicorn app.main:app --reload

# Start on different port
uvicorn app.main:app --reload --port 8001
```

### Frontend Commands
```powershell
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### ML Training Commands
```powershell
# Setup verification
python scripts\setup_ml.py

# Train enhanced models (10 min)
python scripts\train_models.py

# Evaluate models
python scripts\evaluate_models.py

# Make prediction
python scripts\predict.py --resume "text here"

# Predict from file
python scripts\predict.py --file resume.txt

# Show top 10 predictions
python scripts\predict.py --file resume.txt --top-k 10
```

---

## 🔑 API Endpoints Cheat Sheet

### Authentication
```http
POST /api/auth/register     # Register user
POST /api/auth/login        # Login user
```

### Resumes
```http
GET    /api/resumes         # List resumes
POST   /api/resumes         # Create resume
GET    /api/resumes/{id}    # Get resume
PUT    /api/resumes/{id}    # Update resume
DELETE /api/resumes/{id}    # Delete resume
```

### ML
```http
POST /api/ml/predict-category   # Predict category
POST /api/ml/analyze-resume     # Full analysis
POST /api/ml/extract-skills     # Extract skills
POST /api/ml/match-job          # Match with job
GET  /api/ml/categories         # List categories
```

### AI
```http
POST /api/ai/summary            # Generate summary
POST /api/ai/bullet-points      # Generate bullets
POST /api/ai/improve-experience # Improve text
POST /api/ai/cover-letter       # Generate cover letter
```

### ATS
```http
POST /api/ats/analyze       # Analyze resume
POST /api/ats/analyze-job   # Analyze job description
```

---

## 🐛 Troubleshooting

### Virtual Environment Won't Activate
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Module Not Found
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### ML Model Not Found
```powershell
python -m app.ml.train
```

### Port Already in Use
```powershell
# Backend
uvicorn app.main:app --reload --port 8001

# Frontend
npm run dev -- --port 5174
```

### CORS Error
Check `backend/app/main.py` CORS settings:
```python
allow_origins=["http://localhost:5173"]
```

---

## 📦 Environment Variables

### Backend (.env)
```env
# Required
DATABASE_URL=sqlite+aiosqlite:///./ai_resume_builder.db
JWT_SECRET_KEY=your-secret-key-here

# Optional (for AI features)
AI_PROVIDER=gemini
AI_API_KEY=your-api-key-here
AI_MODEL=gemini-1.5-flash
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Algorithm | Logistic Regression |
| Accuracy | 65.2% |
| F1 Score | 62.3% |
| Categories | 24 |
| Training Time | ~2.5s |
| Prediction Time | ~50ms |

---

## 🔐 Test Credentials

### Default Test User
```
Email: test@example.com
Password: Test123!@#
```

### Register New User
```http
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

---

## 📝 File Locations

### Configuration Files
```
backend/.env                    # Backend config
backend/.env.example            # Template
frontend/.env                   # Frontend config
```

### Database
```
backend/ai_resume_builder.db    # SQLite database
```

### ML Models
```
backend/models/trained/
├── classifier.pkl              # Trained model
├── vectorizer.pkl              # TF-IDF vectorizer
├── label_encoder.pkl           # Label encoder
├── confusion_matrix.png        # Evaluation plot
└── evaluation_report.txt       # Metrics report
```

### Dataset
```
backend/data/Resume.csv         # 2,484 resumes
```

---

## 🎨 Frontend Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| / | Landing | No |
| /login | Login | No |
| /register | Register | No |
| /dashboard | Dashboard | Yes |
| /resumes/new | Create Resume | Yes |
| /resumes/:id/edit | Edit Resume | Yes |
| /resumes | My Resumes | Yes |
| /profile | Profile Settings | Yes |
| /ats-checker | ATS Checker | Yes |

---

## 🔍 Testing Checklist

### Backend Tests
- [ ] Health check returns 200
- [ ] User registration works
- [ ] User login works
- [ ] Resume CRUD works
- [ ] ML prediction works
- [ ] ATS analysis works
- [ ] API docs accessible

### Frontend Tests
- [ ] Landing page loads
- [ ] Registration form works
- [ ] Login form works
- [ ] Dashboard shows data
- [ ] Can create resume
- [ ] Can edit resume
- [ ] Can delete resume
- [ ] Logout works

### ML Tests
- [ ] Model files exist
- [ ] Predictions return category
- [ ] Confidence scores are 0-1
- [ ] Top predictions work

---

## 💡 Quick Tips

### Development
- Use `--reload` for auto-restart on code changes
- Check `http://localhost:8000/docs` for API testing
- Use browser DevTools Network tab to debug API calls
- Check terminal for error messages

### ML Training
- Training takes ~3 minutes for basic model
- Enhanced training takes ~10 minutes
- Models are saved automatically
- Retraining replaces old models

### Debugging
- Backend errors: Check terminal output
- Frontend errors: Check browser console
- API errors: Check FastAPI docs at /docs
- ML errors: Verify model files exist

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Overview & features |
| SETUP_GUIDE.md | Setup instructions |
| ML_ENHANCEMENT_GUIDE.md | ML documentation |
| PROJECT_STATUS.md | Status & metrics |
| SUMMARY.md | Project summary |
| QUICK_REFERENCE.md | This file |

---

## 🚀 Deployment Checklist

- [ ] Train models
- [ ] Test all endpoints
- [ ] Set production env vars
- [ ] Update CORS origins
- [ ] Set strong JWT secret
- [ ] Use PostgreSQL for DB
- [ ] Build frontend (`npm run build`)
- [ ] Test production build
- [ ] Setup monitoring
- [ ] Configure backup

---

## 📞 Help Resources

### When Things Break
1. Check error message in terminal
2. Verify virtual environment is activated
3. Check environment variables
4. Verify model files exist
5. Review setup guide
6. Check API documentation

### Common Fixes
```powershell
# Reinstall backend dependencies
pip install -r requirements.txt --force-reinstall

# Reinstall frontend dependencies
Remove-Item node_modules -Recurse -Force
npm install

# Retrain model
python -m app.ml.train

# Clear browser cache
Ctrl + Shift + Delete
```

---

## 🎯 Next Steps

### After Initial Setup
1. ✅ Train basic model
2. ✅ Test backend API
3. ✅ Test frontend
4. ⏳ Configure AI API key (optional)
5. ⏳ Train enhanced models
6. ⏳ Deploy to production

### Optional Enhancements
- Add more resume templates
- Integrate more AI providers
- Add PDF export
- Add email features
- Implement notifications
- Add analytics

---

## 📊 Quick Stats

- **Endpoints:** 19+
- **Pages:** 9
- **ML Categories:** 24
- **Training Dataset:** 2,484 resumes
- **Model Accuracy:** 65.2%
- **Skills Recognized:** 200+

---

## ⚡ Performance

| Operation | Time |
|-----------|------|
| API Response | ~50-100ms |
| ML Prediction | ~50ms |
| Training (basic) | ~3 min |
| Training (enhanced) | ~10 min |
| Frontend Build | ~3-5s |
| Page Load | <2s |

---

## 🎉 That's It!

**Everything you need in one place.**

For detailed information, check the full documentation:
- **Setup:** SETUP_GUIDE.md
- **ML:** ML_ENHANCEMENT_GUIDE.md
- **Status:** PROJECT_STATUS.md
- **Overview:** README.md

**Happy building! 🚀**
