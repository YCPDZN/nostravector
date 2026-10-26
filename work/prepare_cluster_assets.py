"""Build seeded fictional planet maps offline, so map opening stays responsive."""
from pathlib import Path
import json, subprocess
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
code="""const fs=require('fs'),vm=require('vm'),c=vm.createContext({Math,Number,JSON,Map,Set});for(const f of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','galaxy_core.js','cluster_core.js'])vm.runInContext(fs.readFileSync('work/'+f,'utf8'),c);process.stdout.write(vm.runInContext('JSON.stringify({systems:NVCluster.generated.map(q=>NVCluster.meta[q.id]),worlds:Object.values(NVCluster.bodyLists).flat().map(b=>({...b,profile:NVLandscapes.profile(b.id)}))})',c));"""
catalog=json.loads(subprocess.run(['node','-e',code],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',check=True).stdout)
(ROOT/'work/cluster_catalog.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False),encoding='utf-8')
folder=ROOT/'work/cluster-assets';folder.mkdir(exist_ok=True)
expected={b['id'] for b in catalog['worlds']}
for obsolete in folder.glob('cluster-*-p*.jpg'):
 if obsolete.stem not in expected:obsolete.unlink()
w,h=512,256
lon,lat=np.meshgrid(np.linspace(0,2*np.pi,w,endpoint=False),np.linspace(-np.pi/2,np.pi/2,h))
x,y,z=np.cos(lat)*np.cos(lon),np.sin(lat),np.cos(lat)*np.sin(lon)
for index,b in enumerate(catalog['worlds']):
 p=b['profile'];t=.37+index*1.731
 field=np.sin(x*9+y*7+t)*np.cos(z*11-y*5+t*.8)+.4*np.sin(x*23+z*17+t*2)+.12*np.cos(x*71-y*37+z*43+t)
 color=np.array(b['color']);accent=np.array(p['accent']);brightness=.72+.24*np.clip(field*.4+.5,0,1)
 rgb=brightness[...,None]*color
 if b['giant']:
  bands=.55+.23*np.sin(lat*29+np.sin(lon*3+t)*.4)+.12*np.sin(lat*67+t)
  rgb=bands[...,None]*color+.18*np.sin(lat*17+t)[...,None]**2*accent
 elif b['category']=='Paradise planet':
  coast=field>.1;land=rgb+.09*np.maximum(0,field)[...,None]*accent
  water=np.stack([.035+.02*(field+1),.12+.04*(field+1),.23+.04*(field+1)],axis=-1)
  rgb=np.where(coast[...,None],land,water)
  poles=np.clip((np.abs(y)-.84)*5,0,.8)
  rgb=rgb*(1-poles[...,None])+poles[...,None]*np.array([.81,.87,.88])
 elif b['category']=='Frozen planet':
  cracks=np.abs(np.sin(x*27+z*35+t))<.09
  rgb=.30*rgb+.61*np.array([.73,.83,.89])+field[...,None]*.055
  rgb=np.where(cracks[...,None],rgb*.58,rgb)
 elif b['category']=='Scorched planet':
  lava=(np.abs(np.sin(x*41+z*37+t)+np.cos(y*29+t))<.065)
  rgb=np.where(lava[...,None],np.array([1,.31,.025]),rgb*.72)
 elif b['category']=='Ravaged planet':
  canyons=np.abs(np.sin(x*31+z*19+t))<.2
  rgb=np.where(canyons[...,None],rgb*.48,rgb)
 else:
  craters=np.cos(x*34+t)*np.sin(z*39+t)*np.cos(y*22-t)
  rgb*= (.77+.20*craters)[...,None]
 if b['atmosphere'] and not b['giant']:
  cloud=np.clip((np.sin(x*17+y*12+t)+np.cos(z*19-y*8-t)-1.27)*.22,0,.28)
  rgb=rgb*(1-cloud[...,None])+cloud[...,None]*np.array([.82,.83,.85])
 Image.fromarray(np.uint8(np.clip(rgb,0,1)*255)).save(folder/(b['id']+'.jpg'),quality=88,optimize=True)
print('Prepared',len(catalog['worlds']),'fictional globe maps across',len(catalog['systems']),'systems; Sol and Janira assets unchanged.')
