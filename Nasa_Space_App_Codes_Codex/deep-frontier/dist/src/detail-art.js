import {explosionPhase} from './failure.js';
const noise=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);};
export function drawFailure(c,f,reduced=false){
 const t=f.elapsed,p=explosionPhase(t);if(p.finished)return;
 c.save();
 // A gentle stationary glow replaces flashes, shake and debris in reduced motion.
 if(reduced){c.globalAlpha=.25*(1-t/1.8);c.fillStyle='#f6d798';c.beginPath();c.arc(f.x,f.y,48,0,Math.PI*2);c.fill();c.restore();return;}
 c.translate(f.x,f.y);
 if(p.flash>0){const r=80+t*2400,g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'#fff9e8');g.addColorStop(.25,'#ffe8ab99');g.addColorStop(1,'#ffe8ab00');c.globalAlpha=p.flash*.55;c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);}
 if(p.core>0)for(let i=0;i<8;i++){const a=i*2.399,r=18+t*(160+noise(i)*130),x=Math.cos(a)*t*130,y=Math.sin(a)*t*100;const g=c.createRadialGradient(x-r*.2,y-r*.2,1,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.2,'#ffe26a');g.addColorStop(.55,'#ff6d2b');g.addColorStop(.8,'#b81a1acc');g.addColorStop(1,'#b81a1a00');c.globalAlpha=p.core;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
 if(p.fragments)for(let i=0;i<46;i++){const a=noise(i+1)*Math.PI*2,v=110+noise(i+9)*330,drag=(1-Math.exp(-1.1*t))/1.1,x=Math.cos(a)*v*drag,y=Math.sin(a)*v*drag+t*t*100;c.save();c.translate(x,y);c.rotate(t*(noise(i+7)-.5)*20);c.globalAlpha=Math.max(0,1-t/1.5);c.fillStyle=['#d9ddd3','#d9b365','#39464c','#171e26'][i%4];c.beginPath();c.moveTo(-5,-3);c.lineTo(5+noise(i)*6,-1);c.lineTo(2,4);c.lineTo(-3,2);c.closePath();c.fill();c.restore();}
 if(t<1.3)for(let i=0;i<72;i++){const a=noise(i+80)*Math.PI*2,v=110+noise(i+150)*420,x=Math.cos(a)*v*t,y=Math.sin(a)*v*t+t*t*80;c.globalAlpha=Math.max(0,1-t/1.3)*(.5+.5*noise(i+Math.floor(t*30)));c.strokeStyle=i%2?'#ffe7a0':'#ff8f43';c.lineWidth=1.5;c.beginPath();c.moveTo(x-Math.cos(a)*12,y-Math.sin(a)*12);c.lineTo(x,y);c.stroke();}
 if(p.smoke)for(let i=0;i<12;i++){const age=t-.25,r=16+age*(22+noise(i)*34),x=(noise(i+60)-.5)*age*140+Math.sin(age*3+i)*12,y=-age*(30+noise(i+30)*60);const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,i%2?'#262329':'#4a4450');g.addColorStop(1,'#26232900');c.globalAlpha=Math.min(1,age*4)*Math.max(0,1-age/1.55)*.65;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
 c.restore();
}
export function detailDebris(c,o,t,accent='#d6b364'){
 if(!['satellite','booster','panel','bolt'].includes(o.kind))return false;
 c.save();c.translate(o.x,o.y);c.rotate(t*(o.spin||.4)+o.id);const r=o.r;c.lineWidth=1.3;
 const metal=c.createLinearGradient(-r,-r,r,r);metal.addColorStop(0,'#f1efe0');metal.addColorStop(.4,'#8f9fa4');metal.addColorStop(1,'#293c48');c.fillStyle=metal;c.strokeStyle='#d6dfdc';
 if(o.kind==='satellite'){c.fillStyle=accent;c.fillRect(-r*.45,-r*.6,r*.9,r*1.2);for(let i=0;i<8;i++){c.strokeStyle=i%2?'#ffe4a9':'#886531';c.beginPath();c.moveTo(-r*.4+i*r*.1,-r*.6);c.lineTo(-r*.35+i*r*.1,r*.6);c.stroke();}for(const side of [-1,1]){c.save();c.translate(side*r*.9,side*r*.2);c.rotate(side*.3);c.fillStyle='#203e65';c.fillRect(-r*.35,-r*.9,r*.7,r*1.8);c.strokeStyle='#98b9ce';for(let j=0;j<7;j++){c.beginPath();c.moveTo(-r*.3,-r*.85+j*r*.27);c.lineTo(r*.3,-r*.85+j*r*.27);c.stroke();}c.restore();}c.strokeStyle='#9fac9e';c.beginPath();c.moveTo(0,-r*.6);c.bezierCurveTo(r*.5,-r*1.4,-r*.6,-r*1.5,-r*.3,-r);c.stroke();}
 if(o.kind==='booster'){c.beginPath();c.roundRect(-r,-r*.45,r*2,r*.9,r*.2);c.fill();c.stroke();for(let i=0;i<12;i++){c.beginPath();c.moveTo(-r+i*r/6,-r*.43);c.lineTo(-r+i*r/6,r*.43);c.strokeStyle='#344d5e77';c.stroke();}c.fillStyle='#132531';c.beginPath();c.ellipse(r,0,r*.15,r*.45,0,0,7);c.fill();c.strokeStyle='#f1c66a';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-r+i*5,-r*.4);c.lineTo(-r+5+i*5,-r*.12);c.stroke();}c.fillStyle='#3b505c';c.beginPath();c.moveTo(-r, -r*.2);c.lineTo(-r*1.35,-r*.4);c.lineTo(-r*1.35,r*.4);c.lineTo(-r,r*.2);c.closePath();c.fill();}
 if(o.kind==='panel'){c.beginPath();c.moveTo(-r,-r*.7);c.quadraticCurveTo(r*.3,-r,r,r*.6);c.lineTo(-r*.6,r*.8);c.closePath();c.fill();c.stroke();c.strokeStyle='#445b65';c.beginPath();c.moveTo(-r*.7,-r*.5);c.lineTo(r*.6,r*.4);c.stroke();}
 if(o.kind==='bolt'){c.fillRect(-r*.5,-4,r,8);for(let i=0;i<7;i++)c.strokeRect(-r*.4+i*3,-4,1,8);c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;i?c.lineTo(Math.cos(a)*9-r*.5,Math.sin(a)*9):c.moveTo(Math.cos(a)*9-r*.5,Math.sin(a)*9);}c.closePath();c.fill();c.stroke();}c.restore();return true;
}
