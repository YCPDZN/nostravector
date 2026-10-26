from pathlib import Path
import shutil,json
from import_james_audio import duration
work=Path(__file__).resolve().parent;target=work/'audio/imperia-orders';target.mkdir(parents=True,exist_ok=True);clips=[]
for i in range(1,6):
 name=f'HAWTHORNE{i}.mp3';dest=target/name;shutil.copyfile(Path('C:/Users/HOME/Documents/NOSTRAVECTOR/khazglar')/name,dest);clips.append({'line':i,'file':'audio/imperia-orders/'+name,'duration':duration(dest.read_bytes())})
(work/'imperia_orders_audio.json').write_text(json.dumps(clips,indent=2),encoding='utf-8');print('Imported HAWTHORNE1-5:',[round(q['duration'],1) for q in clips])
