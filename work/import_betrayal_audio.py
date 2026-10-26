from pathlib import Path
import json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/antarctica/3')
target = work/'audio/betrayal'
target.mkdir(parents=True, exist_ok=True)
clips = []
for index in range(1, 16):
    name = f'JBBETRAYAL{index}.mp3'
    shutil.copyfile(source/name, target/name)
    clips.append({'file': 'audio/betrayal/'+name, 'duration': duration((target/name).read_bytes())})
assert all(clip['duration'] > 0 for clip in clips)
(work/'betrayal_audio.json').write_text(json.dumps(clips, indent=2), encoding='utf-8')
print('Imported fifteen betrayal recordings in numeric order.')
