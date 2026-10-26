"""Replace only Darius's five recordings in the existing Moon transmission."""
from pathlib import Path
import hashlib
import json
import shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/war in sol')
records = json.loads((work / 'sol_war_audio.json').read_text(encoding='utf-8'))
indices = (2, 4, 6, 8, 10)
protected = [work / r['file'] for i, r in enumerate(records, 1) if i not in indices]
protected += list((work / 'audio/orion').glob('*.mp3'))
hash_file = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
before = {p: hash_file(p) for p in protected}

for number in indices:
    record = records[number - 1]
    name = f'BEEF{number}.mp3'
    assert record['file'] == f'audio/sol_war/{name}'
    data = (source / name).read_bytes()
    seconds = duration(data)
    shutil.copyfile(source / name, work / record['file'])
    record.update(duration=seconds, speaker='Darius Ancin', sha256=hashlib.sha256(data).hexdigest())
    assert hash_file(work / record['file']) == record['sha256']
    print(f'{name}: Darius Ancin / {seconds:.3f}s')

assert all(hash_file(p) == digest for p, digest in before.items())
(work / 'sol_war_audio.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
print('Updated five Darius recordings; all ten Hawthorne and all Orion clips unchanged.')
