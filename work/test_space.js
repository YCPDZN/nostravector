const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,Math,Number,JSON,Set,Map});
for(const file of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),c);
const run=code=>vm.runInContext(code,c),get=code=>JSON.parse(run('JSON.stringify('+code+')'));
run("let s=NVAntarctica.fresh(17);Object.assign(s,{jamesIntroductionDone:true,bedRested:true,bedBuilt:true,stationFound:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});NVAfrica.arrive(s);s.africaStage='complete';NVAntarctica.grantWakeInventory(s);s.spaceshipFound=true;s.x=NVAfrica.SHIP.x;s.z=NVAfrica.SHIP.z-10;");
assert.equal(run('NVSol.worlds.length'),50);assert.equal(run("NVSol.worlds.filter(b=>!b.parent&&!b.category.includes('dwarf')&&b.id!=='pluto'&&b.id!=='haumea'&&b.id!=='makemake'&&b.id!=='eris'&&b.id!=='sedna').length"),8);
assert.equal(run('NVSpace.board(s)'),true);assert.equal(run('s.space.crew'),false);assert.equal(run('NVSpace.launch(s)'),true);
run('for(let i=0;i<91;i++)NVSpace.step(s,.1);');assert.equal(run('s.space.phase'),'flight');assert.equal(run('s.space.hull'),100);
// Every selectable world can be reached, entered, explored and left without replacing the character state.
// Use the top engine for the fifty-world collision sweep; starter timing and
// upgrade progression are checked separately in test_ship_drive.js.
run('s.space.driveLevel=3;');
for(const id of get('NVSol.worlds.map(b=>b.id)')){
  run(`s.space.phase='flight';s.space.hull=100;s.space.body='earth';NVSpace.select(s,'${id}');NVSpace.cruise(s);const steps_${id}=Math.ceil(s.space.flightDuration/.1)+5;for(let i=0;i<steps_${id}&&s.space.autopilot;i++)NVSpace.step(s,.1);`);
  assert.equal(run('s.space.autopilot'),false,id+' course must finish');
  assert.ok(run('s.space.hull')>0,id+' guided course must not strand the player');
  assert.equal(run('NVSpace.approach(s)'),true,id+' approach must be available');
  run('for(let i=0;i<121;i++)NVSpace.step(s,.1);');assert.equal(run('s.space.body'),id);assert.equal(run('s.space.phase'),id==='earth'?'off':'landed');
  assert.equal(run(`s.space.visited.includes('${id}')`),true);
  run('NVSpace.step(s,.1,{forward:1});');assert.ok(Number.isFinite(run('s.x')));assert.equal(run('NVSpace.board(s)'),true,id+' reboard');assert.equal(run('NVSpace.launch(s)'),true,id+' takeoff');run('for(let i=0;i<91;i++)NVSpace.step(s,.1);');assert.equal(run('s.space.phase'),'flight');
}
run("s.friendQuest='recruited';s.space.phase='landed';s.space.body='mars';s.x=s.space.landingX;s.z=s.space.landingZ;NVSpace.board(s);NVSpace.launch(s);for(let i=0;i<91;i++)NVSpace.step(s,.1);");assert.equal(run('s.space.crew'),true);
// Continuous collision tests catch tunnelling through an asteroid at boosted speed.
run("s.space.position=[1000,0,1000];s.space.collisionCooldown=0;NVSpace.collisions(s.space,[900,0,1000],[{position:[950,0,1000],radius:5}]);");assert.equal(run('s.space.hull'),82);run('NVSpace.collisions(s.space,[900,0,1000],[{position:[950,0,1000],radius:5}]);');assert.equal(run('s.space.hull'),82,'Collision cooldown prevents repeated damage while overlapping.');
run('s.inventory.scrap=2;NVSpace.repair(s);');assert.equal(run('s.space.hull'),100);assert.equal(run('s.inventory.scrap'),0);
run("s.space.hull=0;s.space.phase='disabled';NVSpace.recover(s);");assert.equal(run('s.space.hull'),35);assert.equal(run('s.space.body'),'earth');assert.equal(run('s.space.phase'),'flight');
// Manual checkpoints resume cockpit, flight, descent, and a walked-away landing location.
for(const phase of ['cockpit','launch','flight','descent','landed','ascent','disabled']){
 run(`s.space.phase='${phase}';s.space.body='charon';s.space.target='pluto';s.space.hull=66;s.space.elapsed=4.25;s.space.crew=true;s.x=24;s.z=21;letSaved=NVAntarctica.snapshot(s);restored=NVAntarctica.restored({antarctica:letSaved},'slot-one');`);
 assert.equal(run('restored.space.phase'),phase);assert.equal(run('restored.space.body'),'charon');assert.equal(run('restored.space.hull'),66);assert.equal(run('restored.space.crew'),true);assert.equal(run('restored.x'),24);assert.equal(run('restored.space.elapsed'),['launch','ascent','descent'].includes(phase)?2:4.25,'Transitions clamp older elapsed times to the current two-second duration');
}
run("s.space.phase='landed';s.space.body='charon';s.x=24;s.z=21;s.space.stationSupplies=false;NVSpace.station(s);");assert.equal(run('s.space.stationVisited'),true);assert.equal(run('s.space.hull'),100);const scrap=run('s.inventory.scrap');run('NVSpace.station(s);');assert.equal(run('s.inventory.scrap'),scrap,'Station supplies cannot be farmed by repeating interaction.');
run('s.space.body="jupiter";s.x=46;s.z=54;for(let i=0;i<300;i++)NVSpace.step(s,.1,{forward:1,right:1,boost:true});');assert.ok(run('Math.abs(s.x)')<=47);assert.ok(run('s.z')<=55);
run("s.space=NVSpace.restore({phase:'flight',body:'bad',target:'bad',position:[NaN,Infinity,2],hull:-50},s);");assert.deepEqual(get('s.space.position'),[0,0,0]);assert.equal(run('s.space.body'),'earth');assert.equal(run('s.space.phase'),'disabled');
for(const id of get('NVSol.worlds.map(b=>b.id)'))assert.ok(Number.isFinite(run(`NVSpace.surfaceHeight(872.4,-1381.2,22,'${id}')`)),id+' finite procedural terrain');
assert.equal(run('NVSpace.surfaceHeight(34,45,22,"mars")'),run('NVSpace.surfaceHeight(34,45,22,"mars")'));
assert.equal(run('NVSpace.surfaceHeight(24,25,22,"charon")'),0,'Station terrain must be level beneath its floor.');
assert.equal(run('NVSpace.surfaceGround(24,25,22,"charon")'),.6,'Feet must rest on the station floor.');
assert.ok(run('NVSol.byId.ganymede.radius')>run('NVSol.byId.mercury.radius'),'Ganymede is slightly larger than Mercury.');
console.log('Passed: 50 world round trips, boarding with/without Orion, continuous impacts, cooldown, repair/tow, all checkpoint phases, station services, level station ground, giant deck limits, and deterministic terrain.');
