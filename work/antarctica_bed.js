let bedRestNoticeUntil=0;
function updateBedHUD(){
  const s=polarState,A=NVAntarctica,active=gameActive&&s.ferryDialogueDone&&!gamePaused&&!jamesConversation.active&&!hazardModalActive();
  const inside=A.inShelter(s),near=Math.hypot(s.x-A.BED.x,s.z-A.BED.z)<=1.8;
  $('#bedWorkshop').hidden=!active||!inside||s.bedSleeping||!!s.car?.driving;
  if(active&&inside)$('#vehiclePanel').hidden=true;
  if(s.bedSleeping){$('#autoWalk').disabled=true;$('#toggleSprint').disabled=true;$('#vehiclePanel').hidden=true;}
  $('#bedTitle').textContent=s.bedBuilt?'SHELTER BED':'CONSTRUCT A BED';
  $('#bedParts').textContent=s.bedBuilt?'Insulated field bed / ready to rest.':s.bedMaterialsCollected?'FRAME 1/1 · INSULATED PAD 1/1 · FABRIC 1/1':'Salvage a frame, insulated pad and fabric from the station’s spare parts.';
  $('#bedAction').textContent=s.bedBuilt?'SLEEP UNTIL DAWN / B':s.bedMaterialsCollected?'CONSTRUCT BED / B':'SALVAGE BED PARTS / B';
  $('#bedAction').disabled=s.bedBuilt&&!near;
  $('#bedHint').textContent=s.bedBuilt?(near?'Rest restores stamina and suit heat.':'Approach the bed on the left side of the shelter.'):'Bed parts are available inside this shelter.';
  $('#bedSleepOverlay').hidden=!gameActive||!s.bedSleeping||s.dreamActive;
  $('#bedSleepShade').style.opacity=String(Math.min(.97,.2+s.bedSleepProgress/.9));
  $('#bedSleepBar').value=s.bedSleepProgress;
  $('#bedSleepTime').textContent=gamePaused?'REST PAUSED':'RESTING / '+Math.ceil(A.BED_SLEEP_SECONDS-s.bedSleepProgress)+' S';
  $('#bedRestStatus').hidden=!gameActive||gamePaused||jamesConversation.active||s.bedSleeping||polarClock>=bedRestNoticeUntil;
  if(s.ferryDialogueDone&&!s.bedRested)$('#stationPrompt').hidden=true;
  if(s.bedSleeping){$('#coastalSupplies').hidden=true;}
}
function interactWithBed(){
  if(!gameActive||gamePaused||betrayalActive()||africaModal()||polarState.ferryEscaped||jamesConversation.active||hazardModalActive())return;
  const s=polarState,A=NVAntarctica;
  if(!s.bedMaterialsCollected)A.collectBedMaterials(s);
  else if(!s.bedBuilt)A.constructBed(s);
  else if(A.beginBedSleep(s)){
    stopJamesVoice();stopHazardNarration();polarKeys.clear();polarAutoWalk=false;polarSprint=false;polarCameraDrag=false;
    polarPoseSpeed=0;jamesPoseSpeed=0;polarTrail=[];$('#coldRecovery').hidden=true;$('#stormAlert').hidden=true;
  }
  polarCanvas.focus();updatePolarHUD();
}
function tickBedSleep(dt){
  if(NVAntarctica.bedSleepStep(polarState,dt)){bedRestNoticeUntil=polarClock+7;polarKeys.clear();polarCanvas.focus();}
}
$('#bedAction').onclick=interactWithBed;
