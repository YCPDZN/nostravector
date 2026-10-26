from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/siege of janira')
target=work/'audio/janira-victory';target.mkdir(parents=True,exist_ok=True)
records=[]
for i in range(1,6):
    name=f'POSTJANIRA{i}.mp3';data=(source/name).read_bytes();shutil.copyfile(source/name,target/name)
    records.append({'line':i-1,'file':'audio/janira-victory/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(work/'janira_victory_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print('Imported POSTJANIRA1–5:',[(r['file'],r['duration']) for r in records])
