from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4/lord zark')
names = [f'LORDZARKH{i}.mp3' for i in range(1, 11)]
assert all((source / name).is_file() for name in names), 'A Zark recording is missing.'
target = work / 'audio/lord-zark'
target.mkdir(parents=True, exist_ok=True)
rows = []
for line, name in enumerate(names):
    data = (source / name).read_bytes()
    seconds = duration(data)
    assert seconds > 0, name
    shutil.copyfile(source / name, target / name)
    rows.append(dict(line=line, file='audio/lord-zark/' + name, duration=seconds,
                     sha256=hashlib.sha256(data).hexdigest()))
(work / 'lord_zark_audio.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
print('Imported LORDZARKH1–10 in numbered speech order.')
