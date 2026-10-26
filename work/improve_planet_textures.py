from pathlib import Path
root=Path(__file__).resolve().parent
def edit(name,old,new):
    p=root/name;s=p.read_text(encoding='utf-8');assert old in s,(name,old[:90]);p.write_text(s.replace(old,new),encoding='utf-8')
p=root/'antarctica_renderer.js';s=p.read_text(encoding='utf-8')
a=s.index('  function lookAt(');b=s.index('\n',a);s=s[:a]+'  const lookAt=NVRenderMath.view;'+s[b:]
s=s.replace('uniform float terrainKind;', 'uniform float terrainKind,terrainIce,terrainScale,terrainShift;')
s=s.replace('    void main(){vec3 normal=normalize(N);', '    __PLANET_MATERIAL__\n    void main(){vec3 normal=normalize(N);',1)
a=s.index('      if(material>3.5)');b=s.index('      vec3 lighting=',a);s=s[:a]+'      if(material>3.5)col=planetMaterial(color,normal);\n'+s[b:]
s=s.replace("['terrainAccent','terrainKind'", "['terrainIce','terrainScale','terrainShift','terrainAccent','terrainKind'")
a=s.index('  const skyProgram=');b=s.index('  const flakeProgram=',a)
s=s[:a]+'''  const skyProgram=program(`attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,1.,1.);}`,`__SURFACE_SKY__`);
  const skyLoc={p:c.getAttribLocation(skyProgram,'p'),u:Object.fromEntries(['cameraForward','cameraRight','cameraUp','tanHalfFov','cloudKind','sky','time','fog','severity','daylight','twilight','dayMode','lightDirection','aspect','surfaceMode'].map(n=>[n,c.getUniformLocation(skyProgram,n)]))};
'''+s[b:]
a=s.index('  function texture(');b=s.index('  let renderSurface=',a)
s=s[:a]+'''  function texture(src,fallback,upscale=false){
    const t=c.createTexture();c.bindTexture(c.TEXTURE_2D,t);c.texImage2D(c.TEXTURE_2D,0,c.RGBA,1,1,0,c.RGBA,c.UNSIGNED_BYTE,new Uint8Array(fallback));c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,c.LINEAR);c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,c.LINEAR);
    const image=new Image();image.onload=()=>{let source=image;if(upscale){const size=NVRenderMath.textureSize(c.getParameter(c.MAX_TEXTURE_SIZE)),layer=document.createElement('canvas');layer.width=size;layer.height=size;const ctx=layer.getContext('2d');if(ctx){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,size,size);source=layer;}}
      c.bindTexture(c.TEXTURE_2D,t);c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,true);c.texImage2D(c.TEXTURE_2D,0,c.RGB,c.RGB,c.UNSIGNED_BYTE,source);c.generateMipmap(c.TEXTURE_2D);c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,c.LINEAR_MIPMAP_LINEAR);c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,c.LINEAR);c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.REPEAT);c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.REPEAT);const ext=c.getExtension('EXT_texture_filter_anisotropic');if(ext)c.texParameterf(c.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,c.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    };image.src=src;return t;
  }
  const sandTexture=texture(AFRICA_SAND,[192,147,97,255],true);
  const snowTexture=texture(POLAR_SNOW,[212,231,240,255],true),skyTexture=texture(POLAR_SKY,[127,166,190,255]);
'''+s[b:]
old='c.uniform1f(skyLoc.u.yaw,Math.atan2(target[0]-eye[0],target[2]-eye[2]));c.uniform1f(skyLoc.u.pitch,Math.atan2(eye[1]-target[1],Math.hypot(target[0]-eye[0],target[2]-eye[2])));'
assert old in s
s=s.replace(old,"const camera=NVRenderMath.cameraFrame(eye,target);c.uniform3fv(skyLoc.u.cameraForward,camera.forward);c.uniform3fv(skyLoc.u.cameraRight,camera.right);c.uniform3fv(skyLoc.u.cameraUp,camera.up);c.uniform1f(skyLoc.u.tanHalfFov,Math.tan(Math.PI/3.05/2));")
s=s.replace('c.uniform1f(worldLoc.u.terrainKind,',"const material=surface?NVLandscapes.material(surface.id):{ice:0,scale:.11,shift:0};c.uniform1f(worldLoc.u.terrainIce,material.ice);c.uniform1f(worldLoc.u.terrainScale,material.scale);c.uniform1f(worldLoc.u.terrainShift,material.shift);c.uniform1f(worldLoc.u.terrainKind,")
p.write_text(s,encoding='utf-8')
edit('planet_landscapes.js', '  return{profiles,profile,height', "  function material(id){const b=NVSol.byId[id],p=profile(id),n=A.seedFromId(id);return{ice:['fractures','glacier','frost'].includes(p.kind)?.96:b.style==='ice'?.74:.08,scale:.09+n%8*.007,shift:(n%997)/31};}\n  return{material,profiles,profile,height")
edit('build_menu.py',"+'\\n'+(work/'antarctica_renderer.js').read_text(encoding='utf-8')", "+'\\n'+(work/'render_math.js').read_text(encoding='utf-8')+'\\n'+(work/'antarctica_renderer.js').read_text(encoding='utf-8').replace('__SURFACE_SKY__',(work/'surface_sky.glsl').read_text(encoding='utf-8')).replace('__PLANET_MATERIAL__',(work/'planet_material.glsl').read_text(encoding='utf-8'))")
edit('package_menu.py',"sources+=['planet_menu_renderer.js'", "sources+=['render_math.js','surface_sky.glsl','planet_material.glsl','test_render_math.js','planet_menu_renderer.js'")
edit('package_menu.py',"assert '__MENU_WORLD_RENDERER__' not in html", "assert '__SURFACE_SKY__' not in html and '__PLANET_MATERIAL__' not in html\nassert '__MENU_WORLD_RENDERER__' not in html")
edit('test_antarctica_runtime.js',"fs.readFileSync(root+'/antarctica_renderer.js','utf8')", "fs.readFileSync(root+'/render_math.js','utf8')+'\\n'+fs.readFileSync(root+'/antarctica_renderer.js','utf8').replace('__SURFACE_SKY__',fs.readFileSync(root+'/surface_sky.glsl','utf8')).replace('__PLANET_MATERIAL__',fs.readFileSync(root+'/planet_material.glsl','utf8'))")
print('Integrated tinted triplanar 2K texture uploads and a shared sky/view camera basis.')
