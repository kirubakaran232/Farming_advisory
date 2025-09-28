# app.py - Enhanced version
import io
import os
import time
import base64
import json
import re
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import httpx
from dotenv import load_dotenv

APP_TITLE = "PlantAI Backend"
APP_VERSION = "0.2.0"

# Environment config
load_dotenv()
GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_API_URL = os.getenv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent")
MAX_IMAGE_MB = float(os.getenv("MAX_IMAGE_MB", "8"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(title=APP_TITLE, version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class PredictResponse(BaseModel):
    id: str
    disease: str
    confidence: float
    suggestions: List[str]
    inference_ms: int
    severity: Optional[str] = None
    plant_type: Optional[str] = None
    affected_parts: Optional[List[str]] = None
    causative_agent: Optional[str] = None
    treatment_urgency: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: str

@app.get("/health")
def health():
    return {"status": "ok", "version": APP_VERSION}

async def call_gemini(api_key: str, image_bytes: bytes, language: str = "en") -> dict:
    # Language-specific prompts
    language_prompts = {
        "en": "Analyze this plant image for diseases. Respond in English with the exact JSON format specified.",
        "hi": "इस पौधे की छवि का रोगों के लिए विश्लेषण करें। निर्दिष्ट JSON प्रारूप में हिंदी में उत्तर दें।",
        "ta": "இந்த தாவர படத்தை நோய்களுக்காக பகுப்பாய்வு செய்யுங்கள். குறிப்பிட்ட JSON வடிவமைப்பில் தமிழில் பதிலளிக்கவும்.",
        "ml": "രോഗങ്ങൾക്കായി ഈ ചെടിയുടെ ഇമേജ് വിശകലനം ചെയ്യുക. നിർദ്ദിഷ്ട JSON ഫോർമാറ്റിൽ മലയാളത്തിൽ മറുപടി നൽകുക."
    }
    
    prompt = language_prompts.get(language, language_prompts["en"])
    
    # Encode image to base64 for Gemini content API
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    url = GEMINI_API_URL.format(model=GEMINI_MODEL)
    params = {"key": api_key}
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"""{prompt}
JSON Response Format:
{{
  "disease_name": "specific disease name or 'Healthy'",
  "confidence": 0.85,
  "analysis": "detailed explanation of symptoms observed",
  "recommendations": ["specific actionable advice", "treatment steps"],
  "severity": "Low/Moderate/High/Critical",
  "plant_type": "identified plant species if possible",
  "affected_parts": ["leaves", "stems", "roots"],
  "causative_agent": "fungal/bacterial/viral/nutritional/environmental/pest",
  "treatment_urgency": "immediate/within_week/routine_care/monitoring"
}}"""
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": b64
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "topK": 1,
            "topP": 0.8,
            "maxOutputTokens": 1000
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(url, params=params, json=payload)
        r.raise_for_status()
        return r.json()

def enhanced_heuristic_analysis(image: Image.Image) -> dict:
    """Enhanced heuristic analysis with more realistic plant disease detection"""
    img = image.convert("RGB").resize((128, 128))
    pixels = list(img.getdata())
    
    if not pixels:
        return {
            "disease_name": "Unknown",
            "confidence": 0.0,
            "analysis": "Unable to analyze image",
            "recommendations": ["Retake photo in better light"],
            "severity": "Unknown",
            "plant_type": "Unknown",
            "affected_parts": [],
            "causative_agent": "Unknown",
            "treatment_urgency": "monitoring"
        }
    
    total = len(pixels)
    
    # Color analysis
    greens = sum(1 for r,g,b in pixels if g > r+10 and g > b+10 and g > 80)
    browns = sum(1 for r,g,b in pixels if r > g+5 and r > b+5 and r > 100)
    yellows = sum(1 for r,g,b in pixels if r > 150 and g > 150 and b < 100)
    blacks = sum(1 for r,g,b in pixels if r < 50 and g < 50 and b < 50)
    whites = sum(1 for r,g,b in pixels if r > 200 and g > 200 and b > 200)
    
    # Calculate ratios
    green_ratio = greens / total
    brown_ratio = browns / total
    yellow_ratio = yellows / total
    black_ratio = blacks / total
    white_ratio = whites / total
    
    # Common plant diseases with characteristics
    common_diseases = [
        {
            "name": "Healthy Plant",
            "condition": green_ratio > 0.5 and brown_ratio < 0.05 and yellow_ratio < 0.05,
            "confidence": min(0.9, 0.6 + green_ratio * 0.5),
            "severity": "Low",
            "causative_agent": "None",
            "recommendations": ["Continue current care routine", "Monitor for changes"],
            "affected_parts": ["None"],
            "treatment_urgency": "routine_care"
        },
        {
            "name": "Powdery Mildew",
            "condition": white_ratio > 0.15,
            "confidence": min(0.85, 0.5 + white_ratio * 2.0),
            "severity": "Moderate",
            "causative_agent": "fungal",
            "recommendations": ["Apply fungicide", "Improve air circulation", "Remove affected leaves"],
            "affected_parts": ["leaves", "stems"],
            "treatment_urgency": "within_week"
        },
        {
            "name": "Leaf Spot Disease",
            "condition": brown_ratio > 0.15 or black_ratio > 0.08,
            "confidence": min(0.8, 0.4 + brown_ratio * 2.0 + black_ratio * 2.5),
            "severity": "Moderate",
            "causative_agent": "fungal/bacterial",
            "recommendations": ["Remove affected leaves", "Apply appropriate fungicide", "Avoid overhead watering"],
            "affected_parts": ["leaves"],
            "treatment_urgency": "within_week"
        },
        {
            "name": "Nutrient Deficiency",
            "condition": yellow_ratio > 0.2 and green_ratio < 0.3,
            "confidence": min(0.75, 0.4 + yellow_ratio * 1.5),
            "severity": "Moderate",
            "causative_agent": "nutritional",
            "recommendations": ["Test soil nutrients", "Apply balanced fertilizer", "Check pH levels"],
            "affected_parts": ["leaves"],
            "treatment_urgency": "within_week"
        },
        {
            "name": "Early Blight",
            "condition": brown_ratio > 0.1 and yellow_ratio > 0.1,
            "confidence": min(0.7, 0.3 + brown_ratio * 2.0 + yellow_ratio * 1.5),
            "severity": "High",
            "causative_agent": "fungal",
            "recommendations": ["Apply fungicide promptly", "Remove infected plants", "Rotate crops"],
            "affected_parts": ["leaves", "stems", "fruits"],
            "treatment_urgency": "immediate"
        }
    ]
    
    # Find the most likely disease based on conditions
    best_match = {
        "disease_name": "Unknown Condition",
        "confidence": 0.3,
        "analysis": "Inconclusive analysis due to image quality or early symptoms",
        "recommendations": ["Consult with plant expert", "Take clearer photos", "Monitor plant health"],
        "severity": "Unknown",
        "plant_type": "Unknown",
        "affected_parts": [],
        "causative_agent": "Unknown",
        "treatment_urgency": "monitoring"
    }
    
    for disease in common_diseases:
        if disease["condition"] and disease["confidence"] > best_match["confidence"]:
            best_match = {
                "disease_name": disease["name"],
                "confidence": disease["confidence"],
                "analysis": f"Heuristic analysis suggests {disease['name']} based on visual patterns",
                "recommendations": disease["recommendations"],
                "severity": disease["severity"],
                "plant_type": "Likely common garden plant",
                "affected_parts": disease["affected_parts"],
                "causative_agent": disease["causative_agent"],
                "treatment_urgency": disease["treatment_urgency"]
            }
    
    return best_match

def parse_gemini_response(gemini_data: dict) -> dict:
    """Parse Gemini API response and extract structured data"""
    try:
        text = ""
        if isinstance(gemini_data, dict):
            candidates = gemini_data.get("candidates") or []
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                for p in parts:
                    if "text" in p:
                        text += p["text"]
        
        if not text:
            return None
            
        # Try to extract JSON from response
        json_match = re.search(r'\{[^{}]*"disease_name"[^{}]*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        # Fallback: try to find any JSON structure
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
            
    except (json.JSONDecodeError, KeyError, ValueError, AttributeError) as e:
        print(f"Error parsing Gemini response: {e}")
    
    return None

@app.post("/predict", response_model=PredictResponse, responses={400: {"model": ErrorResponse}})
async def predict(
    image: UploadFile = File(...),
    x_gemini_api_key: Optional[str] = Header(default=None, convert_underscores=False),
    language: str = "en"
):
    # Validate image
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG or PNG.")

    content = await image.read()
    size_mb = len(content) / (1024*1024)
    if size_mb > MAX_IMAGE_MB:
        raise HTTPException(status_code=413, detail=f"Image too large. Max {MAX_IMAGE_MB} MB")

    # Load PIL image
    try:
        pil_image = Image.open(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    t0 = time.time()
    
    # Prefer header key; fall back to env key
    api_key = x_gemini_api_key or os.getenv(GEMINI_API_KEY_ENV)
    
    result_data = None
    source = "heuristic"
    
    if api_key:
        try:
            gemini_response = await call_gemini(api_key, content, language)
            result_data = parse_gemini_response(gemini_response)
            if result_data:
                source = "gemini"
            else:
                result_data = enhanced_heuristic_analysis(pil_image)
        except Exception as e:
            print(f"Gemini API error: {e}")
            result_data = enhanced_heuristic_analysis(pil_image)
    else:
        result_data = enhanced_heuristic_analysis(pil_image)
    
    # Ensure we have result data
    if not result_data:
        result_data = enhanced_heuristic_analysis(pil_image)
    
    # Prepare response
    t_ms = int((time.time()-t0)*1000)
    
    return PredictResponse(
        id=f"{int(time.time()*1000)}_{source}",
        disease=result_data.get("disease_name", "Unknown")[:100],
        confidence=round(float(result_data.get("confidence", 0.5)), 3),
        suggestions=result_data.get("recommendations", ["No specific recommendations available"]),
        inference_ms=t_ms,
        severity=result_data.get("severity"),
        plant_type=result_data.get("plant_type"),
        affected_parts=result_data.get("affected_parts", []),
        causative_agent=result_data.get("causative_agent"),
        treatment_urgency=result_data.get("treatment_urgency")
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)