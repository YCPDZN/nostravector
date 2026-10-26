from pathlib import Path
import json, struct
w=Path(__file__).resolve().parent;o=w.parent/'outputs'
s=(w/'mascar_frame_model.js').read_text();m=json.loads(s[s.index('=')+1:s.rindex(';')])
def silver(c):
 if c[0]>.35 and c[0]>c[2]*1.3:return [.53,.58,.61]
 return [min(1,v*1.12) for v in c]
m['name']='Mascar Frame / Orbital Rampage';m['scale']=10
for p in m['meshes']:p['color']=silver(p['color'])
(w/'mascar_rampage_model.js').write_text('const MascarRampageModel='+json.dumps(m,separators=(',',':'))+';\n',encoding='utf-8')
raw=(o/'NOSTRAVECTOR_Mascar_Frame.glb').read_bytes();n=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+n]);blob=raw[28+n:];g['nodes'][0]['name']=m['name'];g['nodes'][0]['scale']=[10,10,10]
for mat in g['materials']:mat['pbrMetallicRoughness']['baseColorFactor']=silver(mat['pbrMetallicRoughness']['baseColorFactor'][:3])+[1];mat['pbrMetallicRoughness']['metallicFactor']=.85
data=json.dumps(g,separators=(',',':')).encode();data+=b' '*((-len(data))%4);(o/'NOSTRAVECTOR_Mascar_Orbital_Rampage.glb').write_bytes(struct.pack('<III',0x46546c67,2,28+len(data)+len(blob))+struct.pack('<II',len(data),0x4e4f534a)+data+struct.pack('<II',len(blob),0x004e4942)+blob)
print('Built silver orbital Frame, articulated and scaled to 77 metres.')
