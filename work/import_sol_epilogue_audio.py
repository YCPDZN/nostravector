from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/PRE FINAL BATTLE - CHAPTER 3')
target=work/'audio/sol-epilogue'
target.mkdir(parents=True,exist_ok=True)
records=[]
for stage,prefix,count in [('hawthorne','THB',5),('stranger','GREK',3)]:
    for i in range(1,count+1):
        name=f'{prefix}{i}.mp3'
        data=(source/name).read_bytes()
        shutil.copyfile(source/name,target/name)
        records.append({'stage':stage,'line':i-1,'file':'audio/sol-epilogue/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(work/'sol_epilogue_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print('Imported final dialogue:',[(Path(r['file']).name,r['duration']) for r in records])
