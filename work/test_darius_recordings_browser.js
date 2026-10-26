const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const html=fs.readFileSync('outputs/NOSTRAVECTOR_Main_Menu.html','utf8'),start=html.indexOf('const SOL_WAR_VOICES='),end=html.indexOf('];',start)+2,declaration=html.slice(start,end);
 const voices=JSON.parse(declaration.slice('const SOL_WAR_VOICES='.length,-1)),meta=require('./sol_war_audio.json');
 assert.equal(voices.length,15);
 for(const [i,v]of voices.entries())assert.equal(crypto.createHash('sha256').update(Buffer.from(v.source.split(',')[1],'base64')).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync('work/'+meta[i].file)).digest('hex'));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.setContent('<html><body>Moon transmission audio verification</body></html>');
  const speech=fs.readFileSync('work/antarctica_speech.js','utf8').split('let jamesLipPose=')[0],voice=fs.readFileSync('work/sol_war_game.js','utf8').split('const solArgument=document')[0];
  await p.addScriptTag({content:'let gameActive=true,polarState={};const NVSolWar={ensure:()=>({stage:"argument"}),QUOTES:Array.from({length:15},()=>["speaker","The Federation protects its people."])};'+speech+'\n'+voice.replace('__SOL_WAR_VOICES__',JSON.stringify(voices))});
  for(const number of [2,4,6,8,10]){
   const index=number-1;await p.evaluate(i=>startSolWarVoice(i),index);
   await p.waitForFunction(i=>{const a=solWarClips[i];return !a.paused&&a.currentTime>.05&&!!prepareJamesAcoustics(a).envelope;},index,{timeout:15000});
   const result=await p.evaluate(i=>{const a=solWarClips[i],entry=prepareJamesAcoustics(a);return{duration:a.duration,playing:solWarClips.filter(a=>!a.paused).length,energy:Array.from(entry.envelope.rms).some(v=>v>.5)};},index);
   assert(Math.abs(result.duration-meta[index].duration)<.2);assert.equal(result.playing,1);assert(result.energy);
   assert(await p.evaluate(i=>{const a=solWarClips[i],e=prepareJamesAcoustics(a).envelope;for(let j=0;j<e.rms.length;j++){if(e.rms[j]<.2)continue;a.currentTime=j*e.hopSeconds;if(solWarLipPose().open>0)return true;}return false;},index));
   await p.evaluate(()=>{solWarVoice.muted=true;});assert.equal(await p.evaluate(()=>solWarLipPose().open),0);await p.evaluate(()=>{solWarVoice.muted=false;stopSolWarVoice();});assert(await p.evaluate(()=>solWarClips.every(a=>a.paused)));
  }
  assert.deepEqual(errors,[]);console.log('Passed embedded-file checksums, real decoding/playback of five new Darius clips, updated durations, acoustic lip timing, mute and cleanup.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
