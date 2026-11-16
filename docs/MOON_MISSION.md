# Three destinations, one explorer

The adventure in `src/adventure.js` uses native Canvas, JavaScript modules and Web Audio. It adds no packages, remote scripts or external assets. All three expeditions run offline; NASA links are optional reading. The advanced lab uses a native Canvas triangle renderer and exported NASA model geometry, replacing the old third-party model-viewer and runtime Draco decoder. Original GLBs and attribution are preserved; materials are simplified. The old libraries are backed up outside this game folder in `../TITAN-viewer-library-backup`.

Choose Titan, the Moon or Mars on the welcome screen, then build an empty spacecraft kit. Continue always resumes the saved destination, even if the welcome selector has changed. Starting again uses the selected destination. Existing version-2 saves without a destination become Titan saves; their equipment and discoveries are preserved. New statistics default to zero for older saves. The historic `lake` stage and `floats` assembly flag remain serialized for compatibility; the Moon and Mars render a rover and solid terrain for these checkpoints.

Titan has an aeroshell/parachute arrival and twin flotation skiffs. The Moon has a powered, retrograde terminal approach, deploying tripod legs and a wheeled rover rollout. The lunar trajectory compresses a 70-second, 1-km terminal descent into 12 seconds, followed by two seconds of rollout. Required thrust counters 1.62 m/s² gravity plus the commanded deceleration; aerodynamic drag and parachute force are zero. The Moon uses cached crater bowls, rock faces, regolith grain and long boulder shadows rather than wavy contour backgrounds. The rover keeps its three-wheel layout and eight open spokes. Original Canvas artwork adds contained tread, recessed shaded rims and six brass-hub bolts; spokes and tread rotate together while rim lighting stays fixed. This is a teaching trajectory, not a flight-certified orbital simulation.

Mars adds a 16-second illustrated entry, parachute, powered descent, sky-crane lowering and flyaway sequence. Jezero has rusty regolith, dry branching channels, crater rims and five fictional research stops: iron oxides, the ancient river delta, thin CO₂ air, marsquakes and wind-shaped dunes. The environment uses approximate 3.71 m/s² gravity, 0.020 kg/m³ air density, 210 K and 586 W/m² sunlight; real conditions vary with location, season, altitude and dust. Solar Wings produce 95 game watts on Mars. All hardware, timelines, traverses and scores are simplified for play. Mars uses the bundled `src/rewards/Mars.jpg` debrief artwork.

NASA Mars references:

- Planet facts and atmosphere: https://science.nasa.gov/mars/facts/
- Ancient delta: https://science.nasa.gov/resource/perseverances-route-to-the-delta-2/
- Marsquakes and interior science: https://science.nasa.gov/mission/insight/
- Entry, parachute and sky crane: https://science.nasa.gov/planetary-science/programs/mars-exploration/mission-timeline/how-we-land-on-mars/

Sunlit lunar panels deliver 180 **game** watts, falling to zero in the marked shadow zone. Titan panels provide 45 game watts. All kits have a buffer battery for short shadow excursions; the adventure has no battery failure timer. The debrief integrates the configured equipment's W over active play seconds / 3600 to report consumed Wh, not net generation. Dialogue, background time, home and assembly do not consume energy. Science, mass, price and rating are illustrative game values. The seismometer earns a lunar geophysics bonus and completes its local experiment faster; aboard a Titan boat it has no ground-coupled seismic value. Every discovery requires an installed tool; multiple tools can be packed. An explicit full-survey kit fits the budget on each world, and repacking preserves collected discoveries. Ground radar and magnetometer add optional supplemental science with destination-specific limits.

The ~1% Titan solar illumination is a requested teaching approximation to the Sun's reduced irradiance near Saturn, not a validated surface light model through Titan's haze. The Moon's 1361 W/m² value applies to direct sunlight perpendicular to the Sun, not an average horizontal polar-panel output. Terrain shadows and panel orientation matter in reality.

NASA references used in the lunar field journal:

- Dust charging, abrasion, impact glass: https://www.nasa.gov/missions/artemis/nasas-coating-technology-could-help-resolve-lunar-dust-challenge/
- Shackleton's illuminated rim and shadowed interior: https://science.nasa.gov/resource/shackleton-craters-illuminated-rim-shadowed-interior/
- Cold traps and possible ancient ice: https://www.nasa.gov/missions/lro/nasa-moon-camera-mosaic-sheds-light-on-lunar-south-pole/
- Deep tidal and near-surface thermal moonquakes: https://science.nasa.gov/moon/moonquakes/
- Apollo laser ranging and millimeter precision: https://ilrs.gsfc.nasa.gov/science/scienceContributions/lunar.html
- Synchronous rotation and Earth viewing: https://science.nasa.gov/moon/facts/

The five stations are fictional locations inspired by Apollo and Artemis science, not a claim that Apollo landed at Shackleton. Ice has not been measured at the exact fictional station. Earth sits near the polar horizon with slight libration, rather than rising daily. Star visibility and Earth size are exaggerated for readability. Audio is synthesized cockpit feedback; sound does not travel through the lunar vacuum. Reward artwork reuses the bundled `src/rewards/Moon.jpg` and `Titan.jpg`.
