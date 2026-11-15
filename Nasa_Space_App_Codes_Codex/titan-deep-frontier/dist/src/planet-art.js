// Original, bounded Canvas sprite caches. Soft material shading, no contour-wave layers.
const TAU=Math.PI*2, caches=new Map();
const hash=n=>{const a=Math.sin(n*83.17+12.9)*43758.54;return a-Math.floor(a);};
function canvas(w,h){const a=typeof OffscreenCanvas==='function'?new OffscreenCanvas(w,h):document.createElement('canvas');a.width=w;a.height=h;return a;}
function oval(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function rect(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,pts,color,width=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.strokeStyle=color;c.stroke();}
function smoothShape(c,pts,fill){c.beginPath();const n=pts.length;c.moveTo((pts[0][0]+pts[n-1][0])/2,(pts[0][1]+pts[n-1][1])/2);for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}c.closePath();c.fillStyle=fill;c.fill();}
function roundedRock(c,pts,fill){c.beginPath();for(let i=0;i<pts.length;i++){const a=pts[(i+pts.length-1)%pts.length],p=pts[i],b=pts[(i+1)%pts.length],u=.12;const before=[p[0]+(a[0]-p[0])*u,p[1]+(a[1]-p[1])*u],after=[p[0]+(b[0]-p[0])*u,p[1]+(b[1]-p[1])*u];if(i)c.lineTo(...before);else c.moveTo(...before);c.quadraticCurveTo(...p,...after);}c.closePath();c.fillStyle=fill;c.fill();}
function bowl(c,x,y,r,mars=false){
  c.save();c.translate(x,y);c.scale(r/100,r/100);c.lineJoin='round';
  const outer=c.createRadialGradient(-16,-7,40,0,0,123);outer.addColorStop(0,mars?'#926b4c':'#69747a');outer.addColorStop(.7,mars?'#ba8b5f':'#a0a49b');outer.addColorStop(1,mars?'#ab795000':'#a0a49b00');
  c.save();c.scale(1,.36);oval(c,0,0,124,124,outer);c.restore();
  const wall=c.createLinearGradient(-60,-28,60,29);wall.addColorStop(0,mars?'#553c32':'#27343f');wall.addColorStop(.55,mars?'#78583f':'#535f67');wall.addColorStop(1,mars?'#c69c6c':'#a2aaa0');
  const rim=Array.from({length:28},(_,i)=>{const a=i*TAU/28,rr=88+hash(i+x)*5;return [Math.cos(a)*rr,Math.sin(a)*rr*.31];});smoothShape(c,rim,wall);
  oval(c,14,9,59,14,mars?'#8c684c':'#717b7c');
  c.save();c.beginPath();c.ellipse(0,0,88,28,0,0,TAU);c.clip();
  for(let i=0;i<55;i++){const xx=(hash(i*3+x)-.5)*170,yy=(hash(i*7+y)-.5)*54;oval(c,xx,yy,.4+hash(i)*1.3,.5,i%3?'#101e2c24':'#f5e1b524');}c.restore();
  c.beginPath();c.ellipse(0,0,92,31,0,Math.PI*1.08,Math.PI*1.83);c.lineWidth=2;c.strokeStyle=mars?'#dab38366':'#d1d2bc59';c.stroke();c.restore();
}
function planetCache(body){
  if(caches.has(body))return caches.get(body);
  const mars=body==='mars',ground=canvas(2400,600),back=canvas(2400,600),g=ground.getContext('2d'),b=back.getContext('2d');
  // An open horizon with isolated crater massifs. There are no sine-wave outlines.
  const ridge=b.createLinearGradient(0,275,0,410);ridge.addColorStop(0,mars?'#957363':'#4d5a64');ridge.addColorStop(1,mars?'#bf8f6b':'#7e888b');
  const ridgePts=[[0,410],[0,291],[51,276],[91,241],[130,250],[171,221],[203,231],[237,264],[270,258],[306,294],[367,313],[442,323],[520,302],[573,274],[618,283],[670,246],[708,252],[751,285],[822,310],[909,304],[967,263],[1012,244],[1074,252],[1110,283],[1195,313],[1310,327],[1460,311],[1580,267],[1660,256],[1720,278],[1830,310],[1980,276],[2070,247],[2140,260],[2290,314],[2400,291],[2400,410]];
  roundedRock(b,ridgePts,ridge);
  b.save();b.clip();
  for(let i=0;i<34;i++){const x=i*74+hash(i)*26,peak=232+hash(i*7)*65;roundedRock(b,[[x,peak],[x+12,peak+15],[x+83,353],[x+38,364],[x-20,318]],i%3?(mars?'#efbf9329':'#c1c7bc29'):(mars?'#4b373540':'#12263750'));}
  for(let i=0;i<1150;i++){const x=hash(i*9)*2400,y=225+hash(i*13)*185;line(b,[[x,y],[x-3+hash(i)*6,y+4+hash(i*5)*13]],i%3?'#17273518':'#e7e1c62b',.6);}b.restore();
  const soil=g.createLinearGradient(0,345,0,600);soil.addColorStop(0,mars?'#b58c6b':'#737f85');soil.addColorStop(.5,mars?'#c09872':'#929993');soil.addColorStop(1,mars?'#d2ad7c':'#b0b0a1');g.fillStyle=soil;g.fillRect(0,348,2400,252);
  // Grain is painted once; it remains anchored to the terrain as the camera moves.
  const tile=canvas(128,128),tc=tile.getContext('2d'),data=tc.createImageData(128,128);
  for(let i=0;i<data.data.length;i+=4){const v=hash(i)*255;data.data[i]=mars?v:150;data.data[i+1]=mars?v*.8:158;data.data[i+2]=mars?v*.55:155;data.data[i+3]=Math.floor(hash(i*3)*28);}tc.putImageData(data,0,0);g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(0,348,2400,252);
  if(!mars){
    g.save();g.translate(630,525);g.scale(1,.7);const shade=g.createRadialGradient(0,0,35,0,0,166);shade.addColorStop(0,'#13212edb');shade.addColorStop(.77,'#263744bf');shade.addColorStop(1,'#35465000');oval(g,0,0,166,166,shade);g.restore();
  }else{
    // Dry branching channels in the illustrated Jezero traverse.
    g.lineCap='round';for(let i=0;i<7;i++){const x=480+i*34;line(g,[[x,352],[x+18,380],[x-10,410],[x+28,450],[x+45,500]],'#74503b2e',5-i*.5);}
  }
  for(let i=0;i<67;i++){
    const x=hash(i*11)*2400,y=365+hash(i*17)*230,r=5+hash(i*23)*24;
    if(i%3!==0)bowl(g,x,y,r,mars);
    else{
      smoothShape(g,[[x-5,y],[x+42,y+6],[x+28,y+11],[x-7,y+6]],mars?'#77544055':'#00040bce');
      const stone=g.createLinearGradient(x-8,y-13,x+8,y+4);stone.addColorStop(0,mars?'#e1bd8c':'#d4d3be');stone.addColorStop(.45,mars?'#ad8059':'#8c999b');stone.addColorStop(1,mars?'#71503e':'#435563');
      smoothShape(g,[[x-11,y],[x-10,y-9],[x-2,y-16],[x+9,y-10],[x+12,y+1],[x+2,y+5]],stone);
      line(g,[[x-2,y-13],[x+1,y-5],[x+8,y]],mars?'#7b593e66':'#3e56636b',.7);
    }
  }
  for(let i=0;i<1300;i++)oval(g,hash(i*7)*2400,350+hash(i*13)*250,.3+hash(i)*1.5,.4,i%2?'#11233320':'#f8eccb32');
  const value={ground,back};caches.set(body,value);return value;
}
export function planetaryGround(c,w,h,camera=0,unit=1,body='moon'){
  const {ground,back}=planetCache(body),width=4000*unit;
  c.drawImage(back,-camera*.12,0,width,h);c.drawImage(ground,-camera,0,width,h);
}
export function descentCraft(c,x,y,s,t,{throttle=0,gear=1,dust=0,ramp=0,mars=false}={}){
  c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';c.lineWidth=2;
  // Three telescoping legs, rounded footpads and metallic shock absorbers.
  for(const [side,depth] of [[0,.7],[-1,1],[1,1]]){
    const endX=side*92*gear,endY=44*gear*depth;
    line(c,[[side*41,-9],[side*66*gear,17*gear],[endX,endY]],'#3d5660',7);
    line(c,[[side*41,-10],[side*66*gear,16*gear],[endX,endY]],'#c9d2c1',3);
    line(c,[[side*43,0],[side*72*gear,33*gear]],'#b49e66',3);oval(c,endX,endY,17,4,'#788c8b','#c1c9ac');
  }
  const gold=c.createLinearGradient(-64,-60,60,10);gold.addColorStop(0,'#e6d2a2');gold.addColorStop(.3,'#b79a61');gold.addColorStop(.65,'#e0c283');gold.addColorStop(1,'#91774b');
  smoothShape(c,[[-64,-3],[-61,-41],[-40,-62],[40,-62],[61,-41],[64,-3],[38,9],[-38,9]],gold);
  for(let i=0;i<22;i++){const xx=-55+hash(i*3)*110,yy=-50+hash(i*7)*49;line(c,[[xx,yy],[xx+4,yy+9],[xx-3,yy+14]],i%2?'#fff1c34d':'#6652383b',.7);}
  for(const side of [-1,1]){const metal=c.createLinearGradient(side*54-9,0,side*54+9,0);metal.addColorStop(0,'#677e83');metal.addColorStop(.45,'#d8e0d0');metal.addColorStop(1,'#70868a');rect(c,side*53-10,-34,20,37,10,metal,'#bbcab5');line(c,[[side*53-10,-21],[side*53+10,-21]],'#5a7880');}
  rect(c,-33,-78,66,34,9,'#d8ddcf','#829991');rect(c,-24,-69,48,17,6,'#254553','#a6c8c4');line(c,[[-20,-66],[-8,-66]],'#d0f0e270',2);
  rect(c,-16,-34,32,24,5,'#6c8987','#d3d5b5');rect(c,-11,-29,22,12,3,'#244652');for(let i=0;i<3;i++)oval(c,-7+i*7,-12,1.4,1.4,'#a7dcc8');
  smoothShape(c,[[-15,8],[-22,24],[22,24],[15,8]],'#4e656e');oval(c,0,23,20,4,throttle?'#e8dac2':'#18323f','#afbda9');
  if(ramp>0){line(c,[[35,7],[35+67*ramp,40]],'#6a8185',8);line(c,[[35,5],[35+67*ramp,38]],'#cbd2ba',4);}
  if(throttle>0){for(const side of mars?[-1,1]:[0]){
    const px=side*48,length=30+throttle*60+Math.sin(t*29)*4;
    const flame=c.createLinearGradient(0,20,0,length);flame.addColorStop(0,'#fff3d6da');flame.addColorStop(.4,'#9fcddd85');flame.addColorStop(1,'#9fcddd00');
    smoothShape(c,[[px-8,23],[px-6,length*.8],[px,length],[px+6,length*.8],[px+8,23]],flame);
  }}
  if(dust>0)for(let i=0;i<32;i++){const u=(t*.65+i*.137)%1,side=i%2?1:-1,dx=side*(18+u*145*dust),dy=47+u*7-u*(1-u)*12;c.globalAlpha=(1-u)*dust*.55;line(c,[[dx,dy],[dx+side*(4+u*15),dy+1]],mars?'#dbb389':'#c2c6b7',.5+u*2);}c.globalAlpha=1;
  c.restore();
}
export function surfaceDust(c,x,y,s,t,amount=0,mars=false){
  if(amount<=0)return;c.save();c.translate(x,y);c.scale(s,s);c.lineCap='round';
  for(let i=0;i<38;i++){const u=(t*.7+i*.113)%1,side=i%2?1:-1,dx=side*(10+u*150*amount),dy=-Math.sin(u*Math.PI)*(5+i%4*2)+u*3;
    c.globalAlpha=(1-u)*amount*.5;line(c,[[dx,dy],[dx+side*(4+u*17),dy+1]],mars?'#e1bd92':'#cad0c3',.5+u*1.7);
  }c.restore();
}
export function marsSky(c,w,h,t,{orbit=false}={}){
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,orbit?'#100f1b':'#796153');sky.addColorStop(.55,orbit?'#252237':'#b99b7d');sky.addColorStop(1,'#d5ad83');c.fillStyle=sky;c.fillRect(0,0,w,h);
  if(orbit){
    for(let i=0;i<100;i++)oval(c,(i*137.1)%w,(i*83.9)%h,.8,.8,'#e6e4d9a6');
    const sphere=c.createRadialGradient(w*.71,h*.30,1,w*.76,h*.36,h*.26);sphere.addColorStop(0,'#e6be92');sphere.addColorStop(.5,'#b67c59');sphere.addColorStop(1,'#5b3940');oval(c,w*.76,h*.36,h*.23,h*.23,sphere);
    c.save();c.beginPath();c.arc(w*.76,h*.36,h*.23,0,TAU);c.clip();for(let i=0;i<18;i++)oval(c,w*(.6+hash(i)*.3),h*(.15+hash(i*7)*.43),h*(.01+hash(i*9)*.04),h*.018,'#63493c55');oval(c,w*.75,h*.14,h*.055,h*.012,'#ece9dc');c.restore();
  }else{oval(c,w*.78,h*.28,12,12,'#fff0cb55');oval(c,w*.78,h*.28,7,7,'#ffe9c4');}
}
export function marsScenery(c,w,h,t,camera=0,unit=1,{orbit=false}={}){
  marsSky(c,w,h,t,{orbit});if(orbit)return;planetaryGround(c,w,h,camera,unit,'mars');
  // Distant drifting dust is subtle; reduced-motion callers pass t=0.
  c.save();c.globalAlpha=.08;for(let i=0;i<4;i++)oval(c,((i*351+t*3)%(w+240))-120,h*(.62+i*.03),130,7,'#f5d6a9');c.restore();
}
export function environmentVignette(c,w,h,t,destination,reduced=false){
  c.save();
  if(destination==='titan'){
    c.fillStyle='#d99c4b0b';c.fillRect(0,0,w,h);
    const haze=c.createRadialGradient(w*.48,h*.5,h*.12,w*.48,h*.5,Math.max(w,h)*.7);
    haze.addColorStop(0,'#bd803b00');haze.addColorStop(1,'#8e572d2c');c.fillStyle=haze;c.fillRect(0,0,w,h);
  }else if(destination==='moon'){
    c.beginPath();c.rect(0,h*.58,w,h*.42);c.clip();
    const bounce=c.createRadialGradient(w*.78,h*.45,0,w*.78,h*.45,h*.8);
    bounce.addColorStop(0,'#79a8d811');bounce.addColorStop(1,'#365c9300');c.fillStyle=bounce;c.fillRect(0,h*.58,w,h*.42);
  }else{
    const time=reduced?0:t;
    for(let i=0;i<42;i++){
      const depth=.35+(i%7)/8,x=((hash(i*13)*(w+100)+time*(7+depth*15))%(w+100))-50,y=(hash(i*19)*h+Math.sin(time*.23+i)*5);
      oval(c,x,y,.55+depth, .5+depth*.65,i%3?'#f5d5a42c':'#633f3024');
    }
    const tint=c.createLinearGradient(0,0,0,h);tint.addColorStop(0,'#bf7d4a09');tint.addColorStop(1,'#7b4a3500');c.fillStyle=tint;c.fillRect(0,0,w,h);
  }
  c.restore();
}
