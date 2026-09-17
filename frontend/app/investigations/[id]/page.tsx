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





export default function InvestigationDetailsPage(){


    const params = useParams();

    const router = useRouter();



    const id =

        typeof params.id === "string"

        ?

        params.id

        :

        "";





    const [caseData,setCaseData] =
        useState<any>(null);



    const [loading,setLoading] =
        useState(true);







    // ==========================================
    // REALTIME INVESTIGATION DATA
    // ==========================================


    useEffect(()=>{


        async function loadInvestigation(){


            try{


                const response =
                    await fetch(

                        `http://localhost:8000/investigation/${id}`,

                        {
                            cache:"no-store"
                        }

                    );



                const data =
                    await response.json();



                console.log(
                    "Investigation Data:",
                    data
                );



                setCaseData(data);



            }


            catch(error){


                console.log(
                    "Investigation API Error:",
                    error
                );


            }


            finally{


                setLoading(false);


            }



        }





        if(id){

            loadInvestigation();


            const interval =
                setInterval(

                    loadInvestigation,

                    5000

                );


            return ()=>clearInterval(interval);

        }



    },[id]);









    if(loading){


        return(

            <AdminLayout>

                <div className="investigation-page">

                    <h2>
                        Loading Investigation...
                    </h2>

                </div>


            </AdminLayout>

        )


    }








    if(!caseData){


        return(

            <AdminLayout>


                <div className="investigation-page">


                    <h2>

                        Investigation Not Found

                    </h2>


                </div>


            </AdminLayout>

        )


    }










    return(


        <AdminLayout>


            <div className="investigation-page">





                {/* HEADER */}


                <div className="investigation-header">


                    <div>


                        <button

                            className="investigation-back"

                            onClick={()=>router.back()}

                        >

                            ← Back

                        </button>




                        <h1>

                            Investigation Case

                        </h1>


                        <p>

                            Customer ID:

                            {" "}

                            <strong>

                                {caseData.customer_id}

                            </strong>

                        </p>


                    </div>





                    <span className="investigation-status">


                        Open


                    </span>



                </div>









                {/* SUMMARY CARDS */}



                <div className="investigation-summary-grid">



                    <div className="investigation-card">


                        <span>

                            Total Cases

                        </span>


                        <strong>

                            {caseData.total_cases}

                        </strong>


                    </div>





                    <div className="investigation-card">


                        <span>

                            Customer

                        </span>


                        <strong>

                            {caseData.customer_id}

                        </strong>


                    </div>





                    <div className="investigation-card">


                        <span>

                            Highest Risk

                        </span>


                        <strong>


                            {

                            caseData.transactions?.length > 0

                            ?

                            Math.max(

                                ...

                                caseData.transactions.map(

                                    (tx:any)=>

                                    Number(tx.risk_score)

                                )

                            )

                            :

                            0

                            }


                        </strong>


                    </div>





                    <div className="investigation-card">


                        <span>

                            Priority

                        </span>


                        <strong className="high">


                            High


                        </strong>


                    </div>



                </div>









                {/* TRANSACTION TABLE */}



                <div className="investigation-table-card">



                    <div className="investigation-title">


                        <h2>

                            Suspicious Transactions

                        </h2>


                        <p>

                            Transactions requiring investigation.

                        </p>


                    </div>







                    <table className="investigation-table">


                        <thead>


                            <tr>


                                <th>

                                    Transaction ID

                                </th>


                                <th>

                                    Amount

                                </th>


                                <th>

                                    Channel

                                </th>


                                <th>

                                    Risk Score

                                </th>


                                <th>

                                    Risk Level

                                </th>


                                <th>

                                    Time

                                </th>


                            </tr>


                        </thead>




                        <tbody>


                        {


                        caseData.transactions.length===0


                        ?


                        <tr>


                            <td colSpan={6}>

                                No suspicious transactions found

                            </td>


                        </tr>


                        :



                        caseData.transactions.map(

                            (tx:any)=>(


                            <tr

                            key={tx.transaction_id}

                            >



                                <td>

                                    {tx.transaction_id}

                                </td>



                                <td>

                                    ৳{tx.amount}

                                </td>



                                <td>

                                    {tx.channel}

                                </td>



                                <td>

                                    {tx.risk_score}

                                </td>



                                <td>


                                    <span

                                    className={

                                    `risk-badge ${

                                    tx.risk_level.toLowerCase()

                                    }`

                                    }


                                    >

                                        {tx.risk_level}


                                    </span>


                                </td>




                                <td>

                                    {tx.time}

                                </td>



                            </tr>


                            )


                        )


                        }



                        </tbody>


                    </table>



                </div>









                {/* ACTION PANEL */}



                <div className="investigation-actions">



                    <h2>

                        Investigation Actions

                    </h2>




                    <div>


                        <button

                        className="assign-agent"

                        >

                            Assign Agent

                        </button>




                        <button

                        className="review-case"

                        >

                            Mark Under Review

                        </button>




                        <button

                        className="resolve-case"

                        >

                            Resolve Case

                        </button>



                    </div>



                </div>





            </div>



        </AdminLayout>


    );


}