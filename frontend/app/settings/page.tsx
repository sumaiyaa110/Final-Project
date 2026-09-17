"use client";

import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <AdminLayout>
      <div className="settings-page">
        {/* Header */}
        <div className="settings-page-header">
          <div>
            <h1>Settings</h1>
            <p>Manage administrator, security and monitoring preferences.</p>
          </div>

          <button
            type="button"
            className="settings-save-button"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>

        {saved && (
          <div className="settings-success">✓ Settings saved successfully.</div>
        )}

        {/* Profile */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Administrator Profile</h2>
              <p>Information about the current administrator account.</p>
            </div>
          </div>

          <div className="settings-profile">
            <div className="settings-avatar">A</div>

            <div className="settings-profile-info">
              <strong>Administrator</strong>
              <span>admin@anomalyx.com</span>
              <small>System Administrator</small>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-field">
              <label>NAME</label>
              <input type="text" defaultValue="Administrator" />
            </div>

            <div className="settings-field">
              <label>EMAIL</label>
              <input type="email" defaultValue="admin@anomalyx.com" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Security</h2>
              <p>Manage administrator login and session settings.</p>
            </div>
          </div>

          <div className="settings-security-row">
            <div>
              <strong>Password</strong>
              <span>Last changed recently</span>
            </div>

            <button type="button" className="settings-secondary-button">
              Change Password
            </button>
          </div>

          <div className="settings-security-row">
            <div>
              <strong>Session Timeout</strong>
              <span>Automatically sign out after inactivity.</span>
            </div>

            <select defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Notifications</h2>
              <p>Choose which fraud monitoring notifications you receive.</p>
            </div>
          </div>

          <div className="settings-option-row">
            <div>
              <strong>Email Alerts</strong>
              <span>Receive important monitoring alerts by email.</span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${emailAlerts ? "active" : ""}`}
              onClick={() => setEmailAlerts(!emailAlerts)}
              aria-label="Toggle email alerts"
            >
              <span />
            </button>
          </div>

          <div className="settings-option-row">
            <div>
              <strong>Critical Fraud Alerts</strong>
              <span>
                Receive immediate notifications for critical risk events.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${criticalAlerts ? "active" : ""}`}
              onClick={() => setCriticalAlerts(!criticalAlerts)}
              aria-label="Toggle critical alerts"
            >
              <span />
            </button>
          </div>

          <div className="settings-option-row">
            <div>
              <strong>Daily Summary</strong>
              <span>Receive a daily summary of fraud activity.</span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${dailySummary ? "active" : ""}`}
              onClick={() => setDailySummary(!dailySummary)}
              aria-label="Toggle daily summary"
            >
              <span />
            </button>
          </div>
        </div>

        {/* System */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>System Preferences</h2>
              <p>Configure how the monitoring dashboard behaves.</p>
            </div>
          </div>

          <div className="settings-option-row">
            <div>
              <strong>Automatic Dashboard Refresh</strong>
              <span>Automatically refresh monitoring data.</span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${autoRefresh ? "active" : ""}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              aria-label="Toggle automatic refresh"
            >
              <span />
            </button>
          </div>

          <div className="settings-security-row">
            <div>
              <strong>Refresh Interval</strong>
              <span>How often monitoring data should refresh.</span>
            </div>

            <select defaultValue="30">
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>

          <div className="settings-security-row">
            <div>
              <strong>Risk Detection Mode</strong>
              <span>Current fraud detection configuration.</span>
            </div>

            <span className="settings-system-status">● Active</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
