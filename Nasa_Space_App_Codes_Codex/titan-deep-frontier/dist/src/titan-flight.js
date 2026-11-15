// Flyby and destination-specific arrival run on visible, unpaused game time.
export const CRUISE_SECONDS = 18;
export const LANDING_SECONDS = 10;
export const LUNAR_LANDING_SECONDS = 14;
export const MARS_LANDING_SECONDS = 16;
export const landingDuration = destination => destination==='moon'?LUNAR_LANDING_SECONDS:destination==='mars'?MARS_LANDING_SECONDS:LANDING_SECONDS;
const unit = value => Math.max(0,Math.min(1,value));
const ease = value => { const u=unit(value); return u*u*(3-2*u); };

export function arrival(seconds){
  const entry=ease(seconds/3.2), descent=ease((seconds-3.2)/5);
  return {
    x:.16+.41*entry+.045*descent,
    y:-.12+.52*entry+.32*descent,
    heat:Math.sin(Math.PI*unit(seconds/3.2)),
    canopy:ease((seconds-2.95)/.9)*(1-ease((seconds-8.2)/1.1)),
    reveal:ease((seconds-3.3)/1.1),
    ripple:unit((seconds-8.2)/1.8),
    phase:seconds<3.2?'Atmospheric entry':seconds<8.2?'Parachute descent':'Touchdown on Ligeia Mare'
  };
}
// A kinematic teaching descent: active thrust follows the commanded trajectory.
// In a vacuum there is exactly no aerodynamic drag, heating or parachute force.
export function lunarArrival(seconds){
  const u=unit(seconds/12), eased=1-(1-u)**2;
  // 1 km vertical terminal approach compressed from 70 mission seconds.
  const acceleration=2000/(70*70),thrustToWeight=u<1?(1.62+acceleration)/1.62:0;
  return {x:.63-.36*ease(seconds/9),y:-.10+.83*eased,heat:0,canopy:0,reveal:1,ripple:unit((u-.88)/.12),throttle:u<1?thrustToWeight/2.6:0,velocity:2000*(1-u)/70,altitude:1000*(1-u)**2,thrustToWeight,gear:ease((seconds-4)/3),rollout:ease((seconds-12)/2),drag:0,gravity:1.62,phase:seconds<4?'Retrograde burn · cancelling orbital motion':seconds<10?'Powered descent · landing legs extending':seconds<12?'Final approach · clearing regolith':'Contact confirmed · deploying Pip'};
}
export function marsArrival(seconds){
  const u=unit(seconds/MARS_LANDING_SECONDS),brake=ease(seconds/8),lower=ease((seconds-12)/3);
  return {x:.68-.41*brake,y:-.12+.63*brake,heat:Math.sin(Math.PI*unit(seconds/4)),canopy:ease((seconds-3.3)/.8)*(1-ease((seconds-7.5)/.7)),throttle:seconds>=8&&seconds<15?.55:0,lower,release:ease(seconds-15),dust:ease((seconds-10)/4),gravity:3.71,phase:seconds<4?'Atmospheric entry · heat shield protection':seconds<8?'Supersonic parachute · shield separation':seconds<12?'Powered descent · radar terrain lock':seconds<15?'Sky crane · gently lowering Pip':'Wheels down · descent stage fly-away'};
}
