// Use the same front-facing, articulated model in the world, ship and menu.
const NVTyrotaronusCompanion=(()=>{
 const MODEL='glb-story-tyrotaronus',SPECIES='OILKOUMENEUS',entry={asset:MODEL,source:__TYROTARONUS_COMPANION_GLB__,motion:'tyrotaronus'};
 const previous=NVStoryModels.byAsset;NVStoryModels.byAsset=id=>id===MODEL?entry:previous(id);
 const identify=n=>{if(n){n.species||={};n.species.enabled=true;n.species.name=SPECIES;}return n;};
 const crewRestore=NVCustomCrew.restore;NVCustomCrew.restore=raw=>{const crew=crewRestore(raw);for(const n of crew.characters)if(n.model?.id===MODEL)identify(n);return crew;};
 const crewList=NVCustomCrew.crew;NVCustomCrew.crew=s=>crewList(s).map(n=>n.model?.id===MODEL?identify(n):n);
 const member=s=>identify(NVCustomCrew.ensure(s).characters.find(n=>n.model?.id===MODEL)||null);
 function recruit(s){const q=NVCatharsisRoute.ensure(s);if(!q.briefed)return null;const old=member(s);if(old){q.tyrotaronusId=old.id;q.tyrotaronusJoined=true;return old;}if(q.tyrotaronusJoined)return null;
  const result=NVCustomCrew.create(s,{name:'TYROTARONUS',model:NVGLB.metadata({type:'glb',id:MODEL,file:'TYROTARONUS.glb',height:2.15,triangles:14136,yaw:0}),species:{enabled:true,name:SPECIES},alignment:'Lawful Neutral',bio:'The Vector of Neutrality. He has joined the Wanderer after sharing his findings on Tamaz.'});
  if(!result.ok)return null;const n=result.npc;q.tyrotaronusId=n.id;q.tyrotaronusJoined=true;NVGovernance.setRole(s,n.id,'follow');NVCombatCrew.configure(s,n.id,'laser','balanced');NVGLB.load(MODEL);NVCustomCrew.followStep(s,0);return n;
 }
 return{MODEL,SPECIES,member,recruit};
})();
const tyroCompanionBriefing=NVCatharsisRoute.completeBriefing;NVCatharsisRoute.completeBriefing=s=>{const r=tyroCompanionBriefing(s);NVTyrotaronusCompanion.recruit(s);return r;};
const tyroCompanionNPC=NVTyrotaronus.npc;NVTyrotaronus.npc=s=>NVCatharsisRoute.ensure(s).tyrotaronusJoined?null:tyroCompanionNPC(s);
// Migrate saves made after the Tamaz briefing, without duplicating the companion.
const tyroCompanionHUD=updatePolarHUD;updatePolarHUD=()=>{if(gameActive&&polarState?.eris?.catharsisCoreRoute?.briefed&&!polarState.eris.catharsisCoreRoute.tyrotaronusJoined)NVTyrotaronusCompanion.recruit(polarState);tyroCompanionHUD();};
