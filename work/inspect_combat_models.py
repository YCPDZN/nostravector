from pathlib import Path
import json,re
for f,key in [('karribassa_boss_models.js','KarribassaBossModels'),('brown_companion_armour.js','BrownCompanionArmour'),('pontifex_model.js','PontifexModel')]:
 s=Path('work',f).read_text(encoding='utf-8');m=json.loads(s[s.index('=')+1:].strip().rstrip(';'))
 if f.startswith('karr'):m=m['croxian']
 names=[p['name'] for p in m['meshes']]
 print(f, 'height', m.get('height'),'head', [(p['name'],min(p['p'][1::3]),max(p['p'][1::3])) for p in m['meshes'] if re.search('helm|face|hair|head',p['name'],re.I)][:15], 'weapons',[n for n in names if re.search('scythe|haft|blade|weapon',n,re.I)][:8])
