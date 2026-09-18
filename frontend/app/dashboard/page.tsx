"use client";

import { useEffect, useState } from "react";

import AdminLayout from "@/components/layout/AdminLayout";

import KPICard from "@/components/dashboard/KPICard";
import TransactionTrend from "@/components/dashboard/TransactionTrend";
import TransactionsByChannel from "@/components/dashboard/TransactionsByChannel";
import FraudByType from "@/components/dashboard/FraudByType";
import RecentHighRisk from "@/components/dashboard/RecentHighRisk";
import AIRiskInsights from "@/components/dashboard/AIRiskInsights";

import { getDashboardData } from "@/services/api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

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

    const interval = setInterval(
      loadDashboard,

      5000,
    );

    return () => clearInterval(interval);
  }, []);

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

          <KPICard
            title="Fraud Alerts"
            value={
              dashboard ? dashboard.fraud_alerts.toLocaleString() : "Loading..."
            }
            change="Live"
            description="High risk transactions"
            icon="⚠"
            trend="up"
            variant="red"
          />

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
            AI INSIGHTS
        ================================= */}

        <AIRiskInsights />
      </div>
    </AdminLayout>
  );
}