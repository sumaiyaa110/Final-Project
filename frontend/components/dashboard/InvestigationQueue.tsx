"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InvestigationQueue(){
    const router = useRouter();

    const [cases,setCases] = useState<any[]>([]);


    useEffect(()=>{


        async function loadCases(){

            try{

                const response = await fetch(
                    "http://localhost:8000/high-risk",
                    {
                        cache:"no-store"
                    }
                );


                const data = await response.json();


                console.log(
                    "Investigation Queue:",
                    data
                );


                setCases(data.slice(0,5));


            }

            catch(error){

                console.log(
                    "Investigation Queue Error:",
                    error
                );

            }

        }



        loadCases();


        const interval=setInterval(
            loadCases,
            5000
        );


        return ()=>clearInterval(interval);


    },[]);




    return(

        <div className="investigation-queue-card">


            <div className="investigation-header">

                <div>

                    <h2>
                        Active Investigations
                    </h2>

                    <p>
                        High risk transactions requiring review
                    </p>

                </div>


                <Link href="/investigations">

                    View All →

                </Link>


            </div>



            <div className="investigation-list">


            {
                cases.map((item,index)=>(

                        <div

                        className="investigation-item"

                        key={index}

                        onClick={()=>router.push(`/investigations/${item.id}`)}

                        >

                        <div>


                            <strong>
                                {item.id}
                            </strong>


                            <span>
                                {item.channel}
                            </span>


                        </div>



                        <div>


                            <b>
                                {item.risk_score}
                            </b>


                            <small>
                                Risk
                            </small>


                        </div>


                    </div>


                ))
            }



            </div>



        </div>

    );


}