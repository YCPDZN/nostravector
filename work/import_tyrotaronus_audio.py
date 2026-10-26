from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4 tyrotaronus')
target=work/'audio/tyrotaronus';target.mkdir(parents=True,exist_ok=True)
rows=[]
for i in range(10):
    name=f'TYRO{i+1}.mp3';data=(source/name).read_bytes();seconds=duration(data)
    assert seconds>0,name
    shutil.copyfile(source/name,target/name)
    rows.append(dict(line=i,file='audio/tyrotaronus/'+name,duration=seconds,sha256=hashlib.sha256(data).hexdigest()))
(work/'tyrotaronus_audio.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print('Imported TYRO1–10:', ', '.join(f"{r['line']+1}: {r['duration']:.1f}s" for r in rows))
