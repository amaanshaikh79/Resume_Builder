"""
Resume Category Classifier (TF-IDF + LinearSVC)
CLI : python train_resume_classifier.py --data Resume_csv.xls
App : app.py isko import karke train() / predict_top() use karta hai
"""
import argparse, re, json, datetime
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import ComplementNB
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix

BASE = Path(__file__).parent
MODEL_PATH = BASE / "resume_classifier.joblib"
METRICS_PATH = BASE / "metrics.json"


def clean(t):
    t = str(t).lower()
    t = re.sub(r"http\S+|www\.\S+|\S+@\S+", " ", t)   # url + email hatao
    t = re.sub(r"[^a-z\s]", " ", t)                    # digits/punctuation hatao
    return re.sub(r"\s+", " ", t).strip()


def first_line(text):
    return clean(str(text).strip().split("\n")[0][:120])


def load(path):
    df = pd.read_csv(path)
    if not {"Resume_str", "Category"}.issubset(df.columns):
        raise ValueError("CSV me 'Resume_str' aur 'Category' columns hone chahiye. Mile: %s" % list(df.columns))
    df = df[["Resume_str", "Category"]].dropna().drop_duplicates(subset="Resume_str")
    df["title"] = df["Resume_str"].map(first_line)     # resume ki pehli line = job title
    df["text"] = df["Resume_str"].map(clean)
    df = df[df["text"].str.split().str.len() >= 20]    # empty resumes hatao
    return df.reset_index(drop=True)


def make_pipeline(clf):
    feats = ColumnTransformer([
        ("body", TfidfVectorizer(ngram_range=(1, 2), min_df=3, max_df=0.9,
                                 sublinear_tf=True, stop_words="english"), "text"),
        ("title", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True), "title"),
    ])
    return Pipeline([("features", feats), ("clf", clf)])


def train(path, log=print):
    """Train + test, model aur metrics.json save karta hai, metrics dict return karta hai."""
    log(f"Dataset load ho raha hai: {path}")
    df = load(path)
    counts = df["Category"].value_counts().to_dict()
    log(f"Rows (cleaning ke baad): {len(df)} | Categories: {df['Category'].nunique()}")

    train_df, test_df = train_test_split(df, test_size=0.20, stratify=df["Category"], random_state=42)
    log(f"Split -> Train: {len(train_df)} (80%) | Test: {len(test_df)} (20%)")

    candidates = {
        "LinearSVC": LinearSVC(C=0.5, class_weight="balanced"),
        "LogReg":    LogisticRegression(C=20, max_iter=3000, class_weight="balanced"),
        "CompNB":    ComplementNB(alpha=0.3),
    }
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    for name, clf in candidates.items():
        log(f"[{name}] 5-fold cross-validation + training...")
        pipe = make_pipeline(clf)
        cv = cross_val_score(pipe, train_df, train_df["Category"], cv=skf, scoring="f1_macro", n_jobs=1)
        pipe.fit(train_df, train_df["Category"])
        pred = pipe.predict(test_df)
        results[name] = {"cv_f1_macro": round(float(cv.mean()), 4),
                         "test_accuracy": round(float(accuracy_score(test_df["Category"], pred)), 4),
                         "test_f1_macro": round(float(f1_score(test_df["Category"], pred, average="macro")), 4)}
        log(f"[{name}] CV F1={results[name]['cv_f1_macro']}  Test Accuracy={results[name]['test_accuracy']}")

    best = max(results, key=lambda k: results[k]["cv_f1_macro"])   # selection CV par, test par nahi
    log(f"Best model: {best}")
    final = make_pipeline(candidates[best]).fit(train_df, train_df["Category"])
    pred = final.predict(test_df)
    report = classification_report(test_df["Category"], pred, zero_division=0, output_dict=True)
    labels = list(final.classes_)
    cm = confusion_matrix(test_df["Category"], pred, labels=labels)

    joblib.dump(final, MODEL_PATH)
    metrics = {
        "trained_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "dataset": Path(path).name, "rows": int(len(df)), "n_classes": len(labels),
        "train_size": int(len(train_df)), "test_size": int(len(test_df)),
        "class_counts": counts, "models": results, "best_model": best,
        "test_accuracy": results[best]["test_accuracy"], "test_f1_macro": results[best]["test_f1_macro"],
        "per_class": {k: {m: round(float(v[m]), 3) for m in ("precision", "recall", "f1-score")} | {"support": int(v["support"])}
                      for k, v in report.items() if k in labels},
        "labels": labels, "confusion_matrix": cm.tolist(),
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    log(f"Final Test Accuracy: {metrics['test_accuracy']*100:.1f}%  | Macro F1: {metrics['test_f1_macro']}")
    log("Model save ho gaya: resume_classifier.joblib, metrics.json")
    return metrics


_model = None
def load_model(force=False):
    global _model
    if _model is None or force:
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_top(text, title=None, k=3):
    """Top-k categories + confidence (0-1) return karta hai."""
    m = load_model()
    row = pd.DataFrame({"text": [clean(text)],
                        "title": [clean(title) if title else first_line(text)]})
    clf = m.named_steps["clf"]
    if hasattr(clf, "decision_function"):
        s = m.decision_function(row)[0]
        e = np.exp((s - s.max()) * 8)          # softmax (relative confidence)
        p = e / e.sum()
    else:
        p = m.predict_proba(row)[0]
    idx = np.argsort(p)[::-1][:k]
    return [{"category": str(m.classes_[i]), "score": round(float(p[i]), 4)} for i in idx]


def predict(resume_text):
    return predict_top(resume_text, k=1)[0]["category"]


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="Resume_csv.xls")
    train(ap.parse_args().data)
