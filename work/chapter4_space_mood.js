// The loss of the flagship changes the mood; accepting the Chapter 4 quest does not.
function chapter4SpaceMood(s){return !!s&&chapter4VisualMood(s)&&s.space?.phase==='flight'&&!NVShipInterior.ensure(s).active;}
function refreshChapter4GameplayMood(){document.body.dataset.gameplayEra=gameActive&&chapter4VisualMood(polarState)?'chapter4':'original';$('#antarctica').classList.toggle('space-aftermath',gameActive&&chapter4SpaceMood(polarState));}
const chapter4MoodHUD=updatePolarHUD;updatePolarHUD=()=>{chapter4MoodHUD();refreshChapter4GameplayMood();};
const chapter4MoodExit=exitPolar;exitPolar=()=>{$('#antarctica').classList.remove('space-aftermath');document.body.dataset.gameplayEra='original';chapter4MoodExit();};$('#worldToMenu').onclick=()=>exitPolar();
