from openai import AsyncOpenAI
import json
from typing import Dict, Any
from ..base import AIProvider


class OpenAIProvider(AIProvider):
    """OpenAI API provider"""
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text completion"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional resume writing assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 2000)
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def generate_json(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate JSON response"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional resume writing assistant. Respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 2000),
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
