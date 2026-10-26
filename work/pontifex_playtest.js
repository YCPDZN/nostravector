// The arena uses an unregistered, memory-only character checkpoint.
let pontifexDebugSession=null;
const pontifexPlaytestButton=document.createElement('button');pontifexPlaytestButton.id='pontifexPlaytest';pontifexPlaytestButton.className='menu-btn pontifex-debug-button';
pontifexPlaytestButton.innerHTML='<span class="num">DBG</span>PONTIFEX PLAYTEST<span class="arrow" aria-hidden="true">↗</span>';
pontifexPlaytestButton.title='Fight the boss immediately in a temporary debug arena.';$('.menu-nav').append(pontifexPlaytestButton);
const pontifexDebugBar=document.createElement('section');pontifexDebugBar.id='pontifexDebugBar';pontifexDebugBar.hidden=true;
pontifexDebugBar.innerHTML='<span>DEBUG / PONTIFEX PLAYTEST · SAVING DISABLED</span><button id="restartPontifexDebug" class="polar-button">RESTART FIGHT</button><button id="exitPontifexDebug" class="polar-button">EXIT PLAYTEST</button>';
cleanHUDRoot.append(pontifexDebugBar);
function restorePontifexDebug(){
 const session=pontifexDebugSession;if(!session)return;
 savedGame=session.savedGame;savedWanderer=session.savedWanderer;savePersisted=session.savePersisted;polarState=session.polarState;activeCharacterId=session.activeCharacterId;
 menuLocationSession.delete(session.id);menuPartySession.delete(session.id);pontifexDebugSession=null;pontifexDebugBar.hidden=true;
 $('#saveWorld').disabled=session.saveDisabled;$('#saveWorld').textContent=session.saveLabel;
 syncMenuWanderer();syncSavedGameMenu();
}
function startPontifexPlaytest(){
 if(pontifexDebugSession)exitPolar();if(gameActive||introActive||customActive)return false;
 const id='pontifex-playtest-'+Date.now(),profile=validProfile(savedGame?.wanderer||{...DEFAULT_WANDERER,name:'Playtest Wanderer'}),save={id,wanderer:profile,progress:{chapter:3}};
 const s=NVAntarctica.restored(chapterRestartProgress(save,3),id);s.space=NVSpace.fresh();Object.assign(s.space,{phase:'landed',body:'mercury',target:'mercury',landingX:0,landingZ:0,crew:false});s.x=0;s.z=0;s.yaw=0;s.cameraYaw=0;s.cameraPitch=.28;s.friendQuest='declined';
 const c=NVConstruction.ensure(s);c.started=true;c.stage=9;
 const w=NVSolWar.ensure(s);w.stage='war';NVPontifex.onSoldierDeath(w,{id:0,originFaction:'TERRA',captain:'Debug arena soldier',body:'mercury',hp:0,leader:null},[]);w.stage='pending';
 const q=NVPontifex.ensure(s);Object.assign(q,{site:{x:0,z:16,lat:0,lon:0,global:false},yaw:Math.PI,track:true,notice:'DEBUG ARENA / CLICK THE BOSS OR PRESS Z · SHIFT TO SPRINT · SPACE TO JUMP',noticeTime:8});
 pontifexDebugSession={id,savedGame,savedWanderer,savePersisted,polarState,activeCharacterId,saveDisabled:$('#saveWorld').disabled,saveLabel:$('#saveWorld').textContent};
 savedGame={...save,progress:{chapter:3,checkpoint:'pontifex-debug-arena',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)}};savedWanderer=profile;
 try{startAntarctica();constructionGuideHidden=true;updatePolarHUD();return true;}catch(error){if(gameActive)exitPolar();else restorePontifexDebug();$('#savedNotice').textContent='PLAYTEST COULD NOT START / '+error.message;console.error(error);return false;}
}
pontifexPlaytestButton.onclick=startPontifexPlaytest;
$('#restartPontifexDebug').onclick=()=>{if(pontifexDebugSession)startPontifexPlaytest();};$('#exitPontifexDebug').onclick=()=>{if(pontifexDebugSession)exitPolar();};
const pontifexDebugSave=savePolarWorld;savePolarWorld=manual=>{if(pontifexDebugSession){$('#pauseSaveStatus').textContent='DEBUG PLAYTEST / SAVING DISABLED';return;}return pontifexDebugSave(manual);};
const pontifexDebugStep=NVEris.step;NVEris.step=(s,dt)=>{if(pontifexDebugSession&&s===polarState){NVPontifex.step(s,dt);return[];}return pontifexDebugStep(s,dt);};
const pontifexDebugHUD=updatePolarHUD;updatePolarHUD=()=>{
 pontifexDebugHUD();pontifexDebugBar.hidden=!pontifexDebugSession||!gameActive||gamePaused;if(!pontifexDebugSession)return;
 $('#saveWorld').disabled=true;$('#saveWorld').textContent='DEBUG / SAVING DISABLED';$('#pauseSaveStatus').textContent='Temporary fight. Your character’s saved progress is unchanged.';
 $('#hudMissionKicker').textContent='DEBUG / BOSS ARENA';$('#hudMissionTitle').textContent=NVPontifex.ensure(polarState).alive?'DEFEAT THE PONTIFEX':'PONTIFEX DEFEATED';$('#hudMissionText').textContent='Click the boss or press Z. Sprint away from red markers; attack its exposed heart after a swing. Restart Fight resets the arena.';$('#hudMissionMeta').textContent='TEMPORARY SESSION / NO SAVE DATA';
};
const pontifexDebugExit=exitPolar;exitPolar=()=>{try{pontifexDebugExit();}finally{restorePontifexDebug();}};
