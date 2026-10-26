from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4/lord zark')
target=work/'audio/lord-zark-boss';target.mkdir(parents=True,exist_ok=True)
names=[f'ZARKBOSSFIGHT{i}.mp3' for i in range(1,6)]
assert all((source/name).is_file() for name in names)
rows=[]
for line,name in enumerate(names):
    data=(source/name).read_bytes();seconds=duration(data)
    assert seconds>0
    shutil.copyfile(source/name,target/name)
    rows.append(dict(line=line,file='audio/lord-zark-boss/'+name,duration=seconds,sha256=hashlib.sha256(data).hexdigest()))
(work/'zark_boss_audio.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
print('Imported ZARKBOSSFIGHT1–5 in combat quote order.')
