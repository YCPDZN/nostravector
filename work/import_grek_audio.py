from pathlib import Path
import json,shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/antarctica/3')
target=work/'audio/grek';target.mkdir(parents=True,exist_ok=True)
records=[]
for index in range(1,6):
    name=f'GREK{index}.mp3'
    shutil.copyfile(source/name,target/name)
    records.append({'file':'audio/grek/'+name,'duration':duration((target/name).read_bytes())})
assert all(q['duration']>0 for q in records)
(work/'grek_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records,indent=2))
