const fs=require('fs'),vm=require('vm'),assert=require('assert');const c=vm.createContext({});
for(const file of ['antarctica_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','eris_core.js','citadel_collision.js','eris_family.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),c);
const run=s=>vm.runInContext(s,c),get=s=>JSON.parse(JSON.stringify(run(s)));
run("let s=NVAntarctica.fresh(10);s.africaStarted=true;s.africaStage='complete';s.jamesIntroductionDone=true;s.space=NVSpace.fresh();s.space.body='eris';s.space.phase='landed';s.space.time=1;s.x=-7;s.z=63;");
assert.equal(run('NVErisFamily.npcs(s).length'),2);assert.equal(run('NVEris.nearest(s).name'),'Nyrexia Erisconos');
for(const kind of ['nyrexia','alexia'])assert.equal(run(`NVEris.lines(s,{kind:'${kind}'}).length`),5);
assert.equal(run('NVErisFamily.ensure(s).recruited'),false);assert(run('NVErisFamily.recruit(s)'));assert(!run('NVErisFamily.recruit(s)'));
run('s.x=-7;s.z=62;NVErisFamily.follow(s,.1);');assert.equal(run('NVErisFamily.npcs(s).filter(n=>n.kind==="nyrexia").length'),1);
run("s.space.body='mars';s.x=50;s.z=25;NVErisFamily.follow(s,.1);");assert.equal(run('NVErisFamily.ensure(s).body'),'mars');assert.equal(run('NVErisFamily.npcs(s).length'),1);
assert.notEqual(run('NVEris.nearest(s)?.kind'),'nyrexia','recruited companion has no initial dialogue prompt');
const snapshot=get('NVEris.snapshot(s)');c.saved=snapshot;assert.equal(run('NVEris.restore(saved).nyrexia.recruited'),true);assert.equal(run('NVEris.restore({}).nyrexia.recruited'),false);
run("s.space.phase='flight'");assert.equal(run('NVErisFamily.npcs(s).length'),0);
assert.deepEqual(get("erisFamilyPart({name:'Sixteen pleat bell gown',c:[1,1,1]},'alexia').c"),[.025,.022,.034]);assert.deepEqual(get("erisFamilyPart({name:'Face',c:[.8,.7,.6]},'alexia').c"),[.8,.7,.6]);
console.log('Passed sisters, five lines each, optional/idempotent recruitment, no duplicate companion, cross-world follow, manual restore, old-save migration, boarding and black clothes.');

run("s.space.body='eris';s.space.phase='landed';s.eris.nyrexia.recruited=false;s.eris.solWar={solFall:{settled:true,stage:'done'}};");assert.equal(run('NVErisFamily.npcs(s).some(n=>n.kind==="nyrexia")'),false);assert.equal(run('NVErisFamily.recruit(s)'),false);run('s.eris.nyrexia.recruited=true');assert.equal(run('NVErisFamily.npcs(s).some(n=>n.kind==="nyrexia")'),true);
