const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);Object.defineProperty(a,'preload',{get:()=>a.getAttribute('preload')||'none',set:v=>a.setAttribute('preload',v==='metadata'?'none':v)});return a;};});
 await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
 const fixture=fs.readFileSync('work/test_karribassa_bosses_browser.js','utf8').replace(/\r/g,'').split('await p.evaluate(()=>{')[1].split('});\n // Anchors')[0];await p.evaluate(fixture);
 const saved=await p.evaluate(()=>JSON.stringify({...localStorage}));
 const result=await p.evaluate(()=>{
  const check=(ok,msg)=>{if(!ok)throw Error(msg);},s=polarState,q=NVSiegeOfSol.ensure(s),p=s.space,b=NVSol.byId.mercury;
  Object.assign(q,{stage:'war',seed:23,general:NVSiegeOfSol.general(23)});NVJaniraBlockade.ensure(s).active=false;
  Object.assign(p,{system:'sol',phase:'flight',body:'mercury',hull:100,warp:null,position:b.position.map((x,i)=>x+(i===1?3000:0))});p.interior={active:false};
  const fleet=NVSiegeOfSol.fleet(s);NVSiegeOfSol.step(s,.1);
  const ids=NVSiegeOfSol.interceptors(s,fleet);check(ids.size===12,'Mercury dispatches twelve interceptors');
  const enemy=fleet.find(v=>ids.has(v.id)),distance=NVSpace.distance(enemy.position,p.position);NVSiegeOfSol.step(s,.1);
  check(NVSpace.distance(enemy.position,p.position)<distance-40,'Defender closes distance instead of resetting to orbit');check(enemy.mode==='intercept','Pursuit mode');
  let sawLaser=false;for(let i=0;i<50;i++){NVSiegeOfSol.step(s,.1);NVShipReward.step(s,.1);sawLaser ||= NVShipReward.weapons(s).incoming.length>0;}
  check(p.hull<100&&p.hull>60,'Reduced hostile damage reaches player');check(sawLaser,'Incoming laser traces');
  const hits=100-p.hull;
  // Incoming fire must not depend on owning the rewarded ship.
  const r=NVShipReward.ensure(s);r.claimed=false;r.stage='pending';p.shipId='starter';p.hull=100;
  fleet.forEach(v=>v.playerWeaponCooldown=0);NVShipReward.step(s,.1);check(p.hull===94,'Starter ship receives three two-point hits');
  check(!NVShipReward.fire(s),'Starter ship does not gain reward turrets');
  // Safe states do not acquire or damage the player.
  for(const phase of ['landed','descent','disabled']){p.phase=phase;const hp=p.hull;check(!NVSiegeOfSol.interceptors(s,fleet).size,'No interception outside flight');NVShipReward.step(s,.1);check(p.hull===hp,'No incoming damage outside flight');}
  p.phase='flight';p.warp={};check(!NVSiegeOfSol.interceptors(s,fleet).size,'Warp protected');const hp=p.hull;NVShipReward.step(s,.1);check(p.hull===hp,'Warp takes no fire');p.warp=null;
  p.interior.active=true;check(!NVSiegeOfSol.interceptors(s,fleet).size,'Interior protected');NVShipReward.step(s,.1);check(p.hull===hp,'Interior takes no fire');p.interior.active=false;
  p.position=b.position.map((x,i)=>x+(i===1?10000:0));check(!NVSiegeOfSol.interceptors(s,fleet).size,'No Mercury interception outside local range');
  // Bodies occlude weapons; allied ships never fire at the player.
  p.position=b.position.map((x,i)=>x+(i===1?b.radius+50:0));fleet.forEach(v=>v.hp=0);enemy.hp=300;enemy.position=b.position.map((x,i)=>x-(i===1?b.radius+50:0));enemy.playerWeaponCooldown=0;
  check(!NVShipReward.clearShot(s,enemy),'Mercury occludes line of sight');NVShipReward.step(s,.1);check(p.hull===hp,'No shots through Mercury');
  enemy.hp=0;for(const v of fleet.filter(v=>v.faction==='HUMAN'||v.faction==='RESISTANCE')){v.hp=300;v.position=p.position.map((x,i)=>x+(i===1?100:0));}NVShipReward.step(s,.1);check(p.hull===hp,'Allies do not attack');
  // Sustained occupation starts at five minutes, retaining saved progress.
  q.fronts={};q.erisRestored=false;q.owners=Object.fromEntries(NVSiegeOfSol.worlds().map(w=>[w.id,'HUMAN']));q.owners.eris='ERISIAN';q.owners.moon='TERRA';q.owners.mercury='TERRA';
  q.fronts.HUMAN={body:'moon',progress:12,time:36};q.fronts.RESISTANCE={body:'eris',progress:8,time:24};
  for(const f of ['HUMAN','RESISTANCE']){const body=NVSol.byId[q.fronts[f].body],squad=fleet.filter(v=>v.faction===f);squad.forEach((v,i)=>{v.position=NVFleetMotion.orbit(body,i,q.clock,squad.length,f==='HUMAN'?2:3);v.hp=300;});}
  check(Math.abs(NVSiegeOfSol.captureRate(s,'HUMAN')-100/300)<1e-8,'Slow HFOS');check(Math.abs(NVSiegeOfSol.captureRate(s,'RESISTANCE')-100/300)<1e-8,'Slow Resistance');
  NVSiegeOfSol.step(s,.2);check(Math.abs(q.fronts.HUMAN.progress-12-100/300*.2)<1e-8,'Actual slow HFOS progress');check(Math.abs(q.fronts.RESISTANCE.progress-8-100/300*.2)<1e-8,'Actual slow Resistance progress');
  const restored=NVSiegeOfSol.restore(JSON.parse(JSON.stringify(q)));check(restored.fronts.HUMAN.progress===q.fronts.HUMAN.progress&&!restored.erisRestored,'Save preserves slow phase and progress');
  check(NVSiegeOfSol.capture(s,'eris','RESISTANCE'),'Eris liberated');check(q.erisRestored,'Restoration flag');check(NVSiegeOfSol.captureRate(s,'HUMAN')===25&&NVSiegeOfSol.captureRate(s,'RESISTANCE')===25,'Fast allied advance resumes');check(NVSiegeOfSol.captureRate(s,'TERRAN')===10,'Nox pace unchanged');
  const progress=q.fronts.HUMAN.progress;NVSiegeOfSol.step(s,.2);check(Math.abs(q.fronts.HUMAN.progress-progress-5)<1e-8,'Actual fast HFOS occupation after Eris');
  check(NVSiegeOfSol.restore(JSON.parse(JSON.stringify(q))).erisRestored,'Restored saves retain fast phase');
  return{interceptors:ids.size,hits,slowSeconds:300,fastSeconds:4};
 });
 assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),saved);assert.deepEqual(errors,[]);console.log('Passed Mercury pursuit, incoming lasers, reduced damage against both ships, flight/range/warp/interior gates, planet occlusion, allied safety, five-minute occupation until Eris, restored rapid capture and persistent progress without autosaves.',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
