from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions/fighting the companions')
target = work/'audio/orion-croxian'
target.mkdir(parents=True, exist_ok=True)
rows = []
for stage, prefix in [('arrival', 'ORIONCROXIAN'), ('frame', 'ORIONCROXIANMINIBOSS')]:
    for line in range(10):
        name = f'{prefix}{line+1}.mp3'
        data = (source/name).read_bytes()
        seconds = duration(data)
        assert seconds > 0, name
        shutil.copyfile(source/name, target/name)
        rows.append(dict(stage=stage, line=line, file='audio/orion-croxian/'+name,
                         duration=seconds, sha256=hashlib.sha256(data).hexdigest()))
(work/'orion_croxian_audio.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print('Imported ten Orion/Croxian arrival clips and ten Mascar Frame combat clips.')
