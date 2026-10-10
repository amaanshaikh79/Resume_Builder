from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


class PersonalInfo(BaseModel):
    fullName: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""


class Experience(BaseModel):
    id: Optional[str] = None
    jobTitle: str
    company: str
    location: str = ""
    startDate: str
    endDate: str = ""
    current: bool = False
    description: str = ""
    bulletPoints: List[str] = []


class Education(BaseModel):
    id: Optional[str] = None
    degree: str
    institution: str
    location: str = ""
    startYear: str = ""
    endYear: str
    gpa: str = ""
    description: str = ""


class Skill(BaseModel):
    id: Optional[str] = None
    name: str
    level: str = "intermediate"  # beginner, intermediate, advanced, expert
    category: str = "technical"  # technical, soft, language, tool


class Project(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    technologies: List[str] = []
    url: Optional[str] = ""
    github: Optional[str] = ""
    startDate: str = ""
    endDate: str = ""


class Certification(BaseModel):
    id: Optional[str] = None
    name: str
    organization: str
    issueDate: str = ""
    expirationDate: str = ""
    credentialId: str = ""
    credentialUrl: Optional[str] = ""


class Achievement(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    date: str = ""


class Language(BaseModel):
    id: Optional[str] = None
    name: str
    proficiency: str = "intermediate"  # basic, intermediate, fluent, native


class ResumeData(BaseModel):
    personal: PersonalInfo = PersonalInfo()
    summary: str = ""
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    achievements: List[Achievement] = []
    languages: List[Language] = []
    interests: List[str] = []


class ResumeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    template: str = "modern"
    resume_data: ResumeData = ResumeData()


class ResumeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    template: Optional[str] = None
    resume_data: Optional[ResumeData] = None
    status: Optional[str] = None


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    template: str
    resume_data: Dict[str, Any]
    status: str
    ats_score: Optional[float]
    predicted_category: Optional[str]
    predicted_confidence: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ResumeListResponse(BaseModel):
    id: int
    title: str
    template: str
    status: str
    ats_score: Optional[float]
    predicted_category: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
