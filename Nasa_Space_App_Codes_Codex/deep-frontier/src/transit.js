import {detailDebris} from './detail-art.js';
export const transitDuration=destination=>destination==='moon'?10:destination==='mars'?15:30;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function freshTransit(destination='titan'){return {destination,duration:transitDuration(destination),hull:100,destroyed:false,elapsed:0,x:200,y:360,hits:0,warning:0,invulnerable:0,spawn:1,seed:314159,nextId:0,obstacles:[],complete:false,skipped:false};}
export function restoreTransit(v,destination=v?.destination||'titan'){
 if(!v)return freshTransit(destination);
 if(!['elapsed','x','y','hits','warning','invulnerable','spawn','seed','nextId'].every(k=>Number.isFinite(v[k]))||v.elapsed<0||v.elapsed>30||v.hits<0||!Array.isArray(v.obstacles)||v.obstacles.length>40||typeof v.complete!=='boolean'||typeof v.skipped!=='boolean')return freshTransit(destination);
 const duration=transitDuration(destination),hull=clamp(Number.isFinite(v.hull)?v.hull:100-25*v.hits,0,100);
 const s={...v,destination,duration,hull,destroyed:hull===0,elapsed:Math.min(v.elapsed,duration),x:clamp(v.x,55,900),y:clamp(v.y,190,530),obstacles:v.obstacles.filter(o=>['x','y','r','speed','id'].every(k=>Number.isFinite(o[k]))&&o.r>0&&o.r<=50).map(o=>({...o}))};return s;
}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function advanceTransit(s,seconds,dx=0,dy=0){
 dx=Number.isFinite(dx)?dx:0;dy=Number.isFinite(dy)?dy:0;
 if(s.complete||s.destroyed||!Number.isFinite(seconds)||seconds<=0)return 0;
 let remaining=Math.min(seconds,s.duration-s.elapsed),impacts=0;
 while(remaining>1e-8&&!s.destroyed){const dt=Math.min(.02,remaining);remaining-=dt;s.elapsed=Math.min(s.duration,s.elapsed+dt);s.warning=Math.max(0,s.warning-dt);s.invulnerable=Math.max(0,s.invulnerable-dt);
 const length=Math.max(1,Math.hypot(dx,dy));s.x=clamp(s.x+(Number.isFinite(dx)?dx:0)/length*290*dt,55,900);s.y=clamp(s.y+(Number.isFinite(dy)?dy:0)/length*230*dt,190,530);
 s.spawn-=dt;if(s.spawn<=0){s.spawn=.7+random(s)*.5;s.obstacles.push({id:s.nextId++,kind:['carbon','silicate','satellite','booster','panel','bolt'][Math.floor(random(s)*6)],spin:(random(s)-.5)*2,x:1080,y:205+random(s)*310,r:15+random(s)*20,speed:175+random(s)*95});}
 for(const o of s.obstacles){o.x-=o.speed*dt;if(!s.invulnerable&&Math.hypot(o.x-s.x,o.y-s.y)<o.r+22){s.hits++;s.hull=Math.max(0,s.hull-25);s.destroyed=s.hull===0;impacts++;s.warning=5;s.invulnerable=1.2;o.x=-100;}}
 s.obstacles=s.obstacles.filter(o=>o.x>-70);}
 if(s.elapsed>=s.duration-1e-8&&!s.destroyed){s.elapsed=s.duration;s.complete=true;}return impacts;
}
export function skipTransit(s){s.skipped=true;s.complete=true;}
export const evasiveBonus=s=>s?.complete&&!s.skipped&&!s.destroyed&&s.elapsed===(s.duration||30)&&s.hits===0?15:0;
// One gimballed aft engine. Exhaust tilts opposite vertical steering;
// reverse input reduces the rear engine to an idle glow.
export function thrusterLayout(dx=0,dy=0){
 dx=Number.isFinite(dx)?clamp(dx,-1,1):0;dy=Number.isFinite(dy)?clamp(dy,-1,1):0;
 const tilt=dy*.42;
 return [{x:-38,y:0,ex:-Math.cos(tilt),ey:-Math.sin(tilt),level:dx<0?.06:dx>0?.35+.65*dx:.18,main:true}];
}
export function transitArt(c,w,h,s,time,{dx=0,dy=0,reduced=false,accent='#d6b364'}={}){
 c.save();c.fillStyle='#081923';c.fillRect(0,0,w,h);
 for(let i=0;i<90;i++){const x=((i*137-(reduced?0:time*18))%1000+1000)%1000,y=(i*71)%600;c.globalAlpha=.25+(i%4)*.16;c.fillStyle=i%3?'#c9e8df':'#f4d9a8';c.fillRect(x*w/1000,y*h/600,i%4===0?2:1,1);}c.globalAlpha=1;c.scale(w/1000,h/600);
 for(const o of s.obstacles){if(detailDebris(c,o,reduced?0:time,accent))continue;c.save();c.translate(o.x,o.y);c.rotate(reduced?o.id:time*(o.spin||.3)+o.id);const g=c.createRadialGradient(-o.r*.4,-o.r*.4,1,0,0,o.r);g.addColorStop(0,o.kind==='carbon'?'#7e8787':'#c7b9a3');g.addColorStop(1,'#444c52');c.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=o.r*(.8+.18*Math.sin(i*13+o.id));i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#c2bbaa66';c.stroke();for(let i=0;i<3;i++){c.beginPath();c.ellipse((i-1)*o.r*.38,(i%2-.5)*o.r*.5,o.r*.19,o.r*.14,0,0,7);c.fillStyle='#222f3e88';c.fill();c.strokeStyle='#d4c7a744';c.stroke();}c.restore();}
 if(s.destroyed){c.restore();return;} if(s.invulnerable>0){c.fillStyle=`rgba(190,30,20,${Math.min(.25,s.invulnerable*.22)})`;c.fillRect(0,0,1000,600);} c.translate(s.x,s.y);if(s.invulnerable>0&&!reduced)c.globalAlpha=Math.sin(time*35)>0?1:.2;if(s.invulnerable>0&&!reduced){c.fillStyle='#f9d49c33';c.beginPath();c.arc(0,0,40,0,7);c.fill();}
 const hull=c.createLinearGradient(0,-22,0,22);hull.addColorStop(0,'#f6e9c5');hull.addColorStop(.45,'#a1bcb6');hull.addColorStop(1,'#46616a');c.fillStyle=hull;c.strokeStyle='#e6d3a0';c.lineWidth=2;c.beginPath();c.moveTo(35,0);c.quadraticCurveTo(15,-26,-24,-20);c.lineTo(-30,20);c.quadraticCurveTo(15,26,35,0);c.fill();c.stroke();c.fillStyle='#183442';c.beginPath();c.ellipse(9,0,9,12,0,0,7);c.fill();c.strokeStyle='#a2e6df';c.stroke();c.fillStyle=accent;c.fillRect(-23,-15,7,30);c.fillStyle='#6b7775';c.fillRect(-37,-12,10,24);
 // Riveted shell seams, foil wrinkles and recessed sensor glass.
 c.strokeStyle='#f9edcf88';c.lineWidth=.7;for(let i=0;i<7;i++){c.beginPath();c.moveTo(-23,-14+i*4);c.lineTo(-18,-11+i*4);c.lineTo(-23,-9+i*4);c.stroke();}
 c.strokeStyle='#56727e';for(const side of [-1,1]){c.beginPath();c.moveTo(-11,side*18);c.lineTo(14,side*14);c.stroke();c.fillStyle='#dfdac0';for(let i=0;i<5;i++){c.beginPath();c.arc(-12+i*6,side*(17-i*.6),.9,0,7);c.fill();}}
 const glass=c.createRadialGradient(6,-4,0,9,0,11);glass.addColorStop(0,'#c9fff2');glass.addColorStop(.4,'#68c5cd');glass.addColorStop(1,'#16465b');c.fillStyle=glass;c.beginPath();c.ellipse(9,0,6.5,9.5,0,0,7);c.fill();
 const plume=(x,y,angle,size,level)=>{c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=level;const g=c.createLinearGradient(0,0,-size,0);g.addColorStop(0,'#edfbff');g.addColorStop(.35,'#8dd9e9cc');g.addColorStop(1,'#62b5e600');c.fillStyle=g;c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(-size*.6,-5,-size,0);c.quadraticCurveTo(-size*.6,5,0,4);c.fill();if(!reduced)for(let i=0;i<Math.ceil(level*12);i++){const u=(time*(.8+level*3)+i/7)%1;c.globalAlpha=level*(1-u);c.fillStyle='#a6e8fa';c.fillRect(-size-u*22,Math.sin(i*3)*u*6,1.5,1);}c.restore();};for(const jet of thrusterLayout(dx,dy)){c.save();c.translate(jet.x,jet.y);c.rotate(Math.atan2(jet.ey,jet.ex)-Math.PI);c.fillStyle='#304753';c.strokeStyle='#b8d9d4';c.lineWidth=1;c.beginPath();c.moveTo(4,-3);c.lineTo(-5,-5);c.lineTo(-5,5);c.lineTo(4,3);c.closePath();c.fill();c.stroke();c.restore();plume(jet.x,jet.y,Math.atan2(jet.ey,jet.ex)-Math.PI,jet.main?5+jet.level*53:12+jet.level*22,jet.level);}
 c.restore();
}
