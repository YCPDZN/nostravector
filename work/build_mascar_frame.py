"""Original articulated industrial exoframe, reference-inspired geometry and ten GLB clips."""
from pathlib import Path
import json, math, struct, random
import build_pontifex_model as geometry
from build_pontifex_model import Builder
W=Path(__file__).resolve().parent; OUT=W.parent/'outputs'
P={'body':[0,4.5,0],'leftArm':[-2.3,6.1,0],'rightArm':[2.3,6.1,0],
   'leftElbow':[-2.8,4.5,0],'rightElbow':[2.8,4.5,0],
   'leftLeg':[-1.05,3.4,0],'rightLeg':[1.05,3.4,0],
   'leftKnee':[-1.18,1.95,.1],'rightKnee':[1.18,1.95,.1]}
PARENTS={'leftElbow':'leftArm','rightElbow':'rightArm','leftKnee':'leftLeg','rightKnee':'rightLeg'}
b=Builder(); rng=random.Random(14571)
DARK='#20282a';STEEL='#59605d';EDGE='#89928b';YELLOW='#b39443';CHIP='#786b47';GLASS='#254c4c';CYAN='#74d8d1';RUBBER='#11191c'
def box(name,c,size,col,bone='body',e=.35):b.oval(name,c,[v/2 for v in size],col,bone,e=e,rows=4,cols=8)
def rail(name,a,z,r=.055,col=EDGE,bone='body'):b.tube(name,[a,z],r,col,bone,sides=8)
def bolt(c,bone='body'):b.oval('Hex fastener',c,[.065,.065,.036],EDGE,bone,rows=4,cols=6)
box('Engine cradle',[0,4.45,-.3],[3.2,2.25,2.25],DARK)
box('Belly counterweight',[0,3.55,0],[2.9,.65,2],STEEL)
for i in range(8):box('Abdomen cooling grille',[0,3.65+i*.085,1.03],[1.9,.035,.05],RUBBER)
outline=[[-.89,4.75],[-1.05,5.15],[-1.05,6.78],[-.68,7.35],[.68,7.35],[1.05,6.78],[1.05,5.15],[.89,4.75]]
b.poly('Smoky green cockpit glazing',outline,1.05,.18,GLASS,bevel=.08)
for i,(x,y) in enumerate(outline):
 nx,ny=outline[(i+1)%len(outline)];rail('Cockpit crash cage',[x,y,1.22],[nx,ny,1.22],.075)
rail('Central windscreen rib',[0,4.76,1.27],[0,7.34,1.27],.04,col=YELLOW)
for y in [5.18,6.8]:rail('Windscreen cross rail',[-1.05,y,1.27],[1.05,y,1.27],.045)
for side in [-1,1]:
 for z in [.2,.7]:rail('Roll cage side', [side*1.1,4.75,z],[side*1.1,7.05,z],.065)
 box('Cockpit side armour',[side*1.27,5.6,.15],[.38,2.6,1.6],STEEL)
 box('External yellow cheek panel',[side*1.47,5.48,.36],[.1,1.75,.95],YELLOW)
 for j in range(6):box('Side intake fins',[side*1.54,5.05+j*.16,.16],[.05,.065,.83],RUBBER)
 box('Top warning beacon housing',[side*1.46,7.26,.05],[.38,.5,.38],DARK)
 box('Warning beacon',[side*1.46,7.53,.05],[.24,.13,.24],'#e2b85c')
 for y in [4.9,6.6]:bolt([side*1.43,y,1.0])
box('Armoured canopy roof',[0,7.43,.16],[1.9,.25,1.9],STEEL)
for x in [-.6,0,.6]:box('Roof reinforcing strips',[x,7.57,.12],[.1,.08,1.85],EDGE)
# A small visible pilot behind the cage; the full human boss is removed in phase two.
box('Pilot pressure suit',[0,5.64,1.17],[.54,.58,.16],DARK)
b.oval('Orion pilot head',[0,6.16,1.23],[.20,.25,.10],'#b38d73',rows=8,cols=12)
b.oval('Orion pilot beard',[0,6.02,1.29],[.19,.13,.07],'#353432',rows=6,cols=12)
box('Pilot visor',[0,6.22,1.34],[.39,.07,.05],RUBBER)
box('Pilot control yoke',[0,5.55,1.38],[.7,.09,.09],EDGE)
for side in [-1,1]:rail('Pilot arms',[side*.24,5.88,1.22],[side*.31,5.58,1.36],.06,col=DARK)
for side in [-1,1]:
 arm='leftArm' if side<0 else 'rightArm'; elbow='leftElbow' if side<0 else 'rightElbow';leg='leftLeg' if side<0 else 'rightLeg';knee='leftKnee' if side<0 else 'rightKnee'
 # Independent shoulder, elbow and hip/knee pivots expose rotating bearings.
 for r,col in [(.63,DARK),(.45,STEEL),(.28,RUBBER),(.13,EDGE)]:
  b.tube('Layered shoulder bearing',[[side*2.3,6.1,.02],[side*2.3,6.1,.6]],[r,r],col,arm,sides=20)
 box('Shoulder shield',[side*2.35,6.94,.18],[1.6,.35,1.8],YELLOW,arm)
 for x in [-.55,.55]:box('Shoulder shield flange',[side*2.35+x,6.75,.15],[.14,.35,1.85],STEEL,arm)
 rail('Upper arm frame',[side*2.45,5.95,0],[side*2.8,4.53,.02],.27,col=STEEL,bone=arm)
 for offset in [-.28,.28]:
  rail('Arm hydraulic cylinder',[side*2.5+offset,5.75,.3],[side*2.75+offset,4.95,.35],.105,col=YELLOW,bone=arm)
  rail('Arm polished piston',[side*2.75+offset,4.95,.35],[side*2.85+offset,4.45,.35],.055,col=EDGE,bone=arm)
 b.oval('Elbow ball',[side*2.8,4.5,.02],[.42,.42,.42],RUBBER,elbow)
 box('Forearm armour',[side*2.94,3.75,.10],[.86,1.36,1.05],STEEL,elbow)
 box('Worn yellow forearm plate',[side*2.94,3.8,.65],[.76,1.16,.11],YELLOW,elbow)
 for j in range(5):box('Forearm vent',[side*2.94,3.43+j*.14,.72],[.5,.045,.05],RUBBER,elbow)
 b.tube('Wrist coupling',[[side*3,3.12,.1],[side*3,2.83,.1]],.31,DARK,elbow,sides=16)
 box('Mechanical palm',[side*3,2.65,.14],[.75,.45,.75],DARK,elbow)
 for digit in [-1,0,1]:
  x=side*3+digit*.25
  b.tube('Articulated claw fingers',[[x,2.7,.39],[x,2.26,.62],[x,1.93,.40],[x,2.03,.18]],[.095,.095,.07,.035],STEEL,elbow,sides=8)
  for y,z in [(2.26,.62),(1.93,.40)]:b.oval('Claw knuckle',[x,y,z],[.12,.12,.12],DARK,elbow,rows=4,cols=8)
 b.tube('Opposed claw thumb',[[side*3.35,2.72,-.08],[side*3.5,2.3,.12],[side*3.23,2.15,.29]],[.12,.1,.035],STEEL,elbow,sides=8)
 b.tube('Forearm cannon',[[side*2.75,3.68,.63],[side*2.75,3.5,1.0]],.12,RUBBER,elbow,sides=12)
 b.oval('Cannon emitter',[side*2.75,3.49,1.03],[.09,.09,.04],CYAN,elbow,emission=.65)
 # Hip and thigh armour above independently bending knees.
 b.tube('Hip axle',[[side*.68,3.35,0],[side*1.35,3.35,0]],.38,DARK,leg,sides=16)
 box('Thigh pressure frame',[side*1.08,2.8,0],[1,1.4,1.2],STEEL,leg)
 box('Thigh yellow plate',[side*1.08,2.85,.65],[.9,.97,.15],YELLOW,leg)
 b.oval('Knee hinge',[side*1.18,1.95,.1],[.57,.47,.53],DARK,knee)
 b.oval('Knee guard',[side*1.18,1.97,.59],[.43,.35,.17],STEEL,knee,e=.5)
 box('Shin frame',[side*1.24,1.12,.02],[1.02,1.55,1.08],STEEL,knee)
 box('Shin hazard armour',[side*1.24,1.11,.62],[.94,1.33,.16],YELLOW,knee)
 for off in [-.33,.33]:
  rail('Shin hydraulic',[side*1.24+off,1.73,.18],[side*1.24+off,.63,.2],.085,col=RUBBER,bone=knee)
  rail('Shin piston',[side*1.24+off,.63,.2],[side*1.24+off,.37,.3],.045,col=EDGE,bone=knee)
 box('Stabilised heavy foot',[side*1.24,.24,.43],[1.35,.45,1.94],DARK,knee)
 box('Foot toe armour',[side*1.24,.43,1.06],[1.30,.22,.54],STEEL,knee)
 for j in range(6):box('Foot grip tread',[side*1.24,.055,-.35+j*.29],[1.3,.09,.09],EDGE,knee)
 for y in [.63,1.55,2.55,3.12]:bolt([side*1.24,y,.73],knee if y<2 else leg)
 # Twin vectoring jet banks and shoulder missile cells.
 box('Jet turbine backpack',[side*.76,5.82,-1.45],[1.05,2.65,1.1],DARK)
 b.tube('Jet engine sheath',[[side*.76,5.55,-1.45],[side*.76,4.3,-1.45]],.39,STEEL,sides=16)
 b.tube('Jet nozzle',[[side*.76,4.52,-1.45],[side*.76,4.16,-1.45]],[.34,.42],RUBBER,sides=16)
 b.oval('Jet throat glow',[side*.76,4.16,-1.45],[.27,.06,.27],CYAN,emission=.9)
 box('Shoulder launcher',[side*1.54,6.84,-.62],[.65,.75,1.04],STEEL)
 for j in range(3):b.oval('Missile tube',[side*1.54,6.63+j*.21,-.04],[.16,.07,.055],RUBBER,rows=4,cols=8)
 b.tube('Exposed service cable',[[side*.66,4.5,-1.04],[side*1.35,4.18,-1.08],[side*1.67,3.65,-.65]],[.065,.065,.05],RUBBER,sides=10)
for j in range(35):
 side=rng.choice([-1,1]);bone=rng.choice(['leftArm','rightArm','leftLeg','rightLeg','leftKnee','rightKnee']);pivot=P[bone];x=pivot[0]+rng.uniform(-.22,.22);y=pivot[1]-rng.uniform(.25,1.0)
 box('Armour scuff',[x,y,.74 if 'Leg' in bone or 'Knee' in bone else .69],[rng.uniform(.08,.23),.025,.013],CHIP,bone)
# Merge by material/bone so detail does not mean hundreds of draw calls.
groups={}
for part in b.parts:
 key=(part['bone'],tuple(part['color']),part['emission']);q=groups.setdefault(key,{**part,'name':part['bone']+' / '+part['name'],'p':[],'n':[],'indices':[]});offset=len(q['p'])//3;q['p']+=part['p'];q['n']+=part['n'];q['indices'] += [i+offset for i in part['indices']]
model={'name':'Mascar Frame','faction':'TERRA','pivots':P,'parents':PARENTS,'height':7.7,'meshes':list(groups.values()),'design':'Original weathered industrial exoframe, pilot cockpit cage, hydraulic limbs, claws and twin flight jets.'}
(W/'mascar_frame_model.js').write_text('const MascarFrameModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
geometry.PIVOTS=P;geometry.export_glb(model,'NOSTRAVECTOR_Mascar_Frame.glb')
path=OUT/'NOSTRAVECTOR_Mascar_Frame.glb';raw=path.read_bytes();jl=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+jl]);bl=struct.unpack_from('<I',raw,20+jl)[0];blob=bytearray(raw[28+jl:28+jl+bl]);nodes={n['name']:i for i,n in enumerate(g['nodes'])}
for child,parent in PARENTS.items():
 g['nodes'][nodes['body']]['children'].remove(nodes[child]);g['nodes'][nodes[parent]]['children'].append(nodes[child]);g['nodes'][nodes[child]]['translation']=[P[child][i]-P[parent][i] for i in range(3)]
def accessor(values,typ,size):
 blob.extend(b'\0'*((-len(blob))%4));start=len(blob);blob.extend(struct.pack('<'+'f'*len(values),*values));g['bufferViews'].append({'buffer':0,'byteOffset':start,'byteLength':len(blob)-start});a={'bufferView':len(g['bufferViews'])-1,'componentType':5126,'type':typ,'count':len(values)//size}
 if typ=='SCALAR':a.update(min=[min(values)],max=[max(values)])
 g['accessors'].append(a);return len(g['accessors'])-1
def quat(x=0,y=0,z=0):
 sx,cx=math.sin(x/2),math.cos(x/2);sy,cy=math.sin(y/2),math.cos(y/2);sz,cz=math.sin(z/2),math.cos(z/2)
 return [sx*cy*cz+cx*sy*sz,cx*sy*cz-sx*cy*sz,cx*cy*sz+sx*sy*cz,cx*cy*cz-sx*sy*sz]
names=['Piston Punch','Claw Sweep','Seismic Stomp','Shoulder Barrage','Arc Cannon','Jet Dash','Aerial Strafe','Dive Slam','Rotor Spin','Twin Hammer'];g['animations']=[]
for i,name in enumerate(names):
 times=[k/30*4 for k in range(31)];inp=accessor(times,'SCALAR',1);tracks={key:[] for key in P};heights=[]
 for k in range(31):
  t=k/30;strength=math.sin(t*math.pi);v={key:[0,0,0] for key in P};height=0
  if i==0:v['leftArm'][0]=-1.55*strength;v['leftElbow'][0]=.9*strength
  if i==1:v['rightArm']=[-.7*strength,0,(1 if t<.5 else -1)*strength];v['body'][1]=strength*(.5 if t<.5 else -.8)
  if i==2:v['leftLeg'][0]=-.9*strength;v['leftKnee'][0]=1.2*strength
  if i==3:v['leftArm'][0]=v['rightArm'][0]=-.45*strength;v['body'][0]=-.16*math.sin(t*math.pi*4)*strength
  if i==4:v['leftArm'][0]=-1.4*strength;v['leftElbow'][0]=.28*strength
  if i==5:height=5*strength;v['body'][0]=.6*strength;v['leftKnee'][0]=v['rightKnee'][0]=.8*strength
  if i==6:height=10*strength;v['leftArm'][2]=-.85*strength;v['rightArm'][2]=.85*strength;v['leftKnee'][0]=v['rightKnee'][0]=.9*strength
  if i==7:height=14*strength;v['leftArm'][0]=v['rightArm'][0]=-2.4*strength;v['leftKnee'][0]=v['rightKnee'][0]=1.1*strength
  if i==8:v['body'][1]=t*math.pi*4;v['leftArm'][2]=-1.4*strength;v['rightArm'][2]=1.4*strength
  if i==9:v['leftArm'][0]=v['rightArm'][0]=-2.8*strength;v['leftElbow'][0]=v['rightElbow'][0]=.8*strength
  for key in P:tracks[key]+=quat(*v[key])
  heights += [0,height,0]
 clip={'name':name,'samplers':[],'channels':[]}
 for key,values in tracks.items():
  clip['samplers'].append({'input':inp,'output':accessor(values,'VEC4',4),'interpolation':'LINEAR'});clip['channels'].append({'sampler':len(clip['samplers'])-1,'target':{'node':nodes[key],'path':'rotation'}})
 clip['samplers'].append({'input':inp,'output':accessor(heights,'VEC3',3),'interpolation':'LINEAR'});clip['channels'].append({'sampler':len(clip['samplers'])-1,'target':{'node':0,'path':'translation'}});g['animations'].append(clip)
g['buffers'][0]['byteLength']=len(blob);data=json.dumps(g,separators=(',',':')).encode();data+=b' '*((-len(data))%4);blob+=b'\0'*((-len(blob))%4);path.write_bytes(struct.pack('<III',0x46546c67,2,28+len(data)+len(blob))+struct.pack('<II',len(data),0x4e4f534a)+data+struct.pack('<II',len(blob),0x004e4942)+blob)
print('Mascar Frame:',len(model['meshes']),'draw groups,',sum(len(m['indices'])//3 for m in model['meshes']),'triangles; ten articulated GLB animations.')
