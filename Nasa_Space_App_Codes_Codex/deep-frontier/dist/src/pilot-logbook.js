export const LOGBOOK_KEY='deepfrontier.pilot.logbook';
const worlds=['titan','moon','mars'];
const number=v=>Number.isFinite(v)&&v>=0?v:0;
export const pilotRank=score=>score>=400?'Chief Solar System Pioneer':score>=250?'Interplanetary Commander':score>=100?'Flight Specialist':'Junior Explorer';
export function emptyLogbook(){return {version:1,missions:{}};}
export function grandTour(value){const missions=Object.values(normalizeLogbook(value).missions);return worlds.every(d=>missions.some(m=>m.destination===d&&m.status==='completed'&&m.stars>=1));}
export const grandTourMarkup=()=>`<section class="grand-tour-panorama" aria-label="Grand Tour Master Laurels"><b>❦ GRAND TOUR MASTER LAURELS ❦</b><div><span>☀<small>Sun</small></span><span>🌎<small>Earth</small></span><span>☾<small>Moon</small></span><span>◉<small>Mars</small></span><span>♄<small>Saturn</small></span></div><p>Three worlds explored. One extraordinary pilot.</p></section>`;
export function normalizeLogbook(value){
  const book=emptyLogbook();
  if(value?.version!==1||!value.missions||typeof value.missions!=='object')return book;
  for(const [id,m] of Object.entries(value.missions))if(worlds.includes(m?.destination)&&['in_progress','completed'].includes(m.status))book.missions[id]={...m,score:number(m.score),discoveries:Math.min(5,number(m.discoveries)),energyWh:number(m.energyWh),seconds:number(m.seconds),stars:Math.min(3,Math.max(1,number(m.stars)))};
  return book;
}
export function missionStars(state){const penalties=['overheats','depletions','aborts'].filter(k=>state.incidents?.[k]>0).length;return state.sent&&state.found.length===5?Math.max(1,3-penalties):1;}
export function recordExpedition(value,state,report,date=new Date().toISOString()){
  const book=normalizeLogbook(value);if(!state.missionId)return book;
  const old=book.missions[state.missionId];if(old?.status==='completed')return book;
  book.missions[state.missionId]={destination:state.destination,status:state.sent?'completed':'in_progress',score:report.score,evasiveBonus:report.evasiveBonus||0,transitHits:state.transit?.hits||0,discoveries:state.sent?state.found.length:0,energyWh:state.energyUsedWh,seconds:state.missionSeconds,stars:missionStars(state),callsign:state.callsign||'Pip’s Pilot',date};return book;
}
export function logbookSummary(value){
  const book=normalizeLogbook(value),missions=Object.values(book.missions),complete=missions.filter(m=>m.status==='completed');
  const sum=key=>missions.reduce((n,m)=>n+m[key],0),score=complete.reduce((n,m)=>n+m.score,0);
  return {discoveries:sum('discoveries'),score,energyWh:sum('energyWh'),seconds:sum('seconds'),grandTour:grandTour(book),rank:grandTour(book)?'Chief Solar System Pioneer':pilotRank(score),worlds:Object.fromEntries(worlds.map(id=>{const attempts=missions.filter(m=>m.destination===id),wins=complete.filter(m=>m.destination===id).sort((a,b)=>b.score-a.score||b.stars-a.stars);return [id,{status:wins.length?'completed':attempts.length?'in_progress':'locked',stars:wins.reduce((n,m)=>Math.max(n,m.stars),0),best:wins[0]||null}];}))};
}
export const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function logbookMarkup(book){const s=logbookSummary(book);return `<p class="tiny-label">INTERPLANETARY PILOT RECORD</p><h3>${s.rank}</h3>${s.grandTour?grandTourMarkup():''}<div class="logbook-totals"><span><b>${s.discoveries}</b>Discoveries sent</span><span><b>${s.score}</b>Lifetime science</span><span><b>${s.energyWh.toFixed(2)} Wh</b>Energy managed</span><span><b>${Math.floor(s.seconds/60)}m ${Math.floor(s.seconds%60)}s</b>Active mission time</span></div><div class="trophy-case">${worlds.map(id=>{const w=s.worlds[id],name=id[0].toUpperCase()+id.slice(1);return `<article class="trophy ${w.status}"><div class="patch-frame">${w.best?`<img src="${new URL('./rewards/'+name+'.jpg',import.meta.url).href}" alt="${name} mission patch">`:`<span class="radar-blueprint" aria-hidden="true">${id==='moon'?'☾':'✦'}</span>`}</div><h3>${name}</h3><div class="medal-stars" aria-label="${w.stars} stars">${'★'.repeat(w.stars)}${'☆'.repeat(3-w.stars)}</div>${w.best?`<b>${w.best.score} · Best science</b>${w.best.evasiveBonus?'<p class="evasive-award">✦ Evasive Pilot · +15</p>':''}<p>${escapeText(w.best.callsign)}<br><time>${escapeText(w.best.date.slice(0,10))}</time></p>`:`<p>Mission Pending<br><small>${w.status==='in_progress'?'Expedition underway':'Ready to discover'}</small></p>`}</article>`;}).join('')}</div><button class="play-button" data-game="close">Back to the adventure →</button>`;}
