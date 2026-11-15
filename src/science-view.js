import {createScienceGame,setScienceControl,tapDrill,advanceScience,spectrumError,SPECTRA,LASER_ROUND_TRIP,LUNAR_DISTANCE_KM} from './science-model.js';
import {earth,ellipse,box,path} from './adventure-art.js';
const TITLES={laser:'Bounce a beam home',spectrometer:'Read the lake’s fingerprint',drill:'Save a piece of an ancient river'};
export const scienceTitle=kind=>TITLES[kind];
export function scienceMarkup(kind){
  const instruction=kind==='laser'?'Turn the mirror until the beam points home. Keep it green for 3 seconds.':kind==='spectrometer'?'Choose a reference. Slide its gold spikes onto the green sample spikes. Match both liquids.':'Tap gently to keep pressure in the green band. Give the drill a rest if it gets hot.';
  return `<section class="science-game" data-kind="${kind}"><p class="science-instruction">${instruction}</p>
    <canvas width="1200" height="520" class="science-canvas" aria-label="${kind==='laser'?'Earth-to-mirror beam alignment diagram':kind==='spectrometer'?'Sample and reference absorption spikes':'Rock core drill and sediment layers'}"></canvas>
    ${kind==='laser'?`<label class="science-range">Mirror angle <output data-angle>-22°</output><input type="range" min="-40" max="40" step="1" value="-22" data-control="angle" aria-label="Mirror angle"></label><div class="science-readouts"><span>Round trip<b data-trip>≈ 2.56 s</b></span><span>Real ranging precision<b>Millimeter level</b></span></div>`:kind==='spectrometer'?`<div class="spectrum-options" role="group" aria-label="Reference molecule"><button type="button" data-molecule="methane" aria-pressed="false">Methane <small>CH₄</small></button><button type="button" data-molecule="ethane" aria-pressed="false">Ethane <small>C₂H₆</small></button></div><label class="science-range">Slide reference <output data-offset>-14</output><input type="range" min="-20" max="20" step="1" value="-14" data-control="offset" aria-label="Reference waveform offset"></label>`:`<div class="drill-readouts"><label>Pressure <span class="pressure-track"><i class="safe-pressure"></i><i data-pressure></i></span><output data-pressure-text>Low</output></label><label>Bit temperature <meter min="0" max="1" low=".5" high=".8" optimum=".2" value=".15" data-heat></meter><output data-heat-text>Cool</output></label></div><button type="button" class="play-button drill-tap" data-drill>Tap to drill ↓</button>`}
    <div class="science-progress"><i data-science-fill></i></div><p class="science-status" role="status" aria-live="polite" data-science-status>Ready when you are.</p>
    <p class="science-note">${kind==='laser'?'Practice mirror: real arrays use corner cubes. The 2.56 s estimate uses the mean Earth–Moon distance, 384,400 km; actual timing varies.':kind==='spectrometer'?'Illustrated absorption patterns, not measured spectra or a wavelength calibration. Cassini used infrared light to identify hydrocarbons.':'Pressure and heat are play values. Jezero’s real sediment layers preserve evidence of an ancient lake and river.'}</p>
    <button type="button" class="play-button science-save" data-science-save disabled>Complete the experiment first</button>
  </section>`;
}
export function mountScienceGame(host,kind,{reduced=false,onComplete=()=>{},onCue=()=>{},onActive=()=>{},onHazard=()=>{}}={}){
  const game=createScienceGame(kind),root=host.querySelector('.science-game'),canvas=root.querySelector('canvas'),c=canvas.getContext('2d');
  const abort=new AbortController(),{signal}=abort;let frameId=0,last=0,disposed=false,round=0,oldPhase='align',message='';
  const $=selector=>root.querySelector(selector);
  root.addEventListener('input',event=>{const key=event.target.dataset.control;if(key)setScienceControl(game,key,Number(event.target.value));},{signal});
  root.addEventListener('click',event=>{
    const molecule=event.target.closest('[data-molecule]')?.dataset.molecule;
    if(molecule){setScienceControl(game,'choice',molecule);onCue(540);}
    if(event.target.closest('[data-drill]')&&tapDrill(game))onCue(140+game.pressure*120);
    if(event.target.closest('[data-science-save]')&&game.complete){dispose();onComplete();}
  },{signal});
  function status(value){if(message!==value){message=value;$('[data-science-status]').textContent=value;}}
  function sync(){
    const ready=$('[data-science-save]');ready.disabled=!game.complete;ready.textContent=game.complete?'Save my discovery →':'Complete the experiment first';
    if(kind==='laser'){
      $('[data-angle]').textContent=game.angle+'°';
      $('[data-trip]').textContent=game.phase==='align'?'≈ '+LASER_ROUND_TRIP.toFixed(2)+' s':game.pulse.toFixed(2)+' / '+LASER_ROUND_TRIP.toFixed(2)+' s';
      $('[data-science-fill]').style.width=(game.phase==='align'?game.lock/3:game.pulse/LASER_ROUND_TRIP)*100+'%';
      const busy=game.phase!=='align';$('[data-control="angle"]').disabled=busy;
      status(game.complete?'Beam received! Round trip ≈ 2.56 seconds. Save your discovery.':busy?'Pulse sent. Watch it travel to the Moon and back…':Math.abs(game.angle)<=3?'Aligned! Hold steady · '+Math.floor(game.lock)+' / 3 seconds':'Turn the mirror. Bring the returning beam onto Earth.');
    }else if(kind==='spectrometer'){
      $('[data-offset]').textContent=game.offset>0?'+'+game.offset:String(game.offset);
      root.querySelectorAll('[data-molecule]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.molecule===game.choice));button.disabled=game.complete;});
      const input=$('[data-control="offset"]');input.value=game.offset;input.disabled=game.complete;
      $('[data-science-fill]').style.width=(game.complete?100:(game.round+Math.min(1,game.matched/1.25))/2*100)+'%';
      status(game.complete?'Both fingerprints matched: liquid methane and ethane!':game.choice&&spectrumError(game)<=.018?'Spikes matched! Reading sample '+(game.round+1)+'…':(game.round?'Methane identified! Now match sample B.':'Sample A: choose a molecule and line up its spikes.'));
    }else{
      $('[data-pressure]').style.left=game.pressure*100+'%';$('[data-pressure-text]').textContent=game.pressure>.7?'Too much':game.pressure>=.35?'Just right':'Tap gently';
      $('[data-heat]').value=game.heat;$('[data-heat-text]').textContent=Math.round(game.heat*100)+'%';
      $('[data-science-fill]').style.width=game.depth*100+'%';$('[data-drill]').disabled=game.complete||game.venting;
      status(game.complete?'Core collected! Look at those ancient sediment layers.':game.venting?'Bit too warm. Let it cool; your core progress is safe.':game.pressure>.7?'Ease off! High pressure heats the bit.':game.pressure>=.35?'Good pressure. Keep a gentle rhythm.':'A little tap gives the drill more pressure.');
    }
    root.classList.toggle('experiment-complete',game.complete);
  }
  function background(){
    c.setTransform(2,0,0,2,0,0);c.fillStyle=kind==='drill'?'#27373a':'#122d36';c.fillRect(0,0,600,260);
    c.lineCap='round';c.lineJoin='round';c.lineWidth=2;
  }
  function drawLaser(t){
    const origin={x:92,y:75},mirror={x:380,y:211},bearing=Math.atan2(mirror.y-origin.y,mirror.x-origin.x),angle=game.angle*Math.PI/180;
    earth(c,origin.x,origin.y,31);
    for(let i=0;i<34;i++)ellipse(c,20+(i*71)%560,20+(i*43)%170,.7,.7,'#f4e9c65c');
    const locked=Math.abs(game.angle)<=3;
    path(c,[[origin.x+22,origin.y+12],[mirror.x,mirror.y]],null,'#f0d19994');
    const reflected=bearing+Math.PI+2*angle,ex=mirror.x+Math.cos(reflected)*320,ey=mirror.y+Math.sin(reflected)*320;
    path(c,[[mirror.x,mirror.y],[ex,ey]],null,locked?'#a6e6c2':'#cb8c76');
    box(c,mirror.x-35,mirror.y+15,70,18,5,'#b8985d','#dfca99');path(c,[[mirror.x,mirror.y],[mirror.x,mirror.y+16]],null,'#d3c9a4');
    c.save();c.translate(mirror.x,mirror.y);c.rotate(bearing+Math.PI/2+angle);box(c,-43,-5,86,10,4,'#a6d3d0','#e4ecd3');path(c,[[-34,-3],[30,-3]],null,'#f6f5da');c.restore();
    ellipse(c,origin.x,origin.y,40,40,null,locked?'#a6e6c299':'#d6c49344');
    if(game.phase==='pulse'&&!reduced){const u=Math.min(1,game.pulse/LASER_ROUND_TRIP),v=u<.5?u*2:2-u*2;ellipse(c,origin.x+(mirror.x-origin.x)*v,origin.y+(mirror.y-origin.y)*v,5,5,'#fff3b9');}
    c.font='bold 11px sans-serif';c.fillStyle='#e6dfbc';c.fillText('EARTH',64,128);c.fillText('PIP’S PRACTICE MIRROR',327,251);
  }
  function drawSpectrum(){
    const wanted=SPECTRA[game.round===0?'methane':'ethane'];
    c.strokeStyle='#aec6ba19';c.lineWidth=1;for(let x=50;x<=560;x+=51){c.beginPath();c.moveTo(x,42);c.lineTo(x,216);c.stroke();}for(let y=72;y<220;y+=36)path(c,[[50,y],[560,y]],null,'#aec6ba19');
    function spectrum(profile,offset,color,width=3){
      c.beginPath();for(let i=0;i<=510;i++){
        const x=i/510,absorption=profile.peaks.reduce((v,p,j)=>v+profile.heights[j]*Math.exp(-Math.pow((x-p-offset)/.018,2)),0);
        const y=210-Math.min(1.1,absorption)*144;if(i)c.lineTo(50+i,y);else c.moveTo(50+i,y);
      }c.strokeStyle=color;c.lineWidth=width;c.stroke();
    }
    spectrum(wanted,0,'#9de1bd',4);if(game.choice)spectrum(SPECTRA[game.choice],game.offset/100,'#f2ce90',2);
    c.fillStyle='#9de1bd';c.font='bold 12px sans-serif';c.fillText('SAMPLE '+(game.round===0?'A':'B'),50,27);c.fillStyle='#f2ce90';c.fillText(game.choice?SPECTRA[game.choice].name.toUpperCase()+' REFERENCE':'CHOOSE A REFERENCE BELOW',280,27);
    c.fillStyle='#bfcebf';c.font='10px sans-serif';c.fillText('ABSORPTION',50,50);c.fillText('INFRARED CHANNEL · ILLUSTRATED',170,245);
  }
  function drawDrill(t){
    const colors=['#d5b183','#b18b69','#c5a77c','#846c57','#b69977','#756354'];
    c.save();c.beginPath();c.roundRect(78,79,444,162,15);c.clip();
    colors.forEach((color,i)=>{c.fillStyle=color;c.fillRect(78,79+i*28,444,30);path(c,[[78,99+i*28],[163,95+i*28],[247,103+i*28],[365,96+i*28],[522,102+i*28]],null,'#493f3629');});
    for(let i=0;i<60;i++)ellipse(c,85+(i*71)%425,85+(i*37)%150,1,1,'#e9d5b244');c.restore();
    const tip=95+game.depth*105;
    box(c,278,38,44,tip-35,5,'#b0bcb0','#d4d5bb');box(c,266,21,68,36,8,game.venting?'#bc795a':'#c5ad74','#eeddb5');
    for(let i=0;i<7;i++){const y=66+i*17+(reduced?0:(t*30)%17);if(y<tip)path(c,[[282,y],[318,y+8]],null,game.heat>.8?'#de8f67':'#5c7978');}
    path(c,[[278,tip],[300,tip+15],[322,tip]],'#55716e','#d6d3b4');
    box(c,452,24,34,112,8,'#243f43','#d3c492');c.save();c.beginPath();c.roundRect(457,29,24,102,5);c.clip();
    colors.forEach((color,i)=>{c.fillStyle=color;c.fillRect(457,131-game.depth*102+i*17,24,18);});c.restore();
    c.font='bold 11px sans-serif';c.fillStyle='#eee0b4';c.fillText('SEDIMENT CORE',423,158);
    if(game.heat>.6)for(let i=0;i<4;i++)ellipse(c,280+i*14,tip+17,2,2,'#f1b679');
  }
  function frame(now){
    if(disposed)return;
    const dt=last?Math.max(0,Math.min(.25,(now-last)/1000)):0;last=now;
    if(!document.hidden){
      // Fixed small integration steps retain stable pressure/heat while visible
      // timers keep pace on lower-frame-rate screens. Hidden tabs reset last.
      for(let remaining=dt;remaining>0;remaining-=.05){const wasHot=game.venting;advanceScience(game,Math.min(.05,remaining));if(wasHot!==game.venting)onHazard(game.venting);}
      if(!game.complete)onActive(dt);
      if(round!==game.round){round=game.round;onCue(880);}
      if(oldPhase!==game.phase){oldPhase=game.phase;onCue(880);}
      sync();background();if(kind==='laser')drawLaser(reduced?0:now/1000);else if(kind==='spectrometer')drawSpectrum();else drawDrill(reduced?0:now/1000);
    }
    frameId=requestAnimationFrame(frame);
  }
  function dispose(){disposed=true;cancelAnimationFrame(frameId);abort.abort();}
  document.addEventListener('visibilitychange',()=>{last=0;},{signal});
  frameId=requestAnimationFrame(frame);return dispose;
}
