import numpy as np
import pandas as pd
import xgboost as xgb

from services.model_loader import (
    xgb_model,
    iso_model,
    iso_scaler,
    model_features,
    fraud_threshold,
    anomaly_threshold
)


CATEGORICAL_COLUMNS = [
    "channel",
    "location",
    "merchant_category"
]

# Isolation Forest scores above this are treated as fully anomalous
# when scaling the anomaly signal (99.9th percentile of normal traffic
# is ~0.60).
ANOMALY_SCORE_MAX = 0.65

# Extra risk points a strongly anomalous transaction can add.
ANOMALY_WEIGHT = 15

AMOUNT_DEVIATION_RATIO = 3
HIGH_VELOCITY_TXN_COUNT = 5


# =====================================================
# FEATURE ENGINEERING
# =====================================================

def build_feature_row(transaction):
    """
    Raw transaction fields -> engineered fields used in training.
    Missing fields are left out and become 0 after alignment.
    """

    row = {}

    for key, value in transaction.items():

        if isinstance(value, (bool, np.bool_)):
            value = int(value)

        if value is None or (isinstance(value, float) and np.isnan(value)):
            continue

        row[key] = value

    amount = float(row.get("amount", 0) or 0)

    row.setdefault("amount_log", float(np.log1p(max(amount, 0))))

    if "txn_hour" in row:
        row.setdefault(
            "is_night_transaction",
            int(0 <= int(row["txn_hour"]) <= 5)
        )

    avg_amount = row.get("customer_avg_amount", row.get("avg_txn_amount"))

    if avg_amount:

        avg_amount = float(avg_amount)

        row["customer_avg_amount"] = avg_amount

        ratio = amount / avg_amount

        row.setdefault("amount_vs_customer_avg", ratio)

        row.setdefault(
            "amount_deviation_flag",
            int(ratio > AMOUNT_DEVIATION_RATIO)
        )

    if "customer_txn_count_24h" in row:
        row.setdefault(
            "is_high_velocity",
            int(int(row["customer_txn_count_24h"]) >= HIGH_VELOCITY_TXN_COUNT)
        )

    return row


def to_model_frame(feature_row):

    df = pd.DataFrame([feature_row])

    categorical_cols = [
        col for col in CATEGORICAL_COLUMNS
        if col in df.columns
    ]

    df = pd.get_dummies(
        df,
        columns=categorical_cols,
        dtype=int
    )

    df = df.reindex(
        columns=model_features,
        fill_value=0
    )

    return df.apply(
        pd.to_numeric,
        errors="coerce"
    ).fillna(0)


# =====================================================
# RISK FUSION
# =====================================================

def fuse_risk(fraud_probability, anomaly_score):
    """
    XGBoost drives the score: probabilities below the tuned fraud
    threshold map to 0-60, above it to 60-100. Isolation Forest scores
    above the tuned anomaly threshold add up to ANOMALY_WEIGHT points.
    """

    if fraud_probability < fraud_threshold:
        fraud_part = 60 * fraud_probability / fraud_threshold
    else:
        fraud_part = 60 + 40 * (
            (fraud_probability - fraud_threshold)
            / (1 - fraud_threshold)
        )

    anomaly_part = np.clip(
        (anomaly_score - anomaly_threshold)
        / (ANOMALY_SCORE_MAX - anomaly_threshold),
        0,
        1
    )

    risk_score = round(
        float(min(fraud_part + ANOMALY_WEIGHT * anomaly_part, 100)),
        2
    )

    if risk_score >= 85:
        risk_level = "CRITICAL"
    elif risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return risk_score, risk_level


# =====================================================
# PREDICTION
# =====================================================

def predict_transaction(transaction):

    df = to_model_frame(
        build_feature_row(transaction)
    )

    fraud_probability = float(
        xgb_model.predict_proba(df)[0][1]
    )

    anomaly_score = float(
        -iso_model.score_samples(
            iso_scaler.transform(df)
        )[0]
    )

    risk_score, risk_level = fuse_risk(
        fraud_probability,
        anomaly_score
    )

    return {

        "fraud_probability":
            round(fraud_probability, 4),

        "anomaly_score":
            round(anomaly_score, 4),

        "risk_score":
            risk_score,

        "risk_level":
            risk_level

    }


# =====================================================
# TREESHAP CONTRIBUTIONS
# =====================================================

def explain_features(feature_row, top_n=6):
    """
    Per-feature TreeSHAP contributions (log-odds) from XGBoost's
    built-in pred_contribs, largest absolute impact first.
    """

    df = to_model_frame(feature_row)

    contribs = xgb_model.get_booster().predict(
        xgb.DMatrix(df),
        pred_contribs=True
    )[0]

    contributions = [
        {
            "feature": feature,
            "value": float(df.iloc[0][feature]),
            "contribution": round(float(contrib), 4),
            "impact": (
                "Increases Risk" if contrib > 0 else "Decreases Risk"
            ),
        }
        for feature, contrib in zip(model_features, contribs[:-1])
        if abs(contrib) > 1e-6
    ]

    contributions.sort(
        key=lambda item: abs(item["contribution"]),
        reverse=True
    )

    return {
        "base_value": round(float(contribs[-1]), 4),
        "top_contributions": contributions[:top_n],
    }
