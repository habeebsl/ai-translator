import io
from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.openai_utils import generate_speech_audio

load_dotenv()


class TextToSpeechRequest(BaseModel):
    text: str

api = APIRouter()

@api.post("/generate-speech")
async def speech_endpoint(request: TextToSpeechRequest):
    """Generates speech from text and returns an MP3 audio stream."""
    audio_data = generate_speech_audio(request.text)
    
    audio_bytes = io.BytesIO(audio_data)
    audio_bytes.seek(0)
    
    return StreamingResponse(
        audio_bytes, 
        media_type="audio/mp3"
    )

@api.get("/health")
def health_check():
    """Health check endpoint for monitoring or CronJobs."""
    return {"status": "ok"}