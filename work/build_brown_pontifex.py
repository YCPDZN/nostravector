from pathlib import Path
import json,copy
import build_pontifex_model as g
root=Path(__file__).resolve().parents[1];text=(root/'work/pontifex_model.js').read_text();base=json.loads(text[text.index('=')+1:text.rindex(';')]);b=g.Builder();b.parts=[copy.deepcopy(p) for p in base['meshes'] if p['bone']!='head']
james=json.loads((root/'work/james_parts.json').read_text());start=next(i for i,p in enumerate(james) if p['name']=='Face')
for p in james[start:]:
 if p['name']=='Neck':continue
 pts=[[x*1.5,(y-1.415)*1.5+3.45,z*1.5+.03] for x,y,z in p['p']]
 b.add('Brown / '+p['name'],pts,p['n'],p['f'],p.get('c',{'skin':'#c5a58b','hair':'#523128','white':'#dce8e4','iris':'#82785f','black':'#11191d','ear_inner':'#a17b6d'}.get(p.get('mat'),'#59676c')),'head')
for side in [-1,1]:
 b.oval('Cybernetic temple implant',[side*.34,3.96,.04],[.075,.20,.18],'#27333a','head',rows=5,cols=10)
 b.tube('Cranial coolant conduit',[[side*.28,3.65,-.14],[side*.38,3.30,-.25]],.045,'#66e4f2','head',sides=8,emission=.5)
b.oval('Left eye optical replacement',[-.16,3.98,.295],[.13,.10,.06],'#c7e4e4','head',rows=5,cols=12)
b.oval('Cold cyan optic',[-.16,3.98,.35],[.065,.055,.025],'#32e6f2','head',rows=5,cols=12,emission=.9)
b.oval('Cybernetic lower jaw plate',[0,3.55,.25],[.25,.11,.09],'#64747b','head',e=.35,rows=5,cols=10)
b.oval('Maroon Antarctic service patch',[-.51,3.14,.37],[.13,.10,.025],'#80242d',e=.3,rows=4,cols=8)
model={**base,'name':'James Brown / First Pontifex Maximus','meshes':b.parts,'design':'Reconstructed James Brown: recognisable face and dark hair, exposed cybernetic temple implants, cyan replacement optic, breathing jaw plate, maroon service patch and heavy Pontifex armour.'}
(root/'work/brown_pontifex_model.js').write_text('const BrownPontifexModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8');g.PIVOTS=base['pivots'];g.export_glb(model,'NOSTRAVECTOR_James_Brown_Pontifex.glb');print('Built unique Brown:',len(b.parts),'parts')
