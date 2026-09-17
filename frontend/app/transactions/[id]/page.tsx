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



const [transaction,setTransaction] = useState<any>(null);


const [currentStatus,setCurrentStatus] = useState("");

const [actionStatus,setActionStatus] = useState("");





// =====================================================
// REALTIME TRANSACTION FETCH
// =====================================================


useEffect(()=>{


async function loadTransaction(){


try{


const response = await fetch(

`http://localhost:8000/transaction/${transactionId}`,

{
    cache:"no-store"
}

);



const data = await response.json();



console.log(

"Live Transaction Detail:",

data

);



setTransaction(data);


setCurrentStatus(

data.status

);



}

catch(error){


console.log(

"Transaction detail error:",

error

);


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


function handleAction(

message:string,

status:string

){


setCurrentStatus(status);


setActionStatus(message);



setTimeout(()=>{


setActionStatus("");


},3000);


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


<TransactionBehaviorChart />









{/* AI EXPLANATION */}


<div className="transaction-ai-card">


<div className="transaction-ai-header">


<div>


<h2>

AI Risk Explanation

</h2>


<p>

Explainable signals contributing to the risk score.

</p>


</div>


</div>





<div className="transaction-ai-grid">


<div className="transaction-ai-item critical">


<h3>

Risk Score Analysis

</h3>


<p>

The model assigned a risk score of {transaction.score}/100 based on transaction behaviour.

</p>


</div>





<div className="transaction-ai-item">


<h3>

Device Behaviour

</h3>


<p>

Device anomaly score: {transaction.anomaly_score}

</p>


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