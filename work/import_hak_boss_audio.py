from pathlib import Path
import hashlib, json, shutil
from import_james_audio import duration

work = Path(__file__).resolve().parent
source = Path('C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions/fighting the companions/faction leads')
target = work/'audio/hak-boss'
target.mkdir(parents=True, exist_ok=True)
quotes = json.loads((work/'hak_boss_quotes.json').read_text(encoding='utf-8'))
assert len(quotes) == 20
rows = []
for i, text in enumerate(quotes):
    filename = f'HAK{i+1}.mp3'
    data = (source/filename).read_bytes()
    shutil.copyfile(source/filename, target/filename)
    rows.append(dict(line=i, text=text, file='audio/hak-boss/'+filename,
                     duration=duration(data), sha256=hashlib.sha256(data).hexdigest()))
(work/'hak_boss_audio.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding='utf-8')
print('Imported HAK1–20 with matching boss fight captions.')
