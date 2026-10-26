const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const metadata=JSON.parse(fs.readFileSync('work/carax_ending_audio.json','utf8')),rows=metadata.filter(r=>r.route==='bad-zark');assert.equal(metadata.length,60);assert.equal(rows.length,10);
 for(const [i,r]of rows.entries()){assert.equal(r.shot,i);assert.equal(r.speaker,'zark');assert.equal(path.basename(r.file),`BADENDINGZARK${i+1}.mp3`);const data=fs.readFileSync(path.join('work',r.file));assert(data.equals(fs.readFileSync(path.join('C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4/lord zark',path.basename(r.file)))));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),r.sha256);}
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio','--autoplay-policy=no-user-gesture-required']});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
  await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Protected Voice Slot'});creatingCharacter=false;globalThis.controlId=savedGame.id;globalThis.controlJSON=JSON.stringify(savedGame);creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Zark Voice QA'});creatingCharacter=false;globalThis.doomedId=savedGame.id;updateGameProgress(chapterRestartProgress(savedGame,41,{orion:true,nyrexia:false,james:'kill',malia:'kill',croxian:'kill',orionKilled:true}));startAntarctica();NVCarax.ensure(polarState).secured.fill(true);Object.values(NVCaraxBosses.ensure(polarState)).forEach(b=>b.hp=0);NVCaraxEndings.begin(polarState,savedGame.id);showCaraxEnding(polarState);});
  const playing=()=>p.waitForFunction(()=>{const a=NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()];return a&&!a.paused&&a.readyState>=2&&a.currentTime>.05;},null,{polling:30,timeout:20000});
  for(const [shot,record]of rows.entries()){
   await playing();
   assert(await p.evaluate(({shot,file,duration})=>{const q=NVCaraxEndings.ensure(polarState),i=NVCaraxEndingVoice.index(),a=NVCaraxEndingVoice.clips[i],r=CARAX_ENDING_AUDIO[i];return q.route==='bad-zark'&&q.shot===shot&&r.file===file&&Math.abs(a.duration-duration)<.15&&r.text===$('#caraxEndingLine').textContent&&NVCaraxEndingVoice.clips.filter(a=>!a.paused).length===1&&r.speaker==='zark';},{shot,...record}));
   await p.waitForFunction(()=>prepareJamesAcoustics(NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()]).envelope?.rms?.length>0,null,{polling:30,timeout:20000});
   assert(await p.evaluate(()=>{const a=NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()];let jaw=0;for(let t=.2;t<Math.min(4,a.duration-.4);t+=.17){a.currentTime=t;jaw=Math.max(jaw,NVCaraxEndingVoice.lip('zark').jaw);}renderCaraxEnding();return jaw>.01&&NVCaraxEndingVoice.lip('hostile-orion').jaw===0&&$('#caraxEndingCanvas').getContext('webgl').getError()===0&&!$('#caraxEndingStatus').textContent.includes('UNAVAILABLE');}));
   // Scene timing follows the recording rather than running ahead to the next line.
   assert(await p.evaluate(()=>{const q=NVCaraxEndings.ensure(polarState),shot=q.shot,a=NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()];a.currentTime=.5;q.time=100;frameCaraxEnding(performance.now());return q.shot===shot&&q.time<1&&!NVCaraxEndingVoice.ready();}));
   if(shot===4){
    await p.locator('#caraxEndingPause').click();assert(await p.evaluate(()=>NVCaraxEndingVoice.clips.every(a=>a.paused)&&NVCaraxEndingVoice.lip('zark').jaw===0));
    await p.evaluate(()=>{const a=NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()];a.currentTime=1.8;NVCaraxEndingVoice.remember();});await p.locator('#caraxEndingSave').click();
    assert(await p.evaluate(()=>{const s=NVAntarctica.restored(savedGame.progress,savedGame.id),q=NVCaraxEndings.ensure(s);return q.route==='bad-zark'&&q.shot===4&&q.voiceTime>=1.7;}));
    await p.evaluate(()=>{exitPolar();startAntarctica();updatePolarHUD();});await playing();assert(await p.evaluate(()=>NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()].currentTime>=1.8));
    await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert(await p.evaluate(()=>caraxEndingPaused&&NVCaraxEndingVoice.clips.every(a=>a.paused)));await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.locator('#caraxEndingPause').click();await playing();
    await p.setViewportSize({width:390,height:844});await p.evaluate(()=>renderCaraxEnding());assert(await p.locator('#caraxEndingScene article').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;}));await p.screenshot({path:'outputs/NOSTRAVECTOR_Zark_Bad_Ending_Recorded_Voice.png'});await p.setViewportSize({width:1440,height:1000});
   }
   await p.evaluate(()=>{const a=NVCaraxEndingVoice.clips[NVCaraxEndingVoice.index()];a.currentTime=a.duration-.06;});await p.waitForFunction(()=>NVCaraxEndingVoice.ready(),null,{polling:30,timeout:5000});
   assert.equal(await p.evaluate(()=>NVCaraxEndingVoice.lip('zark').jaw),0);
   await p.evaluate(()=>{const q=NVCaraxEndings.ensure(polarState);q.time=Math.max(NVCaraxEndingVoice.duration(q),NVCaraxEndings.minimumTime(q))+.01;renderCaraxEnding();nextCaraxEnding();});
  }
  assert(await p.evaluate(()=>NVCaraxEndings.ensure(polarState).shot===10&&NVCaraxEndings.ensure(polarState).stage==='cinematic'&&NVCaraxEndingVoice.index()===-1&&NVCaraxEndingVoice.clips.every(a=>a.paused)));
  assert(await p.locator('#caraxGameOver').isHidden());await p.evaluate(()=>{NVCaraxEndings.ensure(polarState).time=6.8;frameCaraxEnding(performance.now());});
  assert(await p.locator('#caraxGameOver').isVisible());assert(await p.evaluate(()=>!characterSaves.some(s=>s.id===doomedId)&&JSON.stringify(characterSaves.find(s=>s.id===controlId))===controlJSON&&NVCaraxEndingVoice.clips.every(a=>a.paused)));
  assert.deepEqual(errors,[]);console.log('Passed BADENDINGZARK1–10 byte/hash identity, embedded decode/order/captions, one recording at a time, acoustic Zark-only lips, recording-driven timing, pause/blur/save/resume offset, mobile rendering, silent final blackout and isolated Game Over.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
