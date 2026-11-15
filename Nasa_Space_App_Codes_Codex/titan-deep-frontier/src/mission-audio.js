// Small, self-contained Web Audio synthesizer. Vacuum sounds are cabin sonification.
export function missionAudio(){
  let context=null,master=null,rumble=null,hiss=null,rumbleGain=null,hissGain=null,enabled=false,lastChirp=-10;
  function init(){
    if(context)return;
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
    context=new Audio();master=context.createGain();master.gain.value=.3;master.connect(context.destination);
    rumble=context.createOscillator();rumble.type='triangle';rumble.frequency.value=47;rumbleGain=context.createGain();rumbleGain.gain.value=0;rumble.connect(rumbleGain).connect(master);rumble.start();
    const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    hiss=context.createBufferSource();hiss.buffer=buffer;hiss.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1400;
    hissGain=context.createGain();hissGain.gain.value=0;hiss.connect(filter).connect(hissGain).connect(master);hiss.start();
  }
  function tone(frequency,delay=0,duration=.16){
    if(!enabled||!context)return;const start=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=frequency;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(.16,start+.012);g.gain.exponentialRampToValueAtTime(.001,start+duration);o.connect(g).connect(master);o.start(start);o.stop(start+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  return {
    enable(value){enabled=value;try{if(value){init();context?.resume().catch(()=>{});}else if(master)master.gain.setTargetAtTime(0,context.currentTime,.025);if(value&&master)master.gain.setTargetAtTime(.3,context.currentTime,.025);}catch{/* Sound is optional. */}},
    ping(f=660){tone(f);},chime(){tone(659.25,0,.35);tone(880,.14,.5);},
    // Retained launch-only ignition cue; the other audio remains the earlier mission synth.
    ignite(){tone(90,0,.8);tone(45,.06,.7);},
    update({launch=0,descent=0,transmitting=false,paused=false,time=0}){
      if(!context)return;const active=enabled&&!paused,now=context.currentTime;
      rumbleGain.gain.setTargetAtTime(active?launch*.32:0,now,.06);
      hissGain.gain.setTargetAtTime(active?descent*(.12+.06*Math.sin(time*15)) :0,now,.04);
      if(active&&transmitting&&time-lastChirp>.22){tone(time%1<.5?1318.5:1760,0,.055);lastChirp=time;}
    },
    close(){try{rumble?.stop();hiss?.stop();context?.close().catch(()=>{});}catch{}context=null;}
  };
}
