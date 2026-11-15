import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LUNAR_DISCOVERIES,MARTIAN_DISCOVERIES} from '../src/adventure-model.js';

test('exported NASA geometry has finite bounds and no invalid triangle references',async()=>{
  for(const name of ['cassini-huygens','huygens']){
    const model=JSON.parse(await readFile(new URL(`../src/models/${name}-canvas.json`,import.meta.url),'utf8'));
    assert.match(model.credit,/NASA/);assert.ok(model.vertices.length>300);assert.ok(model.faces.length>600);
    for(const v of model.vertices)assert.ok(v.length===3&&v.every(Number.isFinite));
    for(const f of model.faces){assert.ok(f.slice(0,3).every(i=>Number.isInteger(i)&&i>=0&&i<model.vertices.length));assert.ok(f[3].every(c=>Number.isFinite(c)&&c>=0&&c<=255));}
  }
});
test('all three debrief images are bundled JPEGs and lunar/Martian discoveries have NASA references',async()=>{
  for(const name of ['Moon','Titan','Mars']){const b=await readFile(new URL(`../src/rewards/${name}.jpg`,import.meta.url));assert.equal(b[0],255);assert.equal(b[1],216);assert.ok(b.length>10000);}
  for(const d of [...LUNAR_DISCOVERIES,...MARTIAN_DISCOVERIES]){const url=new URL(d.source);assert.ok(url.hostname==='nasa.gov'||url.hostname.endsWith('.nasa.gov'));}
  const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));assert.equal(Object.keys(pkg.dependencies||{}).length,0);assert.equal(Object.keys(pkg.devDependencies||{}).length,0);
});
