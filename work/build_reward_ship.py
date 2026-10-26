"""Original industrial frigate: sealed geometry, layered plating, four turret mounts and twin drives."""
from pathlib import Path
import math,json
import build_pontifex_model as g
root=Path(__file__).resolve().parents[1];b=g.Builder()
DARK='#171e27';HULL='#56636c';EDGE='#87959d';VOID='#080f17';CYAN='#67d9ff';GOLD='#c79558'
def box(name,c,size,color=HULL,bone='body',e=.22,emission=0):b.oval(name,c,size,color,bone,e=e,rows=4,cols=8,emission=emission)
# Bow faces negative Z; the stern reactor array points positive Z.
box('Armoured keel',[0,4,0],[5.8,2.6,17],DARK,e=.35)
box('Layered graphite pressure hull',[0,6,0],[6.8,3.9,15],HULL,e=.36)
box('Faceted reinforced prow',[0,5,-17],[5.8,3.8,5.5],HULL,e=.42)
box('Black recessed bow aperture',[0,5,-21.55],[3.8,2.4,.28],VOID,e=.35)
box('Bow inset landing port',[0,4.7,-21.9],[1.65,1.5,.18],EDGE)
box('Forward pilot glazing',[0,8,-18.2],[3.6,.45,2.6],VOID)
for x in [-2.2,0,2.2]:box('Bow cyan navigation window',[x,8.12,-20.1],[.78,.12,.07],CYAN,emission=.6)
# Raised command decks and distinct bridge silhouette.
for j,(z,w) in enumerate([(2,4.8),(3,3.6),(4.5,2.5)]):
 box('Raised bridge deck '+str(j),[0,10+j*1.4,z],[w,.95,4.8-j],HULL)
 for side in [-1,1]:
  for k in range(5-j):box('Bridge observation window',[side*(w+.03),10.2+j*1.4,z-3+k*1.25],[.045,.22,.43],CYAN,emission=.5)
 for x in range(-2,3):box('Forward bridge window',[x*.85,10.2+j*1.4,z-(4.85-j)],[.30,.20,.07],CYAN,emission=.6)
# Real panel relief, ribs, service conduits and window banks around the hull.
for side in [-1,1]:
 for row in range(2):
  for i in range(9):
   z=-14+i*3.4;y=4.4+row*3.2
   box('Bevelled hull armour tile',[side*6.65,y,z],[.38,1.22,1.48],EDGE if i%4==0 else HULL)
   box('Inset service panel',[side*7.02,y,z],[.06,.67,.96],DARK)
   for j in range(2):box('Tiny service window',[side*7.1,y+.22-j*.36,z-.45],[.045,.07,.43],CYAN if i%3 else GOLD,emission=.32)
 for z in [-16,-9,-2,5,12]:box('Structural ring rib',[side*6.8,6,z],[.42,3.5,.24],DARK)
 b.tube('Long luminous energy conduit',[[side*7.16,6.3,-15],[side*7.16,6.3,13]],.095,CYAN,sides=8,emission=.7)
 b.tube('Outer pipe return',[[side*7.1,3.0,-12],[side*7.1,3.0,10]],.11,DARK,sides=8)
 box('Lateral service pod',[side*8.1,3.9,3],[1.4,1.1,4.2],HULL)
 box('Pod service hatch',[side*9.49,4.1,3],[.08,.72,1.1],VOID)
 for k in range(4):box('Reactor cooling fin',[side*5.7,9.5,10+k*1.25],[.8,.21,.46],DARK)
# Two substantial ringed engine bells, visible emissive cores and expansion nozzles.
for side in [-1,1]:
 b.tube('Armoured drive nacelle',[[side*4,5.1,10],[side*4,5.1,17],[side*4,5.1,20]],[2.7,2.5,2.8],DARK,sides=16)
 for j in range(5):b.tube('Engine reinforcement band',[[side*4,5.1,14+j*1.15],[side*4,5.1,14.25+j*1.15]],2.75,EDGE,sides=16)
 b.tube('Blue ion reactor core',[[side*4,5.1,20.05],[side*4,5.1,20.35]],2.18,CYAN,sides=20,emission=1)
 b.tube('White hot engine centre',[[side*4,5.1,20.36],[side*4,5.1,20.4]],1.25,'#c4f6ff',sides=16,emission=1)
# Four rotating twin-barrel turrets, not decorative image planes.
pivots={'body':[0,0,0]}
for i,(x,z,y) in enumerate([(-3.9,-9,10),(3.9,-9,10),(-4.9,10,10),(4.9,10,10)]):
 bone='turret'+str(i);pivots[bone]=[x,y,z]
 box('Turret bearing '+str(i),[x,y-.2,z],[1.35,.35,1.35],DARK)
 box('Twin turret armoured housing '+str(i),[x,y+.7,z],[1.1,.65,1.25],HULL,bone)
 for dx in [-.48,.48]:
  b.tube('Turret cannon barrel '+str(i),[[x+dx,y+.7,z-.65],[x+dx,y+.7,z-4.1]],.19,DARK,bone,sides=10)
  b.tube('Turret cyan muzzle '+str(i),[[x+dx,y+.7,z-4.12],[x+dx,y+.7,z-4.32]],.24,CYAN,bone,sides=10,emission=.5)
# Gear, boarding ramp, sensors and communications silhouette.
for side in [-1,1]:
 for z in [-10,11]:
  box('Landing strut',[side*4.2,1.7,z],[.32,1.7,.38],DARK)
  box('Landing stabiliser',[side*4.2,.25,z],[1.2,.25,1.7],EDGE)
box('Boarding ramp',[-7.6,1.1,-1],[2,.15,2.7],HULL)
b.tube('Sensor mast',[[0,13,4],[0,17.2,4]],.12,EDGE,sides=8)
box('Radar crossbar',[0,16,4],[2.1,.10,.15],EDGE)
b.oval('Communications dish',[1.9,14,5],[1.3,.3,1.3],EDGE,e=.6,rows=5,cols=12)
box('Amber dorsal beacon',[0,17.3,4],[.18,.18,.18],GOLD,emission=.8)
model={'name':'Olympus Vanguard','generator':'NOSTRAVECTOR original industrial frigate','design':'Layered graphite armour, stacked cyan bridge windows, twin ion drives, service bays and four twin turrets. Native 3D geometry inspired by the supplied industrial ship reference.','meshes':b.parts,'pivots':pivots,'length':44,'driveMultiplier':4,'turrets':4}
(root/'work/reward_ship_model.js').write_text('const RewardShipModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
g.PIVOTS=pivots;g.export_glb(model,'NOSTRAVECTOR_Olympus_Vanguard.glb')
print('Built Olympus Vanguard:',len(b.parts),'parts;',sum(len(q['indices'])//3 for q in b.parts),'triangles; four twin turrets.')
