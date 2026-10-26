let stormAlertUntil=0;
function polarDestination(s){if(s.africaStarted)return NVAfrica.destination(s);if(s.bedRested)return NVAntarctica.FERRY;if(s.ferryDialogueDone&&!s.bedRested)return s.bedBuilt?NVAntarctica.BED:NVAntarctica.STATION;if(s.ferryPlanKnown&&s.superBlizzard)return NVAntarctica.STATION;return s.suppliesPlanKnown&&!s.suppliesCollected?NVAntarctica.DEPOT:NVAntarctica.STATION;}
function polarObjectiveDistance(s){if(s.africaStarted)return NVAfrica.distance(s);const d=polarDestination(s);return Math.max(0,Math.hypot(s.x-d.x,s.z-d.z)-(d===NVAntarctica.FERRY?0:d===NVAntarctica.BED?1.8:d===NVAntarctica.DEPOT?7:NVAntarctica.STATION.radius));}
function updateEarthMap(){
  if(!polarState)return;if(polarState.africaStarted){updateAfricaHUD();return;}
  // Regional travel remains in Antarctica on this global orientation map.
  const x=360+NVAntarctica.clamp(polarState.x/500,-16,16),y=345-NVAntarctica.clamp(polarState.z/450,0,12);
  for(const id of ['#earthPlayerDot','#earthAtlasDot']){$(id).setAttribute('cx',x.toFixed(2));$(id).setAttribute('cy',y.toFixed(2));}
  $('#earthLocation').textContent='YOU / ANTARCTICA · SOUTHERN EDGE';
}
function selectPolarMap(view){
  $('#earthMapView').hidden=view!=='earth';$('#localMapView').hidden=view==='earth';
  $('#showEarthMap').setAttribute('aria-pressed',String(view==='earth'));$('#showLocalMap').setAttribute('aria-pressed',String(view!=='earth'));
  $('#polarMapTitle').textContent=view==='earth'?'EARTH / OUR PLACE IN THE SOL SYSTEM':'ANTARCTICA / LOCAL SECTOR';
  if(view!=='earth')drawPolarMap();updateEarthMap();
}
function updateSupplyHUD(){
  const s=polarState,near=s.suppliesPlanKnown&&!s.suppliesCollected&&Math.hypot(s.x-NVAntarctica.DEPOT.x,s.z-NVAntarctica.DEPOT.z)<9&&!s.car?.driving;
  $('#coastalSupplies').hidden=!near||jamesConversation.active||gamePaused;
  $('#supplyInventory').hidden=!s.inventoryUnlocked&&!s.suppliesCollected;if(s.inventoryUnlocked)$('#supplyInventory').textContent='PACK / '+s.inventory.ration+' RATIONS · '+s.inventory.water+' WATER · '+s.inventory.powerCell+' CELLS';
  if(polarClock>stormAlertUntil)$('#stormAlert').hidden=true;
}
function collectCoastalSupplies(){
  const s=polarState;if(!gameActive||gamePaused||jamesConversation.active||hazardModalActive()||!s.suppliesPlanKnown||s.suppliesCollected||s.car?.driving||Math.hypot(s.x-NVAntarctica.DEPOT.x,s.z-NVAntarctica.DEPOT.z)>=9)return;
  s.suppliesCollected=true;if(s.inventoryUnlocked)NVAntarctica.salvageMaterials(s);polarCanvas.focus();updatePolarHUD();
}
$('#collectSupplies').onclick=collectCoastalSupplies;
$('#showEarthMap').onclick=()=>selectPolarMap('earth');$('#showLocalMap').onclick=()=>selectPolarMap('local');
$('#earthMinimap').onclick=()=>{openFieldMap();selectPolarMap('earth');};
document.querySelectorAll('[data-earth-atlas]').forEach(img=>img.setAttribute('href',earthSource));
