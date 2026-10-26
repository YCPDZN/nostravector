const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
 const report={checks:[],errors:[]};
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>report.errors.push(e.stack));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
  await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  assert.deepEqual(report.errors,[]);assert.equal(await p.locator('#resetProgress').count(),0);
  await p.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Release Regression'});creatingCharacter=false;});
  const variants=await p.evaluate(()=>{
   const before=localStorage.getItem(CHARACTER_SAVES_KEY),fail=[];
   for(let mask=0;mask<32;mask++)for(const point of [30,4]){
    const c={orion:!!(mask&1),james:mask&2?'kill':'spare',nyrexia:!!(mask&4),malia:mask&8?'kill':'spare',croxian:mask&16?'kill':'spare'};
    const progress=chapterRestartProgress(savedGame,point,c),s=NVAntarctica.restored(progress,savedGame.id),q=NVSiegeOfSol.ensure(s),r=NVKarribassaBosses.ensure(s).resolution,crew=NVShipInterior.crew(s).map(n=>n.id),v=NVVengefulMascar.ensure(s);
    if(r.choices.malia!==c.malia||r.choices.croxian!==c.croxian||NVBrownResolution.ensure(s).outcome!==c.james||NVErisFamily.ensure(s).recruited!==c.nyrexia||crew.includes('james')!==(c.james==='spare')||crew.includes('nyrexia')!==c.nyrexia||crew.includes('orion')!==(c.orion&&c.croxian!=='kill')||(c.croxian==='kill'&&(v.stage!=='hunt'||v.target?.body!=='earth')))fail.push({mask,point,reason:'story choices'});
    if(point===30&&(q.stage!=='war'||q.boss.hp<=0||q.confronted||NVChapter4.started(s)))fail.push({mask,point,reason:'Mercury fight'});
    if(point===4&&(q.stage!=='complete'||NVChapter4.raw(s).stage!=='travel'||NVChapter4.aftermath(s)||!NVGrekEmpire.revealed(s)))fail.push({mask,point,reason:'Chapter 4 gate'});
   }
   return{fail,unchanged:before===localStorage.getItem(CHARACTER_SAVES_KEY)};
  });assert.deepEqual(variants.fail,[]);assert(variants.unchanged);report.checks.push('64 Chapter 3/4 restored story-choice variants and save isolation');
  const checkpoints=await p.evaluate(()=>{
   const out=[];for(const chapter of [1,2,3,31,30,4,41,5]){const s=NVAntarctica.restored(chapterRestartProgress(savedGame,chapter,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'}),savedGame.id);const snap=NVAntarctica.snapshot(s),r=NVAntarctica.restored({antarctica:snap},savedGame.id);out.push({chapter,finite:[r.x,r.z,r.cameraYaw].every(Number.isFinite),world:!r.space||r.space.phase==='off'||!!NVSol.byId[r.space.body],mission:NVQuests.list(r).some(q=>q.status==='active'),aftermath:NVChapter4.aftermath(r),sandbox:chapter5Unlocked(r)});}return out;
  });assert(checkpoints.every(q=>q.finite&&q.world&&q.mission),JSON.stringify(checkpoints));assert(checkpoints.find(q=>q.chapter===5).sandbox);assert(!checkpoints.find(q=>q.chapter===4).aftermath);report.checks.push('All chapter templates round-trip with valid coordinates, worlds and active missions');
  await p.evaluate(()=>{savedGame.progress=chapterRestartProgress(savedGame,5,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'});startAntarctica();stopJamesVoice();jamesConversation.active=false;});
  const journal=await p.evaluate(()=>{
   const s=polarState,ids=NVQuests.definitions.filter(q=>q.chapter>=4).map(q=>q.id);s.eris.quests={tracked:'chapter5-exploration',completed:ids};savePolarWorld(true);exitPolar();startAntarctica();return{expected:ids,completed:polarState.eris.quests.completed,tracked:polarState.eris.quests.tracked};
  });assert.equal(journal.tracked,'chapter5-exploration');assert(journal.expected.every(id=>journal.completed.includes(id)));report.checks.push('All registered Chapter 4/5 journal entries and tracked mission survive a real manual save/reload');
  const catalogue=await p.evaluate(()=>{
   const ids=Object.keys(NVSol.byId),bad=[];for(const id of ids){const w=NVSol.byId[id];if(!(w.radius>0)||!w.position?.every(Number.isFinite)||!w.color?.every(Number.isFinite))bad.push(id);}
   return{bad,count:ids.length,galaxies:[NVAndromeda.systems.length,NVTriangulum.systems.length,NVChimaera.systems.length,NVCyrannus.systems.length]};
  });assert.deepEqual(catalogue.bad,[]);assert.deepEqual(catalogue.galaxies,[100,150,175,220]);report.checks.push('Finite world geometry/colors and current 100/150/175/220 extra-galaxy system catalogues');
  const terrain=await p.evaluate(()=>{
   const s=polarState;Object.assign(s.space,{system:'sol',body:'earth',target:'earth',phase:'landed',landingX:0,landingZ:0,landingElevation:0,geo:{global:true,lat:50,lon:15,altitude:0},ecologyOcean:false});s.aerialView=null;s.x=0;s.z=-11;NVShipInterior.ensure(s).active=false;
   const draw=()=>renderSpaceWorld(s,10,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});
   draw();const first=+polarCanvas.dataset.terrainRevision;draw();const reused=+polarCanvas.dataset.terrainRevision;s.space.geo.lat=-78;draw();const relocated=+polarCanvas.dataset.terrainRevision;s.space.landingElevation=30;draw();return{first,reused,relocated,elevated:+polarCanvas.dataset.terrainRevision,gl:polarCanvas.getContext('webgl').getError()};
  });assert(terrain.first>0);assert.equal(terrain.first,terrain.reused);assert.equal(terrain.relocated,terrain.first+1);assert.equal(terrain.elevated,terrain.relocated+1);assert.equal(terrain.gl,0);report.checks.push('Actual terrain cache reuses stationary frames and rebuilds for new geographic anchors/elevation');
  const surfaces=await p.evaluate(()=>{
   const s=polarState,ids=['moon','mars','janira-prime','aridaxx','carax','alt-zerry','ravus','anaxa','obra-spira'],out=[];
   s.eris.quests.tracked='main';
   for(const id of ids){const w=NVSol.byId[id];Object.assign(s.space,{system:w.system||'sol',body:id,target:id,phase:'landed',landingX:0,landingZ:0,landingElevation:0,geo:{global:true,lat:0,lon:0,altitude:0},ecologyOcean:false});s.x=0;s.z=100;s.aerialView=null;updatePolarHUD();renderSpaceWorld(s,11,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});out.push({id,gl:polarCanvas.getContext('webgl').getError(),ground:NVWorldFlight.ground(s,s.x,s.z),galaxy:galaxyLabel(NVGalaxy.system(s)),meta:$('#hudMissionMeta').textContent});}
   return out;
  });assert(surfaces.every(q=>q.gl===0&&Number.isFinite(q.ground)),JSON.stringify(surfaces));assert(surfaces.find(q=>q.id==='anaxa').meta.includes('CHIMAERA'));assert(surfaces.find(q=>q.id==='obra-spira').galaxy.includes('CYRANNUS'));report.checks.push('Nine representative surfaces/fortresses render without WebGL errors, with correct galaxy HUD or local fortress objective');
  const textures=await p.evaluate(async()=>Promise.all(Object.entries(SOL_MAPS).map(async([id,src])=>{const img=new Image();img.src=src;await img.decode();return{id,width:img.naturalWidth,height:img.naturalHeight};})));assert(textures.every(t=>t.width>0&&t.height>0));report.checks.push(textures.length+' embedded solar-system textures decode successfully');
  await p.evaluate(()=>{const s=polarState,w=NVSol.byId.earth;Object.assign(s.space,{system:'sol',body:'earth',target:'earth',phase:'flight',position:w.position.map((v,i)=>v+(i===2?w.radius*2.7:0)),geo:null,autopilot:false});NVSpace.pointAt(s.space,w.position);renderSpaceWorld(s,0,{});});
  assert(await p.evaluate(()=>!hudInteractionSource||!hudInteractionSource.hidden&&!hudInteractionSource.disabled),'Leaving a fortress clears its promoted action in the same HUD update');
  await p.waitForTimeout(300);await p.evaluate(()=>{updatePolarHUD();renderSpaceWorld(polarState,0,{});});assert.equal(await p.evaluate(()=>polarCanvas.getContext('webgl').getError()),0);await p.screenshot({path:'outputs/NOSTRAVECTOR_Release_Earth_Texture.png'});
  const routes=await p.evaluate(()=>{
   const s=polarState;Object.assign(s.space,{system:'sagittarius-a',body:'carax',target:'carax',phase:'flight',position:[0,0,2000],warp:null,geo:null,autopilot:false});
   const path=['m31-core','m33-core','cma-core','cyr-core','cma-core','m33-core','m31-core','sagittarius-a'],out=[];
   for(const to of path){const from=NVGalaxy.system(s);if(!NVBlackHoleGates.select(s,to)||!NVBlackHoleGates.begin(s)||!NVBlackHoleGates.finish(s))throw Error('Crossing failed: '+from+' → '+to);updatePolarHUD();renderSpaceWorld(s,12,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});out.push({to,system:NVGalaxy.system(s),body:s.space.body,gl:polarCanvas.getContext('webgl').getError()});}return out;
  });assert(routes.every(q=>q.to===q.system&&q.gl===0));assert.equal(routes.at(-1).body,'carax');report.checks.push('Eight physical black-hole crossings traverse all five galaxies and return to persistent Carax');
  await p.evaluate(()=>{savePolarWorld(true);exitPolar();startAntarctica();updatePolarHUD();});assert(await p.evaluate(()=>chapter5Unlocked(polarState)&&polarState.space.body==='carax'));assert.equal(await p.locator('#resetProgress').count(),0);
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{updatePolarHUD();renderSpaceWorld(polarState,13,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});});await p.screenshot({path:'outputs/NOSTRAVECTOR_Release_Mobile.png'});
  assert.deepEqual(report.errors,[]);report.checks.push('Chapter 5 final save/reload, reset remains absent, and mobile render');
  console.log('Passed release integration: '+report.checks.join('; ')+'.');
 }finally{fs.writeFileSync('outputs/NOSTRAVECTOR_Release_Integration_Audit.json',JSON.stringify(report,null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
