# Hands-on stations and trajectory map

The adventure now includes three original Canvas science challenges with native
range controls and buttons. No libraries, external scripts, downloaded sprites,
or remote data calls are required.

- **Moon / reflector:** hold the practice mirror within 3 degrees for three
  uninterrupted seconds, then observe a two-way pulse. The 2.56444-second
  illustrative delay is calculated as twice 384,400 km divided by 299,792.458
  km/s. Millimeter-level precision is a reference to real laser observatories,
  not a measurement made by the player's slider. Apollo arrays contain corner
  cubes; the flat practice mirror is a simplified pointing exercise. The
  fictional polar station is not an Apollo landing site.
- **Titan / lake:** match a reference waveform and identify both methane and
  ethane. Peak positions and strengths are original schematic teaching patterns,
  without physical wavelength units; they are not calibrated or measured VIMS
  spectra and cannot infer an actual lake composition. Reference methane and
  ethane are separate fingerprints, not claims that Titan's seas are pure liquids.
- **Mars / delta:** tap to maintain pressure between 35 and 70 percent. Excessive
  pressure heats the drill; overheating starts a recoverable cooling period,
  preserving core progress. Numerical pressure, temperature and drilling depth
  are normalized play values. Jezero geology motivates the activity.

The discovery is awarded only after completing the experiment and choosing
**Save my discovery**. Cancelling or leaving a half-finished experiment awards
nothing. Found discoveries remain serialized in the existing version-two save.
Other stations retain their earlier observation mechanic. Experiments respect
the sound toggle, reduced-motion preference and hidden-tab pause. Their active
time contributes to the existing energy and mission-time totals.

Titan has two adventure seas. Ligeia uses a gentle current; Kraken has 4.5 times
the game current, with a small varying cross-current. These are illustrative
world-units-per-second forces, not observed velocities or a hydrodynamic model.
Deploying stabilizers holds position and disables navigation; retract them to
sail. Stabilizer artwork is fictional station-keeping equipment. Currents pause
during station observations and transmission. Older saves default to Ligeia
with stabilizers retracted; saved Kraken selection and deployment survive reload.

The transit SVG uses circular coplanar two-body Hohmann transfers. Semi-major
axis a=(r1+r2)/2, eccentricity e=(r2-r1)/(r2+r1), coast time pi*sqrt(a³/mu).
Velocity changes follow vis-viva. Spacecraft motion solves Kepler's equation;
the target starts at pi-n2*T so the intercept occurs at the opposite apsis.
Display radii are rescaled; the spacecraft marker is tangent to the ellipse.
Moon: Earth-centered 200-km parking orbit to mean lunar distance. Mars:
Sun-centered Earth orbit to 1.523679 AU. Titan: Sun-centered Earth orbit to
9.58 AU at Saturn, then a labelled local Titan approach. The map does not solve
the escape/capture flybys, inclination, real ephemerides, launch windows or Titan
insertion. Cassini's actual gravity-assist trajectory is not this ellipse.
The ideal lunar transfer is not an Apollo flight reconstruction.

Titan receives a warm, low-contrast amber vignette. The Moon retains black space,
hard boulder/rover shadows and a faint blue surface-only Earth-light tint. Mars
receives an ochre sky and slowly drifting foreground dust. Reduced-motion mode
holds atmospheric dust still.

NASA / primary references:

- Mean lunar distance: https://science.nasa.gov/moon/by-the-numbers/
- Laser ranging and mm-level precision: https://ilrs.gsfc.nasa.gov/science/scienceContributions/lunar.html
- Cassini liquid ethane detection: https://www.jpl.nasa.gov/news/nasa-confirms-liquid-lake-on-saturn-moon/
- Infrared composition measurements: https://science.nasa.gov/mission/cassini/spacecraft/cassini-orbiter/visible-and-infrared-mapping-spectrometer/
- Jezero river delta: https://science.nasa.gov/resource/perseverances-route-to-the-delta-2/
- Hohmann trajectories and gravity assists: https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/
