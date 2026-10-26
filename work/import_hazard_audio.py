from pathlib import Path
import json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/antarctica')
target = work / 'audio/hazards'
target.mkdir(parents=True, exist_ok=True)
records = []
for name in ['SUIT.mp3', *(f'NARRATOR{i}.mp3' for i in range(1, 6)), 'SUIT2.mp3']:
    shutil.copyfile(source / name, target / name)
    records.append({'file': 'audio/hazards/' + name, 'duration': duration((target / name).read_bytes())})
(work / 'hazard_audio.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps(records, indent=2))
