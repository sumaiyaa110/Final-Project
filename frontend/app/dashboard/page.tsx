"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "@/components/layout/AdminLayout";

import KPICard from "@/components/dashboard/KPICard";
import TransactionTrend from "@/components/dashboard/TransactionTrend";
import TransactionsByChannel from "@/components/dashboard/TransactionsByChannel";
import FraudByType from "@/components/dashboard/FraudByType";
import RecentHighRisk from "@/components/dashboard/RecentHighRisk";
import AIRiskInsights from "@/components/dashboard/AIRiskInsights";
import InvestigationQueue from "@/components/dashboard/InvestigationQueue";
import { getDashboardData } from "@/services/api";
import {
  LuArrowLeftRight,
  LuPercent,
  LuShieldAlert,
  LuTriangleAlert,
} from "react-icons/lu";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  const router = useRouter();

  // ==========================================
  // REAL TIME DASHBOARD UPDATE
  // ==========================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardData();

        console.log("Live Dashboard Data:", data);

        setDashboard(data);
      } catch (error) {
        console.log("Dashboard API Error:", error);
      }
    }

    // First load
    loadDashboard();

    // Refresh every 5 seconds
    const interval = setInterval(loadDashboard, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // KPI CARD NAVIGATION
  // ==========================================

  function handleTotalTransactions() {
    router.push("/transactions");
  }

  function handleFraudAlerts() {
    router.push("/alerts");
  }

  function handleHighRiskEntities() {
    router.push("/devices?risk=high");
  }

  function handleFraudRate() {
    router.push("/alerts");
  }

  return (
    <AdminLayout>
      <div className="dashboard-page">
        {/* ================================
            HEADER
        ================================= */}
        <div className="dashboard-title">
            <div>
                <h1>
                    Dashboard
                </h1>

                <p>
                    Real-time overview of your financial monitoring system.
                </p>


            </div>

          <div className="dashboard-date">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* ================================
            KPI CARDS
        ================================= */}

        <div className="kpi-grid">
          {/* TOTAL TRANSACTIONS */}

          <div
            className="dashboard-kpi-clickable"
            onClick={handleTotalTransactions}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleTotalTransactions();
              }
            }}
          >
            <KPICard
              title="Total Transactions"
              value={
                dashboard
                  ? dashboard.total_transactions
                  : "Loading..."
              }
              change="Live"
              description="Current database records"
              icon={LuArrowLeftRight}
              trend="up"
              variant="blue"
            />
          </div>

          {/* FRAUD ALERTS */}

          <div
            className="dashboard-kpi-clickable"
            onClick={handleFraudAlerts}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleFraudAlerts();
              }
            }}
          >
            <KPICard
              title="Fraud Alerts"
              value={
                dashboard
                  ? dashboard.fraud_alerts
                  : "Loading..."
              }
              change="Live"
              description="High risk transactions"
              icon={LuTriangleAlert}
              trend="up"
              variant="red"
            />
          </div>

          {/* HIGH RISK ENTITIES */}

          <div
            className="dashboard-kpi-clickable"
            onClick={handleHighRiskEntities}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleHighRiskEntities();
              }
            }}
          >
            <KPICard
              title="High Risk Entities"
              value={
                dashboard
                  ? dashboard.high_risk_entities
                  : "Loading..."
              }
              change="Live"
              description="Detected risk groups"
              icon={LuShieldAlert}
              trend="up"
              variant="yellow"
            />
          </div>

          {/* FRAUD RATE */}

          <div
            className="dashboard-kpi-clickable"
            onClick={handleFraudRate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleFraudRate();
              }
            }}
          >
            <KPICard
              title="Fraud Rate"
              value={dashboard ? `${dashboard.fraud_rate}%` : "Loading..."}
              change="Live"
              description="Current fraud ratio"
              icon={LuPercent}
              trend="down"
              variant="green"
            />
          </div>
        </div>

        {/* =====================================================
            FEATURE 8: CURRENT THREAT OVERVIEW
        ===================================================== */}
        {dashboard?.threat_overview && (
          <div className="dashboard-threat-overview-card">
            <div className="dashboard-threat-header">
              <div>
                <h2>Risk overview</h2>
                <p>
                  Current risk across transactions, entities and devices.
                </p>
              </div>

              <span
                className={`dashboard-threat-badge ${String(
                  dashboard.threat_overview.threat_level
                ).toLowerCase()}`}
              >
                Threat level:{" "}
                {String(dashboard.threat_overview.threat_level).charAt(0) +
                  String(dashboard.threat_overview.threat_level).slice(1).toLowerCase()}
              </span>
            </div>

            <div className="dashboard-threat-grid">
              <div className="dashboard-threat-metric">
                <span className="metric-label">Average risk score</span>
                <strong className="metric-value">
                  {dashboard.threat_overview.average_system_risk}/100
                </strong>
              </div>

              <div className="dashboard-threat-metric">
                <span className="metric-label">Active cases</span>
                <strong className="metric-value">
                  {dashboard.threat_overview.active_investigations}
                </strong>
              </div>

              <div className="dashboard-threat-metric">
                <span className="metric-label">High-risk transactions</span>
                <strong className="metric-value highlight-red">
                  {dashboard.threat_overview.high_risk_transactions}
                </strong>
              </div>

              <div className="dashboard-threat-metric">
                <span className="metric-label">Critical alerts</span>
                <strong className="metric-value">
                  {dashboard.threat_overview.critical_alerts}
                </strong>
              </div>

              <div className="dashboard-threat-metric">
                <span className="metric-label">Suspicious devices</span>
                <strong className="metric-value">
                  {dashboard.threat_overview.suspicious_devices}
                </strong>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            FEATURE 5: FRAUD PATTERN INSIGHTS
        ===================================================== */}
        {dashboard?.fraud_patterns && (
          <div className="dashboard-fraud-patterns-card">
            <div className="dashboard-fraud-header">
              <div>
                <h2>Fraud patterns</h2>
                <p>Most frequent signals among flagged transactions.</p>
              </div>
            </div>

            <div className="dashboard-fraud-grid">
              <div className="dashboard-fraud-metric">
                <span className="metric-label">Most common risk signal</span>
                <strong className="metric-value">
                  {dashboard.fraud_patterns.most_common_risk_signal}
                </strong>
              </div>

              <div className="dashboard-fraud-metric">
                <span className="metric-label">Highest-risk channel</span>
                <strong className="metric-value">
                  {dashboard.fraud_patterns.highest_risk_channel}
                </strong>
              </div>

              <div className="dashboard-fraud-metric">
                <span className="metric-label">Most suspicious device</span>
                <strong className="metric-value">
                  {dashboard.fraud_patterns.most_suspicious_device}
                </strong>
              </div>

              <div className="dashboard-fraud-metric">
                <span className="metric-label">Most affected customer</span>
                <strong className="metric-value">
                  {dashboard.fraud_patterns.most_affected_customer}
                </strong>
              </div>

              <div className="dashboard-fraud-metric">
                <span className="metric-label">Most common anomaly pattern</span>
                <strong className="metric-value">
                  {dashboard.fraud_patterns.most_common_anomaly_pattern}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ================================
            ANALYTICS
        ================================= */}

        <div className="dashboard-analytics-grid">
          <div className="dashboard-main-chart">
            <TransactionTrend />
          </div>

          <div className="dashboard-side-chart">
            <TransactionsByChannel />
          </div>
        </div>

        {/* ================================
    INVESTIGATION
================================= */}

<div className="dashboard-investigation-grid">

  <div className="dashboard-main-table">
    <RecentHighRisk />
  </div>


  <div className="dashboard-side-chart">
    <FraudByType />
  </div>

</div>



{/* ================================
    ACTIVE INVESTIGATION QUEUE
================================= */}

<div className="dashboard-investigation-bottom">

  <InvestigationQueue />

</div>

        {/* ================================
            AI INSIGHTS
        ================================= */}

        <AIRiskInsights />
      </div>
    </AdminLayout>
  );
}
