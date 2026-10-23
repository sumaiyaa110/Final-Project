"use client";


import {
  useParams,
  useRouter
} from "next/navigation";


import {
  useEffect,
  useState
} from "react";


import AdminLayout from "@/components/layout/AdminLayout";
import { API_URL } from "@/services/api";





type RiskLevel =
"High"
|
"Medium"
|
"Low";



type CustomerStatus =
"Active"
|
"Suspended";





type CustomerData = {


id:string;

name:string;

phone:string;

risk:RiskLevel;

riskScore:number;

status:CustomerStatus;

totalTransactions:number;

totalAmount:number;

fraudAlerts:number;

lastActivity:string;

customerSince:string;


};






const formatBDT = (
amount:number
)=>{


if(amount >= 10000000){

return `৳${(
amount / 10000000
).toFixed(2)} Crore`;

}



if(amount >= 100000){

return `৳${(
amount / 100000
).toFixed(2)} Lakh`;

}



return `৳${amount.toLocaleString(
"en-BD"
)}`;

};









export default function CustomerDetailsPage(){



const router = useRouter();


const params = useParams();



const customerId =

typeof params?.id === "string"

?

params.id

:

"";






const [
customer,
setCustomer
]

=
useState<CustomerData|null>(
null
);





const [
transactions,
setTransactions
]

=
useState<any[]>([]);





const [
loading,
setLoading
]

=
useState(true);










// =====================================================
// REALTIME CUSTOMER DATA
// =====================================================


useEffect(()=>{



async function loadCustomer(){



try{



const response =
await fetch(

`${API_URL}/customer/${customerId}`,

{

cache:"no-store"

}

);




const data =
await response.json();





console.log(

"Live Customer:",

data

);




setCustomer(data);



}

catch(error){



console.log(

"Customer API Error:",

error

);



}



}







async function loadTransactions(){



try{



const response =
await fetch(

`${API_URL}/customer/${customerId}/transactions`,

{

cache:"no-store"

}

);



const data =
await response.json();




console.log(

"Customer Transactions:",

data

);




setTransactions(data);



}

catch(error){



console.log(

"Customer Transactions Error:",

error

);



}



}






loadCustomer();

loadTransactions();






const interval =
setInterval(()=>{


loadCustomer();

loadTransactions();



},5000);





setLoading(false);





return ()=>clearInterval(interval);




},[customerId]);









if(loading || !customer){



return(

<AdminLayout>


<div className="customer-details-page">


<h2>

Loading Customer Data...

</h2>


</div>


</AdminLayout>


);


}









return(


<AdminLayout>


<div className="customer-details-page">







{/* BACK BUTTON */}


<button


className="customer-details-back"


onClick={()=>router.push("/customers")}


>


← Back to Customers


</button>









{/* HEADER */}



<div className="customer-details-header">


<div className="customer-details-identity">



<div className="customer-details-avatar">


{

customer.name

.split(" ")

.map(
(part)=>part[0]
)

.join("")

.slice(0,2)

}


</div>





<div>


<div className="customer-details-id">

{customer.id}

</div>



<h1>

{customer.name}

</h1>



<p>

{customer.phone}

</p>


</div>



</div>







<div className="customer-details-header-right">


<span

className={

`customer-details-risk-badge customer-risk-${

customer.risk.toLowerCase()

}`

}

>

{customer.risk} Risk

</span>





<span

className={

`customer-details-status-badge customer-status-${

customer.status.toLowerCase()

}`

}

>

● {customer.status}

</span>



</div>



</div>









{/* BASIC INFORMATION */}



<div className="customer-details-info-card">



<div className="customer-details-info-item">


<span>

Customer Since

</span>



<strong>

{customer.customerSince}

</strong>


</div>





<div className="customer-details-info-item">


<span>

Customer ID

</span>



<strong>

{customer.id}

</strong>


</div>





<div className="customer-details-info-item">


<span>

Last Activity

</span>



<strong>

{customer.lastActivity}

</strong>


</div>





<div className="customer-details-info-item">


<span>

Account Status

</span>



<strong>

{customer.status}

</strong>


</div>



</div>








{/* SUMMARY CARDS */}



<div className="customer-details-summary-grid">



<div className="customer-summary-card">


<span>

Total Transactions

</span>


<strong>

{customer.totalTransactions.toLocaleString()}

</strong>


</div>





<div className="customer-summary-card">


<span>

Total Amount

</span>


<strong>

{formatBDT(customer.totalAmount)}

</strong>


</div>





<div className="customer-summary-card">


<span>

Fraud Alerts

</span>


<strong className="summary-alert-value">

{customer.fraudAlerts}

</strong>


</div>





<div className="customer-summary-card">


<span>

Risk Score

</span>


<strong className="summary-risk-value">

{customer.riskScore}

<small>

/100

</small>


</strong>


</div>



</div>

{/* =====================================================
    FEATURE 2: CUSTOMER RISK PROFILE & BEHAVIOR COMPARISON
===================================================== */}
<div className="customer-details-info-card" style={{ marginTop: "24px", display: "block" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
    <div>
      <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Customer Risk Profile & Behavioral Baseline</h2>
      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
        Comparing historical baseline habits with current activity telemetry.
      </p>
    </div>
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "0.8rem",
        fontWeight: 600,
        background:
          customer.risk === "High" ? "#fee2e2" : customer.risk === "Medium" ? "#fef3c7" : "#dcfce7",
        color:
          customer.risk === "High" ? "#991b1b" : customer.risk === "Medium" ? "#92400e" : "#166534",
      }}
    >
      {customer.risk.toUpperCase()} RISK PROFILE
    </span>
  </div>

  {/* PROFILE STATS GRID */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "14px",
      marginBottom: "20px",
    }}
  >
    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>AVERAGE TRANSACTION</span>
      <strong style={{ fontSize: "1.1rem" }}>
        ৳{((customer as any).behavior?.amount?.average || (customer.totalTransactions > 0 ? (customer.totalAmount / customer.totalTransactions).toFixed(0) : 0)).toLocaleString()}
      </strong>
    </div>

    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>COMMON CHANNEL</span>
      <strong style={{ fontSize: "1.1rem" }}>
        {((customer as any).behavior?.channels?.usual?.[0] || "P2P")}
      </strong>
    </div>

    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>TYPICAL TIME WINDOW</span>
      <strong style={{ fontSize: "1.1rem" }}>
        {((customer as any).behavior?.timeOfDay?.usual?.[0] || "Afternoon (12-17)")}
      </strong>
    </div>

    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>TRUSTED DEVICES</span>
      <strong style={{ fontSize: "1.1rem" }}>
        {((customer as any).behavior?.devices?.trusted?.length ?? 0)} Verified
      </strong>
      <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>
        {((customer as any).behavior?.devices?.distinct ?? 1)} total used
      </span>
    </div>
  </div>

  {/* NORMAL BEHAVIOR VS CURRENT ACTIVITY VISUAL COMPARISON */}
  {((customer as any).behavior?.current) && (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem" }}>
        Activity Comparison: Customer Normal Behavior vs Current Activity
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Normal */}
        <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 700, display: "block", marginBottom: "8px" }}>
            NORMAL HISTORICAL BEHAVIOR
          </span>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.8" }}>
            <div>Average Amount: <strong>৳{Number((customer as any).behavior?.amount?.average || 0).toLocaleString()}</strong></div>
            <div>Usual Channels: <strong>{((customer as any).behavior?.channels?.usual?.join(", ") || "Standard")}</strong></div>
            <div>Active Window: <strong>{((customer as any).behavior?.timeOfDay?.usual?.join(", ") || "Daytime")}</strong></div>
            <div>Late-Night Share: <strong>{((customer as any).behavior?.timeOfDay?.lateNightShare || 0)}%</strong></div>
          </div>
        </div>

        {/* Current */}
        <div
          style={{
            padding: "12px",
            background:
              (customer as any).behavior?.amount?.ratioToAverage >= 2.5
                ? "#fff1f2"
                : "#f0fdf4",
            borderRadius: "6px",
            border:
              (customer as any).behavior?.amount?.ratioToAverage >= 2.5
                ? "1px solid #fecdd3"
                : "1px solid #bbf7d0",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 700, display: "block", marginBottom: "8px" }}>
            CURRENT TRANSACTION ACTIVITY ({(customer as any).behavior?.current?.id})
          </span>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.8" }}>
            <div>
              Current Amount: <strong>৳{Number((customer as any).behavior?.current?.amount || 0).toLocaleString()}</strong>
              {(customer as any).behavior?.amount?.ratioToAverage ? (
                <span style={{ color: "#e11d48", fontWeight: 700, marginLeft: "6px" }}>
                  ({(customer as any).behavior?.amount?.ratioToAverage}× normal)
                </span>
              ) : null}
            </div>
            <div>Current Channel: <strong>{(customer as any).behavior?.current?.channel}</strong></div>
            <div>Device: <strong>{(customer as any).behavior?.current?.device || "Unknown"}</strong></div>
            <div>Risk Score: <strong>{(customer as any).behavior?.current?.riskScore}/100</strong></div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

{/* =====================================================
    RECENT TRANSACTIONS
===================================================== */}


<div className="customer-transactions-card">


<div className="customer-card-header">


<div>

<h2>

Recent Transactions

</h2>


<p>

Live transaction activity from this customer.

</p>


</div>



<span className="live-indicator">

● Live

</span>



</div>







<div className="customer-transactions-wrapper">


<table className="customer-transactions-table">


<thead>


<tr>


<th>

Transaction ID

</th>


<th>

Type

</th>


<th>

Amount

</th>


<th>

Risk Score

</th>


<th>

Status

</th>


<th>

Time

</th>


<th>

Action

</th>


</tr>


</thead>






<tbody>


{

transactions.length === 0

?

<tr>


<td

colSpan={7}

className="empty-state"

>

No transactions found

</td>


</tr>


:


transactions.map((transaction)=>(


<tr

key={transaction.id}

>


<td className="transaction-id">

{transaction.id}

</td>





<td>

{transaction.type}

</td>





<td className="transaction-amount">

{transaction.amount}

</td>






<td>


<div className="customer-risk-score">


<div className="risk-score-bar">


<span

style={{

width:`${transaction.risk}%`

}}


/>


</div>



<strong>

{transaction.risk}

</strong>



</div>



</td>






<td>


<span

className={

`customer-transaction-status status-${

transaction.status.toLowerCase()

}`

}

>


{transaction.status}


</span>



</td>






<td>

{transaction.time}

</td>






<td>


<button


className="customer-view-transaction"


onClick={()=>


router.push(

`/transactions/${transaction.id}`

)


}

>

View

</button>



</td>





</tr>


))


}



</tbody>



</table>



</div>



</div>









{/* =====================================================
    RISK PROFILE
===================================================== */}



<div className="customer-risk-profile-card">





<div className="customer-card-header">


<div>


<h2>

Risk Profile

</h2>


<p>

AI-generated customer risk assessment.

</p>


</div>


</div>






<div className="risk-profile-grid">





<div className="risk-profile-item">


<span>

Overall Risk Score

</span>


<strong>

{customer.riskScore}

<span>

/100

</span>

</strong>


</div>








<div className="risk-profile-item">


<span>

Risk Category

</span>


<strong>


{customer.risk}


</strong>


</div>








<div className="risk-profile-item">


<span>

Fraud Alerts

</span>


<strong>


{customer.fraudAlerts}


</strong>


</div>








<div className="risk-profile-item">


<span>

Monitoring Status

</span>


<strong>


{

customer.status==="Active"

?

"Monitored"

:

"Restricted"

}


</strong>


</div>






</div>



</div>









{/* =====================================================
    AI INSIGHTS
===================================================== */}



<div className="customer-ai-card">



<div className="customer-ai-icon">

✦

</div>




<div>


<h2>

AI Customer Insight

</h2>



<p>


{

customer.risk==="High"

?

"This customer shows high-risk transaction behaviour. Immediate review is recommended."

:

customer.risk==="Medium"

?

"This customer has moderate risk indicators requiring monitoring."

:

"This customer shows normal transaction behaviour."

}



</p>



</div>



</div>









{/* =====================================================
    ACTIONS
===================================================== */}



<div className="customer-action-card">



<h2>

Investigation Actions

</h2>



<p>

Manage customer investigation status.

</p>




<div className="customer-action-buttons">





<button

className="customer-review-button"

onClick={()=>alert(

"Customer marked as reviewed"

)}

>

✓ Mark Reviewed

</button>






<button
className="customer-investigate-button"
onClick={() => {
  if ((customer as any)?.latestSuspiciousTransactionId) {
    router.push(`/investigations/${(customer as any).latestSuspiciousTransactionId}`);
  } else if (transactions && transactions.length > 0) {
    router.push(`/investigations/${transactions[0].id}`);
  } else {
    router.push("/investigations");
  }
}}
>
⚠ Investigate Customer
</button>







<button

className="customer-block-button"

onClick={()=>alert(

"Customer account blocked"

)}

>

Block Account

</button>




</div>



</div>









</div>



</AdminLayout>



);


}