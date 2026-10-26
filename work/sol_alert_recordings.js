const SOL_ALERT_VOICES=__SOL_ALERT_VOICES__;
const PLAYER_WAR_VOICE=__PLAYER_WAR_VOICE__;
const solAlertClips=SOL_ALERT_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';a.volume=.95;return a;});
const solPlayerWarClip=new Audio(PLAYER_WAR_VOICE.source);solPlayerWarClip.preload='none';solPlayerWarClip.volume=.95;
const solAlertVoice={index:-1,token:0,blocked:false,error:false,audience:'factions'};
function activeSolAlertClip(){return solAlertVoice.audience==='player'?solPlayerWarClip:solAlertClips[solAlertVoice.index];}
function stopSolAlertVoice(){solAlertVoice.token++;solAlertClips.forEach(a=>a.pause());solPlayerWarClip.pause();solAlertVoice.index=-1;solAlertVoice.blocked=false;solAlertVoice.error=false;}
function playSolAlertVoice(){
 const g=solAlertVoice,a=activeSolAlertClip(),token=g.token;if(g.index<0||!a||!gameActive||gamePaused||document.hidden)return;
 prepareJamesAcoustics(a);resumeJamesAcoustics();
 try{const result=a.play();if(result?.then)result.then(()=>{if(token!==g.token||!gameActive||gamePaused||document.hidden){a.pause();return;}g.blocked=false;}).catch(()=>{if(token===g.token)g.blocked=true;});}catch(e){g.blocked=true;}
}
function updateSolAlertVoice(){
 if(!gameActive||!polarState){stopSolAlertVoice();return;}
 const w=NVSolWar.ensure(polarState),personal=w.alertAudience==='player',count=personal?1:3;
 if(!['expansion','war'].includes(w.stage)||w.alertIndex>=count){if(solAlertVoice.index!==-1)stopSolAlertVoice();w.alertHold=false;return;}
 const g=solAlertVoice,audience=personal?'player':'factions';
 if(g.index!==w.alertIndex||g.audience!==audience){
  stopSolAlertVoice();g.index=w.alertIndex;g.audience=audience;
  const a=activeSolAlertClip(),token=g.token,meta=personal?PLAYER_WAR_VOICE:SOL_ALERT_VOICES[g.index];
  a.currentTime=Math.min(w.alertTime,meta.duration);
  a.onerror=()=>{if(token===g.token){g.error=true;g.blocked=false;}};
  playSolAlertVoice();
 }
 const a=activeSolAlertClip(),meta=personal?PLAYER_WAR_VOICE:SOL_ALERT_VOICES[g.index];
 if(gamePaused||document.hidden)a.pause();else if(a.paused&&!a.ended&&!g.blocked&&!g.error)playSolAlertVoice();
 w.alertHold=gamePaused||document.hidden||(!g.error&&!a.ended&&(g.blocked||a.paused));
 if(!gamePaused&&!document.hidden&&!g.error&&!a.ended)w.alertTime=Math.min(a.currentTime,meta.duration);
 solAlertRetry.hidden=!g.blocked||gamePaused;
}
const solAlertRetry=document.createElement('button');solAlertRetry.id='solAlertRetry';solAlertRetry.className='polar-button';solAlertRetry.textContent='PLAY ALERT VOICE';solAlertRetry.hidden=true;$('#hudAlerts').append(solAlertRetry);solAlertRetry.onclick=playSolAlertVoice;
const solAlertsHUD=updatePolarHUD;updatePolarHUD=()=>{solAlertsHUD();updateSolAlertVoice();if(solAlertVoice.index===-1)solAlertRetry.hidden=true;};
const solAlertsExit=exitPolar;exitPolar=()=>{stopSolAlertVoice();solAlertRetry.hidden=true;solAlertsExit();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){solAlertClips.forEach(a=>a.pause());solPlayerWarClip.pause();}else updateSolAlertVoice();});
