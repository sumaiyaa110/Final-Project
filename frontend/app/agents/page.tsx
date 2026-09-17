"use client";


import {
    useEffect,
    useMemo,
    useState
} from "react";


import AdminLayout from "@/components/layout/AdminLayout";


import {
    getAgents
} from "@/services/api";






type Agent = {

    id:string;

    name:string;

    email:string;

    role:string;

    activeCases:number;

    alerts:number;

    status:string;

    lastActive:string;

};







export default function AgentsPage(){



    const [agents,setAgents] =
        useState<Agent[]>([]);



    const [search,setSearch] =
        useState("");



    const [roleFilter,setRoleFilter] =
        useState("All Roles");



    const [statusFilter,setStatusFilter] =
        useState("All Statuses");







    // =================================================
    // REAL TIME DATA FETCH
    // =================================================


    useEffect(()=>{


        async function loadAgents(){


            try{


                const data =
                    await getAgents();



                setAgents(data);


            }

            catch(error){


                console.log(
                    "Agent API Error:",
                    error
                );


            }


        }





        loadAgents();




        const timer =
            setInterval(

                loadAgents,

                5000

            );



        return ()=>clearInterval(timer);



    },[]);









    // =================================================
    // FILTER
    // =================================================


    const filteredAgents = useMemo(()=>{


        return agents.filter(
            (agent)=>{


                const searchMatch =


                    agent.id
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )


                    ||

                    agent.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )


                    ||

                    agent.email
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );






                const roleMatch =

                    roleFilter === "All Roles"

                    ||

                    agent.role === roleFilter;







                const statusMatch =


                    statusFilter === "All Statuses"

                    ||

                    agent.status === statusFilter;







                return (

                    searchMatch

                    &&

                    roleMatch

                    &&

                    statusMatch

                );


            }

        );


    },[

        agents,

        search,

        roleFilter,

        statusFilter

    ]);








    // =================================================
    // SUMMARY
    // =================================================


    const activeAgents =
        agents.filter(
            a=>a.status==="Active"
        ).length;



    const investigating =
        agents.filter(
            a=>a.activeCases>0
        ).length;



    const totalAlerts =
        agents.reduce(
            (sum,a)=>
                sum+a.alerts,
            0
        );









    return (

        <AdminLayout>


        <div className="agents-page">





        {/* HEADER */}

        <div className="agents-page-header">


            <div>

                <h1>
                    Agents
                </h1>


                <p>
                    Manage fraud analysts,
                    workload and investigation activity.
                </p>


            </div>


        </div>








        {/* SUMMARY CARDS */}


        <div className="agents-summary-grid">



            <div className="agents-summary-card">

                <span>
                    Total Agents
                </span>


                <strong>
                    {agents.length}
                </strong>

            </div>





            <div className="agents-summary-card">

                <span>
                    Active Agents
                </span>


                <strong>
                    {activeAgents}
                </strong>

            </div>





            <div className="agents-summary-card">

                <span>
                    Investigating
                </span>


                <strong>
                    {investigating}
                </strong>

            </div>





            <div className="agents-summary-card">

                <span>
                    Total Alerts
                </span>


                <strong>
                    {totalAlerts}
                </strong>

            </div>


        </div>









        {/* FILTER */}


        <div className="agents-filter-card">


            <input

                className="agents-search"

                placeholder="Search agent..."

                value={search}

                onChange={
                    e=>
                    setSearch(
                        e.target.value
                    )
                }

            />





            <select

                value={roleFilter}

                onChange={
                    e=>
                    setRoleFilter(
                        e.target.value
                    )
                }

            >

                <option>
                    All Roles
                </option>


                <option>
                    Senior Fraud Analyst
                </option>


                <option>
                    Fraud Analyst
                </option>


                <option>
                    Investigator
                </option>


            </select>








            <select

                value={statusFilter}

                onChange={
                    e=>
                    setStatusFilter(
                        e.target.value
                    )
                }

            >

                <option>
                    All Statuses
                </option>


                <option>
                    Active
                </option>


                <option>
                    Away
                </option>


                <option>
                    Offline
                </option>


            </select>



        </div>









        {/* TABLE */}



        <div className="agents-table-card">


        <div className="agents-table-wrapper">


        <table className="agents-table">


        <thead>

        <tr>

            <th>ID</th>

            <th>Name</th>

            <th>Role</th>

            <th>Cases</th>

            <th>Alerts</th>

            <th>Status</th>

            <th>Last Active</th>


        </tr>

        </thead>






        <tbody>



        {

            filteredAgents.map(
                agent=>(


                <tr key={agent.id}>


                    <td>

                        {agent.id}

                    </td>





                    <td>


                        <div>


                        <strong>
                            {agent.name}
                        </strong>


                        <br/>


                        <small>
                            {agent.email}
                        </small>


                        </div>


                    </td>






                    <td>

                        {agent.role}

                    </td>






                    <td>

                        {agent.activeCases}

                    </td>







                    <td>

                        {agent.alerts}

                    </td>








                    <td>


                    <span
                    className={
                    `agent-status ${agent.status.toLowerCase()}`
                    }
                    >

                        {agent.status}

                    </span>


                    </td>







                    <td>

                        {agent.lastActive}

                    </td>





                </tr>


                )

            )

        }



        </tbody>


        </table>


        </div>



        </div>





        </div>


        </AdminLayout>

    );

}