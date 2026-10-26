"""Geometric queen: a pleated gown, embroidered mantle, braided updo and sceptre."""
from pathlib import Path
import json, math, copy, struct, re
root=Path(__file__).resolve().parents[1]; work=root/'work'; parts=[]
def rgb(h): return [int(h[i:i+2],16)/255 for i in (1,3,5)]
def add(name,p,n,f,c,bone='body'): parts.append(dict(name=name,p=p,n=n,f=f,c=rgb(c),bone=bone))
def oval(name,center,size,c,bone='body',rows=9,cols=16):
    p=[];n=[];f=[]
    for i in range(rows+1):
        t=i/rows*math.pi
        for j in range(cols+1):
            a=j/cols*math.tau;v=[math.sin(t)*math.cos(a),math.cos(t),math.sin(t)*math.sin(a)]
            p.append([center[k]+size[k]*v[k] for k in range(3)]);normal=[v[k]/size[k] for k in range(3)];l=math.hypot(*normal);n.append([q/l for q in normal])
    for i in range(rows):
        for j in range(cols):
            a=i*(cols+1)+j;b=a+cols+1;f.extend([a,a+1,b,a+1,b+1,b])
    add(name,p,n,f,c,bone)
def cloth(name,levels,c,start=0,end=math.tau,pleats=.01):
    p=[];n=[];f=[];cols=64
    for i,(y,rx,rz,oz) in enumerate(levels):
        for j in range(cols+1):
            a=start+(end-start)*j/cols;r=1+pleats*math.cos(a*16);p.append([math.sin(a)*rx*r,y,math.cos(a)*rz*r+oz]);n.append([v/math.sqrt(1.0225) for v in [math.sin(a),.15,math.cos(a)]])
    for i in range(len(levels)-1):
        for j in range(cols):
            a=i*(cols+1)+j;b=a+cols+1;f.extend([a,a+1,b,a+1,b+1,b])
    add(name,p,n,f,c)
def rod(name,a,b,r,c,bone='body'):
    d=[b[k]-a[k] for k in range(3)];l=math.hypot(*d);d=[v/l for v in d];u=[d[1],-d[0],0] if abs(d[2])<.9 else [0,d[2],-d[1]];l=math.hypot(*u);u=[v/l for v in u];v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];p=[];n=[];f=[]
    for base in [a,b]:
        for i in range(9):
            angle=i/8*math.tau;normal=[u[k]*math.cos(angle)+v[k]*math.sin(angle) for k in range(3)];p.append([base[k]+r*normal[k] for k in range(3)]);n.append(normal)
    for i in range(8):f.extend([i,i+1,i+9,i+1,i+10,i+9])
    add(name,p,n,f,c,bone)
skin='#ebcdbd';silver='#b0bfce';white='#f1f0eb';deep='#7f92a8'
# Use the existing cartoon facial proportions, with a softer jaw and taller eyes.
for source in json.loads((work/'james_parts.json').read_text(encoding='utf-8')):
    if not source.get('mat') or source['mat']=='hair':continue
    q=copy.deepcopy(source);mat=q.pop('mat');q['c']=rgb({'skin':skin,'white':'#fffaf2','black':'#33313a','iris':'#718cae','ear_inner':'#cf9e96'}[mat]);
    for p in q['p']:
        p[0]*=.88
        if q['name']=='Jaw':p[0]*=.86
    parts.append(q)
oval('Silver hair silhouette',(0,1.78,-.085),(.19,.22,.15),'#d5d9dc')
oval('Braided royal bun',(0,2.004,-.068),(.116,.093,.09),'#e8e7e0')
for side in [-1,1]:
    for i in range(10):
        a=i/9*2.0;oval('Crown braid', (side*(.17*math.cos(a*.48)),1.84+math.sin(a)*.12,-.06+.073*math.cos(a)),(.032,.026,.025),'#f0efe9')
    for i in range(12):
        oval('Long twisted braid',(side*(.157+.015*math.sin(i*2)),1.77-i*.035,.102),(.028,.030,.027),'#d8dee4')
    oval('Pearl earring',(side*.18,1.59,.049),(.017,.035,.019),silver)
    rod('Brow',(side*.045,1.76,.199),(side*.113,1.758,.175),.006,deep)
    oval('Fitted sleeve',(side*.245,1.27,0),(.075,.16,.073),white)
    oval('Forearm sleeve',(side*.285,1.04,.018),(.064,.13,.065),white)
    oval('Ivory cuff',(side*.285,.936,.025),(.075,.03,.072),silver)
    oval('Hand',(side*.286,.89,.043),(.048,.067,.048),skin)
    oval('Thumb',(side*.246,.895,.067),(.021,.034,.026),skin)
    oval('Silver slipper',(side*.14,.065,.072),(.09,.065,.16),silver)
oval('Corseted bodice',(0,1.19,0),(.192,.22,.128),white)
cloth('Sixteen pleat bell gown',[(.10,.43,.33,0),(.27,.38,.285,0),(.68,.28,.19,0),(.96,.19,.125,0),(1.09,.177,.121,0)],white,pleats=.065)
oval('Ornate silver waist girdle',(0,1.08,.003),(.181,.025,.129),silver)
cloth('Trailing winter mantle',[(.075,.55,.51,-.08),(.4,.45,.37,-.04),(1.0,.28,.17,-.04),(1.42,.225,.13,-.04)],'#e0e5e9',.76,math.tau-.76,pleats=.035)
for side in [-1,1]:
    for i in range(19):
        t=i/18;x=side*(.17+.27*t);y=1.41-1.31*t;z=.052+.15*t
        oval('Soft ermine trim',(x,y,z),(.039,.042,.025),'#fcfaf1',rows=6,cols=10)
    oval('Etched shoulder clasp',(side*.195,1.42,.077),(.064,.048,.039),silver)
    for i in range(8):
        y=.25+i*.085;r=.40-(y-.10)*.26;z=(.33-(y-.10)*.25)+.01
        oval('Gown embroidered vine',(side*(.038+.025*math.sin(i*.8)),y,z),(.023,.022,.006),silver,rows=6,cols=8)
        oval('Silver petal',(side*(.082+.04*math.sin(i*.6)),y+.02,z-.005),(.032,.016,.006),'#bdcad5',rows=6,cols=8)
    rod('Front bodice filigree',(side*.06,1.04,.133),(side*.105,1.32,.113),.006,silver)
    for i in range(7):
        a=i/6*math.pi;oval('Pearl necklace',(side*.088*math.sin(a),1.48-.04*math.sin(a),.126),(.009,.009,.009),'#e9f4ff',rows=5,cols=8)
for i in range(11):
    a=-1.45+i/10*2.9;x=.172*math.sin(a);z=.102*math.cos(a)
    rod('Crown circlet',(x,1.963,z),(x,2.002+(1-abs(a)/1.45)*.04,z),.006,silver)
    oval('Crown sapphire',(x,2.008+(1-abs(a)/1.45)*.04,z),(.009,.014,.01),'#b4e8ff',rows=6,cols=8)
rod('Silver sceptre',(.33,.12,.13),(.33,1.63,.13),.012,silver)
oval('Sceptre crystal',(.33,1.71,.13),(.027,.07,.026),'#a6e0f4')
for i in range(6):
    a=i/6*math.tau;rod('Sceptre snowflake prong',(.33,1.68,.13),(.33+.056*math.cos(a),1.72+.056*math.sin(a),.13),.006,silver)
(work/'vishara_parts.json').write_text(json.dumps(parts,separators=(',',':')),encoding='utf-8')
# Export the exact game meshes as an editable glTF binary.
blob=bytearray();views=[];accessors=[];meshes=[];materials=[];nodes=[{'name':'Vishara Erisconos / Queen of Eris and Dysnomia','children':[]}]
def array(v,fmt,ct,typ,count,target,bounds=False):
    while len(blob)%4:blob.append(0)
    off=len(blob);blob.extend(struct.pack('<'+fmt*len(v),*v));views.append({'buffer':0,'byteOffset':off,'byteLength':len(blob)-off,'target':target});a={'bufferView':len(views)-1,'componentType':ct,'count':count,'type':typ}
    if bounds:a.update(min=[min(v[i::3]) for i in range(3)],max=[max(v[i::3]) for i in range(3)])
    accessors.append(a);return len(accessors)-1
for q in parts:
    pi=array([v for p in q['p'] for v in p],'f',5126,'VEC3',len(q['p']),34962,True);ni=array([v for p in q['n'] for v in p],'f',5126,'VEC3',len(q['n']),34962);fi=array(q['f'],'H',5123,'SCALAR',len(q['f']),34963)
    materials.append({'name':q['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':q['c']+[1],'metallicFactor':.15,'roughnessFactor':.7}});meshes.append({'name':q['name'],'primitives':[{'attributes':{'POSITION':pi,'NORMAL':ni},'indices':fi,'material':len(materials)-1}]});nodes[0]['children'].append(len(nodes));nodes.append({'name':q['name'],'mesh':len(meshes)-1})
gltf={'asset':{'version':'2.0','generator':'NOSTRAVECTOR geometric character builder'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
raw=json.dumps(gltf,separators=(',',':')).encode();raw+=b' '*(-len(raw)%4);blob+=b'\0'*(-len(blob)%4);glb=struct.pack('<III',0x46546c67,2,28+len(raw)+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob
(root/'outputs/NOSTRAVECTOR_Vishara_Erisconos.glb').write_bytes(glb)
viewer=(root/'outputs/NOSTRAVECTOR_3D_Viewer.html').read_text(encoding='utf-8')
viewer=re.sub(r'const parts=.*?;\nconst canvas',lambda m:'const parts='+json.dumps(parts,separators=(',',':'))+';\nconst canvas',viewer,flags=re.S)
viewer=viewer.replace('Cartoon astronaut · A-pose template','VISHARA ERISCONOS · Queen of Eris & Dysnomia').replace('Character template','Vishara Erisconos').replace('3D astronaut','3D queen').replace('NOSTRAVECTOR_Astronaut.glb','NOSTRAVECTOR_Vishara_Erisconos.glb').replace('let sy=.87*zoom','let sy=.80*zoom').replace('outline?.008:0','outline?.0015:0')
(root/'outputs/NOSTRAVECTOR_Vishara_Viewer.html').write_text(viewer,encoding='utf-8')
print('Built and exported Vishara:',len(parts),'mesh parts,',len(glb),'bytes')
