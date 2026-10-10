"""
Skill extraction module for resume analysis.
Extracts technical skills, soft skills, and domain expertise from resumes.
"""
import re
from typing import List, Dict, Set
from collections import Counter


class SkillExtractor:
    """Extract and categorize skills from resume text."""
    
    def __init__(self):
        """Initialize skill database."""
        # Technical Skills Database
        self.technical_skills = {
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust',
            'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
            
            # Web Technologies
            'html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
            'fastapi', 'spring', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'webpack',
            
            # Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
            'dynamodb', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'couchdb',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
            'gitlab', 'github', 'circleci', 'travis', 'nginx', 'apache', 'linux', 'unix',
            
            # Data Science & ML
            'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow',
            'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
            'spark', 'hadoop', 'airflow', 'tableau', 'power bi',
            
            # Mobile Development
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'cordova',
            
            # Tools & Software
            'git', 'jira', 'confluence', 'slack', 'trello', 'postman', 'swagger',
            'visual studio', 'vscode', 'intellij', 'eclipse', 'pycharm',
            
            # Testing
            'junit', 'pytest', 'jest', 'selenium', 'cypress', 'mocha', 'chai',
            
            # Other Technologies
            'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'ci/cd',
            'kafka', 'rabbitmq', 'blockchain', 'solidity', 'ethereum'
        }
        
        # Soft Skills Database
        self.soft_skills = {
            'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
            'time management', 'adaptability', 'creativity', 'collaboration', 'negotiation',
            'presentation', 'analytical', 'decision making', 'conflict resolution',
            'emotional intelligence', 'work ethic', 'attention to detail', 'multitasking',
            'interpersonal', 'organizational', 'strategic thinking', 'mentoring'
        }
        
        # Domain/Industry Skills
        self.domain_skills = {
            'finance', 'healthcare', 'retail', 'e-commerce', 'telecommunications',
            'manufacturing', 'education', 'government', 'consulting', 'marketing',
            'sales', 'hr', 'accounting', 'legal', 'supply chain', 'logistics',
            'cybersecurity', 'information security', 'network security', 'data analysis',
            'business intelligence', 'project management', 'product management',
            'ux design', 'ui design', 'graphic design', 'digital marketing', 'seo', 'sem'
        }
        
        # Certifications patterns
        self.cert_patterns = [
            r'\b(?:AWS|Azure|GCP)\s+(?:Certified|Certification)\b',
            r'\bPMP\b',
            r'\bCISSP\b',
            r'\bCEH\b',
            r'\bCKA\b',
            r'\bCKAD\b',
            r'\bMCSA\b',
            r'\bMCSE\b',
            r'\bCCNA\b',
            r'\bCCNP\b',
            r'\bOracle\s+Certified\b',
            r'\bScrum\s+Master\b',
            r'\bSix\s+Sigma\b',
            r'\bITIL\b'
        ]
    
    def extract_skills(self, text: str) -> Dict[str, any]:
        """
        Extract all skills from resume text.
        
        Args:
            text: Resume text
        
        Returns:
            Dictionary with categorized skills
        """
        text_lower = text.lower()
        
        # Extract technical skills
        technical = self._extract_category(text_lower, self.technical_skills)
        
        # Extract soft skills
        soft = self._extract_category(text_lower, self.soft_skills)
        
        # Extract domain skills
        domain = self._extract_category(text_lower, self.domain_skills)
        
        # Extract certifications
        certifications = self._extract_certifications(text)
        
        # Calculate skill counts
        all_skills = technical + soft + domain
        skill_frequency = Counter(all_skills)
        
        return {
            'technical_skills': sorted(list(set(technical))),
            'soft_skills': sorted(list(set(soft))),
            'domain_skills': sorted(list(set(domain))),
            'certifications': certifications,
            'total_skills': len(set(all_skills)),
            'skill_frequency': dict(skill_frequency.most_common(20))
        }
    
    def _extract_category(self, text: str, skill_set: Set[str]) -> List[str]:
        """Extract skills from a specific category."""
        found_skills = []
        for skill in skill_set:
            # Use word boundaries for exact matching
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                found_skills.append(skill)
        return found_skills
    
    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications using pattern matching."""
        certifications = []
        for pattern in self.cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            certifications.extend(matches)
        return list(set(certifications))
    
    def get_skill_level(self, skills: Dict) -> str:
        """
        Estimate skill level based on number and diversity of skills.
        
        Args:
            skills: Dictionary from extract_skills()
        
        Returns:
            Skill level: 'Entry', 'Intermediate', 'Advanced', 'Expert'
        """
        total = skills['total_skills']
        technical = len(skills['technical_skills'])
        has_certs = len(skills['certifications']) > 0
        
        if total < 5:
            return 'Entry'
        elif total < 10:
            return 'Intermediate'
        elif total < 20 or (technical >= 8 and has_certs):
            return 'Advanced'
        else:
            return 'Expert'
    
    def match_skills_to_job(
        self,
        resume_skills: Dict,
        job_description: str
    ) -> Dict[str, any]:
        """
        Match resume skills against job description.
        
        Args:
            resume_skills: Skills extracted from resume
            job_description: Job description text
        
        Returns:
            Match analysis with scores
        """
        # Extract required skills from job description
        job_skills = self.extract_skills(job_description)
        
        # Find matching skills
        resume_technical = set(resume_skills['technical_skills'])
        resume_soft = set(resume_skills['soft_skills'])
        resume_domain = set(resume_skills['domain_skills'])
        
        job_technical = set(job_skills['technical_skills'])
        job_soft = set(job_skills['soft_skills'])
        job_domain = set(job_skills['domain_skills'])
        
        # Calculate matches
        technical_match = resume_technical.intersection(job_technical)
        soft_match = resume_soft.intersection(job_soft)
        domain_match = resume_domain.intersection(job_domain)
        
        # Calculate match percentages
        technical_score = len(technical_match) / len(job_technical) if job_technical else 0
        soft_score = len(soft_match) / len(job_soft) if job_soft else 0
        domain_score = len(domain_match) / len(job_domain) if job_domain else 0
        
        # Overall match (weighted: 50% technical, 30% domain, 20% soft)
        overall_score = (
            technical_score * 0.5 +
            domain_score * 0.3 +
            soft_score * 0.2
        )
        
        # Missing skills
        missing_technical = job_technical - resume_technical
        missing_soft = job_soft - resume_soft
        missing_domain = job_domain - resume_domain
        
        return {
            'overall_match': overall_score,
            'technical_match': technical_score,
            'soft_match': soft_score,
            'domain_match': domain_score,
            'matching_skills': {
                'technical': sorted(list(technical_match)),
                'soft': sorted(list(soft_match)),
                'domain': sorted(list(domain_match))
            },
            'missing_skills': {
                'technical': sorted(list(missing_technical)),
                'soft': sorted(list(missing_soft)),
                'domain': sorted(list(missing_domain))
            },
            'recommendation': self._get_match_recommendation(overall_score)
        }
    
    def _get_match_recommendation(self, score: float) -> str:
        """Get recommendation based on match score."""
        if score >= 0.8:
            return "Excellent match! Apply immediately."
        elif score >= 0.6:
            return "Good match. Strong candidate."
        elif score >= 0.4:
            return "Moderate match. Consider upskilling in missing areas."
        else:
            return "Low match. Significant skill gap exists."
    
    def extract_years_of_experience(self, text: str) -> Dict[str, any]:
        """
        Extract years of experience from resume text.
        
        Args:
            text: Resume text
        
        Returns:
            Dictionary with experience information
        """
        # Patterns for years of experience
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience\s*:\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*yrs?\s+(?:of\s+)?experience',
            r'over\s+(\d+)\s+years?',
            r'more than\s+(\d+)\s+years?'
        ]
        
        years = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            years.extend([int(match) for match in matches])
        
        if years:
            max_years = max(years)
            return {
                'total_years': max_years,
                'level': self._get_experience_level(max_years)
            }
        
        return {
            'total_years': None,
            'level': 'Unknown'
        }
    
    def _get_experience_level(self, years: int) -> str:
        """Classify experience level."""
        if years < 2:
            return 'Entry Level'
        elif years < 5:
            return 'Mid Level'
        elif years < 10:
            return 'Senior Level'
        else:
            return 'Expert Level'


# Singleton instance
skill_extractor = SkillExtractor()


def extract_skills_from_resume(resume_text: str) -> Dict:
    """Convenience function to extract skills."""
    return skill_extractor.extract_skills(resume_text)


def match_resume_to_job(resume_text: str, job_description: str) -> Dict:
    """Convenience function to match resume to job."""
    resume_skills = skill_extractor.extract_skills(resume_text)
    return skill_extractor.match_skills_to_job(resume_skills, job_description)
