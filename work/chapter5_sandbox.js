// The surviving endings open Chapter 5; the bad ending never reaches sandbox completion.
$('#chapter5RedMode').onclick=()=>{
 if(!savedGame||!chapter5Unlocked(menuLocation()))return;
 savedGame.chapter5RedMode=!chapter5RedMode(menuLocation());
 updateGameProgress({});
 refreshChapter4Menu();refreshChapter4GameplayMood();syncSoundtrack();
};
const chapter5Restore=NVAntarctica.restored;
NVAntarctica.restored=(...args)=>{const s=chapter5Restore(...args);if(chapter5Unlocked(s)){s.featureChapter=5;NVChapter4.ensure(s).year=2127;}return s;};
NVQuests.definitions.push({id:'chapter5-exploration',chapter:5,title:'The universe is yours to explore',description:'Explore the galaxies, develop your colonies, recruit companions and shape your alliances.',optional:true,available:chapter5Unlocked,done:()=>false});
const chapter5HUD=updatePolarHUD;
updatePolarHUD=()=>{
 chapter5HUD();if(!gameActive||!polarState||!chapter5Unlocked(polarState))return;
 const s=polarState;s.featureChapter=5;NVChapter4.ensure(s).year=2127;
 $('#polarChapter').textContent='NOSTRAVECTOR / CHAPTER 05';
 if(!gamePaused&&['main',NVCatharsisRoute.FINAL].includes(s.eris?.quests?.tracked||'main')){
  $('#hudMissionKicker').textContent='CHAPTER 5 / 2127 AD';$('#hudMissionTitle').textContent='THE UNIVERSE IS YOURS TO EXPLORE';
  const galaxy=typeof galaxyLabel==='function'?galaxyLabel(NVGalaxy.system(s)):'MILKY WAY';
  $('#hudMissionText').textContent='Explore '+(galaxy==='MILKY WAY'?'the Milky Way':galaxy.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()))+', return to your colonies and choose your next journey.';
  $('#hudMissionMeta').textContent='2127 AD / '+galaxy+' · SANDBOX';
 }
};
