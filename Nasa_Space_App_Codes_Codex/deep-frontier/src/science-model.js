// Real reference constants; the controls and spectral profiles are teaching models.
export const LUNAR_DISTANCE_KM=384400;
export const LIGHT_SPEED_KM_S=299792.458;
export const LASER_ROUND_TRIP=2*LUNAR_DISTANCE_KM/LIGHT_SPEED_KM_S;
export const SPECTRA={
  methane:{name:'Methane',formula:'CH₄',peaks:[.17,.38,.74],heights:[.7,1,.55]},
  ethane:{name:'Ethane',formula:'C₂H₆',peaks:[.25,.58,.79],heights:[1,.55,.85]}
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function scienceGameFor(destination,id){
  return destination==='moon'&&id==='reflector'?'laser':destination==='titan'&&id==='lake'?'spectrometer':destination==='mars'&&id==='delta'?'drill':null;
}
export function createScienceGame(kind){
  if(!['laser','spectrometer','drill'].includes(kind))throw new Error('Unknown science game');
  return {kind,complete:false,angle:-22,lock:0,phase:'align',pulse:0,round:0,choice:'',offset:-14,matched:0,pressure:.2,heat:.15,depth:0,venting:false};
}
export function setScienceControl(game,key,value){
  if(game.complete)return;
  if(game.kind==='laser'&&game.phase==='align'&&key==='angle'&&Number.isFinite(value))game.angle=clamp(value,-40,40);
  if(game.kind==='spectrometer'){
    if(key==='offset'&&Number.isFinite(value))game.offset=clamp(value,-20,20);
    if(key==='choice'&&Object.hasOwn(SPECTRA,value))game.choice=value;
  }
}
export function tapDrill(game){
  if(game.kind!=='drill'||game.complete||game.venting)return false;
  game.pressure=clamp(game.pressure+.13);return true;
}
export function spectrumError(game){
  const wanted=SPECTRA[game.round===0?'methane':'ethane'],reference=SPECTRA[game.choice];
  if(!reference)return 1;
  return wanted.peaks.reduce((sum,x,i)=>sum+Math.abs(x-reference.peaks[i]-game.offset/100)+Math.abs(wanted.heights[i]-reference.heights[i])*.15,0)/3;
}
export function advanceScience(game,seconds){
  if(game.complete)return;
  const dt=Number.isFinite(seconds)?clamp(seconds,0,.05):0;
  if(game.kind==='laser'){
    if(game.phase==='align'){
      game.lock=Math.abs(game.angle)<=3?Math.min(3,game.lock+dt):0;
      if(game.lock>=3){game.phase='pulse';game.pulse=0;}
    }else if(game.phase==='pulse'){
      game.pulse=Math.min(LASER_ROUND_TRIP,game.pulse+dt);
      if(game.pulse>=LASER_ROUND_TRIP)game.complete=true;
    }
  }else if(game.kind==='spectrometer'){
    game.matched=spectrumError(game)<=.018?game.matched+dt:0;
    if(game.matched>=1.25){
      if(game.round===0){game.round=1;game.choice='';game.offset=13;game.matched=0;}
      else game.complete=true;
    }
  }else{
    game.pressure=clamp(game.pressure-dt*.12);
    if(game.venting){
      game.heat=clamp(game.heat-dt*.3);
      if(game.heat<=.25)game.venting=false;
      return;
    }
    const ideal=game.pressure>=.35&&game.pressure<=.7;
    game.heat=clamp(game.heat+dt*(game.pressure>.7?.62:ideal?.035:-.17));
    if(game.heat>=1){game.venting=true;game.pressure=0;return;}
    if(ideal)game.depth=clamp(game.depth+dt*.16);
    if(game.depth>=1)game.complete=true;
  }
}
