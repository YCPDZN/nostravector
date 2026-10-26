const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
  await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});

  assert.equal(await p.locator('#resetProgress').count(),0);
  await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Reset disabled QA'});creatingCharacter=false;});
  const original=await p.evaluate(()=>({storage:localStorage.getItem(CHARACTER_SAVES_KEY),save:JSON.stringify(savedGame)}));
  const result=await p.evaluate(()=>resetCharacterProgress(savedGame.id,41,'Changed',{croxian:'kill'}));assert.equal(result.ok,false);
  await p.evaluate(()=>requestSaveChange('reset',savedGame.id));assert(await p.locator('#saveManagement').isHidden());
  await p.evaluate(()=>openCharacterSelect());assert.equal(await p.getByRole('button',{name:/reset progress/i}).count(),0);assert(await p.getByRole('button',{name:/Load save Reset disabled QA/i}).isVisible());assert(await p.getByRole('button',{name:/Save a copy of Reset disabled QA/i}).isVisible());
  assert.deepEqual(await p.evaluate(()=>({storage:localStorage.getItem(CHARACTER_SAVES_KEY),save:JSON.stringify(savedGame)})),original);
  await p.reload({waitUntil:'domcontentloaded',timeout:120000});assert.equal(await p.locator('#resetProgress').count(),0);assert.equal(await p.evaluate(()=>JSON.stringify(savedGame)),original.save);assert.deepEqual(errors,[]);
  console.log('Passed absent main-menu/per-save reset options, blocked reset entry points, unchanged saved progress and retained Load/Save As controls after reload.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
