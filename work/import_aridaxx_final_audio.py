from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/CATHARSIS BOSS FIGHT')
names = [f'HAKARIDAXX{i}.mp3' for i in range(1, 6)] + ['FINAL BOSS THEME.mp3']
assert all((source / name).is_file() for name in names), 'A supplied recording is missing.'
target = work / 'audio/hak-aridaxx'
target.mkdir(parents=True, exist_ok=True)
rows = []
for i, name in enumerate(names[:5]):
    data = (source / name).read_bytes()
    seconds = duration(data)
    assert seconds > 0, name
    shutil.copyfile(source / name, target / name)
    rows.append(dict(line=i, file='audio/hak-aridaxx/' + name, duration=seconds,
                     sha256=hashlib.sha256(data).hexdigest()))
(work / 'hak_aridaxx_audio.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
name = names[-1]
data = (source / name).read_bytes()
music_target = work / 'audio/music' / name
shutil.copyfile(source / name, music_target)
track = dict(file='audio/music/' + name, title='FINAL BOSS THEME', role='catharsis-final',
             duration=duration(data), sha256=hashlib.sha256(data).hexdigest())
assert track['duration'] > 0
manifest = work / 'music_audio.json'
music = [r for r in json.loads(manifest.read_text(encoding='utf-8')) if r.get('role') != track['role']]
manifest.write_text(json.dumps(music + [track], indent=2) + '\n', encoding='utf-8')
print('Imported five Hak Aridaxx recordings and FINAL BOSS THEME.')
