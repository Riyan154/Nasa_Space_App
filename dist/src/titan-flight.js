// The six-second flyby and ten-second arrival run on visible, unpaused game time.
export const CRUISE_SECONDS = 6;
export const LANDING_SECONDS = 10;
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
