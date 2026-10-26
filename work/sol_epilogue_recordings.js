const SOL_EPILOGUE_AUDIO=__SOL_EPILOGUE_AUDIO__;
const NVSolEpilogueVoice=(()=>{
 const clips=SOL_EPILOGUE_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;});
 const state={owner:null,index:-1,token:0,pending:false,blocked:false,error:false,muted:false,tail:0};
 const index=()=>{const q=NVSolEpilogue.ensure(polarState);return q.stage==='hawthorne'?q.line:q.stage==='stranger'?5+q.line:-1;};
 const active=()=>gameActive&&!!polarState&&solEpilogueOpen&&!solEpiloguePaused&&!document.hidden&&index()>=0;
 function capture(){const a=clips[state.index];if(a&&state.owner===polarState&&index()===state.index&&Number.isFinite(a.currentTime))NVSolEpilogue.ensure(polarState).voiceTime=a.currentTime;}
 function stop(){capture();state.token++;clips.forEach(a=>a.pause());Object.assign(state,{owner:null,index:-1,pending:false,blocked:false,error:false,tail:0});}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.muted||state.error)return;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token){if(clips[state.index]!==a||!active())a.pause();return;}state.pending=false;if(!active())a.pause();}).catch(()=>{if(token===state.token){state.pending=false;state.blocked=true;}});}
 function sync(){const button=$('#epilogueRecordedVoice'),status=$('#epilogueRecordedVoiceStatus');button.hidden=status.hidden=!active();if(!active()){if(state.index>=0)stop();return;}const q=NVSolEpilogue.ensure(polarState),i=index();
  if(state.owner!==polarState||state.index!==i){stop();const a=clips[i],token=state.token;state.owner=polarState;state.index=i;const seek=()=>{if(token===state.token)try{a.currentTime=Math.min(q.voiceTime||0,Math.max(0,SOL_EPILOGUE_AUDIO[i].duration-.05));}catch(e){}};seek();a.onloadedmetadata=seek;a.onerror=()=>{if(token===state.token){state.error=true;state.pending=false;}};a.onended=()=>{if(token===state.token&&active()){capture();state.tail=.65;}};prepareJamesAcoustics(a);if(!state.muted)play();}
  const a=clips[state.index];if(!state.muted&&!state.blocked&&!state.error&&!state.pending&&a.paused&&!a.ended)play();button.textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';button.setAttribute('aria-pressed',String(!state.muted));status.textContent=state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE / CAPTIONS ACTIVE':state.muted?'VOICE MUTED / CAPTIONS ACTIVE':'RECORDED VOICE';
 }
 function tick(dt){sync();if(active()&&!state.muted&&!state.error&&state.tail>0){state.tail-=Math.min(.1,Math.max(0,dt));if(state.tail<=0){stop();nextSolEpilogue();}}}
 function lip(){const closed={jaw:0,width:1,round:0,teeth:0};if(!active()||state.muted||state.error||state.blocked)return closed;const a=clips[state.index];if(!a)return closed;const q=NVSolEpilogue.ensure(polarState),text=(q.stage==='hawthorne'?NVSolEpilogue.HAWTHORNE:NVSolEpilogue.STRANGER)[q.line];return janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),text);}
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted)stop();sync();}
 return{clips,state,index,active,capture,stop,play,sync,tick,lip,toggle};
})();
const epilogueVoiceButton=document.createElement('button');epilogueVoiceButton.id='epilogueRecordedVoice';epilogueVoiceButton.className='polar-button';epilogueVoiceButton.textContent='VOICE ON';epilogueVoiceButton.onclick=NVSolEpilogueVoice.toggle;$('#solEpilogue footer>div').prepend(epilogueVoiceButton);
const epilogueVoiceStatus=document.createElement('small');epilogueVoiceStatus.id='epilogueRecordedVoiceStatus';$('#solEpilogue footer').prepend(epilogueVoiceStatus);
const epilogueRecordedNext=nextSolEpilogue;nextSolEpilogue=()=>{if(!solEpilogueOpen||solEpiloguePaused)return;NVSolEpilogueVoice.stop();epilogueRecordedNext();NVSolEpilogueVoice.sync();};$('#solEpilogueNext').onclick=nextSolEpilogue;
let epilogueVoiceLast=performance.now();const epilogueVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{epilogueVoiceHUD();const now=performance.now();NVSolEpilogueVoice.tick(Math.min(.1,Math.max(0,(now-epilogueVoiceLast)/1000)));epilogueVoiceLast=now;};
const epilogueVoicePause=pausePolar;pausePolar=on=>{NVSolEpilogueVoice.stop();epilogueVoicePause(on);NVSolEpilogueVoice.sync();};
const epilogueVoiceSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVSolEpilogueVoice.capture();return epilogueVoiceSave(manual);};
const epilogueVoiceExit=exitPolar;exitPolar=()=>{NVSolEpilogueVoice.stop();epilogueVoiceExit();};$('#worldToMenu').onclick=()=>exitPolar();
