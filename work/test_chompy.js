const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,Math,Number,JSON,Map,Set});const run=s=>vm.runInContext(s,c);
for(const f of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','galaxy_core.js','cluster_core.js','eris_core.js','sol_war_core.js','construction_core.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
const ui=fs.readFileSync(__dirname+'/eris_game.js','utf8');run(ui.slice(ui.indexOf('function erisOverlordName'),ui.indexOf('function erisNPCDistance')));
run("let polarState=NVAntarctica.fresh(124);polarState.africaStarted=true;polarState.africaStage='complete';polarState.space=NVSpace.fresh();polarState.space.phase='flight';NVSpace.orbit(polarState);");
assert.equal(run('NVGalaxy.overlord(polarState)'),'?????? ??????');assert.equal(run('factionLabel("ERISIAN")'),'FACTION: ERISIAN - ERISIAN EMPIRE - PUPPET OF ?????? ??????');
run("NVGalaxy.warp(polarState,'janira-proxima')");run('NVSpace.step(polarState,.1,{})');assert.equal(run('NVGalaxy.discovered(polarState)'),false,'Starting a warp must not reveal the overlord early.');
for(let i=0;i<81;i++)run('NVSpace.step(polarState,.1,{})');
assert.equal(run('NVGalaxy.discovered(polarState)'),true);assert.equal(run('factionLabel("CHOMPY")'),'FACTION: CHOMPY EMPIRE');assert.equal(run('factionLabel("ERISIAN")'),'FACTION: ERISIAN - ERISIAN EMPIRE - PUPPET OF CHOMPY EMPIRE');
for(const id of ['janira-prime','janira-i']){assert.equal(run(`NVEris.faction(polarState,'${id}')`),'CHOMPY');assert.equal(run(`NVEris.claim(polarState,'${id}')`),false);}
assert.match(run('polarState.space.message'),/CHOMPY EMPIRE/);
run("NVGalaxy.warp(polarState,'sol')");for(let i=0;i<81;i++)run('NVSpace.step(polarState,.1,{})');assert.equal(run('NVGalaxy.overlord(polarState)'),'CHOMPY EMPIRE');
run(`let raw=NVAntarctica.snapshot(polarState);polarState=NVAntarctica.restored({antarctica:raw},'first');`);assert.equal(run('NVGalaxy.overlord(polarState)'),'CHOMPY EMPIRE','Manual checkpoint restoration retains the reveal back in Sol.');
run("let prior=NVAntarctica.snapshot(polarState);polarState=NVAntarctica.fresh(125)");assert.equal(run('NVGalaxy.overlord(polarState)'),'?????? ??????','Another character has independent discoveries.');
run("polarState=NVAntarctica.restored({antarctica:prior},'first');polarState.eris.playerFaction.claims.push('janira-prime');");assert.equal(run("NVEris.faction(polarState,'janira-prime')"),'CUSTOM','Previously saved player territory remains protected.');
run("polarState.space.system='janira-proxima';polarState.space.body='janira-prime';delete polarState.space.galaxy;polarState.space=NVSpace.restore(polarState.space,polarState);");assert.equal(run('NVGalaxy.discovered(polarState)'),true,'Older Janira saves reveal their current system.');
console.log('Passed reveal only on arrival, Chompy ownership, Erisian overlord captions, Sol return, manual save restore, independent characters and protected prior claims.');
