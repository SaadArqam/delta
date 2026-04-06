import joblib
import pandas as pd
import os
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Loaded lazily
_model = None

def get_model():
    """Lazily load the model to handle training cases and file errors."""
    global _model
    
    if _model is not None:
        return _model
    
    # Path relative to backend root
    model_path = settings.MODEL_PATH
    
    if os.path.exists(model_path):
        try:
            _model = joblib.load(model_path)
            logger.info("Random Forest model loaded from disk.")
            return _model
        except Exception as e:
            logger.error(f"Failed to load model from {model_path}: {e}")
            return None
    else:
        logger.warning(f"Model file not found at {model_path}. Train it first via /train.")
        return None

def predict_risk(event_count_30d: float, month: int):
    """Predict risk score using pre-trained model."""
    model = get_model()
    
    if model is None:
        return None  # Or some default value
    
    try:
        X = pd.DataFrame([{
            "event_count_30d": event_count_30d, 
            "month": month
        }])
        
        # Scikit-learn predict_proba returns probability for both classes [0, 1]
        probs = model.predict_proba(X)
        
        # Risk score is probability of disaster class
        prob = probs[0][1] if len(probs[0]) > 1 else probs[0][0]
        
        return round(prob * 100, 2)
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return 0.0