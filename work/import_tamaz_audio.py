from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/CATHARSIS BOSS FIGHT')
target=work/'audio/tyrotaronus-tamaz'
originals=[source/f'TAMAZ{i+1}.mp3' for i in range(5)]
assert all(p.is_file() for p in originals),'A supplied Tamaz recording is missing.'
target.mkdir(parents=True,exist_ok=True)
rows=[]
for i,p in enumerate(originals):
    data=p.read_bytes();seconds=duration(data)
    assert seconds>0,p.name
    shutil.copyfile(p,target/p.name)
    rows.append(dict(line=i,file='audio/tyrotaronus-tamaz/'+p.name,duration=seconds,sha256=hashlib.sha256(data).hexdigest()))
(work/'tamaz_audio.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
print('Imported TAMAZ1–5: '+', '.join(f'{r["line"]+1}: {r["duration"]:.1f}s' for r in rows))
