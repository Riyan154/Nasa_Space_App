import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAdventure,restoreAdventure,manageEnergy} from '../src/adventure-model.js';
import {emptyLogbook,recordExpedition,logbookSummary,missionStars,pilotRank,logbookMarkup} from '../src/pilot-logbook.js';
import {savePilotExpedition,loadPilotLogbook} from '../src/storage.js';
import {eyeState,drawEyes} from '../src/pip-eyes.js';
import {academyMarkup,academyPage,ACADEMY_PAGES} from '../src/academy.js';
import {benchmarkFor,simulationProfile,HASI_SAMPLES,drawBenchmark} from '../src/telemetry.js';
import {missionAudio} from '../src/mission-audio.js';

test('logbook persists all three worlds, deduplicates reloads and preserves best debrief',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 for(const destination of ['titan','moon','mars']){
  const s=freshAdventure(destination);s.found=['1','2','3','4','5'];s.sent=true;s.energyUsedWh=5;s.missionSeconds=120;
  assert.equal(savePilotExpedition(s,{score:100}),true);savePilotExpedition(s,{score:200});
 }
 const summary=logbookSummary(loadPilotLogbook());assert.equal(summary.discoveries,15);assert.equal(summary.score,300);assert.equal(summary.energyWh,15);assert.equal(summary.seconds,360);assert.equal(summary.rank,'Chief Solar System Pioneer');
 for(const w of Object.values(summary.worlds)){assert.equal(w.status,'completed');assert.equal(w.stars,3);assert.equal(w.best.score,100);}
 const s=freshAdventure('moon');s.sent=true;s.found=[1,2,3,4,5];savePilotExpedition(s,{score:150});assert.equal(logbookSummary(loadPilotLogbook()).worlds.moon.best.score,150);
 delete globalThis.localStorage;
});
test('progress totals replace snapshots, incomplete missions and clean-star conditions are distinct',()=>{
 const s=freshAdventure('mars');s.missionSeconds=10;let b=recordExpedition(emptyLogbook(),s,{score:0});s.missionSeconds=20;b=recordExpedition(b,s,{score:30});assert.equal(logbookSummary(b).seconds,20);assert.equal(logbookSummary(b).worlds.mars.status,'in_progress');assert.equal(logbookSummary(b).worlds.moon.status,'locked');assert.equal(missionStars(s),1);
 s.sent=true;s.found=[1,2,3,4,5];assert.equal(missionStars(s),3);for(const key of ['overheats','depletions','aborts']){s.incidents[key]++;assert.equal(missionStars(s),2);s.incidents[key]=0;}
 assert.deepEqual([0,99,100,249,250,399,400].map(pilotRank),['Junior Explorer','Junior Explorer','Flight Specialist','Flight Specialist','Interplanetary Commander','Interplanetary Commander','Chief Solar System Pioneer']);
 s.callsign='<script>bad</script>';b=recordExpedition(b,s,{score:100});assert.ok(!logbookMarkup(b).includes('<script>'));
});
test('legacy saves migrate identity, incident counters and battery history without changing version',()=>{
 const old=freshAdventure();delete old.missionId;delete old.incidents;delete old.batteryUsedWh;const restored=restoreAdventure(old);assert.ok(restored.missionId);assert.equal(restored.version,2);assert.deepEqual(restored.incidents,{overheats:0,depletions:0,aborts:0});assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(restored))),restored);
 const s=freshAdventure('moon');s.stage='lake';s.loadout.power='solar';s.x=1000;s.batteryUsedWh=599.99;manageEnergy(s,{demand:100,supply:100},1);assert.equal(s.incidents.depletions,1);manageEnergy(s,{demand:100,supply:100},1);assert.equal(s.incidents.depletions,1);
});
test('emotive eye priorities, movement, organic blink and reduced motion are deterministic',()=>{
 assert.equal(eyeState().mode,'idle');assert.equal(eyeState({moving:true,dx:-1}).dx,-2.5);assert.equal(eyeState({moving:true}).mode,'moving');assert.equal(eyeState({science:true,moving:true}).mode,'science');assert.equal(eyeState({science:true,hazard:true}).mode,'hazard');assert.equal(eyeState({complete:true,hazard:true}).mode,'complete');assert.ok(eyeState({time:4.46}).blink<.01);assert.equal(eyeState({time:4.46,reduced:true}).blink,1);assert.equal(eyeState({hazard:true,time:10,reduced:true}).jitter,0);
 const c=new Proxy({}, {get:()=>()=>{}});for(const options of [{},{moving:true},{science:true},{hazard:true},{complete:true}])assert.doesNotThrow(()=>drawEyes(c,eyeState(options)));
});
test('four storybook cards preserve order, accessible art and bounded forward/back navigation',()=>{
 assert.deepEqual(ACADEMY_PAGES.map(p=>p.title),['Pick Your World!','Build Your Explorer!','Blast Off & Dodge Space Rocks!','Make Historic Discoveries!']);
 for(let i=0;i<4;i++){const html=academyMarkup(i);assert.ok(html.includes(`${i+1} / 4`));assert.ok(html.includes('viewBox="0 0 560 180"'));assert.ok(html.includes('⬅ Back'));assert.ok(html.includes('Next ➔'));assert.ok(html.includes('aria-current="page"'));assert.match(html,/data-game="close"/);assert.equal(academyPage(i+1),Math.min(3,i+1));assert.equal(academyPage(i-1),Math.max(0,i-1));}assert.equal(academyPage(-1),0);assert.equal(academyPage(9),3);assert.equal(academyPage(NaN),0);
});
test('benchmark curves contain valid SI coordinates, source links and transparent provenance',()=>{
 const c=new Proxy({}, {get:()=>()=>{}});for(const d of ['titan','moon','mars']){const b=benchmarkFor(d);assert.ok(b.sources.every(s=>s.url.startsWith('https://')));for(const p of [...b.points,...simulationProfile(d)])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.doesNotThrow(()=>drawBenchmark({getContext:()=>c},d));assert.doesNotThrow(()=>drawBenchmark({getContext:()=>c},d,true));}assert.equal(HASI_SAMPLES.at(-1)[1],93.5027);assert.equal(HASI_SAMPLES.at(-1)[2],146645);assert.match(benchmarkFor('moon').note,/not a sampled altimetry track/);
});
test('ambient synthesis supports every world, mutes immediately, pauses, and releases its context',()=>{
 const gains=[],nodes=[];let suspended=0,closed=0;
 function param(value=0){return {value,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};}
 function node(){const n={gain:param(),frequency:param(),Q:param(),pan:param(),connect(){return this;},disconnect(){this.disconnected=true;},start(){this.started=true;},stop(){this.stopped=true;}};nodes.push(n);return n;}
 globalThis.AudioContext=class{currentTime=0;sampleRate=100;destination={};createGain(){const n=node();gains.push(n);return n;}createOscillator(){return node();}createBuffer(){return {getChannelData:()=>new Float32Array(200)};}createBufferSource(){return node();}createBiquadFilter(){return node();}createStereoPanner(){return node();}resume(){return Promise.resolve();}suspend(){suspended++;return Promise.resolve();}close(){closed++;return Promise.resolve();}};
 const audio=missionAudio();audio.enable(true);for(const destination of ['titan','moon','mars'])audio.update({destination,paused:false});assert.ok(nodes.some(n=>n.frequency.value===.08));assert.ok(nodes.some(n=>n.frequency.value===528));audio.ignite();audio.rumble();audio.hiss();audio.ping();audio.chime();audio.impact();audio.explode();audio.enable(false);assert.equal(gains[0].gain.value,0);assert.ok(suspended);audio.pause(true);audio.close();assert.equal(closed,1);assert.ok(nodes.every(n=>n.disconnected));assert.ok(nodes.filter(n=>n.started).every(n=>n.stopped));audio.close();audio.enable(true);assert.equal(closed,1);delete globalThis.AudioContext;assert.doesNotThrow(()=>{const a=missionAudio();a.enable(true);a.update({});a.ignite();a.rumble();a.hiss();a.ping();a.chime();a.explode();a.pause(false);a.close();});
});
