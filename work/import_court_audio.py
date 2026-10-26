from pathlib import Path
import json, shutil
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/eris')
target=work/'court-audio'
target.mkdir(exist_ok=True)
clips=[]
for group,prefix,count in [('queen','VISHARA',5),('present','ATTENDANTVISHARAPRESENT',2),('away','ATTENDANTVISHARAAWAY',3),('nyrexia','NYREXIA',5),('alexia','ALEXIA',5)]:
    for i in range(1,count+1):
        name=f'{prefix}{i}.mp3'
        shutil.copy2(source/name,target/name)
        clips.append(dict(group=group,index=i-1,file=f'court-audio/{name}'))
for group,prefix in [('janira-hak','KHC'),('janira-queen','KVE'),('janira-expansion','CH4HC')]:
    for i in range(1,6):
        name=f'{prefix}{i}.mp3'
        shutil.copy2(Path('C:/Users/HOME/Documents/NOSTRAVECTOR/hak chompjak')/name,target/name)
        clips.append(dict(group=group,index=i-1,file=f'court-audio/{name}'))
(work/'court_audio.json').write_text(json.dumps(clips,indent=2),encoding='utf-8')
print(f'Imported {len(clips)} court recordings.')
