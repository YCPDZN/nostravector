const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={Math,Number,NVCatharsisFinal:{WARNING:'original'},NVCatharsisRoute:{ensure:s=>s.route}};vm.createContext(c);
for(const file of ['vengeful_mascar_core.js','carax_bosses_core.js','carax_endings_core.js','beam_struggle_core.js','good_ending_core.js'])vm.runInContext(fs.readFileSync('work/'+file,'utf8').split('const endingRouteRestore=')[0].split('const mascarRestore=')[0].split('const caraxBossRestore=')[0],c);
const E=vm.runInContext('NVCaraxEndings',c),B=c.NVBeamStruggle,G=vm.runInContext('NVGoodEnding',c);
const q=()=>({route:'good',stage:'cinematic',shot:7,time:8,voiceTime:0,beam:null});
assert.equal(E.GOOD_INTRO.length,8);assert(!E.GOOD_INTRO.some(([who])=>/traveller|wanderer/i.test(who)));assert(E.GOOD_INTRO.slice(1).every(([,t])=>t===t.toUpperCase()));
for(const shot of [0,1,7]){const p=G.beat({...q(),shot,time:3});assert(p.impact[2]<p.rifle[2]);assert(Math.abs(p.impact[2]-p.zarkZ)<.2);}
let s=q();assert(B.start(s));assert.equal(B.step(s,4.999),'');assert(B.fire(s));for(let i=0;i<41;i++)B.step(s,.1);assert.equal(s.beam.stage,'complete');assert.equal(s.shot,8);
s=q();B.start(s);assert.equal(B.step(s,5),'qte-failed');assert(!B.fire(s));for(let i=0;i<46;i++)B.step(s,.1);assert.equal(s.beam.stage,'gameover');assert.equal(s.beam.failures,1);assert(B.beginBattle(s));assert.equal(s.beam.enemy.hp,750000);
for(let index=0;index<4;index++){
 assert.equal(s.beam.index,index);assert.equal(s.beam.enemy.hp,[750000,500000,1000000,3000000][index]);
 for(let n=0;n<5;n++){s.beam.enemy.quote=n;assert.equal(typeof B.quote(s),'string');if(index===3)assert.equal(B.quote(s),vm.runInContext('NVCaraxBosses.ZARK_QUOTES',c)[n]);}
 // Each animation/attack resolves once and can damage a stationary player at its marker.
 for(const id of B.DEFS[index].patterns){s.beam.enemy.action=id;s.beam.enemy.elapsed=0;s.beam.enemy.hits=0;s.beam.player.hp=100;s.beam.player.jump=0;s.beam.player.vy=0;s.beam.enemy.start={x:0,z:0};s.beam.enemy.aim={x:0,z:0};s.beam.enemy.markers=[{x:0,z:0}];s.beam.player.x=0;s.beam.player.z=0;s.beam.enemy.x=0;s.beam.enemy.z=0;
  const a=B.spec(s);assert(a.wind>0&&a.hits.length&&a.duration>a.wind);for(let i=0;i<Math.ceil(a.hits.at(-1)*10)+1;i++)B.step(s,.1);assert(s.beam.player.hp<100,id+' hits');
 }
 s.beam.enemy.action='idle';s.beam.player.hp=100;s.beam.enemy.x=0;s.beam.enemy.z=-6;s.beam.player.x=0;s.beam.player.z=8;B.jump(s);B.step(s,.1,{right:true});assert(s.beam.player.x>0&&s.beam.player.jump>0);
 B.shoot(s);const restored=B.restore(JSON.parse(JSON.stringify(s.beam)));assert.equal(restored.enemy.hp,s.beam.enemy.hp);assert.equal(restored.index,index);assert.equal(restored.player.hp,s.beam.player.hp);
 // A fallen player retries only the current enemy.
 s.beam.player.hp=1;s.beam.player.jump=0;s.beam.player.vy=0;B.startAttack(s);const a=B.spec(s),m=s.beam.enemy.markers[0];s.beam.player.x=m.x;s.beam.player.z=m.z;s.beam.enemy.elapsed=a.hits[0]-.01;assert.equal(B.step(s,.02),'player-fell');assert.equal(s.route,['bad','bad-tyrotaronus','bad-josiah','bad-zark'][index]);assert.equal(s.shot,1);assert(s.nightmareDefeat);assert(E.fatal(s));s.route='good';s.beam.stage='gameover';assert(B.beginBattle(s));assert.equal(s.beam.index,index);assert.equal(s.beam.enemy.hp,B.DEFS[index].hp);
 // Finish with the real damage function; no direct HP-zero completion bypass.
 while(s.beam.enemy.hp>0){s.beam.cooldown=0;assert(B.shoot(s));}assert.equal(s.beam.stage,'interlude');for(let i=0;i<26;i++)B.step(s,.1);
}
assert.equal(s.shot,0);assert.equal(s.beam.stage,'none');assert.equal(s.beam.failures,1);assert(B.start(s));
for(const raw of [{route:'good',stage:'cinematic',shot:1},{route:'good',stage:'cinematic',shot:10,goodVersion:2}]){const r=E.restore(raw);assert.equal(r.shot,9);assert.equal(r.goodVersion,3);assert.equal(E.restore(r).shot,9);}
assert.equal(E.restore({route:'good',stage:'cinematic',shot:8,goodVersion:2}).shot,7);assert.equal(E.restore({route:'neutral',stage:'cinematic',shot:1}).shot,1);
console.log('Passed exact QTE deadline/success/failure, four HP/attack sets, movement/jump/shooting, villain-specific fatal routes, ledger restoration, four victories and rescue replay, beam target, no player dialogue, and legacy migrations.');


for(const route of ['bad','bad-tyrotaronus','bad-josiah','bad-zark']){const normal=E.restore({route,stage:'cinematic',shot:0});assert.equal(normal.shot,0);assert(!normal.nightmareDefeat);const nightmare=E.restore({route,stage:'cinematic',shot:0,voiceTime:4,time:4,nightmareDefeat:true});assert.equal(nightmare.shot,1);assert.equal(nightmare.voiceTime,0);assert.equal(nightmare.time,0);assert.equal(E.restore(nightmare).shot,1);const legacy=E.restore({route,stage:'cinematic',shot:0,beam:{stage:'complete',failures:1}});assert.equal(legacy.shot,1);}
console.log('Passed nightmare-only opening skip, persisted origin, legacy nightmare migration and unchanged original bad-route openings.');
