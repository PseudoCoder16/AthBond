#!/usr/bin/env python3
"""
Frontend Integration Helper for EthBond
=======================================

This module provides helper functions and examples for integrating the EthBond
backend with the frontend UI components.

Author: EthBond Team
Date: 2025
"""

import requests
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class EthBondClient:
    """
    Client for interacting with EthBond API.
    """
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize EthBond client.
        
        Args:
            base_url: Base URL of the EthBond API
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def upload_video(self, video_path: str, username: str = "Anonymous", user_id: str = None) -> Dict:
        """
        Upload and analyze a video.
        
        Args:
            video_path: Path to video file
            username: Username
            user_id: Existing user ID (optional)
            
        Returns:
            Dict: Analysis results
        """
        try:
            url = f"{self.base_url}/api/upload"
            
            with open(video_path, 'rb') as f:
                files = {'file': f}
                data = {
                    'username': username,
                    'user_id': user_id
                }
                
                response = self.session.post(url, files=files, data=data)
                response.raise_for_status()
                
                return response.json()
                
        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            raise
    
    def get_user_progress(self, user_id: str) -> Dict:
        """Get user progress data."""
        try:
            url = f"{self.base_url}/api/user/{user_id}/progress"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get user progress: {str(e)}")
            raise
    
    def get_leaderboard(self, limit: int = 50) -> Dict:
        """Get leaderboard data."""
        try:
            url = f"{self.base_url}/api/leaderboard"
            params = {'limit': limit}
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get leaderboard: {str(e)}")
            raise
    
    def get_user_rank(self, user_id: str) -> Dict:
        """Get user's rank and stats."""
        try:
            url = f"{self.base_url}/api/user/{user_id}/rank"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get user rank: {str(e)}")
            raise
    
    def create_user(self, username: str, email: str = None) -> Dict:
        """Create a new user."""
        try:
            url = f"{self.base_url}/api/user/create"
            data = {
                'username': username,
                'email': email
            }
            response = self.session.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            raise


def format_progress_data(progress_data: Dict) -> Dict:
    """
    Format progress data for frontend display.
    
    Args:
        progress_data: Raw progress data from API
        
    Returns:
        Dict: Formatted data for UI
    """
    if not progress_data:
        return {
            'videos_analyzed': 0,
            'average_performance': 0,
            'improvement': 0,
            'badges': []
        }
    
    return {
        'videos_analyzed': progress_data.get('total_videos', 0),
        'average_performance': progress_data.get('average_performance', 0),
        'improvement': progress_data.get('improvement', 0),
        'badges': progress_data.get('badges', [])
    }


def format_leaderboard_data(leaderboard_data: Dict) -> Dict:
    """
    Format leaderboard data for frontend display.
    
    Args:
        leaderboard_data: Raw leaderboard data from API
        
    Returns:
        Dict: Formatted data for UI
    """
    if not leaderboard_data or 'leaderboard' not in leaderboard_data:
        return {
            'top_performers': [],
            'your_stats': {
                'rank': '-',
                'score': 0,
                'total_athletes': 0,
                'improvement': 0
            }
        }
    
    leaderboard = leaderboard_data['leaderboard']
    
    # Format top performers
    top_performers = []
    for i, user in enumerate(leaderboard[:10]):  # Top 10
        performer = {
            'rank': user['rank'],
            'username': user['username'],
            'score': user['average_performance'],
            'badges': user['badges_count'],
            'total_reps': user['total_reps']
        }
        top_performers.append(performer)
    
    return {
        'top_performers': top_performers,
        'total_athletes': len(leaderboard)
    }


def format_badges_for_ui(badges: List[Dict]) -> List[Dict]:
    """
    Format badges for UI display.
    
    Args:
        badges: List of badge data
        
    Returns:
        List[Dict]: Formatted badge data
    """
    formatted_badges = []
    
    for badge in badges:
        formatted_badge = {
            'name': badge['name'],
            'icon': badge['icon'],
            'description': badge['description'],
            'earned': badge.get('earned', False),
            'level': badge.get('level', 'locked'),
            'color': get_badge_color(badge.get('level', 'locked'))
        }
        formatted_badges.append(formatted_badge)
    
    return formatted_badges


def get_badge_color(level: str) -> str:
    """Get badge color based on level."""
    color_map = {
        'gold': '#FFD700',
        'silver': '#C0C0C0',
        'bronze': '#CD7F32',
        'locked': '#808080'
    }
    return color_map.get(level, '#808080')


def generate_frontend_examples():
    """Generate example code for frontend integration."""
    
    # JavaScript/TypeScript examples
    js_examples = """
// Frontend Integration Examples for EthBond

// 1. Upload Video
async function uploadVideo(videoFile, username = 'Anonymous') {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('username', username);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Video uploaded and analyzed:', result.results);
            return result;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

// 2. Get User Progress
async function getUserProgress(userId) {
    try {
        const response = await fetch(`/api/user/${userId}/progress`);
        const result = await response.json();
        
        if (result.success) {
            return formatProgressData(result.progress);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to get progress:', error);
        throw error;
    }
}

// 3. Get Leaderboard
async function getLeaderboard(limit = 50) {
    try {
        const response = await fetch(`/api/leaderboard?limit=${limit}`);
        const result = await response.json();
        
        if (result.success) {
            return formatLeaderboardData(result);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to get leaderboard:', error);
        throw error;
    }
}

// 4. Format Progress Data for UI
function formatProgressData(progressData) {
    if (!progressData) {
        return {
            videosAnalyzed: 0,
            averagePerformance: 0,
            improvement: 0,
            badges: []
        };
    }
    
    return {
        videosAnalyzed: progressData.total_videos || 0,
        averagePerformance: progressData.average_performance || 0,
        improvement: progressData.improvement || 0,
        badges: formatBadgesForUI(progressData.badges || [])
    };
}

// 5. Format Badges for UI
function formatBadgesForUI(badges) {
    return badges.map(badge => ({
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        earned: badge.earned || false,
        level: badge.level || 'locked',
        color: getBadgeColor(badge.level || 'locked')
    }));
}

// 6. Get Badge Color
function getBadgeColor(level) {
    const colorMap = {
        'gold': '#FFD700',
        'silver': '#C0C0C0',
        'bronze': '#CD7F32',
        'locked': '#808080'
    };
    return colorMap[level] || '#808080';
}

// 7. React Component Example
function ProgressDashboard({ userId }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchProgress() {
            try {
                const progressData = await getUserProgress(userId);
                setProgress(progressData);
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchProgress();
    }, [userId]);
    
    if (loading) return <div>Loading...</div>;
    if (!progress) return <div>No progress data available</div>;
    
    return (
        <div className="progress-dashboard">
            <div className="stats">
                <div className="stat">
                    <h3>{progress.videosAnalyzed}</h3>
                    <p>Videos Analyzed</p>
                </div>
                <div className="stat">
                    <h3>{progress.averagePerformance}%</h3>
                    <p>Average Performance</p>
                </div>
                <div className="stat">
                    <h3>+{progress.improvement}%</h3>
                    <p>Improvement</p>
                </div>
            </div>
            
            <div className="badges">
                {progress.badges.map(badge => (
                    <div 
                        key={badge.name} 
                        className={`badge ${badge.earned ? 'earned' : 'locked'}`}
                        style={{ borderColor: badge.color }}
                    >
                        <span className="badge-icon">{badge.icon}</span>
                        <span className="badge-name">{badge.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
"""
    
    # Save examples to file
    with open('frontend_examples.js', 'w') as f:
        f.write(js_examples)
    
    logger.info("Frontend integration examples generated: frontend_examples.js")


if __name__ == "__main__":
    # Generate examples
    generate_frontend_examples()
    
    # Test client
    client = EthBondClient()
    print("EthBond Client initialized successfully!")
    print("Frontend integration examples generated.")
