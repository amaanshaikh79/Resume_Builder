"""
Enhanced prediction module with full ML capabilities.
Integrates category classification, skill extraction, and job matching.
"""
import joblib
import json
import pickle
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np

from .advanced_preprocessing import normalize_text, clean_html
from .skill_extraction import SkillExtractor, extract_skills_from_resume
from .job_matching import JobMatcher, calculate_job_match


class EnhancedResumePredictor:
    """
    Enhanced resume prediction service with:
    - Category classification
    - Skill extraction
    - Job matching
    - Resume analysis
    """
    
    def __init__(self):
        """Initialize predictor with all ML components."""
        self.classifier = None
        self.vectorizer = None
        self.label_encoder = None
        self.metadata = None
        self.skill_extractor = SkillExtractor()
        self.job_matcher = JobMatcher()
        self._load_models()
    
    def _load_models(self):
        """Load trained models and metadata."""
        models_dir = Path(__file__).parent.parent.parent / "models" / "trained"
        
        classifier_path = models_dir / "classifier.pkl"
        vectorizer_path = models_dir / "vectorizer.pkl"
        label_encoder_path = models_dir / "label_encoder.pkl"
        metadata_path = models_dir / "metadata.json"
        
        if not classifier_path.exists():
            raise FileNotFoundError(
                "ML model not found. Please train the model first by running: "
                "python scripts/train_models.py"
            )
        
        # Load with pickle (same as training script)
        with open(classifier_path, 'rb') as f:
            self.classifier = pickle.load(f)
        with open(vectorizer_path, 'rb') as f:
            self.vectorizer = pickle.load(f)
        with open(label_encoder_path, 'rb') as f:
            self.label_encoder = pickle.load(f)
        
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
    
    def predict_category(self, resume_text: str, top_k: int = 5) -> Dict:
        """
        Predict job category with confidence scores.
        
        Args:
            resume_text: Raw resume text
            top_k: Number of top predictions to return
        
        Returns:
            Dictionary with prediction results
        """
        # Preprocess text
        cleaned_text = normalize_text(clean_html(resume_text))
        
        if len(cleaned_text) < 10:
            return {
                "predicted_category": "UNKNOWN",
                "confidence": 0.0,
                "top_predictions": [],
                "error": "Resume text too short"
            }
        
        # Vectorize
        text_vec = self.vectorizer.transform([cleaned_text])
        
        # Predict
        prediction = self.classifier.predict(text_vec)[0]
        probabilities = self.classifier.predict_proba(text_vec)[0]
        
        # Get predicted category
        predicted_category = self.label_encoder.classes_[prediction]
        confidence = float(probabilities[prediction])
        
        # Get top k predictions
        top_indices = np.argsort(probabilities)[::-1][:top_k]
        top_predictions = [
            {
                "category": self.label_encoder.classes_[idx],
                "confidence": float(probabilities[idx])
            }
            for idx in top_indices
        ]
        
        return {
            "predicted_category": predicted_category,
            "confidence": confidence,
            "top_predictions": top_predictions
        }
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """
        Comprehensive resume analysis.
        
        Args:
            resume_text: Raw resume text
        
        Returns:
            Complete analysis including category, skills, and experience
        """
        # Category prediction
        category_result = self.predict_category(resume_text)
        
        # Skill extraction
        skills = self.skill_extractor.extract_skills(resume_text)
        skill_level = self.skill_extractor.get_skill_level(skills)
        
        # Experience extraction
        experience = self.skill_extractor.extract_years_of_experience(resume_text)
        
        return {
            "category": category_result,
            "skills": skills,
            "skill_level": skill_level,
            "experience": experience,
            "summary": {
                "predicted_category": category_result["predicted_category"],
                "confidence": category_result["confidence"],
                "total_skills": skills["total_skills"],
                "skill_level": skill_level,
                "years_experience": experience.get("total_years"),
                "experience_level": experience.get("level")
            }
        }
    
    def match_with_job(
        self,
        resume_text: str,
        job_description: str,
        include_suggestions: bool = True
    ) -> Dict:
        """
        Match resume with job description.
        
        Args:
            resume_text: Resume content
            job_description: Job description content
            include_suggestions: Whether to include improvement suggestions
        
        Returns:
            Match analysis with scores and recommendations
        """
        # Calculate match
        match_result = self.job_matcher.calculate_similarity(
            resume_text,
            job_description
        )
        
        # Get suggestions if requested
        if include_suggestions:
            suggestions = self.job_matcher.get_improvement_suggestions(
                resume_text,
                job_description
            )
            match_result['suggestions'] = suggestions
        
        return match_result
    
    def rank_jobs(
        self,
        resume_text: str,
        job_descriptions: List[Dict[str, str]]
    ) -> List[Dict]:
        """
        Rank multiple jobs by match score.
        
        Args:
            resume_text: Resume content
            job_descriptions: List of dicts with job info
        
        Returns:
            Ranked list of jobs with match scores
        """
        return self.job_matcher.rank_jobs(resume_text, job_descriptions)
    
    def get_model_info(self) -> Dict:
        """Get information about loaded models."""
        return {
            "classifier": type(self.classifier).__name__ if self.classifier else None,
            "vectorizer": type(self.vectorizer).__name__ if self.vectorizer else None,
            "num_categories": len(self.label_encoder.classes_) if self.label_encoder else 0,
            "categories": self.label_encoder.classes_.tolist() if self.label_encoder else [],
            "metadata": self.metadata if self.metadata else {}
        }
    
    def get_categories(self) -> List[str]:
        """Get all available job categories."""
        return self.label_encoder.classes_.tolist() if self.label_encoder else []


# Singleton instance for backward compatibility
_enhanced_predictor_instance = None


def get_enhanced_predictor() -> EnhancedResumePredictor:
    """Get or create enhanced predictor instance."""
    global _enhanced_predictor_instance
    if _enhanced_predictor_instance is None:
        _enhanced_predictor_instance = EnhancedResumePredictor()
    return _enhanced_predictor_instance


# Convenience functions
def predict_resume_category(resume_text: str) -> Dict:
    """Quick category prediction."""
    predictor = get_enhanced_predictor()
    return predictor.predict_category(resume_text)


def analyze_resume_full(resume_text: str) -> Dict:
    """Full resume analysis."""
    predictor = get_enhanced_predictor()
    return predictor.analyze_resume(resume_text)


def match_resume_to_job(resume_text: str, job_description: str) -> Dict:
    """Match resume to job description."""
    predictor = get_enhanced_predictor()
    return predictor.match_with_job(resume_text, job_description)
