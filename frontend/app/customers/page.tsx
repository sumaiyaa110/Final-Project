"use client";


import {
    useEffect,
    useMemo,
    useState
} from "react";


import {
    useRouter,
    useSearchParams
} from "next/navigation";


import AdminLayout from "@/components/layout/AdminLayout";


import {
    getCustomers
} from "@/services/api";





type RiskLevel =
    "High"
    |
    "Medium"
    |
    "Low";



type CustomerStatus =
    "Active"
    |
    "Suspended";




type Customer = {

    id:string;

    name:string;

    risk:RiskLevel;

    transactions:number;

    lastActivity:string;

    status:CustomerStatus;

    devices:string[];

};








export default function CustomersPage(){



const router =
useRouter();



const searchParams =
useSearchParams();



const deviceFilter =
searchParams.get("device") || "";





// =====================================================
// REALTIME DATA
// =====================================================


const [
    customers,
    setCustomers
]
=
useState<Customer[]>([]);



const [
    loading,
    setLoading
]
=
useState(true);






useEffect(()=>{


async function loadCustomers(){


try{


const data =
await getCustomers();



setCustomers(data);



}

catch(error){


console.log(
"Customer API Error:",
error
);


}


finally{


setLoading(false);


}



}



loadCustomers();



const interval =
setInterval(

loadCustomers,

5000

);



return ()=>clearInterval(interval);



},[]);









// =====================================================
// FILTER STATES
// =====================================================


const [
search,
setSearch
]
=
useState("");



const [
riskFilter,
setRiskFilter
]
=
useState(
"All Risk Levels"
);



const [
statusFilter,
setStatusFilter
]
=
useState(
"All Statuses"
);



const [
openMenu,
setOpenMenu
]
=
useState<string|null>(
null
);









// =====================================================
// FILTER
// =====================================================


const filteredCustomers =
useMemo(()=>{


const value =
search
.toLowerCase()
.trim();



return customers.filter(
(customer)=>{


const matchSearch =


value===""

||

customer.id
.toLowerCase()
.includes(value)



||

customer.name
.toLowerCase()
.includes(value);





const matchRisk =


riskFilter==="All Risk Levels"

||

customer.risk===riskFilter;





const matchStatus =


statusFilter==="All Statuses"

||

customer.status===statusFilter;





const matchDevice =


deviceFilter===""

||

customer.devices.includes(
deviceFilter
);





return (

matchSearch

&&

matchRisk

&&

matchStatus

&&

matchDevice

);



}

);



},
[
customers,
search,
riskFilter,
statusFilter,
deviceFilter
]);









function resetFilters(){


setSearch("");

setRiskFilter(
"All Risk Levels"
);

setStatusFilter(
"All Statuses"
);


router.replace(
"/customers"
);


}








function clearDeviceFilter(){


router.replace(
"/customers"
);


}








return (

<AdminLayout>


<div className="customers-page">





<div className="customers-page-header">


<div>

<h1>
Customers
</h1>


<p>
View and manage customer information, risk levels and activity.
</p>


</div>


</div>









{
deviceFilter &&

<div className="customers-device-filter-banner">


<div className="customers-device-filter-info">


<span>
Showing customers using device
</span>



<strong>
{deviceFilter}
</strong>


</div>



<button
onClick={clearDeviceFilter}
>

Clear Device Filter ×

</button>



</div>

}









<div className="customers-filter-card">





<div className="customer-search-wrapper">


<span className="customer-search-icon">

⌕

</span>



<input

placeholder="Search by customer ID or name..."

value={search}

onChange={
(e)=>
setSearch(
e.target.value
)
}

/>



</div>







<select

value={riskFilter}

onChange={
(e)=>
setRiskFilter(
e.target.value
)
}

>


<option>
All Risk Levels
</option>


<option>
High
</option>


<option>
Medium
</option>


<option>
Low
</option>


</select>







<select

value={statusFilter}

onChange={
(e)=>
setStatusFilter(
e.target.value
)
}

>


<option>
All Statuses
</option>


<option>
Active
</option>


<option>
Suspended
</option>


</select>







<button

className="customers-reset-button"

onClick={resetFilters}

>

Reset

</button>



</div>









<div className="customers-table-card">





<div className="customers-table-header">


<div>


<h2>
Customer Records
</h2>


<p>
Registered customers and their current risk activity.
</p>


</div>


<span className="customers-count">

{filteredCustomers.length}
Results

</span>


</div>









<div className="customers-table-wrapper">



<table className="customers-table">



<thead>

<tr>

<th>
Customer ID
</th>


<th>
Name
</th>


<th>
Risk Level
</th>


<th>
Total Transactions
</th>


<th>
Last Activity
</th>


<th>
Status
</th>


<th>
Actions
</th>


</tr>


</thead>









<tbody>



{


loading


?


<tr>

<td
colSpan={7}
className="customers-empty-state"
>

Loading customers...

</td>

</tr>





:


filteredCustomers.length===0


?


<tr>

<td

colSpan={7}

className="customers-empty-state"

>

No customers found.

</td>


</tr>







:


filteredCustomers.map(
(customer)=>(



<tr key={customer.id}>


<td className="customer-id-cell">

{customer.id}

</td>





<td className="customer-name-cell">

{customer.name}

</td>







<td>


<span

className={

`customer-risk-badge risk-${customer.risk.toLowerCase()}`

}

>

{customer.risk}

</span>


</td>







<td>

{customer.transactions}

</td>








<td>

{customer.lastActivity}

</td>








<td>


<span

className={

`customer-status-badge status-${customer.status.toLowerCase()}`

}

>


<span className="customer-status-dot"/>


{customer.status}


</span>


</td>








<td>


<div className="customer-action-wrapper">


<button

className="customer-action-button"

onClick={()=>


setOpenMenu(

openMenu===customer.id

?

null

:

customer.id

)

}

>

•••

</button>







{

openMenu===customer.id

&&


<div className="customer-action-menu">


<button

onClick={()=>


router.push(
`/customers/${customer.id}`
)

}

>

View Customer

</button>





<button

onClick={()=>


router.push(
`/transactions?customer=${customer.id}`
)

}

>

View Transactions

</button>





<button

onClick={()=>


router.push(
`/alerts?customer=${customer.id}`
)

}

>

View Alerts

</button>



</div>

}



</div>


</td>






</tr>


)


)



}



</tbody>






</table>



</div>









<div className="customers-pagination">


<div>

Showing

<strong>

&nbsp;
{filteredCustomers.length}
&nbsp;

</strong>

customers

</div>



</div>






</div>







</div>



</AdminLayout>


);


}