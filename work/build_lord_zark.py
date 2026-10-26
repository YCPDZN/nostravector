"""Original articulated Lord Zark mesh based on the supplied winged reference."""
from pathlib import Path
import json, math
import build_pontifex_model as geometry
from build_pontifex_model import Builder, cross
work=Path(__file__).resolve().parent
b=Builder();BLACK='#14151a';RIDGE='#37353b';VOID='#050509';MEMBRANE='#382126';FIRE='#ef491c';BONE='#aaa095'
pivots={'body':[0,2.7,0],'head':[0,5.2,0],'jaw':[0,5.26,.38],'eyes':[0,5.6,0],'leftArm':[-.91,4.55,0],'rightArm':[.91,4.55,0],'leftLeg':[-.48,2.4,0],'rightLeg':[.48,2.4,0],'leftWing':[-.65,4.6,-.35],'rightWing':[.65,4.6,-.35],'tail':[0,2.6,-.3]}
def oval(name,c,size,color=BLACK,bone='body',emission=0):b.oval(name,c,size,color,bone,rows=7,cols=12,emission=emission)
def line(name,points,r=.04,color=RIDGE,bone='body',emission=0):b.tube(name,points,r,color,bone,sides=7,emission=emission)
def horn(name,points,r=.16,bone='head',color=RIDGE):line(name,points,[r,r*.65,r*.30,.002] if len(points)==4 else [r,r*.5,.002],color,bone)
oval('Ribbed broad thorax',[0,4.05,0],[.84,1.05,.40]);oval('Narrow segmented abdomen',[0,3.05,.03],[.47,.63,.32]);oval('Pelvic shell',[0,2.55,-.02],[.62,.32,.38])
line('Central molten fissure',[[0,4.85,.30],[.05,4.35,.44],[-.04,3.8,.40],[0,3.3,.34]],.035,FIRE,emission=.5)
for side in [-1,1]:
 arm='leftArm' if side<0 else 'rightArm';leg='leftLeg' if side<0 else 'rightLeg';wing='leftWing' if side<0 else 'rightWing'
 for j in range(7):
  y=4.65-j*.20;points=[[side*.03,y,.39],[side*.40,y-.18,.49],[side*(.78-j*.035),y-.09,.25]]
  line('Raised chest rib '+str(side)+str(j),points,.064)
  if j%2==0:line('Ember beneath ribs '+str(side)+str(j),[[p[0],p[1]-.06,p[2]+.012]for p in points],.016,FIRE,emission=.25)
 line('Long sinewed arm '+arm,[[side*.86,4.6,0],[side*1.25,3.75,0],[side*1.37,2.8,.15]],[.34,.26,.16],BLACK,arm)
 oval('Shoulder carapace '+arm,[side*.95,4.65,-.03],[.46,.40,.43],RIDGE,arm)
 for j in range(3):horn('Shoulder horn '+arm+str(j),[[side*(.80+j*.18),4.85-j*.08,-.10],[side*(1.1+j*.20),5.2-j*.12,-.32],[side*(1.3+j*.23),5.25-j*.10,-.55]],.14,arm)
 for j in range(3):horn('Forearm blade '+arm+str(j),[[side*1.38,3.7-j*.22,-.03],[side*1.65,3.85-j*.22,-.12],[side*1.83,3.9-j*.22,-.32]],.13,arm)
 oval('Clawed palm '+arm,[side*1.37,2.6,.16],[.24,.32,.16],BLACK,arm)
 for j in range(4):
  x=side*(1.14+j*.14);line('Long claw '+arm+str(j),[[x,2.55,.19],[x+side*.06,2.16,.33],[x+side*.04,1.95,.49]],[.068,.045,.002],BONE,arm)
 line('Digitigrade leg '+leg,[[side*.46,2.55,0],[side*.68,1.55,.18],[side*.50,.7,-.18],[side*.60,.19,.14]],[.40,.29,.18,.20],BLACK,leg)
 oval('Thigh plate '+leg,[side*.59,1.99,.06],[.37,.60,.30],RIDGE,leg)
 for j in range(3):horn('Knee and shin barb '+leg+str(j),[[side*.71,1.63-j*.35,.07],[side*.93,1.8-j*.35,-.02],[side*1.02,1.86-j*.35,-.18]],.11,leg)
 oval('Splayed foot '+leg,[side*.59,.16,.24],[.33,.16,.44],BLACK,leg)
 for j in range(3):horn('Foot talon '+leg+str(j),[[side*(.38+j*.19),.16,.48],[side*(.35+j*.22),.12,.74],[side*(.34+j*.23),.07,.97]],.11,leg,BONE)
 # Broad torn bat wings: curved spars and two-sided polygonal membranes.
 root=[side*.70,4.63,-.35];tips=[[side*2.15,6.65,-.48],[side*5.1,6.32,-.75],[side*6.3,4.1,-.42],[side*5.3,2.5,-.28],[side*3.45,3.05,-.33],[side*1.7,3.4,-.26]]
 line('Wing leading spar '+wing,[root,tips[0],tips[1],tips[2]],[.20,.16,.10,.025],RIDGE,wing)
 for j,tip in enumerate(tips[1:]):line('Wing finger '+wing+str(j),[root,[side*(1.6+j*.12),4.65-j*.16,-.53],tip],[.12,.065,.012],BLACK,wing)
 for j in range(len(tips)-1):
  a=tips[j];c=tips[j+1];mid=[(a[k]+c[k])*.5 for k in range(3)];mid[1]+=.42
  verts=[root,a,mid,c];normal=cross([a[k]-root[k]for k in range(3)],[c[k]-root[k]for k in range(3)])
  b.add('Tattered wing membrane '+wing+str(j),verts+[v[:]for v in verts],[normal]*4+[[-v for v in normal]]*4,[0,1,2,0,2,3,4,6,5,4,7,6],MEMBRANE,wing)
  horn('Wing hook '+wing+str(j),[a,[a[0]+side*.08,a[1]+.25,a[2]],[a[0]-side*.10,a[1]+.48,a[2]]],.07,wing)
oval('Long draconic neck',[0,4.95,-.03],[.33,.48,.28],RIDGE,'head');oval('Skeletal horned skull',[0,5.60,.02],[.46,.52,.36],BLACK,'head');oval('Long pointed snout',[0,5.39,.34],[.30,.25,.34],RIDGE,'head');oval('Black open mouth',[0,5.20,.51],[.29,.19,.15],VOID,'head');oval('Hinged jaw',[0,5.04,.33],[.30,.16,.33],RIDGE,'jaw')
for side in [-1,1]:
 oval('Deep eye socket '+str(side),[side*.24,5.65,.31],[.19,.12,.12],VOID,'head');oval('Burning red eye '+str(side),[side*.24,5.65,.415],[.12,.056,.031],FIRE,'eyes',.75)
 for j in range(5):horn('Crown antler '+str(side)+str(j),[[side*(.10+j*.085),5.95-j*.04,-.07],[side*(.22+j*.19),6.25+j*.1,-.22],[side*(.21+j*.25),6.73+j*.10,-.45],[side*(.13+j*.23),7.05+j*.10,-.72]],.14-j*.012)
 for j in range(7):
  x=-.24+j*.08;horn('Upper tooth '+str(side)+str(j),[[x,5.31,.62+side*.025],[x,5.20,.65+side*.025],[x,5.12,.63+side*.025]],.025,'head',BONE);horn('Lower tooth '+str(side)+str(j),[[x,5.02,.60+side*.025],[x,5.12,.65+side*.025],[x,5.20,.63+side*.025]],.025,'jaw',BONE)
tail=[[0,2.58,-.33],[.25,1.62,-.9],[1.3,.75,-1.5],[2.65,.85,-1.8],[3.2,1.95,-1.7],[2.8,2.85,-1.55]];line('Long hooked tail',tail,[.25,.22,.18,.12,.07,.01],BLACK,'tail')
for i,p in enumerate(tail[:-1]):horn('Tail spine '+str(i),[p,[p[0],p[1]+.25,p[2]],[p[0]+.10,p[1]+.48,p[2]-.08]],.11,'tail')
for part in b.parts:
 f=[]
 for j in range(0,len(part['indices']),3):
  ids=part['indices'][j:j+3];p=[part['p'][i*3:i*3+3]for i in ids];n=cross([p[1][k]-p[0][k]for k in range(3)],[p[2][k]-p[0][k]for k in range(3)])
  if sum(v*v for v in n)<1e-18:continue
  if sum(n[k]*sum(part['n'][i*3+k]for i in ids)for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
  f+=ids
 part['indices']=f
model={'name':'Lord Zark, the Prime Evil','meshes':b.parts,'pivots':pivots,'height':7.5,'headPivot':pivots['head'],'jawPivot':pivots['jaw'],'design':'Obsidian carapace, molten seams, antler crown, clawed limbs, torn wings and hooked tail.'}
(work/'lord_zark_model.js').write_text('const LordZarkModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
geometry.PIVOTS=pivots;geometry.export_glb(model,'NOSTRAVECTOR_Lord_Zark.glb')
print('Built Lord Zark:',len(b.parts),'parts,',sum(len(p['indices'])//3 for p in b.parts),'triangles')
