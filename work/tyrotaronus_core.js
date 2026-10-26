// Tamaz is an additive authored destination; existing system IDs remain stable.
(()=>{
 const id='tamaz',name='Tamaz',coords=NVCluster.meta['janira-proxima'].coords.map((v,i)=>v+([28,4,-20][i]));
 NVGalaxy.systems.push({id,name,star:'F8V / Pale gold',generated:false,note:'A quiet border system. Tyrotaronus, the Vector of Neutrality, has sent a request for help from Tamaz Prime.'});
 NVCluster.meta[id]={id,name,coords,chart:[.62,.65],spectral:'F8V',colorName:'Pale gold',starColor:[1,.87,.65],starClass:'Main-sequence star',starRadius:64,economy:'Research',wealth:'Stable',conflict:'Low',station:false,aliases:['tyrotaronus']};
 NVCluster.bodyLists[id]=[];
 for(const [i,[sourceId,planet]]of [['cluster-01-p2','Tamaz Prime'],['cluster-01-p3','Nereth'],['cluster-01-p1','Ossivar']].entries()){
  const source=NVSol.byId[sourceId],b={...structuredClone(source),id:'tamaz-p'+(i+1),name:planet,system:id,parent:null,position:[[1250,0,700],[-2050,90,-1300],[2700,-50,-2400]][i],note:i===0?'Quiet uplands and silver mineral ridges. Tyrotaronus awaits near your landing site.':i===1?'A frozen outer world with blue glacial valleys.':'An airless mineral world scarred by ancient impacts.'};
  NVSol.byId[b.id]=b;NVCluster.bodyLists[id].push(b);NVLandscapes.profiles[b.id]={...structuredClone(NVLandscapes.profiles[sourceId]),id:b.id,title:planet.toUpperCase()+' / TAMAZ'};SOL_MAPS[b.id]=SOL_MAPS[sourceId];
 }
 const star={...structuredClone(NVCluster.anchors['cluster-01']),id:'tamaz-star',name,system:id,radius:64,km:64000,color:[1,.87,.65]};NVCluster.anchors[id]=star;NVSol.byId[star.id]=star;
})();
const NVTyrotaronus=(()=>{
 const SYSTEM='tamaz',WORLD='tamaz-p1',INTRO='chapter4-vector-signal',VISIT='chapter4-find-tyrotaronus',HAK='chapter4-new-empire-hak';
 const LINES=[
  "Wanderer. Do not close this channel. My name is Tyrotaronus. Some call me the Vector of Neutrality. Tonight, I am simply someone asking for help.",
  "I felt the change when you brought a new species into this universe. Another voice where there was silence. Another future that the Catharsis have not yet taken from us.",
  "You may wonder how I found you. New life leaves a disturbance in the currents between worlds. Most hear nothing. I have spent a very long time listening.",
  "Neutrality does not mean indifference. I have watched empires raise their banners over ruins and call it peace. I have also watched people save strangers whose names they never learned.",
  "I had hoped to keep Tamaz beyond the reach of those struggles. A quiet star. A few worlds. A place where no one needed to ask which side a traveller belonged to.",
  "That quiet is ending. Our instruments are recording gaps where there should be signals. Not interference, Wanderer. Absence. Something is teaching the dark to swallow every answer.",
  "I cannot tell you everything over an open transmission. There are listeners who would mistake this conversation for an invitation, and I will not lead them to your people.",
  "Find me on Tamaz. My refuge is on Tamaz Prime. Land there, and I will come to meet you near your ship. You will recognise me.",
  "I need your help. Not your allegiance, not your worlds, and not an army sworn to my name. I need someone willing to look at what is happening before deciding it cannot be stopped.",
  "Keep the life you have created safe. Speak to your allies, prepare your ship, and come when you are ready. I will be waiting on Tamaz, Wanderer. Please do not let this be the last voice you hear from us."
 ];
 const HAK_LINES=[
  "You did it. A new people, with a home and a voice of their own. Your new empire stands beside us as an ally, Wanderer. That is a beginning worth protecting.",
  "An alliance is more than a green mark on a star chart. Give them room to find their own way, and listen when they ask for help. They are people, not another weapon against the Catharsis.",
  "I heard fragments of that transmission. Tyrotaronus, the Vector of Neutrality. If he has broken his silence to ask for help, we should take it seriously. Find him on Tamaz Prime, and hear what he has to say."
 ];
 const fresh=()=>({line:0,voiceTime:0,heard:false,met:false,empireCreated:false,hakHeard:false});
 const restore=r=>({line:Math.max(0,Math.min(9,Math.floor(Number(r?.line)||0))),voiceTime:Math.max(0,Math.min(120,Number(r?.voiceTime)||0)),heard:r?.heard===true,met:r?.met===true,empireCreated:r?.empireCreated===true,hakHeard:r?.hakHeard===true});
 const ensure=s=>{const e=NVEris.ensure(s);return e.tyrotaronus||(e.tyrotaronus=fresh());};
 const ready=s=>NVChapter3Access.chapter(s)>=4&&NVCreateSpeciesQuest.done(s);
 const pending=s=>ready(s)&&!ensure(s).heard;
 const find=s=>ready(s)&&ensure(s).heard&&!ensure(s).met;
 function returnHak(s){if(!ready(s))return false;const q=ensure(s);if(NVCustomCrew.empires(s).length)q.empireCreated=true;return q.empireCreated&&!q.hakHeard;}
 const hakDiscussion=(s,c)=>returnHak(s)&&c?.npc.kind==='hak'&&c.lines?.length===HAK_LINES.length&&c.lines.every((line,i)=>line===HAK_LINES[i]);
 function npc(s){if(!ready(s)||!ensure(s).heard||s.space?.system!==SYSTEM||s.space.body!==WORLD||s.space.phase!=='landed'||s.space.ecologyOcean||NVShipInterior.active(s))return null;return{x:(s.space.landingX||0)+20,z:(s.space.landingZ||0)+24,yaw:Math.PI,name:'Tyrotaronus',kind:'tyrotaronus'};}
 function waypoint(s){if(returnHak(s)){
  // Reuse the established Karribassa route, including the exact city coordinates.
  const p=s.space,label='Speak to Hak Chompjak · New empire';if(NVGalaxy.system(s)!=='janira-proxima')return ['landed','off','cockpit'].includes(p.phase)?{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label}:{galaxy:true,system:'janira-proxima',label};
  if(p.body==='janira-prime'&&p.phase==='landed')return{...NVCatharsisReturnHak.npc(s),label};
  if(p.body==='janira-prime'&&['atmosphere','descent','ascent'].includes(p.phase))return{geo:NVCatharsisReturnHak.geo(),label};
  if(['landed','off','cockpit'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label};const b=NVGalaxy.prime;return{space:true,position:b.position,radius:b.radius,label};
 }if(!find(s))return null;const p=s.space,label='Tyrotaronus · Tamaz Prime';if(NVArchiostal.active(s))return{x:-113,z:113,label:'Board ship · Tamaz'};if(npc(s))return{...npc(s),label};if(['landed','off','cockpit'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label};if(NVGalaxy.system(s)!==SYSTEM)return{galaxy:true,system:SYSTEM,label};if(p.body===WORLD&&p.phase==='atmosphere')return{geo:NVWorldFlight.ensure(s),label:'Land anywhere · '+label};const b=NVSol.byId[WORLD];return{space:true,position:b.position,radius:b.radius,label};}
 return{SYSTEM,WORLD,INTRO,VISIT,HAK,LINES,HAK_LINES,fresh,restore,ensure,ready,pending,find,returnHak,hakDiscussion,npc,waypoint};
})();
const tyroRestore=NVEris.restore;NVEris.restore=r=>({...tyroRestore(r),tyrotaronus:NVTyrotaronus.restore(r?.tyrotaronus)});
for(const q of [
 {id:NVTyrotaronus.INTRO,title:'A voice beyond the banners',description:'After creating a species, hear Tyrotaronus’s ten-part transmission.',available:NVTyrotaronus.ready,done:s=>s?.eris?.tyrotaronus?.heard===true},
 {id:NVTyrotaronus.VISIT,title:'Find Tyrotaronus',description:'Travel to Tamaz. Land on Tamaz Prime and speak to Tyrotaronus, the Vector of Neutrality, near your ship.',available:s=>NVTyrotaronus.ready(s)&&s?.eris?.tyrotaronus?.heard===true,done:s=>s?.eris?.tyrotaronus?.met===true},
 {id:NVTyrotaronus.HAK,title:'Tell Hak about your new empire',description:'After uplifting a species into an empire, return to Karribassa on Janira Prime and speak to Hak Chompjak again.',available:s=>NVTyrotaronus.returnHak(s)||s?.eris?.tyrotaronus?.hakHeard===true,done:s=>s?.eris?.tyrotaronus?.hakHeard===true}
])NVQuests.definitions.push({...q,chapter:4});
const tyroQuestRestore=NVQuests.restore;NVQuests.restore=r=>{const q=tyroQuestRestore(r);for(const id of [NVTyrotaronus.INTRO,NVTyrotaronus.VISIT,NVTyrotaronus.HAK])if(r?.completed?.includes(id)&&!q.completed.includes(id))q.completed.push(id);return q;};
// Keep explicit diplomacy wars authoritative; new empires begin allied by default.
const tyroCustomGalaxy=refreshGalaxy;refreshGalaxy=()=>{tyroCustomGalaxy();if(!polarState)return;const n=NVCustomCrew.empires(polarState).find(n=>n.system===galaxySelected);if(n){const r=NVDiplomacy.system(polarState,galaxySelected);$('#galaxyFaction').textContent='FACTION: '+NVCustomCrew.empireName(n)+' / '+NVDiplomacy.text(r.status);$('#galaxyFaction').dataset.relationship=r.status;$('#galaxyFaction').style.color=r.color;}};
const tyroMenuPersist=persistMenuCustomCrew;persistMenuCustomCrew=s=>{tyroMenuPersist(s);if(gameActive||!savedGame||!s?.eris)return;NVTyrotaronus.returnHak(s);const progress=structuredClone(savedGame.progress),e=progress.antarctica.eris;e.playerFaction.relationships=structuredClone(s.eris.playerFaction.relationships||{});e.tyrotaronus=structuredClone(NVTyrotaronus.ensure(s));updateGameProgress(progress);const session=menuLocationSession.get(savedGame.id);if(session){session.eris.playerFaction.relationships=e.playerFaction.relationships;session.eris.tyrotaronus=e.tyrotaronus;session.progress=savedGame.progress;}};
const tyroUplift=NVCustomCrew.uplift;NVCustomCrew.uplift=(s,...args)=>{const r=tyroUplift(s,...args);if(r.ok&&NVTyrotaronus.ready(s)){NVTyrotaronus.ensure(s).empireCreated=true;NVQuests.update(s);if(s.space)NVSpace.notice(s.space,'NEW OBJECTIVE / RETURN TO HAK CHOMPJAK');}return r;};
