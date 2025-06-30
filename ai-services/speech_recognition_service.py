import asyncio
import json
import logging
import numpy as np
import torch
import whisper
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import librosa
import redis
from concurrent.futures import ThreadPoolExecutor
from prometheus_client import Counter, Histogram
import speech_recognition as sr
from googletrans import Translator

# Metrics
SPEECH_REQUESTS = Counter('speech_recognition_requests_total', 'Total speech recognition requests')
SPEECH_LATENCY = Histogram('speech_recognition_duration_seconds', 'Speech recognition processing time')
TRANSLATION_REQUESTS = Counter('translation_requests_total', 'Total translation requests')

@dataclass
class TranscriptionResult:
    transcript: str
    confidence: float
    language: str
    timestamp: datetime
    processing_time_ms: float
    translations: Dict[str, str] = None
    speaker_id: Optional[str] = None

@dataclass
class AudioSegment:
    audio_data: np.ndarray
    sample_rate: int
    start_time: float
    end_time: float
    speaker_id: Optional[str] = None

class SpeechRecognitionService:
    def __init__(self, redis_client: redis.Redis):
        self.logger = logging.getLogger(__name__)
        self.redis_client = redis_client
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.translator = Translator()
        
        # Initialize Whisper model
        self.whisper_model = whisper.load_model("base")
        
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        
        # Supported languages
        self.supported_languages = {
            'en': 'English',
            'es': 'Spanish', 
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi'
        }
        
        self.logger.info("SpeechRecognitionService initialized successfully")

    async def transcribe_audio(self, 
                             audio_data: bytes, 
                             language: str = 'auto',
                             enable_translation: bool = False,
                             target_languages: List[str] = None) -> TranscriptionResult:
        """Transcribe audio to text with optional translation"""
        SPEECH_REQUESTS.inc()
        
        with SPEECH_LATENCY.time():
            start_time = datetime.now()
            
            try:
                # Convert audio data to numpy array
                audio_array = await self._process_audio_data(audio_data)
                
                # Transcribe using Whisper
                result = await self._transcribe_with_whisper(audio_array, language)
                
                # Translate if requested
                translations = {}
                if enable_translation and target_languages:
                    translations = await self._translate_text(result['text'], target_languages)
                
                processing_time = (datetime.now() - start_time).total_seconds() * 1000
                
                return TranscriptionResult(
                    transcript=result['text'],
                    confidence=self._calculate_confidence(result),
                    language=result['language'],
                    timestamp=datetime.now(),
                    processing_time_ms=processing_time,
                    translations=translations
                )
                
            except Exception as e:
                self.logger.error(f"Error transcribing audio: {str(e)}")
                raise

    async def _process_audio_data(self, audio_data: bytes) -> np.ndarray:
        """Process raw audio data"""
        loop = asyncio.get_event_loop()
        
        def process():
            # Convert bytes to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
            
            # Resample to 16kHz if needed
            if len(audio_array) > 0:
                audio_array = librosa.resample(audio_array, orig_sr=44100, target_sr=16000)
            
            return audio_array
        
        return await loop.run_in_executor(self.executor, process)

    async def _transcribe_with_whisper(self, audio_array: np.ndarray, language: str) -> Dict:
        """Transcribe audio using Whisper model"""
        loop = asyncio.get_event_loop()
        
        def transcribe():
            # Prepare audio for Whisper
            if language == 'auto':
                result = self.whisper_model.transcribe(audio_array)
            else:
                result = self.whisper_model.transcribe(audio_array, language=language)
            
            return result
        
        return await loop.run_in_executor(self.executor, transcribe)

    def _calculate_confidence(self, whisper_result: Dict) -> float:
        """Calculate confidence score from Whisper result"""
        # Whisper doesn't provide direct confidence scores
        # We estimate based on segment probabilities
        if 'segments' in whisper_result:
            segment_probs = []
            for segment in whisper_result['segments']:
                if 'avg_logprob' in segment:
                    # Convert log probability to confidence
                    confidence = np.exp(segment['avg_logprob'])
                    segment_probs.append(confidence)
            
            if segment_probs:
                return float(np.mean(segment_probs))
        
        # Default confidence based on text length and quality
        text = whisper_result.get('text', '')
        if len(text) > 10 and not any(char in text for char in ['[', ']', '(', ')']):
            return 0.85
        elif len(text) > 5:
            return 0.70
        else:
            return 0.50

    async def _translate_text(self, text: str, target_languages: List[str]) -> Dict[str, str]:
        """Translate text to target languages"""
        TRANSLATION_REQUESTS.inc()
        
        translations = {}
        
        for lang in target_languages:
            if lang in self.supported_languages:
                try:
                    loop = asyncio.get_event_loop()
                    translation = await loop.run_in_executor(
                        self.executor,
                        lambda: self.translator.translate(text, dest=lang).text
                    )
                    translations[lang] = translation
                except Exception as e:
                    self.logger.error(f"Translation error for {lang}: {str(e)}")
                    translations[lang] = text  # Fallback to original text
        
        return translations

    async def real_time_transcription(self, 
                                    session_id: str,
                                    audio_chunk: bytes,
                                    language: str = 'auto') -> Optional[TranscriptionResult]:
        """Process real-time audio chunks"""
        try:
            # Store audio chunk
            await self._store_audio_chunk(session_id, audio_chunk)
            
            # Get accumulated audio for this session
            accumulated_audio = await self._get_accumulated_audio(session_id)
            
            # Only transcribe if we have enough audio (e.g., 2 seconds)
            if len(accumulated_audio) < 32000:  # 2 seconds at 16kHz
                return None
            
            # Transcribe accumulated audio
            result = await self.transcribe_audio(accumulated_audio, language)
            
            # Clear accumulated audio after successful transcription
            await self._clear_accumulated_audio(session_id)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error in real-time transcription: {str(e)}")
            return None

    async def _store_audio_chunk(self, session_id: str, audio_chunk: bytes):
        """Store audio chunk for session"""
        key = f"audio_chunks:{session_id}"
        await self._redis_append(key, audio_chunk)
        await self._redis_expire(key, 300)  # 5 minutes expiration

    async def _get_accumulated_audio(self, session_id: str) -> bytes:
        """Get accumulated audio for session"""
        key = f"audio_chunks:{session_id}"
        return await self._redis_get_bytes(key) or b''

    async def _clear_accumulated_audio(self, session_id: str):
        """Clear accumulated audio for session"""
        key = f"audio_chunks:{session_id}"
        await self._redis_delete(key)

    async def detect_language(self, audio_data: bytes) -> Tuple[str, float]:
        """Detect language from audio"""
        try:
            audio_array = await self._process_audio_data(audio_data)
            
            # Use Whisper for language detection
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                lambda: self.whisper_model.transcribe(audio_array, task='detect_language')
            )
            
            detected_language = result.get('language', 'en')
            confidence = 0.8  # Default confidence for language detection
            
            return detected_language, confidence
            
        except Exception as e:
            self.logger.error(f"Error detecting language: {str(e)}")
            return 'en', 0.5  # Default to English

    async def enhance_audio(self, audio_data: bytes) -> bytes:
        """Enhance audio quality for better recognition"""
        try:
            audio_array = await self._process_audio_data(audio_data)
            
            loop = asyncio.get_event_loop()
            
            def enhance():
                # Noise reduction using spectral subtraction
                enhanced = librosa.effects.preemphasis(audio_array)
                
                # Normalize audio
                enhanced = librosa.util.normalize(enhanced)
                
                return enhanced.astype(np.float32).tobytes()
            
            return await loop.run_in_executor(self.executor, enhance)
            
        except Exception as e:
            self.logger.error(f"Error enhancing audio: {str(e)}")
            return audio_data  # Return original if enhancement fails

    async def get_transcription_history(self, user_id: str, limit: int = 50) -> List[TranscriptionResult]:
        """Get transcription history for user"""
        key = f"transcription_history:{user_id}"
        history_data = await self._redis_lrange(key, 0, limit - 1)
        
        history = []
        for data in history_data:
            result_dict = json.loads(data)
            result = TranscriptionResult(
                transcript=result_dict['transcript'],
                confidence=result_dict['confidence'],
                language=result_dict['language'],
                timestamp=datetime.fromisoformat(result_dict['timestamp']),
                processing_time_ms=result_dict['processing_time_ms'],
                translations=result_dict.get('translations'),
                speaker_id=result_dict.get('speaker_id')
            )
            history.append(result)
        
        return history

    async def save_transcription(self, user_id: str, result: TranscriptionResult):
        """Save transcription to user history"""
        key = f"transcription_history:{user_id}"
        
        result_data = {
            'transcript': result.transcript,
            'confidence': result.confidence,
            'language': result.language,
            'timestamp': result.timestamp.isoformat(),
            'processing_time_ms': result.processing_time_ms,
            'translations': result.translations,
            'speaker_id': result.speaker_id
        }
        
        await self._redis_lpush(key, json.dumps(result_data))
        await self._redis_ltrim(key, 0, 999)  # Keep last 1000 transcriptions
        await self._redis_expire(key, 86400 * 30)  # 30 days expiration

    # Redis helper methods
    async def _redis_append(self, key: str, value: bytes):
        """Async Redis APPEND operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.append, key, value)

    async def _redis_get_bytes(self, key: str) -> bytes:
        """Async Redis GET operation for bytes"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.redis_client.get, key)

    async def _redis_delete(self, key: str):
        """Async Redis DELETE operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.delete, key)

    async def _redis_expire(self, key: str, seconds: int):
        """Async Redis EXPIRE operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.expire, key, seconds)

    async def _redis_lpush(self, key: str, value: str):
        """Async Redis LPUSH operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.lpush, key, value)

    async def _redis_lrange(self, key: str, start: int, end: int) -> List[str]:
        """Async Redis LRANGE operation"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.redis_client.lrange, key, start, end)

    async def _redis_ltrim(self, key: str, start: int, end: int):
        """Async Redis LTRIM operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.ltrim, key, start, end)

    def __del__(self):
        """Cleanup resources"""
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)