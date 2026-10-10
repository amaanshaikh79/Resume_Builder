"""
Resume-Job matching and similarity scoring module.
Provides multiple scoring methods for resume-job compatibility.
"""
import re
import numpy as np
from typing import Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .skill_extraction import SkillExtractor
from .advanced_preprocessing import normalize_text, clean_html


class JobMatcher:
    """Match resumes to job descriptions using multiple scoring methods."""
    
    def __init__(self):
        """Initialize matcher with skill extractor."""
        self.skill_extractor = SkillExtractor()
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95,
            stop_words='english'
        )
    
    def calculate_similarity(
        self,
        resume_text: str,
        job_description: str
    ) -> Dict[str, any]:
        """
        Calculate comprehensive similarity between resume and job description.
        
        Args:
            resume_text: Resume content
            job_description: Job description content
        
        Returns:
            Dictionary with multiple similarity scores
        """
        # Preprocess texts
        resume_clean = normalize_text(clean_html(resume_text))
        job_clean = normalize_text(clean_html(job_description))
        
        # 1. TF-IDF Cosine Similarity
        tfidf_score = self._tfidf_similarity(resume_clean, job_clean)
        
        # 2. Skill-based matching
        skill_match = self._skill_matching(resume_text, job_description)
        
        # 3. Keyword overlap
        keyword_score = self._keyword_overlap(resume_clean, job_clean)
        
        # 4. Experience level match
        experience_match = self._experience_matching(resume_text, job_description)
        
        # 5. Combined score (weighted average)
        combined_score = (
            tfidf_score * 0.30 +
            skill_match['overall_match'] * 0.40 +
            keyword_score * 0.20 +
            experience_match * 0.10
        )
        
        return {
            'overall_score': combined_score,
            'tfidf_similarity': tfidf_score,
            'skill_match': skill_match,
            'keyword_overlap': keyword_score,
            'experience_match': experience_match,
            'recommendation': self._get_recommendation(combined_score),
            'match_level': self._get_match_level(combined_score)
        }
    
    def _tfidf_similarity(self, text1: str, text2: str) -> float:
        """Calculate TF-IDF cosine similarity."""
        try:
            # Fit and transform both texts
            tfidf_matrix = self.vectorizer.fit_transform([text1, text2])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return float(similarity)
        except Exception:
            return 0.0
    
    def _skill_matching(self, resume: str, job: str) -> Dict:
        """Match skills between resume and job."""
        resume_skills = self.skill_extractor.extract_skills(resume)
        return self.skill_extractor.match_skills_to_job(resume_skills, job)
    
    def _keyword_overlap(self, resume: str, job: str) -> float:
        """Calculate keyword overlap score."""
        # Extract important keywords (nouns, verbs, technical terms)
        resume_keywords = set(re.findall(r'\b[a-z]{3,}\b', resume.lower()))
        job_keywords = set(re.findall(r'\b[a-z]{3,}\b', job.lower()))
        
        if not job_keywords:
            return 0.0
        
        # Calculate Jaccard similarity
        intersection = resume_keywords.intersection(job_keywords)
        union = resume_keywords.union(job_keywords)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _experience_matching(self, resume: str, job: str) -> float:
        """Match experience level between resume and job requirements."""
        # Extract years from resume
        resume_years = self._extract_years(resume)
        
        # Extract required years from job
        job_years = self._extract_required_years(job)
        
        if resume_years is None or job_years is None:
            return 0.5  # neutral score if can't determine
        
        # Calculate match (perfect if resume >= required)
        if resume_years >= job_years:
            return 1.0
        else:
            # Partial credit based on how close
            return max(0.0, resume_years / job_years)
    
    def _extract_years(self, text: str) -> int:
        """Extract years of experience from text."""
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience\s*:\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*yrs?\s+(?:of\s+)?experience'
        ]
        
        years = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            years.extend([int(match) for match in matches])
        
        return max(years) if years else None
    
    def _extract_required_years(self, job: str) -> int:
        """Extract required years from job description."""
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)',
            r'minimum\s+(?:of\s+)?(\d+)\s+years?',
            r'at least\s+(\d+)\s+years?',
            r'(\d+)\+?\s*yrs?\s+(?:required|needed|experience)'
        ]
        
        years = []
        for pattern in patterns:
            matches = re.findall(pattern, job, re.IGNORECASE)
            years.extend([int(match) for match in matches])
        
        return min(years) if years else None
    
    def _get_recommendation(self, score: float) -> str:
        """Get application recommendation based on score."""
        if score >= 0.75:
            return "Excellent match! Highly recommended to apply."
        elif score >= 0.60:
            return "Strong match. Good candidate for this role."
        elif score >= 0.45:
            return "Moderate match. Consider applying if interested."
        elif score >= 0.30:
            return "Fair match. May require skill development."
        else:
            return "Low match. Significant gaps exist."
    
    def _get_match_level(self, score: float) -> str:
        """Get match level category."""
        if score >= 0.75:
            return "Excellent"
        elif score >= 0.60:
            return "Good"
        elif score >= 0.45:
            return "Moderate"
        elif score >= 0.30:
            return "Fair"
        else:
            return "Poor"
    
    def rank_jobs(
        self,
        resume_text: str,
        job_descriptions: List[Dict[str, str]]
    ) -> List[Dict]:
        """
        Rank multiple jobs by match score.
        
        Args:
            resume_text: Resume content
            job_descriptions: List of dicts with 'id' and 'description' keys
        
        Returns:
            Sorted list of jobs with match scores
        """
        results = []
        
        for job in job_descriptions:
            match_result = self.calculate_similarity(
                resume_text,
                job.get('description', '')
            )
            
            results.append({
                'job_id': job.get('id'),
                'job_title': job.get('title', 'Unknown'),
                'match_score': match_result['overall_score'],
                'match_level': match_result['match_level'],
                'recommendation': match_result['recommendation'],
                'details': match_result
            })
        
        # Sort by match score (descending)
        results.sort(key=lambda x: x['match_score'], reverse=True)
        
        return results
    
    def get_improvement_suggestions(
        self,
        resume_text: str,
        job_description: str
    ) -> Dict[str, List[str]]:
        """
        Get suggestions for improving resume to match job better.
        
        Args:
            resume_text: Resume content
            job_description: Job description content
        
        Returns:
            Dictionary with improvement suggestions
        """
        # Get match analysis
        match = self.calculate_similarity(resume_text, job_description)
        skill_match = match['skill_match']
        
        suggestions = {
            'critical': [],
            'important': [],
            'optional': []
        }
        
        # Missing technical skills (critical)
        missing_tech = skill_match['missing_skills']['technical']
        if missing_tech:
            if len(missing_tech) <= 3:
                suggestions['critical'].append(
                    f"Add these critical technical skills: {', '.join(missing_tech[:3])}"
                )
            else:
                suggestions['critical'].append(
                    f"Add key technical skills: {', '.join(missing_tech[:5])}"
                )
        
        # Missing domain skills (important)
        missing_domain = skill_match['missing_skills']['domain']
        if missing_domain:
            suggestions['important'].append(
                f"Highlight domain experience in: {', '.join(missing_domain[:3])}"
            )
        
        # Missing soft skills (optional)
        missing_soft = skill_match['missing_skills']['soft']
        if missing_soft:
            suggestions['optional'].append(
                f"Include soft skills: {', '.join(missing_soft[:3])}"
            )
        
        # Experience level
        if match['experience_match'] < 0.8:
            suggestions['important'].append(
                "Emphasize relevant years of experience more clearly"
            )
        
        # Keyword overlap
        if match['keyword_overlap'] < 0.3:
            suggestions['important'].append(
                "Use more keywords from the job description in your resume"
            )
        
        # Overall match
        if match['overall_score'] < 0.5:
            suggestions['critical'].append(
                "Consider tailoring your resume specifically for this role"
            )
        
        return suggestions


# Singleton instance
job_matcher = JobMatcher()


def calculate_job_match(resume_text: str, job_description: str) -> Dict:
    """Convenience function to calculate job match."""
    return job_matcher.calculate_similarity(resume_text, job_description)


def rank_jobs_by_match(resume_text: str, jobs: List[Dict]) -> List[Dict]:
    """Convenience function to rank jobs."""
    return job_matcher.rank_jobs(resume_text, jobs)


def get_resume_suggestions(resume_text: str, job_description: str) -> Dict:
    """Convenience function to get improvement suggestions."""
    return job_matcher.get_improvement_suggestions(resume_text, job_description)
