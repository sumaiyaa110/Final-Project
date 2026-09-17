import pandas as pd
import numpy as np

from services.model_loader import (
    xgb_model,
    iso_model,
    iso_scaler,
    model_features
)


def predict_transaction(transaction):

    # Convert input JSON into dataframe

    df = pd.DataFrame(
        [transaction]
    )


    # Convert categorical variables

    categorical_cols = df.select_dtypes(
        include=["object"]
    ).columns


    df = pd.get_dummies(
        df,
        columns=categorical_cols,
        dtype=int
    )


    # Match training features

    df = df.reindex(
        columns=model_features,
        fill_value=0
    )


    # ----------------------------
    # XGBoost Fraud Prediction
    # ----------------------------

    fraud_probability = xgb_model.predict_proba(
        df
    )[0][1]


    # ----------------------------
    # Isolation Forest
    # ----------------------------

    scaled_data = iso_scaler.transform(
        df
    )


    anomaly_score = -iso_model.score_samples(
        scaled_data
    )[0]


    # ----------------------------
    # Risk Fusion
    # ----------------------------

    final_risk_score = (

        0.7 * fraud_probability * 100

        +

        0.3 * anomaly_score * 100

    )


    final_risk_score = round(
        min(final_risk_score,100),
        2
    )


    # Risk category

    if final_risk_score >= 80:

        risk_level = "CRITICAL"

    elif final_risk_score >= 60:

        risk_level = "HIGH"

    elif final_risk_score >= 30:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"


    return {

        "fraud_probability":
            float(round(float(fraud_probability), 4)),

        "anomaly_score":
            float(round(float(anomaly_score), 4)),

        "risk_score":
            float(final_risk_score),

        "risk_level":
            risk_level

    }