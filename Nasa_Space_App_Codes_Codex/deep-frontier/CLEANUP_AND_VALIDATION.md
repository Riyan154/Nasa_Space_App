# Cleanup and validation — 2026-11-15

All changes are local. Runtime dependencies remain zero. `dist/` was regenerated with `npm run build`.

## Removed

- Unused transit-duration constant, imported cruise constants, unused science-warning import, obsolete space renderer, and unused rover drawing callsign argument.
- Duplicate modal-cancel listener and retired telemetry-modal markup (reference science data and chart helpers remain test-covered).
- CSS for the deleted footer, scene credits, welcome badges, old parts tray, old manual tabs, retired medals, and telemetry overlay. Identical redundant declarations were removed within matching stylesheet scopes. `adventure.css` fell from 41,699 to 40,229 bytes despite the new Storybook/failure styles.
- Unused WASM MIME configuration. No third-party model-viewer.min.js, Draco decoder, or WASM-loader references remain in entry/build/server scripts or the rebuilt distribution.

## Deliberately retained

- Native Canvas NASA inspection viewer: the advanced workshop actively uses this custom element. Its reconnect controller is now renewed after disconnect.
- Legacy engine/catalog functions and save aliases that still have live routes, save migration consumers, or scientific tests. Older saves and approved eight-spoke wheel art are preserved.
- Builder callout CSS: `label-power`, `label-science`, `label-radio`, and `label-rocket` are generated dynamically. They are not orphaned classes.
- Bundled NASA GLBs, decoded geometry, fonts, licenses, source references and user backups.

## Updated behavior

- Deterministic, bounded 1.8-second explosions: radial flash, eight plasma lobes, 46 fragments, 72 ember trails, smoke and decaying camera shake. Reduced motion substitutes a stationary fade. Friendly recovery actions keep equipment intact.
- Four illustrated Storybook cards with bounded navigation, progress dots and immediate close. Closing clears the modal DOM; unmount cancels RAF, aborts listeners, disconnects observers and clears runtime collections.
- Audio owns every oscillator, buffer source, gain and filter. Short effects release on completion; close stops/disconnects the graph and is idempotent. Includes a 42 Hz engine, brown noise, gas hiss, telemetry, chimes and layered explosion audio.
- Capsule foil seams, sensor glass, rivets, RCS bells/exhaust, broken satellite wires, spent-booster markings/nozzle and rover suspension springs. Existing detailed launch, terrain and approved wheel art retained.
- Fixed 1200×700 gameplay coordinates remain proportional; the welcome screen retains its previously requested edge-to-edge cover fit. Numeric viewport inputs are bounded to prevent invalid backing stores.

## Evidence

- `npm test`: **98 passed, 0 failed**, with no runtime warnings or unhandled rejections in the suite.
- `npm run build` and `git diff --check`: passed.
- Controller integration tests exercise the actual delegated handlers for overweight launch/explosion/workshop recovery, four-hit hull failure/retry/menu, all three destinations' skip action, Storybook navigation/close and disposal.
- Audio tests cover synthesis methods, immediate mute, missing AudioContext, pause, all-node disconnection and source stopping.
- Browser: all four Storybook cards advanced successfully, close returned to the Moon welcome screen. At 360×780 the modal measured 331×587 with no horizontal overflow.
- Cross-device 60fps and long-duration heap behavior have not been benchmarked. Unit tests and a short browser check cannot establish either guarantee.
