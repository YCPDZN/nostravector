"""Copy the ten supplied post-boarding English performances without re-encoding."""
from pathlib import Path
import hashlib
import json
import shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/post ship')
target = work / 'audio/catharsis-aftermath'
target.mkdir(parents=True, exist_ok=True)
rows = []
for line in range(10):
    filename = f'CATHARSISDEMONIC{line + 1}.mp3'
    data = (source / filename).read_bytes()
    seconds = duration(data)
    assert seconds > 0, filename
    shutil.copyfile(source / filename, target / filename)
    rows.append(dict(line=line, file='audio/catharsis-aftermath/' + filename,
                     duration=seconds, sha256=hashlib.sha256(data).hexdigest()))
(work / 'catharsis_aftermath_audio.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print('Imported ten English Catharsis aftermath clips:', ', '.join(f"{r['line'] + 1}: {r['duration']:.1f}s" for r in rows))
