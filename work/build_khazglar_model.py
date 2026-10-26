"""Khazglar: original articulated bronze mountain guardian, native mesh geometry."""
from pathlib import Path
import json, math
import build_pontifex_model as geometry
from build_pontifex_model import Builder, PIVOTS, mirror, cross
ROOT=Path(__file__).resolve().parents[1]
b=Builder()
BRONZE='#604934'; GOLD='#ac8554'; DARK='#171b18'; IRON='#393c36'; ORANGE='#ffae42'; CLOTH='#272b1c'
b.oval('Padded dark leather torso',[0,2.62,0],[.57,.73,.33],DARK,e=.64,rows=12,cols=24)
b.oval('Leather pelvis',[0,1.88,0],[.49,.30,.32],DARK,e=.6)
b.oval('Segmented bronze gorget',[0,3.35,0],[.28,.17,.28],GOLD,e=.48)
for side in [-1,1]:
 tag='Left' if side<0 else 'Right'; arm='leftArm' if side<0 else 'rightArm'; leg='leftLeg' if side<0 else 'rightLeg';x=side*.36
 b.tube(tag+' flexible leg',[[x,1.9,0],[x,1.15,0],[x,.30,0]],[.25,.22,.17],DARK,leg,sides=16)
 b.oval(tag+' worn boot',[x,.20,.17],[.29,.22,.44],BRONZE,leg,e=.42)
 b.oval(tag+' tread sole',[x,.055,.18],[.31,.054,.46],DARK,leg,e=.4)
 for i in range(5):b.oval(tag+' boot tread '+str(i),[x,.042,-.1+i*.13],[.315,.025,.028],IRON,leg,e=.4,rows=4,cols=8)
 for label,poly,z in [('shin',[[.16,.32],[.15,.94],[.29,1.17],[.56,1.10],[.63,.35],[.40,.22]],.25),('knee',[[.13,1.12],[.13,1.40],[.39,1.54],[.65,1.38],[.62,1.15],[.38,1.04]],.32),('thigh',[[.16,1.40],[.13,1.91],[.42,2.01],[.68,1.85],[.61,1.44],[.36,1.32]],.28)]:
  b.plate(tag+' '+label+' bronze armour',mirror(poly,side),z,BRONZE,leg,.10)
  for i in range(3):b.tube(tag+' '+label+' engraved gold chevron '+str(i),[[side*.24,poly[0][1]+.13+i*.075,z+.067],[side*.39,poly[0][1]+.07+i*.075,z+.073],[side*.53,poly[0][1]+.13+i*.075,z+.067]],.011,GOLD,leg,sides=6)
 for i in range(8):b.bolt(tag+' greave rivet '+str(i),side*(.19 if i%2 else .57),.42+(i//2)*.18,.32,leg)
 b.tube(tag+' arm leather',[[side*.65,3.15,0],[side*.85,2.67,.06],[side*.95,2.20,.23]],[.26,.20,.16],DARK,arm,sides=16)
 b.oval(tag+' pauldron bronze shell',[side*.77,3.12,0],[.47,.31,.39],BRONZE,arm,e=.52,rows=10,cols=20)
 b.plate(tag+' shoulder shield',mirror([[.42,2.96],[.43,3.26],[.70,3.42],[1.07,3.31],[1.20,3.03],[.90,2.83]],side),.28,BRONZE,arm,.10)
 for k in range(2):
  for i in range(18):
   a=i/17*math.pi*2;c=i/18*math.pi*2+.35
   b.tube(tag+' shoulder filigree '+str(k)+'-'+str(i),[[side*(.81+(.16+k*.055)*math.cos(a)),3.12+(.13+k*.04)*math.sin(a),.352],[side*(.81+(.16+k*.055)*math.cos(c)),3.12+(.13+k*.04)*math.sin(c),.352]],.008,GOLD,arm,sides=5)
 b.tube(tag+' swept shoulder horn',[[side*.97,3.25,-.05],[side*1.16,3.43,-.03],[side*1.25,3.70,.01],[side*1.18,3.92,.06]],[.15,.11,.06,.003],GOLD,arm,sides=14)
 for i in range(3):b.oval(tag+' upper arm layered plate '+str(i),[side*.80,2.91-i*.14,.045],[.28,.11,.25],BRONZE,arm,e=.48)
 b.oval(tag+' elbow bearing',[side*.88,2.55,.08],[.22,.21,.25],IRON,arm,e=.55)
 b.plate(tag+' engraved forearm vambrace',mirror([[.73,2.16],[.69,2.57],[.89,2.72],[1.08,2.51],[1.10,2.18],[.91,2.08]],side),.30,BRONZE,arm,.085)
 for i in range(4):b.tube(tag+' vambrace scroll '+str(i),[[side*(.84+.05*math.cos(t)),2.36+.05*math.sin(t)+i*.04,.36] for t in [j/12*math.pi*1.8 for j in range(13)]],.008,GOLD,arm,sides=5)
 b.oval(tag+' armoured glove',[side*.94,2.13,.24],[.20,.20,.19],DARK,arm,e=.6)
 for i in range(4):b.oval(tag+' individual gauntlet finger '+str(i),[side*(.83+i*.065),2.06,.38],[.039,.12,.054],BRONZE,arm,e=.65,rows=5,cols=8)
 for i in range(4):b.poly(tag+' tattered cloak panel '+str(i),[[side*(.10+i*.18),3.1],[side*(.32+i*.20),3.04],[side*(.54+i*.17),.30+.14*(i%2)],[side*(.45+i*.17),.40],[side*(.30+i*.17),.20],[side*(.14+i*.18),.36]],-.37-i*.022,.028,CLOTH,'cape',.008)
 for i in range(8):b.tube(tag+' cloak frayed seam '+str(i),[[side*(.15+i*.055),2.7,-.49],[side*(.22+i*.075),1.3,-.50],[side*(.27+i*.08),.45,-.50]],.008,'#665f3e','cape',sides=5)
# Breastplate with a branching orange sigil rather than the enemy boss's reactor.
b.plate('Large ornate bronze breastplate',[[-.55,2.55],[-.58,3.10],[-.30,3.31],[0,3.20],[.30,3.31],[.58,3.10],[.55,2.55],[0,2.31]],.30,BRONZE,'body',.12)
b.plate('Recessed chest shield',[[-.31,2.69],[-.33,3.06],[0,3.14],[.33,3.06],[.31,2.69],[0,2.48]],.40,DARK,'body',.045)
for pts in [[[0,2.56,.457],[0,2.77,.46],[-.11,2.92,.46],[-.18,3.04,.46]],[[0,2.77,.46],[.15,2.94,.46],[.19,3.07,.46]],[[0,2.81,.46],[.02,2.98,.46],[-.07,3.08,.46]]]:b.tube('Ember branching chest sigil',pts,[.019]*len(pts),ORANGE,emission=.7,sides=8)
for i in range(4):b.oval('Abdominal bronze lamella '+str(i),[0,2.51-i*.12,.15],[.43-i*.022,.078,.25],BRONZE,e=.42)
b.oval('Heavy leather equipment belt',[0,1.99,.04],[.56,.13,.37],DARK,e=.4)
b.plate('Square bronze belt buckle',[[-.14,1.88],[-.14,2.14],[.14,2.14],[.14,1.88]],.44,GOLD)
for x in [-.43,-.28,.28,.43]:b.oval('Belt supply pouch',[x,1.97,.35],[.095,.16,.085],BRONZE,e=.4)
# Closed helmet, deep recessed visor, tall antler crown.
b.oval('Faceted bronze helmet shell',[0,3.73,0],[.30,.41,.30],BRONZE,'head',e=.7,rows=12,cols=24)
b.plate('Helmet sculpted face guard',[[-.28,3.43],[-.29,3.94],[-.16,4.08],[0,4.19],[.16,4.08],[.29,3.94],[.28,3.43],[0,3.33]],.225,BRONZE,'head',.07)
for side in [-1,1]:
 b.poly('Deep visor opening',mirror([[.035,3.88],[.25,3.95],[.23,3.77],[.12,3.71],[.065,3.46]],side),.277,.018,'#050907','head',.007)
 b.tube('Amber visor rim',[[side*.055,3.86,.293],[side*.22,3.92,.29]],.009,GOLD,'head',sides=6)
 for k in [0,1]:
  x=side*(.21+k*.11)
  pts=[[x,3.96,-.02],[side*(.43+k*.12),4.17,-.02],[side*(.49+k*.12),4.49,.02],[side*(.37+k*.20),4.76+.10*k,.09],[side*(.34+k*.28),5.07+.17*k,.11]]
  b.tube('Crown antler '+str(side)+'-'+str(k),pts,[.13,.115,.07,.04,.002],GOLD,'head',sides=14)
  b.tube('Forked antler spur '+str(side)+'-'+str(k),[pts[2],[side*(.68+k*.12),4.52,.03],[side*(.75+k*.13),4.77,.07]],[.065,.04,.002],BRONZE,'head',sides=12)
b.tube('Raised nasal helmet ridge',[[0,3.40,.32],[0,3.87,.34],[0,4.16,.20]], [.026,.04,.016],GOLD,'head',sides=10)
# Horizontal two-handed warhammer, suspended across the front.
b.tube('Long wrapped hammer shaft',[[-1.54,2.12,.54],[1.60,2.12,.54]],.058,'#554332','weapon',sides=16)
for i in range(44):
 x=-1.35+i*.064
 b.tube('Spiral hammer grip '+str(i),[[x+.022*math.cos(t),2.12+.061*math.sin(t),.54+.061*math.cos(t)] for t in [j/8*math.pi*2 for j in range(9)]],.007,'#b59a6e','weapon',sides=5)
b.oval('Massive forged hammer head',[-1.57,2.16,.54],[.28,.47,.25],BRONZE,'weapon',e=.25,rows=10,cols=16)
b.plate('Hammer engraved striking face',[[-1.81,1.75],[-1.81,2.57],[-1.33,2.57],[-1.33,1.75]],.79,GOLD,'weapon',.075)
b.poly('Hammer central dark inset',[[-1.75,1.83],[-1.75,2.49],[-1.39,2.49],[-1.39,1.83]],.837,.02,DARK,'weapon')
for i in range(3):b.tube('Hammer engraved diamonds '+str(i),[[-1.57,1.89+i*.18,.861],[-1.71,1.98+i*.18,.861],[-1.57,2.07+i*.18,.861],[-1.43,1.98+i*.18,.861],[-1.57,1.89+i*.18,.861]],.011,GOLD,'weapon',sides=6)
b.oval('Hammer ember rune',[-1.57,2.16,.883],[.075,.075,.015],ORANGE,'weapon',rows=6,cols=12,emission=.75)
# Ensure winding is consistent with generated normals.
for q in b.parts:
 faces=[]
 for j in range(0,len(q['indices']),3):
  ids=q['indices'][j:j+3];p=[q['p'][i*3:i*3+3] for i in ids];n=cross([p[1][k]-p[0][k] for k in range(3)],[p[2][k]-p[0][k] for k in range(3)])
  if sum(v*v for v in n)<1e-20:continue
  if sum(n[k]*sum(q['n'][i*3+k] for i in ids) for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
  faces+=ids
 q['indices']=faces
model={'name':'Khazglar','meshes':b.parts,'pivots':PIVOTS,'height':5.24,'design':'Bronze antler crown, engraved mountain armour, tattered moss cloak and ember warhammer.'}
(ROOT/'work/khazglar_model.js').write_text('const KhazglarModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
# Export the same articulated meshes without changing any existing character assets.
geometry.export_glb(model, 'NOSTRAVECTOR_Khazglar.glb')
print('Khazglar:',len(b.parts),'mesh parts;',sum(len(q['indices'])//3 for q in b.parts),'triangles')
