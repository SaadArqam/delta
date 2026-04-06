import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib


def train_model(df):
    X = df[["event_count_30d", "month"]].fillna(0)
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2
    )

    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("\nMODEL PERFORMANCE:\n")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, "app/ml/model.pkl")

    print("\nModel saved at app/ml/model.pkl")

    return model