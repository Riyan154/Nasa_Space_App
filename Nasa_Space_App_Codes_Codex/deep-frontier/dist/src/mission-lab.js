import {COMPONENTS, DEFAULT_LOADOUT, missionTotals, BUILDER_LIMITS, scienceTools, toggleScience, cloneLoadout, scienceWarning} from './builder-model.js';
import {componentArt, explorer} from './adventure-art.js';
import {read,write} from './storage.js';
import {GOALS,LAB_KEY,restoreLab,signature,assess,powerTrial,radioTrial,reviewed} from './lab-model.js';
import './native-model-viewer.js';

const asset=name=>new URL(name,import.meta.url).href;
const steps=['Idea','Feasibility','Compare','Mission review'];
const groups={rocket:'Rocket',power:'Power',science:'Science',radio:'Radio'};
const source='https://science.nasa.gov/3d-resources/cassini-huygens-a/';
const topics={
  mission:['Two spacecraft, one journey','Cassini orbited Saturn. Huygens separated and descended through Titan’s atmosphere by parachute. Compare the combined spacecraft with the probe on its own.'],
  dish:['A focused connection to Earth','The large high-gain dish concentrates radio signals. In your design, a faster radio shortens the downlink but also uses more power.'],
  shield:['Protection for the descent','Huygens travelled inside an entry system that protected it while the atmosphere slowed it down. Pip’s lake explorer also needs protection during arrival.']
};
const button=(action,label,extra='')=>`<button data-lab="${action}" ${extra}>${label}</button>`;
const selectedPart=(state,group)=>COMPONENTS[group].find(p=>p.id===state.loadout[group]);

export function mountMissionLab(root,{onHome,onLaunch,onEngineering,reducedMotion=false}){
  if(!document.querySelector('link[data-mission-lab]')){
    const css=document.createElement('link');css.rel='stylesheet';css.href=asset('./mission-lab.css');css.dataset.missionLab='';document.head.append(css);
  }
  let state=restoreLab(read(LAB_KEY,null)), category='science', disposed=false, running=null, frame=0;
  const abort=new AbortController(), signal=abort.signal;
  const gentle=reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rotating=!gentle;
  root.innerHTML=`<main class="mission-lab">
    <header class="lab-top"><span class="lab-brand">TITAN <small> / MISSION LAB</small></span><div class="lab-top-actions">${button('engineering','Engineering console')}${button('home','← Adventure')}</div></header>
    <div class="lab-intro"><div><span class="lab-eyebrow">Advanced spacecraft workshop</span><h1>Give your mission a purpose.</h1><p>Investigate a real spacecraft. Build Pip’s next expedition.</p></div><nav class="lab-steps" aria-label="Mission design stages"></nav></div>
    <div class="lab-grid"><section class="lab-panel lab-left" aria-label="Mission equipment"></section>
      <div class="lab-main"><section class="lab-viewer" aria-label="NASA spacecraft inspection">
        <div class="lab-model-controls">${button('cassini','Cassini + Huygens','aria-pressed="true"')}${button('huygens','Huygens probe','aria-pressed="false"')}</div>
        <model-viewer camera-controls touch-action="pan-y" shadow-intensity="0.7" exposure="1.25" environment-image="neutral" camera-orbit="35deg 75deg auto" interaction-prompt="none" alt="NASA Cassini–Huygens spacecraft reference model. Drag to rotate and scroll to zoom."></model-viewer>
        <output class="lab-status" aria-live="polite">Loading NASA spacecraft…</output>
        <div class="lab-viewer-tools">${button('zoom-in','+ Zoom','aria-label="Zoom in"')}${button('zoom-out','− Zoom','aria-label="Zoom out"')}${button('reset','Reset view')}${button('rotate',gentle?'Rotate':'Pause rotation',`aria-pressed="${!gentle}"`)}</div>
      </section><div class="lab-reference-caption"><p id="lab-model-name">NASA spacecraft reference</p><small>NASA/Brian E. Kumanchik · <a href="${source}" target="_blank" rel="noopener">Model source ↗</a></small></div>
      <p class="lab-note">NASA geometry study · simplified materials · native Canvas rendering</p><div class="lab-topics" aria-label="Spacecraft field notes">${button('topic-mission','Mission architecture')}${button('topic-dish','High-gain dish')}${button('topic-shield','Entry probe')}</div><div class="lab-topic-info"></div>
      <section class="lab-panel lab-work" aria-label="Mission design activity"></section>
      <div class="lab-next"></div></div><aside class="lab-panel lab-aside" aria-label="Live mission resources"></aside></div>
  </main>`;
  const q=selector=>root.querySelector(selector), viewer=q('model-viewer');
  const save=()=>{if(!write(LAB_KEY,state))q('.lab-check').textContent='Browser storage unavailable. Keep this tab open to retain your design.';};
  const note=text=>{q('.lab-topic-info').innerHTML=`<h3>${topics[state.topic][0]}</h3><p>${text||topics[state.topic][1]}</p>`;};
  function invalidate(){state.tests={};stopTest();save();}
  function stopTest(){cancelAnimationFrame(frame);frame=0;running=null;}
  function gauges(){
    const t=assess(state);
    function gauge(label,value,max,unit,warning){return `<div class="lab-gauge ${warning?'bad':''}"><label>${label}</label><strong>${value}<small> / ${max} ${unit}</small></strong><meter min="0" max="${max}" value="${value}" aria-label="${label}"></meter></div>`;}
    q('.lab-aside').innerHTML=`<span class="lab-eyebrow">Pip’s mission resources</span>${gauge('Payload mass',t.mass,t.capacity,'kg',t.mass>t.capacity)}${gauge('Budget',t.cost,BUILDER_LIMITS.budget,'MC',t.cost>BUILDER_LIMITS.budget)}${gauge('Power use',t.demand,t.supply,'W',t.margin<0)}
      <div class="lab-check ${t.ready?'':'warn'}" role="status">${t.ready?'✓ Equipment fits the science goal.':t.errors[0]}</div><p class="lab-note">Equipment ratings and tests use game values. The NASA models show real spacecraft for comparison.</p>`;
  }
  function parts(){
    q('.lab-left').innerHTML=`<span class="lab-eyebrow">Your expedition</span><h2>${GOALS[state.goal].name}</h2><p>${GOALS[state.goal].hint}</p><div class="lab-tabs">${Object.entries(groups).map(([id,name])=>button('category-'+id,name,`aria-pressed="${category===id}"`)).join('')}</div><div class="lab-parts">${COMPONENTS[category].map(p=>button('part-'+p.id,`<canvas width="130" height="108" data-part-art="${p.id}" aria-hidden="true"></canvas><span><strong>${p.name}</strong><small>${p.capacity?p.capacity+' kg lift':p.mass+' kg'} · ${p.cost} MC<br>${p.supply?p.supply+' W available':p.rate?p.rate+' units/h · '+p.draw+' W':p.draw+' W use'}</small></span>`,`class="lab-part" aria-pressed="${category==='science'?scienceTools(state.loadout).includes(p.id):state.loadout[category]===p.id}"`)).join('')}</div><p class="lab-explanation">${selectedPart(state,category)?.detail||'Choose science instruments.'} ${category==='science'?scienceTools(state.loadout).map(id=>scienceWarning(id,'titan')).filter(Boolean).join(' '):''}</p>`;
    root.querySelectorAll('[data-part-art]').forEach(c=>componentArt(c.getContext('2d'),c.dataset.partArt,65,54,.7));
  }
  function comparison(){
    const current=assess(state), snapshot=state.saved, before=snapshot?missionTotals(snapshot.loadout):null;
    const rows=[['Science goal',snapshot?GOALS[snapshot.goal].name:'—',GOALS[state.goal].name],...Object.keys(groups).map(group=>[groups[group],snapshot?COMPONENTS[group].find(p=>p.id===snapshot.loadout[group])?.name||'None':'—',selectedPart(state,group)?.name||'None']),['Mass',before?before.mass+' kg':'—',current.mass+' kg'],['Cost',before?before.cost+' MC':'—',current.cost+' MC'],['Power reserve',before?before.margin+' W':'—',current.margin+' W']];
    return `<span class="lab-eyebrow">Explore the trade space</span><h2>What does a change buy you?</h2><p>Save a design, swap a part, and compare the cost, mass and power reserve.</p>${button('snapshot',snapshot?'Replace saved design':'Save current design')}${snapshot?' '+button('restore','Use saved design'):''}<table class="lab-comparison"><thead><tr><th>Measure</th><th>Saved</th><th>Current</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>i?`<td>${cell}</td>`:`<th scope="row">${cell}</th>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function testCard(kind,title,graphic){
    const passed=state.tests[kind]===signature(state), result=kind==='power'?powerTrial(state):radioTrial(state);
    return `<div class="lab-test" data-test="${kind}"><div class="lab-test-graphic" aria-hidden="true">${graphic}</div><h3>${title}</h3><p>${kind==='power'?'Run housekeeping, science and radio for two mission hours.':'Deploy the antenna, check the ground link and send 180 data units.'}</p><div class="lab-progress"><i></i></div><output aria-live="polite">${passed?'✓ '+result.message:'Ready to test this design.'}</output>${button('test-'+kind,passed?'Run again':'Run '+kind+' test')}</div>`;
  }
  function review(){
    const t=assess(state), checks=[['Equipment fits within mass, budget and power limits',t.ready],['Selected instrument addresses the science goal',t.science],['Power test complete',state.tests.power===signature(state)],['Radio test complete',state.tests.radio===signature(state)]];
    return `<span class="lab-eyebrow">Your mission point design</span><h2>Ready for the frontier?</h2><div class="lab-pip-card"><canvas id="lab-pip" width="340" height="260" aria-label="Pip with your selected equipment"></canvas><p>${GOALS[state.goal].question}<br><strong>${selectedPart(state,'science')?.name||'Choose tools'}</strong></p></div><ul class="lab-checklist">${checks.map(([text,pass])=>`<li>${pass?'✓':'○'} ${text}</li>`).join('')}</ul><p class="lab-pledge">Launch sends this equipment into Pip’s Titan adventure. The tests model power and downlink decisions in a compressed teaching scenario.</p>${button('launch','Launch this expedition →',`class="lab-primary" ${reviewed(state)?'':'disabled'}`)}`;
  }
  function render(){
    q('.lab-steps').innerHTML=steps.map((name,i)=>button('step-'+i,`${i+1}. ${name}`,`aria-current="${state.step===i?'step':'false'}"`)).join('');
    parts();gauges();note();
    const content=[()=>`<span class="lab-eyebrow">Science leads the design</span><h2>What will Pip discover?</h2><p>Choose a question. Then give Pip the instrument that can answer it.</p><div class="lab-goals">${Object.entries(GOALS).map(([id,g])=>button('goal-'+id,`<strong>${g.name}</strong><small>${g.question}</small>`,`aria-pressed="${state.goal===id}"`)).join('')}</div>`,()=>`<span class="lab-eyebrow">Test your assumptions</span><h2>Make every watt count.</h2><p>A successful mission gathers science and sends it home. These tests pause when the page is hidden.</p><div class="lab-test-grid">${testCard('power','Power balance','<div class="lab-battery"></div><span>→</span><span>SCIENCE</span>')}${testCard('radio','Antenna & downlink','<span class="lab-dish">◡</span><span class="lab-signal"></span><span>EARTH</span>')}</div>`,comparison,review];
    q('.lab-work').innerHTML=content[state.step]();
    q('.lab-next').innerHTML=`${button('back','← '+(state.step?steps[state.step-1]:'Adventure'))}${state.step<3?button('next',steps[state.step+1]+' →','class="lab-primary"'):button('step-1','Return to testing')}`;
    const c=q('#lab-pip');if(c)explorer(c.getContext('2d'),170,166,1.45,0,{loadout:state.loadout});
  }
  function loadModel(){
    q('.lab-status').textContent='Loading NASA spacecraft…';
    viewer.src=asset('./models/'+(state.model==='huygens'?'huygens':'cassini-huygens')+'.glb');
    viewer.alt=state.model==='huygens'?'NASA model of the Huygens atmospheric entry probe.':'NASA model of the Cassini orbiter carrying Huygens.';
    q('#lab-model-name').textContent=state.model==='huygens'?'Huygens · atmospheric entry probe':'Cassini–Huygens · orbiter and atmospheric probe';
    for(const id of ['cassini','huygens'])q(`[data-lab="${id}"]`).setAttribute('aria-pressed',String(state.model===id));
  }
  function topic(id){
    state.topic=id;save();note();
    // The named dish mesh confirms this marker's position on the combined model.
    viewer.querySelectorAll('[slot^="hotspot"]').forEach(el=>el.remove());
    if(id==='dish' && state.model==='cassini'){
      const pin=document.createElement('button');pin.className='lab-pin';pin.slot='hotspot-dish';pin.dataset.position='0.0022 1.932 -0.1012';pin.dataset.normal='0 1 0';pin.textContent='+';pin.setAttribute('aria-label','High-gain antenna');viewer.append(pin);
      viewer.cameraOrbit='20deg 45deg auto';
    }else viewer.cameraOrbit=id==='shield'?'120deg 80deg auto':'35deg 75deg auto';
  }
  function runTest(kind){
    if(running)return;
    running=kind;const stamp=signature(state), result=kind==='power'?powerTrial(state):radioTrial(state);
    const card=q(`[data-test="${kind}"]`);card.classList.add('running');
    root.querySelectorAll('[data-lab^="test-"]').forEach(b=>b.disabled=true);
    let elapsed=0,previous=performance.now();
    const tick=now=>{
      if(disposed)return;
      if(!document.hidden)elapsed+=Math.min(.1,(now-previous)/1000);previous=now;
      const fraction=Math.min(1,elapsed/3.2);card.querySelector('.lab-progress i').style.width=fraction*100+'%';
      card.querySelector('output').textContent=kind==='power'?`Observing… ${(fraction*2).toFixed(1)} / 2.0 mission hours`:`${fraction<.3?'Deploying antenna…':'Downlink established…'} ${Math.round(Math.max(0,(fraction-.3)/.7)*180)} / 180 units`;
      if(fraction<1){frame=requestAnimationFrame(tick);return;}
      running=null;card.classList.remove('running');
      card.querySelector('output').textContent=(result.passed?'✓ ':'Adjust this design. ')+result.message;
      if(result.passed)state.tests[kind]=stamp;
      root.querySelectorAll('[data-lab^="test-"]').forEach(b=>b.disabled=false);save();
    };frame=requestAnimationFrame(tick);
  }
  root.addEventListener('click',event=>{
    const control=event.target.closest('[data-lab]');if(!control || control.disabled)return;const action=control.dataset.lab;
    if(action==='home'){save();onHome();return;}
    if(action==='engineering'){save();onEngineering();return;}
    if(action==='launch'){if(reviewed(state)){save();onLaunch(cloneLoadout(state.loadout));}return;}
    if(action==='next'||action==='back'||action.startsWith('step-')){
      stopTest();if(action==='back'&&state.step===0){onHome();return;}
      state.step=action==='next'?Math.min(3,state.step+1):action==='back'?state.step-1:Number(action.slice(5));render();save();return;
    }
    if(action.startsWith('goal-')){state.goal=action.slice(5);invalidate();render();return;}
    if(action.startsWith('category-')){category=action.slice(9);parts();return;}
    if(action.startsWith('part-')){
      if(COMPONENTS[category].some(p=>p.id===action.slice(5))){state.loadout=category==='science'?toggleScience(state.loadout,action.slice(5)):{...state.loadout,[category]:action.slice(5)};invalidate();render();}return;
    }
    if(action==='snapshot'){state.saved={goal:state.goal,loadout:cloneLoadout(state.loadout)};render();save();return;}
    if(action==='restore'&&state.saved){state.goal=state.saved.goal;state.loadout=cloneLoadout(state.saved.loadout);invalidate();render();return;}
    if(action.startsWith('test-')){runTest(action.slice(5));return;}
    if(action==='cassini'||action==='huygens'){state.model=action;loadModel();topic('mission');save();return;}
    if(action.startsWith('topic-')){if(action==='topic-shield'&&state.model!=='huygens'){state.model='huygens';loadModel();}topic(action.slice(6));return;}
    if(action==='rotate'){rotating=!rotating;viewer.autoRotate=rotating;control.textContent=rotating?'Pause rotation':'Rotate';control.setAttribute('aria-pressed',String(rotating));return;}
    if(action==='reset'){viewer.cameraTarget='auto auto auto';viewer.cameraOrbit='35deg 75deg auto';viewer.fieldOfView='30deg';return;}
    if((action==='zoom-in'||action==='zoom-out')&&viewer.loaded){const orbit=viewer.getCameraOrbit();viewer.cameraOrbit=`${orbit.theta}rad ${orbit.phi}rad ${orbit.radius*(action==='zoom-in'?.8:1.25)}m`;}
  },{signal});
  viewer.addEventListener('load',()=>{if(disposed)return;q('.lab-status').textContent='';viewer.autoRotate=rotating;topic(state.topic);},{signal});
  viewer.addEventListener('error',()=>{if(!disposed)q('.lab-status').textContent='The model could not load. Retry the model button. Equipment and mission tests remain available.';},{signal});
  render();loadModel();
  return ()=>{disposed=true;stopTest();abort.abort();viewer.remove();};
}
