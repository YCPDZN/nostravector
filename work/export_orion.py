"""Export the exact in-game cartoon meshes, grouped at their articulation pivots."""
from pathlib import Path
import json, struct, math, subprocess
root=Path(__file__).resolve().parents[1]
parts=json.loads((root/'work/orion_parts.json').read_text(encoding='utf-8'))
blob=bytearray();views=[];accessors=[];meshes=[];materials=[]
nodes=[{'name':'Orion Mascar / NV-02 / Chaotic Good','children':[]}]
pivots={'body':[0,0,0]}
for s,tag in [(1,'L'),(-1,'R')]:
    for bone,p in [('upperArm',[s*.27,1.34,0]),('lowerArm',[s*.313,1.075,0]),('thigh',[s*.112,.83,0]),('shin',[s*.129,.47,0]),('foot',[s*.14,.14,.015])]:pivots[tag+'-'+bone]=p
groups={}
for bone,p in pivots.items():
    groups[bone]=len(nodes);nodes[0]['children'].append(len(nodes));nodes.append({'name':bone,'translation':p,'children':[]})
def array(values,kind,component,typ,count,target=None,bounds=False):
    while len(blob)%4:blob.append(0)
    start=len(blob);blob.extend(struct.pack('<'+kind*len(values),*values));view={'buffer':0,'byteOffset':start,'byteLength':len(blob)-start}
    if target:view['target']=target
    views.append(view);a={'bufferView':len(views)-1,'componentType':component,'count':count,'type':typ}
    if bounds:a.update(min=[min(values[i::3]) for i in range(3)],max=[max(values[i::3]) for i in range(3)])
    accessors.append(a);return len(accessors)-1
for q in parts:
    c=q['c'];material=next((i for i,m in enumerate(materials) if m['pbrMetallicRoughness']['baseColorFactor'][:3]==c),None)
    if material is None:
        material=len(materials);materials.append({'name':q['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':c+[1],'metallicFactor':.2,'roughnessFactor':.8}})
    pivot=pivots[q['bone']];p=[v-pivot[i] for vertex in q['p'] for i,v in enumerate(vertex)];n=[v for vertex in q['n'] for v in vertex]
    pi=array(p,'f',5126,'VEC3',len(q['p']),34962,True);ni=array(n,'f',5126,'VEC3',len(q['n']),34962);fi=array(q['f'],'H',5123,'SCALAR',len(q['f']),34963)
    meshes.append({'name':q['name'],'primitives':[{'attributes':{'POSITION':pi,'NORMAL':ni},'indices':fi,'material':material}]})
    nodes[groups[q['bone']]]['children'].append(len(nodes));nodes.append({'name':q['name'],'mesh':len(meshes)-1})
gltf={'asset':{'version':'2.0','generator':'NOSTRAVECTOR Orion cartoon model'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,'extras':{'name':'Orion Mascar','designation':'NV-02','alignment':'Chaotic Good','animation':'The game drives the same articulated walking rig used for James Brown.'}}
raw=json.dumps(gltf,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);blob+=b'\0'*((-len(blob))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(raw)+8+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob
(root/'outputs/NOSTRAVECTOR_Orion_Mascar.glb').write_bytes(glb)
node=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
code="process.stdout.write(JSON.stringify(require(process.argv[1]).ORION_QUOTES))"
quotes=json.loads(subprocess.check_output([str(node),'-e',code,str(root/'work/africa_core.js')]))
(root/'outputs/NOSTRAVECTOR_Orion_Script.txt').write_text('ORION MASCAR / NV-02\nALIGNMENT: CHAOTIC GOOD\n\n'+'\n\n'.join(f'{i+1}. {q}' for i,q in enumerate(quotes))+'\n\nAfter line five, Orion happily joins and follows the player.\n',encoding='utf-8')
print(f'Exported Orion GLB: {len(parts)} meshes, {len(glb):,} bytes, five dialogue lines.')
