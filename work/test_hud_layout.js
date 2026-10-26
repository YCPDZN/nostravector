// Render actual production UI in an isolated browser context; player saves are untouched.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=path.resolve(__dirname,'../outputs');
let browser;
async function fixture(page,scenario){await page.evaluate(scenario=>{
 if(gameActive)exitPolar();stopHawthorneVoice();createPolarRenderer=()=>()=>{};
 creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Layout Preview'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();
 const s=polarState;Object.assign(s,{jamesIntroductionDone:true,jamesGone:false,stationFound:false});
 if(!['antarctica','james','hazards'].includes(scenario)){Object.assign(s,{jamesGone:true,africaStarted:true,africaStage:'complete',ferryEscaped:true,bedRested:true,bedBuilt:true,betrayalStage:'complete',dreamDone:true,spaceshipFound:true,inventoryUnlocked:true,friendQuest:'recruited',friendDialogueDone:true});s.x=NVAfrica.SHIP.x;s.z=NVAfrica.SHIP.z;}
 if(['space','tools','tools-expanded','transit','construction','inventory','quests','eris','boss'].includes(scenario)){s.space=NVSpace.fresh();s.space.phase='flight';s.space.body='moon';s.space.target='mars';s.space.visited.push('moon');s.space.position=NVSpace.routeEnd(NVSol.byId.moon);const c=NVConstruction.ensure(s);c.started=true;c.tools=true;c.stage=3;}
 if(['space','tools','tools-expanded','transit'].includes(scenario)){const w=NVSolWar.ensure(s);w.stage='war';const q=NVHawthorneTransmission.ensure(s);q.started=true;q.marsAssigned=true;q.line=5;s.space.message='TRANSMISSION RECEIVED / HEAD TO MARS';s.space.messageTime=5;}
 if(scenario==='antarctica'){s.car={...NVAntarctica.CAR,driving:false};s.jamesCarQuoteRemaining=12;s.jamesCarQuoteKnown=true;}
 if(scenario==='james')s.jamesIntroductionDone=false;
 if(scenario==='hazards'){s.stationFound=true;s.stationDialogueDone=true;s.hazardStage='unseen';beginHazardTutorial();}
 if(scenario==='construction'){s.space.phase='landed';s.x=40;s.z=40;constructionGuideHidden=false;NVConstruction.ensure(s).tools=false;}
 if(scenario==='eris'){s.space.body='eris';s.space.phase='landed';NVEris.ensure(s).travel=0;s.x=0;s.z=63;}
 if(scenario==='boss'){const w=NVSolWar.ensure(s);w.stage='war';NVSolWar.ships(s);NVSolWar.damage(s,0,1e9);s.space.phase='landed';s.space.body=NVPontifex.ensure(s).body;const n=NVPontifex.local(s);s.x=n.x;s.z=n.z+3;}
 gamePaused=false;jamesConversation.active=false;$('#jamesDialogue').hidden=s.jamesIntroductionDone;if(s.jamesIntroductionDone)stopJamesVoice();updatePolarHUD();
 if(scenario==='tools'||scenario==='tools-expanded'){setHUDTools(true);updatePolarHUD();if(scenario==='tools-expanded')document.querySelectorAll('#hudTools details').forEach(el=>el.open=true);}
 if(scenario==='transit'){s.space.target='moon';NVWorldFlight.drop(s);s.space.elapsed=NVSpace.transitionDuration(s.space)/2;updatePolarHUD();}
 if(scenario==='inventory')openInventory();
 if(scenario==='quests')openQuestJournal();
 if(scenario==='eris'){const n=NVEris.nearest(s);if(n){s.x=n.x;s.z=n.z;speakToVishara();}}
 // One render update is enough to measure the UI; no production animation is changed.
 updatePolarHUD();soundtrack.setContext({scene:'roam',paused:gamePaused});dockHUDMusic();
 $('#worldCanvas').style.background='radial-gradient(ellipse at 50% 35%,#183241,#050a12 75%)';
},scenario);await page.waitForTimeout(150);}
async function inspect(page,scenario,size){return page.evaluate(({scenario,size})=>{
 const visible=el=>{if(!el)return false;const closed=el.closest('details:not([open])');if(closed&&!el.closest('summary'))return false;const r=el.getBoundingClientRect(),style=getComputedStyle(el);return r.width>0&&r.height>0&&style.display!=='none'&&style.visibility!=='hidden'&&!el.closest('[hidden]');};
 const keys=['hudHeader','hudLeftDock','hudAlerts','hawthorneComms','constructionGuide','hudVitalsDock','hudContextDock','hudMapDock'];
 const boxes=keys.map(id=>document.getElementById(id)).filter(visible).map(el=>{const r=el.getBoundingClientRect();let x=r.x,y=r.y,right=r.right,bottom=r.bottom;for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),pr=p.getBoundingClientRect();if(s.overflowX!=='visible'){x=Math.max(x,pr.x);right=Math.min(right,pr.right);}if(s.overflowY!=='visible'){y=Math.max(y,pr.y);bottom=Math.min(bottom,pr.bottom);}}return{id:el.id,x,y,right,bottom};}).filter(b=>b.right>b.x&&b.bottom>b.y);
 const failures=[];
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>2)failures.push(a.id+' overlaps '+b.id);}
 for(const el of document.querySelectorAll('#antarctica button')){
  if(!visible(el)||el.disabled)continue;const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;
  const panel=el.closest('#hawthorneComms');if(panel){const pr=panel.getBoundingClientRect();if(r.x<pr.x-1||r.right>pr.right+1||r.y<pr.y-1||r.bottom>pr.bottom+1)failures.push(el.id+' escapes its dialogue panel');}let clipped=false;for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),pr=p.getBoundingClientRect();if((s.overflowX!=='visible'&&(x<pr.x||x>pr.right))||(s.overflowY!=='visible'&&(y<pr.y||y>pr.bottom))){clipped=true;break;}}if(clipped)continue;
  const comms=el.closest('#hawthorneComms');if(comms){const cr=comms.getBoundingClientRect();if(r.x<cr.x-1||r.right>cr.right+1||r.y<cr.y-1||r.bottom>cr.bottom+1)failures.push(el.id+' escapes its dialogue panel');}
  const hit=document.elementFromPoint(x,y);if(hit!==el&&!el.contains(hit))failures.push((el.id||el.textContent)+' is covered by '+(hit?.id||hit?.className));
 }
 return{scenario,size,boxes,failures};
},{scenario,size});}
(async()=>{
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
 const touch=process.argv.includes('--touch'),landing=process.argv.includes('--landing');const context=await browser.newContext({hasTouch:touch}),page=await context.newPage();
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.setInterval=()=>0;});
 console.log('Loading the production game in an isolated browser.');
 await page.goto(pathToFileURL(path.join(output,'NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>typeof updateCleanHUD==='function'&&typeof updateHawthorneComms==='function');
 const report=[];
 for(const size of (landing?[{width:1366,height:768}]:touch?[{width:390,height:844}]:[{width:1366,height:768},{width:900,height:600},{width:390,height:844},{width:900,height:500}])){
  await page.setViewportSize(size);
  for(const scenario of (landing?['space']:touch?['africa','space','construction']:['antarctica','james','hazards','africa','space','tools','tools-expanded','transit','construction','inventory','quests','eris','boss'])){
   await fixture(page,scenario);const result=await inspect(page,scenario,size);report.push(result);if(result.failures.length)await page.screenshot({path:path.join(output,'NOSTRAVECTOR_UI_Failure_Preview.png')});assert.deepEqual(result.failures,[],JSON.stringify(result));
   if(size.width===1366&&scenario==='space')await page.screenshot({path:path.join(output,'NOSTRAVECTOR_UI_Layout_Preview.png')});
   if(size.width===390&&scenario==='space')await page.screenshot({path:path.join(output,'NOSTRAVECTOR_UI_Layout_Mobile_Preview.png')});
  }
  console.log('Passed all chapter layouts at '+size.width+'×'+size.height+'.');
 }
 if(landing){
  await page.evaluate(()=>{const p=polarState.space,b=NVSol.byId.deimos;p.phase='flight';p.body='deimos';p.target='deimos';p.position=b.position.map((v,i)=>v+(i===2?b.radius+200:0));NVSpace.cruise(polarState);updatePolarHUD();});
  assert.ok((await page.locator('#spaceDistance').textContent()).startsWith('200 '));assert.equal(await page.locator('#spaceLand').isEnabled(),true);await page.locator('#spaceLand').click();assert.equal(await page.evaluate(()=>polarState.space.phase),'descent');assert.equal(await page.evaluate(()=>polarState.space.autopilot),false);
  await page.evaluate(()=>{for(let i=0;i<21&&polarState.space.phase==='descent';i++)NVSpace.step(polarState,.1);updatePolarHUD();});assert.equal(await page.evaluate(()=>polarState.space.phase),'atmosphere');await page.locator('#spaceLand').click();
  await page.evaluate(()=>{for(let i=0;i<21&&polarState.space.phase==='descent';i++)NVSpace.step(polarState,.1);updatePolarHUD();});assert.equal(await page.evaluate(()=>polarState.space.phase),'landed');await page.locator('#hudInteract').click();assert.equal(await page.evaluate(()=>polarState.space.phase),'cockpit');await page.locator('#launchAtmosphere').click();
  await page.evaluate(()=>{for(let i=0;i<21&&polarState.space.phase==='ascent';i++)NVSpace.step(polarState,.1);updatePolarHUD();});assert.equal(await page.evaluate(()=>polarState.space.phase),'flight');assert.equal(await page.evaluate(()=>polarState.space.elapsed),2);
  console.log('Passed actual landing button at 200 FU during a locked course, two-second entry/landing, ship boarding and two-second orbit exit.');
 }
 fs.writeFileSync(path.join(__dirname,landing?'landing-controls-report.json':touch?'hud-layout-touch-report.json':'hud-layout-report.json'),JSON.stringify(report,null,2));
 await page.evaluate(()=>exitPolar());assert.equal(await page.locator('#nowPlaying').evaluate(el=>!el.closest('#cleanHUD')),true,'Menu music banner returns to its menu location.');
 console.log((touch?'Touch control checks passed. ':'')+'Passed real-browser panel separation and accessible buttons across '+report.length+' chapter/modal/viewport scenarios; main-menu restoration preserved.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
