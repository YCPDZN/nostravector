"""Render the exact generated geometry with a software depth buffer for visual QA."""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'work';OUT=ROOT/'outputs'
s=(WORK/'human_leaders.js').read_text(encoding='utf-8');models=json.loads(s[s.index('=')+1:s.index(';\n')])
s=(WORK/'hak_model.js').read_text(encoding='utf-8');models['hak']=json.loads(s[s.index('=')+1:s.rfind(';')])
W,H=440,740
def render(model):
 pixels=np.zeros((H,W,3),dtype=np.uint8);pixels[:]=[15,23,36];depth=np.full((H,W),-np.inf);yaw=-.16;R=np.array([[math.cos(yaw),0,math.sin(yaw)],[0,1,0],[-math.sin(yaw),0,math.cos(yaw)]])
 light=np.array([-.7,1.,1.6]);light/=np.linalg.norm(light)
 for q in model['meshes']:
  if 'grass' in q['name'] or 'meadow' in q['name'] or q['bone']=='teeth':continue
  v=np.array(q['p']).reshape(-1,3)@R.T;n=np.array(q['n']).reshape(-1,3)@R.T;screen=v.copy();screen[:,0]=W/2+v[:,0]*140;screen[:,1]=650-v[:,1]*140
  for ids in np.array(q['indices']).reshape(-1,3):
   pts=screen[ids];x0=max(0,int(math.floor(pts[:,0].min())));x1=min(W-1,int(math.ceil(pts[:,0].max())));y0=max(0,int(math.floor(pts[:,1].min())));y1=min(H-1,int(math.ceil(pts[:,1].max())))
   if x0>x1 or y0>y1:continue
   a,b,c=pts;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
   if abs(den)<1e-7:continue
   Y,X=np.mgrid[y0:y1+1,x0:x1+1];X=X+.5;Y=Y+.5
   u=((b[1]-c[1])*(X-c[0])+(c[0]-b[0])*(Y-c[1]))/den;vv=((c[1]-a[1])*(X-c[0])+(a[0]-c[0])*(Y-c[1]))/den;ww=1-u-vv;z=u*a[2]+vv*b[2]+ww*c[2]
   patch=depth[y0:y1+1,x0:x1+1];mask=(u>=-1e-7)&(vv>=-1e-7)&(ww>=-1e-7)&(z>patch)
   if not mask.any():continue
   norm=u[:,:,None]*n[ids[0]]+vv[:,:,None]*n[ids[1]]+ww[:,:,None]*n[ids[2]];norm/=np.maximum(np.linalg.norm(norm,axis=2,keepdims=True),1e-8)
   key=np.maximum(0,norm@light);rim=(1-np.maximum(0,norm[:,:,2]))**3
   rgb=np.array(q['color'])*(.42+key[:,:,None]*.66)+rim[:,:,None]*np.array([.08,.10,.18]);rgb=(np.clip(rgb,0,1)*255).astype(np.uint8)
   pixels[y0:y1+1,x0:x1+1][mask]=rgb[mask];patch[mask]=z[mask]
 return Image.fromarray(pixels)
image=Image.new('RGB',(W*3,H),(15,23,36))
try:font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21);small=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',12)
except OSError:font=small=ImageFont.load_default()
for i,(key,caption) in enumerate([('thomas','TERRA IMPERIA'),('darius','HUMAN FEDERATION OF SOL'),('hak','CHOMPY EMPIRE')]):
 image.paste(render(models[key]),(i*W,0));draw=ImageDraw.Draw(image);draw.text((i*W+24,24),models[key]['name'].upper(),font=font,fill='#e2eaf3');draw.text((i*W+24,54),caption,font=small,fill='#97adbf');draw.text((i*W+24,695),'EXACT GAME MESH / GEOMETRY PREVIEW',font=small,fill='#7993a9')
 if i:draw.line((i*W,18,i*W,H-18),fill='#304253',width=1)
image.save(OUT/'NOSTRAVECTOR_Detailed_Cast_Preview.png')
print('Rendered three model geometry views.')
