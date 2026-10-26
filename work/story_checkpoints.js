// These templates are used only by an explicitly confirmed Reset Progress.
const NVStoryCheckpoints=(()=>{
 const choices=raw=>({orion:raw?.orion===true,james:raw?.james==='kill'?'kill':'spare',nyrexia:raw?.nyrexia===true,malia:raw?.malia==='kill'?'kill':'spare',croxian:raw?.croxian==='kill'?'kill':'spare',orionKilled:raw?.croxian==='kill'&&raw?.orionKilled===true});
 function progress(save,checkpoint,raw){
  const c=choices(raw),base=storyEarlyRestart(save,3),s=NVAntarctica.restored(base,save.id),e=NVEris.ensure(s),w=NVSolWar.ensure(s);
  Object.assign(s,{friendQuest:c.orion?'recruited':'declined',friendDialogueDone:true,friendDialogueActive:false});
  Object.assign(w,{stage:'war',throneDeclarationApplied:true,alertIndex:3,alertTime:0,marsImperialLocked:true,thomasAlive:checkpoint!==4,thomasHp:checkpoint===4?0:500001});
  Object.assign(NVConstruction.ensure(s),{started:true,tools:true,stage:9,stock:{wood:60,stone:60,metal:120,solarCell:30}});
  e.playerFaction.name=save.progress?.antarctica?.eris?.playerFaction?.name||'Wanderer Alliance';
  Object.assign(NVHawthorneTransmission.ensure(s),{armed:true,started:true,finished:true,marsAssigned:true,marsArrived:true,line:9});
  Object.assign(NVKhazglar.ensure(s),{recruited:true,marsComplete:true,found:true,introDone:true,introActive:false,line:9,siegeStage:'done'});
  Object.assign(NVShipReward.ensure(s),{stage:'claimed',claimed:true,crewBriefing:4,crewAssigned:true,crewArrived:true,charonLine:9,charonDecision:'decline'});
  Object.assign(NVMoonLoss.ensure(s),{triggered:true,complete:true});
  Object.assign(NVBrownStory.ensure(s),{stage:'done',brownCreated:true,brownDefeated:true,questStarted:true,tritonReached:true,earthTaken:true});
  Object.assign(NVBrownResolution.ensure(s),{outcome:c.james,conquest:true,returned:true,pending:false});
  Object.assign(NVPontifex.ensure(s),{alive:false,identity:'james-brown',hp:0,deathTime:0});
  Object.assign(NVErisFamily.ensure(s),{recruited:c.nyrexia});
  const roles=NVGovernance.ensure(s).roles;roles.khazglar='ship';roles.james='ship';roles.orion='follow';roles.nyrexia='follow';
  Object.assign(NVSolFall.ensure(s),{active:true,stage:'done',settled:true,reached:true,identified:true,metHak:true,alertVoiceDone:true});
  Object.assign(NVJaniraExpedition.ensure(s),{hakHeard:true,visharaHeard:true,briefed:true,visited:true,established:true,alliesExpanded:true,conquered:true,returned:true});
  if(checkpoint===31){
   e.playerFaction.claims=NVCluster.bodyLists[NVJaniraExpedition.TARGETS.player].filter(b=>!b.stellar&&!b.parent).map(b=>b.id);
   Object.assign(NVJaniraBlockade.ensure(s),NVJaniraBlockade.restore(null),{active:true,metHak:false});
   Object.assign(s.space,{system:'janira-proxima',body:'janira-prime',target:'janira-i',phase:'flight',shipId:NVShipReward.ID,driveLevel:2,hull:100,geo:null,landingX:0,landingZ:0,interior:NVShipInterior.fresh(),combatActive:false,crew:c.orion,galaxy:{visited:['sol','janira-proxima',NVJaniraExpedition.TARGETS.player],returns:{},metFigure:true}});
   s.space.position=NVGalaxy.prime.position.map((n,i)=>n+[0,200,950][i]);NVSpace.pointAt(s.space,NVSol.byId['janira-i'].position);
   s.space.visited=[...new Set([...s.space.visited,'moon','mars','charon','triton','earth','janira-prime'])];
   NVDiplomacy.sync(s);NVQuests.update(s);
   return{chapter:3,checkpoint:'janira-prime-blockade',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)};
  }
  Object.assign(NVJaniraBlockade.ensure(s),{active:false,metHak:true,liberated:true});
  Object.assign(NVJaniraSiege.ensure(s),{stage:'arrived',montageSeen:true,musicStarted:true,musicEnded:true});
  const commanders=NVKarribassaBosses.ensure(s);commanders.completed=true;commanders.engaged=false;commanders.bosses.forEach(b=>{b.hp=0;b.mode='dead';});commanders.resolution={stage:'done',line:4,voiceTime:0,choices:{malia:c.malia,croxian:c.croxian}};
  Object.assign(NVJaniraVictory.ensure(s),{stage:'done',line:4});
  const v=NVVengefulMascar.ensure(s);if(c.croxian==='kill'){v.stage='hunt';v.defected=true;v.target=NVVengefulMascar.site({body:'earth',system:'sol',lat:-28,lon:18,x:80,z:180,landingX:0,landingZ:0,global:true,colony:false});s.friendQuest='defected';}else{v.stage='waiting';v.defected=false;}
  const q=NVSiegeOfSol.ensure(s);Object.assign(q,{stage:checkpoint===4?'complete':'war',seed:s.seed,general:NVSiegeOfSol.general(s.seed),erisRestored:true,alexiaImprisoned:true,confronted:checkpoint===4,restartChoices:c});
  for(const b of NVSiegeOfSol.worlds())q.owners[b.id]=['eris','dysnomia','haumea','makemake','sedna'].includes(b.id)?'ERISIAN':'HUMAN';q.owners.mercury=checkpoint===4?'HUMAN':'TERRA';
  q.boss.hp=checkpoint===4?0:500001;q.finale={stage:checkpoint===4?'done':'waiting',line:0,elapsed:0,executed:checkpoint===4,grekRevealed:checkpoint===4,grekAlertRemaining:0,voiceTime:0};
  NVSiegeOfSol.fleet(s);if(checkpoint===4)for(const ship of q.fleet)if(ship.faction==='TERRA'){ship.hp=0;ship.respawn=-1;}
  Object.assign(w.diplomacy,{erisPuppet:false,erisianAllies:['HUMAN','CHOMPY','CUSTOM'],erisianWars:['TERRA'],humanAllies:['CHOMPY','ERISIAN','CUSTOM'],resistanceAllies:['HUMAN','CHOMPY','CUSTOM']});w.visharaLocation='eris';w.dariusLocation='earth';
  Object.assign(s.space,{system:'sol',body:'mercury',target:checkpoint===4?'earth':'mercury',phase:'flight',shipId:NVShipReward.ID,driveLevel:2,hull:100,geo:null,landingX:0,landingZ:0,interior:NVShipInterior.fresh(),combatActive:false,crew:s.friendQuest==='recruited',galaxy:{visited:['sol','janira-proxima'],returns:{},metFigure:true}});
  const b=NVSol.byId.mercury;s.space.position=[b.position[0],b.position[1]+b.radius+1200,b.position[2]-b.radius*3];s.space.visited=[...new Set([...s.space.visited,'moon','mars','charon','triton','earth','mercury'])];
  if(checkpoint===4){e.playerFaction.relationships.GREK='ALLIED';NVChapter4.assign(s);}NVDiplomacy.sync(s);NVQuests.update(s);
  return{chapter:checkpoint===4?4:3,checkpoint:checkpoint===4?'chapter4-first-warp':'mercury-pre-fight',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)};
 }
 return{choices,progress};
})();
const storyEarlyRestart=chapterRestartProgress;chapterRestartProgress=(save,chapter,choices)=>[31,30,4,41,5].includes(chapter)?NVStoryCheckpoints.progress(save,chapter,choices):storyEarlyRestart(save,chapter);
