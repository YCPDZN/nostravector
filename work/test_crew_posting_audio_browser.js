const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const rows=JSON.parse(fs.readFileSync('work/crew_posting_audio.json','utf8'));
 assert.equal(rows.length,30);assert.equal(new Set(rows.map(r=>r.profile+':'+r.line)).size,30);
 for(const r of rows){const data=fs.readFileSync(path.join('work',r.file));assert(data.equals(fs.readFileSync(path.join(r.profile==='tyrotaronus'?'C:/Users/HOME/Documents/NOSTRAVECTOR/chapter 4 tyrotaronus/governor':'C:/Users/HOME/Documents/NOSTRAVECTOR/diplomacy factions',path.basename(r.file)))));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),r.sha256);}
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio','--autoplay-policy=no-user-gesture-required']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
  await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  // Reuse the same recruited Chapter 4 world as the full posting/combat regression.
  const field=fs.readFileSync('work/test_catharsis_field_browser.js','utf8').replace(/\r/g,'').split('await p.evaluate(async()=>{')[1].split('});\n assert(')[0];await p.evaluate('(async()=>{'+field+'})()');
  const setup=fs.readFileSync('work/test_crew_diplomacy_browser.js','utf8').replace(/\r/g,'').split('await p.evaluate(async()=>{const s=polarState;')[1].split('});\n const farewells=')[0];await p.evaluate('(async()=>{const s=polarState;'+setup+'})()');await p.evaluate(async()=>{const s=polarState;s.eris.createSpeciesQuest={baseline:[],created:'custom-990',name:'QA'};s.eris.tyrotaronus={...NVTyrotaronus.fresh(),heard:true,met:true,hakHeard:true};NVCatharsisRoute.completeBriefing(s);if(tyroScene)closeTyrotaronus(false);gamePaused=false;updatePolarHUD();await NVGLB.load(NVTyrotaronusCompanion.MODEL);globalThis.crewBaseline={antarctica:NVAntarctica.snapshot(s)};});
  const mappings=await p.evaluate(()=>{const s=polarState,out=NVCrewDiplomacy.owned(s).map(n=>({id:n.id,key:NVCrewDiplomacy.voiceKey(s,n.id)}));const r=NVShipReward.ensure(s);Object.assign(r,{charonDecision:'accept',charonRecruited:true,kiznaRecruited:false});out.push({id:'charon',key:NVCrewDiplomacy.voiceKey(s,'charon')});Object.assign(r,{charonDecision:'decline',charonRecruited:false,kiznaRecruited:true});globalThis.voiceCases=out;return{out,bc:bcIDs.map(id=>NVCrewDiplomacy.voiceKey(s,id)),williams:NVCrewDiplomacy.voiceKey(s,s.eris.williamsExpedition.recruitedId),pm:NVCrewDiplomacy.voiceKey(s,foreignPM),custom:NVCrewDiplomacy.voiceKey(s,speciesID)};});
  assert.equal(mappings.williams,'williams');assert.equal(mappings.pm,'pontifex');assert.equal(mappings.custom,'custom');assert.equal(mappings.bc.filter(k=>k==='gareth').length,2);assert.equal(new Set(mappings.out.map(n=>n.key)).size,15);
  await p.getByRole('button',{name:'DIPLOMACY',exact:true}).click();
  const decoded=await p.evaluate(async()=>{
   const results=[];for(const n of voiceCases)for(let line=0;line<2;line++){
    const body=NVCrewDiplomacy.worlds(galacticWorld,'HUMAN')[0].id;
    // Charon's UI caption needs his mutually exclusive recruitment flag for this case.
    const reward=NVShipReward.ensure(galacticWorld);if(n.id==='charon')Object.assign(reward,{charonDecision:'accept',charonRecruited:true,kiznaRecruited:false});
    crewTransferPreview={id:n.id,faction:'HUMAN',body,line,lines:NVCrewDiplomacy.lines(galacticWorld,n.id)};crewFarewell.hidden=false;galacticPanel.inert=true;updateCrewFarewell();
    const index=NVCrewPostingVoice.index(),row=CREW_POSTING_AUDIO[index],a=NVCrewPostingVoice.clips[index];
    await new Promise((resolve,reject)=>{const deadline=setTimeout(()=>{clean();reject(Error('Audio timeout '+row.file));},10000);function clean(){clearTimeout(deadline);a.removeEventListener('playing',played);a.removeEventListener('error',failed);}function played(){clean();resolve();}function failed(){clean();reject(Error('Decode failed '+row.file));}if(!a.paused&&a.readyState>=3){clean();resolve();}else{a.addEventListener('playing',played);a.addEventListener('error',failed);}});
    const live=NVCrewPostingVoice.clips.filter(c=>!c.paused).length;results.push({id:n.id,profile:row.profile,line:row.line,duration:a.duration,expected:row.duration,live});
    if(row.profile!==n.key||row.line!==line||live!==1)throw Error('Wrong/overlapping voice '+n.id);
    cancelCrewFarewell();if(NVCrewPostingVoice.clips.some(c=>!c.paused))throw Error('Cancel leaked voice');
    if(n.id==='charon')Object.assign(reward,{charonDecision:'decline',charonRecruited:false,kiznaRecruited:true});
   }return results;
  });
  assert.equal(new Set(decoded.map(r=>r.profile+':'+r.line)).size,30);for(const r of decoded)assert(Math.abs(r.duration-r.expected)<.2,JSON.stringify(r));
  await p.locator('#foreignCrewMember').selectOption('nyrexia');await p.locator('#foreignCrewFaction').selectOption('HUMAN');await p.locator('#offerForeignCrew').click();
  await p.waitForFunction(()=>NVCrewPostingVoice.index()>=0&&!NVCrewPostingVoice.clips[NVCrewPostingVoice.index()].paused);
  await p.locator('#crewFarewellNext').click();await p.waitForFunction(()=>CREW_POSTING_AUDIO[NVCrewPostingVoice.index()].line===1&&!NVCrewPostingVoice.clips[NVCrewPostingVoice.index()].paused);
  assert(await p.evaluate(()=>NVCrewPostingVoice.clips.filter(a=>!a.paused).length===1&&!NVCrewDiplomacy.away(polarState,'nyrexia')));
  await p.locator('#crewFarewellMute').click();assert(await p.evaluate(()=>NVCrewPostingVoice.clips.every(a=>a.paused)));await p.locator('#crewFarewellMute').click();await p.waitForFunction(()=>!NVCrewPostingVoice.clips[NVCrewPostingVoice.index()].paused);
  await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert(await p.evaluate(()=>NVCrewPostingVoice.clips.every(a=>a.paused)));await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForFunction(()=>!NVCrewPostingVoice.clips[NVCrewPostingVoice.index()].paused);
  await p.locator('#crewFarewellReplay').click();await p.waitForFunction(()=>!NVCrewPostingVoice.clips[NVCrewPostingVoice.index()].paused);assert(await p.evaluate(()=>NVCrewPostingVoice.clips[NVCrewPostingVoice.index()].currentTime<2));
  await p.screenshot({path:'outputs/NOSTRAVECTOR_Crew_Posting_Dialogue.png'});await p.setViewportSize({width:390,height:844});await p.screenshot({path:'outputs/NOSTRAVECTOR_Crew_Posting_Mobile.png'});const mobile=await p.evaluate(()=>{const r=$('#crewTransferFarewell article').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth};});assert(mobile.left>=0&&mobile.right<=mobile.width&&mobile.top>=0&&mobile.bottom<=mobile.height,JSON.stringify(mobile));await p.setViewportSize({width:1440,height:1000});
  // A failed play and rapidly replaced play promises must not transfer anyone or overlap.
  await p.evaluate(()=>{globalThis.voiceFailedClip=NVCrewPostingVoice.clips[NVCrewPostingVoice.index()];globalThis.voiceOriginalPlay=voiceFailedClip.play;voiceFailedClip.play=()=>Promise.reject(Error('blocked'));});await p.locator('#crewFarewellReplay').click();await p.waitForFunction(()=>$('#crewFarewellVoiceStatus').textContent.includes('SELECT REPLAY'));assert(await p.evaluate(()=>!NVCrewDiplomacy.away(polarState,'nyrexia')));await p.evaluate(()=>{voiceFailedClip.play=voiceOriginalPlay;});
  await p.evaluate(async()=>{const a=NVCrewPostingVoice.clips[NVCrewPostingVoice.index()],real=a.play;let resolve;a.play=()=>new Promise(r=>resolve=r);NVCrewPostingVoice.begin();await Promise.resolve();cancelCrewFarewell();resolve();await Promise.resolve();a.play=real;});assert(await p.evaluate(()=>NVCrewPostingVoice.clips.every(a=>a.paused)));
  await p.locator('#offerForeignCrew').click();await p.locator('#crewFarewellNext').click();await p.locator('#crewFarewellConfirm').click();assert(await p.evaluate(()=>NVCrewDiplomacy.away(polarState,'nyrexia')&&NVCrewPostingVoice.clips.every(a=>a.paused)));
  await p.locator('#foreignCrewMember').selectOption('james');await p.locator('#offerForeignCrew').click();await p.evaluate(()=>closeGalacticDiplomacy());assert(await p.evaluate(()=>!crewTransferPreview&&crewFarewell.hidden&&NVCrewPostingVoice.clips.every(a=>a.paused)));
  await p.evaluate(()=>updatePolarHUD());await p.getByRole('button',{name:'DIPLOMACY',exact:true}).click();await p.locator('#foreignCrewMember').selectOption('james');await p.locator('#offerForeignCrew').click();await p.evaluate(()=>exitPolar());assert(await p.evaluate(()=>NVCrewPostingVoice.clips.every(a=>a.paused)&&!crewTransferPreview));
  assert.deepEqual(errors,[]);console.log('Passed source/hash verification and real browser decoding/playback of all 30 farewell recordings, both Gareth models, custom/Williams/Pontifex mapping, single voice at a time, Next, mute/replay, blur/focus, failed/stale playback, manual confirmation, cancel, close, exit and mobile layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
