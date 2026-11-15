import { box, ellipse, path, launchCloud as cloud, componentArt } from './adventure-art.js';

// Original vector sprites, drawn in local coordinates so they stay crisp at any size.
function sign(c,label,x,y,w=72){
  box(c,x-w/2,y-10,w,20,3,'#203c40','#9eaf9a');
  c.fillStyle='#f5dfab';c.font='600 9px sans-serif';c.textAlign='center';c.fillText(label,x,y+3);
}
function beacon(c,x,y,t){
  ellipse(c,x,y,7,7,'#efbe6540');ellipse(c,x,y,2.5,2.5,Math.sin(t*3)>0?'#ffdb8e':'#b86748');
}
function wheel(c,x,y){ellipse(c,x,y,8,8,'#20383b');ellipse(c,x,y,4,4,'#a9b3a1');ellipse(c,x,y,1.5,1.5,'#465d59');}
export function supportTruck(c,x,y,s=1,t=0){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.3;
  ellipse(c,0,13,45,6,'#1a35343b');
  box(c,-43,-13,53,24,4,'#c3b47d','#3d5651');box(c,10,-23,26,34,4,'#debd7b','#3d5651');
  box(c,15,-19,17,12,2,'#315a66');path(c,[[16,-18],[30,-18],[16,-8]],'#7ba4a4');
  box(c,-38,-9,43,13,3,'#4b756b');path(c,[[-38,-3],[5,-3]],null,'#b9d1b0');
  box(c,-45,5,85,6,2,'#657a6b');box(c,34,-2,5,5,1,'#ffe6a5');
  wheel(c,-26,12);wheel(c,23,12);beacon(c,23,-26,t);c.restore();
}
function controlBuilding(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.2;
  box(c,-82,-55,164,55,3,'#aab49a','#4b675d');path(c,[[-88,-55],[-70,-68],[72,-68],[88,-55]],'#d6cfab','#567063');
  box(c,-73,-45,146,22,2,'#2b5058');
  for(let i=0;i<8;i++){box(c,-69+i*18,-42,13,15,1,i%3?'#8ea99a':'#dec585');path(c,[[-68+i*18,-41],[-59+i*18,-41],[-68+i*18,-33]],'#dbdfbf70');}
  box(c,49,-19,19,19,1,'#506b60');ellipse(c,64,-9,1,1,'#ead9a7');
  sign(c,'MISSION CONTROL',-15,-11,102);
  path(c,[[21,-68],[21,-92]],null,'#738d7c');componentArt(c,'dish',21,-92,.42,t);
  path(c,[[-60,-68],[-60,-100]],null,'#809886');beacon(c,-60,-100,t);c.restore();
}
function assemblyBuilding(c,x,y,s){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1;
  path(c,[[-62,0],[-62,-100],[-45,-115],[51,-115],[67,-99],[67,0]],'#9cae9f','#5b786c');
  path(c,[[51,-115],[67,-99],[67,0],[51,-9]],'#6a877d');
  box(c,-45,-96,77,96,1,'#506e69','#d1d0b1');
  for(let i=0;i<9;i++)path(c,[[-44,-89+i*10],[31,-89+i*10]],null,'#8b9d89');
  path(c,[[-7,-95],[-7,0]],null,'#d6d1ad');
  for(let i=0;i<5;i++)box(c,-48+i*20,-108,13,6,1,'#c8dbc2');
  box(c,38,-32,9,23,1,'#3b5955');box(c,-60,-58,13,5,1,'#e5d5a5');
  sign(c,'ASSEMBLY',-6,-78,63);c.restore();
}
function waterTower(c,x,y,s){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;
  for(const side of [-1,1])path(c,[[side*21,0],[side*13,-75]],null,'#8a9f91');
  for(let i=0;i<3;i++)path(c,[[-18+i*2,-10-i*20],[16-i*2,-30-i*20],[-16+i*2,-30-i*20],[18-i*2,-10-i*20]],null,'#afba9e');
  box(c,-26,-110,52,45,13,'#c9ceba','#728c7e');ellipse(c,0,-105,24,6,'#e2dfc3');
  box(c,-25,-88,50,8,1,'#638a80');path(c,[[20,-65],[20,-6],[30,-6]],null,'#c0b68b');
  path(c,[[-4,-110],[-4,-121],[9,-121]],null,'#95aa96');c.restore();
}
function floodlight(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;
  const cone=c.createLinearGradient(0,-124,0,15);cone.addColorStop(0,'#fff4c21f');cone.addColorStop(1,'#fff4c200');
  path(c,[[-17,-123],[17,-123],[90,15],[-90,15]],cone);
  box(c,-6,-5,12,5,1,'#738c77');path(c,[[0,-5],[0,-125]],null,'#b0bea7');
  path(c,[[-19,-124],[19,-124]],null,'#728e80');
  for(const xx of [-15,-5,5,15]){box(c,xx-4,-130,8,10,1,'#394f4d','#c9cba6');box(c,xx-2,-128,4,6,1,'#fff0bc');}
  beacon(c,0,-134,t);c.restore();
}
function container(c,x,y,s,color='#9eac8b'){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1;
  box(c,-25,-21,50,22,1,color,'#4a6b5d');
  for(let i=0;i<10;i++)path(c,[[-22+i*5,-19],[-22+i*5,-1]],null,'#3b5c4b55');
  path(c,[[-25,-21],[-17,-26],[32,-26],[25,-21]],'#c3c6a2');path(c,[[25,-21],[32,-26],[32,-5],[25,1]],'#4e7160');
  box(c,-19,-15,9,6,1,'#e7d7a7');c.restore();
}
function technician(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;
  path(c,[[-3,-10],[-5,0],[-9,0]],null,'#263b42');path(c,[[3,-10],[4,0],[8,0]],null,'#263b42');
  box(c,-6,-24,12,16,3,'#ddae55','#485b50');path(c,[[-5,-21],[0,-13],[5,-21]],null,'#e5e6ac');
  ellipse(c,0,-30,5,6,'#cba77e','#3c5150');box(c,-6,-35,12,5,2,'#e4d5a5');box(c,-4,-30,8,4,1,'#3a5a63');
  path(c,[[-6,-21],[-10,-13]],null,'#b0b894');path(c,[[6,-21],[9,-21+Math.sin(t)*2]],null,'#c2ba90');box(c,8,-25,7,10,1,'#6b8e89','#e1d6a9');c.restore();
}
function serviceCrane(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;
  box(c,-28,-14,56,14,2,'#616f60','#bdb78d');for(const xx of [-22,22]){box(c,xx-6,-2,12,5,1,'#304a46');}
  box(c,-12,-33,24,20,3,'#b39763','#dac48b');box(c,-8,-29,16,10,1,'#2c5359');
  path(c,[[0,-32],[15,-151],[76,-124],[17,-138],[2,-31]],'#9fa686','#445d54');
  for(let i=0;i<7;i++)path(c,[[2+i*2,-47-i*14],[15+i*.3,-54-i*13]],null,'#576f5e');
  path(c,[[15,-151],[76,-124],[76,-63]],null,'#c7c5a0');
  path(c,[[76,-63],[73,-55],[78,-52],[82,-57]],null,'#e5c176');beacon(c,15,-154,t);c.restore();
}
function industrialPlant(c,half,t){
  c.save();c.lineWidth=1;
  // Tall service hangars make the campus read as a place, not a row of icons.
  const x=-half*.62,y=-72;
  box(c,x-62,y-75,124,75,2,'#788c80','#b5bea2');path(c,[[x-68,y-75],[x-43,y-97],[x+43,y-97],[x+68,y-75]],'#b8bca0','#577263');
  for(let i=0;i<13;i++)path(c,[[x-58+i*9,y-73],[x-58+i*9,y-5]],null,'#bdc2a03b');
  for(let i=0;i<3;i++){box(c,x-53+i*37,y-49,31,49,1,'#354e4e','#aab699');for(let j=0;j<7;j++)path(c,[[x-51+i*37,y-46+j*6],[x-24+i*37,y-46+j*6]],null,'#6e897a');}
  sign(c,'FLIGHT OPERATIONS',x,y-65,102);
  // Layered pipe bridge, compressors, cable trays and a rotating ground antenna.
  for(let j=0;j<3;j++){
    path(c,[[half*.41,-20],[half*.41,-103-j*5],[half*.82,-103-j*5],[half*.82,-24]],null,j%2?'#c4c5a5':'#758b7e');
  }
  for(const xx of [half*.43,half*.63,half*.8]){path(c,[[xx,-111],[xx,-25]],null,'#526f64');for(let i=0;i<4;i++)path(c,[[xx-4,-104+i*20],[xx+4,-90+i*20]],null,'#819581');}
  box(c,half*.50-22,-62,44,39,3,'#aab89e','#5e7e6a');for(let i=0;i<6;i++)box(c,half*.50-17+i*6,-56,3,26,0,'#41645e');
  for(let i=0;i<2;i++){box(c,half*.73-14+i*28,-57,23,33,11,'#d0ceaf','#718a75');box(c,half*.73-14+i*28,-43,23,5,1,'#688c7c');}
  c.save();c.translate(-half*.35,-82);c.rotate(-.15+Math.sin(t*.3)*.12);
  path(c,[[-31,-29],[0,-8],[31,-29],[0,-21]],'#e1d8b6','#657e70');
  for(let i=-2;i<=2;i++)path(c,[[i*13,-27],[0,-9]],null,'#a4ae92');path(c,[[0,-9],[0,-47]],null,'#859e86');ellipse(c,0,-47,3,3,'#d2a364');c.restore();
  path(c,[[-half*.35,-90],[-half*.35,-58]],null,'#a9b89d');
  serviceCrane(c,-half*.32,-28,.65,t);
  // Pad status board and fenced observation point, well outside the flame trench.
  const board=half*.26;path(c,[[board,-27],[board,-83]],null,'#8da587');box(c,board-25,-88,50,24,2,'#1d3f43','#b8c4a1');
  for(let i=0;i<3;i++){ellipse(c,board-17,-81+i*6,1.5,1.5,i===2&&Math.sin(t*2)>0?'#d9ba6c':'#9bd5b0');path(c,[[board-11,-81+i*6],[board+18,-81+i*6]],null,'#7cae94');}
  technician(c,-half*.43,-25,.7,t);technician(c,-half*.43+15,-26,.63,t+1);
  c.restore();
}
function campus(c,w,ground,s,t,ignition){
  c.save();c.translate(w*.5,ground);c.scale(s,s);c.lineWidth=1;
  // Coastal dunes, sea wall and a service campus behind the launch pad.
  const half=w/(2*s);
  path(c,[[-half,-77],[-half,-145],[-half*.7,-158],[-half*.3,-139],[0,-149],[half*.4,-129],[half*.75,-162],[half,-148],[half,-77]],'#8b9b7b');
  path(c,[[-half,-76],[half,-76]],null,'#bdc6a0');
  const apron=c.createLinearGradient(0,-76,0,130);apron.addColorStop(0,'#7c8e77');apron.addColorStop(.5,'#889480');apron.addColorStop(1,'#627966');
  path(c,[[-half,-66],[-half*.75,-79],[half*.8,-79],[half,-55],[half,150],[-half,150]],apron);
  // Concrete expansion joints and softly varied ground patches.
  for(let i=0;i<45;i++){
    const x=((i*131)%Math.max(1,half*2))-half,y=-65+(i*43)%204;
    box(c,x,y,15+i%5*9,2+i%3*2,2,i%2?'#b2b39712':'#334f4310');
  }
  path(c,[[-half,-29],[half,-29],[half,-13],[-half,-13]],'#536e60');
  c.setLineDash([10,12]);path(c,[[-half,-21],[half,-21]],null,'#d4c79a80');c.setLineDash([]);
  // Side roads branch towards the hangar and tank compound.
  path(c,[[-252,-24],[-246,-82],[-232,-82],[-235,-24]],'#5c7567');
  path(c,[[211,-24],[229,-81],[241,-81],[229,-24]],'#5c7567');
  assemblyBuilding(c,-half*.78,-105,1.05);
  waterTower(c,Math.min(half-32,285),-101,.95);
  // Remote tracking dome, maintenance sheds and a low communications mast.
  box(c,half*.73-34,-93,68,13,2,'#b1bea6','#688773');
  c.beginPath();c.arc(half*.73,-94,26,Math.PI,Math.PI*2);c.fillStyle='#d9dcc4';c.fill();
  path(c,[[half*.73,-119],[half*.73,-95]],null,'#b4c1a8');
  for(const xx of [-half*.35,half*.42]){
    box(c,xx-24,-92,48,14,1,'#b5bfa3','#5e7b66');path(c,[[xx-28,-93],[xx-19,-103],[xx+23,-103],[xx+28,-93]],'#879e87');
    for(let i=0;i<4;i++)box(c,xx-17+i*10,-89,6,5,1,'#355b5b');
  }
  path(c,[[-half*.36,-103],[-half*.36,-153]],null,'#789b8a');
  path(c,[[-half*.36-12,-139],[-half*.36+12,-139]],null,'#789b8a');beacon(c,-half*.36,-153,t);
  industrialPlant(c,half,t);
  // Perimeter fence with a gate kept clear along the central access road.
  for(let x=-half;x<half;x+=18){
    if(Math.abs(x)<126)continue;
    path(c,[[x,-52],[x,-37]],null,'#a9b99b');
    for(let j=0;j<3;j++)path(c,[[x,-50+j*5],[x+17,-50+j*5]],null,'#c1c6a24d');
  }
  // Safety berms and the inlaid pad apron frame the central rocket.
  ellipse(c,0,9,158,32,'#536c5a');ellipse(c,0,6,146,27,'#9fa48a','#c0bf9a');
  c.setLineDash([8,5]);ellipse(c,0,6,134,23,null,'#e5cd8c');c.setLineDash([]);
  for(const side of [-1,1]){
    floodlight(c,side*163,-36,.88,t+side);
    container(c,side*(half-42),42,.77,side<0?'#b9996b':'#719187');
    container(c,side*(half-43),60,.72,side<0?'#7c9987':'#b6a37d');
    // Exposed coolant lines and valves lead away from the pad.
    for(let j=0;j<2;j++){
      path(c,[[side*73,16+j*5],[side*128,16+j*5],[side*148,46+j*5],[side*(half-52),46+j*5]],null,j?'#c7be94':'#647c6e');
    }
    ellipse(c,side*143,38,4,4,'#be7951','#dfc593');
    path(c,[[side*139,38],[side*147,38]],null,'#efdaad');
  }
  // Deluge pipes spray into the flame trench as the engines spool up.
  if(ignition>0){c.save();c.globalAlpha=Math.min(.65,ignition);
    for(const side of [-1,1])for(let i=0;i<4;i++){
      c.beginPath();c.moveTo(side*(104+i*4),0);c.quadraticCurveTo(side*65,-31-i*3,side*15,12+i*3);c.strokeStyle='#cde0cb';c.stroke();
    }c.restore();
  }
  // A slow electric utility cart keeps the distant service road alive.
  const drive=(t*9)%(half*2+90)-half-45;
  supportTruck(c,drive,-28,.32,t);
  c.restore();
}
export function launchStation(c,w,h,s,t,{offset=0,ignition=0,lift=0,countdown=3}={}){
  const ground=h*.75+offset*h, cx=w*.5;
  // Distant coastal launch campus.
  const sea=c.createLinearGradient(0,ground-80*s,0,ground+80*s);sea.addColorStop(0,'#8da99a');sea.addColorStop(1,'#526e61');
  c.fillStyle=sea;c.fillRect(0,ground-65*s,w,h);
  path(c,[[0,ground-30*s],[w*.16,ground-51*s],[w*.4,ground-23*s],[w*.65,ground-48*s],[w,ground-22*s],[w,h+offset*h],[0,h+offset*h]],'#6d8264');
  for(let i=0;i<16;i++)path(c,[[i*w/13,ground-47*s],[i*w/13+24*s,ground-47*s]],null,'#ced4ac33');
  campus(c,w,ground,s,t,ignition);
  // Jointed concrete apron, cable ducts and a foreground servicing area.
  c.save();c.lineWidth=.8;
  for(let i=-7;i<=7;i++){path(c,[[cx+i*48*s,ground+18*s],[cx+i*87*s,h+offset*h]],null,'#d2ccb52a');}
  for(let i=0;i<5;i++){const yy=ground+(24+i*i*9)*s;path(c,[[0,yy],[w,yy]],null,'#293f392b');}
  c.restore();
  controlBuilding(c,cx-235*s,ground-24*s,.86*s,t);
  // Cryogenic storage tanks with pipes, ladders and level marks.
  for(let i=0;i<3;i++){
    const x=cx+(205+i*35)*s, y=ground-14*s;
    box(c,x-13*s,y-69*s,26*s,67*s,12*s,'#c9d0b6','#61796c');
    for(let j=0;j<3;j++)path(c,[[x-12*s,y-(15+j*19)*s],[x+12*s,y-(15+j*19)*s]],null,'#8e9f89');
    path(c,[[x,y-70*s],[x,y-81*s],[x+8*s,y-81*s]],null,'#d9dbb9');
    path(c,[[x-8*s,y],[x-8*s,y+8*s],[cx+70*s,y+8*s]],null,'#baa77d');
    box(c,x-5*s,y-47*s,10*s,18*s,1,'#6f9990');
  }
  // Service tower remains in the world during liftoff; umbilicals swing away.
  c.save();c.translate(cx,ground);c.scale(s,s);c.lineWidth=2;
  const tower=c.createLinearGradient(77,0,126,0);tower.addColorStop(0,'#36514f');tower.addColorStop(.4,'#6c8472');tower.addColorStop(1,'#2c4b4c');box(c,79,-330,45,330,2,tower,'#92a38c');
  for(let i=0;i<11;i++){
    const y=-325+i*29;path(c,[[82,y],[121,y+26],[82,y+26],[121,y]],null,'#91a28c');
    for(const xx of [79,120])box(c,xx,y,4,25,1,i%2?'#e0d8bd':'#b95e4e');
    box(c,75,y+25,54,4,1,'#b4b99a');
    for(const xx of [81,121])ellipse(c,xx,y+26,1.2,1.2,'#e0d3a7','#556a5b');
  }
  for(const x of [76,126])path(c,[[x,0],[x,-337]],null,'#d2c99e');
  box(c,87,-310,12,288,1,'#2b4747');for(let i=0;i<34;i++)path(c,[[88,-305+i*8],[98,-305+i*8]],null,'#b2b79b');
  path(c,[[117,-322],[117,-16]],null,'#c5aa70');path(c,[[113,-322],[113,-16]],null,'#435d58');
  for(let i=0;i<8;i++)box(c,111,-300+i*37,8,3,1,'#a7b393');
  // Caged elevator, equipment cabinets and platform railings.
  const elevatorY=-45-(Math.sin(t*.16)*.5+.5)*230;
  box(c,101,elevatorY,19,29,2,'#9cac95','#d5d2ad');box(c,104,elevatorY+3,13,17,1,'#385b5a');
  for(let i=0;i<3;i++)path(c,[[105+i*5,elevatorY+3],[105+i*5,elevatorY+20]],null,'#b8bfa0');
  for(const yy of [-268,-181,-94]){
    path(c,[[75,yy],[129,yy],[129,yy+10]],null,'#e0ce98');
    for(const xx of [76,94,112,128])path(c,[[xx,yy],[xx,yy+12]],null,'#a9b598');
    box(c,80,yy+14,10,14,1,'#55766b','#c8c59c');beacon(c,126,yy+15,t+yy);
  }
  for(const y of [-260,-186,-109]){
    c.save();c.translate(80,y);c.rotate(-Math.min(1,lift*2)*1.3);
    box(c,-54,-3,54,7,1,'#b7bd9e','#4b675c');path(c,[[-53,3],[0,21],[0,3]],null,'#8b9d85');
    path(c,[[-54,4],[-55,17],[-29,24]],null,'#c79362');c.restore();
  }
  path(c,[[99,-330],[99,-359],[68,-359]],null,'#9eaf95');beacon(c,99,-360,t);
  // A visible windsock and lightning mast frame the vehicle.
  path(c,[[-153,0],[-153,-176]],null,'#a5b294');
  const sway=Math.sin(t*2)*4;
  path(c,[[-153,-173],[-117,-169+sway],[-111,-162+sway],[-153,-165]],'#d48a59','#e4c592');
  for(let i=0;i<3;i++)path(c,[[-145+i*10,-172+i],[ -145+i*10,-164+i+sway*.6]],null,'#f4dfb0');
  // Concrete pad, flame trench, striped safety edges and access road.
  box(c,-114,-9,228,29,3,'#7d8c7d','#374f4b');box(c,-72,-5,144,11,1,'#c5c7a8');
  for(let i=0;i<24;i++){const x=-109+i*9;path(c,[[x,-6],[x+5,-6],[x+5,0],[x,0]],i%2?'#455b53':'#9ca98b');}
  path(c,[[-36,8],[-20,33],[72,33],[94,19],[94,8]],'#283f40','#a6b098');
  // Twin lined exhaust channels carry hot gases away from the mobile table.
  for(const side of [-1,1]){
    path(c,[[side*13,9],[side*26,31],[side*109,50],[side*137,37],[side*64,19]],'#223638','#a3ae95');
    for(let i=0;i<7;i++){const x=side*(35+i*12),y=26+i*2.4;path(c,[[x-4,y-4],[x+side*13,y+3]],null,'#657d6c');}
    if(ignition>0){c.save();c.globalAlpha=ignition*.7;const glow=c.createLinearGradient(0,12,side*130,43);glow.addColorStop(0,'#fff1b0');glow.addColorStop(.3,'#f19a59');glow.addColorStop(1,'#da704300');path(c,[[side*18,13],[side*32,28],[side*136,45],[side*117,33]],glow);c.restore();}
  }
  for(let i=0;i<12;i++)path(c,[[-109+i*19,0],[-102+i*19,0],[-96+i*19,9],[-103+i*19,9]],i%2?'#d7bd79':'#364c47');
  path(c,[[-160,40],[-290,130],[290,130],[155,40]],'#566c60');
  c.setLineDash([12,12]);path(c,[[0,42],[0,134]],null,'#d5c594');c.setLineDash([]);
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const x=side*(129+i*35);box(c,x-3,21,6,13,1,'#dcb779');ellipse(c,x,20,2,2,'#ffe7a9');
  }
  sign(c,'PAD 01',-77,26,54);
  // Shielded range clock: fixed legible digits rather than a flickering meter.
  path(c,[[-211,12],[-211,-43],[-156,-43],[-156,12]],null,'#9aaf95');
  box(c,-220,-77,74,36,4,'#20373b','#b7b99a');
  c.textAlign='center';c.font='600 7px sans-serif';c.fillStyle='#b1c7b0';c.fillText('RANGE CLOCK',-183,-65);
  c.font='700 15px monospace';c.fillStyle='#f3d597';c.fillText(lift>0?'LIFTOFF':'T−00:0'+Math.ceil(countdown),-183,-49);
  c.restore();
  c.save();c.translate(cx,ground);c.scale(s,s);c.lineWidth=1;
  // Visible pump banks, spinning ventilators and a short protected service walkway.
  for(const side of [-1,1]){
    const x=side*(w/(2*s)*.57);
    box(c,x-43,82,86,39,4,'#718b78','#b4bb98');box(c,x-46,79,92,5,1,'#d0c398');
    for(let j=0;j<2;j++){const xx=x-22+j*43;ellipse(c,xx,101,15,15,'#294948','#b5c1a1');
      for(let i=0;i<5;i++){const a=t*2+i*Math.PI*2/5;path(c,[[xx,101],[xx+Math.cos(a)*12,101+Math.sin(a)*12],[xx+Math.cos(a+.5)*6,101+Math.sin(a+.5)*6]],'#89a395');}
      ellipse(c,xx,101,3,3,'#c8bd8e');}
    for(let i=0;i<6;i++)box(c,x-36+i*13,119,7,3,0,i%2?'#d0b773':'#354e45');
    const ax=x-side*34;path(c,[[ax,68],[ax,41],[ax-side*46,41]],null,'#b1bba0');
    for(let i=0;i<3;i++)path(c,[[ax-side*i*15,41],[ax-side*i*15,53]],null,'#a9b394');
  }
  c.restore();
  // Staging carts, cable drums and wheel stops beside the mobile launcher.
  c.save();c.translate(cx,ground);c.scale(s,s);c.lineWidth=1.2;
  box(c,-108,48,38,15,2,'#b9a675','#55715d');wheel(c,-100,65);wheel(c,-78,65);
  ellipse(c,-89,42,12,12,'#8b8c6d','#d3c49a');ellipse(c,-89,42,7,7,'#3c5b52');
  path(c,[[-89,49],[-64,53],[-57,37],[-36,34]],null,'#394e46');
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const x=side*(119+i*18);path(c,[[x-4,77],[x,63],[x+4,77]],'#d18d54','#e0c08b');box(c,x-6,77,12,3,1,'#5e7058');
  }
  c.restore();
  // Near-field cryogenic service rack: tanks, valve wheels and a pump cart.
  c.save();c.translate(cx,ground);c.scale(s,s);c.lineWidth=1;
  for(const side of [-1,1]){
    const xx=side*(w/(2*s)-75);
    box(c,xx-30,22,60,34,3,'#3b5b59','#a2b89c');
    for(let i=0;i<3;i++){const tx=xx-19+i*19;const steel=c.createLinearGradient(tx-7,0,tx+7,0);steel.addColorStop(0,'#859988');steel.addColorStop(.4,'#e0debc');steel.addColorStop(1,'#718b7d');box(c,tx-7,-9,14,58,7,steel,'#b8bea1');box(c,tx-8,10,16,4,1,'#a98552');ellipse(c,tx,-11,3,3,'#c6a15f');path(c,[[tx,49],[tx,60],[xx,60]],null,'#b7b18a');}
    box(c,xx-31,52,62,7,1,'#84947a');for(const dx of [-23,23])ellipse(c,xx+dx,61,5,5,'#283e3e','#b2b59b');
    for(let i=0;i<4;i++){const vx=xx-22+i*14;ellipse(c,vx,34,4,4,'#bd8353','#e2c696');path(c,[[vx-3,34],[vx+3,34]],null,'#f2d99d');}
  }
  // Rails and wheel grooves show where the crawler brought the launch table.
  for(const side of [-1,1]){path(c,[[side*55,35],[side*149,132]],null,'#a5ad92');path(c,[[side*59,35],[side*155,132]],null,'#273f3d');
    for(let i=0;i<8;i++){const u=i/8;path(c,[[side*(57+91*u),38+92*u],[side*(63+93*u),38+92*u]],null,'#bcb993');}}
  c.restore();
  supportTruck(c,cx-186*s,ground+18*s,.72*s,t);
  supportTruck(c,cx+235*s,ground-26*s,.48*s,t+.7);
  // Small tracking station at the perimeter.
  componentArt(c,'array',cx+190*s,ground+17*s,.65*s,t);
  if(ignition>0){
    for(let i=0;i<36;i++){
      const phase=(t*.35+i/36)%1,side=i%2?1:-1;
      cloud(c,cx+side*(30+phase*240)*s,ground+(12-phase*33)*s,(.2+phase*.85)*s,ignition*Math.sin(phase*Math.PI)*.6);
    }
  }else{
    for(let i=0;i<3;i++){const u=(t*.23+i/3)%1;cloud(c,cx+(24+u*44)*s,ground-(60+u*64)*s,(.08+u*.2)*s,(1-u)*.32);}
  }
}

export function hangar(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1;
  // Recessed assembly bay, work lamps, suspension rig and tool carts.
  path(c,[[-163,86],[-163,-158],[-125,-190],[125,-190],[163,-158],[163,86]],'#1c363b','#7c9a87');
  for(const side of [-1,1]){
    box(c,side<0?-161:145,-155,16,235,2,'#57766b');
    for(let i=0;i<8;i++)path(c,[[side*145,-145+i*28],[side*161,-129+i*28]],null,'#8aa18c');
    box(c,side*128-10,-150,20,5,2,'#f5dda0');
    box(c,side*134-19,40,38,33,3,'#6b8b77','#a9ba95');
    for(let i=0;i<3;i++)box(c,side*134-15,45+i*8,30,5,1,'#324f4c');
    wheel(c,side*134-12,78);wheel(c,side*134+12,78);
  }
  box(c,-155,-172,310,10,2,'#b6aa7c');for(let i=0;i<14;i++)path(c,[[-151+i*22,-170],[-143+i*22,-164]],null,'#495e54');
  path(c,[[-35,-161],[-35,-122],[35,-122],[35,-161]],null,'#9aaf95');
  beacon(c,-151,-175,t);beacon(c,151,-175,t+1);
  c.restore();
}

export function scienceStation(c,id,x,y,s,t,done=false){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.5;
  const bob=Math.sin(t*1.7+x)*2;c.translate(0,bob);
  ellipse(c,0,15,39,8,'#173d3b45');
  box(c,-29,0,58,13,6,'#314d4b','#b9ba90');box(c,-25,-3,50,9,4,'#d1ba7e');
  for(const side of [-1,1]){box(c,side*21-4,-9,8,24,3,'#c67f54');ellipse(c,side*21,13,6,3,'#a9c5ad');}
  if(id==='lake'){
    box(c,-16,-24,32,23,4,'#688d7a','#ddd3a7');
    for(let i=0;i<3;i++){box(c,-12+i*9,-34,6,20,2,'#c5dfcf','#6d968c');box(c,-11+i*9,-22,4,7,1,'#73ac9d');}
    path(c,[[16,-13],[38,-13],[38,12]],null,'#d2c494');ellipse(c,38,13,6,3,'#c7d9ae');
  }else if(id==='cold'){
    componentArt(c,'weather',0,-31,.64,t);glyphThermal(c,-22,-18);
  }else if(id==='rain'){
    path(c,[[0,0],[0,-46]],null,'#d0cda9');ellipse(c,0,-40,25,6,'#a7c7bc','#e2d5a4');
    path(c,[[-24,-40],[-12,-20],[12,-20],[24,-40]],'#83b0a37a','#d3d3ac');
    for(let i=0;i<5;i++){const u=(t*.7+i*.2)%1;ellipse(c,-16+i*8,-62+u*35,1.3,3,'#d9eac4');}
  }else if(id==='air'){
    componentArt(c,'weather',-7,-26,.65,t);path(c,[[12,-18],[27,-66]],null,'#d8d2b0');
    ellipse(c,27,-80,13,17,'#d39567','#f2d1a0');path(c,[[22,-66],[27,-61],[32,-66]],'#c6c3a0');
  }else componentArt(c,'camera',0,-25,.8,t);
  ellipse(c,19,-8,2.5,2.5,done?'#bce5b3':Math.sin(t*3)>0?'#ffe0a0':'#a5744d');
  c.restore();
}
function glyphThermal(c,x,y){box(c,x-3,y-17,6,25,3,'#d9dfc3','#466e68');box(c,x-1,y-10,2,18,1,'#d1875c');ellipse(c,x,y+9,5,5,'#d1875c','#d9dfc3');}
