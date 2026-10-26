// An explicit reset template. The selected save is changed only by RESET CHAPTER.
const preCaraxCheckpoint=NVStoryCheckpoints.progress;
NVStoryCheckpoints.progress=(save,checkpoint,raw)=>{
 if(checkpoint===5){
  const p=NVStoryCheckpoints.progress(save,41,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'}),s=NVAntarctica.restored(p,save.id),assault=NVCarax.ensure(s);
  assault.secured.fill(true);assault.forces=[];assault.guards.forEach(f=>f.forEach(g=>g.hp=0));Object.values(NVCaraxBosses.ensure(s)).forEach(b=>Object.assign(b,{hp:0,stage:'defeated',action:'dead'}));
  Object.assign(NVCaraxEndings.ensure(s),{route:'good',stage:'done',andromeda:'later'});Object.assign(NVCatharsisRoute.ensure(s),{finalStage:'active',coreReached:true});
  if(!endingFinishBase(s))throw Error('Could not prepare the Chapter 5 checkpoint.');
  s.featureChapter=5;NVChapter4.ensure(s).year=2127;NVSpace.notice(s.space,'CHAPTER 5 / THE UNIVERSE IS YOURS TO EXPLORE');NVQuests.update(s);
  return{chapter:5,checkpoint:'chapter5-sandbox',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)};
 }
 if(checkpoint!==41)return preCaraxCheckpoint(save,checkpoint,raw);
 const c=NVStoryCheckpoints.choices(raw),base=preCaraxCheckpoint(save,4,c),s=NVAntarctica.restored(base,save.id),e=NVEris.ensure(s),p=s.space;
 Object.assign(NVChapter4.ensure(s),{stage:'awake',year:2127,stasisDays:730,flagshipDestroyed:true,governorsAdvanced:true,amGrekMet:true,amGrekGiftHeard:true,amGrekGiftStarted:true,amGrekLine:4});
 Object.assign(NVCapital.ensure(s),{stage:'claimed',claimed:true,body:'aridaxx',waiting:false});
 Object.assign(NVArchamus.ensure(s),{chapter4Met:true,catharsisHeard:true,catharsisLine:19,contactBriefed:true,contactMet:true,williamsChoice:'sympathetic',williamsHelpAccepted:true,williamsReactionHeard:true});
 const hired=NVWilliamsExpedition.recruit(s);if(!hired.ok)throw Error('Pre-final checkpoint: '+hired.text);
 NVWilliamsExpedition.ensure(s).investigated=true;
 Object.assign(NVCatharsisField.ensure(s),{rifle:true});
 Object.assign(NVCatharsisTransmission.ensure(s),{stage:'done',line:9,shipEntered:true,language:'english'});
 Object.assign(NVCatharsisBoarding.ensure(s),{stage:'cleared',wave:3,enemies:[],crew:[]});
 Object.assign(NVCatharsisAftermath.ensure(s),{stage:'done',line:9,metHak:true});
 Object.assign(NVTyrotaronus.ensure(s),{heard:true,met:true,hakHeard:true,empireCreated:true,line:9});
 const route=NVCatharsisRoute.ensure(s);Object.assign(route,{briefed:true,visitLine:4,aridaxxReached:true,alphinosMet:true,coreReached:false,warned:true,warningTime:0,finalStage:'none',zark:NVLordZark.fresh()});
 const tyro=NVTyrotaronusCompanion.recruit(s);if(tyro)e.createSpeciesQuest={baseline:[],created:tyro.id,name:'Reptillian 2'};
 const orion=NVVengefulMascar.ensure(s);
 if(c.croxian==='kill'&&c.orionKilled){Object.assign(orion,{stage:'complete',form:3,defected:true,engaged:false});Object.assign(orion.enemy,{hp:0,maxHp:3000000,mode:'dead'});Object.assign(NVMascarRampage.ensure(s),{stage:'defeat',defeatTime:0,deathVoiceHeard:true});NVOrionEmpire.ensure(s).stage='defeated';}
 else if(c.croxian==='kill'){Object.assign(orion,{stage:'hunt',defected:true,engaged:false});Object.assign(orion.enemy,{hp:750000,maxHp:750000});}
 const ending=NVCaraxEndings.ensure(s);Object.assign(ending,NVCaraxEndings.fresh());Object.assign(ending.history,{orionChapter2:c.orion,nyrexiaBeforeCoup:c.nyrexia});
 const assault=NVCarax.ensure(s);assault.deck=4;assault.secured=[true,true,true,true,false];assault.guards.forEach(f=>f.forEach(g=>g.hp=0));assault.bosses=NVCaraxBosses.fresh();for(const d of NVCaraxBosses.DEFS)if(d.id!=='lord-zark')Object.assign(assault.bosses[d.id],{hp:0,stage:'defeated',action:'dead',deathAge:6});
 Object.assign(p,{system:NVCatharsisRoute.SYSTEM,body:'aridaxx',target:'aridaxx',phase:'landed',shipId:NVCapital.ID,driveLevel:3,hull:NVCapital.HP,warp:null,landingX:0,landingZ:0,landingElevation:0,geo:{global:true,lat:NVCatharsisRoute.CITY.lat,lon:NVCatharsisRoute.CITY.lon+.035,altitude:0,heading:0,look:0},ecologyOcean:false,interior:NVShipInterior.fresh(),combatActive:false,speed:0,throttle:0,autopilot:false,damageFlash:0});
 p.position=NVSpace.routeEnd(NVSol.byId.aridaxx);p.visited=[...new Set([...p.visited.filter(id=>id!=='carax'),'aridaxx','tamaz-p1'])];NVGalaxy.ensure(s).visited=[...new Set([...NVGalaxy.ensure(s).visited.filter(id=>id!==NVCatharsisRoute.CORE),'steca-prime','tamaz'])];NVCluster.ensure(s).fuel=5;
 const entry=NVCapital.entry(s);Object.assign(s,{featureChapter:4,x:entry.x,z:entry.z,yaw:-Math.PI/2,cameraYaw:-Math.PI/2,cameraPitch:.12,stamina:100,exhausted:false,aerialView:false});NVEcology.ensure(s).health=100;p.landingElevation=NVWorldFlight.ground(s,p.landingX,p.landingZ);s.friend={x:s.x+2,z:s.z-2,yaw:s.yaw};NVSpace.notice(p,'ARIDAXX / PREPARE YOUR SHIP · TRAVEL TO SAGITTARIUS A* WHEN READY.');
 NVCarax.rally(s);assault.forces.forEach((a,i)=>Object.assign(a,{deck:4,x:(i%8-3.5)*3,z:-17-Math.floor(i/8)*2,cooldown:2}));
 const journal=e.quests||(e.quests=NVQuests.restore(null));journal.completed=[...new Set([...journal.completed,...NVQuests.definitions.filter(q=>q.chapter===4&&q.id!==NVCatharsisRoute.FINAL).map(q=>q.id)])];journal.completed=journal.completed.filter(id=>id!==NVCatharsisRoute.FINAL);journal.tracked=NVCatharsisRoute.FINAL;NVQuests.update(s);
 return{chapter:4,checkpoint:'chapter4-pre-final-boss',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)};
};
