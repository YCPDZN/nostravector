from pathlib import Path
p=Path(__file__).resolve().parent/'test_antarctica_runtime.js';s=p.read_text(encoding='utf-8')
s=s.replace("+'\\n'+fs.readFileSync(root+'/africa_core.js','utf8')", "+'\\n'+fs.readFileSync(root+'/africa_core.js','utf8')+'\\n'+fs.readFileSync(root+'/sol_catalog.js','utf8')+'\\n'+fs.readFileSync(root+'/space_core.js','utf8')",1)
s=s.replace("+'\\n'+fs.readFileSync(root+'/antarctica_renderer.js','utf8')", "+'\\n'+fs.readFileSync(root+'/space_surface.js','utf8')+'\\n'+fs.readFileSync(root+'/antarctica_renderer.js','utf8')",1)
s+="""
// Space controller uses the same single frame loop and explicit save path.
vm.runInContext(fs.readFileSync(root+'/space_game.js','utf8'),context);
const maps=Object.fromEntries(['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','moon'].map(id=>[id,'data:image/jpeg;base64,AA==']));
const geo=Object.fromEntries(['mercury','jupiter','saturn'].map(id=>[id,JSON.parse(fs.readFileSync(root+'/sol-assets/'+id+'-mesh.json','utf8'))]));
vm.runInContext(fs.readFileSync(root+'/space_renderer.js','utf8').replace('__SOL_MAPS__',JSON.stringify(maps)).replace('__SOL_GEOMETRY__',JSON.stringify(geo)),context);
run("polarState=NVAntarctica.fresh(91);Object.assign(polarState,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});NVAfrica.arrive(polarState);polarState.africaStage='complete';polarState.friendQuest='recruited';polarState.spaceshipFound=true;polarState.friendDialogueDone=true;polarState.x=NVAfrica.SHIP.x;polarState.z=NVAfrica.SHIP.z-10;gameActive=true;gamePaused=false;");
const beforeSol=storage.get('nostravector.saves.v2');
run('boardingSpaceship();launchSpaceship();polarLast=0;polarTick(1800000);for(let i=1;i<=200;i++)polarTick(1800000+i*50);');
assert.equal(run('polarState.space.phase'),'flight');assert.equal(run('polarState.space.crew'),true);assert.equal(storage.get('nostravector.saves.v2'),beforeSol,'Boarding and launch cannot autosave.');
run('savePolarWorld(true);');const solManual=storage.get('nostravector.saves.v2');
run("polarState.space.body='mars';NVSpace.touchDown(polarState);tickSpace(.05);exitPolar();continueSavedGame();");
assert.equal(run('polarState.space.phase'),'flight');assert.equal(run('polarState.space.body'),'earth');assert.equal(run('polarState.space.crew'),true);assert.equal(storage.get('nostravector.saves.v2'),solManual,'Landing and menu exit cannot autosave.');
for(const phase of ['cockpit','launch','flight','descent','landed','ascent','disabled']){
 run(`polarState.space.phase='${phase}';polarState.space.body='charon';polarState.space.elapsed=3.5;polarState.space.hull=74;savePolarWorld(true);exitPolar();continueSavedGame();polarLast=0;polarTick(1900000);`);
 assert.equal(run('polarState.space.phase'),phase);assert.equal(run('polarState.space.body'),'charon');assert.equal(element('#wakeupShade').style.opacity,'0');assert.equal(element('#worldError').textContent,'');
}
run("gamePaused=false;polarState.space.phase='landed';for(const id of ['mars','mercury','io','europa','titan','jupiter','charon']){polarState.space.body=id;NVSpace.touchDown(polarState);polarRenderer(polarState,80,{playerPhase:1,jamesPhase:2,playerSpeed:1.4,jamesSpeed:1.4});}polarState.space.body='saturn';NVSpace.orbit(polarState);renderSpaceWorld(polarState,88,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});");
assert.equal(element('#antarctica').dataset.spaceRendered,'flight');
console.log('Passed: space frame loop, all save phases, Orion crew retention, manual-only rollback, real ground/flight renderer paths and no black screen on Continue.');
"""
p.write_text(s,encoding='utf-8')
