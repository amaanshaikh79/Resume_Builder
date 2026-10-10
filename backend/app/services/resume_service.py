from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from typing import List, Optional
from ..models.resume import Resume, ResumeVersion
from ..schemas import ResumeCreate, ResumeUpdate


async def get_resume_by_id(db: AsyncSession, resume_id: int, user_id: int) -> Optional[Resume]:
    """Get resume by ID for a specific user"""
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_resumes(db: AsyncSession, user_id: int) -> List[Resume]:
    """Get all resumes for a user"""
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user_id)
        .order_by(func.coalesce(Resume.updated_at, Resume.created_at).desc())
    )
    return list(result.scalars().all())


async def create_resume(db: AsyncSession, user_id: int, resume_data: ResumeCreate) -> Resume:
    """Create a new resume"""
    resume = Resume(
        user_id=user_id,
        title=resume_data.title,
        template=resume_data.template,
        resume_data=resume_data.resume_data.dict(),
        status="draft"
    )
    
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    
    # Create initial version
    await create_resume_version(db, resume.id, resume.resume_data)
    
    return resume


async def update_resume(
    db: AsyncSession, 
    resume_id: int, 
    user_id: int, 
    resume_data: ResumeUpdate
) -> Optional[Resume]:
    """Update an existing resume"""
    resume = await get_resume_by_id(db, resume_id, user_id)
    if not resume:
        return None
    
    if resume_data.title is not None:
        resume.title = resume_data.title
    if resume_data.template is not None:
        resume.template = resume_data.template
    if resume_data.resume_data is not None:
        resume.resume_data = resume_data.resume_data.dict()
        # Create new version
        version_count = await get_resume_version_count(db, resume_id)
        await create_resume_version(db, resume_id, resume.resume_data)
    if resume_data.status is not None:
        resume.status = resume_data.status
    
    await db.commit()
    await db.refresh(resume)
    return resume


async def delete_resume(db: AsyncSession, resume_id: int, user_id: int) -> bool:
    """Delete a resume"""
    resume = await get_resume_by_id(db, resume_id, user_id)
    if not resume:
        return False
    
    await db.delete(resume)
    await db.commit()
    return True


async def create_resume_version(db: AsyncSession, resume_id: int, resume_data: dict):
    """Create a new version of a resume"""
    version_count = await get_resume_version_count(db, resume_id)
    
    version = ResumeVersion(
        resume_id=resume_id,
        version_number=version_count + 1,
        resume_data=resume_data
    )
    
    db.add(version)
    await db.commit()


async def get_resume_version_count(db: AsyncSession, resume_id: int) -> int:
    """Get the number of versions for a resume"""
    result = await db.execute(
        select(ResumeVersion).where(ResumeVersion.resume_id == resume_id)
    )
    return len(list(result.scalars().all()))


async def update_resume_ml_prediction(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
    predicted_category: str,
    confidence: float
):
    """Update ML prediction for a resume"""
    resume = await get_resume_by_id(db, resume_id, user_id)
    if resume:
        resume.predicted_category = predicted_category
        resume.predicted_confidence = confidence
        await db.commit()
        await db.refresh(resume)
    return resume


async def update_resume_ats_score(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
    ats_score: float
):
    """Update ATS score for a resume"""
    resume = await get_resume_by_id(db, resume_id, user_id)
    if resume:
        resume.ats_score = ats_score
        await db.commit()
        await db.refresh(resume)
    return resume
