// Loaded lazily (React.lazy) so recharts stays out of the initial bundle.
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fmtTick=d=>new Date(d+"T12:00:00Z").toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
const fmtLabel=d=>new Date(d+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});

// Line chart of average rank over time; rank 1 at the top.
export default function FormChart({data,players,colors}){
  if(data.length<2)return <div className="empty">Not enough days yet for a trend.</div>;
  const last=data[data.length-1];
  const vals=data.flatMap(r=>players.map(p=>r[p]));
  const lo=Math.max(1,Math.floor(Math.min(...vals)*2)/2);
  const hi=Math.min(5,Math.ceil(Math.max(...vals)*2)/2);
  const step=hi-lo>2?1:0.5;
  const ticks=[];
  for(let v=lo;v<=hi+1e-9;v+=step)ticks.push(+v.toFixed(1));
  // One x tick per month (first day present), thinned to at most 6.
  let xTicks=data.filter((r,i)=>i===0||r.date.slice(0,7)!==data[i-1].date.slice(0,7)).map(r=>r.date);
  if(xTicks.length>6){const every=Math.ceil(xTicks.length/6);xTicks=xTicks.filter((_,i)=>i%every===0);}
  return(<>
    <div className="chart">
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{top:6,right:20,left:0,bottom:0}}>
          <CartesianGrid stroke="var(--border)" vertical={false}/>
          <XAxis dataKey="date" tickFormatter={fmtTick} ticks={xTicks} interval={0}
            tick={{fill:"var(--faint)",fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis reversed domain={[lo,hi]} ticks={ticks} width={34}
            tick={{fill:"var(--faint)",fontSize:11}} axisLine={false} tickLine={false}/>
          <Tooltip
            contentStyle={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,boxShadow:"var(--shadow)",fontSize:12}}
            labelStyle={{color:"var(--muted)",marginBottom:4}} itemStyle={{padding:0}}
            labelFormatter={fmtLabel} formatter={(v,n)=>[v.toFixed(2),n]}
            itemSorter={item=>item.value}/>
          {players.map(p=>(
            <Line key={p} type="monotone" dataKey={p} stroke={colors[p]} strokeWidth={2.2} dot={false} isAnimationActive={false}/>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="legend">
      {[...players].sort((a,b)=>last[a]-last[b]).map(p=>(
        <span key={p}><i className="gdot" style={{background:colors[p]}}/>{p} <b>{last[p].toFixed(2)}</b></span>
      ))}
    </div>
  </>);
}
