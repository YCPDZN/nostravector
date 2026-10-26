from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/SIEGE OF JANIRA PRIME - WONDERS OF LANIAKEA MOTIF.mp3')
target = work / 'audio/music' / source.name

def add_siege_track(records):
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    data = target.read_bytes()
    assert hashlib.sha256(data).digest() == hashlib.sha256(source.read_bytes()).digest()
    record = {'file':'audio/music/'+source.name, 'title':'SIEGE OF JANIRA PRIME', 'role':'siege', 'duration':duration(data), 'sha256':hashlib.sha256(data).hexdigest()}
    return [r for r in records if r.get('role') != 'siege'] + [record]

if __name__ == '__main__':
    manifest = work / 'music_audio.json'
    records = add_siege_track(json.loads(manifest.read_text(encoding='utf-8')))
    manifest.write_text(json.dumps(records, indent=2), encoding='utf-8')
    print(json.dumps(records[-1], indent=2))
