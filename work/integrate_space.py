from pathlib import Path
root=Path(__file__).resolve().parent
def edit(name,pairs):
    p=root/name;s=p.read_text(encoding='utf-8')
    for old,new in pairs:
        if old not in s:raise RuntimeError(name+': missing '+old[:90])
        s=s.replace(old,new,1)
    p.write_text(s,encoding='utf-8')
edit('antarctica_core.js',[
 ('spaceshipFound:false,ferryVoyageTime','spaceshipFound:false,space:null,ferryVoyageTime'),
 ('    return s;\n  }\n  function snapshot','    if(typeof NVSpace!==\'undefined\')s.space=NVSpace.restore(w.space,s);\n    return s;\n  }\n  function snapshot'),
 ('spaceshipFound:s.spaceshipFound,betrayalTime','spaceshipFound:s.spaceshipFound,space:s.space?JSON.parse(JSON.stringify(s.space)):null,betrayalTime')])
edit('antarctica_game.js',[
 ("polarState=NVAntarctica.restored(savedGame.progress,savedGame.id);gameActive=true;", "polarState=NVAntarctica.restored(savedGame.progress,savedGame.id);if(typeof spaceChartOpen!=='undefined')spaceChartOpen=false;$('#solChart').hidden=true;gameActive=true;"),
 ("chapter:polarState.africaStarted?2:1,checkpoint:polarState.africaStarted?'africa-coast'", "chapter:polarState.space?.phase&&polarState.space.phase!=='off'?3:polarState.africaStarted?2:1,checkpoint:polarState.space?.phase&&polarState.space.phase!=='off'?'sol-'+polarState.space.body+'-'+polarState.space.phase:polarState.africaStarted?'africa-coast'"),
 ("$('#polarMap').hidden=true;if(on)", "$('#polarMap').hidden=true;if(typeof spaceChartOpen!=='undefined')spaceChartOpen=false;$('#solChart').hidden=true;if(on)"),
 ('updateBetrayalHUD();updateAfricaHUD();}', "updateBetrayalHUD();updateAfricaHUD();if(typeof updateSpaceHUD==='function')updateSpaceHUD();}"),
 ('if(betrayalActive())tickFerryBetrayal(dt);', "if(typeof spaceActive==='function'&&spaceActive())tickSpace(dt);else if(betrayalActive())tickFerryBetrayal(dt);"),
 ('if(polarRenderer)polarRenderer(polarState,polarClock,{playerPhase:polarPhase,jamesPhase,playerSpeed:polarPoseSpeed,jamesSpeed:jamesPoseSpeed});', "const animation={playerPhase:polarPhase,jamesPhase,playerSpeed:polarPoseSpeed,jamesSpeed:jamesPoseSpeed};if(typeof spaceActive==='function'&&spaceActive())renderSpaceWorld(polarState,polarClock,animation);else if(polarRenderer)polarRenderer(polarState,polarClock,animation);"),
 ("if(gamePaused&&e.code!=='Escape')return;if(africaModal()", "if(gamePaused&&e.code!=='Escape')return;if(e.code==='Escape'&&typeof spaceChartOpen!=='undefined'&&spaceChartOpen){e.preventDefault();toggleSolChart(false);return;}if(typeof spaceInput==='function'&&spaceInput(e))return;if(e.code==='KeyF'&&polarState.africaStarted&&typeof boardingSpaceship==='function'&&polarState.spaceshipFound&&!africaModal()){e.preventDefault();boardingSpaceship();return;}if(africaModal()"),
 ("if(!gameActive||!polarState.jamesIntroductionDone||polarState.bedSleeping||betrayalActive()||africaModal())return;", "if(typeof spaceActive==='function'&&spaceActive()){toggleSolChart();return;}if(!gameActive||!polarState.jamesIntroductionDone||polarState.bedSleeping||betrayalActive()||africaModal())return;"),
 ('polarCameraDrag=true;polarPointer=', "if(typeof spaceActive==='function'&&spaceActive()&&polarState.space.phase!=='landed')return;polarCameraDrag=true;polarPointer=")])
edit('africa_game.js',[("  const s=polarState,modal=africaModal()", "  if(typeof spaceActive==='function'&&spaceActive()){$('#orionDialogue').hidden=true;$('#africaTransition').hidden=true;$('#friendQuestPanel').hidden=true;$('#spaceshipArrival').hidden=true;return;}\n  const s=polarState,modal=africaModal()")])
edit('africa.html',[("Your way into the Sol System awaits.<br>ESC → SAVE GAME preserves your progress.</p></div>", "Board your ship and launch into the Sol System.<br>Orion travels with you if recruited.</p><button id=\"boardAfricaShip\" class=\"polar-button\">BOARD SPACESHIP / F</button></div>")])
edit('space_game.js',[("$('#launchSpaceship').onclick=launchSpaceship;", "$('#boardAfricaShip').onclick=boardingSpaceship;$('#launchSpaceship').onclick=launchSpaceship;")])
edit('antarctica_renderer.js',[
 ('uniform float yaw,pitch,time,severity,daylight,twilight,dayMode,aspect;', 'uniform float yaw,pitch,time,severity,daylight,twilight,dayMode,aspect,surfaceMode;'),
 ('gl_FragColor=vec4(cloud,1.);', "if(surfaceMode>.5){if(surfaceMode>1.5){cloud=vec3(.002,.004,.010)+vec3(.75,.83,.95)*star;float sun=pow(max(0.,dot(ray,lightDirection)),1800.);cloud+=vec3(1.,.94,.82)*sun;}else{cloud=mix(fog*.25,fog,smoothstep(.8,-.10,ray.y));cloud+=vec3(.7,.5,.25)*glow*.5;}}gl_FragColor=vec4(cloud,1.);"),
 ("'lightDirection','aspect'].map", "'lightDirection','aspect','surfaceMode'].map"),
 ('if(material>2.5){', 'if(material>2.5&&material<3.5){'),
 ('vec3 lighting=mix(', "if(material>3.5){float grain=fract(sin(dot(world.xz,vec2(12.9898,78.233)))*43758.5453);col*=.87+.15*grain;col+=vec3(.02)*sin(world.x*.8+world.z*.5);}\n      vec3 lighting=mix("),
 ('let renderAfrica=false;const terrainHeight=', "let renderSurface=null,renderAfrica=false;const terrainHeight="),
 ('(x,z,seed)=>renderAfrica?NVAfrica.height(x,z,seed):A.height(x,z,seed),terrainGround=(x,z,seed)=>renderAfrica?NVAfrica.height(x,z,seed):A.ground(x,z,seed);', '(x,z,seed)=>renderSurface?NVSpace.surfaceHeight(x,z,seed,renderSurface.id):renderAfrica?NVAfrica.height(x,z,seed):A.height(x,z,seed),terrainGround=(x,z,seed)=>renderSurface?NVSpace.surfaceHeight(x,z,seed,renderSurface.id):renderAfrica?NVAfrica.height(x,z,seed):A.ground(x,z,seed);'),
 ('props:renderAfrica?NVAfrica.props', 'props:renderSurface?NVSpace.surfaceProps(cx,cz,seed,renderSurface.id):renderAfrica?NVAfrica.props'),
 ('const africa=s.africaStarted;renderAfrica=africa;', "const surface=typeof NVSpace!=='undefined'&&NVSpace.surface(s)?NVSol.byId[s.space.body]:null,africa=s.africaStarted&&!surface;renderSurface=surface;renderAfrica=africa;"),
 ('if(scene)earth.daylight=Math.max(.65,earth.daylight);', "if(scene)earth.daylight=Math.max(.65,earth.daylight);if(surface){earth.daylight=.85;earth.twilight=0;earth.direction=[-.35,.55,-.70];}"),
 ('const rootY=s.ferryEscaped&&!africa?2.78:', 'const rootY=s.ferryEscaped&&!africa&&!surface?2.78:'),
 ('c.clearColor(.55,.67,.75,1);', 'c.depthMask(true);c.disable(c.BLEND);c.clearColor(.55,.67,.75,1);'),
 ('const inside=!africa&&A.inShelter(s),calm=africa||cinematic', 'const inside=!africa&&!surface&&A.inShelter(s),calm=!!surface||africa||cinematic'),
 ('fog=dayFog.map(', 'fog=surface?(surface.sky||[.002,.004,.010]):dayFog.map('),
 ('fogRange=africa?460:', 'fogRange=surface?(surface.atmosphere?surface.id===\'venus\'?100:350:100000):africa?460:'),
 ('c.uniform1f(skyLoc.u.dayMode,earth.isDay?1:0);', 'c.uniform1f(skyLoc.u.dayMode,earth.isDay?1:0);c.uniform1f(skyLoc.u.surfaceMode,surface?(surface.atmosphere?1:2):0);'),
 ("String(s.seed)+':'+africa", "String(s.seed)+':'+africa+':'+(surface?.id||'')"),
 ("activeSeed=String(s.seed)+':'+africa;", "activeSeed=String(s.seed)+':'+africa+':'+(surface?.id||'');"),
 ('draw(q,M.identity(),africa?[.68,.56,.37]:[.9,.95,.99],africa?3:1);', "if(!surface?.giant)draw(q,M.identity(),surface?(surface.terrain||surface.color):africa?[.68,.56,.37]:[.9,.95,.99],surface?4:africa?3:1);"),
 ("p.type==='ice'?[.57,.76,.85]:[.51,.60,.65]", "surface?(surface.terrain||surface.color).map(v=>v*.7):p.type==='ice'?[.57,.76,.85]:[.51,.60,.65]"),
 ('if(africa)africaScenery.scenery(s,time,animation);else{', 'if(surface){if(solScenery)solScenery(s,time,animation);}else if(africa)africaScenery.scenery(s,time,animation);else{'),
 ('character(s.ferryEscaped&&!africa?{...s,y:2.78}:s,hero', 'character(s.ferryEscaped&&!africa&&!surface?{...s,y:2.78}:s,hero'),
 ('if(!inside&&!africa){', 'if(!inside&&!africa&&!surface){')])
# Insert a factory beside the existing Africa scene, after all geometry helpers exist.
p=root/'antarctica_renderer.js';s=p.read_text(encoding='utf-8');needle='  const flakeCount=8000';s=s.replace(needle,"  const solScenery=typeof createSolScenery==='function'?createSolScenery({A,M,cube,rock,sphere:speakingMouth,draw,object,character,mesh}):null;\n"+needle);p.write_text(s,encoding='utf-8')
edit('build_menu.py',[
 ("js+='\\n'+(work/'africa_core.js').read_text(encoding='utf-8')", "js+='\\n'+(work/'africa_core.js').read_text(encoding='utf-8')+'\\n'+(work/'sol_catalog.js').read_text(encoding='utf-8')+'\\n'+(work/'space_core.js').read_text(encoding='utf-8')"),
 ("js+='\\n'+(work/'antarctica_renderer.js').read_text(encoding='utf-8')", "js+='\\n'+(work/'space_surface.js').read_text(encoding='utf-8')+'\\n'+(work/'antarctica_renderer.js').read_text(encoding='utf-8')\nsol_meta=json.loads((work/'sol-assets/sources.json').read_text())\nsol_maps={name:'data:image/'+('png' if item['images'][item['baseColor'][0]].endswith('.png') else 'jpeg')+';base64,'+base64.b64encode((work/'sol-assets'/item['images'][item['baseColor'][0]]).read_bytes()).decode() for name,item in sol_meta.items() if item.get('images')}\nsol_geometry={name:json.loads((work/'sol-assets'/f'{name}-mesh.json').read_text()) for name in ['mercury','jupiter','saturn']}\njs+='\\n'+(work/'space_renderer.js').read_text(encoding='utf-8').replace('__SOL_MAPS__',json.dumps(sol_maps,separators=(',',':'))).replace('__SOL_GEOMETRY__',json.dumps(sol_geometry,separators=(',',':')))"),
 ("+'\\n'+(work/'africa_game.js').read_text(encoding='utf-8')", "+'\\n'+(work/'africa_game.js').read_text(encoding='utf-8')+'\\n'+(work/'space_game.js').read_text(encoding='utf-8')"),
 ("(work/'africa.html').read_text(encoding='utf-8')", "(work/'africa.html').read_text(encoding='utf-8')+(work/'space.html').read_text(encoding='utf-8')"),
 ("(work/'africa.css').read_text(encoding='utf-8')", "(work/'africa.css').read_text(encoding='utf-8')+'\\n'+(work/'space.css').read_text(encoding='utf-8')")])
print('Integrated Sol boarding, flight, surface generation, HUD, and manual checkpoint restoration.')
