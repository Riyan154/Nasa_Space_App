export const COMPONENT_INFO={
 scout:['🚀','A bouncy lightweight booster! Carry light gear and save mission coins for cool science tools.',['Light payloads','All worlds']],
 atlas:['🚀','The dependable space workhorse! Carries a balanced mix of cameras and power equipment.',['Balanced payloads','All worlds']],
 titan:['🚀','The super-lifter! Three booster cores haul giant laboratories and heavy power packs across space.',['Heavy payloads','All worlds']],
 solar:['☀','Drinks sunshine to make electricity! Great on sunny Moon rims, but sleepy under Titan’s thick cloudy sky.',['Sunlit Moon','Mars daylight']],
 rtg:['⚛','A warm atomic power core! Decay heat makes steady electricity through freezing alien nights. It is a generator, not a battery.',['Titan','Dark places']],
 battery:['🔋','A lunchbox of stored electricity! Rechargeable batteries run your explorer for a short trip, but eventually need more energy.',['Short trips','Shadow backup']],
 hybrid:['⚡','The ultimate power combo! An RTG makes steady electricity while a big battery supplies bursts for hungry science tools.',['Big science kits','Long nights']],
 camera:['📷','Voyager’s robotic eye! Snaps landscape pictures of alien craters, mountains, and shores.',['Panoramas','All worlds']],
 sampler:['🦾','A robotic arm with a scoop and coring head! Grab lake liquid on Titan or collect rock cores on Mars.',['Titan liquids','Mars rock cores']],
 lab:['🧪','A whole chemistry lab in a box! Tests alien samples for organic molecules—the ingredients scientists love to investigate.',['Sample science','Titan and Mars']],
 ground_radar:['📡','Sends radio pulses underground to look for hidden layers and ice. It needs solid ground, so a floating boat cannot use it.',['Moon ice search','Mars layers']],
 magnetometer:['🧲','A long sensor boom feels invisible magnetic fields and space weather. It helps us learn what surrounds a world!',['Titan space weather','Moon crust']],
 weather:['🌡','Measures wind, air pressure, and chilly temperatures! The Moon has no air for wind or pressure readings.',['Titan weather','Mars air']],
 seismic:['〰','Listens for quakes and vibrations traveling through rock! It needs firm ground beneath its feet.',['Moonquakes','Marsquakes']],
 whip:['📶','A bendy antenna talks to Earth slowly while using very little electricity.',['Save power','Patient pilots']],
 dish:['📡','A focused dish points toward Earth to send pictures home quickly. Bigger signals need more power.',['Fast pictures','All worlds']],
 array:['🛰','A clever flat antenna steers radio beams electronically with no moving parts! It sends lots of data quickly.',['Big data','Strong power supply']]
};
export function componentInfoMarkup(part,group){const info=COMPONENT_INFO[part.id];if(!info)return '';const [icon,body,tags]=info;return `<div class="component-guide" data-category="${group}"><span class="component-category">${group.toUpperCase()}</span><div class="component-guide-icon" aria-hidden="true">${icon}</div><canvas id="component-info-art" width="360" height="200" aria-label="Illustration of ${part.name}"></canvas><p>${body}</p><h3>Where is this useful?</h3><div class="component-use-tags">${tags.map(tag=>`<span>${tag}</span>`).join('')}</div></div><button class="play-button" data-game="close">Got it! →</button>`;}
