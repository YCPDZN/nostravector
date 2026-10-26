"""Reference-based, articulated hooded human. All visible detail is real geometry."""
from pathlib import Path
import math,json,struct,shutil
import build_pontifex_model as geometry
from build_pontifex_model import Builder,mirror,cross

ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'work';OUT=ROOT/'outputs'
PIVOTS={'body':[0,2.25,0],'head':[0,3.35,0],'jaw':[0,3.52,.24],
        'leftArm':[-.68,3.10,0],'rightArm':[.68,3.10,0],
        'leftLeg':[-.32,1.75,0],'rightLeg':[.32,1.75,0],
        'weapon':[-1.04,2.03,.12],'cape':[0,3.15,-.31]}
IRON='#303638';DARK='#171d1e';EDGE='#697070';VOID='#101516';CLOTH='#44463b';FOLD='#555548';RUST='#735640';SKIN='#9f8070';LIGHT='#b69986';SHADOW='#735d52'

def build():
 b=Builder()
 def plate(name,poly,z,color=IRON,bone='body',thick=.065):
  b.poly(name+' bevel',poly,z,thick,EDGE,bone,.016)
  cx=sum(v[0] for v in poly)/len(poly);cy=sum(v[1] for v in poly)/len(poly)
  b.poly(name+' face',[[cx+(x-cx)*.94,cy+(y-cy)*.95] for x,y in poly],z+thick*.5,.017,color,bone,.008)
 b.oval('Flexible armoured undersuit',[0,2.51,0],[.59,.77,.33],DARK,e=.7,rows=12,cols=24)
 b.oval('Reinforced pelvic harness',[0,1.77,0],[.50,.26,.34],DARK,e=.55)
 plate('Upper chest shield',[[-.57,2.89],[-.52,3.19],[.48,3.19],[.57,2.88],[.39,2.72],[-.39,2.72]],.31)
 for side in [-1,1]:
  tag='Left' if side<0 else 'Right';arm='leftArm' if side<0 else 'rightArm';leg='leftLeg' if side<0 else 'rightLeg';x=side*.33
  plate(tag+' segmented breast plate',mirror([[.035,2.77],[.45,2.74],[.48,2.44],[.065,2.43]],side),.365)
  plate(tag+' abdominal shell',mirror([[.065,2.39],[.47,2.40],[.41,2.13],[.06,2.13]],side),.33)
  for i in range(5):b.tube(tag+' ribbed torso flex '+str(i),[[side*.44,2.20+i*.105,.16],[side*.61,2.20+i*.105,-.03]],.028,DARK,sides=8)
  b.tube(tag+' upper leg suit',[[x,1.77,0],[x,1.11,.015]],[.26,.23],DARK,leg,sides=18)
  b.tube(tag+' calf undersuit',[[x,1.09,.015],[x,.27,.06]],[.22,.19],VOID,leg,sides=16)
  plate(tag+' thigh shell',mirror([[.12,1.69],[.49,1.71],[.61,1.37],[.46,1.19],[.18,1.28]],side),.23,IRON,leg)
  for k in range(2):
   b.oval(tag+' thigh utility strap '+str(k),[x,1.38+k*.20,.015],[.29,.035,.29],VOID,leg,e=.45,rows=5,cols=16)
   b.oval(tag+' thigh strap buckle '+str(k),[x+side*.09,1.38+k*.20,.29],[.06,.045,.027],EDGE,leg,e=.35,rows=5,cols=8)
  b.oval(tag+' knee bearing',[x,1.08,.04],[.25,.21,.24],DARK,leg,e=.5)
  plate(tag+' angular knee armour',mirror([[.12,1.21],[.30,1.29],[.55,1.17],[.51,.93],[.32,.86],[.13,.98]],side),.28,IRON,leg,.10)
  plate(tag+' shin armour',mirror([[.13,.89],[.50,.89],[.54,.36],[.42,.24],[.19,.26],[.12,.48]],side),.23,IRON,leg,.09)
  b.oval(tag+' reinforced boot',[x,.18,.18],[.29,.19,.43],DARK,leg,e=.46,rows=10,cols=20)
  b.oval(tag+' boot toe cap',[x,.18,.42],[.28,.14,.22],IRON,leg,e=.5)
  b.oval(tag+' boot sole',[x,.035,.18],[.30,.045,.46],VOID,leg,e=.4,rows=5,cols=16)
  for k in range(7):b.oval(tag+' boot tread '+str(k),[x,.028,-.13+k*.10],[.31,.025,.027],DARK,leg,e=.4,rows=4,cols=8)
  for k in range(3):b.tube(tag+' boot toe seam '+str(k),[[x-.23,.22,.37+k*.065],[x,.26,.41+k*.065],[x+.23,.22,.37+k*.065]],.009,EDGE,leg,sides=6)
  b.tube(tag+' arm flexible suit',[[side*.66,3.08,0],[side*.85,2.62,0],[side*.95,2.10,.13]],[.25,.20,.17],DARK,arm,sides=18)
  b.oval(tag+' shoulder bearing',[side*.70,3.07,0],[.27,.26,.27],VOID,arm)
  plate(tag+' layered shoulder shell',mirror([[.49,3.13],[.72,3.31],[1.03,3.18],[1.10,2.93],[.89,2.79],[.60,2.90]],side),.15,IRON,arm,.13)
  for k in range(3):b.tube(tag+' pauldron edge '+str(k),[[side*(.59+k*.02),3.05-k*.055,.24],[side*.86,2.96-k*.055,.32],[side*1.04,2.98-k*.055,.17]],.013,EDGE,arm,sides=7)
  for k in range(7):b.oval(tag+' elbow suit rib '+str(k),[side*.88,2.67-k*.045,.005],[.20,.018,.21],IRON,arm,e=.6,rows=5,cols=12)
  b.oval(tag+' elbow shell',[side*.90,2.58,-.01],[.21,.17,.23],IRON,arm,e=.5)
  plate(tag+' forearm bracer',mirror([[.79,2.54],[1.08,2.49],[1.14,2.12],[.90,2.03],[.78,2.18]],side),.23,IRON,arm,.09)
  b.oval(tag+' leather glove',[side*.98,1.99,.13],[.17,.20,.17],'#292b28',arm,e=.65)
  for k in range(4):
   xx=side*(.87+k*.071)
   b.tube(tag+' articulated finger '+str(k),[[xx,1.99,.27],[xx,1.89,.28],[xx,1.85,.19]],[.035,.033,.025],'#373a34',arm,sides=8)
   b.oval(tag+' glove knuckle '+str(k),[xx,2.02,.27],[.043,.045,.025],IRON,arm,rows=5,cols=8)
  b.tube(tag+' articulated thumb',[[side*.83,2.03,.10],[side*.79,1.94,.20],[side*.85,1.89,.23]],[.05,.043,.03],'#373a34',arm,sides=8)
  for yy in [2.25,2.42]:
   b.oval(tag+' bracer clamp',[side*.96,yy,.02],[.19,.025,.24],DARK,arm,e=.5,rows=5,cols=12)
  for k in range(8):
   xx=side*(.22+(k%3)*.10);yy=.39+(k//3)*.13
   b.tube(tag+' greave scrape '+str(k),[[xx,yy,.291],[xx+.04,yy+.055,.293]],.006,EDGE,leg,sides=5)
  for xx,yy,zz,bone in [(side*.22,2.62,.42,'body'),(side*.42,2.58,.42,'body'),(side*.19,2.24,.385,'body'),(side*.44,1.08,.35,leg),(side*.89,3.12,.27,arm),(side*1.02,2.23,.29,arm)]:b.bolt(tag+' recessed fastener',xx,yy,zz,bone)
 # Harness webbing, equipment belt, pouch stitching and cable runs.
 b.oval('Heavy woven utility belt',[0,1.99,.025],[.56,.10,.37],VOID,e=.4,rows=7,cols=24)
 plate('Square belt clasp',[[-.12,2.09],[.12,2.09],[.12,1.91],[-.12,1.91]],.414,IRON,thick=.065)
 for i in range(6):
  x=-.46+i*.18
  b.oval('Belt equipment pouch '+str(i),[x,1.97,.30],[.075,.14,.12],'#34382f',e=.45)
  b.oval('Pouch folding flap '+str(i),[x,2.045,.422],[.068,.055,.014],DARK,e=.5,rows=5,cols=8)
  b.bolt('Pouch clasp '+str(i),x,2.03,.44)
  for k in range(3):b.tube('Pouch seam '+str(i)+'-'+str(k),[[x-.05,1.88+k*.035,.418],[x-.035,1.88+k*.035,.423]],.003,RUST,sides=5)
 for side in [-1,1]:
  b.tube('Chest harness shoulder strap '+str(side),[[side*.42,3.20,.33],[side*.37,2.92,.45],[side*.48,2.65,.42],[side*.58,2.39,.22]],.050,'#413b2e',sides=8)
  for k in range(3):
   xx=side*(.41+k*.013);yy=3.09-k*.17
   b.oval('Harness metal keeper '+str(side)+'-'+str(k),[xx,yy,.433],[.065,.042,.025],IRON,e=.3,rows=5,cols=8)
  b.tube('Hip flexible conduit '+str(side),[[side*.36,2.1,.26],[side*.52,1.94,.29],[side*.46,1.70,.30],[side*.26,1.56,.32]],.043,VOID,sides=12)
  for k in range(5):b.oval('Conduit ring '+str(side)+'-'+str(k),[side*(.46-.026*k),1.83-.048*k,.32],[.055,.014,.045],IRON,rows=5,cols=8)
 plate('Pelvis shield',[[-.18,1.84],[.18,1.84],[.22,1.52],[0,1.39],[-.22,1.52]],.33,DARK)
 # A wrist terminal and a small belt instrument are subdued, not faction colours.
 plate('Wrist terminal casing',[[.82,2.44],[1.10,2.44],[1.10,2.23],[.82,2.23]],.31,IRON,'rightArm',.07)
 b.poly('Wrist terminal glass',[[.86,2.40],[1.055,2.40],[1.055,2.32],[.86,2.32]],.36,.012,'#374e4c','rightArm')
 for k in range(4):b.tube('Terminal status text '+str(k),[[.87,2.38-k*.015,.371],[.97+(k%2)*.055,2.38-k*.015,.371]],.003,'#86958a','rightArm',sides=5)
 for k in range(4):b.oval('Terminal key '+str(k),[.88+k*.047,2.27,.37],[.014,.014,.009],RUST,'rightArm',rows=5,cols=8)
 b.oval('Field instrument case',[.40,2.0,.45],[.075,.13,.06],DARK,e=.4)
 b.oval('Field instrument screen',[.40,2.04,.515],[.045,.037,.01],'#607970',rows=5,cols=8)
 # Pack, rolled bed cloth, oxygen canister and mechanical connectors.
 b.oval('Backpack frame',[0,2.87,-.38],[.49,.57,.22],DARK,e=.4)
 b.tube('Rolled blanket on pack',[[-.49,3.34,-.42],[.49,3.34,-.42]],.20,'#4c4a3d',sides=24)
 for side in [-1,1]:
  for r in [.06,.12,.18]:b.tube('Bedroll end spiral '+str(side)+str(r),[[side*.50,3.34+math.cos(a)*r,-.42+math.sin(a)*r] for a in [i/24*math.tau for i in range(25)]],.009,RUST,sides=6)
  b.oval('Backpack securing strap '+str(side),[side*.27,3.34,-.42],[.034,.215,.215],VOID,e=.7,rows=7,cols=16)
  b.tube('Pack hose '+str(side),[[side*.48,3.12,-.36],[side*.65,2.92,-.36],[side*.50,2.48,-.33]],.029,DARK,sides=10)
 # Exposed face with natural, recessed eyes, sculpted nose and a single closed mouth.
 b.oval('Human neck',[0,3.34,.02],[.19,.26,.19],SKIN,'head',rows=12,cols=20)
 b.oval('Human cranium',[0,3.78,0],[.31,.39,.27],SKIN,'head',e=.88,rows=24,cols=36)
 b.oval('Angular human jaw',[0,3.55,.055],[.23,.16,.20],SKIN,'jaw',e=.75,rows=14,cols=24)
 b.oval('Human chin',[0,3.47,.19],[.13,.07,.08],SKIN,'jaw',e=.8,rows=12,cols=20)
 for side in [-1,1]:
  b.oval('Tired eye socket '+str(side),[side*.122,3.84,.246],[.089,.042,.012],'#927769','head',rows=12,cols=24)
  b.oval('Natural sclera '+str(side),[side*.12,3.842,.267],[.065,.023,.013],'#a7a39a','head',rows=8,cols=20)
  b.oval('Human iris '+str(side),[side*.117,3.842,.280],[.020,.022,.006],'#525951','head',rows=8,cols=16)
  b.oval('Human pupil '+str(side),[side*.117,3.842,.286],[.009,.013,.004],'#181d1c','head',rows=7,cols=12)
  b.tube('Heavy upper eyelid '+str(side),[[side*.058,3.854,.265],[side*.119,3.870,.281],[side*.183,3.849,.262]],[.009,.012,.008],SHADOW,'head',sides=8)
  b.tube('Lower eyelid '+str(side),[[side*.060,3.83,.266],[side*.12,3.818,.280],[side*.183,3.832,.262]],.007,SKIN,'head',sides=7)
  b.tube('Furrowed brow '+str(side),[[side*.04,3.91,.255],[side*.112,3.927,.265],[side*.20,3.90,.219]],[.026,.027,.011],'#3b352e','head',sides=9)
  for k in range(1):b.tube('Tired under-eye crease '+str(side)+'-'+str(k),[[side*.055,3.79-k*.018,.260],[side*.12,3.777-k*.018,.268],[side*.19,3.79-k*.018,.228]],.002,'#907568','head',sides=5)
  b.tube('Cheek and nose fold '+str(side),[[side*.08,3.70,.267],[side*.12,3.61,.253],[side*.115,3.56,.246]],.0025,'#92776a','head',sides=6)
  b.oval('Nostril wing '+str(side),[side*.055,3.712,.295],[.039,.030,.040],SKIN,'head',rows=10,cols=16)
  b.oval('Recessed nostril '+str(side),[side*.050,3.696,.321],[.017,.009,.010],SHADOW,'head',rows=7,cols=12)
 b.tube('Sculpted nasal bridge',[[0,3.89,.253],[0,3.78,.296],[0,3.73,.346]],[.030,.032,.046],LIGHT,'head',sides=14)
 b.oval('Human nose tip',[0,3.72,.335],[.047,.035,.038],SKIN,'head',rows=12,cols=20)
 b.tube('Closed upper lip',[[-.10,3.59,.263],[-.04,3.598,.285],[0,3.591,.291],[.04,3.598,.285],[.10,3.59,.263]],[.008,.012,.010,.012,.008],'#71554b','head',sides=9)
 b.tube('Closed lower lip',[[-.09,3.576,.263],[0,3.573,.288],[.09,3.576,.263]],[.007,.013,.007],'#926c5c','jaw',sides=9)
 for side in [-1,1]:b.tube('Glabellar furrow '+str(side),[[side*.024,3.93,.267],[side*.036,3.99,.253]],.0025,'#92776a','head',sides=6)
 # Full brown beard follows the jaw and leaves a single clear mouth opening.
 def beard_point(a,t,offset=0):
  side=abs(math.sin(a));bottom=3.34+.10*side**.8;top=3.56+.17*side**1.4
  return [math.sin(a)*(.20+.055*t+offset),bottom+(top-bottom)*t,.08+math.cos(a)*(.20+.02*t+offset)]
 vertices=[];normals=[];faces=[];rows=12;cols=36
 for layer in [0,-.014]:
  for j in range(rows+1):
   for i in range(cols+1):
    a=-1.35+i/cols*2.7;vertices.append(beard_point(a,j/rows,layer));normals.append([math.sin(a),-.10,math.cos(a)] if layer==0 else [-math.sin(a),.10,-math.cos(a)])
 count=(rows+1)*(cols+1)
 for j in range(rows):
  for i in range(cols):
   q=j*(cols+1)+i;d=q+cols+1;faces.extend([q,d,q+1,q+1,d,d+1]);faces.extend([q+count,q+1+count,d+count,q+1+count,d+1+count,d+count])
 border=list(range(cols+1))+[j*(cols+1)+cols for j in range(1,rows+1)]+[rows*(cols+1)+i for i in range(cols-1,-1,-1)]+[j*(cols+1) for j in range(rows-1,0,-1)]
 for k,q in enumerate(border):
  r=border[(k+1)%len(border)];faces.extend([q,r,q+count,r,r+count,q+count])
 b.add('Full brown beard / fitted jaw volume',vertices,normals,faces,'#32271f','jaw')
 for side in [-1,1]:
  b.oval('Dense brown sideburn '+str(side),[side*.245,3.75,.11],[.043,.15,.065],'#32271f','head',rows=12,cols=18)
  b.tube('Brown moustache '+str(side),[[side*.014,3.63,.301],[side*.058,3.635,.297],[side*.098,3.616,.284],[side*.124,3.592,.263]],[.012,.017,.014,.005],'#32271f','head',sides=10)
  for k in range(8):
   x=.024+k*.011
   b.tube('Moustache hair '+str(side)+'-'+str(k),[[side*x,3.646,.301],[side*(x+.009),3.625,.307],[side*(x+.017),3.607,.294]],[.0022,.002,.001],'#4a3829','head',sides=5)
 for i in range(144):
  a=-1.32+(i%24)/23*2.64;t=.15+(i//24)/6*.84;end=max(0,t-.16-(i%3)*.025)
  points=[beard_point(a+(k/2)*.012,t+(end-t)*k/2,.005) for k in range(3)]
  b.tube('Dense beard strand '+str(i),points,[.0028,.0022,.001],'#49382a' if i%3 else '#3d2e23','jaw',sides=5)
 # Short dark hair and a smooth brow keep him a younger adult, rather than elderly.
 for i in range(20):
  x=-.24+i*.025;y=4.04+.045*math.cos(i*.75)
  b.tube('Short forehead hair '+str(i),[[x,y+.06,.08],[x-.015,y,.19],[x+.01,y-.045,.22]],[.012,.009,.002],'#3d3830','head',sides=7)
 # Open hood surface wraps around the head, without an opaque face plate.
 p=[];n=[];f=[];rows=18;cols=48
 for j in range(rows+1):
  v=j/rows;y=3.35+v*1.01;r=.51*(1-.78*v**4)
  for i in range(cols+1):
   a=.80+i/cols*(math.tau-1.60);ripple=1+.025*math.sin(i*1.3+j*.6)
   p.append([math.sin(a)*r*ripple,y+.025*math.cos(a),math.cos(a)*r*.85*ripple-.025]);n.append([math.sin(a),.15,math.cos(a)])
 for j in range(rows):
  for i in range(cols):
   a=j*(cols+1)+i;d=a+cols+1;f.extend([a,d,a+1,a+1,d,d+1])
 b.add('Open olive hood shell',p,n,f,CLOTH,'head')
 b.oval('Closed cloth crown',[0,4.345,-.025],[.14,.035,.14],CLOTH,'head',rows=8,cols=20)
 for side in [-1,1]:
  rim=[[side*.08,4.35,.07],[side*.24,4.24,.18],[side*.36,4.06,.28],[side*.42,3.81,.31],[side*.38,3.56,.36],[side*.22,3.40,.42]]
  b.tube('Hood rolled opening '+str(side),rim,[.022,.026,.030,.032,.034,.025],FOLD,'head',sides=10)
  for k in range(14):
   t=k/13;x=side*(.12+.29*math.sin(t*math.pi*.8));y=4.30-t*.72
   b.tube('Hood stitched edge '+str(side)+'-'+str(k),[[x,y,.22+.10*t],[x+side*.013,y-.015,.225+.10*t]],.003,'#777362','head',sides=5)
 for k in range(5):b.tube('Folded shoulder cowl '+str(k),[[-.62,3.32-k*.04,.13],[-.38,3.20-k*.055,.38],[0,3.11-k*.055,.49],[.41,3.21-k*.045,.36],[.67,3.33-k*.025,.12]],[.055,.070,.065,.06,.035],FOLD if k%2 else CLOTH,'cape',sides=12)
 for side in [-1,1]:
  cloak=mirror([[.10,3.30],[.56,3.33],[.85,3.10],[.91,2.50],[.95,1.65],[1.02,.79],[.96,.24],[.86,.41],[.78,.18],[.68,.40],[.61,.22],[.49,.43],[.39,.26],[.32,.53],[.18,.33]],side)
  b.poly('Torn long olive cloak '+str(side),cloak,-.40,.028,CLOTH,'cape',.005)
  for k in range(5):
   x=side*(.19+k*.145)
   b.tube('Cloak falling fold '+str(side)+'-'+str(k),[[x,3.20,-.365],[x+side*.055,2.3,-.36],[x+side*.10,1.25,-.35],[x+side*.08,.48+(k%2)*.10,-.35]],[.023,.027,.022,.007],FOLD,'cape',sides=7)
  for k in range(8):
   x=side*(.25+k*.082);y=.30+(k%3)*.05
   b.tube('Frayed cloak hem '+str(side)+'-'+str(k),[[x,y+.14,-.37],[x+side*.014,y-.04,-.37]],[.006,.002],'#77715a','cape',sides=5)
 # Downward-carried field rifle, held in the left hand; never fires in this encounter.
 b.oval('Rifle receiver',[-1.08,1.56,.24],[.13,.38,.12],IRON,'weapon',e=.35)
 b.tube('Rifle barrel', [[-1.08,1.31,.25],[-1.20,.49,.28]],.049,DARK,'weapon',sides=16)
 b.tube('Rifle muzzle shroud',[[-1.19,.58,.28],[-1.22,.36,.29]],.065,IRON,'weapon',sides=16)
 b.tube('Rifle recessed muzzle',[[-1.22,.359,.29],[-1.225,.35,.29]],.039,VOID,'weapon',sides=12)
 b.oval('Rifle stock',[-1.07,1.94,.22],[.12,.21,.105],DARK,'weapon',e=.4)
 b.oval('Rifle magazine',[-.94,1.57,.25],[.08,.16,.11],DARK,'weapon',e=.35)
 b.tube('Rifle shoulder sling',[[-1.04,1.87,.12],[-1.22,2.35,-.02],[-.72,3.10,.11]],.018,'#3a382d','weapon',sides=8)
 for k in range(10):b.oval('Rifle heat shield rib '+str(k),[-1.08-k*.004,1.25-k*.055,.25],[.075,.014,.075],IRON,'weapon',e=.4,rows=5,cols=8)
 b.tube('Rifle lower sight', [[-1.23,.56,.31],[-1.23,.65,.36]],.014,EDGE,'weapon',sides=8)
 # Paint chips and rust marks follow the armour rather than floating around it.
 for i in range(38):
  side=-1 if i%2 else 1;x=side*(.12+(i%5)*.07);y=2.20+(i%7)*.115;z=.407 if y>2.42 else .375
  b.tube('Weathered chest chip '+str(i),[[x,y,z],[x+side*.025,y+.013,z+.001]],.004,RUST if i%3 else EDGE,sides=5)
 for q in b.parts:
  faces=[]
  for j in range(0,len(q['indices']),3):
   ids=q['indices'][j:j+3];ps=[q['p'][i*3:i*3+3] for i in ids];normal=cross([ps[1][k]-ps[0][k] for k in range(3)],[ps[2][k]-ps[0][k] for k in range(3)])
   if sum(v*v for v in normal)<1e-20:continue
   if sum(normal[k]*sum(q['n'][i*3+k] for i in ids) for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
   faces+=ids
  q['indices']=faces
 return{'name':'Josiah Williams II','generator':'NOSTRAVECTOR reference-based articulated human','height':4.4,'pivots':PIVOTS,'headPivot':PIVOTS['head'],'jawPivot':PIVOTS['jaw'],'meshes':b.parts,'design':'Open olive hood and tattered cloak, younger adult human face, full brown beard and moustache, weathered segmented black armour, pouches, wrist terminal, rolled backpack and downward-carried rifle. Interpretation of the user reference.'}

if __name__=='__main__':
 model=build();(WORK/'williams_model.js').write_text('const WilliamsModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
 geometry.PIVOTS=PIVOTS;geometry.export_glb(model,'NOSTRAVECTOR_Josiah_Williams_II.glb')
 path=OUT/'NOSTRAVECTOR_Josiah_Williams_II.glb';raw=path.read_bytes();size=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+size]);nodes=doc['nodes'];ids={n['name']:i for i,n in enumerate(nodes) if n['name'] in PIVOTS}
 for child,parent in [('weapon','leftArm'),('jaw','head')]:
  index=ids[child]
  for n in nodes:
   if index in n.get('children',[]):n['children'].remove(index)
  nodes[ids[parent]].setdefault('children',[]).append(index);nodes[index]['translation']=[PIVOTS[child][i]-PIVOTS[parent][i] for i in range(3)]
 data=json.dumps(doc,separators=(',',':')).encode();data+=b' '*((-len(data))%4);path.write_bytes(struct.pack('<III',0x46546c67,2,20+len(data)+len(raw[20+size:]))+struct.pack('<II',len(data),0x4e4f534a)+data+raw[20+size:])
 preview='''<!doctype html><meta charset="utf-8"><title>Josiah Williams II / 3D model</title><style>body{margin:0;background:#11191e;color:#e5dfcf;font:14px Consolas;text-align:center}canvas{height:82vh;width:min(760px,100%);background:radial-gradient(ellipse,#535c5d,#10171c)}a{color:#dbc698}</style><h1>JOSIAH WILLIAMS II</h1><p>Hooded field armour / visible human face / articulated model<br>Drag to rotate · Scroll to zoom</p><canvas id="model"></canvas><p><a href="NOSTRAVECTOR_Josiah_Williams_II.glb">Download GLB</a></p><script>'''
 preview+='const WilliamsModel='+json.dumps(model,separators=(',',':'))+';'+(WORK/'grek_renderer.js').read_text(encoding='utf-8').replace('vec3(.30,.16,.47)*rim','vec3(.04,.055,.06)*rim').replace('vec3(.26)*spec','vec3(.055)*spec').replace('M.ry(.10+Math.sin(time*.29)*.045)','M.ry((options.yaw||0)+.10+Math.sin(time*.29)*.045)')+"const canvas=document.getElementById('model'),opts={camera:[0,-2.15,-8.2],yaw:0},draw=createGrekRenderer(canvas,WilliamsModel,opts);let drag=null;canvas.style.touchAction='none';canvas.onpointerdown=e=>{drag=e.clientX;canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(drag!==null){opts.yaw+=(e.clientX-drag)*.01;drag=e.clientX}};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;canvas.addEventListener('wheel',e=>{e.preventDefault();opts.camera[2]=Math.max(-15,Math.min(-5,opts.camera[2]-e.deltaY*.005))},{passive:false});function frame(t){draw(t/1000);requestAnimationFrame(frame);}frame(100);</script>"
 (OUT/'NOSTRAVECTOR_Josiah_Williams_II_Model.html').write_text(preview,encoding='utf-8')
 ref=WORK/'williams-reference.png';shutil.copyfile('C:/Users/HOME/Pictures/Screenshots/Screenshot 2026-10-19 211324.png',ref)
 print(len(model['meshes']),'parts;',sum(len(m['indices'])//3 for m in model['meshes']),'triangles')
