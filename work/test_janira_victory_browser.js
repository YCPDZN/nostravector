const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);Object.defineProperty(a,'preload',{get:()=>a.getAttribute('preload')||'none',set:v=>a.setAttribute('preload',v==='metadata'?'none':v)});return a;};});
 await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
 const setup=fs.readFileSync('work/test_karribassa_bosses_browser.js','utf8').replace(/\r/g,'').split('await p.evaluate(()=>{')[1].split('});\n // Anchors')[0];await p.evaluate(setup);
 const storage=await p.evaluate(()=>JSON.stringify({...localStorage}));
 assert(await p.evaluate(()=>{for(const malia of ['spare','kill'])for(const croxian of ['spare','kill']){
  const s=structuredClone(polarState),q=NVKarribassaBosses.ensure(s),b=NVJaniraBlockade.ensure(s);q.bosses.forEach(n=>n.hp=0);q.completed=true;q.resolution={stage:'choice',line:4,choices:{malia:'',croxian:''}};
  if(NVJaniraVictory.settle(s)||!NVJaniraBlockade.active(s))return false;
  NVKarribassaBosses.choose(s,'malia',malia);if(NVJaniraVictory.liberated(s))return false;
  NVKarribassaBosses.choose(s,'croxian',croxian);
  if(!NVJaniraVictory.liberated(s)||NVJaniraBlockade.active(s)||NVJaniraArmada.active(s)||NVJaniraBlockade.fleet(s).length||NVJaniraArmada.ships(s).length||NVJaniraArmada.shots(s).length||NVEris.faction(s,'janira-prime')!=='CHOMPY'||NVJaniraSiege.musicActive(s))return false;
  if(NVJaniraVictory.settle(s)||NVVengefulMascar.trigger(s))return false;
  for(let i=0;i<4;i++)NVJaniraVictory.next(s);if(NVJaniraVictory.ensure(s).stage!=='speech')return false;
  NVJaniraVictory.next(s);if(NVJaniraVictory.ensure(s).stage!=='done'||NVVengefulMascar.trigger(s)!==(croxian==='kill'))return false;
  const restore=NVJaniraBlockade.restore(JSON.parse(JSON.stringify(b)));if(!restore.liberated||restore.active||restore.siege.victory.stage!=='done')return false;
 }return true;}));
 // Complete the actual fate UI, then save partway through Hak's new scene.
 await p.evaluate(()=>{const a=NVKarribassaBosses.arena(polarState);polarState.x=a.x;polarState.z=a.z-15;const q=NVKarribassaBosses.ensure(polarState);q.bosses.forEach(n=>n.hp=0);q.completed=true;q.resolution={stage:'choice',line:4,choices:{malia:'',croxian:''}};updatePolarHUD();});
 await p.locator('[data-id="malia"][data-choice="spare"]').click();assert(await p.locator('#janiraVictory').isHidden());
 await p.locator('[data-id="croxian"][data-choice="spare"]').click();assert(await p.locator('#janiraVictory').isVisible());assert(await p.locator('#karribassaFatePanel').isHidden());assert(await p.locator('#mascarScene').isHidden());
 assert.equal(await p.locator('#janiraVictoryLine').textContent(),'Janira Prime once again belongs to the Chompy Empire.');assert.equal(await p.evaluate(()=>gamePaused),true);assert.equal(await p.evaluate(()=>$('#janiraVictoryCanvas').getContext('webgl').getError()),0);assert.equal(await p.locator('#janiraVictoryCanvas').getAttribute('data-rendered'),'true');
 await p.screenshot({path:'outputs/NOSTRAVECTOR_Janira_Victory.png'});
 await p.locator('#janiraVictoryNext').click();await p.locator('#janiraVictoryNext').click();assert.equal(await p.locator('#janiraVictoryCount').textContent(),'3 / 5');
 await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>{const r=$('#janiraVictory .janira-rally-caption').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));await p.setViewportSize({width:1440,height:1000});
 assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),storage);
 await p.locator('#janiraVictoryPause').click();assert(await p.locator('#janiraVictory').isHidden());assert(await p.locator('#worldPauseSheet').isVisible());await p.evaluate(()=>pausePolar(false));assert(await p.locator('#janiraVictory').isVisible());
 await p.evaluate(()=>{pausePolar(true);savePolarWorld(true);exitPolar();startAntarctica();updatePolarHUD();});assert(await p.locator('#janiraVictory').isVisible());assert.equal(await p.locator('#janiraVictoryCount').textContent(),'3 / 5');assert.equal(await p.evaluate(()=>NVEris.faction(polarState,'janira-prime')),'CHOMPY');
 for(let i=0;i<3;i++)await p.locator('#janiraVictoryNext').click();assert(await p.locator('#janiraVictory').isHidden());assert(await p.locator('#solRage').isVisible());for(let i=0;i<10;i++)await p.locator('#solRageNext').click();assert.equal(await p.evaluate(()=>gamePaused),false);assert.equal(await p.evaluate(()=>NVQuests.list(polarState).find(q=>q.id==='janira-liberation').status),'completed');assert.equal(await p.locator('#hudMissionTitle').textContent(),'CONFRONT HAWTHORNE ON MERCURY');
 await p.evaluate(()=>{const s=polarState;Object.assign(s.space,{phase:'flight',body:'janira-prime',position:NVSpace.routeEnd(NVSol.byId['janira-prime'])});for(let i=0;i<8;i++){NVJaniraExpedition.step(s);stepEcology(.1);updatePolarHUD();}renderSpaceWorld(s,10,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});});
 assert.equal(await p.locator('#worldCanvas').getAttribute('data-armada-ships'),'0');assert(await p.evaluate(()=>!NVJaniraBlockade.active(polarState)&&NVJaniraArmada.ships(polarState).length===0&&NVSolWar.ships(polarState).every(v=>!v.blockade&&!v.siegeEscort)));assert.equal(await p.evaluate(()=>polarCanvas.getContext('webgl').getError()),0);
 await p.evaluate(()=>{savePolarWorld(true);exitPolar();startAntarctica();updatePolarHUD();});assert(await p.locator('#janiraVictory').isHidden());assert.equal(await p.evaluate(()=>NVJaniraVictory.ensure(polarState).stage),'done');assert.equal(await p.evaluate(()=>NVJaniraBlockade.active(polarState)),false);
 // A separate save, and a pre-decision save, remain occupied.
 assert(await p.evaluate(()=>{const s=structuredClone(polarState),b=NVJaniraBlockade.ensure(s);s.eris.siegeOfSol=NVSiegeOfSol.fresh();b.liberated=false;b.active=true;b.siege.victory=NVJaniraVictory.fresh();b.siege.commanders.resolution.choices={malia:'',croxian:''};return !NVJaniraVictory.settle(s)&&NVEris.faction(s,'janira-prime')==='TERRA';}));
 assert.deepEqual(errors,[]);console.log('Passed all four fate outcomes, immediate blockade/1,500-ship cleanup, Chompy ownership, persistent liberation, one five-line 3D cutscene, pause/resume and manual saves, mobile layout, no autosaves, orbit cleanup, quest completion and Orion scene ordering.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
