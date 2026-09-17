"use client";


import {
  useEffect,
  useState
} from "react";


import {
  useRouter
} from "next/navigation";





export default function AIRiskInsights() {


  const router = useRouter();



  const [
    insights,
    setInsights
  ] = useState<string[]>([]);



  const [
    time,
    setTime
  ] = useState("");






  // ======================================
  // REAL TIME AI INSIGHTS
  // ======================================


  useEffect(() => {



    async function loadInsights(){



      try{



        const response =
        await fetch(

          "http://localhost:8000/insights",

          {
            cache:"no-store"
          }

        );





        const data =
        await response.json();





        console.log(

          "AI Insights:",

          data

        );





        setInsights(

          data.insights || []

        );





        setTime(

          new Date().toLocaleString()

        );





      }

      catch(error){



        console.log(

          "Insight API Error:",

          error

        );



      }



    }








    // Initial load

    loadInsights();







    // Refresh every 5 seconds

    const interval =
    setInterval(

      loadInsights,

      5000

    );






    return ()=>clearInterval(interval);





  }, []);









  return (



    <div className="ai-insight-strip">






      <div className="ai-insight-strip-icon">

        ✦

      </div>








      <div className="ai-insight-strip-label">

        AI Insight

      </div>








      <div className="ai-insight-strip-message">


        {

          insights.length > 0

          ?

          insights.join(" ")

          :

          "No suspicious patterns detected."

        }



      </div>









      <button


        className="ai-insight-investigate"



        onClick={()=>


          router.push(

            "/investigations"

          )


        }



      >



        Click here to investigate



        <span>

          →

        </span>



      </button>









      <div className="ai-insight-system">



        <span className="ai-status-dot" />



        <span>

          System Online

        </span>



      </div>









      <div className="ai-insight-time">


        {time}



      </div>






    </div>



  );

}