const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('work/carax_assault.js','utf8').split('\n(()=>{const id=NVCarax.ID')[0];
const context={Math,Number,Array,Map,Set,WeakMap,structuredClone,
 NVCatharsisRoute:{CORE:'sagittarius-a',ensure:s=>s.route},
 NVCatharsisFinal:{active:s=>s.route.finalStage==='active',locked:s=>s.route.finalStage==='active'},
 NVGovernance:{ensure:()=>({colonies:{}})},NVCrewDiplomacy:{ensure:()=>({assignments:{}}),member:()=>null},
 NVWorldFlight:{wrap:x=>x},NVEcology:{ensure:s=>s.ecology},
 NVCompanionCombat:{C:{rifle:[1.1,.3,20,30],ice:[1.7,.65,24,28],orb:[1.9,.85,26,22],hammer1:[1.5,.75,34,4]}},
 NVSpace:{notice:()=>{}}};
vm.createContext(context);vm.runInContext(source+'\nglobalThis.carax=NVCarax;',context);
const s={route:{finalStage:'active'},space:{system:'sagittarius-a',body:'carax',phase:'landed',geo:{lat:0,lon:0},landingX:0,landingZ:0},x:0,z:80,ecology:{health:100}};
const c=context.carax,q=c.ensure(s);c.rally(s);assert.equal(q.forces.filter(a=>a.leader).length,5);const start=q.guards[0].reduce((n,a)=>n+a.hp,0);for(let i=0;i<1200;i++)c.step(s,.1);assert(q.guards[0].reduce((n,a)=>n+a.hp,0)<start,JSON.stringify(q.forces.slice(0,3)));assert(q.forces.every(a=>a.deck===0));
const copy=c.restore(q);assert.equal(copy.secured.length,5);assert.equal(copy.guards.length,5);assert.equal(copy.forces.length,q.forces.length);assert.equal(copy.rover.driving,false);
console.log('Passed independent allied pathfinding through staircase entrance, automatic faction attacks, five leaders, and assault save restoration.');

context.NVQuests={update:s=>s.eris.quests};context.NVCatharsisRoute.FINAL='chapter4-sagittarius-a';
const migration=fs.readFileSync('work/carax_assault.js','utf8').split('const caraxQuestUpdate=')[1].split('\n')[0];
vm.runInContext('const caraxQuestUpdate='+migration,context);
const legacy={eris:{catharsisCoreRoute:{finalStage:'none'},quests:{completed:['earlier-quest','chapter4-sagittarius-a']}}};
context.NVQuests.update(legacy);assert.deepEqual(legacy.eris.quests.completed,['earlier-quest']);legacy.eris.catharsisCoreRoute.finalStage='complete';legacy.eris.quests.completed.push('chapter4-sagittarius-a');context.NVQuests.update(legacy);assert(legacy.eris.quests.completed.includes('chapter4-sagittarius-a'));
console.log('Passed legacy core-arrival journal migration without removing earlier quests or completed fortress victories.');
