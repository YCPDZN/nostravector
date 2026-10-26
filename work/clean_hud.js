// Keep the existing controls and their handlers; organise them into shared docks.
const cleanHUDRoot=document.createElement('div');cleanHUDRoot.id='cleanHUD';cleanHUDRoot.hidden=true;
cleanHUDRoot.innerHTML='<div id="hudHeader"><div id="hudLocationSlot"></div><div id="hudToolbar"><button id="hudMapButton" class="polar-button">MAP</button><button id="hudToolsButton" class="polar-button" aria-expanded="false" aria-controls="hudTools">TOOLS</button></div></div><div id="hudBody"><div id="hudLeftDock"><section id="hudMission"><span id="hudMissionKicker">CURRENT OBJECTIVE</span><strong id="hudMissionTitle"></strong><p id="hudMissionText"></p><small id="hudMissionMeta"></small></section></div><div id="hudAimDock"><div id="hudAlerts" aria-live="polite"></div></div><div id="hudRightDock"></div></div><div id="hudBottom"><div id="hudVitalsDock"><small id="hudIntegrity"></small></div><div id="hudContextDock"><button id="hudInteract" class="polar-button" hidden></button></div><div id="hudMapDock"></div></div><aside id="hudTools" hidden aria-label="Exploration tools"><header><strong>EXPLORATION TOOLS</strong><button id="hudCloseTools" class="polar-button">CLOSE</button></header></aside>';
$('#antarctica').append(cleanHUDRoot);
const missionWaypoint=document.createElement('div');missionWaypoint.id='missionWaypoint';missionWaypoint.hidden=true;missionWaypoint.innerHTML='<span class="waypoint-arrow">▲</span><strong></strong><small></small>';$('#hudAimDock').append(missionWaypoint);
function missionWaypointTarget(s){
 const c=NVConstruction.ensure(s),p=s.space,space=NVSpace.active(s),world=NVEris.world(s);
 if(s.eris?.solWar?.moonTransmission?.marsAssigned&&!s.eris.solWar.moonTransmission.marsArrived){if(space&&(p.system||'sol')==='sol'&&!['landed','cockpit','off'].includes(p.phase)){const b=NVSol.byId.mars;return{label:'Mars',position:b.position,radius:b.radius,space:true};}if(space&&['landed','off'].includes(p.phase))return{label:'Return to your ship · Head to Mars',x:p.landingX,z:p.landingZ};return null;}
 if(space&&!['landed','off'].includes(p.phase)){
  if(p.phase==='cockpit')return null;
  const b=NVSol.byId[c.started&&c.stage<2?'moon':p.target];if(!b)return null;
  return{label:b.name,position:b.position,radius:b.radius,space:true};
 }
 if(c.started&&c.stage<9&&!NVQuests.list(s).some(q=>q.id==='base'&&q.status==='completed')){
  if(world!=='moon')return{label:'Return to your ship · Moon objective',x:p.landingX,z:p.landingZ};
  if(!c.tools){const q=NVConstruction.toolCrate(s);return q?{...q,label:'Construction tools'}:null;}
  if(c.stage===2){const nodes=NVConstruction.nodes(s).filter(q=>!c.stock[q.kind]).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z));return nodes[0]?{...nodes[0],label:nodes[0].name}:null;}
  const base=NVConstruction.localPieces(s).find(q=>q.type==='foundation');return base?{...base,label:'Build your base'}:{x:p.landingX+24,z:p.landingZ-24,label:'Choose a base site · Construction'};
 }
 if(space)return null;
 const q=polarDestination(s);if(!q)return null;
 const label=s.africaStarted?(q===NVAfrica.CAMP?'Orion Mascar':'Spaceship'):q===NVAntarctica.FERRY?'Coastal ferry':q===NVAntarctica.DEPOT?'Supply depot':q===NVAntarctica.BED?'Your bed':'Research station';
 return{...q,label};
}
function updateMissionWaypoint(s){
 const q=missionWaypointTarget(s);missionWaypoint.hidden=!q;if(!q)return;missionWaypoint.querySelector('.waypoint-arrow').hidden=!!q.galaxy;if(q.galaxy){missionWaypoint.style.left='50%';missionWaypoint.querySelector('strong').textContent=q.label;missionWaypoint.querySelector('small').textContent='OPEN GALAXY MAP / PLAN YOUR WARP ROUTE';missionWaypoint.classList.remove('waypoint-arrived');return;}
 let angle,distance,vertical=0;
 if(q.geo){const p=s.space,g=NVWorldFlight.ensure(s),a=g.lat*Math.PI/180,b=q.geo.lat*Math.PI/180,d=NVWorldFlight.wrap(q.geo.lon-g.lon)*Math.PI/180;angle=Math.atan2(Math.sin(d)*Math.cos(b),Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(d))-g.heading;distance=NVWorldFlight.arc(g,q.geo)*180/Math.PI*24000;}
 else if(q.space){const p=s.space,dx=q.position[0]-p.position[0],dy=q.position[1]-p.position[1],dz=q.position[2]-p.position[2];angle=Math.atan2(dx,dz)-p.yaw;vertical=Math.atan2(dy,Math.hypot(dx,dz))-p.pitch;distance=Math.max(0,Math.hypot(dx,dy,dz)-(q.radius||0));}
 else{angle=Math.atan2(q.x-s.x,q.z-s.z)-s.cameraYaw;distance=Math.hypot(q.x-s.x,q.z-s.z);}
 angle=Math.atan2(Math.sin(angle),Math.cos(angle));const ahead=Math.abs(angle)<.2;
 missionWaypoint.style.left=(50+Math.max(-1,Math.min(1,angle/(Math.PI/2)))*29)+'%';
 missionWaypoint.querySelector('.waypoint-arrow').style.transform='rotate('+angle+'rad)';
 missionWaypoint.querySelector('strong').textContent=q.label;
 missionWaypoint.querySelector('small').textContent=(q.space?Math.round(distance)+' FLIGHT UNITS':distance>=1000?(distance/1000).toFixed(2)+' KM':Math.round(distance)+' M')+' · '+(!q.space&&distance<6?'ARRIVED':Math.abs(angle)>2.6?'BEHIND YOU':ahead?(q.space&&Math.abs(vertical)>.2?(vertical>0?'ABOVE':'BELOW'):'AHEAD'):angle>0?'RIGHT':'LEFT');
 missionWaypoint.classList.toggle('waypoint-arrived',!q.space&&distance<6);
}
const hudToolbar=$('#hudToolbar'),hudTools=$('#hudTools'),hudLeft=$('#hudLeftDock'),hudVitals=$('#hudVitalsDock');
for(const id of ['constructionAccess','questsButton','jumpButton','worldPause']){const el=$('#'+id);if(el)hudToolbar.append(el);}
$('#hudContextDock').append($('.touch-movement'));$('#hudAimDock').append($('#spaceTransit'));$('#hudLocationSlot').append($('.polar-top'));$('#hudRightDock').append(hudTools);$('#hudMapDock').append($('#earthMinimap'),$('#planetMinimap'));
for(const id of ['spaceNotice','empireNotice','ecologyNotice','stormAlert','weatherStatus','jamesCarDialogue','stationMessage','ferryArrival','bedRestStatus','coldRecovery','resourceHitNotice']){const el=$('#'+id);if(el)$('#hudAlerts').append(el);}
function hudSection(title,nodes){const section=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');summary.textContent=title;section.append(summary,body);for(const el of nodes)if(el)body.append(el);hudTools.append(section);return section;}
const hudNavigation=hudSection('Navigation',[$('#openPolarMap'),$('#openSolChart'),$('#openSurfaceAtlas'),$('#worldFlightHUD'),$('.earth-clock')]);
const hudInventory=hudSection('Inventory & crafting',[$('#openInventory'),$('#spaceInventory')]);
const hudShip=hudSection('Ship systems',[$('.ship-drive-panel'),$('.space-telemetry .space-actions')]);
const hudTraffic=hudSection('Nearby traffic',[]);hudTraffic.lastElementChild.id='hudTraffic';
const hudCompanions=hudSection('Companions',[$('.companion-card'),$('.space-crew'),$('#friendQuestPanel')]);
const hudWildlife=hudSection('Wildlife & suit integrity',[$('#ecologyHUD')]);
$('#hudRightDock').append($('#constructionGuide'));
const hudFactions=hudSection('Factions & territory',[$('#empireHUD')]);
const hudControls=hudSection('Controls',[]);hudControls.lastElementChild.id='hudControlHelp';
const hudRoute=$('.space-route-card');hudLeft.append(hudRoute);
for(const id of ['vehiclePanel','bedWorkshop','coastalSupplies','spaceshipArrival','ferryDeparture']){const el=$('#'+id);if(el)hudLeft.append(el);}
const hudPolarVitals=$('.polar-vitals'),hudSpaceVitals=$('.space-telemetry');hudVitals.prepend(hudPolarVitals,hudSpaceVitals);
let hudToolsOpen=false,hudInteractionSource=null,hudMusicHome=null;
function dockJamesVoiceUI(){const kind=typeof jamesVoiceKind==='undefined'?null:jamesVoiceKind,target=kind==='intro'?$('#jamesDialogue'):kind==='car'?$('#jamesCarDialogue'):['station','supplies','ferry'].includes(kind)?$('#jamesConversation'):$('#hudAlerts');for(const id of ['enableJamesVoice','jamesVoiceStatus']){const el=$('#'+id);if(el&&el.parentElement!==target)target.append(el);if(el&&id==='jamesVoiceStatus')el.hidden=!kind||!el.textContent;}}
function dockHUDMusic(){const banner=$('#nowPlaying');if(!banner?.parentElement)return;if(gameActive){if(banner.parentElement!==$('#hudRightDock')){hudMusicHome=banner.parentElement;$('#hudRightDock').append(banner);}}else if(hudMusicHome){hudMusicHome.append(banner);hudMusicHome=null;}}
function setHUDTools(on){const changed=hudToolsOpen!==!!on;hudToolsOpen=!!on;hudTools.hidden=!hudToolsOpen;$('#hudToolsButton').setAttribute('aria-expanded',String(hudToolsOpen));if(changed&&gameActive&&!gamePaused)polarCanvas.focus();}
$('#hudToolsButton').onclick=()=>setHUDTools(!hudToolsOpen);$('#hudCloseTools').onclick=()=>setHUDTools(false);
$('#hudMapButton').onclick=()=>{setHUDTools(false);if(spaceActive())toggleSolChart();else openFieldMap();};
function validateHUDInteraction(){const source=hudInteractionSource;if(source&&(source.hidden||source.disabled||!source.isConnected)){hudInteractionSource=null;$('#hudInteract').hidden=true;}}
$('#hudInteract').onclick=()=>{validateHUDInteraction();const source=hudInteractionSource;if(source)source.click();};
function hudInteractionCandidates(s){return ['boardAfricaShip','boardGroundShip','charonStation','bedAction','collectSupplies','boardCar','talkJames','speakVishara','findConstructionTools','constructionDoor'];}
function updateCleanHUD(){
 dockHUDMusic();dockJamesVoiceUI();const s=polarState;if(!gameActive||!s){cleanHUDRoot.hidden=true;return;}
 const cinematic=!s.jamesIntroductionDone||s.bedSleeping||s.dreamActive||betrayalActive()||africaModal()||s.friendDialogueActive||jamesConversation.active||hazardModalActive()||!!erisConversation;
 const quiet=gamePaused||cinematic;cleanHUDRoot.hidden=quiet;$('#antarctica').classList.toggle('hud-cinematic',quiet);if(quiet){setHUDTools(false);return;}
 updateMissionWaypoint(s);
 const space=spaceActive(),ground=!space||['off','landed'].includes(s.space.phase);$('#earthMinimap').hidden=space||$('#expeditionHUD').hidden;$('#spaceTransit').hidden=!space||!['launch','ascent','descent'].includes(s.space.phase);hudRoute.hidden=!space;hudPolarVitals.hidden=space;hudSpaceVitals.hidden=!space;
 if($('#worldPause').textContent!=='PAUSE')$('#worldPause').textContent='PAUSE';
 hudTraffic.hidden=!space||s.space.phase!=='flight';hudShip.hidden=!space;$('.ship-drive-panel').hidden=!space;$('.space-crew').hidden=!space;$('.companion-card').hidden=space||$('#expeditionHUD').hidden;
 // These controls formerly inherited visibility from their containing HUD.
 $('#openPolarMap').hidden=space;$('#openSolChart').hidden=!space;$('#openSurfaceAtlas').hidden=!space||!['atmosphere','landed','cockpit'].includes(s.space.phase);
 $('#spaceInventory').hidden=!space;$('#openInventory').hidden=space||!s.inventoryUnlocked;
 $('.earth-clock').hidden=NVEris.world(s)!=='earth';
 hudInventory.hidden=!s.inventoryUnlocked&&!space;hudNavigation.hidden=false;
 hudCompanions.hidden=$('.companion-card').hidden&&$('.space-crew').hidden&&$('#friendQuestPanel').hidden;
 hudWildlife.hidden=$('#ecologyHUD').hidden;hudFactions.hidden=$('#empireHUD').hidden;
 $('#hudControlHelp').textContent=space?$('#spaceKeys').textContent:$('#worldKeyHint').textContent;
 if(ground)$('#hudControlHelp').textContent+=' · SPACE / J JUMP';
 const c=NVConstruction.ensure(s),active=NVQuests.list(s).filter(q=>q.status==='active'&&!q.optional);
 let title='',text='',kicker='CURRENT OBJECTIVE';
 if(s.eris?.solWar?.moonTransmission?.marsAssigned&&!s.eris.solWar.moonTransmission.marsArrived){title='HEAD TO MARS';text=(s.space?.system||'sol')==='sol'?'Set a course for Mars and land anywhere. Hawthorne’s transmission continues while you explore.':'Return to Sol, then head to Mars and land anywhere.';kicker='NEXT QUEST';}
 else if(c.started&&c.stage<9&&!NVQuests.list(s).some(q=>q.id==='base'&&q.status==='completed')){title=c.stage===0?'SET COURSE FOR THE MOON':'BUILD YOUR FIRST BASE';text=NVConstruction.lessons[c.stage];kicker='CONSTRUCTION / '+(c.stage+1)+' OF 9';}
 else if(!space){title=$('#worldObjective').textContent;text=s.africaStarted?(s.spaceshipFound?'Board your ship or explore the coast.':$('#friendQuestDescription').textContent):$('#stationBearing').textContent;}
 else{title=active[0]?.title||'EXPLORE THE SOL SYSTEM';text=active[0]?.description||'Land, harvest resources and expand your bases. Your progress is saved manually.';}
 $('#hudMissionKicker').textContent=kicker;$('#hudMissionTitle').textContent=title;$('#hudMissionText').textContent=text;$('#hudMissionMeta').textContent=space?'ENGINE MK '+(NVSpace.driveLevel(s.space)+1)+' · '+$('#shipTravelETA').textContent:$('#stationDistance').textContent+' · '+$('#earthClockTime').textContent;
 const health=s.ecology?.health;$('#hudIntegrity').textContent=Number.isFinite(health)?'SUIT INTEGRITY / '+Math.ceil(health)+'%':'';
 // Promote only one nearby interaction. Every other action remains in Tools.
 const candidates=hudInteractionCandidates(s);
 hudInteractionSource=null;for(const id of candidates){const el=$('#'+id);if(!el||el.hidden||el.disabled)continue;const relevant=id==='speakVishara'?!$('#empireHUD').hidden:id==='boardAfricaShip'?!$('#spaceshipArrival').hidden:id==='charonStation'||id==='boardGroundShip'?space&&s.space.phase==='landed':id==='findConstructionTools'||id==='harvestConstruction'||id==='constructionDoor'?ground&&c.started:id==='openConstruction'?ground&&c.stage>=3:id==='bedAction'?!$('#bedWorkshop').hidden:id==='collectSupplies'?!$('#coastalSupplies').hidden:id==='boardCar'?!$('#vehiclePanel').hidden:id==='talkJames'?!space&&!$('#expeditionHUD').hidden:true;if(relevant){hudInteractionSource=el;break;}}
 $('#hudInteract').hidden=!hudInteractionSource;if(hudInteractionSource)$('#hudInteract').textContent=hudInteractionSource.textContent;
 const threat=$('#ecologyHUD').dataset.threat==='true';$('#hudIntegrity').classList.toggle('hud-danger',threat||Number.isFinite(health)&&health<30);if(threat)$('#hudIntegrity').textContent+=' · PREDATOR NEARBY';
 hudTools.hidden=!hudToolsOpen;
}
const cleanHUDUpdate=updatePolarHUD;updatePolarHUD=()=>{cleanHUDUpdate();updateCleanHUD();};
const cleanHUDExit=exitPolar;exitPolar=()=>{cleanHUDRoot.hidden=true;hudToolsOpen=false;cleanHUDExit();dockHUDMusic();};
document.addEventListener('keydown',e=>{if(hudToolsOpen&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();setHUDTools(false);}},true);
