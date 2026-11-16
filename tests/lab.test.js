import test from 'node:test';
import assert from 'node:assert/strict';
import {newLab,restoreLab,assess,signature,powerTrial,radioTrial,reviewed} from '../src/lab-model.js';

test('science goals require a suitable instrument and all checks before launch',()=>{
  const s=newLab();assert.ok(assess(s).ready);assert.equal(reviewed(s),false);
  for(const kind of ['power','radio'])s.tests[kind]=signature(s);
  assert.ok(reviewed(s));s.goal='chemistry';assert.equal(reviewed(s),false);assert.equal(assess(s).science,false);
  s.loadout.science='lab';assert.ok(assess(s).ready);assert.equal(reviewed(s),false);
});
test('power trial detects a solar deficit and finite battery endurance',()=>{
  const s=newLab();s.loadout.power='solar';s.loadout.science='lab';assert.equal(powerTrial(s).passed,false);
  s.loadout.power='battery';const t=powerTrial(s);assert.ok(t.passed);assert.equal(t.energyUsed,114);assert.equal(t.duration,600/57);
});
test('radio selection changes downlink time and accounts for battery use',()=>{
  const s=newLab();s.loadout.power='battery';s.loadout.radio='whip';
  assert.equal(radioTrial(s).hours,180/35);assert.ok(radioTrial(s).passed);
  s.loadout.radio='array';assert.equal(radioTrial(s).hours,1);
});
test('saved tests are tied to their design and corrupt saved comparisons are discarded',()=>{
  const s=newLab();s.tests.power=signature(s);s.tests.radio=signature(s);s.saved={goal:s.goal,loadout:{...s.loadout}};
  assert.ok(reviewed(restoreLab(JSON.parse(JSON.stringify(s)))));
  s.loadout.radio='array';assert.equal(reviewed(restoreLab(s)),false);
  s.saved.loadout.power='unknown';assert.equal(restoreLab(s).saved,null);
  assert.deepEqual(restoreLab({version:1}),newLab());
});
test('old lab designs and saved comparisons both migrate the removed launcher',()=>{
  const s=newLab();s.loadout.rocket='horizon';s.saved={goal:s.goal,loadout:{...s.loadout}};
  const restored=restoreLab(s);assert.equal(restored.loadout.rocket,'titan');assert.equal(restored.saved.loadout.rocket,'titan');
});
