import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {freshAdventure,discoveriesFor,collectDiscovery,discoveryAccess,restoreAdventure,missionDebrief,finishAdventure} from '../src/adventure-model.js';
import {surveyLoadout,toggleScience,missionTotals,COMPONENTS} from '../src/builder-model.js';
import {DESTINATIONS,CATALOG} from '../src/catalog.js';
import {destinationInfoMarkup,DESTINATION_FACTS} from '../src/destination-info.js';
import {MISSION_PHOTOS,missionPhoto} from '../src/mission-reward.js';
import {updateTrails} from '../src/surface-trails.js';

test('every discovery rejects an unequipped tool and gives its educational requirement',()=>{
 for(const destination of Object.keys(DESTINATIONS))for(const d of discoveriesFor(destination)){
  const s={...freshAdventure(destination),stage:'lake',parts:['floats','power','radio'],loadout:{rocket:'scout',power:'rtg',radio:'whip',science:'magnetometer'},x:d.x,y:d.y};
  const access=discoveryAccess(s,d.id);assert.equal(access.allowed,false);assert.match(access.message,/Pip cannot complete this research!/);assert.match(access.message,/You need the/);assert.match(access.message,/Spacecraft Workshop/);
  assert.equal(collectDiscovery(s,d.id),false);assert.deepEqual(s.found,[]);
  s.loadout=surveyLoadout(destination);assert.equal(discoveryAccess(s,d.id).allowed,true);assert.equal(collectDiscovery(s,d.id),true);
 }
});
test('completed discoveries survive repacking, legacy single tools and removed rocket migration',()=>{
 const s={...freshAdventure('moon'),loadout:{rocket:'horizon',power:'solar',radio:'whip',science:'camera'},stage:'lake',parts:['floats','power','radio'],found:['earth']};
 const migrated=restoreAdventure(JSON.parse(JSON.stringify(s)));assert.equal(migrated.loadout.rocket,'titan');assert.deepEqual(migrated.found,['earth']);
 migrated.stage='assemble';migrated.loadout=surveyLoadout('moon');const restored=restoreAdventure(migrated);assert.deepEqual(restored.found,['earth']);assert.deepEqual(restored.loadout.scienceTools,migrated.loadout.scienceTools);
});
test('field guides show the correct measured physics and distinguish pressure from density',()=>{
 for(const id of Object.keys(DESTINATIONS)){
  const html=destinationInfoMarkup(id),d=DESTINATIONS[id];assert.match(html,new RegExp(d.gravity+' m/s²'));assert.ok(html.includes(d.density+' kg/m³'));assert.match(html,/destination-info-title/);
  for(const [,url] of DESTINATION_FACTS[id].sources)assert.ok(new URL(url).hostname.endsWith('nasa.gov'));
 }
 assert.match(DESTINATION_FACTS.titan.detail,/surface pressure/);assert.match(DESTINATION_FACTS.moon.summary,/No single/);assert.match(DESTINATION_FACTS.mars.detail,/No confirmed Martian life/);
});
test('new tools have matching stats in both catalogs and destination-specific supplemental science',()=>{
 for(const id of ['ground_radar','magnetometer']){
  const a=COMPONENTS.science.find(p=>p.id===id),b=CATALOG.instruments.find(p=>p.id===id);
  for(const key of ['mass','cost','draw','data'])assert.equal(a[key],b[key]);
 }
 for(const destination of Object.keys(DESTINATIONS)){
  const s={...freshAdventure(destination),stage:'lake',loadout:surveyLoadout(destination),found:discoveriesFor(destination).map(d=>d.id)};
  assert.equal(missionPhoto(s),null);assert.equal(finishAdventure(s),true);
  const score=missionDebrief(s,missionTotals(s.loadout,destination)).score;
  s.loadout=toggleScience(s.loadout,'ground_radar');assert.equal(missionDebrief(s,missionTotals(s.loadout,destination)).score-score,destination==='titan'?0:12);
  s.loadout=toggleScience(s.loadout,'magnetometer');assert.equal(missionDebrief(s,missionTotals(s.loadout,destination)).score-score,(destination==='titan'?0:12)+(destination==='mars'?2:10));
 }
});
test('NASA rewards unlock only after five discoveries and downlink, and ship as real JPEG images',async()=>{
 const credits=await readFile(new URL('../src/rewards/CREDITS.md',import.meta.url),'utf8');
 for(const destination of Object.keys(DESTINATIONS)){
  const s=freshAdventure(destination);assert.equal(missionPhoto(s),null);s.found=discoveriesFor(destination).map(d=>d.id);assert.equal(missionPhoto(s),null);s.sent=true;
  const photo=missionPhoto(s);assert.equal(photo,MISSION_PHOTOS[destination]);assert.ok(new URL(photo.source).hostname.endsWith('nasa.gov'));
  const b=await readFile(new URL('../src/rewards/'+photo.file,import.meta.url));assert.equal(b.readUInt16BE(0),0xffd8);assert.ok(b.length>200000);assert.ok(credits.includes(photo.file));
  s.found.pop();assert.equal(missionPhoto(s),null);
 }
 assert.match(MISSION_PHOTOS.titan.kind,/processed radar/);assert.match(MISSION_PHOTOS.mars.kind,/enhanced color/);
});
test('surface tracks are bounded, expire smoothly and respect reduced motion',()=>{
 const s=freshAdventure('moon');let trails=[];
 for(let i=0;i<500;i++){s.x+=15;trails=updateTrails(trails,s,.01,true);}
 assert.equal(trails.length,120);assert.ok(trails.every(p=>p.age>=0));assert.deepEqual(updateTrails(trails,s,13,false),[]);
 s.destination='titan';trails=updateTrails([],s,.1,true);assert.deepEqual(updateTrails(trails,s,2.5,false),[]);assert.deepEqual(updateTrails(trails,s,.1,true,true),[]);
});
