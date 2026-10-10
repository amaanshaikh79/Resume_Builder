"""
Standalone prediction script for resume category classification.
Usage: python scripts/predict.py --resume "Your resume text here"
       python scripts/predict.py --file path/to/resume.txt
"""
import os
import sys
import pickle
import argparse
from typing import Dict, List, Tuple

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.ml.advanced_preprocessing import normalize_text, clean_html


def load_model(model_dir='backend/models/trained'):
    """Load trained model artifacts."""
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
    
    return classifier, vectorizer, label_encoder


def preprocess_resume(resume_text: str) -> str:
    """Preprocess resume text for prediction."""
    # Clean HTML if present
    cleaned = clean_html(resume_text)
    # Normalize text
    normalized = normalize_text(cleaned)
    return normalized


def predict_category(
    resume_text: str,
    classifier,
    vectorizer,
    label_encoder,
    top_k: int = 5
) -> Dict:
    """
    Predict resume category with confidence scores.
    
    Args:
        resume_text: Raw resume text
        classifier: Trained classifier model
        vectorizer: Fitted TF-IDF vectorizer
        label_encoder: Fitted label encoder
        top_k: Number of top predictions to return
    
    Returns:
        Dictionary with prediction results
    """
    # Preprocess
    processed_text = preprocess_resume(resume_text)
    
    # Vectorize
    X = vectorizer.transform([processed_text])
    
    # Predict
    predicted_class = classifier.predict(X)[0]
    predicted_category = label_encoder.classes_[predicted_class]
    
    # Get probabilities for all classes
    probabilities = classifier.predict_proba(X)[0]
    
    # Get top k predictions
    top_k_indices = probabilities.argsort()[-top_k:][::-1]
    top_k_predictions = [
        {
            'category': label_encoder.classes_[idx],
            'confidence': float(probabilities[idx])
        }
        for idx in top_k_indices
    ]
    
    return {
        'predicted_category': predicted_category,
        'confidence': float(probabilities[predicted_class]),
        'top_predictions': top_k_predictions,
        'processed_length': len(processed_text)
    }


def display_prediction(result: Dict):
    """Display prediction results in a formatted way."""
    print("\n" + "="*60)
    print("RESUME CATEGORY PREDICTION")
    print("="*60)
    
    print(f"\n🎯 Predicted Category: {result['predicted_category']}")
    print(f"   Confidence: {result['confidence']:.2%}")
    
    print(f"\n📊 Top {len(result['top_predictions'])} Predictions:")
    for i, pred in enumerate(result['top_predictions'], 1):
        bar_length = int(pred['confidence'] * 40)
        bar = "█" * bar_length + "░" * (40 - bar_length)
        print(f"   {i}. {pred['category']:<30} {bar} {pred['confidence']:.2%}")
    
    print(f"\n📝 Processed text length: {result['processed_length']} characters")
    print("="*60 + "\n")


def predict_batch(resume_texts: List[str], classifier, vectorizer, label_encoder) -> List[Dict]:
    """Predict categories for multiple resumes."""
    results = []
    for i, resume_text in enumerate(resume_texts, 1):
        print(f"Processing resume {i}/{len(resume_texts)}...")
        result = predict_category(resume_text, classifier, vectorizer, label_encoder)
        results.append(result)
    return results


def main():
    """Main prediction CLI."""
    parser = argparse.ArgumentParser(
        description='Predict resume category from text',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/predict.py --resume "Software Engineer with 5 years experience in Python..."
  python scripts/predict.py --file resume.txt
  python scripts/predict.py --file resume.txt --top-k 10
        """
    )
    parser.add_argument(
        '--resume',
        type=str,
        help='Resume text to classify'
    )
    parser.add_argument(
        '--file',
        type=str,
        help='Path to file containing resume text'
    )
    parser.add_argument(
        '--top-k',
        type=int,
        default=5,
        help='Number of top predictions to show (default: 5)'
    )
    parser.add_argument(
        '--model-dir',
        type=str,
        default='backend/models/trained',
        help='Directory containing trained model files'
    )
    
    args = parser.parse_args()
    
    # Validate input
    if not args.resume and not args.file:
        parser.error("Either --resume or --file must be provided")
    
    if args.resume and args.file:
        parser.error("Provide either --resume or --file, not both")
    
    # Get resume text
    if args.file:
        if not os.path.exists(args.file):
            print(f"❌ Error: File not found: {args.file}")
            sys.exit(1)
        
        with open(args.file, 'r', encoding='utf-8', errors='ignore') as f:
            resume_text = f.read()
        
        print(f"📄 Loaded resume from: {args.file}")
    else:
        resume_text = args.resume
    
    # Load model
    print(f"🔄 Loading model from: {args.model_dir}")
    try:
        classifier, vectorizer, label_encoder = load_model(args.model_dir)
        print(f"✓ Model loaded successfully")
        print(f"  Algorithm: {type(classifier).__name__}")
        print(f"  Categories: {len(label_encoder.classes_)}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        sys.exit(1)
    
    # Make prediction
    print("\n🔄 Making prediction...")
    try:
        result = predict_category(
            resume_text,
            classifier,
            vectorizer,
            label_encoder,
            top_k=args.top_k
        )
        display_prediction(result)
    except Exception as e:
        print(f"❌ Error making prediction: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
