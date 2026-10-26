from pathlib import Path
import json, shutil, hashlib
from import_james_audio import duration
w=Path(__file__).resolve().parent;src=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/orion mascar boss fight');dest=w/'audio/orion-boss';dest.mkdir(parents=True,exist_ok=True)
records=[]
for phase,count,prefix in [(1,10,'BFOM'),(2,15,'BFOMP2'),(3,30,'BFOMP3')]:
 for i in range(1,count+1):
  name=f'{prefix}{i}.mp3';data=(src/name).read_bytes();shutil.copyfile(src/name,dest/name);records.append({'phase':phase,'line':i-1,'file':'audio/orion-boss/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
name='ORION DEATH QUOTE.mp3';data=(src/name).read_bytes();shutil.copyfile(src/name,dest/name);records.append({'phase':4,'line':0,'file':'audio/orion-boss/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(w/'orion_boss_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
manifest=w/'music_audio.json';tracks=json.loads(manifest.read_text(encoding='utf-8'));tracks=[r for r in tracks if r.get('role') not in ['mascar','mascar-piano']]
for source,title,role in [(src/'THE VENGEFUL MASCAR.mp3','THE VENGEFUL MASCAR','mascar'),(src.parent/'chapter 4'/'HEAVENLY DRIFT - NOSTRAVECTOR VERSION.mp3','HAVE I HEARD THIS BEFORE?','mascar-piano')]:
 data=source.read_bytes();shutil.copyfile(source,w/'audio/music'/source.name);tracks.append({'file':'audio/music/'+source.name,'title':title,'role':role,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
manifest.write_text(json.dumps(tracks,indent=2),encoding='utf-8')
print('Imported',len(records),'recordings (10 human, 15 frame, 30 orbital, 1 death) and both boss themes. Longest voice:',max(r['duration'] for r in records))
