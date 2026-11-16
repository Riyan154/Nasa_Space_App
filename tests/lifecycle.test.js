import test from 'node:test';
import assert from 'node:assert/strict';
import {mountAdventure,adventureMarkup} from '../src/adventure.js';
import {freshAdventure} from '../src/adventure-model.js';
import {surveyLoadout} from '../src/builder-model.js';

// A small DOM/RAF adapter exercises the real controller and delegated actions.
function environment(t,state){
 const globals=['window','document','ResizeObserver','devicePixelRatio','requestAnimationFrame','cancelAnimationFrame','localStorage','HTMLButtonElement'];
 const original=new Map(globals.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 let dispose=()=>{};
 t.after(()=>{dispose();for(const [k,d] of original)if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];});
 const nodes=new Map(),frames=new Map(),storage=new Map(),listeners=new Map();let id=0,now=0,disconnected=false;
 if(state){state.parts=['floats','power','radio'];storage.set('titan.adventure.v2',JSON.stringify(state));}
 const gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:s=>({width:String(s).length*7}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]||(()=>{})});
 function node(key){if(nodes.has(key))return nodes.get(key);const n={dataset:{},hidden:false,open:false,innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},style:{},value:'',getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1200,height:700}),setAttribute(){},getAttribute(){return null;},focus(){},remove(){},prepend(){},querySelector:s=>node(key+' '+s),querySelectorAll:()=>[],replaceChildren(){this.innerHTML='';},showModal(){this.open=true;},close(){this.open=false;},addEventListener(type,fn){listeners.set(key+':'+type,fn);}};nodes.set(key,n);return n;}
 const root=node('root');root.querySelector=s=>node(s);root.querySelectorAll=()=>[];
 globalThis.HTMLButtonElement=class{};
 globalThis.window={addEventListener(type,fn){listeners.set('window:'+type,fn);},matchMedia:()=>({matches:false})};
 globalThis.document={hidden:false,querySelector:s=>s==='dialog[open]'&&node('#adventure-popup').open?node('#adventure-popup'):null,createElement:()=>node('element'),addEventListener(){}};
 globalThis.ResizeObserver=class{observe(){}disconnect(){disconnected=true;}};
 globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 dispose=mountAdventure(root);
 return {node,frames,dispose,get disconnected(){return disconnected;},saved:()=>JSON.parse(storage.get('titan.adventure.v2')),key(type,key){listeners.get('window:'+type)({key,preventDefault(){}});},click(game,data={}){const el={dataset:{game,...data},closest(){return this;}};listeners.get('root:click')({target:el});},tick(count){for(let i=0;i<count;i++){const pending=[...frames.values()];frames.clear();now+=50;for(const fn of pending)fn(now);}}};
}
test('Storybook actions navigate all cards and close removes modal content; disposal cancels RAF',t=>{
 const e=environment(t);e.click('help');assert.equal(e.node('#adventure-popup').open,true);
 for(const page of [0,1,2,3,2,1,0]){e.click('academy-page',{page:String(page)});assert.match(e.node('#adventure-popup').innerHTML,new RegExp(`${page+1} / 4`));}
 e.click('close');assert.equal(e.node('#adventure-popup').open,false);assert.equal(e.node('#adventure-popup').innerHTML,'');e.dispose();assert.equal(e.frames.size,0);assert.equal(e.disconnected,true);e.dispose();
});
test('real launch controller plays overweight failure then restores exact payload with Return',t=>{
 const s=freshAdventure('moon');s.loadout={rocket:'scout',power:'rtg',radio:'dish',science:'camera',scienceTools:['camera','lab','ground_radar','magnetometer','seismic','sampler','weather']};s.stage='launch';
 const e=environment(t,s),kit=structuredClone(s.loadout);e.click('continue');
 e.key('keydown',' ');e.tick(60);assert.equal(e.saved().stage,'launch');assert.equal(e.node('#adventure-popup').open,false);e.tick(100);assert.match(e.node('#adventure-popup').innerHTML,/GRAVITY WON/);assert.equal(e.node('#adventure-popup').open,true);e.click('failure-workshop');assert.equal(e.saved().stage,'assemble');assert.deepEqual(e.saved().loadout,kit);assert.equal(e.node('#adventure-popup').open,false);e.dispose();
});
for(const destination of ['moon','mars','titan'])test(`${destination}: Skip to Landing immediately preserves hit counters and kit`,t=>{
 const s=freshAdventure(destination);s.loadout=surveyLoadout(destination);s.stage='cruise';s.transit.hits=1;s.transit.hull=75;
 const e=environment(t,s);e.click('continue');const before=e.saved();e.click('action');const after=e.saved();assert.equal(after.stage,'landing');assert.equal(after.transit.skipped,true);assert.equal(after.transit.hits,before.transit.hits);assert.deepEqual(after.loadout,before.loadout);
});
test('four timed debris hits open hull recovery and Retry restores the exact ship',t=>{
 const s=freshAdventure('titan');s.stage='cruise';s.loadout=surveyLoadout('titan');s.transit.spawn=999;s.transit.obstacles=[200,490,780,1070].map((x,id)=>({id,x,y:360,r:25,speed:200,kind:'carbon'}));
 const e=environment(t,s);e.click('continue');e.tick(160);assert.equal(e.saved().transit.hull,0);assert.equal(e.saved().transit.hits,4);assert.match(e.node('#adventure-popup').innerHTML,/CRUNCH/);assert.match(e.node('#adventure-popup').innerHTML,/retry-transit/);assert.match(e.node('#adventure-popup').innerHTML,/abort-transit/);const kit=e.saved().loadout;e.click('retry-transit');assert.equal(e.saved().transit.hull,100);assert.deepEqual(e.saved().loadout,kit);assert.equal(e.saved().stage,'cruise');
});
test('Return to Main Menu clears the failure and saves the same kit in the workshop',t=>{
 const s=freshAdventure('moon');s.stage='cruise';s.loadout=surveyLoadout('moon');s.transit.hull=0;s.transit.hits=4;s.transit.destroyed=true;
 const e=environment(t,s);e.click('continue');e.tick(45);assert.match(e.node('#adventure-popup').innerHTML,/CRUNCH/);e.click('abort-transit');assert.equal(e.saved().stage,'assemble');assert.deepEqual(e.saved().loadout,s.loadout);assert.equal(e.node('.adventure').dataset.stage,'home');assert.equal(e.node('#adventure-popup').open,false);
});
test('component info click explains hardware without installing or buying it',t=>{
 const s=freshAdventure('moon'),e=environment(t,s);e.click('continue');const before=e.saved().loadout;e.click('component-info',{group:'power',componentId:'rtg'});assert.match(e.node('#adventure-popup').innerHTML,/generator, not a battery/);assert.deepEqual(e.saved().loadout,before);e.click('close');assert.equal(e.node('#adventure-popup').open,false);
});
test('Titan has no deploy button and older anchored saves can still resume movement',t=>{
 assert.ok(!adventureMarkup().includes('data-game="anchor"'));assert.ok(!adventureMarkup().includes('anchor-control'));
 const s=freshAdventure('titan','kraken');s.stage='lake';s.anchored=true;s.loadout=surveyLoadout('titan');s.x=500;s.y=.75;const e=environment(t,s);e.click('continue');const held=e.saved();assert.equal(held.anchored,true);e.tick(40);assert.equal(e.saved().x,held.x);assert.equal(e.saved().y,held.y);e.key('keydown','ArrowLeft');e.tick(40);assert.equal(e.saved().anchored,false);assert.ok(e.saved().x<held.x);
});
