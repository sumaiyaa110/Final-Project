"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";


import AdminLayout from "@/components/layout/AdminLayout";

import {
  getReports
} from "@/services/api";



type Report = {

  id:string;

  name:string;

  type:
  "Fraud"
  |
  "Transaction"
  |
  "Risk"
  |
  "Investigation";

  period:string;

  records:string;

  generated:string;

  status:
  "Ready"
  |
  "Generating";

};





export default function ReportsPage(){



const [reportList,setReportList] = 
useState<Report[]>([]);



const [search,setSearch] =
useState("");



const [typeFilter,setTypeFilter] =
useState("All Report Types");



const [dateFilter,setDateFilter] =
useState("All Dates");



const [loading,setLoading] =
useState(true);





// ======================================
// REAL TIME REPORT FETCH
// ======================================


useEffect(()=>{


async function loadReports(){


try{


const data = await getReports();


setReportList(data);


}

catch(error){


console.log(
"Reports API Error:",
error
);


}

finally{


setLoading(false);


}


}



loadReports();



// refresh every 5 seconds

const interval =
setInterval(

loadReports,

5000

);



return()=>clearInterval(interval);



},[]);









// ======================================
// FILTER
// ======================================


const filteredReports = useMemo(()=>{


return reportList.filter((report)=>{


const value =
search.toLowerCase();



const matchesSearch =


report.id
.toLowerCase()
.includes(value)



||

report.name
.toLowerCase()
.includes(value);



const matchesType =


typeFilter==="All Report Types"



||

report.type===typeFilter;





const matchesDate =


dateFilter==="All Dates"



||

report.period
.includes("Real Time");





return (

matchesSearch

&&

matchesType

&&

matchesDate

);



});


},[
reportList,
search,
typeFilter,
dateFilter
]);









function resetFilters(){


setSearch("");

setTypeFilter(
"All Report Types"
);

setDateFilter(
"All Dates"
);


}









async function generateReport(){


try{


const data =
await getReports();


setReportList(data);



}

catch(error){


console.log(
error
);


}



}









return (

<AdminLayout>


<div className="reports-page">





{/* HEADER */}


<div className="reports-page-header">


<div>


<h1>
Reports
</h1>


<p>
Generate and review fraud monitoring and investigation reports.
</p>


</div>



<button

className="reports-generate-button"

onClick={generateReport}

>

+ Generate Report

</button>



</div>








{/* SUMMARY */}



<div className="reports-summary-grid">



<div className="reports-summary-card">

<span>
Total Reports
</span>


<strong>
{reportList.length}
</strong>


</div>





<div className="reports-summary-card">

<span>
Fraud Reports
</span>


<strong>

{
reportList.filter(
r=>r.type==="Fraud"
).length
}

</strong>


</div>





<div className="reports-summary-card">

<span>
Risk Reports
</span>


<strong>

{
reportList.filter(
r=>r.type==="Risk"
).length
}

</strong>


</div>






<div className="reports-summary-card">

<span>
Investigation Reports
</span>


<strong>

{
reportList.filter(
r=>r.type==="Investigation"
).length
}

</strong>


</div>




</div>










{/* FILTERS */}



<div className="reports-filter-card">



<div className="reports-search">


<span>
⌕
</span>


<input


placeholder="Search reports..."


value={search}


onChange={(e)=>
setSearch(
e.target.value
)
}


/>


</div>







<select

value={typeFilter}

onChange={(e)=>
setTypeFilter(
e.target.value
)
}

>


<option>
All Report Types
</option>

<option>
Fraud
</option>

<option>
Transaction
</option>

<option>
Risk
</option>

<option>
Investigation
</option>


</select>







<select

value={dateFilter}

onChange={(e)=>
setDateFilter(
e.target.value
)
}

>


<option>
All Dates
</option>


<option>
Last 7 Days
</option>


<option>
Last 30 Days
</option>



</select>







<button

className="reports-reset-button"

onClick={resetFilters}

>

Reset

</button>



</div>









{/* TABLE */}



<div className="reports-table-card">



<div className="reports-table-header">


<div>


<h2>
Available Reports
</h2>


<p>
Previously generated monitoring reports.
</p>


</div>



</div>









<div className="reports-table-wrapper">



<table className="reports-table">


<thead>


<tr>

<th>
REPORT ID
</th>


<th>
REPORT NAME
</th>


<th>
TYPE
</th>


<th>
PERIOD
</th>


<th>
RECORDS
</th>


<th>
GENERATED
</th>


<th>
STATUS
</th>


<th>
ACTION
</th>


</tr>


</thead>








<tbody>



{

loading

?


<tr>

<td

colSpan={8}

className="reports-empty"

>

Loading reports...

</td>

</tr>



:



filteredReports.length===0



?



<tr>

<td

colSpan={8}

className="reports-empty"

>

No reports found.

</td>

</tr>



:



filteredReports.map(
(report)=>(


<tr key={report.id}>




<td className="report-id">

{report.id}

</td>





<td className="report-name">

{report.name}

</td>







<td>


<span

className={

`report-type ${

report.type.toLowerCase()

}`

}

>


{report.type}


</span>


</td>







<td>

{report.period}

</td>







<td>

{report.records}

</td>







<td>

{report.generated}

</td>







<td>


<span

className={

`report-status ${

report.status.toLowerCase()

}`

}

>


{report.status}


</span>


</td>









<td>


<div className="report-action-buttons">


<button

className="report-view-button"


onClick={()=>


alert(

`${report.name}

Report ID: ${report.id}

Records: ${report.records}`

)

}

>

View

</button>







<button

className="report-download-button"


onClick={()=>


alert(
"Export API will be connected later."
)

}

>

Export

</button>



</div>



</td>





</tr>


)

)



}




</tbody>




</table>



</div>









<div className="reports-pagination">


<span>

Showing {filteredReports.length}

of {reportList.length}

reports

</span>



</div>






</div>








</div>



</AdminLayout>


);



}