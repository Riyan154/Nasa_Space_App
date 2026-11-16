// Cabin sonification: all source, gain and filter nodes have explicit ownership.
export function missionAudio(){
 let context=null,master=null,enabled=false,paused=true,closed=false,rumbleGain=null,hissGain=null,engine=null,filter=null,noiseBuffer=null,palette='',ambientGain=null,lastChirp=-10,nextChord=0;
 const graph=new Set(),ambient=new Set();
 function make(method,group=graph){const n=context[method]();graph.add(n);if(group!==graph)group.add(n);return n;}
 function release(nodes){for(const n of nodes){try{n.stop?.();}catch{}try{n.disconnect();}catch{}graph.delete(n);}nodes.clear();}
 function stopAmbient(){release(ambient);ambientGain=null;palette='';}
 function initialize(){
  if(context||closed)return;
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
  context=new Audio();master=make('createGain');master.gain.value=0;master.connect(context.destination);
  noiseBuffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  rumbleGain=make('createGain');rumbleGain.gain.value=0;rumbleGain.connect(master);
  engine=make('createOscillator');engine.type='sine';engine.frequency.value=42;engine.connect(rumbleGain);engine.start();
  const brownBuffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),brownData=brownBuffer.getChannelData(0);let prev=0;
  for(let i=0;i<brownData.length;i++){prev=(prev+.02*(Math.random()*2-1))/1.02;brownData[i]=prev*3.5;}
  const brown=make('createBufferSource'),low=make('createBiquadFilter');brown.buffer=brownBuffer;brown.loop=true;low.type='lowpass';low.frequency.value=180;low.Q.value=1.2;brown.connect(low).connect(rumbleGain);brown.start();
  const hiss=make('createBufferSource');hiss.buffer=noiseBuffer;hiss.loop=true;filter=make('createBiquadFilter');filter.type='lowpass';filter.frequency.value=1400;filter.Q.value=1;
  hissGain=make('createGain');hissGain.gain.value=0;hiss.connect(filter).connect(hissGain).connect(master);hiss.start();
 }
 function active(){return enabled&&!paused&&!!context&&!closed;}
 function tone(frequency,delay=0,duration=.16,type='sine',volume=.13,endFrequency=frequency){
  if(!active())return;const start=context.currentTime+delay,o=make('createOscillator'),g=make('createGain');o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(endFrequency,start+duration);
  g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.01);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(master);
  o.onended=()=>release(new Set([o,g]));o.start(start);o.stop(start+duration+.02);
 }
 function noise(duration,volume,cutoff){
  if(!active())return;const now=context.currentTime,n=make('createBufferSource'),f=make('createBiquadFilter'),g=make('createGain');n.buffer=noiseBuffer;f.type='lowpass';f.frequency.setValueAtTime(cutoff,now);f.frequency.exponentialRampToValueAtTime(90,now+duration);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(volume,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+duration);n.connect(f).connect(g).connect(master);n.onended=()=>release(new Set([n,f,g]));n.start();n.stop(now+duration+.02);
 }
 function startAmbient(destination){
  stopAmbient();palette=destination;nextChord=0;ambientGain=make('createGain',ambient);ambientGain.gain.value=.1;ambientGain.connect(master);
  const f=make('createBiquadFilter',ambient);f.type='lowpass';f.frequency.value=450;f.Q.value=.7;f.connect(ambientGain);
  const lfo=make('createOscillator',ambient),depth=make('createGain',ambient);lfo.frequency.value=.08;depth.gain.value=170;lfo.connect(depth).connect(f.frequency);lfo.start();
  for(const [i,ratio] of [1,1.5].entries()){const o=make('createOscillator',ambient),g=make('createGain',ambient);o.type=i?'triangle':'sine';o.frequency.value=(destination==='titan'?55:destination==='mars'?110:264)*ratio;g.gain.value=.1;o.connect(g).connect(f);o.start();}
 }
 function chord(){const now=context.currentTime,root=palette==='moon'?528:palette==='mars'?110:55;
  for(const ratio of [1,1.5,2.25,8/3]){const o=make('createOscillator',ambient),g=make('createGain',ambient);o.frequency.value=root*ratio;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.04,now+3);g.gain.linearRampToValueAtTime(0,now+8);o.connect(g).connect(ambientGain);o.onended=()=>{ambient.delete(o);ambient.delete(g);release(new Set([o,g]));};o.start();o.stop(now+8.1);}nextChord=now+10;
 }
 function mute(){if(!context)return;master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(active()?.3:0,context.currentTime);}
 return {
  enable(value){if(closed)return;enabled=!!value;try{if(enabled)initialize();mute();if(context){if(active())context.resume()?.catch(()=>{});else{stopAmbient();context.suspend()?.catch(()=>{});}}}catch{release(graph);try{context?.close()?.catch(()=>{});}catch{}context=null;master=null;}},
  pause(value){paused=!!value;if(!context||closed)return;try{mute();if(active())context.resume()?.catch(()=>{});else context.suspend()?.catch(()=>{});}catch{}},
  ping(f=660){tone(f);},chime(){tone(659.25,0,.35);tone(880,.14,.5);},
  ignite(){tone(90,0,.8,'triangle',.15,42);noise(.35,.12,700);},
  rumble(level=1){if(active())rumbleGain.gain.setTargetAtTime(Math.max(0,Math.min(1,level))*.25,context.currentTime,.06);},
  hiss(level=1){if(active())hissGain.gain.setTargetAtTime(Math.max(0,Math.min(1,level))*.1,context.currentTime,.01);},
  impact(){tone(210,0,.25,'triangle',.12);tone(541,.003,.18);tone(847,.008,.12);},
  explode(){tone(2200,0,.045,'triangle',.12,180);tone(85,0,1.4,'triangle',.3,24);noise(1.4,.4,4000);},
  update({launch=0,descent=0,rcs=false,strain=false,transmitting=false,paused:shouldPause=false,time=0,destination='titan'}){
   if(paused!==shouldPause)this.pause(shouldPause);if(!context||closed)return;const on=active(),now=context.currentTime;
   if(on){if(palette!==destination)startAmbient(destination);if(now>=nextChord)chord();}
   rumbleGain.gain.setTargetAtTime(on?launch*(strain?.18+.12*Math.max(0,Math.sin(time*28)):.3):0,now,.06);engine.frequency.setTargetAtTime(42+launch*8,now,.15);
   hissGain.gain.setTargetAtTime(on?descent*(.12+.06*Math.sin(time*15))+(rcs?.08:0):0,now,.02);filter.frequency.setTargetAtTime(rcs?2800:1400,now,.03);
   if(on&&transmitting&&time-lastChirp>.22){tone(time%1<.5?1318.5:1760,0,.055);lastChirp=time;}
  },
  close(){if(closed)return;closed=true;enabled=false;stopAmbient();release(graph);try{context?.close()?.catch(()=>{});}catch{}context=null;master=null;noiseBuffer=null;}
 };
}
