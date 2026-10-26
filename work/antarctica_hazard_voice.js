const HAZARD_VOICES=__HAZARD_VOICES__;
const hazardVoiceClips=HAZARD_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';return a;});
let hazardVoiceIndex=-1,hazardVoiceToken=0,hazardVoiceBlocked=false,hazardVoiceError=false;
function currentHazardVoice(){return hazardVoiceClips[hazardVoiceIndex]||null;}
function captureHazardVoice(){const a=currentHazardVoice();if(a&&polarState&&hazardModalActive())polarState.hazardVoiceTime=a.currentTime||0;}
function stopHazardNarration(){hazardVoiceToken++;hazardVoiceClips.forEach(a=>a.pause());hazardVoiceIndex=-1;hazardVoiceBlocked=false;hazardVoiceError=false;$('#enableHazardVoice').hidden=true;$('#enableSuitRecoveryVoice').hidden=true;$('#enableWeatherVoice').hidden=true;}
function playHazardVoice(){
  const a=currentHazardVoice(),token=hazardVoiceToken;if(!a||!hazardTutorial.voiceOn||gamePaused||!gameActive||hazardVoiceError)return;
  const result=a.play();if(result?.then)result.then(()=>{if(token!==hazardVoiceToken)return;hazardVoiceBlocked=false;$('#enableHazardVoice').hidden=true;$('#enableSuitRecoveryVoice').hidden=true;$('#enableWeatherVoice').hidden=true;}).catch(()=>{if(token!==hazardVoiceToken)return;hazardVoiceBlocked=true;$(hazardVoiceIndex===6?'#enableSuitRecoveryVoice':!hazardModalActive()?'#enableWeatherVoice':'#enableHazardVoice').hidden=false;$('#hazardVoiceStatus').textContent='ENABLE AUDIO / CAPTIONS ACTIVE';});
}
function speakHazardText(text,suit=false){
  stopHazardNarration();hazardVoiceIndex=suit?0:polarState.hazardLessonIndex+1;
  const a=currentHazardVoice(),token=hazardVoiceToken,volume=Number($('#narratorVolume').value);
  a.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.85;
  const seek=()=>{if(token!==hazardVoiceToken)return;try{const duration=Number.isFinite(a.duration)?a.duration:HAZARD_VOICES[hazardVoiceIndex].duration;a.currentTime=Math.min(polarState.hazardVoiceTime||0,Math.max(0,duration-.05));}catch(e){}};
  a.onloadedmetadata=seek;a.onerror=()=>{if(token!==hazardVoiceToken)return;hazardVoiceError=true;hazardVoiceBlocked=false;$('#enableHazardVoice').hidden=true;$('#hazardVoiceStatus').textContent='RECORDING UNAVAILABLE / CAPTIONS ACTIVE';};
  a.onended=()=>{if(token===hazardVoiceToken)captureHazardVoice();};seek();
  $('#hazardVoiceStatus').textContent=hazardTutorial.voiceOn?'RECORDED VOICE / '+(suit?'SUIT':'NARRATOR'+(polarState.hazardLessonIndex+1)):'AUDIO OFF / CAPTIONS ACTIVE';
  playHazardVoice();
}
function pauseHazardNarration(on){captureHazardVoice();const a=currentHazardVoice();if(!a)return;if(on)a.pause();else if(!a.ended)playHazardVoice();}
function playSuitRecovery(){
  stopHazardNarration();hazardVoiceIndex=6;const a=currentHazardVoice(),token=hazardVoiceToken,volume=Number($('#narratorVolume').value);
  a.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.85;a.currentTime=0;
  a.onerror=()=>{if(token===hazardVoiceToken){hazardVoiceError=true;$('#enableSuitRecoveryVoice').hidden=true;$('#enableWeatherVoice').hidden=true;}};
  playHazardVoice();
}
$('#enableHazardVoice').onclick=()=>playHazardVoice();
$('#enableSuitRecoveryVoice').onclick=()=>playHazardVoice();
$('#narratorVolume').addEventListener('input',e=>hazardVoiceClips.forEach(a=>a.volume=Number(e.target.value)));

$('#enableWeatherVoice').onclick=()=>playHazardVoice();
