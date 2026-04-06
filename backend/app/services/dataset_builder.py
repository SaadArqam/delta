import random
import pandas as pd


def generate_negative_samples(n=500):
    negatives = []

    for _ in range(n):
        negatives.append({
            "event_count_30d": 0,
            "month": random.randint(1, 12),
            "label": 0
        })

    return pd.DataFrame(negatives)


def build_dataset(features_df):
    # Positive samples
    features_df["label"] = 1

    # Negative samples
    negatives = generate_negative_samples()

    dataset = pd.concat([features_df, negatives], ignore_index=True)

    return dataset