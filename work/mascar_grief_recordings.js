const MASCAR_GRIEF_AUDIO=__MASCAR_GRIEF_AUDIO__;
const NVMascarGriefVoice=(()=>{
 const clips=MASCAR_GRIEF_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;});
 const state={owner:null,index:-1,token:0,pending:false,blocked:false,error:false,muted:false,tail:0};
 const active=()=>gameActive&&!!polarState&&mascarSceneOpen&&!mascarScenePaused&&!document.hidden&&NVVengefulMascar.ensure(polarState).stage==='speech';
 function capture(){const a=clips[state.index];if(a&&state.owner===polarState&&NVVengefulMascar.ensure(polarState).line===state.index&&Number.isFinite(a.currentTime))NVVengefulMascar.ensure(polarState).voiceTime=a.currentTime;}
 function stop(){capture();state.token++;clips.forEach(a=>a.pause());Object.assign(state,{owner:null,index:-1,pending:false,blocked:false,error:false,tail:0});}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.muted||state.error)return;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token){if(clips[state.index]!==a||!active())a.pause();return;}state.pending=false;if(!active())a.pause();}).catch(()=>{if(token===state.token){state.pending=false;state.blocked=true;}});}
 function sync(){if(!active()){if(state.index>=0)stop();return;}const q=NVVengefulMascar.ensure(polarState);
  if(state.owner!==polarState||state.index!==q.line){stop();const a=clips[q.line],token=state.token;state.owner=polarState;state.index=q.line;const seek=()=>{if(token===state.token)try{a.currentTime=Math.min(q.voiceTime||0,Math.max(0,MASCAR_GRIEF_AUDIO[q.line].duration-.05));}catch(e){}};seek();a.onloadedmetadata=seek;a.onerror=()=>{if(token===state.token){state.error=true;state.pending=false;}};a.onended=()=>{if(token===state.token&&active()){capture();state.tail=.65;}};prepareJamesAcoustics(a);if(!state.muted)play();}
  const a=clips[state.index];if(!state.muted&&!state.blocked&&!state.error&&!state.pending&&a.paused&&!a.ended)play();$('#mascarVoice').textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';$('#mascarVoice').setAttribute('aria-pressed',String(!state.muted));$('#mascarVoiceStatus').textContent=state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE / CAPTIONS ACTIVE':state.muted?'VOICE MUTED / CAPTIONS ACTIVE':'RECORDED VOICE / CMD'+(q.line+1);
 }
 function tick(dt){sync();if(active()&&!state.muted&&!state.error&&state.tail>0){state.tail-=Math.min(.1,Math.max(0,dt));if(state.tail<=0){stop();advanceMascarScene();}}}
 function lip(){if(!active()||state.muted||state.error||state.blocked)return{jaw:0,width:1,round:0,teeth:0};const a=clips[state.index];if(!a)return{jaw:0,width:1,round:0,teeth:0};return janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),NVVengefulMascar.QUOTES[state.index]);}
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted)stop();sync();}
 return{clips,state,active,capture,stop,play,sync,tick,lip,toggle};
})();
const mascarVoiceButton=document.createElement('button');mascarVoiceButton.id='mascarVoice';mascarVoiceButton.className='polar-button';mascarVoiceButton.textContent='VOICE ON';mascarVoiceButton.onclick=NVMascarGriefVoice.toggle;mascarPanel.append(mascarVoiceButton);const mascarVoiceStatus=document.createElement('small');mascarVoiceStatus.id='mascarVoiceStatus';mascarPanel.append(mascarVoiceStatus);
const mascarRecordedNext=advanceMascarScene;advanceMascarScene=()=>{if(!mascarSceneOpen||mascarScenePaused)return;NVMascarGriefVoice.stop();mascarRecordedNext();NVMascarGriefVoice.sync();};$('#mascarNext').onclick=advanceMascarScene;
let mascarVoiceLast=performance.now();const mascarVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{mascarVoiceHUD();const now=performance.now();NVMascarGriefVoice.tick(Math.min(.1,Math.max(0,(now-mascarVoiceLast)/1000)));mascarVoiceLast=now;};
const mascarRecordedPause=pausePolar;pausePolar=on=>{NVMascarGriefVoice.stop();mascarRecordedPause(on);NVMascarGriefVoice.sync();};
const mascarRecordedSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVMascarGriefVoice.capture();return mascarRecordedSave(manual);};
const mascarRecordedExit=exitPolar;exitPolar=()=>{NVMascarGriefVoice.stop();mascarRecordedExit();};$('#worldToMenu').onclick=()=>exitPolar();
