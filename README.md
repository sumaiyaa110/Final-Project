
# AnomalyX Frontend

Admin-only fraud/anomaly monitoring frontend.

## Main stack
- Next.js
- TypeScript
- Tailwind CSS
- Plotly / chart components
- FastAPI backend connection

## Main pages
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

This package contains the frontend structure only.
=======
# ENTERPRISE AI ANOMALY DETECTION FINANCIAL RISK PLATFORM

## Project Overview

An AI-based financial fraud and anomaly detection platform designed to identify suspicious financial transactions, abnormal customer behavior, and potential fraud patterns.

The system combines supervised fraud classification, unsupervised anomaly detection, behavioral analysis, and explainable risk assessment to provide a comprehensive financial risk detection solution.

## Objectives

- Detect known financial fraud patterns
- Identify unknown and unusual transaction anomalies
- Analyze abnormal customer behavior
- Generate a financial risk score for transactions
- Explain why a transaction is considered risky
- Provide an interactive financial risk monitoring dashboard

## Key Features

- Fraud classification
- Anomaly detection
- Customer behavioral analysis
- Risk scoring
- Explainable AI-based fraud reasoning
- Transaction and fraud analysis
- Financial risk visualization

## Technology Stack

### Frontend
-- Next.js
- TypeScript
- Tailwind CSS
- Plotly

### Machine Learning
- Python
- Scikit-learn
- XGBoost
- SHAP

### Database
- SQLite

### Data Processing
- Pandas
- NumPy

## System Workflow

```text
Financial Transaction Data
          ↓
Data Preprocessing
          ↓
Feature Engineering
          ↓
 ┌────────┴─────────┐
 ↓                  ↓
Fraud             Anomaly
Classification    Detection
 ↓                  ↓
 └────────┬─────────┘
          ↓
 Behavioral Analysis
          ↓
    Risk Assessment
          ↓
 Explainable Fraud Reason
          ↓
 Database + Dashboard

