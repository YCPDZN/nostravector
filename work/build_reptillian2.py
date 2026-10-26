"""Heavier species-creator variant; the authored Tyrotaronus model stays intact."""
from pathlib import Path
import copy, json, math
import build_pontifex_model as geometry
from build_pontifex_model import Builder, export_glb

work=Path(__file__).resolve().parent
original=json.loads((work/'tyrotaronus_model.js').read_text(encoding='utf-8').split('=',1)[1].strip().rstrip(';'))
model=copy.deepcopy(original)
for part in model['meshes']:
    if part.get('bone') not in ('head','jaw','eyes'): continue
    factors=(1.24,1.12,1.07)
    points=part['p']
    nested=bool(points and isinstance(points[0],list))
    flat=[v for point in points for v in point] if nested else points
    part['p']=[(v-(3.92 if i%3==1 else 0))*factors[i%3]+(3.92 if i%3==1 else 0) for i,v in enumerate(flat)]
    normals=part['n'];normals=[v for point in normals for v in point] if normals and isinstance(normals[0],list) else normals
    part['n']=[]
    for i in range(0,len(normals),3):
        n=[normals[i+k]/factors[k] for k in range(3)];length=math.hypot(*n) or 1
        part['n'] += [v/length for v in n]

b=Builder();steel='#7b929f';dark='#344d61';edge='#bed0d6';glow='#69ffad'
def panel(name,position,size,bone='body'):
    b.oval(name+' armour rim',position,[v*1.10 for v in size],edge,bone,e=.55,rows=5,cols=12)
    b.oval(name+' armour plate',[position[0],position[1],position[2]+.025],size,dark,bone,e=.55,rows=5,cols=12)

# A broad dragon head retains the exposed muzzle, eyes, crown and teeth.
for side in (-1,1):
    panel('Reptillian 2 cheek guard '+str(side),[side*.36,3.96,.31],[.11,.16,.17],'head')
    b.tube('Reptillian 2 armoured brow '+str(side),[[side*.12,4.28,.43],[side*.30,4.29,.46],[side*.44,4.20,.29]],[.045,.055,.028],steel,'head',sides=10)
panel('Reptillian 2 forehead crest',[0,4.30,.17],[.16,.10,.19],'head')
for i in range(3):
    panel('Reptillian 2 neck gorget '+str(i),[0,3.43+i*.12,.14],[.27-i*.02,.07,.16],'head')

panel('Reptillian 2 closed breastplate',[0,2.88,.29],[.50,.35,.18])
b.oval('Reptillian 2 breastplate power core',[0,2.95,.49],[.085,.10,.025],glow,emission=.5)
for i in range(3):panel('Reptillian 2 abdominal lamella '+str(i),[0,2.53-i*.16,.32],[.38-i*.025,.095,.10])
panel('Reptillian 2 pelvic shield',[0,1.92,.27],[.28,.20,.12])
for side in (-1,1):
    arm='leftArm' if side<0 else 'rightArm';leg='leftLeg' if side<0 else 'rightLeg'
    panel('Reptillian 2 reinforced pauldron '+str(side),[side*.64,3.28,.05],[.43,.30,.37],arm)
    panel('Reptillian 2 biceps guard '+str(side),[side*.72,2.91,.10],[.22,.23,.23],arm)
    panel('Reptillian 2 thigh cuirass '+str(side),[side*.42,1.57,.12],[.24,.35,.17],leg)
    panel('Reptillian 2 knee shield '+str(side),[side*.50,1.13,.26],[.24,.20,.15],leg)
    panel('Reptillian 2 shin greave '+str(side),[side*.45,.72,.02],[.19,.27,.20],leg)
    panel('Reptillian 2 ankle guard '+str(side),[side*.46,.27,.12],[.18,.15,.17],leg)
model['meshes']+=b.parts
model['name']='Reptillian 2 / Armoured dragon infantry'
(work/'reptillian2_model.js').write_text('const Reptillian2Model='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
geometry.PIVOTS.update(model['pivots'])
export_glb(model,'NOSTRAVECTOR_Reptillian_2.glb')
print('Built Reptillian 2: enlarged dragon head and layered full-body armour;',len(model['meshes']),'parts.')
