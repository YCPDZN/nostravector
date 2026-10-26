"""Detailed cartoon models using James's face/body proportions and game lip rig."""
from pathlib import Path
import copy, json, math, struct
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'work'; OUT=ROOT/'outputs'; SCALE=2.15
JAMES=json.loads((WORK/'james_parts.json').read_text(encoding='utf-8'))
FACE=json.loads((WORK/'face_parts.json').read_text(encoding='utf-8'))
def rgb(h):return [int(h[i:i+2],16)/255 for i in (1,3,5)]
def signed(v,e):return math.copysign(abs(v)**e,v)

class Builder:
 def __init__(self):self.parts=[]
 def add(self,name,p,n,f,color,bone='body'):
  self.parts.append(dict(name=name,p=p,n=n,f=f,c=rgb(color),bone=bone))
 def oval(self,name,center,size,color,bone='body',e=1,rows=10,cols=20):
  p=[];n=[];f=[]
  for i in range(rows+1):
   b=i/rows*math.pi
   for j in range(cols+1):
    a=j/cols*math.tau;q=[signed(math.sin(b),e)*signed(math.cos(a),e),signed(math.cos(b),e),signed(math.sin(b),e)*signed(math.sin(a),e)]
    p.append([round(center[k]+q[k]*size[k],6) for k in range(3)])
    v=[signed(q[k],2/e-1)/size[k] for k in range(3)];l=math.hypot(*v) or 1;n.append([round(x/l,6) for x in v])
  for i in range(rows):
   for j in range(cols):
    a=i*(cols+1)+j;b=a+cols+1;f.extend([a,a+1,b,a+1,b+1,b])
  self.add(name,p,n,f,color,bone)
 def tube(self,name,points,radius,color,bone='body',sides=10):
  p=[];n=[];f=[]
  for j,c in enumerate(points):
   d=[points[min(j+1,len(points)-1)][k]-points[max(0,j-1)][k] for k in range(3)];l=math.hypot(*d);d=[x/l for x in d]
   u=[0,-d[2],d[1]] if abs(d[0])<.8 else [-d[2],0,d[0]];l=math.hypot(*u);u=[x/l for x in u];v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]
   r=radius[j] if isinstance(radius,list) else radius
   for i in range(sides+1):
    a=i/sides*math.tau;q=[u[k]*math.cos(a)+v[k]*math.sin(a) for k in range(3)];p.append([round(c[k]+r*q[k],6) for k in range(3)]);n.append(q)
  for j in range(len(points)-1):
   for i in range(sides):
    a=j*(sides+1)+i;b=a+sides+1;f.extend([a,a+1,b,a+1,b+1,b])
  self.add(name,p,n,f,color,bone)
 def panel(self,name,c,size,color):
  self.oval(name+' recessed edge',c,[x*1.045 for x in size],'#10171e',e=.38)
  self.oval(name+' bevel',(c[0],c[1],c[2]+.007),size,'#65727c',e=.42)
  self.oval(name+' face',(c[0],c[1],c[2]+.015),[size[0]*.92,size[1]*.91,size[2]*.91],color,e=.45)
 def face(self,kind):
  palette={'skin':'#b98f76' if kind=='thomas' else '#d1ad93' if kind=='darius' else '#8dabee','ear_inner':'#8d6255' if kind!='hak' else '#6b8aca','white':'#f2f1ea','black':'#121a22','iris':'#728c96' if kind!='hak' else '#546d9c','hair':'#514e48' if kind=='thomas' else '#494740' if kind=='darius' else '#190e11'}
  for group in ['head','eyes_focused' if kind=='thomas' else 'eyes_relaxed','ears_rounded']:
   for source in FACE[group]:
    q=copy.deepcopy(source);q['c']=rgb(palette.get(q.pop('mat',None),'#c9a78c'));name=q['name']
    q['bone']='jaw' if name=='Jaw' else 'body' if name=='Neck' else 'eyes' if any(v in name for v in ['Eye white','Iris','Pupil','glint']) else 'head'
    self.parts.append(q)
  self.oval('Mouth interior',(0,1.548,.184),(.058,.011,.015),'#22151a','jaw')
  self.oval('Upper lip',(0,1.558,.199),(.061,.006,.010),palette['ear_inner'],'upperLip')
  self.oval('Lower lip',(0,1.535,.193),(.057,.008,.012),palette['skin'],'lowerLip')
  self.oval('Upper teeth',(0,1.550,.195),(.041,.004,.005),'#ece8dc','teeth')
  self.oval('Tongue',(0,1.542,.195),(.030,.003,.004),'#8f565d','jaw')
  for side in [-1,1]:
   self.oval('Nostril '+str(side),(side*.020,1.622,.218),(.011,.006,.005),palette['ear_inner'],'head')
   self.tube('Brow detail '+str(side),[[side*.034,1.765,.193],[side*.075,1.775,.196],[side*.112,1.765,.183]],.005,palette['hair'],'head')
 def base(self,kind):
  for source in JAMES:
   if source.get('mat') or any(v in source['name'].lower() for v in ['quilt','glove','thumb','sole','toe']) or source['name']=='Coat zip':continue
   q=copy.deepcopy(source);q['bone']='body';name=q['name'].lower()
   q['c']=rgb('#121b26' if kind!='hak' else '#17131b')
   if kind=='hak' and any(v in name for v in ['puffer','arm','collar']) and not any(v in name for v in ['glove','thumb','cuff']):q['c']=rgb('#4d69c0')
   self.parts.append(q)
  self.face(kind)
 def hands(self,color,armour=False):
  for side in [-1,1]:
   self.oval('Palm '+str(side),(side*.333,.765,.024),(.072,.07,.053),color,e=.70)
   for i in range(4):
    x=side*(.288+i*.027);y=.727+(i in [0,3])*.011
    self.tube('Finger '+str(side)+' '+str(i),[[x,y+.017,.048],[x,y-.026,.069],[x,y-.052,.040]],[.012,.013,.009],color)
    if armour:self.oval('Knuckle cap '+str(side)+' '+str(i),(x,.77,.087),(.011,.017,.005),'#697782',e=.5)
   self.tube('Thumb '+str(side),[[side*.282,.788,.034],[side*.263,.760,.074],[side*.273,.738,.080]],[.021,.018,.013],color)
 def model(self,name):
  meshes=[dict(name=q['name'],p=[round(v*SCALE,6) for vertex in q['p'] for v in vertex],n=[v for vertex in q['n'] for v in vertex],indices=q['f'],color=q['c'],bone=q['bone']) for q in self.parts]
  return dict(name=name,meshes=meshes,jawPivot=[0,1.548*SCALE,.08*SCALE],headPivot=[0,1.44*SCALE,0],eyePivot=[0,1.705*SCALE,.17*SCALE],upperLipPivot=[0,1.558*SCALE,.199*SCALE],lowerLipPivot=[0,1.535*SCALE,.193*SCALE],teethPivot=[0,1.550*SCALE,.195*SCALE])

def leader(kind):
 b=Builder();b.base(kind);military=kind=='thomas';accent='#54d7e7' if military else '#c8a351';steel='#293840' if military else '#435364';dark='#17232d';hair='#484945' if military else '#767068'
 b.panel('Breastplate',(0,1.24,.152),(.232,.23,.052),steel)
 for side in [-1,1]:
  tag=str(side)
  b.panel('Chest wing '+tag,(side*.137,1.322,.188),(.09,.115,.031),steel)
  b.panel('Pauldron '+tag,(side*.279,1.365,.026),(.137 if military else .108,.108 if military else .081,.134),steel)
  b.panel('Bicep '+tag,(side*.291,1.22,.078),(.094,.10,.058),steel)
  b.panel('Bracer '+tag,(side*.324,.966,.079),(.093,.135,.065),steel)
  b.panel('Thigh '+tag,(side*.117,.69,.089),(.099,.142,.048),steel)
  b.panel('Knee '+tag,(side*.13,.468,.102),(.099,.080,.042),steel)
  b.panel('Shin '+tag,(side*.137,.295,.089),(.087,.128,.045),steel)
  b.panel('Boot toe '+tag,(side*.145,.088,.155),(.104,.061,.112),steel)
  b.oval('Boot tread '+tag,(side*.145,.022,.082),(.121,.018,.179),'#111820',e=.34)
  for i in range(4):b.oval('Boot tread groove '+tag+str(i),(side*.145,.021,-.026+i*.066),(.124,.012,.006),'#4a5055',e=.3)
  b.oval('Belt pouch '+tag,(side*.149,.91,.169),(.053,.063,.036),dark,e=.36)
  b.oval('Pouch clasp '+tag,(side*.149,.915,.208),(.025,.011,.006),accent,e=.4)
  b.tube('Shoulder harness '+tag,[[side*.172,1.45,.084],[side*.207,1.39,.167],[side*.195,1.27,.206]],.012,dark)
  if military:b.tube('Suit cable '+tag,[[side*.21,1.17,.137],[side*.23,1.11,.191],[side*.18,1.02,.191]],[.012,.014,.011],accent)
  for i in range(3):
   b.oval('Elbow flex rib '+tag+str(i),(side*.312,1.090-i*.023,.090),(.084,.009,.014),'#708089',e=.6)
   b.oval('Pauldron seam '+tag+str(i),(side*.296,1.4-i*.039,.166),(.09 if military else .065,.007,.006),dark,e=.3)
  for x,y,z in [(side*.093,1.405,.218),(side*.211,1.35,.218),(side*.364,1.042,.16),(side*.282,.915,.16),(side*.17,.40,.146)]:b.oval('Armour fastener '+str((x,y)),(x,y,z),(.006,.006,.004),'#87949c',rows=6,cols=10)
 for i in range(3):b.panel('Abdominal lamella '+str(i),(0,1.105-i*.062,.159),(.181-i*.016,.025,.038),steel)
 b.oval('Utility belt',(0,.927,.008),(.21,.029,.154),dark,e=.40)
 b.panel('Belt clasp',(0,.923,.179),(.044,.032,.020),steel)
 b.oval('Belt indicator',(0,.923,.218),(.012,.018,.005),accent,e=.35)
 b.oval('Wrist screen',(-.326,.999,.162),(.037,.045,.006),'#0c1c28',e=.34)
 for i in range(3):b.oval('Wrist status line '+str(i),(-.326,1.02-i*.015,.171),(.029,.003,.002),accent,e=.4)
 b.oval('Faction shield',(.112,1.335,.232),(.034,.043,.005),'#0d344d' if not military else '#111b23',e=.65)
 if military:b.tube('Insignia chevron',[[.088,1.35,.239],[.112,1.32,.239],[.136,1.35,.239]],.0035,accent)
 else:
  b.oval('Federation Earth insignia',(.112,1.337,.241),(.022,.022,.003),'#4184b7')
  b.tube('Federation gold orbit',[[.112+math.cos(i/24*math.tau)*.026,1.337+math.sin(i/24*math.tau)*.026,.245] for i in range(25)],.0025,accent)
  b.tube('Federation equator',[[.091,1.337,.246],[.112,1.337,.246],[.133,1.337,.246]],.002,accent)
 b.tube('Collar ring',[[-.103,1.451,.095],[0,1.435,.122],[.103,1.451,.095]],.012,'#6d7b83')
 b.oval('Communications housing',(-.221,1.718,.008),(.030,.065,.032),dark,'head',e=.40)
 b.oval('Earpiece light',(-.246,1.733,.031),(.004,.020,.009),accent,'head')
 b.tube('Comms boom',[[-.244,1.697,.028],[-.218,1.644,.087],[-.142,1.610,.165]],[.007,.006,.005],'#4e5e68','head')
 b.oval('Microphone',(-.142,1.610,.166),(.018,.008,.009),dark,'head')
 b.hands('#192630',True)
 b.oval('Hair scalp',(0,1.88,-.017),(.184,.037 if not military else .064,.13),hair,'head',rows=12,cols=24)
 for i in range(17):
  x=-.153+i*.019
  b.tube('Hair swept ridge '+str(i),[[x,1.872,.098],[x+.012,1.930 if military else 1.908,.006],[x+.014,1.89,-.116]],[.010,.014 if military else .007,.006],hair if i%3 else '#95968d','head')
 if military:
  for side in [-1,1]:
   b.oval('Beard cheek '+str(side),(side*.105,1.533,.129),(.076,.068,.042),'#4e514c','jaw')
   b.oval('Moustache '+str(side),(side*.028,1.587,.203),(.029,.009,.012),'#5e6058','head')
   for i in range(7):b.tube('Beard strand '+str(side)+str(i),[[side*(.013+i*.021),1.534,.179],[side*(.011+i*.018),1.482,.179]],[.008,.004],'#8a8a7e' if i%2 else '#3f4543','jaw')
  b.oval('Beard chin',(0,1.49,.147),(.089,.044,.056),'#535950','jaw')
  b.tube('Cheek scar',[[.129,1.67,.146],[.115,1.64,.167],[.104,1.613,.172]],.0028,'#936751','head')
  for i in range(3):b.oval('Military service bar '+str(i),(-.116,1.281-i*.016,.229),(.031,.004,.004),accent,e=.35)
 else:
  for side in [-1,1]:b.tube('Smile crease '+str(side),[[side*.057,1.611,.169],[side*.078,1.587,.174],[side*.063,1.561,.180]],.002,'#ac8370','head')
  for i in range(3):b.oval('Federation rank '+str(i),(-.104+i*.021,1.394,.229),(.005,.014,.003),accent,e=.35)
 return b.model('Thomas Hawthorne' if military else 'Darius Ancin')

def hak():
 b=Builder();b.base('hak');blue='#8dabee';coat='#526ec2';edge='#293c7a';hair='#211217'
 b.oval('Waistcoat',(0,1.187,.161),(.127,.239,.028),'#182438',e=.45)
 for side in [-1,1]:
  b.tube('Jacket lapel '+str(side),[[side*.15,1.426,.142],[side*.079,1.29,.200],[side*.127,1.075,.181]],[.024,.019,.011],coat)
  b.tube('Lapel piping '+str(side),[[side*.16,1.426,.161],[side*.095,1.29,.216],[side*.141,1.079,.194]],.004,edge)
  b.tube('Jacket hem '+str(side),[[side*.025,.935,.157],[side*.13,.944,.167],[side*.217,.964,.129]],.005,edge)
  b.oval('Cuff '+str(side),(side*.327,.817,.02),(.089,.025,.093),edge,e=.45)
  b.oval('Cuff button '+str(side),(side*.36,.819,.11),(.008,.008,.004),'#bdc9e0')
  b.tube('Sleeve stitch '+str(side),[[side*.32,1.25,.105],[side*.35,1.07,.115],[side*.364,.862,.101]],.003,'#7595dc')
  b.oval('Jacket pocket '+str(side),(side*.143,1.09,.178),(.058,.046,.009),edge,e=.45)
  b.oval('Pocket welt '+str(side),(side*.143,1.12,.190),(.054,.006,.005),'#7794d7',e=.4)
  b.oval('Boot sole '+str(side),(side*.145,.020,.065),(.124,.023,.18),'#080c13',e=.32)
  b.oval('Boot toe cap '+str(side),(side*.145,.077,.177),(.106,.059,.075),'#262635',e=.48)
  for i in range(3):
   b.oval('Boot strap '+str(side)+str(i),(side*.14,.148+i*.047,.11),(.094,.014,.025),'#282637',e=.45)
   b.oval('Boot buckle '+str(side)+str(i),(side*.173,.148+i*.047,.138),(.032,.017,.005),'#8e94a8',e=.28)
   b.oval('Buckle inset '+str(side)+str(i),(side*.173,.148+i*.047,.145),(.022,.008,.002),'#0d1320',e=.3)
 b.oval('Shirt collar',(0,1.40,.111),(.104,.04,.031),'#acc3ee',e=.5)
 b.tube('Tie',[[0,1.405,.158],[0,1.328,.192],[0,1.10,.199]],[.019,.027,.033],'#0c1528')
 b.oval('Tie clasp',(0,1.234,.228),(.036,.004,.004),'#b7c2d6',e=.3)
 for i in range(3):b.oval('Jacket button '+str(i),(.02,1.115-i*.060,.182),(.009,.009,.005),'#d0b377')
 b.hands(blue)
 # Sculpted shoulder-length hair, separate layered strands and parted fringe.
 b.oval('Long hair back',(0,1.65,-.10),(.214,.261,.126),hair,'head',rows=14,cols=24)
 b.oval('Hair crown',(0,1.865,-.03),(.192,.090,.137),hair,'head')
 for side in [-1,1]:
  for i in range(6):
   x=side*(.168+i*.012);z=.022-i*.022
   b.tube('Long hair layered strand '+str(side)+str(i),[[x*.72,1.91,z-.015],[x,1.82,z],[x*1.09,1.64,z-.014],[x*1.12,1.45-(i%3)*.026,z-.025]],[.031,.025,.023,.004],'#39232b' if i%3==0 else hair,'head')
 for i in range(8):
  x=-.15+i*.038
  b.tube('Parted fringe '+str(i),[[x*.8,1.924,.046],[x,1.864,.137],[x+.023,1.79+(i%2)*.026,.161]],[.024,.029,.006],hair,'head')
 # Round, framed sunglasses rather than featureless dark blobs.
 for side in [-1,1]:
  x=side*.080;yc=1.704;z=.215
  b.oval('Glass lens '+str(side),(x,yc,z),(.061,.054,.013),'#172237','head',rows=12,cols=24)
  points=[[x+math.cos(i/32*math.tau)*.065,yc+math.sin(i/32*math.tau)*.058,z+.009] for i in range(33)]
  b.tube('Glasses frame '+str(side),points,.005,'#090e19','head')
  b.tube('Glasses temple '+str(side),[[side*.141,1.724,.218],[side*.195,1.715,.099],[side*.218,1.695,.027]],.005,'#131828','head')
  b.tube('Lens glint '+str(side),[[x-.032,yc+.027,z+.016],[x+.012,yc+.019,z+.018]],.0025,'#6982aa','head')
  b.oval('Beard cheek '+str(side),(side*.100,1.536,.122),(.069,.090,.051),hair,'jaw')
  b.oval('Moustache '+str(side),(side*.030,1.586,.199),(.033,.010,.015),hair,'head')
  for i in range(5):b.tube('Beard carved strand '+str(side)+str(i),[[side*(.02+i*.025),1.528,.182],[side*(.013+i*.020),1.434,.137]],[.009,.003],'#3c242e' if i%2 else hair,'jaw')
 b.tube('Glasses bridge',[[-.017,1.708,.228],[0,1.719,.232],[.017,1.708,.228]],.005,'#080d15','head')
 b.oval('Beard chin',(0,1.465,.124),(.144,.125,.064),hair,'jaw')
 b.oval('Beard mouth inset',(0,1.550,.170),(.063,.032,.022),blue,'jaw')
 b.oval('purple meadow',(0,.003,-.5),(3.25,.012,2.35),'#37124f',rows=6,cols=24)
 for i in range(54):
  x=math.sin(i*17.3)*2.6;z=math.cos(i*9.7)*1.8-.5
  if math.hypot(x,z)<.6:continue
  b.tube('violet grass '+str(i),[[x,.017,z],[x+.017,.14+(i%4)*.02,z+.018]],[.008,.001],'#9137ba' if i%2 else '#57206e')
 return b.model('Hak Chompjak')

models={'thomas':leader('thomas'),'darius':leader('darius'),'hak':hak()}
(WORK/'human_leaders.js').write_text('const HUMAN_LEADER_MODELS='+json.dumps({k:v for k,v in models.items() if k!='hak'},separators=(',',':'))+';\nfunction createHumanLeader(bearded){return HUMAN_LEADER_MODELS[bearded?"thomas":"darius"];}\nconst ThomasModel=createHumanLeader(true),DariusModel=createHumanLeader(false);\n',encoding='utf-8')
(WORK/'hak_model.js').write_text('const HakModel='+json.dumps(models['hak'],separators=(',',':'))+';\n',encoding='utf-8')

def export(name,model):
 blob=bytearray();views=[];accessors=[];meshes=[];materials=[];nodes=[{'name':model['name'],'children':[]}];groups={}
 pivots={k:model.get(k+'Pivot',[0,0,0]) for k in ['body','head','jaw','eyes','upperLip','lowerLip','teeth']};pivots['eyes']=model['eyePivot']
 for k,p in pivots.items():groups[k]=len(nodes);nodes[0]['children'].append(len(nodes));nodes.append({'name':k,'translation':p,'children':[]})
 for child,parent in {'head':'body','jaw':'head','eyes':'head','upperLip':'head','lowerLip':'jaw','teeth':'head'}.items():
  nodes[0]['children'].remove(groups[child]);nodes[groups[parent]]['children'].append(groups[child]);nodes[groups[child]]['translation']=[pivots[child][i]-pivots[parent][i] for i in range(3)]
 nodes[groups['teeth']]['scale']=[1,.01,1]
 def array(v,kind,component,typ,count,target,bounds=False):
  blob.extend(b'\0'*((-len(blob))%4));start=len(blob);blob.extend(struct.pack('<'+kind*len(v),*v));views.append({'buffer':0,'byteOffset':start,'byteLength':len(blob)-start,'target':target});a={'bufferView':len(views)-1,'componentType':component,'count':count,'type':typ}
  if bounds:a.update(min=[min(v[i::3]) for i in range(3)],max=[max(v[i::3]) for i in range(3)])
  accessors.append(a);return len(accessors)-1
 for q in model['meshes']:
  if 'grass' in q['name'] or 'meadow' in q['name']:continue
  m=len(materials);materials.append({'name':q['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':q['color']+[1],'metallicFactor':.2 if 'plate' in q['name'] else .05,'roughnessFactor':.8}})
  pivot=pivots[q['bone']];p=[v-pivot[i%3] for i,v in enumerate(q['p'])]
  pi=array(p,'f',5126,'VEC3',len(p)//3,34962,True);ni=array(q['n'],'f',5126,'VEC3',len(p)//3,34962);fi=array(q['indices'],'H',5123,'SCALAR',len(q['indices']),34963)
  meshes.append({'name':q['name'],'primitives':[{'attributes':{'POSITION':pi,'NORMAL':ni},'indices':fi,'material':m}]});nodes[groups[q['bone']]]['children'].append(len(nodes));nodes.append({'name':q['name'],'mesh':len(meshes)-1})
 data={'asset':{'version':'2.0','generator':'NOSTRAVECTOR detailed cartoon cast'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,'extras':{'lipSync':'Head, jaw, eyes and independent lip pivots match the game renderer.'}}
 raw=json.dumps(data,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);blob+=b'\0'*((-len(blob))%4)
 (OUT/f'NOSTRAVECTOR_{name}.glb').write_bytes(struct.pack('<III',0x46546c67,2,28+len(raw)+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob)
for key,model in models.items():
 export({'thomas':'Thomas_Hawthorne','darius':'Darius_Ancin','hak':'Hak_Chompjak'}[key],model)
 print(model['name'],len([q for q in model['meshes'] if 'grass' not in q['name'] and 'meadow' not in q['name']]),'character parts')
