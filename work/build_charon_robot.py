"""Articulated industrial humanoid: salvage armour, exposed actuators and sensor optics."""
from pathlib import Path
import json, math
import build_pontifex_model as g
root=Path(__file__).resolve().parents[1]; b=g.Builder()
steel='#687576'; dark='#222d31'; yellow='#b99535'; rubber='#111b20'; silver='#aab8b6'; cyan='#68e5ed'; amber='#ffb24e'
def part(name,c,size,col=steel,bone='body',glow=0):b.oval(name,c,size,col,bone,e=.35,rows=5,cols=10,emission=glow)
def tube(name,a,c,r,col=steel,bone='body',glow=0):b.tube(name,[a,c],r,col,bone,sides=10,emission=glow)
part('Armoured chest chassis',[0,3.02,0],[.78,.67,.37]);part('Abdominal mechanical frame',[0,2.25,0],[.48,.36,.28],dark)
part('Waist bearing',[0,1.96,0],[.56,.17,.32],silver)
for side in [-1,1]:
 for j in range(3):
  part('Chest layered service plate',[side*.37,3.15-j*.28,.37],[.30,.12,.045],silver)
  for k in [-1,1]:part('Chest plate bolt',[side*.37+k*.22,3.15-j*.28,.423],[.035,.035,.025],dark)
 tube('Shoulder axle',[side*.55,3.35,0],[side*1.03,3.35,0],.25,dark)
 part('Shoulder hydraulic cap',[side*.94,3.33,0],[.31,.35,.38],steel,'leftArm' if side<0 else 'rightArm')
 bone='leftArm' if side<0 else 'rightArm'
 tube('Upper arm actuator',[side*.98,3.15,0],[side*1.16,2.57,.04],.17,silver,bone)
 part('Yellow upper arm shroud',[side*1.08,2.92,.17],[.20,.35,.12],yellow,bone)
 part('Elbow rotary servo',[side*1.17,2.48,.03],[.24,.22,.24],dark,bone)
 tube('Forearm drive',[side*1.17,2.44,.05],[side*1.16,1.91,.16],.14,steel,bone)
 tube('Arm external piston',[side*1.29,2.82,-.1],[side*1.36,2.08,.1],.045,silver,bone)
 part('Articulated palm',[side*1.16,1.78,.18],[.20,.19,.12],dark,bone)
 for j in range(4):
  xx=side*1.16+(j-1.5)*.10
  tube('Finger proximal',[xx,1.69,.22],[xx,1.52,.27],.037,silver,bone)
  tube('Finger distal',[xx,1.52,.27],[xx,1.47,.36],.035,dark,bone)
 tube('Opposable thumb',[side*1.37,1.81,.23],[side*1.44,1.62,.34],.055,steel,bone)
 bone='leftLeg' if side<0 else 'rightLeg'
 part('Hip bearing',[side*.56,1.94,0],[.35,.34,.36],dark,bone)
 for zz in [-.37,.37]:
  tube('Hip concentric hub',[side*.56,1.94,zz],[side*.56,1.94,zz+.055],.23,silver,bone)
 tube('Heavy thigh strut',[side*.58,1.83,0],[side*.72,1.05,.14],.19,dark,bone)
 part('Ochre thigh armour',[side*.69,1.49,.27],[.30,.46,.14],yellow,bone)
 for zz in [-.1,.12]:tube('Chrome thigh piston',[side*.90,1.78,zz],[side*.99,1.11,zz+.12],.065,silver,bone)
 part('Knee swivel',[side*.73,.95,.14],[.27,.24,.28],steel,bone)
 tube('Shin skeletal frame',[side*.73,.88,.12],[side*.65,.32,.35],.12,dark,bone)
 tube('Shin polished ram',[side*.91,.87,.12],[side*.85,.30,.35],.055,silver,bone)
 part('Ankle bearing',[side*.65,.25,.32],[.19,.18,.22],steel,bone)
 part('Wide magnetic boot',[side*.65,.13,.48],[.37,.13,.62],rubber,bone)
 part('Armoured boot toe',[side*.65,.24,.82],[.34,.13,.26],yellow,bone)
 for j in range(5):part('Boot traction ridge',[side*.65,.07,.05+j*.20],[.38,.045,.045],silver,bone)
 # Folded auxiliary tool arms preserve the reference's utility-machine silhouette.
 tube('Folded support outrigger',[side*.68,3.30,-.30],[side*1.36,3.10,-.5],.11,dark)
 tube('Folded rear stabiliser',[side*1.36,3.10,-.5],[side*1.55,2.32,-.40],.095,steel)
 part('Rear tool clamp',[side*1.55,2.25,-.4],[.18,.13,.16],yellow)
 for j in range(7):
  xx=side*(.57+.025*(j%2)); yy=1.19+j*.095
  part('Worn paint chips',[xx,yy,.418],[.06,.015,.012],steel,bone)
for yy in [2.24,2.42,2.60]:tube('Abdominal rib',[ -.4,yy,.28],[.4,yy,.28],.06,silver)
part('Chest identification plate',[0,3.39,.405],[.22,.14,.028],dark)
for j in range(4):part('Identification glyph',[ -.14+j*.09,3.39,.438],[.025,.065,.01],silver)
tube('Neck piston',[0,3.55,0],[0,3.85,0],.14,silver)
part('Squared sensor head',[0,4.05,0],[.34,.40,.28],steel,'head')
part('Recessed optical mask',[0,4.12,.285],[.29,.13,.035],dark,'head')
for x,col in [(-.18,amber),(.18,cyan)]:part('Asymmetric luminous eye',[x,4.13,.33],[.095,.075,.025],col,'head',.8)
part('Brow shade',[0,4.31,.28],[.35,.055,.10],dark,'head')
part('Mechanical voice grille',[0,3.86,.285],[.22,.10,.04],dark,'jaw')
for j in range(5):part('Vocoder slat',[-.16+j*.08,3.87,.335],[.022,.07,.015],silver,'jaw')
for side in [-1,1]:tube('Temple rotary ring',[side*.31,4.10,0],[side*.39,4.10,0],.15,dark,'head')
tube('Comms antenna',[.19,4.35,-.06],[.19,4.95,-.06],.023,steel,'head');part('Antenna signal tip',[.19,4.95,-.06],[.045,.06,.045],amber,'head',.6)
part('Backpack power unit',[0,3.10,-.48],[.53,.58,.23],dark)
for x in [-.35,0,.35]:
 part('Backpack battery',[x,3.15,-.70],[.12,.42,.08],steel)
 part('Battery charge indicator',[x,3.38,-.795],[.07,.06,.012],cyan,'body',.6)
for side in [-1,1]:
 for j in range(9):part('Shoulder scuffed caution marking',[side*(.83+j*.025),3.57-j*.025,.31],[.03,.05,.025],yellow if j%2 else dark)
model={'name':'Charon','generator':'NOSTRAVECTOR original industrial humanoid','design':'Two-legged salvage robot with asymmetric amber/cyan optics, worn ochre armour, exposed hydraulics, articulated hands, magnetic boots and folded maintenance outriggers.','meshes':b.parts,'headPivot':[0,3.75,0],'jawPivot':[0,3.9,.2],'pivots':{'body':[0,0,0],'head':[0,3.75,0],'jaw':[0,3.9,.2],'leftArm':[-.94,3.33,0],'rightArm':[.94,3.33,0],'leftLeg':[-.56,1.94,0],'rightLeg':[.56,1.94,0]}}
(root/'work/charon_robot_model.js').write_text('const CharonRobotModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8');g.PIVOTS=model['pivots'];g.export_glb(model,'NOSTRAVECTOR_Charon_Robot.glb');print('Built Charon:',len(b.parts),'native mesh parts')
