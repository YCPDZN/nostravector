const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);Object.defineProperty(a,'preload',{get:()=>a.getAttribute('preload')||'none',set:v=>a.setAttribute('preload',v==='metadata'?'none':v)});return a;};});
 await page.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
 assert.equal(await page.locator('#menu').getAttribute('data-era'),'original');
 const result=await page.evaluate(async()=>{
  creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Earlier Chapter'});creatingCharacter=false;
  const early=savedGame.id;
  creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Space Remembers'},{chapter:4,checkpoint:'chapter4-awake',antarctica:{eris:{chapter4:{stage:'awake',year:2127}}}});creatingCharacter=false;
  savedWanderer=savedGame.wanderer;syncMenuWanderer();syncSavedGameMenu();updateMenuLocation();soundtrack.setEnabled(true);soundtrack.unlock();soundtrack.tick(1);
  for(const stage of ['waiting','travel','ambush']){
   savedGame.progress.antarctica.eris.chapter4.stage=stage;syncSavedGameMenu();updateMenuLocation();
   if($('#menu').dataset.era!=='original'||$('#nowPlaying').dataset.scene!=='menu')throw Error('Premature menu change: '+stage);
  }
  savedGame.progress.antarctica.eris.chapter4.stage='awake';persistCharacterSaves();syncSavedGameMenu();updateMenuLocation();
  const late=savedGame.id,track=MUSIC_TRACKS.find(q=>q.role==='menu-chapter4');
  const duration=await new Promise((resolve,reject)=>{const a=new Audio(track.source);a.onloadedmetadata=()=>resolve(a.duration);a.onerror=()=>reject(Error('New menu track failed to decode'));a.load();});
  return{early,late,duration,title:track.title,scene:$('#nowPlaying').dataset.scene,era:$('#menu').dataset.era,tagline:$('#menu .tagline').textContent};
 });
 assert.equal(result.era,'chapter4');assert.equal(result.scene,'menu-chapter4');assert.equal(result.tagline,'Space remembers.');assert(Math.abs(result.duration-199.632)<1);
 await page.evaluate(()=>draw(performance.now()));
 await page.screenshot({path:'outputs/NOSTRAVECTOR_Chapter4_Menu.png'});
 await page.evaluate(id=>switchCharacter(id),result.early);
 assert.equal(await page.locator('#menu').getAttribute('data-era'),'original');assert.equal(await page.locator('#nowPlaying').getAttribute('data-scene'),'menu');
 const session=await page.evaluate(()=>{
  const before=localStorage.getItem(CHARACTER_SAVES_KEY);
  menuLocationSession.set(savedGame.id,{checkpoint:JSON.stringify(savedGame.progress),body:'earth',phase:'off',eris:{chapter4:{stage:'destruction',flagshipDestroyed:true}}});updateMenuLocation();syncSoundtrack();
  return{era:$('#menu').dataset.era,scene:$('#nowPlaying').dataset.scene,unchanged:before===localStorage.getItem(CHARACTER_SAVES_KEY)};
 });
 assert.deepEqual(session,{era:'chapter4',scene:'menu-chapter4',unchanged:true});
 await page.evaluate(id=>switchCharacter(id),result.late);
 await page.reload({waitUntil:'domcontentloaded',timeout:120000});
 assert.equal(await page.locator('#menu').getAttribute('data-era'),'chapter4');
 await page.evaluate(()=>resetCharacterProgress(savedGame.id,1));
 assert.equal(await page.locator('#menu').getAttribute('data-era'),'original');
 assert.equal(await page.locator('#nowPlaying').getAttribute('data-scene'),'menu');
 const fixture=fs.readFileSync('work/test_karribassa_bosses_browser.js','utf8').replace(/\r/g,'').split('await p.evaluate(()=>{')[1].split('});\n // Anchors')[0];await page.evaluate(fixture);
 const flight=await page.evaluate(()=>{
  const s=polarState;Object.assign(s.space,{system:'sol',body:'earth',target:'earth',phase:'flight',position:[0,15000,0],yaw:.7,pitch:.15,hull:100,warp:null,interior:NVShipInterior.fresh()});
  const q=NVChapter4.ensure(s);q.stage='travel';q.flagshipDestroyed=false;updatePolarHUD();
  const pre=chapter4SpaceMood(s),oldBackground=getComputedStyle($('#galaxySheet')).backgroundImage;
  if(document.body.dataset.gameplayEra!=='original')throw Error('Earlier gameplay received the aftermath theme');
  q.stage='ambush';const during=chapter4SpaceMood(s);q.stage='awake';q.flagshipDestroyed=true;updatePolarHUD();
  if(document.body.dataset.gameplayEra!=='chapter4'||oldBackground===getComputedStyle($('#galaxySheet')).backgroundImage)throw Error('Aftermath theme did not reach gameplay panels');
  renderSpaceWorld(s,20,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});
  if(!spaceRenderer||$('#worldError').textContent)throw Error('Space shader did not initialise: '+$('#worldError').textContent);
  const c=polarCanvas.getContext('webgl'),error=c.getError(),post=chapter4SpaceMood(s),styled=$('#antarctica').classList.contains('space-aftermath');
  s.space.phase='atmosphere';const atmosphere=chapter4SpaceMood(s);s.space.phase='flight';NVShipInterior.ensure(s).active=true;const inside=chapter4SpaceMood(s);NVShipInterior.ensure(s).active=false;
  return{pre,during,post,styled,atmosphere,inside,error};
 });
 assert.deepEqual(flight,{pre:false,during:false,post:true,styled:true,atmosphere:false,inside:false,error:0});
 const audio=await page.evaluate(()=>{
  const before=localStorage.getItem(CHARACTER_SAVES_KEY),s=polarState;
  const scenes=[];for(const phase of ['flight','landed','atmosphere']){s.space.phase=phase;s.space.combatActive=true;syncSoundtrack();scenes.push($('#nowPlaying').dataset.scene);}
  soundtrack.setEnabled(false);soundtrack.setEnabled(true);soundtrack.unlock();syncSoundtrack();
  const status=$('#worldMusicStatus').textContent,hidden=$('#nowPlaying').hidden;
  s.space.phase='flight';return{scenes,status,hidden,unchanged:before===localStorage.getItem(CHARACTER_SAVES_KEY)};
 });
 assert.deepEqual(audio.scenes,['chapter4-silence','roam-chapter4','roam-chapter4']);assert.equal(audio.hidden,false);assert.equal(audio.unchanged,true);assert(require('./music_audio.json').filter(t=>t.role==='roam-chapter4').some(t=>audio.status==='SOUNDTRACK / '+t.title));
 await page.evaluate(()=>{renderSpaceWorld(polarState,21,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});});
 await page.screenshot({path:'outputs/NOSTRAVECTOR_Chapter4_Space.png'});
 await page.evaluate(()=>{toggleGalaxy(true);});assert(await page.locator('#galaxySheet').isVisible());
 await page.screenshot({path:'outputs/NOSTRAVECTOR_Chapter4_Galaxy.png'});
 await page.evaluate(()=>{toggleGalaxy(false);toggleSolChart(true);});assert(await page.locator('#solChart').isVisible());
 const atlas=await page.evaluate(()=>({background:getComputedStyle($('#solChart')).backgroundImage,colour:getComputedStyle($('#atlasPlayerFactionBox')).color}));assert(atlas.background.includes('23, 10, 19'));
 await page.screenshot({path:'outputs/NOSTRAVECTOR_Chapter4_Atlas.png'});
 await page.evaluate(()=>{toggleSolChart(false);toggleSurfaceAtlas(true);});assert(await page.locator('#surfaceAtlas').isVisible());
 await page.screenshot({path:'outputs/NOSTRAVECTOR_Chapter4_Surface_Atlas.png'});
 await page.evaluate(()=>{toggleSurfaceAtlas(false);});
 await page.evaluate(()=>{exitPolar();});assert.equal(await page.locator('#antarctica').evaluate(e=>e.classList.contains('space-aftermath')),false);
 assert.equal(await page.locator('body').getAttribute('data-gameplay-era'),'original');
 assert.equal(await page.locator('#nowPlaying').getAttribute('data-scene'),'menu-chapter4');
 assert.deepEqual(errors,[]);
 console.log('Passed: menu stays original before/during ambush, aftermath menu/music, separate characters, manual-save-only session, reload/reset, ominous space shader without WebGL errors, atmospheric/interior exclusions and exit cleanup.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
