"""
Evaluate trained models with detailed metrics and visualizations.
"""
import os
import sys
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score
)

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.ml.advanced_preprocessing import load_and_analyze_data, preprocess_pipeline


def load_trained_model(model_dir='backend/models/trained'):
    """Load trained model artifacts."""
    print(f"\n{'='*60}")
    print("Loading Trained Model")
    print(f"{'='*60}")
    
    classifier_path = os.path.join(model_dir, 'classifier.pkl')
    vectorizer_path = os.path.join(model_dir, 'vectorizer.pkl')
    encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
    
    if not all(os.path.exists(p) for p in [classifier_path, vectorizer_path, encoder_path]):
        raise FileNotFoundError(
            f"Model files not found in {model_dir}. Please run train_models.py first."
        )
    
    with open(classifier_path, 'rb') as f:
        classifier = pickle.load(f)
    with open(vectorizer_path, 'rb') as f:
        vectorizer = pickle.load(f)
    with open(encoder_path, 'rb') as f:
        label_encoder = pickle.load(f)
    
    print(f"✓ Loaded classifier: {type(classifier).__name__}")
    print(f"✓ Loaded vectorizer: {type(vectorizer).__name__}")
    print(f"✓ Loaded label encoder with {len(label_encoder.classes_)} classes")
    
    return classifier, vectorizer, label_encoder


def evaluate_on_test_set(classifier, vectorizer, label_encoder, X_test, y_test):
    """Comprehensive evaluation on test set."""
    print(f"\n{'='*60}")
    print("Test Set Evaluation")
    print(f"{'='*60}")
    
    # Transform test data
    X_test_vec = vectorizer.transform(X_test)
    
    # Predictions
    y_pred = classifier.predict(X_test_vec)
    y_pred_proba = classifier.predict_proba(X_test_vec)
    
    # Overall metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    precision_weighted = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    recall_weighted = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print(f"\n📊 Overall Metrics:")
    print(f"   Accuracy:           {accuracy:.4f}")
    print(f"   Precision (macro):  {precision_macro:.4f}")
    print(f"   Precision (weighted): {precision_weighted:.4f}")
    print(f"   Recall (macro):     {recall_macro:.4f}")
    print(f"   Recall (weighted):  {recall_weighted:.4f}")
    print(f"   F1-Score (macro):   {f1_macro:.4f}")
    print(f"   F1-Score (weighted): {f1_weighted:.4f}")
    
    return {
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'accuracy': accuracy,
        'precision_macro': precision_macro,
        'precision_weighted': precision_weighted,
        'recall_macro': recall_macro,
        'recall_weighted': recall_weighted,
        'f1_macro': f1_macro,
        'f1_weighted': f1_weighted
    }


def per_class_analysis(y_test, y_pred, label_encoder):
    """Detailed per-class metrics."""
    print(f"\n{'='*60}")
    print("Per-Class Performance")
    print(f"{'='*60}")
    
    # Classification report
    report = classification_report(
        y_test, 
        y_pred, 
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0
    )
    
    # Convert to DataFrame for better display
    df_report = pd.DataFrame(report).transpose()
    df_report = df_report.sort_values('f1-score', ascending=False)
    
    # Display top and bottom performers
    print("\n🏆 Top 10 Categories by F1-Score:")
    top_10 = df_report.head(10)[['precision', 'recall', 'f1-score', 'support']]
    print(top_10.to_string())
    
    print("\n⚠️  Bottom 10 Categories by F1-Score:")
    bottom_10 = df_report.tail(10)[['precision', 'recall', 'f1-score', 'support']]
    print(bottom_10.to_string())
    
    return df_report


def confusion_matrix_analysis(y_test, y_pred, label_encoder, output_dir='backend/models/trained'):
    """Generate and save confusion matrix."""
    print(f"\n{'='*60}")
    print("Confusion Matrix Analysis")
    print(f"{'='*60}")
    
    cm = confusion_matrix(y_test, y_pred)
    
    # Save confusion matrix plot
    plt.figure(figsize=(20, 16))
    sns.heatmap(
        cm, 
        annot=True, 
        fmt='d', 
        cmap='Blues',
        xticklabels=label_encoder.classes_,
        yticklabels=label_encoder.classes_,
        cbar_kws={'label': 'Count'}
    )
    plt.title('Confusion Matrix - Resume Category Classification', fontsize=16, pad=20)
    plt.xlabel('Predicted Category', fontsize=12)
    plt.ylabel('True Category', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    output_path = os.path.join(output_dir, 'confusion_matrix.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ Confusion matrix saved to: {output_path}")
    plt.close()
    
    # Find most confused pairs
    np.fill_diagonal(cm, 0)
    most_confused_idx = np.unravel_index(cm.argmax(), cm.shape)
    most_confused_count = cm[most_confused_idx]
    
    print(f"\n🔍 Most Confused Pair:")
    print(f"   {label_encoder.classes_[most_confused_idx[0]]} → {label_encoder.classes_[most_confused_idx[1]]}")
    print(f"   Misclassifications: {most_confused_count}")
    
    return cm


def error_analysis(X_test, y_test, y_pred, y_pred_proba, label_encoder, top_n=10):
    """Analyze misclassified examples."""
    print(f"\n{'='*60}")
    print(f"Error Analysis - Top {top_n} Worst Predictions")
    print(f"{'='*60}")
    
    # Find misclassified examples
    misclassified_mask = y_test != y_pred
    misclassified_indices = np.where(misclassified_mask)[0]
    
    if len(misclassified_indices) == 0:
        print("No misclassifications found!")
        return
    
    # Get confidence of predicted class
    predicted_confidences = y_pred_proba[misclassified_indices].max(axis=1)
    
    # Sort by confidence (high confidence wrong predictions are worst)
    worst_indices = misclassified_indices[np.argsort(predicted_confidences)[::-1][:top_n]]
    
    print(f"\n⚠️  Found {len(misclassified_indices)} misclassifications")
    print(f"\nTop {top_n} high-confidence errors:\n")
    
    for i, idx in enumerate(worst_indices, 1):
        true_label = label_encoder.classes_[y_test[idx]]
        pred_label = label_encoder.classes_[y_pred[idx]]
        confidence = y_pred_proba[idx].max()
        resume_preview = X_test.iloc[idx][:200] + "..." if len(X_test.iloc[idx]) > 200 else X_test.iloc[idx]
        
        print(f"{i}. True: {true_label} | Predicted: {pred_label} | Confidence: {confidence:.2%}")
        print(f"   Resume preview: {resume_preview}")
        print()


def save_evaluation_report(metrics, per_class_df, output_dir='backend/models/trained'):
    """Save comprehensive evaluation report."""
    report_path = os.path.join(output_dir, 'evaluation_report.txt')
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("="*60 + "\n")
        f.write("MODEL EVALUATION REPORT\n")
        f.write("="*60 + "\n\n")
        
        f.write("OVERALL METRICS\n")
        f.write("-"*60 + "\n")
        f.write(f"Accuracy:            {metrics['accuracy']:.4f}\n")
        f.write(f"Precision (macro):   {metrics['precision_macro']:.4f}\n")
        f.write(f"Precision (weighted): {metrics['precision_weighted']:.4f}\n")
        f.write(f"Recall (macro):      {metrics['recall_macro']:.4f}\n")
        f.write(f"Recall (weighted):   {metrics['recall_weighted']:.4f}\n")
        f.write(f"F1-Score (macro):    {metrics['f1_macro']:.4f}\n")
        f.write(f"F1-Score (weighted): {metrics['f1_weighted']:.4f}\n\n")
        
        f.write("PER-CLASS METRICS\n")
        f.write("-"*60 + "\n")
        f.write(per_class_df.to_string())
        f.write("\n")
    
    print(f"\n✓ Evaluation report saved to: {report_path}")


def main():
    """Main evaluation pipeline."""
    print("\n" + "="*60)
    print("RESUME CATEGORY CLASSIFICATION - MODEL EVALUATION")
    print("="*60)
    
    # Load data
    df = load_and_analyze_data('Resume.csv')
    
    # Preprocess
    X_train, X_test, y_train, y_test, label_encoder = preprocess_pipeline(df)
    
    # Load trained model
    classifier, vectorizer, loaded_encoder = load_trained_model()
    
    # Evaluate on test set
    metrics = evaluate_on_test_set(classifier, vectorizer, label_encoder, X_test, y_test)
    
    # Per-class analysis
    per_class_df = per_class_analysis(y_test, metrics['y_pred'], label_encoder)
    
    # Confusion matrix
    confusion_matrix_analysis(y_test, metrics['y_pred'], label_encoder)
    
    # Error analysis
    error_analysis(X_test, y_test, metrics['y_pred'], metrics['y_pred_proba'], label_encoder)
    
    # Save report
    save_evaluation_report(metrics, per_class_df)
    
    print(f"\n{'='*60}")
    print("✅ EVALUATION COMPLETE")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
