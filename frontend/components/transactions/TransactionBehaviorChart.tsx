"use client";


import {
useEffect,
useState
} from "react";


import dynamic from "next/dynamic";


const Plot =
dynamic(

()=>import("react-plotly.js"),

{
ssr:false
}

);



import {
getCustomerBehavior
}
from "@/services/api";





export default function TransactionBehaviorChart(){



const [transactions,setTransactions]
=
useState<any[]>([]);




const customerId =
"CUSTOMER-1";





useEffect(()=>{


async function load(){


try{


const data =
await getCustomerBehavior(
customerId
);



setTransactions(
data
);



}

catch(error){

console.log(
error
);

}


}



load();



const interval =
setInterval(

load,

3000

);



return()=>clearInterval(interval);



},[]);









if(transactions.length===0){

return (

<div className="transaction-behavior-card">

Loading...

</div>

);

}






const currentTransaction =
transactions[
transactions.length-1
];



const historical =
transactions.slice(
0,
-1
);




const historicalAverage =

historical.reduce(

(sum,t)=>

sum+t.amount,

0

)

/

Math.max(
historical.length,
1
);




const increase =

currentTransaction.amount

/

historicalAverage;





const ids =

transactions.map(

t=>t.id

);



const amounts =

transactions.map(

t=>t.amount

);





const colors =

transactions.map(t=>{


if(t.riskLevel==="Critical")

return "#ef4444";


if(t.riskLevel==="High")

return "#f97316";


if(t.riskLevel==="Medium")

return "#eab308";


return "#22c55e";


});






return (

<div className="transaction-behavior-card">



<div className="transaction-behavior-header">


<div>

<h2>
Transaction Behavior
</h2>


<p>
Realtime customer transaction pattern
</p>


</div>



<button className="transaction-history-filter">

Live

</button>


</div>









<div className="transaction-behavior-content">



<div className="transaction-behavior-chart">


<Plot


data={[


{

x:ids,

y:amounts,

type:"scatter",

mode:"lines+markers",

name:"Amount",


line:{
width:2.5
},


marker:{

size:9,

color:colors

}


},



{

x:ids,

y:

ids.map(
()=>historicalAverage
),

type:"scatter",

mode:"lines",

name:"Average",


line:{

dash:"dash"

}


}



]}



layout={{


height:300,


paper_bgcolor:
"rgba(0,0,0,0)",


plot_bgcolor:
"rgba(0,0,0,0)",



xaxis:{


showgrid:false

},



yaxis:{


title:"Amount (BDT)"

},



legend:{


orientation:"h"

}



}}



config={{

displayModeBar:false

}}



style={{

width:"100%",

height:"285px"

}}



/>


</div>









<div className="account-risk-summary">


<h3>
Account Risk Summary
</h3>



<div className="account-risk-metrics">


<p>

Typical Amount:

<strong>

৳
{Math.round(
historicalAverage
)}

</strong>

</p>




<p>

Current Amount:

<strong>

৳
{currentTransaction.amount}

</strong>

</p>





<p>

Increase:

<strong>

{Math.round(increase)}×

</strong>

</p>





<p>

Risk Score:

<strong>

{currentTransaction.riskScore}/100

</strong>

</p>





<p>

Risk Level:

<strong>

{currentTransaction.riskLevel}

</strong>

</p>




</div>






<div className="account-risk-insight">


💡 AI Insight:

This transaction is

{" "}

{Math.round(increase)}×

higher than normal activity.



</div>



</div>



</div>


</div>

);


}