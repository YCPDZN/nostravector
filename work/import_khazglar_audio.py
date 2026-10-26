from pathlib import Path
import shutil,json
from import_james_audio import duration
work=Path(__file__).resolve().parent;target=work/'audio/khazglar';target.mkdir(parents=True,exist_ok=True)
clips=[]
for i in range(1,11):
 source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/khazglar')/f'{i}.mp3';dest=target/source.name;shutil.copyfile(source,dest);clips.append({'line':i,'file':'audio/khazglar/'+source.name,'duration':duration(dest.read_bytes())})
(work/'khazglar_audio.json').write_text(json.dumps(clips,indent=2),encoding='utf-8');print('Imported all 10 Khazglar recordings.')
