"""Native articulated Tyrotaronus geometry, based on the supplied visual reference."""
from pathlib import Path
import math,json
import build_pontifex_model as geometry
from build_pontifex_model import Builder,cross
ROOT=Path(__file__).resolve().parents[1];b=Builder()
SKIN='#283340';SCALE='#465468';DARK='#141e25';SILVER='#a8b8bc';EDGE='#627c83';GOLD='#ac9161';GREEN='#69ffad';VIOLET='#d58aff';WHITE='#e2f7f6'
b.oval('Scaled narrow torso',[0,2.65,-.03],[.46,.79,.31],SKIN,rows=12,cols=24)
b.oval('Scaled hip',[0,1.95,-.02],[.43,.30,.29],SKIN)
b.tube('Long curling reptilian tail',[[0,1.90,-.16],[0,1.40,-.50],[.16,1.05,-.82],[.56,1.20,-.85],[.78,1.59,-.56],[.64,1.80,-.38]],[.19,.17,.14,.11,.07,.002],SKIN,'tail',sides=16)
for side in [-1,1]:
 arm='leftArm' if side<0 else 'rightArm';leg='leftLeg' if side<0 else 'rightLeg';tag='Left' if side<0 else 'Right';x=side*.33
 b.tube(tag+' digitigrade leg',[[x,1.95,0],[side*.50,1.15,.12],[side*.43,.55,-.16],[side*.46,.18,.06]],[.23,.19,.14,.12],SKIN,leg,sides=18)
 for j in range(3):
  xx=side*(.32+j*.13);b.tube(tag+' splayed claw toe '+str(j),[[side*.44,.18,.08],[xx,.10,.33],[xx,.07,.53]],[.095,.063,.004],GOLD,leg,sides=9)
 b.tube(tag+' sinewed arm',[[side*.52,3.23,0],[side*.74,2.68,.02],[side*.76,2.18,.12]],[.22,.16,.13],SKIN,arm,sides=16)
 b.oval(tag+' hand',[side*.76,2.05,.11],[.14,.18,.13],SKIN,arm)
 for j in range(3):b.tube(tag+' long finger '+str(j),[[side*(.68+j*.075),2.05,.12],[side*(.70+j*.085),1.88,.20],[side*(.69+j*.085),1.82,.30]],[.043,.033,.002],GOLD,arm,sides=8)
 b.oval(tag+' silver shoulder shell',[side*.63,3.27,0],[.39,.27,.35],SILVER,arm,e=.55)
 for j in range(3):b.oval(tag+' pauldron rib '+str(j),[side*(.47+j*.13),3.40-j*.06,.23],[.06,.12,.08],EDGE,arm,e=.5)
 b.oval(tag+' forearm mechanical bracer',[side*.76,2.48,.08],[.24,.34,.25],EDGE,arm,e=.6)
 b.oval(tag+' bracer emitter casing',[side*.88,2.65,.25],[.16,.17,.10],GOLD,arm,e=.55)
 b.oval(tag+' green energy lens',[side*.88,2.65,.35],[.105,.105,.04],GREEN,arm,emission=.9)
 b.oval(tag+' brilliant white shoulder lens',[side*.84,3.02,.31],[.12,.12,.06],WHITE,arm,emission=1)
 b.oval(tag+' violet waist node',[side*.38,2.30,.34],[.085,.085,.06],VIOLET,emission=.7)
 b.tube(tag+' exosuit conduit',[[side*.71,3.03,.23],[side*.52,2.65,.32],[side*.40,2.34,.34]],[.045,.036,.025],GOLD,sides=10)
 b.tube(tag+' glowing coolant tube',[[side*.63,2.92,.35],[side*.57,2.64,.38]],.045,GREEN,emission=.55)
 for j in range(10):
  yy=.50+j*.13;b.oval(tag+' leg scale '+str(j),[side*.45,yy,.13],[.12,.035,.07],SCALE,leg,rows=4,cols=8)
 b.plate(tag+' hip silver guard',[[side*.12,1.88],[side*.35,1.96],[side*.47,2.22],[side*.24,2.33]],.28,SILVER,thickness=.065)
# A layered, open exoskeleton, not a closed humanoid breastplate.
for j in range(4):b.oval('Broad silver chest louvre '+str(j),[0,3.24-j*.13,.24],[.57,.075,.13],SILVER,e=.4)
b.plate('Central abdomen silver keel',[[-.23,2.42],[0,2.52],[.23,2.42],[.13,1.89],[0,1.73],[-.13,1.89]],.32,EDGE,thickness=.08)
b.oval('Abdomen green power core',[0,2.33,.42],[.09,.12,.07],GREEN,emission=.9)
b.oval('Lower silver energy aperture',[0,2.06,.40],[.12,.16,.035],WHITE,emission=.3)
b.tube('Long reptilian neck',[[0,3.29,-.04],[0,3.73,-.02],[0,3.94,.02]],[.25,.20,.22],SKIN,'head',sides=18)
# The face, snout and crown share the body's forward (+Z) axis.
b.oval('Long angular dragon cranium',[0,4.05,.02],[.33,.25,.59],SKIN,'head',e=.7,rows=12,cols=24)
b.oval('Tapered muzzle',[0,3.96,.40],[.27,.14,.43],SKIN,'head',e=.6)
b.oval('Recessed mouth opening',[0,3.85,.68],[.25,.035,.15],DARK,'head',e=.6)
b.oval('Hinged lower scaled jaw',[0,3.76,.32],[.26,.09,.43],SCALE,'jaw',e=.7)
for side in [-1,1]:
 b.oval('Raised eye socket '+str(side),[side*.24,4.12,.40],[.15,.085,.075],SCALE,'head')
 b.oval('Recessed glowing eye '+str(side),[side*.24,4.12,.471],[.10,.036,.025],GREEN,'head',emission=.65)
 b.oval('Slit pupil '+str(side),[side*.24,4.12,.494],[.014,.034,.009],DARK,'head',rows=6,cols=8)
 b.oval('Nostril '+str(side),[side*.12,4.015,.798],[.038,.023,.018],DARK,'head',rows=5,cols=8)
 for j in range(9):
  x=-.22+j*.055;b.tube('Individual ivory tooth '+str(side)+'-'+str(j),[[x,3.88,.785+side*.025],[x,3.82,.785+side*.025]],[.016,.001],GOLD,'head',sides=6)
 for j in range(5):
  z=.35-j*.16;b.tube('Swept crown horn '+str(side)+'-'+str(j),[[side*.24,4.13,z],[side*.36,4.31,z-.24],[side*.40,4.46-j*.035,z-.52]],[.095,.05,.001],SCALE,'head',sides=10)
for j in range(4):b.tube('Central crown crest '+str(j),[[0,4.23,.25-j*.17],[0,4.49,.05-j*.15],[0,4.62,-.14-j*.14]],[.09,.045,.001],EDGE,'head',sides=10)
for j in range(8):b.tube('Throat rib '+str(j),[[-.16,3.38+j*.065,.14],[.03,3.36+j*.065,.23],[.20,3.38+j*.065,.15]],.015,GOLD,'head',sides=6)
for side in [-1,1]:
 for row in range(3):
  for j in range(4):b.oval('Facial scale '+str(side)+'-'+str(row)+'-'+str(j),[side*(.18+j*.035),3.98+row*.04,.40-j*.055],[.025,.02,.018],SCALE,'head',rows=4,cols=6)
for q in b.parts:
 f=[]
 for j in range(0,len(q['indices']),3):
  ids=q['indices'][j:j+3];p=[q['p'][i*3:i*3+3] for i in ids];n=cross([p[1][k]-p[0][k] for k in range(3)],[p[2][k]-p[0][k] for k in range(3)])
  if sum(v*v for v in n)<1e-20:continue
  if sum(n[k]*sum(q['n'][i*3+k] for i in ids) for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
  f+=ids
 q['indices']=f
pivots={'body':[0,0,0],'head':[0,3.4,0],'jaw':[0,3.82,.1],'leftArm':[-.52,3.23,0],'rightArm':[.52,3.23,0],'leftLeg':[-.33,1.95,0],'rightLeg':[.33,1.95,0],'tail':[0,1.9,-.16],'weapon':[0,2.1,.1],'cape':[0,3.1,-.1]}
model={'name':'Tyrotaronus - Vector of Neutrality','meshes':b.parts,'pivots':pivots,'headPivot':pivots['head'],'jawPivot':pivots['jaw'],'forwardAxis':[0,0,1],'height':4.62,'design':'Forward-facing blue scaled digitigrade reptile: centred muzzle and jaw, paired eyes and swept horns aligned with the body along +Z, curling tail, silver open exoskeleton, green emitters and violet energy nodes.'}
(ROOT/'work/tyrotaronus_model.js').write_text('const TyrotaronusModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
geometry.PIVOTS=pivots;geometry.export_glb(model,'NOSTRAVECTOR_Tyrotaronus.glb')
print('Tyrotaronus:',len(b.parts),'parts;',sum(len(q['indices'])//3 for q in b.parts),'triangles')
