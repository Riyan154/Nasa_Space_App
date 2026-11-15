// Native Canvas inspection of NASA geometry exported once from the bundled GLBs.
// No WebGL, framework, decoder, library, or network CDN is required at runtime.
class NativeModelViewer extends HTMLElement {
  constructor(){
    super();this.canvas=document.createElement('canvas');this.canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none';this.context=this.canvas.getContext('2d');this.theta=.6;this.phi=1.2;this.radius=3.2;this.rotating=false;this.loaded=false;this.controller=new AbortController();this.request=0;this.last=0;
  }
  connectedCallback(){
    if(this.controller.signal.aborted)this.controller=new AbortController();
    this.append(this.canvas);this.style.display='block';this.style.position='relative';this.tabIndex=0;this.setAttribute('role','img');
    this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(this);
    const signal=this.controller.signal;let drag=null;
    this.canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};this.canvas.setPointerCapture(e.pointerId);},{signal});
    this.canvas.addEventListener('pointermove',e=>{if(!drag)return;this.theta+=(e.clientX-drag.x)*.012;this.phi=Math.max(.15,Math.min(2.95,this.phi+(e.clientY-drag.y)*.009));drag={x:e.clientX,y:e.clientY};this.draw();},{signal});
    this.canvas.addEventListener('pointerup',()=>drag=null,{signal});this.canvas.addEventListener('pointercancel',()=>drag=null,{signal});
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.radius=Math.max(1.5,Math.min(8,this.radius*Math.exp(e.deltaY*.001)));this.draw();},{signal,passive:false});
    this.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();this.theta+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;this.phi=Math.max(.15,Math.min(2.95,this.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0)));if(e.key==='+')this.radius=Math.max(1.5,this.radius*.85);if(e.key==='-')this.radius=Math.min(8,this.radius*1.15);this.draw();}},{signal});
    const animate=now=>{if(!this.isConnected)return;if(now-this.last>65){if(this.rotating&&!document.hidden){this.theta+=.012;this.draw();}this.last=now;}this.request=requestAnimationFrame(animate);};this.request=requestAnimationFrame(animate);
  }
  disconnectedCallback(){this.controller.abort();this.observer?.disconnect();cancelAnimationFrame(this.request);this.fetchController?.abort();}
  set src(value){
    this.fetchController?.abort();const controller=this.fetchController=new AbortController();this.loaded=false;
    const url=value.replace('.glb','-canvas.json');
    fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Geometry unavailable');return r.json();}).then(data=>{if(controller.signal.aborted)return;
      const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const v of data.vertices)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],v[i]);hi[i]=Math.max(hi[i],v[i]);}
      const center=lo.map((x,i)=>(x+hi[i])/2),extent=Math.max(...hi.map((x,i)=>x-lo[i]));this.center=center;this.extent=extent;this.vertices=data.vertices.map(v=>v.map((x,i)=>(x-center[i])/extent*2));this.faces=data.faces;this.loaded=true;this.draw();this.dispatchEvent(new Event('load'));
    }).catch(e=>{if(e.name!=='AbortError')this.dispatchEvent(new Event('error'));});
  }
  set alt(value){this.setAttribute('aria-label',value+' Use arrow keys to rotate and plus/minus to zoom.');}
  set autoRotate(value){this.rotating=!!value;}
  get autoRotate(){return this.rotating;}
  set cameraOrbit(value){const p=value.split(/\s+/);const angle=(v,fallback)=>v?.endsWith('deg')?parseFloat(v)*Math.PI/180:v?.endsWith('rad')?parseFloat(v):fallback;this.theta=angle(p[0],.6);this.phi=angle(p[1],1.2);this.radius=p[2]?.endsWith('m')?Math.max(1.5,Math.min(8,parseFloat(p[2]))):3.2;this.draw();}
  getCameraOrbit(){return {theta:this.theta,phi:this.phi,radius:this.radius};}
  set fieldOfView(value){if(value==='30deg'){this.radius=3.2;this.draw();}}
  draw(){
    const rect=this.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;const dpr=Math.min(devicePixelRatio||1,2),c=this.context;
    if(this.canvas.width!==Math.round(w*dpr)||this.canvas.height!==Math.round(h*dpr)){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);}c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
    if(!this.vertices)return;
    const st=Math.sin(this.theta),ct=Math.cos(this.theta),sp=Math.sin(this.phi-Math.PI/2),cp=Math.cos(this.phi-Math.PI/2);
    const project=v=>{const x=v[0]*ct+v[2]*st,z=-v[0]*st+v[2]*ct,y=v[1]*cp-z*sp,depth=v[1]*sp+z*cp;const f=Math.min(w,h)*.85/(this.radius-depth*.3);return [w*.5+x*f,h*.5-y*f,depth,x,y];};
    const projected=this.vertices.map(project);
    const faces=this.faces.map(face=>{const a=projected[face[0]],b=projected[face[1]],d=projected[face[2]];return {a,b,d,color:face[3],z:(a[2]+b[2]+d[2])/3};}).sort((a,b)=>a.z-b.z);
    for(const f of faces){const {a,b,d}=f,ux=b[3]-a[3],uy=b[4]-a[4],uz=b[2]-a[2],vx=d[3]-a[3],vy=d[4]-a[4],vz=d[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,len=Math.hypot(nx,ny,nz)||1;
      const light=.48+.52*Math.abs((nx*.35+ny*.6+nz*.72)/len);c.fillStyle=`rgb(${f.color.map(v=>Math.round(v*light)).join(',')})`;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();c.fill();
    }
    for(const pin of this.querySelectorAll('[data-position]')){const point=pin.dataset.position.split(/\s+/).map(Number).map((x,i)=>(x-this.center[i])/this.extent*2),position=project(point);pin.style.position='absolute';pin.style.left=position[0]+'px';pin.style.top=position[1]+'px';pin.style.transform='translate(-50%,-50%)';}
  }
}
if(!customElements.get('model-viewer'))customElements.define('model-viewer',NativeModelViewer);
