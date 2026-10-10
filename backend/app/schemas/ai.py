from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class SummaryGenerateRequest(BaseModel):
    jobTitle: str
    experienceLevel: str  # entry, mid, senior, executive
    skills: List[str] = []
    tone: str = "professional"  # professional, confident, concise, technical


class SummaryGenerateResponse(BaseModel):
    summary: str


class BulletPointsGenerateRequest(BaseModel):
    jobTitle: str
    company: str
    description: str
    count: int = Field(default=5, ge=1, le=10)


class BulletPointsGenerateResponse(BaseModel):
    bulletPoints: List[str]


class ExperienceImproveRequest(BaseModel):
    jobTitle: str
    company: str
    description: str
    action: str = "improve"  # improve, shorten, make_professional, make_ats_friendly


class ExperienceImproveResponse(BaseModel):
    improvedDescription: str
    bulletPoints: Optional[List[str]] = None


class CoverLetterGenerateRequest(BaseModel):
    candidateName: str
    candidateEmail: str
    resumeData: Dict[str, Any]
    jobTitle: str
    company: str
    jobDescription: str
    tone: str = "professional"


class CoverLetterGenerateResponse(BaseModel):
    coverLetter: str


class JobAnalysisRequest(BaseModel):
    jobDescription: str
    resumeText: Optional[str] = None


class JobAnalysisResponse(BaseModel):
    jobTitle: str
    company: Optional[str]
    requiredSkills: List[str]
    preferredSkills: List[str]
    keywords: List[str]
    experienceRequirements: str
    educationRequirements: str
    responsibilities: List[str]
    technicalRequirements: List[str]
    matchedSkills: Optional[List[str]] = None
    missingSkills: Optional[List[str]] = None
    keywordMatch: Optional[float] = None
    suggestions: Optional[List[str]] = None


class ATSAnalysisRequest(BaseModel):
    resumeData: Dict[str, Any]
    jobDescription: Optional[str] = None


class ATSAnalysisResponse(BaseModel):
    overallScore: float
    keywordsScore: float
    skillsScore: float
    formattingScore: float
    experienceScore: float
    readabilityScore: float
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    detailedFeedback: Dict[str, Any]
