const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const ready=async()=>{await p.waitForFunction(()=>window.NVStartup?.loaded||window.NVStartup?.error,null,{timeout:60000});assert.equal(await p.evaluate(()=>NVStartup.error),'');};
 await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:180000});await ready();
 await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Existing Chapter 3 startup QA'});creatingCharacter=false;savedGame.progress=chapterRestartProgress(savedGame,31,{orion:true,nyrexia:true,james:'spare'});startAntarctica();Object.assign(polarState.space,{system:'sol',body:'earth',target:'earth',phase:'orbit',warp:null});savePolarWorld(true);exitPolar();});
 const before=await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY));
 await p.reload({waitUntil:'domcontentloaded',timeout:180000});await ready();assert.equal(await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY)),before);
 await p.locator('#newGame').click({timeout:60000});await p.waitForFunction(()=>gameActive&&!polarScreen.hidden,null,{timeout:60000});assert.equal(await p.evaluate(()=>polarState.space.body),'earth');assert.deepEqual(errors,[]);
 console.log('Passed real cold reload and Continue with an existing Chapter 3 non-core save; startup completes without initialization errors or save writes.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
