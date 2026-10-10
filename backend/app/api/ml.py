from fastapi import APIRouter, Depends, HTTPException, status
from ..core.security import get_current_user_id
from ..schemas import CategoryPredictRequest, CategoryPredictResponse, ModelMetricsResponse
from ..ml import get_predictor

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.post("/predict-category", response_model=CategoryPredictResponse)
async def predict_category(
    request: CategoryPredictRequest,
    user_id: int = Depends(get_current_user_id)
):
    """Predict job category from resume text"""
    try:
        predictor = get_predictor()
        result = predictor.predict(request.resume_text)
        
        return CategoryPredictResponse(**result)
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/metrics", response_model=ModelMetricsResponse)
async def get_model_metrics(
    user_id: int = Depends(get_current_user_id)
):
    """Get ML model metrics and metadata"""
    try:
        predictor = get_predictor()
        metadata = predictor.get_metadata()
        
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model metadata not found"
            )
        
        metrics = metadata.get("metrics", {})
        
        return ModelMetricsResponse(
            model_name=metadata.get("model_name", ""),
            algorithm=metadata.get("algorithm", ""),
            accuracy=metrics.get("accuracy", 0.0),
            macro_f1=metrics.get("f1_score", 0.0),
            trained_at=metadata.get("trained_at", ""),
            total_categories=metadata.get("num_categories", 0),
            categories=metadata.get("categories", [])
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )
