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
            <h1>Dashboard</h1>

            <p>Real-time overview of your financial monitoring system.</p>
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
                  ? dashboard.total_transactions.toLocaleString()
                  : "Loading..."
              }
              change="Live"
              description="Current database records"
              icon="↗"
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
                  ? dashboard.fraud_alerts.toLocaleString()
                  : "Loading..."
              }
              change="Live"
              description="High risk transactions"
              icon="⚠"
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
                  ? dashboard.high_risk_entities.toLocaleString()
                  : "Loading..."
              }
              change="Live"
              description="Detected risk groups"
              icon="!"
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
              icon="◉"
              trend="down"
              variant="green"
            />
          </div>
        </div>

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