# Payloads, field guides and rewards

The simple builder starts empty: 0 kg, 0 MC spent, 300 MC available. The installed free core is shown as a component and draws 10 W. Three launchers offer 170/240/310 kg of capacity at 50/80/115 MC. Hardware ratings are fictional balancing values.

Science uses the legacy `science` primary string plus an optional `scienceTools` array. Arrays are validated, cloned and summed without double-counting the primary. Old single-tool saves remain valid. Removed Horizon/Deep launchers migrate to Cosmic Titan. Existing earned discoveries are retained. The engineering console also migrates its previous payload scale once using `sizingVersion: 2`.

| World | Full-survey tools | Power | Total cost |
| --- | --- | --- | --- |
| Titan | Camera, scoop, weather | RTG | 255 MC |
| Moon | Camera, scoop, seismometer | Solar | 215 MC |
| Mars | Camera, scoop, weather, seismometer | Solar | 250 MC |

These explicit suggested kits use Sky Hopper and the whip antenna. Nothing is selected automatically on a fresh game. The lab combines camera and sample functions; it does not replace weather or seismic sensing. Partial payloads can launch when at least one objective is equipped. Missing research remains disabled until the player repacks and relaunches; the journal is preserved.

The ground sounder maps solid terrain and earns supplemental science on Moon/Mars. Its zero Titan game score reflects its intended ground-contact survey, not a claim that all radar fails in liquid methane: Cassini measured sea depths by radar. The magnetometer studies Saturn interactions and lunar crustal fields; Mars has local crustal magnetism but no global dynamo. Neither new tool replaces a scoop or camera.

Welcome information icons open a separate NASA field guide without changing destinations. Facts distinguish Titan surface pressure from air density and avoid claiming perpetual illumination of a single Shackleton rim point or confirmed life on Mars.

After all five discoveries and downlink, the reward downloads an unchanged bundled NASA JPEG. Radar products and enhanced-color mosaics are labeled. Sources and credits are in [rewards/CREDITS.md](../src/rewards/CREDITS.md). No NASA endorsement or official Space Apps award is implied.

The launch campus includes striped latticework, retracting umbilicals, steam, dual trenches, floodlights, range clock, tracking dishes and moving service vehicles. World-space wakes and tread tracks expire and are excluded from saves. Reduced motion suppresses trails, suspension animation, shake and animated particles. Canvas backing stores account for device pixel ratio. The builder uses one document scroll, and dialogs use one bounded internal scroll.
