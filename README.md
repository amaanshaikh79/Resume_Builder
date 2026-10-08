# Resume AI Studio

A 3D, multi-page web app that **reads** a resume (classifies it into one of 24 job fields) and **writes** one (Gemini drafts a resume for the detected field). Everything runs on your own FastAPI backend.

## Pages
| Page | What it does |
|---|---|
| **Home** | 3D hero. Paste a resume and watch the matching field light up in the 3D ring. |
| **Studio > Read a resume** | Paste or upload PDF / DOCX / TXT. Shows the verdict, the exact words behind it (explainability) and keyword coverage for the field. |
| **Studio > Build a resume** | Form to Gemini-written resume, 3 paper templates, keyword coverage score, save as PDF. |
| **Galaxy** | All 24 fields as a 3D galaxy (size = resumes seen, colour = F1), red threads = confused fields, plus a confusion-matrix heatmap. |
| **Backend** | Live request log, animated request-flow diagram, system info, an API explorer to call endpoints, and the training lab. |

## Tech
Python, scikit-learn (TF-IDF + LinearSVC), FastAPI, Three.js (bundled in `static/vendor`), vanilla JS/CSS, Gemini API.

## Run it
```bash
git clone https://github.com/amaanshaikh79/Resume_Builder.git
cd Resume_Builder
pip install -r requirements.txt
```
1. Put the **Resume dataset** CSV in this folder as `Resume_csv.xls` or `Resume.csv` (columns `ID, Resume_str, Resume_html, Category`). It is not in the repo because it is large.
2. `python app.py`
3. Open http://127.0.0.1:8000
4. Go to **Backend > Training lab > Train model** (1-2 minutes). Then use Studio and Galaxy.

## Gemini (optional)
Open the gear icon (Settings), paste a key from https://aistudio.google.com/apikey, press **Test key**. The key stays in the browser tab only. You can also set `GEMINI_API_KEY` (and `GEMINI_MODEL`). Without a key the builder uses a plain template. **Never commit a key.**

## Structure
```
app.py                       FastAPI backend: train, predict, explain, ats, generate, logs, system
train_resume_classifier.py   Cleaning, training, evaluation, prediction
static/index.html            Pages
static/style.css             Design
static/app.js                Router, 3D scenes (hero + galaxy), studio, backend console
static/vendor/three.min.js   Three.js r128 (bundled, works offline)
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/status` | Model, dataset and metrics |
| POST | `/api/train` | Start training (optional CSV upload) |
| GET | `/api/train/status` | Training log |
| POST | `/api/predict` | Top-3 fields |
| POST | `/api/explain` | Verdict plus the words that drove it |
| POST | `/api/ats` | Keyword coverage for a field |
| POST | `/api/generate` | Classify, then write a resume |
| POST | `/api/extract-text` | Text from PDF / DOCX / TXT |
| POST | `/api/test-llm` | Test the Gemini key |
| GET | `/api/logs`, `/api/system` | Backend console data |

## Limits
- Small fields (BPO, Automobile) have little data, so scores there are shaky.
- Works best when the first line of the resume is a job title, like in the dataset.
- The AI uses only the facts you give it. Check the output before sending it anywhere.
- Keyword coverage is a guide, not a real ATS.
