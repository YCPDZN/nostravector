const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));
 await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);Object.defineProperty(a,'preload',{get:()=>a.getAttribute('preload')||'none',set:v=>a.setAttribute('preload',v==='metadata'?'none':v)});return a;};});
 await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
 await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'BC Voice QA'},{chapter:3});creatingCharacter=false;updateGameProgress(chapterRestartProgress(savedGame,3));startAntarctica();const s=polarState;stopJamesVoice();jamesConversation.active=false;Object.assign(s,{jamesIntroductionDone:true,jamesGone:true,bedSleeping:false,dreamActive:false,betrayalStage:'complete',africaStage:'complete'});Object.assign(s.space,{system:'sol',body:'mars',target:'mars',phase:'landed',geo:null,landingX:1000,landingZ:1000});s.x=70;s.z=100;NVKhazglar.ensure(s).introDone=true;NVKhazglar.ensure(s).siegeStage='done';for(const a of NVKhazglar.battle(s).soldiers){a.hp=10000;a.x=0;a.z=-30;}for(const model of NVProjectBC.models){const n=NVCustomCrew.create(s,{name:model.name,model:NVProjectBC.metadata(model)}).npc;NVGovernance.setRole(s,n.id,'follow');}NVCustomCrew.followStep(s,.1);gamePaused=false;});
 const storage=await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY));
 for(const record of JSON.parse(fs.readFileSync('work/project_bc_combat_audio.json','utf8'))){
  const result=await p.evaluate(key=>{const s=polarState,q=NVBCCombat.state(s);NVBCVoice.stop();q.caption=null;q.queue=[];const [kind,index]=key.split(':');const n=NVCustomCrew.followers(s).find(n=>NVBCCombat.kind(n)===kind);for(const member of NVCustomCrew.followers(s))NVBCCombat.actor(s,member).cooldown=100;const a=NVBCCombat.actor(s,n);Object.assign(a,{mode:'idle',elapsed:0,cooldown:0,barkCooldown:0,attacks:index==='heaven'?2:0,taunt:Number(index)||0});if(index==='trip')NVBCCombat.trip(s,n);else NVBCCombat.step(s,.1);updatePolarHUD();return{key:q.caption?.voiceKey,text:$('#projectBCCombatCaption').textContent,time:q.caption?.time};},record.key);
  assert.equal(result.key,record.key);assert(result.time>=record.duration+.3);
  await p.waitForFunction(key=>NVBCVoice.status().key===key&&NVBCVoice.status().time>.05&&!NVBCVoice.status().paused,record.key,{timeout:15000,polling:50});
  const facts=await p.evaluate(key=>{const r=NVBCVoice.clips.get(key);return{duration:r.a.duration,error:r.a.error?.message,playing:[...NVBCVoice.clips.values()].filter(r=>!r.a.paused).length,speaking:NVBCVoice.speaking()};},record.key);
  assert(!facts.error);assert(Math.abs(facts.duration-record.duration)<.15);assert.equal(facts.playing,1);assert(facts.speaking);
 }
 const paused=await p.evaluate(()=>{pausePolar(true);return [...NVBCVoice.clips.values()].every(r=>r.a.paused);});assert(paused);
 await p.evaluate(()=>pausePolar(false));await p.waitForFunction(()=>NVBCVoice.speaking(),null,{polling:50});
 const outfit=await p.evaluate(()=>NVCustomCrew.followers(polarState).filter(n=>NVBCCombat.kind(n)==='gareth').length);assert.equal(outfit,2);
 assert.equal(await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY)),storage);
 await p.evaluate(()=>exitPolar());assert(await p.evaluate(()=>[...NVBCVoice.clips.values()].every(r=>r.a.paused)));assert.deepEqual(errors,[]);
 console.log('Passed all 17 real MP3 decoders through actual companion combat events, correct captions and duration, both Gareth outfits, no overlapping voices, pause/resume, unchanged saves and menu cleanup.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
