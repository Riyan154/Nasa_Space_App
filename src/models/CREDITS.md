# Mission Lab spacecraft references

Both GLB files are from NASA's Cassini–Huygens (A) collection, credited by NASA to NASA/Brian E. Kumanchik.

- `cassini-huygens.glb` is the combined spacecraft model, downloaded from the NASA Science asset host.
- `huygens.glb` is “Cassini-Huygens (A) (without Cassini).glb”, downloaded from the linked NASA-3D-Resources GitHub mirror.
- Source and downloads — https://science.nasa.gov/3d-resources/cassini-huygens-a/
- Media guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/

The files are retained in their original form. Pip's selectable equipment and game ratings are authored separately.

The viewer is Google's model-viewer 4.1.0, bundled locally under Apache 2.0. Its license is in `../vendor/model-viewer-LICENSE.txt`. The bundled file retains its upstream notices.

The models use Draco mesh compression. Google's Draco 1.5.6 decoder and its Apache 2.0 license are bundled in `../vendor/draco/`. The existing DM Sans and Space Grotesk site fonts are bundled in `../vendor/fonts/` with their SIL Open Font License notices.

Workshop structure adapts the science-first design approach described by NASA's Webb Build It Yourself learning game and the iterative feasibility/trade-space/point-design progression in Wessen et al., “Space Mission Concept Development Using Concept Maturity Levels.” Power and communications test activities are educational adaptations informed by CubeSat 101 (October 2017), sections 2.4, 2.10 and 2.11.

Model component descriptions — https://science.nasa.gov/mission/cassini/spacecraft/cassini-orbiter/ and https://science.nasa.gov/learn/basics-of-space-flight/huygens/

The power test uses two hours of constant housekeeping + instrument + radio demand. The downlink test sends 180 fictional units at the selected radio's fictional rate. Each test starts with the selected battery fully charged. Test animation time is compressed. Hardware performance and credit values belong to the game.
