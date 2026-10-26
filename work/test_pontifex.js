const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let storageWrites=0;
const context=vm.createContext({console,Math,Number,JSON,Map,Set,Date,localStorage:{setItem(){storageWrites++;},removeItem(){storageWrites++;},getItem(){return null;}}});
const run=source=>vm.runInContext(source,context);
for(const name of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','ecology_core.js','eris_core.js','sol_war_core.js','pontifex_core.js','brown_story_core.js'])run(fs.readFileSync(__dirname+'/'+name,'utf8'));
run(`
 function campaign(seed=100){
  const s=NVAntarctica.fresh(seed);s.africaStarted=true;s.africaStage='complete';
  s.bedRested=true;s.ferryEscaped=true;s.betrayalStage='complete';s.jamesIntroductionDone=true;
  s.space=NVSpace.fresh();s.space.phase='flight';s.space.body='mars';
  NVSolWar.ensure(s).stage='war';NVBrownStory.ensure(s).brownDefeated=true;NVSolWar.ships(s);return s;
 }
 function holdFleet(s){
  for(const v of NVSolWar.ships(s)){
   v.front=-1;v.travel={start:v.position.slice(),end:v.position.slice(),elapsed:0,duration:1e7,body:v.home};
   v.mode='transit';v.cooldown=1e6;
  }
 }
 let s=campaign();
`);

// Tests below exercise production loss hooks, not a duplicate of spawning logic.
assert.equal(run('NVPontifex.ensure(s).alive'),false,'A fresh campaign has no living boss.');
run('NVSolWar.damage(s,NVSolWar.ships(s).find(v=>v.originFaction===\'HUMAN\').id,1e9);');
assert.equal(run('NVPontifex.ensure(s).alive'),false,'A Human Federation casualty does not produce a Terra Imperia boss.');
run('NVSolWar.damage(s,NVSolWar.ships(s).find(v=>v.leader===\'vishara\').id,1e9);');
assert.equal(run('NVPontifex.ensure(s).alive'),false,'The queen\'s destroyed ship does not produce a Terra Imperia boss.');
run('let fallen=NVSolWar.ships(s).find(v=>v.originFaction===\'TERRA\'&&!v.leader);let birthEvents=NVSolWar.damage(s,fallen.id,1e9);');
assert.equal(run('NVPontifex.ensure(s).alive'),true,'The real warship damage/loss path creates the boss.');
assert.equal(run('NVPontifex.ensure(s).generation'),1);
assert.ok(run('NVPontifex.ensure(s).hp')>0);
assert.ok(run('!!NVSol.byId[NVPontifex.ensure(s).body]'));
assert.ok(run('birthEvents.join(\' \')').toUpperCase().includes('PONTIFEX'));
run('let birth=JSON.stringify(NVPontifex.ensure(s));NVSolWar.damage(s,fallen.id,1e9);NVSolWar.damage(s,NVSolWar.ships(s).find(v=>v.originFaction===\'TERRA\'&&v.hp>0).id,1e9);');
assert.equal(run('JSON.stringify(NVPontifex.ensure(s))'),run('birth'),'A repeated loss or another death cannot duplicate or replace the living boss.');

// Real AI salvos use the same death transition as direct ship damage.
run(`
 let ai=campaign(101);holdFleet(ai);let aw=NVSolWar.ensure(ai);
 let victim=aw.fleet.find(v=>v.originFaction==='TERRA'&&NVPontifex.soldierGender(v)==='male'),attacker=aw.fleet.find(v=>v.originFaction==='HUMAN');
 const at=NVSol.byId.mars.position;const radius=NVSol.byId.mars.radius;
 for(const v of [victim,attacker]){v.body='mars';v.front=NVSolWar.TARGETS.indexOf('mars');v.travel=null;v.mode='engage';v.position=[at[0]+radius+150,at[1]+radius+60,at[2]+(v===attacker?40:0)];}
 victim.hp=1;victim.cooldown=1e6;attacker.cooldown=0;
 let aiEvents=NVSolWar.step(ai,.2);
`);
assert.equal(run('victim.hp'),0,'An actual hostile salvo destroys the isolated Terra ship.');
assert.equal(run('NVPontifex.ensure(ai).alive'),true,'AI space casualties produce a boss too.');
assert.equal(run('NVPontifex.ensure(ai).generation'),1);
assert.ok(run('aiEvents.join(\' \')').toUpperCase().includes('PONTIFEX'));

run('victim.respawn=.01;NVSolWar.step(ai,.2);');
assert.ok(run('victim.hp')>0,'A ship can return as an ordinary reinforcement.');
assert.equal(run('NVPontifex.ensure(ai).generation'),1,'Ship reinforcement cannot duplicate the boss.');

// Damage ownership is strict even for lethal amounts and missing sources.
const hp=run('NVPontifex.ensure(s).hp');
for(const source of [undefined,'companion','orion','nyrexia','TERRA','HUMAN','ERISIAN','predator','environment','collision']){
 const literal=source===undefined?'undefined':JSON.stringify(source);
 assert.equal(run(`NVPontifex.damage(s,1e9,${literal})`),false);
 assert.equal(run('NVPontifex.ensure(s).hp'),hp);
 assert.equal(run('NVPontifex.ensure(s).alive'),true);
}
for(const invalid of ['0','-1','NaN','Infinity','"100"'])assert.equal(run(`NVPontifex.damage(s,${invalid},'player')`),false);
run('let q=NVPontifex.ensure(s);');
assert.equal(run('NVPontifex.local(s)'),null,'The ground boss does not appear during flight.');
run('s.space.phase="landed";s.space.body=q.body;s.x=13;s.z=-21;');
assert.ok(run('NVPontifex.local(s).distance')>run('NVPontifex.RANGE'));
assert.equal(run('NVPontifex.strike(s,"player")'),false,'The player cannot strike outside weapon range.');
run('let n=NVPontifex.local(s);s.x=n.x;s.z=n.z;');
assert.equal(run('NVPontifex.strike(s,"companion")'),false);
assert.equal(run('NVPontifex.strike(s)'),false);
assert.equal(run('NVPontifex.strike(s,"player")'),true);
assert.equal(run('q.hp'),hp-540);
assert.equal(run('NVPontifex.strike(s,"player")'),false,'A held button cannot ignore the weapon cooldown.');
run('q.weaponCooldown=0;q.mode="recovery";');
assert.equal(run('NVPontifex.strike(s,"player")'),true);
assert.equal(run('q.hp'),hp-540-1200,'The exposed core rewards attacking during recovery.');
run('s.space.ecologyOcean=true;');assert.equal(run('NVPontifex.local(s)'),null);
run('s.space.ecologyOcean=false;s.aerialView=true;');assert.equal(run('NVPontifex.local(s)'),null);
run('s.aerialView=false;s.space.body=q.body==="mercury"?"mars":"mercury";');assert.equal(run('NVPontifex.local(s)'),null);
run('s.space.body=q.body;');

// Actual character snapshots preserve the living nemesis and its fixed site.
run('q.mode="windup";q.timer=.45;q.action="slam";q.attackCount=4;q.offset={x:6,z:-4};let manual=JSON.parse(JSON.stringify(NVAntarctica.snapshot(s)));let restored=NVAntarctica.restored({chapter:3,antarctica:manual},"slot-A");let rq=NVPontifex.ensure(restored);');
for(const key of ['alive','generation','kills','hp','body','sourceCaptain','sourceShip','createdAt','yaw','mode','action','timer','attackCount'])assert.equal(run(`rq.${key}`),run(`q.${key}`),`Manual save restores ${key}.`);
for(const key of ['site','offset'])assert.equal(run(`JSON.stringify(rq.${key})`),run(`JSON.stringify(q.${key})`),`Manual save restores ${key}.`);
run('let savedHP=manual.eris.solWar.pontifex.hp;NVPontifex.damage(restored,400,"player");');
assert.equal(run('manual.eris.solWar.pontifex.hp'),run('savedHP'),'Continuing does not mutate the saved snapshot.');
assert.equal(run('q.hp'),run('savedHP'),'Loaded characters have independent boss state.');
run('let other=campaign(300);');
assert.equal(run('NVPontifex.ensure(other).alive'),false,'A different character starts with its own empty nemesis state.');
run('let legacy=JSON.parse(JSON.stringify(manual));delete legacy.eris.solWar.pontifex;let oldCharacter=NVAntarctica.restored({chapter:3,antarctica:legacy},"old-slot");');
assert.equal(run('NVPontifex.ensure(oldCharacter).alive'),false,'Older save files migrate without inventing a boss.');
assert.equal(run('NVSolWar.ships(oldCharacter).length'),308,'Boss migration preserves the existing fleet.');

// A valid player kill pays its reward once; a later space casualty can create
// the next generation, while retaining the character's defeated-boss total.
run('let beforeScrap=s.inventory.scrap;');
assert.equal(run('NVPontifex.damage(s,1e9,"player")'),true);
assert.equal(run('q.alive'),false);assert.equal(run('q.hp'),0);assert.equal(run('q.kills'),1);
assert.equal(run('s.inventory.scrap'),run('beforeScrap')+40);
assert.equal(run('NVPontifex.damage(s,1e9,"player")'),false);
assert.equal(run('s.inventory.scrap'),run('beforeScrap')+40,'Repeated damage cannot farm the reward.');
run('let defeated=NVAntarctica.restored({chapter:3,antarctica:NVAntarctica.snapshot(s)},"slot-A");');
assert.equal(run('NVPontifex.ensure(defeated).alive'),false);assert.equal(run('NVPontifex.ensure(defeated).kills'),1);
run('NVSolWar.damage(s,NVSolWar.ships(s).find(v=>v.originFaction==="TERRA"&&v.hp>0&&NVPontifex.soldierGender(v)==="male").id,1e9);');
assert.equal(run('NVPontifex.ensure(s).alive'),true);assert.equal(run('NVPontifex.ensure(s).generation'),2);assert.equal(run('NVPontifex.ensure(s).kills'),1);
assert.equal(run('NVPontifex.ensure(s).hp'),run('NVPontifex.MAX_HP'));

// The polearm tells the player when to evade; damage lands only at release.
run(`
 let combat=campaign(400);NVSolWar.damage(combat,NVSolWar.ships(combat).find(v=>v.originFaction==='TERRA'&&NVPontifex.soldierGender(v)==='male').id,1e9);let cq=NVPontifex.ensure(combat);
 combat.space.phase='landed';combat.space.body=cq.body;let cn=NVPontifex.local(combat);
 combat.x=cn.x;combat.z=cn.z+3;let health=NVEcology.ensure(combat);
 NVPontifex.step(combat,.1);
`);
assert.equal(run('cq.mode'),'windup');assert.equal(run('health.health'),100,'The windup itself does not deal damage.');
run('cq.action="sweep";cq.yaw=0;cq.timer=.01;NVPontifex.step(combat,.1);');
assert.equal(run('cq.mode'),'release');assert.equal(run('health.health'),76,'The telegraphed frontal sweep damages a nearby grounded player.');
run('combat.jumpOffset=1.2;cq.mode="windup";cq.action="sweep";cq.timer=.01;NVPontifex.step(combat,.1);');
assert.equal(run('health.health'),76,'A successful jump evades the low sweep.');
run('combat.jumpOffset=0;cq.mode="windup";cq.action="slam";cq.timer=.01;NVPontifex.step(combat,.1);');
assert.equal(run('health.health'),44);
run('cn=NVPontifex.local(combat);combat.x=cn.x+12;combat.z=cn.z;cq.aim={x:combat.x-cn.homeX,z:combat.z-cn.homeZ};combat.x+=4;cq.mode="windup";cq.action="lance";cq.timer=.01;NVPontifex.step(combat,.1);');
assert.equal(run('health.health'),44,'Moving away from the locked lance target evades the strike.');
run('cn=NVPontifex.local(combat);combat.x=cn.x;combat.z=cn.z+3;health.health=10;cq.mode="windup";cq.action="slam";cq.timer=.01;let bossHP=cq.hp;NVPontifex.step(combat,.1);');
assert.equal(run('health.health'),100,'Player defeat activates the existing suit recovery.');
assert.equal(run('cq.alive'),true);assert.equal(run('cq.hp'),run('bossHP'),'Player recovery does not kill or reset the boss.');
assert.equal(run('combat.x'),run('combat.space.landingX'));assert.equal(run('combat.z'),run('combat.space.landingZ')-11);

// A stored world anchor survives landing somewhere else on the same planet.
run(`
 let geographic=campaign(500);NVSolWar.damage(geographic,NVSolWar.ships(geographic).find(v=>v.originFaction==='TERRA'&&NVPontifex.soldierGender(v)==='male').id,1e9);geographic.space.phase='landed';
 let gq=NVPontifex.ensure(geographic);geographic.space.body=gq.body;
 geographic.space.geo={global:true,lat:10,lon:20};geographic.space.landingX=400;geographic.space.landingZ=500;
 geographic.x=410;geographic.z=510;NVPontifex.local(geographic);let siteJSON=JSON.stringify(gq.site);
 geographic.space.geo={global:true,lat:11,lon:21};geographic.space.landingX=900;geographic.space.landingZ=800;
 let relocated=NVPontifex.local(geographic);
 let expectedX=900+NVWorldFlight.wrap(gq.site.lon-21)*24000*Math.cos(11*Math.PI/180)+gq.site.x;
 let expectedZ=800+(gq.site.lat-11)*24000+gq.site.z;
`);
assert.equal(run('JSON.stringify(gq.site)'),run('siteJSON'),'A second landing cannot move the boss to a new site.');
assert.ok(Math.abs(run('relocated.homeX-expectedX'))<1e-7);assert.ok(Math.abs(run('relocated.homeZ-expectedZ'))<1e-7);
for(const raw of ['null','{}','{alive:true,hp:24000,generation:0}','{alive:true,hp:NaN,generation:2}','{alive:false,hp:2000,generation:2}'])assert.equal(run(`NVPontifex.restore(${raw}).alive`),false,'Invalid or dead records cannot resurrect a living boss.');
assert.equal(storageWrites,0,'Spawning, combat, defeat and loading never autosave.');
console.log('Passed actual API and AI space deaths, single living boss, reinforcement guard, strict player-only damage, range/cooldown/recovery combat, telegraph/jump/dodge/suit recovery, world restrictions and fixed geographical site, manual character persistence, legacy migration, independent saves and later generations.');
