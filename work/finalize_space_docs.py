from pathlib import Path
root=Path(__file__).resolve().parents[1];work=root/'work'
p=work/'game_readme.txt';s=p.read_text(encoding='utf-8')
s+='''

SOL SYSTEM / CHAPTER 03
At the African spaceship, press F or BOARD SPACESHIP. Orion boards if recruited.
SPACE launches into orbit. M opens the Sol chart with 48 destinations and the requested
game categories. Select a destination and SET COURSE for guided travel, or pilot freely
with W/S throttle, A/D yaw, arrows pitch, Q/E vertical thrust, SHIFT boost and SPACE brake.
P toggles guidance; L begins the approach when close. Every world supports landing and
takeoff; giant planets use floating cloud platforms. F boards again near your ship.

On solid worlds, G gathers scrap from new sectors. X repairs the hull using a repair kit
or two scrap. The asteroid belt, Kuiper belt, planet proximity and solar heat can damage
the hull. If disabled, repair or use the emergency tow back to Earth orbit. Charon has
a station: reach its amber airlock and press T to open it, service your ship, and collect
its supply cache. The interior can be explored on foot.

Manual saves preserve flight phase, position, course, hull, visited worlds and Orion
for each character. Nothing saves automatically. ESC > SAVE GAME is still required.

NASA maps are embedded for all eight planets and major moons. Distances/sizes are
compressed for gameplay; landing terrain is generated. Small uncharted moons and distant
dwarf worlds have interpreted surfaces. See NOSTRAVECTOR_Sol_Sources.md for references.
'''
p.write_text(s,encoding='utf-8')
(root/'outputs/NOSTRAVECTOR_Sol_Sources.md').write_text((work/'sol_sources.md').read_text(encoding='utf-8'),encoding='utf-8')
print('Updated Sol controls, scope, and NASA asset attribution.')
