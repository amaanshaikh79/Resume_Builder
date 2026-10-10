import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, classification_report, confusion_matrix
)
import joblib
import json
from datetime import datetime
from pathlib import Path
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.preprocessing import load_and_preprocess_data, clean_text


def train_model():
    """Train the resume category classification model"""
    
    # Paths
    data_path = Path(__file__).parent.parent.parent / "data" / "Resume.csv"
    models_dir = Path(__file__).parent.parent.parent / "models" / "trained"
    metadata_dir = Path(__file__).parent.parent.parent / "models" / "metadata"
    
    # Create directories
    models_dir.mkdir(parents=True, exist_ok=True)
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    print("="*60)
    print("AI RESUME BUILDER - ML TRAINING PIPELINE")
    print("="*60)
    
    # Load and preprocess data
    df, X, y = load_and_preprocess_data(str(data_path))
    
    # Encode labels
    print("\nEncoding labels...")
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    print(f"Number of classes: {len(label_encoder.classes_)}")
    print(f"Classes: {label_encoder.classes_}")
    
    # Split data
    print("\nSplitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X['cleaned_text'], 
        y_encoded, 
        test_size=0.2, 
        random_state=42, 
        stratify=y_encoded
    )
    
    print(f"Training set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")
    
    # Vectorize text
    print("\nVectorizing text with TF-IDF...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        min_df=2,
        max_df=0.8,
        ngram_range=(1, 2),
        stop_words='english'
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"Feature matrix shape: {X_train_vec.shape}")
    
    # Train model
    print("\nTraining Logistic Regression model...")
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        multi_class='multinomial',
        solver='lbfgs',
        n_jobs=-1
    )
    
    model.fit(X_train_vec, y_train)
    
    # Evaluate
    print("\n" + "="*60)
    print("MODEL EVALUATION")
    print("="*60)
    
    y_pred = model.predict(X_test_vec)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='macro', zero_division=0)
    recall = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    
    print(f"\nAccuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    
    # Cross-validation
    print("\nPerforming 5-fold cross-validation...")
    cv_scores = cross_val_score(model, X_train_vec, y_train, cv=5, n_jobs=-1)
    print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(
        y_test, 
        y_pred, 
        target_names=label_encoder.classes_,
        zero_division=0
    ))
    
    # Save model artifacts
    print("\n" + "="*60)
    print("SAVING MODEL ARTIFACTS")
    print("="*60)
    
    model_path = models_dir / "classifier.pkl"
    vectorizer_path = models_dir / "vectorizer.pkl"
    label_encoder_path = models_dir / "label_encoder.pkl"
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(label_encoder, label_encoder_path)
    
    print(f"✓ Model saved: {model_path}")
    print(f"✓ Vectorizer saved: {vectorizer_path}")
    print(f"✓ Label encoder saved: {label_encoder_path}")
    
    # Save metadata
    metadata = {
        "model_name": "resume_category_classifier",
        "algorithm": "logistic_regression",
        "trained_at": datetime.utcnow().isoformat(),
        "dataset_size": len(df),
        "training_size": len(X_train),
        "test_size": len(X_test),
        "num_features": X_train_vec.shape[1],
        "num_categories": len(label_encoder.classes_),
        "categories": label_encoder.classes_.tolist(),
        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "cv_accuracy_mean": float(cv_scores.mean()),
            "cv_accuracy_std": float(cv_scores.std())
        },
        "hyperparameters": {
            "max_features": 5000,
            "min_df": 2,
            "max_df": 0.8,
            "ngram_range": [1, 2],
            "max_iter": 1000
        }
    }
    
    metadata_path = metadata_dir / "model_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✓ Metadata saved: {metadata_path}")
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    
    return metadata


if __name__ == "__main__":
    train_model()
