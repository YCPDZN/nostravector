# NOSTRAVECTOR — Sol assets and scope

The browser game includes 48 selectable destinations: eight planets, six dwarf-world game entries, and 34 moons. All destinations support a guided or manual approach, descent, exploration on foot, and takeoff. Jupiter, Saturn, Uranus, and Neptune use fictional floating cloud platforms because these giant planets have no solid landing surface. Charon has a fictional station with a walkable interior, hull servicing and a one-time supply cache.

The Sol planet and major moon color maps come from NASA's public 3D resource downloads. Matching NASA UV geometry is retained for the Mercury, Jupiter and Saturn atlas textures. Web copies are compressed to keep the complete game usable offline. The precise download URLs are recorded in `source/work/sol-assets/sources.json` in the ZIP. The Moon's map comes from NASA's Lunar Reconnaissance Orbiter CGI Moon Kit.

- [NASA 3D Resources](https://science.nasa.gov/3d-resources/)
- [NASA planets overview](https://science.nasa.gov/solar-system/planets/)
- [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/)
- [NASA Uranus moons](https://science.nasa.gov/uranus/moons/)
- [NASA Neptune moons](https://science.nasa.gov/neptune/moons/)
- [NASA Pluto moons](https://science.nasa.gov/dwarf-planets/pluto/moons/)
- [NASA Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/)
- [NASA Neptune facts](https://science.nasa.gov/neptune/neptune-facts/)
- [NASA Jupiter facts](https://science.nasa.gov/jupiter/jupiter-facts/)
- [NASA media usage guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/)

This is a playable browser prototype with compressed planet sizes and travel distances, fixed orbital positions, animated rotation, and generated local landing terrain. Surface elevations are procedural environments, not NASA topographic surveys. Atmospheric descent blends between the orbital scene and a local terrain scene; it does not simulate a full spherical planetary surface. Small moons and distant worlds without resolved maps use artistic surface interpretations.

Requested labels are retained as game categories. Titan's “paradise moon” label does not change its orange haze, cold ice and methane lakes into an Earth-like environment. Ganymede is slightly larger than Mercury in physical radius; neither exact physical scale nor real orbital speeds are represented by the compressed flight system. Sedna has the requested “dwarf planet” game label; NASA's list of officially recognized dwarf planets contains Ceres, Pluto, Haumea, Makemake and Eris.

The asteroid and Kuiper belts contain more closely spaced obstacles for gameplay than the real belts. Segment collision checks prevent fast ships passing through an asteroid without damage. Hull repairs consume inventory; emergency towing prevents an unrecoverable damaged save. The Sun also damages a ship that approaches too closely.

Progress, crew recruitment, visited worlds, hull integrity, flight phase, course, landing location, time and station services belong to the selected character. Boarding, travelling, landing, collecting resources and returning to the main menu never save progress automatically. Use **ESC → SAVE GAME**.

- Enceladus: https://science.nasa.gov/saturn/moons/enceladus/ — bright white ice, geysers and a subsurface ocean; roughly 500 km across. Fictional ocean ecosystem and terrain, procedural orbital appearance.

Dysnomia: Eris has one known moon, Dysnomia. NASA reference: https://science.nasa.gov/dwarf-planets/eris/ . No resolved surface map is available here; the dark icy craterfields, approximate game scale, Erisian faction and citadel are fictional artwork.
