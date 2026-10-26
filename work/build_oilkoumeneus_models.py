"""Articulated native geometry for the Oilkoumeneus betrayal; reference images stay untouched."""
from pathlib import Path
import json, math
import build_pontifex_model as geo
from build_pontifex_model import Builder, cross

ROOT=Path(__file__).resolve().parents[1]
P={'body':[0,2.2,0],'head':[0,3.32,0],'jaw':[0,3.55,.3],
   'leftArm':[-.65,2.95,0],'rightArm':[.65,2.95,0],
   'leftLeg':[-.33,1.75,0],'rightLeg':[.33,1.75,0],
   'tail':[0,1.85,-.2],'cape':[0,3,-.3],'weapon':[0,2,.2]}

def brother(name,form=0,green=False):
 b=Builder();skin='#15151e';plate='#204d35' if green else '#482831';edge='#9c3834' if green else '#886a48';glow='#ed453c' if green else '#c191de'
 b.oval('Narrow alien waist',[0,2.1,0],[.33,.55,.23],skin)
 b.oval('Armoured ribcage',[0,2.75,0],[.57,.58,.30],plate,e=.65)
 for i in range(5):
  y=2.2+i*.18
  b.oval('Overlapping central cuirass '+str(i),[0,y,.27],[.29+i*.032,.13,.09],plate,e=.5)
  b.oval('Bronze central rivet '+str(i),[0,y,.365],[.033,.033,.02],edge,rows=5,cols=8)
 b.oval('Belt buckle',[0,1.96,.31],[.19,.17,.07],edge,e=.6)
 for side in [-1,1]:
  arm='leftArm' if side<0 else 'rightArm';leg='leftLeg' if side<0 else 'rightLeg'
  b.tube('Digitigrade leg '+str(side),[[side*.31,1.85,0],[side*.44,1.08,.08],[side*.36,.48,-.12],[side*.40,.13,.16]],[.20,.17,.12,.12],skin,leg,sides=12)
  b.oval('Long thigh plate '+str(side),[side*.36,1.38,.13],[.24,.42,.18],plate,leg,e=.6)
  b.oval('Engraved shin '+str(side),[side*.38,.61,.08],[.18,.35,.17],edge,leg,e=.7)
  b.oval('Cloven armored boot '+str(side),[side*.40,.12,.23],[.20,.13,.32],skin,leg,e=.6)
  for j in range(2):b.tube('Foot claw '+str((side,j)),[[side*(.30+j*.16),.12,.40],[side*(.30+j*.16),.05,.63]],[.07,.002],edge,leg,sides=7)
  b.tube('Long arm '+str(side),[[side*.59,2.98,0],[side*.76,2.47,-.02],[side*.66,1.97,.15]],[.20,.14,.11],skin,arm,sides=12)
  b.oval('High pauldron '+str(side),[side*.66,3.01,0],[.38,.25,.30],plate,arm,e=.6)
  b.plate('Scarab shoulder blade '+str(side),[[side*.42,2.95],[side*.66,3.45],[side*1.05,3.42],[side*.89,2.85]],.02,skin,arm,thickness=.10)
  for j in range(3):b.tube('Shoulder rim '+str((side,j)),[[side*(.53+j*.10),3.12,.22],[side*(.66+j*.10),2.92,.25]],[.045,.03],edge,arm,sides=7)
  b.oval('Forearm shell '+str(side),[side*.70,2.23,.12],[.21,.31,.19],plate,arm,e=.6)
  b.oval('Clawed palm '+str(side),[side*.66,1.90,.15],[.13,.18,.11],skin,arm)
  for j in range(3):b.tube('Puppet finger '+str((side,j)),[[side*(.58+j*.08),1.91,.16],[side*(.56+j*.09),1.71,.23],[side*(.59+j*.08),1.69,.34]],[.035,.024,.001],edge,arm,sides=7)
  b.plate('Long hip guard '+str(side),[[side*.08,2.05],[side*.45,2.07],[side*.67,1.24],[side*.32,1.39]],.21,plate,thickness=.08)
  b.tube('Swept back blade '+str(side),[[side*.35,2.75,-.28],[side*.70,1.92,-.46],[side*.75,1.10,-.60]],[.13,.09,.001],plate,'cape',sides=9)
 b.tube('Neck',[[0,3.02,0],[0,3.48,0]],[.21,.19],skin,'head',sides=12)
 b.oval('Elongated scarab cranium',[0,3.72,0],[.31,.54,.27],plate,'head',e=.7,rows=12,cols=18)
 b.plate('Central insect face ridge',[[-.035,3.28],[-.11,3.92],[0,4.22],[.11,3.92],[.035,3.28]],.275,edge,'head',thickness=.06)
 for side in [-1,1]:
  for j in range(3):b.tube('Cranial segmented crest '+str((side,j)),[[side*(.12+j*.05),3.35,.24],[side*(.25+j*.03),3.74,.20],[side*(.15+j*.03),4.13,.09]],[.04,.055,.005],plate,'head',sides=8)
  b.oval('Recessed insect eye '+str(side),[side*.16,3.69,.256],[.055,.08,.035],glow,'head',emission=.4)
  b.oval('Breathing vent '+str(side),[side*.13,3.39,.28],[.039,.045,.02],skin,'head',rows=6,cols=8)
 b.oval('Hidden mandible',[0,3.32,.17],[.14,.13,.16],skin,'jaw')
 if form:
  for side in [-1,1]:
   for j in range(4):b.tube('Ascendant crown ray '+str((side,j)),[[side*(.15+j*.045),3.99,-.03],[side*(.26+j*.12),4.27+j*.05,-.03],[side*(.31+j*.18),4.44+j*.06,-.12]],[.035,.025,.001],edge,'head',sides=7)
  b.oval('Unsealed sternum aperture',[0,2.83,.35],[.12,.17,.04],glow,emission=.65)
 if form==2:
  for side in [-1,1]:
   b.tube('Revealed puppet loom '+str(side),[[side*.3,2.9,-.3],[side*1.1,3.4,-.35],[side*1.55,3.8,-.2]],[.10,.07,.015],edge,'cape',sides=8)
   for j in range(3):b.tube('Hanging spectral thread '+str((side,j)),[[side*(1.1+j*.2),3.4+j*.2,-.2],[side*(1.0+j*.17),1.25,-.2]],[.008,.004],glow,'cape',sides=5,emission=.5)
 return {'name':name,'height':4.65 if form else 4.25,'meshes':b.parts,'pivots':P,'headPivot':P['head'],'jawPivot':P['jaw'],'forwardAxis':[0,0,1]}

def obsidnia():
 b=Builder();hide='#242b2b';shell='#555b57';rim='#a29677';green='#8fe85b';violet='#c665ed'
 b.oval('Goliath hunched body',[0,2.55,-.5],[1.40,1.15,1.60],hide,rows=12,cols=20)
 b.oval('Towering plated chest',[0,2.10,.67],[1.12,.91,.73],shell,e=.7)
 for side in [-1,1]:
  for j in range(3):
   leg='leftLeg' if side<0 else 'rightLeg';z=.85-j*1.12
   b.tube('Massive jointed limb '+str((side,j)),[[side*.95,2.38,z],[side*1.65,1.30,z+.15],[side*1.62,.22,z+.37]],[.38,.30,.20],hide,leg,sides=12)
   b.oval('Limb armour '+str((side,j)),[side*1.42,1.66,z+.08],[.44,.65,.42],shell,leg,e=.65)
   b.oval('Green joint lens '+str((side,j)),[side*1.75,1.55,z+.27],[.09,.13,.07],green,leg,emission=.6)
   for k in range(3):b.tube('Titan ground talon '+str((side,j,k)),[[side*(1.43+k*.18),.23,z+.45],[side*(1.40+k*.19),.05,z+.88]],[.13,.002],rim,leg,sides=7)
  for j in range(5):
   z=1.1-j*.64
   b.oval('Overlapping flank scute '+str((side,j)),[side*1.12,2.85,z],[.42,.40,.50],shell,e=.5)
   b.tube('Flank spike '+str((side,j)),[[side*1.28,2.9,z],[side*1.72,3.25,z-.22]],[.15,.002],rim,sides=8)
 b.oval('Armoured predatory head',[0,2.52,1.43],[.75,.59,.75],shell,'head',e=.7)
 b.oval('Black throat maw',[0,2.25,2.02],[.49,.29,.16],hide,'head')
 b.oval('Titan lower mandible',[0,2.02,1.81],[.53,.20,.43],rim,'jaw')
 for side in [-1,1]:
  b.oval('Small furious eye '+str(side),[side*.56,2.65,1.99],[.11,.09,.06],green,'head',emission=.7)
  b.tube('Great ivory tusk '+str(side),[[side*.56,2.37,1.95],[side*.92,1.73,2.23],[side*.78,1.26,2.60],[side*.45,1.12,2.71]],[.18,.16,.10,.001],rim,'head',sides=12)
  b.tube('Violet psychic blade '+str(side),[[side*.48,2.22,2.07],[side*.62,1.66,2.53],[side*.45,1.04,2.91]],[.10,.09,.001],violet,'jaw',sides=9,emission=.65)
  b.tube('Forward horn '+str(side),[[side*.53,2.90,1.40],[side*.68,3.40,1.71],[side*.59,3.64,1.92]],[.17,.10,.001],rim,'head',sides=10)
 for j in range(6):
  z=.9-j*.52
  b.oval('Dorsal overlapping shield '+str(j),[0,3.35,z],[.90,.27,.45],shell,e=.6)
  b.tube('Ancient dorsal spike '+str(j),[[0,3.38,z],[0,4.0-j*.04,z-.2]],[.17,.001],rim,sides=8)
 ring=[[.40*math.cos(i/24*math.tau),3.63+.50*math.sin(i/24*math.tau),.9] for i in range(25)]
 b.tube('Ancient conqueror crown loop',ring,.045,rim,'head',sides=7)
 piv={**P,'head':[0,2.6,1.1],'jaw':[0,2.12,1.60],'leftLeg':[-1,2.2,0],'rightLeg':[1,2.2,0]}
 return {'name':'Obsidnia — Ancient Conqueror of Steca','height':4.2,'meshes':b.parts,'pivots':piv,'headPivot':piv['head'],'jawPivot':piv['jaw'],'forwardAxis':[0,0,1]}

models={'veiled':brother("Tyromairon’as — Veiled Puppet Master"),'unsealed':brother("Tyromairon’as — Unsealed",1),'puppetMaster':brother("Tyromairon’as — Puppet Master",2),'tyronihlus':brother('Tyronihlus',1,True),'obsidnia':obsidnia()}
for key,m in models.items():
 for p in m['meshes']:
  f=[]
  for j in range(0,len(p['indices']),3):
   ids=p['indices'][j:j+3];v=[p['p'][i*3:i*3+3] for i in ids];n=cross([v[1][k]-v[0][k] for k in range(3)],[v[2][k]-v[0][k] for k in range(3)])
   if sum(x*x for x in n)<1e-20:continue
   if sum(n[k]*sum(p['n'][i*3+k] for i in ids) for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
   f+=ids
  p['indices']=f
 geo.PIVOTS=m['pivots'];geo.export_glb(m,'NOSTRAVECTOR_'+key+'_Oilkoumeneus.glb')
 print(key,len(m['meshes']),'parts',sum(len(p['indices'])//3 for p in m['meshes']),'triangles')
(ROOT/'work/oilkoumeneus_models.js').write_text('const OilkoumeneusModels='+json.dumps(models,separators=(',',':'))+';\n',encoding='utf-8')
