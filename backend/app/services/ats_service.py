from typing import Dict, List, Any
import re


class ATSAnalyzer:
    """ATS compatibility analyzer"""
    
    @staticmethod
    def analyze_resume(resume_data: Dict[str, Any], job_description: str = None) -> Dict[str, Any]:
        """Analyze resume for ATS compatibility"""
        
        personal = resume_data.get("personal", {})
        summary = resume_data.get("summary", "")
        experience = resume_data.get("experience", [])
        education = resume_data.get("education", [])
        skills = resume_data.get("skills", [])
        
        # Calculate individual scores
        contact_score = ATSAnalyzer._analyze_contact(personal)
        summary_score = ATSAnalyzer._analyze_summary(summary)
        experience_score = ATSAnalyzer._analyze_experience(experience)
        education_score = ATSAnalyzer._analyze_education(education)
        skills_score = ATSAnalyzer._analyze_skills(skills)
        formatting_score = ATSAnalyzer._analyze_formatting(resume_data)
        
        # Keywords analysis
        keyword_score = 100.0
        matched_keywords = []
        missing_keywords = []
        
        if job_description:
            keyword_score, matched_keywords, missing_keywords = ATSAnalyzer._analyze_keywords(
                resume_data, job_description
            )
        
        # Calculate overall score (weighted average)
        weights = {
            "contact": 0.10,
            "summary": 0.10,
            "experience": 0.25,
            "education": 0.10,
            "skills": 0.20,
            "formatting": 0.15,
            "keywords": 0.10
        }
        
        overall_score = (
            contact_score * weights["contact"] +
            summary_score * weights["summary"] +
            experience_score * weights["experience"] +
            education_score * weights["education"] +
            skills_score * weights["skills"] +
            formatting_score * weights["formatting"] +
            keyword_score * weights["keywords"]
        )
        
        # Generate feedback
        strengths, weaknesses, suggestions = ATSAnalyzer._generate_feedback(
            resume_data, 
            {
                "contact": contact_score,
                "summary": summary_score,
                "experience": experience_score,
                "education": education_score,
                "skills": skills_score,
                "formatting": formatting_score,
                "keywords": keyword_score
            }
        )
        
        return {
            "overallScore": round(overall_score, 1),
            "keywordsScore": round(keyword_score, 1),
            "skillsScore": round(skills_score, 1),
            "formattingScore": round(formatting_score, 1),
            "experienceScore": round(experience_score, 1),
            "readabilityScore": round(summary_score, 1),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "detailedFeedback": {
                "contactInfo": contact_score,
                "summary": summary_score,
                "experience": experience_score,
                "education": education_score,
                "skills": skills_score,
                "formatting": formatting_score,
                "matchedKeywords": matched_keywords[:10],
                "missingKeywords": missing_keywords[:10]
            }
        }
    
    @staticmethod
    def _analyze_contact(personal: Dict) -> float:
        """Analyze contact information completeness"""
        score = 0.0
        required = ["fullName", "email", "phone"]
        optional = ["location", "linkedin"]
        
        for field in required:
            if personal.get(field):
                score += 30.0
        
        for field in optional:
            if personal.get(field):
                score += 5.0
        
        return min(score, 100.0)
    
    @staticmethod
    def _analyze_summary(summary: str) -> float:
        """Analyze professional summary"""
        if not summary:
            return 0.0
        
        score = 0.0
        word_count = len(summary.split())
        
        # Ideal length: 50-150 words
        if 50 <= word_count <= 150:
            score += 50.0
        elif 30 <= word_count < 50:
            score += 30.0
        elif word_count > 150:
            score += 30.0
        
        # Check for action words
        action_words = ["achieved", "managed", "led", "developed", "created", "improved"]
        if any(word in summary.lower() for word in action_words):
            score += 25.0
        
        # Check for specificity (numbers)
        if re.search(r'\d+', summary):
            score += 25.0
        
        return min(score, 100.0)
    
    @staticmethod
    def _analyze_experience(experience: List[Dict]) -> float:
        """Analyze work experience section"""
        if not experience:
            return 50.0  # Having no experience isn't always bad
        
        score = 0.0
        
        # Has experience entries
        score += 30.0
        
        # Check for descriptions/bullet points
        has_details = sum(1 for exp in experience if exp.get("description") or exp.get("bulletPoints"))
        if has_details > 0:
            score += 30.0
        
        # Check for dates
        has_dates = sum(1 for exp in experience if exp.get("startDate"))
        if has_dates == len(experience):
            score += 20.0
        
        # Check for action verbs
        action_verbs = ["led", "managed", "developed", "created", "improved", "achieved"]
        for exp in experience:
            desc = exp.get("description", "").lower()
            bullets = " ".join(exp.get("bulletPoints", [])).lower()
            combined = desc + " " + bullets
            if any(verb in combined for verb in action_verbs):
                score += 20.0 / len(experience)
        
        return min(score, 100.0)
    
    @staticmethod
    def _analyze_education(education: List[Dict]) -> float:
        """Analyze education section"""
        if not education:
            return 70.0  # Not always required
        
        score = 70.0
        
        # Has institution and degree
        complete_entries = sum(
            1 for edu in education 
            if edu.get("institution") and edu.get("degree")
        )
        
        if complete_entries > 0:
            score += 30.0
        
        return min(score, 100.0)
    
    @staticmethod
    def _analyze_skills(skills: List[Dict]) -> float:
        """Analyze skills section"""
        if not skills:
            return 20.0
        
        score = 0.0
        
        # Has skills
        if len(skills) >= 5:
            score += 50.0
        elif len(skills) >= 3:
            score += 30.0
        else:
            score += 20.0
        
        # Has categorized skills
        categories = set(skill.get("category") for skill in skills if skill.get("category"))
        if len(categories) > 1:
            score += 25.0
        
        # Has skill levels
        has_levels = sum(1 for skill in skills if skill.get("level"))
        if has_levels > 0:
            score += 25.0
        
        return min(score, 100.0)
    
    @staticmethod
    def _analyze_formatting(resume_data: Dict) -> float:
        """Analyze formatting and structure"""
        score = 0.0
        
        # Has required sections
        required_sections = ["personal", "experience", "education", "skills"]
        for section in required_sections:
            if resume_data.get(section):
                score += 20.0
        
        # Reasonable length (not too short, not too long)
        total_text = str(resume_data)
        if 1000 <= len(total_text) <= 10000:
            score += 20.0
        
        return min(score, 100.0)
    
    @staticmethod
    def _analyze_keywords(resume_data: Dict, job_description: str) -> tuple:
        """Analyze keyword match with job description"""
        # Extract keywords from job description
        job_keywords = set(re.findall(r'\b[a-z]{3,}\b', job_description.lower()))
        
        # Common words to exclude
        stop_words = {
            "the", "and", "for", "with", "this", "that", "from", "have", "will",
            "your", "you", "are", "can", "our", "we", "all", "about", "also"
        }
        job_keywords -= stop_words
        
        # Extract text from resume
        resume_text = str(resume_data).lower()
        resume_keywords = set(re.findall(r'\b[a-z]{3,}\b', resume_text))
        
        # Find matches
        matched = list(job_keywords & resume_keywords)
        missing = list(job_keywords - resume_keywords)
        
        # Calculate score
        if job_keywords:
            match_rate = len(matched) / len(job_keywords)
            score = match_rate * 100
        else:
            score = 100.0
        
        return score, matched, missing
    
    @staticmethod
    def _generate_feedback(resume_data: Dict, scores: Dict) -> tuple:
        """Generate strengths, weaknesses, and suggestions"""
        strengths = []
        weaknesses = []
        suggestions = []
        
        # Contact info
        if scores["contact"] >= 90:
            strengths.append("Complete contact information")
        elif scores["contact"] < 70:
            weaknesses.append("Incomplete contact information")
            suggestions.append("Add your phone number, email, and location")
        
        # Summary
        if scores["summary"] >= 80:
            strengths.append("Strong professional summary")
        elif scores["summary"] < 50:
            weaknesses.append("Weak or missing professional summary")
            suggestions.append("Add a compelling 2-3 sentence professional summary highlighting your key strengths")
        
        # Experience
        if scores["experience"] >= 80:
            strengths.append("Well-documented work experience")
        elif scores["experience"] < 60:
            weaknesses.append("Experience section needs improvement")
            suggestions.append("Add more details about your responsibilities and achievements using action verbs")
        
        # Skills
        if scores["skills"] >= 80:
            strengths.append("Comprehensive skills section")
        elif scores["skills"] < 60:
            weaknesses.append("Limited skills listed")
            suggestions.append("Add more relevant technical and soft skills")
        
        # Formatting
        if scores["formatting"] >= 80:
            strengths.append("Clean, ATS-friendly structure")
        elif scores["formatting"] < 60:
            weaknesses.append("Structure could be improved")
            suggestions.append("Ensure all standard sections are included and properly formatted")
        
        return strengths, weaknesses, suggestions
