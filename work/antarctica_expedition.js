const EXPEDITION_ITEMS={ration:{name:'Field ration',effect:'Restores 35 stamina'},water:{name:'Sealed water',effect:'Restores 20 stamina'},powerCell:{name:'Power cell',effect:'Restores 40 suit heat'},scrap:{name:'Metal scrap',effect:'Crafting material'},fabric:{name:'Insulated fabric',effect:'Crafting material'},heatPack:{name:'Heat pack',effect:'Restores 65 suit heat'},repairKit:{name:'Suit repair kit',effect:'Restores all suit heat'}};
const EXPEDITION_RECIPES={heatPack:{name:'Heat pack',description:'1 fabric + 1 power cell'},repairKit:{name:'Suit repair kit',description:'2 scrap + 1 fabric'},insulatedSuit:{name:'Suit insulation',description:'2 scrap + 2 fabric / 30% less storm heat loss'}};
function updateExpeditionHUD(){
  const s=polarState;if(!s)return;
  $('#openInventory').hidden=!gameActive||!s.inventoryUnlocked||s.bedSleeping||betrayalActive()||africaModal()||jamesConversation.active||hazardModalActive();
  $('#openInventory').disabled=gamePaused;
  $('#dreamScene').hidden=!gameActive||!s.dreamActive;
  $('#dreamScene').style.animationPlayState=gamePaused?'paused':'running';
  updateGrekDream();
  $('#ferryArrival').hidden=!gameActive||!s.ferryFound||s.betrayalStage!=='unseen'||s.bedSleeping||gamePaused||jamesConversation.active;
  if(s.dreamActive){$('#bedSleepOverlay').hidden=true;$('#bedRestStatus').hidden=true;}
}
function leaveDream(){advanceGrekLine();}
function openInventory(){
  if(!gameActive||gamePaused||betrayalActive()||africaModal()||!polarState.inventoryUnlocked||polarState.bedSleeping||jamesConversation.active||hazardModalActive())return;
  pausePolar(true);$('#worldPauseSheet').hidden=true;$('#inventorySheet').hidden=false;
  $('#inventoryFeedback').textContent='Choose an item or recipe. Changes are unsaved until you use SAVE GAME.';renderInventory();$('#closeInventory').focus();
}
function closeInventory(){if(!gameActive)return;$('#inventorySheet').hidden=true;pausePolar(false);}
function inventoryActionAllowed(){return gameActive&&!betrayalActive()&&polarState.inventoryUnlocked&&!polarState.bedSleeping&&!$('#inventorySheet').hidden;}
function renderInventory(){
  const s=polarState,A=NVAntarctica;
  $('#inventoryItems').innerHTML=Object.entries(EXPEDITION_ITEMS).map(([key,q])=>'<div class="inventory-row"><div><strong>'+q.name+'</strong><small>'+q.effect+'</small></div><span>'+s.inventory[key]+'</span>'+(['scrap','fabric'].includes(key)?'':'<button class="polar-button" data-use-item="'+key+'" '+(s.inventory[key]<=0?'disabled':'')+'>USE</button>')+'</div>').join('');
  if(typeof NVConstruction!=='undefined')$('#inventoryItems').innerHTML+=Object.entries(NVConstruction.ensure(s).stock).map(([key,count])=>'<div class="inventory-row"><div><strong>'+({wood:'Wood',stone:'Stone',metal:'Metal',solarCell:'Solar cells'}[key])+'</strong><small>Building material / left-click resources to gather</small></div><span>'+count+'</span></div>').join('');
  $('#inventoryRecipes').innerHTML=Object.entries(EXPEDITION_RECIPES).map(([key,q])=>{const r=A.RECIPES[key],enabled=!s.car?.driving&&!(r.upgrade&&s.suitInsulated)&&Object.entries(r.cost).every(([k,n])=>s.inventory[k]>=n);return '<div class="recipe-row"><strong>'+q.name+'</strong><small>'+q.description+'</small><button class="polar-button" data-craft-item="'+key+'" '+(!enabled?'disabled':'')+'>'+(r.upgrade&&s.suitInsulated?'EQUIPPED':'CRAFT')+'</button></div>';}).join('');
  const atStation=A.inShelter(s),atDepot=!s.africaStarted&&Math.hypot(s.x-A.DEPOT.x,s.z-A.DEPOT.z)<9;
  $('#salvageMaterials').disabled=!!s.car?.driving||(!atStation&&!atDepot)||(atStation?s.stationSalvaged:s.depotSalvaged);
  $('#salvageHint').textContent=s.africaStarted?'No salvage cache nearby on this coast.':atStation?'Station cache / spare scrap and fabric.':atDepot?'Depot cache / provisions, scrap, fabric and power cells.':'Salvage caches are inside the station and at the coastal depot.';
  $('#insulationStatus').textContent=s.suitInsulated?'SUIT INSULATION / EQUIPPED · 30% LESS HEAT LOSS':'SUIT INSULATION / STANDARD';
  document.querySelectorAll('[data-use-item]').forEach(b=>b.onclick=()=>useInventoryItem(b.dataset.useItem));
  document.querySelectorAll('[data-craft-item]').forEach(b=>b.onclick=()=>craftInventoryItem(b.dataset.craftItem));
}
function useInventoryItem(key){if(!inventoryActionAllowed())return;const hullRepair=key==='repairKit'&&typeof spaceActive==='function'&&spaceActive()&&polarState.space.hull<100;const done=hullRepair?NVSpace.repair(polarState):NVAntarctica.useItem(polarState,key);$('#inventoryFeedback').textContent=done?(hullRepair?'Ship hull repaired':EXPEDITION_ITEMS[key].name+' used')+'. / UNSAVED':'No item used. Your relevant gauge is full or the item is unavailable.';renderInventory();updatePolarHUD();}
function craftInventoryItem(key){if(!inventoryActionAllowed())return;const done=NVAntarctica.craftItem(polarState,key);$('#inventoryFeedback').textContent=done?EXPEDITION_RECIPES[key].name+' crafted. / UNSAVED':'Cannot craft: check materials, equipment and vehicle status.';renderInventory();updatePolarHUD();}
function salvageInventory(){if(!inventoryActionAllowed())return;const done=NVAntarctica.salvageMaterials(polarState);$('#inventoryFeedback').textContent=done?'Cache collected. Materials added to inventory. / UNSAVED':'This cache is empty or out of reach.';renderInventory();updatePolarHUD();}
function checkFerryArrival(){const s=polarState;if(s.bedRested&&s.betrayalStage==='unseen'&&Math.hypot(s.x-NVAntarctica.FERRY.x,s.z-NVAntarctica.FERRY.z)<=26)beginFerryBetrayal();}
$('#openInventory').onclick=openInventory;$('#closeInventory').onclick=closeInventory;$('#salvageMaterials').onclick=salvageInventory;$('#leaveDream').onclick=leaveDream;$('#dreamPause').onclick=()=>pausePolar(true);
