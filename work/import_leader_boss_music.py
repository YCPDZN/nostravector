from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions/fighting the companions')
target = work / 'audio/faction-leaders'
target.mkdir(parents=True, exist_ok=True)
tracks = [
    ('THE GUARDIAN OF HUMANITY.mp3', 'THE GUARDIAN OF HUMANITY', 'leader-darius'),
    ("THE CHILD OF ERIS - VISHARA'S THEME SONG.mp3", 'THE CHILD OF ERIS', 'leader-vishara'),
    ('HAK CHOMPJAK - THE DESCENDANT OF SHAKHAK.mp3', 'THE DESCENDANT OF SHAKHAK', 'leader-hak'),
    ('THE PRIME GOOD.mp3', 'THE PRIME GOOD', 'leader-grek'),
    ('ARCHAMUS - THE LIGHT EGG.mp3', 'ARCHAMUS - THE LIGHT EGG', 'leader-archamus-light-egg'),
]
music = json.loads((work/'music_audio.json').read_text(encoding='utf-8'))
music = [r for r in music if r.get('role') not in {t[2] for t in tracks}]
for filename, title, role in tracks:
    data = (source/filename).read_bytes()
    shutil.copyfile(source/filename, target/filename)
    music.append(dict(file='audio/faction-leaders/'+filename, title=title, role=role,
                      duration=duration(data), sha256=hashlib.sha256(data).hexdigest()))
(work/'music_audio.json').write_text(json.dumps(music, indent=2), encoding='utf-8')
print('Imported five faction leader themes without changing the original recordings.')
