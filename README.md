# ENTERPRISE AI ANOMALY DETECTION FINANCIAL RISK PLATFORM

## Project Overview

An AI-powered financial fraud and anomaly detection platform designed to identify suspicious transactions, abnormal customer behavior, and emerging fraud patterns.

The system combines supervised fraud classification, unsupervised anomaly detection, behavioral analytics, network-based risk analysis, and explainable AI to provide a comprehensive financial risk monitoring solution.

The platform consists of an interactive admin dashboard frontend connected with an AI-powered backend risk engine.

---

# Objectives

- Detect known financial fraud patterns
- Identify unknown and emerging transaction anomalies
- Analyze customer behavioral changes
- Detect suspicious device and transaction activities
- Generate transaction-level risk scores
- Provide explainable fraud reasoning
- Enable real-time financial risk monitoring

---

# Key Features

## AI Fraud Detection

- Supervised fraud classification using XGBoost
- Fraud probability prediction
- Class imbalance handling
- Optimized fraud decision threshold

## Anomaly Detection

- Unsupervised anomaly detection using Isolation Forest
- Detection of unusual transaction behavior
- Zero-day fraud pattern identification

## Behavioral Risk Analysis

- Customer transaction behavior analysis
- Transaction velocity monitoring
- Amount deviation analysis
- Device-based risk assessment

## Network Risk Analysis

- Transaction relationship analysis
- Suspicious account behavior detection
- Network-based fraud indicators

## Explainable AI

- TreeSHAP feature contributions (XGBoost's built-in `pred_contribs`)
- Feature-level fraud contribution analysis
- Human-readable fraud reasoning and customer behavioral signals

## Risk Assessment

- Multi-model risk fusion engine
- Combined fraud probability and anomaly scoring
- Transaction risk classification: LOW / MEDIUM / HIGH / CRITICAL

The fusion score (0-100) is driven by XGBoost: probabilities below the tuned
fraud threshold (0.85) map to 0-60 and above it to 60-100. An Isolation Forest
score above its tuned threshold adds up to 15 points.
Levels: CRITICAL >= 85, HIGH >= 60, MEDIUM >= 30, otherwise LOW.

---

# Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Plotly / Interactive chart components

## Backend

- FastAPI
- Python

## Machine Learning

- Python
- Scikit-learn
- XGBoost (incl. TreeSHAP contributions)

## Data Processing

- Pandas
- NumPy

## Database

- SQLite

---

# AI Pipeline Architecture

```text
                 Transaction Data

                       ↓

              Data Processing Layer

                       ↓

              Feature Engineering

                       ↓

        ┌──────────────┴──────────────┐
        ↓                             ↓

   XGBoost Model              Isolation Forest
   Known Fraud                Unknown Fraud
   Detection                  Detection

        ↓                             ↓

   Fraud Probability          Anomaly Score

        └──────────────┬──────────────┘

                       ↓

              Risk Fusion Engine

                       ↓

            Final Risk Score (0-100)

                       ↓

        ┌──────────────┴──────────────┐
        ↓                             ↓

   Risk Category              Explainable AI
 LOW/MEDIUM/HIGH/CRITICAL      (TreeSHAP)

                       ↓

              Admin Monitoring Dashboard
```

---

# Frontend Application

## AnomalyX Frontend

Admin-only fraud and anomaly monitoring dashboard.

## Main Pages

- Home
- Admin Login
- Dashboard
- Transactions
- Fraud Alerts
- Customers
- Devices
- Agents
- Network Analysis
- Investigations
- Reports
- Settings

The frontend provides:

- Real-time risk monitoring
- Transaction investigation interface
- Fraud alert visualization
- Customer and device analytics
- Network relationship visualization

---

# Running Locally

The transaction dataset is stored with Git LFS:

```bash
git lfs install
git lfs pull
```

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

On first start the working database `backend/database/anomalyx.db` is created
from the committed seed `backend/database/anomalyx_seed.db` (the working copy
is git-ignored). A background simulator then scores a new transaction from
`backend/data/transactions_v4.csv` every 5 seconds. If the dataset is missing,
the API still runs and the simulator stays off.

Configuration (see `backend/.env.example`):

- `ALLOWED_ORIGINS`: comma-separated frontend origins for CORS (default `http://localhost:3000`)
- `ANOMALYX_DB_PATH`: working database location
- `ANOMALYX_SIMULATOR=0`: disable the live simulator

Tests:

```bash
pip install -r requirements-dev.txt
pytest tests
```

## Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Demo admin login: `admin@anomalyx.com` / `admin12345`.

## Deployment

`render.yaml` (repository root) deploys the backend from `backend/` on Render.
Set `ALLOWED_ORIGINS` to the deployed frontend URL, and set
`NEXT_PUBLIC_API_URL` on the frontend to the backend URL. Render must fetch the
Git LFS dataset for the simulator to run; without it the API serves the seed data.

The `models/` folder holds training outputs (metrics, feature importance);
the models the API loads live in `backend/models/`.

---

# Current Status

Implemented:

✅ Data preprocessing pipeline  
✅ Behavioral feature engineering  
✅ XGBoost fraud detection  
✅ Isolation Forest anomaly detection  
✅ Risk fusion engine  
✅ Explainable AI (TreeSHAP contributions)  
✅ FastAPI backend with real-time transaction scoring simulator  
✅ Live fraud alerts and investigation workflow  
✅ Admin dashboard frontend  

Planned:

- Advanced graph fraud analytics
- Real authentication for the admin dashboard and API
