const HAWTHORNE_RAGE_AUDIO=__HAWTHORNE_RAGE_AUDIO__;
const NVHawthorneRageVoice=(()=>{
 const clips=HAWTHORNE_RAGE_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;});
 const state={owner:null,index:-1,token:0,pending:false,blocked:false,error:false,muted:false,tail:0};
 const active=()=>gameActive&&!!polarState&&solRageOpen&&!solRagePaused&&!document.hidden&&NVSiegeOfSol.ensure(polarState).stage==='rage';
 function capture(){const a=clips[state.index];if(a&&state.owner===polarState&&NVSiegeOfSol.ensure(polarState).line===state.index&&Number.isFinite(a.currentTime))NVSiegeOfSol.ensure(polarState).voiceTime=a.currentTime;}
 function stop(){capture();state.token++;clips.forEach(a=>a.pause());Object.assign(state,{owner:null,index:-1,pending:false,blocked:false,error:false,tail:0});}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.muted||state.error)return;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token){if(clips[state.index]!==a||!active())a.pause();return;}state.pending=false;if(!active())a.pause();}).catch(()=>{if(token===state.token){state.pending=false;state.blocked=true;}});}
 function sync(){if(!active()){if(state.index>=0)stop();return;}const q=NVSiegeOfSol.ensure(polarState);
  if(state.owner!==polarState||state.index!==q.line){stop();const a=clips[q.line],token=state.token;state.owner=polarState;state.index=q.line;const seek=()=>{if(token===state.token)try{a.currentTime=Math.min(q.voiceTime||0,Math.max(0,HAWTHORNE_RAGE_AUDIO[q.line].duration-.05));}catch(e){}};seek();a.onloadedmetadata=seek;a.onerror=()=>{if(token===state.token){state.error=true;state.pending=false;}};a.onended=()=>{if(token===state.token&&active()){capture();state.tail=.65;}};prepareJamesAcoustics(a);if(!state.muted)play();}
  const a=clips[state.index];if(!state.muted&&!state.blocked&&!state.error&&!state.pending&&a.paused&&!a.ended)play();$('#rageRecordedVoice').textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';$('#rageRecordedVoice').setAttribute('aria-pressed',String(!state.muted));$('#rageRecordedVoiceStatus').textContent=state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE / CAPTIONS ACTIVE':state.muted?'VOICE MUTED / CAPTIONS ACTIVE':'RECORDED VOICE / HB'+(q.line+1);
 }
 function tick(dt){sync();if(active()&&!state.muted&&!state.error&&state.tail>0){state.tail-=Math.min(.1,Math.max(0,dt));if(state.tail<=0){stop();nextSolRage();}}}
 function lip(){if(!active()||state.muted||state.error||state.blocked)return{jaw:0,width:1,round:0,teeth:0};const a=clips[state.index];if(!a)return{jaw:0,width:1,round:0,teeth:0};return janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),NVSiegeOfSol.QUOTES[state.index]);}
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted)stop();sync();}
 return{clips,state,active,capture,stop,play,sync,tick,lip,toggle};
})();
const rageRecordedVoiceButton=document.createElement('button');rageRecordedVoiceButton.id='rageRecordedVoice';rageRecordedVoiceButton.className='polar-button';rageRecordedVoiceButton.textContent='VOICE ON';rageRecordedVoiceButton.onclick=NVHawthorneRageVoice.toggle;$('#solRage footer>div').prepend(rageRecordedVoiceButton);const rageRecordedVoiceStatus=document.createElement('small');rageRecordedVoiceStatus.id='rageRecordedVoiceStatus';$('#solRage footer').prepend(rageRecordedVoiceStatus);
const rageRecordedRecordedNext=nextSolRage;nextSolRage=()=>{if(!solRageOpen||solRagePaused)return;NVHawthorneRageVoice.stop();rageRecordedRecordedNext();NVHawthorneRageVoice.sync();};$('#solRageNext').onclick=nextSolRage;
let rageRecordedVoiceLast=performance.now();const rageRecordedVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{rageRecordedVoiceHUD();const now=performance.now();NVHawthorneRageVoice.tick(Math.min(.1,Math.max(0,(now-rageRecordedVoiceLast)/1000)));rageRecordedVoiceLast=now;};
const rageRecordedRecordedPause=pausePolar;pausePolar=on=>{NVHawthorneRageVoice.stop();rageRecordedRecordedPause(on);NVHawthorneRageVoice.sync();};
const rageRecordedRecordedSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVHawthorneRageVoice.capture();return rageRecordedRecordedSave(manual);};
const rageRecordedRecordedExit=exitPolar;exitPolar=()=>{NVHawthorneRageVoice.stop();rageRecordedRecordedExit();};$('#worldToMenu').onclick=()=>exitPolar();
