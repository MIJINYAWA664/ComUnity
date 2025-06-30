import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import logging
import redis
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
from concurrent.futures import ThreadPoolExecutor
import asyncio

@dataclass
class LearningSession:
    user_id: str
    lesson_id: str
    start_time: datetime
    end_time: Optional[datetime]
    accuracy_score: float
    completion_percentage: float
    time_spent: int  # seconds
    attempts: int
    difficulty_level: str
    mistakes: List[Dict]
    engagement_score: float

@dataclass
class UserProfile:
    user_id: str
    learning_style: str  # 'visual', 'kinesthetic', 'mixed'
    skill_level: str  # 'beginner', 'intermediate', 'advanced'
    preferred_pace: str  # 'slow', 'medium', 'fast'
    strengths: List[str]
    weaknesses: List[str]
    goals: List[str]
    last_updated: datetime

@dataclass
class LessonRecommendation:
    lesson_id: str
    title: str
    difficulty_level: str
    estimated_duration: int
    confidence_score: float
    reasoning: str
    prerequisites: List[str]

class AdaptiveLearningService:
    def __init__(self, redis_client: redis.Redis):
        self.logger = logging.getLogger(__name__)
        self.redis_client = redis_client
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Initialize ML models
        self.difficulty_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.engagement_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
        # Learning parameters
        self.min_sessions_for_adaptation = 5
        self.engagement_threshold = 0.7
        self.accuracy_threshold = 0.8
        
        # Load pre-trained models if available
        self._load_models()
        
        self.logger.info("AdaptiveLearningService initialized successfully")

    def _load_models(self):
        """Load pre-trained ML models"""
        try:
            self.difficulty_model = joblib.load('models/difficulty_model.pkl')
            self.engagement_model = joblib.load('models/engagement_model.pkl')
            self.scaler = joblib.load('models/scaler.pkl')
            self.logger.info("Pre-trained models loaded successfully")
        except FileNotFoundError:
            self.logger.info("No pre-trained models found, will train from scratch")

    async def analyze_learning_session(self, session: LearningSession) -> Dict[str, any]:
        """Analyze a completed learning session"""
        try:
            # Store session data
            await self._store_session(session)
            
            # Update user profile
            await self._update_user_profile(session)
            
            # Calculate learning metrics
            metrics = await self._calculate_learning_metrics(session)
            
            # Generate insights
            insights = await self._generate_insights(session, metrics)
            
            return {
                'session_id': f"{session.user_id}_{session.lesson_id}_{int(session.start_time.timestamp())}",
                'metrics': metrics,
                'insights': insights,
                'recommendations': await self.get_next_lesson_recommendations(session.user_id)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing learning session: {str(e)}")
            raise

    async def _calculate_learning_metrics(self, session: LearningSession) -> Dict[str, float]:
        """Calculate various learning metrics"""
        # Basic metrics
        completion_rate = session.completion_percentage / 100.0
        accuracy_rate = session.accuracy_score
        efficiency = completion_rate / max(session.time_spent / 60, 1)  # completion per minute
        
        # Engagement metrics
        engagement_score = session.engagement_score
        
        # Difficulty adaptation
        expected_time = await self._get_expected_lesson_time(session.lesson_id, session.difficulty_level)
        time_efficiency = expected_time / max(session.time_spent, 1) if expected_time else 1.0
        
        # Learning velocity (improvement over time)
        learning_velocity = await self._calculate_learning_velocity(session.user_id, session.lesson_id)
        
        return {
            'completion_rate': completion_rate,
            'accuracy_rate': accuracy_rate,
            'efficiency': efficiency,
            'engagement_score': engagement_score,
            'time_efficiency': time_efficiency,
            'learning_velocity': learning_velocity,
            'attempts_ratio': 1.0 / max(session.attempts, 1)
        }

    async def _generate_insights(self, session: LearningSession, metrics: Dict[str, float]) -> List[str]:
        """Generate learning insights based on session data"""
        insights = []
        
        # Accuracy insights
        if metrics['accuracy_rate'] < 0.6:
            insights.append("Consider reviewing prerequisite concepts before continuing")
        elif metrics['accuracy_rate'] > 0.9:
            insights.append("Excellent accuracy! You're ready for more challenging content")
        
        # Time insights
        if metrics['time_efficiency'] < 0.5:
            insights.append("Taking extra time to understand concepts is beneficial")
        elif metrics['time_efficiency'] > 2.0:
            insights.append("You're progressing quickly! Consider more advanced exercises")
        
        # Engagement insights
        if metrics['engagement_score'] < 0.5:
            insights.append("Try shorter sessions or different learning activities")
        elif metrics['engagement_score'] > 0.8:
            insights.append("High engagement detected! You're in the learning zone")
        
        # Attempts insights
        if session.attempts > 3:
            insights.append("Multiple attempts show persistence - consider breaking down complex concepts")
        
        return insights

    async def get_next_lesson_recommendations(self, user_id: str, count: int = 5) -> List[LessonRecommendation]:
        """Get personalized lesson recommendations"""
        try:
            # Get user profile
            profile = await self._get_user_profile(user_id)
            
            # Get learning history
            history = await self._get_learning_history(user_id)
            
            # Get available lessons
            available_lessons = await self._get_available_lessons(user_id)
            
            # Score and rank lessons
            recommendations = []
            
            for lesson in available_lessons:
                score = await self._score_lesson_for_user(lesson, profile, history)
                
                if score > 0.3:  # Minimum threshold
                    recommendation = LessonRecommendation(
                        lesson_id=lesson['id'],
                        title=lesson['title'],
                        difficulty_level=lesson['difficulty_level'],
                        estimated_duration=lesson['estimated_duration'],
                        confidence_score=score,
                        reasoning=await self._generate_recommendation_reasoning(lesson, profile, score),
                        prerequisites=lesson.get('prerequisites', [])
                    )
                    recommendations.append(recommendation)
            
            # Sort by confidence score
            recommendations.sort(key=lambda x: x.confidence_score, reverse=True)
            
            return recommendations[:count]
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {str(e)}")
            return []

    async def _score_lesson_for_user(self, lesson: Dict, profile: UserProfile, history: List[LearningSession]) -> float:
        """Score a lesson for a specific user"""
        score = 0.0
        
        # Difficulty matching
        difficulty_score = self._calculate_difficulty_match(lesson['difficulty_level'], profile.skill_level)
        score += difficulty_score * 0.3
        
        # Learning style matching
        style_score = self._calculate_style_match(lesson, profile.learning_style)
        score += style_score * 0.2
        
        # Prerequisites check
        prereq_score = await self._check_prerequisites(lesson.get('prerequisites', []), user_id=profile.user_id)
        score += prereq_score * 0.2
        
        # Novelty (avoid recently completed lessons)
        novelty_score = self._calculate_novelty_score(lesson['id'], history)
        score += novelty_score * 0.15
        
        # Goal alignment
        goal_score = self._calculate_goal_alignment(lesson, profile.goals)
        score += goal_score * 0.15
        
        return min(score, 1.0)

    def _calculate_difficulty_match(self, lesson_difficulty: str, user_skill: str) -> float:
        """Calculate how well lesson difficulty matches user skill level"""
        difficulty_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        
        lesson_level = difficulty_map.get(lesson_difficulty, 2)
        user_level = difficulty_map.get(user_skill, 2)
        
        # Optimal match is same level or one level higher
        diff = lesson_level - user_level
        
        if diff == 0:
            return 1.0  # Perfect match
        elif diff == 1:
            return 0.8  # Slightly challenging (good)
        elif diff == -1:
            return 0.6  # Slightly easy (okay for review)
        else:
            return 0.2  # Too easy or too hard

    def _calculate_style_match(self, lesson: Dict, learning_style: str) -> float:
        """Calculate how well lesson matches user's learning style"""
        lesson_type = lesson.get('type', 'mixed')
        
        if learning_style == lesson_type or learning_style == 'mixed':
            return 1.0
        elif lesson_type == 'mixed':
            return 0.8
        else:
            return 0.4

    async def _check_prerequisites(self, prerequisites: List[str], user_id: str) -> float:
        """Check if user has completed prerequisites"""
        if not prerequisites:
            return 1.0
        
        completed_lessons = await self._get_completed_lessons(user_id)
        completed_count = sum(1 for prereq in prerequisites if prereq in completed_lessons)
        
        return completed_count / len(prerequisites)

    def _calculate_novelty_score(self, lesson_id: str, history: List[LearningSession]) -> float:
        """Calculate novelty score (prefer lessons not recently attempted)"""
        recent_lessons = [s.lesson_id for s in history[-10:]]  # Last 10 sessions
        
        if lesson_id not in recent_lessons:
            return 1.0
        else:
            # Reduce score based on how recently it was attempted
            recent_index = len(recent_lessons) - recent_lessons[::-1].index(lesson_id) - 1
            return max(0.2, 1.0 - (recent_index / 10))

    def _calculate_goal_alignment(self, lesson: Dict, goals: List[str]) -> float:
        """Calculate how well lesson aligns with user goals"""
        if not goals:
            return 0.5  # Neutral if no goals set
        
        lesson_tags = lesson.get('tags', [])
        lesson_category = lesson.get('category', '')
        
        alignment_score = 0.0
        for goal in goals:
            if goal.lower() in [tag.lower() for tag in lesson_tags]:
                alignment_score += 1.0
            elif goal.lower() in lesson_category.lower():
                alignment_score += 0.5
        
        return min(alignment_score / len(goals), 1.0)

    async def _generate_recommendation_reasoning(self, lesson: Dict, profile: UserProfile, score: float) -> str:
        """Generate human-readable reasoning for recommendation"""
        reasons = []
        
        if score > 0.8:
            reasons.append("Highly recommended based on your learning profile")
        elif score > 0.6:
            reasons.append("Good match for your current skill level")
        else:
            reasons.append("Suitable for expanding your knowledge")
        
        if lesson['difficulty_level'] == profile.skill_level:
            reasons.append("Matches your current skill level")
        elif lesson['difficulty_level'] == 'intermediate' and profile.skill_level == 'beginner':
            reasons.append("Next step in your learning journey")
        
        if lesson.get('category') in profile.goals:
            reasons.append("Aligns with your learning goals")
        
        return ". ".join(reasons)

    async def adapt_lesson_difficulty(self, user_id: str, lesson_id: str, current_performance: Dict) -> Dict[str, any]:
        """Dynamically adapt lesson difficulty based on real-time performance"""
        try:
            # Get user's historical performance
            history = await self._get_lesson_performance_history(user_id, lesson_id)
            
            # Calculate current performance metrics
            current_accuracy = current_performance.get('accuracy', 0.0)
            current_speed = current_performance.get('speed', 1.0)
            current_engagement = current_performance.get('engagement', 0.5)
            
            # Determine if adaptation is needed
            adaptation_needed = False
            adaptation_type = None
            
            if current_accuracy < 0.5 and current_engagement < 0.4:
                adaptation_needed = True
                adaptation_type = 'decrease_difficulty'
            elif current_accuracy > 0.9 and current_speed > 1.5:
                adaptation_needed = True
                adaptation_type = 'increase_difficulty'
            
            if adaptation_needed:
                # Generate adaptation parameters
                adaptation = await self._generate_adaptation_parameters(
                    adaptation_type, current_performance, history
                )
                
                # Log adaptation
                await self._log_adaptation(user_id, lesson_id, adaptation_type, adaptation)
                
                return {
                    'adapted': True,
                    'adaptation_type': adaptation_type,
                    'parameters': adaptation,
                    'reasoning': adaptation.get('reasoning', '')
                }
            
            return {'adapted': False}
            
        except Exception as e:
            self.logger.error(f"Error adapting lesson difficulty: {str(e)}")
            return {'adapted': False, 'error': str(e)}

    async def _generate_adaptation_parameters(self, adaptation_type: str, performance: Dict, history: List) -> Dict:
        """Generate specific adaptation parameters"""
        if adaptation_type == 'decrease_difficulty':
            return {
                'hint_frequency': 'increased',
                'time_pressure': 'reduced',
                'complexity': 'simplified',
                'examples': 'more_provided',
                'reasoning': 'Reducing difficulty to improve understanding and engagement'
            }
        elif adaptation_type == 'increase_difficulty':
            return {
                'hint_frequency': 'reduced',
                'time_pressure': 'increased',
                'complexity': 'enhanced',
                'bonus_challenges': 'enabled',
                'reasoning': 'Increasing difficulty to maintain engagement and challenge'
            }
        
        return {}

    async def get_learning_analytics(self, user_id: str, timeframe: str = '30d') -> Dict[str, any]:
        """Get comprehensive learning analytics for a user"""
        try:
            # Parse timeframe
            days = int(timeframe.replace('d', ''))
            start_date = datetime.now() - timedelta(days=days)
            
            # Get learning sessions in timeframe
            sessions = await self._get_sessions_in_timeframe(user_id, start_date)
            
            if not sessions:
                return {'error': 'No learning data available for the specified timeframe'}
            
            # Calculate analytics
            analytics = {
                'total_sessions': len(sessions),
                'total_time_spent': sum(s.time_spent for s in sessions),
                'average_accuracy': np.mean([s.accuracy_score for s in sessions]),
                'average_engagement': np.mean([s.engagement_score for s in sessions]),
                'lessons_completed': len(set(s.lesson_id for s in sessions if s.completion_percentage >= 100)),
                'learning_streak': await self._calculate_learning_streak(user_id),
                'skill_progression': await self._calculate_skill_progression(sessions),
                'time_distribution': await self._calculate_time_distribution(sessions),
                'difficulty_progression': await self._calculate_difficulty_progression(sessions),
                'strengths_weaknesses': await self._identify_strengths_weaknesses(sessions)
            }
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"Error generating learning analytics: {str(e)}")
            return {'error': str(e)}

    async def _calculate_learning_velocity(self, user_id: str, lesson_id: str) -> float:
        """Calculate learning velocity (improvement rate)"""
        sessions = await self._get_lesson_sessions(user_id, lesson_id)
        
        if len(sessions) < 2:
            return 0.0
        
        # Calculate improvement in accuracy over time
        accuracies = [s.accuracy_score for s in sorted(sessions, key=lambda x: x.start_time)]
        
        if len(accuracies) >= 2:
            return (accuracies[-1] - accuracies[0]) / len(accuracies)
        
        return 0.0

    # Redis helper methods and data persistence
    async def _store_session(self, session: LearningSession):
        """Store learning session data"""
        key = f"learning_session:{session.user_id}:{int(session.start_time.timestamp())}"
        
        session_data = {
            'user_id': session.user_id,
            'lesson_id': session.lesson_id,
            'start_time': session.start_time.isoformat(),
            'end_time': session.end_time.isoformat() if session.end_time else None,
            'accuracy_score': session.accuracy_score,
            'completion_percentage': session.completion_percentage,
            'time_spent': session.time_spent,
            'attempts': session.attempts,
            'difficulty_level': session.difficulty_level,
            'mistakes': session.mistakes,
            'engagement_score': session.engagement_score
        }
        
        await self._redis_set(key, json.dumps(session_data), ex=86400 * 90)  # 90 days
        
        # Add to user's session list
        user_sessions_key = f"user_sessions:{session.user_id}"
        await self._redis_lpush(user_sessions_key, key)
        await self._redis_ltrim(user_sessions_key, 0, 999)  # Keep last 1000 sessions

    async def _get_user_profile(self, user_id: str) -> UserProfile:
        """Get user learning profile"""
        key = f"user_profile:{user_id}"
        profile_data = await self._redis_get(key)
        
        if profile_data:
            data = json.loads(profile_data)
            return UserProfile(
                user_id=data['user_id'],
                learning_style=data['learning_style'],
                skill_level=data['skill_level'],
                preferred_pace=data['preferred_pace'],
                strengths=data['strengths'],
                weaknesses=data['weaknesses'],
                goals=data['goals'],
                last_updated=datetime.fromisoformat(data['last_updated'])
            )
        else:
            # Return default profile
            return UserProfile(
                user_id=user_id,
                learning_style='mixed',
                skill_level='beginner',
                preferred_pace='medium',
                strengths=[],
                weaknesses=[],
                goals=[],
                last_updated=datetime.now()
            )

    # Additional Redis helper methods
    async def _redis_set(self, key: str, value: str, ex: int = None):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.set, key, value, ex)

    async def _redis_get(self, key: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.redis_client.get, key)

    async def _redis_lpush(self, key: str, value: str):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.lpush, key, value)

    async def _redis_ltrim(self, key: str, start: int, end: int):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.redis_client.ltrim, key, start, end)

    def __del__(self):
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)