from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
import redis
import logging
import numpy as np
import cv2
from typing import List, Optional
import json
from datetime import datetime
import uvicorn

from sign_language_service import SignLanguageRecognitionService, SessionConfig, RecognitionResult
from speech_recognition_service import SpeechRecognitionService, TranscriptionResult
from adaptive_learning_service import AdaptiveLearningService, LearningSession

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CommUnity AI Services",
    description="AI-powered services for sign language recognition, speech processing, and adaptive learning",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=False)

# Initialize AI services
sign_language_service = SignLanguageRecognitionService(
    model_path="models/sign_language_model.h5",
    redis_client=redis_client
)

speech_service = SpeechRecognitionService(redis_client)
learning_service = AdaptiveLearningService(redis_client)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Sign Language Recognition Endpoints
@app.post("/api/sign-recognition/start-session")
async def start_sign_recognition_session(
    user_id: str,
    session_type: str = "communication",
    target_gestures: Optional[List[str]] = None,
    confidence_threshold: float = 0.8
):
    """Start a new sign language recognition session"""
    try:
        config = SessionConfig(
            user_id=user_id,
            session_type=session_type,
            target_gestures=target_gestures or [],
            confidence_threshold=confidence_threshold
        )
        
        session_id = await sign_language_service.start_session(config)
        
        return {
            "session_id": session_id,
            "status": "started",
            "config": {
                "session_type": session_type,
                "target_gestures": target_gestures,
                "confidence_threshold": confidence_threshold
            }
        }
    except Exception as e:
        logger.error(f"Error starting sign recognition session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sign-recognition/process-frame")
async def process_sign_frame(
    session_id: str,
    frame: UploadFile = File(...)
):
    """Process a video frame for sign language recognition"""
    try:
        # Read and decode image
        image_data = await frame.read()
        nparr = np.frombuffer(image_data, np.uint8)
        frame_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame_array is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process frame
        result = await sign_language_service.process_frame(session_id, frame_array)
        
        if result:
            return {
                "gesture": result.gesture,
                "confidence": result.confidence,
                "timestamp": result.timestamp.isoformat(),
                "bounding_box": result.bounding_box,
                "processing_time_ms": result.processing_time_ms
            }
        else:
            return {"gesture": None, "confidence": 0.0}
            
    except Exception as e:
        logger.error(f"Error processing sign frame: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sign-recognition/sessions/{session_id}/results")
async def get_sign_recognition_results(session_id: str, limit: int = 100):
    """Get recognition results for a session"""
    try:
        results = await sign_language_service.get_session_results(session_id, limit)
        
        return {
            "session_id": session_id,
            "results": [
                {
                    "gesture": r.gesture,
                    "confidence": r.confidence,
                    "timestamp": r.timestamp.isoformat(),
                    "bounding_box": r.bounding_box,
                    "processing_time_ms": r.processing_time_ms
                }
                for r in results
            ]
        }
    except Exception as e:
        logger.error(f"Error getting sign recognition results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sign-recognition/end-session")
async def end_sign_recognition_session(session_id: str):
    """End a sign language recognition session"""
    try:
        stats = await sign_language_service.end_session(session_id)
        return stats
    except Exception as e:
        logger.error(f"Error ending sign recognition session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Speech Recognition Endpoints
@app.post("/api/speech/transcribe")
async def transcribe_speech(
    audio: UploadFile = File(...),
    language: str = "auto",
    enable_translation: bool = False,
    target_languages: Optional[List[str]] = None
):
    """Transcribe audio to text with optional translation"""
    try:
        # Read audio data
        audio_data = await audio.read()
        
        # Transcribe
        result = await speech_service.transcribe_audio(
            audio_data=audio_data,
            language=language,
            enable_translation=enable_translation,
            target_languages=target_languages or []
        )
        
        return {
            "transcript": result.transcript,
            "confidence": result.confidence,
            "language": result.language,
            "timestamp": result.timestamp.isoformat(),
            "processing_time_ms": result.processing_time_ms,
            "translations": result.translations
        }
        
    except Exception as e:
        logger.error(f"Error transcribing speech: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech/real-time-transcribe")
async def real_time_transcribe(
    session_id: str,
    audio_chunk: UploadFile = File(...),
    language: str = "auto"
):
    """Process real-time audio chunk for transcription"""
    try:
        audio_data = await audio_chunk.read()
        
        result = await speech_service.real_time_transcription(
            session_id=session_id,
            audio_chunk=audio_data,
            language=language
        )
        
        if result:
            return {
                "transcript": result.transcript,
                "confidence": result.confidence,
                "language": result.language,
                "timestamp": result.timestamp.isoformat(),
                "processing_time_ms": result.processing_time_ms
            }
        else:
            return {"transcript": "", "confidence": 0.0}
            
    except Exception as e:
        logger.error(f"Error in real-time transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech/detect-language")
async def detect_language(audio: UploadFile = File(...)):
    """Detect language from audio"""
    try:
        audio_data = await audio.read()
        language, confidence = await speech_service.detect_language(audio_data)
        
        return {
            "language": language,
            "confidence": confidence
        }
        
    except Exception as e:
        logger.error(f"Error detecting language: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/speech/history/{user_id}")
async def get_transcription_history(user_id: str, limit: int = 50):
    """Get transcription history for user"""
    try:
        history = await speech_service.get_transcription_history(user_id, limit)
        
        return {
            "user_id": user_id,
            "history": [
                {
                    "transcript": h.transcript,
                    "confidence": h.confidence,
                    "language": h.language,
                    "timestamp": h.timestamp.isoformat(),
                    "translations": h.translations
                }
                for h in history
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting transcription history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Adaptive Learning Endpoints
@app.post("/api/learning/analyze-session")
async def analyze_learning_session(
    user_id: str,
    lesson_id: str,
    start_time: str,
    end_time: Optional[str] = None,
    accuracy_score: float = 0.0,
    completion_percentage: float = 0.0,
    time_spent: int = 0,
    attempts: int = 1,
    difficulty_level: str = "beginner",
    mistakes: Optional[List[dict]] = None,
    engagement_score: float = 0.5
):
    """Analyze a completed learning session"""
    try:
        session = LearningSession(
            user_id=user_id,
            lesson_id=lesson_id,
            start_time=datetime.fromisoformat(start_time),
            end_time=datetime.fromisoformat(end_time) if end_time else None,
            accuracy_score=accuracy_score,
            completion_percentage=completion_percentage,
            time_spent=time_spent,
            attempts=attempts,
            difficulty_level=difficulty_level,
            mistakes=mistakes or [],
            engagement_score=engagement_score
        )
        
        analysis = await learning_service.analyze_learning_session(session)
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing learning session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learning/recommendations/{user_id}")
async def get_lesson_recommendations(user_id: str, count: int = 5):
    """Get personalized lesson recommendations"""
    try:
        recommendations = await learning_service.get_next_lesson_recommendations(user_id, count)
        
        return {
            "user_id": user_id,
            "recommendations": [
                {
                    "lesson_id": r.lesson_id,
                    "title": r.title,
                    "difficulty_level": r.difficulty_level,
                    "estimated_duration": r.estimated_duration,
                    "confidence_score": r.confidence_score,
                    "reasoning": r.reasoning,
                    "prerequisites": r.prerequisites
                }
                for r in recommendations
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting lesson recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learning/adapt-difficulty")
async def adapt_lesson_difficulty(
    user_id: str,
    lesson_id: str,
    accuracy: float,
    speed: float = 1.0,
    engagement: float = 0.5
):
    """Adapt lesson difficulty based on real-time performance"""
    try:
        current_performance = {
            "accuracy": accuracy,
            "speed": speed,
            "engagement": engagement
        }
        
        adaptation = await learning_service.adapt_lesson_difficulty(
            user_id, lesson_id, current_performance
        )
        
        return adaptation
        
    except Exception as e:
        logger.error(f"Error adapting lesson difficulty: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learning/analytics/{user_id}")
async def get_learning_analytics(user_id: str, timeframe: str = "30d"):
    """Get comprehensive learning analytics"""
    try:
        analytics = await learning_service.get_learning_analytics(user_id, timeframe)
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting learning analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )