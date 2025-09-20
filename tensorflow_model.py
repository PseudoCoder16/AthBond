#!/usr/bin/env python3
"""
TensorFlow Model Utilities for EthBond
======================================

This module handles building, training, and scoring with TensorFlow models.
It provides utilities for model architecture, training, and inference.

Author: EthBond Team
Date: 2025
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, optimizers, callbacks
import numpy as np
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
import json
from pathlib import Path
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)


class ModelBuilder:
    """
    TensorFlow model builder with various architectures for pose scoring.
    """
    
    def __init__(self):
        """Initialize model builder."""
        self.model = None
        logger.info("Model builder initialized")
    
    def build_model(self, 
                   input_shape: Tuple[int, ...] = (33, 4),
                   num_classes: int = 10,
                   architecture: str = 'dense',
                   dropout_rate: float = 0.3,
                   learning_rate: float = 0.001) -> keras.Model:
        """
        Build a TensorFlow model for pose scoring.
        
        Args:
            input_shape: Input shape (e.g., (33, 4) for MediaPipe landmarks)
            num_classes: Number of output classes
            architecture: Model architecture ('dense', 'cnn', 'lstm', 'transformer')
            dropout_rate: Dropout rate for regularization
            learning_rate: Learning rate for optimizer
            
        Returns:
            keras.Model: Built model
        """
        logger.info(f"Building {architecture} model with input shape {input_shape}")
        
        try:
            if architecture == 'dense':
                model = self._build_dense_model(input_shape, num_classes, dropout_rate)
            elif architecture == 'cnn':
                model = self._build_cnn_model(input_shape, num_classes, dropout_rate)
            elif architecture == 'lstm':
                model = self._build_lstm_model(input_shape, num_classes, dropout_rate)
            elif architecture == 'transformer':
                model = self._build_transformer_model(input_shape, num_classes, dropout_rate)
            else:
                raise ValueError(f"Unknown architecture: {architecture}")
            
            # Compile model
            model.compile(
                optimizer=optimizers.Adam(learning_rate=learning_rate),
                loss='sparse_categorical_crossentropy',
                metrics=['accuracy', 'sparse_top_k_categorical_accuracy']
            )
            
            self.model = model
            logger.info(f"Model built successfully. Total parameters: {model.count_params()}")
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to build model: {str(e)}")
            raise
    
    def _build_dense_model(self, input_shape: Tuple[int, ...], num_classes: int, 
                          dropout_rate: float) -> keras.Model:
        """Build dense neural network model."""
        model = models.Sequential([
            layers.Input(shape=input_shape),
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            layers.Dense(64, activation='relu'),
            layers.Dropout(dropout_rate),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        return model
    
    def _build_cnn_model(self, input_shape: Tuple[int, ...], num_classes: int, 
                        dropout_rate: float) -> keras.Model:
        """Build CNN model (reshapes input for convolution)."""
        # Reshape input for CNN (add channel dimension)
        reshaped_input = (input_shape[0], input_shape[1], 1)
        
        model = models.Sequential([
            layers.Input(shape=reshaped_input),
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(dropout_rate),
            
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(dropout_rate),
            
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.GlobalAveragePooling2D(),
            layers.Dropout(dropout_rate),
            
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        return model
    
    def _build_lstm_model(self, input_shape: Tuple[int, ...], num_classes: int, 
                         dropout_rate: float) -> keras.Model:
        """Build LSTM model for sequential pose data."""
        model = models.Sequential([
            layers.Input(shape=input_shape),
            layers.LSTM(128, return_sequences=True),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            
            layers.LSTM(64, return_sequences=False),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(dropout_rate),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        return model
    
    def _build_transformer_model(self, input_shape: Tuple[int, ...], num_classes: int, 
                                dropout_rate: float) -> keras.Model:
        """Build transformer model for pose data."""
        # Multi-head attention layer
        class MultiHeadSelfAttention(layers.Layer):
            def __init__(self, embed_dim, num_heads, **kwargs):
                super().__init__(**kwargs)
                self.embed_dim = embed_dim
                self.num_heads = num_heads
                self.attention = layers.MultiHeadAttention(
                    num_heads=num_heads, key_dim=embed_dim
                )
                self.norm = layers.LayerNormalization()
                
            def call(self, inputs):
                attention_output = self.attention(inputs, inputs)
                return self.norm(inputs + attention_output)
        
        # Build transformer model
        inputs = layers.Input(shape=input_shape)
        
        # Add positional encoding
        x = layers.Dense(128)(inputs)
        x = layers.LayerNormalization()(x)
        
        # Multi-head attention
        x = MultiHeadSelfAttention(embed_dim=128, num_heads=8)(x)
        x = layers.Dropout(dropout_rate)(x)
        
        # Feed forward
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(dropout_rate)(x)
        x = layers.Dense(128)(x)
        x = layers.LayerNormalization()(x)
        
        # Global average pooling
        x = layers.GlobalAveragePooling1D()(x)
        
        # Output layer
        outputs = layers.Dense(num_classes, activation='softmax')(x)
        
        model = models.Model(inputs, outputs)
        return model
    
    def load_model(self, model_path: str) -> keras.Model:
        """
        Load a saved model.
        
        Args:
            model_path: Path to saved model
            
        Returns:
            keras.Model: Loaded model
        """
        try:
            model = keras.models.load_model(model_path)
            self.model = model
            logger.info(f"Model loaded from: {model_path}")
            return model
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise


class ModelTrainer:
    """
    Model training utilities with advanced features.
    """
    
    def __init__(self):
        """Initialize model trainer."""
        self.training_history = None
        logger.info("Model trainer initialized")
    
    def train_model(self,
                   model: keras.Model,
                   X_train: np.ndarray,
                   y_train: np.ndarray,
                   X_val: Optional[np.ndarray] = None,
                   y_val: Optional[np.ndarray] = None,
                   epochs: int = 100,
                   batch_size: int = 32,
                   validation_split: float = 0.2,
                   callbacks: Optional[List[keras.callbacks.Callback]] = None,
                   verbose: int = 1) -> keras.Model:
        """
        Train a TensorFlow model.
        
        Args:
            model: Model to train
            X_train: Training features
            y_train: Training labels
            X_val: Validation features (optional)
            y_val: Validation labels (optional)
            epochs: Number of training epochs
            batch_size: Batch size
            validation_split: Validation split ratio
            callbacks: List of Keras callbacks
            verbose: Verbosity level
            
        Returns:
            keras.Model: Trained model
        """
        logger.info(f"Starting model training for {epochs} epochs")
        
        try:
            # Prepare validation data
            validation_data = None
            if X_val is not None and y_val is not None:
                validation_data = (X_val, y_val)
                validation_split = None
            elif validation_split > 0:
                validation_data = None
            else:
                validation_split = None
            
            # Default callbacks
            if callbacks is None:
                callbacks = self._get_default_callbacks()
            
            # Train model
            history = model.fit(
                X_train, y_train,
                validation_data=validation_data,
                validation_split=validation_split,
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=verbose
            )
            
            self.training_history = history.history
            logger.info("Model training completed successfully")
            
            return model
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise
    
    def _get_default_callbacks(self) -> List[keras.callbacks.Callback]:
        """Get default training callbacks."""
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            callbacks.ModelCheckpoint(
                'models/best_model.h5',
                monitor='val_loss',
                save_best_only=True,
                verbose=1
            )
        ]
        
        return callbacks_list
    
    def plot_training_history(self, save_path: Optional[str] = None) -> plt.Figure:
        """
        Plot training history.
        
        Args:
            save_path: Path to save the plot
            
        Returns:
            plt.Figure: Matplotlib figure
        """
        if self.training_history is None:
            logger.warning("No training history available")
            return None
        
        try:
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            
            # Plot accuracy
            axes[0, 0].plot(self.training_history['accuracy'], label='Training')
            if 'val_accuracy' in self.training_history:
                axes[0, 0].plot(self.training_history['val_accuracy'], label='Validation')
            axes[0, 0].set_title('Model Accuracy')
            axes[0, 0].set_xlabel('Epoch')
            axes[0, 0].set_ylabel('Accuracy')
            axes[0, 0].legend()
            axes[0, 0].grid(True)
            
            # Plot loss
            axes[0, 1].plot(self.training_history['loss'], label='Training')
            if 'val_loss' in self.training_history:
                axes[0, 1].plot(self.training_history['val_loss'], label='Validation')
            axes[0, 1].set_title('Model Loss')
            axes[0, 1].set_xlabel('Epoch')
            axes[0, 1].set_ylabel('Loss')
            axes[0, 1].legend()
            axes[0, 1].grid(True)
            
            # Plot learning rate if available
            if 'lr' in self.training_history:
                axes[1, 0].plot(self.training_history['lr'])
                axes[1, 0].set_title('Learning Rate')
                axes[1, 0].set_xlabel('Epoch')
                axes[1, 0].set_ylabel('Learning Rate')
                axes[1, 0].grid(True)
            else:
                axes[1, 0].text(0.5, 0.5, 'Learning Rate\nNot Available', 
                               ha='center', va='center', transform=axes[1, 0].transAxes)
                axes[1, 0].set_title('Learning Rate')
            
            # Plot top-k accuracy if available
            if 'sparse_top_k_categorical_accuracy' in self.training_history:
                axes[1, 1].plot(self.training_history['sparse_top_k_categorical_accuracy'], 
                               label='Training')
                if 'val_sparse_top_k_categorical_accuracy' in self.training_history:
                    axes[1, 1].plot(self.training_history['val_sparse_top_k_categorical_accuracy'], 
                                   label='Validation')
                axes[1, 1].set_title('Top-K Categorical Accuracy')
                axes[1, 1].set_xlabel('Epoch')
                axes[1, 1].set_ylabel('Top-K Accuracy')
                axes[1, 1].legend()
                axes[1, 1].grid(True)
            else:
                axes[1, 1].text(0.5, 0.5, 'Top-K Accuracy\nNot Available', 
                               ha='center', va='center', transform=axes[1, 1].transAxes)
                axes[1, 1].set_title('Top-K Categorical Accuracy')
            
            plt.tight_layout()
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                logger.info(f"Training history plot saved to: {save_path}")
            
            return fig
            
        except Exception as e:
            logger.error(f"Failed to plot training history: {str(e)}")
            return None


class ModelScorer:
    """
    Model scoring and inference utilities with rep counting.
    """
    
    def __init__(self):
        """Initialize model scorer."""
        self.rep_count = 0
        self.last_angle = None
        self.rep_state = "rest"  # "rest", "going_down", "going_up"
        self.min_angle_threshold = 45  # Consider 0-45° as "fully bent"
        self.max_angle_threshold = 135  # Consider 135-180° as "fully extended"
        self.angle_history = []  # Store recent angles for smoothing
        self.history_size = 5  # Number of recent angles to average
        logger.info("Model scorer initialized with rep counting")
    
    def score_pose(self, model: keras.Model, keypoints: np.ndarray) -> dict:
        """
        Score a pose based on arm angles and count reps.
        
        Args:
            model: Trained model (not used in angle-based scoring)
            keypoints: Pose keypoints array
            
        Returns:
            dict: Contains score, angle, rep_count, and rep_state
        """
        try:
            # Ensure keypoints is in the correct format
            if len(keypoints.shape) == 1:
                keypoints = keypoints.reshape(33, 4)
            elif len(keypoints.shape) == 2:
                if keypoints.shape[0] == 1 and keypoints.shape[1] == 132:
                    keypoints = keypoints.reshape(33, 4)
                elif keypoints.shape[0] == 33 and keypoints.shape[1] == 4:
                    pass  # Already correct shape
                else:
                    keypoints = keypoints.reshape(33, 4)
            elif len(keypoints.shape) == 3:
                keypoints = keypoints.reshape(33, 4)
            
            # Calculate arm angles
            left_elbow_angle = self._calculate_elbow_angle(keypoints, 'left')
            right_elbow_angle = self._calculate_elbow_angle(keypoints, 'right')
            
            # Calculate average angle
            raw_avg_angle = (left_elbow_angle + right_elbow_angle) / 2
            
            # Smooth the angle using moving average
            self.angle_history.append(raw_avg_angle)
            if len(self.angle_history) > self.history_size:
                self.angle_history.pop(0)
            
            avg_angle = sum(self.angle_history) / len(self.angle_history)
            
            # Count reps
            self._update_rep_count(avg_angle)
            
            # Score based on angle
            if avg_angle < 90:
                # Good posture: angle < 90 degrees
                # Score range: 80-100 (better angles get higher scores)
                score = 100 - (avg_angle / 90) * 20  # 90° = 80, 0° = 100
                score = max(80, min(100, score))  # Clamp between 80-100
            else:
                # Needs improvement: angle >= 90 degrees
                # Score range: 0-20 (worse angles get lower scores)
                score = 20 - ((avg_angle - 90) / 90) * 20  # 90° = 20, 180° = 0
                score = max(0, min(20, score))  # Clamp between 0-20
            
            # Update last angle
            self.last_angle = avg_angle
            
            return {
                'score': score,
                'angle': avg_angle,
                'rep_count': self.rep_count,
                'rep_state': self.rep_state,
                'left_angle': left_elbow_angle,
                'right_angle': right_elbow_angle
            }
            
        except Exception as e:
            logger.error(f"Pose scoring failed: {str(e)}")
            return {
                'score': 0.0,
                'angle': 0.0,
                'rep_count': self.rep_count,
                'rep_state': 'error',
                'left_angle': 0.0,
                'right_angle': 0.0
            }
    
    def _update_rep_count(self, current_angle):
        """Update rep count based on angle transitions."""
        if self.last_angle is None:
            self.last_angle = current_angle
            return
        
        # Determine current position
        if current_angle <= self.min_angle_threshold:
            current_position = "fully_bent"
        elif current_angle >= self.max_angle_threshold:
            current_position = "fully_extended"
        else:
            current_position = "middle"
        
        # State machine for rep counting
        if self.rep_state == "rest":
            if current_position == "fully_extended":
                self.rep_state = "going_down"
                logger.info("Rep started: Going down from extended position")
        elif self.rep_state == "going_down":
            if current_position == "fully_bent":
                self.rep_state = "going_up"
                logger.info("Rep halfway: Going up from bent position")
        elif self.rep_state == "going_up":
            if current_position == "fully_extended":
                # Complete rep detected!
                self.rep_count += 1
                self.rep_state = "rest"  # Reset to rest for next rep
                logger.info(f"🎉 Rep completed! Total reps: {self.rep_count}")
        
        # Debug logging
        if current_position != "middle":
            logger.debug(f"Angle: {current_angle:.1f}°, Position: {current_position}, State: {self.rep_state}")
    
    def reset_rep_count(self):
        """Reset the rep counter."""
        self.rep_count = 0
        self.rep_state = "rest"
        self.last_angle = None
        self.angle_history = []
        logger.info("Rep counter reset")
    
    def _calculate_elbow_angle(self, keypoints: np.ndarray, arm: str) -> float:
        """
        Calculate elbow angle for the specified arm.
        
        Args:
            keypoints: Pose keypoints array (33, 4)
            arm: 'left' or 'right'
            
        Returns:
            float: Elbow angle in degrees
        """
        try:
            # MediaPipe pose landmark indices
            if arm == 'left':
                shoulder_idx = 11  # Left shoulder
                elbow_idx = 13     # Left elbow
                wrist_idx = 15     # Left wrist
            else:  # right
                shoulder_idx = 12  # Right shoulder
                elbow_idx = 14     # Right elbow
                wrist_idx = 16     # Right wrist
            
            # Get landmark coordinates (x, y, z, visibility)
            shoulder = keypoints[shoulder_idx][:2]  # x, y
            elbow = keypoints[elbow_idx][:2]        # x, y
            wrist = keypoints[wrist_idx][:2]        # x, y
            
            # Check visibility
            shoulder_vis = keypoints[shoulder_idx][3]
            elbow_vis = keypoints[elbow_idx][3]
            wrist_vis = keypoints[wrist_idx][3]
            
            if shoulder_vis < 0.5 or elbow_vis < 0.5 or wrist_vis < 0.5:
                return 180.0  # Return max angle if landmarks not visible
            
            # Calculate vectors
            v1 = shoulder - elbow  # Vector from elbow to shoulder
            v2 = wrist - elbow     # Vector from elbow to wrist
            
            # Calculate angle using dot product
            dot_product = np.dot(v1, v2)
            norm_v1 = np.linalg.norm(v1)
            norm_v2 = np.linalg.norm(v2)
            
            if norm_v1 == 0 or norm_v2 == 0:
                return 180.0  # Return max angle if vectors are zero
            
            cos_angle = dot_product / (norm_v1 * norm_v2)
            cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Avoid numerical errors
            
            angle = np.arccos(cos_angle)
            angle_degrees = np.degrees(angle)
            
            # For elbow angle, we want the internal angle (bend angle)
            # If the angle is > 90, it means the arm is extended
            # If the angle is < 90, it means the arm is bent
            return angle_degrees
            
        except Exception as e:
            logger.error(f"Elbow angle calculation failed for {arm} arm: {str(e)}")
            return 180.0
    
    def batch_score_poses(self, model: keras.Model, keypoints_batch: np.ndarray) -> np.ndarray:
        """
        Score multiple poses in batch using angle-based scoring.
        
        Args:
            model: Trained model (not used in angle-based scoring)
            keypoints_batch: Batch of pose keypoints
            
        Returns:
            np.ndarray: Array of scores (0-100)
        """
        try:
            # Ensure correct shape for batch processing
            if len(keypoints_batch.shape) == 2:
                if keypoints_batch.shape[1] == 132:
                    # Reshape from (batch, 132) to (batch, 33, 4)
                    keypoints_batch = keypoints_batch.reshape(-1, 33, 4)
                elif keypoints_batch.shape[1] == 4:
                    # Reshape from (batch, 4) to (batch, 33, 4) - repeat for all landmarks
                    keypoints_batch = np.tile(keypoints_batch.reshape(-1, 1, 4), (1, 33, 1))
            
            scores = []
            for i in range(len(keypoints_batch)):
                score = self.score_pose(model, keypoints_batch[i])
                scores.append(score)
            
            return np.array(scores)
            
        except Exception as e:
            logger.error(f"Batch pose scoring failed: {str(e)}")
            return np.zeros(len(keypoints_batch))
    
    def get_prediction_confidence(self, model: keras.Model, keypoints: np.ndarray) -> Dict[str, float]:
        """
        Get detailed prediction confidence information.
        
        Args:
            model: Trained model
            keypoints: Pose keypoints array
            
        Returns:
            Dict[str, float]: Confidence information
        """
        try:
            if len(keypoints.shape) == 1:
                keypoints = keypoints.reshape(1, -1)
            
            predictions = model.predict(keypoints, verbose=0)
            
            confidence_info = {}
            
            if len(predictions.shape) == 2 and predictions.shape[1] > 1:
                # Multi-class classification
                probs = predictions[0]
                confidence_info['max_probability'] = float(np.max(probs)) * 100  # Convert to 0-100
                confidence_info['predicted_class'] = int(np.argmax(probs))
                confidence_info['class_probabilities'] = [p * 100 for p in probs.tolist()]  # Convert to 0-100
                
                # Calculate entropy as uncertainty measure
                entropy = -np.sum(probs * np.log(probs + 1e-8))
                confidence_info['entropy'] = float(entropy)
                confidence_info['confidence'] = (1.0 - entropy / np.log(len(probs))) * 100  # Convert to 0-100
            else:
                # Binary classification or regression
                score = float(predictions[0])
                confidence_info['score'] = score * 100  # Convert to 0-100
                confidence_info['confidence'] = abs(score - 0.5) * 200  # Convert to 0-100 range
            
            return confidence_info
            
        except Exception as e:
            logger.error(f"Failed to get prediction confidence: {str(e)}")
            return {'confidence': 0.0}
    
    def explain_prediction(self, model: keras.Model, keypoints: np.ndarray) -> Dict[str, Any]:
        """
        Provide explanation for model prediction (basic implementation).
        
        Args:
            model: Trained model
            keypoints: Pose keypoints array
            
        Returns:
            Dict[str, Any]: Prediction explanation
        """
        try:
            confidence_info = self.get_prediction_confidence(model, keypoints)
            
            explanation = {
                'prediction': confidence_info,
                'keypoint_analysis': self._analyze_keypoints(keypoints),
                'model_info': {
                    'input_shape': model.input_shape,
                    'output_shape': model.output_shape,
                    'total_parameters': model.count_params()
                }
            }
            
            return explanation
            
        except Exception as e:
            logger.error(f"Failed to explain prediction: {str(e)}")
            return {'error': str(e)}
    
    def _analyze_keypoints(self, keypoints: np.ndarray) -> Dict[str, Any]:
        """Analyze keypoints for prediction explanation."""
        try:
            # Reshape keypoints if needed
            if len(keypoints.shape) == 1:
                keypoints = keypoints.reshape(-1, 4)  # Assuming (x, y, z, visibility) format
            
            analysis = {
                'total_landmarks': len(keypoints),
                'visible_landmarks': int(np.sum(keypoints[:, 3] > 0.5)),
                'average_visibility': float(np.mean(keypoints[:, 3])),
                'keypoint_ranges': {
                    'x_range': [float(np.min(keypoints[:, 0])), float(np.max(keypoints[:, 0]))],
                    'y_range': [float(np.min(keypoints[:, 1])), float(np.max(keypoints[:, 1]))],
                    'z_range': [float(np.min(keypoints[:, 2])), float(np.max(keypoints[:, 2]))]
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Keypoint analysis failed: {str(e)}")
            return {'error': str(e)}


def test_tensorflow_model():
    """
    Test function for TensorFlow model utilities.
    """
    logger.info("Testing TensorFlow model utilities...")
    
    try:
        # Test model builder
        builder = ModelBuilder()
        model = builder.build_model(
            input_shape=(33, 4),
            num_classes=5,
            architecture='dense'
        )
        
        # Test model trainer
        trainer = ModelTrainer()
        
        # Create dummy data
        X_train = np.random.randn(100, 33, 4).astype(np.float32)
        y_train = np.random.randint(0, 5, 100)
        
        # Train model (short training for testing)
        trained_model = trainer.train_model(
            model, X_train, y_train,
            epochs=2,
            batch_size=16,
            verbose=0
        )
        
        # Test model scorer
        scorer = ModelScorer()
        test_keypoints = np.random.randn(33, 4).astype(np.float32)
        score = scorer.score_pose(trained_model, test_keypoints)
        
        logger.info(f"Model test completed. Score: {score:.4f}")
        logger.info("TensorFlow model utilities test completed successfully")
        
    except Exception as e:
        logger.error(f"TensorFlow model utilities test failed: {str(e)}")


if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(level=logging.INFO)
    test_tensorflow_model()
