const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,Math,Number,JSON,Set,Map});
for(const file of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','eris_core.js','construction_core.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),c);
const run=code=>vm.runInContext(code,c);
run(`let s=NVAntarctica.fresh(17);s.africaStarted=true;s.africaStage='complete';s.space=NVSpace.fresh();s.space.phase='flight';NVConstruction.update(s);`);
assert.equal(run('NVConstruction.ensure(s).stage'),0);
run(`s.space.phase='landed';s.space.body='moon';s.space.landingX=0;s.space.landingZ=0;NVConstruction.update(s);`);
assert.equal(run('NVConstruction.ensure(s).stage'),1);
assert.equal(run('NVConstruction.findTools(s)'),false);
run('let crate=NVConstruction.toolCrate(s);s.x=crate.x;s.z=crate.z;');assert.equal(run('NVConstruction.findTools(s)'),true);
for(const kind of ['wood','wood','stone','metal','metal','solarCell']){run(`{const n=NVConstruction.nodes(s).find(q=>q.kind==='${kind}');s.x=n.x;s.z=n.z;}`);assert.equal(run('NVConstruction.harvest(s)'),true);assert.equal(run('NVConstruction.harvest(s)'),false,'Harvested nodes must not duplicate');}
assert.equal(run('NVConstruction.ensure(s).stage'),3);
run('s.x=40;s.z=40;s.yaw=0;');
for(const [type,mat,yaw]of [['foundation','wood',0],['wall','wood',0],['wall','wood',Math.PI/2],['door','stone',Math.PI],['roof','stone',0],['stairs','metal',0],['solar','solar',0]])assert.match(run(`NVConstruction.place(s,'${type}','${mat}',${yaw})`),/built/);
assert.equal(run('NVConstruction.ensure(s).stage'),9);
const before=run('JSON.stringify(NVConstruction.ensure(s).stock)');assert.match(run("NVConstruction.place(s,'wall','wood',0)"),/already/);assert.equal(run('JSON.stringify(NVConstruction.ensure(s).stock)'),before);
run('let d=NVConstruction.localPieces(s).find(q=>q.type===\'door\');s.x=d.x;s.z=d.z;');assert.equal(run('NVConstruction.toggleDoor(s)'),true);assert.equal(run('d.open'),true);
run('let saved=NVAntarctica.snapshot(s);let e=NVEris.restore(saved.eris);');assert.equal(run('e.construction.stage'),9);assert.equal(run('e.construction.built.length'),7);assert.ok(run('e.construction.harvested.length')>=6);assert.equal(run('e.construction.built.find(q=>q.type===\'door\').open'),true);
assert.equal(run('NVEris.restore(null).construction.stage'),0);
for(const id of run('NVSol.worlds.map(q=>q.id)')){run(`s.space.body='${id}';s.space.geo=null;s.space.phase='landed';s.x=100;s.z=100;`);assert.ok(run('NVConstruction.nodes(s).length')>0,id+' has harvestable resources');}
run("s.space.body='eris';");assert.match(run("NVConstruction.place(s,'wall','wood')"),/not permitted/);
console.log('Passed Moon objective, tool proximity, all-world harvest nodes, finite deposits, resource costs, seven structure types/actions, tutorial completion, faction rules, manual snapshots and legacy saves.');

run(`let clickState=NVAntarctica.fresh(72);clickState.africaStarted=true;clickState.africaStage='complete';clickState.space=NVSpace.fresh();clickState.space.phase='landed';clickState.space.body='moon';let clickNode=NVConstruction.nodes(clickState).find(n=>n.kind==='stone');clickState.x=clickNode.x;clickState.z=clickNode.z;`);
assert.equal(run('NVConstruction.strike(clickState,clickNode.key).collected'),false);
assert.equal(run('NVConstruction.strike(clickState,clickNode.key).collected'),false);
assert.equal(run('NVConstruction.strike(clickState,clickNode.key).collected'),true);
assert.equal(run('NVConstruction.ensure(clickState).stock.stone'),8);
assert.equal(run('NVConstruction.strike(clickState,clickNode.key)'),null);
run(`clickNode=NVConstruction.nodes(clickState).find(n=>n.kind==='metal');clickState.x=clickNode.x;clickState.z=clickNode.z;`);
assert.equal(run('NVConstruction.strike(clickState,clickNode.key).collected'),false);
assert.equal(run('NVConstruction.ensure(clickState).stock.metal'),0);
run('NVConstruction.ensure(clickState).tools=true');
for(let i=0;i<3;i++)run('NVConstruction.strike(clickState,clickNode.key)');
assert.equal(run('NVConstruction.ensure(clickState).stock.metal'),8);
run('clickState.x+=20');assert.equal(run('NVConstruction.strike(clickState,clickNode.key)'),null);
console.log('Passed three-hit gathering, inventory credit, deposit depletion, tool requirement and reach validation.');
