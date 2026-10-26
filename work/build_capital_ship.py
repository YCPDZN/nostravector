from pathlib import Path
import json,math
from build_pontifex_model import export_glb
W=Path(__file__).resolve().parent
class Model:
 def __init__(self,name):self.name=name;self.groups={}
 def box(self,name,c,size,col,deck=-1,glow=0):
  key=(name,col,deck,glow);m=self.groups.setdefault(key,{'name':name,'p':[],'n':[],'indices':[],'color':[int(col[i:i+2],16)/255 for i in (1,3,5)],'bone':'body','deck':deck,'emission':glow})
  for axis,sign in [(0,1),(0,-1),(1,1),(1,-1),(2,1),(2,-1)]:
   other=[i for i in range(3) if i!=axis];base=len(m['p'])//3
   for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]:
    v=list(c);v[axis]+=sign*size[axis]/2;v[other[0]]+=a*size[other[0]]/2;v[other[1]]+=b*size[other[1]]/2;n=[0,0,0];n[axis]=sign;m['p']+=v;m['n']+=n
   m['indices'] += ([base,base+2,base+1,base,base+3,base+2] if sign!=(-1 if axis==1 else 1) else [base,base+1,base+2,base,base+2,base+3])
 def data(self):return {'name':self.name,'meshes':list(self.groups.values()),'pivots':{'body':[0,0,0]}}
DARK='#131d28';STEEL='#536370';EDGE='#94a5b0';CYAN='#69e8ff';GOLD='#b79253';WOOD='#483938';GLASS='#153642'
ext=Model('Grek Horizon / seven-deck capital flagship')
ext.box('Pressure hull',(0,11,0),(48,22,170),DARK)
for z in range(-90,91,18):
 ext.box('Armour bands',(0,12,z),(52,25,5),STEEL)
 for side in [-1,1]:
  ext.box('Window galleries',(side*24.7,13,z),(1,4,12),GLASS);ext.box('Lateral energy spine',(side*26,6,z),(1.2,1.2,15),CYAN,glow=.8)
  for y in [0,5,10,15,20]:ext.box('Deck portholes',(side*26,y,z),(1,.7,8),CYAN,glow=.55)
ext.box('Reinforced prow',(0,10,-94),(40,23,25),STEEL);ext.box('Bow hangar aperture',(0,8,-107),(24,14,1),GLASS)
for j in range(4):
 ext.box('Bridge superstructure',(0,24+j*3,15+j*2),(30-j*5,4,44-j*7),STEEL)
 ext.box('Bridge observation windows',(0,25+j*3,-8+j*5),(25-j*5,1.5,1),CYAN,glow=.65)
for side in [-1,1]:
 for z in [-55,-10,35]:
  ext.box('Turret pedestal',(side*28,21,z),(8,5,9),DARK)
  for x in [-2,2]:ext.box('Heavy turret barrels',(side*28+x,23,z-10),(1.4,1.4,17),STEEL);ext.box('Turret muzzle',(side*28+x,23,z-18.7),(1.8,1.8,.5),CYAN,glow=1)
 for y in [1,12,23]:
  ext.box('Engine housings',(side*14,y,92),(15,11,24),STEEL);ext.box('Engine glow',(side*14,y,105),(10,7,1),CYAN,glow=1)
  ext.box('Engine exhaust',(side*14,y,112),(7,4,14),'#2a7ca5',glow=.8)
for z in [-62,-30]:
 ext.box('Garden terrace',(0,25,z),(34,2,25),EDGE)
 for side in [-1,1]:
  ext.box('Garden canopy glazing',(side*8,29,z),(13,6,20),GLASS)
  for k in range(6):ext.box('Canopy ribs',(side*8,32,z-10+k*4),(14,.3,.3),EDGE)
  for k in range(5):ext.box('Garden planting',(side*8+(k%2)*3-1,28,z-7+k*3),(3,3,2),'#42674a')
for z in [-45,0,45]:ext.box('Keel engineering blocks',(0,-4,z),(28,9,20),STEEL)
inside=Model('Grek Horizon / seven furnished walkable floors')
for deck in range(7):
 y=(6-deck)*4.5
 # Leave stairwells open, with solid landings at each end.
 for name,h in [('Deck floor',y-.15),('Deck ceiling',y+4.1)]:
  inside.box(name,(0,h,-7),(30,.3,74),DARK,deck)
  inside.box(name,(0,h,35),(15,.3,10),DARK,deck)
  inside.box(name,(0,h,42),(30,.3,4),DARK,deck)
  for side in [-1,1]:inside.box(name,(side*14.3,h,35),(1.4,.3,10),DARK,deck)
 for side in [-1,1]:
  inside.box('Side walls',(side*15,y+2,0),(.35,4,88),STEEL,deck)
  for z in range(-40,41,8):
   inside.box('Viewports',(side*14.7,y+2.3,z),(.1,1.7,5),GLASS,deck)
   inside.box('Light strips',(side*14.5,y+3.7,z),(.12,.15,7),CYAN,deck,.65)
 for z in [-44,44]:inside.box('End walls',(0,y+2,z),(30,4,.4),STEEL,deck)
 for x in [-3.2,3.2]:inside.box('Aisle guide',(x,y+.02,0),(.08,.04,82),CYAN,deck,.5)
 # Central lift lobby stays clear on every floor.
 inside.box('Lift arch',(0,y+3.4,12),(5,.25,.35),GOLD,deck)
 for x in [-2.4,2.4]:inside.box('Lift pillars',(x,y+1.7,12),(.25,3.4,.25),GOLD,deck)
 inside.box('Lift call panel',(2.7,y+1.5,12),(.3,.7,.6),CYAN,deck,.6)
 if deck==0:
  inside.box('Captain helm',(0,y+.9,-37),(5,1.8,2),STEEL,deck)
  inside.box('Helm displays',(0,y+1.9,-37.7),(4.5,.8,.1),CYAN,deck,.6)
  inside.box('Captain bed',(-9,y+.65,23),(5,1.2,8),WOOD,deck)
  inside.box('Captain bedding',(-9,y+1.3,23),(4.8,.2,7.8),EDGE,deck)
  inside.box('Planning table',(9,y+1,-17),(5,2,8),STEEL,deck)
 elif deck==1:
  for side in [-1,1]:
   for z in [-28,-10,21]:inside.box('Lounge seats',(side*9,y+.6,z),(6,1.2,5),WOOD,deck);inside.box('Lounge tables',(side*7,y+.7,z+5),(3,1.4,2),STEEL,deck)
 elif deck in [2,5]:
  for side in [-1,1]:
   for row in range(25):
    z=-39+row*2.6
    for bunk in [0,1]:
     inside.box('Crew bunk frames',(side*10,y+.45+bunk*1.65,z),(7,.35,2.5),STEEL,deck)
     inside.box('Crew mattresses',(side*10,y+.68+bunk*1.65,z),(6.8,.15,2.3),EDGE,deck)
  # 50 bunks / 100 sleeping places on each accommodation deck.
 elif deck==3:
  for side in [-1,1]:
   for z in [-28,-14,0,21]:
    inside.box('Canteen tables',(side*9,y+1,z),(5,2,5),STEEL,deck)
    for dz in [-3.4,3.4]:inside.box('Canteen benches',(side*9,y+.55,z+dz),(5,1.1,1.4),WOOD,deck)
 elif deck==4:
  for side in [-1,1]:
   for z in [-30,-16,0,21]:inside.box('Cargo containers',(side*10,y+1.4,z),(7,2.8,7),GOLD,deck)
  inside.box('Airlock hatch',(0,y+1.8,43),(5,3.6,.15),GLASS,deck)
 else:
  for side in [-1,1]:
   for z in [-25,-9,21]:
    inside.box('Reactor machinery',(side*9,y+1.5,z),(5,3,8),STEEL,deck)
    inside.box('Reactor cores',(side*9,y+1.8,z-.1),(2.8,2.4,8.4),CYAN,deck,.65)
for deck in range(6):
 x=10.5 if deck%2==0 else -10.5
 low=(5-deck)*4.5
 for step in range(24):
  height=(step+1)*4.5/24
  inside.box('Stair treads',(x,low+height-.09,40-(step+.5)*10/24),(3,.18,10/24+.02),STEEL,deck)
  for side in [-1,1]:
   inside.box('Stair rail',(x+side*1.5,low+height+1,40-(step+.5)*10/24),(.1,.12,.48),GOLD,deck)
   if step%4==0:inside.box('Stair posts',(x+side*1.5,low+height+.5,40-(step+.5)*10/24),(.1,1,.1),GOLD,deck)
for part in ext.groups.values():
 part['p']=[v*(.9 if i%3==1 else .62) for i,v in enumerate(part['p'])]
for model,variable,filename in [(ext,'CapitalShipModel','NOSTRAVECTOR_Grek_Horizon.glb'),(inside,'CapitalInteriorModel','NOSTRAVECTOR_Grek_Horizon_Interior.glb')]:
 data=model.data();(W/(variable+'.js')).write_text('const '+variable+'='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8');export_glb(data,filename);print(variable,len(data['meshes']),'batched meshes')
