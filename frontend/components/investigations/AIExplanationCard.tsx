type Props = {
  data:any;
};


export default function AIExplanationCard({
  data
}:Props){

return (

<div className="ai-explanation-card">


<h2>
AI Risk Analysis
</h2>


<div className="ai-risk-score">

{data.risk_score}%

</div>


<p>
Confidence:
<strong>
 {data.confidence}
</strong>
</p>


<p>
Model:
{data.model}
</p>


<h3>
Why flagged?
</h3>


<ul>

{
data.reasons.map(
(reason:string,index:number)=>(
<li key={index}>
✓ {reason}
</li>
)
)
}

</ul>


</div>

)

}