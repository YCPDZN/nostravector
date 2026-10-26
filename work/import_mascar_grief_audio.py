from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/siege of janira')
target=work/'audio/orion-grief'
target.mkdir(parents=True,exist_ok=True)
records=[]
for index in range(1,11):
    name=f'CMD{index}.mp3'
    shutil.copyfile(source/name,target/name)
    data=(target/name).read_bytes()
    digest=hashlib.sha256(data).hexdigest()
    assert digest==hashlib.sha256((source/name).read_bytes()).hexdigest()
    records.append({'line':index-1,'file':'audio/orion-grief/'+name,'duration':duration(data),'sha256':digest})
(work/'mascar_grief_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(f'Imported CMD1–CMD10 in numerical order: {sum(r["duration"] for r in records):.1f} seconds.')
