const API_URL = "http://localhost:8000";

// ================================
// Dashboard Summary
// ================================

export async function getDashboardData() {
  const response = await fetch(`${API_URL}/dashboard`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Dashboard API failed");
  }

  return response.json();
}

// ================================
// High Risk Transactions
// ================================

export async function getHighRiskTransactions() {
  const response = await fetch(`${API_URL}/high-risk`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("High risk API failed");
  }

  return response.json();
}

// ================================
// Devices
// ================================

export async function getDevices() {
  const response = await fetch(`${API_URL}/devices`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Device API failed");
  }

  return response.json();
}

// ================================
// Network Analysis
// ================================

export async function getNetworkData() {
  const response = await fetch(`${API_URL}/network`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Network API failed");
  }

  return response.json();
}

export async function getAgents() {
  const response = await fetch("http://localhost:8000/agents", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Agents API failed");
  }

  return response.json();
}

export async function getAlerts() {
  const response = await fetch("http://localhost:8000/alerts", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Alerts API failed");
  }

  return response.json();
}

export async function getAlertSummary() {
  const response = await fetch("http://localhost:8000/alert-summary", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Alert summary failed");
  }

  return response.json();
}

export async function getTransactions() {
  const response = await fetch(
    `http://localhost:8000/transactions?_=${Date.now()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Transactions API failed");
  }

  return response.json();
}

export async function getCustomerBehavior(customerId: string) {
  const response = await fetch(
    `http://localhost:8000/customer-behavior/${customerId}?t=${Date.now()}`,

    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Customer behavior API failed");
  }

  return response.json();
}

export async function getTransactionSummary() {
  const response = await fetch(
    `http://localhost:8000/transaction-summary?t=${Date.now()}`,

    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Transaction summary API failed");
  }

  return response.json();
}

export async function getReports() {
  const response = await fetch("http://localhost:8000/reports", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Reports API failed");
  }

  return response.json();
}

export async function getCustomers() {
  const response = await fetch("http://localhost:8000/customers");

  return response.json();
}

// ================================
// Resolve Fraud Alert
// ================================

export async function resolveAlert(alertId: string) {
  const response = await fetch(
    `http://localhost:8000/alerts/${alertId}/resolve`,
    {
      method: "POST",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Resolve alert API failed");
  }

  return response.json();
}

export async function getInvestigations(){

    const response = await fetch(

        "http://localhost:8000/investigations",

        {
            cache:"no-store"
        }

    );


    return await response.json();

}