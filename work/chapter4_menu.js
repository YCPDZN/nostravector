function chapter4MenuActive(){
 if(typeof savedGame==='undefined'||!savedGame)return false;
 return chapter4VisualMood(menuLocation());
}
const chapter4MenuTagline=$('#menu .tagline').textContent,chapter4MenuEdition=$('#menu .edition').textContent;
function chapter4FinalMenuMessage(){
 const final=savedGame?.progress?.antarctica?.eris?.catharsisCoreRoute;
 if(!final)return '';if(final.ending?.beam?.failures>0&&final.finalStage!=='complete'&&final.ending?.stage!=='done')return 'LORD ZARK MUST BE STOPPED!';if(final.ending?.history?.badWarningSeen&&final.finalStage!=='complete')return "GOOD LUCK, YOU'RE GOING TO NEED IT :)";if(!['committed','active','ending'].includes(final.finalStage))return '';
 return{good:'SAVE THE WORLD',neutral:'TRY YOUR BEST',bad:"GOOD LUCK, YOU'RE GOING TO NEED IT :)",'bad-zark':"GOOD LUCK, YOU'RE GOING TO NEED IT :)",'bad-josiah':"GOOD LUCK, YOU'RE GOING TO NEED IT :)",'bad-tyrotaronus':"GOOD LUCK, YOU'RE GOING TO NEED IT :)"}[final.ending?.route]||'';
}
function refreshChapter4Menu(){
 const location=menuLocation(),chapter5=!!savedGame&&chapter5Unlocked(location),on=chapter4MenuActive(),message=on?chapter4FinalMenuMessage():'';
 $('#menu').dataset.era=on?'chapter4':'original';document.body.dataset.menuEra=on?'chapter4':'original';
 $('#menu .tagline').textContent=chapter5?(on?'Space remembers.':'THE UNIVERSE IS YOURS TO EXPLORE'):on?message||'Space remembers.':chapter4MenuTagline;
 $('#menu .edition').textContent=chapter5?'CHAPTER 05 / '+(on?'SPACE REMEMBERS':'THE UNIVERSE IS YOURS TO EXPLORE'):on?'CHAPTER 04 / '+(message||'SPACE REMEMBERS'):chapter4MenuEdition;
 $('#menu .left .eyebrow').textContent=chapter5||location.eris?.chapter4?.year===2127?'CURRENT YEAR / 2127 AD':'THE GAME STARTS / 2125 AD';
 const toggle=$('#chapter5RedMode');toggle.hidden=!chapter5;toggle.textContent='RED MODE: '+(chapter5&&on?'ON':'OFF');toggle.setAttribute('aria-pressed',String(chapter5&&on));
}

const chapter4MoodLocation=updateMenuLocation;updateMenuLocation=()=>{const result=chapter4MoodLocation();refreshChapter4Menu();return result;};
const chapter4MoodSync=syncSavedGameMenu;syncSavedGameMenu=()=>{chapter4MoodSync();refreshChapter4Menu();syncSoundtrack();};
refreshChapter4Menu();syncSoundtrack();
