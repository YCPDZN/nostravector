from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions/fighting the companions/faction leads')
target = work/'audio/archamus-phase2'
target.mkdir(parents=True, exist_ok=True)
quotes = json.loads((work/'archamus_phase2_quotes.json').read_text(encoding='utf-8'))
assert len(quotes) == 10
rows = []
for i, text in enumerate(quotes):
    filename = f'ARCHAMUSPHASE2 {i+1}.mp3'
    data = (source/filename).read_bytes()
    shutil.copyfile(source/filename, target/filename)
    rows.append(dict(line=i, text=text, file='audio/archamus-phase2/'+filename,
                     duration=duration(data), sha256=hashlib.sha256(data).hexdigest()))
(work/'archamus_phase2_audio.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding='utf-8')
print('Imported ARCHAMUSPHASE2 1–10 with matching boss fight captions.')
