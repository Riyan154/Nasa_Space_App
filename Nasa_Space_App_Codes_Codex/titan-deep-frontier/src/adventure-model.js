import { DEFAULT_LOADOUT, COMPONENTS, emptyLoadout, validLoadout, validDraftLoadout,hasScience,migrateLoadout,cloneLoadout } from './builder-model.js';
import { destinationOf } from './catalog.js';
import {restoreTransit,evasiveBonus} from './transit.js';
import {personalization} from './flight-systems.js';
// Reference facts are distinct from the fictional navigation and sample game.
export const FACT_SOURCE = 'https://science.nasa.gov/saturn/moons/titan/facts/';
export const DISCOVERIES = [
  { id:'lake', x:520, y:.73, symbol:'drop', title:'A lake without water!', label:'Sample the lake', tool:'Dipping the sample scoop…', fact:'Titan’s lakes contain liquid methane and ethane. These are gases on a warm day on Earth.', value:'METHANE + ETHANE', color:'#75c9ba' },
  { id:'cold', x:1050, y:.86, symbol:'thermometer', title:'Brrr… a frozen world!', label:'Check the temperature', tool:'Reading the thermometer…', fact:'Titan’s surface is about −179°C. Water ice is as hard as rock here!', value:'ABOUT −179°C', color:'#9ac9df' },
  { id:'rain', x:1560, y:.64, symbol:'cloud', title:'Alien raindrops!', label:'Watch the rain', tool:'Watching the methane clouds…', fact:'Titan has clouds, rain and rivers. Its methane cycle is a little like Earth’s water cycle.', value:'METHANE RAIN', color:'#c6bedc' },
  { id:'air', x:2070, y:.82, symbol:'wind', title:'A thick blanket of air!', label:'Study the air', tool:'Lifting the weather balloon…', fact:'Titan’s air is mostly nitrogen. Surface pressure is about 60% higher than Earth’s.', value:'ABOUT 1.6 × EARTH’S PRESSURE', color:'#f3cc89' },
  { id:'shore', x:2520, y:.67, symbol:'camera', title:'A moon full of surprises!', label:'Photograph the shore', tool:'Taking a panorama…', fact:'Titan is Saturn’s largest moon. It is bigger than the planet Mercury!', value:'BIGGER THAN MERCURY', color:'#e9a58c' },
];
export const LUNAR_DISCOVERIES = [
  {id:'regolith',x:520,y:.73,symbol:'sample',title:'Abrasive Regolith',label:'Examine moon dust',tool:'Inspecting jagged grains…',fact:'Lunar soil contains sharp rock and glass fragments made by impacts and volcanism. Charged dust can cling to equipment and damage seals.',value:'SHARP GRAINS · NO WEATHERING',color:'#d8c8a7',source:'https://www.nasa.gov/missions/artemis/nasas-coating-technology-could-help-resolve-lunar-dust-challenge/'},
  {id:'ice',x:1050,y:.86,symbol:'drop',title:'Shadowed Cold Traps',label:'Investigate the cold trap',tool:'Scanning the shadowed ground…',fact:'Some polar crater floors receive no direct sunlight. Water ice can survive in these cold traps for millions or billions of years. Ice at this exact game station is illustrative.',value:'WATER ICE IN PERMANENT SHADOW',color:'#a9d7ec',source:'https://www.nasa.gov/missions/lro/nasa-moon-camera-mosaic-sheds-light-on-lunar-south-pole/'},
  {id:'quakes',x:1560,y:.64,symbol:'seismic',title:'Tidal Moonquakes',label:'Listen for moonquakes',tool:'Coupling the sensor to solid rock…',fact:'Earth’s gravitational tides trigger deep moonquakes. Separately, near-surface rocks can quake as they expand and contract with changing temperature.',value:'EARTH’S TIDES · DEEP INTERIOR',color:'#d9b985',source:'https://science.nasa.gov/moon/moonquakes/'},
  {id:'reflector',x:2070,y:.82,symbol:'reflector',title:'Laser Retroreflector Array',label:'Align the laser mirrors',tool:'Returning a simulated laser pulse…',fact:'Apollo astronauts left mirror arrays on the Moon. Timing laser pulses from Earth allows millimeter-level distance measurements. This polar array is a fictional science station.',value:'APOLLO LEGACY · LASER RANGING',color:'#c0dfd4',source:'https://ilrs.gsfc.nasa.gov/science/scienceContributions/lunar.html'},
  {id:'earth',x:2520,y:.67,symbol:'camera',title:'Earthrise Panorama',label:'Photograph Earth',tool:'Framing Earth above the crater rim…',fact:'The Moon keeps nearly the same face toward Earth. Earth stays near the horizon at the lunar south pole, with small changes from libration. It does not rise every day like the Sun on Earth.',value:'ONE BLUE HOME · NEAR THE HORIZON',color:'#8fbfeb',source:'https://science.nasa.gov/moon/facts/'}
];
export const MARTIAN_DISCOVERIES = [
  {id:'rust',x:520,y:.73,symbol:'sample',title:'Why Mars Is Red',label:'Inspect the red soil',tool:'Examining iron-rich dust…',fact:'Iron minerals in Martian rocks and soil oxidize, or rust. Wind spreads this rusty dust across the planet, giving Mars its red appearance.',value:'IRON OXIDES · RUSTY DUST',color:'#e4a27d',source:'https://science.nasa.gov/mars/facts/'},
  {id:'delta',x:1050,y:.86,symbol:'drop',title:'An Ancient River Delta',label:'Investigate the ancient delta',tool:'Reading the layers of an old river…',fact:'Jezero Crater once held a lake fed by a river. Its ancient delta preserves sediments carried and deposited by flowing water. Our sampling station is fictional.',value:'JEZERO · EVIDENCE OF ANCIENT WATER',color:'#dec895',source:'https://science.nasa.gov/resource/perseverances-route-to-the-delta-2/'},
  {id:'thin-air',x:1560,y:.64,symbol:'wind',title:'A Very Thin Atmosphere',label:'Measure the thin air',tool:'Sampling the carbon-dioxide atmosphere…',fact:'Mars has a thin atmosphere made mostly of carbon dioxide. A parachute helps slow a lander, but heavy rovers also need rockets for a safe touchdown.',value:'THIN AIR · MOSTLY CARBON DIOXIDE',color:'#c6d1ce',source:'https://science.nasa.gov/mars/facts/'},
  {id:'marsquake',x:2070,y:.82,symbol:'seismic',title:'Listening to Marsquakes',label:'Listen beneath the surface',tool:'Listening through a ground-coupled sensor…',fact:'NASA’s InSight lander detected marsquakes. Seismic waves help scientists investigate the crust, mantle and core of Mars. Our rover experiment is illustrative.',value:'INSIGHT LEGACY · SEISMIC WAVES',color:'#eacb91',source:'https://science.nasa.gov/mission/insight/'},
  {id:'dunes',x:2520,y:.67,symbol:'camera',title:'A World Shaped by Wind',label:'Photograph the dunes',tool:'Capturing the wind-sculpted landscape…',fact:'Wind moves dust and sand across Mars, building dunes and carving features in rocks. Dust devils are rotating columns of air that can lift fine dust.',value:'WIND · DUNES · DUST DEVILS',color:'#d1a487',source:'https://science.nasa.gov/mars/facts/'}
];
export const discoveriesFor = state => ({moon:LUNAR_DISCOVERIES,mars:MARTIAN_DISCOVERIES,titan:DISCOVERIES}[typeof state==='string'?state:state.destination]||DISCOVERIES);
export const DISCOVERY_REQUIREMENTS={
 titan:{lake:['sampler','lab'],cold:['weather'],rain:['weather'],air:['weather'],shore:['camera','lab']},
 moon:{regolith:['sampler','lab'],ice:['sampler','lab'],quakes:['seismic'],reflector:['camera','lab'],earth:['camera','lab']},
 mars:{rust:['sampler','lab'],delta:['sampler','lab'],'thin-air':['weather'],marsquake:['seismic'],dunes:['camera','lab']}
};
export function discoveryAccess(state,id){
 const required=DISCOVERY_REQUIREMENTS[state.destination]?.[id]||[],known=discoveriesFor(state).some(d=>d.id===id);
 const allowed=known&&required.length>0&&hasScience(state.loadout,...required)&&(!required.includes('seismic')||state.destination!=='titan');
 const name=required.map(id=>COMPONENTS.science.find(p=>p.id===id)?.name||id).join(' or ');
 return {allowed,required,name,message:allowed?'':`Pip cannot complete this research! You need the ${name||'correct instrument'} to perform this task. Plan ahead in the Spacecraft Workshop on your next expedition!`};
}
export function discoveryCoverage(loadout,destination='titan'){
 const state={loadout,destination};
 return discoveriesFor(destination).map(d=>({...d,...discoveryAccess(state,d.id)}));
}
export const isShadowed = state => state.destination==='moon'&&state.x>850&&state.x<1250;
export const surfaceLighting=state=>({shadow:state.stage==='lake'&&isShadowed(state),headlights:state.stage==='lake'&&isShadowed(state),solarOutput:state.stage==='lake'&&isShadowed(state)?0:state.destination==='moon'?180:state.destination==='mars'?95:45});
export const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
export const TITAN_SEAS={ligeia:{name:'Ligeia Mare',current:4},kraken:{name:'Kraken Mare',current:18}};
export const missionId=()=>globalThis.crypto?.randomUUID?.()||`flight-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function freshAdventure(destination='titan',sea='ligeia') { return {version:2,transit:restoreTransit(null,destination),missionId:missionId(),...personalization(),incidents:{overheats:0,depletions:0,aborts:0},batteryUsedWh:0,destination:destinationOf(destination).id,sea:destination==='titan'&&Object.hasOwn(TITAN_SEAS,sea)?sea:'ligeia',anchored:false,energyUsedWh:0,missionSeconds:0, stage:'assemble', parts:[], loadout:emptyLoadout(), found:[], x:180, y:.77,  sent:false}; }
export function restoreAdventure(value) {
  if (!value || value.version!==2 || !['assemble','launch','cruise','landing','lake','done'].includes(value.stage)) return null;
  const destination=value.destination===undefined?'titan':value.destination;
  if(!['titan','moon','mars'].includes(destination))return null;
  const sea=value.sea===undefined?'ligeia':value.sea,anchored=value.anchored===undefined?false:value.anchored;
  if(!Object.hasOwn(TITAN_SEAS,sea)||typeof anchored!=='boolean'||(destination!=='titan'&&(sea!=='ligeia'||anchored)))return null;
  const discoveries=discoveriesFor(destination);
  for(const key of ['energyUsedWh','missionSeconds'])if(value[key]!==undefined&&(!Number.isFinite(value[key])||value[key]<0))return null;
  if (!Array.isArray(value.parts) || value.parts.some(p=>!['floats','power','radio'].includes(p)) || new Set(value.parts).size!==value.parts.length) return null;
  if (!Array.isArray(value.found) || value.found.some(id=>!discoveries.some(d=>d.id===id)) || new Set(value.found).size!==value.found.length) return null;
  if (!Number.isFinite(value.x)||!Number.isFinite(value.y)||typeof value.sent!=='boolean') return null;
  if (value.stage!=='assemble' && value.parts.length!==3) return null;
  if (value.sent && value.found.length!==5) return null;
  if (value.stage==='done' && (value.found.length!==5||!value.sent)) return null;
  let loadout=migrateLoadout(value.loadout===undefined?DEFAULT_LOADOUT:value.loadout);
  if(loadout && !loadout.rocket && ['light','shield','heavy'].includes(loadout.body)){
    loadout={rocket:'atlas',power:loadout.power,science:loadout.science,radio:loadout.radio};
  }
  if(!(value.stage==='assemble'?validDraftLoadout(loadout):validLoadout(loadout)))return null;
  return {version:2,transit:restoreTransit(value.transit,destination),missionId:typeof value.missionId==='string'?value.missionId:missionId(),...personalization(value),incidents:Object.fromEntries(['overheats','depletions','aborts'].map(k=>[k,Number.isFinite(value.incidents?.[k])?Math.max(0,value.incidents[k]):0])),batteryUsedWh:Number.isFinite(value.batteryUsedWh)?Math.max(0,value.batteryUsedWh):0,destination,sea,anchored,energyUsedWh:value.energyUsedWh??0,missionSeconds:value.missionSeconds??0,stage:value.stage,parts:[...value.parts],found:[...value.found],sent:value.sent,loadout:cloneLoadout(loadout),x:clamp(value.x,80,2700),y:clamp(value.y,.6,.9)};
}
export function manageEnergy(state,totals,dt){
  if(!Number.isFinite(dt)||dt<=0||state.sent)return;
  const demand=totals.demand+(surfaceLighting(state).headlights?8:0);
  state.missionSeconds+=dt;state.energyUsedWh+=demand*dt/3600;
  const battery=COMPONENTS.power.find(p=>p.id===state.loadout.power),capacity=battery?.energy||600;
  const supply=battery?.id==='battery'||isShadowed(state)&&battery?.id==='solar'?0:totals.supply;
  const before=state.batteryUsedWh||0;
  state.batteryUsedWh=clamp(before+(demand-supply)*dt/3600,0,capacity);
  if(before<capacity&&state.batteryUsedWh>=capacity)state.incidents.depletions++;
}
export function applySurfaceCurrent(state,seconds,time=0){
  if(state.destination!=='titan'||state.stage!=='lake'||state.anchored)return;
  const dt=Number.isFinite(seconds)?clamp(seconds,0,.05):0,t=Number.isFinite(time)?time:0;
  const speed=(TITAN_SEAS[state.sea]||TITAN_SEAS.ligeia).current;
  state.x=clamp(state.x-speed*(.85+.15*Math.sin(t*.37))*dt,80,2700);
  state.y=clamp(state.y+speed*.00013*(.85+.15*Math.cos(t*.23))*dt,.6,.9);
}
export function nearbyDiscovery(state) {
  return discoveriesFor(state).find(d=>!state.found.includes(d.id) && Math.abs(state.x-d.x)<125 && Math.abs(state.y-d.y)<.15) || null;
}
export function moveExplorer(state, dx,dy,dt) {
  // Normalize diagonal motion. Clamp dt so returning to a backgrounded tab cannot teleport.
  const length=Math.max(1,Math.hypot(dx,dy)), delta=clamp(dt,0,.05);
  state.x=clamp(state.x+dx/length*260*delta,80,2700);
  state.y=clamp(state.y+dy/length*.3*delta,.6,.9);
}
export function collectDiscovery(state,id) {
  const near=nearbyDiscovery(state);
  if (state.stage!=='lake'||!near||near.id!==id||!discoveryAccess(state,id).allowed) return false;
  state.found.push(id); return true;
}
export function finishAdventure(state) {
  if(state.stage!=='lake'||state.sent||state.found.length!==discoveriesFor(state).length) return false;
  state.sent=true; state.stage='done'; return true;
}
export function missionDebrief(state,totals){
  const complete=state.sent&&state.found.length===5,bonus=state.destination==='moon'&&hasScience(state.loadout,'seismic');
  const surveyBonus=(hasScience(state.loadout,'ground_radar')&&state.destination!=='titan'?12:0)+(hasScience(state.loadout,'magnetometer')?(state.destination==='mars'?2:10):0);
  const evasive=complete?evasiveBonus(state.transit):0;
  return {destination:destinationOf(state.destination),mass:totals.mass,energyUsedWh:state.energyUsedWh??0,evasiveBonus:evasive,rating:(complete?(bonus?'Lunar geophysicist · Gold':'Expedition complete · Gold'):'Expedition in progress')+(evasive?' · Evasive Pilot +15':''),score:complete?100+(bonus?15:0)+surveyBonus+evasive:state.found.length*15};
}
