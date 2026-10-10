from typing import List, Dict, Any


class ResumePrompts:
    """Prompt templates for resume-related AI operations"""
    
    @staticmethod
    def generate_summary(job_title: str, experience_level: str, skills: List[str], tone: str) -> str:
        """Generate professional summary prompt"""
        skills_text = ", ".join(skills[:10]) if skills else "various skills"
        
        return f"""Generate a professional resume summary for the following profile:

Job Title: {job_title}
Experience Level: {experience_level}
Key Skills: {skills_text}
Tone: {tone}

Requirements:
- Write in first person
- Keep it 2-3 sentences (50-80 words)
- Highlight relevant experience and skills
- Make it impactful and professional
- Do NOT fabricate specific companies, years, or accomplishments
- Focus on genuine value proposition

Generate only the summary text, nothing else."""
    
    @staticmethod
    def generate_bullet_points(job_title: str, company: str, description: str, count: int) -> str:
        """Generate bullet points for job experience"""
        return f"""Convert the following job description into {count} professional resume bullet points:

Job Title: {job_title}
Company: {company}
Description: {description}

Requirements:
- Start each bullet with a strong action verb
- Be specific and quantifiable where possible
- Highlight achievements and impact
- Keep each bullet to 1-2 lines
- Make them ATS-friendly
- Do NOT invent metrics, dates, or accomplishments not in the original description

Return only the bullet points, one per line, starting with "•"."""
    
    @staticmethod
    def improve_experience(job_title: str, company: str, description: str, action: str) -> str:
        """Improve job experience description"""
        
        instructions = {
            "improve": "Rewrite to be more professional and impactful using strong action verbs",
            "shorten": "Condense to be more concise while keeping key information",
            "make_professional": "Rewrite in professional business language",
            "make_ats_friendly": "Optimize for ATS systems with relevant keywords"
        }
        
        instruction = instructions.get(action, instructions["improve"])
        
        return f"""Job Title: {job_title}
Company: {company}
Current Description: {description}

Task: {instruction}

Requirements:
- Maintain factual accuracy
- Do NOT fabricate details
- Keep the same core information
- Use action-oriented language
- Make it compelling and clear

Return only the improved description."""
    
    @staticmethod
    def generate_cover_letter(
        candidate_name: str,
        candidate_email: str,
        resume_data: Dict[str, Any],
        job_title: str,
        company: str,
        job_description: str,
        tone: str
    ) -> str:
        """Generate cover letter prompt"""
        
        # Extract relevant resume info
        summary = resume_data.get("summary", "")
        experience = resume_data.get("experience", [])
        skills = resume_data.get("skills", [])
        
        exp_summary = ""
        if experience:
            recent_exp = experience[0] if len(experience) > 0 else {}
            exp_summary = f"Most recent role: {recent_exp.get('jobTitle', '')} at {recent_exp.get('company', '')}"
        
        skills_text = ", ".join([s.get("name", "") for s in skills[:8]])
        
        return f"""Generate a professional cover letter for:

Candidate: {candidate_name}
Email: {candidate_email}
Target Position: {job_title}
Target Company: {company}

Candidate Background:
{summary}
{exp_summary}
Key Skills: {skills_text}

Job Description:
{job_description}

Requirements:
- Tone: {tone}
- 3-4 paragraphs
- Professional business letter format
- Highlight relevant experience and skills that match the job
- Show enthusiasm for the role
- Be specific and genuine
- Do NOT fabricate achievements or experience
- Use only information provided in the candidate background

Generate the complete cover letter."""
    
    @staticmethod
    def analyze_job_description(job_description: str) -> str:
        """Analyze job description prompt"""
        return f"""Analyze the following job description and extract key information:

{job_description}

Extract and provide in JSON format:
{{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "experienceRequirements": "experience required",
  "educationRequirements": "education required",
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "technicalRequirements": ["tech1", "tech2", ...]
}}

Be thorough and extract all relevant information."""
    
    @staticmethod
    def compare_resume_to_job(resume_text: str, job_analysis: Dict[str, Any]) -> str:
        """Compare resume to job requirements"""
        required_skills = job_analysis.get("requiredSkills", [])
        keywords = job_analysis.get("keywords", [])
        
        return f"""Compare this resume to the job requirements and provide analysis:

Resume:
{resume_text[:3000]}

Required Skills: {', '.join(required_skills)}
Keywords: {', '.join(keywords)}

Provide in JSON format:
{{
  "matchedSkills": ["matched skills"],
  "missingSkills": ["missing critical skills"],
  "keywordMatch": 0.0-1.0 (percentage as decimal),
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2", ...]
}}

Be specific and actionable."""
