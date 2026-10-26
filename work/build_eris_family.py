from pathlib import Path
import json,re
work=Path(__file__).resolve().parent
parts=[]
for q in json.loads((work/'vishara_parts.json').read_text(encoding='utf-8')):
    if re.search(r'Crown circlet|Crown sapphire|Sceptre',q['name'],re.I):continue
    q={**q}
    if re.search(r'gown|bodice|sleeve|cuff|mantle|ermine|girdle|clasp|filigree|petal|vine|slipper|necklace|earring',q['name'],re.I):q['c']=[.60,.67,.85]
    elif q['name'].startswith('Iris'):q['c']=[.33,.58,.86]
    parts.append(q)
(work/'nyrexia_parts.json').write_text(json.dumps(parts,separators=(',',':')),encoding='utf-8')
print(f'Created Nyrexia companion model: {len(parts)} parts.')
