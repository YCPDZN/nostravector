from pathlib import Path
import json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/CHAPTER 3 - SOL')
target = work / 'audio/hawthorne'
target.mkdir(parents=True, exist_ok=True)
clips = []
for index in range(1, 11):
    name = f'TH{index}.mp3'
    shutil.copyfile(source / name, target / name)
    clips.append({'file': f'audio/hawthorne/{name}', 'duration': duration((target / name).read_bytes())})
(work / 'hawthorne_audio.json').write_text(json.dumps(clips, indent=2), encoding='utf-8')
print('Imported TH1–TH10:', ', '.join(f"{clip['duration']:.1f}s" for clip in clips))
