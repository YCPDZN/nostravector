const ORION_VOICES=__ORION_VOICES__;
const orionVoiceClips=ORION_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';a.volume=.95;return a;});
const orionVoice={token:0,index:-1,blocked:false,error:false,muted:false,ended:false,tail:0};
function currentOrionVoice(){return orionVoiceClips[orionVoice.index]||null;}
function captureOrionVoice(){const a=currentOrionVoice();if(orionActive()&&orionVoice.index===polarState.friendDialogueIndex&&a&&Number.isFinite(a.currentTime))polarState.friendVoiceTime=a.currentTime;}
function stopOrionVoice(){captureOrionVoice();orionVoice.token++;orionVoiceClips.forEach(a=>a.pause());orionVoice.index=-1;orionVoice.ended=false;orionVoice.tail=0;}
function playOrionVoice(){
  const a=currentOrionVoice(),g=orionVoice,token=g.token,state=polarState,index=g.index;if(!a||!gameActive||gamePaused||!orionActive())return;
  prepareJamesAcoustics(a);resumeJamesAcoustics();a.volume=g.muted?0:.95;
  const valid=()=>token===g.token&&gameActive&&!gamePaused&&polarState===state&&state.friendDialogueActive&&state.friendDialogueIndex===index;
  try{const promise=a.play();if(promise?.then)promise.then(()=>{if(!valid()){if(token===g.token)a.pause();return;}g.blocked=false;}).catch(()=>{if(token===g.token)g.blocked=true;});else if(valid())g.blocked=false;}catch(e){g.blocked=true;}
}
function startOrionVoice(){
  stopOrionVoice();if(!gameActive||gamePaused||!orionActive())return;const s=polarState,g=orionVoice;
  g.index=s.friendDialogueIndex;g.blocked=false;g.error=false;g.ended=false;g.tail=0;
  const a=currentOrionVoice(),token=g.token,time=s.friendVoiceTime;
  const seek=()=>{if(token!==g.token)return;const duration=Number.isFinite(a.duration)?a.duration:ORION_VOICES[g.index].duration;try{a.currentTime=Math.min(time,Math.max(0,duration-.001));}catch(e){}};
  a.onloadedmetadata=seek;a.onerror=()=>{if(token===g.token){g.error=true;g.blocked=false;}};seek();playOrionVoice();
}
function pauseOrionVoice(on){if(!orionActive())return;captureOrionVoice();if(on)currentOrionVoice()?.pause();else if(orionVoice.index!==polarState.friendDialogueIndex)startOrionVoice();else if(!orionVoice.error&&!currentOrionVoice()?.ended)playOrionVoice();}
function orionLipPose(){
  const a=currentOrionVoice(),g=orionVoice,closed={jaw:0,width:1,round:0,teeth:0};if(!gameActive||gamePaused||document.hidden||!orionActive()||!a||a.paused||a.ended||g.blocked||g.error||g.muted)return closed;
  const entry=prepareJamesAcoustics(a),duration=Number.isFinite(a.duration)?a.duration:ORION_VOICES[g.index].duration;let energy=0,progress=a.currentTime/duration;
  if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const sample of entry.samples)sum+=((sample-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
  return energy<.075?closed:calculateJamesViseme(NVAfrica.ORION_QUOTES[g.index],progress,energy);
}
function tickOrionRecording(dt){
  const s=polarState,g=orionVoice;if(g.index!==s.friendDialogueIndex)startOrionVoice();NVAfrica.friendDialogueStep(s,dt);captureOrionVoice();const a=currentOrionVoice();
  if(a?.ended){g.ended=true;g.tail+=dt;}
  if(g.ended&&g.tail>=1.1||g.error&&s.friendDialogueTime>=ORION_VOICES[g.index].duration+1.1)advanceOrionDialogue();
}
function updateOrionVoiceHUD(){
  const a=currentOrionVoice(),g=orionVoice;$('#enableOrionVoice').hidden=!g.blocked||g.error;$('#muteOrionVoice').textContent=g.muted?'VOICE OFF':'VOICE ON';$('#muteOrionVoice').setAttribute('aria-pressed',String(g.muted));
  $('#orionVoiceStatus').textContent=g.error?'VOICE UNAVAILABLE / CAPTIONS ACTIVE':g.blocked?'CLICK PLAY VOICE':g.muted?'CAPTIONS / VOICE MUTED':'RECORDED VOICE / OM'+(polarState.friendDialogueIndex+1);
  $('#orionDialogue').dataset.voiceTime=(a?.currentTime||0).toFixed(3);$('#orionDialogue').dataset.speaking=String(orionLipPose().jaw>0);
}
$('#enableOrionVoice').onclick=playOrionVoice;
$('#muteOrionVoice').onclick=()=>{orionVoice.muted=!orionVoice.muted;const a=currentOrionVoice();if(a)a.volume=orionVoice.muted?0:.95;updateOrionVoiceHUD();};
