"""Import the ten Catharsis lines in both supplied languages without re-encoding."""
from pathlib import Path
import hashlib
import json
import shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/europe/josiah williams vs gareth williams')
target = work / 'audio/catharsis-transmission'
target.mkdir(parents=True, exist_ok=True)
rows = []
for language, prefix in [('alien', 'CATHARSIS'), ('english', 'CATHARSISENGLISH')]:
    for line in range(10):
        filename = f'{prefix}{line + 1}.mp3'
        data = (source / filename).read_bytes()
        seconds = duration(data)
        assert seconds > 0, filename
        shutil.copyfile(source / filename, target / filename)
        rows.append(dict(language=language, line=line, file='audio/catharsis-transmission/' + filename,
                         duration=seconds, sha256=hashlib.sha256(data).hexdigest()))
(work / 'catharsis_transmission_audio.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print('Imported', len(rows), 'Catharsis recordings:', ', '.join(f"{r['language']} {r['line'] + 1}: {r['duration']:.1f}s" for r in rows))
