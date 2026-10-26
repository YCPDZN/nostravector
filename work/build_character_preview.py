"""Temporary visual QA, with persistent saves protected against writes."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
guard="const nativeCharacterStorage=window.localStorage;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>nativeCharacterStorage.getItem(key),setItem(){throw Error('Read-only character QA');},removeItem(){throw Error('Read-only character QA');}}});"
html=html.replace('<script>','<script>'+guard,1)
fixture="""
const characterPreview=NVAntarctica.fresh(124);Object.assign(characterPreview,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});
NVAntarctica.grantWakeInventory(characterPreview);NVAfrica.arrive(characterPreview);characterPreview.africaStage='complete';characterPreview.friendQuest='recruited';characterPreview.friendDialogueDone=true;characterPreview.spaceshipFound=true;characterPreview.space=NVSpace.fresh();characterPreview.space.crew=true;characterPreview.space.body='mars';characterPreview.space.phase='atmosphere';characterPreview.space.geo={lat:-34.5,lon:121.25,altitude:0,heading:0,look:0,global:true};NVWorldFlight.touchdown(characterPreview);characterPreview.z=characterPreview.space.landingZ-40;characterPreview.cameraYaw=Math.PI;characterPreview.cameraPitch=.12;characterPreview.friend={x:characterPreview.x-1.15,z:characterPreview.z,yaw:0};
savedGame=validCharacterSave({id:'temporary-character-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:3,checkpoint:'character-preview',antarctica:NVAntarctica.snapshot(characterPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();soundtrack.setEnabled(false);$('#saveWorld').disabled=true;
const controls=document.createElement('div');controls.style='position:fixed;top:14px;left:35%;z-index:95;display:flex;gap:6px;background:#071827;padding:6px';
function qaButton(label,action){const b=document.createElement('button');b.textContent=label;b.onclick=action;controls.append(b);}
let qaProfile=false;const qaTickSpace=tickSpace;tickSpace=function(dt){if(qaProfile&&polarState.space.phase==='landed'){polarState.cameraYaw=0;qaTickSpace(dt);polarState.cameraYaw=Math.PI/2;}else qaTickSpace(dt);};
qaButton('PROFILE RUN',()=>{qaProfile=true;polarState.cameraPitch=.12;polarKeys.clear();polarKeys.add('KeyW');polarKeys.add('ShiftLeft');});
qaButton('FRONT',()=>{polarState.cameraYaw=Math.PI;polarState.cameraPitch=.12;});qaButton('SIDE',()=>polarState.cameraYaw=Math.PI/2);qaButton('BACK',()=>polarState.cameraYaw=0);
qaButton('WALK',()=>{polarKeys.clear();polarKeys.add('KeyW');});qaButton('SPRINT',()=>{polarKeys.clear();polarKeys.add('KeyW');polarKeys.add('ShiftLeft');});qaButton('STOP',()=>polarKeys.clear());
qaButton('MENU',()=>{polarKeys.clear();savedGame.progress.antarctica=NVAntarctica.snapshot(polarState);exitPolar();setMotion(false);window.NVMenu?.setAngles(.1,1.5);});
qaButton('RESUME',()=>{continueSavedGame();$('#saveWorld').disabled=true;});qaButton('HIDE CONTROLS',()=>controls.style.display='none');document.body.append(controls);
"""
at=html.rfind('</script>');(root/'outputs/character-rendering-qa.html').write_text(html[:at]+fixture+html[at:],encoding='utf-8')
print('Created read-only character QA at Mars global coordinates 121250 / -34500.')
