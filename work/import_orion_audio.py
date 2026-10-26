from pathlib import Path
import json, shutil
from import_james_audio import duration
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/africa')
target=work/'audio/orion';target.mkdir(parents=True,exist_ok=True)
records=[]
for index in range(1,6):
    name=f'OM{index}.mp3';shutil.copyfile(source/name,target/name)
    records.append({'file':'audio/orion/'+name,'duration':duration((target/name).read_bytes())})
(work/'orion_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
assets=work/'africa-assets';assets.mkdir(exist_ok=True)
shutil.copyfile(source/'1.jfif',assets/'sand.jpg')
print('Imported OM1–OM5 in order and copied the original desert texture.')
