// Transient world-space traces; the WeakMap never retains an unmounted mission.
const previous=new WeakMap();
export function updateTrails(trails,state,dt,moving,reduced=false,motion=null){
 const before=previous.get(state);previous.set(state,{x:state.x,y:state.y});
 if(reduced)return [];
 const water=state.destination==='titan',lifetime=water?2.5:12,seconds=Number.isFinite(dt)?Math.max(0,dt):0;
 const live=trails.map(p=>({...p,age:p.age+seconds})).filter(p=>p.age<lifetime);
 const height=motion?.height||700,dx=motion?.dx??(before?state.x-before.x:0),dy=motion?.dy??(before?(state.y-before.y)*height:0),speed=Math.hypot(dx,dy);
 const last=live.at(-1);
 if(moving&&speed>.001&&(!last||Math.hypot(state.x-last.sourceX,(state.y-last.sourceY)*height)>8)){
  const ux=dx/speed,uy=dy/speed,stern=water?82:64;
  live.push({x:state.x-ux*stern,y:state.y-uy*stern/height,ux,uy,sourceX:state.x,sourceY:state.y,age:0});
 }
 return live.slice(-120);
}
export function drawTrails(c,trails,state,camera,w,h,scale){
 const water=state.destination==='titan';
 c.save();c.lineWidth=1.1*scale;c.lineCap='round';c.lineJoin='round';
 for(const p of trails){const x=(p.x-camera)*scale,y=p.y*h+24*scale;if(x< -160||x>w+160)continue;
  c.save();c.translate(x,y);c.rotate(Math.atan2(p.uy,p.ux));c.globalAlpha=Math.max(0,1-p.age/(water?2.5:12))*(water?.32:.28);
  c.strokeStyle=water?'#c5e8da':state.destination==='mars'?'#654333':'#25303c';
  if(water){const spread=(10+p.age*17)*scale,back=(18+p.age*24)*scale;
   // Both curved arms run backward from the stern; no rectangular water traces.
   for(const side of [-1,1]){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-back*.35,side*spread*.35,-back,side*spread);c.stroke();}
   c.beginPath();c.ellipse(-back*.55,0,back*.4,spread*.6,0,Math.PI*.5,Math.PI*1.5);c.stroke();
  }else for(const side of [-1,1]){c.beginPath();c.moveTo(-8*scale,side*12*scale);c.lineTo(0,side*12*scale);for(let j=-2;j<=0;j++){c.moveTo(j*3*scale,(side*12-2)*scale);c.lineTo((j*3+1)*scale,(side*12+2)*scale);}c.stroke();}
  c.restore();
 }c.restore();
}
