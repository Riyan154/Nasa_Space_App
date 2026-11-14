// Fictional equipment ratings for Pip's mission.
export const BUILDER_LIMITS = { budget: 350 };
export const DEFAULT_LOADOUT = { rocket:'atlas', power:'rtg', science:'camera', radio:'dish' };
export const COMPONENTS = {
  rocket: [
    {"id": "scout", "name": "Scout-1 Light Booster", "mass": 0, "draw": 0, "capacity": 180, "cost": 60, "tag": "LEAN & NIMBLE", "detail": "Slender single-core launcher with dual vernier steering thrusters. Inexpensive, leaving maximum budget for heavy science tools."},
    {"id": "atlas", "name": "Atlas Heavy-Lifter", "mass": 0, "draw": 0, "capacity": 240, "cost": 90, "tag": "THE WORKHORSE", "detail": "Dual strap-on solid boosters paired with corrugated cryogenic fuel tanks. The balanced standard for deep-space payloads."},
    {"id": "titan", "name": "Titan Deep-Space V", "mass": 0, "draw": 0, "capacity": 300, "cost": 120, "tag": "BIG AMBITIONS", "detail": "Triple-core heavy booster with aerodynamic grid fins, clustered engine bells, and an expanded payload fairing."},
    {"id": "horizon", "name": "Saturn Horizon Ultra", "mass": 0, "draw": 0, "capacity": 380, "cost": 150, "tag": "MAXIMUM LIFT", "detail": "Super-heavy exploration launch vehicle. Massive lifting capacity capable of carrying the heaviest labs and hybrid reactors with ease."}
  ],
  power: [
    {"id": "solar", "name": "Solar Wings", "mass": 25, "draw": 0, "cost": 35, "supply": 45, "tag": "SUNLIGHT → ELECTRICITY", "detail": "Deployable photovoltaic arrays with gold foil hinges. Lightweight, but generates limited power in Titan's hazy dim sunlight."},
    {"id": "rtg", "name": "Radioisotope Core (RTG)", "mass": 45, "draw": 0, "cost": 80, "supply": 110, "tag": "HEAT → ELECTRICITY", "detail": "Plutonium-238 decay heat converted into electricity. Operates continuously in complete darkness and extreme cold."},
    {"id": "battery", "name": "Battery Storage Module", "mass": 30, "draw": 0, "cost": 45, "supply": 80, "energy": 600, "tag": "STORED ENERGY", "detail": "High-density chemical battery pack with copper busbars and status LEDs. Stores energy for short bursts of high-demand science."},
    {"id": "hybrid", "name": "Hybrid RTG-Battery Core", "mass": 60, "draw": 0, "cost": 105, "supply": 140, "energy": 900, "tag": "CONTINUOUS & BURST", "detail": "Combines an RTG thermal generator with a rechargeable buffer battery. Powers all heavy scientific equipment simultaneously."}
  ],
  science: [
    {"id": "camera", "name": "Panorama Camera Mast", "mass": 12, "draw": 8, "cost": 25, "tag": "SURFACE IMAGING", "detail": "Rotating optical mast with motorized blue-glass lens, sun-shade baffle, and thermal insulation wrap."},
    {"id": "sampler", "name": "Articulated Sample Scoop", "mass": 28, "draw": 18, "cost": 45, "tag": "LAKE SAMPLING", "detail": "Three-joint robotic arm with hydraulic lines and a bronze scooping cup for collecting liquid hydrocarbon samples."},
    {"id": "lab", "name": "Mini Science Laboratory", "mass": 48, "draw": 35, "cost": 65, "tag": "DEEP INVESTIGATION", "detail": "Twin pressurized titanium sampling canisters, micro-spectrometer laser, and automated organic reagent analysis chamber."},
    {"id": "weather", "name": "Atmosphere & Weather Station", "mass": 20, "draw": 12, "cost": 35, "tag": "AIR & CLIMATE", "detail": "Ultrasonic anemometer, micro-barometer, and cryogenic thermometer mast analyzing Titan's nitrogen air and methane rain cycles."}
  ],
  radio: [
    {"id": "whip", "name": "Omni Whip Antenna", "mass": 8, "draw": 5, "cost": 20, "rate": 35, "tag": "SMALL & SIMPLE", "detail": "A flexible metal whip sends signals in every direction."},
    {"id": "dish", "name": "Parabolic Space Dish", "mass": 16, "draw": 12, "cost": 35, "rate": 90, "tag": "POINT TOWARD HOME", "detail": "Aim the curved reflector at Earth to concentrate the radio beam."},
    {"id": "array", "name": "Phased Array Panel", "mass": 28, "draw": 22, "cost": 55, "rate": 180, "tag": "ELECTRONIC STEERING", "detail": "Small antenna elements steer the beam electronically."}
  ]
};
export function validLoadout(value) {
  return !!value && typeof value==='object' && Object.entries(COMPONENTS).every(([group,items])=>items.some(item=>item.id===value[group]));
}
export function missionTotals(loadout) {
  const safe=validLoadout(loadout)?loadout:DEFAULT_LOADOUT;
  const items=Object.entries(COMPONENTS).map(([group,options])=>({group,...options.find(item=>item.id===safe[group])}));
  const mass=65+items.reduce((sum,item)=>sum+item.mass,0);
  const cost=50+items.reduce((sum,item)=>sum+item.cost,0);
  const demand=15+items.reduce((sum,item)=>sum+item.draw,0);
  const power=items.find(item=>item.group==='power');
  const issues=[];
  const capacity=items[0].capacity;
  if(mass>capacity)issues.push('Too heavy! Choose a larger rocket or lighter equipment.');
  if(cost>BUILDER_LIMITS.budget)issues.push('Over budget! Swap a part to save mission coins.');
  if(power.supply<demand)issues.push('Too little sunlight on Titan. Try the generator or battery pack.');
  return {items,capacity,mass,cost,demand,supply:power.supply,margin:power.supply-demand,hours:power.id==='battery'?power.energy/demand:null,issues,ready:issues.length===0};
}
