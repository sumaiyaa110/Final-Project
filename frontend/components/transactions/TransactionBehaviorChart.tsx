"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { getCustomerBehavior } from "@/services/api";
import { API_URL } from "@/services/api";
import {
  LuActivity,
  LuLightbulb,
} from "react-icons/lu";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

interface TransactionBehaviorChartProps {
  customerId?: string;
  transactionId?: string;
}

export default function TransactionBehaviorChart({
  customerId,
  transactionId,
}: TransactionBehaviorChartProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  // =====================================================
  // REALTIME CUSTOMER BEHAVIOR
  // =====================================================

  useEffect(() => {
    if (!customerId || customerId === "Unknown") {
      setTransactions([]);
      return;
    }

    async function load() {
      try {
        const queryParam = transactionId ? `?transaction_id=${transactionId}&t=${Date.now()}` : `?t=${Date.now()}`;
        const res = await fetch(`${API_URL}/customer-behavior/${customerId}${queryParam}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.log("Customer behavior error:", error);
      }
    }

    load();

    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, [customerId, transactionId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (transactions.length === 0) {
    return (
      <div className="transaction-behavior-card">
        <div className="transaction-behavior-loading">
          Loading transaction behavior...
        </div>
      </div>
    );
  }

  // =====================================================
  // TRANSACTION DATA
  // =====================================================

  const currentTransaction = transactions[transactions.length - 1];

  const historical = transactions.slice(0, -1);

  const historicalAverage =
    historical.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0,
    ) / Math.max(historical.length, 1);

  const increase =
    historicalAverage > 0
      ? Number(currentTransaction.amount) / historicalAverage
      : 0;

  const ids = transactions.map((transaction) => transaction.id);

  const amounts = transactions.map((transaction) =>
    Number(transaction.amount || 0),
  );

  // =====================================================
  // RISK COLORS
  // =====================================================

  const colors = transactions.map((transaction) => {
    if (transaction.riskLevel === "Critical") {
      return "#c22e29";
    }

    if (transaction.riskLevel === "High") {
      return "#d35c17";
    }

    if (transaction.riskLevel === "Medium") {
      return "#d38e17";
    }

    return "#35b66b";
  });

  // =====================================================
  // FORMATTING
  // =====================================================

  const formatAmount = (amount: number) => {
    return `৳${Number(amount || 0).toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formattedIncrease = increase > 0 ? increase.toFixed(1) : "0.0";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="transaction-behavior-card">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="transaction-behavior-header">
        <div>
          <h2>Transaction Behavior</h2>

          <p>Realtime customer transaction pattern</p>
        </div>

        <div className="transaction-behavior-live">
          <span></span>
          Live
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="transaction-behavior-content">
        {/* =================================================
            CHART
        ================================================= */}

        <div className="transaction-behavior-chart">
          <Plot
            data={[
              {
                x: ids,
                y: amounts,

                type: "scatter",
                mode: "lines+markers",

                name: "Amount",

                line: {
                  color: "#2e599e",
                  width: 2.5,
                },

                marker: {
                  size: 8,

                  color: colors,

                  line: {
                    width: 1,
                    color: "#071525",
                  },
                },

                hovertemplate:
                  "<b>%{x}</b><br>" + "Amount: ৳%{y:,.2f}" + "<extra></extra>",
              },

              {
                x: ids,

                y: ids.map(() => historicalAverage),

                type: "scatter",
                mode: "lines",

                name: "Average",

                line: {
                  color: "#b85014",
                  width: 2,
                  dash: "dash",
                },

                hovertemplate: "Average: ৳%{y:,.2f}" + "<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,

              height: 330,

              margin: {
                l: 58,
                r: 18,
                t: 15,
                b: 65,
              },

              paper_bgcolor: "rgba(245, 246, 248, 0)",

              plot_bgcolor: "rgba(245, 246, 248, 0)",

              font: {
                family: "Inter, Arial, sans-serif",
                color: "#5e6573",
                size: 10,
              },

              xaxis: {
                showgrid: false,

                zeroline: false,

                tickfont: {
                  color: "#636b79",
                  size: 9,
                },

                tickangle: -25,

                automargin: true,
              },

              yaxis: {
                title: {
                  text: "Amount (BDT)",

                  font: {
                    color: "#5e6573",
                    size: 10,
                  },
                },

                showgrid: true,

                gridcolor: "rgba(102, 110, 125, 0.22)",

                zeroline: false,

                tickfont: {
                  color: "#636b79",
                  size: 9,
                },

                tickformat: ",.0f",

                automargin: true,
              },

              legend: {
                orientation: "h",

                x: 0,

                y: -0.24,

                xanchor: "left",

                yanchor: "top",

                font: {
                  size: 9,
                  color: "#5b626f",
                },

                bgcolor: "rgba(245, 246, 248, 0)",
              },

              hoverlabel: {
                bgcolor: "#ffffff",

                bordercolor: "#dfe1e5",

                font: {
                  color: "#23262b",
                  size: 10,
                },
              },
            }}
            config={{
              displayModeBar: false,

              responsive: true,
            }}
            style={{
              width: "100%",
              height: "330px",
            }}
          />
        </div>

        {/* =================================================
            ACCOUNT RISK SUMMARY
        ================================================= */}

        <div className="account-risk-summary">
          <div className="account-risk-summary-header">
            <div>
              <h3>Account Risk Summary</h3>

              <p>Current transaction compared with normal activity</p>
            </div>

            <span className="risk-summary-icon"><LuActivity aria-hidden="true" /></span>
          </div>

          {/* =================================================
              METRICS
          ================================================= */}

          <div className="account-risk-metrics">
            <div className="account-risk-metric">
              <span>Typical Amount</span>

              <strong>{formatAmount(Math.round(historicalAverage))}</strong>
            </div>

            <div className="account-risk-metric">
              <span>Current Amount</span>

              <strong className="current-amount">
                {formatAmount(currentTransaction.amount)}
              </strong>
            </div>

            <div className="account-risk-metric">
              <span>Increase</span>

              <strong>{formattedIncrease}×</strong>
            </div>

            <div className="account-risk-metric">
              <span>Risk Score</span>

              <strong>
                {currentTransaction.riskScore}
                <small>/100</small>
              </strong>
            </div>

            <div className="account-risk-metric">
              <span>Risk Level</span>

              <strong
                className={`risk-level-${String(
                  currentTransaction.riskLevel,
                ).toLowerCase()}`}
              >
                {currentTransaction.riskLevel}
              </strong>
            </div>
          </div>

          {/* =================================================
              AI INSIGHT
          ================================================= */}

          <div className="account-risk-insight">
            <div className="account-risk-insight-icon"><LuLightbulb aria-hidden="true" /></div>

            <div>
              <span>Insight</span>

              <p>
                This transaction is <strong>{formattedIncrease}×</strong> higher
                than normal activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}