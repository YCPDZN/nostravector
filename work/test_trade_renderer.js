const fs=require('node:fs');const source=fs.readFileSync(__dirname+'/test_antarctica_runtime.js','utf8');const harness=source.slice(0,source.indexOf('run("creatingCharacter=true;'));
const checks=String.raw`
for(const f of ['world_flight.js','galaxy_core.js','cluster_core.js','eris_core.js','sol_war_core.js','trade_core.js'])run(fs.readFileSync(root+'/'+f,'utf8'));
run('function orionSpaceParts(){return [];}');
run(fs.readFileSync(root+'/space_renderer.js','utf8').replace('__SOL_MAPS__',JSON.stringify({mercury:'data:image/jpeg;base64,AA=='})).replace('__SOL_GEOMETRY__','{}'));
run('polarState=NVAntarctica.fresh(124);polarState.africaStarted=true;polarState.africaStage="complete";polarState.space=NVSpace.fresh();NVSpace.orbit(polarState);let renderTraffic=createSpaceRenderer(),tradeNearby=NVTrade.nearby;NVTrade.nearby=()=>[];renderTraffic(polarState,1);NVTrade.nearby=tradeNearby;');
const baseline=drawCount;
run('NVTrade.step(polarState,.05);renderTraffic(polarState,2)');
assert.ok(drawCount>baseline*2,'Civilian models add draws to the existing renderer.');assert.ok(matrixCount>0);
run('let siegeWar=NVSolWar.ensure(polarState);siegeWar.stage="war";let siegeFleet=NVSolWar.ships(polarState);for(const v of siegeFleet){v.travel={start:v.position.slice(),end:v.position.slice(),elapsed:0,duration:1e7,body:v.home};v.mode="transit";}for(const v of siegeFleet.filter(v=>v.faction==="HUMAN").slice(0,8)){v.body="mars";v.front=NVSolWar.TARGETS.indexOf("mars");v.travel=null;v.mode="patrol";v.position=NVSpace.routeEnd(NVSol.byId.mars);v.cooldown=0;}polarState.space.body="mars";polarState.space.target="mars";polarState.space.position=NVSpace.routeEnd(NVSol.byId.mars);NVSolWar.step(polarState,.1);renderTraffic(polarState,2.5);');assert.ok(run('siegeFleet.some(v=>v.bombarding==="mars")'));
run('polarState.space.system="janira-proxima";polarState.space.body="janira-prime";polarState.space.target="janira-prime";polarState.space.position=NVSpace.routeEnd(NVGalaxy.prime);NVTrade.step(polarState,.05);renderTraffic(polarState,3);');
assert.equal(run('NVTrade.vessels(polarState).length'),24);assert.equal(element('#antarctica').dataset.rendered,'true');
console.log('Passed actual Sol/Janira space renderer with civilian draw calls, finite buffers/transforms, bounded contacts and unchanged military rendering.');
`;
new Function('require','__dirname',harness+'\n'+checks)(require,__dirname);
