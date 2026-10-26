const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
  await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  assert(await p.locator('#resetProgress').isDisabled());
  await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Reset QA',suit:'#553344'});creatingCharacter=false;globalThis.resetId=savedGame.id;creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Other Save'});creatingCharacter=false;globalThis.otherId=savedGame.id;globalThis.otherJSON=JSON.stringify(savedGame);switchCharacter(resetId);});
  await p.locator('#resetProgress').click();assert(await p.locator('#saveManagement').isVisible());
  assert.deepEqual(await p.locator('#restartChapter option').evaluateAll(xs=>xs.map(x=>x.value)),['1','2','3','31','30','4','41','5']);
  const before=await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY));
  await p.selectOption('#restartChapter','31');assert(await p.locator('#restartOrion').isVisible());assert(await p.locator('#restartMalia').isHidden());assert(await p.locator('#restartCroxian').isHidden());
  await p.selectOption('#restartChapter','41');assert(await p.locator('#restartOrionFate').isVisible());assert(await p.locator('#restartOrionKilled').isDisabled());
  await p.selectOption('#restartCroxian','kill');await p.selectOption('#restartOrionKilled','yes');await p.selectOption('#restartCroxian','spare');assert(await p.locator('#restartOrionKilled').isDisabled());assert.equal(await p.locator('#restartOrionKilled').inputValue(),'no');
  await p.locator('#cancelSaveChange').click();assert.equal(await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY)),before);
  await p.getByRole('button',{name:'Reset progress for Reset QA',exact:true}).click();await p.selectOption('#restartChapter','41');
  for(const [id,value]of [['restartOrion','yes'],['restartNyrexia','yes'],['restartJames','spare'],['restartMalia','spare'],['restartCroxian','kill'],['restartOrionKilled','yes']])await p.selectOption('#'+id,value);
  await p.setViewportSize({width:390,height:844});await p.locator('#restartOrionKilled').scrollIntoViewIfNeeded();assert(await p.locator('#restartOrionKilled').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));
  await p.screenshot({path:'outputs/NOSTRAVECTOR_Reset_Chapter_Selection.png'});
  await p.locator('#confirmSaveChange').click();
  assert(await p.evaluate(()=>savedGame.progress.checkpoint==='chapter4-pre-final-boss'&&savedGame.wanderer.suit==='#553344'&&JSON.stringify(characterSaves.find(s=>s.id===otherId))===otherJSON));
  await p.evaluate(()=>{$('#characterSelect').close();startAntarctica();updatePolarHUD();});assert(await p.evaluate(()=>polarState.space.body==='aridaxx'&&!NVCatharsisFinal.locked(polarState)&&NVCaraxEndings.route(polarState)==='neutral'&&NVVengefulMascar.ensure(polarState).stage==='complete'));
  await p.evaluate(()=>exitPolar());await p.setViewportSize({width:1440,height:1000});
  // Every exposed option produces a valid checkpoint without changing any save.
  assert.deepEqual(await p.evaluate(()=>{const before=localStorage.getItem(CHARACTER_SAVES_KEY),fail=[];for(const id of [1,2,3,31,30,4,41,5]){const q=chapterRestartProgress(savedGame,id,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'}),s=NVAntarctica.restored(q,savedGame.id);if(!q||q.chapter!==([31,30].includes(id)?3:id===41?4:id)||!s)fail.push(id);}if(before!==localStorage.getItem(CHARACTER_SAVES_KEY))fail.push('mutated');return fail;}),[]);
  await p.locator('#resetProgress').click();await p.selectOption('#restartChapter','5');assert(await p.locator('#restartStoryChoices').isHidden());await p.locator('#confirmSaveChange').click();
  assert(await p.evaluate(()=>savedGame.progress.chapter===5&&chapter5Unlocked(savedGame.progress.antarctica)&&NVEris.faction(NVAntarctica.restored(savedGame.progress,savedGame.id),'carax')==='CUSTOM'));
  await p.evaluate(()=>{$('#characterSelect').close();startAntarctica();updatePolarHUD();});
  assert(await p.evaluate(()=>chapter5Unlocked(polarState)&&polarState.space.body==='aridaxx'&&!NVCatharsisFinal.locked(polarState)&&NVCaraxEndings.ensure(polarState).stage==='done'));
  assert.equal(await p.locator('#hudMissionTitle').textContent(),'THE UNIVERSE IS YOURS TO EXPLORE');
  await p.evaluate(()=>{savePolarWorld(true);exitPolar();});
  const fixture=await p.evaluate(()=>({resetId,otherId,otherJSON}));await p.addInitScript(ids=>Object.assign(globalThis,ids),fixture);
  await p.reload({waitUntil:'domcontentloaded',timeout:120000});
  assert(await p.evaluate(()=>savedGame.progress.chapter===5&&chapter5Unlocked(savedGame.progress.antarctica)));
  await p.locator('#resetProgress').click();await p.selectOption('#restartChapter','1');await p.locator('#confirmSaveChange').click();
  assert(await p.evaluate(()=>savedGame.progress.chapter===1&&!savedGame.progress.antarctica&&JSON.stringify(characterSaves.find(s=>s.id===otherId))===otherJSON));
  await p.evaluate(()=>{$('#characterSelect').close();startAntarctica();updatePolarHUD();});assert(await p.evaluate(()=>!polarState.africaStarted&&!polarState.jamesIntroductionDone));
  assert.deepEqual(errors,[]);console.log('Passed main-menu and per-save reset controls, all chapters/checkpoints, branch questions and Orion dependency, cancellation, mobile layout, protected other save/appearance, playable Aridaxx checkpoint, Chapter 5 sandbox/Carax liberation/reload, and fresh Chapter 1.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
