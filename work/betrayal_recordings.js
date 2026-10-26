const BETRAYAL_VOICES=__BETRAYAL_VOICES__;
const betrayalVoiceClips=BETRAYAL_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';a.volume=.95;return a;});
const betrayalVoice={token:0,index:-1,started:false,ended:false,blocked:false,error:false,muted:false,endAt:0};
function betrayalActive(){return !!polarState&&NVBetrayal.active(polarState);}
function currentBetrayalVoice(){return betrayalVoiceClips[betrayalVoice.index]||null;}
function captureBetrayalVoice(){const a=currentBetrayalVoice();if(polarState?.betrayalStage==='dialogue'&&betrayalVoice.index===polarState.betrayalIndex&&a&&Number.isFinite(a.currentTime))polarState.betrayalVoiceTime=a.currentTime;}
function stopBetrayalVoice(){captureBetrayalVoice();betrayalVoice.token++;betrayalVoiceClips.forEach(a=>a.pause());betrayalVoice.index=-1;betrayalVoice.started=false;betrayalVoice.ended=false;}
function playBetrayalVoice(){
  const g=betrayalVoice,a=currentBetrayalVoice(),token=g.token,state=polarState,index=g.index;if(!a||!gameActive||gamePaused||state?.betrayalStage!=='dialogue')return;
  prepareJamesAcoustics(a);resumeJamesAcoustics();a.volume=g.muted?0:.95;
  const valid=()=>token===g.token&&gameActive&&!gamePaused&&polarState===state&&state.betrayalStage==='dialogue'&&state.betrayalIndex===index;
  try{const promise=a.play();if(promise?.then)promise.then(()=>{if(!valid()){if(token===g.token)a.pause();return;}g.blocked=false;g.started=!a.paused&&!a.ended;}).catch(()=>{if(token===g.token){g.blocked=true;g.started=false;}});else if(valid()){g.blocked=false;g.started=!a.paused&&!a.ended;}}catch(e){g.blocked=true;g.started=false;}
}
function speakBetrayalLine(){
  stopBetrayalVoice();const s=polarState;if(!gameActive||gamePaused||s?.betrayalStage!=='dialogue')return;
  const g=betrayalVoice;g.index=s.betrayalIndex;g.ended=false;g.blocked=false;g.error=false;
  const a=currentBetrayalVoice(),token=g.token,time=s.betrayalVoiceTime;
  const seek=()=>{if(token!==g.token)return;const duration=Number.isFinite(a.duration)?a.duration:BETRAYAL_VOICES[g.index].duration;try{a.currentTime=Math.min(time,Math.max(0,duration-.001));}catch(e){}};
  a.onloadedmetadata=seek;a.onerror=()=>{if(token===g.token){g.error=true;g.started=false;g.blocked=false;}};seek();playBetrayalVoice();
}
function pauseBetrayalVoice(on){if(polarState?.betrayalStage!=='dialogue')return;captureBetrayalVoice();if(on){currentBetrayalVoice()?.pause();betrayalVoice.started=false;}else if(betrayalVoice.index!==polarState.betrayalIndex)speakBetrayalLine();else if(!betrayalVoice.error&&!currentBetrayalVoice()?.ended)playBetrayalVoice();}
function betrayalLipPose(){
  const g=betrayalVoice,a=currentBetrayalVoice(),closed={jaw:0,width:1,round:0,teeth:0};if(gamePaused||document.hidden||!gameActive||!a||a.paused||a.ended||g.error||g.blocked||g.muted)return closed;
  const entry=prepareJamesAcoustics(a),duration=Number.isFinite(a.duration)?a.duration:BETRAYAL_VOICES[g.index].duration;let energy=0,progress=a.currentTime/duration;
  if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const sample of entry.samples)sum+=((sample-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
  return energy<.075?closed:calculateJamesViseme(JAMES_BETRAYAL_QUOTES[g.index],progress,energy);
}
function tickBetrayalRecording(dt){const s=polarState,g=betrayalVoice;if(g.index!==s.betrayalIndex)speakBetrayalLine();s.betrayalLineTime+=dt;s.playTime+=dt;captureBetrayalVoice();const a=currentBetrayalVoice();g.started=!!a&&!a.paused&&!a.ended&&!g.error&&!g.blocked;if(a?.ended&&!g.ended){g.ended=true;g.endAt=s.betrayalLineTime;g.started=false;}if(g.ended&&s.betrayalLineTime>=Math.max(2,g.endAt+1.25)||g.error&&s.betrayalLineTime>=Math.max(2,BETRAYAL_VOICES[g.index].duration+1.25))nextBetrayalParagraph();}
