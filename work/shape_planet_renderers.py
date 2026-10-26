from pathlib import Path
root=Path(__file__).resolve().parent
def edit(name,old,new):
 p=root/name;s=p.read_text(encoding='utf-8');assert old in s,(name,old[:70]);p.write_text(s.replace(old,new),encoding='utf-8')
edit('build_menu.py',".replace('__EARTH__',base64", ".replace('__MENU_WORLD_RENDERER__',(work/'planet_menu_renderer.js').read_text(encoding='utf-8')).replace('__EARTH__',base64")
edit('menu_scene.js','function rot(yaw', '__MENU_WORLD_RENDERER__\nfunction rot(yaw')
edit('menu_scene.js','vec3 rgb=texture2D(earth,tex).rgb;', 'vec4 sampleColor=texture2D(earth,tex);if(sampleColor.a<.08)discard;vec3 rgb=sampleColor.rgb;')
edit('menu_scene.js','gl_FragColor=vec4(rgb,1.);}}`','gl_FragColor=vec4(rgb,sampleColor.a);}}`')
edit('menu_scene.js','const paired=menuHasOrion();', 'const body=updateMenuLocation(),world=menuWorldAsset(body),paired=menuHasOrion();')
edit('menu_scene.js','er=rot(earthYaw,.03,-.4084)',"er=rot(earthYaw,.03,body.tilt||-.4084)")
edit('menu_scene.js','gl.useProgram(earthProgram);attribute(el.a.p,eb,3);attribute(el.a.uv,ub,2);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);', 'if(body.rings)earthScale*=.75;gl.useProgram(earthProgram);attribute(el.a.p,world.pb,3);attribute(el.a.uv,world.uv,2);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,world.ib);')
edit('menu_scene.js','gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(el.u.earth', 'gl.bindTexture(gl.TEXTURE_2D,world.texture);gl.uniform1i(el.u.earth')
edit('menu_scene.js','gl.drawElements(gl.TRIANGLES,ei.length,gl.UNSIGNED_SHORT,0);', 'gl.drawElements(gl.TRIANGLES,world.count,gl.UNSIGNED_SHORT,0);')
edit('menu_scene.js','gl.depthMask(true);gl.disable(gl.BLEND);\ngl.clear', 'gl.depthMask(true);gl.disable(gl.BLEND);drawMenuRing(body,er,earthScale,ex,ey,w,h);\ngl.clear')
p=root/'menu_scene.js';s=p.read_text(encoding='utf-8');a=s.index('let deg=((earthYaw');b=s.index('requestAnimationFrame(draw);}',a);s=s[:a]+s[b:];p.write_text(s,encoding='utf-8')
edit('menu_scene.js','textureLoaded:earthImage.complete', "location:menuLocation().body.id,textureLoaded:earthImage.complete")
# Height/slope coloring makes cliffs, frost and lava terrain readable beyond palette changes.
edit('antarctica_renderer.js','uniform float material,fogRange', 'uniform vec3 terrainAccent;uniform float terrainKind;uniform float material,fogRange')
edit('antarctica_renderer.js',"col+=vec3(.02)*sin(world.x*.8+world.z*.5);", """col+=vec3(.02)*sin(world.x*.8+world.z*.5);
        float slope=1.-abs(normal.y);float strata=.5+.5*sin(world.y*1.5);col*=.85+strata*.15;
        if(terrainKind>5.5&&terrainKind<6.5){float crack=pow(1.-abs(sin(world.x*.014+sin(world.z*.016))),35.);col=mix(col,terrainAccent,crack*.7);}
        if(terrainKind>6.5){col=mix(col,terrainAccent,smoothstep(24.,85.,world.y)*.55);}
        if(terrainKind>4.5&&terrainKind<5.5){float lava=pow(.5+.5*sin(world.x*.08+sin(world.z*.09)),18.)*smoothstep(.6,.95,normal.y);col=mix(col,terrainAccent,lava*.5);}
        col=mix(col,color*.65,slope*.3);""")
edit('antarctica_renderer.js',"['vp','model','eye','color'", "['terrainAccent','terrainKind','vp','model','eye','color'")
edit('antarctica_renderer.js','uniform vec3 fog,lightDirection;', 'uniform vec3 fog,lightDirection;uniform float cloudKind;')
edit('antarctica_renderer.js','gl_FragColor=vec4(cloud,1.);', """if(cloudKind>.5){float bands=.5+.5*sin(ray.y*(cloudKind<1.5?35.:cloudKind<2.5?20.:12.)+sin(azimuth*4.+time*.03)*2.);cloud=mix(fog*.38,fog*1.2,bands);float vortex=sin(azimuth*3.+ray.y*20.-time*.045)*sin(ray.y*28.+time*.03);if(cloudKind<1.5)cloud=mix(cloud,vec3(.64,.21,.12),smoothstep(.6,.95,vortex)*.45);if(cloudKind>2.5&&cloudKind<3.5)cloud+=vec3(.03,.25,.19)*pow(max(0.,sin(azimuth*8.+ray.y*15.+time*.12)),8.)*.5;if(cloudKind>3.5){cloud*=.7;cloud+=vec3(.2,.3,.5)*pow(max(0.,sin(time*.8+azimuth*12.)),60.);}}
      gl_FragColor=vec4(cloud,1.);""")
edit('antarctica_renderer.js',"['sky','yaw','pitch'", "['cloudKind','sky','yaw','pitch'")
edit('antarctica_renderer.js','c.uniform1f(skyLoc.u.surfaceMode,', "c.uniform1f(skyLoc.u.cloudKind,surface?.giant?['jupiter','saturn','uranus','neptune'].indexOf(surface.id)+1:0);c.uniform1f(skyLoc.u.surfaceMode,")
edit('antarctica_renderer.js','c.uniform1f(worldLoc.u.worldTime,time);', "c.uniform1f(worldLoc.u.terrainKind,surface?NVLandscapes.profile(surface.id).code:0);c.uniform3fv(worldLoc.u.terrainAccent,surface?NVLandscapes.profile(surface.id).accent:[0,0,0]);c.uniform1f(worldLoc.u.worldTime,time);")
edit('antarctica_renderer.js',"if(africa&&p.type==='tree')africaScenery.tree(p);else object", "if(surface&&p.type==='ice-spire')object(p.x,p.y+p.r,p.z,p.r*.55,p.r*2,p.r*.45,NVLandscapes.profile(surface.id).accent,0,.05,rock);else if(surface&&p.type==='salt')object(p.x,p.y+.2,p.z,p.r*2,.4,p.r*1.5,[.88,.90,.85]);else if(africa&&p.type==='tree')africaScenery.tree(p);else object")
edit('space_surface.js',"    if(b.id==='io')", """    const profile=NVLandscapes.profile(b.id);
    if(!b.giant)for(const f of NVLandscapes.landmarks(s.seed,b.id)){if(Math.hypot(f.x-s.x,f.z-s.z)>420)continue;const h=ground(f.x,f.z),col=profile.accent;
      if(f.type==='volcano'){oval(f.x,h+.15,f.z,f.r*.28,.22,f.r*.28,col,.85);for(let k=0;k<5;k++){const rise=(time*5+k*10)%54;oval(f.x+Math.sin(time*.4+k)*rise*.14,h+3+rise,f.z,2+rise*.14,3+rise*.11,2+rise*.14,b.id==='io'?[.55,.27,.11]:[.38,.32,.24]);}}
      if(f.type==='geyser')for(let k=0;k<5;k++){const rise=(time*4+k*8)%40;oval(f.x+rise*.09,h+rise,f.z,1+rise*.04,3,1+rise*.04,[.40,.44,.47]);}
      if(f.type==='ice')for(let k=0;k<5;k++)object(f.x+k*4,h+4+k%3*2,f.z+Math.sin(k)*6,3,8+k%3*4,2.5,col,k*.25,.08,rock);
      if(f.type==='salt')oval(f.x,h+.08,f.z,f.r,.15,f.r*.65,col);
      if(f.type==='lake')oval(f.x,h+.05,f.z,f.r,.06,f.r*.7,col);
      if(f.type==='mesa')object(f.x,h+6,f.z,13,12,11,col,0,0,rock);
    }
    if(b.id==='io')""")
edit('package_menu.py',"sources+=['planet_landscapes.js'", "sources+=['planet_menu_renderer.js','planet_landscapes.js'")
print('Integrated surface shading, landmarks, distinct giant skies and rotating location menu worlds.')
