// Playtest chapter resets are temporarily disabled in the player-facing game.
const PROGRESS_RESET_ENABLED=false;
const GAME_SAVE_KEY='nostravector.save.v1',CHARACTER_SAVES_KEY='nostravector.saves.v2';
let savedGame=null,savePersisted=false,characterSaves=[],activeCharacterId=null,creatingCharacter=false,saveAsCapture=null;
function readStoredJSON(key){try{return JSON.parse(localStorage.getItem(key));}catch(e){return null;}}
function characterId(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():'nv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function validCharacterSave(raw){
  if(!raw||typeof raw.id!=='string'||!raw.id||typeof raw.wanderer?.name!=='string'||!raw.wanderer.name.trim())return null;
  // Each slot owns its world, including uplifted empires. Never share nested
  // state when two characters are created from the same starting template.
  const p=raw.progress&&typeof raw.progress==='object'&&!Array.isArray(raw.progress)?JSON.parse(JSON.stringify(raw.progress)):{};
  p.checkpoint=typeof p.checkpoint==='string'&&p.checkpoint.trim()?p.checkpoint:typeof raw.checkpoint==='string'?raw.checkpoint:'character-created';
  p.chapter=Number.isSafeInteger(p.chapter)&&p.chapter>0&&p.chapter<=5?p.chapter:1;
  const world=p.antarctica,ship=world?.space,c4=world?.eris?.chapter4;
  if(world?.africaStarted)p.chapter=Math.max(p.chapter,2);
  if(ship&&(ship.phase&&ship.phase!=='off'||ship.body&&ship.body!=='earth'))p.chapter=Math.max(p.chapter,3);
  if(['travel','ambush','destruction','narration','timeskip','reclaim','awake'].includes(c4?.stage))p.chapter=Math.max(p.chapter,4);
  if(typeof chapter5Unlocked==='function'&&chapter5Unlocked(p.antarctica))p.chapter=5;
  p.playTimeSeconds=Number.isFinite(p.playTimeSeconds)&&p.playTimeSeconds>=0?p.playTimeSeconds:0;
  const now=new Date().toISOString();
  return {...raw,version:2,id:raw.id,checkpoint:p.checkpoint,progress:p,wanderer:validProfile(raw.wanderer),createdAt:typeof raw.createdAt==='string'?raw.createdAt:now,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:now};
}
function persistCharacterSaves(){
  savePersisted=false;
  try{localStorage.setItem(CHARACTER_SAVES_KEY,JSON.stringify({version:2,activeId:activeCharacterId,saves:characterSaves}));savePersisted=true;}catch(e){}
  return savePersisted;
}
function readGameSave(){
  const roster=readStoredJSON(CHARACTER_SAVES_KEY);
  if(roster?.version===2&&Array.isArray(roster.saves)){
    const ids=new Set();characterSaves=roster.saves.map(validCharacterSave).filter(s=>s&&!ids.has(s.id)&&ids.add(s.id));
    activeCharacterId=characterSaves.some(s=>s.id===roster.activeId)?roster.activeId:characterSaves[0]?.id||null;
    savePersisted=true;return characterSaves.find(s=>s.id===activeCharacterId)||null;
  }
  const raw=readStoredJSON(GAME_SAVE_KEY),legacy=readStoredJSON(PROFILE_KEY);
  const previous=raw?.version===1&&typeof raw.wanderer?.name==='string'&&raw.wanderer.name.trim()?raw:typeof legacy?.name==='string'&&legacy.name.trim()?{wanderer:legacy}:null;
  if(previous){
    const save=validCharacterSave({...previous,id:characterId()});
    characterSaves=[save];activeCharacterId=save.id;persistCharacterSaves();return save;
  }
  characterSaves=[];activeCharacterId=null;return null;
}
function writeGameSave(profile,initialProgress=null){
  const now=new Date().toISOString(),existing=creatingCharacter?null:characterSaves.find(s=>s.id===activeCharacterId);
  savedGame=validCharacterSave({...existing,id:existing?.id||characterId(),createdAt:existing?.createdAt||now,updatedAt:now,wanderer:validProfile(profile),progress:existing?.progress||initialProgress||{checkpoint:'character-created',chapter:1,playTimeSeconds:0}});
  const index=characterSaves.findIndex(s=>s.id===savedGame.id);
  if(index<0)characterSaves.push(savedGame);else characterSaves[index]=savedGame;
  activeCharacterId=savedGame.id;return persistCharacterSaves();
}
function checkpointLabel(save){return save.progress.checkpoint==='character-created'?'CHARACTER CREATED':save.progress.checkpoint.replace(/[-_]/g,' ').toUpperCase();}
function updateGameProgress(update){
  if(!savedGame||!update||typeof update!=='object'||Array.isArray(update))return false;
  const save=validCharacterSave({...savedGame,updatedAt:new Date().toISOString(),progress:{...savedGame.progress,...JSON.parse(JSON.stringify(update))}});
  if(saveAsCapture){saveAsCapture.save=save;return true;}
  const index=characterSaves.findIndex(s=>s.id===save.id);if(index<0)return false;
  characterSaves[index]=save;savedGame=save;return persistCharacterSaves();
}
function syncSavedGameMenu(){
  const hasSave=!!savedGame,label=hasSave?'CONTINUE':'NEW GAME';
  $('#primaryGameLabel').textContent=label;newGame.dataset.action=hasSave?'continue':'new-game';
  $('.hint').textContent=(hasSave?'ENTER TO CONTINUE':'ENTER FOR NEW GAME')+' · DRAG SUBJECT TO ROTATE';
  $('#savedNotice').textContent=hasSave?(savePersisted?'GAME SAVED / ':'SAVED FOR THIS SESSION / ')+savedWanderer.name.toUpperCase():'';
}
function continueSavedGame(){
  if(!savedGame){startNewCharacter();return;}
  return loadCharacterSave(savedGame.id);
}
function loadCharacterSave(id){
  const target=characterSaves.find(s=>s.id===id);if(!target)return false;
  if(typeof gameActive!=='undefined'&&gameActive)return false;
  const previous={save:savedGame,active:activeCharacterId,wanderer:savedWanderer};
  try{
    savedGame=target;activeCharacterId=id;savedWanderer=validProfile(target.wanderer);
    // A preview failure must not prevent loading the actual saved world.
    try{syncMenuWanderer();}catch(error){window.NVStartup?.preview(error);}
    try{chime();}catch(error){console.warn('Menu sound:',error);}
    startAntarctica();
    if(!gameActive||polarScreen.hidden||!polarRenderer)throw Error($('#worldError').textContent||'The world renderer could not start.');
    persistCharacterSaves();syncSavedGameMenu();return true;
  }catch(error){
    console.error('Load save:',error);gameActive=false;gamePaused=false;cancelAnimationFrame(polarFrame);
    polarScreen.hidden=true;$('#menu').inert=false;$('#menu').removeAttribute('aria-hidden');
    savedGame=previous.save;activeCharacterId=previous.active;savedWanderer=previous.wanderer;
    try{syncSavedGameMenu();}catch(ignored){}
    $('#savedNotice').textContent='COULD NOT LOAD SAVE: '+String(error.message||error)+' / YOUR SAVE IS RETAINED.';
    return false;
  }
}
function startNewCharacter(){
  if(customActive)closeCustomizer();
  creatingCharacter=true;openIntro();
}
function switchCharacter(id){
  const save=characterSaves.find(s=>s.id===id);if(!save)return;
  activeCharacterId=id;savedGame=save;savedWanderer=validProfile(save.wanderer);creatingCharacter=false;
  persistCharacterSaves();syncMenuWanderer();syncSavedGameMenu();$('#characterSelect').close();newGame.focus();
}
function commitManagedSaves(next,activeId){
  if(typeof gameActive!=='undefined'&&gameActive)return{ok:false,message:'Return to the main menu before changing saved characters.'};
  try{localStorage.setItem(CHARACTER_SAVES_KEY,JSON.stringify({version:2,activeId,saves:next}));}
  catch(e){return{ok:false,message:'Could not update saved data. Your characters have not changed. Allow browser storage and try again.'};}
  characterSaves=next;activeCharacterId=activeId;savedGame=next.find(s=>s.id===activeId)||null;savePersisted=true;creatingCharacter=false;
  savedWanderer=savedGame?validProfile(savedGame.wanderer):{...DEFAULT_WANDERER};syncMenuWanderer();syncSavedGameMenu();return{ok:true};
}
function resetCharacterProgress(id,chapter=1,name=null,choices={}){
  if(!PROGRESS_RESET_ENABLED)return{ok:false,message:'Progress reset is currently disabled. Your save is unchanged.'};
  const save=characterSaves.find(s=>s.id===id);if(!save)return{ok:false,message:'This character is no longer available.'};
  if(typeof gameActive!=='undefined'&&gameActive)return{ok:false,message:'Return to the main menu before resetting progress.'};
  if(!Object.hasOwn(CHAPTER_RESTARTS,chapter))return{ok:false,message:'Choose a valid chapter or story checkpoint.'};
  const text=name===null?save.wanderer.name:String(name).trim().replace(/\s+/g,' ').slice(0,24);
  if(!text)return{ok:false,message:'Enter a Wanderer name.'};
  try{
    const progress=chapterRestartProgress(save,Number(chapter),choices),replacement=validCharacterSave({...save,updatedAt:new Date().toISOString(),wanderer:{...save.wanderer,name:text},progress});
    if(!replacement)return{ok:false,message:'Could not prepare this checkpoint. Your save is unchanged.'};
    const result=commitManagedSaves(characterSaves.map(s=>s.id===id?replacement:s),id);
    return{...result,message:result.ok?'Progress reset / '+CHAPTER_RESTARTS[chapter].name:result.message};
  }catch(error){return{ok:false,message:'Could not prepare this checkpoint. Your save is unchanged. '+error.message};}
}
function removeCharacterSave(id){
  const index=characterSaves.findIndex(s=>s.id===id);if(index<0)return{ok:false,message:'This character is no longer available.'};
  const name=characterSaves[index].wanderer.name,next=characterSaves.filter(s=>s.id!==id),activeId=activeCharacterId===id?(next[Math.min(index,next.length-1)]?.id||null):activeCharacterId;
  const result=commitManagedSaves(next,activeId);return{...result,message:result.ok?'Removed '+name+' and their saved progress.':result.message};
}
function eraseAllGameSaves(){
  // Keep an empty v2 roster so old migration data cannot recreate deleted characters.
  const result=commitManagedSaves([],null);if(!result.ok)return result;
  let legacyClean=true;for(const key of [GAME_SAVE_KEY,PROFILE_KEY])try{localStorage.removeItem(key);}catch(e){legacyClean=false;}
  return{ok:true,message:legacyClean?'All characters and saved progress erased. You can start a new game.':'Current saves erased. Older save data could not be cleared; try ERASE ALL SAVE DATA again.'};
}
function renderCharacterList(){
  const list=$('#characterList');list.replaceChildren();
  $('#characterCount').textContent=characterSaves.length+' SAVED '+(characterSaves.length===1?'WANDERER':'WANDERERS');
  $('#noCharacters').hidden=characterSaves.length>0;
  characterSaves.forEach((save,index)=>{
    const active=save.id===activeCharacterId,card=document.createElement('button');card.type='button';card.className='character-slot'+(active?' active':'');card.dataset.characterId=save.id;
    card.setAttribute('aria-label',active?'Active character: '+(save.slotName||save.wanderer.name):'Switch to '+(save.slotName||save.wanderer.name));card.setAttribute('aria-pressed',String(active));
    const avatar=document.createElement('span');avatar.className='slot-avatar';avatar.setAttribute('aria-hidden','true');avatar.style.setProperty('--suit',save.wanderer.suit);avatar.style.setProperty('--trim',save.wanderer.trim);
    const info=document.createElement('span');info.className='slot-info';
    const number=document.createElement('span');number.className='slot-number';number.textContent='WANDERER '+String(index+1).padStart(2,'0');
    const name=document.createElement('strong');name.textContent=save.slotName||save.wanderer.name;
    const progress=document.createElement('span');progress.className='slot-progress';progress.textContent='CHAPTER '+String(save.progress.chapter).padStart(2,'0')+' / '+checkpointLabel(save);
    const updated=document.createElement('span');updated.className='slot-date';const date=new Date(save.updatedAt);updated.textContent=Number.isNaN(date.getTime())?'SAVED CHARACTER':'SAVED '+date.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
    const action=document.createElement('span');action.className='slot-action';action.textContent=active?'ACTIVE':'SELECT ↗';
    info.append(number,name,progress,updated);card.append(avatar,info,action);card.onclick=()=>switchCharacter(save.id);
    const entry=document.createElement('article');entry.className='character-entry';const tools=document.createElement('div');tools.className='slot-tools';
    for(const [kind,label] of [['load','LOAD SAVE'],['copy','SAVE AS'],['reset','RESET PROGRESS'],['remove','REMOVE CHARACTER']]){if(kind==='reset'&&!PROGRESS_RESET_ENABLED)continue;const button=document.createElement('button');button.type='button';button.className='slot-tool'+(kind==='remove'?' danger-action':'');button.textContent=label;button.setAttribute('aria-label',(kind==='load'?'Load save ':kind==='copy'?'Save a copy of ':kind==='reset'?'Reset progress for ':'Remove ')+(save.slotName||save.wanderer.name));button.onclick=()=>kind==='load'?loadCharacterSave(save.id):kind==='copy'?openSaveAs(save.id):requestSaveChange(kind,save.id);tools.append(button);}
    entry.append(card,tools);list.append(entry);
  });
}
function openCharacterSelect(){
  chime();renderCharacterList();$('#characterManagementStatus').textContent='';
  $('#characterSelect').showModal();
}
