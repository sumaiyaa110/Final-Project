"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAgents } from "@/services/api";

export default function AgentDetailsPage() {
  const params = useParams();

  const agentId =
    typeof params?.id === "string" ? decodeURIComponent(params.id) : "";

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agentId) return;

    async function loadAgent() {
      try {
        const agents = await getAgents();
        setAgent(agents.find((a: any) => a.id === agentId) || null);
      } catch (err) {
        console.error("Agent details fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAgent();
    const interval = setInterval(loadAgent, 5000);
    return () => clearInterval(interval);
  }, [agentId]);

  return (
    <AdminLayout>
      <div className="agents-page">
        <div className="agents-page-header">
          <div>
            <p>
              <Link href="/agents">Agents</Link> / {agentId}
            </p>

            <h1>{agent ? agent.name : "Agent Details"}</h1>

            <p>
              {loading
                ? "Loading agent..."
                : agent
                  ? `${agent.role} · ${agent.email}`
                  : `Agent ${agentId} could not be found.`}
            </p>
          </div>
        </div>

        {agent && (
          <div className="agents-summary-grid">
            <div className="agents-summary-card">
              <span>Status</span>
              <strong>{agent.status}</strong>
            </div>

            <div className="agents-summary-card">
              <span>Active Cases</span>
              <strong>{agent.activeCases}</strong>
            </div>

            <div className="agents-summary-card">
              <span>Alerts Handled</span>
              <strong>{agent.alerts}</strong>
            </div>

            <div className="agents-summary-card">
              <span>Location</span>
              <strong>{agent.location || "—"}</strong>
            </div>

            <div className="agents-summary-card">
              <span>Rating</span>
              <strong>{agent.rating ?? "—"}</strong>
            </div>

            <div className="agents-summary-card">
              <span>Last Active</span>
              <strong>{agent.lastActive || "—"}</strong>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
