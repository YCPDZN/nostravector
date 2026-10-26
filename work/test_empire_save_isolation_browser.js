const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.stack));
  await page.addInitScript(()=>{
   requestAnimationFrame=()=>0;setInterval=()=>0;
   const NativeAudio=Audio;
   window.Audio=function(src){const a=new NativeAudio(src);Object.defineProperty(a,'preload',{get:()=>a.getAttribute('preload')||'none',set:v=>a.setAttribute('preload',v==='metadata'?'none':v)});return a;};
  });
  await page.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
  const alpha=await page.evaluate(()=>{
   creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Empire Alpha'},{chapter:3});creatingCharacter=false;
   updateGameProgress(chapterRestartProgress(savedGame,3));startAntarctica();
   const storage=localStorage.getItem(CHARACTER_SAVES_KEY);
   const n=NVCustomCrew.create(polarState,{name:'Luma',species:NVSpecies.preset('aquatic')}).npc;
   const result=NVCustomCrew.uplift(polarState,n.id,'cluster-03',{factionName:'Azure Concord',headOfState:'Luma',headOfGovernment:'Evi'});
   const manualOnly=storage===localStorage.getItem(CHARACTER_SAVES_KEY);
   NVOccupation.sync(polarState);savePolarWorld(true);exitPolar();
   return{id:savedGame.id,ok:result.ok,manualOnly,record:n.id};
  });
  assert(alpha.ok&&alpha.manualOnly);
  const beta=await page.evaluate(()=>{
   creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Empire Beta'},{chapter:3});creatingCharacter=false;
   updateGameProgress(chapterRestartProgress(savedGame,3));startAntarctica();
   const empty=NVCustomCrew.empires(polarState).length===0,available=NVCustomCrew.eligible(polarState,'cluster-03');
   const n=NVCustomCrew.create(polarState,{name:'Taryn',species:NVSpecies.preset('avian')}).npc;
   const result=NVCustomCrew.uplift(polarState,n.id,'cluster-03',{factionName:'Crimson Assembly',headOfState:'Taryn',headOfGovernment:'Rin'});
   NVOccupation.sync(polarState);savePolarWorld(true);exitPolar();
   return{id:savedGame.id,ok:result.ok,empty,available,record:n.id};
  });
  assert(beta.ok&&beta.empty&&beta.available);
  assert.equal(alpha.record,beta.record,'Matching local IDs must be safe across saves.');
  for(const [slot,name,leader] of [[alpha,'Azure Concord','Luma'],[beta,'Crimson Assembly','Taryn'],[alpha,'Azure Concord','Luma']]){
   const state=await page.evaluate(id=>{
    switchCharacter(id);
    const menu=NVCustomCrew.empires(customCrewWorld()).map(n=>n.factionName);
    startAntarctica();galaxySelected='cluster-03';refreshGalaxy();
    const n=NVCustomCrew.empires(polarState)[0],worlds=NVCluster.bodyLists[n.system];
    const result={menu,name:NVDiplomacy.name(polarState,NVCustomCrew.faction(n)),leader:n.headOfState,
     map:$('#galaxyFaction').textContent,note:$('#galaxyNote').textContent,
     owned:worlds.every(b=>NVEris.faction(polarState,b.id)===NVCustomCrew.faction(n)),
     bases:worlds.every(b=>NVOccupation.sync(polarState).some(q=>q.body===b.id))};
    exitPolar();return result;
   },slot.id);
   assert.deepEqual(state.menu,[name]);assert.equal(state.name,name);assert.equal(state.leader,leader);
   assert(state.map.includes(name)&&state.note.includes(leader)&&state.owned&&state.bases);
  }
  // Editing and deleting Beta must leave Alpha's serialized world untouched.
  const removal=await page.evaluate(({a,b})=>{
   const before=JSON.stringify(characterSaves.find(s=>s.id===a));switchCharacter(b);
   const s=customCrewWorld(),n=NVCustomCrew.empires(s)[0];
   NVCustomCrew.setGovernment(s,n.id,{factionName:'Renamed Assembly',headOfState:'New Leader',headOfGovernment:'Rin'});persistMenuCustomCrew(s);
   startAntarctica();const storage=localStorage.getItem(CHARACTER_SAVES_KEY);
   const deleted=NVCustomCrew.remove(polarState,n.id).ok;
   const manualOnly=storage===localStorage.getItem(CHARACTER_SAVES_KEY);
   const available=NVCustomCrew.eligible(polarState,'cluster-03');savePolarWorld(true);exitPolar();
   const unchanged=before===JSON.stringify(characterSaves.find(s=>s.id===a));switchCharacter(a);
   return{deleted,manualOnly,available,unchanged};
  },{a:alpha.id,b:beta.id});
  assert.deepEqual(removal,{deleted:true,manualOnly:true,available:true,unchanged:true});
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});
  const restored=await page.evaluate(({a,b})=>{
   const active=savedGame.id,n=NVCustomCrew.empires(customCrewWorld())[0];
   startAntarctica();const owned=NVCluster.bodyLists['cluster-03'].every(w=>NVEris.faction(polarState,w.id)==='UPLIFT_custom-1');exitPolar();
   switchCharacter(b);startAntarctica();galaxySelected='cluster-03';refreshGalaxy();
   const released=NVCustomCrew.eligible(polarState,'cluster-03')&&!$('#galaxyFaction').textContent.includes('Concord')&&!$('#galaxyFaction').textContent.includes('Assembly');exitPolar();
   creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Empire Gamma'},{chapter:3});creatingCharacter=false;
   updateGameProgress(chapterRestartProgress(savedGame,3));startAntarctica();
   const fresh=NVCustomCrew.empires(polarState).length===0&&NVCustomCrew.eligible(polarState,'cluster-03');
   return{active,alpha:a,name:n.factionName,owned,released,fresh};
  },{a:alpha.id,b:beta.id});
  assert.equal(restored.active,alpha.id);assert.equal(restored.name,'Azure Concord');
  assert(restored.owned&&restored.released&&restored.fresh);assert.deepEqual(errors,[]);
  console.log('Passed independent empire ownership in the same system, matching IDs, map labels, bases, switching, rename/delete isolation, reload, fresh saves and manual-only gameplay saves.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
