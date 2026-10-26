// Governor management is available aboard every ship, including the starter cockpits.
const cockpitGovernors=document.createElement('button');cockpitGovernors.id='cockpitGovernors';cockpitGovernors.className='polar-button';cockpitGovernors.textContent='GOVERNORS / APPOINT OR DISMISS';$('#spaceCockpit .space-actions').append(cockpitGovernors);
const interiorGovernors=document.createElement('button');interiorGovernors.id='interiorGovernors';interiorGovernors.className='polar-button';interiorGovernors.textContent='GOVERNORS';$('#shipInterior header>div:last-child').append(interiorGovernors);
function manageShipGovernors(){if(!gameActive||gamePaused||!NVChapter3Access.allowed(polarState))return;if(shipCrewBoardOpen)closeShipCrewBoard();interiorKeys.clear();polarKeys.clear();openGovernors();}
cockpitGovernors.onclick=interiorGovernors.onclick=manageShipGovernors;
shipGovernors.onclick=manageShipGovernors;
const shipGovernorHUD=updatePolarHUD;updatePolarHUD=()=>{shipGovernorHUD();const allowed=gameActive&&polarState&&NVChapter3Access.allowed(polarState);cockpitGovernors.hidden=interiorGovernors.hidden=!allowed;cockpitGovernors.disabled=interiorGovernors.disabled=gamePaused||!allowed;};
const governorShipRefresh=NVGovernance.dismissGovernor;NVGovernance.dismissGovernor=(s,...args)=>{const ok=governorShipRefresh(s,...args);if(ok&&s===polarState&&gameActive&&NVShipInterior.active(s))refreshInteriorHUD();return ok;};
