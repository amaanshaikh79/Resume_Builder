from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..core.config import settings
from ..schemas import (
    SummaryGenerateRequest, SummaryGenerateResponse,
    BulletPointsGenerateRequest, BulletPointsGenerateResponse,
    ExperienceImproveRequest, ExperienceImproveResponse,
    CoverLetterGenerateRequest, CoverLetterGenerateResponse
)
from ..ai import get_ai_provider, ResumePrompts
from ..models import AIGeneration

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/summary", response_model=SummaryGenerateResponse)
async def generate_summary(
    request: SummaryGenerateRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate professional summary using AI"""
    try:
        if not settings.AI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured. Please set AI_API_KEY in environment variables."
            )
        
        provider = get_ai_provider()
        prompt = ResumePrompts.generate_summary(
            request.jobTitle,
            request.experienceLevel,
            request.skills,
            request.tone
        )
        
        summary = await provider.generate(prompt)
        
        # Log generation
        generation = AIGeneration(
            user_id=user_id,
            generation_type="summary",
            input_data=request.dict(),
            output_data={"summary": summary},
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL
        )
        db.add(generation)
        await db.commit()
        
        return SummaryGenerateResponse(summary=summary.strip())
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )


@router.post("/bullet-points", response_model=BulletPointsGenerateResponse)
async def generate_bullet_points(
    request: BulletPointsGenerateRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate bullet points for experience using AI"""
    try:
        if not settings.AI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured. Please set AI_API_KEY in environment variables."
            )
        
        provider = get_ai_provider()
        prompt = ResumePrompts.generate_bullet_points(
            request.jobTitle,
            request.company,
            request.description,
            request.count
        )
        
        result = await provider.generate(prompt)
        
        # Parse bullet points
        lines = result.strip().split("\n")
        bullet_points = [
            line.strip().lstrip("•-*").strip() 
            for line in lines 
            if line.strip()
        ][:request.count]
        
        # Log generation
        generation = AIGeneration(
            user_id=user_id,
            generation_type="bullet_points",
            input_data=request.dict(),
            output_data={"bulletPoints": bullet_points},
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL
        )
        db.add(generation)
        await db.commit()
        
        return BulletPointsGenerateResponse(bulletPoints=bullet_points)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )


@router.post("/improve-experience", response_model=ExperienceImproveResponse)
async def improve_experience(
    request: ExperienceImproveRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Improve experience description using AI"""
    try:
        if not settings.AI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured. Please set AI_API_KEY in environment variables."
            )
        
        provider = get_ai_provider()
        prompt = ResumePrompts.improve_experience(
            request.jobTitle,
            request.company,
            request.description,
            request.action
        )
        
        improved = await provider.generate(prompt)
        
        # Log generation
        generation = AIGeneration(
            user_id=user_id,
            generation_type=f"improve_experience_{request.action}",
            input_data=request.dict(),
            output_data={"improvedDescription": improved},
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL
        )
        db.add(generation)
        await db.commit()
        
        return ExperienceImproveResponse(improvedDescription=improved.strip())
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )


@router.post("/cover-letter", response_model=CoverLetterGenerateResponse)
async def generate_cover_letter(
    request: CoverLetterGenerateRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate cover letter using AI"""
    try:
        if not settings.AI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured. Please set AI_API_KEY in environment variables."
            )
        
        provider = get_ai_provider()
        prompt = ResumePrompts.generate_cover_letter(
            request.candidateName,
            request.candidateEmail,
            request.resumeData,
            request.jobTitle,
            request.company,
            request.jobDescription,
            request.tone
        )
        
        cover_letter = await provider.generate(prompt)
        
        # Log generation
        generation = AIGeneration(
            user_id=user_id,
            generation_type="cover_letter",
            input_data={
                "jobTitle": request.jobTitle,
                "company": request.company,
                "tone": request.tone
            },
            output_data={"coverLetter": cover_letter},
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL
        )
        db.add(generation)
        await db.commit()
        
        return CoverLetterGenerateResponse(coverLetter=cover_letter.strip())
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )
