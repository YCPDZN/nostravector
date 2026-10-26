"""Build Orion's cartoon armour around the same articulated body as James."""
from pathlib import Path
import json, math, copy
root=Path(__file__).resolve().parents[1]
work=root/'work'
parts=[]
def color(h): return [int(h[i:i+2],16)/255 for i in (1,3,5)]
def add(name,p,n,f,c,bone='body'):
    parts.append(dict(name=name,p=p,n=n,f=f,c=color(c),bone=bone))
def oval(name,center,size,c,bone='body',rows=10,cols=20):
    p=[];n=[];f=[]
    for i in range(rows+1):
        t=i/rows*math.pi
        for j in range(cols+1):
            a=j/cols*math.tau; v=[math.sin(t)*math.cos(a),math.cos(t),math.sin(t)*math.sin(a)]
            p.append([round(center[k]+size[k]*v[k],6) for k in range(3)])
            normal=[v[k]/size[k] for k in range(3)];length=math.hypot(*normal);n.append([q/length for q in normal])
    for i in range(rows):
        for j in range(cols):
            a=i*(cols+1)+j;b=a+cols+1;f.extend([a,a+1,b,a+1,b+1,b])
    add(name,p,n,f,c,bone)
def polygon(name,vertices,c,bone='body'):
    p=[];n=[];f=[]
    for i in range(1,len(vertices)-1):
        v=[vertices[0],vertices[i],vertices[i+1]];a=[v[1][k]-v[0][k] for k in range(3)];b=[v[2][k]-v[0][k] for k in range(3)]
        normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];length=math.hypot(*normal) or 1;normal=[q/length for q in normal]
        base=len(p);p.extend(v+list(reversed(v)));n.extend([normal]*3+[[-q for q in normal]]*3);f.extend(range(base,base+6))
    add(name,p,n,f,c,bone)
def spike(name,base,tip,r,c,bone):
    dx=[tip[k]-base[k] for k in range(3)];length=math.hypot(*dx);d=[q/length for q in dx]
    u=[d[1],-d[0],0] if abs(d[2])<.9 else [0,d[2],-d[1]];l=math.hypot(*u);u=[q/l for q in u];v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]
    for j in range(6):
        a=j/6*math.tau;b=(j+1)/6*math.tau
        polygon(name+str(j),[[base[k]+r*(u[k]*math.cos(a)+v[k]*math.sin(a)) for k in range(3)],[base[k]+r*(u[k]*math.cos(b)+v[k]*math.sin(b)) for k in range(3)],tip],c,bone)

# Preserve James's facial language, limb pivots and outline silhouette.
for source in json.loads((work/'james_parts.json').read_text(encoding='utf-8')):
    q=copy.deepcopy(source);name=q['name'];mat=q.pop('mat',None)
    if 'quilt' in name.lower() or name in ['Coat zip','Swept fringe','Swept crown']:continue
    h={'skin':'#d2a77d','ear_inner':'#ad745c','hair':'#596369','iris':'#88b6a6','white':'#eef1e7','black':'#14191d'}.get(mat)
    if not h:h='#151b22' if any(v in name.lower() for v in ['pants','glove','sole','collar']) else '#292d34'
    q['c']=color(h);parts.append(q)
steel='#59636a';edge='#30171d';red='#643038';dark='#1b2229';gold='#e89548'
oval('Armour waist',(0,.94,0),(.22,.105,.157),dark)
for s,tag in [(1,'L'),(-1,'R')]:
    # Black rims make broad, simplified plates read at game scale.
    for name,center,size,bone in [
        ('chest',(s*.115,1.29,.157),(.132,.168,.041),'body'),
        ('shoulder',(s*.28,1.385,0),(.157,.105,.154),tag+'-upperArm'),
        ('forearm',(s*.324,.99,.059),(.107,.132,.075),tag+'-lowerArm'),
        ('thigh',(s*.117,.693,.082),(.114,.148,.051),tag+'-thigh'),
        ('knee',(s*.13,.475,.086),(.113,.09,.054),tag+'-shin'),
        ('shin',(s*.139,.29,.085),(.1,.129,.046),tag+'-shin'),
        ('boot',(s*.145,.09,.125),(.118,.087,.151),tag+'-foot')]:
        oval(tag+' '+name+' dark rim',center,[size[0]*1.055,size[1]*1.055,size[2]*.8],edge,bone)
        oval(tag+' '+name+' plate',(center[0],center[1]+.003,center[2]+.007),[v*.96 for v in size],steel,bone)
    for y in [1.08,1.16]:oval(tag+' abdominal segmented plate',(s*.09,y,.158),(.096,.046,.046),red)
    for i in range(3):
        x=s*(.255+i*.05); spike(tag+' shoulder spike ',[x,1.45,-.03],[x+s*.055,1.55+(i%2)*.07,-.03],.025,steel,tag+'-upperArm')
    oval(tag+' pauldrons rivet',(s*.29,1.423,.153),(.012,.012,.008),gold,tag+'-upperArm')
    oval(tag+' chest reactor vent',(s*.142,1.25,.203),(.047,.013,.008),gold)
    oval(tag+' belt utility pouch',(s*.15,.923,.175),(.048,.064,.037),dark)
    oval(tag+' cheek beard',(s*.105,1.509,.132),(.064,.08,.075),'#505a5b')
    for i in range(3):oval(tag+' beard strand'+str(i),(s*(.06+i*.03),1.48,.174),(.016,.045,.018),'#7b8380')
    # Separate leg panels keep the torn cape clear of animated boots.
    polygon(tag+' torn cape',[[s*.18,1.37,-.19],[s*.32,1.21,-.20],[s*.40,.28,-.24],[s*.31,.35,-.24],[s*.29,.21,-.24],[s*.20,.29,-.24],[s*.15,.19,-.24],[s*.045,.31,-.24],[s*.05,1.25,-.20]],'#252d31')
    polygon(tag+' cape russet lining',[[s*.285,1.20,-.207],[s*.37,.36,-.247],[s*.31,.40,-.247],[s*.23,1.17,-.207]],'#633b2c')
oval('Grey beard chin',(0,1.44,.118),(.109,.056,.08),'#56605f')
oval('Full beard below lower lip',(0,1.482,.153),(.099,.047,.053),'#56605f')
for x in [-.06,-.03,0,.03,.06]:oval('Central beard strand '+str(x),(x,1.462,.19),(.011,.037,.013),'#7b8380')
for s in [-1,1]:oval('Moustache '+str(s),(s*.039,1.579,.192),(.043,.012,.020),'#66706e')
for i in range(7):oval('Short brushed hair '+str(i),(-.13+i*.043,1.887,-.012),(.035,.060,.138),'#758080')
oval('Cybernetic eye housing',(-.076,1.704,.211),(.071,.043,.014),dark)
oval('Cybernetic eye lens',(-.076,1.704,.228),(.036,.027,.009),'#9ad4d9')
oval('Cybernetic eye indicator',(-.12,1.704,.226),(.009,.009,.004),gold)
polygon('Cybernetic temple strap',[[-.19,1.735,.137],[-.12,1.724,.209],[-.12,1.697,.209],[-.20,1.701,.134]],steel)
oval('Chest amber insignia',(.113,1.37,.197),(.024,.024,.008),gold)
oval('Belt cyan terminal',(-.052,.945,.183),(.025,.042,.014),'#70ced1')
oval('Belt central clasp',(.028,.945,.181),(.039,.032,.025),steel)
(work/'orion_parts.json').write_text(json.dumps(parts,separators=(',',':')),encoding='utf-8')
print(f'Built Orion Mascar: {len(parts)} articulated cartoon mesh parts.')
