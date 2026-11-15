// World-space trails are transient artwork. They never enlarge saved missions.
export function updateTrails(trails,state,dt,moving,reduced=false){
  if(reduced)return [];
  const lifetime=state.destination==='titan'?2.4:12;
  const live=trails.map(p=>({...p,age:p.age+dt})).filter(p=>p.age<lifetime);
  const last=live.at(-1);
  if(moving&&(!last||Math.abs(state.x-last.x)>13||Math.abs(state.y-last.y)>.014))live.push({x:state.x,y:state.y,age:0});
  return live.slice(-120);
}
export function drawTrails(c,trails,state,camera,w,h,scale){
  const water=state.destination==='titan';
  c.save();c.lineWidth=1.2*scale;
  for(const p of trails){const x=(p.x-camera)*scale,y=p.y*h+24*scale;if(x< -80||x>w+80)continue;
    c.globalAlpha=(1-p.age/(water?2.4:12))*(water?.26:.3);
    c.strokeStyle=water?'#d5e4bb':state.destination==='mars'?'#533d31':'#1c2431';
    if(water){c.beginPath();c.ellipse(x,y,(12+p.age*24)*scale,(3+p.age*6)*scale,0,0,Math.PI*2);c.stroke();}
    else for(const dy of [-8,8]){c.beginPath();c.moveTo(x-8*scale,y+dy*scale);c.lineTo(x+8*scale,y+dy*scale);for(let j=-2;j<=2;j++){c.moveTo(x+j*3*scale,y+(dy-2)*scale);c.lineTo(x+(j*3+1)*scale,y+(dy+2)*scale);}c.stroke();}
  }c.restore();
}
