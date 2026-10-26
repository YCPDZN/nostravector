from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
def add_chapter4_menu_track(records):
    source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/nostravector - main menu song chapter 4 onwards.mp3')
    target=work/'audio/music'/source.name
    target.parent.mkdir(parents=True,exist_ok=True)
    data=source.read_bytes()
    shutil.copyfile(source,target)
    record={'file':'audio/music/'+source.name,'title':'CATHARSIS',
            'role':'menu-chapter4','duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()}
    return [r for r in records if r.get('role')!='menu-chapter4']+[record]

if __name__=='__main__':
    path=work/'music_audio.json'
    records=add_chapter4_menu_track(json.loads(path.read_text(encoding='utf-8')))
    path.write_text(json.dumps(records,indent=2),encoding='utf-8')
    print(records[-1])
