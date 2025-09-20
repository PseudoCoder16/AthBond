#!/usr/bin/env python3
"""
EthBond Server Startup Script
============================

This script starts the EthBond API server with proper configuration and logging.

Author: EthBond Team
Date: 2025
"""

import os
import sys
import logging
from pathlib import Path

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api_server import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('ethbond_server.log')
    ]
)

logger = logging.getLogger(__name__)


def create_directories():
    """Create necessary directories."""
    directories = ['uploads', 'results', 'user_data']
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Directory created/verified: {directory}")


def main():
    """Start the EthBond server."""
    logger.info("🚀 Starting EthBond API Server")
    logger.info("=" * 50)
    
    # Create necessary directories
    create_directories()
    
    # Display server information
    logger.info("Server Configuration:")
    logger.info(f"  - Host: 0.0.0.0")
    logger.info(f"  - Port: 5000")
    logger.info(f"  - Debug: True")
    logger.info(f"  - Max file size: 100MB")
    logger.info(f"  - Supported formats: MP4, AVI, MOV, MKV, WebM")
    
    logger.info("\nAPI Endpoints:")
    logger.info("  - POST /api/upload - Upload and analyze video")
    logger.info("  - GET  /api/user/{id}/progress - Get user progress")
    logger.info("  - GET  /api/leaderboard - Get leaderboard")
    logger.info("  - POST /api/user/create - Create new user")
    logger.info("  - GET  /api/health - Health check")
    
    logger.info("\n🎯 Server is ready!")
    logger.info("Connect your frontend to: http://localhost:5000")
    logger.info("Press Ctrl+C to stop the server")
    logger.info("=" * 50)
    
    try:
        # Start the server
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
    except KeyboardInterrupt:
        logger.info("\n🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {str(e)}")
        raise


if __name__ == "__main__":
    main()


