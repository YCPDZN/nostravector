"""Reference-inspired original articulated HFOS and Erisian infantry meshes."""
from pathlib import Path
import json, math
import build_pontifex_model as geometry
from build_pontifex_model import Builder, PIVOTS
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'work'; OUT=ROOT/'outputs'

def soldier(alien=False):
 b=Builder(); plate='#202633' if alien else '#244c81'; edge='#d864a7' if alien else '#c9a85d'; dark='#10151e'; skin='#dce5e9' if alien else '#bd937b'; steel='#4b5361'
 def panel(name,c,size,bone='body',color=None):
  b.oval(name+' rim',c,[v*1.07 for v in size],edge,bone,e=.42,rows=5,cols=10)
  b.oval(name+' armour',[c[0],c[1],c[2]+size[2]*.09+.008],size,color or plate,bone,e=.45,rows=5,cols=10)
 b.oval('Undersuit torso',[0,2.62,0],[.56,.71,.31],dark,e=.65)
 b.oval('Pelvis',[0,1.88,0],[.47,.28,.29],dark,e=.65)
 for side in [-1,1]:
  leg='leftLeg' if side<0 else 'rightLeg';arm='leftArm' if side<0 else 'rightArm'
  b.tube('Trouser leg '+leg,[[side*.31,1.93,0],[side*.34,1.05,0],[side*.35,.24,0]],[.26,.21,.16],dark,leg,sides=12)
  panel('Thigh '+leg,[side*.34,1.50,.20],[.22,.40,.10],leg)
  panel('Knee '+leg,[side*.35,1.00,.22],[.21,.22,.12],leg)
  panel('Shin '+leg,[side*.35,.59,.15],[.18,.28,.13],leg)
  b.oval('Boot '+leg,[side*.35,.17,.15],[.25,.19,.39],dark,leg,e=.5)
  b.oval('Toe plate '+leg,[side*.35,.19,.37],[.24,.12,.20],plate,leg,e=.5)
  for i in range(4):b.oval('Sole tread '+leg+str(i),[side*.35,.055,-.08+i*.15],[.25,.045,.03],steel,leg,e=.45,rows=3,cols=8)
  b.tube('Sleeve '+arm,[[side*.61,3.10,0],[side*.78,2.66,0],[side*.80,2.08,.08]],[.24,.19,.15],dark,arm,sides=12)
  panel('Shoulder '+arm,[side*.66,3.08,.08],[.35,.25,.29],arm)
  panel('Forearm '+arm,[side*.80,2.35,.17],[.18,.30,.14],arm)
  b.oval('Elbow '+arm,[side*.80,2.63,-.03],[.19,.17,.20],steel,arm)
  b.oval('Glove '+arm,[side*.81,1.99,.12],[.15,.19,.13],dark,arm)
  for finger in range(4):
   x=side*(.71+finger*.065)
   b.tube('Finger '+arm+str(finger),[[x,1.98,.18],[x,1.84,.21],[x,1.80,.14]],[.026,.026,.021],dark,arm,sides=6)
   b.oval('Knuckle '+arm+str(finger),[x,2.03,.23],[.033,.043,.02],plate,arm,rows=3,cols=6)
  b.tube('Thumb '+arm,[[side*.70,2.07,.17],[side*.66,1.98,.24],[side*.69,1.91,.22]],.037,dark,arm,sides=8)
  for i in range(3):b.oval('Arm vent '+arm+str(i),[side*.80,2.28+i*.075,.321],[.10,.018,.014],edge,arm,rows=3,cols=6)
  b.tube('Shoulder cable '+arm,[[side*.32,3.23,-.12],[side*.55,3.35,-.12],[side*.85,3.04,-.02]],[.035,.04,.028],steel,arm,sides=8)
  if alien:
   for i in range(3):b.tube('Shoulder thorn '+arm+str(i),[[side*(.58+i*.13),3.20,.02],[side*(.61+i*.19),3.49-i*.04,.04]],[.09,.001],steel,arm,sides=8)
 panel('Breastplate',[0,2.91,.25],[.48,.30,.14])
 for i in range(3):panel('Abdominal segment '+str(i),[0,2.58-i*.16,.27],[.34-i*.025,.095,.075])
 for side in [-1,1]:
  b.tube('Chest harness '+str(side),[[side*.36,3.24,.15],[side*.40,2.91,.40],[side*.36,2.36,.28]],.055,dark,sides=8)
  panel('Clavicle buckle '+str(side),[side*.36,3.14,.28],[.075,.09,.027],color=edge)
 b.oval('Belt',[0,2.03,.01],[.50,.12,.34],dark,e=.4)
 panel('Belt clasp',[0,2.03,.37],[.11,.10,.035],color=edge)
 for i in [-2,-1,1,2]:panel('Utility pouch '+str(i),[i*.19,2.03,.31-abs(i)*.015],[.078,.14,.07],color=dark)
 b.oval('Backpack',[0,2.75,-.36],[.38,.47,.18],dark,e=.4)
 for side in [-1,1]:panel('Pack battery '+str(side),[side*.22,2.76,-.52],[.10,.34,.06],color=steel)
 b.tube('Neck',[ [0,3.12,0],[0,3.50,0] ],.18,dark,'head',sides=16)
 b.oval('Face',[0,3.73,.04],[.29,.39,.27],skin,'head',e=.85,rows=12,cols=20)
 b.oval('Jaw',[0,3.48,.11],[.23,.17,.20],skin,'head')
 b.oval('Nose',[0,3.72,.294],[.055,.105,.06],skin,'head')
 b.tube('Mouth line',[[-.09,3.48,.283],[0,3.47,.301],[.09,3.48,.283]],.012,'#797d83' if alien else '#684438','head',sides=6)
 for side in [-1,1]:
  b.oval('Ear '+str(side),[side*.29,3.70,.04],[.055,.11,.07],skin,'head')
  b.oval('Eye socket '+str(side),[side*.123,3.81,.277],[.10,.049,.028],'#11141e' if alien else '#ebe6df','head',rows=5,cols=12)
  if not alien:b.oval('Iris '+str(side),[side*.123,3.81,.305],[.032,.036,.012],'#293b47','head',rows=5,cols=10)
  b.tube('Brow '+str(side),[[side*.045,3.90,.285],[side*.12,3.92,.281],[side*.205,3.89,.25]],.015,skin if alien else '#3f302b','head',sides=8)
 if alien:
  # Swept white locks frame an uncovered porcelain face; back hair stays behind it.
  b.oval('White crown',[0,3.99,-.01],[.32,.22,.29],'#e1e8ef','head',rows=10,cols=20)
  for i in range(22):
   a=math.pi*.15+i/21*math.pi*.70;side=-1 if i<11 else 1;k=i%11;t=k/10
   x=side*(.06+t*.25)
   b.tube('Long ivory hair '+str(i),[[x*.55,4.14,-.05],[x,3.95,-.15],[x*1.18,3.50,-.22],[x*1.32,2.97-t*.4,-.27],[x*1.7,2.50-t*.3,-.17]],[.042,.047,.04,.029,.002],'#f2f4f7' if i%3 else '#b8c9d6','head',sides=7)
  for side in [-1,1]:
   for i in range(5):b.tube('Front hair '+str(side)+str(i),[[side*(.10+i*.035),4.12,.16],[side*.29,3.87,.23],[side*(.32+i*.014),3.40,.22],[side*(.34+i*.035),2.93-i*.06,.31]],[.033,.035,.029,.001],'#f2f2f4','head',sides=7)
  for side in [-1,1]:
   b.poly('Split battle cloak '+str(side),[[side*.15,3.16],[side*.51,3.00],[side*.70,.54],[side*.49,.35],[side*.35,.70],[side*.20,.39]],-.38,.028,dark,'cape')
   b.tube('Pink cloak piping '+str(side),[[side*.5,3.03,-.41],[side*.62,1.8,-.42],[side*.70,.54,-.41]],.025,edge,'cape',sides=6)
  b.poly('Erisian crest',[[-.16,3.10],[0,2.99],[.16,3.10],[0,2.78]],.408,.025,edge,emission=.18)
 else:
  b.oval('Blue combat helmet',[0,4.00,-.015],[.34,.25,.33],plate,'head',e=.8,rows=10,cols=20)
  b.tube('Gold helmet rim',[[-.31,3.93,.15],[-.24,4.11,.22],[0,4.20,.24],[.24,4.11,.22],[.31,3.93,.15]],.028,edge,'head',sides=8)
  b.oval('Visor frame',[0,3.84,.28],[.29,.105,.055],dark,'head',e=.45)
  b.oval('Dark blue goggles',[0,3.85,.317],[.26,.075,.025],'#16324b','head',e=.5)
  for side in [-1,1]:
   b.oval('Gold ear comm '+str(side),[side*.34,3.82,-.02],[.065,.13,.11],edge,'head')
   b.oval('Helmet sensor '+str(side),[side*.28,4.03,.18],[.075,.065,.075],dark,'head')
   b.oval('Sensor glass '+str(side),[side*.28,4.03,.25],[.035,.035,.012],'#63a4c3','head',emission=.2)
  b.poly('Gold Federation shield',[[-.12,3.15],[.12,3.15],[.10,2.98],[0,2.90],[-.10,2.98]],.410,.025,edge)
  b.poly('Helmet insignia',[[-.055,4.16],[.055,4.16],[.055,4.05],[0,4.00],[-.055,4.05]],.270,.025,edge,'head')
  b.tube('Comms antenna',[[.36,3.89,-.10],[.39,4.26,-.11]],.019,steel,'head',sides=6)
 # A holstered compact weapon and separate mag pouches keep the idle silhouette readable.
 b.oval('Holster',[.57,1.71,.03],[.11,.25,.12],dark,'rightLeg',e=.4)
 b.oval('Sidearm grip',[.57,1.98,.02],[.06,.10,.07],steel,'rightLeg',e=.4)
 return {'name':'Erisian Sentinel' if alien else 'HFOS Federation Infantry','faction':'ERISIAN' if alien else 'HUMAN','meshes':b.parts,'pivots':PIVOTS,'height':4.3}

models={'HUMAN':soldier(),'ERISIAN':soldier(True)}
for key,m in models.items():
 geometry.export_glb(m,'NOSTRAVECTOR_'+('HFOS_Soldier' if key=='HUMAN' else 'Erisian_Soldier')+'.glb')
 print(key,len(m['meshes']),'parts',sum(len(p['indices'])//3 for p in m['meshes']),'triangles')
(WORK/'faction_infantry_models.js').write_text('const FactionInfantryModels='+json.dumps(models,separators=(',',':'))+';\n',encoding='utf-8')
