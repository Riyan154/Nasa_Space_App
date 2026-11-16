import {COMPONENTS} from './builder-model.js';
// All hardware specifications are fictional game-balancing values, not NASA designs.
export const DESTINATIONS = {
  titan: {id:'titan', name:'Titan', site:'Ligeia Mare', gravity:1.35, density:5.3, atmosphere:'Nitrogen–methane atmosphere', surface:'hydrocarbon sea', solarFraction:.01, irradiance:13.61, temperature:94, landing:'aeroshell, parachute and flotation skiff', patch:'Titan.jpg'},
  moon: {id:'moon', name:'Moon', site:'Shackleton Crater', gravity:1.62, density:0, atmosphere:'Hard vacuum', surface:'solid regolith', solarFraction:1, irradiance:1361, temperature:100, landing:'throttled descent engine, tripod legs and rover wheels', patch:'Moon.jpg'},
  mars: {id:'mars', name:'Mars', site:'Jezero Crater', gravity:3.71, density:.020, atmosphere:'Thin carbon-dioxide atmosphere', surface:'rocky basalt and dusty regolith', solarFraction:.43, irradiance:586, temperature:210,landing:'aeroshell, parachute and powered sky-crane descent',patch:'Mars.jpg'}
};
export const destinationOf = id => DESTINATIONS[id] || DESTINATIONS.titan;
export function instrumentForDestination(id,destination='titan'){
  const part=getPart('instruments',id);
  return part?.id==='seismic'&&destination==='moon'?{...part,science:45,data:90,description:'Ground-coupled seismometer measures moonquakes and reveals subsurface structure.',limitation:'Needs firm contact with regolith.'}:part;
}
export const DIFFICULTIES = {
  cadet: { name: 'Cadet', budget: 325, wind: 0.07, description: 'Room to experiment. Your first expedition.' },
  explorer: { name: 'Explorer', budget: 260, wind: 0.13, description: 'A tighter budget. Every choice counts.' },
  architect: { name: 'Architect', budget: 225, wind: 0.20, description: 'Lean engineering. A demanding landing.' }
};
export const LAKES = {
  ligeia: { name: 'Ligeia Mare', density: 480, wind: 0.04, description: 'A northern sea. A gentle first splashdown.', color: '#6db7bb' },
  kraken: { name: 'Kraken Mare', density: 520, wind: 0.16, description: 'Titan’s largest sea. More challenging waves.', color: '#b1a1da' },
  punga: { name: 'Punga Mare', density: 450, wind: 0.10, description: 'A smaller sea. Your hull must float in lighter liquid.', color: '#ddb66c' }
};
export const CATEGORIES = [
  { id: 'rocket', name: 'Rocket', title: 'Your adventure needs a lift.', text: 'A bigger rocket carries more, but leaves less money for discoveries.' },
  { id: 'power', name: 'Power', title: 'Bring a little sunshine.', text: 'Titan is far from the Sun. Choose how to keep your explorer awake.' },
  { id: 'instruments', name: 'Science', title: 'What will you discover?', text: 'Pick your tools. Bring a chemistry instrument and an environment sensor.' },
  { id: 'comms', name: 'Radio', title: 'Send a hello back home.', text: 'A stronger radio sends your discoveries home faster. It also needs more power.' },
  { id: 'navigation', name: 'Guidance', title: 'Find your way through space.', text: 'Fuel and careful steering help you reach the right spot.' },
  { id: 'shield', name: 'Protection', title: 'Ready for a fiery arrival?', text: 'A heat shield protects you on arrival. Insulation keeps the cold out later.' },
  { id: 'hull', name: 'Landing', title: 'Make a spaceship that floats.', text: 'Slow down with a parachute, then float on a sea of liquid methane.' }
];
export const FRAME = {id:'frame',name:'Pip Core Chassis · included free',mass:0,cost:0,draw:10};
export const CATALOG = {
  rocket: COMPONENTS.rocket.map((p,i)=>({...p,description:p.detail,icon:'rocket',reliability:[.96,.98,.985][i]})),
  power: [
    { id: 'solar', name: 'Solar wings', tag: 'Sunlight dependent', mass: 16, cost: 14, generation: 45, battery: 400, description: 'Sized for Titan’s faint sunlight. Use the battery for science.', icon: 'solar' },
    { id: 'advanced-solar', name: 'Giant solar wings', tag: 'Heavy & delicate', mass: 23, cost: 30, generation: 72, battery: 700, description: 'Huge panels gather more light. Run science one tool at a time.', icon: 'solar' },
    { id: 'rtg', name: 'Radioisotope core', tag: 'Steady explorer', mass: 13, cost: 44, generation: 110, battery: 550, description: 'Decay heat becomes electricity, even in the dark. Includes a separate battery.', icon: 'power' },
    { id: 'mmrtg', name: 'MMRTG core', tag: 'Long-haul power', mass: 19, cost: 56, generation: 145, battery: 850, description: 'Continuous radioisotope power with a larger separate battery.', icon: 'power' },
    { id: 'hybrid', name: 'Hybrid power pack', tag: 'Energy to spare', mass: 28, cost: 68, generation: 125, battery: 1800, description: 'An RTG with a big rechargeable battery for short bursts of science.', icon: 'power' }
  ],
  instruments: [
    ...COMPONENTS.science.filter(p=>['ground_radar','magnetometer'].includes(p.id)).map(p=>({...p,description:p.detail,science:p.id==='ground_radar'?0:25,objective:p.id==='ground_radar'?'mapping':'magnetic',limitation:p.id==='ground_radar'?'Designed for solid terrain.':'Does not collect rock samples.',icon:'radar'})),
    { id: 'spectrometer', name: 'Methane detective', tag: 'Lake chemistry', mass: 5.5, cost: 14, draw: 35, science: 25, data: 65, objective: 'chemistry', description: 'Look for the fingerprints of methane and ethane.', limitation: 'Needs a lake sample.', icon: 'sample' },
    { id: 'atmosphere', name: 'Atmosphere station', tag: 'Air & weather', mass: 3, cost: 8, draw: 15, science: 18, data: 30, objective: 'environment', description: 'Measure pressure and the nitrogen-rich air.', limitation: 'Local conditions only.', icon: 'sensor' },
    { id: 'temperature', name: 'Temperature probe', tag: 'Cold explorer', mass: 1.2, cost: 3.6, draw: 5, science: 10, data: 12, objective: 'environment', description: 'Discover just how cold the lake is.', limitation: 'One local temperature sample.', icon: 'sensor' },
    { id: 'pressure', name: 'Pressure sensor', tag: 'Under pressure', mass: 1.4, cost: 4, draw: 6, science: 10, data: 14, objective: 'environment', description: 'Feel the weight of Titan’s thick atmosphere.', limitation: 'Surface pressure only.', icon: 'sensor' },
    { id: 'chemistry', name: 'Lake laboratory', tag: 'Deep investigation', mass: 18, cost: 27, draw: 65, science: 40, data: 110, objective: 'chemistry', description: 'Study a richer set of organic compounds in the lake.', limitation: 'Large energy and data demand.', icon: 'sample' },
    { id: 'camera', name: 'Panorama camera', tag: 'A new perspective', mass: 7, cost: 12, draw: 25, science: 20, data: 90, objective: 'imaging', description: 'Capture an illustrated panorama of your landing site.', limitation: 'Haze limits visibility; images here are game art.', icon: 'camera' },
    { id: 'radar', name: 'Radar mapper', tag: 'Beyond the haze', mass: 24, cost: 24, draw: 85, science: 35, data: 140, objective: 'mapping', description: 'Probe the nearby lake and shoreline with radio waves.', limitation: 'High power; short local survey only.', icon: 'radar' },
    { id: 'seismic', name: 'Seismic sensor', tag: 'Needs solid ground', mass: 4.5, cost: 6, draw: 8, science: 0, data: 0, objective: 'seismic', description: 'Great on solid ground. A floating boat cannot make useful ground measurements.', limitation: 'Not suitable for this lake mission.', icon: 'sensor' }
  ],
  comms: [
    { id: 'basic', name: 'Explorer antenna', tag: 'Patient messenger', mass: 4.5, cost: 12, draw: 12, rate: 35, description: 'A small antenna. Each transmission takes more time.', icon: 'radio' },
    { id: 'gain', name: 'High-gain dish', tag: 'Home, loud & clear', mass: 9, cost: 19, draw: 25, rate: 80, description: 'A focused beam sends discoveries home faster.', icon: 'radio' },
    { id: 'advanced', name: 'Deep-space link', tag: 'Data express', mass: 15, cost: 28, draw: 40, rate: 150, description: 'Fast transmission with a hefty power demand.', icon: 'radio' }
  ],
  navigation: [
    { id: 'standard', name: 'Star tracker kit', tag: 'Careful steering', mass: 22, cost: 18, draw: 8, fuel: 6, accuracy: 0.76, description: 'Includes propulsion, fuel, navigation sensors, guidance and attitude control.', icon: 'navigation' },
    { id: 'precision', name: 'Precision pilot', tag: 'Confident arrival', mass: 30, cost: 28, draw: 10, fuel: 9.5, accuracy: 0.95, description: 'Better sensing and more fuel give you extra options in flight.', icon: 'navigation' }
  ],
  shield: [
    { id: 'light', name: 'Explorer shell', tag: 'Light protection', mass: 24, cost: 22, draw: 12, heatLimit: 2.4e6, insulation: 0.7, description: 'Aeroshell, heat shield and insulation. Choose a gentle entry.', icon: 'shield' },
    { id: 'reinforced', name: 'Aurora shell', tag: 'Extra reassurance', mass: 39, cost: 34, draw: 12, heatLimit: 4.5e6, insulation: 0.92, description: 'More heat protection and insulation, but more mass.', icon: 'shield' }
  ],
  hull: [
    { id: 'skiff', name: 'Lake skiff', tag: 'Travel light', mass: 21, cost: 24, volume: 0.3, area: 10, stability: 0.18, description: 'A compact flotation hull, stabilizers and a 10 m² parachute.', icon: 'hull' },
    { id: 'catamaran', name: 'Twin-hull voyager', tag: 'Steady on the sea', mass: 34, cost: 36, volume: 0.46, area: 15, stability: 0.37, description: 'Wide twin floats, active stability and a 15 m² parachute.', icon: 'hull' }
  ]
};
export function getPart(category, id) { return CATALOG[category]?.find(part => part.id === id); }
export function starterDesign() {
  return { rocket: 'atlas', power: 'rtg', instruments: ['spectrometer', 'temperature'], comms: 'basic', navigation: 'standard', shield: 'light', hull: 'skiff' };
}
