from pathlib import Path
import json,math,shutil
import numpy as np
work=Path(__file__).resolve().parent
source=Path('C:/Users/HOME/Documents/Codex/2026-10-10/make/work/build_astronaut.py').read_text(encoding='utf-8')
scope={'np':np,'math':math};exec(source[source.index('parts = []'):source.index('# +Y is up.')],scope)
shape,limb,tube=scope['shape'],scope['limb'],scope['tube']
shape('Puffer body',[0,1.19,0],[.247,.275,.163],'coat',.60)
for j,y in enumerate([.99,1.09,1.19,1.29,1.39]):
    shape('Quilted body '+str(j),[0,y,0],[.25 if j<4 else .226,.066,.171],'coat',.62,n=24,m=10)
tube('Coat zip',[[0,.925,.175],[0,1.45,.175]],.006,'zip',n=8)
shape('Collar',[0,1.448,0],[.126,.06,.113],'coat',.55)
shape('Pants hips',[0,.862,0],[.201,.116,.14],'pants',.55)
for s,tag in [(1,'L'),(-1,'R')]:
    a=[s*.27,1.34,0];b=[s*.313,1.075,0];c=[s*.326,.826,.012]
    limb(tag+' upperArm',a,b,.115,.114,'coat',.70)
    limb(tag+' lowerArm',b,c,.101,.103,'coat',.70)
    for j,y in enumerate([1.32,1.23,1.14]):shape(tag+' upperArm quilt '+str(j),[s*(.27+(1.34-y)*.16),y,0],[.117,.064,.115],'coat',.7,n=20,m=10)
    for j,y in enumerate([1.04,.95,.865]):shape(tag+' lowerArm quilt '+str(j),[s*.324,y,.006],[.105,.06,.109],'coat',.7,n=20,m=10)
    shape(tag+' lowerArm cuff',[s*.327,.824,.012],[.088,.027,.094],'glove',.5,n=20,m=10)
    shape(tag+' lowerArm glove',[s*.331,.767,.016],[.079,.087,.065],'glove',.65,n=20,m=12)
    shape(tag+' lowerArm thumb',[s*.277,.776,.055],[.036,.057,.035],'glove',.7,n=16,m=10)
    limb(tag+' thigh',[s*.112,.83,0],[s*.129,.47,0],.105,.112,'pants',.62)
    limb(tag+' shin',[s*.129,.47,0],[s*.14,.14,.015],.099,.10,'pants',.64)
    shape(tag+' foot boot',[s*.145,.09,.066],[.115,.085,.174],'boot',.43,n=24,m=12)
    shape(tag+' foot sole',[s*.145,.023,.067],[.122,.023,.182],'glove',.35,n=24,m=8)
    shape(tag+' foot toe',[s*.145,.075,.176],[.106,.057,.078],'boot',.5,n=20,m=10)
face=json.loads((work/'face_parts.json').read_text(encoding='utf-8'))
body=[]
colors={'coat':'#300809','zip':'#160507','pants':'#190a09','glove':'#0b0e12','boot':'#24130e'}
for q in scope['parts']:
    name=q['name'];bone=next((name.split()[0]+'-'+k for k in ['upperArm','lowerArm','thigh','shin','foot'] if k in name),'body')
    h=colors[q['mat']];color=[int(h[i:i+2],16)/255 for i in [1,3,5]]
    body.append(dict(name=name,p=q['p'].round(6).tolist(),n=q['n'].round(6).tolist(),f=q['f'].flatten().tolist(),c=color,bone=bone))
for group in ['head','hair_swept','eyes_relaxed','mouth_neutral','ears_rounded']:
    body.extend([{**q,'bone':'body'} for q in face[group]])
(work/'james_parts.json').write_text(json.dumps(body,separators=(',',':')),encoding='utf-8')
assets=work/'antarctica-assets';assets.mkdir(exist_ok=True)
shutil.copyfile('C:/Users/HOME/Documents/NOSTRAVECTOR/0707f634-6946-4807-a2b5-d064c9db0b70.jfif',assets/'sky.jpg')
shutil.copyfile('C:/Users/HOME/Documents/NOSTRAVECTOR/snow.jfif',assets/'snow.jpg')
print('Built James Brown:',len(body),'mesh parts; copied original sky and snow textures.')
