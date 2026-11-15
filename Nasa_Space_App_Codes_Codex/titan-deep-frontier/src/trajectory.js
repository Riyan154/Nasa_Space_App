// Circular, coplanar two-body Hohmann model, not a mission ephemeris.
const AU=149597870700,DAY=86400;
export function hohmannTransfer(r1,r2,mu){
  if(![r1,r2,mu].every(v=>Number.isFinite(v)&&v>0)||r2<=r1)throw new Error('Expected increasing positive orbital radii');
  const a=(r1+r2)/2,e=(r2-r1)/(r2+r1),seconds=Math.PI*Math.sqrt(a**3/mu);
  const n1=Math.sqrt(mu/r1**3),n2=Math.sqrt(mu/r2**3);
  return {r1,r2,a,e,seconds,days:seconds/DAY,n1,n2,phase:Math.PI-n2*seconds,
    departure:Math.sqrt(mu*(2/r1-1/a))-Math.sqrt(mu/r1),
    capture:Math.sqrt(mu/r2)-Math.sqrt(mu*(2/r2-1/a))};
}
export function transferProfile(destination){
  const moon=destination==='moon',mars=destination==='mars';
  return {...(moon?hohmannTransfer(6571000,384400000,3.986004418e14):hohmannTransfer(AU,(mars?1.523679:9.58)*AU,1.32712440018e20)),
    central:moon?'Earth':'Sun',target:moon?'Moon':mars?'Mars':'Saturn',
    departureLabel:moon?'200 km parking orbit':'Earth’s orbit',
    arrivalLabel:moon?'Lunar intercept':mars?'Mars intercept':'Saturn intercept → Titan approach'};
}
export function transferPosition(profile,fraction){
  const u=Math.max(0,Math.min(1,fraction)),mean=Math.PI*u;
  let eccentric=Math.PI*u;
  for(let i=0;i<12;i++)eccentric-=(eccentric-profile.e*Math.sin(eccentric)-mean)/(1-profile.e*Math.cos(eccentric));
  return {eccentric,x:profile.a*(Math.cos(eccentric)-profile.e),y:-profile.a*Math.sqrt(1-profile.e**2)*Math.sin(eccentric),
    targetAngle:profile.phase+profile.n2*profile.seconds*u,earthAngle:profile.n1*profile.seconds*u};
}
export function trajectoryMarkup(destination){
  const p=transferProfile(destination),inner=Math.max(44,154*p.r1/p.r2),outer=154,a=(inner+outer)/2,b=Math.sqrt(inner*outer),cx=(inner-outer)/2;
  return `<div class="transfer-heading"><span>YOUR FLIGHT PATH</span><b>${p.arrivalLabel}</b><small>Top-down view · ${p.central}-centered</small></div>
  <svg viewBox="0 0 720 390" role="img" aria-label="${p.departureLabel}, Hohmann transfer ellipse and moving ${p.target} intercept">
    <defs><radialGradient id="transfer-star"><stop stop-color="#fff5cd"/><stop offset="1" stop-color="#d6a65a"/></radialGradient></defs>
    <g transform="translate(370 194)">
      <circle r="${outer}" class="target-orbit"/><circle r="${inner}" class="departure-orbit"/>
      <ellipse cx="${cx}" rx="${a}" ry="${b}" class="transfer-complete"/>
      <path d="M ${inner} 0 A ${a} ${b} 0 0 0 ${-outer} 0" class="transfer-route"/>
      <circle r="15" fill="${p.central==='Earth'?'#699cae':'url(#transfer-star)'}"/><text y="31" class="map-central">${p.central}</text>
      <g data-transfer-origin><circle cx="${inner}" r="6" fill="#8dccc4"/><text x="${inner+13}" y="5">${p.departureLabel}</text></g>
      <circle cx="${-outer}" r="13" class="intercept-ring"/>
      <g data-transfer-target><circle r="8" fill="${destination==='mars'?'#d99a75':'#d9d2ac'}"/><text x="14" y="4">${p.target}</text></g>
      <g data-transfer-ship><circle r="12" fill="#f3d99c18"/><path d="M 0 -7 L 5 6 L 0 3 L -5 6 Z" fill="#fff1c1" stroke="#d0ac67"/></g>
      <text x="-154" y="180" text-anchor="middle">INTERCEPT</text>
    </g>
    <g class="map-key"><circle cx="38" cy="35" r="4" fill="#86c6c2"/><text x="51" y="39">Departure orbit</text><circle cx="38" cy="59" r="4" fill="#f5d69b"/><text x="51" y="63">Transfer ellipse</text><circle cx="38" cy="83" r="4" fill="#beab85"/><text x="51" y="87">Target orbit</text></g>
  </svg>
  <div class="transfer-steps"><span data-transfer-step="0">① Boost</span><span data-transfer-step="1">② Coast</span><span data-transfer-step="2">③ Match orbit</span></div>
  <div class="transfer-stats"><span>Ideal coast<b>${p.days<365?p.days.toFixed(1)+' days':(p.days/365.25).toFixed(2)+' years'}</b></span><span>Departure Δv<b>${(p.departure/1000).toFixed(2)} km/s</b></span><span>Arrival Δv<b>${(p.capture/1000).toFixed(2)} km/s</b></span></div>
  <small class="transfer-note">Circular-orbit teaching model; orbit sizes rescaled. ${destination==='titan'?'Real Cassini used gravity assists; this diagram ends at Saturn.':destination==='moon'?'Ideal Earth-centered transfer, not an Apollo trajectory.':'No real-time launch window or ephemeris.'}</small>`;
}
export function updateTrajectory(host,destination,fraction,reduced=false){
  const svg=host.querySelector('svg'),viewBox=host.clientWidth<560?'170 0 430 390':'0 0 720 390';
  if(svg&&svg.getAttribute('viewBox')!==viewBox)svg.setAttribute('viewBox',viewBox);
  const p=transferProfile(destination),position=transferPosition(p,fraction),inner=Math.max(44,154*p.r1/p.r2),a=(inner+154)/2,b=Math.sqrt(inner*154),cx=(inner-154)/2;
  const heading=Math.atan2(-b*Math.cos(position.eccentric),-a*Math.sin(position.eccentric))*180/Math.PI+90;
  host.querySelector('[data-transfer-ship]')?.setAttribute('transform',`translate(${cx+a*Math.cos(position.eccentric)} ${-b*Math.sin(position.eccentric)}) rotate(${reduced?0:heading})`);
  host.querySelector('[data-transfer-target]')?.setAttribute('transform',`translate(${154*Math.cos(position.targetAngle)} ${-154*Math.sin(position.targetAngle)})`);
  host.querySelectorAll('[data-transfer-step]').forEach((node,i)=>node.classList.toggle('active',i===(fraction<.12?0:fraction<.9?1:2)));
}
