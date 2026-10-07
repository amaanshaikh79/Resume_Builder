# Resume AI Studio

Resume building using Generative AI: a classifier detects the resume's job domain, and Gemini writes an ATS-friendly resume for that domain.

## Features
- **Train** a resume classifier from a CSV (TF-IDF + LinearSVC, compares 3 models, ~84% test accuracy on 24 categories)
- **Classify** a resume (paste text or upload PDF / DOCX / TXT)
- **Generate** a resume with Gemini (falls back to a simple template if no API key)
- Dashboard with accuracy, model comparison and category-wise F1

## Tech
Python, scikit-learn, FastAPI, vanilla HTML/CSS/JS, Gemini API

## Setup (Windows / Mac / Linux)
```bash
git clone https://github.com/amaanshaikh79/Resume_Builder.git
cd Resume_Builder
pip install -r requirements.txt
```
1. Download the **Resume Dataset** (CSV with columns `ID, Resume_str, Resume_html, Category`) and put it in this folder as `Resume_csv.xls` or `Resume.csv`.
   (The dataset is not stored in the repo because it is large.)
2. Run the app:
```bash
python app.py
```
3. Open http://127.0.0.1:8000
4. Dashboard tab -> **Train model** (1-2 minutes). Then use Classify / Generate.

## Gemini API key (optional, for AI writing)
Get a key at https://aistudio.google.com/apikey and paste it in the **Settings** tab (saved only in your browser session),
or set the environment variable `GEMINI_API_KEY`. Optional: `GEMINI_MODEL` to change the model.
**Never commit your API key to GitHub.**

## Project structure
```
app.py                       FastAPI backend (train / predict / generate endpoints)
train_resume_classifier.py   Data cleaning, training, evaluation, prediction
static/index.html            Frontend UI
requirements.txt             Python dependencies
```

## API endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/status` | Model/dataset status + metrics |
| POST | `/api/train` | Start training |
| POST | `/api/predict` | Predict resume category |
| POST | `/api/extract-text` | Read text from PDF/DOCX/TXT |
| POST | `/api/generate` | Generate a resume |
| POST | `/api/test-llm` | Test the Gemini key |

## Known limitations
- Small categories (BPO, Automobile) have low accuracy because of little data.
- The model works best when the first line of the resume is a job title like in the dataset.
- The AI only uses facts you provide; always verify the generated resume.
