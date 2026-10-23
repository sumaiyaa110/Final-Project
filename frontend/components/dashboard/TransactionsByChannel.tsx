"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { API_URL } from "@/services/api";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});


export default function TransactionsByChannel() {


  const [channels, setChannels] = useState<any[]>([]);



  // ======================================
  // REAL TIME CHANNEL DATA
  // ======================================

  useEffect(() => {


    async function loadChannels(){


      try {


        const response = await fetch(

          `${API_URL}/channel-distribution`,

          {
            cache:"no-store"
          }

        );


        const data = await response.json();



        console.log(
          "Channel Distribution:",
          data
        );



        setChannels(data);



      }

      catch(error){


        console.log(
          "Channel API Error:",
          error
        );


      }


    }




    loadChannels();



    const interval = setInterval(

      loadChannels,

      5000

    );



    return ()=>clearInterval(interval);



  }, []);





  const labels = channels.map(

    (item)=>item.channel

  );



  const values = channels.map(

    (item)=>item.count

  );



  const totalTransactions = values.reduce(

    (sum,value)=>sum+value,

    0

  );





  return (


    <div className="channel-chart-card">


      <div className="channel-chart-header">


        <div>

          <h2>
            Transactions by Channel
          </h2>


          <p>
            Distribution of transaction activity across channels.
          </p>


        </div>


      </div>





      <div className="channel-chart">



        <Plot



          data={[


            {


              type:"pie",



              labels:labels,



              values:values,



              hole:0.62,



              sort:false,



              domain:{

                x:[0.02,0.6],

                y:[0.1,0.9]

              },



              textinfo:"percent",



              textposition:"inside",



              textfont:{

                color:"#272a2f",

                size:11

              },



              marker:{


                colors:[

                  "#3d5a80",

                  "#6b9ac4",

                  "#c8963e",

                  "#5a8f73",

                  "#9aa3b2"

                ],



                line:{

                  color:"#ffffff",

                  width:2

                }


              },



              hovertemplate:

                "<b>%{label}</b><br>" +

                "Transactions: %{value}" +

                "<extra></extra>"



            }


          ]}





          layout={{


            autosize:true,


            height:235,



            margin:{

              l:0,

              r:0,

              t:0,

              b:0

            },



            paper_bgcolor:"rgba(245, 246, 248, 0)",



            plot_bgcolor:"rgba(245, 246, 248, 0)",



            showlegend:true,



            legend:{


              orientation:"v",


              x:0.64,


              y:0.5,


              xanchor:"left",


              yanchor:"middle",



              font:{

                color:"#535965",

                size:10

              },


              bgcolor:"rgba(245, 246, 248, 0)"


            },





            annotations:[


              {


                text:`<b>${totalTransactions.toLocaleString()}</b>`,



                x:0.31,

                y:0.5,



                xref:"paper",

                yref:"paper",



                showarrow:false,



                font:{

                  color:"#1b1d20",

                  size:18

                }


              },




              {


                text:"Total",



                x:0.31,

                y:0.4,



                xref:"paper",

                yref:"paper",



                showarrow:false,



                font:{

                  color:"#606776",

                  size:10

                }


              }


            ],





            hoverlabel:{


              bgcolor:"#ffffff",


              bordercolor:"#dfe1e5",


              font:{

                color:"#272a2f",

                size:10

              }


            }


          }}





          config={{


            responsive:true,

            displayModeBar:false,

            displaylogo:false


          }}





          style={{


            width:"100%",

            height:"235px"


          }}





        />



      </div>



    </div>


  );

}