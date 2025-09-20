#!/usr/bin/env python3
"""
OpenCV Utilities for EthBond
============================

This module handles video capture and frame preprocessing for the EthBond project.
It provides utilities for camera initialization, frame processing, and video I/O.

Author: EthBond Team
Date: 2025
"""

import cv2
import numpy as np
import logging
from typing import Tuple, Optional, Union
from pathlib import Path

logger = logging.getLogger(__name__)


class VideoCapture:
    """
    Enhanced video capture class with optimized performance.
    """
    
    def __init__(self, camera_index: int = 0, width: int = 640, height: int = 480, fps: int = 30):
        """
        Initialize video capture with performance optimizations.
        
        Args:
            camera_index (int): Camera index (0 for default webcam)
            width (int): Desired frame width
            height (int): Desired frame height
            fps (int): Target frames per second
        """
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.fps = fps
        self.cap = None
        self.frame_buffer = None
        self.last_frame_time = 0
        self.frame_skip = 1  # Process every nth frame for performance
        
    def initialize_capture(self, source: Union[int, str] = None) -> cv2.VideoCapture:
        """
        Initialize video capture from camera or video file with optimizations.
        
        Args:
            source: Camera index (int) or video file path (str)
            
        Returns:
            cv2.VideoCapture: Initialized video capture object
        """
        source = source if source is not None else self.camera_index
        
        try:
            self.cap = cv2.VideoCapture(source)
            
            if not self.cap.isOpened():
                raise RuntimeError(f"Failed to open video source: {source}")
            
            # Set frame dimensions
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
            
            # Performance optimizations
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce buffer size for lower latency
            self.cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'))  # Use MJPEG codec
            
            # Get actual frame dimensions
            actual_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            actual_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            actual_fps = self.cap.get(cv2.CAP_PROP_FPS)
            
            logger.info(f"Video capture initialized: {source}")
            logger.info(f"Frame dimensions: {actual_width}x{actual_height}")
            logger.info(f"FPS: {actual_fps}")
            
            return self.cap
            
        except Exception as e:
            logger.error(f"Failed to initialize video capture: {str(e)}")
            raise
    
    def read_frame(self) -> Tuple[bool, np.ndarray]:
        """
        Read a frame from the video capture with performance optimizations.
        
        Returns:
            Tuple[bool, np.ndarray]: (success, frame)
        """
        if self.cap is None:
            raise RuntimeError("Video capture not initialized")
        
        # Skip frames for better performance if needed
        for _ in range(self.frame_skip):
            ret, frame = self.cap.read()
            if not ret:
                return False, None
        
        return ret, frame
    
    def wait_key(self, delay: int = 1) -> int:
        """
        Wait for a key press.
        
        Args:
            delay (int): Delay in milliseconds
            
        Returns:
            int: Key code
        """
        return cv2.waitKey(delay)
    
    def release(self):
        """Release video capture resources."""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
            logger.info("Video capture released")
    
    def destroy_windows(self):
        """Destroy all OpenCV windows."""
        cv2.destroyAllWindows()


class FrameProcessor:
    """
    Frame preprocessing utilities for pose detection.
    """
    
    def __init__(self, target_size: Tuple[int, int] = (640, 480)):
        """
        Initialize frame processor.
        
        Args:
            target_size (Tuple[int, int]): Target frame size (width, height)
        """
        self.target_size = target_size
        
    def preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Preprocess frame for pose detection.
        
        Args:
            frame (np.ndarray): Input frame
            
        Returns:
            np.ndarray: Preprocessed frame
        """
        try:
            # Resize frame to target size
            processed_frame = cv2.resize(frame, self.target_size)
            
            # Convert BGR to RGB (MediaPipe expects RGB)
            processed_frame = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
            
            return processed_frame
            
        except Exception as e:
            logger.error(f"Frame preprocessing failed: {str(e)}")
            raise
    
    def enhance_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Enhance frame quality for better pose detection.
        
        Args:
            frame (np.ndarray): Input frame
            
        Returns:
            np.ndarray: Enhanced frame
        """
        try:
            # Apply histogram equalization for better contrast
            if len(frame.shape) == 3:
                # Convert to LAB color space
                lab = cv2.cvtColor(frame, cv2.COLOR_RGB2LAB)
                lab[:, :, 0] = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(lab[:, :, 0])
                enhanced_frame = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            else:
                enhanced_frame = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(frame)
            
            # Apply Gaussian blur to reduce noise
            enhanced_frame = cv2.GaussianBlur(enhanced_frame, (3, 3), 0)
            
            return enhanced_frame
            
        except Exception as e:
            logger.error(f"Frame enhancement failed: {str(e)}")
            return frame
    
    def crop_frame(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Crop frame to specified bounding box.
        
        Args:
            frame (np.ndarray): Input frame
            bbox (Tuple[int, int, int, int]): Bounding box (x, y, width, height)
            
        Returns:
            np.ndarray: Cropped frame
        """
        try:
            x, y, w, h = bbox
            return frame[y:y+h, x:x+w]
            
        except Exception as e:
            logger.error(f"Frame cropping failed: {str(e)}")
            return frame
    
    def flip_frame(self, frame: np.ndarray, horizontal: bool = True) -> np.ndarray:
        """
        Flip frame horizontally or vertically.
        
        Args:
            frame (np.ndarray): Input frame
            horizontal (bool): If True, flip horizontally; if False, flip vertically
            
        Returns:
            np.ndarray: Flipped frame
        """
        try:
            flip_code = 1 if horizontal else 0
            return cv2.flip(frame, flip_code)
            
        except Exception as e:
            logger.error(f"Frame flipping failed: {str(e)}")
            return frame


class VideoWriter:
    """
    Video writing utilities for saving processed videos.
    """
    
    def __init__(self, output_path: str, fps: float = 30.0, 
                 codec: str = 'XVID', fourcc: str = 'XVID'):
        """
        Initialize video writer.
        
        Args:
            output_path (str): Output video file path
            fps (float): Frames per second
            codec (str): Video codec
            fourcc (str): FourCC codec code
        """
        self.output_path = output_path
        self.fps = fps
        self.codec = codec
        self.fourcc = fourcc
        self.writer = None
        
        # Ensure output directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    def initialize_writer(self, frame_size: Tuple[int, int]) -> cv2.VideoWriter:
        """
        Initialize video writer with frame size.
        
        Args:
            frame_size (Tuple[int, int]): Frame size (width, height)
            
        Returns:
            cv2.VideoWriter: Initialized video writer
        """
        try:
            fourcc = cv2.VideoWriter_fourcc(*self.fourcc)
            self.writer = cv2.VideoWriter(
                self.output_path, fourcc, self.fps, frame_size
            )
            
            if not self.writer.isOpened():
                raise RuntimeError(f"Failed to initialize video writer: {self.output_path}")
            
            logger.info(f"Video writer initialized: {self.output_path}")
            return self.writer
            
        except Exception as e:
            logger.error(f"Failed to initialize video writer: {str(e)}")
            raise
    
    def write_frame(self, frame: np.ndarray):
        """
        Write frame to video file.
        
        Args:
            frame (np.ndarray): Frame to write
        """
        if self.writer is None:
            raise RuntimeError("Video writer not initialized")
        
        self.writer.write(frame)
    
    def release(self):
        """Release video writer resources."""
        if self.writer is not None:
            self.writer.release()
            self.writer = None
            logger.info("Video writer released")


class ImageUtils:
    """
    Image processing utilities.
    """
    
    @staticmethod
    def save_frame(frame: np.ndarray, output_path: str, 
                   create_dir: bool = True) -> bool:
        """
        Save frame as image file.
        
        Args:
            frame (np.ndarray): Frame to save
            output_path (str): Output file path
            create_dir (bool): Create directory if it doesn't exist
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if create_dir:
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Convert RGB to BGR for OpenCV
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            else:
                frame_bgr = frame
            
            success = cv2.imwrite(output_path, frame_bgr)
            
            if success:
                logger.info(f"Frame saved: {output_path}")
            else:
                logger.error(f"Failed to save frame: {output_path}")
            
            return success
            
        except Exception as e:
            logger.error(f"Frame saving failed: {str(e)}")
            return False
    
    @staticmethod
    def load_image(image_path: str) -> Optional[np.ndarray]:
        """
        Load image from file.
        
        Args:
            image_path (str): Path to image file
            
        Returns:
            Optional[np.ndarray]: Loaded image or None if failed
        """
        try:
            image = cv2.imread(image_path)
            if image is not None:
                # Convert BGR to RGB
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                logger.info(f"Image loaded: {image_path}")
            else:
                logger.error(f"Failed to load image: {image_path}")
            
            return image
            
        except Exception as e:
            logger.error(f"Image loading failed: {str(e)}")
            return None
    
    @staticmethod
    def resize_image(image: np.ndarray, target_size: Tuple[int, int], 
                    maintain_aspect: bool = True) -> np.ndarray:
        """
        Resize image to target size.
        
        Args:
            image (np.ndarray): Input image
            target_size (Tuple[int, int]): Target size (width, height)
            maintain_aspect (bool): Maintain aspect ratio
            
        Returns:
            np.ndarray: Resized image
        """
        try:
            if maintain_aspect:
                h, w = image.shape[:2]
                target_w, target_h = target_size
                
                # Calculate scaling factor
                scale = min(target_w / w, target_h / h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                
                # Resize image
                resized = cv2.resize(image, (new_w, new_h))
                
                # Create canvas with target size
                canvas = np.zeros((target_h, target_w, 3), dtype=np.uint8)
                
                # Center the resized image
                y_offset = (target_h - new_h) // 2
                x_offset = (target_w - new_w) // 2
                canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
                
                return canvas
            else:
                return cv2.resize(image, target_size)
                
        except Exception as e:
            logger.error(f"Image resizing failed: {str(e)}")
            return image


def test_opencv_utils():
    """
    Test function for OpenCV utilities.
    """
    logger.info("Testing OpenCV utilities...")
    
    try:
        # Test video capture
        video_capture = VideoCapture()
        cap = video_capture.initialize_capture(0)
        
        # Test frame processing
        frame_processor = FrameProcessor()
        
        # Capture a few frames
        for i in range(5):
            ret, frame = cap.read()
            if ret:
                processed_frame = frame_processor.preprocess_frame(frame)
                logger.info(f"Frame {i+1} processed successfully")
            else:
                logger.warning(f"Failed to capture frame {i+1}")
        
        # Cleanup
        video_capture.release()
        video_capture.destroy_windows()
        
        logger.info("OpenCV utilities test completed successfully")
        
    except Exception as e:
        logger.error(f"OpenCV utilities test failed: {str(e)}")


if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(level=logging.INFO)
    test_opencv_utils()
