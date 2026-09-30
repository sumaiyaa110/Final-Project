"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AdminLayout from "@/components/layout/AdminLayout";



export default function InvestigationDetailPage() {


    const params = useParams();


    const id = String(params.id);



    const [transaction, setTransaction] =
        useState<any>(null);


    const [aiExplanation, setAIExplanation] =
        useState<any>(null);


    const [aiLoading, setAILoading] =
        useState(true);



    const [loading, setLoading] =
        useState(true);



    const [actionMessage, setActionMessage] =
        useState("");



    const [confirmAction, setConfirmAction] =
        useState<string | null>(null);




    // ==========================================
    // CONFIRM ACTION
    // ==========================================


    function confirmStatusUpdate(){


        if(confirmAction){

            updateStatus(confirmAction);

            setConfirmAction(null);

        }

    }






    // ==========================================
    // REAL TIME TRANSACTION FETCH
    // ==========================================


    useEffect(()=>{


        async function loadTransaction(){


            try{


                const response = await fetch(

                    `http://localhost:8000/transaction/${id}`,

                    {
                        cache:"no-store"
                    }

                );



                if(!response.ok){

                    throw new Error(
                        "Transaction API failed"
                    );

                }




                const data =
                    await response.json();



                console.log(
                    "Investigation Data:",
                    data
                );



                setTransaction(data);



                // ==================================
                // LOAD AI EXPLANATION
                // ==================================


                try{


                    const aiResponse =
                        await fetch(

                        `http://localhost:8000/transaction/${id}/explanation`,

                        {
                            cache:"no-store"
                        }

                    );



                    if(aiResponse.ok){


                        const aiData =
                            await aiResponse.json();



                        setAIExplanation(aiData);
                        setAILoading(false);


                    }



                }

                catch(aiError){


                    console.log(
                        "AI Explanation Error:",
                        aiError
                    );


                }





            }



            catch(error){


                console.log(

                    "Investigation Error:",

                    error

                );



            }



            finally{


                setLoading(false);


            }


        }




        loadTransaction();




        const interval = setInterval(

            loadTransaction,

            5000

        );



        return ()=>clearInterval(interval);



    },[id]);









    // ==========================================
    // UPDATE INVESTIGATION STATUS
    // ==========================================


    async function updateStatus(status:string){


        try{


            const response = await fetch(


                `http://localhost:8000/investigation-action/${id}`,


                {

                    method:"POST",


                    headers:{


                        "Content-Type":

                        "application/json"


                    },


                    body:JSON.stringify({


                        status:status


                    })


                }


            );




            const data =
                await response.json();




            console.log(

                "Action Response:",

                data

            );




            setTransaction({
                ...transaction,
                status: status
            });


            setActionMessage(

                `Transaction marked as ${status}`

            );



            setTimeout(()=>{


                setActionMessage("");


            },3000);



        }



        catch(error){


            console.log(

                "Action Error:",

                error

            );


        }


    }






    if(loading){


        return(


            <AdminLayout>


                <div className="transaction-details-page">


                    <h2>

                        Loading Investigation...

                    </h2>


                </div>


            </AdminLayout>


        );


    }






    if(!transaction){


       return(

            <AdminLayout>


            <div className="transaction-details-page">



            <Link

            href="/transactions"

            className="transaction-back-button"

            >

            ← Back to Transactions

            </Link>





            {/* ==========================================
                HEADER
            ========================================== */}



            <div className="transaction-details-header">


            <div>


            <h1>

            Investigation: {transaction.id}

            </h1>



            <p>

            Fraud investigation details

            </p>


            </div>


            </div>







            {/* ==========================================
                RISK OVERVIEW
            ========================================== */}



            <div className="transaction-risk-overview">


            <div className="transaction-risk-main">


            <span>

            RISK SCORE

            </span>



            <h2>

            {transaction.score}

            <small>

            /100

            </small>

            </h2>





            <div className="transaction-large-risk-bar">


            <span

            style={{

            width:`${transaction.score}%`

            }}

            />


            </div>



            </div>






            <div className="transaction-risk-status">


            <div className="risk-status-icon">

            ⚠

            </div>



            <div>


            <span>

            Risk Level

            </span>



            <h3>

            {transaction.level}

            </h3>


            </div>



            </div>



            </div>







            {/* ==========================================
                TRANSACTION INFORMATION
            ========================================== */}



            <div className="transaction-info-card">


            <div className="transaction-info-header">


            <h2>

            Transaction Information

            </h2>


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

            Amount

            </label>


            <strong>

            {transaction.amount}

            </strong>


            </div>





            <div>

            <label>

            Channel

            </label>


            <strong>

            {transaction.type}

            </strong>


            </div>





            <div>

            <label>

            Time

            </label>


            <strong>

            {transaction.time}

            </strong>


            </div>



            </div>



            </div>








            {/* ==========================================
                CUSTOMER + DEVICE
            ========================================== */}



            <div className="transaction-details-grid">






            <div className="transaction-info-card">


            <div className="transaction-info-header">


            <h2>

            Customer Information

            </h2>


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








            <div className="transaction-info-card">


            <div className="transaction-info-header">


            <h2>

            Device Information

            </h2>


            </div>





            <div className="entity-profile">


            <div className="entity-avatar">

            D

            </div>





            <div>


            <strong>

            {transaction.device}

            </strong>



            <span>

            Registered Device

            </span>


            </div>



            </div>



            </div>





            </div>

            {/* ==========================================
    AI RISK ANALYSIS
========================================== */}


<div className="transaction-ai-card">


<h2>

AI Risk Analysis

</h2>



<p className="ai-description">

Explainable signals contributing to the fraud decision.

</p>





<div className="transaction-ai-grid">





<div className="transaction-ai-item critical">


<h3>

Detection Reasons

</h3>




<ul className="ai-reason-list">


{

(
aiExplanation?.reasons ||

transaction.reasons ||

[]

).map(

(reason:string,index:number)=>(


<li key={index}>

✓ {reason}

</li>


)

)


}



</ul>


</div>







<div className="transaction-ai-item">


<h3>

Fraud Probability

</h3>



<p>


{

aiExplanation?.fraud_probability ??

transaction.fraud_probability ??

"N/A"

}


</p>


</div>







<div className="transaction-ai-item">


<h3>

Anomaly Score

</h3>



<p>


{

transaction.anomaly_score ??

"N/A"

}


</p>



</div>







<div className="transaction-ai-item">


<h3>

Model Confidence

</h3>



<p>


{

aiExplanation?.confidence
                ? `${aiExplanation.confidence}%`
                : "High"

}


</p>



</div>







<div className="transaction-ai-item">


<h3>

Model Version

</h3>



<p>


{

aiExplanation?.model ??

transaction.model ??

"XGBoost v1.0"

}


</p>



</div>






</div>



</div>









{/* ==========================================
    INVESTIGATION TIMELINE
========================================== */}



<div className="transaction-info-card">


<div className="transaction-info-header">


<h2>

Investigation Timeline

</h2>


</div>





<div className="investigation-timeline">


<div className="timeline-item">


<span>

●

</span>


<div>

<strong>

Transaction Detected

</strong>


<p>

AI model identified abnormal behaviour.

</p>


</div>


</div>






<div className="timeline-item">


<span>

●

</span>


<div>

<strong>

Risk Analysis Completed

</strong>


<p>

Fraud score calculated using ML model.

</p>


</div>


</div>






<div className="timeline-item">


<span>

●

</span>


<div>

<strong>

Investigation Started

</strong>


<p>

Waiting for analyst decision.

</p>


</div>


</div>



</div>



</div>









{/* ==========================================
    CONFIRMATION POPUP
========================================== */}



{

confirmAction &&



<div className="confirmation-overlay">


<div className="confirmation-box">


<h2>

Confirm Action

</h2>



<p>

Are you sure you want to

<strong>

{" "}{confirmAction}{" "}

</strong>

this transaction?

</p>





<div className="confirmation-buttons">



<button

className="cancel-button"

onClick={()=>setConfirmAction(null)}

>


Cancel

</button>






<button

className="confirm-button"

onClick={confirmStatusUpdate}

>


Confirm

</button>




</div>



</div>



</div>


}









{/* ==========================================
    ACTIONS
========================================== */}



<div className="transaction-investigation-card">


<h2>

Investigation Actions

</h2>



<p>

Take action based on AI assessment.

</p>






{

actionMessage &&


<div className="investigation-success">


✓ {actionMessage}


</div>


}








<div className="investigation-buttons">



<button

className="investigation-review"

onClick={()=>updateStatus("Safe")}

>


✓ Mark Safe


</button>







<button

className="investigation-escalate"

onClick={()=>setConfirmAction("Escalated")}

>


⚠ Escalate


</button>







<button

className="investigation-block"

onClick={()=>setConfirmAction("Blocked")}

>


Block Transaction


</button>




</div>




</div>





</div>


</AdminLayout>


);


}
}