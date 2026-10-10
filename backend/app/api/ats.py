from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..schemas import ATSAnalysisRequest, ATSAnalysisResponse, JobAnalysisRequest, JobAnalysisResponse
from ..services.ats_service import ATSAnalyzer
from ..ai import get_ai_provider, ResumePrompts
from ..core.config import settings

router = APIRouter(prefix="/ats", tags=["ATS"])


@router.post("/analyze", response_model=ATSAnalysisResponse)
async def analyze_ats(
    request: ATSAnalysisRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Analyze resume for ATS compatibility"""
    try:
        analyzer = ATSAnalyzer()
        result = analyzer.analyze_resume(
            request.resumeData,
            request.jobDescription
        )
        
        return ATSAnalysisResponse(**result)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS analysis failed: {str(e)}"
        )


@router.post("/analyze-job", response_model=JobAnalysisResponse)
async def analyze_job_description(
    request: JobAnalysisRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Analyze job description and compare with resume"""
    try:
        if not settings.AI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured. Please set AI_API_KEY in environment variables."
            )
        
        provider = get_ai_provider()
        
        # Analyze job description
        prompt = ResumePrompts.analyze_job_description(request.jobDescription)
        analysis = await provider.generate_json(prompt)
        
        # If resume provided, compare
        if request.resumeText:
            compare_prompt = ResumePrompts.compare_resume_to_job(
                request.resumeText,
                analysis
            )
            comparison = await provider.generate_json(compare_prompt)
            analysis.update(comparison)
        
        return JobAnalysisResponse(**analysis)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job analysis failed: {str(e)}"
        )
