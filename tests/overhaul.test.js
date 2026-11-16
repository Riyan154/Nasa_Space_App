import test from 'node:test';
import assert from 'node:assert/strict';
import {launchPermission,missionTotals} from '../src/builder-model.js';
import {launchProfile,returnToWorkshop,retryTransit,personalization,fitViewport,FOIL_ACCENTS} from '../src/flight-systems.js';
import {freshTransit,advanceTransit,restoreTransit,transitDuration} from '../src/transit.js';
import {freshAdventure,restoreAdventure} from '../src/adventure-model.js';
import {recordExpedition,emptyLogbook,grandTour,logbookSummary} from '../src/pilot-logbook.js';
import {createFailure,advanceFailure,explosionPhase,failureContent} from '../src/failure.js';
test('overweight payload is launchable, struggles, fails and returns intact to workshop',()=>{
 const t={mass:190,capacity:170,missing:[],cost:280,margin:20};assert.equal(launchPermission(t),true);assert.equal(launchProfile(1,t).failed,false);assert.ok(launchProfile(2.6,t).rise>=150);assert.equal(launchProfile(2.6,t).failed,true);assert.equal(launchProfile(5,{...t,mass:170}).failed,false);
 const s=freshAdventure();s.loadout={rocket:'scout',power:'rtg',science:'lab',radio:'dish'};const before=structuredClone(s.loadout);s.stage='launch';returnToWorkshop(s);assert.equal(s.stage,'assemble');assert.deepEqual(s.loadout,before);assert.equal(launchPermission({...t,missing:['radio']}),false);
});
test('all destination clocks finish exactly and tolerate legacy twenty-second lunar saves',()=>{
 for(const [world,duration] of [['moon',10],['mars',15],['titan',30]]){const s=freshTransit(world);s.spawn=999;advanceTransit(s,duration-.1);assert.equal(s.complete,false);advanceTransit(s,1);assert.equal(s.elapsed,duration);assert.equal(s.complete,true);assert.equal(transitDuration(world),duration);}
 const old=freshTransit();old.elapsed=18;assert.equal(restoreTransit(old,'moon').elapsed,10);
});
test('four distinct collisions exhaust hull, immunity prevents stacking and retry restores kit',()=>{
 const s=freshTransit('titan');s.spawn=999;for(let i=0;i<4;i++){s.invulnerable=0;s.obstacles=[{x:s.x,y:s.y,r:25,speed:100,id:i}];advanceTransit(s,.02);assert.equal(s.hull,100-25*(i+1));if(i<3)assert.equal(s.destroyed,false);}assert.equal(s.destroyed,true);const elapsed=s.elapsed;advanceTransit(s,3);assert.equal(s.elapsed,elapsed);
 const state=freshAdventure('mars'),kit=structuredClone(state.loadout);state.transit=s;retryTransit(state,freshTransit);assert.equal(state.transit.hull,100);assert.equal(state.transit.duration,15);assert.deepEqual(state.loadout,kit);
});
test('callsign and available accents round-trip and retired ceramic saves are normalized',()=>{
 for(const accent of Object.keys(FOIL_ACCENTS)){const s={...freshAdventure('moon'),...personalization({callsign:'Odyssey',accent})};const restored=restoreAdventure(JSON.parse(JSON.stringify(s)));assert.equal(restored.callsign,'Odyssey');assert.equal(restored.accent,accent);}
 assert.equal(personalization({callsign:'<Artemis!123456789>'}).callsign,'Artemis12345');assert.equal(personalization({accent:'unknown'}).accent,'gold');assert.equal(personalization({accent:'white'}).accent,'gold');assert.equal(personalization({callsign:'!!!'}).callsign,'Pip');
});
test('three completed, downlinked destinations unlock Grand Tour regardless of score threshold',()=>{
 let book=emptyLogbook();for(const d of ['moon','mars','titan']){const s=freshAdventure(d);s.sent=true;s.found=[1,2,3,4,5];book=recordExpedition(book,s,{score:50});if(d!=='titan')assert.equal(grandTour(book),false);}assert.equal(grandTour(book),true);assert.equal(logbookSummary(book).rank,'Chief Solar System Pioneer');
});
test('virtual viewport fits ultrawide, portrait, tablet and invalid sizes without distortion',()=>{
 for(const [w,h] of [[2560,1080],[1920,1080],[1024,768],[390,844],[1,1],[0,0],[NaN,Infinity]]){const v=fitViewport(w,h);for(const n of Object.values(v))assert.ok(Number.isFinite(n));assert.ok(v.fit>0);assert.ok(v.offsetX>=0&&v.offsetY>=0);assert.equal(v.width/v.height,1200/700);if(w>0&&h>0){assert.ok(v.width*v.fit<=w+1e-8);assert.ok(v.height*v.fit<=h+1e-8);}}
});
test('explosions pass through flash, fireball, fragments and smoke before opening recovery once',()=>{
 for(const type of ['launch','transit']){const f=createFailure(type,400,300);assert.equal(explosionPhase(0).flash,1);assert.ok(explosionPhase(.1).core>0);assert.equal(explosionPhase(.1).fragments,true);assert.equal(explosionPhase(.3).smoke,true);assert.ok(explosionPhase(.1).shake>explosionPhase(.4).shake);assert.equal(explosionPhase(.7).shake,0);let modals=0;for(let i=0;i<40;i++)if(advanceFailure(f,.05))modals++;assert.equal(modals,1);assert.equal(f.elapsed,1.8);assert.equal(explosionPhase(f.elapsed).finished,true);assert.equal(advanceFailure(f,NaN),false);const html=failureContent(type,{mass:190});assert.match(html.title,/WHOOPS|CRUNCH/);assert.match(html.body,/Voyager/);if(type==='launch'){assert.match(html.body,/190 kg/);assert.match(html.body,/data-game="failure-workshop"/);}else{assert.match(html.body,/data-game="retry-transit"/);assert.match(html.body,/data-game="abort-transit"/);}}
});
test('viewport remains finite for square, tall mobile and pathological dimensions or DPR',()=>{
 for(const dims of [[1000,1000],[360,780],[2520,1080],[Number.MAX_VALUE,Number.MAX_VALUE],[Number.MIN_VALUE,Number.MIN_VALUE],[NaN,-1]])for(const dpr of [0,NaN,Infinity,.1,4]){const v=fitViewport(...dims,dpr);assert.ok(Object.values(v).every(Number.isFinite));assert.ok(v.fit>0);assert.ok(v.offsetX>=0&&v.offsetY>=0);assert.ok(v.pixelWidth>=1&&v.pixelHeight>=1);}
});
