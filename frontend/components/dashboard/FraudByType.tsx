"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { API_URL } from "@/services/api";
import { useTheme } from "@/hooks/useTheme";
import { chartColors } from "@/utils/chartTheme";


const Plot = dynamic(() => import("react-plotly.js"), {
  ssr:false,
});



export default function FraudByType(){

  const chart = chartColors(useTheme());



  const [fraudTypes,setFraudTypes] = useState<any[]>([]);





  // ======================================
  // REAL TIME FRAUD TYPE DATA
  // ======================================

  useEffect(()=>{


    async function loadFraudTypes(){


      try{


        const response = await fetch(

          `${API_URL}/fraud-types`,

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


                color:chart.text,

                size:11


              },



              marker:{


                color:chart.bar,



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



            paper_bgcolor:"rgba(245, 246, 248, 0)",



            plot_bgcolor:"rgba(245, 246, 248, 0)",



            bargap:0.38,



            showlegend:false,





            yaxis:{



              showgrid:true,



              gridcolor:chart.grid,



              zeroline:false,



              tickfont:{


                color:chart.muted,

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


                color:chart.muted,

                size:10


              }



            },





            hoverlabel:{



              bgcolor:chart.hoverBg,



              bordercolor:chart.hoverBorder,



              font:{


                color:chart.text,

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