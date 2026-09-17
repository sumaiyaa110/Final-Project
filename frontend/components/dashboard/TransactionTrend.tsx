"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});


export default function TransactionTrend() {


  const [trendData, setTrendData] = useState<any[]>([]);



  // ======================================
  // REAL TIME DATA FETCH
  // ======================================

  useEffect(() => {


    async function loadTrend(){


      try {


        const response = await fetch(

          "http://localhost:8000/transaction-trend",

          {
            cache:"no-store"
          }

        );



        const data = await response.json();



        console.log(
          "Live Transaction Trend:",
          data
        );



        setTrendData(data);



      }

      catch(error){


        console.log(
          "Transaction Trend Error:",
          error
        );


      }


    }





    // First load

    loadTrend();



    // Refresh every 5 seconds

    const interval = setInterval(

      loadTrend,

      5000

    );



    return ()=>clearInterval(interval);



  }, []);





  const days = trendData.map(

    (item)=>item.date

  );



  const transactions = trendData.map(

    (item)=>item.transactions

  );



  const suspicious = trendData.map(

    (item)=>item.suspicious

  );





  return (

    <div className="transaction-chart-card">


      <div className="chart-card-header">


        <div>

          <h2>
            Transaction Activity
          </h2>


          <p>
            Transaction volume and suspicious activity over the selected period.
          </p>


        </div>



        <select
          className="chart-filter"
          defaultValue="30"
        >

          <option value="7">
            Last 7 Days
          </option>


          <option value="30">
            Last 30 Days
          </option>


          <option value="90">
            Last 90 Days
          </option>


        </select>


      </div>





      <div className="transaction-chart">


        <Plot


          data={[


            {


              x:days,


              y:transactions,


              type:"scatter",


              mode:"lines+markers",


              name:"Transactions",



              line:{

                shape:"spline",

                width:2.5

              },



              marker:{

                size:6

              },



              hovertemplate:

              "<b>%{x}</b><br>" +

              "Transactions: %{y}" +

              "<extra></extra>"


            },






            {


              x:days,


              y:suspicious,


              type:"scatter",


              mode:"lines+markers",


              name:"Suspicious",



              line:{

                shape:"spline",

                width:2.5,

                dash:"dot"

              },



              marker:{

                size:6

              },



              hovertemplate:

              "<b>%{x}</b><br>" +

              "Suspicious: %{y}" +

              "<extra></extra>"


            }


          ]}





          layout={{


            autosize:true,


            height:230,


            margin:{

              l:55,

              r:55,

              t:25,

              b:60

            },



            paper_bgcolor:"rgba(0,0,0,0)",


            plot_bgcolor:"rgba(0,0,0,0)",



            font:{

              color:"#718198",

              family:"Arial"

            },



            yaxis:{

              title:{
                text:"Transactions"
              },


              gridcolor:"#152338",

              zeroline:false

            },



            yaxis2:{

              overlaying:"y",

              side:"right"

            },



            xaxis:{

              showgrid:false

            },



            legend:{

              orientation:"h",

              y:1.1

            },



            hovermode:"closest"



          }}





          config={{

            responsive:true,

            displayModeBar:false

          }}



          style={{

            width:"100%",

            height:"230px"

          }}



        />



      </div>


    </div>

  );

}