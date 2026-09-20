"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { getCustomerBehavior } from "@/services/api";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

export default function TransactionBehaviorChart() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const customerId = "CUSTOMER-1";

  // =====================================================
  // REALTIME CUSTOMER BEHAVIOR
  // =====================================================

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomerBehavior(customerId);

        setTransactions(data);
      } catch (error) {
        console.log("Customer behavior error:", error);
      }
    }

    load();

    const interval = setInterval(load, 3000);

    return () => clearInterval(interval);
  }, []);

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
      return "#ef4444";
    }

    if (transaction.riskLevel === "High") {
      return "#f97316";
    }

    if (transaction.riskLevel === "Medium") {
      return "#eab308";
    }

    return "#22c55e";
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
                  color: "#2385c8",
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
                  color: "#f59e0b",
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

              paper_bgcolor: "rgba(0,0,0,0)",

              plot_bgcolor: "rgba(0,0,0,0)",

              font: {
                family: "Inter, Arial, sans-serif",
                color: "#7188a3",
                size: 10,
              },

              xaxis: {
                showgrid: false,

                zeroline: false,

                tickfont: {
                  color: "#647b96",
                  size: 9,
                },

                tickangle: -25,

                automargin: true,
              },

              yaxis: {
                title: {
                  text: "Amount (BDT)",

                  font: {
                    color: "#7188a3",
                    size: 10,
                  },
                },

                showgrid: true,

                gridcolor: "rgba(93,116,142,0.22)",

                zeroline: false,

                tickfont: {
                  color: "#647b96",
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
                  color: "#7890aa",
                },

                bgcolor: "rgba(0,0,0,0)",
              },

              hoverlabel: {
                bgcolor: "#102238",

                bordercolor: "#2b4764",

                font: {
                  color: "#e5edf7",
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

            <span className="risk-summary-icon">◉</span>
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
            <div className="account-risk-insight-icon">💡</div>

            <div>
              <span>AI Insight</span>

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