import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTransit,advanceTransit,restoreTransit,skipTransit,evasiveBonus} from '../src/transit.js';
import {freshAdventure,restoreAdventure,surfaceLighting,manageEnergy,missionDebrief} from '../src/adventure-model.js';
import {SIGNAL_DELAYS,signalMarkup} from '../src/communications.js';
import {loadImages,imageEndpoint,IMAGE_QUERIES} from '../src/nasa.js';
import {adventureMarkup} from '../src/adventure.js';
test('transit lasts exactly thirty active seconds, steering is bounded, and skip grants no bonus',()=>{
 const s=freshTransit();advanceTransit(s,29.9,1,-1);assert.equal(s.complete,false);assert.ok(s.x<=900&&s.y>=190);advanceTransit(s,1);assert.equal(s.elapsed,30);assert.equal(s.complete,true);const snapshot=structuredClone(s);advanceTransit(s,4);assert.deepEqual(s,snapshot);
 const skipped=freshTransit();skipTransit(skipped);assert.equal(skipped.complete,true);assert.equal(evasiveBonus(skipped),0);
 const clean=freshTransit();clean.spawn=999;advanceTransit(clean,30);assert.equal(evasiveBonus(clean),15);
 const state=freshAdventure();state.transit=clean;state.sent=true;state.found=[1,2,3,4,5];assert.equal(missionDebrief(state,{mass:100}).evasiveBonus,15);
});
test('impacts are forgiving, warn for five seconds, and cannot repeat during immunity',()=>{
 const s=freshTransit();s.obstacles=[{id:1,x:s.x,y:s.y,r:30,speed:200}];assert.equal(advanceTransit(s,.02),1);assert.equal(s.hits,1);assert.equal(s.warning,5);assert.equal(s.complete,false);s.obstacles.push({id:2,x:s.x,y:s.y,r:30,speed:200});assert.equal(advanceTransit(s,.02),0);assert.equal(s.hits,1);s.spawn=999;s.obstacles=[];advanceTransit(s,5);assert.equal(s.warning,0);
});
test('cruise resumes elapsed time, obstacle field and stats; legacy saves migrate safely',()=>{
 const state=freshAdventure('mars');advanceTransit(state.transit,7,0,1);assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))).transit,state.transit);delete state.transit;assert.deepEqual(restoreAdventure(state).transit,freshTransit('mars'));assert.deepEqual(restoreTransit({elapsed:Infinity}),freshTransit());
});
test('Moon cold traps switch headlights and solar output, draw battery and recharge on the rim',()=>{
 const s=freshAdventure('moon');s.stage='lake';s.loadout.power='solar';s.x=1000;assert.deepEqual(surfaceLighting(s),{shadow:true,headlights:true,solarOutput:0});manageEnergy(s,{demand:50,supply:180},60);assert.ok(s.batteryUsedWh>0);const used=s.batteryUsedWh;s.x=1300;assert.equal(surfaceLighting(s).headlights,false);assert.equal(surfaceLighting(s).solarOutput,180);manageEnergy(s,{demand:50,supply:180},60);assert.ok(s.batteryUsedWh<used);s.destination='mars';s.x=1000;assert.equal(surfaceLighting(s).headlights,false);
});
test('signal delays use physical light time and label compressed representative paths',()=>{
 assert.ok(Math.abs(SIGNAL_DELAYS.moon.seconds-1.282)<.002);assert.equal(SIGNAL_DELAYS.mars.seconds,840);assert.equal(SIGNAL_DELAYS.titan.seconds,4920);for(const d of ['moon','mars','titan']){assert.ok(signalMarkup(d).includes('one way'));assert.ok(signalMarkup(d).includes('compressed'));}
});
test('all destinations use valid NASA endpoints and caches cannot mix worlds',async()=>{
 const cache=new Map(),storage={getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)};
 const response=destination=>({collection:{items:[{data:[{nasa_id:destination,title:destination,media_type:'image'}],links:[{href:`https://images-assets.nasa.gov/image/${destination}/thumb.jpg`,rel:'preview'}]}]}});
 for(const destination of ['titan','moon','mars']){const url=new URL(imageEndpoint(destination));assert.equal(url.hostname,'images-api.nasa.gov');assert.equal(url.searchParams.get('q'),IMAGE_QUERIES[destination]);const r=await loadImages({destination,storage,fetcher:async()=>({ok:true,json:async()=>response(destination)})});assert.equal(r.items[0].title,destination);}
 for(const destination of ['titan','moon','mars']){const r=await loadImages({destination,storage,fetcher:()=>{throw Error('must use cache');}});assert.equal(r.items[0].title,destination);}
 let calls=0;const r=await loadImages({destination:'moon',storage:null,fetcher:async()=>({ok:true,json:async()=>++calls===1?{collection:{items:[]}}:response('Apollo')})});assert.equal(r.status,'live');assert.equal(r.items[0].title,'Apollo');
});
test('main HUD exposes audio toggle and removes the NASA telemetry trigger',()=>{
 const html=adventureMarkup();assert.match(html,/data-game="audio-toggle"/);assert.ok(!html.includes('data-game="telemetry"'));assert.ok(html.includes('signal-transit'));assert.ok(html.includes('shield-warning'));
});
