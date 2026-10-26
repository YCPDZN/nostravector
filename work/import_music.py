from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/antarctica/2')
target = work / 'audio/music'
target.mkdir(parents=True, exist_ok=True)
records = []
combat_name='WONDERS OF LANIAKEA - COMBAT VERSION.mp3'
titles = {'FREEROAM1.mp3':'WONDERS OF LANIAKEA', 'FREEROAM2.mp3':'SOL', 'FREEROAM3.mp3':'COSMOS',combat_name:'WONDERS OF LANIAKEA (COMBAT VERSION)'}
for name in ['NOSTRAVECTOR MAIN MENU THEME.mp3', 'FREEROAM1.mp3', 'FREEROAM2.mp3', 'FREEROAM3.mp3',combat_name]:
    shutil.copyfile(source / name, target / name)
    data = (target / name).read_bytes()
    assert hashlib.sha256(data).digest() == hashlib.sha256((source / name).read_bytes()).digest()
    records.append({'file': 'audio/music/' + name, 'title': titles.get(name,name[:-4]), 'duration': duration(data)})
    if name==combat_name:records[-1]['role']='combat'
for index,title in enumerate(['RUN!','AMBUSH','DANGER IS COMING!','UNDER FIRE'],1):
    name=f'PREDATOR {index}.mp3'
    shutil.copyfile(Path('C:/Users/HOME/Documents/NOSTRAVECTOR/eris')/name,target/name)
    records.append({'file':'audio/music/'+name,'title':title,'duration':duration((target/name).read_bytes()),'role':'predator'})
from import_janira_siege_music import add_siege_track
records=add_siege_track(records)
from import_final_battle_audio import add_mercury_track
records=add_mercury_track(records)
from import_chapter4_menu_music import add_chapter4_menu_track
records=add_chapter4_menu_track(records)
from import_chapter4_roam_music import add_chapter4_roam_tracks
records=add_chapter4_roam_tracks(records)
(work / 'music_audio.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps(records, indent=2))
