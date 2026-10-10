"""
Enhanced ML API endpoints with full capabilities.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from ..core.security import get_current_user_id
from ..ml.enhanced_predict import get_enhanced_predictor


router = APIRouter(prefix="/ml", tags=["Machine Learning Enhanced"])


# Request/Response Models
class ResumeAnalysisRequest(BaseModel):
    """Request for full resume analysis"""
    resume_text: str = Field(..., min_length=10, description="Resume text to analyze")


class SkillExtractionRequest(BaseModel):
    """Request for skill extraction"""
    resume_text: str = Field(..., min_length=10)


class JobMatchRequest(BaseModel):
    """Request for job matching"""
    resume_text: str = Field(..., min_length=10)
    job_description: str = Field(..., min_length=10)
    include_suggestions: bool = Field(default=True)


class JobRankingRequest(BaseModel):
    """Request for ranking multiple jobs"""
    resume_text: str = Field(..., min_length=10)
    jobs: List[Dict] = Field(..., description="List of jobs with id, title, description")


# Enhanced Endpoints
@router.post("/analyze-resume")
async def analyze_resume(
    request: ResumeAnalysisRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Comprehensive resume analysis including:
    - Category prediction
    - Skill extraction (technical, soft, domain)
    - Experience level assessment
    - Certifications
    """
    try:
        predictor = get_enhanced_predictor()
        result = predictor.analyze_resume(request.resume_text)
        return result
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML models not found. Please train the models first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/extract-skills")
async def extract_skills(
    request: SkillExtractionRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Extract skills from resume text.
    Returns technical skills, soft skills, domain skills, and certifications.
    """
    try:
        predictor = get_enhanced_predictor()
        skills = predictor.skill_extractor.extract_skills(request.resume_text)
        skill_level = predictor.skill_extractor.get_skill_level(skills)
        experience = predictor.skill_extractor.extract_years_of_experience(request.resume_text)
        
        return {
            "skills": skills,
            "skill_level": skill_level,
            "experience": experience
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Skill extraction failed: {str(e)}"
        )


@router.post("/match-job")
async def match_job(
    request: JobMatchRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Match resume with job description.
    Returns similarity scores, skill matches, and improvement suggestions.
    """
    try:
        predictor = get_enhanced_predictor()
        result = predictor.match_with_job(
            request.resume_text,
            request.job_description,
            include_suggestions=request.include_suggestions
        )
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job matching failed: {str(e)}"
        )


@router.post("/rank-jobs")
async def rank_jobs(
    request: JobRankingRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Rank multiple jobs based on resume match.
    Returns sorted list with match scores and recommendations.
    """
    try:
        predictor = get_enhanced_predictor()
        results = predictor.rank_jobs(request.resume_text, request.jobs)
        
        return {
            "total_jobs": len(results),
            "ranked_jobs": results
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job ranking failed: {str(e)}"
        )


@router.post("/predict-category")
async def predict_category(
    request: ResumeAnalysisRequest,
    top_k: int = 5,
    user_id: int = Depends(get_current_user_id)
):
    """
    Predict resume category with confidence scores.
    Enhanced version with better preprocessing.
    """
    try:
        predictor = get_enhanced_predictor()
        result = predictor.predict_category(request.resume_text, top_k=top_k)
        return result
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML models not found. Please train the models first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/model-info")
async def get_model_info(
    user_id: int = Depends(get_current_user_id)
):
    """Get information about loaded ML models."""
    try:
        predictor = get_enhanced_predictor()
        return predictor.get_model_info()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model info: {str(e)}"
        )


@router.get("/categories")
async def get_categories(
    user_id: int = Depends(get_current_user_id)
):
    """Get all available job categories."""
    try:
        predictor = get_enhanced_predictor()
        categories = predictor.get_categories()
        
        return {
            "total_categories": len(categories),
            "categories": sorted(categories)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get categories: {str(e)}"
        )
