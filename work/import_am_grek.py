from pathlib import Path
import json,shutil,hashlib
from import_james_audio import duration
w=Path(__file__).resolve().parent;src=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4');dest=w/'audio/am-grek';dest.mkdir(parents=True,exist_ok=True)
records=[]
for i in range(1,6):
 name=f'AMG{i}.mp3';data=(src/name).read_bytes();shutil.copyfile(src/name,dest/name);records.append({'file':'audio/am-grek/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(w/'am_grek_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8');print('Imported 5 Am-Grek recordings:',[r['duration'] for r in records])
