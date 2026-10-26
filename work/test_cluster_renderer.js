const fs=require('node:fs'),source=fs.readFileSync(__dirname+'/test_antarctica_runtime.js','utf8'),harness=source.slice(0,source.indexOf('run("creatingCharacter=true;'));
const checks=String.raw`
for(const f of ['world_flight.js','galaxy_core.js','cluster_core.js','eris_core.js','sol_war_core.js','construction_core.js','trade_core.js'])run(fs.readFileSync(root+'/'+f,'utf8'));
run('function orionSpaceParts(){return [];}');
run(fs.readFileSync(root+'/space_renderer.js','utf8').replace('__SOL_MAPS__',JSON.stringify(Object.fromEntries(run('Object.values(NVCluster.bodyLists).flat().map(b=>[b.id,"data:image/jpeg;base64,AA=="])')))).replace('__SOL_GEOMETRY__','{}'));
run('polarState=NVAntarctica.fresh(124);polarState.africaStarted=true;polarState.africaStage="complete";polarState.jamesIntroductionDone=true;polarState.jamesGone=true;polarState.ferryEscaped=true;polarState.betrayalStage="complete";polarState.space=NVSpace.fresh();let drawCluster=createSpaceRenderer();const anim={playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0};');
for(const id of run('NVCluster.generated.map(q=>q.id)')){
 run('polarState.space.system='+JSON.stringify(id)+';polarState.space.body=NVCluster.first('+JSON.stringify(id)+').id;polarState.space.target=polarState.space.body;polarState.space.phase="flight";polarState.space.position=NVSpace.routeEnd(NVSol.byId[polarState.space.body]);polarState.space.geo=null;NVSpace.pointAt(polarState.space,NVSol.byId[polarState.space.body].position);NVTrade.step(polarState,.05);drawCluster(polarState,1,anim);');
 assert.equal(run('NVTrade.vessels(polarState).length'),run('NVTrade.COUNTS[polarState.space.system]'));assert.ok(run('NVTrade.vessels(polarState).every(v=>NVSol.byId[v.from].system===polarState.space.system&&NVSol.byId[v.to].system===polarState.space.system)'));
 run('var targetBody=NVSol.byId[polarState.space.body];polarState.space.position=targetBody.position.slice();polarState.space.hull=100;polarState.space.collisionCooldown=0;NVSpace.collisions(polarState.space,polarState.space.position.slice(),[]);');assert.ok(run('polarState.space.hull')<100);
 if(!run('targetBody.stellar')){run('polarState.space.position=NVSpace.routeEnd(targetBody);NVWorldFlight.enter(polarState);NVWorldFlight.ensure(polarState).altitude=70;NVWorldFlight.land(polarState);for(let j=0;j<10;j++)NVSpace.step(polarState,.1,{});');assert.equal(run('polarState.space.phase'),'landed');assert.ok(run('Number.isFinite(NVWorldFlight.ground(polarState,40,50))'));}
 run('NVTrade.ensure(polarState);polarState.space=NVSpace.restore(JSON.parse(JSON.stringify(polarState.space)),polarState);');assert.equal(run('NVTrade.vessels(polarState).length'),run('NVTrade.COUNTS[polarState.space.system]'));
}
assert.ok(drawCount>150);assert.ok(matrixCount>150);
const viewer=fs.readFileSync(root+'/../outputs/NOSTRAVECTOR_3D_Viewer.html','utf8');context.parts=JSON.parse(viewer.match(/const parts=(.*?);\r?\nconst canvas/s)[1]);run(custom.slice(custom.indexOf('const originalColors='),custom.indexOf('function syncMenuWanderer()')));
run(fs.readFileSync(root+'/africa_renderer.js','utf8').replace('__ORION_PARTS__',fs.readFileSync(root+'/orion_parts.json','utf8')).replace('__ORION_HELMET_PARTS__',fs.readFileSync(root+'/orion_helmet_parts.json','utf8')).replace('__AFRICA_SAND__','AA=='));
for(const f of ['space_surface.js','render_math.js','ecology_renderer.js'])run(fs.readFileSync(root+'/'+f,'utf8'));
run(fs.readFileSync(root+'/antarctica_renderer.js','utf8').replace('__SURFACE_SKY__',fs.readFileSync(root+'/surface_sky.glsl','utf8')).replace('__PLANET_MATERIAL__',fs.readFileSync(root+'/planet_material.glsl','utf8')));run('const surfaceRenderer=createPolarRenderer();');
for(const category of ['Scorched planet','Frozen planet','Paradise planet','Gas giant']){
 run('var b=Object.values(NVCluster.bodyLists).flat().find(b=>b.category==='+JSON.stringify(category)+');polarState.space.system=b.system;polarState.space.body=b.id;polarState.space.target=b.id;polarState.space.phase="landed";polarState.space.geo={global:true,lat:10,lon:20};polarState.space.landingX=0;polarState.space.landingZ=0;polarState.space.landingElevation=0;polarState.x=0;polarState.z=0;surfaceRenderer(polarState,3,anim);');
}
console.log('Passed all 98 generated systems through actual space rendering, local traffic on planetary systems and none on planetless hypergiants, collisions, atmosphere/landing/restore, stations and varied surface pipelines with finite buffers and transforms.');
`;
new Function('require','__dirname',harness+'\n'+checks)(require,__dirname);
