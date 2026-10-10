from pydantic import BaseModel
from typing import List


class CategoryPrediction(BaseModel):
    category: str
    confidence: float


class CategoryPredictRequest(BaseModel):
    resume_text: str


class CategoryPredictResponse(BaseModel):
    predicted_category: str
    confidence: float
    top_predictions: List[CategoryPrediction]


class ModelMetricsResponse(BaseModel):
    model_name: str
    algorithm: str
    accuracy: float
    macro_f1: float
    trained_at: str
    total_categories: int
    categories: List[str]
