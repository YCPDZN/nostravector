const CREW_ENEMY_AUDIO=__CREW_ENEMY_AUDIO__;
const NVCrewEnemyVoice=(()=>{
 const clips=CREW_ENEMY_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let index=-1,owner=null,reaction=null,token=0,pending=false,blocked=false,failed=false,blurred=false;
 function context(){return gameActive&&polarState?NVCrewEnemyEncounter.current(polarState):null;}
 function audible(){return reaction&&context()===reaction&&!gamePaused&&!document.hidden&&!blurred&&NVPlayerPistol.playable(polarState);}
 function suspend(){token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();index=-1;owner=null;reaction=null;blocked=false;failed=false;}
 function play(){const a=clips[index];if(!a||!audible()||pending||blocked||failed||!a.paused||a.ended)return;const t=++token;pending=true;
  Promise.resolve().then(()=>{if(t===token&&audible())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!audible())a.pause();return;}pending=false;if(!audible())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});
 }
 function sync(){const r=context();if(!r){stop();return;}if(r!==reaction||owner!==polarState){stop();reaction=r;owner=polarState;const profile=NVCrewDiplomacy.voiceKey(owner,r.id);index=CREW_ENEMY_AUDIO.findIndex(row=>row.profile===profile&&row.line===r.line);const a=clips[index];if(!a)return;a.currentTime=Math.max(0,CREW_ENEMY_AUDIO[index].duration+.6-r.remaining);a.onended=()=>{if(reaction===r&&clips[index]===a)r.remaining=Math.min(r.remaining,.4);};a.onerror=()=>{if(reaction===r&&clips[index]===a){failed=true;pending=false;}};}
  if(!audible()){if(pending||clips[index]&&!clips[index].paused)suspend();return;}play();const a=clips[index];if(a&&!a.ended&&!blocked&&!failed)r.remaining=Math.max(r.remaining,CREW_ENEMY_AUDIO[index].duration-a.currentTime+.5);
 }
 function duration(s,id,line){return(CREW_ENEMY_AUDIO.find(r=>r.profile===NVCrewDiplomacy.voiceKey(s,id)&&r.line===line)?.duration||8.4)+.6;}
 const speaking=()=>!!clips[index]&&audible()&&!clips[index].paused&&!clips[index].ended;
 function retry(){if(blocked){blocked=false;sync();}}
 window.addEventListener('blur',()=>{blurred=true;suspend();});window.addEventListener('focus',()=>{blurred=false;sync();});
 document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);window.addEventListener('pagehide',stop);
 return{clips,context,sync,suspend,stop,speaking,duration,index:()=>index};
})();
NVCrewEnemyEncounter.lineDuration=NVCrewEnemyVoice.duration;
const enemyVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{enemyVoiceHUD();NVCrewEnemyVoice.sync();};
const enemyVoiceTick=stepEcology;stepEcology=dt=>{enemyVoiceTick(dt);NVCrewEnemyVoice.sync();};
const enemyVoicePause=pausePolar;pausePolar=on=>{if(on)NVCrewEnemyVoice.suspend();const result=enemyVoicePause(on);NVCrewEnemyVoice.sync();syncSoundtrack();return result;};
const enemyVoiceExit=exitPolar;exitPolar=()=>{NVCrewEnemyVoice.stop();const result=enemyVoiceExit();syncSoundtrack();return result;};
const enemyBCVoice=NVBCVoice.sync;NVBCVoice.sync=()=>{if(NVCrewEnemyVoice.context())NVBCVoice.suspend();else enemyBCVoice();};
