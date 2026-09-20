"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AdminLayout from "@/components/layout/AdminLayout";

export default function InvestigationDetailPage(){

    const params = useParams();

    const id = params.id as string;

    const [transaction,setTransaction] = useState<any>(null);
    const [loading,setLoading] = useState(true);
    const [actionMessage,setActionMessage] = useState("");


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


                const data = await response.json();


                console.log(
                    "Investigation Data:",
                    data
                );


                setTransaction(data);


                setLoading(false);



            }

            catch(error){


                console.log(
                    "Investigation Error:",
                    error
                );


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
                `http://localhost:8000/investigation-action/${transaction.id}`,

                {

                    method:"POST",
                    headers:{

                        "Content-Type":"application/json"

                    },

                    body:JSON.stringify({

                        status:status

                    })

                }

            );

            const data = await response.json();
            console.log(
                "Action Response:",
                data
            );

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

                    <h2>
                        Transaction Not Found
                    </h2>

                </div>

            </AdminLayout>

        );

    }








    return(

        <AdminLayout>


        <div className="transaction-details-page">



            <Link

                href="/transactions"

                className="transaction-back-button"

            >

                ← Back to Transactions

            </Link>





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








            {/* RISK CARD */}


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









            {/* TRANSACTION INFORMATION */}



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


            {/* CUSTOMER & DEVICE INFORMATION */}

            <div className="transaction-details-grid">

                {/* CUSTOMER */}

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







                {/* DEVICE */}


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




                    <Link

                        href="/devices"

                        className="entity-view-link"

                    >

                        View Device →

                    </Link>



                </div>




            </div>




            {/* AI EXPLANATION */}



            <div className="transaction-ai-card">


                <h2>

                    AI Risk Explanation

                </h2>

                <div className="transaction-ai-grid">

                    {/* AI REASONS */}

                    <div className="transaction-ai-item critical">


                        <h3>
                            Detection Reasons
                        </h3>



                        <ul className="ai-reason-list">


                            {
                                transaction.reasons &&

                                transaction.reasons.map(

                                    (reason:string,index:number)=>(

                                        <li key={index}>

                                            ✓ {reason}

                                        </li>

                                    )

                                )
                            }


                        </ul>


                    </div>

                    {/* FRAUD PROBABILITY */}

                    <div className="transaction-ai-item">


                        <h3>
                            Fraud Probability
                        </h3>


                        <p>

                            {transaction.fraud_probability}

                        </p>


                    </div>

                    {/* ANOMALY SCORE */}

                    <div className="transaction-ai-item">


                        <h3>
                            Anomaly Score
                        </h3>


                        <p>

                            {transaction.anomaly_score}

                        </p>


                    </div>


                </div>


                </div>

            </div>

            {/* ACTIONS */}

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

                    onClick={()=>updateStatus("Escalated")}

                    >

                    ⚠ Escalate

                    </button>


                    <button

                    className="investigation-block"

                    onClick={()=>updateStatus("Blocked")}

                    >

                    Block Transaction

                    </button>

                </div>

            </div>

        </AdminLayout>

    );


}