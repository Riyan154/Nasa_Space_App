// Fictional mission-credit and hardware ratings. Every installed item is explicit.
export const BUILDER_LIMITS={budget:325};
export const CORE_CHASSIS={id:'core',group:'core',name:'Pip Core Chassis',mass:0,cost:0,draw:10};
export const DEFAULT_LOADOUT={rocket:'atlas',power:'rtg',science:'camera',radio:'dish'};
export const emptyLoadout=()=>({rocket:null,power:null,science:null,radio:null});
export function launchPermission(totals){return totals.missing.length===0&&(totals.mass>totals.capacity&&totals.capacity>0||totals.cost<=BUILDER_LIMITS.budget&&totals.margin>=0);}
export const COMPONENTS={
 rocket:[
 {id:'scout',name:'Sky Hopper',mass:0,draw:0,cost:50,capacity:170,tag:'LIGHT & BOUNCY',detail:'A nimble starter booster. Save mission coins for science gear and pack carefully.'},
 {id:'atlas',name:'Starlight Lifter',mass:0,draw:0,cost:80,capacity:240,tag:'THE RELIABLE CLASSIC',detail:'Twin boosters and dependable thrust. The balanced standard for interplanetary missions.'},
 {id:'titan',name:'Cosmic Titan',mass:0,draw:0,cost:115,capacity:310,tag:'SUPER HAULER',detail:'A triple-core rocket for advanced labs, ground radar and hybrid power systems.'}],
 power:[
 {id:'solar',name:'Solar Wings',mass:25,draw:0,cost:35,supply:45,tag:'SUNLIGHT → ELECTRICITY',detail:'Deployable solar arrays. Output depends on destination and illumination.'},
 {id:'rtg',name:'Radioisotope Core (RTG)',mass:45,draw:0,cost:80,supply:110,tag:'HEAT → ELECTRICITY',detail:'Decay heat becomes electricity even in darkness. Includes a buffer battery.'},
 {id:'battery',name:'Battery Storage Module',mass:30,draw:0,cost:45,supply:80,energy:600,tag:'STORED ENERGY',detail:'Chemical energy storage for a short expedition. 600 game Wh.'},
 {id:'hybrid',name:'Hybrid RTG-Battery Core',mass:60,draw:0,cost:105,supply:140,energy:900,tag:'CONTINUOUS & BURST',detail:'Continuous generation and a large buffer battery for demanding science.'}],
 science:[
 {id:'camera',name:'Panorama Camera Mast',mass:12,draw:8,cost:25,data:90,tag:'SURFACE IMAGING',detail:'Records landscapes, terrain textures and Earth panoramas.'},
 {id:'sampler',name:'Articulated Sample Scoop',mass:28,draw:18,cost:45,data:65,tag:'SAMPLES & CORES',detail:'An interchangeable scoop and coring head collects lake samples, regolith and sediment cores.'},
 {id:'lab',name:'Mini Science Laboratory',mass:48,draw:35,cost:65,data:110,tag:'CAMERA + SAMPLE LAB',detail:'Includes a sample analysis bench and inspection camera. Replaces the separate camera and scoop for their tasks.'},
 {id:'weather',name:'Atmosphere & Weather Station',mass:20,draw:12,cost:35,data:30,tag:'AIR & TEMPERATURE',detail:'Measures temperature and atmospheric conditions. Needed for weather research.'},
 {id:'seismic',name:'Ground Seismometer',mass:22,draw:8,cost:40,data:90,tag:'LISTEN BELOW',detail:'Measures ground motion on solid terrain. Cannot make ground-coupled measurements from a Titan boat.'},
 {id:'ground_radar',name:'Subsurface Ground Radar',mass:32,draw:20,cost:40,data:50,tag:'LOOK BELOW',detail:'A deployable solid-ground sounder for subsurface structure on the Moon and Mars. Adds survey science; does not collect physical samples.'},
 {id:'magnetometer',name:'Magnetometer & Plasma Boom',mass:18,draw:10,cost:28,data:35,tag:'FEEL THE FIELD',detail:'An extended sensor boom measures magnetic and plasma conditions. Particularly useful near Titan and for lunar crustal fields.'}],
 radio:[
 {id:'whip',name:'Omni Whip Antenna',mass:8,draw:5,cost:20,rate:35,tag:'SMALL & SIMPLE',detail:'An efficient antenna with a slower data link.'},
 {id:'dish',name:'Parabolic Space Dish',mass:16,draw:12,cost:35,rate:90,tag:'POINT TOWARD HOME',detail:'A focused dish sends discoveries home faster.'},
 {id:'array',name:'Phased Array Panel',mass:28,draw:22,cost:55,rate:180,tag:'ELECTRONIC STEERING',detail:'A fast electronic link with greater mass, cost and power use.'}]
};
export function scienceTools(loadout){return Array.isArray(loadout?.scienceTools)?loadout.scienceTools:loadout?.science?[loadout.science]:[];}
export function hasScience(loadout,...ids){return scienceTools(loadout).some(id=>ids.includes(id));}
export function toggleScience(loadout,id){
 const ids=[...scienceTools(loadout)],index=ids.indexOf(id);
 if(index>=0)ids.splice(index,1);else if(COMPONENTS.science.some(p=>p.id===id))ids.push(id);
 return {...loadout,science:ids.includes(loadout.science)?loadout.science:(ids[0]??null),scienceTools:ids};
}
export function surveyLoadout(destination='titan'){
 const ids=['camera','sampler',...(destination!=='moon'?['weather']:[]),...(destination!=='titan'?['seismic']:[])];
 return {rocket:'scout',power:destination==='titan'?'rtg':'solar',radio:'whip',science:ids[0],scienceTools:ids};
}
export function cloneLoadout(value){return {...value,...(Array.isArray(value?.scienceTools)?{scienceTools:[...value.scienceTools]}:{})};}
export function migrateLoadout(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return value;
 const next=cloneLoadout(value);
 if(['horizon','deep'].includes(next.rocket))next.rocket='titan';
 if(!next.rocket&&['light','shield','heavy'].includes(next.body)){next.rocket='atlas';delete next.body;}
 return next;
}
export function validDraftLoadout(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 if(!['rocket','power','radio'].every(group=>value[group]===null||COMPONENTS[group].some(p=>p.id===value[group])))return false;
 const ids=scienceTools(value);
 if(value.scienceTools!==undefined&&!Array.isArray(value.scienceTools))return false;
 if(new Set(ids).size!==ids.length||ids.some(id=>!COMPONENTS.science.some(p=>p.id===id)))return false;
 return ids.length?ids.includes(value.science):value.science===null;
}
export function validLoadout(value){return validDraftLoadout(value)&&['rocket','power','science','radio'].every(group=>!!value[group]);}
export function scienceWarning(id,destination){
 if(id==='ground_radar'&&destination==='titan')return '⚠ Ground sounder is designed for solid terrain; recommended for Moon and Mars. Cassini radar could penetrate some methane-rich seas.';
 if(id==='magnetometer'&&destination==='mars')return '⚠ Mars has no global dynamo field. This boom cannot collect sediment cores; bring a sampler for rock research.';
 if(id==='seismic'&&destination==='titan')return '⚠ A floating skiff cannot couple a seismometer to solid ground.';
 return '';
}
export function instrumentScience(id,destination){
 if(id==='seismic')return destination==='titan'?0:45;
 if(id==='ground_radar')return destination==='titan'?0:30;
 if(id==='magnetometer')return destination==='mars'?3:25;
 return 20;
}
export function missionTotals(loadout,destination='titan',shadow=false){
 const safe=validDraftLoadout(loadout)?loadout:emptyLoadout(),ids=scienceTools(safe);
 const items=[{...CORE_CHASSIS},...Object.entries(COMPONENTS).flatMap(([group,options])=>options.filter(item=>group==='science'?ids.includes(item.id):safe[group]===item.id).map(item=>({group,...item,...(item.id==='solar'?{supply:shadow?0:destination==='moon'?180:destination==='mars'?95:45}:{})})))];
 const missing=['rocket','power','science','radio'].filter(group=>group==='science'?!ids.length:!safe[group]);
 const mass=items.reduce((sum,item)=>sum+item.mass,0),cost=items.reduce((sum,item)=>sum+item.cost,0),demand=items.reduce((sum,item)=>sum+item.draw,0);
 const power=items.find(p=>p.group==='power'),capacity=items.find(p=>p.group==='rocket')?.capacity??0,supply=power?.supply??0,issues=[];
 if(missing.length)issues.push('Choose '+missing.join(', ')+' to finish your spacecraft.');
 if(capacity&&mass>capacity)issues.push('Too heavy! Choose a larger rocket or lighter equipment.');
 if(cost>BUILDER_LIMITS.budget)issues.push('Over budget! Swap a part to save mission credits.');
 if(power&&supply<demand)issues.push('Not enough power. Choose a stronger source or fewer tools.');
 return {items,missing,capacity,mass,cost,demand,supply,margin:supply-demand,hours:power?.id==='battery'?power.energy/demand:null,issues,ready:issues.length===0,science:ids.reduce((n,id)=>n+instrumentScience(id,destination),0),warnings:ids.map(id=>scienceWarning(id,destination)).filter(Boolean)};
}
