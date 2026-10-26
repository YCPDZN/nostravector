// These sandbox systems unlock in Chapter 3. Stored records are never removed.
const NVChapter3Access=(()=>{
 function chapter(s){if(Number.isInteger(s?.featureChapter))return s.featureChapter;const p=s?.space;if(p&&(p.phase&&p.phase!=='off'||p.time>0||p.visited?.length>1))return 3;return s?.africaStarted?2:1;}
 const allowed=s=>chapter(s)>=3;
 const current=()=>gameActive&&polarState?allowed(polarState):!!savedGame&&Number(savedGame.progress?.chapter)>=3;
 return{chapter,allowed,current};
})();
const chapter3CrewWorld=customCrewWorld;customCrewWorld=()=>{const s=chapter3CrewWorld();return gameActive?s:{...s,featureChapter:Number(savedGame?.progress?.chapter)||1};};
const chapter3CrewOpen=openCustomCrew;openCustomCrew=()=>{if(!NVChapter3Access.current())return false;return chapter3CrewOpen();};customCrewMenuButton.onclick=customCrewTool.onclick=openCustomCrew;
const chapter3Designer=openCrewDesigner;openCrewDesigner=(...args)=>{if(!NVChapter3Access.current())return false;return chapter3Designer(...args);};
const chapter3GLBOpen=openGLBCompanion;openGLBCompanion=(...args)=>{if(!NVChapter3Access.current())return false;return chapter3GLBOpen(...args);};
const chapter3LibraryOpen=openProjectBCLibrary;openProjectBCLibrary=()=>{if(!NVChapter3Access.current())return false;return chapter3LibraryOpen();};projectBCButton.onclick=openProjectBCLibrary;
const chapter3ProjectModel=openProjectBCModel;openProjectBCModel=(...args)=>{if(!NVChapter3Access.current())return false;return chapter3ProjectModel(...args);};
const chapter3GovernorsOpen=openGovernors;openGovernors=()=>{if(!gameActive||!NVChapter3Access.allowed(polarState))return false;return chapter3GovernorsOpen();};
const chapter3EmpireOpen=toggleEmpire;toggleEmpire=on=>{if(on&&(!gameActive||!NVChapter3Access.allowed(polarState)))return false;return chapter3EmpireOpen(on);};
for(const key of ['create','remove','uplift','setAlignment','setGovernment']){const previous=NVCustomCrew[key];NVCustomCrew[key]=(s,...args)=>NVChapter3Access.allowed(s)?previous(s,...args):{ok:false,text:'Custom crew and empires unlock in Chapter 3.'};}
const chapter3Recruit=NVCustomCrew.recruit;NVCustomCrew.recruit=(s,...args)=>NVChapter3Access.allowed(s)&&chapter3Recruit(s,...args);
const chapter3CrewList=NVCustomCrew.crew;NVCustomCrew.crew=s=>NVChapter3Access.allowed(s)?chapter3CrewList(s):[];
const chapter3CrewStep=NVCustomCrew.step;NVCustomCrew.step=(s,dt)=>{if(NVChapter3Access.allowed(s))return chapter3CrewStep(s,dt);};
const chapter3CustomGovernors=NVGovernance.customMembers;NVGovernance.customMembers=s=>NVChapter3Access.allowed(s)?chapter3CustomGovernors(s):[];
const chapter3Appoint=NVGovernance.appoint;NVGovernance.appoint=(s,...args)=>NVChapter3Access.allowed(s)&&chapter3Appoint(s,...args);
const chapter3Register=NVGovernance.register;NVGovernance.register=s=>NVChapter3Access.allowed(s)?chapter3Register(s):null;
const chapter3GovernanceStep=NVGovernance.step;NVGovernance.step=(s,dt)=>{if(NVChapter3Access.allowed(s))return chapter3GovernanceStep(s,dt);};
const chapter3DismissGovernor=NVGovernance.dismissGovernor;NVGovernance.dismissGovernor=(s,...args)=>NVChapter3Access.allowed(s)&&chapter3DismissGovernor(s,...args);
const chapter3GovernorWaypoint=NVGovernance.waypoint;NVGovernance.waypoint=s=>NVChapter3Access.allowed(s)?chapter3GovernorWaypoint(s):null;
const chapter3Follows=NVGovernance.follows;NVGovernance.follows=(s,id)=>NVChapter3Access.allowed(s)?chapter3Follows(s,id):NVParty.list(s).some(n=>n.id===id);
for(const key of ['sites','current','waypoint','step','select','travel']){const previous=NVSurfaceNavigation[key];NVSurfaceNavigation[key]=(s,...args)=>NVChapter3Access.allowed(s)?previous(s,...args):key==='sites'?[]:key==='select'||key==='travel'?false:null;}
function refreshChapter3Access(){const enabled=NVChapter3Access.current(),inGame=gameActive&&enabled;customCrewMenuButton.hidden=!enabled;customCrewMenuButton.disabled=!enabled;customCrewTool.hidden=!inGame;customCrewTool.disabled=!inGame;$('#openEmpire').hidden=!inGame;$('#openEmpire').disabled=!inGame;shipGovernors.hidden=!inGame;surfaceNavPanel.hidden=!inGame;if(!inGame)governorButton.hidden=true;if(!enabled){customCrewPanel.hidden=true;governorPanel.hidden=true;governorPanelOpen=false;glbPanel.hidden=true;projectBCPanel.hidden=true;if(crewCreationMode&&customActive){closeCustomizer();customCrewPanel.hidden=true;}if(empireOpen){empireOpen=false;$('#empireSheet').hidden=true;}}}
const chapter3HUD=updatePolarHUD;updatePolarHUD=()=>{chapter3HUD();refreshChapter3Access();};
const chapter3MenuLocation=updateMenuLocation;updateMenuLocation=()=>{const result=chapter3MenuLocation();refreshChapter3Access();return result;};
const chapter3MenuSync=syncSavedGameMenu;syncSavedGameMenu=()=>{chapter3MenuSync();refreshChapter3Access();};
const chapter3ErisHUD=updateErisHUD;updateErisHUD=()=>{chapter3ErisHUD();refreshChapter3Access();};
const chapter3AccessStyle=document.createElement('style');chapter3AccessStyle.textContent='#customCrewMenuButton[hidden],#customCrewTool[hidden],#governorButton[hidden],#openEmpire[hidden]{display:none!important}';document.head.append(chapter3AccessStyle);
refreshChapter3Access();
