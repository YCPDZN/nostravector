from pathlib import Path
import hashlib,json,shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/giving orders - voice lines/governor quotes')
target=work/'audio/governors'
quotes=json.loads((work/'governor_quotes.json').read_text(encoding='utf-8'))
groups={'orion':'ORION','charon':'CHARON','custom-species':'CUSTOM','custom-english':'CUSTOMENGLISH','gareth':'GOVERNORGARETH','josiah':'GOVERNORJOSIAH','peter':'GOVERNORPETER','james':'JAMES','khazglar':'KHAZGLAR','kizna':'KIZNA','nyrexia':'NYREXIA'}
extended_source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4 tyrotaronus/governor')
# JOSIAHGOVERNOR is Williams II; GOVERNORJOSIAH remains Project BC's Richards.
extended_groups={'croxian':'CROXIANGOVERNOR','malia':'MALIAGOVERNOR','williams':'JOSIAHGOVERNOR','tyrotaronus':'TYROTARONUSGOVERNOR'}
# Verify the full supplied set before writing the manifest.
originals=[(profile,i,q,source/f'{prefix}{i+1}.mp3') for profile,prefix in groups.items() for i,q in enumerate(quotes)]
originals += [(profile,i,q,extended_source/f'{prefix}{i+1}.mp3') for profile,prefix in extended_groups.items() for i,q in enumerate(quotes)]
assert all(p.is_file() for _,_,_,p in originals),'A supplied governor recording is missing.'
target.mkdir(parents=True,exist_ok=True)
clips=[]
for profile,i,q,p in originals:
    data=p.read_bytes()
    shutil.copyfile(p,target/p.name)
    clips.append({'key':profile+':'+q['id'],'profile':profile,'line':i+1,'id':q['id'],'file':'audio/governors/'+p.name,'duration':duration(data),'sha256':hashlib.sha256(data).hexdigest()})
(work/'governor_audio.json').write_text(json.dumps(clips,indent=2)+'\n',encoding='utf-8')
print(f'Imported {len(clips)} governor recordings ({sum(q["duration"] for q in clips):.1f} seconds), including ten native/English pairs.')
