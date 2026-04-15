import joblib
import pandas as pd
from pathlib import Path
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Loaded lazily and reused across requests/process
_model = None


def _resolve_model_path(path_str: str) -> Path:
    """Resolve model path: allow absolute or repository-relative paths."""
    p = Path(path_str)
    if p.exists():
        return p

    # Try relative to this file's parent (app/ml/)
    candidate = Path(__file__).resolve().parent / p
    if candidate.exists():
        return candidate

    # Try repository root relative (two levels up)
    repo_candidate = Path(__file__).resolve().parents[2] / p
    if repo_candidate.exists():
        return repo_candidate

    return p  # last attempt; will likely not exist


def get_model():
    """Lazily load the model to handle training cases and file errors.

    Keeps a single instance in memory per process so model file is not
    reloaded on every request.
    """
    global _model

    if _model is not None:
        return _model

    model_path = _resolve_model_path(settings.MODEL_PATH)

    if model_path.exists():
        try:
            _model = joblib.load(model_path)
            logger.info(f"Random Forest model loaded from disk: {model_path}")
            return _model
        except Exception as e:
            logger.error(f"Failed to load model from {model_path}: {e}")
            return None
    else:
        logger.warning(f"Model file not found at {model_path}. Train it first via /train.")
        return None


def predict_risk(event_count_30d: float, month: int):
    """Predict risk score using pre-trained model.

    Returns a percentage (0-100) or None when model is unavailable.
    """
    model = get_model()

    if model is None:
        return None

    try:
        X = pd.DataFrame([{"event_count_30d": event_count_30d, "month": month}])

        probs = model.predict_proba(X)
        # Probability for positive class if it exists
        prob = probs[0][1] if probs.shape[1] > 1 else probs[0][0]

        return round(float(prob) * 100.0, 2)

    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return None