import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPONENTS,BUILDER_LIMITS,CORE_CHASSIS,DEFAULT_LOADOUT,emptyLoadout,missionTotals,validLoadout,validDraftLoadout,toggleScience,surveyLoadout,scienceWarning} from '../src/builder-model.js';
import {freshAdventure,restoreAdventure,discoveryCoverage} from '../src/adventure-model.js';
import {CATALOG} from '../src/catalog.js';
test('empty builder starts at zero mass and cost with its free core explicitly accounted for',()=>{
 const state=freshAdventure(),t=missionTotals(state.loadout);
 assert.deepEqual(state.loadout,emptyLoadout());assert.equal(t.mass,0);assert.equal(t.cost,0);assert.equal(BUILDER_LIMITS.budget-t.cost,325);
 assert.equal(t.demand,10);assert.equal(t.items.length,1);assert.equal(t.items[0].id,'core');assert.equal(CORE_CHASSIS.cost,0);assert.equal(t.missing.length,4);assert.equal(t.ready,false);
 assert.deepEqual(restoreAdventure(state),state);
});
test('exactly three kid-named rockets expose the same lift and prices in both catalogs',()=>{
 const expected=[['scout','Sky Hopper',50,170],['atlas','Starlight Lifter',80,240],['titan','Cosmic Titan',115,310]];
 for(const catalog of [COMPONENTS.rocket,CATALOG.rocket])assert.deepEqual(catalog.map(p=>[p.id,p.name,p.cost,p.capacity]),expected);
 assert.equal(validLoadout({...DEFAULT_LOADOUT,rocket:'horizon'}),false);
 assert.equal(restoreAdventure({...freshAdventure(),loadout:{...DEFAULT_LOADOUT,rocket:'horizon'}}).loadout.rocket,'titan');
});
test('all single-tool combinations account for every installed item and enforce the 325 MC budget',()=>{
 let count=0;
 for(const rocket of COMPONENTS.rocket)for(const power of COMPONENTS.power)for(const science of COMPONENTS.science)for(const radio of COMPONENTS.radio){
  const design={rocket:rocket.id,power:power.id,science:science.id,radio:radio.id},t=missionTotals(design);
  assert.equal(t.mass,power.mass+science.mass+radio.mass);assert.equal(t.cost,rocket.cost+power.cost+science.cost+radio.cost);
  assert.equal(t.demand,CORE_CHASSIS.draw+science.draw+radio.draw);assert.equal(t.ready,t.mass<=rocket.capacity&&t.cost<=325&&t.supply>=t.demand);count++;
 }
 assert.equal(count,252);
 const expensive=missionTotals({rocket:'titan',power:'hybrid',science:'lab',radio:'array'});assert.ok(expensive.cost>325);assert.equal(expensive.ready,false);
});
test('multiple science tools add mass, credits and watts exactly once and can be removed',()=>{
 let loadout={...DEFAULT_LOADOUT};loadout=toggleScience(loadout,'ground_radar');loadout=toggleScience(loadout,'magnetometer');
 const t=missionTotals(loadout,'moon'),base=missionTotals(DEFAULT_LOADOUT,'moon');
 assert.equal(t.mass-base.mass,50);assert.equal(t.cost-base.cost,68);assert.equal(t.demand-base.demand,30);assert.equal(t.items.filter(p=>p.group==='science').length,3);
 assert.equal(COMPONENTS.science.find(p=>p.id==='ground_radar').data,50);assert.equal(COMPONENTS.science.find(p=>p.id==='magnetometer').data,35);
 loadout=toggleScience(loadout,'ground_radar');assert.equal(missionTotals(loadout).mass-base.mass,18);
 assert.equal(validLoadout({...loadout,scienceTools:['camera','camera']}),false);
 assert.equal(validDraftLoadout({...emptyLoadout(),science:'camera',scienceTools:[]}),false);
});
test('every destination has an affordable full-survey payload and power responds to sunlight',()=>{
 for(const destination of ['titan','moon','mars']){
  const loadout=surveyLoadout(destination),t=missionTotals(loadout,destination);assert.equal(t.ready,true);assert.equal(discoveryCoverage(loadout,destination).filter(d=>d.allowed).length,5);
  assert.ok(t.cost<=325);assert.ok(t.mass<=t.capacity);assert.deepEqual(restoreAdventure({...freshAdventure(destination),loadout}).loadout,loadout);
 }
 const kit={...DEFAULT_LOADOUT,power:'solar',science:'seismic'};
 assert.equal(missionTotals(kit,'moon').supply,180);assert.equal(missionTotals(kit,'moon',true).supply,0);assert.equal(missionTotals(kit,'mars').supply,95);
 assert.equal(missionTotals(kit,'titan').science,0);assert.equal(missionTotals(kit,'moon').science,45);
 assert.match(scienceWarning('ground_radar','titan'),/solid terrain/);assert.match(scienceWarning('magnetometer','mars'),/global dynamo/);
});
test('large tool stacks require real mass and price tradeoffs; battery endurance uses full payload draw',()=>{
 const kit={rocket:'scout',power:'hybrid',radio:'array',science:'lab',scienceTools:COMPONENTS.science.map(p=>p.id)},t=missionTotals(kit);
 assert.ok(t.mass>170);assert.ok(t.cost>325);assert.equal(t.ready,false);assert.match(t.issues.join(' '),/heavy/);
 const battery=missionTotals({...DEFAULT_LOADOUT,power:'battery'});assert.equal(battery.hours,600/battery.demand);
});
test('partial choices, old saves and multi-instrument arrays migrate without aliases or shared arrays',()=>{
 const state=freshAdventure();state.loadout.rocket='scout';assert.equal(missionTotals(state.loadout).cost,50);assert.equal(missionTotals(state.loadout).mass,0);assert.equal(missionTotals(state.loadout).ready,false);
 assert.deepEqual(restoreAdventure(state),state);assert.equal(restoreAdventure({...state,stage:'launch',parts:['floats','power','radio']}),null);
 state.loadout=surveyLoadout('titan');state.parts=['floats','power','radio'];
 for(const stage of ['assemble','launch','cruise','landing','lake']){state.stage=stage;assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);}
 const copy=restoreAdventure(state);copy.loadout.scienceTools.push('magnetometer');assert.notDeepEqual(copy.loadout.scienceTools,state.loadout.scienceTools);
 const migrated=restoreAdventure({...state,loadout:{body:'shield',radio:'array',science:'lab',power:'battery'}});assert.equal(migrated.loadout.rocket,'atlas');
 const legacy={...state};delete legacy.loadout;assert.deepEqual(restoreAdventure(legacy).loadout,DEFAULT_LOADOUT);
 for(const loadout of [null,{},'solar',{...DEFAULT_LOADOUT,power:'unknown'}])assert.equal(restoreAdventure({...state,loadout}),null);
});
