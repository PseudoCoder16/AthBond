#!/usr/bin/env python3
"""
REST API Server for EthBond
===========================

This module provides REST API endpoints for the EthBond frontend application.
It handles video uploads, analysis, user management, and leaderboard data.

Author: EthBond Team
Date: 2025
"""

import os
import logging
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
from pathlib import Path
from typing import Dict, List
from datetime import datetime

from video_analyzer import VideoAnalyzer
from user_manager import UserManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'avi', 'mov', 'mkv', 'webm'}

# Initialize components
video_analyzer = VideoAnalyzer()
user_manager = UserManager()


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'EthBond API is running'
    })


@app.route('/api/upload', methods=['POST'])
def upload_video():
    """
    Upload and analyze video endpoint.
    
    Expected form data:
    - file: Video file
    - user_id: User identifier (optional)
    - username: Username (optional)
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Get user info
        user_id = request.form.get('user_id')
        username = request.form.get('username', 'Anonymous')
        
        # Create user if not exists
        if not user_id:
            user_id = user_manager.create_user(username)
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Create upload directory if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        file.save(filepath)
        logger.info(f"Video uploaded: {filepath}")
        
        # Analyze video
        analysis_results = video_analyzer.analyze_video(filepath, user_id)
        
        # Update user progress
        user_manager.update_user_progress(user_id, analysis_results)
        
        # Return results
        return jsonify({
            'success': True,
            'analysis_id': analysis_results['analysis_id'],
            'user_id': user_id,
            'results': analysis_results
        })
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/<user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    """Get user progress data."""
    try:
        progress = user_manager.get_user_progress(user_id)
        if not progress:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'progress': progress
        })
        
    except Exception as e:
        logger.error(f"Failed to get user progress: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/<user_id>/analyses', methods=['GET'])
def get_user_analyses(user_id):
    """Get user's video analyses."""
    try:
        analyses = video_analyzer.list_user_analyses(user_id)
        return jsonify({
            'success': True,
            'analyses': analyses
        })
        
    except Exception as e:
        logger.error(f"Failed to get user analyses: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """Get specific analysis results."""
    try:
        results = video_analyzer.get_analysis_results(analysis_id)
        if not results:
            return jsonify({'error': 'Analysis not found'}), 404
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Failed to get analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard data."""
    try:
        limit = request.args.get('limit', 50, type=int)
        leaderboard = user_manager.get_leaderboard(limit)
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard
        })
        
    except Exception as e:
        logger.error(f"Failed to get leaderboard: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/<user_id>/rank', methods=['GET'])
def get_user_rank(user_id):
    """Get user's rank and stats."""
    try:
        rank_data = user_manager.get_user_rank(user_id)
        return jsonify({
            'success': True,
            'rank': rank_data
        })
        
    except Exception as e:
        logger.error(f"Failed to get user rank: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/create', methods=['POST'])
def create_user():
    """Create a new user."""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        
        user_id = user_manager.create_user(username, email)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'username': username
        })
        
    except Exception as e:
        logger.error(f"Failed to create user: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user information."""
    try:
        user = user_manager.get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user
        })
        
    except Exception as e:
        logger.error(f"Failed to get user: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_global_stats():
    """Get global statistics."""
    try:
        leaderboard = user_manager.get_leaderboard()
        
        total_users = len(leaderboard)
        total_videos = sum(user['total_videos'] for user in leaderboard)
        total_reps = sum(user['total_reps'] for user in leaderboard)
        avg_performance = sum(user['average_performance'] for user in leaderboard) / total_users if total_users > 0 else 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_videos': total_videos,
                'total_reps': total_reps,
                'average_performance': round(avg_performance, 2)
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to get global stats: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({'error': 'File too large. Maximum size is 100MB.'}), 413


@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('results', exist_ok=True)
    os.makedirs('user_data', exist_ok=True)
    
    # Start the server
    logger.info("Starting EthBond API server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
