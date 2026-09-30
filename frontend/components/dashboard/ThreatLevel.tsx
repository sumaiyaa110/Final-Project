"use client";

interface Props {
  fraudAlerts:number;
  riskEntities:number;
  fraudRate:number;
}


export default function ThreatLevel({
  fraudAlerts,
  riskEntities,
  fraudRate
}:Props){


const score =
Math.min(
100,
(fraudAlerts * 2) +
(riskEntities * 10) +
(fraudRate * 20)
);


let level="LOW";

if(score>70)
 level="HIGH";
else if(score>40)
 level="MEDIUM";


return(

<div className="dashboard-card">

<h3>
System Threat Level
</h3>


<div className="threat-score">

{Math.round(score)}/100

</div>


<div className="threat-level">
{level}
</div>


<p>
Based on:
</p>


<ul>

<li>
{fraudAlerts} fraud alerts
</li>

<li>
{riskEntities} risky entities
</li>

<li>
Fraud rate {fraudRate}%
</li>

</ul>


</div>

)

}