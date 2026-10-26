from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'work';OUT=ROOT/'outputs'
# Reuse the software depth-buffer renderer, without running the old cast export.
source=(WORK/'preview_detailed_leaders.py').read_text(encoding='utf-8')
namespace={'__file__':str(WORK/'preview_detailed_leaders.py')}
exec(source[:source.index("image=Image.new")],namespace)
raw=(WORK/'faction_infantry_models.js').read_text(encoding='utf-8');models=json.loads(raw[raw.index('=')+1:raw.rfind(';')])
Image=namespace['Image'];ImageDraw=namespace['ImageDraw'];ImageFont=namespace['ImageFont']
image=Image.new('RGB',(880,740),(15,23,36));pen=ImageDraw.Draw(image)
for i,(key,model) in enumerate(models.items()):
 image.paste(namespace['render'](model),(440*i,0))
pen=ImageDraw.Draw(image)
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',19)
pen.text((30,25),'HFOS / FEDERATION INFANTRY',font=font,fill='#e7c574')
pen.text((470,25),'ERISIAN / SENTINEL',font=font,fill='#f1a2d0')
image.save(OUT/'NOSTRAVECTOR_Faction_Soldiers_Preview.png')
print('Rendered both original 3D soldier meshes.')
