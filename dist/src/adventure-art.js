import {hasScience} from './builder-model.js';
import {eyeState,drawEyes} from './pip-eyes.js';
import { planetaryGround, descentCraft } from './planet-art.js';
import { drawSpokedWheel } from './wheel-art.js';
// Original procedural 2D artwork. No raster generation, stock sprite packs, or remote assets.
const TAU=Math.PI*2;
export function ellipse(c,x,y,rx,ry,fill,stroke) { c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();} }
export function path(c,points,fill,stroke) {c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function box(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function star(c,x,y,size,fill='#ffe6a5'){c.save();c.translate(x,y);path(c,Array.from({length:10},(_,i)=>{let a=i*Math.PI/5-Math.PI/2,r=i%2?size*.44:size;return[Math.cos(a)*r,Math.sin(a)*r];}),fill);c.restore();}
export function glyph(c,kind,x,y,size,color='#f8e8b9') {
  c.save();c.translate(x,y);c.scale(size/40,size/40);c.lineWidth=3;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;
  if(kind==='drop'){c.beginPath();c.moveTo(0,-20);c.bezierCurveTo(28,10,17,23,0,23);c.bezierCurveTo(-17,23,-28,10,0,-20);c.fillStyle=color;c.fill();path(c,[[-7,7],[-6,12],[-2,15]],null,'#fff9d8');}
  if(kind==='thermometer'){box(c,-5,-23,10,34,5,null,color);ellipse(c,0,15,10,10,color);path(c,[[0,-12],[0,15]],null,color);for(let i=0;i<3;i++)path(c,[[10,-15+i*9],[17,-15+i*9]],null,color);}
  if(kind==='cloud'){ellipse(c,-10,0,14,11,color);ellipse(c,3,-8,16,15,color);ellipse(c,18,1,11,10,color);for(let i=0;i<3;i++)path(c,[[-12+i*14,18],[-16+i*14,26]],null,color);}
  if(kind==='wind'){for(let i=0;i<3;i++){c.beginPath();c.moveTo(-22,-12+i*12);c.lineTo(12+i%2*8,-12+i*12);c.quadraticCurveTo(30,-12+i*12,22,-20+i*12);c.stroke();}}
  if(kind==='camera'){box(c,-24,-14,48,33,6,color);box(c,-13,-22,17,10,3,color);ellipse(c,0,2,12,12,'#263f43');ellipse(c,0,2,7,7,'#9dd5cf');}
  if(kind==='radio'){path(c,[[0,25],[0,-2],[-15,-18]],null,color);c.beginPath();c.arc(-14,-16,20,-.5,.9);c.stroke();c.beginPath();c.arc(-14,-16,32,-.5,.9);c.stroke();ellipse(c,0,0,5,5,color);}
  if(kind==='power'){box(c,-18,-17,36,38,7,color);box(c,-7,-23,14,7,2,color);path(c,[[3,-11],[-8,4],[1,4],[-2,16],[10,0],[2,0]],'#263f43');}
  if(kind==='sample'){path(c,[[-22,19],[-12,-15],[9,-21],[23,12],[7,23]],color,'#6d7a75');path(c,[[-12,-15],[0,5],[23,12]],null,'#fff0c5');}
  if(kind==='seismic'){path(c,[[-25,15],[-18,15],[-13,-6],[-7,22],[0,-23],[7,17],[14,4],[20,15],[27,15]],null,color);}
  if(kind==='reflector'){for(let i=0;i<3;i++)for(let j=0;j<3;j++)box(c,-23+i*17,-23+j*17,13,13,2,null,color);}
  if(kind==='floats'){box(c,-27,-12,54,13,6,color);box(c,-27,10,54,13,6,color);path(c,[[-12,-4],[-12,12],[12,12],[12,-4]],null,color);}
  c.restore();
}
export function componentArt(c,kind,x,y,s=1,t=0) {
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;c.lineJoin='round';
  if(['scout','atlas','titan'].includes(kind)){
    rocket(c,0,6,.59,t,0,kind);
  }else if(kind==='ground_radar'){
    box(c,-28,16,56,15,4,'#b79860','#e5d6a2');path(c,[[0,16],[0,-12]],null,'#c1cbb2');
    c.save();c.rotate(-.2);ellipse(c,0,-11,35,9,'#e0d5af','#5b7b79');path(c,[[-34,-11],[-24,9],[0,18],[24,9],[34,-11]],'#78948e','#ded8b5');for(let i=-2;i<=2;i++)path(c,[[i*12,-15],[0,14]],null,'#b7cfbf');c.restore();
    for(let i=0;i<3;i++){const r=14+i*11;path(c,[[-r,39+i*4],[0,43+i*4],[r,39+i*4]],null,'#9ad4c34d');}
  }else if(kind==='magnetometer'){
    box(c,-22,10,35,17,4,'#bfa569','#e0d3a4');path(c,[[-6,10],[2,-13],[35,-21],[65,-31]],null,'#c4cfbc');path(c,[[2,-13],[27,-10],[35,-21]],null,'#728e86');
    for(const [x,y] of [[2,-13],[35,-21]])ellipse(c,x,y,3,3,'#d1ac6d','#eff0c5');
    box(c,57,-39,17,16,4,'#456c74','#c6dcce');ellipse(c,65,-31,13,6,null,'#a9c8bd');c.save();c.translate(65,-31);c.rotate(1.15);ellipse(c,0,0,13,6,null,'#e2c88b');c.restore();
  }else if(kind==='seismic'){
    box(c,-26,4,52,22,5,'#b59c60','#e4d5a1');ellipse(c,0,3,22,8,'#eadfbe','#6e8679');
    for(const side of [-1,1])path(c,[[side*20,20],[side*33,34]],null,'#a7b4a1');glyph(c,'seismic',0,-9,27,'#b7ddc5');
  }else if(kind==='hybrid'){
    componentArt(c,'rtg',-19,1,.8,t);componentArt(c,'battery',21,8,.64,t);
    path(c,[[-17,23],[-17,31],[25,31],[25,22]],null,'#cf9367');
  }else if(kind==='weather'){
    box(c,-17,24,34,7,2,'#c9b38b');box(c,-3,-29,6,53,2,'#c4d4d1');
    for(let i=0;i<5;i++)box(c,-14+i%2,3+i*3,28,2,1,'#fbedd2');
    for(let i=0;i<3;i++){const a=t*3+i*2.094,x=Math.cos(a)*26,y=Math.sin(a)*7-22;path(c,[[0,-22],[x,y]],null,'#e3c28c');ellipse(c,x,y,7,4,'#39545a','#c4ceba');}
  }else if(kind==='solar'){
    path(c,[[-57,0],[57,0]],null,'#d8c994');
    for(const side of [-1,1]){box(c,side<0?-64:14,-26,50,52,3,'#254e71','#d4c79b');for(let i=0;i<4;i++)for(let j=0;j<4;j++){box(c,(side<0?-61:17)+i*12,-23+j*12,10,10,1,(i+j)%2?'#397294':'#285d83');}path(c,[[side<0?-61:17,-23],[side<0?-14:64,23]],null,'#9cc3c333');}
    c.lineWidth=.55;for(const side of [-1,1])for(let i=1;i<12;i++){const x=(side===1?15:-63)+4*i;path(c,[[x,-23],[x,23]],null,'#cedcdf80');}
    box(c,-9,-15,18,30,3,'#e0c584','#f8e1a2');
  }else if(kind==='rtg'){
    const core=c.createLinearGradient(-17,0,17,0);core.addColorStop(0,'#392f2c');core.addColorStop(.5,'#ce8453');core.addColorStop(1,'#55473b');
    box(c,-17,-28,34,56,7,core,'#d3c29c');for(let i=0;i<7;i++)box(c,-27,-25+i*8,54,4,1,'#394447','#344b48');box(c,-8,-24,16,48,2,'#bf8054');box(c,-5,-21,4,42,1,'#ecc896');ellipse(c,0,-31,12,4,'#e4d4a7');
  }else if(kind==='battery'){
    box(c,-34,-24,68,48,7,'#324f48','#e2c990');for(let i=0;i<3;i++){box(c,-28+i*20,-19,16,37,5,'#b6c6a1');box(c,-24+i*20,-25,8,6,1,'#e2c990');box(c,-26+i*20,5,12,10,2,'#638d74');}path(c,[[-3,-12],[-11,2],[-2,2],[-5,12],[10,-4],[1,-4]],'#ffe5a3');
  }else if(['light','shield','heavy'].includes(kind)){
    const wide=kind==='heavy'?52:43;box(c,-wide,-24,wide*2,50,9,kind==='shield'?'#d3ac61':'#e9dfbc','#344e49');box(c,-wide-8,21,(wide+8)*2,15,7,kind==='heavy'?'#a8b5a0':'#597969','#263f43');box(c,-29,-14,58,20,5,'#294a52');for(let i=0;i<5;i++)path(c,[[-34+i*17,10],[-29+i*17,21]],null,kind==='shield'?'#f4d98a':'#b9bea2');
  }else if(['camera','sampler','lab'].includes(kind)){
    if(kind==='camera'){path(c,[[0,30],[0,-2]],null,'#b2c1ab');box(c,-28,-25,56,35,7,'#dfc88e','#2a4547');ellipse(c,9,-8,14,14,'#294f62','#e8ddb6');ellipse(c,9,-8,8,8,'#68a7b4');ellipse(c,5,-12,3,3,'#d5f0db');box(c,-21,-18,10,6,2,'#b77453');}
    if(kind==='sampler'){c.lineWidth=6;path(c,[[-32,22],[-12,-21],[21,-9],[31,23]],null,'#4a5857');c.lineWidth=2;path(c,[[-32,22],[-12,-21],[21,-9],[31,23]],null,'#dccb9b');for(const [a,b] of [[-32,22],[-12,-21],[21,-9]])ellipse(c,a,b,6,6,'#ce8b59','#364e49');path(c,[[18,20],[48,20],[42,35],[26,35]],'#cc8b5e','#f1d39c');}
    if(kind==='lab'){box(c,-35,-7,70,37,5,'#6d8b7c','#d5d9b0');for(let i=0;i<2;i++){box(c,-27+i*31,-31,23,51,5,'#c4d5c3','#304c4b');box(c,-24+i*31,-20,17,23,2,i?'#8caec4':'#d5ae69');box(c,-24+i*31,-35,17,7,2,'#d9c38c');}ellipse(c,24,22,3,3,'#e9d699');}
  }else if(kind==='whip'){
    box(c,-13,21,26,10,3,'#a5b9a1');path(c,[[0,23],[0,-33]],null,'#e7dbb4');ellipse(c,0,-33,4,4,'#cc8459');
  }else if(kind==='dish'||kind==='array'){
    if(kind==='array')for(const side of [-1,1]){box(c,side<0?-48:24,-9,24,35,3,'#638e8b','#e9d5a2');for(let i=0;i<3;i++)path(c,[[side<0?-45:27,i*9-3],[side<0?-27:45,i*9-3]],null,'#b9cbb0');}
    path(c,[[0,32],[0,4]],null,'#a9bba6');c.save();c.rotate(-.25+Math.sin(t)*.07);c.beginPath();c.ellipse(0,-11,28,21,0,0,Math.PI);c.fillStyle='#e9d4a2';c.fill();c.strokeStyle='#425c55';c.stroke();ellipse(c,0,-11,28,7,'#f6e5bd','#bfaa79');path(c,[[0,7],[0,-24]],null,'#557369');ellipse(c,0,-24,4,4,'#d58a5c');c.restore();
  }
  // Machined mounting feet, screws and status lights unify the equipment sprites.
  if(!['scout','atlas','titan','hybrid'].includes(kind)){
    for(const side of [-1,1]){box(c,side*14-5,28,10,4,1,'#a2ad91','#466257');ellipse(c,side*14,30,.8,.8,'#e9dcb2');}
    if(['rtg','battery','lab','camera','heavy','light','shield'].includes(kind)){
      for(const side of [-1,1])ellipse(c,side*21,19,1.2,1.2,'#e7d6a3','#4d6e63');
      box(c,-8,23,16,3,1,'#374e49');ellipse(c,5,24.5,1,1,'#b8e4c1');
    }
  }
  c.restore();
}
export function cloud(c,x,y,s=1,alpha=.6){
  c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=alpha;
  const shade=c.createLinearGradient(0,-45,0,25);shade.addColorStop(0,'#fff0ce');shade.addColorStop(1,'#bfb79e');
  c.beginPath();c.moveTo(-100,14);c.bezierCurveTo(-125,-4,-100,-29,-75,-21);c.bezierCurveTo(-74,-49,-30,-58,-12,-34);c.bezierCurveTo(9,-58,50,-38,51,-17);c.bezierCurveTo(85,-31,119,-2,98,17);c.bezierCurveTo(48,34,-65,32,-100,14);c.fillStyle=shade;c.fill();
  path(c,[[-87,10],[-50,15],[-18,11]],null,'#fff3d53d');c.restore();
}
export function launchCloud(c,x,y,s=1,alpha=.6){
  c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=alpha;
  const shade=c.createLinearGradient(0,-45,0,25);shade.addColorStop(0,'#fff0ce');shade.addColorStop(1,'#bfb79e');
  c.beginPath();c.moveTo(-100,14);c.bezierCurveTo(-125,-4,-100,-29,-75,-21);c.bezierCurveTo(-74,-49,-30,-58,-12,-34);c.bezierCurveTo(9,-58,50,-38,51,-17);c.bezierCurveTo(85,-31,119,-2,98,17);c.bezierCurveTo(48,34,-65,32,-100,14);c.fillStyle=shade;c.fill();
  c.save();c.clip();for(let i=0;i<5;i++){const glow=c.createRadialGradient(-68+i*33,-23-i%2*9,1,-68+i*33,-23-i%2*9,34);glow.addColorStop(0,'#fff6e63d');glow.addColorStop(1,'#fff6e600');ellipse(c,-68+i*33,-23-i%2*9,34,29,glow);}c.restore();
  path(c,[[-87,10],[-50,15],[-18,11]],null,'#fff3d53d');c.restore();
}
export function explorer(c,x,y,scale,t,{parts=['floats','power','radio'],loadout={power:'rtg',science:'camera',radio:'dish'},deploy=1,moving=0,sampling=0,chute=false,face=true,destination='titan',eyes=null,accent='#d6b364',wheelRotation=0}={}) {
  c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(Math.sin(t*2)*(destination==='titan'?.018:moving?.006:0));
  if(chute){c.strokeStyle='#f0ddba';c.lineWidth=2;for(const a of[-95,-45,0,45,95])path(c,[[a,-135],[0,-30]],null,'#f1dfb5');c.beginPath();c.moveTo(-102,-135);c.bezierCurveTo(-90,-235,90,-235,102,-135);c.quadraticCurveTo(75,-151,50,-135);c.quadraticCurveTo(25,-151,0,-135);c.quadraticCurveTo(-25,-151,-50,-135);c.quadraticCurveTo(-75,-151,-102,-135);c.fillStyle='#eeb66f';c.fill();path(c,[[-50,-135],[-42,-194],[0,-210],[42,-194],[50,-135]],null,'#f8e6bd');}
  c.lineWidth=3;ellipse(c,0,23,83,10,destination==='moon'?'#00030bd9':'#162d2c35');
  if(parts.includes('power')&&loadout.power==='solar'){c.save();c.scale(Math.max(.1,deploy),1);componentArt(c,'solar',0,-15,1.7,t);c.restore();}
  if(destination!=='titan'){
    path(c,[[-65,19],[-35,4],[35,4],[65,19]],null,'#a6a79a');
    box(c,-54,0,108,12,3,'#a68342','#d8c292');
    for(const xx of [-62,0,62]){const bounce=moving?Math.sin(wheelRotation*2+xx*.05)*1.1:0;path(c,[[xx,12],[xx,23+bounce]],null,'#a6ad98');const spring=[];for(let j=0;j<9;j++)spring.push([xx+9+(j%2?3:-3),7+j*(13+bounce)/8]);c.lineWidth=1.1;path(c,spring,null,'#d7cba4');drawSpokedWheel(c,xx,23+bounce,18,wheelRotation);}
    box(c,-39,-49,78,53,7,'#b28d48','#edd59b');for(let i=0;i<8;i++)path(c,[[-37+i*10,-47],[-33+i*10,-12]],null,i%2?'#f8dc8c':'#7e632e');
  }else if(parts.includes('floats')){const extra=0;box(c,-76-extra,8,152+extra*2,26+extra*.5,13,'#263f43','#142a30');box(c,-70-extra,7,140+extra*2,13,8,'#dbb96e');box(c,-65-extra,20,130+extra*2,11,5,'#e8ddba');box(c,-41,5,9,29,3,'#ce6950');box(c,34,5,9,29,3,'#ce6950');}
  path(c,[[-42,13],[-37,-15],[37,-15],[45,13]],'#465451','#25393e');
  box(c,-42,-54,84,62,14,'#e9dfbc','#283d3c');box(c,-35,-48,70,45,11,'#f7ebc9');box(c,-28,-39,56,25,9,'#24444b');
  // Bevels, recessed face glass, service hatch and brushed metal seams.
  path(c,[[-32,-45],[-24,-48],[29,-48]],null,'#fff6d9');
  box(c,-25,-37,50,5,3,'#7eb9b51c');path(c,[[-22,-36],[-8,-36],[-20,-24]],'#b6e6d515');
  box(c,-22,-11,13,12,2,'#d7cba4','#9eaa8c');path(c,[[-19,-7],[-12,-7]],null,'#768e7c');
  for(let i=0;i<4;i++)box(c,12+i*4,-10,2,7,1,'#a6b59a');
  if(face)drawEyes(c,eyes||eyeState({time:t,moving,science:!!sampling}));
  for(const side of [-1,1]){
    const edge=side<0?-44:33;box(c,edge,-48,11,56,2,'#b39050');
    for(let i=0;i<7;i++){path(c,[[edge,-44+i*7],[edge+8,-48+i*7],[edge+10,-39+i*7]],i%2?'#ebd287':'#c6aa65');}
    path(c,[[side*66,24],[side*47,25],[side*22,24]],null,'#81ac9e');
  }
  box(c,-10,-7,20,5,2,accent);for(let i=0;i<3;i++)ellipse(c,26+i*5,-5,1.2,1.2,'#8e967e');
  for(const side of [-1,1]){box(c,side<0?-40:34,-49,6,53,2,accent,'#eee4c988');for(let i=0;i<8;i++)path(c,[[side<0?-40:34,-46+i*6],[side<0?-35:39,-42+i*6]],null,'#fff3ce44');}
  for(const xx of [-30,30])for(const yy of [-44,1])ellipse(c,xx,yy,1.6,1.6,'#738779');
  if(parts.includes('power')&&loadout.power!=='solar'){path(c,[[-40,-14],[-59,-14],[-59,0]],null,'#bb9e6b');componentArt(c,loadout.power,-65-(1-deploy)*45,-20,.67,t);}
  if(parts.includes('radio'))componentArt(c,loadout.radio,27,-80,.82,t);
  if(hasScience(loadout,'camera')){path(c,[[-18,-54],[-18,-80]],null,'#a7b7a2');componentArt(c,'camera',-18,-82,.58,t);}
  if(hasScience(loadout,'weather'))componentArt(c,'weather',68,-81,.62,t);
  if(hasScience(loadout,'lab'))componentArt(c,'lab',64,-23,.7,t);
  if(hasScience(loadout,'seismic'))componentArt(c,'seismic',-43,-60,.48,t);
  const shake=eyes?.jitter||0;
  path(c,[[-22,-54],[-25+shake,-79+Math.sin(t*3)*3]],null,'#45534a');ellipse(c,-25+shake,-79+Math.sin(t*3)*3,4,4,'#ef9966');
  if(hasScience(loadout,'ground_radar'))componentArt(c,'ground_radar',-86,-68,.6,t);
  if(hasScience(loadout,'magnetometer'))componentArt(c,'magnetometer',67,-51,.68,t);
  const arm=sampling?Math.sin(Math.min(sampling,1)*Math.PI/2):0;
  if(hasScience(loadout,'sampler')||sampling){c.lineWidth=7;path(c,[[40,-21],[61,-12+arm*25],[75,3+arm*28]],null,'#344c49');c.lineWidth=3;path(c,[[40,-21],[61,-12+arm*25],[75,3+arm*28]],null,'#e0c994');ellipse(c,61,-12+arm*25,6,6,'#ddb775','#344c49');box(c,67,0+arm*28,20,13,5,'#d7c799','#344c49');}
  if(moving&&destination==='titan'){ellipse(c,-76,25,12,5,'#8fc6b04d');for(let i=0;i<3;i++)path(c,[[-90-i*14,22+Math.sin(t*7+i)*4],[-100-i*14,22+Math.sin(t*7+i)*4]],null,'#d0ddbd88');}
  for(const side of [-1,1]){
    ellipse(c,side*64,17,4,4,'#476b63','#c8d4b2');ellipse(c,side*64,17,1.5,1.5,'#a4cbb5');
    box(c,side*56-5,9,10,3,1,'#f3e1a5');
  }
  c.restore();
}
export function rocket(c,x,y,s,t,thrust=0,variant='atlas',launchDetail=false,accent='#d6b364'){
  const heavy=variant==='titan', scout=variant==='scout';
  const cores=scout?[]:[-37,37];
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.5;c.lineJoin='round';
  c.scale(scout?.74:heavy?1.1:1,1);
  // Selected trim is applied after the fuselage below.
  if(thrust){
    const length=60+thrust*85+Math.sin(t*11)*4;
    for(let i=0;i<55;i++){const u=(t*(.7+(i%9)*.06)+i*.137)%1,spread=8+u*34;c.globalAlpha=(1-u)*thrust*.65;ellipse(c,Math.sin(i*83.1)*spread,82+u*(100+thrust*90),1+u*5,3+u*6,u<.2?'#fff8dc':u<.6?'#ffc66c':'#b6533f');}c.globalAlpha=1;
    const glow=c.createRadialGradient(0,100,3,0,100,90);glow.addColorStop(0,'#ffc66b70');glow.addColorStop(1,'#ffb85300');ellipse(c,0,105,80,95,glow);
    for(const [cx,sz] of [...cores.map(x=>[x,.55]),[0,1]]){c.save();c.translate(cx,80);c.scale(sz,sz);path(c,[[-14,0],[-20,29],[-10,length*.65],[0,length],[12,length*.6],[19,25],[14,0]],'#c9683c');path(c,[[-11,0],[-12,30],[0,length*.85],[12,30],[11,0]],'#ffd187');path(c,[[-7,0],[0,length*.55],[7,0]],'#fff4cc');for(let i=0;i<4;i++){const y=12+i*length*.17;path(c,[[0,y-8],[-5,y],[0,y+10],[5,y]],'#fff8c798');}c.restore();}
  }
  for(const bx of cores){
    const side=Math.sign(bx);
    const metal=c.createLinearGradient(bx-11,0,bx+11,0);metal.addColorStop(0,'#9baaa1');metal.addColorStop(.35,'#f3ead1');metal.addColorStop(1,'#a5b3a8');
    box(c,bx-11,-17,22,92,7,metal,'#294548');path(c,[[bx-11,-13],[bx,-40],[bx+11,-13]],'#c87b5b','#334e4c');
    box(c,bx-12,45,24,7,2,'#38635f');path(c,[[bx-7,75],[bx-10,83],[bx+10,83],[bx+7,75]],'#425957','#263c3f');
    for(const yy of [4,34,64])path(c,[[bx-9,yy],[bx+9,yy]],null,'#6e83756b');
    path(c,[[side*43,35],[side*62,73],[side*45,66]],'#be7054','#304947');
    box(c,side<0?-31:22,12,9,7,1,'#bcae87');
  }
  const hull=c.createLinearGradient(-25,0,25,0);hull.addColorStop(0,'#a9b6a8');hull.addColorStop(.24,'#eee8cd');hull.addColorStop(.52,'#fff2d5');hull.addColorStop(1,'#b8c1b1');
  box(c,-24,-63,48,133,12,hull,'#2e4949');
  const nose=c.createLinearGradient(-23,-80,23,-80);nose.addColorStop(0,'#a95543');nose.addColorStop(.4,'#e29a72');nose.addColorStop(1,'#b96c51');
  c.beginPath();c.moveTo(-24,-58);c.bezierCurveTo(-25,-87,-10,-107,0,-118);c.bezierCurveTo(10,-107,25,-87,24,-58);c.closePath();c.fillStyle=nose;c.fill();c.stroke();
  path(c,[[0,-116],[0,-60]],null,'#967c67');box(c,16,-52,3.6,111,1,'#99aaa4','#697975');
  if(heavy){for(const side of [-1,1]){box(c,side*22-8,-38,16,15,1,'#50605a');for(let i=0;i<4;i++)path(c,[[side*22-7+i*4,-38],[side*22-7+i*4,-24]],null,'#bbbd9c');}}
  if(scout){for(const side of [-1,1])path(c,[[side*24,43],[side*36,70],[side*24,68]],'#b66e49','#33484a');}
  path(c,[[-13,-69],[-8,-90],[0,-104]],null,'#f4c59a91');
  for(const yy of [-56,-44,22,53]){path(c,[[-23,yy],[23,yy]],null,'#70867a');for(const xx of [-17,-7,7,17])ellipse(c,xx,yy+4,.9,.9,'#6a8179');}
  box(c,-24,28,48,13,1,'#ede3c9');for(let i=0;i<3;i++)box(c,-23+i*16,28,8,13,1,'#303e40');
  ellipse(c,0,-23,15,15,'#e4ce99','#597970');ellipse(c,0,-23,11,11,'#234c60');ellipse(c,-3,-26,6,6,'#5d9eac');ellipse(c,-6,-29,2,2,'#d8efda');
  box(c,-8,1,16,10,2,'#ce7b56');path(c,[[-5,6],[5,6]],null,'#ffe5b4');
  // Access panels, oxidized copper feed lines and reflective inspection marks.
  for(const side of [-1,1]){
    box(c,side<0?-20:9,-9,11,23,2,null,'#9caa91');
    for(const yy of [-6,10])ellipse(c,side<0?-17:17,yy,.8,.8,'#6f887b');
    path(c,[[side*20,-40],[side*20,-2],[side*18,4],[side*18,22]],null,'#b9946d');
    box(c,side<0?-21:17,-38,4,10,1,'#fff4d58a');
  }
  path(c,[[-19,-51],[-19,-31]],null,'#fff8e1a1');
  c.fillStyle='#365b56';c.font='bold 5px sans-serif';c.textAlign='center';c.fillText('P I P  ·  0 1',0,19);
  box(c,-22,62,44,10,2,'#65796b','#314b45');for(let i=0;i<9;i++)path(c,[[-18+i*4,63],[-18+i*4,70]],null,'#d2c8a0');
  for(const side of [-1,1])path(c,[[side*20,69],[side*13,81]],null,'#c29a72');
  path(c,[[-12,72],[-18,84],[18,84],[12,72 ]],'#985e42','#20383c');ellipse(c,0,83,17,4,thrust?'#ffdc97':'#172f35','#a99b7a');
  if(launchDetail){
  c.lineWidth=.8;for(let i=0;i<12;i++){const xx=-19+i*3.4;path(c,[[xx,43],[xx,59]],null,i%2?'#fff1c582':'#607b724d');}
  for(const side of [-1,1]){
    path(c,[[side*16,-44],[side*16,-32],[side*20,-30]],null,'#e3d1a1');
    box(c,side<0?-20:12,45,8,11,1,'#b4beaa','#526c62');
    for(const yy of [47,54])ellipse(c,side<0?-16:16,yy,.7,.7,'#475e59');
    path(c,[[side*11,73],[side*16,81]],null,'#d9bf8e');
  }
  ellipse(c,0,83,12,2.4,null,thrust?'#ffeda6':'#7f9790');
  }
  box(c,-17,20,34,8,2,accent,'#fff2c0');for(let i=0;i<5;i++)ellipse(c,-12+i*6,24,1,1,'#f4eed2');
  c.restore();
}
export function saturn(c,x,y,r){
  c.save();c.translate(x,y);c.rotate(-.38);
  function rings(start,end){
    for(let i=0;i<19;i++){
      if(i===12||i===13)continue;
      const radius=r*(1.22+i*.042);c.lineWidth=r*.044;
      c.strokeStyle=['#d1bb94','#b7a489','#d7c8a7','#998b79'][i%4];
      c.beginPath();c.ellipse(0,0,radius,radius*.24,0,start,end);c.stroke();
    }
  }
  rings(Math.PI,TAU);c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
  const planet=c.createLinearGradient(-r,-r,r,r);planet.addColorStop(0,'#f9e0a9');planet.addColorStop(.56,'#c7a775');planet.addColorStop(1,'#544b4c');
  c.fillStyle=planet;c.fillRect(-r,-r,r*2,r*2);
  for(let i=0;i<22;i++){const y=-r+i*r*.093;ellipse(c,0,y,r*1.2,r*.043,i%3?'#98785832':'#fff0cb45');}
  c.lineWidth=r*.14;c.beginPath();c.ellipse(0,r*.09,r*1.7,r*.39,0,0,Math.PI);c.strokeStyle='#4c413b57';c.stroke();
  const dusk=c.createRadialGradient(-r*.37,-r*.32,.08*r,-r*.34,-r*.26,1.35*r);
  dusk.addColorStop(0,'#fff4ca14');dusk.addColorStop(.57,'#231e2c08');dusk.addColorStop(1,'#302b3b9c');
  c.fillStyle=dusk;c.fillRect(-r,-r,2*r,2*r);c.restore();rings(0,Math.PI);c.restore();
}
export function landscape(c,w,h,t,camera=0,{rain=false,still=false}={}){
  const sky=c.createLinearGradient(0,0,0,h*.65);sky.addColorStop(0,'#3b2d1f');sky.addColorStop(.5,'#d89b52');sky.addColorStop(1,'#f2ce8a');c.fillStyle=sky;c.fillRect(0,0,w,h);
  ellipse(c,w*.72-camera*.03,h*.21,24,24,'#fff0b83b');ellipse(c,w*.72-camera*.03,h*.21,13,13,'#ffedbd8c');
  const saturnGlow=c.createRadialGradient(w*.86,h*.17,5,w*.86,h*.17,85);saturnGlow.addColorStop(0,'#ffe2ac22');saturnGlow.addColorStop(1,'#e9ca9900');ellipse(c,w*.86,h*.17,85,85,saturnGlow);c.save();c.globalAlpha=.13;saturn(c,w*.86,h*.17,29);c.restore();
  for(let i=0;i<8;i++){let x=((i*257-camera*.06+(still?0:t*2))%(w+400)+w+400)%(w+400)-200;ellipse(c,x,h*(.16+i%3*.1),120+i%3*40,10,'#f4dba51c');if(i%2===0)cloud(c,x,h*(.14+i%3*.09),.55+i%3*.14,.13);}
  const mountains=(base,height,color,shift)=>{const pts=[[-20,h]];for(let x=-20;x<=w+25;x+=25){const a=x+camera*shift;pts.push([x,base-(Math.sin(a*.007)+Math.sin(a*.017)*.45+Math.cos(a*.031)*.14)*height]);}pts.push([w+25,h]);path(c,pts,color);};
  mountains(h*.45,h*.065,'#ad8b64',.12);mountains(h*.51,h*.08,'#927953',.23);mountains(h*.57,h*.04,'#6e6650',.4);
  const lake=c.createLinearGradient(0,h*.57,0,h);lake.addColorStop(0,'#737d65');lake.addColorStop(.3,'#435c50');lake.addColorStop(1,'#203f3e');c.fillStyle=lake;c.fillRect(0,h*.575,w,h*.425);
  // Broken, curved wave crests live only on Titan's liquid surface.
  for(let i=0;i<65;i++){const depth=i/65,x=((i*173-camera*.6+(still?0:t*9))%(w+180)+w+180)%(w+180)-90,y=h*(.59+.38*depth);c.beginPath();c.moveTo(x-30*depth,y);c.quadraticCurveTo(x,y-3-depth*3,x+35*depth,y);c.strokeStyle=i%3?'#b5d3ad16':'#e1d29c55';c.lineWidth=.5+depth;c.stroke();}
  c.lineWidth=1;for(let i=0;i<70;i++){const y=h*.59+(i/70)**1.5*h*.42;const x=((i*157-camera*.6+(still?0:t*(i%3+1)*4))%(w+150)+w+150)%(w+150)-80;path(c,[[x,y],[x+16+i%5*13,y]],null,i%3===0?'#dbcd9166':'#9bb79824');}
  // Broken amber reflections follow the rippled surface towards the observer.
  for(let i=0;i<42;i++){
    const depth=i/42,y=h*(.582+.39*depth),spread=(.015+.11*depth)*w;
    const x=w*.72+Math.sin(i*47.3)*spread+Math.sin(t+i)*4;
    c.lineWidth=.7+depth;path(c,[[x-7-depth*14,y],[x,y-1.2],[x+10+depth*17,y]],null,i%3?'#dcb87c33':'#edd09e55');
  }
  // Irregular foreground islands made of ice and organic sediment, without Earth vegetation.
  for(let i=0;i<7;i++){const x=i*460-camera*.9-80;if(x < -250 || x>w+200)continue;path(c,[[x-130,h],[x-100,h*.96],[x-20,h*.93],[x+32,h*.94],[x+73,h*.985],[x+180,h]],'#363e32');for(let j=0;j<9;j++){let rx=x+j*22-65,ry=h*.98+Math.sin(j*7)*h*.014;ellipse(c,rx,ry,8+j%3*5,5+j%4*2,j%2?'#77765b':'#9b9170');}}
  // Faceted water-ice boulders and sediment shelves add scale to the shoreline.
  for(let i=0;i<16;i++){
    const x=((i*239-camera*.82)%(w+350)+w+350)%(w+350)-175,y=h*(.94+i%4*.017),r=8+i%4*7;
    path(c,[[x-r,y],[x-r*.65,y-r*.7],[x+r*.05,y-r],[x+r*.8,y-r*.55],[x+r,y],[x+r*.25,y+r*.17]],i%2?'#8e9175':'#aca889','#536656');
    path(c,[[x-r*.65,y-r*.7],[x+r*.05,y-r],[x-r*.08,y-r*.15],[x-r,y]],'#c6c09a70');
    path(c,[[x+r*.05,y-r],[x+r*.25,y+r*.17]],null,'#56675460');
  }
  if(rain){c.lineWidth=1.5;for(let i=0;i<45;i++){const x=(i*79+(still?0:t*40))%w,y=(i*47+(still?0:t*220))%h;path(c,[[x,y],[x-5,y+14]],null,'#f2e0af35');if(i%5===0)ellipse(c,x,h*(.67+(i%8)*.035),5+Math.sin(t*3+i)*2,1.5,null,'#d2dfb73b');}}
}

export function earth(c,x,y,r){
  c.save();c.translate(x,y);ellipse(c,0,0,r+1,r+1,'#9ed5ed');c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
  const ocean=c.createRadialGradient(-r*.4,-r*.5,1,0,0,r*1.4);ocean.addColorStop(0,'#6bb3d2');ocean.addColorStop(.65,'#2869a0');ocean.addColorStop(1,'#112c50');c.fillStyle=ocean;c.fillRect(-r,-r,r*2,r*2);
  path(c,[[-r*.8,-r*.5],[-r*.3,-r*.76],[r*.1,-r*.4],[-r*.1,-r*.05],[r*.34,r*.2],[r*.1,r*.68],[-r*.24,r*.85],[-r*.46,r*.2],[-r*.7,0]],'#93ac8b');
  path(c,[[r*.3,-r*.85],[r*.8,-r*.65],[r*.72,-r*.1],[r*.4,0],[r*.12,-r*.25]],'#b4bb92');
  c.lineWidth=r*.09;for(let i=0;i<6;i++){c.beginPath();c.ellipse(Math.sin(i*4)*r*.4,-r*.7+i*r*.27,r*.68,r*.09,-.3,0,Math.PI*1.3);c.strokeStyle='#f5ffffa8';c.stroke();}
  const night=c.createLinearGradient(-r,0,r,0);night.addColorStop(0,'#02081400');night.addColorStop(.5,'#02081408');night.addColorStop(1,'#020814e8');c.fillStyle=night;c.fillRect(-r,-r,r*2,r*2);c.restore();
}
export function lunarLandscape(c,w,h,t,camera=0,{orbit=false,unit=1}={}){
  c.fillStyle='#050911';c.fillRect(0,0,w,h);
  for(let i=0;i<120;i++)ellipse(c,(i*137.71)%w,(i*83.13)%(h*.58),i%13===0?1.3:.65,i%13===0?1.3:.65,i%3?'#dce5ee80':'#fff7ddbb');
  earth(c,w*.78-camera*.012,h*(orbit?.27:.43),Math.min(w,h)*(orbit?.09:.045));
  if(orbit){
    ellipse(c,w*.65,h*1.24,w*.86,h*.7,'#8a8d8d','#d7d7c8');
    for(let i=0;i<22;i++)ellipse(c,(i*159)%w,h*(.72+(i%6)*.06),12+i%5*14,4+i%5*4,'#424950','#b1b3ac');return;
  }
  planetaryGround(c,w,h,camera,unit,'moon');
}

export function lunarStation(c,id,x,y,s,t,done){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;
  path(c,[[-20,12],[72,32],[50,35],[-25,18]],'#111c2b88');
  path(c,[[-22,18],[-12,-1],[12,-1],[25,18]],null,'#b3b7b1');
  box(c,-24,-18,48,25,4,'#b59b5f','#f1d7a1');
  if(id==='quakes'){componentArt(c,'seismic',0,-20,.8,t);}
  else if(id==='reflector'){c.save();c.rotate(-.2);box(c,-30,-43,60,34,2,'#7e8c94','#dbcc9e');glyph(c,'reflector',0,-26,28,'#cdeafa');c.restore();}
  else if(id==='ice'){box(c,-13,-40,26,29,4,'#759fae','#d7e5e8');glyph(c,'drop',0,-27,13,'#d5f0f2');}
  else if(id==='earth')componentArt(c,'camera',0,-30,.8,t);
  else if(id==='lab')componentArt(c,'lab',0,-27,.72,t);
  else if(id==='air')componentArt(c,'weather',0,-28,.7,t);
  else{path(c,[[-12,-20],[-18,-35],[-2,-48],[12,-32],[10,-20]],'#bcc0b5','#69757b');}
  ellipse(c,19,-9,2,2,done?'#b8e3bd':'#ffe0a3');c.restore();
}
export function lunarLander(c,x,y,s,t,throttle=0,dust=0,options={}){
  descentCraft(c,x,y,s,t,{throttle,dust,...options});
  if(options.accent){c.save();c.translate(x,y);c.scale(s,s);box(c,-26,-10,52,6,2,options.accent,'#f4e3aa');c.restore();}
}
