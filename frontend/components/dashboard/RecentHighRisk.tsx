"use client";


import {
  useEffect,
  useState
} from "react";


import {
  useRouter
} from "next/navigation";





export default function RecentHighRisk() {



  const router = useRouter();



  const [
    transactions,
    setTransactions
  ] = useState<any[]>([]);



  const [
    loading,
    setLoading
  ] = useState(true);






  // ======================================
  // REAL TIME HIGH RISK DATA
  // ======================================


  useEffect(()=>{



    async function loadTransactions(){


      try{


        const response =
        await fetch(

          "http://localhost:8000/high-risk",

          {
            cache:"no-store"
          }

        );



        const data =
        await response.json();



        console.log(

          "High Risk Transactions:",

          data

        );



        setTransactions(data);



      }

      catch(error){


        console.log(

          "High Risk API Error:",

          error

        );


      }


      finally{


        setLoading(false);


      }



    }







    // Initial fetch

    loadTransactions();







    // Refresh every 5 seconds

    const interval =
    setInterval(

      loadTransactions,

      5000

    );






    return ()=>clearInterval(interval);





  },[]);









  return (



    <div className="high-risk-card">






      {/* Header */}


      <div className="high-risk-header">


        <div>


          <h2>

            Recent High-Risk Transactions

          </h2>




          <p>

            Transactions requiring immediate attention or review.

          </p>



        </div>







        <button


          className="view-all-button"



          onClick={()=>


            router.push(

              "/transactions?risk=high"

            )


          }



        >


          View All →


        </button>





      </div>









      {/* Table */}



      <div className="high-risk-table-wrapper">



        <table className="high-risk-table">





          <thead>


            <tr>


              <th>
                TXN ID
              </th>


              <th>
                Customer
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
                Status
              </th>


              <th>
                Time
              </th>


            </tr>



          </thead>









          <tbody>





          {


          loading


          ?

          <tr>


            <td colSpan={7}>


              Loading high risk transactions...


            </td>


          </tr>





          :



          transactions.length===0



          ?



          <tr>


            <td colSpan={7}>


              No high risk transactions found


            </td>


          </tr>







          :



          transactions.map(

            (transaction)=>(


              <tr

                key={transaction.id}

              >







                {/* ID */}


                <td className="transaction-id">


                  {transaction.id}


                </td>









                {/* Customer */}



                <td className="customer-id">


                  {transaction.customer}


                </td>









                {/* Amount */}



                <td className="transaction-amount">


                  ৳

                  {Number(

                    transaction.amount

                  ).toLocaleString()}


                </td>









                {/* Channel */}



                <td className="transaction-channel">


                  {transaction.channel}


                </td>









                {/* Risk Score */}



                <td>



                  <div className="risk-score-wrapper">





                    <div className="risk-score-bar">



                      <span


                        style={{


                          width:

                          `${transaction.risk_score}%`


                        }}



                      />



                    </div>






                    <span className="risk-score-value">


                      {transaction.risk_score}



                    </span>





                  </div>



                </td>









                {/* Status */}



                <td>


                  <span


                    className={

                      `transaction-status status-${

                        transaction.status

                        .toLowerCase()

                        .replace(

                          " ",

                          "-"

                        )

                      }`

                    }



                  >



                    {transaction.status}



                  </span>



                </td>









                {/* Time */}



                <td className="transaction-time">


                  {transaction.time}


                </td>









              </tr>


            )


          )


          }







          </tbody>





        </table>





      </div>







    </div>



  );

}