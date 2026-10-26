from pathlib import Path
w=Path('work')
p=w/'combat_crew_core.js';s=p.read_text(encoding='utf-8').replace("const ensure=s=>s.eris.combatCrew||(s.eris.combatCrew=fresh());", "const ensure=s=>{const e=s.eris||(s.eris=NVEris.fresh());return e.combatCrew||(e.combatCrew=fresh());};").replace("const q=NVCombatCrew.ensure(s);NVCombatCrew.register(q);return[...combatPartyList", "const q=s.eris?.combatCrew||NVCombatCrew.fresh();NVCombatCrew.register(q);return[...combatPartyList");p.write_text(s,encoding='utf-8')
p=w/'test_companion_combat_browser.js';s=p.read_text(encoding='utf-8');needle="const recruitment=await p.evaluate";s=s.replace(needle,"""await p.evaluate(()=>openCustomCrew());await p.locator('.crew-combat-loadout select').nth(0).selectOption('rifle');await p.locator('.crew-combat-loadout select').nth(1).selectOption('rapid');assert.deepEqual(await p.evaluate(()=>NVCustomCrew.ensure(polarState).characters[0].combat),{weapon:'rifle',pattern:'rapid'});await p.evaluate(()=>closeCustomCrew());
"""+needle)
s=s.replace("const james=NVCombatCrew.model('james',s);", "const independent=NVEris.restore({});if(independent.combatCrew.recruited.length||independent.combatCrew.pontifex.length)throw Error('Recruitment leaked across characters');const james=NVCombatCrew.model('james',s);")
p.write_text(s,encoding='utf-8')
