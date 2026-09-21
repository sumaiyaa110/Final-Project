"use client";

import CountUp from "react-countup";


type KPICardProps = {
  title: string;
  value: number | string;
  change: string;
  description: string;
  icon: string;
  trend: "up" | "down";
  variant: "blue" | "red" | "yellow" | "green";
};



export default function KPICard({

  title,
  value,
  change,
  description,
  icon,
  trend,
  variant,

}: KPICardProps) {


  return (

    <div className={`kpi-card kpi-${variant}`}>


      {/* Top section */}

      <div className="kpi-card-top">


        <div>


          <p className="kpi-title">

            {title}

          </p>



          <h2 className="kpi-value">


            {
              typeof value === "number" ? (

                <span className="kpi-number">
                    <CountUp

                      start={0}

                      end={value}

                      duration={1.2}

                      separator=","

                      className="kpi-number"

                    />

                </span>


              ) : (

                <span className="kpi-number">

                  {value}

                </span>

              )
            }


          </h2>


        </div>




        <div className="kpi-icon">

          {icon}

        </div>


      </div>






      {/* Bottom section */}

      <div className="kpi-card-bottom">


        <span className={`kpi-change kpi-change-${trend}`}>

          {trend === "up" ? "↗" : "↘"} {change}

        </span>



        <span className="kpi-description">

          {description}

        </span>


      </div>


    </div>

  );

}