from .base import AIProvider
from .providers.gemini import GeminiProvider
from .providers.openai import OpenAIProvider
from ..core.config import settings


def get_ai_provider() -> AIProvider:
    """Factory function to get AI provider based on configuration"""
    
    if not settings.AI_API_KEY:
        raise ValueError(
            "AI_API_KEY not configured. Please set AI_API_KEY in your .env file."
        )
    
    provider_name = settings.AI_PROVIDER.lower()
    
    if provider_name == "gemini":
        return GeminiProvider(settings.AI_API_KEY, settings.AI_MODEL)
    elif provider_name == "openai":
        return OpenAIProvider(settings.AI_API_KEY, settings.AI_MODEL)
    else:
        raise ValueError(
            f"Unsupported AI provider: {provider_name}. "
            f"Supported providers: gemini, openai"
        )
