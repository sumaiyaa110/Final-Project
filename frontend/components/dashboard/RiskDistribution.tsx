"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/hooks/useTheme";
import { chartColors } from "@/utils/chartTheme";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

export default function RiskDistribution() {

  const chart = chartColors(useTheme());

  return (
    <div className="risk-chart-card">
      {/* Header */}
      <div className="risk-chart-header">
        <div>
          <h2>Risk Distribution</h2>

          <p>Distribution of monitored entities by risk level.</p>
        </div>
      </div>

      {/* Chart */}
      <div className="risk-chart">
        <Plot
          data={[
            {
              type: "pie",

              labels: ["Low Risk", "Medium Risk", "High Risk"],

              values: [68, 24, 8],

              hole: 0.68,

              sort: false,

              textinfo: "percent",

              textposition: "inside",

              textfont: {
                color: chart.text,
                size: 11,
              },

              marker: {
                line: {
                  color: chart.separator,
                  width: 3,
                },
              },

              hovertemplate:
                "<b>%{label}</b><br>" +
                "%{value}% of entities" +
                "<extra></extra>",
            },
          ]}
          layout={{
            autosize: true,

            height: 245,

            margin: {
              l: 20,
              r: 20,
              t: 10,
              b: 10,
            },

            paper_bgcolor: "rgba(245, 246, 248, 0)",

            plot_bgcolor: "rgba(245, 246, 248, 0)",

            showlegend: true,

            legend: {
              orientation: "h",

              x: 0.5,

              y: -0.05,

              xanchor: "center",

              yanchor: "top",

              font: {
                color: chart.muted,
                size: 9,
              },

              bgcolor: "rgba(245, 246, 248, 0)",
            },

            annotations: [
              {
                text: "<b>423</b>",

                x: 0.5,

                y: 0.52,

                xref: "paper",

                yref: "paper",

                showarrow: false,

                font: {
                  color: chart.text,

                  size: 23,
                },
              },

              {
                text: "Entities",

                x: 0.5,

                y: 0.39,

                xref: "paper",

                yref: "paper",

                showarrow: false,

                font: {
                  color: chart.muted,

                  size: 9,
                },
              },
            ],

            hoverlabel: {
              bgcolor: chart.hoverBg,

              bordercolor: chart.hoverBorder,

              font: {
                color: chart.text,

                size: 10,
              },
            },
          }}
          config={{
            responsive: true,

            displayModeBar: false,

            displaylogo: false,
          }}
          style={{
            width: "100%",
            height: "245px",
          }}
        />
      </div>
    </div>
  );
}
