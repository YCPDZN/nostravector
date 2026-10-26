from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration
root=Path(__file__).resolve().parent
src=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/antarctica/2/FREEROAM1.mp3');dst=root/'audio/music/FREEROAM1.mp3'
shutil.copyfile(src,dst)
assert hashlib.sha256(src.read_bytes()).digest()==hashlib.sha256(dst.read_bytes()).digest()
p=root/'music_audio.json';tracks=json.loads(p.read_text(encoding='utf-8'))
for i,q in enumerate(tracks):q['title']=['NOSTRAVECTOR MAIN MENU THEME','WONDERS OF LANIAKEA','SOL','COSMOS'][i]
tracks[1]['duration']=duration(dst.read_bytes());p.write_text(json.dumps(tracks,indent=2),encoding='utf-8')
p=root/'menu_shell.html';s=p.read_text(encoding='utf-8')
css='''#nowPlaying{position:fixed;right:5%;top:88px;z-index:140;pointer-events:none;padding:9px 13px;border-left:2px solid #80d8e7;background:linear-gradient(90deg,#07131bd9,#07131b55);max-width:280px;color:#d8eff3}#nowPlaying[hidden]{display:none!important}#nowPlayingLabel{display:block;font:7px Consolas,monospace;letter-spacing:2px;color:#90b1be;margin-bottom:5px}#nowPlayingTitle{display:block;font:10px Consolas,monospace;letter-spacing:1.3px}#nowPlaying[data-scene=roam]{top:auto;bottom:39px;right:28px;max-width:230px}@media(max-width:700px){#nowPlaying{top:78px;right:5%;max-width:190px;padding:7px 10px}#nowPlaying[data-scene=roam]{right:14px;bottom:39px;max-width:165px}#nowPlayingTitle{font-size:8px;letter-spacing:.7px}#nowPlayingLabel{font-size:6px;letter-spacing:1px}}
'''
if 'id="nowPlaying"' not in s:
    s=s.replace('__INTRO_CSS__',css+'__INTRO_CSS__').replace('<dialog id="settings"','<aside id="nowPlaying" aria-live="polite" aria-atomic="true" aria-label="Soundtrack title" hidden><span id="nowPlayingLabel">NOW PLAYING</span><strong id="nowPlayingTitle"></strong></aside>\n<dialog id="settings"',1)
p.write_text(s,encoding='utf-8')
p=root/'antarctica.html';s=p.read_text(encoding='utf-8').replace('SOUNDTRACK / FREEROAM1','SOUNDTRACK / WONDERS OF LANIAKEA');p.write_text(s,encoding='utf-8')
p=root/'game_readme.txt';s=p.read_text(encoding='utf-8').replace('Antarctica plays FREEROAM1, FREEROAM2 and FREEROAM3 in order','Free roam plays WONDERS OF LANIAKEA, SOL and COSMOS in order').replace('All four unchanged MP3s are embedded','All four MP3s, including the updated FREEROAM1 recording, are embedded')
if '\nSONG TITLES\n' not in s:s+='\nSONG TITLES\nA visible soundtrack label appears on the main menu and during free roam. The main\nmenu retains its own theme. FREEROAM1 is WONDERS OF LANIAKEA; FREEROAM2 is SOL;\nFREEROAM3 is COSMOS. The playlist order is unchanged.\n'
p.write_text(s,encoding='utf-8')
print('Replaced FREEROAM1 with verified source bytes:',dst.stat().st_size,'bytes,',tracks[1]['duration'],'seconds. Updated all song titles.')
