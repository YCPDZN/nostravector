const ZARK_BOSS_AUDIO=__ZARK_BOSS_AUDIO__;
NVCaraxBosses.setQuoteDurations(ZARK_BOSS_AUDIO.map(r=>r.duration+2));
const NVZarkBossVoice=(()=>{
 const clips=ZARK_BOSS_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,boss=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 function context(){if(!gameActive||!polarState||zarkScene||!NVCaraxBosses.local(polarState)||NVCarax.ensure(polarState).deck!==4)return null;const b=NVCaraxBosses.ensure(polarState)['lord-zark'];return b.hp>0?b:null;}
 const active=()=>!!boss&&context()===boss&&!gamePaused&&!document.hidden&&!blurred;
 function remember(){const a=clips[index];if(boss&&boss.quote===index&&a?.readyState>=1&&!a.ended&&!failed)boss.quoteTime=Math.max(2,ZARK_BOSS_AUDIO[index].duration-a.currentTime+2);}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();for(const a of clips){a.pause();a.onended=null;a.onerror=null;a.onloadedmetadata=null;}owner=null;boss=null;index=-1;blocked=false;failed=false;}
 function play(){const a=clips[index];if(!active()||!a||pending||blocked||failed||!a.paused||a.ended)return;const t=++token;pending=true;resumeJamesAcoustics();Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();render();}).catch(()=>{if(t===token){pending=false;blocked=true;render();}});}
 function sync(){const b=context();if(!b){stop();render();return;}if(owner!==polarState||boss!==b||index!==b.quote){stop();owner=polarState;boss=b;index=b.quote;const a=clips[index],r=ZARK_BOSS_AUDIO[index],offset=Math.max(0,Math.min(r.duration,r.duration+2-b.quoteTime));prepareJamesAcoustics(a);a.onended=()=>{if(boss===b&&clips[index]===a)b.quoteTime=2;};a.onerror=()=>{if(boss===b&&clips[index]===a){failed=true;pending=false;render();}};const ready=()=>{if(boss!==b||clips[index]!==a)return;a.currentTime=Math.min(offset,Number.isFinite(a.duration)?a.duration:offset);if(active())play();};if(a.readyState>=1)ready();else{a.onloadedmetadata=ready;a.load();}}
  if(!active()){if(pending||!clips[index].paused)suspend();}else{remember();play();}render();
 }
 const speaking=()=>active()&&!!clips[index]&&!clips[index].paused&&!clips[index].ended&&!clips[index].muted;
 function lip(){return speaking()?janiraRallyRecordedViseme(clips[index],prepareJamesAcoustics(clips[index]),NVCaraxBosses.ZARK_QUOTES[index]):{jaw:0};}
 function retry(){if(blocked||failed){blocked=false;failed=false;const a=clips[index];if(a?.error){index=-1;sync();}else play();}}
 function render(){zarkBossVoiceRetry.hidden=!boss||!active()||(!blocked&&!failed);zarkBossVoiceStatus.textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':boss?'RECORDED VOICE / ZARKBOSSFIGHT'+(index+1):'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',()=>{if(blocked)retry();});document.addEventListener('keydown',()=>{if(blocked)retry();});
 return{clips,context,active,remember,suspend,stop,sync,speaking,lip,retry,index:()=>index};
})();
const zarkBossVoiceStatus=document.createElement('small');zarkBossVoiceStatus.id='zarkBossVoiceStatus';caraxBossQuote.append(zarkBossVoiceStatus);
const zarkBossVoiceRetry=document.createElement('button');zarkBossVoiceRetry.id='zarkBossVoiceRetry';zarkBossVoiceRetry.className='polar-button';zarkBossVoiceRetry.textContent='PLAY VOICE';zarkBossVoiceRetry.hidden=true;zarkBossVoiceRetry.onclick=()=>NVZarkBossVoice.retry();caraxBossQuote.append(zarkBossVoiceRetry);
const zarkBossVoiceStyle=document.createElement('style');zarkBossVoiceStyle.textContent='#zarkBossVoiceStatus{display:block;font-size:8px;color:#d8b3a4;margin-top:5px}#zarkBossVoiceRetry{pointer-events:auto;font-size:10px;margin-top:6px}';document.head.append(zarkBossVoiceStyle);
const zarkBossVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{zarkBossVoiceHUD();NVZarkBossVoice.sync();};
const zarkBossVoiceStep=NVCarax.step;NVCarax.step=(s,dt)=>{if(s===polarState)NVZarkBossVoice.remember();zarkBossVoiceStep(s,dt);if(s===polarState)NVZarkBossVoice.sync();};
const zarkBossVoiceHit=NVCaraxBosses.hit;NVCaraxBosses.hit=(s,t,...args)=>{const result=zarkBossVoiceHit(s,t,...args);if(s===polarState&&t.enemy?.caraxBossId==='lord-zark'&&t.enemy.hp<=0)NVZarkBossVoice.stop();return result;};
const zarkBossVoicePause=pausePolar;pausePolar=on=>{if(on)NVZarkBossVoice.suspend();const result=zarkBossVoicePause(on);NVZarkBossVoice.sync();return result;};
const zarkBossVoiceExit=exitPolar;exitPolar=()=>{NVZarkBossVoice.stop();return zarkBossVoiceExit();};$('#worldToMenu').onclick=()=>exitPolar();
const zarkBossVoiceSave=savePolarWorld;savePolarWorld=(...args)=>{NVZarkBossVoice.remember();return zarkBossVoiceSave(...args);};
