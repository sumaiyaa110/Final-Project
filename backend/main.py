from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# ==========================================
# SERVICES
# ==========================================

from services.database import create_tables

from services.transaction_service import get_transactions
from services.predictor import predict_transaction
from services.report_service import get_reports

from services.device_service import get_devices
from services.customer_detail_service import get_customer_detail
from services.network_service import get_network_data
from services.transaction_detail_service import get_transaction_detail
from services.agent_dashboard_service import get_agents
from services.customer_txn_service import get_customer_transactions
from services.background_simulator import start_background_simulator

from services.customer_behavior_service import get_customer_behavior
from services.customer_service import get_customers
from services.investigation_service import get_customer_investigation

from services.transaction_summary_service import (
    get_transaction_summary
)

from services.dashboard_service import (
    get_dashboard_summary,
    get_high_risk_transactions
)

from services.alert_service import (
    get_fraud_alerts,
    get_alert_summary,
    resolve_alert
)

from services.analytics_service import (
    get_transaction_trend,
    get_channel_distribution,
    get_fraud_types,
    get_ai_insights
)


# ==========================================
# STARTUP / SHUTDOWN
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting AnomalyX system...")

    # --------------------------------------
    # Initialize / update database
    # --------------------------------------

    create_tables()

    print("Database initialized")

    # --------------------------------------
    # Start live transaction generator
    # --------------------------------------

    start_background_simulator()

    print("Background simulator started")

    yield

    print("AnomalyX shutdown")


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="AnomalyX Fraud Detection API",
    lifespan=lifespan
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# BASIC ROUTES
# ==========================================

@app.get("/")
def home():

    return {
        "message": "AnomalyX API running"
    }


@app.get("/health")
def health():

    return {
        "status": "OK"
    }


# ==========================================
# ML PREDICTION
# ==========================================

@app.post("/predict")
def predict(data: dict):

    print(
        "Received:",
        data
    )

    result = predict_transaction(data)

    print(
        "Result:",
        result
    )

    return result


# ==========================================
# DASHBOARD
# ==========================================

@app.get("/dashboard")
def dashboard():

    return get_dashboard_summary()


@app.get("/high-risk")
def high_risk():

    return get_high_risk_transactions()


# ==========================================
# ANALYTICS
# ==========================================

@app.get("/transaction-trend")
def transaction_trend():

    return get_transaction_trend()


@app.get("/channel-distribution")
def channel_distribution():

    return get_channel_distribution()


@app.get("/fraud-types")
def fraud_types():

    return get_fraud_types()


@app.get("/insights")
def insights():

    return get_ai_insights()


# ==========================================
# DEVICES
# ==========================================

@app.get("/devices")
def devices():

    return get_devices()


# ==========================================
# NETWORK
# ==========================================

@app.get("/network")
def network():

    return get_network_data()


# ==========================================
# AGENTS
# ==========================================

@app.get("/agents")
def agents():

    return get_agents()


# ==========================================
# FRAUD ALERTS
# ==========================================

@app.get("/alerts")
def alerts():

    return get_fraud_alerts()


@app.get("/alert-summary")
def alert_summary():

    return get_alert_summary()


@app.post("/alerts/{alert_id}/resolve")
def resolve_fraud_alert(alert_id: str):

    return resolve_alert(alert_id)


# ==========================================
# TRANSACTIONS
# ==========================================

@app.get("/transactions")
def transactions():

    return get_transactions()


@app.get("/transaction/{transaction_id}")
def transaction_detail(transaction_id: str):

    return get_transaction_detail(transaction_id)


@app.get("/transaction-summary")
def transaction_summary():

    return get_transaction_summary()


# ==========================================
# CUSTOMER BEHAVIOR
# ==========================================

@app.get("/customer-behavior/{customer_id}")
def customer_behavior(customer_id: str):

    return get_customer_behavior(customer_id)


# ==========================================
# CUSTOMERS
# ==========================================

@app.get("/customers")
def customers():

    return get_customers()


@app.get("/customer/{customer_id}")
def customer_detail(customer_id: str):

    return get_customer_detail(customer_id)


@app.get("/customer/{customer_id}/transactions")
def customer_transactions(customer_id: str):

    return get_customer_transactions(customer_id)


# ==========================================
# INVESTIGATION
# ==========================================

@app.get("/investigation/{customer_id}")
def investigation(customer_id: str):

    return get_customer_investigation(customer_id)


# ==========================================
# REPORTS
# ==========================================

@app.get("/reports")
def reports():

    return get_reports()