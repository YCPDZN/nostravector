from pathlib import Path
import re
w=Path(__file__).resolve().parent;out=w.parent/'outputs'
def replace(name,old,new):
    p=w/name;s=p.read_text(encoding='utf-8');assert old in s,(name,old);p.write_text(s.replace(old,new),encoding='utf-8')
replace('eris.css','left:26px;bottom:94px','left:50%;top:136px;bottom:auto;transform:translateX(-50%)')
p=w/'eris.css';p.write_text(p.read_text(encoding='utf-8')+'''\n#empireSheet{z-index:46}#antarctica[data-eris-conversation="true"] #spaceHUD,#antarctica[data-eris-conversation="true"] #ecologyHUD,#antarctica[data-eris-conversation="true"] #expeditionHUD{visibility:hidden}#erisDialogue .polar-button{display:inline-block;margin:0 0 0 10px}#erisDialogue{text-align:right}#erisDialogue p,#erisDialogue .dialogue-identity{text-align:left}@media(max-width:800px){#empireHUD{left:50%;top:125px;bottom:auto;max-width:300px}}\n''',encoding='utf-8')
replace('eris_game.js','erisConversation={npc:n,lines:',"polarScreen.dataset.erisConversation='true';erisConversation={npc:n,lines:")
replace('eris_game.js','empireOpen=false;erisConversation=null;',"empireOpen=false;erisConversation=null;polarScreen.dataset.erisConversation='false';")
replace('build_eris_preview.py','erisPreview.z=25;erisPreview.cameraYaw=0;erisPreview.cameraPitch=.16;','erisPreview.z=-25;erisPreview.cameraYaw=0;erisPreview.cameraPitch=.22;')
replace('world_flight.js','if(Math.hypot(x-p.landingX,z-p.landingZ)<25)continue;',"if((p.body==='eris'&&Math.abs(x)<36&&Math.abs(z-70)<38)||Math.hypot(x-p.landingX,z-p.landingZ)<25)continue;")
p=w/'planet_landscapes.js';s=p.read_text(encoding='utf-8');at=s.index("  add('eris',");end=s.index('\n',at);s=s[:end]+"\n  add('dysnomia','ASHEN CROWN CRATERFIELDS','craters',44,195,[.59,.64,.74],'crater');"+s[end:];p.write_text(s,encoding='utf-8')
for name in ['test_space.js','test_planet_landscapes.js','test_world_flight.js']:
    p=w/name;s=p.read_text(encoding='utf-8').replace('49','50');p.write_text(s,encoding='utf-8')
p=w/'game_readme.txt';s=p.read_text(encoding='utf-8').replace('49 destinations','50 destinations').replace('All 49','All 50');s+='''
VISHARA ERISCONOS / ERISIAN EMPIRE
Vishara is a 200-part geometric cartoon queen, also provided as a standalone GLB and orbit viewer. In Chapter 1, a nameless figure appears near the Antarctic research station, flees within 24 metres, and disappears. Chapter 3 unlocks conversations on Eris or near the original Antarctic shelter. She spends 5 minutes at Eris, travels for 1 minute, spends 5 minutes on Earth and returns in 1 minute. There is one queen, with neither world containing her during transit. Her assistant at the citadel reports her absence. Timers pause with menus, conversations and the app in the background.

Eris and Dysnomia start as FACTION: ERISIAN. Every 30 minutes of active play, Haumea, Makemake and Sedna are annexed in that order, then the expansion stops. Pluto and every Pluto moon remain excluded. All other worlds begin as FACTION: UNCLAIMED. Visit the citadel via the Eris surface atlas at 0 degrees latitude / longitude. K opens the faction panel; Y talks to nearby court NPCs. Build field bases in unclaimed territory for 6 scrap and 4 fabric; they appear in the world and minimap. Existing bases survive annexation, but new construction is blocked on claimed worlds. These clocks, claims, bases and the cameo are per-character and save only with ESC > SAVE GAME. Existing saves migrate with a fresh empire clock.
''';p.write_text(s,encoding='utf-8')
p=w/'sol_sources.md';p.write_text(p.read_text(encoding='utf-8')+'\nDysnomia: Eris has one known moon, Dysnomia. NASA reference: https://science.nasa.gov/dwarf-planets/eris/ . No resolved surface map is available here; the dark icy craterfields, approximate game scale, Erisian faction and citadel are fictional artwork.\n',encoding='utf-8')
s=(out/'NOSTRAVECTOR_3D_Viewer.html').read_text(encoding='utf-8');s=re.sub(r'const parts=.*?;\nconst canvas',lambda m:'const parts='+ (w/'vishara_parts.json').read_text(encoding='utf-8')+';\nconst canvas',s,flags=re.S);s=s.replace('Cartoon astronaut · A-pose template','VISHARA ERISCONOS · Queen of Eris & Dysnomia').replace('Character template','Vishara Erisconos').replace('3D astronaut','3D queen').replace('NOSTRAVECTOR_Astronaut.glb','NOSTRAVECTOR_Vishara_Erisconos.glb').replace('let sy=.87*zoom','let sy=.80*zoom').replace('outline?.008:0','outline?.0015:0');(out/'NOSTRAVECTOR_Vishara_Viewer.html').write_text(s,encoding='utf-8')
replace('package_menu.py',"files+=['NOSTRAVECTOR_Vishara_Erisconos.glb'","sources+=['refine_eris.py']\nfiles+=['NOSTRAVECTOR_Vishara_Viewer.html','NOSTRAVECTOR_Vishara_Erisconos.glb'")
print('Improved UI placement, model viewer, citadel ground and documentation')
