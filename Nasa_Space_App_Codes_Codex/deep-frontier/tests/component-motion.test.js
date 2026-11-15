import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPONENTS,surveyLoadout} from '../src/builder-model.js';
import {COMPONENT_INFO,componentInfoMarkup} from '../src/component-info.js';
import {renderBuilder} from '../src/builder-view.js';
import {thrusterLayout} from '../src/transit.js';
import {updateTrails,drawTrails} from '../src/surface-trails.js';
import {freshAdventure} from '../src/adventure-model.js';

test('rocket cards omit info buttons while other categories retain accessible explanations',()=>{
 const nodes=new Map(),root={querySelector:s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',classList:{toggle(){}}});return nodes.get(s);},querySelectorAll:()=>[]};
 for(const [group,items] of Object.entries(COMPONENTS)){renderBuilder(root,surveyLoadout('moon'),group,'moon');const cards=root.querySelector('#builder-options').innerHTML;
  assert.equal((cards.match(/class="component-info"/g)||[]).length,group==='rocket'?0:items.length);
  for(const item of items){assert.ok(COMPONENT_INFO[item.id]);const html=componentInfoMarkup(item,group);assert.match(html,/Where is this useful/);assert.match(html,/component-info-art/);assert.match(html,/data-game="close"/);assert.equal(cards.includes(`aria-label="About ${item.name}"`),group!=='rocket');assert.ok(COMPONENT_INFO[item.id][2].length>=2);}
  assert.ok(!/<button[^>]*>[\s\S]*?<button/.test(cards.split('</button>')[0]));
 }
});
test('only the rear engine fires, gimbals opposite steering and throttles down for reverse',()=>{
 for(const dx of [-1,0,1])for(const dy of [-1,-.3,0,.3,1]){const jets=thrusterLayout(dx,dy);assert.equal(jets.length,1);const jet=jets[0];assert.equal(jet.main,true);assert.ok(jet.x<0);assert.equal(jet.y,0);assert.ok(jet.ex<0);assert.ok(Math.abs(Math.hypot(jet.ex,jet.ey)-1)<1e-10);if(dy)assert.ok(jet.ey*dy<0);else assert.equal(Math.abs(jet.ey),0);}
 const forward=thrusterLayout(1),braking=thrusterLayout(-1);assert.ok(forward[0].level>thrusterLayout()[0].level);assert.ok(braking[0].level<thrusterLayout()[0].level);
 assert.deepEqual(thrusterLayout(NaN,Infinity),thrusterLayout());
});
test('wake and tread emitters stay strictly behind movement in every compass direction',()=>{
 for(const destination of ['titan','moon','mars'])for(const [dx,dy] of [[15,0],[-15,0],[0,15],[0,-15],[12,12],[-12,-12],[-12,12],[12,-12]]){
  const state={...freshAdventure(destination),x:500,y:.75},trails=updateTrails([],state,.05,true,false,{dx,dy,height:700});assert.equal(trails.length,1);const p=trails[0];assert.ok((p.x-state.x)*dx+(p.y-state.y)*700*dy<0);assert.ok(Math.abs(Math.hypot(p.ux,p.uy)-1)<1e-10);assert.deepEqual(updateTrails(trails,state,destination==='titan'?2.5:12,false),[]);
  const calls=[],c=new Proxy({},{get:(_,k)=>k==='globalAlpha'?1:(...args)=>calls.push([k,...args])});drawTrails(c,trails,state,0,1200,700,1);assert.equal(calls.filter(c=>c[0]==='fillRect'||c[0]==='strokeRect').length,0);if(destination==='titan')assert.equal(calls.filter(c=>c[0]==='quadraticCurveTo').length,2);else assert.equal(calls.filter(c=>c[0]==='stroke').length,2);
 }
});
