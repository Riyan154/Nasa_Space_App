import { discoveriesFor, discoveryAccess, discoveryCoverage, TITAN_SEAS, applySurfaceCurrent, isShadowed, missionDebrief, DISCOVERIES, FACT_SOURCE, freshAdventure, restoreAdventure, nearbyDiscovery, moveExplorer, collectDiscovery, finishAdventure, clamp } from './adventure-model.js';
import { lunarLandscape, lunarLander as renderLunarLander, lunarStation, landscape, explorer as renderExplorer, rocket, ellipse, path, box, glyph, star, launchCloud as cloud } from './adventure-art.js';
import { launchStation, hangar, scienceStation } from './station-art.js';
import { COMPONENTS, emptyLoadout, missionTotals, toggleScience, hasScience, surveyLoadout } from './builder-model.js';
import { builderMarkup, renderBuilder } from './builder-view.js';
import { read, write, loadPilotLogbook, savePilotExpedition } from './storage.js';
import {logbookMarkup,escapeText} from './pilot-logbook.js';
import {academyMarkup,academyPage} from './academy.js';
import {freshTransit,advanceTransit,skipTransit,transitArt} from './transit.js';
import {signalMarkup} from './communications.js';
import {surfaceLighting} from './adventure-model.js';
import {FOIL_ACCENTS,personalization,cleanCallsign,fitViewport,launchProfile,returnToWorkshop,retryTransit} from './flight-systems.js';
import {launchPermission} from './builder-model.js';
import {grandTour} from './pilot-logbook.js';
import {drawFailure} from './detail-art.js';
import {createFailure,advanceFailure,explosionPhase,failureContent} from './failure.js';
import {lunarHeadlights} from './planet-art.js';
import {eyeState} from './pip-eyes.js';
import {manageEnergy} from './adventure-model.js';
import { DESTINATIONS, destinationOf } from './catalog.js';
import { missionAudio } from './mission-audio.js';
import { marsScenery, descentCraft, surfaceDust, environmentVignette } from './planet-art.js';

import { LANDING_SECONDS, arrival, lunarArrival, marsArrival, landingDuration } from './titan-flight.js';

import {scienceGameFor} from './science-model.js';
import {scienceTitle,scienceMarkup,mountScienceGame} from './science-view.js';
import {destinationInfoMarkup} from './destination-info.js';
import {missionPhoto,downloadMissionPhoto} from './mission-reward.js';
import {trajectoryMarkup,updateTrajectory} from './trajectory.js';
import {updateTrails,drawTrails} from './surface-trails.js';

const KEY='titan.adventure.v2';
const chapters=['Build','Launch','Fly','Land','Explore'];
const stageNumber={assemble:0,launch:1,cruise:2,landing:3,lake:4,done:4};
const labels={assemble:'Build your buddy',launch:'Ready, set… space!',cruise:'Past the rings of Saturn',landing:'A soft landing',lake:'The lake of little wonders',done:'You did it, explorer!'};
export function adventureMarkup() {
  return `<main class="adventure" aria-label="Titan interactive game">
    <header class="game-top"><button class="game-logo" data-game="home" aria-label="Titan adventure home"><span class="logo-orbit">✦</span><span>TITAN<small>DEEP FRONTIER</small></span></button><div class="game-chapters" aria-label="Adventure chapters">${chapters.map((s,i)=>`<span data-chapter="${i}"><b>${i+1}</b>${s}</span>`).join('')}</div><nav><button data-game="audio-toggle" class="audio-toggle" aria-label="Enable audio" aria-pressed="false">🔇</button><button data-game="journal" aria-label="Discovery journal">▤ <span>My discoveries</span><b id="journal-count">0/5</b></button><button data-game="science" aria-label="Real NASA pictures">◉ <span>NASA pictures</span></button><button data-game="pause" aria-label="Pause and settings">Ⅱ</button></nav></header>
    <div class="playfield"><canvas id="game-canvas" tabindex="0" aria-label="Game world. Use arrow keys or W A S D to move. Space does the current action. You can also tap a destination."></canvas>
      <section id="welcome" class="game-welcome"><h1>Big wonders.<br><em>Little explorer.</em></h1><p id="welcome-intro">Fly to Titan. Splash into a strange sea.<br>Help Voyager discover what’s out there.</p><div class="destination-selector" role="group" aria-label="Choose your destination">${Object.values(DESTINATIONS).map(d=>`<div class="destination-card-wrap"><button data-game="destination" data-destination="${d.id}" aria-pressed="${d.id==='titan'}"><span>${d.id==='moon'?'☾':d.id==='mars'?'◉':'✦'}</span><b>${d.name}<small>${d.site}</small></b></button><button class="destination-info" data-game="destination-info" data-destination="${d.id}" aria-label="About ${d.name}">ⓘ</button></div>`).join('')}</div><div id="sea-selector" class="sea-selector" role="group" aria-label="Choose a Titan sea"><button data-game="sea" data-sea="ligeia" aria-pressed="true">Ligeia · Gentle</button><button data-game="sea" data-sea="kraken" aria-pressed="false">Kraken · Drifting</button></div><button class="play-button" data-game="play">Let’s play <span>▶</span></button><button class="continue-game" data-game="continue" hidden>Continue my adventure →</button></section>
      <button class="pilot-logbook-button" data-game="logbook">🎖 Pilot Logbook</button><div id="shield-warning" class="shield-warning" role="status" hidden>Shield absorbed impact · Keep steering!</div><section id="signal-transit" class="signal-transit" aria-label="Radio downlink to Earth" hidden></section><div id="shadow-alert" class="shadow-alert" role="status" hidden>SHADOW ZONE: Solar generation 0 W · Drawing on buffer battery!</div>
      <div id="game-heading" class="game-heading" hidden><span class="tiny-label" id="chapter-label"></span><h1 id="chapter-title"></h1><p id="instruction" role="status" aria-live="polite"></p></div>
      <div id="world-label" class="world-label"><span>YOUR DESTINATION</span><b>Ligeia Mare</b><small>A methane sea on Saturn’s moon</small></div>
      <div class="pip-tag" id="pip-tag"><b>Hi! I’m Voyager.</b><span>Your curious little co-pilot</span></div>
      ${builderMarkup()}
      <button id="edit-spacecraft" class="edit-spacecraft" data-game="edit-build" hidden>← Edit spacecraft</button>
      <button class="missing-tool-warning" id="missing-tool-warning" data-game="tool-help" hidden></button><div class="game-toast" id="game-toast" role="status" aria-live="polite"></div>
      <section id="trajectory-map" class="trajectory-map" aria-label="Orbital transfer map" hidden></section>
      <div id="surface-tools" class="surface-tools" hidden><span id="current-status">Surface current →</span><button id="anchor-control" data-game="anchor" aria-pressed="false">Deploy stabilizers ⚓</button></div>
      <div id="flight-meter" class="flight-meter" hidden><span id="meter-label"></span><div><i id="meter-fill"></i></div><section id="hull-display" hidden aria-label="Hull integrity"><b id="hull-text">HULL INTEGRITY · 100%</b><div class="hull-track"><i id="hull-fill"></i></div></section></div>
      <div id="mini-map" class="mini-map" hidden><span>LAKE MAP</span><div id="map-track">${DISCOVERIES.map(d=>`<button data-game="navigate" data-id="${d.id}" style="left:${d.x/2800*100}%" aria-label="Guide Pip to ${d.label.toLowerCase()}">●</button>`).join('')}<i id="map-pip"></i></div><small id="map-caption">Tap a dot to guide Pip there</small></div>
      <div id="game-controls" class="game-controls" hidden><div class="direction-pad" aria-label="Movement controls"><button data-direction="up" aria-label="Move up">↑</button><button data-direction="left" aria-label="Move left">←</button><button data-direction="down" aria-label="Move down">↓</button><button data-direction="right" aria-label="Move right">→</button></div><div class="action-wrap"><div class="action-progress"><i id="action-fill"></i></div><button class="play-button" id="game-action" data-game="action">Launch! <span>↑</span></button><small id="control-tip">Arrow keys / WASD to move · Space to act</small></div></div>
      <button class="floating-help" data-game="help" aria-label="How to play">?</button>
    </div>
    <dialog id="destination-info-modal" class="adventure-dialog destination-info-modal" aria-labelledby="destination-info-title"></dialog>
    <dialog id="adventure-popup" class="adventure-dialog" aria-labelledby="adventure-dialog-title"></dialog>
  </main>`;
}

export function mountAdventure(root, callbacks={}) {
  const canvas=root.querySelector('#game-canvas'), c=canvas.getContext('2d');
  const $=s=>root.querySelector(s), abort=new AbortController(), {signal}=abort;
  const popup=$('#adventure-popup'),infoPopup=$('#destination-info-modal');let infoInvoker=null;
  let saved=restoreAdventure(read(KEY,null)), state=saved?structuredClone(saved):freshAdventure();
  let home=true, w=1200,h=700,scale=1,raf=0,last=0,time=0,elapsed=0,saveTime=0,disposed=false;
  let camera=0,filmTime=0,selectedDestination=state.destination,selectedSea=state.sea,touchdownShake=0,launchTick=0,trajectoryStamp=-1,miniDispose=null;
  const world=()=>destinationOf(home?selectedDestination:state.destination), moon=()=>world().id==='moon', mars=()=>world().id==='mars', rocky=()=>world().id!=='titan', discoveries=()=>discoveriesFor(state);
  const site=()=>world().id==='titan'?TITAN_SEAS[home?selectedSea:state.sea].name:world().site;
  const sfx=missionAudio();
  let progress=0,working=null,launching=false,launchTime=0,transmitting=false,target=null;
  let particles=[],trails=[],direction=1,keys=new Set(),held=new Map(),textCache={},buildTab='rocket',deployment=1;
  let soundEnabled=read('titan.adventure.sound',false)===true;
  let scienceHazard=false,blurred=false,launchActivation=false,viewport=fitViewport(1200,700),failure=null;
  function fail(type,x,y){if(failure)return;failure=createFailure(type,x,y);state.incidents.aborts++;sfx.explode();persist();}
  function failureDialog(){const content=failureContent(failure.type,missionTotals(state.loadout,state.destination));showDialog(content.title,content.body);popup.querySelector('.dialog-x')?.remove();popup.querySelector('.play-button')?.focus();}
  function explorer(ctx,x,y,s,t,options={}){const v=input(),dx=v.dx||(target?Math.sign(target.x-state.x):0),dy=v.dy||(target?Math.sign(target.y-state.y):0);renderExplorer(ctx,x,y,s,t,{...options,accent:FOIL_ACCENTS[state.accent]?.color,wheelRotation:wheelAngle,eyes:eyeState({time:t,reduced,dx,dy,moving:!!options.moving,science:!!working||!!miniDispose,hazard:scienceHazard||state.batteryUsedWh>=600||(!home&&state.stage==='lake'&&state.sea==='kraken'&&!state.anchored),complete:!home&&state.sent})});}
  let reduced=callbacks.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const on=(node,event,fn)=>node.addEventListener(event,fn,{signal});
  function persist(){if(!write(KEY,state))toast('Saving is unavailable. Keep this tab open to keep playing.');saved=structuredClone(state);if(!home&&!savePilotExpedition(state,missionDebrief(state,missionTotals(state.loadout,state.destination))))toast('Pilot logbook could not be saved on this device.');}
  function text(id,value){if(textCache[id]!==value){$(id).textContent=value;textCache[id]=value;}}
  function visible(id,show){$(id).hidden=!show;}
  function toast(message){text('#game-toast',message);$('#game-toast').classList.add('visible');elapsed=0;}
  function ping(note=660){sfx.ping(note);}
  function burst(x,y,color='#f4d17b',amount=22){for(let i=0;i<amount;i++)particles.push({x,y,vx:Math.cos(i*2.4)*(30+i%7*17),vy:Math.sin(i*2.4)*(40+i%5*20)-50,life:1.3,color});}
  function resize(){const rect=canvas.getBoundingClientRect();viewport=fitViewport(rect.width,rect.height,devicePixelRatio);w=1200;h=700;scale=1;canvas.width=viewport.pixelWidth;canvas.height=viewport.pixelHeight;}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function resetRuntime(){trajectoryStamp=-1;progress=0;working=null;launching=false;launchTime=0;transmitting=false;filmTime=state.stage==='cruise'?(state.transit?.elapsed||0):0;touchdownShake=0;launchTick=0;target=null;keys.clear();held.clear();particles=[];trails=[];text('#game-toast','');$('#game-toast').classList.remove('visible');}
  function changeStage(stage){if(stage==='cruise')state.transit=freshTransit(state.destination);state.stage=stage;resetRuntime();persist();sync();ping(760);}
  function start(resume){home=false;if(!resume){state={...freshAdventure(selectedDestination,selectedSea),...personalization(read('deepfrontier.personalization',{}))};buildTab='rocket';}selectedDestination=state.destination;selectedSea=state.sea;resetRuntime();persist();sync();canvas.focus({preventScroll:true});}
  function sync(){
    const stage=state.stage;
    root.dataset.reduced=String(reduced);
    root.querySelector('[data-callsign]').value=state.callsign;root.querySelector('[data-foil]').value=state.accent||'gold';
    let ribbon=$('#grand-tour-ribbon');if(!ribbon){ribbon=document.createElement('span');ribbon.id='grand-tour-ribbon';ribbon.className='grand-tour-ribbon';ribbon.textContent='❦ GRAND TOUR MASTER ❦';$('#welcome').prepend(ribbon);}ribbon.hidden=!grandTour(loadPilotLogbook());
    const audioButton=$('[data-game="audio-toggle"]');audioButton.textContent=soundEnabled?'🔊':'🔇';audioButton.setAttribute('aria-pressed',String(soundEnabled));audioButton.setAttribute('aria-label',soundEnabled?'Mute audio':'Enable audio');
    root.querySelectorAll('[data-game="destination"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.destination===selectedDestination)));
    text('#welcome-intro',mars()?'Journey to Mars. Drive across Jezero Crater and uncover five clues to the Red Planet’s past.':moon()?'Drive to the Moon’s South Pole. Follow the light, explore the shadows, and bring five discoveries home.':'Fly to Titan. Splash into a strange sea. Help Voyager discover what’s out there.');
    visible('#sea-selector',home&&!rocky());
    root.querySelectorAll('[data-game="sea"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sea===selectedSea)));
    root.querySelector('[data-game="destination"][data-destination="titan"] small').textContent=TITAN_SEAS[selectedSea].name;
    text('#world-label b',site());text('#world-label small',mars()?'Mars · Ancient delta and wind-shaped plains':moon()?'Lunar South Pole · Sunlit rim and cold traps':'A methane sea on Saturn’s moon');
    root.querySelector('.adventure').dataset.destination=world().id;
    $('#mini-map > span').textContent=mars()?'JEZERO TRAVERSE':moon()?'SOUTH POLE MAP':'LAKE MAP';
    $('#map-track').innerHTML=discoveries().map(d=>`<button data-game="navigate" data-id="${d.id}" style="left:${d.x/2800*100}%" aria-label="Guide Pip to ${d.label.toLowerCase()}">●</button>`).join('')+'<i id="map-pip"></i>';
    root.classList.toggle('at-home',home);root.dataset.stage=home?'home':stage;
    $('.adventure').dataset.stage=home?'home':stage;
    visible('#welcome',home);visible('#game-heading',!home);visible('#pip-tag',home);visible('#world-label',home);
    $('[data-game="continue"]').hidden=!saved;
    visible('#mission-builder',!home&&stage==='assemble');visible('#game-controls',!home&&stage!=='assemble'&&stage!=='done'&&stage!=='landing');
    if(!home&&stage==='assemble')renderBuilder(root,state.loadout,buildTab,state.destination);
    visible('#mini-map',!home&&stage==='lake');visible('#flight-meter',!home&&['launch','cruise','landing'].includes(stage));
    visible('#edit-spacecraft',!home&&stage==='launch');
    visible('#surface-tools',!home&&stage==='lake'&&!rocky());
    visible('#trajectory-map',!home&&stage==='cruise');
    if(!home&&stage==='cruise'){$('#trajectory-map').innerHTML=trajectoryMarkup(state.destination);trajectoryStamp=-1;}
    text('#chapter-title',mars()?({cruise:'On course for the Red Planet',landing:'A soft touch on Mars',lake:'The lost river of Jezero',done:'Mars expedition complete'}[stage]||labels[stage]):moon()?({cruise:'Next stop: the Moon',landing:'Easy on the throttle',lake:'In the shadow of Shackleton',done:'Lunar expedition complete'}[stage]||labels[stage]):labels[stage]);text('#chapter-label',`CHAPTER ${stageNumber[stage]+1} OF 5 · PIP’S ${world().name.toUpperCase()} ADVENTURE`);
    root.querySelectorAll('[data-chapter]').forEach(node=>{node.classList.toggle('active',!home&&Number(node.dataset.chapter)===stageNumber[stage]);node.classList.toggle('complete',!home&&Number(node.dataset.chapter)<stageNumber[stage]);});
    root.querySelectorAll('[data-part]').forEach(node=>{const done=state.parts.includes(node.dataset.part);node.disabled=done;node.classList.toggle('attached',done);node.querySelector('b').textContent=done?'✓':'+';});
    text('#journal-count',`${state.found.length}/5`);
    root.querySelectorAll('[data-game="navigate"]').forEach(node=>{node.classList.toggle('found',state.found.includes(node.dataset.id));});
    visible('#missing-tool-warning',false);updateHUD();
  }
  function updateHUD(){
    if(home)return;
    visible('#hull-display',state.stage==='cruise');$('#hull-fill').style.width=state.transit.hull+'%';text('#hull-text','HULL INTEGRITY · '+state.transit.hull+'%');
    let instruction='',action='',disabled=false,meter='',amount=0;
    if(state.stage==='assemble')instruction='Choose a rocket, power, science tool and radio. Watch Pip take shape!';
    if(state.stage==='launch'){instruction=launching?'Up, up and away!':'Hold the big button (or Space) to lift off!';action=launching?'Lifting off…':'Hold to launch ↑';disabled=launching;meter=launching?'LIFT OFF!':`ROCKET POWER ${Math.round(progress*100)}%`;amount=progress;$('#edit-spacecraft').disabled=launching;}
    if(state.stage==='cruise'){
      instruction='Steer with arrows, WASD or touch. Dodge debris! A clean flight earns Evasive Pilot +15.';action='Skip to Landing ⏭';
      meter=`CRUISE TIME: ${Math.ceil(state.transit.duration-filmTime)}s · HULL INTEGRITY ${state.transit.hull}%`;amount=filmTime/state.transit.duration;
      $('#flight-meter').dataset.integrity=state.transit.hull<35?'critical':state.transit.hull<70?'warning':'healthy';
      root.querySelectorAll('[data-direction]').forEach(button=>button.disabled=false);
      const stamp=Math.floor(filmTime*12);
      if(stamp!==trajectoryStamp){trajectoryStamp=stamp;updateTrajectory($('#trajectory-map'),state.destination,amount,reduced);}
    }
    if(state.stage==='landing'){
      const shot=(mars()?marsArrival:moon()?lunarArrival:arrival)(filmTime);
      instruction=mars()?'Heat shield, parachute, rockets… then a gentle sky-crane landing.':moon()?'Follow the landing sequence: brake, settle, and deploy Pip.':'Watch Pip arrive at the northern methane sea.';
      meter=shot.phase.replace('Ligeia Mare',site());amount=filmTime/landingDuration(state.destination);
      if(moon())meter+=' · '+Math.round(shot.altitude)+' m · '+shot.velocity.toFixed(1)+' m/s';
    }
    if(state.stage==='lake'){
      const near=nearbyDiscovery(state),access=near?discoveryAccess(state,near.id):null,next=discoveries().find(d=>!state.found.includes(d.id));
      instruction=state.sent?'All discoveries sent! Keep exploring or open your journal.':transmitting?'Sending your discoveries all the way to Earth…':working?discoveries().find(d=>d.id===working).tool:near?'You found a science spot! Tap the big button.':state.found.length===5?'Five discoveries! Send your science home.':`Follow the glowing marker. ${next?.label}!`;
      if(moon()&&isShadowed(state)&&state.loadout.power==='solar'&&!working&&!transmitting)instruction+=' Shadow: panels generate 0 W; the buffer battery powers Pip.';
      const blocked=!!near&&!state.found.includes(near.id)&&!access.allowed;
      visible('#missing-tool-warning',blocked&&!working&&!transmitting);
      if(blocked){text('#missing-tool-warning','Missing Tool: '+access.name);instruction='This research needs equipment that Pip is not carrying.';}
      action=state.sent?'My discoveries ▤':transmitting?'Sending…':working?'Exploring…':state.found.length===5?'Send to Earth ↗':near?near.label:'Find a glowing marker';
      disabled=!!working||transmitting||blocked||(!near&&state.found.length<5);$('#map-pip').style.left=`${state.x/2800*100}%`;
      text('#map-caption',`${state.found.length} of 5 discoveries · Tap a dot for a helping hand`);
      if(!rocky()){
        text('#current-status',site()+(state.anchored?' · Holding position':' · Current →'));
        text('#anchor-control',state.anchored?'Retract stabilizers ⚓':'Deploy stabilizers ⚓');
        $('#anchor-control').setAttribute('aria-pressed',String(state.anchored));
        $('#anchor-control').disabled=!!working||transmitting;
      }
      root.querySelectorAll('[data-direction]').forEach(button=>button.disabled=state.anchored);
    }
    text('#instruction',instruction);text('#game-action',action);$('#game-action').disabled=disabled;
    visible('#control-tip',['lake','cruise'].includes(state.stage));
    visible('#shield-warning',!home&&state.stage==='cruise'&&state.transit.warning>0);
    visible('#signal-transit',transmitting);if(transmitting)$('#signal-transit').style.setProperty('--signal-progress',String(progress));
    visible('#shadow-alert',!home&&surfaceLighting(state).headlights&&state.loadout.power==='solar');
    text('#meter-label',meter);$('#meter-fill').style.width=`${amount*100}%`;$('#action-fill').style.width=`${progress*100}%`;
    const pad=$('.direction-pad');pad.hidden=!['lake','cruise'].includes(state.stage);
  }
  function showDialog(title,body){miniDispose?.();miniDispose=null;scienceHazard=false;popup.classList.remove('has-science-game','wide-dialog');keys.clear();held.clear();target=null;popup.innerHTML=`<button class="dialog-x" data-game="close" aria-label="Close">×</button><h2 id="adventure-dialog-title">${title}</h2>${body}`;if(!popup.open)popup.showModal();sfx.pause(true);}
  function closeDialog(){const wasExperiment=!!miniDispose;miniDispose?.();miniDispose=null;popup.classList.remove('has-science-game');popup.close();popup.replaceChildren();if(wasExperiment)persist();if(state.stage==='done'){state.stage='lake';persist();sync();}canvas.focus({preventScroll:true});}
  function factCard(d){showDialog('New discovery!',`<div class="discovery-art" style="--discovery-color:${d.color}"><canvas id="fact-picture" width="420" height="180" aria-label="Illustration of ${d.title}"></canvas><span>✦ DISCOVERY ${state.found.length} / 5</span></div><h3>${d.title}</h3><p>${d.fact}</p><strong class="fact-value">${d.value}</strong><small class="fact-source">Real reference fact · <a href="${d.source||FACT_SOURCE}" target="_blank" rel="noopener">NASA science reference ↗</a><br>Pip’s sample collection is pretend play, not a measurement.</small><button class="play-button" data-game="close">${state.found.length===5?'Send my discoveries home':'Keep exploring'} →</button>`);const fc=$('#fact-picture').getContext('2d');fc.fillStyle=d.color;fc.globalAlpha=.12;fc.fillRect(0,0,420,180);fc.globalAlpha=1;for(let i=0;i<8;i++)star(fc,30+i*52,25+(i%3)*50,3,d.color);glyph(fc,d.symbol,210,83,96,d.color);ellipse(fc,210,148,69,8,'#233c3b15');}
function journal(){showDialog('My discovery journal',`<p>Five little wonders. One extraordinary ${world().id==='mars'?'planet':'moon'}.</p>${state.sent?'<button class="continue-game" data-game="debrief">Expedition debrief →</button>':''}<div class="sticker-grid">${discoveries().map(d=>`<button data-game="read-fact" data-id="${d.id}" ${state.found.includes(d.id)?'':'disabled'}><canvas width="90" height="80" data-sticker="${d.id}" aria-hidden="true"></canvas><b>${state.found.includes(d.id)?d.title:'Still a mystery'}</b></button>`).join('')}</div><button class="play-button" data-game="close">Back to Pip →</button>`);root.querySelectorAll('[data-sticker]').forEach(el=>{const d=discoveries().find(d=>d.id===el.dataset.sticker);glyph(el.getContext('2d'),d.symbol,45,38,38,state.found.includes(d.id)?d.color:'#999c8d');});}
  function pause(){showDialog(home?'Welcome, explorer!':'Take a little breather',`<p>${home?'Three worlds are waiting for you.':'Pip will wait right here. Your adventure is saved on this device.'}</p><div class="pause-options"><button data-game="sound">${soundEnabled?'♫ Sound on':'♪ Sound off'} — tap to change</button><button data-game="motion">${reduced?'Gentle animation on':'Gentle animation off'} — tap to change</button><button data-game="help">How to play</button>${callbacks.workshop?'<button data-game="workshop">Advanced spacecraft workshop ↗</button>':''}${!home&&state.stage==='lake'&&!state.sent?'<button data-game="refit">Repack and relaunch</button>':''}</div><button class="play-button" data-game="close">${home?'Let’s go':'Keep playing'} ▶</button>`);}
  function awardDiscovery(id){
    if(!collectDiscovery(state,id))return;
    working=null;progress=0;persist();sync();burst((state.x-camera)*scale,state.y*h);sfx.chime();factCard(discoveries().find(d=>d.id===id));
  }
  function startScience(kind,id){
    target=null;showDialog(scienceTitle(kind),scienceMarkup(kind));popup.classList.add('has-science-game');
    miniDispose=mountScienceGame(popup,kind,{reduced,onCue:ping,onHazard:active=>{if(active)state.incidents.overheats++;scienceHazard=active;persist();},onComplete:()=>awardDiscovery(id),onActive:dt=>{
      if(!state.sent)manageEnergy(state,missionTotals(state.loadout,state.destination),dt);
    }});
  }
  function action(){if(home||popup.open)return;if(state.stage==='cruise'){skipTransit(state.transit);changeStage('landing');return;}if(state.stage==='lake'&&!working&&!transmitting){if(state.sent){journal();}else if(state.found.length===5){transmitting=true;$('#signal-transit').innerHTML=signalMarkup(state.destination);progress=0;ping(800);}else{const near=nearbyDiscovery(state);if(near){const access=discoveryAccess(state,near.id);if(!access.allowed){toast(access.message);return;}const kind=scienceGameFor(state.destination,near.id);if(kind)startScience(kind,near.id);else{working=near.id;target=null;progress=0;ping(460);}}}}}
  function ending(){const photo=missionPhoto(state),report=missionDebrief(state,missionTotals(state.loadout,state.destination));showDialog(world().name+' expedition debrief',`<img class="mission-patch" src="${new URL('./rewards/'+report.destination.patch,import.meta.url).href}" alt="${world().name} expedition artwork"><span class="tiny-label">EXPEDITION DEBRIEF · ${site().toUpperCase()}</span><h3>Five discoveries. All downlinked.</h3>${photo?`<figure class="mission-photo"><img src="${new URL('./rewards/'+photo.file,import.meta.url).href}" alt="${photo.title}"><figcaption>${photo.title}<small>${photo.kind}<br>Credit: ${photo.credit}</small></figcaption></figure><button class="play-button photo-download" data-game="download-photo">Download NASA Mission Photo ↓</button><a class="photo-source" href="${photo.source}" target="_blank" rel="noopener">Open original NASA image record ↗</a>`:''}<dl class="debrief-stats"><div><dt>Payload mass</dt><dd>${report.mass} kg</dd></div><div><dt>Energy consumed</dt><dd>${report.energyUsedWh.toFixed(2)} Wh</dd></div><div><dt>Mission rating</dt><dd>${report.rating}</dd></div><div><dt>Science score</dt><dd>${report.score}</dd></div></dl><p>Energy integrates the selected equipment’s watts over active play time. Flight time, hardware ratings and this expedition are simplified for play.</p><button class="play-button" data-game="logbook">🎖 Pilot Logbook</button><button class="play-button" data-game="freeplay">Keep exploring →</button><button class="continue-game" data-game="journal">My discoveries</button><button class="continue-game" data-game="home">Choose another world</button>`);}

  on(root,'click',event=>{
    const el=event.target.closest('[data-game]');if(!el||el.disabled)return;const a=el.dataset.game;
    if(a==='failure-workshop'){failure=null;returnToWorkshop(state);closeDialog();resetRuntime();persist();sync();return;}
    if(a==='retry-transit'){failure=null;retryTransit(state,freshTransit);closeDialog();resetRuntime();persist();sync();return;}
    if(a==='abort-transit'){failure=null;returnToWorkshop(state);closeDialog();home=true;resetRuntime();persist();sync();return;}
    if(failure)return;
    if(a==='action'&&launchActivation){launchActivation=false;return;}
    sfx.enable(soundEnabled);
    if(a==='logbook'){showDialog('Pilot Logbook',`<label class="pilot-callsign">Your callsign <input data-pilot-callsign maxlength="12" value="${escapeText(state.callsign)}" autocomplete="off"></label>`+logbookMarkup(loadPilotLogbook()));popup.classList.add('wide-dialog');return;}
    if(a==='audio-toggle'){soundEnabled=!soundEnabled;write('titan.adventure.sound',soundEnabled);sfx.enable(soundEnabled);sfx.pause(blurred||document.hidden||popup.open);if(soundEnabled)sfx.chime();sync();return;}
    if(a==='help'||a==='academy-page'){const page=a==='help'?0:academyPage(Number(el.dataset.page));showDialog('Explorer Storybook',academyMarkup(page));return;}
    if(a==='destination'&&home&&Object.hasOwn(DESTINATIONS,el.dataset.destination)){selectedDestination=el.dataset.destination;sync();return;}
    if(a==='sea'&&home&&Object.hasOwn(TITAN_SEAS,el.dataset.sea)){selectedSea=el.dataset.sea;sync();return;}
    if(a==='anchor'&&!home&&state.stage==='lake'&&!rocky()&&!working&&!transmitting){
      state.anchored=!state.anchored;target=null;keys.clear();held.clear();persist();updateHUD();ping(state.anchored?330:550);
      toast(state.anchored?'Stabilizers deployed. Pip is holding position.':'Stabilizers retracted. Ready to sail!');return;
    }
    if(a==='destination-info'&&home){infoInvoker=el;infoPopup.innerHTML=destinationInfoMarkup(el.dataset.destination);infoPopup.showModal();return;}
    if(a==='close-info'){infoPopup.close();infoInvoker?.focus({preventScroll:true});return;}
    if(a==='download-photo'){
      el.disabled=true;downloadMissionPhoto(state).then(()=>toast('NASA photo downloaded. Keep exploring!')).catch(error=>toast(error.message)).finally(()=>{if(el.isConnected)el.disabled=false;});return;
    }
    if(a==='tool-help'){const near=nearbyDiscovery(state);if(near){const access=discoveryAccess(state,near.id);showDialog('Pip needs another tool',`<p>${access.message}</p><p>Your earned discoveries stay in the journal. Repack and launch a kit that reaches the remaining stations.</p><button class="play-button" data-game="refit">Repack and relaunch →</button><button class="continue-game" data-game="close">Keep exploring</button>`);}return;}
    if(a==='refit'&&!home&&state.stage==='lake'&&!state.sent){if(popup.open)closeDialog();state.incidents.aborts++;state.anchored=false;changeStage('assemble');toast('Your journal is safe. Review the payload, then launch again.');return;}
    if(a==='play'){if(saved){showDialog('A fresh adventure?',`<p>This starts Pip’s journey again. Your current adventure will be replaced.</p><button class="play-button" data-game="restart">Start again</button><button class="continue-game" data-game="resume">Keep my adventure</button>`);}else start(false);}
    if(a==='restart'){closeDialog();start(false);}
    if(a==='continue'||a==='resume'){if(popup.open)closeDialog();start(true);if(state.sent)ending();}
    if(a==='home'){if(transmitting)state.incidents.aborts++;miniDispose?.();miniDispose=null;if(popup.open)popup.close();if(!home)persist();home=true;resetRuntime();sync();}
    if(a==='science'){callbacks.science?.(world().id);}
    if(a==='workshop'){callbacks.workshop?.();}
    if(a==='close')closeDialog();
    if(a==='journal')journal();
    if(a==='debrief'&&state.sent)ending();
    if(a==='pause')pause();
    if(a==='sound'){soundEnabled=!soundEnabled;write('titan.adventure.sound',soundEnabled);sfx.enable(soundEnabled);ping();pause();}
    if(a==='motion'){reduced=!reduced;write('titan.adventure.motion',reduced);pause();}
    if(a==='power-facts')showDialog('What powers a spacecraft?',`<p><b>Solar panels</b> turn sunlight into electricity. Small panels struggle far from the Sun.</p><p><b>Radioisotope generators</b> turn heat from radioactive decay into electricity, even in darkness.</p><p><b>Batteries</b> store energy and are useful for short missions or alongside a generator.</p><p class="fact-source">Our parts, masses, wattages and coins are illustrative game values. Battery time is an estimate, not a countdown.</p><a href="https://science.nasa.gov/learn/basics-of-space-flight/chapter11-3/" target="_blank" rel="noopener">Learn with NASA ↗</a><button class="play-button" data-game="close">Back to building →</button>`);
    if(!home&&state.stage==='assemble'){
      if(a==='build-tab'){buildTab=el.dataset.tab;renderBuilder(root,state.loadout,buildTab,state.destination);}
      if(a==='build-part'&&COMPONENTS[el.dataset.group]?.some(item=>item.id===el.dataset.componentId)){
        if(el.dataset.group==='science')state.loadout=toggleScience(state.loadout,el.dataset.componentId);else state.loadout[el.dataset.group]=el.dataset.componentId;deployment=0;ping(620);const pos=builderPosition();burst(pos.x,pos.y,'#e3cd89',14);persist();renderBuilder(root,state.loadout,buildTab,state.destination,el.dataset.componentId);
        root.querySelector(`[data-component-id="${el.dataset.componentId}"]`)?.focus({preventScroll:true});
      }
      if(a==='survey-kit'){state.loadout=surveyLoadout(state.destination);buildTab='science';persist();renderBuilder(root,state.loadout,buildTab,state.destination);toast('Full-survey kit prepared. Review every part before launch.');}
      if(a==='build-reset'){state.loadout=emptyLoadout();buildTab='rocket';persist();renderBuilder(root,state.loadout,buildTab,state.destination);ping(700);}
      if(a==='build-ready'&&launchPermission(missionTotals(state.loadout,state.destination))&&discoveryCoverage(state.loadout,state.destination).some(d=>d.allowed)){state.parts=['floats','power','radio'];changeStage('launch');canvas.focus({preventScroll:true});}
    }
    if(a==='action')action();
    if(a==='edit-build'&&!home&&state.stage==='launch'&&!launching){changeStage('assemble');canvas.focus({preventScroll:true});}
    if(a==='navigate'&&state.stage==='lake'&&!working&&!transmitting){if(state.anchored){toast('Retract the stabilizers to sail to another marker.');return;}const d=discoveries().find(d=>d.id===el.dataset.id);target={x:d.x,y:d.y};toast(`Pip is heading to: ${d.label.toLowerCase()}`);}
    if(a==='read-fact'){const d=discoveries().find(d=>d.id===el.dataset.id);if(d&&state.found.includes(d.id))factCard(d);}
    if(a==='freeplay'){closeDialog();state.stage='lake';transmitting=false;progress=0;persist();sync();}
  });
  on(infoPopup,'cancel',event=>{event.preventDefault();infoPopup.close();infoInvoker?.focus({preventScroll:true});});
  on(popup,'cancel',event=>{event.preventDefault();if(failure)return;keys.clear();held.clear();closeDialog();});
  function pointerDown(e){if(home||popup.open)return;const dir=e.target.closest('[data-direction]')?.dataset.direction;
    if(dir){e.preventDefault();held.set(e.pointerId,dir);e.target.setPointerCapture(e.pointerId);target=null;}
    if(e.target.closest('#game-action')&&state.stage==='launch'){launchActivation=true;e.preventDefault();held.set(e.pointerId,'launch');e.target.setPointerCapture(e.pointerId);}
  }
  on(root,'pointerdown',pointerDown);on(root,'pointerup',e=>held.delete(e.pointerId));on(root,'pointercancel',e=>held.delete(e.pointerId));on(root,'lostpointercapture',e=>held.delete(e.pointerId));
  on(canvas,'pointerdown',e=>{if(home||popup.open)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-viewport.offsetX)/viewport.fit,y=(e.clientY-r.top-viewport.offsetY)/viewport.fit;if(state.stage==='lake'&&!working&&!state.anchored&&!transmitting){target={x:clamp(camera+x/scale,80,2700),y:clamp(y/h,.6,.9)};}canvas.focus({preventScroll:true});});
  on(window,'keydown',e=>{if(home||document.querySelector('dialog[open]'))return;if(state.stage==='assemble'){if(e.key==='Escape')pause();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' '].includes(e.key)){
    // Preserve native Space/Enter activation on menu and dialog buttons.
    if(e.key===' '&&e.target instanceof HTMLButtonElement&&e.target.id!=='game-action')return;
    e.preventDefault();keys.add(e.key.toLowerCase());target=null;if(e.key===' '&&!e.repeat&&state.stage!=='launch')action();
  }if(e.key==='Escape'){e.preventDefault();pause();}});
  on(window,'keyup',e=>keys.delete(e.key.toLowerCase()));on(window,'blur',()=>{blurred=true;keys.clear();held.clear();sfx.pause(true);});on(window,'focus',()=>{blurred=false;last=0;});on(document,'visibilitychange',()=>{keys.clear();held.clear();last=0;if(document.hidden)sfx.pause(true);if(!home)persist();});
  on(root,'change',event=>{if(event.target.matches('[data-pilot-callsign],[data-callsign]'))state.callsign=cleanCallsign(event.target.value);else if(event.target.matches('[data-foil]'))state.accent=personalization({accent:event.target.value}).accent;else return;write('deepfrontier.personalization',personalization(state));persist();sync();});
  on(root,'input',event=>{if(event.target.matches('[data-callsign],[data-pilot-callsign]')){state.callsign=cleanCallsign(event.target.value);write('deepfrontier.personalization',personalization(state));persist();}});
  let wheelAngle=0;
  function lunarLander(ctx,x,y,s,t,throttle=0,dust=0,options={}){renderLunarLander(ctx,x,y,s,t,throttle,dust,{...options,accent:FOIL_ACCENTS[state.accent]?.color});}
  function input(){const dirs=new Set(held.values());return {dx:Number(keys.has('arrowright')||keys.has('d')||dirs.has('right'))-Number(keys.has('arrowleft')||keys.has('a')||dirs.has('left')),dy:Number(keys.has('arrowdown')||keys.has('s')||dirs.has('down'))-Number(keys.has('arrowup')||keys.has('w')||dirs.has('up')),launch:keys.has(' ')||dirs.has('launch')};}
  function update(dt){
    if(failure){if(advanceFailure(failure,dt))failureDialog();return;}
    deployment=Math.min(1,deployment+dt*2.4);
    const {dx,dy,launch}=input();touchdownShake=Math.max(0,touchdownShake-dt);saveTime+=dt;elapsed+=dt;if(elapsed>4)$('#game-toast').classList.remove('visible');
    if(home)return;
    if(state.stage!=='assemble'&&!state.sent)manageEnergy(state,missionTotals(state.loadout,state.destination),dt);
    if(state.stage==='launch'){
      if(!launching){progress=clamp(progress+(launch?dt*.45:-dt*.22),0,1);if(progress>=1){launching=true;launchTime=0;sfx.ignite();burst(w*.5,h*.78,'#e6c998',35);}}
      if(!launching&&Math.floor(progress*4)>launchTick){launchTick=Math.floor(progress*4);sfx.ping(220+launchTick*110);}
      else if(launching){launchTime+=dt;const shot=launchProfile(launchTime,missionTotals(state.loadout,state.destination));if(shot.failed){fail('launch',w*.5,h*.75-130-shot.rise);return;}if(launchTime>4.3)changeStage('cruise');}
    }
    if(state.stage==='cruise'){
      if(advanceTransit(state.transit,dt,dx,dy)){sfx.impact();if(!reduced)touchdownShake=.12;}
      filmTime=state.transit.elapsed;
      if(state.transit.destroyed){fail('transit',state.transit.x*w/1000,state.transit.y*h/600);return;}
      if(filmTime>=state.transit.duration)changeStage('landing');
    }else if(state.stage==='landing'){
      const before=filmTime;filmTime+=dt;
      const contact=moon()?12:mars()?15:LANDING_SECONDS;
      if(rocky()&&before<contact&&filmTime>=contact){touchdownShake=.35;ping(200);}
      if(filmTime>=landingDuration(state.destination)){
        state.x=rocky()?clamp(w*.27/scale+(moon()?55:0),80,2700):180;state.y=rocky()?clamp(.73+17*scale/h,.6,.9):.77;changeStage('lake');
        touchdownShake=rocky()?0:.5;toast(mars()?'Touchdown confirmed. Welcome to Jezero Crater!':moon()?'Touchdown confirmed. Welcome to Shackleton!':'Splashdown confirmed! Welcome to Titan. Let’s explore!');
      }
    }
    if(state.stage==='lake'){
      const previousX=state.x,previousY=state.y;
      if(!working&&!transmitting&&!state.anchored){if(dx||dy){moveExplorer(state,dx,dy,dt);direction=dx<0?-1:dx>0?1:direction;}else if(target){const diff=target.x-state.x,yd=(target.y-state.y)*850;if(Math.abs(diff)<7&&Math.abs(yd)<7)target=null;else{const distance=Math.hypot(diff,yd);moveExplorer(state,diff/distance,yd/distance,dt);direction=diff<0?-1:1;}}}
      if(!working&&!transmitting)applySurfaceCurrent(state,dt,time);
      wheelAngle+=Math.hypot(state.x-previousX,(state.y-previousY)*850)/18*(state.x<previousX?-1:1);
      trails=updateTrails(trails,state,dt,Math.hypot(state.x-previousX,(state.y-previousY)*850)>.1,reduced);
      if(working){progress+=dt*(rocky()&&['quakes','marsquake'].includes(working)&&hasScience(state.loadout,'seismic')?.55:.37);if(progress>=1){const id=working;working=null;progress=0;awardDiscovery(id);}}
      if(transmitting){const radio=COMPONENTS.radio.find(item=>item.id===state.loadout.radio);progress+=dt/(2+140/radio.rate);if(progress>=1){if(finishAdventure(state)){persist();sync();burst(w*.5,h*.4,'#eed087',60);ending();}transmitting=false;progress=0;}}
    }
    if(saveTime>1.5){saveTime=0;persist();}
    updateHUD();
  }
  function drawCapsule(x,y,bus){
    c.save();c.translate(x,y);c.scale(scale,scale);
    path(c,[[-49,8],[-17,-27],[16,-27],[49,8]],'#e7d4aa','#8b775c');ellipse(c,0,8,49,12,'#ab6854','#61463e');
    for(let i=0;i<6;i++){const edge=-45+i*15;path(c,[[edge,7],[edge*.53,-22]],null,'#a58d63');ellipse(c,edge,9,1.5,1.3,'#d8c1a0');}
    for(let i=0;i<12;i++){
      const x=-37+i*6.7,top=-24+Math.abs(x)*.64;
      path(c,[[x,top],[x+4,top+2],[x+2,5],[x-3,2]],i%2?'#fff0bb45':'#91734925');
    }
    ellipse(c,0,8,43,8,null,'#e1b281');box(c,-9,-19,18,10,3,'#344e53','#bda778');
    ellipse(c,-3,-15,2,2,'#bed9c3');path(c,[[-31,1],[-25,-7]],null,'#fff0c1');
    if(bus){
      box(c,-26,-36,52,11,3,'#b9955d');
      for(const side of [-1,1]){
        box(c,side*40-18,-35,36,5,1,'#d9c395');box(c,side*62-16,-44,32,22,1,'#31516a','#b29f79');
        for(let i=1;i<5;i++)path(c,[[side*62-16+i*6,-43],[side*62-16+i*6,-23]],null,'#87a1a2');
        path(c,[[side*62-15,-33],[side*62+15,-33]],null,'#87a1a2');
      }
      path(c,[[10,-35],[14,-47]],null,'#ecd0a4');ellipse(c,13,-46,17,5,'#ead4ac','#967b57');
      box(c,-22,-43,11,8,1,'#41494b','#c7b68d');
      for(let i=0;i<4;i++)box(c,-19+i*11,-33,7,5,1,i%2?'#e9d7a3':'#d1ab67');
    }
    c.restore();
  }
  function drawMarsLanding(t){
    const shot=marsArrival(filmTime),x=w*shot.x,y=h*shot.y,s=scale,targetY=h*.73+17*s;
    if(filmTime<8.4){
      c.save();c.globalAlpha=1-Math.max(0,Math.min(1,(filmTime-7.6)/.8));
      if(shot.heat>0&&!reduced){c.save();c.globalAlpha=shot.heat;for(let i=0;i<22;i++){const u=(i/22+t*.55)%1;ellipse(c,x+u*90*s,y-u*135*s,(1-u)*12*s,3*s,i%3?'#f5ac69':'#ffe2a4');}c.restore();}
      drawCapsule(x,y,false);
      if(filmTime>5){const drop=Math.min(1,(filmTime-5)/2);ellipse(c,x-drop*55*s,y+drop*95*s,42*s,8*s,'#9d7055','#d5aa7b');}
      if(shot.canopy>0){c.save();c.translate(x,y-100*s*shot.canopy);c.scale(s*shot.canopy,s*shot.canopy);c.lineWidth=1.5;
        for(let i=-2;i<=2;i++)path(c,[[i*34,0],[0,100]],null,'#ecdfc1');
        for(let i=0;i<6;i++){const left=-85+i*170/6,right=left+170/6;c.beginPath();c.moveTo(left,0);c.quadraticCurveTo(left*.5,-57,0,-57);c.quadraticCurveTo(right*.5,-57,right,0);c.quadraticCurveTo((left+right)/2,-9,left,0);c.fillStyle=i%2?'#f4e5cb':'#af6b4b';c.fill();}c.restore();}
      c.restore();
    }
    if(filmTime>=7.6){
      c.save();c.globalAlpha=Math.max(0,Math.min(1,(filmTime-7.6)/.8));
      const unfold=Math.max(0,Math.min(1,filmTime-8)),roverY=y+60*s*unfold+(targetY-y-60*s)*shot.lower,roverX=x;
      c.save();c.globalAlpha=1-shot.release;if(shot.lower>0&&shot.release===0)for(const side of [-1,0,1])path(c,[[x+side*25*s,y+20*s],[roverX+side*25*s,roverY-45*s]],null,'#e3dbc4');c.restore();
      descentCraft(c,x+shot.release*w*.35,y-shot.release*h*.55,s,t,{mars:true,gear:0,throttle:shot.release? .7:shot.throttle,dust:0});
      explorer(c,roverX,roverY,s,t,{destination:'mars',loadout:state.loadout});
      if(!reduced)surfaceDust(c,x,targetY+25*s,s,t,shot.dust*(1-shot.release),true);c.restore();
    }
  }
  function builderPosition(){const r=$('.builder-preview').getBoundingClientRect(),cr=canvas.getBoundingClientRect();return {x:(r.left-cr.left+r.width/2-viewport.offsetX)/viewport.fit,y:(r.top-cr.top+Math.min(250,r.height*.4)-viewport.offsetY)/viewport.fit,s:Math.min(1.6,r.width/340/viewport.fit)};}
  function draw(dt){
    // Re-establish the backing-store scale for every frame, including after a
    // hidden tab is restored or its display pixel ratio changes during flight.
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#07131b';c.fillRect(0,0,canvas.width,canvas.height);
    const cssWidth=canvas.width/viewport.dpr,cssHeight=canvas.height/viewport.dpr;
    const renderFit=home?Math.max(cssWidth/w,cssHeight/h):viewport.fit;
    const renderOffsetX=home?(cssWidth-w*renderFit)/2:viewport.offsetX,renderOffsetY=home?(cssHeight-h*renderFit)/2:viewport.offsetY;
    c.setTransform(viewport.dpr*renderFit,0,0,viewport.dpr*renderFit,renderOffsetX*viewport.dpr,renderOffsetY*viewport.dpr);c.save();c.beginPath();c.rect(0,0,w,h);c.clip();
    const t=reduced?0:time;const stage=home?'home':state.stage;
    c.save();if(!reduced){const shake=failure?explosionPhase(failure.elapsed).shake:launching?2.4:touchdownShake*5;c.translate(Math.sin(t*61)*shake,Math.cos(t*73)*shake*.6);}
    if(['home','lake','landing','done'].includes(stage)){
      if(stage==='lake'||stage==='done'){const desired=clamp(state.x-w/scale*.4,0,Math.max(0,2800-w/scale));camera+=(desired-camera)*Math.min(1,dt*5);}else camera=0;
      if(mars())marsScenery(c,w,h,t,camera*scale,scale);else if(moon())lunarLandscape(c,w,h,t,camera*scale,{unit:scale});else landscape(c,w,h,t,camera*scale,{rain:stage==='lake'&&state.x>1350&&state.x<1770,still:reduced});
      if(stage==='home'){
        const px=w<600?w*.65:w*.73,py=w<600?h*.78:h*.74;
        if(!rocky())for(let i=0;i<4;i++){const x=px+Math.sin(i*1.8+t*.3)*150*scale,y=py+Math.cos(i*1.7+t*.3)*50*scale;ellipse(c,x,y,15,5,null,'#e2d6a332');}
        explorer(c,px,py+(rocky()?0:Math.sin(t*1.8)*5),scale*1.6,t,{destination:world().id});glyph(c,mars()?'camera':moon()?'seismic':'drop',px-150*scale,py-35*scale,28,'#b6d4b3');star(c,px+143*scale,py-93*scale,12);
      }
      if(stage==='landing'&&moon()){
        const shot=lunarArrival(filmTime),x=w*shot.x,y=h*shot.y,groundY=h*.73+44*scale;
        c.save();c.globalAlpha=.15+.35*(1-shot.altitude/1000);ellipse(c,w*.27,groundY,(18+42*(1-shot.altitude/1000))*scale,8*scale,'#142331');c.restore();
        if(!reduced&&filmTime<12){c.save();c.strokeStyle='#aecbb54d';c.lineWidth=1;for(const side of [-1,1])path(c,[[w*.27+side*58*scale,groundY-6],[w*.27+side*58*scale,groundY+4],[w*.27+side*40*scale,groundY+4]],null,'#aecbb54d');c.restore();}
        lunarLander(c,x,y,scale,t,shot.throttle,0,{gear:shot.gear,ramp:shot.rollout});
        if(!reduced)surfaceDust(c,w*.27,groundY,scale,t,Math.max(0,1-shot.altitude/180)*(1-shot.rollout));
        if(shot.rollout>0){c.save();c.globalAlpha=Math.min(1,shot.rollout*4);explorer(c,x+55*scale*shot.rollout,y+17*scale,scale,t,{loadout:state.loadout,destination:'moon',moving:!reduced&&shot.rollout<1});c.restore();}
      }
      if(stage==='landing'&&mars())drawMarsLanding(t);
      if(stage==='landing'&&!rocky()){
        const shot=arrival(filmTime),x=w*shot.x,y=h*shot.y;
        if(shot.heat>0&&!reduced){
          c.save();c.globalAlpha=shot.heat;
          for(let i=0;i<27;i++){const u=(i/27+t*.62)%1;ellipse(c,x-155*u*scale,y-110*u*scale+Math.sin(i*7)*13*scale,(1-u)*18*scale,4*scale,i%3?'#ffa856':'#fff3b9');}
          ellipse(c,x,y+8*scale,51*scale,15*scale,'#ffa35a');c.restore();
        }
        c.save();c.globalAlpha=1-shot.reveal;if(shot.reveal<1)drawCapsule(x,y,false);c.restore();
        if(shot.canopy>0){
          c.save();c.translate(x,y);c.scale(scale,scale);c.lineWidth=1.7;
          for(let i=-2;i<=2;i++)path(c,[[0,-19],[i*39*shot.canopy,-115*shot.canopy-24]],null,'#f7e8ca');
          c.translate(0,-115*shot.canopy-24);c.scale(shot.canopy,shot.canopy);
          for(let i=0;i<6;i++){
            const left=-80+i*160/6,right=left+160/6;
            c.beginPath();c.moveTo(left,0);c.quadraticCurveTo(left*.55,-54,0,-54);c.quadraticCurveTo(right*.55,-54,right,0);c.quadraticCurveTo((left+right)/2,-9,left,0);c.fillStyle=i%2?'#ffe8ba':'#d77742';c.fill();
          }c.restore();
        }
        if(shot.reveal>0){c.save();c.globalAlpha=shot.reveal;explorer(c,x,y,scale*.76,t,{loadout:state.loadout});c.restore();}
        if(shot.reveal>0&&shot.reveal<1)ellipse(c,x+shot.reveal*40,y+scale*(14+80*shot.reveal),42*scale,8*scale,'#9d6251');
        if(shot.ripple>0){c.save();c.globalAlpha=1-shot.ripple;
          for(let i=1;i<=3;i++)ellipse(c,x,y+20*scale,(16+shot.ripple*42*i)*scale,(3+shot.ripple*6*i)*scale,null,'#dfedc4');
          for(let i=0;i<18;i++){const n=i-8.5;ellipse(c,x+n*shot.ripple*16*scale,y+(17-Math.sin(shot.ripple*Math.PI)*(58-Math.abs(n)*4))*scale,2*scale,4*scale,'#c4dbc0');}c.restore();}
      }
      if(stage==='lake'||stage==='done'){
        drawTrails(c,trails,state,camera,w,h,scale);
        if(moon())lunarLander(c,(w*.27/scale-camera)*scale,h*.73,scale,t,0,0,{gear:1,ramp:1});
        for(const d of discoveries()){const x=(d.x-camera)*scale,y=d.y*h;if(x< -120||x>w+120)continue;const done=state.found.includes(d.id);ellipse(c,x,y+10,49*scale,11*scale,null,done?'#c7dfb13b':'#ebd28c88');
          if(rocky())lunarStation(c,mars()?({rust:'regolith',delta:'lab','thin-air':'air',marsquake:'quakes',dunes:'earth'}[d.id]):d.id,x,y,scale,t,done);else scienceStation(c,d.id,x,y,scale,t,done);
          const blocked=!done&&!discoveryAccess(state,d.id).allowed;
          const by=y-65*scale+Math.sin(t*2+d.x)*5;path(c,[[x,y],[x,by+20]],null,done?'#9fbc9566':'#eee0a6aa');ellipse(c,x,by,25*scale,25*scale,done?'#305b4f':blocked?'#d8b85f':'#f1d69b','#f7edc3');if(done||blocked){c.fillStyle=done?'#cce6c5':'#433920';c.font=`bold ${22*scale}px sans-serif`;c.textAlign='center';c.fillText(done?'✓':'!',x,by+7*scale);}else glyph(c,d.symbol,x,by,20*scale,'#3b514b');
          if(!done){c.textAlign='center';c.font=`600 ${Math.max(11,12*scale)}px sans-serif`;const tw=c.measureText(d.label).width;box(c,x-tw/2-12,by-58*scale,tw+24,25,8,'#253f38de');c.fillStyle='#ffedbb';c.fillText(d.label,x,by-40*scale);}
        }
        const px=(state.x-camera)*scale,py=state.y*h;const moving=!state.anchored&&!!(input().dx||input().dy||target);
        if(surfaceLighting(state).headlights)lunarHeadlights(c,w,h,px,py,scale,direction);
        if(target){ellipse(c,(target.x-camera)*scale,target.y*h,18+Math.sin(t*5)*4,7,null,'#fff1bc');}
        if(state.anchored&&!rocky())for(const side of [-1,1]){
          path(c,[[px+side*55*scale,py+15*scale],[px+side*98*scale,py+34*scale]],null,'#d5bd83');
          ellipse(c,px+side*98*scale,py+35*scale,12*scale,4*scale,'#8fae9d','#e4d3a0');
          path(c,[[px+side*98*scale,py+35*scale],[px+side*98*scale,py+55*scale]],null,'#cdb984');
        }
        explorer(c,px,py+(rocky()?0:Math.sin(t*2)*3),scale,t,{moving:moving&&!reduced,sampling:working?progress*3:0,loadout:state.loadout,destination:world().id});
        if(moving&&!reduced&&rocky())for(let i=0;i<14;i++){const u=(t*1.8+i/14)%1;ellipse(c,px-direction*(40+u*85)*scale,py+(23-u*19+u*u*24)*scale,(1-u)*5*scale,2*scale,`rgba(206,202,183,${(1-u)*.45})`);}
        if(working==='quakes'||working==='marsquake')glyph(c,'seismic',px+95*scale,py-45*scale,35,'#efd6a0');
        if(working==='reflector'){path(c,[[px,py-55*scale],[w*.78,h*.43]],null,'#c6f6dc66');}
        if(working==='air'){path(c,[[px,py-70*scale],[px+30*scale,py-110*scale-progress*80]],null,'#e9e5bd');ellipse(c,px+30*scale,py-130*scale-progress*80,23*scale,28*scale,'#e4a574','#f0d294');}
        if(working==='cold'){glyph(c,'thermometer',px+100*scale,py-45*scale,30,'#b3dbdd');}
        if(working==='shore'&&progress>.8){c.fillStyle=`rgba(255,240,196,${Math.max(0,Math.sin(progress*60))*.3})`;c.fillRect(0,0,w,h);}
        if(transmitting){c.strokeStyle='#e4e4b6';c.lineWidth=2;for(let i=0;i<4;i++){let r=((t*90+i*40)%160)+20;c.globalAlpha=1-r/200;c.beginPath();c.arc(px+25*scale,py-70*scale,r,-2,-.6);c.stroke();}c.globalAlpha=1;}
        const next=discoveries().find(d=>!state.found.includes(d.id));if(next&&Math.abs((next.x-camera)*scale-px)>w*.35){const right=next.x>state.x;box(c,right?w-75:15,h*.53,60,36,18,'#f4dc9b');c.fillStyle='#304c43';c.font='bold 24px sans-serif';c.textAlign='center';c.fillText(right?'→':'←',right?w-45:45,h*.53+26);}
      }
    }else if(stage==='assemble'){
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#223e44');g.addColorStop(1,'#51756b');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<30;i++)path(c,[[i*60,0],[i*60,h]],null,'#c1d8b60b');for(let i=0;i<20;i++)path(c,[[0,i*60],[w,i*60]],null,'#c1d8b60b');
      const pos=builderPosition();
      hangar(c,pos.x,pos.y,pos.s,t);
      ellipse(c,pos.x,pos.y-45,150*pos.s,115*pos.s,'#c5dfc307','#e5dca42e');ellipse(c,pos.x,pos.y+45*pos.s,126*pos.s,24*pos.s,'#213b3b');ellipse(c,pos.x,pos.y+40*pos.s,126*pos.s,18*pos.s,'#6d8b76','#b1b58c');
      if(buildTab==='rocket'){
        if(state.loadout.rocket)rocket(c,pos.x,pos.y-25*pos.s,pos.s*.89,t,0,state.loadout.rocket,false,FOIL_ACCENTS[state.accent]?.color);
        else{c.save();c.setLineDash([5,7]);box(c,pos.x-31*pos.s,pos.y-130*pos.s,62*pos.s,190*pos.s,24*pos.s,null,'#b8cba77a');c.restore();c.fillStyle='#e7dcaa';c.textAlign='center';c.font='600 13px sans-serif';c.fillText('Choose your rocket',pos.x,pos.y-20);}
      }else explorer(c,pos.x,pos.y+Math.sin(t)*3,pos.s,t,{parts:['floats',...(state.loadout.power?['power']:[]),...(state.loadout.radio?['radio']:[])],loadout:state.loadout,destination:world().id,deploy:reduced?1:1-(1-deployment)**3});
      for(let i=0;i<3;i++){const a=t*.3+i*2.1;star(c,pos.x+Math.cos(a)*150*pos.s,pos.y-35+Math.sin(a)*80*pos.s,4,'#e7dcaa66');}
    }else if(stage==='launch'){
      const padScale=Math.min(scale,h/550);
      const totals=missionTotals(state.loadout,state.destination),overloaded=totals.mass>totals.capacity;
      const offset=launching?(overloaded?launchProfile(launchTime,totals).rise/700:Math.min(1,launchTime/3)):0;
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,offset>.6?'#192d40':'#628e98');g.addColorStop(1,'#e1c69b');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<7;i++){const x=((i*w/4+t*(3+i%3))%(w+300))-150,y=h*.27+i%3*70+offset*h*.9;cloud(c,x,y,.65+i%3*.25,.38+i%2*.18);}
      const ground=h*.75+offset*h;
      launchStation(c,w,h,padScale,t,{offset,ignition:launching?1:progress*.75,countdown:launching?0:Math.max(0,3-progress*3),lift:launching?launchTime:0});
      const rocketHeight=state.loadout.rocket==='titan'?1.1:state.loadout.rocket==='scout'?.74:1;
      const ry=h*.75-84*padScale*1.55*rocketHeight-8-offset*h*.75;
      if(!failure)rocket(c,w*.5+(reduced?0:Math.sin(time*40)*progress),ry,padScale*1.55,t,launching?1:progress*.5,state.loadout.rocket,true,FOIL_ACCENTS[state.accent]?.color);
      if(!launching){cloud(c,w*.5-50-Math.sin(t)*20,ground-16,.4,.2);cloud(c,w*.5+40+Math.sin(t)*30,ground-12,.5,.18);}
      if(launching){for(let i=0;i<8;i++){const u=(t*.8+i/8)%1;cloud(c,w*.5+(i%2?1:-1)*u*210*scale,ground+(12-u*24)*scale,(.25+u*.75)*scale,(1-u)*.65);}}
    }else if(stage==='cruise'){
      transitArt(c,w,h,state.transit,t,{...input(),reduced,accent:FOIL_ACCENTS[state.accent]?.color});
    }
    if(['home','lake','landing','done'].includes(stage))environmentVignette(c,w,h,t,world().id,reduced);
    c.restore();
    if(!reduced){for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt;c.globalAlpha=Math.max(0,p.life);star(c,p.x,p.y,4,p.color);}c.globalAlpha=1;particles=particles.filter(p=>p.life>0);}else particles=[];
    if(failure)drawFailure(c,failure,reduced);c.restore();
  }
  function frame(now){if(disposed)return;const dt=last?clamp((now-last)/1000,0,!home&&state.stage==='cruise'?30:.05):0;last=now;const paused=blurred||document.hidden||!!document.querySelector('dialog[open]');if(!paused){time+=dt;update(dt);}sfx.update({launch:!failure&&!home&&state.stage==='launch'?(launching?1:progress*.65):0,descent:!home&&rocky()&&state.stage==='landing'?(mars()?marsArrival:lunarArrival)(filmTime).throttle:0,rcs:state.stage==='cruise'&&!!(input().dx||input().dy),strain:state.stage==='launch'&&missionTotals(state.loadout,state.destination).mass>missionTotals(state.loadout,state.destination).capacity,transmitting,paused:paused||!!document.querySelector('dialog[open]'),time,destination:world().id});if(!document.hidden)draw(paused?0:dt);raf=requestAnimationFrame(frame);}
  if(callbacks.launchLoadout){
    state=freshAdventure();state.loadout={...callbacks.launchLoadout};
    state.parts=['floats','power','radio'];state.stage='launch';home=false;persist();
  }
  reduced=read('titan.adventure.motion',reduced)===true;sync();raf=requestAnimationFrame(frame);
  return ()=>{if(disposed)return;miniDispose?.();miniDispose=null;particles=[];trails=[];held.clear();keys.clear();disposed=true;cancelAnimationFrame(raf);observer.disconnect();abort.abort();sfx.close();if(!home)persist();if(popup.open)popup.close();if(infoPopup.open)infoPopup.close();popup.replaceChildren();infoPopup.replaceChildren();};
}
