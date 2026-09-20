"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import AdminLayout from "@/components/layout/AdminLayout";
import { getNetworkData } from "@/services/api";


const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  },
);


type NetworkNode = {
  id: string;
  label: string;
  type: string;
};


type NetworkEdge = {
  source: string;
  target: string;
  amount: number;
  transaction_count: number;
};


type SuspiciousNetwork = {
  id: string;
  entity_id: string;
  entities: number;
  connections: number;
  risk: string;
  status: string;
};


type NetworkData = {
  summary: {
    total_entities: number;
    connections: number;
    shared_devices: number;
    suspicious_networks: number;
  };

  nodes: NetworkNode[];
  edges: NetworkEdge[];

  suspicious_network_list: SuspiciousNetwork[];
};


type PositionedNode = NetworkNode & {
  x: number;
  y: number;
};


export default function NetworkAnalysisPage() {

  const [networkData, setNetworkData] =
    useState<NetworkData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD NETWORK DATA
  // =========================================================

  useEffect(() => {

    let mounted = true;


    async function loadNetwork() {

      try {

        const data =
          await getNetworkData();


        if (!mounted) {
          return;
        }


        setNetworkData(data);

        setError("");

      } catch (err) {

        console.error(
          "Network API Error:",
          err,
        );


        if (mounted) {

          setError(
            "Unable to load network data.",
          );

        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    // Initial request
    loadNetwork();


    // Refresh every 5 seconds
    const interval =
      window.setInterval(
        loadNetwork,
        5000,
      );


    return () => {

      mounted = false;

      window.clearInterval(
        interval,
      );

    };

  }, []);


  // =========================================================
  // CREATE GRAPH POSITIONS
  // =========================================================

  const positionedNodes =
    useMemo<PositionedNode[]>(() => {

      if (!networkData) {
        return [];
      }


      const nodes =
        networkData.nodes;


      if (nodes.length === 0) {
        return [];
      }


      return nodes.map(
        (node, index) => {

          const angle =
            (2 * Math.PI * index) /
            nodes.length;


          const radius =
            node.type.toLowerCase() ===
            "customer"
              ? 4
              : node.type.toLowerCase() ===
                  "device"
                ? 2.7
                : 3.4;


          return {

            ...node,

            x:
              Math.cos(angle) *
              radius,

            y:
              Math.sin(angle) *
              radius,

          };

        },
      );

    }, [networkData]);


  // =========================================================
  // NODE LOOKUP
  // =========================================================

  const nodeMap =
    useMemo(() => {

      return Object.fromEntries(

        positionedNodes.map(
          (node) => [
            node.id,
            node,
          ],
        ),

      );

    }, [positionedNodes]);


  // =========================================================
  // EDGE COORDINATES
  // =========================================================

  const edgeX: number[] = [];

  const edgeY: number[] = [];


  networkData?.edges.forEach(
    (edge) => {

      const from =
        nodeMap[edge.source];

      const to =
        nodeMap[edge.target];


      if (!from || !to) {
        return;
      }


      edgeX.push(
        from.x,
        to.x,
        NaN,
      );


      edgeY.push(
        from.y,
        to.y,
        NaN,
      );

    },
  );


  // =========================================================
  // NODE GROUPS
  // =========================================================

  const customerNodes =
    positionedNodes.filter(
      (node) =>
        node.type.toLowerCase() ===
        "customer",
    );


  const deviceNodes =
    positionedNodes.filter(
      (node) =>
        node.type.toLowerCase() ===
        "device",
    );


  const agentNodes =
    positionedNodes.filter(
      (node) =>
        node.type.toLowerCase() ===
        "agent",
    );


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <AdminLayout>

      <div className="network-page">


        {/* HEADER */}

        <div className="network-page-header">

          <div>

            <h1>
              Network Analysis
            </h1>

            <p>
              Analyze relationships between
              customers, devices and
              transactions.
            </p>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="network-summary-grid">


          <div className="network-summary-card">

            <span>
              Total Entities
            </span>

            <strong>

              {loading
                ? "..."
                : networkData?.summary
                    .total_entities
                    .toLocaleString() ??
                  "0"}

            </strong>

          </div>


          <div className="network-summary-card">

            <span>
              Connections
            </span>

            <strong>

              {loading
                ? "..."
                : networkData?.summary
                    .connections
                    .toLocaleString() ??
                  "0"}

            </strong>

          </div>


          <div className="network-summary-card">

            <span>
              Shared Devices
            </span>

            <strong>

              {loading
                ? "..."
                : networkData?.summary
                    .shared_devices
                    .toLocaleString() ??
                  "0"}

            </strong>

          </div>


          <div className="network-summary-card">

            <span>
              Suspicious Networks
            </span>

            <strong>

              {loading
                ? "..."
                : networkData?.summary
                    .suspicious_networks
                    .toLocaleString() ??
                  "0"}

            </strong>

          </div>

        </div>


        {error && (

          <div className="devices-empty">
            {error}
          </div>

        )}


        {/* =================================================
            NETWORK GRAPH
        ================================================= */}

        <div className="network-graph-card">


          <div className="network-card-header">

            <div>

              <h2>
                Entity Relationship Network
              </h2>

              <p>
                Connected entities detected
                by the system.
              </p>

            </div>


            <div className="network-legend">

              <span>

                <i className="network-dot customer" />

                Customer

              </span>


              <span>

                <i className="network-dot device" />

                Device

              </span>

            </div>

          </div>


          <div className="network-graph">


            {loading ? (

              <div className="devices-empty">
                Loading network...
              </div>

            ) : (

              <Plot

                data={[

                  // EDGES
                  {
                    x: edgeX,

                    y: edgeY,

                    type: "scatter",

                    mode: "lines",

                    line: {
                      width: 1.5,
                      color: "#30445d",
                    },

                    hoverinfo: "none",
                  },


                  // CUSTOMERS
                  {
                    x: customerNodes.map(
                      (node) => node.x,
                    ),

                    y: customerNodes.map(
                      (node) => node.y,
                    ),

                    type: "scatter",

                    mode: "markers+text",

                    text:
                      customerNodes.map(
                        (node) =>
                          node.label,
                      ),

                    textposition:
                      "bottom center",

                    textfont: {
                      size: 9,
                      color: "#cbd5e1",
                    },

                    marker: {
                      size: 18,
                      color: "#3b82f6",

                      line: {
                        width: 2,
                        color: "#8db8ff",
                      },
                    },

                    name: "Customer",

                    hovertemplate:
                      "<b>%{text}</b><br>Type: Customer<extra></extra>",
                  },


                  // DEVICES
                  {
                    x: deviceNodes.map(
                      (node) => node.x,
                    ),

                    y: deviceNodes.map(
                      (node) => node.y,
                    ),

                    type: "scatter",

                    mode: "markers+text",

                    text:
                      deviceNodes.map(
                        (node) =>
                          node.label,
                      ),

                    textposition:
                      "top center",

                    textfont: {
                      size: 9,
                      color: "#cbd5e1",
                    },

                    marker: {
                      size: 22,

                      color: "#a855f7",

                      symbol: "diamond",

                      line: {
                        width: 2,
                        color: "#d8a8ff",
                      },
                    },

                    name: "Device",

                    hovertemplate:
                      "<b>%{text}</b><br>Type: Device<extra></extra>",
                  },


                  // AGENTS
                  {
                    x: agentNodes.map(
                      (node) => node.x,
                    ),

                    y: agentNodes.map(
                      (node) => node.y,
                    ),

                    type: "scatter",

                    mode: "markers+text",

                    text:
                      agentNodes.map(
                        (node) =>
                          node.label,
                      ),

                    textposition:
                      "top center",

                    textfont: {
                      size: 9,
                      color: "#cbd5e1",
                    },

                    marker: {
                      size: 18,

                      color: "#f59e0b",

                      symbol: "square",

                      line: {
                        width: 2,
                        color: "#fcd34d",
                      },
                    },

                    name: "Agent",

                    hovertemplate:
                      "<b>%{text}</b><br>Type: Agent<extra></extra>",
                  },

                ]}


                layout={{

                  autosize: true,

                  height: 390,

                  margin: {
                    l: 20,
                    r: 20,
                    t: 20,
                    b: 20,
                  },

                  paper_bgcolor:
                    "transparent",

                  plot_bgcolor:
                    "transparent",

                  xaxis: {
                    visible: false,
                    fixedrange: true,
                  },

                  yaxis: {
                    visible: false,
                    fixedrange: true,
                  },

                  showlegend: false,

                  hovermode: "closest",

                }}


                config={{

                  displayModeBar: false,

                  responsive: true,

                }}


                style={{

                  width: "100%",

                  height: "390px",

                }}

              />

            )}

          </div>

        </div>


        {/* =================================================
            SUSPICIOUS NETWORK TABLE
        ================================================= */}

        <div className="network-table-card">


          <div className="network-card-header">

            <div>

              <h2>
                Suspicious Networks
              </h2>

              <p>
                Networks with unusual entity
                relationships.
              </p>

            </div>

          </div>


          <div className="network-table-wrapper">

            <table className="network-table">


              <thead>

                <tr>

                  <th>
                    NETWORK ID
                  </th>

                  <th>
                    ENTITIES
                  </th>

                  <th>
                    CONNECTIONS
                  </th>

                  <th>
                    RISK
                  </th>

                  <th>
                    STATUS
                  </th>

                </tr>

              </thead>


              <tbody>


                {loading ? (

                  <tr>

                    <td colSpan={5}>
                      Loading...
                    </td>

                  </tr>

                ) : networkData
                    ?.suspicious_network_list
                    .length === 0 ? (

                  <tr>

                    <td colSpan={5}>
                      No suspicious networks
                      detected.
                    </td>

                  </tr>

                ) : (

                  networkData?.suspicious_network_list.map(
                    (network) => (

                      <tr key={network.id}>


                        <td className="network-id">

                          {network.id}

                        </td>


                        <td>

                          {network.entities}

                        </td>


                        <td>

                          {network.connections}

                        </td>


                        <td>

                          <span
                            className={`network-risk ${network.risk.toLowerCase()}`}
                          >

                            {network.risk}

                          </span>

                        </td>


                        <td>

                          <span className="network-status">

                            {network.status}

                          </span>

                        </td>


                      </tr>

                    ),
                  )

                )}


              </tbody>

            </table>

          </div>

        </div>


      </div>

    </AdminLayout>

  );

}