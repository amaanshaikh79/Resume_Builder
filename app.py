"""
Resume AI Studio - FastAPI backend + UI
Run : python app.py        (phir browser me http://127.0.0.1:8000 kholo)
"""
import io, json, os, re, threading, zipfile, urllib.request, urllib.error
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import train_resume_classifier as trc

BASE = Path(__file__).parent
app = FastAPI(title="Resume AI Studio")
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")

TRAIN = {"status": "idle", "log": [], "error": None}   # training ki live state
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
        TRAIN["status"] = "done"
    except Exception as e:
        TRAIN.update(status="error", error=str(e))
        TRAIN["log"].append("ERROR: " + str(e))


@app.post("/api/train")
async def start_training(file: UploadFile | None = File(default=None)):
    if TRAIN["status"] == "running":
        raise HTTPException(409, "Training pehle se chal rahi hai")
    if file is not None and file.filename:
        path = BASE / "uploaded_dataset.csv"
        path.write_bytes(await file.read())
    else:
        path = find_dataset()
        if path is None:
            raise HTTPException(400, "Dataset nahi mila. Resume_csv.xls is folder me rakho ya CSV upload karo.")
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
        raise HTTPException(400, "Model abhi train nahi hua. Pehle Dashboard me 'Train model' dabao.")


@app.post("/api/predict")
def predict(body: TextIn):
    _need_model()
    if len(body.text.split()) < 8:
        raise HTTPException(400, "Resume text bahut chhota hai. Kam se kam kuch lines daalo.")
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
        raise HTTPException(400, f"File padh nahi paye: {e}")
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        raise HTTPException(400, "File me text nahi mila (scanned PDF ho sakta hai).")
    return {"text": text}


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
        return {"ok": False, "detail": "Key nahi daali. Pehle key paste karke Save dabao."}
    try:
        out = _gemini("Reply with the single word: OK", key, x_gemini_model, json_mode=False)
        return {"ok": True, "detail": "Key chal rahi hai. Gemini ka jawab: " + out.strip()[:40]}
    except urllib.error.HTTPError as e:
        return {"ok": False, "detail": _api_error(e)}
    except Exception as e:
        return {"ok": False, "detail": f"{type(e).__name__}: {str(e)[:200]} (internet check karo)"}


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
            note = f"Gemini ne error diya -> {_api_error(e)} | Settings me 'Test key' dabake check karo. Template mode use hua."
        except Exception as e:
            note = f"AI generation fail hui ({type(e).__name__}: {str(e)[:150]}). Template mode use hua."
    else:
        note = "Gemini API key nahi mili, isliye simple template mode use hua. AI writing ke liye Settings me key daalo."
    if resume is None:
        resume = _template_resume(g, category)

    resume.update(name=g.name, email=g.email, phone=g.phone, location=g.location)
    return {"category": category, "top": top, "manual": manual, "mode": mode, "note": note, "resume": resume}


if __name__ == "__main__":
    import uvicorn
    print("\n  Resume AI Studio chalu: http://127.0.0.1:8000\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
