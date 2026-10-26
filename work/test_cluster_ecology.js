const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console}),run=q=>vm.runInContext(q,ctx),data=q=>JSON.parse(run('JSON.stringify('+q+')'));
for(const f of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','galaxy_core.js','cluster_core.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
const authored=data('[NVSol.worlds,NVGalaxy.prime,NVGalaxy.moon]');
for(const f of ['cluster_ecology.js','ecology_core.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
run('let s=NVAntarctica.fresh(512);s.space=NVSpace.fresh();s.space.phase="landed";s.x=65;s.z=65;');
const systems=data('Object.keys(NVCluster.bodyLists)'),worlds=data('Object.values(NVCluster.bodyLists).flat()');assert.equal(systems.length,98);
let living=0,barren=0,predators=0,peaceful=0;const names=new Set(),morphs=new Set(),records=[];
for(const b of worlds){run(`s.space.body=${JSON.stringify(b.id)};s.space.system=${JSON.stringify(b.system)};s.space.phase='landed';s.space.ecologyOcean=false;`);const suitable=b.atmosphere&&!b.giant&&!b.stellar&&/^(Paradise|Frozen) (planet|moon)$/i.test(b.category);
 assert.equal(!!run('NVEcology.habitat(s)'),suitable,b.id+' '+b.category);
 if(!suitable){barren++;assert.equal(run('NVEcology.populate(s).animals.length'),0);assert.equal(run('NVEcology.species(s.space.body,s.seed).length'),0);continue;}
 living++;const species=data('NVEcology.species(s.space.body,s.seed)');assert.equal(species.length,6);assert.deepEqual(species,data('NVEcology.species(s.space.body,s.seed)'));
 assert.notDeepEqual(species,data('NVEcology.species(s.space.body,s.seed+1)'));
 for(const sp of species){assert(!names.has(sp.name),'Duplicate species name');names.add(sp.name);records.push(sp.id);assert(sp.description.includes(b.name));assert(sp.color.every(v=>Number.isFinite(v)&&v>=0&&v<=1));const shape=JSON.stringify({...sp.morph,seed:0});assert(!morphs.has(shape),'Duplicate body plan');morphs.add(shape);}
 assert(species.some(sp=>sp.behavior==='predator'));assert(species.some(sp=>sp.behavior==='peaceful'));
 const population=data('NVEcology.populate(s)');assert(population.animals.length>0&&population.plants.length>0);predators+=population.animals.filter(e=>e.species.behavior==='predator').length;peaceful+=population.animals.filter(e=>e.species.behavior!=='predator').length;
 run('NVEcology.step(s,.1);');assert(run('NVEcology.state(s).animals.every(a=>Number.isFinite(a.y)&&Number.isFinite(a.x)&&Number.isFinite(a.z))'));
}
assert(living>30&&barren>living);assert(predators>0&&predators<peaceful/2);
run(`s.ecology=NVEcology.restore({health:73,scanned:${JSON.stringify([...records,'invalid:0','cluster-99-p999:4'])}});`);assert.equal(run('s.ecology.scanned.length'),records.length);assert.equal(run('s.ecology.health'),73);assert.deepEqual(data('NVEcology.restore(NVEcology.snapshot(s)).scanned'),records);
const home=worlds.find(b=>b.atmosphere&&!b.giant&&/Paradise/.test(b.category));
run(`s.space.body=${JSON.stringify(home.id)};s.x=70;s.z=70;s.stamina=100;s.ecology=NVEcology.restore();let hunter=NVEcology.populate(s).animals.find(a=>a.species.behavior==='predator');hunter.x=70;hunter.z=71;hunter.homeX=70;hunter.homeZ=70;NVEcology.step(s,.1);`);
assert.equal(run('hunter.mode'),'hunting');assert.equal(run('s.ecology.health'),86);assert.equal(run('NVEcology.pulse(s)'),true);run('NVEcology.step(s,.1)');assert.equal(run('hunter.mode'),'fleeing');
run('s.space.landingX=0;s.space.landingZ=0;s.x=5000;s.z=5000;NVEcology.populate(s)');assert(run('NVEcology.state(s).chunks.size<=25'));assert(run('NVEcology.visible(s).animals.length<=24&&NVEcology.visible(s).plants.length<=80'));
assert.deepEqual(data('[NVSol.worlds,NVGalaxy.prime,NVGalaxy.moon]'),authored);
console.log(`Passed all 98 generated systems: ${living} living worlds / ${barren} barren worlds, ${records.length} unique persistent species, atmospheric gates, seed isolation, predator pursuit/repellent, safe bounded streaming, original Sol/Janira unchanged.`);
