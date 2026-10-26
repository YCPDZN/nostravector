from pathlib import Path
import json,shutil,copy
from import_james_audio import duration
import build_pontifex_model as g
w=Path(__file__).resolve().parent;d=w/'audio/brown-return';d.mkdir(parents=True,exist_ok=True);clips=[]
for kind,prefix,count in [('intro','JBR',5),('battle','JBRBF',10)]:
 for i in range(1,count+1):
  name=f'{prefix}{i}.mp3';shutil.copyfile(Path('C:/Users/HOME/Documents/NOSTRAVECTOR/james brown return')/name,d/name);clips.append({'kind':kind,'line':i,'file':'audio/brown-return/'+name,'duration':duration((d/name).read_bytes())})
name='POSTJB1.mp3';shutil.copyfile(Path('C:/Users/HOME/Documents/NOSTRAVECTOR/james brown return')/name,d/name);clips.append({'kind':'post','line':1,'file':'audio/brown-return/'+name,'duration':duration((d/name).read_bytes())})
(w/'brown_return_audio.json').write_text(json.dumps(clips,indent=2),encoding='utf-8')
source=(w/'brown_pontifex_model.js').read_text();base=json.loads(source[source.index('=')+1:source.rindex(';')]);arm=copy.deepcopy(base);arm['meshes']=[p for p in arm['meshes'] if p.get('bone')!='weapon' and not any(k in p['name'].lower() for k in ['heart','thorn'])];arm['name']='James Brown / Recruited Pontifex armour';g.PIVOTS=base['pivots'];g.export_glb(arm,'NOSTRAVECTOR_James_Companion_Armour.glb')
(w/'brown_companion_armour.js').write_text('const BrownCompanionArmour='+json.dumps(arm,separators=(',',':'))+';\n',encoding='utf-8')
b=g.Builder()
james=json.loads((w/'james_parts.json').read_text());faceStart=next(i for i,p in enumerate(james) if p['name']=='Face')
palette={'skin':'#e5b78a','hair':'#773b20','white':'#f2f4ef','iris':'#83785d','black':'#11191d','ear_inner':'#a17b6d'}
for i,p in enumerate(james):b.add(p['name'],p['p'],p['n'],p['f'],'#'+''.join(f'{round(v*255):02x}' for v in p['c']) if 'c' in p else palette.get(p.get('mat'),'#59676c'),'head' if i>=faceStart and p['name']!='Neck' else 'body')
b.oval('Imperia eye patch',[-.105,1.77,.21],[.095,.07,.035],'#17252e','head',rows=5,cols=12)
b.oval('Imperial replacement optic',[-.105,1.77,.247],[.038,.025,.012],'#3bdaed','head',rows=5,cols=12,emission=.7)
b.tube('Eye patch strap',[[-.105,1.77,.21],[-.26,1.76,.05],[-.22,1.76,-.15]],.023,'#1b2429','head')
service={**base,'name':'James Brown / Original Antarctic attire with Imperial eye patch','meshes':b.parts};(w/'brown_companion_service.js').write_text('const BrownCompanionService='+json.dumps(service,separators=(',',':'))+';\n',encoding='utf-8');g.export_glb(service,'NOSTRAVECTOR_James_Companion_Service.glb')
print('Imported 16 James recordings:',[(c['kind'],c['line'],c['duration']) for c in clips]);print('Built service and heart-free armour models.')

