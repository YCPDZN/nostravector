const GREK_QUOTES=[
  'James Brown is not trustworthy. He aims to betray you when you get to the ferry.',
  'You see a guide beside you. I see a man leading you toward a trap.',
  'When you reach the water, watch his hands. Listen to what he refuses to tell you.',
  'Keep your supplies close. Do not surrender your suit, your power cells, or your way back.',
  'Remember this warning when dawn comes. At the ferry, trust your own eyes before you trust James Brown.'
];
const GREK_VOICES=__GREK_VOICES__;
const grekVoiceClips=GREK_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';a.volume=.95;return a;});
const grekSpeech={token:0,index:-1,started:false,ended:false,endedAt:0,blocked:false,error:false,muted:false,pose:{open:0,round:0},poseTime:0,render:null,renderFailed:false};
function currentGrekVoice(){return grekVoiceClips[grekSpeech.index]||null;}
function captureGrekVoice(){const a=currentGrekVoice();if(polarState?.dreamActive&&grekSpeech.index===polarState.dreamIndex&&a&&Number.isFinite(a.currentTime))polarState.dreamVoiceTime=a.currentTime;}
function stopGrekVoice(reset=true){captureGrekVoice();grekSpeech.token++;grekVoiceClips.forEach(a=>a.pause());grekSpeech.started=false;grekSpeech.pose={open:0,round:0};if(reset){grekSpeech.index=-1;grekSpeech.ended=false;grekSpeech.blocked=false;grekSpeech.error=false;}}
function playGrekVoice(){
  const g=grekSpeech,a=currentGrekVoice(),token=g.token;if(!a||!gameActive||gamePaused||!polarState?.dreamActive)return;
  prepareJamesAcoustics(a);resumeJamesAcoustics();a.volume=g.muted?0:.95;
  const valid=()=>token===g.token&&gameActive&&!gamePaused&&polarState?.dreamActive;
  try{const played=a.play();if(played?.then)played.then(()=>{if(!valid()){if(token===g.token)a.pause();return;}g.blocked=false;g.started=!a.paused&&!a.ended;}).catch(()=>{if(token===g.token){g.blocked=true;g.started=false;}});else if(valid()){g.blocked=false;g.started=!a.paused&&!a.ended;}}catch(e){g.blocked=true;g.started=false;}
}
function startGrekLine(){
  stopGrekVoice(false);const s=polarState;if(!gameActive||!s?.dreamActive||gamePaused)return;
  const g=grekSpeech;g.index=s.dreamIndex;g.ended=false;g.blocked=false;g.error=false;g.poseTime=s.dreamVoiceTime;
  const a=currentGrekVoice(),token=g.token,time=s.dreamVoiceTime;
  const seek=()=>{if(token!==g.token)return;const duration=Number.isFinite(a.duration)?a.duration:GREK_VOICES[g.index].duration;try{a.currentTime=Math.min(time,Math.max(0,duration-.001));}catch(e){}};
  a.onloadedmetadata=seek;a.onerror=()=>{if(token===g.token){g.error=true;g.started=false;g.blocked=false;}};
  seek();playGrekVoice();
}
function pauseGrekVoice(on){if(!polarState?.dreamActive)return;captureGrekVoice();if(on){currentGrekVoice()?.pause();grekSpeech.started=false;grekSpeech.pose={open:0,round:0};}else if(grekSpeech.index!==polarState.dreamIndex)startGrekLine();else if(!grekSpeech.error&&!currentGrekVoice()?.ended)playGrekVoice();}
function advanceGrekLine(){if(!gameActive||gamePaused||!polarState.dreamActive||polarState.dreamTime<4)return;stopGrekVoice();NVAntarctica.advanceDream(polarState);if(polarState.dreamActive)startGrekLine();else polarCanvas.focus();updatePolarHUD();}
function tickGrekDialogue(dt){
  if(grekSpeech.index!==polarState.dreamIndex)startGrekLine();
  NVAntarctica.dreamStep(polarState,dt,false);captureGrekVoice();
  const g=grekSpeech,s=polarState,a=currentGrekVoice();g.started=!!a&&!a.paused&&!a.ended&&!g.error&&!g.blocked;
  if(a?.ended&&!g.ended){g.ended=true;g.endedAt=s.dreamTime;g.started=false;}
  // Autoplay blocks wait for PLAY VOICE or an explicit NEXT; they never silently skip recordings.
  if((g.ended&&s.dreamTime>=Math.max(4,g.endedAt+1.25))||(g.error&&s.dreamTime>=Math.max(NVAntarctica.DREAM_SECONDS,GREK_VOICES[g.index].duration+1.25)))advanceGrekLine();
}
function grekLipPose(){
  const g=grekSpeech,a=currentGrekVoice();if(gamePaused||document.hidden||!gameActive||!a||a.paused||a.ended||g.blocked||g.error||g.muted){g.pose={open:0,round:0};return g.pose;}
  const entry=prepareJamesAcoustics(a),duration=Number.isFinite(a.duration)?a.duration:GREK_VOICES[g.index].duration;let energy=0,progress=a.currentTime/duration;
  if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}
  else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const q of entry.samples)sum+=((q-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
  if(energy<.075){g.pose={open:0,round:0};g.poseTime=a.currentTime;return g.pose;}
  // RMS follows the actual recording. Transcript progress estimates vowel shapes without phoneme marks.
  const shape=calculateJamesViseme(GREK_QUOTES[g.index],progress,energy),mix=Math.min(1,Math.max(.001,Math.abs(a.currentTime-g.poseTime))*24);g.poseTime=a.currentTime;
  g.pose.open+=(shape.jaw-g.pose.open)*mix;g.pose.round+=(shape.round-g.pose.round)*mix;return g.pose;
}
function updateGrekDream(){
  if(!polarState?.dreamActive)return;const g=grekSpeech,s=polarState;
  $('#dreamLine').textContent=GREK_QUOTES[s.dreamIndex];$('#dreamNumber').textContent=String(s.dreamIndex+1).padStart(2,'0')+' / 05 · THE STRANGER’S WARNING';
  $('#leaveDream').textContent=s.dreamIndex===4?'WAKE AT DAWN / ENTER ↗':'NEXT / ENTER ↗';$('#leaveDream').disabled=gamePaused||s.dreamTime<4;
  $('#grekVoice').textContent=g.blocked?'PLAY VOICE':g.muted?'ENABLE VOICE':'MUTE VOICE';$('#grekVoice').disabled=gamePaused||g.error;
  $('#grekVoiceStatus').textContent=g.error?'VOICE UNAVAILABLE / CAPTIONS ACTIVE':g.blocked?'RECORDING READY / CLICK PLAY VOICE':(g.muted?'VOICE MUTED / ':'RECORDED VOICE / ')+'GREK'+(s.dreamIndex+1);
  $('#dreamScene').dataset.line=String(s.dreamIndex+1);$('#dreamScene').dataset.speaking=String(g.started&&!gamePaused&&!g.muted&&!g.ended);
  if(!g.render&&!g.renderFailed){try{g.render=createGrekRenderer($('#grekCanvas'));$('#grekRenderStatus').textContent='';}catch(e){g.renderFailed=true;$('#grekRenderStatus').textContent='3D renderer unavailable: '+e.message;}}
  if(g.render)g.render(polarClock,grekLipPose(),gamePaused);
}
$('#grekVoice').onclick=()=>{if(!gameActive||gamePaused||!polarState.dreamActive||grekSpeech.error)return;if(grekSpeech.blocked){grekSpeech.muted=false;playGrekVoice();}else{grekSpeech.muted=!grekSpeech.muted;currentGrekVoice().volume=grekSpeech.muted?0:.95;}updateGrekDream();};
