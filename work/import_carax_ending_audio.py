from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4/lord zark')
target=work/'audio/carax-endings';target.mkdir(parents=True,exist_ok=True)
mapping=[(route,shot,f'{prefix}{i}.mp3',speaker) for route,prefix,shots,speakers in [
    ('good','GOODENDING',[0,1,3],['zark','archamus','archamus']),
    ('neutral','NEUTRALENDING',[0,1,3],['zark','archamus','archamus']),
    ('bad','BADENDING',[0,2,3],['zark','hostile-orion','hostile-orion'])]
    for i,(shot,speaker) in enumerate(zip(shots,speakers),1)]
mapping.append(('shared',-1,'GOOD AND NEUTRAL.mp3','archamus'))
mapping.extend(('bad',i+3,f'BADENDINGORION{i}.mp3','hostile-orion') for i in range(1,11))
mapping.extend(('bad-zark',i-1,f'BADENDINGZARK{i}.mp3','zark') for i in range(1,11))
mapping.extend(('bad-josiah',i+1,f'BADENDINGJOSIAH{i}.mp3','josiah') for i in range(1,11))
mapping.extend(('bad-tyrotaronus',i,f'BADENDINGTYROTARONUS{i}.mp3','tyrotaronus') for i in range(1,21))
assert all((source/name).is_file() for _,_,name,_ in mapping)
rows=[]
for route,shot,name,speaker in mapping:
    data=(source/name).read_bytes();seconds=duration(data);assert seconds>0
    shutil.copyfile(source/name,target/name)
    rows.append(dict(route=route,shot=shot,speaker=speaker,file='audio/carax-endings/'+name,duration=seconds,sha256=hashlib.sha256(data).hexdigest()))
(work/'carax_ending_audio.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
print('Imported 59 ending lines and the shared Andromeda prompt, including BADENDINGTYROTARONUS1–20.')
