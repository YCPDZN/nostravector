from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions/fighting the companions')
target = work / 'audio/crew-enemy'
target.mkdir(parents=True, exist_ok=True)
profiles = {'orion': 'ORION', 'khazglar': 'KHAZGLAR', 'williams': 'JWILLIAMS',
            'nyrexia': 'NYREXIA', 'charon': 'CHARON', 'kizna': 'KIZNA',
            'james': 'JAMES', 'croxian': 'CROXIAN', 'malia': 'MALIA',
            'josiah': 'JOSIAHRICHARDS', 'peter': 'PETER', 'gareth': 'GARETH',
            'pontifex': 'PONTIFEX', 'custom': 'CUSTOM'}
rows = []
for profile, prefix in profiles.items():
    for line in range(2):
        name = f'{prefix}HOSTILE{line+1}.mp3'
        data = (source/name).read_bytes()
        shutil.copyfile(source/name, target/name)
        rows.append(dict(profile=profile, line=line, file='audio/crew-enemy/'+name,
                         duration=duration(data), sha256=hashlib.sha256(data).hexdigest()))
tyro_source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4 tyrotaronus/governor')
for line in range(2):
    name = f'TYROTARONUSHOSTILE{line+1}.mp3'
    data = (tyro_source/name).read_bytes()
    shutil.copyfile(tyro_source/name, target/name)
    rows.append(dict(profile='tyrotaronus', line=line, file='audio/crew-enemy/'+name,
                     duration=duration(data), sha256=hashlib.sha256(data).hexdigest()))
(work/'crew_enemy_audio.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
name = 'The Wrong Enemy.mp3'
data = (source/name).read_bytes()
shutil.copyfile(source/name, target/name)
music = json.loads((work/'music_audio.json').read_text(encoding='utf-8'))
track = dict(file='audio/crew-enemy/'+name, title='THE WRONG ENEMY', role='crew-enemy',
             duration=duration(data), sha256=hashlib.sha256(data).hexdigest())
index = next((i for i,r in enumerate(music) if r.get('role') == 'crew-enemy'), None)
if index is None:
    music.append(track)
else:
    music[index] = track
(work/'music_audio.json').write_text(json.dumps(music, indent=2), encoding='utf-8')
print(f'Imported {len(rows)} enemy companion voices and THE WRONG ENEMY boss theme.')
