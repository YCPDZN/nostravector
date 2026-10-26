const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:v=>a.setAttribute('preload','none')});return a;};});
 await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
 await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Wildlife Explorer'});creatingCharacter=false;updateGameProgress(chapterRestartProgress(savedGame,3));startAntarctica();const s=polarState;Object.assign(s,{jamesIntroductionDone:true,jamesGone:true,africaStarted:true,africaStage:'complete',ferryEscaped:true,bedRested:true,bedBuilt:true,betrayalStage:'complete',dreamDone:true,spaceshipFound:true});stopJamesVoice();jamesConversation.active=false;$('#jamesDialogue').hidden=true;$('#wakeupShade').style.opacity='0';soundtrack.setEnabled(false);gamePaused=false;});
 const baseline=await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY));
 for(const climate of ['Paradise','Frozen']){
  const stats=await p.evaluate(climate=>{const b=Object.values(NVCluster.bodyLists).flat().find(b=>NVAlienEcology.eligible(b)&&b.category.startsWith(climate)),s=polarState;
   Object.assign(s.space,{system:b.system,body:b.id,target:b.id,phase:'landed',geo:null,landingX:0,landingZ:0,ecologyOcean:false,position:NVSpace.routeEnd(b),interior:NVShipInterior.fresh()});s.x=70;s.z=70;s.cameraYaw=0;s.cameraPitch=.18;gamePaused=false;
   const r=NVEcology.populate(s),catalog=NVEcology.species(b.id,s.seed);
   for(let i=0;i<3;i++){Object.assign(r.plants[i],{species:catalog[i],x:65+i*5,z:82});Object.assign(r.animals[i],{species:catalog[i+3],x:65+i*5,z:77,homeX:65+i*5,homeZ:77,phase:1.2,speed:1});}
   NVEcology.step(s,.1);updatePolarHUD();renderSpaceWorld(s,5,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});
   for(let i=0;i<6;i++)NVEcology.scan(s);fillSpeciesGuide();
   return{world:b.id,fauna:r.animals.length,flora:r.plants.length,gl:polarCanvas.getContext('webgl').getError(),scanned:NVEcology.ensure(s).scanned.filter(id=>id.startsWith(b.id+':')).length,error:$('#worldError').textContent,guide:$('#speciesCards').children.length};
  },climate);
  assert(stats.fauna>0&&stats.flora>0);assert.equal(stats.gl,0);assert.equal(stats.error,'');assert.equal(stats.scanned,6);assert(stats.guide>=6);
  await p.evaluate(()=>renderSpaceWorld(polarState,6,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0}));
  await p.screenshot({path:climate==='Paradise'?'outputs/NOSTRAVECTOR_Alien_Wildlife.png':'outputs/NOSTRAVECTOR_Frozen_Wildlife.png'});
 }
 assert.equal(await p.evaluate(()=>localStorage.getItem(CHARACTER_SAVES_KEY)),baseline,'Exploration/scanning must not autosave.');
 const saved=await p.evaluate(()=>{const scans=NVEcology.ensure(polarState).scanned.slice();savePolarWorld(true);exitPolar();startAntarctica();return{scans,restored:NVEcology.ensure(polarState).scanned,habitat:NVEcology.habitat(polarState)};});assert.deepEqual(saved.restored,saved.scans);assert(saved.habitat.startsWith('cluster-'));
 const barren=await p.evaluate(()=>{const b=Object.values(NVCluster.bodyLists).flat().find(b=>!b.atmosphere);polarState.space.body=b.id;polarState.space.system=b.system;polarState.space.phase='landed';const r=NVEcology.populate(polarState);updateEcologyHUD();return{animals:r.animals.length,plants:r.plants.length,habitat:r.id,text:$('#ecologyHabitat').textContent};});assert.deepEqual(barren,{animals:0,plants:0,habitat:null,text:'NO SURFACE BIOSPHERE'});
 assert.deepEqual(errors,[]);console.log('Passed production WebGL animated alien flora/fauna on paradise and frozen worlds, six-species scanning, cross-world guide, manual save/reload, no autosave and airless-world cleanup.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
