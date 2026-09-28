import { useState, useMemo } from "react";
import SEED_DATA from "./data.json";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const PLAYERS   = ["Nick","Andy","Yan","Rishi"];
const ALL_GAMES = ["Wordle","Connections","Tango","Queens","Pinpoint","Patches","Zip"];
const LB_GAMES  = ALL_GAMES;
const DEFAULT_RANK = 5;

const GAME_COLOR = {Wordle:"#4ade80",Connections:"#60a5fa",Tango:"#a78bfa",Queens:"#34d399",Pinpoint:"#fbbf24",Patches:"#f472b6",Zip:"#fb923c"};
const GAME_ABBR  = {Wordle:"W",Connections:"C",Tango:"T",Queens:"Q",Pinpoint:"Pt",Patches:"Pa",Zip:"Z"};
const P_COLOR    = {Nick:"#ef4444",Andy:"#3b82f6",Yan:"#8b5cf6",Rishi:"#f59e0b"};
const P_INIT     = {Nick:"NW",Andy:"AS",Yan:"YJ",Rishi:"R"};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function rankTotals(totals) {
  const sorted=[...PLAYERS].sort((a,b)=>totals[a]-totals[b]);
  const out={};
  let i=0;
  while(i<sorted.length){
    let j=i;
    while(j<sorted.length-1&&totals[sorted[j+1]]===totals[sorted[i]])j++;
    for(let k=i;k<=j;k++)out[sorted[k]]=i+1;
    i=j+1;
  }
  return out;
}

function gameHasData(ranks,game){
  return Object.values(ranks[game]||{}).some(v=>v<DEFAULT_RANK);
}

function activeGamesForDay(ranks,games,punish){
  return games.filter(g=>{
    if(!gameHasData(ranks,g))return false;
    if(!punish)return PLAYERS.every(p=>(ranks[g]?.[p]??DEFAULT_RANK)<DEFAULT_RANK);
    return true;
  });
}

function computeTotals(ranks,games,punish=true){
  const ag=activeGamesForDay(ranks,games,punish);
  const totals={};
  PLAYERS.forEach(p=>{totals[p]=ag.reduce((s,g)=>s+(ranks[g]?.[p]??DEFAULT_RANK),0);});
  return{totals,dayRanks:rankTotals(totals),activeGames:ag};
}

function standings(days,games,punish=true){
  const pts={},wins={},played={};
  PLAYERS.forEach(p=>{pts[p]=0;wins[p]=0;played[p]=0;});
  days.forEach(d=>{
    const{totals,dayRanks,activeGames}=computeTotals(d.ranks,games,punish);
    if(activeGames.length===0)return;
    PLAYERS.forEach(p=>{
      pts[p]+=totals[p];
      // count days player actually participated in at least one active game
      if(activeGames.some(g=>(d.ranks[g]?.[p]??DEFAULT_RANK)<DEFAULT_RANK))played[p]++;
    });
    PLAYERS.filter(p=>dayRanks[p]===1).forEach(p=>wins[p]++);
  });
  const sorted=[...PLAYERS].sort((a,b)=>pts[a]-pts[b]);
  return{pts,wins,played,sorted,ranks:rankTotals(pts)};
}

function gamePts(days,game,punish=true){
  const pts={},played={};
  PLAYERS.forEach(p=>{pts[p]=0;played[p]=0;});
  const counted=days.filter(d=>{
    if(!gameHasData(d.ranks,game))return false;
    if(!punish)return PLAYERS.every(p=>(d.ranks[game]?.[p]??DEFAULT_RANK)<DEFAULT_RANK);
    return true;
  });
  counted.forEach(d=>{
    PLAYERS.forEach(p=>{
      pts[p]+=(d.ranks[game]?.[p]??DEFAULT_RANK);
      if((d.ranks[game]?.[p]??DEFAULT_RANK)<DEFAULT_RANK)played[p]++;
    });
  });
  return{pts,played,days:counted.length,sorted:[...PLAYERS].sort((a,b)=>pts[a]-pts[b]),ranks:rankTotals(pts)};
}

function calcStreak(days,punish){
  // Current winning streak per player (consecutive day wins going back from most recent)
  const streaks={};
  PLAYERS.forEach(p=>streaks[p]=0);
  const rev=[...days].reverse();
  const done=new Set();
  for(const d of rev){
    const{dayRanks,activeGames}=computeTotals(d.ranks,LB_GAMES,punish);
    if(activeGames.length===0)continue;
    PLAYERS.forEach(p=>{
      if(!done.has(p)){
        if(dayRanks[p]===1)streaks[p]++;
        else done.add(p);
      }
    });
    if(done.size===PLAYERS.length)break;
  }
  return streaks;
}

function fmtDate(iso){
  return new Date(iso+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}
function fmtMonth(ym){
  const[y,m]=ym.split("-");
  return new Date(y,m-1,1).toLocaleDateString("en-GB",{month:"short",year:"numeric"});
}
function fmtDateY(iso){
  return new Date(iso+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"});
}
function firstDate(){return SEED_DATA[0].date;}
function lastDate(){return SEED_DATA[SEED_DATA.length-1].date;}
function monthsBetween(from,to){
  const ms=[];let[y,mo]=from.split("-").map(Number);
  const[ey,em]=to.split("-").map(Number);
  while(y<ey||(y===ey&&mo<=em)){
    ms.push(`${y}-${String(mo).padStart(2,"0")}`);
    mo++;if(mo>12){mo=1;y++;}
  }
  return ms;
}

// ─── DATA COVERAGE ────────────────────────────────────────────────────────────
const LATEST_YEAR  = lastDate().slice(0,4);
const DATA_MONTHS  = new Set(SEED_DATA.map(d=>d.date.slice(0,7)));
const ALL_MONTHS   = monthsBetween(firstDate().slice(0,7),lastDate().slice(0,7));
const EMPTY_MONTHS = ALL_MONTHS.filter(m=>!DATA_MONTHS.has(m));
// Consecutive empty months collapsed into ranges, e.g. ["Jul 2023–Jan 2025"]
const GAP_RANGES = EMPTY_MONTHS.reduce((acc,m)=>{
  const last=acc[acc.length-1];
  const prev=last&&monthsBetween(last[1],m);
  if(prev&&prev.length===2)last[1]=m;else acc.push([m,m]);
  return acc;
},[]).map(([a,b])=>a===b?fmtMonth(a):`${fmtMonth(a)}–${fmtMonth(b)}`);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#f0efe9;min-height:100vh}
.app{min-height:100vh;background:#f0efe9;font-family:'DM Sans',sans-serif;color:#111;font-size:14px}
.hdr{background:#111;color:#f0efe9;padding:12px 16px 0;position:sticky;top:0;z-index:100}
.hdr-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.logo{font-family:'Instrument Serif',serif;font-size:22px;letter-spacing:-0.3px;flex-shrink:0}
.logo em{font-style:italic;color:#a3e635}
.hdr-sub{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.28);letter-spacing:.5px;line-height:1.4}
.tog-btn{margin-left:auto;flex-shrink:0;padding:5px 10px;border-radius:20px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.3px;transition:background .2s}
.tabs{display:flex;overflow-x:auto;scrollbar-width:none;padding-bottom:10px;gap:2px}
.tabs::-webkit-scrollbar{display:none}
.tab{flex-shrink:0;padding:7px 14px;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;transition:all .15s}
.tab.on{background:rgba(255,255,255,0.12);color:#fff}
.body{max-width:600px;margin:0 auto;padding:24px 14px 80px}
.section{margin-bottom:28px}
.eyebrow{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:12px}
.filters{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;margin-bottom:20px}
.filters::-webkit-scrollbar{display:none}
.filt{flex-shrink:0;padding:6px 14px;border-radius:20px;border:1.5px solid #e5e3dc;background:#fff;font-size:12px;font-weight:600;cursor:pointer;color:#777;transition:all .15s;font-family:'DM Sans',sans-serif}
.filt.on{background:#111;color:#f0efe9;border-color:#111}
.filt.empty{opacity:0.35;cursor:not-allowed;font-style:italic}
.s-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.s-card{background:#fff;border-radius:14px;padding:16px;border:1.5px solid #e5e3dc}
.s-card.gold{background:#111;border-color:#111;color:#f0efe9}
.s-rank{font-family:'Instrument Serif',serif;font-size:44px;line-height:1;color:#ece9e0;margin-bottom:6px}
.s-card.gold .s-rank{color:rgba(255,255,255,.1)}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-family:'DM Mono',monospace;margin-bottom:6px}
.s-name{font-size:14px;font-weight:700;margin-bottom:1px}
.s-pts{font-family:'DM Mono',monospace;font-size:24px;font-weight:500;line-height:1;margin-top:4px}
.s-card.gold .s-pts{color:#a3e635}
.s-label{font-size:10px;color:#aaa;margin-top:2px}
.s-card.gold .s-label{color:rgba(255,255,255,.35)}
.s-meta{font-size:11px;color:#999;margin-top:5px;line-height:1.5}
.s-card.gold .s-meta{color:rgba(255,255,255,.4)}
.g-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.g-card{background:#fff;border-radius:12px;padding:12px;border:1.5px solid #e5e3dc}
.g-hdr{display:flex;align-items:center;gap:7px;margin-bottom:10px}
.chip{font-family:'DM Mono',monospace;font-size:9px;font-weight:600;padding:2px 6px;border-radius:4px;color:#fff}
.g-name{font-size:12px;font-weight:700}
.g-row{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #f2efe8;font-size:12px}
.g-row:last-child{border-bottom:none}
.g-num{font-family:'DM Mono',monospace;font-size:10px;color:#ccc;width:12px}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.g-player{font-weight:600;flex:1}
.g-pts{font-family:'DM Mono',monospace;font-size:11px;color:#999}
.tbl{background:#fff;border-radius:14px;border:1.5px solid #e5e3dc;overflow:hidden;margin-bottom:12px}
.tbl-hdr{display:grid;background:#f7f5f0;border-bottom:1.5px solid #e5e3dc;padding:9px 12px;align-items:center}
.tbl-row{display:grid;padding:10px 12px;border-bottom:1px solid #f2efe8;align-items:center}
.tbl-row:hover{background:#faf9f7}
.tbl-row:last-child{border-bottom:none}
.tbl-label{font-size:9.5px;font-weight:700;color:#bbb;letter-spacing:1px;text-transform:uppercase}
.tbl-p-hdr{display:flex;align-items:center;gap:4px;font-size:9.5px;font-weight:700;color:#bbb;letter-spacing:1px;text-transform:uppercase}
.game-cell{display:flex;align-items:center;gap:7px;font-weight:700;font-size:12px}
.rb{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-family:'DM Mono',monospace;font-size:11px;font-weight:700}
.rb1{background:#111;color:#a3e635}.rb2{background:#e8f5e9;color:#2e7d32}
.rb3{background:#fff8e1;color:#f57f17}.rb4{background:#fce4ec;color:#c62828}
.rb5{background:#f5f5f5;color:#ccc}
.day-sum{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}
.dc{background:#fff;border-radius:12px;padding:14px;border:1.5px solid #e5e3dc;text-align:center}
.dc.gold{background:#111;color:#f0efe9;border-color:#111}
.dc-rank{font-family:'Instrument Serif',serif;font-size:32px;line-height:1;color:#ece9e0;margin-bottom:4px}
.dc.gold .dc-rank{color:rgba(255,255,255,.1)}
.dc-name{font-size:13px;font-weight:700;margin:4px 0 2px}
.dc-pts{font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#111}
.dc.gold .dc-pts{color:#a3e635}
.dc-sub{font-size:10px;color:#aaa;margin-top:2px}
.dc.gold .dc-sub{color:rgba(255,255,255,.3)}
.det-tbl{background:#fff;border-radius:14px;border:1.5px solid #e5e3dc;overflow:hidden}
.det-row{display:grid;grid-template-columns:68px repeat(4,1fr);padding:8px 12px;border-bottom:1px solid #f2efe8;align-items:center}
.det-row:last-child{border-bottom:none}
.det-row.hdr{background:#f7f5f0;border-bottom:1.5px solid #e5e3dc}
.det-date{font-family:'DM Mono',monospace;font-size:10px;color:#aaa}
.det-cell{display:flex;align-items:center;gap:4px}
.form-row{display:grid;align-items:center;padding:5px 10px;border-bottom:1px solid #f2efe8}
.form-row:last-child{border-bottom:none}
.form-cell{border-radius:5px;text-align:center;padding:5px 2px;font-size:11px;font-weight:700;font-family:'DM Mono',monospace}
.heat-row{display:grid;align-items:center;padding:6px 10px;border-bottom:1px solid #f2efe8}
.heat-row:last-child{border-bottom:none}
.heat-cell{border-radius:7px;text-align:center;padding:6px 3px}
.heat-val{font-size:13px;font-weight:700;font-family:'DM Mono',monospace}
.heat-sub{font-size:8px;opacity:.6;margin-top:1px}
.legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.leg-item{display:flex;align-items:center;gap:4px;font-size:11px;color:#888}
.leg-dot{width:11px;height:11px;border-radius:3px}
.bar-list{display:flex;flex-direction:column;gap:8px}
.bar-row{background:#fff;border-radius:12px;padding:12px 14px;border:1.5px solid #e5e3dc;overflow:hidden}
.bar-row.gold{background:#111;border-color:#111;color:#f0efe9}
.bar-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.bar-rank{font-family:'Instrument Serif',serif;font-size:28px;line-height:1;color:#e0ddd6;width:24px;flex-shrink:0}
.bar-row.gold .bar-rank{color:rgba(255,255,255,.15)}
.bar-name{font-size:14px;font-weight:700;flex:1}
.bar-pts{font-family:'DM Mono',monospace;font-size:18px;font-weight:500}
.bar-row.gold .bar-pts{color:#a3e635}
.bar-meta{font-size:10.5px;color:#999;margin-top:1px}
.bar-row.gold .bar-meta{color:rgba(255,255,255,.38)}
.bar-track{height:6px;background:#f0ede8;border-radius:3px;overflow:hidden}
.bar-row.gold .bar-track{background:rgba(255,255,255,.12)}
.bar-fill{height:100%;border-radius:3px;transition:width .4s ease}
.streak-badge{display:inline-flex;align-items:center;gap:3px;background:#fff3cd;color:#856404;border-radius:10px;padding:2px 7px;font-size:10px;font-weight:700;font-family:'DM Mono',monospace}
.bar-row.gold .streak-badge{background:rgba(163,230,53,.2);color:#a3e635}
.no-data{text-align:center;padding:32px 16px;color:#aaa;font-size:13px}
`;

export default function App() {
  const [tab,setTab]       = useState("year");
  const [yearFilt,setYear] = useState("all");
  const [month,setMonth]   = useState(()=>lastDate().slice(0,7));
  const [selDay,setDay]    = useState(null);
  const [selGame,setGame]  = useState("Wordle");
  const [gameYear,setGameYear] = useState("all");
  const [punish,setPunish] = useState(true);

  const allDays = useMemo(()=>SEED_DATA.map(d=>({
    ...d,
    lb: computeTotals(d.ranks,LB_GAMES,punish),
    all:computeTotals(d.ranks,ALL_GAMES,punish),
  })),[punish]);

  const years = useMemo(()=>["all",...[...new Set(SEED_DATA.map(d=>d.date.slice(0,4)))].sort().reverse()],[]);

  const allMonths = useMemo(()=>[...ALL_MONTHS].reverse(),[]);

  // Year tab
  const yearDays=useMemo(()=>yearFilt==="all"?allDays:allDays.filter(d=>d.date.startsWith(yearFilt)),[allDays,yearFilt]);
  const yearStats=useMemo(()=>standings(yearDays,LB_GAMES,punish),[yearDays,punish]);
  const yearGameStats=useMemo(()=>{
    const out={};
    LB_GAMES.forEach(g=>{out[g]=gamePts(yearDays,g,punish);});
    return out;
  },[yearDays,punish]);
  const streaks=useMemo(()=>calcStreak(allDays,punish),[allDays,punish]);

  // Scores tab
  const monthDays=useMemo(()=>allDays.filter(d=>d.date.startsWith(month)),[allDays,month]);
  const monthStats=useMemo(()=>standings(monthDays,ALL_GAMES,punish),[monthDays,punish]);
  const selDayData=selDay!=null?monthDays[selDay]:null;
  const daySorted=selDayData?[...PLAYERS].sort((a,b)=>selDayData.all.totals[a]-selDayData.all.totals[b]):[];

  // Games tab
  const gameDays=useMemo(()=>gameYear==="all"?allDays:allDays.filter(d=>d.date.startsWith(gameYear)),[allDays,gameYear]);
  const gameStats=useMemo(()=>gamePts(gameDays,selGame,punish),[gameDays,selGame,punish]);
  // Only show days where this game has data
  const gameDayRows=useMemo(()=>gameDays.filter(d=>gameHasData(d.ranks,selGame)).reverse(),[gameDays,selGame]);

  // Trends — use most recent 14 days that have any data
  const recentDays=useMemo(()=>allDays.slice(-14),[allDays]);
  const heatmap=useMemo(()=>{
    const h={};
    PLAYERS.forEach(p=>{h[p]={};
      LB_GAMES.forEach(g=>{
        const days=allDays.filter(d=>gameHasData(d.ranks,g));
        if(!punish){
          // skill only: only days all played
          const fullDays=days.filter(d=>PLAYERS.every(pp=>(d.ranks[g]?.[pp]??DEFAULT_RANK)<DEFAULT_RANK));
          if(fullDays.length===0){h[p][g]=null;return;}
          h[p][g]=parseFloat((fullDays.reduce((s,d)=>s+(d.ranks[g]?.[p]??DEFAULT_RANK),0)/fullDays.length).toFixed(2));
        } else {
          if(days.length===0){h[p][g]=null;return;}
          h[p][g]=parseFloat((days.reduce((s,d)=>s+(d.ranks[g]?.[p]??DEFAULT_RANK),0)/days.length).toFixed(2));
        }
      });
    });
    return h;
  },[allDays,punish]);

  const rankColor=avg=>{
    if(avg===null)return{bg:"#f5f5f5",tx:"#ccc"};
    if(avg<=1.8)return{bg:"#dcfce7",tx:"#166534"};
    if(avg<=2.5)return{bg:"#fef9c3",tx:"#854d0e"};
    if(avg<=3.2)return{bg:"#ffedd5",tx:"#9a3412"};
    return{bg:"#fee2e2",tx:"#991b1b"};
  };
  const formColor=r=>{
    if(r===1)return{bg:"#111",tx:"#a3e635"};
    if(r===2)return{bg:"#dcfce7",tx:"#166534"};
    if(r===3)return{bg:"#fef9c3",tx:"#854d0e"};
    if(r===4)return{bg:"#fee2e2",tx:"#991b1b"};
    return{bg:"#f5f5f5",tx:"#ccc"};
  };

  const Av=({p,sz=32})=>(
    <div className="av" style={{width:sz,height:sz,background:P_COLOR[p],fontSize:sz<28?9:10}}>{P_INIT[p]}</div>
  );
  const RB=({r})=><span className={`rb rb${r}`}>{r===5?"–":r}</span>;

  const Cards=({st,label,showStreak=false})=>{
    // Bar length: invert so lowest pts = longest bar
    const vals=Object.values(st.pts);
    const minPts=Math.min(...vals);
    const maxPts=Math.max(...vals);
    const range=maxPts-minPts||1;
    const barPct=p=>Math.round(((maxPts-st.pts[p])/range)*75+25); // 25-100%
    return(
      <div className="bar-list">
        {st.sorted.map(p=>{
          const r=st.ranks[p];
          const isFirst=r===1;
          return(
            <div key={p} className={`bar-row ${isFirst?"gold":""}`}>
              <div className="bar-top">
                <div className="bar-rank">{r}</div>
                <Av p={p} sz={28}/>
                <div style={{flex:1}}>
                  <div className="bar-name">{p}</div>
                  <div className="bar-meta">
                    {st.wins[p]} day win{st.wins[p]!==1?"s":""}
                    {st.played&&<> · {st.played[p]} days played</>}
                    {showStreak&&streaks[p]>1&&<> · <span className="streak-badge">🔥 {streaks[p]}</span></>}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="bar-pts">{st.pts[p]}</div>
                  <div className="bar-meta">{label}</div>
                </div>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width:`${barPct(p)}%`,
                  background:isFirst?"#a3e635":P_COLOR[p],
                  opacity:isFirst?1:0.7,
                }}/>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const GameMinis=({gStats})=>(
    <div className="g-grid">
      {LB_GAMES.map(g=>{
        const vals=Object.values(gStats[g].pts);
        const minP=Math.min(...vals), maxP=Math.max(...vals), rng=maxP-minP||1;
        const barPct=p=>Math.round(((maxP-gStats[g].pts[p])/rng)*70+30);
        return(
          <div key={g} className="g-card">
            <div className="g-hdr">
              <span className="chip" style={{background:GAME_COLOR[g]}}>{GAME_ABBR[g]}</span>
              <span className="g-name">{g}</span>
            </div>
            {gStats[g].days===0&&<div className="g-pts" style={{padding:"8px 0"}}>No data</div>}
            {gStats[g].days>0&&gStats[g].sorted.map(p=>(
              <div key={p} style={{paddingBottom:6,marginBottom:2}}>
                <div className="g-row" style={{borderBottom:"none",paddingBottom:2}}>
                  <span className="g-num">{gStats[g].ranks[p]}</span>
                  <div className="dot" style={{background:P_COLOR[p]}}/>
                  <span className="g-player">{p}</span>
                  <span className="g-pts">{gStats[g].pts[p]}</span>
                </div>
                <div style={{height:4,background:"#f0ede8",borderRadius:2,overflow:"hidden",marginLeft:18}}>
                  <div style={{height:"100%",width:`${barPct(p)}%`,background:P_COLOR[p],opacity:gStats[g].ranks[p]===1?1:0.55,borderRadius:2,transition:"width .4s"}}/>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  return(<>
    <style>{CSS}</style>
    <div className="app">
      <header className="hdr">
        <div className="hdr-top">
          <div className="logo">Work<em>dle</em></div>
          <div className="hdr-sub">{fmtDateY(firstDate())} – {fmtDateY(lastDate())}<br/>{allDays.length} DAYS</div>
          <button className="tog-btn" onClick={()=>setPunish(!punish)}
            style={{background:punish?"#ef4444":"#22c55e",color:"#fff"}}>
            {punish?"🏆 Regularity rewarded":"🎯 Skill only"}
          </button>
        </div>
        <nav className="tabs">
          {[["year","🏆 Year"],["scores","📅 Scores"],["games","🎮 Games"],["trends","📊 Trends"],["info","📖 Rules"]].map(([v,l])=>(
            <button key={v} className={`tab ${tab===v?"on":""}`} onClick={()=>setTab(v)}>{l}</button>
          ))}
        </nav>
      </header>

      <div className="body">

        {/* ══ YEAR ══ */}
        {tab==="year"&&(<>
          <div className="filters">
            {years.map(y=>(
              <button key={y} className={`filt ${yearFilt===y?"on":""}`} onClick={()=>setYear(y)}>
                {y==="all"?"All time":y}
              </button>
            ))}
          </div>
          <div className="section">
            <div className="eyebrow">{yearFilt==="all"?"All time":yearFilt} · {yearDays.length} days</div>
            <Cards st={yearStats} label={yearFilt==="all"?"pts all time":`pts in ${yearFilt}`} showStreak={yearFilt==="all"||yearFilt===LATEST_YEAR}/>
          </div>
          <div className="section">
            <div className="eyebrow">By game</div>
            <GameMinis gStats={yearGameStats}/>
          </div>
        </>)}

        {/* ══ SCORES ══ */}
        {tab==="scores"&&(<>
          <div className="filters">
            {allMonths.map(m=>{
              const isEmpty=EMPTY_MONTHS.includes(m);
              return(
                <button key={m} disabled={isEmpty}
                  className={`filt ${month===m?"on":""} ${isEmpty?"empty":""}`}
                  onClick={()=>{if(!isEmpty){setMonth(m);setDay(null);}}}>
                  {fmtMonth(m)}{isEmpty?" · no data":""}
                </button>
              );
            })}
          </div>
          <div className="section">
            <div className="eyebrow">{fmtMonth(month)} · {monthDays.length} days</div>
            <Cards st={monthStats} label="pts this month"/>
          </div>
          <div className="eyebrow">Drill into a day</div>
          <div className="filters">
            {[...monthDays].reverse().map((d,i)=>{
              const realIdx=monthDays.length-1-i;
              return(
                <button key={d.date}
                  className={`filt ${selDay===realIdx?"on":""}`}
                  onClick={()=>setDay(selDay===realIdx?null:realIdx)}>
                  {fmtDate(d.date)}
                </button>
              );
            })}
          </div>
          {selDay!=null&&selDayData&&(<>
            <div className="section">
              <div className="eyebrow">{fmtDate(selDayData.date)} · day result</div>
              <div className="day-sum">
                {daySorted.map(p=>{
                  const r=selDayData.all.dayRanks[p];
                  return(
                    <div key={p} className={`dc ${r===1?"gold":""}`}>
                      <div className="dc-rank">{r}</div>
                      <Av p={p} sz={28}/>
                      <div className="dc-name">{p}</div>
                      <div className="dc-pts">{selDayData.all.totals[p]}</div>
                      <div className="dc-sub">pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="section">
              <div className="eyebrow">Game breakdown</div>
              <div className="tbl">
                <div className="tbl-hdr" style={{gridTemplateColumns:"110px repeat(4,1fr)"}}>
                  <div className="tbl-label">Game</div>
                  {PLAYERS.map(p=>(
                    <div key={p} className="tbl-p-hdr">
                      <div className="dot" style={{background:P_COLOR[p]}}/>
                      {p}
                    </div>
                  ))}
                </div>
                {ALL_GAMES.map(game=>{
                  const hasAny=gameHasData(selDayData.ranks,game);
                  return(
                    <div key={game} className="tbl-row" style={{gridTemplateColumns:"110px repeat(4,1fr)",opacity:hasAny?1:0.4}}>
                      <div className="game-cell">
                        <span className="chip" style={{background:GAME_COLOR[game]}}>{GAME_ABBR[game]}</span>
                        {game}
                      </div>
                      {PLAYERS.map(p=>(
                        <div key={p}><RB r={selDayData.ranks[game]?.[p]??DEFAULT_RANK}/></div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>)}
        </>)}

        {/* ══ GAMES ══ */}
        {tab==="games"&&(<>
          <div className="filters">
            {ALL_GAMES.map(g=>(
              <button key={g} className={`filt ${selGame===g?"on":""}`} onClick={()=>setGame(g)}>{g}</button>
            ))}
          </div>
          <div className="filters">
            {years.map(y=>(
              <button key={y} className={`filt ${gameYear===y?"on":""}`} onClick={()=>setGameYear(y)}>
                {y==="all"?"All time":y}
              </button>
            ))}
          </div>
          <div className="section">
            <div className="eyebrow">{selGame} · {gameYear==="all"?"all time":gameYear} · {gameDays.filter(d=>gameHasData(d.ranks,selGame)).length} days played</div>
            {gameStats.days===0?<div className="no-data">No data for this game / period</div>:(()=>{
              const vals=Object.values(gameStats.pts);
              const minP=Math.min(...vals),maxP=Math.max(...vals),rng=maxP-minP||1;
              const barPct=p=>Math.round(((maxP-gameStats.pts[p])/rng)*75+25);
              return(
                <div className="bar-list">
                  {gameStats.sorted.map(p=>{
                    const isFirst=gameStats.ranks[p]===1;
                    return(
                    <div key={p} className={`bar-row ${isFirst?"gold":""}`}>
                      <div className="bar-top">
                        <div className="bar-rank">{gameStats.ranks[p]}</div>
                        <Av p={p} sz={28}/>
                        <div style={{flex:1}}>
                          <div className="bar-name">{p}</div>
                          <div className="bar-meta">{gameStats.played[p]} days played</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div className="bar-pts">{gameStats.pts[p]}</div>
                          <div className="bar-meta">pts</div>
                        </div>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width:`${barPct(p)}%`,background:isFirst?"#a3e635":P_COLOR[p],opacity:isFirst?1:0.7}}/>
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          <div className="section">
            <div className="eyebrow">{selGame} · day by day · most recent first</div>
            {gameDayRows.length===0
              ?<div className="no-data">No data for this game / period</div>
              :<div className="det-tbl">
                <div className="det-row hdr">
                  <div className="tbl-label">Date</div>
                  {PLAYERS.map(p=>(
                    <div key={p} className="tbl-p-hdr">
                      <div className="dot" style={{background:P_COLOR[p]}}/>
                      {p}
                    </div>
                  ))}
                </div>
                {gameDayRows.map(d=>(
                  <div key={d.date} className="det-row">
                    <div className="det-date">{gameYear==="all"?fmtDateY(d.date):fmtDate(d.date)}</div>
                    {PLAYERS.map(p=>(
                      <div key={p} className="det-cell">
                        <RB r={d.ranks[selGame]?.[p]??DEFAULT_RANK}/>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            }
          </div>
        </>)}

        {/* ══ TRENDS ══ */}
        {tab==="trends"&&(<>
          <div className="section">
            <div className="eyebrow">Recent form · last 14 days · daily rank</div>
            <div className="tbl">
              <div className="form-row" style={{gridTemplateColumns:"52px repeat(14,1fr)",gap:2,background:"#f7f5f0",borderBottom:"1.5px solid #e5e3dc",padding:"7px 10px"}}>
                <div/>
                {recentDays.map(d=>(
                  <div key={d.date} style={{fontSize:8,color:"#ccc",textAlign:"center",fontWeight:600,lineHeight:1.3}}>
                    {fmtDate(d.date).split(" ").map((x,i)=><div key={i}>{x}</div>)}
                  </div>
                ))}
              </div>
              {PLAYERS.map(p=>(
                <div key={p} className="form-row" style={{gridTemplateColumns:"52px repeat(14,1fr)",gap:2,padding:"5px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div className="dot" style={{background:P_COLOR[p]}}/>
                    <span style={{fontSize:11,fontWeight:700}}>{p}</span>
                  </div>
                  {recentDays.map(d=>{
                    const r=d.lb.dayRanks[p]??DEFAULT_RANK;
                    const c=formColor(r);
                    return(
                      <div key={d.date} className="form-cell" style={{background:c.bg,color:c.tx}}>
                        {r===5?"–":r}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="section">
            <div className="eyebrow">Game strengths · avg rank · 1 best → 5 worst</div>
            <div className="tbl">
              <div className="heat-row" style={{gridTemplateColumns:`60px repeat(${LB_GAMES.length},1fr)`,gap:4,background:"#f7f5f0",borderBottom:"1.5px solid #e5e3dc",padding:"8px 10px"}}>
                <div/>
                {LB_GAMES.map(g=>(
                  <div key={g} style={{textAlign:"center"}}>
                    <span className="chip" style={{background:GAME_COLOR[g],display:"inline-block",marginBottom:3}}>{GAME_ABBR[g]}</span>
                    <div style={{fontSize:8,color:"#bbb",fontWeight:600}}>{g}</div>
                  </div>
                ))}
              </div>
              {[...PLAYERS].sort((a,b)=>{
                const avg=p=>LB_GAMES.reduce((s,g)=>s+(heatmap[p][g]??DEFAULT_RANK),0)/LB_GAMES.length;
                return avg(a)-avg(b);
              }).map(p=>(
                <div key={p} className="heat-row" style={{gridTemplateColumns:`60px repeat(${LB_GAMES.length},1fr)`,gap:4,padding:"6px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div className="dot" style={{background:P_COLOR[p]}}/>
                    <span style={{fontSize:12,fontWeight:700}}>{p}</span>
                  </div>
                  {LB_GAMES.map(g=>{
                    const avg=heatmap[p][g];
                    const c=rankColor(avg);
                    return(
                      <div key={g} className="heat-cell" style={{background:c.bg,color:c.tx}}>
                        <div className="heat-val">{avg!=null?avg.toFixed(1):"–"}</div>
                        <div className="heat-sub">{avg!=null?"avg":"n/a"}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="legend">
              {[["#dcfce7","#166534","≤1.8 Strong"],["#fef9c3","#854d0e","≤2.5 OK"],["#ffedd5","#9a3412","≤3.2 Weak"],["#fee2e2","#991b1b",">3.2 Struggling"]].map(([bg,tx,label])=>(
                <div key={label} className="leg-item">
                  <div className="leg-dot" style={{background:bg,border:`1px solid ${tx}33`}}/>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ══ RULES ══ */}
        {tab==="info"&&(<>
          <div className="section">
            <div className="eyebrow">How scoring works</div>
            <div className="tbl">
              {[
                ["Daily ranking","Each day, players are ranked 1–4 within each game. Fastest / fewest guesses = rank 1. Ties share the lower rank — two players tied for 2nd both get rank 2, next player gets rank 4."],
                ["Day winner","The player with the lowest total rank across all games that day wins the day."],
                ["Missed a game","🏆 Regularity rewarded (default): miss a game = rank 5, worse than last place. 🎯 Skill only: a game only counts if all 4 players played it that day — anyone absent means it's skipped for everyone."],
                ["No data","If nobody played a game on a given day, it's skipped entirely for everyone."],
                ["Points","Points accumulate across days. Lower = better. Golf scoring."],
                ["Days played","Shown on each player card — useful context since fewer days played = lower raw points regardless of skill."],
              ].map(([title,desc])=>(
                <div key={title} style={{padding:"14px 16px",borderBottom:"1px solid #f2efe8"}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{title}</div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="section">
            <div className="eyebrow">The games</div>
            <div className="tbl">
              {[
                ["Wordle","W","#4ade80","Guess the 5-letter word. Score = guesses (1–6). Fail = 7."],
                ["Connections","C","#60a5fa","Group 16 words into 4 categories. Score = rows used (4 = perfect). Fail to finish = 8."],
                ["Tango","T","#a78bfa","LinkedIn logic puzzle. Score = time in seconds."],
                ["Queens","Q","#34d399","Place queens on a grid. Score = time in seconds."],
                ["Pinpoint","Pt","#fbbf24","Guess the category from clues. Score = guesses (1–5). Fail = 6."],
                ["Patches","Pa","#f472b6","Sewing puzzle. Score = time in seconds."],
                ["Zip","Z","#fb923c","Connect the dots. Score = time in seconds."],
              ].map(([name,abbr,color,desc])=>(
                <div key={name} style={{padding:"12px 16px",borderBottom:"1px solid #f2efe8",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span className="chip" style={{background:color,marginTop:2,flexShrink:0}}>{abbr}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{name}</div>
                    <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section">
            <div className="eyebrow">Data sources</div>
            <div className="tbl">
              {[
                ["WhatsApp","Primary source — scores parsed from daily group chat messages."],
                ["Google Sheet","Fallback for Feb 2025–Jan 2026 where chat data is missing."],
                ["Gaps",GAP_RANGES.length
                  ?`${GAP_RANGES.join(", ").replace(/, ([^,]*)$/," and $1")} ${GAP_RANGES.length===1?"has":"have"} no data from either source.`
                  :"No gaps — every month has data."],
              ].map(([title,desc])=>(
                <div key={title} style={{padding:"14px 16px",borderBottom:"1px solid #f2efe8"}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{title}</div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>)}

      </div>
    </div>
  </>);
}
