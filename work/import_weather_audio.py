from pathlib import Path
import json, shutil
from import_james_audio import duration
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/CHAPTER 3 - SOL')
target=work/'audio/weather';target.mkdir(parents=True,exist_ok=True)
clips=[]
for kind,name in [('firestorm','FIRESTORM.mp3'),('duststorm','DUSTSTORM.mp3')]:
 shutil.copyfile(source/name,target/name)
 clips.append({'type':kind,'file':'audio/weather/'+name,'duration':duration((target/name).read_bytes())})
(work/'weather_audio.json').write_text(json.dumps(clips,indent=2),encoding='utf-8')
print('Imported:',[(q['type'],round(q['duration'],2)) for q in clips])
