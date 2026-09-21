"use client";


import Link from "next/link";

import {
    useEffect,
    useMemo,
    useState
} from "react";


import AdminLayout from "@/components/layout/AdminLayout";

import TransactionSummary from "@/components/transactions/TransactionSummary";


import {
    getTransactions
} from "@/services/api";





type Transaction = {

    id:string;

    type:string;

    amount:string;

    score:number;

    level:string;

    status:string;

    customer:string;

    device:string;

    time:string;

};








export default function TransactionsPage(){


const [transactions,setTransactions] =
useState<Transaction[]>([]);



const [search,setSearch]=
useState("");



const [riskLevel,setRiskLevel]=
useState("all");



const [transactionType,setTransactionType]=
useState("all");



const [dateRange,setDateRange]=
useState("7");



const [currentPage,setCurrentPage]=
useState(1);



const [openAction,setOpenAction]=
useState<string|null>(null);



const [customerFilter,setCustomerFilter]=
useState("");



const [deviceFilter,setDeviceFilter]=
useState("");



const [isLive,setIsLive]=
useState(false);



const [lastUpdated,setLastUpdated]=
useState<Date|null>(null);




const rowsPerPage=10;








// =====================================================
// REALTIME TRANSACTION FETCH
// =====================================================


useEffect(()=>{


let mounted=true;



async function loadTransactions(){


try{


const data =
await getTransactions();



if(mounted){


setTransactions(
data
);



setIsLive(true);



setLastUpdated(
new Date()
);


}



}


catch(error){


console.log(
"Transaction API Error:",
error
);



setIsLive(false);


}



}




// first load

loadTransactions();




// realtime refresh

const interval =
setInterval(

loadTransactions,

2000

);




return()=>{


mounted=false;


clearInterval(interval);


};



},[]);









// =====================================================
// URL FILTER
// =====================================================


useEffect(()=>{


const params =
new URLSearchParams(
window.location.search
);



setCustomerFilter(

params.get("customer")
||
""

);


setDeviceFilter(

params.get("device")
||
""

);


},[]);









// =====================================================
// FILTER
// =====================================================


const filteredTransactions =

useMemo(()=>{


const value =
search
.toLowerCase()
.trim();




return transactions.filter(

(transaction)=>{



const matchesSearch =


value===""

||

transaction.id
.toLowerCase()
.includes(value)


||

transaction.customer
.toLowerCase()
.includes(value)


||

transaction.device
.toLowerCase()
.includes(value);








const matchesRisk =


riskLevel==="all"

||

transaction.level
.toLowerCase()
===riskLevel;








const matchesType =


transactionType==="all"

||

transaction.type
.toLowerCase()
.replace(" ","-")
===transactionType;








const matchesCustomer =


customerFilter===""

||

transaction.customer
.toLowerCase()
.includes(
customerFilter.toLowerCase()
);








const matchesDevice =


deviceFilter===""

||

transaction.device
.toLowerCase()
.includes(
deviceFilter.toLowerCase()
);







return (

matchesSearch

&&

matchesRisk

&&

matchesType

&&

matchesCustomer

&&

matchesDevice

);



}



);



},[

transactions,

search,

riskLevel,

transactionType,

customerFilter,

deviceFilter

]);









// =====================================================
// PAGINATION
// =====================================================


const totalPages =

Math.max(

1,

Math.ceil(

filteredTransactions.length /

rowsPerPage

)

);




const safePage =

Math.min(

currentPage,

totalPages

);




const startIndex =

(safePage-1)

*

rowsPerPage;





const visibleTransactions =

filteredTransactions.slice(

startIndex,

startIndex+rowsPerPage

);









function clearFilter(){


setCustomerFilter("");

setDeviceFilter("");



window.history.replaceState(
{},
"",
"/transactions"
);

setRiskLevel("all");


}









return (

<AdminLayout>


<div className="transactions-page">






<div className="transactions-page-header">



<div>


<h1>
Transactions
</h1>



<p>
Monitor and investigate transaction activity across the platform.
</p>





<div className="transaction-live-status">


<span

className={

isLive

?

"live-dot"

:

"offline-dot"

}

/>



{

isLive

?

"Live Updating"

:

"Offline"

}



{

lastUpdated &&

(

<small>

Last update:

{" "}

{

lastUpdated.toLocaleTimeString()

}

</small>

)

}



</div>



</div>






<button className="transactions-export-button">

↓ Export Data

</button>




</div>









{/* FILTER INFO */}

{

(customerFilter || deviceFilter)

&&


<div className="transactions-customer-filter">


<div>


<strong>

{

customerFilter

?

"Customer Transactions"

:

"Device Transactions"

}


</strong>



<p>

{

customerFilter

||

deviceFilter

}

</p>



</div>




<button

onClick={clearFilter}

>

Clear Filter ×

</button>



</div>



}









<div className="transactions-filter-card">






<div className="transactions-search">


<span>
⌕
</span>



<input


value={search}



onChange={

e=>{


setSearch(
e.target.value
);


setCurrentPage(1);



}

}



placeholder="Search transaction ID, customer, device..."



/>



</div>







<select

value={riskLevel}

onChange={

e=>

setRiskLevel(
e.target.value
)

}

>


<option value="all">
All Risk Levels
</option>


<option value="critical">
Critical
</option>


<option value="high">
High
</option>


<option value="medium">
Medium
</option>


<option value="low">
Low
</option>



</select>







<select

value={transactionType}

onChange={

e=>

setTransactionType(
e.target.value
)

}

>


<option value="all">
All Types
</option>


<option value="cash-out">
Cash Out
</option>


<option value="transfer">
Transfer
</option>


<option value="payment">
Payment
</option>


<option value="cash-in">
Cash In
</option>



</select>







<select

value={dateRange}

onChange={

e=>

setDateRange(
e.target.value
)

}

>


<option value="1">
Today
</option>


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









<TransactionSummary />









<div className="transactions-table-card">





<div className="transactions-table-header">



<div>


<h2>
Transaction Records
</h2>


<p>
Recent transaction activity and risk assessments.
</p>


</div>



<span className="transaction-count">

{

filteredTransactions.length

}

Results

</span>



</div>









<div className="transactions-table-wrapper">


<table className="transactions-table">


<thead>


<tr>


<th>
Transaction ID
</th>


<th>
Type
</th>


<th>
Amount
</th>


<th>
Risk Score
</th>


<th>
Risk Level
</th>


<th>
Status
</th>


<th>
Customer
</th>


<th>
Device
</th>


<th>
Time
</th>


<th>
Action
</th>


</tr>


</thead>









<tbody>



{

visibleTransactions.length===0


?

<tr>

<td

colSpan={10}

className="transactions-empty-state"

>

No transactions found

</td>


</tr>



:


visibleTransactions.map(

(transaction)=>(


<tr

key={transaction.id}

>



<td className="transaction-id">

{transaction.id}

</td>




<td className="transaction-type-cell">

    {transaction.type}

</td>




<td className="transaction-amount">

{transaction.amount}

</td>







<td>


<div className="transaction-risk">


<div className="transaction-risk-bar">


<span

style={{

width:

`${transaction.score}%`

}}

/>


</div>



<strong>

{transaction.score}

</strong>



</div>


</td>







<td>


<span

className={

`transaction-risk-badge ${

transaction.level.toLowerCase()

}`

}

>

{transaction.level}

</span>


</td>








<td>


<span className="transaction-status">

{transaction.status}

</span>


</td>








<td>


<Link

href={

`/customers/${transaction.customer}`

}

>

{transaction.customer}

</Link>


</td>








<td>

{transaction.device}

</td>








<td>

{transaction.time}

</td>








<td className="transaction-action-cell">


<button

className="transaction-action-button"

onClick={(e)=>{

e.stopPropagation();

setOpenAction(
openAction===transaction.id
?
null
:
transaction.id
);

}}

>
•••
</button>


{
openAction===transaction.id &&

<div className="transaction-action-menu">


<Link
href={`/transactions/${transaction.id}`}
>
View Transaction
</Link>


<Link
href={`/customers/${transaction.customer}`}
>
View Customer
</Link>


<Link
href={`/investigations/${transaction.id}`}
>
Investigate
</Link>


</div>

}


</td>






</tr>


)


)


}



</tbody>


</table>



</div>









<div className="transactions-pagination">



<span>

Showing


<strong>

&nbsp;

{

filteredTransactions.length===0

?

0

:

startIndex+1

}

-

{

Math.min(

startIndex+rowsPerPage,

filteredTransactions.length

)

}

&nbsp;

</strong>


of


<strong>

&nbsp;

{

filteredTransactions.length

}

&nbsp;

</strong>


transactions


</span>








<div className="pagination-buttons">


<button


disabled={safePage===1}


onClick={

()=>setCurrentPage(

safePage-1

)

}


>

‹

</button>





<button>

{safePage}

</button>






<button


disabled={safePage===totalPages}


onClick={

()=>setCurrentPage(

safePage+1

)

}


>

›

</button>




</div>




</div>






</div>





</div>



</AdminLayout>


);



}