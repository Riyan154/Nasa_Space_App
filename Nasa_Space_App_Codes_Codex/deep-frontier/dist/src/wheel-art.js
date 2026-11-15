// Original eight-spoke wheel artwork, approved in the wheel design review.
const TAU=Math.PI*2;
function ellipse(c,x,y,rx,ry,fill,stroke,width=1){
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
export function drawSpokedWheel(c,x,y,r,rotation=0){
  c.save();c.translate(x,y);c.scale(r/100,r/100);c.lineCap='round';c.lineJoin='round';
  // A quiet sidewall silhouette: all tread stays inside the circular profile.
  ellipse(c,7,1,99,104,'#252d30','#65726f',1.5);
  const rubber=c.createLinearGradient(-70,-85,75,90);
  rubber.addColorStop(0,'#59615e');rubber.addColorStop(.28,'#363e3f');rubber.addColorStop(.7,'#252e32');rubber.addColorStop(1,'#404b4c');
  ellipse(c,0,0,100,105,rubber,'#9ba396',1.6);
  c.save();c.rotate(rotation);
  for(let i=0;i<32;i++){
    c.save();c.rotate(i*TAU/32);c.beginPath();
    c.moveTo(-4,-102);c.quadraticCurveTo(-6,-99,-4,-95);
    c.lineTo(1,-88);c.quadraticCurveTo(4,-86,5,-89);
    c.lineTo(0,-98);c.quadraticCurveTo(-1,-102,-4,-102);
    c.fillStyle=i%4===0?'#727a72':'#596461';c.fill();
    c.beginPath();c.moveTo(-3,-100);c.lineTo(2,-91);
    c.strokeStyle='#b0b6a346';c.lineWidth=1;c.stroke();c.restore();
  }
  c.restore();
  ellipse(c,0,0,84,89,null,'#1b282b',3);
  ellipse(c,0,0,80,85,null,'#77877e',1.4);
  const metal=c.createLinearGradient(-50,-72,63,82);
  metal.addColorStop(0,'#e3dfc6');metal.addColorStop(.23,'#b8c0b1');
  metal.addColorStop(.55,'#7f9691');metal.addColorStop(.8,'#b0baaa');metal.addColorStop(1,'#6d8581');
  ellipse(c,0,0,74,79,metal,'#dde0c5',1.5);
  ellipse(c,0,0,65,70,'#293e43','#536a68',1.8);
  const spoke=c.createLinearGradient(-40,-70,40,70);
  spoke.addColorStop(0,'#e1dfc8');spoke.addColorStop(.46,'#b2bca9');spoke.addColorStop(1,'#788f85');
  c.save();c.rotate(rotation);
  // Eight tapered spokes preserve the current wheel's recognisable open shape.
  for(let i=0;i<8;i++){
    c.save();c.rotate(i*TAU/8);
    c.beginPath();c.moveTo(-8,-22);
    c.quadraticCurveTo(-10,-31,-8,-44);c.lineTo(-7,-65);
    c.quadraticCurveTo(0,-72,7,-65);c.lineTo(8,-44);
    c.quadraticCurveTo(10,-31,8,-22);c.closePath();
    c.fillStyle=spoke;c.fill();c.strokeStyle='#2f4747';c.lineWidth=1.6;c.stroke();
    c.beginPath();c.moveTo(-5,-31);c.lineTo(-4,-61);
    c.strokeStyle='#f5edd380';c.lineWidth=1.3;c.stroke();
    ellipse(c,0,-72,2.2,2.6,'#576f68','#e1ddbf',.7);
    c.restore();
  }
  c.restore();
  ellipse(c,0,0,30,32,'#405d5c','#d2d5b7',2);
  const hub=c.createRadialGradient(-8,-12,1,0,0,26);
  hub.addColorStop(0,'#e6d6a1');hub.addColorStop(.5,'#c3ad75');hub.addColorStop(1,'#82764e');
  ellipse(c,0,0,23,25,hub,'#f0deb1',1.3);
  c.save();c.rotate(rotation);
  for(let i=0;i<6;i++){
    const a=i*TAU/6;
    ellipse(c,Math.cos(a)*17,Math.sin(a)*18,2.4,2.6,'#415451','#e4d5ae',.8);
  }
  ellipse(c,0,0,9,10,'#385658','#9aa991',1.3);
  c.beginPath();c.moveTo(-4,0);c.lineTo(4,0);c.strokeStyle='#c0c9ac';c.lineWidth=1.6;c.stroke();c.restore();
  // Fixed light belongs to the scene, rather than rotating with the wheel.
  c.beginPath();c.ellipse(0,0,97,102,0,Math.PI*1.07,Math.PI*1.75);
  c.strokeStyle='#e8e7c746';c.lineWidth=1.5;c.stroke();
  c.restore();
}
