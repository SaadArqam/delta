import joblib
import pandas as pd

# Load model once (important)
model = joblib.load("app/ml/model.pkl")


def predict_risk(event_count_30d, month):
    X = pd.DataFrame([{
        "event_count_30d": event_count_30d,
        "month": month
    }])

    prob = model.predict_proba(X)[0][1]

    return round(prob * 100, 2)