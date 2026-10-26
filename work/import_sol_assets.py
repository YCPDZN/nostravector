"""Extract the unmodified embedded maps in NASA's public glTF models."""
from pathlib import Path
import urllib.request, re, struct, json, concurrent.futures
root=Path(__file__).resolve().parent/'sol-assets'; root.mkdir(exist_ok=True)
names=['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','pluto','moon','europa','io','ganymede','callisto','titan','triton','charon','ceres']
def fetch(name):
    slug={'mars':'planet-mars','earth':'earth-with-clouds'}.get(name,name)
    page=f'https://science.nasa.gov/resource/{slug}-3d-model/'
    try:
        if name=='moon':
            page='https://svs.gsfc.nasa.gov/4720/'
            html=urllib.request.urlopen(page,timeout=25).read().decode()
            url='https://svs.gsfc.nasa.gov'+next(iter(re.findall(r'href=["\'](/[^"\']*/lroc_color_2k\.jpg)',html)))
            (root/'moon-0.jpg').write_bytes(urllib.request.urlopen(url,timeout=40).read())
            return name,{'page':page,'download':url,'images':['moon-0.jpg'],'baseColor':[0]}
        # Cached maps are kept byte-for-byte; only fetch missing worlds on a rerun.
        cache=root/'sources.json'
        if cache.exists():
            old=json.loads(cache.read_text()).get(name,{})
            if old.get('images') and all((root/f).exists() for f in old['images']) and (name not in ['mercury','jupiter','saturn'] or (root/(name+'-mesh.json')).exists()):return name,old
        html=urllib.request.urlopen(page,timeout=25).read().decode()
        url=next(iter(re.findall(r'https[^\s<>"\']+\.glb',html)))
        data=urllib.request.urlopen(url,timeout=40).read()
        length,kind=struct.unpack_from('<II',data,12)
        doc=json.loads(data[20:20+length]); pos=20+length
        size,kind=struct.unpack_from('<II',data,pos); binary=data[pos+8:pos+8+size]
        images=[]
        for i,im in enumerate(doc.get('images',[])):
            if 'bufferView' not in im: continue
            v=doc['bufferViews'][im['bufferView']]; start=v.get('byteOffset',0)
            ext='png' if im.get('mimeType')=='image/png' else 'jpg'
            filename=f'{name}-{i}.{ext}'; (root/filename).write_bytes(binary[start:start+v['byteLength']])
            images.append(filename)
        # Material baseColorTexture identifies the actual color map, avoiding normal/roughness maps.
        colors=[]
        for mat in doc.get('materials',[]):
            ti=mat.get('pbrMetallicRoughness',{}).get('baseColorTexture',{}).get('index')
            if ti is not None: colors.append(doc['textures'][ti]['source'])
        if name in ['mercury','jupiter','saturn']:
            def accessor(index):
                a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
                fmt={5126:'f',5125:'I',5123:'H',5121:'B'}[a['componentType']];nc={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']]
                width=struct.calcsize(fmt)*nc;stride=v.get('byteStride',width);start=v.get('byteOffset',0)+a.get('byteOffset',0)
                rows=[list(struct.unpack_from('<'+fmt*nc,binary,start+i*stride)) for i in range(a['count'])]
                return [r[0] for r in rows] if nc==1 else rows
            primitive=max((p for m in doc['meshes'] for p in m['primitives']),key=lambda p:doc['accessors'][p['attributes']['POSITION']]['count'])
            at=primitive['attributes'];positions=accessor(at['POSITION']);size=max(sum(v*v for v in p)**.5 for p in positions)
            geometry={'p':[[round(v/size,6) for v in p] for p in positions],'n':accessor(at['NORMAL']),'uv':accessor(at['TEXCOORD_0']),'f':accessor(primitive['indices'])}
            (root/(name+'-mesh.json')).write_text(json.dumps(geometry,separators=(',',':')))
            print(name,'mesh',len(positions),'maxindex',max(geometry['f']),flush=True)
        print(name, images, 'baseColor',colors,flush=True)
        return name,{'page':page,'download':url,'images':images,'baseColor':colors}
    except Exception as e:
        print(name,type(e).__name__,str(e)[:100],flush=True); return name,{'page':page,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=dict(pool.map(fetch,names))
(root/'sources.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
