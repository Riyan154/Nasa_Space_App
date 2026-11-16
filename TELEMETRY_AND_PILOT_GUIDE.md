# Pilot systems and NASA benchmark provenance

The welcome-screen **Pilot Logbook** tracks independent expeditions on this browser under `deepfrontier.pilot.logbook`. Existing `titan.adventure.v2` saves migrate without resetting progress. A stable expedition ID prevents replaying the ending or reloading from duplicating totals. Active expedition snapshots replace themselves; completed records are immutable. The best science score per destination retains the callsign and completion date. This version cannot recover older missions that were never archived.

Collect five discoveries and downlink to earn a patch. A clean expedition earns three stars; overheating, battery depletion, and aborted/repacked expeditions each cost one star category, to a minimum of one. Science rank thresholds are 100, 250 and 400 points. The logbook counts discoveries and science after downlink; energy and active mission time include underway expeditions. Time is active play time, not real interplanetary flight duration.

**Astronaut Academy** opens from How to play. Three illustrated pages explain building, transfers, landing and research, with buttons, tabs, SVG diagrams and bounded navigation.

**Real NASA Telemetry** opens during transit, descent and exploration. Both charts share SI axes. The game pauses behind the dashboard. All chart data are bundled; no network or external chart library is needed. Data links remain available for verification.

## Titan: measured samples

Source: NASA PDS Atmospheres Node, Huygens HASI archive, `HP-SSA-HASI-2-3-4-MISSION-V1.1`, product `HASI_L4_ATMO_PROFILE_DESCEN`, generated 2006-08-31. Observations: 2005-01-14.

- [Original 1816-row semicolon-separated table](https://pds-atmospheres.nmsu.edu/PDS/data/hphasi_0001/DATA/PROFILES/HASI_L4_ATMO_PROFILE_DESCEN.TAB)
- [PDS labels defining columns and units](https://pds-atmospheres.nmsu.edu/PDS/data/hphasi_0001/DATA/PROFILES/HASI_L4_ATMO_PROFILE_DESCEN.LBL)

`HASI_SAMPLES` preserves every 60th source row (zero-based) and the last row, with altitude in meters, temperature in kelvin, and pressure in pascals. At the final sample (3 m), temperature is 93.5027 K and pressure is 146645 Pa. The chart connects subsampled measurements. Pip's comparison is explicitly a simplified teaching model, not calibrated telemetry.

## Moon: published dimensions, schematic section

- [NASA NTRS: LOLA Shackleton measurements, Table 1](https://ntrs.nasa.gov/api/citations/20120009640/downloads/20120009640.pdf)
- [NASA GSFC high-resolution LOLA terrain products](https://pgda.gsfc.nasa.gov/products/78)

The bundled cross-section is a schematic constrained by 21 km rim diameter, 1.3 km mean rim height above datum, and 4.1 ± 0.05 km mean rim-to-floor depth. Its floor at −2.8 km is derived using those dimensions. It is **not an extracted LOLA track or an authentic DEM transect**. The requested +1200 / −4200 m pair would imply a 5.4 km depth using one datum, inconsistent with this source. A future true transect requires bundling and sampling a specified georeferenced LOLA product and recording its endpoints and datum.

## Mars: mission event benchmarks

- [NASA/JPL Mars 2020 landing press kit](https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/)
- [NASA powered-descent diagram](https://science.nasa.gov/resource/powered-descent-for-perseverance-illustration/)

Rounded event anchors illustrate the seven-minute EDL sequence, chute deployment near 11 km, powered descent near 2100 m, and sky crane near 20 m. These are educational event benchmarks, **not a sampled post-flight sensor archive**. Pip's compressed landing uses a separate teaching curve. Exact event times and conditions differ between planning references and reconstructed flight data.

## Sound and accessibility

Destination ambience is synthesized using Web Audio oscillators, a 450 Hz lowpass filter with a 0.08 Hz LFO, suspended pentatonic chords, stereo panning and a filtered-noise Mars breeze. No audio files or npm packages are used. Sound starts after user interaction, mutes immediately, and suspends on dialogs, page hiding and window blur. Missing Web Audio support leaves the game playable.

Pip's visor prioritizes completion, hazard, science, movement, then idle. Reduced motion disables blinking, jitter and scanning movement. Telemetry includes accessible data tables and source links; charts stack on narrow screens.
