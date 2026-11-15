export const FOIL_ACCENTS={gold:{name:'Gold MLI',color:'#d6b364',light:'#fff0bc',detail:'Classic reflective thermal blanket'},amber:{name:'Deep Amber',color:'#c57936',light:'#ffd9a0',detail:'Hydrocarbon explorer trim'},blue:{name:'NASA Royal Blue',color:'#356eb4',light:'#a8dcff',detail:'Commemorative flagship trim'}};
export const cleanCallsign=value=>String(value||'').replace(/[^a-z0-9]/gi,'').slice(0,12)||'Pip';
export const personalization=value=>({callsign:cleanCallsign(value?.callsign),accent:Object.hasOwn(FOIL_ACCENTS,value?.accent)?value.accent:'gold'});
export function fitViewport(width,height,dpr=1){
 const w=Number.isFinite(width)&&width>0?Math.max(1,Math.min(width,32768)):1,h=Number.isFinite(height)&&height>0?Math.max(1,Math.min(height,32768)):1,ratio=Number.isFinite(dpr)&&dpr>0?Math.max(1,Math.min(dpr,2)):1,fit=Math.min(w/1200,h/700);
 return {width:1200,height:700,fit,dpr:ratio,offsetX:(w-1200*fit)/2,offsetY:(h-700*fit)/2,pixelWidth:Math.max(1,Math.round(w*ratio)),pixelHeight:Math.max(1,Math.round(h*ratio))};
}
export function launchProfile(seconds,totals){const overloaded=totals.mass>totals.capacity&&totals.capacity>0;return {overloaded,failed:overloaded&&seconds>=2.6,rise:overloaded?220*Math.sin(Math.min(1,seconds/2.6)*Math.PI/2):Math.min(1,seconds/3)*700};}
export function returnToWorkshop(state){state.stage='assemble';state.launchFailure=false;return state;}
export function retryTransit(state,factory){state.transit=factory(state.destination);state.stage='cruise';return state;}
