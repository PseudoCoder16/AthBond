#!/usr/bin/env python3
"""
ML Evaluation Utilities for EthBond
===================================

This module provides comprehensive evaluation metrics for machine learning models.
It includes accuracy, precision, recall, confusion matrix, and other advanced metrics.

Author: EthBond Team
Date: 2025
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score,
    roc_curve, precision_recall_curve, average_precision_score
)
from sklearn.model_selection import cross_val_score, learning_curve
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
import json
from pathlib import Path
import pandas as pd

logger = logging.getLogger(__name__)


class ModelEvaluator:
    """
    Comprehensive model evaluation class with various metrics and visualization tools.
    """
    
    def __init__(self, class_names: Optional[List[str]] = None):
        """
        Initialize model evaluator.
        
        Args:
            class_names (Optional[List[str]]): Names of classes for better visualization
        """
        self.class_names = class_names
        self.evaluation_history = []
        logger.info("Model evaluator initialized")
    
    def evaluate_model(self, 
                      model: Any,
                      X_test: np.ndarray,
                      y_test: np.ndarray,
                      X_train: Optional[np.ndarray] = None,
                      y_train: Optional[np.ndarray] = None,
                      detailed: bool = True) -> Dict[str, Any]:
        """
        Comprehensive model evaluation.
        
        Args:
            model: Trained model to evaluate
            X_test: Test features
            y_test: Test labels
            X_train: Training features (optional, for learning curve)
            y_train: Training labels (optional, for learning curve)
            detailed: Whether to include detailed metrics
            
        Returns:
            Dict[str, Any]: Comprehensive evaluation results
        """
        logger.info("Starting comprehensive model evaluation...")
        
        try:
            # Get predictions
            y_pred = self._get_predictions(model, X_test)
            y_pred_proba = self._get_prediction_probabilities(model, X_test)
            
            # Basic metrics
            basic_metrics = self._calculate_basic_metrics(y_test, y_pred, y_pred_proba)
            
            # Detailed metrics
            detailed_metrics = {}
            if detailed:
                detailed_metrics = self._calculate_detailed_metrics(
                    y_test, y_pred, y_pred_proba, model, X_test, X_train, y_train
                )
            
            # Combine results
            evaluation_results = {
                'basic_metrics': basic_metrics,
                'detailed_metrics': detailed_metrics,
                'predictions': {
                    'y_true': y_test.tolist(),
                    'y_pred': y_pred.tolist(),
                    'y_pred_proba': y_pred_proba.tolist() if y_pred_proba is not None else None
                },
                'model_info': self._get_model_info(model)
            }
            
            # Store in history
            self.evaluation_history.append(evaluation_results)
            
            logger.info("Model evaluation completed successfully")
            return evaluation_results
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {str(e)}")
            raise
    
    def _get_predictions(self, model: Any, X_test: np.ndarray) -> np.ndarray:
        """Get model predictions."""
        try:
            if hasattr(model, 'predict'):
                return model.predict(X_test)
            else:
                raise AttributeError("Model does not have predict method")
        except Exception as e:
            logger.error(f"Failed to get predictions: {str(e)}")
            raise
    
    def _get_prediction_probabilities(self, model: Any, X_test: np.ndarray) -> Optional[np.ndarray]:
        """Get model prediction probabilities."""
        try:
            if hasattr(model, 'predict_proba'):
                return model.predict_proba(X_test)
            elif hasattr(model, 'predict'):
                # For models that don't have predict_proba, try to get probabilities
                predictions = model.predict(X_test)
                if len(predictions.shape) == 1:
                    # Binary classification - convert to probabilities
                    return np.column_stack([1 - predictions, predictions])
                else:
                    return predictions
            else:
                return None
        except Exception as e:
            logger.warning(f"Could not get prediction probabilities: {str(e)}")
            return None
    
    def _calculate_basic_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, 
                                y_pred_proba: Optional[np.ndarray]) -> Dict[str, float]:
        """Calculate basic evaluation metrics."""
        metrics = {}
        
        try:
            # Accuracy
            metrics['accuracy'] = accuracy_score(y_true, y_pred)
            
            # Precision, Recall, F1 (with different averaging strategies)
            for average in ['macro', 'micro', 'weighted']:
                try:
                    metrics[f'precision_{average}'] = precision_score(y_true, y_pred, average=average, zero_division=0)
                    metrics[f'recall_{average}'] = recall_score(y_true, y_pred, average=average, zero_division=0)
                    metrics[f'f1_{average}'] = f1_score(y_true, y_pred, average=average, zero_division=0)
                except Exception as e:
                    logger.warning(f"Could not calculate {average} metrics: {str(e)}")
            
            # ROC AUC (if probabilities available)
            if y_pred_proba is not None:
                try:
                    if len(y_pred_proba.shape) == 1 or y_pred_proba.shape[1] == 2:
                        # Binary classification
                        if y_pred_proba.shape[1] == 2:
                            y_proba = y_pred_proba[:, 1]
                        else:
                            y_proba = y_pred_proba
                        metrics['roc_auc'] = roc_auc_score(y_true, y_proba)
                    else:
                        # Multi-class classification
                        metrics['roc_auc_ovr'] = roc_auc_score(y_true, y_pred_proba, multi_class='ovr')
                        metrics['roc_auc_ovo'] = roc_auc_score(y_true, y_pred_proba, multi_class='ovo')
                except Exception as e:
                    logger.warning(f"Could not calculate ROC AUC: {str(e)}")
            
            # Average Precision
            if y_pred_proba is not None:
                try:
                    if len(y_pred_proba.shape) == 1 or y_pred_proba.shape[1] == 2:
                        if y_pred_proba.shape[1] == 2:
                            y_proba = y_pred_proba[:, 1]
                        else:
                            y_proba = y_pred_proba
                        metrics['average_precision'] = average_precision_score(y_true, y_proba)
                except Exception as e:
                    logger.warning(f"Could not calculate average precision: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error calculating basic metrics: {str(e)}")
        
        return metrics
    
    def _calculate_detailed_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, 
                                   y_pred_proba: Optional[np.ndarray], model: Any,
                                   X_test: np.ndarray, X_train: Optional[np.ndarray],
                                   y_train: Optional[np.ndarray]) -> Dict[str, Any]:
        """Calculate detailed evaluation metrics."""
        detailed_metrics = {}
        
        try:
            # Confusion Matrix
            cm = confusion_matrix(y_true, y_pred)
            detailed_metrics['confusion_matrix'] = cm.tolist()
            
            # Classification Report
            if self.class_names:
                report = classification_report(y_true, y_pred, target_names=self.class_names, output_dict=True)
            else:
                report = classification_report(y_true, y_pred, output_dict=True)
            detailed_metrics['classification_report'] = report
            
            # Cross-validation scores (if training data available)
            if X_train is not None and y_train is not None:
                try:
                    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
                    detailed_metrics['cross_validation'] = {
                        'mean_score': float(cv_scores.mean()),
                        'std_score': float(cv_scores.std()),
                        'scores': cv_scores.tolist()
                    }
                except Exception as e:
                    logger.warning(f"Could not perform cross-validation: {str(e)}")
            
            # Learning Curve (if training data available)
            if X_train is not None and y_train is not None:
                try:
                    train_sizes, train_scores, val_scores = learning_curve(
                        model, X_train, y_train, cv=5, n_jobs=-1,
                        train_sizes=np.linspace(0.1, 1.0, 10)
                    )
                    detailed_metrics['learning_curve'] = {
                        'train_sizes': train_sizes.tolist(),
                        'train_scores_mean': np.mean(train_scores, axis=1).tolist(),
                        'train_scores_std': np.std(train_scores, axis=1).tolist(),
                        'val_scores_mean': np.mean(val_scores, axis=1).tolist(),
                        'val_scores_std': np.std(val_scores, axis=1).tolist()
                    }
                except Exception as e:
                    logger.warning(f"Could not generate learning curve: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error calculating detailed metrics: {str(e)}")
        
        return detailed_metrics
    
    def _get_model_info(self, model: Any) -> Dict[str, Any]:
        """Get model information."""
        model_info = {
            'model_type': type(model).__name__,
            'model_module': type(model).__module__
        }
        
        try:
            # Try to get model parameters
            if hasattr(model, 'get_params'):
                model_info['parameters'] = model.get_params()
            
            # Try to get model attributes
            if hasattr(model, 'coef_'):
                model_info['coefficients'] = model.coef_.tolist() if hasattr(model.coef_, 'tolist') else str(model.coef_)
            
            if hasattr(model, 'intercept_'):
                model_info['intercept'] = model.intercept_.tolist() if hasattr(model.intercept_, 'tolist') else str(model.intercept_)
            
            if hasattr(model, 'feature_importances_'):
                model_info['feature_importances'] = model.feature_importances_.tolist()
            
        except Exception as e:
            logger.warning(f"Could not extract model info: {str(e)}")
        
        return model_info
    
    def plot_confusion_matrix(self, evaluation_results: Dict[str, Any], 
                             save_path: Optional[str] = None) -> plt.Figure:
        """
        Plot confusion matrix.
        
        Args:
            evaluation_results: Results from evaluate_model
            save_path: Path to save the plot
            
        Returns:
            plt.Figure: Matplotlib figure
        """
        try:
            cm = np.array(evaluation_results['detailed_metrics']['confusion_matrix'])
            
            plt.figure(figsize=(10, 8))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                       xticklabels=self.class_names,
                       yticklabels=self.class_names)
            plt.title('Confusion Matrix')
            plt.xlabel('Predicted')
            plt.ylabel('Actual')
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                logger.info(f"Confusion matrix saved to: {save_path}")
            
            return plt.gcf()
            
        except Exception as e:
            logger.error(f"Failed to plot confusion matrix: {str(e)}")
            return None
    
    def plot_roc_curve(self, evaluation_results: Dict[str, Any], 
                      save_path: Optional[str] = None) -> plt.Figure:
        """
        Plot ROC curve.
        
        Args:
            evaluation_results: Results from evaluate_model
            save_path: Path to save the plot
            
        Returns:
            plt.Figure: Matplotlib figure
        """
        try:
            y_true = np.array(evaluation_results['predictions']['y_true'])
            y_pred_proba = evaluation_results['predictions']['y_pred_proba']
            
            if y_pred_proba is None:
                logger.warning("No prediction probabilities available for ROC curve")
                return None
            
            plt.figure(figsize=(8, 6))
            
            if len(y_pred_proba[0]) == 2:
                # Binary classification
                y_proba = [prob[1] for prob in y_pred_proba]
                fpr, tpr, _ = roc_curve(y_true, y_proba)
                auc_score = roc_auc_score(y_true, y_proba)
                
                plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {auc_score:.2f})')
                plt.plot([0, 1], [0, 1], 'k--', label='Random')
                
            else:
                # Multi-class classification
                n_classes = len(y_pred_proba[0])
                for i in range(n_classes):
                    y_binary = (y_true == i).astype(int)
                    y_proba_class = [prob[i] for prob in y_pred_proba]
                    
                    if len(np.unique(y_binary)) > 1:  # Check if class exists
                        fpr, tpr, _ = roc_curve(y_binary, y_proba_class)
                        auc_score = roc_auc_score(y_binary, y_proba_class)
                        plt.plot(fpr, tpr, label=f'Class {i} (AUC = {auc_score:.2f})')
            
            plt.xlabel('False Positive Rate')
            plt.ylabel('True Positive Rate')
            plt.title('ROC Curve')
            plt.legend()
            plt.grid(True)
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                logger.info(f"ROC curve saved to: {save_path}")
            
            return plt.gcf()
            
        except Exception as e:
            logger.error(f"Failed to plot ROC curve: {str(e)}")
            return None
    
    def plot_precision_recall_curve(self, evaluation_results: Dict[str, Any], 
                                   save_path: Optional[str] = None) -> plt.Figure:
        """
        Plot precision-recall curve.
        
        Args:
            evaluation_results: Results from evaluate_model
            save_path: Path to save the plot
            
        Returns:
            plt.Figure: Matplotlib figure
        """
        try:
            y_true = np.array(evaluation_results['predictions']['y_true'])
            y_pred_proba = evaluation_results['predictions']['y_pred_proba']
            
            if y_pred_proba is None:
                logger.warning("No prediction probabilities available for PR curve")
                return None
            
            plt.figure(figsize=(8, 6))
            
            if len(y_pred_proba[0]) == 2:
                # Binary classification
                y_proba = [prob[1] for prob in y_pred_proba]
                precision, recall, _ = precision_recall_curve(y_true, y_proba)
                avg_precision = average_precision_score(y_true, y_proba)
                
                plt.plot(recall, precision, label=f'PR Curve (AP = {avg_precision:.2f})')
                
            else:
                # Multi-class classification
                n_classes = len(y_pred_proba[0])
                for i in range(n_classes):
                    y_binary = (y_true == i).astype(int)
                    y_proba_class = [prob[i] for prob in y_pred_proba]
                    
                    if len(np.unique(y_binary)) > 1:  # Check if class exists
                        precision, recall, _ = precision_recall_curve(y_binary, y_proba_class)
                        avg_precision = average_precision_score(y_binary, y_proba_class)
                        plt.plot(recall, precision, label=f'Class {i} (AP = {avg_precision:.2f})')
            
            plt.xlabel('Recall')
            plt.ylabel('Precision')
            plt.title('Precision-Recall Curve')
            plt.legend()
            plt.grid(True)
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                logger.info(f"Precision-recall curve saved to: {save_path}")
            
            return plt.gcf()
            
        except Exception as e:
            logger.error(f"Failed to plot precision-recall curve: {str(e)}")
            return None
    
    def plot_learning_curve(self, evaluation_results: Dict[str, Any], 
                           save_path: Optional[str] = None) -> plt.Figure:
        """
        Plot learning curve.
        
        Args:
            evaluation_results: Results from evaluate_model
            save_path: Path to save the plot
            
        Returns:
            plt.Figure: Matplotlib figure
        """
        try:
            if 'learning_curve' not in evaluation_results['detailed_metrics']:
                logger.warning("No learning curve data available")
                return None
            
            lc_data = evaluation_results['detailed_metrics']['learning_curve']
            
            plt.figure(figsize=(10, 6))
            
            train_sizes = lc_data['train_sizes']
            train_mean = lc_data['train_scores_mean']
            train_std = lc_data['train_scores_std']
            val_mean = lc_data['val_scores_mean']
            val_std = lc_data['val_scores_std']
            
            plt.plot(train_sizes, train_mean, 'o-', label='Training Score')
            plt.fill_between(train_sizes, 
                           np.array(train_mean) - np.array(train_std),
                           np.array(train_mean) + np.array(train_std),
                           alpha=0.1)
            
            plt.plot(train_sizes, val_mean, 'o-', label='Validation Score')
            plt.fill_between(train_sizes,
                           np.array(val_mean) - np.array(val_std),
                           np.array(val_mean) + np.array(val_std),
                           alpha=0.1)
            
            plt.xlabel('Training Set Size')
            plt.ylabel('Score')
            plt.title('Learning Curve')
            plt.legend()
            plt.grid(True)
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                logger.info(f"Learning curve saved to: {save_path}")
            
            return plt.gcf()
            
        except Exception as e:
            logger.error(f"Failed to plot learning curve: {str(e)}")
            return None
    
    def generate_evaluation_report(self, evaluation_results: Dict[str, Any], 
                                  output_path: str = 'evaluation_report.html'):
        """
        Generate comprehensive HTML evaluation report.
        
        Args:
            evaluation_results: Results from evaluate_model
            output_path: Path to save the HTML report
        """
        try:
            # Create plots
            plots = {}
            
            # Confusion Matrix
            cm_fig = self.plot_confusion_matrix(evaluation_results)
            if cm_fig:
                cm_path = 'confusion_matrix.png'
                cm_fig.savefig(cm_path, dpi=300, bbox_inches='tight')
                plots['confusion_matrix'] = cm_path
            
            # ROC Curve
            roc_fig = self.plot_roc_curve(evaluation_results)
            if roc_fig:
                roc_path = 'roc_curve.png'
                roc_fig.savefig(roc_path, dpi=300, bbox_inches='tight')
                plots['roc_curve'] = roc_path
            
            # Precision-Recall Curve
            pr_fig = self.plot_precision_recall_curve(evaluation_results)
            if pr_fig:
                pr_path = 'precision_recall_curve.png'
                pr_fig.savefig(pr_path, dpi=300, bbox_inches='tight')
                plots['precision_recall_curve'] = pr_path
            
            # Learning Curve
            lc_fig = self.plot_learning_curve(evaluation_results)
            if lc_fig:
                lc_path = 'learning_curve.png'
                lc_fig.savefig(lc_path, dpi=300, bbox_inches='tight')
                plots['learning_curve'] = lc_path
            
            # Generate HTML report
            html_content = self._generate_html_report(evaluation_results, plots)
            
            # Save report
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"Evaluation report saved to: {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to generate evaluation report: {str(e)}")
    
    def _generate_html_report(self, evaluation_results: Dict[str, Any], 
                             plots: Dict[str, str]) -> str:
        """Generate HTML content for evaluation report."""
        basic_metrics = evaluation_results['basic_metrics']
        detailed_metrics = evaluation_results['detailed_metrics']
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>EthBond Model Evaluation Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .metric {{ margin: 10px 0; }}
                .metric-label {{ font-weight: bold; }}
                .metric-value {{ color: #2E8B57; }}
                .section {{ margin: 30px 0; }}
                .plot {{ text-align: center; margin: 20px 0; }}
                .plot img {{ max-width: 100%; height: auto; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <h1>EthBond Model Evaluation Report</h1>
            
            <div class="section">
                <h2>Basic Metrics</h2>
                <div class="metric">
                    <span class="metric-label">Accuracy:</span>
                    <span class="metric-value">{basic_metrics.get('accuracy', 'N/A'):.4f}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Precision (Macro):</span>
                    <span class="metric-value">{basic_metrics.get('precision_macro', 'N/A'):.4f}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Recall (Macro):</span>
                    <span class="metric-value">{basic_metrics.get('recall_macro', 'N/A'):.4f}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">F1 Score (Macro):</span>
                    <span class="metric-value">{basic_metrics.get('f1_macro', 'N/A'):.4f}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">ROC AUC:</span>
                    <span class="metric-value">{basic_metrics.get('roc_auc', 'N/A'):.4f}</span>
                </div>
            </div>
        """
        
        # Add plots
        for plot_name, plot_path in plots.items():
            html += f"""
            <div class="section">
                <h2>{plot_name.replace('_', ' ').title()}</h2>
                <div class="plot">
                    <img src="{plot_path}" alt="{plot_name}">
                </div>
            </div>
            """
        
        html += """
        </body>
        </html>
        """
        
        return html
    
    def save_evaluation_results(self, evaluation_results: Dict[str, Any], 
                               output_path: str = 'evaluation_results.json'):
        """
        Save evaluation results to JSON file.
        
        Args:
            evaluation_results: Results from evaluate_model
            output_path: Path to save the JSON file
        """
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(evaluation_results, f, indent=2, default=str)
            
            logger.info(f"Evaluation results saved to: {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to save evaluation results: {str(e)}")


def test_ml_eval():
    """
    Test function for ML evaluation utilities.
    """
    logger.info("Testing ML evaluation utilities...")
    
    try:
        # Create dummy data for testing
        np.random.seed(42)
        X_test = np.random.randn(100, 10)
        y_test = np.random.randint(0, 3, 100)
        
        # Create a dummy model
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X_test, y_test)
        
        # Test evaluator
        evaluator = ModelEvaluator(class_names=['Class 0', 'Class 1', 'Class 2'])
        results = evaluator.evaluate_model(model, X_test, y_test, detailed=True)
        
        logger.info(f"Basic metrics: {results['basic_metrics']}")
        logger.info("ML evaluation utilities test completed successfully")
        
    except Exception as e:
        logger.error(f"ML evaluation utilities test failed: {str(e)}")


if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(level=logging.INFO)
    test_ml_eval()


