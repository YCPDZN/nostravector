from pathlib import Path
import json
import build_pontifex_model as g
from build_pontifex_model import Builder
root=Path(__file__).resolve().parents[1];raw=(root/'work/pontifex_model.js').read_text();model=json.loads(raw[raw.index('=')+1:raw.rfind(';')]);model['name']='Imperia Legionary';model['faction']='TERRA';model['design']='Blackened armour, cyan heraldry, swept horns and crescent polearm. Cinematic infantry; separate from the unique Pontifex boss.'
for p in model['meshes']:
 c=p['color']
 if p.get('emission',0)>.1:p['color']=[.04,.91,1]
 elif c[0]>c[1]*1.35 and c[0]>.20:p['color']=[.06,.18,.20]
full=[p for p in model['meshes'] if p.get('lod') or any(k in p['name'].lower() for k in ['helmet','horn','heart core','chest','cuirass','thigh armour','shin armour','boot shell','pauldron','cape panel','polearm shaft','crescent blade'])]
b=Builder();dark='#171e24';cyan='#24dce8';steel='#34424a'
b.oval('Torso',[0,2.65,0],[.59,.72,.33],dark,e=.6,rows=3,cols=6);b.oval('Pelvis',[0,1.88,0],[.49,.26,.31],dark,e=.55,rows=3,cols=6);b.oval('Helmet',[0,3.73,0],[.31,.42,.31],steel,'head',e=.7,rows=4,cols=8)
b.poly('Cyan visor',[[-.23,3.86],[.23,3.86],[.14,3.78],[-.14,3.78]],.30,.02,cyan,'head',emission=.7)
b.poly('Cyan chest insignia',[[-.17,2.95],[0,2.76],[.17,2.95],[0,2.85]],.35,.02,cyan,emission=.65)
for side in [-1,1]:
 leg='leftLeg' if side<0 else 'rightLeg';arm='leftArm' if side<0 else 'rightArm'
 b.tube('Leg',[[side*.35,1.85,0],[side*.40,1.0,0],[side*.42,.25,0]],[.25,.22,.16],steel,leg,sides=5)
 b.oval('Boot',[side*.42,.16,.15],[.27,.18,.4],dark,leg,e=.5,rows=3,cols=5)
 b.tube('Arm',[[side*.7,3.12,0],[side*.85,2.65,0],[side*.85,2.14,.2]],[.28,.20,.16],dark,arm,sides=5)
 b.oval('Spiked shoulder',[side*.78,3.15,0],[.45,.28,.37],steel,arm,e=.5,rows=3,cols=5)
 b.tube('Crown horn',[[side*.22,4.0,0],[side*.40,4.25,0],[side*.43,4.61,.05],[side*.32,4.83,.08]],[.12,.1,.05,.001],steel,'head',sides=5)
 b.poly('Cloak',[[side*.12,3.1],[side*.50,3.0],[side*.82,.4],[side*.55,.27],[side*.15,.5]],-.37,.02,dark,'cape')
b.tube('Polearm',[[.75,.4,.45],[.75,4.1,.45]],.045,steel,'weapon',sides=5)
b.poly('Crescent axe',[[.75,4.1],[1.43,4.42],[1.25,3.85],[.8,3.70]],.45,.06,steel,'weapon')
(root/'work/imperia_infantry_model.js').write_text('const ImperiaInfantryModel='+json.dumps({'name':model['name'],'detail':full,'distant':b.parts,'pivots':model['pivots'],'count':1000},separators=(',',':'))+';\n',encoding='utf-8')
g.export_glb(model,'NOSTRAVECTOR_Imperia_Legionary.glb');print('Infantry:',len(full),'detail parts;',sum(len(q['indices'])//3 for q in b.parts),'triangles per distant 3D soldier.')
