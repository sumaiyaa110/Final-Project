import joblib
import os
import time


MODEL_PATH = "models"


start = time.time()


print("Loading XGBoost...")

xgb_start = time.time()

xgb_model = joblib.load(
    os.path.join(
        MODEL_PATH,
        "xgboost_fraud_model.pkl"
    )
)

print(
    "XGBoost loaded:",
    time.time()-xgb_start,
    "seconds"
)



print("Loading Isolation Forest...")

iso_start = time.time()

iso_model = joblib.load(
    os.path.join(
        MODEL_PATH,
        "isolation_forest_model.pkl"
    )
)

print(
    "Isolation loaded:",
    time.time()-iso_start,
    "seconds"
)



print("Loading scaler...")

scaler_start=time.time()

iso_scaler = joblib.load(
    os.path.join(
        MODEL_PATH,
        "isolation_scaler.pkl"
    )
)

print(
    "Scaler loaded:",
    time.time()-scaler_start,
    "seconds"
)



print("Loading features...")

model_features = joblib.load(
    os.path.join(
        MODEL_PATH,
        "model_features.pkl"
    )
)



fraud_threshold = joblib.load(
    os.path.join(
        MODEL_PATH,
        "fraud_threshold.pkl"
    )
)


anomaly_threshold = joblib.load(
    os.path.join(
        MODEL_PATH,
        "anomaly_threshold.pkl"
    )
)


print(
    "TOTAL MODEL LOAD TIME:",
    time.time()-start,
    "seconds"
)


print(
    "All ML models loaded successfully"
)