from pathlib import Path
import json,collections
for f in ['pontifex_model.js','brown_companion_armour.js','karribassa_boss_models.js']:
 s=Path('work',f).read_text(encoding='utf-8');m=json.loads(s[s.index('=')+1:].strip().rstrip(';'));m=m.get('croxian',m)
 print(f,collections.Counter(p.get('bone') for p in m['meshes']))
