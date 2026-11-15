import test from 'node:test';
import assert from 'node:assert/strict';
import {createScienceGame,setScienceControl,advanceScience,tapDrill,spectrumError,scienceGameFor,LASER_ROUND_TRIP} from '../src/science-model.js';
import {freshAdventure,restoreAdventure,applySurfaceCurrent} from '../src/adventure-model.js';
import {DEFAULT_LOADOUT} from '../src/builder-model.js';
import {hohmannTransfer,transferProfile,transferPosition,trajectoryMarkup} from '../src/trajectory.js';
function tick(game,seconds){for(let t=0;t<seconds;t+=.01)advanceScience(game,Math.min(.01,seconds-t));}
test('station challenges are exclusive to the correct destination and discovery',()=>{
  assert.equal(scienceGameFor('moon','reflector'),'laser');assert.equal(scienceGameFor('titan','lake'),'spectrometer');assert.equal(scienceGameFor('mars','delta'),'drill');
  for(const [destination,id] of [['moon','lake'],['mars','reflector'],['titan','delta'],['moon','ice']])assert.equal(scienceGameFor(destination,id),null);
});
test('laser needs three continuous aligned seconds and a real light-time return before completion',()=>{
  const game=createScienceGame('laser');tick(game,5);assert.equal(game.lock,0);assert.equal(game.complete,false);
  setScienceControl(game,'angle',0);tick(game,2.5);assert.ok(game.lock>2.49);setScienceControl(game,'angle',8);tick(game,.1);assert.equal(game.lock,0);
  setScienceControl(game,'angle',2);tick(game,3.02);assert.equal(game.phase,'pulse');assert.equal(game.complete,false);
  assert.ok(Math.abs(LASER_ROUND_TRIP-2.56444)<.00001);tick(game,2);assert.equal(game.complete,false);tick(game,.6);assert.equal(game.complete,true);
  const before=structuredClone(game);setScienceControl(game,'angle',-20);advanceScience(game,.05);assert.deepEqual(game,before);
});
test('spectrometer requires both correct molecular patterns and a held waveform alignment',()=>{
  const game=createScienceGame('spectrometer');setScienceControl(game,'choice','ethane');setScienceControl(game,'offset',0);tick(game,4);assert.equal(game.round,0);assert.ok(spectrumError(game)>.018);
  setScienceControl(game,'choice','methane');setScienceControl(game,'offset',7);tick(game,3);assert.equal(game.round,0);
  setScienceControl(game,'offset',0);tick(game,1.3);assert.equal(game.round,1);assert.equal(game.choice,'');assert.equal(game.complete,false);
  setScienceControl(game,'choice','ethane');setScienceControl(game,'offset',0);tick(game,1.3);assert.equal(game.complete,true);
});
test('drill cannot earn a core while idle or overheated and recovers without losing earned depth',()=>{
  const game=createScienceGame('drill');tick(game,10);assert.equal(game.depth,0);
  for(let i=0;i<9;i++)tapDrill(game);tick(game,2);assert.equal(game.venting,true);assert.equal(game.complete,false);assert.equal(tapDrill(game),false);
  const depth=game.depth;tick(game,3);assert.equal(game.venting,false);assert.equal(game.depth,depth);
  for(let i=0;i<4000&&!game.complete;i++){if(game.pressure<.45&&!game.venting)tapDrill(game);advanceScience(game,.01);}
  assert.equal(game.complete,true);assert.equal(game.depth,1);assert.equal(tapDrill(game),false);
});
test('science controls reject invalid values and background stalls do not skip challenges',()=>{
  const laser=createScienceGame('laser');setScienceControl(laser,'angle',NaN);assert.equal(laser.angle,-22);
  setScienceControl(laser,'angle',0);advanceScience(laser,60);assert.equal(laser.lock,.05);
  const spectrum=createScienceGame('spectrometer');setScienceControl(spectrum,'choice','fake');assert.equal(spectrum.choice,'');
  advanceScience(spectrum,NaN);assert.ok(Number.isFinite(spectrum.matched));assert.equal(spectrum.complete,false);
});
function seaState(sea='ligeia'){return {...freshAdventure('titan',sea),stage:'lake',parts:['floats','power','radio'],loadout:{...DEFAULT_LOADOUT},x:500,y:.75};}
test('Kraken drifts more strongly, stabilizers hold position, and solid worlds have no sea drift',()=>{
  const gentle=seaState(),strong=seaState('kraken');
  for(let i=0;i<200;i++){applySurfaceCurrent(gentle,.05,i*.05);applySurfaceCurrent(strong,.05,i*.05);}
  assert.ok(strong.x-500>(gentle.x-500)*4);
  strong.anchored=true;const before=structuredClone(strong);for(let i=0;i<50;i++)applySurfaceCurrent(strong,.05,0);assert.deepEqual(strong,before);
  for(const destination of ['moon','mars']){const state={...seaState(),destination};applySurfaceCurrent(state,.05,0);assert.equal(state.x,500);assert.equal(state.y,.75);}
  const stalled=seaState('kraken');applySurfaceCurrent(stalled,100,0);assert.ok(stalled.x<501);
  stalled.x=2700;stalled.y=.9;applySurfaceCurrent(stalled,.05,0);assert.equal(stalled.x,2700);assert.equal(stalled.y,.9);
});
test('sea selection and anchoring persist; old version-two saves default to calm Ligeia',()=>{
  const state=seaState('kraken');state.anchored=true;assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);
  const legacy=seaState();delete legacy.sea;delete legacy.anchored;const restored=restoreAdventure(legacy);assert.equal(restored.sea,'ligeia');assert.equal(restored.anchored,false);
  assert.equal(restoreAdventure({...state,sea:'unknown'}),null);assert.equal(restoreAdventure({...state,anchored:'true'}),null);assert.equal(restoreAdventure({...state,destination:'moon'}),null);
  assert.equal(restoreAdventure({...state,sea:null}),null);assert.equal(restoreAdventure({...state,anchored:null}),null);
});
test('Hohmann trajectories touch both circular orbits and meet the moving target',()=>{
  for(const destination of ['titan','moon','mars']){
    const profile=transferProfile(destination),start=transferPosition(profile,0),end=transferPosition(profile,1);
    assert.ok(Math.abs(start.x-profile.r1)<profile.r1*1e-9);assert.ok(Math.abs(end.x+profile.r2)<profile.r2*1e-9);
    assert.ok(Math.abs(end.y)<profile.r2*1e-9);assert.ok(Math.abs(end.targetAngle-Math.PI)<1e-12);
    assert.ok(profile.departure>0&&profile.capture>0);assert.ok(trajectoryMarkup(destination).includes('Hohmann'));
    for(let i=0;i<=100;i++){const p=transferPosition(profile,i/100);assert.ok([p.x,p.y,p.targetAngle].every(Number.isFinite));}
  }
  assert.ok(Math.abs(transferProfile('mars').days-258.86)<.1);assert.ok(transferProfile('moon').days>4&&transferProfile('moon').days<6);
  assert.equal(transferProfile('moon').central,'Earth');assert.equal(transferProfile('titan').target,'Saturn');
  assert.throws(()=>hohmannTransfer(10,2,1));assert.throws(()=>hohmannTransfer(NaN,2,1));
});
test('equal elapsed flight time obeys Kepler’s equation rather than moving uniformly around the ellipse',()=>{
  const profile=transferProfile('titan'),point=transferPosition(profile,.25);
  assert.ok(point.eccentric>Math.PI*.25);
  assert.ok(Math.abs(point.eccentric-profile.e*Math.sin(point.eccentric)-Math.PI*.25)<1e-10);
});
