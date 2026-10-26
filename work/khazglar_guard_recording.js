const KHAZGLAR_GUARD_AUDIO=__KHAZGLAR_GUARD_AUDIO__;
const khazglarGuardClip=new Audio(KHAZGLAR_GUARD_AUDIO.source);
khazglarGuardClip.preload='none';khazglarGuardClip.volume=.95;
let khazglarGuardBlocked=false,khazglarGuardToken=0;
function stopKhazglarGuard(){khazglarGuardToken++;khazglarGuardBlocked=false;khazglarGuardClip.pause();}
function guardVoiceAllowed(){return gameActive&&!gamePaused&&!document.hidden&&!khazglarSpeechMuted&&polarState&&NVKhazglar.troopsNearby(polarState)&&(NVKhazglar.ensure(polarState).battle?.shout||0)>0;}
function playKhazglarGuard(retry=false){
 if(!guardVoiceAllowed())return;
 const token=++khazglarGuardToken;
 if(!retry){khazglarGuardClip.pause();khazglarGuardClip.currentTime=0;khazglarGuardClip.preload='none';khazglarGuardClip.load();}
 try{Promise.resolve(khazglarGuardClip.play()).then(()=>{if(token!==khazglarGuardToken){if(!guardVoiceAllowed())khazglarGuardClip.pause();return;}khazglarGuardBlocked=false;if(!guardVoiceAllowed())stopKhazglarGuard();}).catch(()=>{if(token===khazglarGuardToken)khazglarGuardBlocked=true;});}catch(e){khazglarGuardBlocked=true;}
}
document.addEventListener('pointerdown',()=>{if(khazglarGuardBlocked&&guardVoiceAllowed())playKhazglarGuard(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopKhazglarGuard();});
const guardVoicePause=pausePolar;pausePolar=on=>{if(on)stopKhazglarGuard();return guardVoicePause(on);};
const guardVoiceExit=exitPolar;exitPolar=()=>{stopKhazglarGuard();return guardVoiceExit();};
