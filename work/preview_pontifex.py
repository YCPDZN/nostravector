"""Depth-buffer previews of the exact articulated boss meshes exported to GLB."""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'work/pontifex_model.js').read_text(encoding='utf-8')
MODEL = json.loads(source[source.index('=') + 1:source.rfind(';')])
W, H = 620, 960


def render(yaw):
    Y, X = np.mgrid[0:H, 0:W]
    glow = np.exp(-(((X - W*.73) / 340)**2 + ((Y - H*.39) / 420)**2))
    pixels = np.zeros((H,W,3),dtype=np.uint8)
    pixels[:] = [13,17,25]
    pixels = np.clip(pixels + glow[:,:,None] * np.array([19,6,9]),0,255).astype(np.uint8)
    depth = np.full((H,W),-np.inf)
    R = np.array([[math.cos(yaw),0,math.sin(yaw)],[0,1,0],[-math.sin(yaw),0,math.cos(yaw)]])
    light = np.array([-.65,.8,1.4]); light /= np.linalg.norm(light)
    view = np.array([0,0,1]); half = light + view; half /= np.linalg.norm(half)
    allv = np.concatenate([np.array(q['p']).reshape(-1,3) @ R.T for q in MODEL['meshes']])
    center = (allv[:,0].min() + allv[:,0].max()) / 2
    scale = 141
    for q in MODEL['meshes']:
        v=np.array(q['p']).reshape(-1,3) @ R.T
        n=np.array(q['n']).reshape(-1,3) @ R.T
        screen=v.copy();screen[:,0]=W/2+(v[:,0]-center)*scale;screen[:,1]=875-v[:,1]*scale
        metal = any(k in q['name'].lower() for k in ['steel','plate','blade','shell','spike','bearing','forged'])
        for ids in np.array(q['indices']).reshape(-1,3):
            # Match the game renderer's default CCW front faces and BACK culling.
            # Camera looks along -Z, so an outward face points toward positive Z.
            if np.cross(v[ids[1]]-v[ids[0]],v[ids[2]]-v[ids[0]])[2] <= 1e-12:
                continue
            pts=screen[ids]
            x0=max(0,int(math.floor(pts[:,0].min())));x1=min(W-1,int(math.ceil(pts[:,0].max())))
            y0=max(0,int(math.floor(pts[:,1].min())));y1=min(H-1,int(math.ceil(pts[:,1].max())))
            if x0>x1 or y0>y1:continue
            a,b,c=pts;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(den)<1e-7:continue
            YY,XX=np.mgrid[y0:y1+1,x0:x1+1];XX=XX+.5;YY=YY+.5
            u=((b[1]-c[1])*(XX-c[0])+(c[0]-b[0])*(YY-c[1]))/den
            vv=((c[1]-a[1])*(XX-c[0])+(a[0]-c[0])*(YY-c[1]))/den;ww=1-u-vv
            z=u*a[2]+vv*b[2]+ww*c[2];patch=depth[y0:y1+1,x0:x1+1]
            mask=(u>=-1e-7)&(vv>=-1e-7)&(ww>=-1e-7)&(z>patch)
            if not mask.any():continue
            norm=u[:,:,None]*n[ids[0]]+vv[:,:,None]*n[ids[1]]+ww[:,:,None]*n[ids[2]]
            norm/=np.maximum(np.linalg.norm(norm,axis=2,keepdims=True),1e-8)
            key=np.maximum(0,norm @ light);rim=(1-np.maximum(0,norm[:,:,2]))**3
            spec=np.maximum(0,norm @ half)**(22 if metal else 10)
            color=np.array(q['color'])
            out=color*(.60+key[:,:,None]*.95)+rim[:,:,None]*np.array([.13,.09,.10])
            out+=spec[:,:,None]*(.25 if metal else .04)
            out+=color*q.get('emission',0)*.65
            out=np.power(np.clip(out,0,1),.92);out=(out*255).astype(np.uint8)
            pixels[y0:y1+1,x0:x1+1][mask]=out[mask];patch[mask]=z[mask]
    return Image.fromarray(pixels)


image=Image.new('RGB',(W*2,H),(13,17,25))
for i,yaw in enumerate([-.06,.62]):
    image.paste(render(yaw),(i*W,0))
draw=ImageDraw.Draw(image)
try:
    title=ImageFont.truetype('C:/Windows/Fonts/bahnschrift.ttf',24)
    small=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',12)
except OSError:
    title=small=ImageFont.load_default()
draw.text((28,22),'IMPERIA PONTIFEX MAXIMUS',font=title,fill='#e9e5e4')
draw.text((28,55),'TERRA IMPERIA / ORIGINAL ARTICULATED BOSS MODEL',font=small,fill='#b58187')
draw.text((W+28,23),'ARMOUR / REACTOR / CRESCENT POLEARM',font=small,fill='#c4b8ba')
draw.line((W,18,W,H-24),fill='#492b34',width=1)
for i,label in enumerate(['FRONT','THREE-QUARTER']):
    draw.text((i*W+28,H-48),label+' / 401 MESH PARTS / EXACT GAME GEOMETRY',font=small,fill='#a8969d')
image.save(ROOT/'outputs/NOSTRAVECTOR_Pontifex_Preview.png')
print('Rendered exact boss geometry in two views.')
