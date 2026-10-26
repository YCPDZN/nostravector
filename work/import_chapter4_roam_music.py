from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4')
files=[('IS THERE MORE OUT THERE.MP3','IS THERE MORE OUT THERE?'),('DARKNESS IN THE COSMOS.mp3','DARKNESS IN THE COSMOS'),('YOU CHANGED, SO HAS THE GALAXY.mp3','YOU CHANGED, SO HAS THE GALAXY'),('2 YEARS LATER.mp3','2 YEARS LATER')]
def add_chapter4_roam_tracks(existing):
 records=[]
 for filename,title in files:
  data=(source/filename).read_bytes();target=work/'audio/music'/filename
  target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source/filename,target)
  records.append({'file':'audio/music/'+filename,'title':title,'role':'roam-chapter4','duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
 return [r for r in existing if r.get('role')!='roam-chapter4']+records

if __name__=='__main__':
 path=work/'music_audio.json'
 records=add_chapter4_roam_tracks(json.loads(path.read_text(encoding='utf-8')))
 path.write_text(json.dumps(records,indent=2),encoding='utf-8')
 for r in records:
  if r.get('role')=='roam-chapter4':print(r['title'],r['duration'])
