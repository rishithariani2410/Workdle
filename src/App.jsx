import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import SEED_DATA from "./data.json";
const FormChartLazy = lazy(()=>import("./FormChart"));

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
  let slots=0; // game-days counted; the same for every player, so pts/slots is a fair average
  PLAYERS.forEach(p=>{pts[p]=0;wins[p]=0;played[p]=0;});
  days.forEach(d=>{
    const{totals,dayRanks,activeGames}=computeTotals(d.ranks,games,punish);
    if(activeGames.length===0)return;
    slots+=activeGames.length;
    PLAYERS.forEach(p=>{
      pts[p]+=totals[p];
      // count days player actually participated in at least one active game
      if(activeGames.some(g=>(d.ranks[g]?.[p]??DEFAULT_RANK)<DEFAULT_RANK))played[p]++;
    });
    PLAYERS.filter(p=>dayRanks[p]===1).forEach(p=>wins[p]++);
  });
  const sorted=[...PLAYERS].sort((a,b)=>pts[a]-pts[b]);
  return{pts,wins,played,slots,sorted,ranks:rankTotals(pts)};
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
  return{pts,played,days:counted.length,slots:counted.length,sorted:[...PLAYERS].sort((a,b)=>pts[a]-pts[b]),ranks:rankTotals(pts)};
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
function fmtDayLong(iso){
  return new Date(iso+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
}
function fmtAvg(pts,slots){return slots?(pts/slots).toFixed(2):"–";}
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

// Rolling average rank per player, over the last `window` days on which at least one game counted.
function rollingSeries(days,games,punish,window){
  const pts=[];
  days.forEach(d=>{
    const{totals,activeGames}=computeTotals(d.ranks,games,punish);
    if(activeGames.length)pts.push({date:d.date,totals,n:activeGames.length});
  });
  const sum={};PLAYERS.forEach(p=>sum[p]=0);
  let n=0;
  const rows=pts.map((e,i)=>{
    PLAYERS.forEach(p=>sum[p]+=e.totals[p]);n+=e.n;
    if(i>=window){const o=pts[i-window];PLAYERS.forEach(p=>sum[p]-=o.totals[p]);n-=o.n;}
    const row={date:e.date};
    PLAYERS.forEach(p=>row[p]=+(sum[p]/n).toFixed(2));
    return row;
  });
  // Skip the warm-up days where the window isn't full yet (they swing wildly).
  return rows.length>window*2?rows.slice(window-1):rows;
}

function winnersText(names){
  if(names.length===1)return`${names[0]} won the day`;
  if(names.length===PLAYERS.length)return"Four-way tie";
  return`${names.slice(0,-1).join(", ")} & ${names[names.length-1]} shared the win`;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
function initialTheme(){
  let t=null;
  try{t=localStorage.getItem("workdle-theme");}catch(e){}
  if(t!=="light"&&t!=="dark")t=window.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light";
  document.documentElement.dataset.theme=t;
  return t;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@500;600&display=swap');
:root{
  --bg:#f5f5f2;--surface:#ffffff;--surface-2:#f0f0ec;--border:rgba(15,15,20,.08);--border-strong:rgba(15,15,20,.14);
  --text:#0c0c0e;--muted:#66666d;--faint:#a3a3a9;
  --accent:#a3e635;--accent-ink:#1a2e05;--accent-soft:rgba(163,230,53,.16);
  --shadow:0 1px 2px rgba(15,15,20,.04),0 6px 24px -8px rgba(15,15,20,.08);
  --r1bg:#a3e635;--r1fg:#1a2e05;--r2bg:rgba(34,197,94,.14);--r2fg:#15803d;
  --r3bg:rgba(245,158,11,.16);--r3fg:#b45309;--r4bg:rgba(239,68,68,.13);--r4fg:#b91c1c;
  --r5bg:rgba(15,15,20,.05);--r5fg:#a3a3a9;
  --nav-bg:rgba(255,255,255,.82);
  color-scheme:light;
}
:root[data-theme="dark"]{
  --bg:#09090b;--surface:#131316;--surface-2:#1c1c21;--border:rgba(255,255,255,.07);--border-strong:rgba(255,255,255,.14);
  --text:#f4f4f5;--muted:#a1a1aa;--faint:#5f5f68;
  --accent-soft:rgba(163,230,53,.12);
  --shadow:0 1px 2px rgba(0,0,0,.3);
  --r2bg:rgba(74,222,128,.14);--r2fg:#4ade80;--r3bg:rgba(251,191,36,.14);--r3fg:#fbbf24;
  --r4bg:rgba(248,113,113,.14);--r4fg:#f87171;--r5bg:rgba(255,255,255,.05);--r5fg:#5f5f68;
  --nav-bg:rgba(19,19,22,.8);
  color-scheme:dark;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);min-height:100vh}
body{-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
button,select{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:none}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:8px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

.app{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;line-height:1.45}
.mono{font-family:'Geist Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}

/* top bar */
.top{position:sticky;top:0;z-index:50;background:var(--nav-bg);backdrop-filter:saturate(180%) blur(16px);-webkit-backdrop-filter:saturate(180%) blur(16px);border-bottom:1px solid var(--border)}
.top-in{max-width:880px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:12px}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.tile{width:32px;height:32px;border-radius:9px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:800;font-size:17px;flex-shrink:0;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)}
.brand-name{font-weight:700;font-size:16px;letter-spacing:-.3px;line-height:1.1}
.brand-sub{font-size:11px;color:var(--muted);white-space:nowrap}
.top-nav{display:none;gap:2px;margin-left:12px}
.top-nav button{padding:7px 12px;border-radius:9px;font-weight:500;color:var(--muted);transition:background .15s,color .15s}
.top-nav button:hover{color:var(--text);background:var(--surface-2)}
.top-nav button[aria-current="page"]{color:var(--text);background:var(--surface-2)}
.top-actions{margin-left:auto;display:flex;align-items:center;gap:6px}
.icon-btn{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:var(--muted);border:1px solid var(--border)}
.icon-btn:hover{color:var(--text);background:var(--surface-2)}

/* segmented control */
.seg{display:inline-flex;background:var(--surface-2);border:1px solid var(--border);border-radius:11px;padding:3px;gap:2px;max-width:100%;overflow-x:auto;scrollbar-width:none}
.seg::-webkit-scrollbar{display:none}
.seg button{padding:6px 11px;border-radius:8px;font-size:12.5px;font-weight:600;color:var(--muted);white-space:nowrap;transition:background .15s,color .15s,box-shadow .15s}
.seg button[aria-pressed="true"]{background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.seg.sm button{padding:5px 9px;font-size:12px}

/* bottom nav (phones) */
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:50;background:var(--nav-bg);backdrop-filter:saturate(180%) blur(16px);-webkit-backdrop-filter:saturate(180%) blur(16px);border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(5,1fr);padding:6px 6px calc(6px + env(safe-area-inset-bottom))}
.bnav button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;border-radius:12px;color:var(--faint);font-size:10.5px;font-weight:600;transition:color .15s}
.bnav button[aria-current="page"]{color:var(--text)}
.bnav button[aria-current="page"] .bn-ico{background:var(--accent-soft);color:var(--text)}
.bn-ico{width:44px;height:28px;border-radius:14px;display:grid;place-items:center;transition:background .2s}
@media (min-width:860px){.top-nav{display:flex}.bnav{display:none}.main{padding-bottom:48px!important}}

/* layout */
.main{max-width:880px;margin:0 auto;padding:20px 16px calc(96px + env(safe-area-inset-bottom))}
.page-title{font-size:26px;font-weight:700;letter-spacing:-.6px;margin:4px 0 2px}
.page-sub{color:var(--muted);font-size:13px;margin-bottom:18px}
.section{margin-bottom:28px}
.sec-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.sec-title{font-size:16px;font-weight:700;letter-spacing:-.2px}
.sec-note{font-size:12.5px;color:var(--muted);margin:-4px 0 12px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow)}
.pad{padding:16px}
.chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 4px;margin-bottom:14px}
.chips::-webkit-scrollbar{display:none}
.chip-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-weight:600;font-size:13px;color:var(--muted);transition:all .15s}
.chip-btn:hover{color:var(--text);border-color:var(--border-strong)}
.chip-btn[aria-pressed="true"]{background:var(--text);color:var(--bg);border-color:var(--text)}
.gdot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.empty{padding:28px 16px;text-align:center;color:var(--muted);font-size:13px}

/* avatar & rank pill */
.av{border-radius:50%;display:inline-grid;place-items:center;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:.2px;font-size:11px}
.rk{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9px;font-family:'Geist Mono',monospace;font-size:13px;font-weight:600}
.rk1{background:var(--r1bg);color:var(--r1fg)}.rk2{background:var(--r2bg);color:var(--r2fg)}
.rk3{background:var(--r3bg);color:var(--r3fg)}.rk4{background:var(--r4bg);color:var(--r4fg)}
.rk5{background:var(--r5bg);color:var(--r5fg)}

/* hero */
.hero{position:relative;overflow:hidden;padding:18px}
.hero::before{content:"";position:absolute;inset:-40% -20% auto auto;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,var(--accent-soft),transparent 70%);pointer-events:none}
.eyebrow{font-size:11.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
.hero-title{font-size:22px;font-weight:700;letter-spacing:-.5px;margin:6px 0 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.hero-avs{display:flex}
.hero-avs .av{border:2px solid var(--surface);margin-left:-8px}
.hero-avs .av:first-child{margin-left:0}
.standings{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.stand{background:var(--surface-2);border-radius:14px;padding:10px 6px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
.stand.win{background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(163,230,53,.45)}
.stand-name{font-weight:600;font-size:12.5px}
.stand-pts{font-size:11.5px;color:var(--muted)}
.hero-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:10px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font-weight:600;font-size:13px;background:var(--text);color:var(--bg);transition:opacity .15s}
.btn:hover{opacity:.85}
.btn.ghost{background:var(--surface-2);color:var(--text)}

/* leaderboard */
.lb{list-style:none}
.lb-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border)}
.lb-row:last-child{border-bottom:none}
.lb-row.lead{background:linear-gradient(90deg,var(--accent-soft),transparent 70%)}
.lb-rank{width:18px;text-align:center;font-weight:700;color:var(--faint);font-size:15px}
.lb-row.lead .lb-rank{color:var(--text)}
.lb-main{flex:1;min-width:0}
.lb-name{font-weight:650;font-size:15px;display:flex;align-items:center;gap:8px}
.lb-meta{font-size:12px;color:var(--muted);margin-top:1px}
.lb-bar{height:5px;border-radius:3px;background:var(--surface-2);margin-top:8px;overflow:hidden}
.lb-bar i{display:block;height:100%;border-radius:3px;transition:width .5s cubic-bezier(.2,.8,.2,1)}
.lb-score{text-align:right}
.lb-score b{display:block;font-family:'Geist Mono',monospace;font-size:20px;font-weight:600;letter-spacing:-.5px}
.lb-score span{font-size:11px;color:var(--muted)}
.tag{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:2px 7px;border-radius:999px;background:var(--r3bg);color:var(--r3fg)}

/* stat tiles */
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tile-stat{padding:14px}
.tile-k{font-size:11.5px;color:var(--muted);font-weight:500}
.tile-v{font-size:15px;font-weight:700;margin-top:6px;letter-spacing:-.3px;display:flex;align-items:center;gap:6px}
.tile-s{font-size:11.5px;color:var(--muted);margin-top:2px}

/* game cards */
.games{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media (min-width:640px){.games{grid-template-columns:repeat(3,1fr)}}
.game{padding:14px;text-align:left;transition:transform .15s,border-color .15s;width:100%}
.game:hover{border-color:var(--border-strong);transform:translateY(-1px)}
.game-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-weight:650}
.game-ico{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;flex-shrink:0;font-size:11px;font-weight:700;color:#111}
.game-row{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:3px 0}
.game-row .n{flex:1;color:var(--muted)}
.game-row.first .n{color:var(--text);font-weight:600}
.game-row .v{font-family:'Geist Mono',monospace;font-size:12px;color:var(--muted)}
.game-row.first .v{color:var(--text)}

/* table-ish breakdown */
.grid-head,.grid-row{display:grid;grid-template-columns:minmax(96px,1.4fr) repeat(4,minmax(0,1fr));align-items:center;padding:10px 16px;gap:4px}
.grid-head{border-bottom:1px solid var(--border);font-size:11.5px;font-weight:600;color:var(--muted)}
.grid-head span,.grid-row>span{display:flex;justify-content:center;align-items:center;gap:5px}
.grid-row{border-bottom:1px solid var(--border)}
.grid-row:last-child{border-bottom:none}
.grid-row.dim{opacity:.38}
.gname{display:flex!important;justify-content:flex-start!important;align-items:center;gap:8px;font-weight:600;font-size:13px}
.date-cell{font-size:12.5px;color:var(--muted);font-weight:500}

/* daily header */
.day-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.day-title{flex:1;min-width:0}
.day-title h2{font-size:20px;font-weight:700;letter-spacing:-.4px}
.day-title p{font-size:12.5px;color:var(--muted)}
.round{width:40px;height:40px;border-radius:12px;border:1px solid var(--border);background:var(--surface);display:grid;place-items:center;color:var(--text);flex-shrink:0;box-shadow:var(--shadow)}
.round:disabled{opacity:.35;cursor:default}
.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.select{appearance:none;-webkit-appearance:none;background:var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;border:1px solid var(--border);border-radius:10px;padding:8px 34px 8px 12px;font-weight:600;font-size:13px;box-shadow:var(--shadow)}

/* charts */
.chart{padding:16px 8px 8px 0}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;padding:0 16px 14px}
.legend span{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
.legend b{color:var(--text);font-family:'Geist Mono',monospace;font-weight:600}

/* form grid */
.form{display:grid;gap:5px;padding:14px 12px}
.form-row{display:grid;align-items:center;gap:3px}
.form-name{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600}
.form-cell{aspect-ratio:1;border-radius:6px;display:grid;place-items:center;font-family:'Geist Mono',monospace;font-size:10.5px;min-width:0;font-weight:600;width:100%;transition:transform .1s}
.form-cell:hover{transform:scale(1.12)}
.form-date{font-size:9.5px;color:var(--faint);text-align:center;line-height:1.15;font-weight:500}

/* heatmap */
.heat{display:grid;gap:4px;padding:14px 12px}
.heat-row{display:grid;align-items:center;gap:4px}
.heat-cell{border-radius:8px;text-align:center;padding:8px 0;font-family:'Geist Mono',monospace;font-weight:600;font-size:12px;min-width:0}
.h1{background:var(--r2bg);color:var(--r2fg)}.h2{background:var(--r3bg);color:var(--r3fg)}
.h3{background:rgba(249,115,22,.15);color:#ea580c}.h4{background:var(--r4bg);color:var(--r4fg)}.h0{background:var(--r5bg);color:var(--r5fg)}
.keyrow{display:flex;flex-wrap:wrap;gap:6px 12px;padding:0 16px 14px;font-size:11.5px;color:var(--muted)}
.keyrow span{display:inline-flex;align-items:center;gap:5px}
.keyrow i{width:10px;height:10px;border-radius:3px;display:inline-block}

/* rules */
.rule{padding:14px 16px;border-bottom:1px solid var(--border)}
.rule:last-child{border-bottom:none}
.rule h3{font-size:14px;font-weight:650;margin-bottom:3px;display:flex;align-items:center;gap:8px}
.rule p{font-size:13px;color:var(--muted);line-height:1.55}
`;

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const ICONS={
  home:<><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/></>,
  calendar:<><rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></>,
  games:<><rect x="2.5" y="6.5" width="19" height="11" rx="5"/><path d="M7 12h4M9 10v4M15.5 11h.01M17.5 13h.01"/></>,
  trends:<><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></>,
  rules:<><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6"/></>,
  left:<path d="m15 18-6-6 6-6"/>,
  right:<path d="m9 18 6-6-6-6"/>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  moon:<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>,
  arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,
};
const Icon=({name,size=20})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);
const Avatar=({p,sz=32})=>(
  <span className="av" style={{width:sz,height:sz,background:P_COLOR[p],fontSize:sz<30?10:11}} aria-hidden="true">{P_INIT[p]}</span>
);
const Rank=({r,size})=>(
  <span className={`rk rk${r}`} style={size?{width:size,height:size}:undefined}
    title={r===5?"Didn't play":`Rank ${r}`}>{r===5?"–":r}</span>
);
const Segmented=({options,value,onChange,label,small})=>(
  <div className={`seg ${small?"sm":""}`} role="group" aria-label={label}>
    {options.map(([v,l])=>(
      <button key={v} aria-pressed={value===v} onClick={()=>onChange(v)}>{l}</button>
    ))}
  </div>
);
const GameIcon=({g,sz=26})=>(
  <span className="game-ico" style={{background:GAME_COLOR[g],width:sz,height:sz}}>{GAME_ABBR[g]}</span>
);

// Leaderboard rows. `st` comes from standings() or gamePts().
function Leaderboard({st,streaks}){
  const avgs=PLAYERS.map(p=>st.slots?st.pts[p]/st.slots:0);
  const best=Math.min(...avgs),worst=Math.max(...avgs),rng=worst-best||1;
  return(
    <ol className="lb">
      {st.sorted.map(p=>{
        const r=st.ranks[p],avg=st.slots?st.pts[p]/st.slots:0;
        const width=st.slots?Math.round(((worst-avg)/rng)*78+22):0;
        return(
          <li key={p} className={`lb-row ${r===1?"lead":""}`}>
            <span className="lb-rank">{r}</span>
            <Avatar p={p} sz={38}/>
            <div className="lb-main">
              <div className="lb-name">
                {p}
                {streaks&&streaks[p]>1&&<span className="tag" title={`Won the last ${streaks[p]} days`}>🔥 {streaks[p]}</span>}
              </div>
              <div className="lb-meta">
                {st.wins&&<>{st.wins[p]} win{st.wins[p]!==1?"s":""} · </>}
                {st.played[p]} days · {st.pts[p].toLocaleString("en-GB")} pts
              </div>
              <div className="lb-bar"><i style={{width:`${width}%`,background:P_COLOR[p]}}/></div>
            </div>
            <div className="lb-score"><b>{fmtAvg(st.pts[p],st.slots)}</b><span>avg rank</span></div>
          </li>
        );
      })}
    </ol>
  );
}

const FormChart=({data})=>(
  <Suspense fallback={<div style={{height:282}}/>}>
    <FormChartLazy data={data} players={PLAYERS} colors={P_COLOR}/>
  </Suspense>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS=[["overview","Home","home"],["daily","Daily","calendar"],["games","Games","games"],["trends","Trends","trends"],["info","Rules","rules"]];
const tabFromHash=()=>{
  const h=window.location.hash.slice(1);
  return TABS.some(([v])=>v===h)?h:"overview";
};

export default function App() {
  const [tab,setTabState]  = useState(tabFromHash);
  const [theme,setTheme]   = useState(initialTheme);
  const [yearFilt,setYear] = useState("all");
  const [selDate,setSelDate] = useState(lastDate);
  const month = selDate.slice(0,7);
  const [selGame,setGame]  = useState("Wordle");
  const [gameYear,setGameYear] = useState("all");
  const [showRows,setShowRows] = useState(20);
  const [trendRange,setTrendRange] = useState("90");
  const [punish,setPunish] = useState(true);

  // Keep the open tab in the URL so refresh, back/forward and shared links work.
  useEffect(()=>{
    const onHash=()=>setTabState(tabFromHash());
    window.addEventListener("hashchange",onHash);
    window.addEventListener("popstate",onHash);
    return()=>{window.removeEventListener("hashchange",onHash);window.removeEventListener("popstate",onHash);};
  },[]);
  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    try{localStorage.setItem("workdle-theme",theme);}catch(e){}
  },[theme]);
  const setTab=v=>{
    if(v!==tab)window.history.pushState(null,"",v==="overview"?window.location.pathname:`#${v}`);
    setTabState(v);
    window.scrollTo(0,0);
  };
  const openDay=date=>{setSelDate(date);setTab("daily");};
  const openGame=g=>{setGame(g);setShowRows(20);setTab("games");};

  const allDays = useMemo(()=>SEED_DATA.map(d=>({
    ...d,
    lb: computeTotals(d.ranks,LB_GAMES,punish),
    all:computeTotals(d.ranks,ALL_GAMES,punish),
  })),[punish]);

  const years = useMemo(()=>["all",...[...new Set(SEED_DATA.map(d=>d.date.slice(0,4)))].sort().reverse()],[]);
  const yearOpts = years.map(y=>[y,y==="all"?"All time":y]);
  const dataMonths = useMemo(()=>ALL_MONTHS.filter(m=>DATA_MONTHS.has(m)).reverse(),[]);

  // Home
  const yearDays=useMemo(()=>yearFilt==="all"?allDays:allDays.filter(d=>d.date.startsWith(yearFilt)),[allDays,yearFilt]);
  const yearStats=useMemo(()=>standings(yearDays,LB_GAMES,punish),[yearDays,punish]);
  const yearGameStats=useMemo(()=>{
    const out={};
    LB_GAMES.forEach(g=>{out[g]=gamePts(yearDays,g,punish);});
    return out;
  },[yearDays,punish]);
  const streaks=useMemo(()=>calcStreak(allDays,punish),[allDays,punish]);
  const latestDay=allDays[allDays.length-1];
  const streakLeader=[...PLAYERS].sort((a,b)=>streaks[b]-streaks[a])[0];
  const winsLeader=[...PLAYERS].sort((a,b)=>yearStats.wins[b]-yearStats.wins[a])[0];

  // Daily
  const monthDays=useMemo(()=>allDays.filter(d=>d.date.startsWith(month)),[allDays,month]);
  const monthStats=useMemo(()=>standings(monthDays,ALL_GAMES,punish),[monthDays,punish]);
  const selIdx=allDays.findIndex(d=>d.date===selDate);
  const selDayData=allDays[selIdx];
  const pickMonth=m=>{const ds=allDays.filter(d=>d.date.startsWith(m));setSelDate(ds[ds.length-1].date);};

  // Games
  const gameDays=useMemo(()=>gameYear==="all"?allDays:allDays.filter(d=>d.date.startsWith(gameYear)),[allDays,gameYear]);
  const gameStats=useMemo(()=>gamePts(gameDays,selGame,punish),[gameDays,selGame,punish]);
  const gameDayRows=useMemo(()=>gameDays.filter(d=>gameHasData(d.ranks,selGame)).reverse(),[gameDays,selGame]);
  const gameSeries=useMemo(()=>rollingSeries(gameDays,[selGame],punish,30),[gameDays,selGame,punish]);

  // Trends
  const recentDays=useMemo(()=>allDays.slice(-14),[allDays]);
  const trendSeries=useMemo(()=>{
    const s=rollingSeries(allDays,LB_GAMES,punish,14);
    return trendRange==="all"?s:s.slice(-Number(trendRange));
  },[allDays,punish,trendRange]);
  const heatmap=useMemo(()=>{
    const h={};
    PLAYERS.forEach(p=>{h[p]={};
      LB_GAMES.forEach(g=>{
        let days=allDays.filter(d=>gameHasData(d.ranks,g));
        if(!punish)days=days.filter(d=>PLAYERS.every(pp=>(d.ranks[g]?.[pp]??DEFAULT_RANK)<DEFAULT_RANK));
        h[p][g]=days.length?days.reduce((s,d)=>s+(d.ranks[g]?.[p]??DEFAULT_RANK),0)/days.length:null;
      });
    });
    return h;
  },[allDays,punish]);
  const heatClass=avg=>avg==null?"h0":avg<=1.8?"h1":avg<=2.5?"h2":avg<=3.2?"h3":"h4";

  const modeNote=punish
    ?"Regularity mode: a missed game counts as 5th place."
    :"Skill mode: a game only counts on days all four played it.";

  // ── shared day views ──
  const DayStandings=({d})=>{
    if(d.all.activeGames.length===0)return <div className="empty">No game was played by all four this day, so nothing counts in Skill mode.</div>;
    return(
      <div className="standings">
        {[...PLAYERS].sort((a,b)=>d.all.totals[a]-d.all.totals[b]).map(p=>{
          const r=d.all.dayRanks[p];
          const won=d.all.activeGames.filter(g=>d.ranks[g]?.[p]===1).length;
          return(
            <div key={p} className={`stand ${r===1?"win":""}`}>
              <Avatar p={p} sz={34}/>
              <div className="stand-name">{p}</div>
              <div className="stand-pts"><span className="mono">{d.all.totals[p]}</span> pts</div>
              <div className="stand-pts" style={{minHeight:16}}>{won?`🥇 ×${won}`:""}</div>
            </div>
          );
        })}
      </div>
    );
  };
  const Breakdown=({d})=>(
    <div className="card">
      <div className="grid-head">
        <span style={{justifyContent:"flex-start"}}>Game</span>
        {PLAYERS.map(p=><span key={p}><i className="gdot" style={{background:P_COLOR[p]}}/>{p}</span>)}
      </div>
      {ALL_GAMES.filter(g=>gameHasData(d.ranks,g)).map(g=>{
        const counted=d.all.activeGames.includes(g);
        return(
          <div key={g} className={`grid-row ${counted?"":"dim"}`} title={counted?undefined:"Not counted in Skill mode: someone didn't play"}>
            <span className="gname"><GameIcon g={g} sz={24}/>{g}</span>
            {PLAYERS.map(p=><span key={p}><Rank r={d.ranks[g]?.[p]??DEFAULT_RANK}/></span>)}
          </div>
        );
      })}
    </div>
  );

  const winners=PLAYERS.filter(p=>latestDay.all.dayRanks[p]===1&&latestDay.all.activeGames.length);

  return(<>
    <style>{CSS}</style>
    <div className="app">
      <header className="top">
        <div className="top-in">
          <div className="brand">
            <span className="tile" aria-hidden="true">W</span>
            <div>
              <div className="brand-name">Workdle</div>
              <div className="brand-sub">Updated {fmtDate(lastDate())}</div>
            </div>
          </div>
          <nav className="top-nav" aria-label="Sections">
            {TABS.map(([v,l])=>(
              <button key={v} aria-current={tab===v?"page":undefined} onClick={()=>setTab(v)}>{l}</button>
            ))}
          </nav>
          <div className="top-actions">
            <Segmented label="Scoring mode" small value={punish?"reg":"skill"} onChange={v=>setPunish(v==="reg")}
              options={[["reg","Regularity"],["skill","Skill"]]}/>
            <button className="icon-btn" onClick={()=>setTheme(theme==="dark"?"light":"dark")}
              aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`} title="Toggle theme">
              <Icon name={theme==="dark"?"sun":"moon"} size={17}/>
            </button>
          </div>
        </div>
      </header>

      <main className="main">

        {/* ══ HOME ══ */}
        {tab==="overview"&&(<>
          <section className="section card hero">
            <div className="eyebrow">Latest · {fmtDayLong(latestDay.date)}</div>
            <div className="hero-title">
              {winners.length>0&&<span className="hero-avs">{winners.map(p=><Avatar key={p} p={p} sz={34}/>)}</span>}
              {winners.length>0?winnersText(winners):"No counted games"}
            </div>
            <DayStandings d={latestDay}/>
            <div className="hero-foot">
              <span className="brand-sub">{latestDay.all.activeGames.length} games counted</span>
              <button className="btn" onClick={()=>openDay(latestDay.date)}>Game by game <Icon name="arrow" size={15}/></button>
            </div>
          </section>

          <section className="section">
            <div className="sec-head">
              <h2 className="sec-title">Leaderboard</h2>
              <Segmented label="Period" small value={yearFilt} onChange={setYear} options={yearOpts}/>
            </div>
            <p className="sec-note">{modeNote} Lowest average rank wins.</p>
            <div className="card"><Leaderboard st={yearStats} streaks={yearFilt==="all"||yearFilt===LATEST_YEAR?streaks:null}/></div>
          </section>

          <section className="section tiles">
            <div className="card tile-stat">
              <div className="tile-k">Current streak</div>
              {streaks[streakLeader]>0
                ?<><div className="tile-v"><Avatar p={streakLeader} sz={22}/>{streakLeader}</div>
                   <div className="tile-s">{streaks[streakLeader]}-day run</div></>
                :<div className="tile-v">–</div>}
            </div>
            <div className="card tile-stat">
              <div className="tile-k">Most day wins</div>
              <div className="tile-v"><Avatar p={winsLeader} sz={22}/>{winsLeader}</div>
              <div className="tile-s">{yearStats.wins[winsLeader]} wins</div>
            </div>
            <div className="card tile-stat">
              <div className="tile-k">Days</div>
              <div className="tile-v mono">{yearDays.length}</div>
              <div className="tile-s">{yearFilt==="all"?`since ${fmtMonth(firstDate().slice(0,7))}`:yearFilt}</div>
            </div>
          </section>

          <section className="section">
            <div className="sec-head"><h2 className="sec-title">By game</h2><span className="brand-sub">avg rank · tap for details</span></div>
            <div className="games">
              {LB_GAMES.map(g=>{
                const gs=yearGameStats[g];
                return(
                  <button key={g} className="card game" onClick={()=>openGame(g)}>
                    <div className="game-head"><GameIcon g={g}/>{g}</div>
                    {gs.days===0?<div className="game-row"><span className="n">No data</span></div>:gs.sorted.map(p=>(
                      <div key={p} className={`game-row ${gs.ranks[p]===1?"first":""}`}>
                        <i className="gdot" style={{background:P_COLOR[p]}}/>
                        <span className="n">{p}</span>
                        <span className="v">{fmtAvg(gs.pts[p],gs.slots)}</span>
                      </div>
                    ))}
                  </button>
                );
              })}
            </div>
          </section>
        </>)}

        {/* ══ DAILY ══ */}
        {tab==="daily"&&(<>
          <div className="toolbar">
            <select className="select" value={month} onChange={e=>pickMonth(e.target.value)} aria-label="Month">
              {dataMonths.map(m=><option key={m} value={m}>{fmtMonth(m)}</option>)}
            </select>
            {selDate!==lastDate()&&<button className="btn ghost" onClick={()=>setSelDate(lastDate())}>Jump to latest</button>}
          </div>
          <div className="day-head">
            <button className="round" aria-label="Previous day" disabled={selIdx<=0} onClick={()=>setSelDate(allDays[selIdx-1].date)}><Icon name="left"/></button>
            <div className="day-title">
              <h2>{fmtDayLong(selDayData.date)}</h2>
              <p>{selDayData.all.activeGames.length} games counted{selDayData.date===lastDate()?" · latest":""}</p>
            </div>
            <button className="round" aria-label="Next day" disabled={selIdx>=allDays.length-1} onClick={()=>setSelDate(allDays[selIdx+1].date)}><Icon name="right"/></button>
          </div>
          <section className="section card pad"><DayStandings d={selDayData}/></section>
          <section className="section"><Breakdown d={selDayData}/></section>
          <section className="section">
            <div className="sec-head"><h2 className="sec-title">{fmtMonth(month)} standings</h2><span className="brand-sub">{monthDays.length} days</span></div>
            <div className="chips">
              {[...monthDays].reverse().map(d=>(
                <button key={d.date} className="chip-btn" aria-pressed={selDate===d.date} onClick={()=>setSelDate(d.date)}>{fmtDate(d.date)}</button>
              ))}
            </div>
            <div className="card"><Leaderboard st={monthStats}/></div>
          </section>
        </>)}

        {/* ══ GAMES ══ */}
        {tab==="games"&&(<>
          <div className="chips">
            {ALL_GAMES.map(g=>(
              <button key={g} className="chip-btn" aria-pressed={selGame===g} onClick={()=>{setGame(g);setShowRows(20);}}>
                <i className="gdot" style={{background:GAME_COLOR[g]}}/>{g}
              </button>
            ))}
          </div>
          <div className="sec-head">
            <h1 className="page-title" style={{display:"flex",alignItems:"center",gap:10}}><GameIcon g={selGame} sz={30}/>{selGame}</h1>
            <Segmented label="Period" small value={gameYear} onChange={v=>{setGameYear(v);setShowRows(20);}} options={yearOpts}/>
          </div>
          <p className="page-sub">{gameStats.days} days played{gameYear==="all"?"":` in ${gameYear}`}</p>
          {gameStats.days===0?<div className="card empty">No {selGame} results for this period.</div>:(<>
            <section className="section card"><Leaderboard st={gameStats}/></section>
            <section className="section">
              <div className="sec-head"><h2 className="sec-title">Form</h2><span className="brand-sub">30-day rolling avg rank · higher is better</span></div>
              <div className="card"><FormChart data={gameSeries}/></div>
            </section>
            <section className="section">
              <div className="sec-head"><h2 className="sec-title">Recent results</h2></div>
              <div className="card">
                <div className="grid-head">
                  <span style={{justifyContent:"flex-start"}}>Date</span>
                  {PLAYERS.map(p=><span key={p}><i className="gdot" style={{background:P_COLOR[p]}}/>{p}</span>)}
                </div>
                {gameDayRows.slice(0,showRows).map(d=>(
                  <div key={d.date} className="grid-row">
                    <button className="date-cell" style={{textAlign:"left"}} onClick={()=>openDay(d.date)}>
                      {gameYear==="all"?fmtDateY(d.date):fmtDate(d.date)}
                    </button>
                    {PLAYERS.map(p=><span key={p}><Rank r={d.ranks[selGame]?.[p]??DEFAULT_RANK}/></span>)}
                  </div>
                ))}
              </div>
              {gameDayRows.length>showRows&&(
                <div style={{textAlign:"center",marginTop:12}}>
                  <button className="btn ghost" onClick={()=>setShowRows(n=>n+40)}>Show more ({gameDayRows.length-showRows} left)</button>
                </div>
              )}
            </section>
          </>)}
        </>)}

        {/* ══ TRENDS ══ */}
        {tab==="trends"&&(<>
          <h1 className="page-title">Trends</h1>
          <p className="page-sub">{modeNote}</p>
          <section className="section">
            <div className="sec-head">
              <h2 className="sec-title">Form over time</h2>
              <Segmented label="Range" small value={trendRange} onChange={setTrendRange}
                options={[["90","90 days"],["365","1 year"],["all","All"]]}/>
            </div>
            <p className="sec-note">14-day rolling average rank across all games. Higher on the chart is better.</p>
            <div className="card"><FormChart data={trendSeries}/></div>
          </section>

          <section className="section">
            <div className="sec-head"><h2 className="sec-title">Last 14 days</h2><span className="brand-sub">daily rank · tap a day</span></div>
            <div className="card form">
              <div className="form-row" style={{gridTemplateColumns:`52px repeat(${recentDays.length},minmax(0,1fr))`}}>
                <span/>
                {recentDays.map(d=>(
                  <span key={d.date} className="form-date" title={fmtDayLong(d.date)}><div>{new Date(d.date+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"narrow"})}</div><div>{Number(d.date.slice(8))}</div></span>
                ))}
              </div>
              {PLAYERS.map(p=>(
                <div key={p} className="form-row" style={{gridTemplateColumns:`52px repeat(${recentDays.length},minmax(0,1fr))`}}>
                  <span className="form-name"><i className="gdot" style={{background:P_COLOR[p]}}/>{p}</span>
                  {recentDays.map(d=>{
                    const r=d.lb.activeGames.length?d.lb.dayRanks[p]:DEFAULT_RANK;
                    return(
                      <button key={d.date} className={`form-cell rk${r}`} onClick={()=>openDay(d.date)}
                        title={`${p} · ${fmtDayLong(d.date)} · ${r===5?"no counted games":`rank ${r}`}`}>
                        {r===5?"–":r}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="sec-head"><h2 className="sec-title">Game strengths</h2><span className="brand-sub">all-time avg rank</span></div>
            <div className="card">
              <div className="heat">
                <div className="heat-row" style={{gridTemplateColumns:`52px repeat(${LB_GAMES.length},minmax(0,1fr))`}}>
                  <span/>
                  {LB_GAMES.map(g=>(
                    <span key={g} style={{display:"grid",placeItems:"center"}} title={g}><GameIcon g={g} sz={24}/></span>
                  ))}
                </div>
                {[...PLAYERS].sort((a,b)=>{
                  const avg=p=>LB_GAMES.reduce((s,g)=>s+(heatmap[p][g]??DEFAULT_RANK),0);
                  return avg(a)-avg(b);
                }).map(p=>(
                  <div key={p} className="heat-row" style={{gridTemplateColumns:`52px repeat(${LB_GAMES.length},minmax(0,1fr))`}}>
                    <span className="form-name"><i className="gdot" style={{background:P_COLOR[p]}}/>{p}</span>
                    {LB_GAMES.map(g=>(
                      <span key={g} className={`heat-cell ${heatClass(heatmap[p][g])}`} title={`${p} · ${g}`}>
                        {heatmap[p][g]!=null?heatmap[p][g].toFixed(1):"–"}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="keyrow">
                {[["h1","≤1.8 strong"],["h2","≤2.5 solid"],["h3","≤3.2 weak"],["h4",">3.2 struggling"]].map(([c,l])=>(
                  <span key={c}><i className={c}/>{l}</span>
                ))}
              </div>
            </div>
          </section>
        </>)}

        {/* ══ RULES ══ */}
        {tab==="info"&&(<>
          <h1 className="page-title">How it works</h1>
          <p className="page-sub">Golf scoring: every rank is a point, and the lowest total wins.</p>
          <section className="section">
            <div className="sec-head"><h2 className="sec-title">Scoring</h2></div>
            <div className="card">
              {[
                ["Daily ranking","Each day, players are ranked 1–4 within each game. Fastest or fewest guesses = rank 1. Ties share the lower rank: two players tied for 2nd both get 2, and the next player gets 4."],
                ["Day winner","The player with the lowest total rank across that day's games wins the day."],
                ["Missed a game","Regularity (default): a missed game counts as rank 5, worse than last place. Skill: a game only counts if all four played it that day."],
                ["No data","If nobody played a game on a given day, it's skipped for everyone."],
                ["Avg rank","The big number on each leaderboard: total points ÷ games counted. Everyone is scored over the same games, so it orders players exactly like total points, just easier to read (1 = won everything, 5 = missed everything)."],
              ].map(([t,d])=>(
                <div key={t} className="rule"><h3>{t}</h3><p>{d}</p></div>
              ))}
            </div>
          </section>
          <section className="section">
            <div className="sec-head"><h2 className="sec-title">The games</h2></div>
            <div className="card">
              {[
                ["Wordle","Guess the 5-letter word. Score = guesses (1–6). Fail = 7."],
                ["Connections","Group 16 words into 4 categories. Score = rows used (4 = perfect). Fail to finish = 8."],
                ["Tango","LinkedIn logic puzzle. Score = time in seconds."],
                ["Queens","Place queens on a grid. Score = time in seconds."],
                ["Pinpoint","Guess the category from clues. Score = guesses (1–5). Fail = 6."],
                ["Patches","Sewing puzzle. Score = time in seconds."],
                ["Zip","Connect the dots. Score = time in seconds."],
              ].map(([g,d])=>(
                <div key={g} className="rule"><h3><GameIcon g={g} sz={22}/>{g}</h3><p>{d}</p></div>
              ))}
            </div>
          </section>
          <section className="section">
            <div className="sec-head"><h2 className="sec-title">Data sources</h2></div>
            <div className="card">
              {[
                ["WhatsApp","Primary source: scores parsed from daily group chat messages."],
                ["Google Sheet","Fallback for Feb 2025–Jan 2026 where chat data is missing."],
                ["Gaps",GAP_RANGES.length
                  ?`${GAP_RANGES.join(", ").replace(/, ([^,]*)$/," and $1")} ${GAP_RANGES.length===1?"has":"have"} no data from either source.`
                  :"No gaps: every month has data."],
              ].map(([t,d])=>(
                <div key={t} className="rule"><h3>{t}</h3><p>{d}</p></div>
              ))}
            </div>
          </section>
        </>)}
      </main>

      <nav className="bnav" aria-label="Sections">
        {TABS.map(([v,l,ico])=>(
          <button key={v} aria-current={tab===v?"page":undefined} onClick={()=>setTab(v)}>
            <span className="bn-ico"><Icon name={ico} size={20}/></span>{l}
          </button>
        ))}
      </nav>
    </div>
  </>);
}
