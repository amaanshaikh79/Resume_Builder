import joblib
import json
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np
from .preprocessing import clean_text


class ResumeCategoryPredictor:
    """Resume category prediction service"""
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.metadata = None
        self._load_models()
    
    def _load_models(self):
        """Load trained models and metadata"""
        models_dir = Path(__file__).parent.parent.parent / "models" / "trained"
        metadata_dir = Path(__file__).parent.parent.parent / "models" / "metadata"
        
        model_path = models_dir / "classifier.pkl"
        vectorizer_path = models_dir / "vectorizer.pkl"
        label_encoder_path = models_dir / "label_encoder.pkl"
        metadata_path = metadata_dir / "model_metadata.json"
        
        if not model_path.exists():
            raise FileNotFoundError(
                "ML model not found. Please train the model first by running: "
                "python -m app.ml.train"
            )
        
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        self.label_encoder = joblib.load(label_encoder_path)
        
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
    
    def predict(self, resume_text: str) -> Dict:
        """
        Predict job category for resume text
        
        Args:
            resume_text: Raw resume text
            
        Returns:
            Dict with predicted_category, confidence, and top_predictions
        """
        # Clean text
        cleaned_text = clean_text(resume_text)
        
        if len(cleaned_text) < 10:
            return {
                "predicted_category": "UNKNOWN",
                "confidence": 0.0,
                "top_predictions": []
            }
        
        # Vectorize
        text_vec = self.vectorizer.transform([cleaned_text])
        
        # Predict
        prediction = self.model.predict(text_vec)[0]
        probabilities = self.model.predict_proba(text_vec)[0]
        
        # Get predicted category
        predicted_category = self.label_encoder.inverse_transform([prediction])[0]
        confidence = float(probabilities[prediction])
        
        # Get top predictions
        top_indices = np.argsort(probabilities)[::-1][:5]
        top_predictions = [
            {
                "category": self.label_encoder.inverse_transform([idx])[0],
                "confidence": float(probabilities[idx])
            }
            for idx in top_indices
        ]
        
        return {
            "predicted_category": predicted_category,
            "confidence": confidence,
            "top_predictions": top_predictions
        }
    
    def get_metadata(self) -> Dict:
        """Get model metadata"""
        return self.metadata if self.metadata else {}
    
    def get_categories(self) -> List[str]:
        """Get all available categories"""
        return self.label_encoder.classes_.tolist()


# Singleton instance
_predictor_instance = None


def get_predictor() -> ResumeCategoryPredictor:
    """Get or create predictor instance"""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = ResumeCategoryPredictor()
    return _predictor_instance
