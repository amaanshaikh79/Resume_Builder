import google.generativeai as genai
import json
from typing import Dict, Any
from ..base import AIProvider


class GeminiProvider(AIProvider):
    """Google Gemini AI provider"""
    
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        super().__init__(api_key, model)
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel(model)
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text completion"""
        try:
            response = self.client.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    async def generate_json(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate JSON response"""
        try:
            json_prompt = f"{prompt}\n\nRespond with valid JSON only."
            response = self.client.generate_content(json_prompt)
            text = response.text
            
            # Extract JSON from response
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            return json.loads(text.strip())
        except json.JSONDecodeError:
            # Fallback: return as text
            return {"text": text}
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
