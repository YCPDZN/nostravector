from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/ARCHAMUS ARCHIOSTAL')
target=work/'audio/archamus';target.mkdir(parents=True,exist_ok=True)
rows=[]
for chapter,line,name in [(3,0,'ARCHAMUS CHAPTER 3.mp3')]+[(4,i-1,f'ARCHAMUSCH4DIALOGUE{i}.mp3') for i in range(1,11)]+[(0,i-1,f'ARCHAMUSVSJOSIAH{i}.mp3') for i in range(1,11)]+[(4,i-1,f'CATHARCHAMUS{i}.mp3') for i in range(1,21)]+[(4,0,'ARCHAMUSFINDEUROPE.mp3')]:
    data=(source/name).read_bytes();shutil.copyfile(source/name,target/name)
    rows.append({'chapter':chapter,'line':line,'file':'audio/archamus/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
for row in rows[21:41]: row['scene']='catharsis'
rows[41]['scene']='earth-contact'
(work/'archamus_audio.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
print('Imported one Chapter 3 clip, ten Chapter 4 clips ten hidden exchange clips twenty Catharsis briefing clips and the Earth contact clip:',', '.join(f"{r['duration']:.1f}s" for r in rows))
