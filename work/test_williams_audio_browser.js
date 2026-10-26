const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const manifest=JSON.parse(fs.readFileSync('work/williams_audio.json','utf8'));
assert.deepEqual(manifest.map(r=>[r.branch,r.line,path.basename(r.file)]),[
 ['rude',0,'JOSIAHWRUDE.mp3'],['sarcastic',0,'JOSIAHWSARCASTIC.mp3'],
 ['sympathetic',0,'JOSIAHWRSYMPATHETIC.mp3'],['sympathetic',1,'JOSIAHWRSYMPATHETIC2.mp3'],['sympathetic',2,'JOSIAHWRSYMPATHETIC3.mp3'],['ignorant',0,'JOSIAHWIGNORANT.mp3'],
 ...Array.from({length:5},(_,i)=>['intro',i,`JOSIAHWILLIAMS${i+1}.mp3`]),['chapter3',0,'JOSIAHWILLIAMSCHAPTER3.mp3'],...Array.from({length:12},(_,i)=>['gareth',i,`GW${i+1}.mp3`]),...Array.from({length:5},(_,i)=>['richards',i,`JOSIAHVSJWILLIAMS${i+1}.mp3`]),...Array.from({length:2},(_,i)=>['enlistment',i,`JW${i+1}.mp3`])
]);
for(const r of manifest){const imported=fs.readFileSync(path.join('work',r.file)),original=fs.readFileSync(path.join('C:/Users/HOME/Documents/NOSTRAVECTOR/europe',['gareth','richards','enlistment'].includes(r.branch)?'josiah williams vs gareth williams':'',path.basename(r.file)));assert(imported.equals(original));assert.equal(crypto.createHash('sha256').update(imported).digest('hex'),r.sha256);assert(r.duration>0);}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
  await page.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  await page.evaluate(()=>{
   creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Williams Audio QA'});creatingCharacter=false;savedGame.progress=chapterRestartProgress(savedGame,3);startAntarctica();const s=polarState;
   Object.assign(s,{featureChapter:4,africaStarted:true,africaStage:'complete',jamesIntroductionDone:true,jamesGone:true,dreamDone:true,bedRested:true,betrayalStage:'complete',spaceshipFound:true,x:0,z:-4,cameraYaw:0,cameraPitch:.2});
   Object.assign(NVChapter4.ensure(s),{stage:'awake',year:2127,flagshipDestroyed:true});NVCapital.ensure(s).claimed=true;Object.assign(NVArchamus.ensure(s),{chapter4Met:true,catharsisHeard:true,contactBriefed:true});
   stopJamesVoice();jamesConversation.active=false;gamePaused=false;Object.assign(s.space,{phase:'landed',system:'sol',body:'earth',target:'earth',hull:100,landingX:0,landingZ:0,geo:{...NVJosiahWilliams.SITE,lat:NVJosiahWilliams.SITE.lat-.002,global:true,altitude:0,heading:0,look:0},warp:null,autopilot:false,ecologyOcean:false});if(s.space.interior)s.space.interior.active=false;Object.assign(NVArchiostal.ensure(s),{active:false,chapter4Arrived:true});const n=NVJosiahWilliams.local(s);s.x=n.x;s.z=n.z-4;updatePolarHUD();
  });
  const saves=await page.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY));
  const silent=async()=>assert(await page.evaluate(()=>NVWilliamsVoice.state.index===-1&&NVWilliamsVoice.clips.every(a=>a.paused)&&NVWilliamsVoice.pose().jaw===0));
  async function playing(branch,line){
   await page.waitForFunction(({branch,line})=>{const v=NVWilliamsVoice,r=WILLIAMS_AUDIO[v.state.index],a=v.clips[v.state.index];return r?.branch===branch&&r.line===line&&!v.state.pending&&!v.state.blocked&&!v.state.error&&a&&!a.paused&&a.currentTime>0&&!!prepareJamesAcoustics(a).envelope;},{branch,line},{polling:100,timeout:20000});
   const check=await page.evaluate(()=>{const v=NVWilliamsVoice,r=WILLIAMS_AUDIO[v.state.index],a=v.clips[v.state.index];return{duration:a.duration,expected:r.duration,others:v.clips.every((c,i)=>i===v.state.index||c.paused),count:$('#williamsCount').textContent,paused:gamePaused};});
   assert(Math.abs(check.duration-check.expected)<.16);assert(check.others);assert(check.paused);assert.equal(check.count,`${line+1} / ${branch==='intro'?5:branch==='sympathetic'?3:1}`);
  }
  // The early recording must end the encounter without opening Chapter 4's wheel or flags.
  await page.evaluate(()=>{window.afterEarlyWilliams={chapter4:JSON.parse(JSON.stringify(NVChapter4.ensure(polarState))),archamus:JSON.parse(JSON.stringify(NVArchamus.ensure(polarState)))};polarState.featureChapter=3;Object.assign(NVChapter4.ensure(polarState),{stage:'waiting',year:2125,flagshipDestroyed:false});Object.assign(NVArchamus.ensure(polarState),NVArchamus.fresh());NVQuests.update(polarState);updatePolarHUD()});
  const earlyMemory=await page.evaluate(()=>JSON.stringify(NVArchamus.ensure(polarState)));
  await page.locator('#speakJosiahWilliams').click();await playing('chapter3',0);assert.equal(await page.locator('#williamsLine').textContent(),await page.evaluate(()=>NVJosiahWilliams.CHAPTER3));assert(await page.locator('#williamsWheel').isHidden());
  assert(await page.evaluate(()=>{const v=NVWilliamsVoice,a=v.clips[v.state.index],e=prepareJamesAcoustics(a).envelope;for(let i=0;i<e.rms.length;i++)if(calculateJamesViseme(williamsConversation.lines[0],e.spoken[i],e.rms[i]).jaw>.7){a.currentTime=(i+.2)*e.hopSeconds;return v.pose().jaw>.1;}return false;}));
  await page.locator('#williamsVoice').click();await page.evaluate(()=>{for(let i=0;i<10;i++)NVWilliamsVoice.tick(.1)});assert.equal(await page.evaluate(()=>NVWilliamsVoice.pose().jaw),0);assert(await page.evaluate(()=>NVWilliamsVoice.clips.every(a=>a.paused)));assert(await page.locator('#williamsDialogue').isVisible());
  await page.locator('#williamsVoice').click();await playing('chapter3',0);await page.keyboard.press('Escape');await silent();assert.equal(await page.evaluate(()=>JSON.stringify(NVArchamus.ensure(polarState))),earlyMemory);
  await page.locator('#speakJosiahWilliams').click();await playing('chapter3',0);await page.evaluate(()=>{const a=NVWilliamsVoice.clips[NVWilliamsVoice.state.index];a.currentTime=a.duration-.3});await page.waitForFunction(()=>NVWilliamsVoice.state.tail>0,null,{polling:100,timeout:5000});await page.evaluate(()=>{for(let i=0;i<6;i++)NVWilliamsVoice.tick(.1)});
  assert(await page.locator('#williamsDialogue').isHidden());assert(await page.locator('#williamsWheel').isHidden());await silent();assert(!(await page.evaluate(()=>gamePaused)));assert.equal(await page.evaluate(()=>JSON.stringify(NVArchamus.ensure(polarState))),earlyMemory);
  await page.evaluate(()=>{polarState.featureChapter=4;Object.assign(NVChapter4.ensure(polarState),afterEarlyWilliams.chapter4);Object.assign(NVArchamus.ensure(polarState),afterEarlyWilliams.archamus);NVQuests.update(polarState);updatePolarHUD()});
  await page.locator('#speakJosiahWilliams').click();await playing('intro',0);
  await page.keyboard.press('Escape');await silent();assert(!(await page.evaluate(()=>NVArchamus.ensure(polarState).contactMet)));
  await page.locator('#speakJosiahWilliams').click();
  for(let i=0;i<5;i++){
   await playing('intro',i);assert.equal(await page.locator('#williamsLine').textContent(),await page.evaluate(i=>NVJosiahWilliams.LINES[i],i));
   if(i===0){
    // Capture the actual shared Chapter 1 mouth renderer while the opening clip is voiced.
    assert(await page.evaluate(()=>{const v=NVWilliamsVoice,a=v.clips[v.state.index],e=prepareJamesAcoustics(a).envelope,text=williamsConversation.lines[0];let frame=-1;for(let i=0;i<e.rms.length;i++)if(calculateJamesViseme(text,e.spoken[i],e.rms[i]).jaw>.7){frame=i;break;}if(frame<0)return false;a.currentTime=(frame+.2)*e.hopSeconds;return v.pose().jaw>.1;}));
    await page.evaluate(()=>renderWilliamsScene(performance.now()));await page.screenshot({path:'outputs/NOSTRAVECTOR_Josiah_Williams_II_Intro_Voice.png'});
   }
   if(i===4){await page.evaluate(()=>{const a=NVWilliamsVoice.clips[NVWilliamsVoice.state.index];a.currentTime=a.duration-.3});await page.waitForFunction(()=>NVWilliamsVoice.state.tail>0,null,{polling:100,timeout:5000});}
   else await page.evaluate(()=>NVWilliamsVoice.clips[NVWilliamsVoice.state.index].onended());
   await page.evaluate(()=>{for(let i=0;i<6;i++)NVWilliamsVoice.tick(.1)});
  }
  assert(await page.locator('#williamsWheel').isVisible());assert.equal(await page.evaluate(()=>NVArchamus.ensure(polarState).williamsChoice),'');await silent();
  await page.evaluate(()=>{for(let i=0;i<20;i++)NVWilliamsVoice.tick(.1)});assert.equal(await page.evaluate(()=>williamsConversation.phase),'wheel');
  await page.locator('[data-choice=sympathetic]').click();await silent();await page.locator('#williamsNext').click();
  await playing('sympathetic',0);
  // Seek through the real decoded recording: mouth motion follows its signal and closes in silence.
  const samples=await page.evaluate(()=>{const v=NVWilliamsVoice,a=v.clips[v.state.index],e=prepareJamesAcoustics(a).envelope,text=williamsConversation.lines[0];let voiced=-1,silence=-1;for(let i=0;i<e.rms.length;i++){if(voiced<0&&calculateJamesViseme(text,e.spoken[i],e.rms[i]).jaw>.3)voiced=i;if(silence<0&&e.rms[i]<.01)silence=i;}return{voiced:(voiced+.2)*e.hopSeconds,silence:(silence+.2)*e.hopSeconds,valid:voiced>=0&&silence>=0};});assert(samples.valid);
  await page.evaluate(t=>NVWilliamsVoice.clips[NVWilliamsVoice.state.index].currentTime=t,samples.voiced);
  assert((await page.evaluate(()=>NVWilliamsVoice.pose().jaw))>.1);
  await page.evaluate(()=>renderWilliamsScene(performance.now()));assert.equal(await page.evaluate(()=>polarCanvas.getContext('webgl').getError()),0);
  await page.screenshot({path:'outputs/NOSTRAVECTOR_Josiah_Williams_II_Voice.png'});
  await page.locator('#williamsVoice').click();assert.equal(await page.evaluate(()=>NVWilliamsVoice.pose().jaw),0);assert(await page.evaluate(()=>NVWilliamsVoice.clips.every(a=>a.paused)));assert.equal(await page.evaluate(()=>williamsConversation.index),0);
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>{const buttons=[...document.querySelectorAll('#williamsDialogue footer button')].filter(b=>!b.hidden).map(b=>b.getBoundingClientRect());return buttons.every(r=>r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight)&&buttons.every((a,i)=>buttons.every((b,j)=>i===j||a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top));}));
  await page.locator('#williamsVoice').click();await playing('sympathetic',0);
  await page.evaluate(t=>NVWilliamsVoice.clips[NVWilliamsVoice.state.index].currentTime=t,samples.silence);assert.equal(await page.evaluate(()=>NVWilliamsVoice.pose().jaw),0);
  // A user skips the first recording. Its old completion callback must not skip the next one.
  await page.evaluate(()=>window.staleWilliamsEnd=NVWilliamsVoice.clips[NVWilliamsVoice.state.index].onended);
  await page.locator('#williamsNext').click();await playing('sympathetic',1);await page.evaluate(()=>{staleWilliamsEnd();for(let i=0;i<7;i++)NVWilliamsVoice.tick(.1)});assert.equal(await page.evaluate(()=>williamsConversation.index),1);
  // Audio completion, unlike choosing the player reply, advances each part automatically.
  await page.evaluate(()=>{const v=NVWilliamsVoice;v.clips[v.state.index].onended();for(let i=0;i<6;i++)v.tick(.1)});await playing('sympathetic',2);assert(!(await page.evaluate(()=>NVArchamus.ensure(polarState).williamsHelpAccepted)));
  await page.evaluate(()=>{const v=NVWilliamsVoice;v.clips[v.state.index].onended();for(let i=0;i<6;i++)v.tick(.1)});
  assert.equal(await page.evaluate(()=>williamsConversation.phase),'reflection');assert.equal(await page.locator('#williamsLine').textContent(),'I wish to think about what I can do.');await silent();assert(await page.evaluate(()=>NVArchamus.ensure(polarState).williamsHelpAccepted));
  await page.locator('#williamsNext').click();assert(await page.locator('#williamsDialogue').isHidden());assert(!(await page.evaluate(()=>gamePaused)));
  await page.setViewportSize({width:1440,height:1000});
  for(const branch of ['rude','sarcastic','ignorant']){
   await page.evaluate(()=>{Object.assign(NVArchamus.ensure(polarState),{williamsChoice:'',williamsReactionHeard:false,williamsHelpAccepted:false});speakWilliams();nextWilliams()});await silent();
   await page.locator(`[data-choice=${branch}]`).click();await silent();await page.locator('#williamsNext').click();await playing(branch,0);
   if(branch==='rude'){
    await page.keyboard.press('Escape');await silent();assert(!(await page.evaluate(()=>NVArchamus.ensure(polarState).williamsReactionHeard)));
    await page.locator('#speakJosiahWilliams').click();await playing('rude',0);
   }
   if(branch==='sarcastic'){
    // Failed playback keeps a readable, manually advanceable reply and a closed mouth.
    await page.evaluate(()=>NVWilliamsVoice.clips[NVWilliamsVoice.state.index].onerror());assert.equal(await page.evaluate(()=>NVWilliamsVoice.pose().jaw),0);assert((await page.locator('#williamsVoiceStatus').textContent()).includes('UNAVAILABLE'));await page.locator('#williamsNext').click();
   }else if(branch==='ignorant'){
    // Exercise the media element's actual end event, including the scene's frame-driven tail.
    await page.evaluate(()=>{const a=NVWilliamsVoice.clips[NVWilliamsVoice.state.index];a.currentTime=a.duration-.3;});
    await page.waitForFunction(()=>NVWilliamsVoice.state.tail>0,null,{polling:100,timeout:5000});
    await page.evaluate(()=>{const t=performance.now();for(let i=0;i<7;i++)renderWilliamsScene(t+i*100)});
   }else await page.evaluate(()=>{const v=NVWilliamsVoice;v.clips[v.state.index].onended();for(let i=0;i<6;i++)v.tick(.1)});
   assert(await page.locator('#williamsDialogue').isHidden());await silent();assert(!(await page.evaluate(()=>NVArchamus.ensure(polarState).williamsHelpAccepted)));assert(await page.evaluate(()=>NVArchamus.ensure(polarState).williamsReactionHeard));
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY)),saves);assert.deepEqual(errors,[]);
  console.log('Passed all twelve recording mappings/hashes and actual playback: Chapter 3 dismissal/lip sync/mute/interruption/automatic closure without Chapter 4 progress, five opening clips, response wheel, Chapter 1 mouth animation, sympathetic-only continuation, reflection, stale-event cancellation, captions fallback, real media end events, save isolation and mobile controls.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
