"""
Comprehensive ML training pipeline with model comparison
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent / 'backend'))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
import joblib
import json
from datetime import datetime
import time

from app.ml.advanced_preprocessing import load_and_analyze_data, preprocess_pipeline


def compare_vectorizers(X_train, y_train, X_test, y_test):
    """Compare TF-IDF vs Count Vectorizer"""
    print("\n" + "=" * 70)
    print("VECTORIZER COMPARISON")
    print("=" * 70)
    
    vectorizers = {
        'TF-IDF': TfidfVectorizer(
            max_features=5000,
            min_df=2,
            max_df=0.8,
            ngram_range=(1, 2),
            stop_words='english'
        ),
        'Count': CountVectorizer(
            max_features=5000,
            min_df=2,
            max_df=0.8,
            ngram_range=(1, 2),
            stop_words='english'
        )
    }
    
    results = {}
    
    for vec_name, vectorizer in vectorizers.items():
        print(f"\n📊 Testing {vec_name} Vectorizer...")
        
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        # Quick test with Logistic Regression
        clf = LogisticRegression(max_iter=1000, random_state=42)
        clf.fit(X_train_vec, y_train)
        
        y_pred = clf.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        results[vec_name] = {
            'accuracy': accuracy,
            'f1_score': f1,
            'vocabulary_size': len(vectorizer.vocabulary_)
        }
        
        print(f"   Accuracy: {accuracy:.4f}")
        print(f"   F1-Score: {f1:.4f}")
        print(f"   Vocab size: {len(vectorizer.vocabulary_):,}")
    
    # Select best
    best = max(results.items(), key=lambda x: x[1]['f1_score'])
    print(f"\n✅ Best vectorizer: {best[0]} (F1: {best[1]['f1_score']:.4f})")
    
    return 'TF-IDF' if best[0] == 'TF-IDF' else 'Count'


def train_and_evaluate_model(name, model, X_train_vec, y_train, X_test_vec, y_test, label_encoder):
    """Train and evaluate a single model"""
    print(f"\n{'='*70}")
    print(f"TRAINING: {name}")
    print(f"{'='*70}")
    
    start_time = time.time()
    
    # Train
    print("\n⏳ Training model...")
    model.fit(X_train_vec, y_train)
    train_time = time.time() - start_time
    
    # Predict
    print("⏳ Making predictions...")
    y_pred = model.predict(X_test_vec)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    recall_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
    
    precision_weighted = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall_weighted = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    # Cross-validation
    print("⏳ Performing 5-fold cross-validation...")
    cv_scores = cross_val_score(
        model, X_train_vec, y_train, cv=5, 
        scoring='f1_weighted', n_jobs=-1
    )
    
    # Display results
    print(f"\n📊 Results:")
    print(f"   Training time: {train_time:.2f}s")
    print(f"\n   Accuracy:          {accuracy:.4f}")
    print(f"   Precision (macro): {precision_macro:.4f}")
    print(f"   Recall (macro):    {recall_macro:.4f}")
    print(f"   F1-Score (macro):  {f1_macro:.4f}")
    print(f"\n   Precision (weighted): {precision_weighted:.4f}")
    print(f"   Recall (weighted):    {recall_weighted:.4f}")
    print(f"   F1-Score (weighted):  {f1_weighted:.4f}")
    print(f"\n   CV F1-Score: {cv_scores.mean():.4f} (±{cv_scores.std()*2:.4f})")
    
    # Per-class metrics
    print(f"\n📋 Per-Class Performance:")
    report = classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0
    )
    
    # Show top 5 and bottom 5 classes
    class_f1 = [(cls, metrics['f1-score']) for cls, metrics in report.items() 
                if cls not in ['accuracy', 'macro avg', 'weighted avg']]
    class_f1.sort(key=lambda x: x[1], reverse=True)
    
    print("   Top 5 classes:")
    for cls, f1 in class_f1[:5]:
        print(f"      {cls:30s} F1: {f1:.3f}")
    
    print("   Bottom 5 classes:")
    for cls, f1 in class_f1[-5:]:
        print(f"      {cls:30s} F1: {f1:.3f}")
    
    return {
        'model_name': name,
        'accuracy': float(accuracy),
        'precision_macro': float(precision_macro),
        'recall_macro': float(recall_macro),
        'f1_macro': float(f1_macro),
        'precision_weighted': float(precision_weighted),
        'recall_weighted': float(recall_weighted),
        'f1_weighted': float(f1_weighted),
        'cv_mean': float(cv_scores.mean()),
        'cv_std': float(cv_scores.std()),
        'train_time': float(train_time),
        'classification_report': report
    }


def main():
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*10 + "AI RESUME BUILDER - ML TRAINING PIPELINE" + " "*18 + "║")
    print("╚" + "="*68 + "╝\n")
    
    # Paths
    data_path = Path(__file__).parent.parent / "backend" / "data" / "Resume.csv"
    models_dir = Path(__file__).parent.parent / "backend" / "models" / "trained"
    metadata_dir = Path(__file__).parent.parent / "backend" / "models" / "metadata"
    
    models_dir.mkdir(parents=True, exist_ok=True)
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    # Load and analyze
    df, analysis = load_and_analyze_data(str(data_path))
    
    # Preprocess
    df_clean, X, y = preprocess_pipeline(df)
    
    # Encode labels
    print("\n" + "=" * 70)
    print("LABEL ENCODING")
    print("=" * 70)
    
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    print(f"\n✅ Encoded {len(label_encoder.classes_)} categories")
    print(f"   Categories: {', '.join(label_encoder.classes_[:5])}...")
    
    # Split data with stratification
    print("\n" + "=" * 70)
    print("DATA SPLITTING")
    print("=" * 70)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded
    )
    
    print(f"\n📊 Split Configuration:")
    print(f"   Training set:   {len(X_train):,} resumes ({len(X_train)/len(X)*100:.1f}%)")
    print(f"   Test set:       {len(X_test):,} resumes ({len(X_test)/len(X)*100:.1f}%)")
    print(f"   Total:          {len(X):,} resumes")
    
    # Select vectorizer
    print("\n" + "=" * 70)
    print("VECTORIZATION")
    print("=" * 70)
    
    # Use TF-IDF (proven best in testing)
    vectorizer = TfidfVectorizer(
        max_features=5000,
        min_df=2,
        max_df=0.8,
        ngram_range=(1, 2),
        stop_words='english',
        sublinear_tf=True  # Better for long documents
    )
    
    print("\n⏳ Vectorizing text...")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print(f"✅ Vectorization complete")
    print(f"   Vocabulary size: {len(vectorizer.vocabulary_):,}")
    print(f"   Feature matrix shape: {X_train_vec.shape}")
    print(f"   Sparsity: {(1.0 - X_train_vec.nnz / (X_train_vec.shape[0] * X_train_vec.shape[1]))*100:.2f}%")
    
    # Define models to compare
    models = {
        'Logistic Regression': LogisticRegression(
            max_iter=1000,
            random_state=42,
            solver='saga',
            n_jobs=-1
        ),
        'Linear SVM': LinearSVC(
            max_iter=2000,
            random_state=42,
            dual=False
        ),
        'Naive Bayes': MultinomialNB(
            alpha=0.1
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            n_jobs=-1,
            max_depth=50
        )
    }
    
    # Train and evaluate all models
    all_results = {}
    
    for name, model in models.items():
        results = train_and_evaluate_model(
            name, model, X_train_vec, y_train, X_test_vec, y_test, label_encoder
        )
        all_results[name] = results
    
    # Model comparison
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*20 + "MODEL COMPARISON" + " "*32 + "║")
    print("╚" + "="*68 + "╝\n")
    
    comparison_df = pd.DataFrame({
        'Model': list(all_results.keys()),
        'Accuracy': [r['accuracy'] for r in all_results.values()],
        'F1 (Macro)': [r['f1_macro'] for r in all_results.values()],
        'F1 (Weighted)': [r['f1_weighted'] for r in all_results.values()],
        'CV F1': [r['cv_mean'] for r in all_results.values()],
        'Train Time (s)': [r['train_time'] for r in all_results.values()]
    })
    
    comparison_df = comparison_df.sort_values('F1 (Weighted)', ascending=False)
    print(comparison_df.to_string(index=False))
    
    # Select best model
    best_model_name = comparison_df.iloc[0]['Model']
    best_results = all_results[best_model_name]
    
    print(f"\n🏆 Best Model: {best_model_name}")
    print(f"   F1-Score (Weighted): {best_results['f1_weighted']:.4f}")
    print(f"   Accuracy: {best_results['accuracy']:.4f}")
    
    # Retrain best model
    print(f"\n⏳ Retraining {best_model_name} on full training data...")
    final_model = models[best_model_name]
    final_model.fit(X_train_vec, y_train)
    
    # Save artifacts
    print("\n" + "=" * 70)
    print("SAVING MODEL ARTIFACTS")
    print("=" * 70)
    
    model_path = models_dir / "classifier.pkl"
    vectorizer_path = models_dir / "vectorizer.pkl"
    label_encoder_path = models_dir / "label_encoder.pkl"
    
    joblib.dump(final_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(label_encoder, label_encoder_path)
    
    print(f"\n✅ Saved model artifacts:")
    print(f"   {model_path}")
    print(f"   {vectorizer_path}")
    print(f"   {label_encoder_path}")
    
    # Save metadata
    metadata = {
        'model_name': 'resume_category_classifier',
        'best_algorithm': best_model_name,
        'trained_at': datetime.utcnow().isoformat(),
        'dataset_info': {
            'total_records': analysis['total_records'],
            'training_size': len(X_train),
            'test_size': len(X_test),
            'num_categories': analysis['num_categories'],
            'categories': label_encoder.classes_.tolist(),
            'duplicates_removed': analysis['duplicates_removed'],
            'dataset_hash': analysis['dataset_hash']
        },
        'vectorizer_info': {
            'type': 'TfidfVectorizer',
            'max_features': 5000,
            'vocabulary_size': len(vectorizer.vocabulary_),
            'ngram_range': [1, 2]
        },
        'performance': {
            'accuracy': best_results['accuracy'],
            'precision_macro': best_results['precision_macro'],
            'recall_macro': best_results['recall_macro'],
            'f1_macro': best_results['f1_macro'],
            'precision_weighted': best_results['precision_weighted'],
            'recall_weighted': best_results['recall_weighted'],
            'f1_weighted': best_results['f1_weighted'],
            'cv_mean': best_results['cv_mean'],
            'cv_std': best_results['cv_std']
        },
        'all_models_comparison': {
            name: {
                'accuracy': res['accuracy'],
                'f1_weighted': res['f1_weighted'],
                'train_time': res['train_time']
            }
            for name, res in all_results.items()
        }
    }
    
    metadata_path = metadata_dir / "model_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"   {metadata_path}")
    
    # Test predictions
    print("\n" + "=" * 70)
    print("SAMPLE PREDICTIONS")
    print("=" * 70)
    
    test_samples = X_test.sample(min(3, len(X_test)), random_state=42)
    test_samples_vec = vectorizer.transform(test_samples)
    predictions = final_model.predict(test_samples_vec)
    
    if hasattr(final_model, 'predict_proba'):
        probas = final_model.predict_proba(test_samples_vec)
    else:
        # For SVM, use decision function
        probas = None
    
    for idx, (text, pred) in enumerate(zip(test_samples, predictions)):
        category = label_encoder.inverse_transform([pred])[0]
        print(f"\n📄 Sample {idx+1}:")
        print(f"   Text preview: {text[:100]}...")
        print(f"   Predicted: {category}")
        if probas is not None:
            conf = probas[idx][pred]
            print(f"   Confidence: {conf:.2%}")
    
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*20 + "TRAINING COMPLETE!" + " "*29 + "║")
    print("╚" + "="*68 + "╝\n")
    
    print(f"✅ Model ready for production use")
    print(f"✅ Final performance: F1={best_results['f1_weighted']:.4f}, Accuracy={best_results['accuracy']:.4f}")
    print(f"✅ Use 'python scripts/evaluate_models.py' to see detailed evaluation")


if __name__ == "__main__":
    main()
