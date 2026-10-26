const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);Object.defineProperty(a,'preload',{get:()=>a.getAttribute('preload')||'none',set:v=>a.setAttribute('preload',v==='metadata'?'none':v)});return a;};});
  await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  const fixture=fs.readFileSync('work/test_karribassa_bosses_browser.js','utf8').replace(/\r/g,'').split('await p.evaluate(()=>{')[1].split('});\n // Anchors')[0];await p.evaluate(fixture);
  await p.evaluate(()=>{polarState.x=polarState.z=1000;polarState.space.phase='flight';polarState.featureChapter=3;NVKarribassaBosses.ensure(polarState).engaged=false;updatePolarHUD();});
  const storage=await p.evaluate(()=>JSON.stringify({...localStorage}));
  for(const [chapter,stage,visible]of [[1,'war',false],[2,'war',false],[3,'pending',false],[3,'argument',false],[3,'war',true],[3,'expansion',true]]){
   await p.evaluate(({chapter,stage})=>{polarState.featureChapter=chapter;polarState.eris.solWar.stage=stage;refreshInnerCircle();},{chapter,stage});
   assert.equal(await p.evaluate(()=>!innerCircleTool.hidden),visible);assert.equal(await p.evaluate(()=>NVImperiaInnerCircle.available(polarState)),visible);
  }
  // The real last Moon line unlocks the option before the later Mars declaration.
  assert(await p.evaluate(()=>{const w=polarState.eris.solWar;w.stage='argument';w.line=14;w.throneDeclarationApplied=false;NVSolWar.advance(polarState);refreshInnerCircle();return !innerCircleTool.hidden&&!w.throneDeclarationApplied;}));
  await p.evaluate(()=>{setHUDTools(true);hudFactions.open=true;updatePolarHUD();});await p.locator('#innerCircleTool').click();
  assert(await p.locator('#imperiaInnerCircle').isVisible());assert.equal(await p.evaluate(()=>gamePaused),true);
  assert.equal(await p.locator('#imperiaInnerCircle .inner-circle-member').count(),3);assert.equal(await p.locator('[data-member="thomas"] span').textContent(),'GRAND IMPERARCH');
  assert.equal(await p.locator('[data-member="orion"]').count(),0);
  // Downed is not dead; only the explicit kill decision changes personnel status.
  await p.evaluate(()=>{for(const b of NVKarribassaBosses.ensure(polarState).bosses)b.hp=0;refreshInnerCircle();});assert.equal(await p.locator('.inner-circle-status').count(),0);
  await p.evaluate(()=>{const q=NVKarribassaBosses.ensure(polarState);q.completed=true;q.resolution.stage='done';q.resolution.choices={croxian:'spare',malia:'kill'};refreshInnerCircle();});
  assert.equal(await p.locator('[data-member="malia"] .inner-circle-status').textContent(),'DECEASED');assert.equal(await p.locator('[data-member="croxian"] .inner-circle-status').count(),0);assert.equal(await p.locator('[data-member="orion"]').count(),0);
  await p.evaluate(()=>{NVKarribassaBosses.ensure(polarState).resolution.choices={croxian:'kill',malia:'spare'};refreshInnerCircle();});
  assert.equal(await p.locator('[data-member="croxian"] .inner-circle-status').textContent(),'DECEASED');assert.equal(await p.locator('[data-member="malia"] .inner-circle-status').count(),0);assert.equal(await p.locator('[data-member="orion"] span').textContent(),'VENGEFUL');
  for(const id of ['thomas','malia','croxian'])assert.equal(await p.locator('[data-member="'+id+'"] .inner-circle-alignment').textContent(),'LAWFUL EVIL');
  assert.equal(await p.locator('[data-member="orion"] .inner-circle-alignment').textContent(),'CHAOTIC EVIL');
  await p.evaluate(()=>{NVChapter4.ensure(polarState).year=2127;refreshInnerCircle();});
  assert.equal(await p.locator('[data-member="orion"] .inner-circle-alignment').textContent(),'LAWFUL EVIL');
  await p.evaluate(()=>{NVVengefulMascar.ensure(polarState).stage='complete';refreshInnerCircle();});
  assert.equal(await p.locator('[data-member="orion"] .inner-circle-alignment').textContent(),'CHAOTIC EVIL');
  await p.evaluate(()=>{NVVengefulMascar.ensure(polarState).stage='waiting';NVChapter4.ensure(polarState).year=2125;refreshInnerCircle();});
  await p.screenshot({path:'outputs/NOSTRAVECTOR_Inner_Circle.png'});
  await p.setViewportSize({width:390,height:844});
  assert(await p.evaluate(()=>{const panel=innerCirclePanel.getBoundingClientRect();return panel.left>=0&&panel.right<=innerWidth&&innerCirclePanel.scrollWidth<=innerCirclePanel.clientWidth;}));
  assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),storage);
  await p.keyboard.press('Escape');assert(await p.locator('#empireSheet').isHidden());assert.equal(await p.evaluate(()=>gamePaused),false);
  await p.evaluate(()=>{pausePolar(true);savePolarWorld(true);exitPolar();startAntarctica();updatePolarHUD();toggleEmpire(true);showInnerCircle(true);});
  assert.equal(await p.locator('[data-member="croxian"] .inner-circle-status').textContent(),'DECEASED');assert.equal(await p.locator('[data-member="orion"] span').textContent(),'VENGEFUL');
  // A second character has its own living commanders and no Orion entry.
  await p.evaluate(()=>{toggleEmpire(false);exitPolar();creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Independent Roster QA'},{chapter:3});creatingCharacter=false;updateGameProgress(chapterRestartProgress(savedGame,3));startAntarctica();stopJamesVoice();jamesConversation.active=false;polarState.jamesIntroductionDone=true;Object.assign(NVSolWar.ensure(polarState),{stage:'war',alertIndex:3});gamePaused=false;updatePolarHUD();toggleEmpire(true);showInnerCircle(true);});
  assert.equal(await p.locator('#imperiaInnerCircle .inner-circle-member').count(),3);assert.equal(await p.locator('.inner-circle-status').count(),0);assert.equal(await p.locator('[data-member="orion"]').count(),0);
  assert.deepEqual(errors,[]);console.log('Passed Moon unlock, chapter gates, Tools entry, ranks, kill/spare statuses, Orion condition, mobile layout, manual resume, separate characters and no autosaves.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
