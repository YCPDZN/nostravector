"""Import Williams's dialogue and the Gareth and Richards companion encounters."""
from pathlib import Path
import hashlib
import json
import shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/europe')
target = work / 'audio/williams'
target.mkdir(parents=True, exist_ok=True)
mapping = [
    ('rude', 0, 'JOSIAHWRUDE.mp3'),
    ('sarcastic', 0, 'JOSIAHWSARCASTIC.mp3'),
    ('sympathetic', 0, 'JOSIAHWRSYMPATHETIC.mp3'),
    ('sympathetic', 1, 'JOSIAHWRSYMPATHETIC2.mp3'),
    ('sympathetic', 2, 'JOSIAHWRSYMPATHETIC3.mp3'),
    ('ignorant', 0, 'JOSIAHWIGNORANT.mp3'),
] + [('intro', i - 1, f'JOSIAHWILLIAMS{i}.mp3') for i in range(1, 6)] + [
    ('chapter3', 0, 'JOSIAHWILLIAMSCHAPTER3.mp3'),
] + [('gareth', i - 1, f'josiah williams vs gareth williams/GW{i}.mp3') for i in range(1, 13)] + [
    ('richards', i - 1, f'josiah williams vs gareth williams/JOSIAHVSJWILLIAMS{i}.mp3') for i in range(1, 6)
] + [
    ('enlistment', i - 1, f'josiah williams vs gareth williams/JW{i}.mp3') for i in range(1, 3)
]
rows = []
for branch, line, name in mapping:
    data = (source / name).read_bytes()
    seconds = duration(data)
    assert seconds > 0
    filename = Path(name).name
    shutil.copyfile(source / name, target / filename)
    rows.append(dict(branch=branch, line=line, file='audio/williams/' + filename,
                     duration=seconds, sha256=hashlib.sha256(data).hexdigest()))
    if branch == 'gareth':
        rows[-1]['speaker'] = 'gareth' if line % 2 == 0 else 'josiah'
    elif branch == 'richards':
        rows[-1]['speaker'] = 'richards'
    elif branch == 'enlistment':
        rows[-1]['speaker'] = 'josiah'
(work / 'williams_audio.json').write_text(json.dumps(rows, indent=2), encoding='utf8')
print('Imported Williams recordings:', ', '.join(f"{r['branch']} {r['line'] + 1}: {r['duration']:.1f}s" for r in rows))
