const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math,Map,Set,WeakMap,Number});
vm.runInContext(`
const NVProjectBC={};
const NVEris={world:s=>s.body,groundPlay:s=>s.ground};
const NVCustomCrew={followers:s=>s.crew.filter(n=>n.follow),followerPoses:s=>s.poses,followStep(){}};
const NVOccupation={local:s=>s.bases||[]};
const NVDiplomacy={relation:(s,f)=>f==='TERRA'?'WAR':'ALLIED'};
const NVKhazglar={troopsNearby:s=>s.body==='mars',location:()=>({x:0,z:0}),battle:s=>s.battle,fighting:s=>s.body==='mars'&&s.battle.soldiers.some(a=>a.hp>0)};
const NVEcology={populate:s=>s.wildlife,ensure:s=>s.ecology,recover:s=>s.ecology.health=100};
const NVPontifex={lineOfSight:()=>true,local:()=>null};
function make(kind){const n={id:'custom-1',name:kind,follow:true,model:{id:'glb-project-bc-'+kind}};return{body:'mars',ground:true,crew:[n],poses:new Map([[n.id,{x:0,z:0,yaw:0,speed:0}]]),battle:{soldiers:[{x:5,z:0,hp:500,mode:'chase'}]},wildlife:{animals:[]},ecology:{health:100},x:0,z:0};}
`,c);
vm.runInContext(fs.readFileSync('work/project_bc_combat.js','utf8'),c);
const run=code=>vm.runInContext(code,c);
for(const [asset,kind] of [['josiah-richards','josiah'],['peter-chambers','peter'],['gareth-williams','gareth'],['gareth-tank-top','gareth']]){
 run(`var s=make('${asset}'),n=s.crew[0];`);assert.equal(run('NVBCCombat.kind(n)'),kind);
 for(let i=0;i<8;i++)run('NVBCCombat.step(s,.1)');
 assert(run('s.battle.soldiers[0].hp<500'));
 if(kind!=='gareth')assert(run('NVBCCombat.bound(s.battle.soldiers[0])'));
 else assert(run('NVBCCombat.state(s).actors.get(n.id).shots===2'));
 assert.equal(run(`NVBCCombat.TAUNTS.${kind}.length`),5);
 assert.equal(run(`new Set(NVBCCombat.TAUNTS.${kind}).size`),5);
 run('s.crew[0].follow=false;var before=s.battle.soldiers[0].hp;for(let i=0;i<100;i++)NVBCCombat.step(s,.1)');
 assert.equal(run('s.battle.soldiers[0].hp'),run('before'));
}
run("s=make('josiah-richards');n=s.crew[0];NVBCCombat.actor(s,n).attacks=2;s.battle.soldiers.push({x:6,z:1,hp:500,mode:'chase'});for(let i=0;i<14;i++)NVBCCombat.step(s,.1)");
assert(run('s.battle.soldiers.every(a=>a.hp===435)'));assert(run("NVBCCombat.state(s).effects.some(e=>e.type==='wave')"));assert.equal(run('NVBCCombat.state(s).caption.text'),'ALMIGHTY HEAVEN!');
run("s=make('peter-chambers');n=s.crew[0];NVBCCombat.actor(s,n).attacks=2;NVBCCombat.step(s,.1)");assert.equal(run('NVBCCombat.pose(s,n.id).mode'),'chains');
run("s=make('gareth-tank-top');n=s.crew[0];NVBCCombat.trip(s,n)");assert.equal(run('NVBCCombat.state(s).caption.text'),"OW! I'M OKAY!");assert.equal(run('NVBCCombat.pose(s,n.id).mode'),'trip');run('s.battle.soldiers=[];for(let i=0;i<20;i++)NVBCCombat.step(s,.1)');assert.equal(run('NVBCCombat.pose(s,n.id).mode'),'idle');
// Peaceful fauna and allied patrols never become valid targets.
run("s=make('peter-chambers');s.body='titan';s.bases=[{body:'titan',faction:'HUMAN',x:0,z:0,lat:0,lon:0}];s.wildlife.animals=[{x:3,z:0,mode:'hunting',species:{behavior:'neutral'}}]");assert.equal(run('NVBCCombat.targets(s).length'),0);
run("s.wildlife.animals.push({x:3,z:0,mode:'hunting',species:{behavior:'predator'}});for(let i=0;i<8;i++)NVBCCombat.step(s,.1)");assert(run('s.wildlife.animals[1].bcHP<100'));assert(run('NVBCCombat.bound(s.wildlife.animals[1])'));assert.equal(run('s.wildlife.animals[0].bcHP'),undefined);
// Separate saves, aboard companions and governors cannot share or run attacks.
run("var other=make('peter-chambers');other.space={interior:{active:true}};NVBCCombat.step(other,.1)");assert.equal(run('other.battle.soldiers[0].hp'),500);assert.equal(run('NVBCCombat.state(other).effects.length'),0);
run("other.space=null;other.crew[0].follow=false;for(let i=0;i<100;i++)NVBCCombat.step(other,.1)");assert.equal(run('other.battle.soldiers[0].hp'),500);
run('var a={},b={};NVBCCombat.restrain(a,2)');assert(run('NVBCCombat.held(a,.1)'));assert(!run('NVBCCombat.held(b,.1)'));run('for(let i=0;i<30;i++)NVBCCombat.held(a,.1)');assert(!run('NVBCCombat.bound(a)'));
console.log('Passed four model identities, chains and real damage, Josiah-only AoE, alternate pistols, five taunts each, trip recovery, restraint expiry, neutral/allied safety, follower-only combat and independent world runtimes.');
