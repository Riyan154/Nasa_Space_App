import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPONENTS, DEFAULT_LOADOUT, missionTotals, validLoadout } from '../src/builder-model.js';
import { freshAdventure, restoreAdventure } from '../src/adventure-model.js';

test('balanced build includes core and every installed component exactly once',()=>{
  const t=missionTotals(DEFAULT_LOADOUT);
  assert.equal(t.mass,138);assert.equal(t.cost,280);assert.equal(t.demand,35);assert.equal(t.margin,75);assert.equal(t.ready,true);assert.equal(t.hours,null);
});
test('power swapping changes mass and cost, supports a solar starter, and reports finite battery energy',()=>{
  const solar=missionTotals({...DEFAULT_LOADOUT,power:'solar'});
  assert.equal(solar.mass,118);assert.equal(solar.cost,235);assert.equal(solar.margin,10);assert.equal(solar.ready,true);
  const overloaded=missionTotals({...DEFAULT_LOADOUT,power:'solar',science:'lab'});
  assert.equal(overloaded.ready,false);assert.match(overloaded.issues[0],/sunlight/);
  const battery=missionTotals({...DEFAULT_LOADOUT,power:'battery'});
  assert.equal(battery.cost,245);assert.equal(battery.mass,123);assert.equal(battery.ready,true);assert.equal(battery.hours,600/35);
});
test('Scout cannot lift the heaviest kit and Horizon can exceed the wallet',()=>{
  const kit={power:'hybrid',science:'lab',radio:'array'};
  const scout=missionTotals({...kit,rocket:'scout'});
  assert.equal(scout.mass,201);assert.equal(scout.ready,false);assert.match(scout.issues.join(' '),/heavy/);
  const horizon=missionTotals({...kit,rocket:'horizon'});assert.equal(horizon.cost,425);assert.match(horizon.issues.join(' '),/budget/);
});
test('all 192 combinations use selected rocket capacity and each rocket has an affordable starter',()=>{
  let count=0;
  for(const rocket of COMPONENTS.rocket){
    assert.ok(missionTotals({...DEFAULT_LOADOUT,rocket:rocket.id}).ready,rocket.id);
    for(const power of COMPONENTS.power)for(const science of COMPONENTS.science)for(const radio of COMPONENTS.radio){
      const design={rocket:rocket.id,power:power.id,science:science.id,radio:radio.id},t=missionTotals(design);
      assert.ok(validLoadout(design));assert.equal(t.ready,t.mass<=rocket.capacity&&t.cost<=350&&t.supply>=t.demand);
      assert.equal(t.cost,50+rocket.cost+power.cost+science.cost+radio.cost);
      assert.equal(t.demand,15+science.draw+radio.draw);assert.equal(t.mass,65+power.mass+science.mass+radio.mass);count++;
    }
  }
  assert.equal(count,192);
});
test('custom parts survive every checkpoint, old saves migrate, and corrupt selections are rejected',()=>{
  const state=freshAdventure();state.loadout={rocket:'scout',power:'battery',science:'sampler',radio:'whip'};
  for(const stage of ['assemble','launch','cruise','landing','lake']){
    state.stage=stage;state.parts=['floats','power','radio'];assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);
  }
  const migrated=restoreAdventure({...state,loadout:{body:'shield',radio:'array',science:'lab',power:'battery'}});
  assert.deepEqual(migrated.loadout,{rocket:'atlas',radio:'array',science:'lab',power:'battery'});
  const old={...state};delete old.loadout;assert.deepEqual(restoreAdventure(old).loadout,DEFAULT_LOADOUT);
  for(const loadout of [null,{},'solar',{...DEFAULT_LOADOUT,power:'unknown'}])assert.equal(restoreAdventure({...state,loadout}),null);
  const a=freshAdventure(),b=freshAdventure();a.loadout.power='solar';assert.equal(b.loadout.power,'rtg');
});
