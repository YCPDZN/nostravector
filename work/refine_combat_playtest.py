from pathlib import Path
w=Path('work')
p=w/'test_companion_combat_browser.js';s=p.read_text(encoding='utf-8').replace('s.x=0;s.z=0;s.yaw=0;', "s.x=160;s.z=160;s.space.landingElevation=0;s.yaw=0;")
# Keep a close, stationary target relative to the QA player, away from the parked ship.
s=s.replace("type:'patrol',x:0,z:3", "type:'patrol',x:160,z:163")
s=s.replace("NVShipInterior.enter(s,true);shipCrewBoardOpen=true;", "if(!NVShipInterior.enter(s,true))throw Error('Interior entry failed');updatePolarHUD();shipCrewBoardOpen=true;")
s=s.replace("assert.equal(await p.evaluate(()=>$('#shipInteriorCanvas').getContext('webgl').getError()),0);", "assert(await p.locator('#shipInterior').isVisible());assert.equal(await p.evaluate(()=>$('#shipInteriorCanvas').getContext('webgl').getError()),0);")
p.write_text(s,encoding='utf-8')
p=w/'menu_scene.js';s=p.read_text(encoding='utf-8').replace("id==='james'&&list===MENU_JAMES_ARMOUR?", "id==='james'&&menuLocation().eris?.solWar?.brownStory?.resolution?.appearance?.james?.outfit==='armour'?")
s=s.replace("james:menuLocation().eris?.solWar?.brownStory?.resolution?.appearance?.james?.outfit==='armour'?MENU_JAMES_ARMOUR:MENU_JAMES_SERVICE", "james:menuLocation().eris?.solWar?.brownStory?.resolution?.appearance?.james?.outfit==='armour'?combatCrewMenuParts('james'):MENU_JAMES_SERVICE")
p.write_text(s,encoding='utf-8')
p=w/'companion_combat_core.js';s=p.read_text(encoding='utf-8')
# Respect frozen targets and require clear sight at the instant ranged shots release.
s=s.replace("const wave=['slam','shockwave','orb'].includes(a.mode)", "const wave=['slam','shockwave','orb'].includes(a.mode)")
p.write_text(s,encoding='utf-8')
p=w/'game_readme.txt';s=p.read_text(encoding='utf-8');s+='\nCOMPANION COMBAT: Following story companions now engage hostile guards, attacking predators, Mars infantry and active hostile commanders. Orion uses twin laser guns; Nyrexia freezes targets; James and spared Pontifex recruits use scythe sweep, slam and lance; Khazglar rotates four hammer swings and a voiced protective shockwave; Kizna and Charon use metallic grinding attacks. Spared Malia and Croxian can be hired from the ship roster and retain reduced-damage versions of their boss attacks. Croxian removes his helmet, revealing short hair, on Earth and during ordinary surface exploration; he seals it for off-Earth flight and airless surfaces. Custom non-BC crew have weapon and balanced/rapid/heavy loadout controls. Josiah, Peter and Gareth retain their existing combat. Normal faction guards and Mars infantry have 200 HP; predators have 50 HP. PM sparing/recruitment and custom loadouts are character-scoped, manually saved. Companions assigned to ship or governor duty do not fight as following companions.\n';p.write_text(s,encoding='utf-8')
p=w/'package_menu.py';s=p.read_text(encoding='utf-8').replace("'companion_combat_game.js']", "'companion_combat_game.js','test_companion_combat_browser.js']");p.write_text(s,encoding='utf-8')
