#!/usr/bin/env python3
"""
User Management System for EthBond
==================================

This module handles user data, progress tracking, and analytics for the EthBond application.

Author: EthBond Team
Date: 2025
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)


class UserManager:
    """
    User management system for tracking progress and analytics.
    """
    
    def __init__(self, data_dir: str = "user_data"):
        """
        Initialize user manager.
        
        Args:
            data_dir: Directory for user data storage
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # User data file
        self.users_file = self.data_dir / "users.json"
        self.analytics_file = self.data_dir / "analytics.json"
        
        # Initialize data files
        self._initialize_data_files()
        
        logger.info("User manager initialized")
    
    def _initialize_data_files(self):
        """Initialize data files if they don't exist."""
        if not self.users_file.exists():
            with open(self.users_file, 'w') as f:
                json.dump({}, f)
        
        if not self.analytics_file.exists():
            with open(self.analytics_file, 'w') as f:
                json.dump({}, f)
    
    def create_user(self, username: str, email: str = None) -> str:
        """
        Create a new user.
        
        Args:
            username: User's username
            email: User's email (optional)
            
        Returns:
            str: User ID
        """
        try:
            user_id = str(uuid.uuid4())
            
            user_data = {
                'user_id': user_id,
                'username': username,
                'email': email,
                'created_at': datetime.now().isoformat(),
                'total_videos': 0,
                'total_reps': 0,
                'average_performance': 0,
                'improvement': 0,
                'badges': [],
                'last_activity': datetime.now().isoformat()
            }
            
            # Load existing users
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            # Add new user
            users[user_id] = user_data
            
            # Save users
            with open(self.users_file, 'w') as f:
                json.dump(users, f, indent=2)
            
            logger.info(f"User created: {username} ({user_id})")
            return user_id
            
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            raise
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user data by ID."""
        try:
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            return users.get(user_id)
        except Exception as e:
            logger.error(f"Failed to get user: {str(e)}")
            return None
    
    def update_user_progress(self, user_id: str, analysis_results: Dict):
        """
        Update user progress based on analysis results.
        
        Args:
            user_id: User ID
            analysis_results: Results from video analysis
        """
        try:
            # Load users
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            if user_id not in users:
                logger.warning(f"User not found: {user_id}")
                return
            
            user = users[user_id]
            
            # Update user statistics
            user['total_videos'] += 1
            user['total_reps'] += analysis_results['total_reps']
            user['last_activity'] = datetime.now().isoformat()
            
            # Calculate new average performance
            current_avg = user['average_performance']
            total_videos = user['total_videos']
            new_score = analysis_results['average_score']
            
            # Weighted average (more weight to recent performance)
            user['average_performance'] = ((current_avg * (total_videos - 1)) + new_score) / total_videos
            
            # Update badges
            self._update_user_badges(user, analysis_results)
            
            # Save users
            with open(self.users_file, 'w') as f:
                json.dump(users, f, indent=2)
            
            # Update analytics
            self._update_analytics(user_id, analysis_results)
            
            logger.info(f"User progress updated: {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to update user progress: {str(e)}")
            raise
    
    def _update_user_badges(self, user: Dict, analysis_results: Dict):
        """Update user badges based on analysis results."""
        current_badges = user.get('badges', [])
        new_badges = analysis_results.get('badges', [])
        
        # Create badge lookup
        badge_lookup = {badge['name']: badge for badge in current_badges}
        
        # Update badges
        for new_badge in new_badges:
            badge_name = new_badge['name']
            if new_badge['earned']:
                if badge_name in badge_lookup:
                    # Update existing badge
                    existing_badge = badge_lookup[badge_name]
                    if new_badge['level'] == 'gold' and existing_badge['level'] != 'gold':
                        existing_badge['level'] = 'gold'
                        existing_badge['earned_at'] = datetime.now().isoformat()
                else:
                    # Add new badge
                    new_badge['earned_at'] = datetime.now().isoformat()
                    current_badges.append(new_badge)
        
        user['badges'] = current_badges
    
    def _update_analytics(self, user_id: str, analysis_results: Dict):
        """Update analytics data."""
        try:
            with open(self.analytics_file, 'r') as f:
                analytics = json.load(f)
            
            # Add analysis to user's history
            if user_id not in analytics:
                analytics[user_id] = []
            
            analysis_summary = {
                'timestamp': datetime.now().isoformat(),
                'total_reps': analysis_results['total_reps'],
                'average_score': analysis_results['average_score'],
                'performance_level': analysis_results['performance_level'],
                'badges_earned': [b['name'] for b in analysis_results['badges'] if b['earned']]
            }
            
            analytics[user_id].append(analysis_summary)
            
            # Keep only last 50 analyses per user
            if len(analytics[user_id]) > 50:
                analytics[user_id] = analytics[user_id][-50:]
            
            # Save analytics
            with open(self.analytics_file, 'w') as f:
                json.dump(analytics, f, indent=2)
            
        except Exception as e:
            logger.error(f"Failed to update analytics: {str(e)}")
    
    def get_user_progress(self, user_id: str) -> Dict:
        """Get comprehensive user progress data."""
        try:
            user = self.get_user(user_id)
            if not user:
                return {}
            
            # Load analytics
            with open(self.analytics_file, 'r') as f:
                analytics = json.load(f)
            
            user_analytics = analytics.get(user_id, [])
            
            # Calculate improvement
            improvement = self._calculate_improvement(user_analytics)
            
            # Get recent performance
            recent_performance = self._get_recent_performance(user_analytics)
            
            return {
                'user_id': user_id,
                'username': user['username'],
                'total_videos': user['total_videos'],
                'total_reps': user['total_reps'],
                'average_performance': round(user['average_performance'], 2),
                'improvement': improvement,
                'badges': user['badges'],
                'recent_performance': recent_performance,
                'last_activity': user['last_activity']
            }
            
        except Exception as e:
            logger.error(f"Failed to get user progress: {str(e)}")
            return {}
    
    def _calculate_improvement(self, user_analytics: List[Dict]) -> float:
        """Calculate user improvement over time."""
        if len(user_analytics) < 2:
            return 0.0
        
        # Compare first 5 vs last 5 analyses
        first_analyses = user_analytics[:5]
        last_analyses = user_analytics[-5:]
        
        if not first_analyses or not last_analyses:
            return 0.0
        
        first_avg = sum(a['average_score'] for a in first_analyses) / len(first_analyses)
        last_avg = sum(a['average_score'] for a in last_analyses) / len(last_analyses)
        
        improvement = ((last_avg - first_avg) / first_avg) * 100 if first_avg > 0 else 0
        return round(improvement, 2)
    
    def _get_recent_performance(self, user_analytics: List[Dict]) -> List[Dict]:
        """Get recent performance data."""
        return user_analytics[-10:] if user_analytics else []
    
    def get_leaderboard(self, limit: int = 50) -> List[Dict]:
        """Get leaderboard data."""
        try:
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            # Create leaderboard entries
            leaderboard = []
            for user_id, user_data in users.items():
                if user_data['total_videos'] > 0:  # Only include users with videos
                    entry = {
                        'user_id': user_id,
                        'username': user_data['username'],
                        'average_performance': user_data['average_performance'],
                        'total_reps': user_data['total_reps'],
                        'total_videos': user_data['total_videos'],
                        'badges_count': len([b for b in user_data['badges'] if b.get('earned', False)]),
                        'last_activity': user_data['last_activity']
                    }
                    leaderboard.append(entry)
            
            # Sort by average performance (descending)
            leaderboard.sort(key=lambda x: x['average_performance'], reverse=True)
            
            # Add ranks
            for i, entry in enumerate(leaderboard[:limit]):
                entry['rank'] = i + 1
            
            return leaderboard[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get leaderboard: {str(e)}")
            return []
    
    def get_user_rank(self, user_id: str) -> Dict:
        """Get user's rank and stats."""
        try:
            leaderboard = self.get_leaderboard()
            
            # Find user in leaderboard
            user_rank = None
            for entry in leaderboard:
                if entry['user_id'] == user_id:
                    user_rank = entry
                    break
            
            if not user_rank:
                return {
                    'rank': '-',
                    'score': 0,
                    'total_athletes': len(leaderboard),
                    'improvement': 0
                }
            
            # Get improvement
            user_progress = self.get_user_progress(user_id)
            
            return {
                'rank': user_rank['rank'],
                'score': user_rank['average_performance'],
                'total_athletes': len(leaderboard),
                'improvement': user_progress.get('improvement', 0)
            }
            
        except Exception as e:
            logger.error(f"Failed to get user rank: {str(e)}")
            return {
                'rank': '-',
                'score': 0,
                'total_athletes': 0,
                'improvement': 0
            }


if __name__ == "__main__":
    # Test the user manager
    manager = UserManager()
    
    # Example usage
    print("User Manager initialized successfully!")
    print("Ready to manage user data and progress.")


