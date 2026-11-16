# Transit, gallery and signal update

Chapter 3 now runs for 30 seconds of visible, unpaused play. Arrow keys, WASD and the touch D-pad move the capsule on both axes. Debris impacts are nonfatal, with a five-second warning and brief immunity. Skip to Landing is always available. Finishing the full flight without hits earns 15 Evasive Pilot science points at mission completion, saved in the pilot logbook. Skipping never earns this bonus. Cruise position, elapsed time, random seed, obstacles and hits survive a save/reload.

The orbital inset retains the ideal Hohmann model and follows the cruise timer. The debris field is an arcade challenge, not a reconstruction of asteroid density or actual flight hazards. Reduced motion freezes decorative rotations, twinkling and thruster flicker; obstacles still move because dodging is the interaction.

The main header now has a persistent sound toggle. The former Real NASA Telemetry trigger was removed. Its underlying reference datasets remain available in source for educational reuse.

NASA pictures queries the active world. Queries try the requested combined terms; NASA's public search returned zero results for a literal Boolean OR query during verification, so empty responses fall back to individual Apollo/Artemis/LRO or Perseverance/Curiosity/Jezero searches, merged and deduplicated. Each world has its own 24-hour cache and seven-day stale fallback. Existing Titan cache keys remain compatible. Metadata, image type labels, official source links, URL validation, timeouts and storage failure handling remain intact.

Signal visualization shows a representative one-way delay: Moon ~1.3 seconds (384400 km / 299792.458 km/s), Mars ~14 minutes, Titan ~82 minutes. These are not live ephemeris results. Planetary distances vary; the named DSN relays are illustrative and game transmission/confirmation time is compressed.

- [NASA: Mars relay network and variable light time](https://science.nasa.gov/mars/mars-relay-network/)
- [NASA: Cassini light-time range](https://science.nasa.gov/solar-system/resources/faq/what-time-is-it-in-space/)
- [NASA Image and Video Library API documentation](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf)

In the Moon's shadow zone, Pip switches on twin headlights (8 additional game watts), Solar Wings generate zero power, and the buffer battery discharges. Leaving the shadow turns off the lamps and allows surplus solar power to recharge the buffer. Indigo darkness and cones are local artistic illumination, not a lunar atmosphere.

Validation: npm test; npm run build. Browser checks covered the live Moon gallery, main sound toggle, shadow/headlights, launch-to-cruise handoff, touch steering and immediate skip to lunar descent.
