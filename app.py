"""
Resume AI Studio - FastAPI backend + UI
Run : python app.py        (phir browser me http://127.0.0.1:8000 kholo)
"""
import io, json, os, re, threading, zipfile, urllib.request, urllib.error
import time, itertools, collections, platform, sys
import numpy as np
import pandas as pd
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import train_resume_classifier as trc

BASE = Path(__file__).parent
app = FastAPI(title="Resume AI Studio")
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")

TRAIN = {"status": "idle", "log": [], "error": None}   # training ki live state
START = time.time()
LOGS = collections.deque(maxlen=300)                    # backend console ke liye request log
_log_id = itertools.count(1)
_kw_cache = {}


@app.middleware("http")
async def log_requests(request: Request, call_next):
    t0 = time.perf_counter()
    resp = await call_next(request)
    path = request.url.path
    if path.startswith("/api") and path != "/api/logs" and not request.query_params.get("quiet"):
        LOGS.append({"id": next(_log_id), "t": time.strftime("%H:%M:%S"), "method": request.method,
                     "path": path, "status": resp.status_code,
                     "ms": round((time.perf_counter() - t0) * 1000)})
    return resp
DATASET_NAMES = ["Resume_csv.xls", "Resume.csv", "Resume_csv.csv", "uploaded_dataset.csv"]


def find_dataset():
    for n in DATASET_NAMES:
        if (BASE / n).exists():
            return BASE / n
    return None


# ---------------------------------------------------------------- pages / status
@app.get("/")
def home():
    return FileResponse(BASE / "static" / "index.html")


@app.get("/api/status")
def status(x_gemini_key: str | None = Header(default=None)):
    metrics = json.loads(trc.METRICS_PATH.read_text()) if trc.METRICS_PATH.exists() else None
    ds = find_dataset()
    return {"model_ready": trc.MODEL_PATH.exists(), "metrics": metrics,
            "dataset_found": ds.name if ds else None,
            "llm_configured": bool(x_gemini_key or os.getenv("GEMINI_API_KEY")),
            "training": TRAIN["status"]}


# ---------------------------------------------------------------- training
def _run_training(path):
    TRAIN.update(status="running", log=[], error=None)
    try:
        trc.train(str(path), log=lambda m: TRAIN["log"].append(m))
        trc.load_model(force=True)
        _kw_cache.clear()
        TRAIN["status"] = "done"
    except Exception as e:
        TRAIN.update(status="error", error=str(e))
        TRAIN["log"].append("ERROR: " + str(e))


@app.post("/api/train")
async def start_training(file: UploadFile | None = File(default=None)):
    if TRAIN["status"] == "running":
        raise HTTPException(409, "Training is already running")
    if file is not None and file.filename:
        path = BASE / "uploaded_dataset.csv"
        path.write_bytes(await file.read())
    else:
        path = find_dataset()
        if path is None:
            raise HTTPException(400, "No dataset found. Put Resume_csv.xls in the project folder or choose a CSV.")
    threading.Thread(target=_run_training, args=(path,), daemon=True).start()
    return {"started": True, "dataset": path.name}


@app.get("/api/train/status")
def train_status():
    return TRAIN


# ---------------------------------------------------------------- classify
class TextIn(BaseModel):
    text: str


def _need_model():
    if not trc.MODEL_PATH.exists():
        raise HTTPException(400, "The model is not trained yet. Open the Backend page and press Train model.")


@app.post("/api/predict")
def predict(body: TextIn):
    _need_model()
    if len(body.text.split()) < 8:
        raise HTTPException(400, "That text is too short. Paste at least a few lines of the resume.")
    return {"top": trc.predict_top(body.text, k=3)}


@app.post("/api/extract-text")
async def extract_text(file: UploadFile = File(...)):
    data = await file.read()
    name = (file.filename or "").lower()
    try:
        if name.endswith(".pdf"):
            from pypdf import PdfReader
            text = "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages)
        elif name.endswith(".docx"):
            xml = zipfile.ZipFile(io.BytesIO(data)).read("word/document.xml").decode("utf8", "ignore")
            text = re.sub(r"<[^>]+>", " ", xml.replace("</w:p>", "\n"))
        else:
            text = data.decode("utf8", "ignore")
    except Exception as e:
        raise HTTPException(400, f"Could not read that file: {e}")
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        raise HTTPException(400, "No text found in the file. It may be a scanned PDF.")
    return {"text": text}


# ---------------------------------------------------------------- explain / ATS / console
class ExplainIn(BaseModel):
    text: str
    title: str | None = None
    k: int = 12


def _weights(clf, idx):
    return clf.coef_[idx] if hasattr(clf, "coef_") else clf.feature_log_prob_[idx]


@app.post("/api/explain")
def explain(b: ExplainIn):
    """Model ne ye category kyun chuni: sabse zyada contribute karne wale words."""
    _need_model()
    if len(b.text.split()) < 8:
        raise HTTPException(400, "That text is too short. Paste at least a few lines of the resume.")
    m = trc.load_model()
    top = trc.predict_top(b.text, title=b.title, k=3)
    idx = list(m.classes_).index(top[0]["category"])
    row = pd.DataFrame({"text": [trc.clean(b.text)],
                        "title": [trc.clean(b.title) if b.title else trc.first_line(b.text)]})
    X = m.named_steps["features"].transform(row).tocsr()
    contrib = X.multiply(_weights(m.named_steps["clf"], idx)).tocsr()
    names = m.named_steps["features"].get_feature_names_out()
    cols, vals = contrib.indices, contrib.data
    agg = {}                                   # body + title me same word ho to jod do
    for c, v in zip(cols, vals):
        src, term = names[c].split("__", 1)
        e = agg.setdefault(term, {"term": term, "weight": 0.0, "sources": []})
        e["weight"] += float(v); e["sources"].append(src)
    items = [{"term": e["term"], "weight": round(e["weight"], 4), "in_title": "title" in e["sources"]} for e in agg.values()]
    items.sort(key=lambda x: x["weight"], reverse=True)
    pos = [i for i in items[: b.k] if i["weight"] > 0]
    neg = [i for i in items[::-1][:5] if i["weight"] < 0]
    return {"top": top, "terms": pos, "against": neg}


def _cat_keywords(category, n=40):
    if category in _kw_cache:
        return _kw_cache[category]
    m = trc.load_model()
    classes = list(m.classes_)
    if category not in classes:
        raise HTTPException(400, f"Unknown category: {category}")
    names = m.named_steps["features"].get_feature_names_out()
    w = _weights(m.named_steps["clf"], classes.index(category))
    out = []
    for i in np.argsort(w)[::-1]:
        nm = names[i]
        if nm.startswith("body__") and len(nm) > 9 and w[i] > 0:
            out.append((nm[6:], float(w[i])))
        if len(out) >= n:
            break
    _kw_cache[category] = out
    return out


class AtsIn(BaseModel):
    text: str
    category: str


@app.post("/api/ats")
def ats(b: AtsIn):
    """Keyword coverage: resume me us category ke top keywords kitne hain."""
    _need_model()
    kws = _cat_keywords(b.category)
    cleaned = " " + trc.clean(b.text) + " "
    present = [(t, w) for t, w in kws if f" {t} " in cleaned]
    missing = [(t, w) for t, w in kws if f" {t} " not in cleaned]
    total = sum(w for _, w in kws) or 1
    score = round(100 * sum(w for _, w in present) / total)
    fmt = lambda L: [{"term": t, "weight": round(w, 3)} for t, w in L]
    return {"category": b.category, "score": score, "present": fmt(present), "missing": fmt(missing[:15])}


@app.get("/api/logs")
def logs(since: int = 0):
    return {"logs": [l for l in LOGS if l["id"] > since][-80:], "last": LOGS[-1]["id"] if LOGS else 0}


@app.get("/api/system")
def system():
    import sklearn, fastapi
    model = None
    if trc.MODEL_PATH.exists():
        m = trc.load_model()
        feats, clf = m.named_steps["features"], m.named_steps["clf"]
        model = {"classifier": type(clf).__name__, "classes": len(m.classes_),
                 "body_vocab": len(feats.named_transformers_["body"].vocabulary_),
                 "title_vocab": len(feats.named_transformers_["title"].vocabulary_),
                 "file_mb": round(trc.MODEL_PATH.stat().st_size / 1e6, 1)}
    eps = [{"path": r.path, "methods": sorted(r.methods - {"HEAD", "OPTIONS"}), "name": r.name}
           for r in app.routes if getattr(r, "path", "").startswith("/api")]
    return {"python": platform.python_version(), "sklearn": sklearn.__version__, "fastapi": fastapi.__version__,
            "os": platform.system(), "uptime_s": round(time.time() - START), "model": model,
            "endpoints": eps, "requests_logged": len(LOGS), "llm_model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash")}


# ---------------------------------------------------------------- generate resume
class GenIn(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    location: str = ""
    target_role: str
    skills: str = ""
    experience: str = ""      # har line: Role | Company | Period | kya kiya
    education: str = ""       # har line: Degree | Institute | Period
    projects: str = ""        # har line: Name | description
    existing_resume: str = ""
    category_override: str = ""   # khaali = auto-detect


def _lines(s):
    return [l.strip() for l in s.splitlines() if l.strip()]


def _template_resume(g: GenIn, category: str):
    """Bina API key ke fallback: user ke diye data ko hi structure karta hai."""
    skills = [s.strip() for s in re.split(r"[,\n]", g.skills) if s.strip()]
    exp = []
    for l in _lines(g.experience):
        p = [x.strip() for x in l.split("|")]
        p += [""] * (4 - len(p))
        bullets = [b.strip() for b in re.split(r"[.;]", p[3]) if b.strip()]
        exp.append({"role": p[0], "company": p[1], "period": p[2], "bullets": bullets})
    edu = []
    for l in _lines(g.education):
        p = [x.strip() for x in l.split("|")] + ["", ""]
        edu.append({"degree": p[0], "institute": p[1], "period": p[2]})
    proj = []
    for l in _lines(g.projects):
        p = [x.strip() for x in l.split("|", 1)] + [""]
        proj.append({"name": p[0], "bullets": [p[1]] if p[1] else []})
    top = ", ".join(skills[:4])
    summary = (f"{g.target_role} candidate" + (f" with skills in {top}" if top else "") +
               f", looking for opportunities in the {category.replace('-', ' ').title()} domain.")
    return {"headline": g.target_role, "summary": summary, "skills": skills,
            "experience": exp, "education": edu, "projects": proj}


def _api_error(e):
    """Google ka asli error message nikalta hai (status + message)."""
    try:
        d = json.loads(e.read().decode("utf8", "ignore"))["error"]
        return f"HTTP {e.code} {d.get('status', '')}: {d.get('message', '')}"[:400]
    except Exception:
        return f"HTTP {e.code}"


def _gemini(prompt, key, model=None, json_mode=True):
    model = model or os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.6, **({"responseMimeType": "application/json"} if json_mode else {})}}
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.load(r)
    parts = data["candidates"][0]["content"]["parts"]
    text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    return json.loads(text) if json_mode else text


@app.post("/api/test-llm")
def test_llm(x_gemini_key: str | None = Header(default=None), x_gemini_model: str | None = Header(default=None)):
    key = x_gemini_key or os.getenv("GEMINI_API_KEY")
    if not key:
        return {"ok": False, "detail": "No key set. Paste your key in Settings and press Save."}
    try:
        out = _gemini("Reply with the single word: OK", key, x_gemini_model, json_mode=False)
        return {"ok": True, "detail": "Key chal rahi hai. Gemini ka jawab: " + out.strip()[:40]}
    except urllib.error.HTTPError as e:
        return {"ok": False, "detail": _api_error(e)}
    except Exception as e:
        return {"ok": False, "detail": f"{type(e).__name__}: {str(e)[:200]} (check your internet connection)"}


@app.post("/api/generate")
def generate(g: GenIn, x_gemini_key: str | None = Header(default=None), x_gemini_model: str | None = Header(default=None)):
    _need_model()
    # 1) Classifier: resume ki domain/category pehchano
    src = g.existing_resume or f"{g.target_role}\n{g.skills}\n{g.experience}\n{g.projects}"
    top = trc.predict_top(src, title=g.target_role, k=3)
    category = g.category_override.strip() or top[0]["category"]
    manual = bool(g.category_override.strip())

    # 2) Generative AI: category ke hisaab se resume likhwao
    key = x_gemini_key or os.getenv("GEMINI_API_KEY")
    mode, note, resume = "template", "", None
    if key:
        prompt = f"""You are an expert resume writer. Write an ATS-friendly resume for the candidate below.
A trained classifier says this profile belongs to the "{category}" domain; use that domain's common keywords naturally.
STRICT RULES: use ONLY facts given by the candidate. Do NOT invent employers, degrees, dates, certifications or numbers.
You may rephrase and strengthen wording with action verbs. If details are thin, keep sections short instead of making things up.
Return ONLY JSON with this exact shape:
{{"headline": str, "summary": str (2-3 sentences),
 "skills": [str], "experience": [{{"role": str, "company": str, "period": str, "bullets": [str]}}],
 "education": [{{"degree": str, "institute": str, "period": str}}],
 "projects": [{{"name": str, "bullets": [str]}}]}}

Candidate:
Name: {g.name}
Target role: {g.target_role}
Skills: {g.skills}
Experience (Role | Company | Period | details):
{g.experience}
Education (Degree | Institute | Period):
{g.education}
Projects (Name | description):
{g.projects}
Existing resume text (optional, improve it):
{g.existing_resume[:4000]}
"""
        try:
            resume = _gemini(prompt, key, x_gemini_model)
            mode = "ai"
        except urllib.error.HTTPError as e:
            note = f"Gemini returned an error: {_api_error(e)}. Use Test key in Settings to check. A plain template was used."
        except Exception as e:
            note = f"AI writing failed ({type(e).__name__}: {str(e)[:150]}). A plain template was used."
    else:
        note = "No Gemini key found, so a plain template was used. Add a key in Settings (gear icon) for AI writing."
    if resume is None:
        resume = _template_resume(g, category)

    resume.update(name=g.name, email=g.email, phone=g.phone, location=g.location)
    return {"category": category, "top": top, "manual": manual, "mode": mode, "note": note, "resume": resume}


if __name__ == "__main__":
    import uvicorn
    print("\n  Resume AI Studio chalu: http://127.0.0.1:8000\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
