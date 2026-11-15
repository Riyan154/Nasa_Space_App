import {COMPONENTS, DEFAULT_LOADOUT, missionTotals, validLoadout, hasScience, scienceTools, migrateLoadout, cloneLoadout, CORE_CHASSIS} from './builder-model.js';

export const GOALS = {
  atmosphere: {name:'Read the alien weather', question:'How does methane move through Titan’s air?', science:['weather'], hint:'The weather station measures the local air and temperature.'},
  chemistry: {name:'Investigate the lake', question:'What is the lake made of?', science:['sampler','lab'], hint:'A scoop or laboratory can examine a hydrocarbon sample.'},
  mapping: {name:'Map a strange shore', question:'What shapes can we see along the coast?', science:['camera'], hint:'The panorama mast records the shoreline.'}
};
export const LAB_KEY = 'titan.mission-lab.v1';
export function newLab(){
  return {version:1, step:0, goal:'mapping', loadout:{...DEFAULT_LOADOUT}, saved:null, tests:{}, model:'cassini', topic:'mission'};
}
export function signature(state){return JSON.stringify([state.goal,state.loadout.rocket,state.loadout.power,state.loadout.science,[...scienceTools(state.loadout)].sort(),state.loadout.radio]);}
export function restoreLab(value){
  if(value?.loadout)value={...value,loadout:migrateLoadout(value.loadout),saved:value.saved?{...value.saved,loadout:migrateLoadout(value.saved.loadout)}:null};
  if(!value || value.version!==1 || !Object.hasOwn(GOALS,value.goal) || !validLoadout(value.loadout))return newLab();
  const state={...newLab(),...value, loadout:cloneLoadout(value.loadout)};
  state.step=Number.isInteger(state.step)?Math.max(0,Math.min(3,state.step)):0;
  state.model=state.model==='huygens'?'huygens':'cassini';
  state.topic=['mission','dish','shield'].includes(state.topic)?state.topic:'mission';
  state.saved=value.saved && Object.hasOwn(GOALS,value.saved.goal) && validLoadout(value.saved.loadout)?{goal:value.saved.goal,loadout:cloneLoadout(value.saved.loadout)}:null;
  state.tests={};
  for(const kind of ['power','radio'])if(value.tests?.[kind]===signature(state))state.tests[kind]=signature(state);
  return state;
}
export function assess(state){
  const totals=missionTotals(state.loadout);
  const science=hasScience(state.loadout,...GOALS[state.goal].science);
  const errors=[...totals.issues];
  if(!science)errors.push(GOALS[state.goal].hint);
  return {...totals,science,errors,ready:errors.length===0};
}
export function powerTrial(state){
  const t=missionTotals(state.loadout), power=t.items.find(p=>p.group==='power');
  // A two-hour observing session includes housekeeping, the science tool and radio.
  const sessionHours=2, energyUsed=t.demand*sessionHours;
  const duration=power.id==='battery'?power.energy/t.demand:Infinity;
  return {passed:power.id==='battery'?duration>=sessionHours:t.margin>=0, energyUsed,duration,
    message:power.id==='battery'?`Two-hour session uses ${energyUsed} of ${power.energy} Wh. Estimated endurance ${duration.toFixed(1)} h.`:`${t.supply} W generated, ${t.demand} W used. ${Math.abs(t.margin)} W ${t.margin>=0?'available for reserve':'shortfall'}.`};
}
export function radioTrial(state){
  const radio=COMPONENTS.radio.find(p=>p.id===state.loadout.radio), data=180;
  const t=missionTotals(state.loadout), hours=data/radio.rate;
  const power=t.items.find(p=>p.group==='power');
  const draw=CORE_CHASSIS.draw+radio.draw;
  return {passed:power.id==='battery'?draw*hours<=power.energy:draw<=power.supply, hours,data,
    message:`${data} data units sent in ${hours.toFixed(2)} mission hours. Radio and housekeeping use ${draw} W.`};
}
export function reviewed(state){
  return assess(state).ready && state.tests.power===signature(state) && state.tests.radio===signature(state);
}
