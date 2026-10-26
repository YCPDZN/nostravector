from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions/fighting the companions/faction leads')
quotes=json.loads((work/'darius_vishara_boss_quotes.json').read_text(encoding='utf-8'))
rows=[]
scripts=[]
template=(work/'hak_boss_recordings.js').read_text(encoding='utf-8')
for leader,prefix in [('darius','ANCIN'),('vishara','VISHARA')]:
    assert len(quotes[leader])==10
    target=work/'audio'/f'{leader}-boss'
    target.mkdir(parents=True,exist_ok=True)
    for i,text in enumerate(quotes[leader]):
        filename=f'{prefix}{i+1}.mp3'
        data=(source/filename).read_bytes()
        shutil.copyfile(source/filename,target/filename)
        rows.append(dict(leader=leader,line=i,text=text,file=f'audio/{leader}-boss/{filename}',duration=duration(data),sha256=hashlib.sha256(data).hexdigest()))
    script=template.replace('hak',leader).replace('Hak',leader.title()).replace('HAK',leader.upper())
    script=script.replace('Math.min(19,','Math.min(9,').replace('%20','%10').replace(" / 20'"," / 10'")
    scripts.append(script)
(work/'darius_vishara_boss_audio.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
(work/'darius_vishara_boss_recordings.js').write_text('\n'.join(scripts),encoding='utf-8')
print('Imported ANCIN1–10 and VISHARA1–10 with ordered faction boss captions.')
