import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass
from datetime import datetime
import asyncio
import json
from concurrent.futures import ThreadPoolExecutor
import redis
from prometheus_client import Counter, Histogram, Gauge

# Metrics
RECOGNITION_REQUESTS = Counter('sign_recognition_requests_total', 'Total sign recognition requests')
RECOGNITION_LATENCY = Histogram('sign_recognition_duration_seconds', 'Sign recognition processing time')
ACTIVE_SESSIONS = Gauge('sign_recognition_active_sessions', 'Number of active recognition sessions')

@dataclass
class RecognitionResult:
    gesture: str
    confidence: float
    timestamp: datetime
    bounding_box: Dict[str, float]
    landmarks: List[Dict[str, float]]
    processing_time_ms: float

@dataclass
class SessionConfig:
    user_id: str
    session_type: str  # 'practice', 'communication', 'learning'
    target_gestures: List[str]
    confidence_threshold: float = 0.8
    max_session_duration: int = 3600  # seconds

class SignLanguageRecognitionService:
    def __init__(self, model_path: str, redis_client: redis.Redis):
        self.logger = logging.getLogger(__name__)
        self.redis_client = redis_client
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Initialize hand tracking
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Initialize pose tracking
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Load TensorFlow model
        self.model = tf.keras.models.load_model(model_path)
        self.gesture_classes = self._load_gesture_classes()
        
        # Session management
        self.active_sessions: Dict[str, SessionConfig] = {}
        
        self.logger.info("SignLanguageRecognitionService initialized successfully")

    def _load_gesture_classes(self) -> List[str]:
        """Load gesture class labels"""
        return [
            'hello', 'thank_you', 'please', 'help', 'yes', 'no',
            'good', 'bad', 'more', 'stop', 'go', 'come',
            'eat', 'drink', 'sleep', 'work', 'home', 'family',
            'friend', 'love', 'happy', 'sad', 'angry', 'afraid',
            'hot', 'cold', 'big', 'small', 'fast', 'slow'
        ]

    async def start_session(self, config: SessionConfig) -> str:
        """Start a new recognition session"""
        session_id = f"session_{config.user_id}_{int(datetime.now().timestamp())}"
        
        self.active_sessions[session_id] = config
        ACTIVE_SESSIONS.inc()
        
        # Store session in Redis with expiration
        session_data = {
            'user_id': config.user_id,
            'session_type': config.session_type,
            'target_gestures': config.target_gestures,
            'start_time': datetime.now().isoformat(),
            'confidence_threshold': config.confidence_threshold
        }
        
        await self._redis_set(f"session:{session_id}", json.dumps(session_data), ex=config.max_session_duration)
        
        self.logger.info(f"Started recognition session {session_id} for user {config.user_id}")
        return session_id

    async def process_frame(self, session_id: str, frame_data: np.ndarray) -> Optional[RecognitionResult]:
        """Process a single frame for sign language recognition"""
        RECOGNITION_REQUESTS.inc()
        
        with RECOGNITION_LATENCY.time():
            start_time = datetime.now()
            
            if session_id not in self.active_sessions:
                self.logger.warning(f"Session {session_id} not found")
                return None
            
            try:
                # Preprocess frame
                rgb_frame = cv2.cvtColor(frame_data, cv2.COLOR_BGR2RGB)
                
                # Extract hand landmarks
                hand_results = self.hands.process(rgb_frame)
                pose_results = self.pose.process(rgb_frame)
                
                if not hand_results.multi_hand_landmarks:
                    return None
                
                # Extract features
                features = await self._extract_features(hand_results, pose_results, rgb_frame.shape)
                
                # Run inference
                prediction = await self._run_inference(features)
                
                # Post-process results
                result = await self._post_process_prediction(
                    prediction, hand_results, pose_results, start_time
                )
                
                # Store result
                if result and result.confidence >= self.active_sessions[session_id].confidence_threshold:
                    await self._store_result(session_id, result)
                
                return result
                
            except Exception as e:
                self.logger.error(f"Error processing frame for session {session_id}: {str(e)}")
                return None

    async def _extract_features(self, hand_results, pose_results, frame_shape) -> np.ndarray:
        """Extract features from MediaPipe landmarks"""
        features = []
        
        # Hand landmarks (21 points per hand, x,y,z coordinates)
        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                for landmark in hand_landmarks.landmark:
                    features.extend([landmark.x, landmark.y, landmark.z])
        else:
            # Pad with zeros if no hands detected
            features.extend([0.0] * 63)  # 21 * 3
        
        # Pose landmarks (33 points, x,y,z coordinates)
        if pose_results.pose_landmarks:
            for landmark in pose_results.pose_landmarks.landmark:
                features.extend([landmark.x, landmark.y, landmark.z])
        else:
            # Pad with zeros if no pose detected
            features.extend([0.0] * 99)  # 33 * 3
        
        # Normalize features
        features_array = np.array(features, dtype=np.float32)
        features_array = features_array.reshape(1, -1)
        
        return features_array

    async def _run_inference(self, features: np.ndarray) -> np.ndarray:
        """Run model inference in thread pool"""
        loop = asyncio.get_event_loop()
        prediction = await loop.run_in_executor(
            self.executor, 
            self.model.predict, 
            features
        )
        return prediction

    async def _post_process_prediction(self, prediction: np.ndarray, hand_results, pose_results, start_time: datetime) -> Optional[RecognitionResult]:
        """Post-process model prediction"""
        confidence = float(np.max(prediction))
        gesture_idx = int(np.argmax(prediction))
        gesture = self.gesture_classes[gesture_idx]
        
        # Calculate bounding box
        bounding_box = self._calculate_bounding_box(hand_results)
        
        # Extract landmarks
        landmarks = self._extract_landmarks(hand_results, pose_results)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return RecognitionResult(
            gesture=gesture,
            confidence=confidence,
            timestamp=datetime.now(),
            bounding_box=bounding_box,
            landmarks=landmarks,
            processing_time_ms=processing_time
        )

    def _calculate_bounding_box(self, hand_results) -> Dict[str, float]:
        """Calculate bounding box for detected hands"""
        if not hand_results.multi_hand_landmarks:
            return {'x': 0, 'y': 0, 'width': 0, 'height': 0}
        
        all_x = []
        all_y = []
        
        for hand_landmarks in hand_results.multi_hand_landmarks:
            for landmark in hand_landmarks.landmark:
                all_x.append(landmark.x)
                all_y.append(landmark.y)
        
        if not all_x:
            return {'x': 0, 'y': 0, 'width': 0, 'height': 0}
        
        min_x, max_x = min(all_x), max(all_x)
        min_y, max_y = min(all_y), max(all_y)
        
        return {
            'x': min_x,
            'y': min_y,
            'width': max_x - min_x,
            'height': max_y - min_y
        }

    def _extract_landmarks(self, hand_results, pose_results) -> List[Dict[str, float]]:
        """Extract landmark coordinates"""
        landmarks = []
        
        # Hand landmarks
        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                for landmark in hand_landmarks.landmark:
                    landmarks.append({
                        'x': landmark.x,
                        'y': landmark.y,
                        'z': landmark.z
                    })
        
        return landmarks

    async def _store_result(self, session_id: str, result: RecognitionResult):
        """Store recognition result"""
        result_data = {
            'gesture': result.gesture,
            'confidence': result.confidence,
            'timestamp': result.timestamp.isoformat(),
            'bounding_box': result.bounding_box,
            'processing_time_ms': result.processing_time_ms
        }
        
        # Store in Redis list
        await self._redis_lpush(f"results:{session_id}", json.dumps(result_data))
        await self._redis_expire(f"results:{session_id}", 3600)  # 1 hour expiration

    async def get_session_results(self, session_id: str, limit: int = 100) -> List[RecognitionResult]:
        """Get recognition results for a session"""
        results_data = await self._redis_lrange(f"results:{session_id}", 0, limit - 1)
        
        results = []
        for data in results_data:
            result_dict = json.loads(data)
            result = RecognitionResult(
                gesture=result_dict['gesture'],
                confidence=result_dict['confidence'],
                timestamp=datetime.fromisoformat(result_dict['timestamp']),
                bounding_box=result_dict['bounding_box'],
                landmarks=[],  # Not stored for performance
                processing_time_ms=result_dict['processing_time_ms']
            )
            results.append(result)
        
        return results

    async def end_session(self, session_id: str) -> Dict[str, any]:
        """End a recognition session and return statistics"""
        if session_id not in self.active_sessions:
            return {'error': 'Session not found'}
        
        # Get session results
        results = await self.get_session_results(session_id)
        
        # Calculate statistics
        total_gestures = len(results)
        avg_confidence = np.mean([r.confidence for r in results]) if results else 0
        avg_processing_time = np.mean([r.processing_time_ms for r in results]) if results else 0
        
        # Gesture frequency
        gesture_counts = {}
        for result in results:
            gesture_counts[result.gesture] = gesture_counts.get(result.gesture, 0) + 1
        
        stats = {
            'session_id': session_id,
            'total_gestures': total_gestures,
            'average_confidence': float(avg_confidence),
            'average_processing_time_ms': float(avg_processing_time),
            'gesture_frequency': gesture_counts,
            'session_duration': (datetime.now() - datetime.fromisoformat(
                json.loads(await self._redis_get(f"session:{session_id}"))['start_time']
            )).total_seconds()
        }
        
        # Cleanup
        del self.active_sessions[session_id]
        ACTIVE_SESSIONS.dec()
        
        await self._redis_delete(f"session:{session_id}")
        await self._redis_delete(f"results:{session_id}")
        
        self.logger.info(f"Ended session {session_id} with {total_gestures} gestures recognized")
        return stats

    # Redis helper methods
    async def _redis_set(self, key: str, value: str, ex: int = None):
        """Async Redis SET operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.set, key, value, ex)

    async def _redis_get(self, key: str) -> str:
        """Async Redis GET operation"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.redis_client.get, key)

    async def _redis_lpush(self, key: str, value: str):
        """Async Redis LPUSH operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.lpush, key, value)

    async def _redis_lrange(self, key: str, start: int, end: int) -> List[str]:
        """Async Redis LRANGE operation"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.redis_client.lrange, key, start, end)

    async def _redis_expire(self, key: str, seconds: int):
        """Async Redis EXPIRE operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.expire, key, seconds)

    async def _redis_delete(self, key: str):
        """Async Redis DELETE operation"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.delete, key)

    def __del__(self):
        """Cleanup resources"""
        if hasattr(self, 'hands'):
            self.hands.close()
        if hasattr(self, 'pose'):
            self.pose.close()
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)