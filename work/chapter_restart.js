// Explicit menu resets create a clean chapter checkpoint; gameplay never autosaves.
const CHAPTER_RESTARTS={
 1:{name:'Chapter 1 · Antarctica',description:'Wake in Antarctica and meet James. Start the tutorial again.'},
 2:{name:'Chapter 2 · Africa',description:'Arrive in Africa. Choose whether to recruit Orion, then find your spaceship.'},
 3:{name:'Chapter 3 · Space exploration',description:'Start in Earth orbit with your spaceship. Head to the Moon for the construction tutorial.'},
 31:{name:'Chapter 3 · Blockade of Janira Prime',description:'Arrive at the occupied Janira Prime with your upgraded ship. Head to Janira I to meet Hak before the siege. Croxian and Malia have not been fought yet.'},
 30:{name:'Chapter 3 · Before Hawthorne’s final fight',description:'Start in Mercury orbit with the upgraded ship and the Siege of Sol ready. Choose your earlier story outcomes. If Croxian died, Orion awaits on Earth and can reinforce Hawthorne on Mercury.'},
 41:{name:'CHAPTER 4 - Pre Final Boss',description:'Start beside the Grek Horizon on Aridaxx, before the Path of No Return. Prepare and travel to Sagittarius A* when ready. Earlier Carax floors are cleared for the final boss. Choose your story history and whether Orion was defeated after Croxian’s death.'},
 4:{name:'Chapter 4 · Before the alien attack',description:'Hawthorne is defeated and Sol liberated. Start the first Chapter 4 warp objective, before the alien attack and time skip.'},
 5:{name:'Chapter 5 · Sandbox exploration',description:'Start on Aridaxx in 2127 AD after the good ending. Carax is liberated and travel to the other galaxies is unlocked.'}
};
function chapterRestartProgress(save,chapter){
 if(chapter===1)return{chapter:1,checkpoint:'character-created',playTimeSeconds:0};
 const s=NVAntarctica.fresh(NVAntarctica.seedFromId(save.id));
 Object.assign(s,{jamesIntroductionDone:true,introIndex:4,jamesCarQuoteShown:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',stormClearCount:2,blizzardCycle:2,stormRemaining:0,nextBlizzardRemaining:600,supplyDialogueDone:true,suppliesPlanKnown:true,suppliesCollected:true,ferryDialogueDone:true,ferryPlanKnown:true,bedMaterialsCollected:true,bedBuilt:true,bedRested:true,dreamDone:true,ferryFound:true,betrayalStage:'complete',betrayalIndex:14,betrayalTime:27,ferryEscaped:true,jamesGone:true});
 NVAntarctica.grantWakeInventory(s);NVAfrica.arrive(s);
 if(chapter===3){
  s.africaStage='complete';s.spaceshipFound=true;
  // Retain an optional recruitment decision made in Chapter 2, without later crew.
  if(save.progress?.antarctica?.friendQuest==='recruited'){s.friendQuest='recruited';s.friendDialogueDone=true;}
  s.x=NVAfrica.SHIP.x;s.z=NVAfrica.SHIP.z-10;s.friend={x:s.x+2,z:s.z-2,yaw:0};
  s.space=NVSpace.fresh();s.space.crew=s.friendQuest==='recruited';NVSpace.orbit(s);s.space.target='moon';
  NVConstruction.update(s);
 }
 NVQuests.update(s);
 return{chapter,checkpoint:chapter===2?'africa-arrival':'earth-orbit',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)};
}
