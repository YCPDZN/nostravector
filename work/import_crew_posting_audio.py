from pathlib import Path
import hashlib
import json
import shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions')
target = work / 'audio/crew-posting'
profiles = {
    'orion': 'ORION', 'khazglar': 'KHAZGLAR', 'williams': 'JOSIAH WILLIAMS',
    'nyrexia': 'NYREXIA ERISCONOS', 'charon': 'CHARON', 'kizna': 'KIZNA',
    'james': 'JAMES', 'croxian': 'CROXIAN', 'malia': 'MALIA',
    'josiah': 'JOSIAH RICHARDS', 'peter': 'PETER CHAMBERS',
    'gareth': 'GARETH WILLIAMS', 'pontifex': 'PONTIFEX', 'custom': 'CUSTOM',
}
target.mkdir(parents=True, exist_ok=True)
rows = []
for profile, prefix in profiles.items():
    for line in range(2):
        name = f'{prefix} {line + 1}.mp3'
        data = (source / name).read_bytes()
        seconds = duration(data)
        assert seconds > 0, name
        shutil.copyfile(source / name, target / name)
        rows.append(dict(profile=profile, line=line, file='audio/crew-posting/' + name,
                         duration=seconds, sha256=hashlib.sha256(data).hexdigest()))
tyro_source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4 tyrotaronus/governor')
for line in range(2):
    name = f'TYROTARONUSANOTHERFACTION{line+1}.mp3'
    data = (tyro_source / name).read_bytes()
    shutil.copyfile(tyro_source / name, target / name)
    rows.append(dict(profile='tyrotaronus', line=line, file='audio/crew-posting/' + name,
                     duration=duration(data), sha256=hashlib.sha256(data).hexdigest()))
(work / 'crew_posting_audio.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print(f'Imported {len(rows)} companion posting recordings across {len(profiles)+1} profiles.')
