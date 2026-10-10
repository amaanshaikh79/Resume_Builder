# ML Enhancement Guide

## Overview

This guide covers the enhanced machine learning capabilities for the AI Resume Builder. The ML system now includes:

1. **Advanced Category Classification** - Multi-model comparison with optimized preprocessing
2. **Skill Extraction** - Technical, soft, and domain skill identification
3. **Job Matching** - Resume-to-job similarity scoring with recommendations
4. **Experience Analysis** - Years of experience and level extraction
5. **Production-Ready Scripts** - Training, evaluation, and prediction tools

---

## 📁 File Structure

```
AI Resume Builder/
├── backend/
│   └── app/
│       └── ml/
│           ├── advanced_preprocessing.py    # Enhanced text preprocessing
│           ├── skill_extraction.py          # Skill extraction engine
│           ├── job_matching.py              # Job matching algorithms
│           ├── enhanced_predict.py          # Integrated prediction service
│           ├── predict.py                   # Original predictor (legacy)
│           └── preprocessing.py             # Original preprocessing (legacy)
│
├── scripts/
│   ├── train_models.py                      # Training pipeline
│   ├── evaluate_models.py                   # Model evaluation
│   └── predict.py                           # Standalone predictions
│
├── backend/models/
│   └── trained/
│       ├── classifier.pkl                   # Trained classifier
│       ├── vectorizer.pkl                   # TF-IDF vectorizer
│       ├── label_encoder.pkl                # Label encoder
│       ├── metadata.json                    # Model metadata
│       ├── confusion_matrix.png             # Confusion matrix plot
│       └── evaluation_report.txt            # Detailed evaluation
│
└── Resume.csv                               # Training dataset
```

---

## 🚀 Quick Start

### 1. Train Models

Activate virtual environment and run training:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python ..\scripts\train_models.py
```

**What it does:**
- Loads and analyzes Resume.csv (2,484 resumes, 24 categories)
- Applies advanced preprocessing (HTML cleaning, text normalization)
- Compares multiple algorithms:
  - Logistic Regression
  - Linear SVM
  - Naive Bayes
  - Random Forest
- Performs 5-fold cross-validation
- Saves best model to `backend/models/trained/`
- Generates training report with metrics

**Expected Output:**
```
Training Logistic Regression...
✓ CV F1: 0.6234 ± 0.0156
✓ Test Accuracy: 0.6523

Training Linear SVM...
✓ CV F1: 0.6187 ± 0.0143
✓ Test Accuracy: 0.6482

[...model comparison...]

🏆 Best Model: Logistic Regression
✓ Saved to backend/models/trained/
```

### 2. Evaluate Models

Run comprehensive evaluation:

```powershell
python ..\scripts\evaluate_models.py
```

**What it does:**
- Loads trained model
- Calculates test set metrics (accuracy, precision, recall, F1)
- Generates per-class performance analysis
- Creates confusion matrix visualization
- Identifies most confused category pairs
- Analyzes high-confidence errors
- Saves evaluation report

**Output Files:**
- `backend/models/trained/confusion_matrix.png`
- `backend/models/trained/evaluation_report.txt`

### 3. Make Predictions

Standalone prediction CLI:

```powershell
# From text
python ..\scripts\predict.py --resume "Software Engineer with 5 years experience..."

# From file
python ..\scripts\predict.py --file path\to\resume.txt

# Show top 10 predictions
python ..\scripts\predict.py --file resume.txt --top-k 10
```

**Example Output:**
```
🎯 Predicted Category: INFORMATION-TECHNOLOGY
   Confidence: 78.45%

📊 Top 5 Predictions:
   1. INFORMATION-TECHNOLOGY       ████████████████████████████░░░░ 78.45%
   2. DATA-SCIENCE                 ████████░░░░░░░░░░░░░░░░░░░░░░░░ 12.34%
   3. ENGINEERING                  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  5.67%
   4. CONSULTANT                   ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  2.11%
   5. BUSINESS-DEVELOPMENT         █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  1.43%
```

---

## 🔧 Technical Details

### Advanced Preprocessing

**File:** `backend/app/ml/advanced_preprocessing.py`

**Features:**
- HTML stripping with BeautifulSoup4
- URL, email, phone number removal
- Text normalization (lowercase, whitespace)
- Skill keyword extraction
- Statistical analysis

**Functions:**
```python
clean_html(text)                          # Remove HTML tags
normalize_text(text)                      # Normalize text
extract_skills_keywords(text, top_n=50)   # Extract keywords
load_and_analyze_data(csv_path)           # Load and analyze dataset
preprocess_pipeline(df)                   # Complete preprocessing
```

### Model Training

**File:** `scripts/train_models.py`

**Algorithms Compared:**
1. **Logistic Regression** - Fast, interpretable, good baseline
2. **Linear SVM** - High accuracy, margin-based classification
3. **Naive Bayes** - Probabilistic, fast training
4. **Random Forest** - Ensemble method, handles non-linearity

**Vectorization:**
- **TF-IDF** (Term Frequency-Inverse Document Frequency)
- max_features=5000
- ngram_range=(1,2) - unigrams and bigrams
- min_df=2 - ignore rare terms
- max_df=0.8 - ignore very common terms

**Training Split:**
- 80% training / 20% testing
- Stratified split (maintains class distribution)
- 5-fold cross-validation

**Metrics:**
- Accuracy
- Precision (macro & weighted)
- Recall (macro & weighted)
- F1-Score (macro & weighted)
- Confusion Matrix

### Skill Extraction

**File:** `backend/app/ml/skill_extraction.py`

**Capabilities:**
- **Technical Skills:** Programming languages, frameworks, databases, cloud, DevOps, ML
- **Soft Skills:** Leadership, communication, teamwork, problem-solving
- **Domain Skills:** Finance, healthcare, cybersecurity, marketing
- **Certifications:** AWS, Azure, PMP, CISSP, etc.
- **Experience Level:** Entry, Intermediate, Advanced, Expert

**API:**
```python
from backend.app.ml.skill_extraction import extract_skills_from_resume

skills = extract_skills_from_resume(resume_text)
# Returns:
{
    'technical_skills': ['python', 'docker', 'aws', ...],
    'soft_skills': ['leadership', 'communication', ...],
    'domain_skills': ['cybersecurity', 'finance', ...],
    'certifications': ['AWS Certified', ...],
    'total_skills': 42,
    'skill_frequency': {'python': 5, 'docker': 3, ...}
}
```

### Job Matching

**File:** `backend/app/ml/job_matching.py`

**Scoring Methods:**
1. **TF-IDF Cosine Similarity** (30% weight) - Text-level similarity
2. **Skill Matching** (40% weight) - Technical, soft, domain skills
3. **Keyword Overlap** (20% weight) - Jaccard similarity
4. **Experience Matching** (10% weight) - Years of experience

**Combined Score:** Weighted average of all methods

**API:**
```python
from backend.app.ml.job_matching import calculate_job_match

result = calculate_job_match(resume_text, job_description)
# Returns:
{
    'overall_score': 0.72,
    'tfidf_similarity': 0.68,
    'skill_match': {
        'overall_match': 0.75,
        'matching_skills': {...},
        'missing_skills': {...}
    },
    'keyword_overlap': 0.71,
    'experience_match': 0.85,
    'recommendation': 'Strong match. Good candidate.',
    'match_level': 'Good'
}
```

### Enhanced Prediction Service

**File:** `backend/app/ml/enhanced_predict.py`

**Integrated Service:**
```python
from backend.app.ml.enhanced_predict import get_enhanced_predictor

predictor = get_enhanced_predictor()

# Category prediction
result = predictor.predict_category(resume_text)

# Full analysis
analysis = predictor.analyze_resume(resume_text)

# Job matching
match = predictor.match_with_job(resume_text, job_description)

# Job ranking
rankings = predictor.rank_jobs(resume_text, job_list)
```

---

## 🌐 API Endpoints

### Enhanced ML Endpoints

**File:** `backend/app/api/ml_enhanced.py`

All endpoints require authentication.

#### 1. Analyze Resume
```http
POST /api/ml/analyze-resume
Content-Type: application/json

{
  "resume_text": "Software Engineer with 5 years..."
}
```

**Response:**
```json
{
  "category": {
    "predicted_category": "INFORMATION-TECHNOLOGY",
    "confidence": 0.7845,
    "top_predictions": [...]
  },
  "skills": {
    "technical_skills": ["python", "docker", "aws"],
    "soft_skills": ["leadership", "teamwork"],
    "domain_skills": ["cybersecurity"],
    "certifications": ["AWS Certified"],
    "total_skills": 42
  },
  "skill_level": "Advanced",
  "experience": {
    "total_years": 5,
    "level": "Mid Level"
  }
}
```

#### 2. Extract Skills
```http
POST /api/ml/extract-skills
Content-Type: application/json

{
  "resume_text": "..."
}
```

#### 3. Match Job
```http
POST /api/ml/match-job
Content-Type: application/json

{
  "resume_text": "...",
  "job_description": "...",
  "include_suggestions": true
}
```

**Response:**
```json
{
  "overall_score": 0.72,
  "tfidf_similarity": 0.68,
  "skill_match": {...},
  "recommendation": "Strong match. Good candidate.",
  "suggestions": {
    "critical": ["Add Python experience"],
    "important": ["Highlight Docker skills"],
    "optional": ["Include soft skills"]
  }
}
```

#### 4. Rank Jobs
```http
POST /api/ml/rank-jobs
Content-Type: application/json

{
  "resume_text": "...",
  "jobs": [
    {"id": 1, "title": "Software Engineer", "description": "..."},
    {"id": 2, "title": "Data Scientist", "description": "..."}
  ]
}
```

#### 5. Predict Category
```http
POST /api/ml/predict-category?top_k=5
Content-Type: application/json

{
  "resume_text": "..."
}
```

#### 6. Get Model Info
```http
GET /api/ml/model-info
```

#### 7. Get Categories
```http
GET /api/ml/categories
```

---

## 📊 Model Performance

### Baseline Model
- **Algorithm:** Logistic Regression
- **Accuracy:** 65.2%
- **F1-Score (weighted):** 59.2%
- **Training Data:** 2,484 resumes, 24 categories

### Expected Performance (After Enhancement)
- **Target Accuracy:** 70-75%
- **Target F1-Score:** 65-70%
- **Improvements:**
  - Better text preprocessing
  - Optimized hyperparameters
  - Model comparison and selection
  - Cross-validation

### Per-Category Performance
Categories vary in performance due to:
- **Class imbalance** - INFORMATION-TECHNOLOGY (120 samples) vs BPO (22 samples)
- **Content similarity** - Engineering fields overlap
- **Text quality** - Resume formatting and detail level

---

## 🔄 Integration with Existing System

### Backend Integration

The enhanced ML system is **fully compatible** with existing backend:

1. **Backward Compatible:** Original `predict.py` still works
2. **Drop-in Replacement:** Use `enhanced_predict.py` instead
3. **New Endpoints:** `ml_enhanced.py` adds capabilities without breaking existing API
4. **Same Model Files:** Uses same `backend/models/trained/` directory

### To Integrate Enhanced Endpoints:

**Option 1: Add to existing router**
```python
# backend/app/main.py
from .api import ml_enhanced

app.include_router(ml_enhanced.router, prefix="/api")
```

**Option 2: Replace existing ML endpoints**
```python
# Update backend/app/api/ml.py to use enhanced_predict
from ..ml.enhanced_predict import get_enhanced_predictor
```

### Frontend Integration

No changes required to existing frontend. New capabilities available via:

```typescript
// apiService.ts - Add new methods

export const analyzeResume = async (resumeText: string) => {
  const response = await api.post('/ml/analyze-resume', { resume_text: resumeText });
  return response.data;
};

export const matchJob = async (resumeText: string, jobDescription: string) => {
  const response = await api.post('/ml/match-job', {
    resume_text: resumeText,
    job_description: jobDescription
  });
  return response.data;
};
```

---

## 🧪 Testing

### Test Training Pipeline
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python ..\scripts\train_models.py
```

Verify:
- ✓ No errors during training
- ✓ Model files created in `backend/models/trained/`
- ✓ Accuracy > 60%
- ✓ All 24 categories present

### Test Evaluation
```powershell
python ..\scripts\evaluate_models.py
```

Verify:
- ✓ Confusion matrix generated
- ✓ Evaluation report created
- ✓ Per-class metrics displayed

### Test Prediction
```powershell
python ..\scripts\predict.py --resume "Data Scientist with Python, ML, TensorFlow experience"
```

Verify:
- ✓ Predicted category makes sense
- ✓ Confidence score reasonable (not 0% or 100%)
- ✓ Top predictions relevant

### Test API Integration

Start backend and test with curl or Postman:

```bash
# Get model info
curl -X GET http://localhost:8000/api/ml/model-info \
  -H "Authorization: Bearer YOUR_TOKEN"

# Analyze resume
curl -X POST http://localhost:8000/api/ml/analyze-resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resume_text": "..."}'
```

---

## 📈 Performance Optimization

### Training Time
- **Current:** ~5-10 minutes for 4 models
- **Optimize:** Use `n_jobs=-1` for parallel processing (already enabled)

### Prediction Speed
- **Category:** ~50ms per resume
- **Full Analysis:** ~100ms per resume
- **Job Matching:** ~150ms per resume-job pair

### Memory Usage
- **Model Size:** ~5-10 MB total
- **Vectorizer:** ~3-5 MB
- **Runtime:** ~50-100 MB per worker

---

## 🐛 Troubleshooting

### Model Not Found Error
```
FileNotFoundError: ML model not found
```
**Solution:** Run training script first
```powershell
python scripts\train_models.py
```

### Low Accuracy
**Possible Causes:**
- Insufficient training data
- Class imbalance
- Poor text quality
- Wrong hyperparameters

**Solutions:**
- Collect more data
- Use class weights or SMOTE
- Improve preprocessing
- Tune hyperparameters

### Slow Predictions
**Solutions:**
- Cache vectorizer transforms
- Use smaller max_features
- Implement batch processing
- Use faster algorithm (Logistic Regression vs Random Forest)

### Import Errors
```
ModuleNotFoundError: No module named 'beautifulsoup4'
```
**Solution:** Install dependencies
```powershell
pip install beautifulsoup4 scikit-learn pandas numpy matplotlib seaborn
```

---

## 🚀 Future Enhancements

### Planned Features
1. **Deep Learning Models** - BERT, RoBERTa for better accuracy
2. **Resume Parsing** - Extract structured data (education, work history)
3. **ATS Optimization** - Score resume against ATS systems
4. **Resume Generation** - AI-powered resume writing
5. **Interview Prep** - Generate questions based on resume
6. **Salary Prediction** - Estimate salary based on skills/experience

### Production Deployment
1. **Model Versioning** - MLflow or DVC
2. **A/B Testing** - Compare model versions
3. **Monitoring** - Track prediction accuracy, latency
4. **Retraining Pipeline** - Automated periodic retraining
5. **Explainability** - SHAP/LIME for prediction explanations

---

## 📚 References

- **Scikit-learn Documentation:** https://scikit-learn.org/
- **TF-IDF:** https://en.wikipedia.org/wiki/Tf-idf
- **Text Classification:** https://developers.google.com/machine-learning/guides/text-classification

---

## 📝 Summary

The enhanced ML system provides:

✅ **4 Algorithms Compared** - Logistic Regression, SVM, Naive Bayes, Random Forest  
✅ **Advanced Preprocessing** - HTML cleaning, text normalization, skill extraction  
✅ **Skill Extraction** - 150+ technical, 20+ soft, 30+ domain skills  
✅ **Job Matching** - Multi-method similarity scoring  
✅ **Production Scripts** - Train, evaluate, predict  
✅ **Enhanced API** - 7 new endpoints  
✅ **Backward Compatible** - Works with existing system  
✅ **Well Documented** - Comprehensive guides and examples

**Next Steps:**
1. ✅ Run `train_models.py` to train enhanced model
2. ✅ Run `evaluate_models.py` to check performance
3. ✅ Test `predict.py` for standalone predictions
4. ⏳ Integrate `ml_enhanced.py` endpoints into backend
5. ⏳ Update frontend to use new capabilities
6. ⏳ Monitor performance in production
