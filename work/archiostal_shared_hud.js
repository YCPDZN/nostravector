// Archiostal shares the planetary HUD, input set, game tick and modal controls.
$('#hudTools').querySelector('details').lastElementChild.append($('#archiostalTransitToggle'));
$('#hudContextDock').append($('#archiostalDepart'));
$('#antarctica').append($('#archiostalWardDirectory'));
$('#archiostalTransitToggle').hidden=true;$('#archiostalDepart').hidden=true;
$('#archiostalDepart').textContent='BOARD SHIP / F';
const archiostalNearShip=s=>Math.hypot(NVArchiostal.ensure(s).x+113,NVArchiostal.ensure(s).z-113)<15;
function archiostalControlsBlocked(){return gamePaused||spaceChartOpen||galaxyOpen||hudToolsOpen||empireOpen||constructionOpen||!$('#archiostalWardDirectory').hidden||!$('#inventorySheet').hidden;}
const archiostalInput=spaceInput;spaceInput=e=>{
 if(!NVArchiostal.active(polarState))return archiostalInput(e);
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return true;
 if(e.code==='Escape')return false;
 if(e.target?.tagName==='BUTTON'&&['Enter','Space'].includes(e.code))return true;
 e.preventDefault();if(e.repeat)return true;
 if(e.code==='KeyM'){toggleSolChart();return true;}
 if(archiostalControlsBlocked())return true;
 if(e.code==='KeyI'||e.code==='KeyC'){openInventory();return true;}
 if(e.code==='KeyF'){if(archiostalNearShip(polarState))leaveArchiostal();return true;}
 if(e.code==='KeyR'){polarAutoWalk=!polarAutoWalk;return true;}
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyQ','KeyE','ShiftLeft','ShiftRight'].includes(e.code))polarKeys.add(e.code);
 return true;
};
const archiostalJumpAllowed=canPlayerJump;canPlayerJump=()=>polarState&&NVArchiostal.active(polarState)?gameActive&&!archiostalControlsBlocked():archiostalJumpAllowed();
const archiostalJumpWorld=jumpWorld;jumpWorld=()=>polarState&&NVArchiostal.active(polarState)?NVSol.byId.earth:archiostalJumpWorld();
const archiostalJumpStep=stepPlayerJump;stepPlayerJump=dt=>{if(!polarState||!NVArchiostal.active(polarState))return archiostalJumpStep(dt);if(canPlayerJump()&&!document.hidden)NVJump.step(playerJump,NVSol.byId.earth,dt);polarState.jumpOffset=playerJump?.height||0;$('#jumpButton').hidden=gamePaused;$('#jumpButton').disabled=!!playerJump?.active;$('#jumpButton').textContent='JUMP';};
const archiostalSharedTransit=showArchiostalTransit;showArchiostalTransit=on=>{archiostalSharedTransit(on);if(on)setHUDTools(false);};
const archiostalSharedDepart=leaveArchiostal;leaveArchiostal=()=>{const result=archiostalSharedDepart();if(result){playerJump=null;polarState.jumpOffset=0;}return result;};
$('#archiostalDepart').onclick=()=>leaveArchiostal();

function drawArchiostalMinimap(s){
 const q=NVArchiostal.ensure(s),canvas=$('#planetMapCanvas'),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,range=440,scale=Math.min(w,h)/range;
 const point=(x,z)=>{const dx=x-q.x,dz=z-q.z;return[w/2+(dx*Math.cos(q.yaw)-dz*Math.sin(q.yaw))*scale,h/2-(dx*Math.sin(q.yaw)+dz*Math.cos(q.yaw))*scale];};
 c.fillStyle=chapter4Aftermath(s.eris?.chapter4)?'#100c16':'#071924';c.fillRect(0,0,w,h);c.strokeStyle='#86c4d45e';c.lineWidth=5;
 const path=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;path.push(point(Math.sin(a)*160,Math.cos(a)*160));}c.beginPath();path.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 for(const ward of NVArchiostal.WARDS){const [x,y]=point(ward.x,ward.z);if(ward.id!=='central'){c.beginPath();c.moveTo(...point(0,0));c.lineTo(x,y);c.stroke();}c.fillStyle=q.visited.includes(ward.id)?'#4f827e':'#36505d';c.beginPath();c.arc(x,y,ward.r*scale,0,Math.PI*2);c.fill();c.fillStyle='#d9d2a3';c.font='8px Consolas';c.fillText(String(NVArchiostal.WARDS.indexOf(ward)+1),x-2,y+3);}
 const mark=(x,z,color,r)=>{const p=point(x,z);c.fillStyle=color;c.beginPath();c.arc(...p,r,0,Math.PI*2);c.fill();};
 mark(-113,113,'#7fe6f5',4);for(const p of NVArchiostalPeople.state(s).followers.values())mark(p.x,p.z,'#9ddba0',2);
 c.fillStyle='#f5fcff';c.save();c.translate(w/2,h/2);c.rotate((q.speed>.01?q.movementYaw:q.yaw)-q.yaw);c.beginPath();c.moveTo(0,-6);c.lineTo(-4,5);c.lineTo(0,3);c.lineTo(4,5);c.closePath();c.fill();c.restore();c.fillStyle='#e4faff';c.font='9px Consolas';c.fillText('N',w/2-Math.sin(q.yaw)*(w/2-12),h/2-Math.cos(q.yaw)*(h/2-12));
 $('#planetMapTitle').textContent='ARCHIOSTAL';$('#planetMapBiome').textContent='SPACE STATION / '+NVArchiostal.ward(s).name.toUpperCase();$('#planetMapCoords').textContent=Math.round(q.x)+' E / '+Math.round(q.z)+' N';$('#planetMapLegend').textContent='WHITE / YOU · CYAN / SHIP · GREEN / CREW';$('#planetMinimap').hidden=gamePaused;$('#earthMinimap').hidden=true;
}
function updateArchiostalHUD(s){
 const q=NVArchiostal.ensure(s),ward=NVArchiostal.ward(s),near=archiostalNearShip(s);cleanHUDRoot.hidden=gamePaused;polarScreen.classList.toggle('hud-cinematic',gamePaused);polarScreen.dataset.mode=gamePaused?'paused':'station-free-roam';
 $('#polarChapter').textContent='NOSTRAVECTOR / CHAPTER 0'+NVArchiostal.chapter(s);$('#polarRegion').textContent='ARCHIOSTAL';$('#polarRegionSubtitle').textContent='SPACE STATION / MALANA · GREK EMPIRE';
 if(!NVQuests.list(s).some(q=>q.status==='active'&&!q.optional&&q.id!=='chapter4-archiostal')){$('#hudMissionKicker').textContent='STATION EXPLORATION';$('#hudMissionTitle').textContent=ward.name.toUpperCase();$('#hudMissionText').textContent=ward.note;}$('#hudMissionMeta').textContent=q.visited.length+' / 9 WARDS DISCOVERED · MANUAL SAVES';
 
 for(const el of [hudRoute,hudSpaceVitals,hudShip,hudTraffic,hudWildlife,$('#spaceHUD'),$('#spaceNotice'),$('#worldFlightHUD'),$('#spaceCockpit'),$('#spaceTargetMarker'),$('#spaceTransit'),$('#constructionGuide'),$('#constructionAccess'),$('#openSurfaceAtlas'),$('#boardGroundShip'),$('#charonStation'),$('#spaceSalvage'),$('#earthMinimap')])el.hidden=true;
 hudPolarVitals.hidden=false;$('#jumpButton').hidden=gamePaused;$('#openSolChart').hidden=false;$('#openSolChart').disabled=false;$('#openSolChart').textContent='MALANA ATLAS / M';$('#openInventory').hidden=!s.inventoryUnlocked;$('#spaceInventory').hidden=false;hudInventory.hidden=false;$('#hudControlHelp').textContent='WASD / ARROWS WALK · SHIFT SPRINT · DRAG / Q E LOOK · SPACE / J JUMP · R AUTO WALK · F BOARD · I / C INVENTORY · M SYSTEM MAP · B GALAXY · ESC PAUSE / SAVE';
 $('#archiostalDepart').hidden=!near||gamePaused;$('#hudInteract').hidden=true;hudInteractionSource=null;$('#archiostalTransitToggle').hidden=false;
 const members=NVArchiostalPeople.crew(s);$('#spaceCrewCount').textContent=String(members.length).padStart(2,'0');$('#spaceCrewName').textContent=members.length?members.map(n=>n.name).join(' + '):'SOLO EXPLORER';$('#spaceCrewState').textContent=members.length?'FOLLOWING ON ARCHIOSTAL':'THE WANDERER';const health=s.ecology?.health;$('#hudIntegrity').textContent='SUIT INTEGRITY / '+Math.ceil(Number.isFinite(health)?health:100)+'%';
 const angle=Math.atan2(-113-q.x,113-q.z)-q.yaw,d=Math.hypot(q.x+113,q.z-113);missionWaypoint.hidden=gamePaused||near;missionWaypoint.style.left=(50+Math.max(-1,Math.min(1,Math.atan2(Math.sin(angle),Math.cos(angle))/(Math.PI/2)))*29)+'%';missionWaypoint.querySelector('strong').textContent='Starlight Docks / Your ship';missionWaypoint.querySelector('small').textContent=Math.round(d)+' M';missionWaypoint.querySelector('.waypoint-arrow').hidden=false;missionWaypoint.querySelector('.waypoint-arrow').style.transform='rotate('+angle+'rad)';
 drawArchiostalMinimap(s);if(spaceChartOpen)refreshArchiostalSelection();
}

// The station is a destination, not a landable planet; never replace space.body.
let archiostalAtlasSelected=false,archiostalAtlasSystem='';
function selectArchiostalOnAtlas(){archiostalAtlasSelected=true;NVArchiostal.ensure(polarState).tracked=true;refreshSolChart();}
const archiostalPopulate=populateSolChart;populateSolChart=()=>{
 archiostalPopulate();const malana=polarState&&NVGalaxy.system(polarState)==='malana';if(!malana)return;
 $('#solChart .sol-chart-heading small').textContent='2 PLANETS · 1 SPACE STATION · CONTINUOUS FLIGHT';
 if(!$('#solDestinations [data-id="archiostal"]')){const b=document.createElement('button');b.className='archiostal-destination';b.dataset.id='archiostal';b.innerHTML='ARCHIOSTAL<small>SPACE STATION / GREK EMPIRE</small>';b.onclick=selectArchiostalOnAtlas;$('#solDestinations').querySelector('[data-id="malana-p1"]').after(b);}
 for(const b of $('#solDestinations').querySelectorAll('.sol-destination:not([data-id="archiostal"])')){const click=b.onclick;b.onclick=()=>{archiostalAtlasSelected=false;click();};}
 $('#solChartCanvas').setAttribute('aria-label','Malana system map: Malana Prime, Archiostal space station, and Irielle');
};
function refreshArchiostalSelection(){
 $('#solCruise').textContent='SET COURSE / GUIDED FLIGHT';if(!polarState||NVGalaxy.system(polarState)!=='malana')return;
 const inside=NVArchiostal.active(polarState);if(archiostalAtlasSelected){$('#solChartName').textContent='ARCHIOSTAL';$('#solChartCategory').textContent='SPACE STATION / GREK EMPIRE';$('#solChartNote').textContent='An inhabited ring city with nine explorable wards, beside Malana Prime. Approach its beacon, then press F to dock.';$('#solCruise').textContent=inside?'CURRENT LOCATION / DOCKED':'SET COURSE / ARCHIOSTAL';$('#solCruise').disabled=inside||polarState.space.phase!=='flight';$('#solCruiseHint').textContent=inside?'Return to your ship at Starlight Docks before travelling.':'Station approach · Press F to dock within 360 FU.';}
 else{$('#solCruise').textContent='SET COURSE / GUIDED FLIGHT';if(inside){$('#solCruise').disabled=true;$('#solCruiseHint').textContent='Return to your ship at Starlight Docks before travelling.';}}
 for(const b of $('#solDestinations').querySelectorAll('button[data-id]'))b.setAttribute('aria-pressed',String(archiostalAtlasSelected?b.dataset.id==='archiostal':b.dataset.id===polarState.space.target));
}
const archiostalSharedChart=refreshSolChart;refreshSolChart=()=>{archiostalSharedChart();refreshArchiostalSelection();};
const archiostalToggleChart=toggleSolChart;toggleSolChart=force=>{if(polarState){const system=NVGalaxy.system(polarState);if(system!==archiostalAtlasSystem){archiostalAtlasSelected=false;archiostalAtlasSystem=system;}if(NVArchiostal.active(polarState))archiostalAtlasSelected=true;}const result=archiostalToggleChart(force);if(spaceChartOpen&&NVGalaxy.system(polarState)==='malana'){populateSolChart();refreshArchiostalSelection();}return result;};
$('#openSolChart').onclick=()=>toggleSolChart();$('#closeSolChart').onclick=()=>toggleSolChart(false);
const archiostalCruise=$('#solCruise').onclick;$('#solCruise').onclick=()=>{if(NVArchiostal.active(polarState))return;if(archiostalAtlasSelected&&NVGalaxy.system(polarState)==='malana'){toggleSolChart(false);archiostalDockButton.click();}else archiostalCruise();};
function archiostalAtlasPoint(position){const canvas=$('#solChartCanvas'),bodies=NVGalaxy.worlds(polarState),extent=Math.max((NVCluster.meta.malana.starRadius||62)*3,...bodies.map(b=>Math.max(Math.abs(b.position[0]),Math.abs(b.position[2]))))+400,scale=Math.min(canvas.width,canvas.height)/(extent*2.3);return[canvas.width/2+position[0]*scale,canvas.height/2+position[2]*scale];}
const archiostalChartDraw=drawSolChart;drawSolChart=()=>{archiostalChartDraw();if(!polarState||NVGalaxy.system(polarState)!=='malana')return;const c=$('#solChartCanvas').getContext('2d'),[x,y]=archiostalAtlasPoint(NVArchiostal.POSITION);c.save();c.strokeStyle=archiostalAtlasSelected?'#ffd489':'#81eaf1';c.lineWidth=2;c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.stroke();c.restore();};
$('#solChartCanvas').addEventListener('click',e=>{if(!polarState||NVGalaxy.system(polarState)!=='malana')return;const c=e.currentTarget,r=c.getBoundingClientRect(),scale=Math.min(r.width/c.width,r.height/c.height),x=(e.clientX-r.left-(r.width-c.width*scale)/2)/scale,y=(e.clientY-r.top-(r.height-c.height*scale)/2)/scale,[sx,sy]=archiostalAtlasPoint(NVArchiostal.POSITION);if(Math.hypot(x-sx,y-sy)<20){selectArchiostalOnAtlas();return;}const body=NVGalaxy.worlds(polarState).find(b=>{const p=archiostalAtlasPoint(b.position);return Math.hypot(x-p[0],y-p[1])<16;});if(body){archiostalAtlasSelected=false;NVSpace.select(polarState,body.id);refreshSolChart();}});
