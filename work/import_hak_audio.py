from pathlib import Path
import json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/eris')
target = work / 'audio/hak'
target.mkdir(parents=True, exist_ok=True)
records = []
for index in range(1, 6):
    name = f'HAK{index}.mp3'
    shutil.copyfile(source / name, target / name)
    records.append({'file': f'audio/hak/{name}', 'duration': duration((target / name).read_bytes())})
assert all(q['duration'] > 0 for q in records)
(work / 'hak_audio.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print('Imported five Hak recordings:', ', '.join(f"{q['duration']:.1f}s" for q in records))
