"""Export the same procedural cutscene geometry as a reusable binary glTF model."""
from pathlib import Path
import subprocess,json,struct,math
root=Path(__file__).resolve().parents[1]
node=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
code="const fs=require('fs'),vm=require('vm');process.stdout.write(vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8')+'\\n'+fs.readFileSync(process.argv[2],'utf8').match(/const GREK_QUOTES=(\\[[\\s\\S]*?\\]);/)[0]+'JSON.stringify({model:GrekModel,quotes:GREK_QUOTES})'));"
data=json.loads(subprocess.check_output([str(node),'-e',code,str(root/'work/grek_model.js'),str(root/'work/grek_dialogue.js')]))
model=data['model'];blob=bytearray();views=[];accessors=[];meshes=[];materials=[];nodes=[{'name':'Dream Visitor','children':[1,2]},{'name':'Body','children':[]},{'name':'Head','translation':[0,3.12,0],'children':[3,4,5]},{'name':'Jaw','translation':[0,.20,.19],'children':[6]},{'name':'Eyes','children':[]},{'name':'Upper lip','translation':[0,.28,.57],'children':[]},{'name':'Lower lip','translation':[0,-.05,.38],'children':[]}]
pivots={'body':[0,0,0],'head':[0,3.12,0],'jaw':[0,3.32,.19],'eyes':[0,3.12,0],'upperLip':[0,3.40,.57],'lowerLip':[0,3.27,.57]};groups={'body':1,'head':2,'jaw':3,'eyes':4,'upperLip':5,'lowerLip':6}
def array(values,kind,component,typ,count,target=None,bounds=False):
 while len(blob)%4:blob.append(0)
 start=len(blob);blob.extend(struct.pack('<'+kind*len(values),*values));view={'buffer':0,'byteOffset':start,'byteLength':len(blob)-start}
 if target:view['target']=target
 views.append(view);accessor={'bufferView':len(views)-1,'componentType':component,'count':count,'type':typ}
 if bounds:accessor.update(min=[min(values[i::3]) for i in range(3)],max=[max(values[i::3]) for i in range(3)])
 accessors.append(accessor);return len(accessors)-1
for m in model['meshes']:
 color=m['color'];material=next((i for i,x in enumerate(materials) if x['pbrMetallicRoughness']['baseColorFactor'][:3]==color),None)
 if material is None:
  material=len(materials);materials.append({'name':m['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':color+[1],'metallicFactor':.55 if 'plate' in m['name'] or 'armour' in m['name'] else .10,'roughnessFactor':.50}})
 pivot=pivots[m['bone']];positions=[v-pivot[i%3] for i,v in enumerate(m['p'])];vertices=len(positions)//3
 p=array(positions,'f',5126,'VEC3',vertices,34962,True);n=array(m['n'],'f',5126,'VEC3',vertices,34962);ind=array(m['indices'],'H',5123,'SCALAR',len(m['indices']),34963)
 meshes.append({'name':m['name'],'primitives':[{'attributes':{'POSITION':p,'NORMAL':n},'indices':ind,'material':material}]});nodes[groups[m['bone']]]['children'].append(len(nodes));nodes.append({'name':m['name'],'mesh':len(meshes)-1})
# Named sample animation; the game drives this jaw from speech rather than a looping clip.
times=[0,.15,.3,.45,.6,.75,.9,1.05,1.2];rotations=[]
for i,t in enumerate(times):
 angle=[0,.19,.04,.26,.05,.18,0,.12,0][i];rotations.extend([math.sin(angle/2),0,0,math.cos(angle/2)])
t=array(times,'f',5126,'SCALAR',len(times));accessors[t].update(min=[0],max=[times[-1]])
r=array(rotations,'f',5126,'VEC4',len(times));gltf={'asset':{'version':'2.0','generator':'NOSTRAVECTOR procedural Grek'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,'animations':[{'name':'Jaw speaking example','samplers':[{'input':t,'output':r,'interpolation':'LINEAR'}],'channels':[{'sampler':0,'target':{'node':3,'path':'rotation'}}]}]}
raw=json.dumps(gltf,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);blob+=b'\0'*((-len(blob))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(raw)+8+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob
(root/'outputs/NOSTRAVECTOR_Grek.glb').write_bytes(glb)
(root/'outputs/NOSTRAVECTOR_Grek_Script.txt').write_text('???? — DREAM BEFORE DAWN\n\n'+'\n\n'.join(f'{i+1}. {q}' for i,q in enumerate(data['quotes']))+'\n',encoding='utf-8')
print(f'Exported {len(meshes)} meshes, {sum(len(m["p"])//3 for m in model["meshes"]):,} vertices; {len(glb):,} bytes. Five-line script saved.')
