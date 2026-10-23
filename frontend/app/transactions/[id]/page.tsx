"use client";


import Link from "next/link";

import { 
    useParams 
} from "next/navigation";

import { 
    useEffect, 
    useState 
} from "react";


import AdminLayout from "@/components/layout/AdminLayout";

import TransactionBehaviorChart from "@/components/transactions/TransactionBehaviorChart";





export default function TransactionDetailsPage(){


const params = useParams();


const transactionId = params.id as string;



const [transaction, setTransaction] = useState<any>(null);
const [aiExplanation, setAIExplanation] = useState<any>(null);
const [currentStatus, setCurrentStatus] = useState("");
const [actionStatus, setActionStatus] = useState("");

// =====================================================
// REALTIME TRANSACTION FETCH
// =====================================================

useEffect(() => {
  async function loadTransaction() {
    try {
      const realId = transactionId.replace("TXN-", "");
      const [txRes, expRes] = await Promise.all([
        fetch(`http://localhost:8000/transaction/${realId}`, { cache: "no-store" }),
        fetch(`http://localhost:8000/transaction/${realId}/explanation`, { cache: "no-store" }),
      ]);

      if (txRes.ok) {
        const data = await txRes.json();
        setTransaction(data);
        setCurrentStatus(data.status);
      }

      if (expRes.ok) {
        const expData = await expRes.json();
        setAIExplanation(expData);
      }
    } catch (error) {
      console.log("Transaction detail error:", error);
    }
  }

  loadTransaction();



const interval = setInterval(

loadTransaction,

5000

);



return()=>clearInterval(interval);



},[transactionId]);







// =====================================================
// ACTION HANDLER
// =====================================================


async function handleAction(
  message: string,
  status: string
) {
  setCurrentStatus(status);
  setActionStatus(message);

  try {
    const apiStatusMap: Record<string, string> = {
      "Reviewed": "FALSE_POSITIVE",
      "Safe": "FALSE_POSITIVE",
      "Escalated": "ESCALATED",
      "Blocked": "CONFIRMED_FRAUD"
    };

    const targetStatus = apiStatusMap[status] || status;
    const realId = transactionId.replace("TXN-", "");

    await fetch(`http://localhost:8000/investigation-action/${realId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: targetStatus,
        notes: `Action '${status}' triggered from transaction details view.`,
        investigator: "admin"
      })
    });
  } catch (error) {
    console.error("Failed to persist investigation action:", error);
  }

  setTimeout(() => {
    setActionStatus("");
  }, 3000);
}







if(!transaction){


return(

<AdminLayout>

<div className="transaction-details-page">

<h2>

Loading Transaction...

</h2>


</div>

</AdminLayout>

);


}






return(


<AdminLayout>


<div className="transaction-details-page">





{/* BACK */}

<Link

href="/transactions"

className="transaction-back-button"

>

← Back to Transactions

</Link>







{/* HEADER */}


<div className="transaction-details-header">


<div>


<div className="transaction-details-id-row">


<h1>

{transaction.id}

</h1>



<span

className={

`transaction-details-level ${

transaction.level.toLowerCase()

}`

}

>

{transaction.level}

</span>



</div>



<p>

Detailed transaction risk assessment and investigation.

</p>


</div>






<div className="transaction-details-actions">


<button

className="transaction-secondary-button"

onClick={()=>


handleAction(

"Transaction marked as reviewed",

"Reviewed"

)


}

>

Mark as Reviewed

</button>




<button

className="transaction-primary-button"

onClick={()=>


handleAction(

"Investigation escalated successfully",

"Escalated"

)


}

>

Escalate Case

</button>



</div>



</div>








{/* RISK OVERVIEW */}



<div className="transaction-risk-overview">



<div className="transaction-risk-main">


<div className="transaction-risk-heading">


<div>


<span>

RISK SCORE

</span>



<h2>

{transaction.score}

<small>

/100

</small>


</h2>


</div>



<div className="transaction-risk-circle">

{transaction.score}

</div>


</div>





<div className="transaction-large-risk-bar">


<span

style={{

width:`${transaction.score}%`

}}

/>


</div>




<div className="transaction-risk-footer">


<span>

Model Risk Assessment

</span>



<strong>

{

transaction.score >=80

?

"Very High Risk"

:

"Low Risk"

}

</strong>


</div>



</div>







<div className="transaction-risk-status">


<div className="risk-status-icon">

⚠

</div>



<div>


<span>

Current Status

</span>



<h3>

{currentStatus}

</h3>



<p>

{

currentStatus==="Reviewed"

?

"Transaction has been reviewed."

:

currentStatus==="Escalated"

?

"Investigation has been escalated."

:

"Immediate admin attention recommended."

}


</p>


</div>


</div>





</div>









{/* DETAILS */}



<div className="transaction-details-grid">





<div className="transaction-info-card">


<div className="transaction-info-header">


<h2>

Transaction Details

</h2>


<span>

TRANSACTION

</span>


</div>




<div className="transaction-info-grid">


<div>

<label>

Transaction ID

</label>


<strong>

{transaction.id}

</strong>


</div>



<div>

<label>

Transaction Type

</label>


<strong>

{transaction.type}

</strong>


</div>




<div>

<label>

Amount

</label>


<strong className="detail-amount">

{transaction.amount}

</strong>


</div>





<div>

<label>

Transaction Time

</label>


<strong>

{transaction.time}

</strong>


</div>





<div>

<label>

Risk Probability

</label>


<strong>

{transaction.fraud_probability}

</strong>


</div>





<div>

<label>

Anomaly Score

</label>


<strong>

{transaction.anomaly_score}

</strong>


</div>



</div>



</div>









{/* CUSTOMER */}




<div className="transaction-info-card">


<div className="transaction-info-header">


<h2>

Customer Information

</h2>


<span>

CUSTOMER

</span>


</div>





<div className="entity-profile">


<div className="entity-avatar">

C

</div>



<div>


<strong>

{transaction.customer}

</strong>


<span>

Customer Account

</span>


</div>


</div>





<Link

href={`/customers/${transaction.customer}`}

className="entity-view-link"

>

View Customer →

</Link>



</div>





</div>









{/* DEVICE */}



<div className="transaction-info-card transaction-device-card">


<div className="transaction-info-header">


<h2>

Device Information

</h2>


<span>

DEVICE

</span>


</div>





<div className="device-detail-layout">


<div className="device-icon">

◉

</div>




<div className="device-main-info">


<strong>

{transaction.device}

</strong>


<span>

Registered transaction device

</span>


</div>




<div className="device-stat">


<label>

New Device

</label>


<strong>

{

transaction.new_device

?

"YES"

:

"NO"

}

</strong>


</div>




</div>


</div>








{/* CHART */}


<TransactionBehaviorChart
  customerId={transaction?.customer}
  transactionId={transaction?.id}
/>









{/* =====================================================
    FEATURE 1, 6 & 7: ADVANCED AI EXPLANATION, RISK FACTORS & ANALYST SUMMARY
    ===================================================== */}

{/* WHY THIS TRANSACTION IS RISKY */}
<div className="transaction-ai-card">
  <div className="transaction-ai-header">
    <div>
      <h2>Why Is This Transaction Risky?</h2>
      <p>
        Explainable model signals, behavioral deviations, and rule-based context for this transaction.
      </p>
    </div>
    <div>
      <span
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: "6px",
          fontWeight: 700,
          fontSize: "0.85rem",
          background:
            transaction.score >= 70
              ? "#fee2e2"
              : transaction.score >= 40
              ? "#fef3c7"
              : "#dcfce7",
          color:
            transaction.score >= 70
              ? "#b91c1c"
              : transaction.score >= 40
              ? "#b45309"
              : "#15803d",
        }}
      >
        OVERALL: {String(transaction.level).toUpperCase()} ({transaction.score}/100)
      </span>
    </div>
  </div>

  <div className="transaction-ai-grid">
    {/* Detection Reasons */}
    <div className="transaction-ai-item critical">
      <h3>Major Contributing Factors</h3>
      <ul className="ai-reason-list">
        {(aiExplanation?.reasons || transaction.reasons || []).map(
          (reason: string, index: number) => (
            <li key={index}>▲ {reason}</li>
          )
        )}
      </ul>
    </div>

    {/* TreeSHAP Feature Contributions */}
    <div className="transaction-ai-item">
      <h3>TreeSHAP Feature Contributions</h3>
      {aiExplanation?.feature_contributions?.top_contributions?.length > 0 ? (
        <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
          {aiExplanation.feature_contributions.top_contributions
            .slice(0, 4)
            .map((item: any, idx: number) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "0.85rem",
                }}
              >
                <span>
                  {item.impact === "Increases Risk" ? "▲" : "▼"}{" "}
                  {item.feature.replace(/_/g, " ")}:
                </span>
                <strong
                  style={{
                    color: item.contribution > 0 ? "#ef4444" : "#10b981",
                  }}
                >
                  {item.contribution > 0 ? "+" : ""}
                  {item.contribution} ({item.impact})
                </strong>
              </li>
            ))}
        </ul>
      ) : (
        <p>TreeSHAP feature impact computed at baseline bias.</p>
      )}
    </div>

    {/* ML Assessment */}
    <div className="transaction-ai-item">
      <h3>ML Assessment & Anomaly Score</h3>
      <p style={{ margin: "4px 0" }}>
        <strong>XGBoost Fraud Prob:</strong>{" "}
        {aiExplanation?.ml_models?.xgboost?.fraud_probability !== undefined
          ? `${(aiExplanation.ml_models.xgboost.fraud_probability * 100).toFixed(1)}%`
          : `${((transaction.fraud_probability || 0) * 100).toFixed(1)}%`}
      </p>
      <p style={{ margin: "4px 0" }}>
        <strong>Isolation Forest Score:</strong>{" "}
        {aiExplanation?.ml_models?.isolation_forest?.anomaly_score !== undefined
          ? aiExplanation.ml_models.isolation_forest.anomaly_score
          : transaction.anomaly_score || "0.00"}
      </p>
      <p style={{ margin: "4px 0" }}>
        <strong>Model Confidence:</strong>{" "}
        {aiExplanation?.confidence ? `${aiExplanation.confidence}%` : "High"}
      </p>
    </div>

    {/* Behavioral & Device Context */}
    <div className="transaction-ai-item">
      <h3>Behavioral & Device Signals</h3>
      {aiExplanation?.behavioral_signals &&
      aiExplanation.behavioral_signals.length > 0 ? (
        <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px", fontSize: "0.85rem" }}>
          {aiExplanation.behavioral_signals.map((sig: any, i: number) => (
            <li key={i}>
              <strong>{sig.label}:</strong> {sig.detail}
            </li>
          ))}
        </ul>
      ) : (
        <p>No active customer behavioral deviations triggered for this transaction.</p>
      )}
    </div>
  </div>
</div>

{/* FEATURE 6: RISK SIGNAL STRENGTH BREAKDOWN */}
<div className="transaction-info-card" style={{ marginTop: "20px" }}>
  <div className="transaction-info-header">
    <h2>Risk Signal Strength</h2>
    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
      Relative magnitude derived from model scores and transaction context
    </span>
  </div>

  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
    {[
      {
        name: "Overall Risk Score",
        value: Math.min(Math.max(transaction.score || 0, 0), 100),
        label: `${transaction.score}/100`,
      },
      {
        name: "Anomaly Score (Isolation Forest)",
        value: Math.min(
          Math.round(((transaction.anomaly_score || 0) / 0.6) * 100),
          100
        ),
        label: `Score ${transaction.anomaly_score}`,
      },
      {
        name: "New Device Factor",
        value: transaction.new_device ? 85 : 15,
        label: transaction.new_device ? "New Device Detected" : "Known Device",
      },
      {
        name: "Amount Elevation Vector",
        value:
          transaction.raw_amount && transaction.raw_amount > 50000
            ? 90
            : transaction.raw_amount && transaction.raw_amount > 10000
            ? 60
            : 30,
        label: `${transaction.amount}`,
      },
      {
        name: "Channel Velocity Vector",
        value:
          transaction.type === "Cash-Out" || transaction.type === "Transfer"
            ? 75
            : 40,
        label: `${transaction.type}`,
      },
    ].map((item, idx) => (
      <div key={idx}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            marginBottom: "4px",
          }}
        >
          <strong>{item.name}</strong>
          <span style={{ color: "#64748b" }}>{item.label}</span>
        </div>
        <div
          style={{
            height: "8px",
            background: "#e2e8f0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${item.value}%`,
              background:
                item.value >= 70
                  ? "#ef4444"
                  : item.value >= 40
                  ? "#f59e0b"
                  : "#10b981",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
    ))}
  </div>
</div>

{/* FEATURE 7: ANALYST SUMMARY */}
<div
  className="transaction-info-card"
  style={{
    marginTop: "20px",
    borderLeft: `4px solid ${
      transaction.score >= 70
        ? "#ef4444"
        : transaction.score >= 40
        ? "#f59e0b"
        : "#10b981"
    }`,
  }}
>
  <div className="transaction-info-header">
    <h2>Analyst Decision Support Summary</h2>
    <span
      style={{
        fontWeight: 600,
        color:
          transaction.score >= 70
            ? "#b91c1c"
            : transaction.score >= 40
            ? "#b45309"
            : "#15803d",
      }}
    >
      STATUS: {String(transaction.level).toUpperCase()}
    </span>
  </div>

  <div style={{ marginTop: "12px", fontSize: "0.9rem", lineHeight: "1.6" }}>
    <p>
      This transaction is evaluated as <strong>{transaction.level} Risk</strong>{" "}
      with a combined score of <strong>{transaction.score}/100</strong>.
    </p>

    <div style={{ margin: "10px 0" }}>
      <strong>Key Evidence:</strong>
      <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}>
        {(aiExplanation?.reasons || transaction.reasons || [
          "Standard operating range with no behavioral anomalies.",
        ]).map((r: string, idx: number) => (
          <li key={idx}>{r}</li>
        ))}
      </ul>
    </div>

    <div
      style={{
        marginTop: "12px",
        padding: "10px 14px",
        background: "#f8fafc",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
      }}
    >
      <strong>Recommended Action: </strong>
      {transaction.score >= 70
        ? "Review transaction immediately and verify customer identity & registered device activity before fund release."
        : transaction.score >= 40
        ? "Perform standard secondary verification on counterparty and monitor subsequent customer velocity."
        : "No immediate escalation required. Retain in normal audit queue."}
    </div>
  </div>
</div>









{/* ACTIONS */}


<div className="transaction-investigation-card">


<h2>

Investigation Actions

</h2>



<p>

Take action based on risk assessment.

</p>




{

actionStatus &&

<div className="investigation-success">

✓ {actionStatus}

</div>

}







<div className="investigation-buttons">


<button

className="investigation-review"

onClick={()=>


handleAction(

"Transaction marked as reviewed",

"Reviewed"

)


}

>

✓ Mark Reviewed

</button>





<button

className="investigation-escalate"

onClick={()=>


handleAction(

"Investigation escalated successfully",

"Escalated"

)

}

>

⚠ Escalate Investigation

</button>






<button

className="investigation-block"

onClick={()=>


handleAction(

"Transaction has been blocked",

"Blocked"

)

}

>

Block Transaction

</button>



</div>



</div>








</div>



</AdminLayout>


);



}