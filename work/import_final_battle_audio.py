from pathlib import Path
import json,hashlib,shutil
from import_james_audio import duration
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/PRE FINAL BATTLE - CHAPTER 3')
target=work/'audio/hawthorne-rage';target.mkdir(parents=True,exist_ok=True)
records=[]
for i in range(1,11):
    name=f'HB{i}.mp3';data=(source/name).read_bytes();shutil.copyfile(source/name,target/name)
    records.append({'line':i-1,'file':'audio/hawthorne-rage/'+name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(work/'hawthorne_rage_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')

def add_mercury_track(records):
    path=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/SIEGE OF MERCURY.mp3')
    data=path.read_bytes();out=work/'audio/music'/path.name;out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,out)
    record={'file':'audio/music/'+path.name,'title':'SIEGE OF MERCURY','role':'mercury','duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()}
    return [r for r in records if r.get('role')!='mercury']+[record]

if __name__=='__main__':
    path=work/'music_audio.json';music=add_mercury_track(json.loads(path.read_text(encoding='utf-8')));path.write_text(json.dumps(music,indent=2),encoding='utf-8')
    print('Imported HB1–HB10:',[(r['file'],r['duration']) for r in records]);print('Imported',music[-1]['title'],music[-1]['duration'],'seconds')
