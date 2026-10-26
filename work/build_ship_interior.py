"""Three enclosed, connected decks built as real geometry, not a cutaway picture."""
from pathlib import Path
import json,math
import build_pontifex_model as g
root=Path(__file__).resolve().parents[1];b=g.Builder();metal='#303e49';dark='#111d29';edge='#657984';cyan='#62d9ed';warm='#e5bd76'
def box(name,x,y,z,w,h,d,color=metal,emission=0):
 p=[];n=[];f=[]
 for normal,pts in [([1,0,0],[(1,-1,-1),(1,1,-1),(1,1,1),(1,-1,1)]),([-1,0,0],[(-1,-1,1),(-1,1,1),(-1,1,-1),(-1,-1,-1)]),([0,1,0],[(-1,1,-1),(-1,1,1),(1,1,1),(1,1,-1)]),([0,-1,0],[(-1,-1,1),(-1,-1,-1),(1,-1,-1),(1,-1,1)]),([0,0,1],[(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]),([0,0,-1],[(1,-1,-1),(-1,-1,-1),(-1,1,-1),(1,1,-1)])]:
  start=len(p);p.extend([[x+a*w/2,y+bb*h/2,z+c*d/2] for a,bb,c in pts]);n.extend([normal]*4);f.extend([start,start+1,start+2,start,start+2,start+3])
 b.add(name,p,n,f,color,emission=emission)
def console(x,y,z,side=False,name='Console'):
 box(name+' cabinet',x,y+.55,z,1.8,1.1,1,dark)
 box(name+' display rim',x,y+1.35,z+.15,1.9,.95,.16,edge)
 box(name+' cyan display',x,y+1.35,z+.245,1.65,.70,.025,cyan,.65)
 for k in range(5):box(name+' scan lines',x-.60+k*.29,y+1.3,z+.267,.025,.50,.012,'#b9f4f9',.7)
 for k in range(4):box(name+' control keys',x-.60+k*.4,y+1.1,z-.25,.16,.04,.12,warm if k==3 else cyan,.4)
# Floor plates with genuine stairwell openings.
box('Engineering deck floor',0,-.1,0,12,.2,36,dark)
for deck,side in [(1,1),(2,-1)]:
 y=deck*4-.1
 box('Deck central floor',-side*1.2,y,0,9.6,.2,36,dark)
 box('Deck forward stairwell surround',side*4.8,y,-9,2.4,.2,18,dark)
 box('Deck rear stairwell surround',side*4.8,y,13,2.4,.2,10,dark)
for deck in range(3):
 y=deck*4
 # Ribbed pressure walls and continuous light channels.
 for side in [-1,1]:
  box('Side pressure hull',side*6.1,y+2,0,.2,4,36,metal)
  for z in range(-16,18,4):
   box('Raised structural rib',side*5.92,y+2,z,.18,3.9,.22,edge)
   box('Window inset',side*5.93,y+2.05,z+1.5,.035,1.35,2.3,'#071522',.05)
   for j in range(5):box('Window star glint',side*5.90,y+1.8+(j%3)*.26,z+.6+j*.36,.04,.035,.035,'#c8e7ef',.6)
  box('Deck cyan light rail',side*5.84,y+.18,0,.07,.08,35,cyan,.6)
  box('Ceiling warm light strip',side*3.2,y+3.78,0,.13,.07,34,warm,.65)
 for z in range(-16,18,4):box('Ceiling cross brace',0,y+3.92,z,12,.16,.24,edge)
 box('Stern bulkhead',0,y+2,18.1,12,4,.2,metal)
 if deck<2:box('Forward bulkhead',0,y+2,-18.1,12,4,.2,metal)
 # Cable bundles remain overhead, leaving the central walking aisle clear.
 for x in [-4.8,4.8]:b.tube('Overhead utility conduit',[[x,y+3.58,-16],[x,y+3.64,-5],[x,y+3.58,16]],.085,dark,sides=8)
# Inset pressure panels, bolted access covers and illuminated maintenance runners.
for deck in range(3):
 y=deck*4
 for side in [-1,1]:
  for z in range(-15,18,4):
   box('Lower hull service panel',side*5.94,y+.72,z,.045,.72,2.8,'#243541')
   box('Inset service panel seam',side*5.90,y+.72,z,.03,.025,2.6,edge)
   for zz in [-1.15,1.15]:
    box('Pressure panel retaining bolt',side*5.86,y+.95,z+zz,.04,.07,.07,warm)
   for dz in [-.65,-.32,0,.32,.65]:
    box('Service ventilation fin',side*5.86,y+3.12,z+dz,.07,.32,.06,edge)
 for z in range(-16,18,2):
  # The central runner never overlaps either stair opening.
  box('Recessed deck runner',0,y+.015,z,2.8,.025,1.75,'#263846')
  for x in [-1.5,1.5]:
   box('Deck plate illuminated marker',x,y+.035,z,.08,.02,.28,cyan,.45)
 for side in [-1,1]:
  for z in [-14,-6,10,16]:
   box('Overhead junction housing',side*4.8,y+3.53,z,.6,.34,.65,edge)
   box('Junction status lamp',side*4.8,y+3.34,z,.28,.03,.20,cyan,.7)
box('Upper roof',0,12.1,0,12,.2,36,metal)
# Functional stairs with closed risers and safety rails.
for x,base in [(4.6,0),(-4.6,4)]:
 for i in range(16):box('Stair tread',x,base+(i+1)*.25-.125,7.75-i*.5,1.7,.25,.5,edge)
 for side in [-1,1]:
  b.tube('Sloped stair handrail',[[x+side*.9,base+1,8],[x+side*.9,base+5,0]],.035,warm,sides=8)
  for z in [0,2,4,6,8]:box('Stair rail upright',x+side*.9,base+(8-z)/2+.5,z,.045,1,.045,edge)
# Lower engineering bay, reactor bank, service station and cargo.
box('Reactor skid',0,.2,11,4.4,.4,7,edge)
for x in [-1.2,1.2]:
 b.tube('Sealed reactor cylinder',[[x,1.3,8.4],[x,1.3,14.2]],.9,metal,sides=16)
 b.tube('Reactor blue service port',[[x,1.3,8.2],[x,1.3,8.35]],.7,cyan,sides=16,emission=.9)
 for z in [9,10.5,12,13.5]:b.tube('Reactor retaining band',[[x,1.3,z],[x,1.3,z+.12]],.98,edge,sides=12)
console(-3.9,0,12,name='Engineering diagnostic')
for side in [-1,1]:
 for z in [-12,-10]:
  box('Cargo locker',side*2.7,.9,z,1.7,1.8,1.7,metal)
  box('Cargo cyan seal',side*2.7,1.5,z-.86,1.2,.08,.025,cyan,.4)
box('Lower maintenance bench',-4.5,.75,-5,2,1.5,3,edge)
# Mid-deck communal table, seats, forge bench and bunks.
box('Mess table top',0,4.9,-8,2.8,.14,4.2,'#7d6951');box('Mess table base',0,4.45,-8,.7,.9,2.9,dark)
for side in [-1,1]:
 for z in [-9.3,-7]:
  box('Crew chair seat',side*2,4.5,z,.8,.16,.8,edge);box('Crew chair back',side*2.35,4.98,z,.13,1,.8,metal);box('Crew chair support',side*2,4.23,z,.14,.5,.14,dark)
box('Khazglar workshop counter',-3.5,4.8,13.8,3.4,1.6,2.2,edge)
console(-3.5,4,14,name='Craftsman workstation')
for y in [4.55,6.35]:
 box('Cabin bunk frame',3.7,y,12.2,3.1,.18,5,dark);box('Cabin mattress',3.7,y+.2,12.2,2.8,.25,4.6,'#516874');box('Cabin pillow',3.7,y+.38,10.45,2.3,.16,.8,'#c2b7a0')
box('Cabin privacy divider',1.9,6,14.7,.1,3.7,5,metal)
# Port-side mid-deck airlock, matching the exterior boarding ramp.
box('Airlock frame',-5.88,5.6,-2,.10,3.2,2.5,edge);box('Airlock sealed door',-5.80,5.55,-2,.06,2.85,2.1,dark);box('Airlock cyan seal',-5.75,5.6,-2,.025,2.2,.06,cyan,.7)
# Upper bridge with panoramic forward windows and staffed consoles.
for x in [-5.6,-2.8,0,2.8,5.6]:box('Bridge panoramic mullion',x,10,-18,.10,4,.12,edge)
box('Bridge lower viewport frame',0,8.5,-18,12,1,.22,metal);box('Bridge upper viewport frame',0,11.8,-18,12,.4,.22,metal)
for x in [-1.7,0,1.7]:console(x,8,-15,name='Helm navigation')
console(-4,8,-10,name='Port navigation');console(4,8,-10,name='Starboard tactics')
box('Pilot chair seat',0,8.65,-12,1.2,.25,1.3,edge);box('Pilot chair back',0,9.25,-11.4,1.2,1.2,.2,metal);box('Pilot chair pedestal',0,8.25,-12,.25,.5,.25,dark)
model={'name':'Olympus Vanguard Interior','generator':'NOSTRAVECTOR three-deck walkable interior','design':'Pressure-framed engineering bay, crew lounge and cabins, panoramic bridge, two real staircases, emissive consoles and enclosed bulkheads. Native 3D interior inspired by the supplied reference.','meshes':b.parts,'pivots':{'body':[0,0,0]},'decks':3}
(root/'work/ship_interior_model.js').write_text('const ShipInteriorModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8');g.PIVOTS={'body':[0,0,0]};g.export_glb(model,'NOSTRAVECTOR_Vanguard_Interior.glb');print('Built interior:',len(b.parts),'mesh parts, three decks and two staircases.')
