"""Prepare compact web copies of the NASA maps; originals remain in sol-assets."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent/'sol-assets'
meta=json.loads((root/'sources.json').read_text())
for name,item in meta.items():
    if not item.get('images'):continue
    src=root/item['images'][item['baseColor'][0]]
    im=Image.open(src).convert('RGB');im.thumbnail((2048,1536),Image.Resampling.LANCZOS)
    im.save(root/(name+'-web.jpg'),quality=91,optimize=True)
print('Prepared',len(list(root.glob('*-web.jpg'))),'NASA maps for offline rendering.')
