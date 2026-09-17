"use client";


import {
useEffect,
useState
} from "react";


import {
getTransactionSummary
}
from "@/services/api";





export default function TransactionSummary(){



const [summary,setSummary] =
useState<any>(null);





useEffect(()=>{


async function loadSummary(){


try{


const data =
await getTransactionSummary();



setSummary(
data
);



}

catch(error){

console.log(
"Summary API Error:",
error
);

}


}





loadSummary();




const interval =
setInterval(

loadSummary,

3000

);




return()=>clearInterval(interval);



},[]);







const summaryItems = [


{
title:"Total Transactions",

value:

summary

?

summary.total_transactions.toLocaleString()

:

"Loading...",


description:"Total Transactions",

icon:"▤",

type:"blue"

},




{

title:"High Risk Transactions",


value:

summary

?

summary.high_risk_transactions.toLocaleString()

:

"Loading...",


description:"High Risk Transactions",

icon:"⚠",

type:"red"


},





{

title:"Fraud Rate",


value:

summary

?

`${summary.fraud_rate}%`

:

"Loading...",


description:"Fraud Rate",

icon:"↗",

type:"purple"


},





{

title:"Total Amount",


value:

summary

?

`৳ ${(summary.total_amount/1000000).toFixed(2)}M`

:

"Loading...",


description:"Total Amount",

icon:"◉",

type:"green"


}


];







return (


<div className="transaction-summary-grid">


{

summaryItems.map((item)=>(


<div

className={

`transaction-summary-card summary-${item.type}`

}

key={item.title}

>



<div className="transaction-summary-icon">

{item.icon}

</div>





<div className="transaction-summary-content">


<h3>

{item.value}

</h3>



<p>

{item.description}

</p>



</div>




</div>



))


}



</div>


);


}