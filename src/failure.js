// Bounded, deterministic blast state shared by launch and transit recovery.
export function createFailure(type,x,y){return {type,x,y,elapsed:0,shown:false};}
export function explosionPhase(seconds){
 const t=Number.isFinite(seconds)?Math.max(0,seconds):0;
 return {flash:Math.max(0,1-t/.15),core:Math.max(0,1-t/.48),fragments:t>=.05&&t<1.5,smoke:t>=.25&&t<1.8,shake:t<.67?10*Math.exp(-t*7)*(1-t/.67):0,finished:t>=1.8};
}
export function advanceFailure(f,dt){if(Number.isFinite(dt)&&dt>0)f.elapsed=Math.min(1.8,f.elapsed+Math.min(dt,.1));if(f.elapsed>=1.8&&!f.shown){f.shown=true;return true;}return false;}
export function failureContent(type,totals={}){
 const mass=Number.isFinite(totals.mass)?totals.mass:0;
 return type==='launch'?{title:'💥 WHOOPS! GRAVITY WON THIS ROUND!',body:`<div class="failure-illustration" aria-hidden="true">🚀 💥 🛠️</div><p class="failure-subtitle">YOUR SPACECRAFT WAS A LITTLE TOO HEAVY TO FLY</p><p>Voyager packed too much cool equipment for this rocket! With ${mass} kg on board, the engines strained and went KABOOM just after takeoff. Voyager is safe in our practice simulator.</p><p class="failure-tip">💡 Voyager’s Engineering Secret: Try a lighter tool or the mighty Cosmic Titan rocket!</p><button class="play-button" data-game="failure-workshop">🛠️ Fix My Rocket in the Workshop</button>`}:{title:'💥 CRUNCH! SPACE DEBRIS AMBUSH!',body:'<div class="failure-illustration" aria-hidden="true">🛰️ 💥 ☄️</div><p class="failure-subtitle">YOUR SHIP NEEDS A REPAIR</p><p>Tumbling rocks and old satellite junk hit Voyager’s capsule four times. The hull meter is empty—but every pilot gets another try!</p><p class="failure-tip">💡 Voyager’s Pilot Tip: Use Arrow keys or WASD to weave through gaps, or choose Skip to Landing for a shortcut!</p><button class="play-button" data-game="retry-transit">🔄 Try Dodging Again</button><button class="continue-game" data-game="abort-transit">🏠 Return to Main Menu</button>'};
}
