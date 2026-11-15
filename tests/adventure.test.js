import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCOVERIES, freshAdventure, restoreAdventure, moveExplorer, nearbyDiscovery, collectDiscovery, finishAdventure } from '../src/adventure-model.js';
import { DEFAULT_LOADOUT, missionTotals, surveyLoadout } from '../src/builder-model.js';
import { discoveriesFor, isShadowed, missionDebrief } from '../src/adventure-model.js';
import { DESTINATIONS, instrumentForDestination } from '../src/catalog.js';
import { lunarArrival, marsArrival, landingDuration, LUNAR_LANDING_SECONDS, MARS_LANDING_SECONDS } from '../src/titan-flight.js';

function lakeState(){return {...freshAdventure(),loadout:surveyLoadout('titan'),stage:'lake',parts:['floats','power','radio']};}
test('adventure save round-trips every checkpoint and ignores corrupt or impossible progress',()=>{
  const state=lakeState();state.found=['lake'];state.x=520;
  assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);
  for(const bad of [null,{}, {...state,parts:[]},{...state,found:['fake']},{...state,found:['lake','lake']},{...state,x:NaN},{...state,stage:'done'}]) assert.equal(restoreAdventure(bad),null);
  assert.equal(restoreAdventure({...state,x:10000}).x,2700);
});
test('movement is bounded, diagonal speed is normalized, and a stalled frame cannot teleport',()=>{
  const straight=lakeState(),diagonal=lakeState();moveExplorer(straight,1,0,.05);moveExplorer(diagonal,1,1,.05);
  assert.ok(diagonal.x<straight.x);
  const paused=lakeState();moveExplorer(paused,1,0,30);assert.equal(paused.x,straight.x);
  for(let i=0;i<1000;i++)moveExplorer(paused,1,1,.05);
  assert.equal(paused.x,2700);assert.equal(paused.y,.9);
  for(let i=0;i<1000;i++)moveExplorer(paused,-1,-1,.05);
  assert.equal(paused.x,80);assert.equal(paused.y,.6);
});
test('discoveries require reaching the correct marker and cannot be collected twice',()=>{
  const state=lakeState();assert.equal(nearbyDiscovery(state),null);assert.equal(collectDiscovery(state,'lake'),false);
  state.x=520;state.y=.73;assert.equal(nearbyDiscovery(state).id,'lake');assert.equal(collectDiscovery(state,'cold'),false);
  assert.equal(collectDiscovery(state,'lake'),true);assert.equal(collectDiscovery(state,'lake'),false);assert.deepEqual(state.found,['lake']);
});
test('the full lake journey earns all five facts before a successful transmission',()=>{
  const state=lakeState();assert.equal(finishAdventure(state),false);
  for(const d of DISCOVERIES){state.x=d.x;state.y=d.y;assert.equal(collectDiscovery(state,d.id),true);}
  assert.equal(state.sent,false);assert.equal(finishAdventure(state),true);assert.equal(state.stage,'done');assert.equal(state.sent,true);
  assert.ok(restoreAdventure(state));assert.equal(finishAdventure(state),false);
  state.stage='lake';assert.equal(finishAdventure(state),false,'free sailing does not repeat transmission');
});

import {arrival,CRUISE_SECONDS,LANDING_SECONDS} from '../src/titan-flight.js';
test('arrival transitions from plasma to inflated canopy to floating explorer',()=>{
  assert.equal(CRUISE_SECONDS,30);
  assert.ok(arrival(1.6).heat>.99);
  assert.equal(arrival(5).canopy,1);assert.equal(arrival(5).reveal,1);
  assert.equal(arrival(LANDING_SECONDS).ripple,1);assert.equal(arrival(LANDING_SECONDS).canopy,0);
  let last=-1;for(let t=0;t<10;t+=.01){const shot=arrival(t);assert.ok(shot.y>=last);last=shot.y;}
});
test('Moon and Titan have distinct physical environments and zero lunar aerodynamic braking',()=>{
  assert.equal(DESTINATIONS.moon.gravity,1.62);assert.equal(DESTINATIONS.titan.gravity,1.35);
  assert.equal(DESTINATIONS.moon.density,0);assert.equal(DESTINATIONS.titan.density,5.3);
  assert.equal(DESTINATIONS.moon.irradiance,1361);assert.equal(DESTINATIONS.titan.solarFraction,.01);
  let last=-1,velocity=Infinity;
  for(let t=0;t<=LUNAR_LANDING_SECONDS;t+=.05){const s=lunarArrival(t);assert.equal(s.canopy,0);assert.equal(s.heat,0);assert.equal(s.drag,0);assert.ok(s.y>=last);assert.ok(s.velocity<=velocity);last=s.y;velocity=s.velocity;}
  assert.equal(lunarArrival(LUNAR_LANDING_SECONDS).throttle,0);assert.equal(lunarArrival(LUNAR_LANDING_SECONDS).velocity,0);
  assert.equal(lunarArrival(11).rollout,0);assert.equal(lunarArrival(LUNAR_LANDING_SECONDS).rollout,1);assert.equal(lunarArrival(8).gear,1);
  assert.equal(instrumentForDestination('seismic','moon').science,45);
  assert.equal(instrumentForDestination('seismic','titan').science,0);
});
test('all three destinations persist through every checkpoint and award a debrief only after downlink',()=>{
  for(const destination of ['titan','moon','mars']){
    const state={...freshAdventure(destination),loadout:surveyLoadout(destination)};
    assert.equal(state.destination,destination);assert.equal(state.energyUsedWh,0);
    for(const stage of ['assemble','launch','cruise','landing','lake']){state.stage=stage;state.parts=['floats','power','radio'];assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);}
    assert.equal(finishAdventure(state),false);
    for(const d of discoveriesFor(state)){state.x=d.x;state.y=d.y;assert.equal(collectDiscovery(state,d.id),true);assert.equal(collectDiscovery(state,d.id),false);}
    assert.match(missionDebrief(state,missionTotals(state.loadout)).rating,/progress/);
    state.energyUsedWh=2.53;state.missionSeconds=90;
    assert.equal(finishAdventure(state),true);assert.deepEqual(restoreAdventure(state),state);
    const report=missionDebrief(state,missionTotals(state.loadout));assert.equal(report.energyUsedWh,2.53);assert.equal(report.destination.patch,DESTINATIONS[destination].patch);assert.match(report.rating,/Gold/);
    assert.equal(finishAdventure(state),false);
  }
});
test('legacy Titan saves migrate losslessly and cannot leak discovery IDs across worlds',()=>{
  const legacy=lakeState();delete legacy.destination;delete legacy.energyUsedWh;delete legacy.missionSeconds;legacy.found=['lake'];
  const restored=restoreAdventure(legacy);assert.equal(restored.destination,'titan');assert.equal(restored.energyUsedWh,0);assert.deepEqual(restored.found,['lake']);
  assert.equal(restoreAdventure({...restored,destination:'moon'}),null);
  for(const invalid of [{destination:'venus'},{energyUsedWh:NaN},{missionSeconds:-1}])assert.equal(restoreAdventure({...restored,...invalid}),null);
  const lunar=freshAdventure('moon');lunar.x=1050;assert.equal(isShadowed(lunar),true);lunar.x=1500;assert.equal(isShadowed(lunar),false);
});
test('Mars arrival uses atmospheric braking, parachute, powered descent and rover release in order',()=>{
  assert.equal(DESTINATIONS.mars.gravity,3.71);assert.ok(DESTINATIONS.mars.density>0&&DESTINATIONS.mars.density<.1);
  assert.equal(landingDuration('moon'),LUNAR_LANDING_SECONDS);assert.equal(landingDuration('mars'),MARS_LANDING_SECONDS);assert.equal(landingDuration('titan'),10);
  assert.ok(marsArrival(2).heat>.9);assert.equal(marsArrival(2).canopy,0);
  assert.equal(marsArrival(5).canopy,1);assert.equal(marsArrival(5).throttle,0);
  assert.equal(marsArrival(9).canopy,0);assert.ok(marsArrival(9).throttle>0);assert.equal(marsArrival(9).lower,0);
  assert.ok(marsArrival(14).lower>0);assert.equal(marsArrival(16).lower,1);assert.equal(marsArrival(16).release,1);assert.equal(marsArrival(16).throttle,0);
  const ids=discoveriesFor('mars').map(d=>d.id);assert.equal(new Set(ids).size,5);assert.ok(ids.every(id=>!discoveriesFor('titan').some(d=>d.id===id)));
});
