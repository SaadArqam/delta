import pandas as pd
import logging
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from app.config import settings

logger = logging.getLogger(__name__)

def train_model(df: pd.DataFrame):
    """Refined training pipeline with better logging and error management."""
    if df.empty or "label" not in df.columns:
        logger.error("Empty dataframe or missing label. Cannot train model.")
        return None

    try:
        X = df[["event_count_30d", "month"]].fillna(0)
        y = df["label"]

        if len(y.unique()) < 2:
            logger.warning("Only one class found in dataset. Using dummy predictions.")
            # At least mock it if we don't have enough data
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        logger.info("\nMODEL PERFORMANCE:\n" + classification_report(y_test, y_pred))

        # Save model (Ensuring directory exists)
        import os
        os.makedirs(os.path.dirname(settings.MODEL_PATH), exist_ok=True)
        joblib.dump(model, settings.MODEL_PATH)
        logger.info(f"Model saved at {settings.MODEL_PATH}")

        return model
        
    except Exception as e:
        logger.error(f"Failed to train model: {str(e)}")
        return None