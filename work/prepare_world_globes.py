"""Reproject existing NASA horizontal cube-cross maps for spherical flight. No downloads."""
from pathlib import Path
from PIL import Image
import numpy as np,json
root=Path(__file__).resolve().parent/'sol-assets'
for name,item in json.loads((root/'sources.json').read_text(encoding='utf-8')).items():
 if not item.get('images') or name=='earth':continue
 im=Image.open(root/(name+'-web.jpg')).convert('RGB');src=np.asarray(im);h,w=src.shape[:2]
 if abs(w/h-4/3)>.03:continue
 # Standard horizontal cross: -X,+Z,+X,-Z with +Y/-Y above/below +Z.
 ow,oh=1536,768
 lon=(np.arange(ow)+.5)/ow*2*np.pi-np.pi;lat=np.pi/2-(np.arange(oh)+.5)/oh*np.pi
 x=np.cos(lat)[:,None]*np.cos(lon)[None,:];y=np.sin(lat)[:,None]*np.ones((1,ow));z=np.cos(lat)[:,None]*np.sin(lon)[None,:]
 major=np.argmax(np.stack([abs(x),abs(y),abs(z)]),axis=0);u=np.zeros((oh,ow));v=u.copy();cx=u.copy();cy=u.copy()
 def face(mask,a,b,col,row):
  u[mask]=a[mask];v[mask]=b[mask];cx[mask]=col;cy[mask]=row
 ax,ay,az=np.maximum(abs(x),1e-8),np.maximum(abs(y),1e-8),np.maximum(abs(z),1e-8)
 face((major==0)&(x>0),-z/ax,-y/ax,2,1);face((major==0)&(x<=0),z/ax,-y/ax,0,1)
 face((major==1)&(y>0),x/ay,z/ay,1,0);face((major==1)&(y<=0),x/ay,-z/ay,1,2)
 face((major==2)&(z>0),x/az,-y/az,1,1);face((major==2)&(z<=0),-x/az,-y/az,3,1)
 sx=np.clip(((cx+(u+1)*.5)*w/4).astype(int),0,w-1);sy=np.clip(((cy+(v+1)*.5)*h/3).astype(int),0,h-1)
 Image.fromarray(src[sy,sx]).save(root/(name+'-globe.jpg'),quality=91,optimize=True)
 print('Prepared spherical map:',name)
