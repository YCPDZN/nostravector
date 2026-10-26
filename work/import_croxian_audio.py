from pathlib import Path
import json,hashlib,shutil
from import_james_audio import duration
work=Path('work');source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/siege of janira');target=work/'audio/croxian';target.mkdir(parents=True,exist_ok=True);records=[]
for i in range(1,6):
 name=f'CM{i}.mp3';shutil.copyfile(source/name,target/name);data=(target/name).read_bytes();records.append({'line':i-1,'file':'audio/croxian/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(work/'croxian_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8');print([(r['file'],r['duration']) for r in records])
