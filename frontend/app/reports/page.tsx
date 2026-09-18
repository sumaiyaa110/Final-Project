"use client";

import { useEffect, useMemo, useState } from "react";

import AdminLayout from "@/components/layout/AdminLayout";

import { getReports, getDashboardData } from "@/services/api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// =====================================================
// TYPES
// =====================================================

type Report = {
  id: string;

  name: string;

  type: "Fraud" | "Transaction" | "Risk" | "Investigation";

  period: string;

  records: string;

  generated: string;

  status: "Ready" | "Generating";
};

type DashboardData = {
  total_transactions: number;

  fraud_alerts: number;

  high_risk_entities: number;

  fraud_rate: number;
};

// =====================================================
// REPORT PAGE
// =====================================================

export default function ReportsPage() {
  const [reportList, setReportList] = useState<Report[]>([]);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("All Report Types");

  const [dateFilter, setDateFilter] = useState("All Dates");

  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // =====================================================
  // REAL-TIME DATA
  // =====================================================

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports();

        setReportList(data);
      } catch (error) {
        console.log("Reports API Error:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadDashboard() {
      try {
        const data = await getDashboardData();

        setDashboard(data);
      } catch (error) {
        console.log("Dashboard API Error:", error);
      }
    }

    loadReports();

    loadDashboard();

    const interval = setInterval(() => {
      loadReports();

      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredReports = useMemo(() => {
    return reportList.filter((report) => {
      const value = search.toLowerCase().trim();

      const matchesSearch =
        value === "" ||
        report.id.toLowerCase().includes(value) ||
        report.name.toLowerCase().includes(value);

      const matchesType =
        typeFilter === "All Report Types" || report.type === typeFilter;

      const matchesDate =
        dateFilter === "All Dates" || report.period.includes("Real Time");

      return matchesSearch && matchesType && matchesDate;
    });
  }, [reportList, search, typeFilter, dateFilter]);

  // =====================================================
  // RESET
  // =====================================================

  function resetFilters() {
    setSearch("");

    setTypeFilter("All Report Types");

    setDateFilter("All Dates");
  }

  // =====================================================
  // NUMBER FORMAT
  // =====================================================

  function formatNumber(value: number) {
    return value.toLocaleString("en-BD");
  }

  // =====================================================
  // GENERATE OVERALL REPORT
  // =====================================================

  function generateOverallReport() {
    if (!dashboard) {
      alert("Dashboard data is still loading. Please try again.");

      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const pageHeight = doc.internal.pageSize.getHeight();

    // -------------------------------------------------
    // COLORS
    // -------------------------------------------------

    const navy = [7, 18, 35];

    const blue = [54, 92, 219];

    const red = [244, 63, 94];

    const yellow = [245, 158, 11];

    const green = [16, 185, 129];

    const darkText = [15, 23, 42];

    const secondaryText = [91, 112, 140];

    const background = [241, 245, 249];

    const white = [255, 255, 255];

    const border = [220, 226, 235];

    // -------------------------------------------------
    // PAGE BACKGROUND
    // -------------------------------------------------

    function drawBackground() {
      doc.setFillColor(background[0], background[1], background[2]);

      doc.rect(0, 0, pageWidth, pageHeight, "F");
    }

    // -------------------------------------------------
    // HEADER
    // -------------------------------------------------

    function drawHeader(rightTitle: string, rightDate: string) {
      doc.setFillColor(navy[0], navy[1], navy[2]);

      doc.rect(0, 0, pageWidth, 48, "F");

      // Logo

      doc.setFillColor(blue[0], blue[1], blue[2]);

      doc.roundedRect(15, 13, 14, 14, 3, 3, "F");

      doc.setTextColor(255, 255, 255);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(15);

      doc.text("A", 22, 23);

      // Brand

      doc.setFontSize(15);

      doc.text("AnomalyX", 35, 20);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(6.5);

      doc.setTextColor(155, 174, 202);

      doc.text("FINANCIAL RISK MONITORING PLATFORM", 35, 27);

      // Right side

      doc.setTextColor(255, 255, 255);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(8);

      doc.text(rightTitle, pageWidth - 15, 18, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");

      doc.setFontSize(7);

      doc.setTextColor(180, 195, 216);

      doc.text(rightDate, pageWidth - 15, 26, {
        align: "right",
      });
    }

    // =================================================
    // PAGE 1
    // =================================================

    drawBackground();

    drawHeader(
      "SYSTEM MONITORING REPORT",
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );

    // -------------------------------------------------
    // TITLE
    // -------------------------------------------------

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(18);

    doc.text("Overall Monitoring Overview", 15, 65);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(8);

    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);

    doc.text(
      "Current snapshot of the AnomalyX financial monitoring system",
      15,
      73,
    );

    doc.text(`Generated ${new Date().toLocaleString()}`, 15, 80);

    // -------------------------------------------------
    // SYSTEM OVERVIEW
    // -------------------------------------------------

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("SYSTEM OVERVIEW", 15, 96);

    const cardGap = 5;

    const cardWidth = (pageWidth - 30 - cardGap) / 2;

    const cardHeight = 32;

    const cardY1 = 102;

    const cardY2 = 139;

    const cards = [
      {
        x: 15,
        y: cardY1,
        title: "TOTAL TRANSACTIONS",
        value: formatNumber(dashboard.total_transactions),
        description: "Current database records",
        color: blue,
      },

      {
        x: 15 + cardWidth + cardGap,
        y: cardY1,
        title: "FRAUD ALERTS",
        value: formatNumber(dashboard.fraud_alerts),
        description: "High-risk transactions",
        color: red,
      },

      {
        x: 15,
        y: cardY2,
        title: "HIGH-RISK ENTITIES",
        value: formatNumber(dashboard.high_risk_entities),
        description: "Detected risk groups",
        color: yellow,
      },

      {
        x: 15 + cardWidth + cardGap,
        y: cardY2,
        title: "FRAUD RATE",
        value: `${dashboard.fraud_rate}%`,
        description: "Current fraud ratio",
        color: green,
      },
    ];

    cards.forEach((card) => {
      doc.setFillColor(white[0], white[1], white[2]);

      doc.roundedRect(card.x, card.y, cardWidth, cardHeight, 3, 3, "F");

      doc.setFillColor(card.color[0], card.color[1], card.color[2]);

      doc.roundedRect(card.x, card.y, cardWidth, 3, 2, 2, "F");

      doc.setFont("helvetica", "bold");

      doc.setFontSize(6.5);

      doc.setTextColor(78, 103, 133);

      doc.text(card.title, card.x + 7, card.y + 11);

      doc.setFontSize(14);

      doc.setTextColor(darkText[0], darkText[1], darkText[2]);

      doc.text(card.value, card.x + 7, card.y + 22);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(6);

      doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);

      doc.text(card.description, card.x + cardWidth - 7, card.y + 22, {
        align: "right",
      });
    });

    // -------------------------------------------------
    // RISK SUMMARY
    // -------------------------------------------------

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("RISK MONITORING SUMMARY", 15, 183);

    const riskY = 190;

    doc.setFillColor(white[0], white[1], white[2]);

    doc.roundedRect(15, riskY, pageWidth - 30, 40, 3, 3, "F");

    doc.setDrawColor(border[0], border[1], border[2]);

    doc.roundedRect(15, riskY, pageWidth - 30, 40, 3, 3, "S");

    doc.setFillColor(255, 241, 242);

    doc.roundedRect(22, riskY + 8, 29, 24, 3, 3, "F");

    doc.setFont("helvetica", "bold");

    doc.setFontSize(14);

    doc.setTextColor(red[0], red[1], red[2]);

    doc.text(formatNumber(dashboard.fraud_alerts), 36.5, riskY + 20, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");

    doc.setFontSize(5.5);

    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);

    doc.text("ALERTS", 36.5, riskY + 27, {
      align: "center",
    });

    const riskText =
      `The AnomalyX monitoring system currently contains ` +
      `${formatNumber(dashboard.total_transactions)} transaction records. ` +
      `${formatNumber(dashboard.fraud_alerts)} transactions are currently ` +
      `classified as high-risk or critical, representing a current fraud rate of ` +
      `${dashboard.fraud_rate}%.`;

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7.5);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    const riskLines = doc.splitTextToSize(riskText, pageWidth - 78);

    doc.text(riskLines, 60, riskY + 16);

    // =================================================
    // PAGE 2
    // =================================================

    doc.addPage();

    drawBackground();

    drawHeader(
      "OVERALL MONITORING OVERVIEW",
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );

    // -------------------------------------------------
    // AVAILABLE REPORTS
    // -------------------------------------------------

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(15);

    doc.text("Available Reports", 15, 65);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7.5);

    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);

    doc.text(
      "Reports currently available from the AnomalyX monitoring backend.",
      15,
      73,
    );

    autoTable(doc, {
      startY: 82,

      margin: {
        left: 15,
        right: 15,
      },

      head: [
        ["REPORT ID", "REPORT NAME", "TYPE", "RECORDS", "PERIOD", "STATUS"],
      ],

      body: reportList.map((report) => [
        report.id,
        report.name,
        report.type,
        report.records,
        report.period,
        report.status,
      ]),

      theme: "grid",

      styles: {
        font: "helvetica",

        fontSize: 7,

        cellPadding: 5,

        textColor: darkText,

        lineColor: border,

        lineWidth: 0.2,

        fillColor: white,
      },

      headStyles: {
        fillColor: navy,

        textColor: white,

        fontStyle: "bold",

        fontSize: 6.5,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      columnStyles: {
        0: {
          fontStyle: "bold",

          textColor: blue,
        },

        2: {
          halign: "center",
        },

        3: {
          halign: "center",
        },

        5: {
          halign: "center",
        },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 130;

    // -------------------------------------------------
    // CURRENT SNAPSHOT
    // -------------------------------------------------

    const snapshotTitleY = finalY + 25;

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("CURRENT SYSTEM SNAPSHOT", 15, snapshotTitleY);

    const snapshotY = snapshotTitleY + 8;

    doc.setFillColor(white[0], white[1], white[2]);

    doc.roundedRect(15, snapshotY, pageWidth - 30, 50, 3, 3, "F");

    doc.setDrawColor(border[0], border[1], border[2]);

    doc.roundedRect(15, snapshotY, pageWidth - 30, 50, 3, 3, "S");

    const snapshotRows = [
      ["Transactions Monitored", formatNumber(dashboard.total_transactions)],

      ["Fraud Alerts", formatNumber(dashboard.fraud_alerts)],

      ["High-Risk Entities", formatNumber(dashboard.high_risk_entities)],

      ["Current Fraud Rate", `${dashboard.fraud_rate}%`],
    ];

    snapshotRows.forEach((row, index) => {
      const y = snapshotY + 12 + index * 9;

      doc.setFont("helvetica", "normal");

      doc.setFontSize(7);

      doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);

      doc.text(row[0], 22, y);

      doc.setFont("helvetica", "bold");

      doc.setTextColor(darkText[0], darkText[1], darkText[2]);

      doc.text(row[1], pageWidth - 22, y, {
        align: "right",
      });
    });

    // -------------------------------------------------
    // SYSTEM NOTE
    // -------------------------------------------------

    const noteTitleY = snapshotY + 70;

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("SYSTEM NOTE", 15, noteTitleY);

    const noteY = noteTitleY + 8;

    doc.setFillColor(248, 250, 252);

    doc.roundedRect(15, noteY, pageWidth - 30, 28, 3, 3, "F");

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7);

    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);

    const noteText =
      "This document represents the current monitoring snapshot generated from the AnomalyX backend. " +
      "Values may change as new transactions are processed by the monitoring system.";

    const noteLines = doc.splitTextToSize(noteText, pageWidth - 48);

    doc.text(noteLines, 22, noteY + 11);

    // -------------------------------------------------
    // FOOTER
    // -------------------------------------------------

    doc.setFont("helvetica", "normal");

    doc.setFontSize(6);

    doc.setTextColor(120, 140, 165);

    doc.text(
      "AnomalyX Financial Risk Monitoring Platform",
      15,
      pageHeight - 10,
    );

    doc.text("Confidential System Report", pageWidth - 15, pageHeight - 10, {
      align: "right",
    });

    // -------------------------------------------------
    // DOWNLOAD
    // -------------------------------------------------

    const date = new Date().toISOString().split("T")[0];

    doc.save(`AnomalyX-Overall-Monitoring-Overview-${date}.pdf`);
  }

  // =====================================================
  // INDIVIDUAL REPORT PDF
  // =====================================================

  function exportReport(report: Report) {
    if (!dashboard) {
      alert("Dashboard data is still loading. Please try again.");

      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const pageHeight = doc.internal.pageSize.getHeight();

    // -------------------------------------------------
    // COLORS
    // -------------------------------------------------

    const navy = [7, 18, 35];

    const blue = [54, 92, 219];

    const red = [244, 63, 94];

    const yellow = [245, 158, 11];

    const green = [16, 185, 129];

    const background = [241, 245, 249];

    const white = [255, 255, 255];

    const darkText = [15, 23, 42];

    const secondary = [91, 112, 140];

    const border = [215, 223, 233];

    // =================================================
    // BACKGROUND
    // =================================================

    doc.setFillColor(background[0], background[1], background[2]);

    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // =================================================
    // HEADER
    // =================================================

    doc.setFillColor(navy[0], navy[1], navy[2]);

    doc.rect(0, 0, pageWidth, 48, "F");

    // Logo

    doc.setFillColor(blue[0], blue[1], blue[2]);

    doc.roundedRect(15, 13, 14, 14, 3, 3, "F");

    doc.setTextColor(255, 255, 255);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(15);

    doc.text("A", 22, 23);

    // Brand

    doc.setFontSize(15);

    doc.text("AnomalyX", 35, 20);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(6.5);

    doc.setTextColor(155, 174, 202);

    doc.text("FINANCIAL RISK MONITORING PLATFORM", 35, 27);

    // Header right

    doc.setTextColor(255, 255, 255);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(8);

    doc.text(`${report.type.toUpperCase()} REPORT`, pageWidth - 15, 18, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7);

    doc.setTextColor(180, 195, 216);

    doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      pageWidth - 15,
      26,
      {
        align: "right",
      },
    );

    // =================================================
    // REPORT TITLE
    // =================================================

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(17);

    doc.text(report.name, 15, 65);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(8);

    doc.setTextColor(secondary[0], secondary[1], secondary[2]);

    doc.text(`Report ID: ${report.id}`, 15, 73);

    // =================================================
    // REPORT INFORMATION CARD
    // =================================================

    const infoY = 84;

    const infoHeight = 88;

    doc.setFillColor(white[0], white[1], white[2]);

    doc.roundedRect(15, infoY, pageWidth - 30, infoHeight, 4, 4, "F");

    doc.setDrawColor(border[0], border[1], border[2]);

    doc.roundedRect(15, infoY, pageWidth - 30, infoHeight, 4, 4, "S");

    // Card heading

    doc.setFont("helvetica", "bold");

    doc.setFontSize(9);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("REPORT INFORMATION", 23, infoY + 13);

    // Small blue line

    doc.setFillColor(blue[0], blue[1], blue[2]);

    doc.roundedRect(23, infoY + 17, 24, 1.5, 1, 1, "F");

    const information = [
      ["Report Type", report.type],

      ["Reporting Period", report.period],

      ["Total Records", report.records],

      ["Generated", report.generated],

      ["Status", report.status],
    ];

    information.forEach((row, index) => {
      const y = infoY + 29 + index * 11;

      doc.setFont("helvetica", "normal");

      doc.setFontSize(7);

      doc.setTextColor(secondary[0], secondary[1], secondary[2]);

      doc.text(row[0], 23, y);

      doc.setFont("helvetica", "bold");

      doc.setTextColor(darkText[0], darkText[1], darkText[2]);

      doc.text(row[1], pageWidth - 23, y, {
        align: "right",
      });

      if (index < information.length - 1) {
        doc.setDrawColor(229, 234, 241);

        doc.line(23, y + 5, pageWidth - 23, y + 5);
      }
    });

    // =================================================
    // MONITORING METRICS
    // =================================================

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("MONITORING SNAPSHOT", 15, 188);

    const metricY = 195;

    const metricGap = 4;

    const metricWidth = (pageWidth - 30 - metricGap * 3) / 4;

    const metricHeight = 27;

    const metrics = [
      {
        title: "TRANSACTIONS",
        value: formatNumber(dashboard.total_transactions),
        color: blue,
      },

      {
        title: "FRAUD ALERTS",
        value: formatNumber(dashboard.fraud_alerts),
        color: red,
      },

      {
        title: "HIGH-RISK",
        value: formatNumber(dashboard.high_risk_entities),
        color: yellow,
      },

      {
        title: "FRAUD RATE",
        value: `${dashboard.fraud_rate}%`,
        color: green,
      },
    ];

    metrics.forEach((metric, index) => {
      const x = 15 + index * (metricWidth + metricGap);

      doc.setFillColor(white[0], white[1], white[2]);

      doc.roundedRect(x, metricY, metricWidth, metricHeight, 3, 3, "F");

      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);

      doc.roundedRect(x, metricY, metricWidth, 2.5, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");

      doc.setFontSize(5.5);

      doc.setTextColor(secondary[0], secondary[1], secondary[2]);

      doc.text(metric.title, x + 5, metricY + 10);

      doc.setFontSize(10);

      doc.setTextColor(darkText[0], darkText[1], darkText[2]);

      doc.text(metric.value, x + 5, metricY + 20);
    });

    // =================================================
    // SYSTEM NOTE
    // =================================================

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text("SYSTEM NOTE", 15, 238);

    doc.setFillColor(white[0], white[1], white[2]);

    doc.roundedRect(15, 245, pageWidth - 30, 27, 3, 3, "F");

    doc.setDrawColor(border[0], border[1], border[2]);

    doc.roundedRect(15, 245, pageWidth - 30, 27, 3, 3, "S");

    // Green indicator

    doc.setFillColor(16, 185, 129);

    doc.circle(24, 258.5, 2, "F");

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7);

    doc.setTextColor(secondary[0], secondary[1], secondary[2]);

    const systemNote =
      "This report represents the latest monitoring snapshot available from the AnomalyX backend. " +
      "Values may change as new transactions are processed by the monitoring system.";

    const noteLines = doc.splitTextToSize(systemNote, pageWidth - 52);

    doc.text(noteLines, 31, 257);

    // =================================================
    // FOOTER
    // =================================================

    doc.setFont("helvetica", "normal");

    doc.setFontSize(6);

    doc.setTextColor(120, 140, 165);

    doc.text(
      "AnomalyX Financial Risk Monitoring Platform",
      15,
      pageHeight - 10,
    );

    doc.text("Confidential System Report", pageWidth - 15, pageHeight - 10, {
      align: "right",
    });

    // =================================================
    // DOWNLOAD
    // =================================================

    const date = new Date().toISOString().split("T")[0];

    doc.save(`AnomalyX-${report.id}-${date}.pdf`);
  }

  // =====================================================
  // VIEW REPORT
  // =====================================================

  function viewReport(report: Report) {
    setSelectedReport(report);
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <AdminLayout>
      <div className="reports-page">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="reports-page-header">
          <div>
            <h1>Reports</h1>

            <p>
              Generate and review fraud monitoring and investigation reports.
            </p>
          </div>

          <button
            className="reports-generate-button"
            onClick={generateOverallReport}
          >
            + Generate Report
          </button>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="reports-summary-grid">
          <div className="reports-summary-card">
            <span>Total Reports</span>

            <strong>{reportList.length}</strong>
          </div>

          <div className="reports-summary-card">
            <span>Fraud Reports</span>

            <strong>
              {reportList.filter((r) => r.type === "Fraud").length}
            </strong>
          </div>

          <div className="reports-summary-card">
            <span>Risk Reports</span>

            <strong>
              {reportList.filter((r) => r.type === "Risk").length}
            </strong>
          </div>

          <div className="reports-summary-card">
            <span>Investigation Reports</span>

            <strong>
              {reportList.filter((r) => r.type === "Investigation").length}
            </strong>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="reports-filter-card">
          <div className="reports-search">
            <span>⌕</span>

            <input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All Report Types</option>

            <option>Fraud</option>

            <option>Transaction</option>

            <option>Risk</option>

            <option>Investigation</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option>All Dates</option>

            <option>Last 7 Days</option>

            <option>Last 30 Days</option>
          </select>

          <button className="reports-reset-button" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {/* =================================================
            REPORT TABLE
        ================================================= */}

        <div className="reports-table-card">
          <div className="reports-table-header">
            <div>
              <h2>Available Reports</h2>

              <p>Previously generated monitoring reports.</p>
            </div>
          </div>

          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>REPORT ID</th>

                  <th>REPORT NAME</th>

                  <th>TYPE</th>

                  <th>PERIOD</th>

                  <th>RECORDS</th>

                  <th>GENERATED</th>

                  <th>STATUS</th>

                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="reports-empty">
                      Loading reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="reports-empty">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td className="report-id">{report.id}</td>

                      <td className="report-name">{report.name}</td>

                      <td>
                        <span
                          className={`report-type ${report.type.toLowerCase()}`}
                        >
                          {report.type}
                        </span>
                      </td>

                      <td>{report.period}</td>

                      <td>{report.records}</td>

                      <td>{report.generated}</td>

                      <td>
                        <span
                          className={`report-status ${report.status.toLowerCase()}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td>
                        <div className="report-action-buttons">
                          <button
                            className="report-view-button"
                            onClick={() => viewReport(report)}
                          >
                            View
                          </button>

                          <button
                            className="report-download-button"
                            onClick={() => exportReport(report)}
                          >
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="reports-pagination">
            <span>
              Showing {filteredReports.length} of {reportList.length} reports
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          VIEW REPORT MODAL
      ===================================================== */}

      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}

            <div className="report-modal-header">
              <div>
                <h2>{selectedReport.name}</h2>

                <p>Report ID: {selectedReport.id}</p>
              </div>

              <button
                className="report-modal-close"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="report-modal-body">
              <div className="report-detail-row">
                <span>Report Type</span>

                <strong>{selectedReport.type}</strong>
              </div>

              <div className="report-detail-row">
                <span>Reporting Period</span>

                <strong>{selectedReport.period}</strong>
              </div>

              <div className="report-detail-row">
                <span>Total Records</span>

                <strong>{selectedReport.records}</strong>
              </div>

              <div className="report-detail-row">
                <span>Generated</span>

                <strong>{selectedReport.generated}</strong>
              </div>

              <div className="report-detail-row">
                <span>Status</span>

                <strong className="report-ready-text">
                  {selectedReport.status}
                </strong>
              </div>

              <div className="report-info-box">
                <span className="report-info-icon">✓</span>

                <span>
                  This report represents the latest monitoring snapshot
                  available from the AnomalyX backend.
                </span>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="report-modal-footer">
              <button
                type="button"
                className="report-modal-secondary"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="report-modal-primary"
                onClick={() => exportReport(selectedReport)}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}