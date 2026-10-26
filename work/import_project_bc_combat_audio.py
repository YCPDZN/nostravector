from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/giving orders - voice lines/combat quotes')
target=work/'audio/project-bc-combat'
target.mkdir(parents=True,exist_ok=True)
clips=[]
for kind,prefix in [('josiah','JOSIAH'),('peter','PETER'),('gareth','GARETH')]:
    for index in range(5):
        name=f'{prefix}{index+1}.mp3'
        data=(source/name).read_bytes()
        shutil.copyfile(source/name,target/name)
        clips.append({'key':f'{kind}:{index}','file':f'audio/project-bc-combat/{name}','duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
for key,name in [('josiah:heaven','JOSIAH6.mp3'),('gareth:trip','GARETHPAIN.mp3')]:
    data=(source/name).read_bytes()
    shutil.copyfile(source/name,target/name)
    clips.append({'key':key,'file':f'audio/project-bc-combat/{name}','duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(work/'project_bc_combat_audio.json').write_text(json.dumps(clips,indent=2)+'\n',encoding='utf-8')
print('Imported 17 Project BC combat recordings:',[(q['key'],q['duration']) for q in clips])
