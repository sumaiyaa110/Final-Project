"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";


const Plot = dynamic(() => import("react-plotly.js"), {
  ssr:false,
});



export default function FraudByType(){


  const [fraudTypes,setFraudTypes] = useState<any[]>([]);





  // ======================================
  // REAL TIME FRAUD TYPE DATA
  // ======================================

  useEffect(()=>{


    async function loadFraudTypes(){


      try{


        const response = await fetch(

          "http://localhost:8000/fraud-types",

          {
            cache:"no-store"
          }

        );



        const data = await response.json();



        console.log(
          "Fraud Types:",
          data
        );



        setFraudTypes(data);



      }

      catch(error){


        console.log(
          "Fraud Type API Error:",
          error
        );


      }


    }





    loadFraudTypes();




    const interval = setInterval(

      loadFraudTypes,

      5000

    );



    return ()=>clearInterval(interval);



  },[]);







  const labels = fraudTypes.map(

    (item)=>item.type

  );



  const values = fraudTypes.map(

    (item)=>item.count

  );






  return (


    <div className="fraud-type-card">



      <div className="fraud-type-header">


        <div>


          <h2>
            Fraud Alerts by Type
          </h2>


          <p>
            Distribution of detected fraud alerts by category.
          </p>


        </div>


      </div>







      <div className="fraud-type-chart">



        <Plot



          data={[


            {


              type:"bar",



              x:labels,



              y:values,



              text:values.map(

                (v)=>v.toString()

              ),



              textposition:"outside",



              textfont:{


                color:"#f1f5f9",

                size:11


              },



              marker:{


                color:[

                  "#ef476f",

                  "#8b5cf6",

                  "#3b82f6",

                  "#22d3ee"

                ],



                line:{

                  width:0

                }


              },



              hovertemplate:

                "<b>%{x}</b><br>" +

                "Alerts: %{y}" +

                "<extra></extra>"



            }


          ]}





          layout={{


            autosize:true,



            height:235,



            margin:{


              l:35,

              r:10,

              t:25,

              b:45


            },



            paper_bgcolor:"rgba(0,0,0,0)",



            plot_bgcolor:"rgba(0,0,0,0)",



            bargap:0.38,



            showlegend:false,





            yaxis:{



              showgrid:true,



              gridcolor:"#17263a",



              zeroline:false,



              tickfont:{


                color:"#718198",

                size:10


              },



              title:{


                text:""


              }



            },





            xaxis:{



              showgrid:false,



              zeroline:false,



              tickfont:{


                color:"#718198",

                size:10


              }



            },





            hoverlabel:{



              bgcolor:"#0c1729",



              bordercolor:"#334155",



              font:{


                color:"#e2e8f0",

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