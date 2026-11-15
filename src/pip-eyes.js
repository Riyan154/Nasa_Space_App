export function eyeState({complete=false,hazard=false,science=false,moving=false,dx=0,dy=0,time=0,reduced=false}={}){
  const mode=complete?'complete':hazard?'hazard':science?'science':moving?'moving':'idle';
  // Deterministic 4–6 second cadence; a full blink lasts 120 ms.
  const cycle=Math.floor(time/15),local=time-cycle*15;
  const blinkAt=[4.4,9.5,14.3].find(at=>local>=at&&local<at+.12);
  const blink=!reduced&&blinkAt!==undefined?1-Math.sin((local-blinkAt)/.12*Math.PI):1;
  return {mode,blink,dx:Math.sign(dx)*2.5,dy:Math.sign(dy)*2.5,scan:reduced?.5:(time*.65)%1,jitter:!reduced&&mode==='hazard'?Math.sin(time*53)*1.2:0};
}
export function drawEyes(c,eye){
  c.save();c.translate(eye.dx,eye.dy);c.strokeStyle='#a5f3e4';c.fillStyle='#a5f3e4';c.lineWidth=2.4;c.lineCap='round';
  for(const x of [-13.5,13.5]){
    if(eye.mode==='complete'){c.beginPath();c.moveTo(x-5,-26);c.quadraticCurveTo(x,-36,x+5,-26);c.stroke();}
    else if(eye.mode==='hazard'){c.beginPath();c.arc(x,-27,7,0,Math.PI*2);c.stroke();c.beginPath();c.arc(x+eye.jitter,-27,2,0,Math.PI*2);c.fill();}
    else{const height=eye.mode==='science'?3:Math.max(1,10*eye.blink);c.beginPath();c.roundRect(x-4.5,-27-height/2,9,height,Math.min(4,height/2));c.fill();}
  }
  if(eye.mode==='science'){c.globalAlpha=.6;c.fillRect(-23,-35+eye.scan*17,46,1);}
  c.restore();
}
