const SUIT_WEATHER_WARNING='WEATHER WARNING! SUPER BLIZZARD INCOMING!';
const HAZARD_LESSONS=[
  {title:'WEATHER CAN KILL',text:'Your suit has detected a super blizzard. Visibility will fall, and staying outside will drain your suit’s heat.'},
  {title:'WATCH YOUR SUIT HEAT',text:'Watch your suit heat gauge. The station and the rover protect you from the cold. At zero heat, your suit performs an emergency recovery at the station.'},
  {title:'SAVE YOUR STAMINA',text:'Sprinting drains stamina. Use it for short escapes, then walk to recover. Never exhaust yourself far from shelter.'},
  {title:'FIND YOUR WAY IN A WHITEOUT',text:'When the whiteout hides your path, follow the station beacon or open your field map with M. Landmarks may disappear; the beacon keeps pointing home.'},
  {title:'SHELTER IS SURVIVAL',text:'Get inside the station and let your heat recover. Stay with James while the storm passes. This super blizzard lasts five minutes of active game time.'}
];
const hazardTutorial={voiceOn:true,voiceToken:0,clock:0};
function hazardModalActive(){return !!polarState&&['warning','lesson'].includes(polarState.hazardStage);}
function suitWarningBeep(){
  try{const ctx=jamesAudioContext;if(!ctx?.createOscillator)return;resumeJamesAcoustics();for(let i=0;i<3;i++){const o=ctx.createOscillator(),g=ctx.createGain(),start=ctx.currentTime+i*.3;o.type='sine';o.frequency.value=i===1?740:520;g.gain.setValueAtTime(.025,start);g.gain.exponentialRampToValueAtTime(.001,start+.18);o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+.19);}}catch(e){}
}
function showHazardTutorial(){
  const warning=polarState.hazardStage==='warning',lesson=HAZARD_LESSONS[polarState.hazardLessonIndex];hazardTutorial.clock=0;
  $('#hazardTutorial').hidden=false;$('#hazardTutorial').dataset.stage=warning?'warning':'lesson';
  $('#hazardSpeaker').textContent=warning?'SUIT / WEATHER ALERT':'NARRATOR / SURVIVAL GUIDE';
  $('#hazardStep').textContent=warning?'PRIORITY ONE':String(polarState.hazardLessonIndex+1).padStart(2,'0')+' / 05';
  $('#hazardTitle').textContent=warning?SUIT_WEATHER_WARNING:lesson.title;
  $('#hazardLine').textContent=warning?'Extreme conditions approaching. Seek shelter immediately.':lesson.text;
  $('#nextHazardLesson').textContent=warning?'LEARN ABOUT HAZARDS / ENTER':polarState.hazardLessonIndex===4?'TAKE SHELTER / ENTER':'NEXT / ENTER';
  speakHazardText(warning?SUIT_WEATHER_WARNING:lesson.text,warning);updatePolarHUD();
}
function beginHazardTutorial(){
  if(!gameActive||!polarState.stationDialogueDone||jamesConversation.active)return;
  if(polarState.hazardStage==='complete')return;
  if(polarState.hazardStage==='unseen'){polarState.hazardStage='warning';polarState.superBlizzard=true;polarState.stormRemaining=300;polarState.hazardLessonIndex=0;suitWarningBeep();}
  stopJamesVoice();polarKeys.clear();polarAutoWalk=false;polarSprint=false;polarPoseSpeed=0;jamesPoseSpeed=0;$('#jamesCarDialogue').hidden=true;showHazardTutorial();
}
function advanceHazardLesson(){
  if(!gameActive||gamePaused||!hazardModalActive())return;
  if(polarState.hazardStage==='warning'){polarState.hazardVoiceTime=0;polarState.hazardStage='lesson';polarState.hazardLessonIndex=0;}
  else if(polarState.hazardLessonIndex<4){polarState.hazardVoiceTime=0;polarState.hazardLessonIndex++;}
  else{polarState.hazardStage='complete';polarState.hazardVoiceTime=0;stopHazardNarration();$('#hazardTutorial').hidden=true;polarKeys.clear();polarCanvas.focus();updatePolarHUD();return;}
  showHazardTutorial();
}
function updateHazardHUD(){
  const s=polarState;if(!s)return;const taught=s.hazardStage==='complete';$('#suitHeat').hidden=!taught;$('#weatherStatus').hidden=!taught;
  $('#suitHeatBar').value=s.suitHeat;$('#suitHeatNumber').textContent=Math.round(s.suitHeat)+'%';$('#suitHeatBar').classList.toggle('cold',s.suitHeat<25);
  const safe=NVAntarctica.inShelter(s),seconds=Math.ceil(s.stormRemaining),clearSeconds=Math.ceil(s.nextBlizzardRemaining);
  $('#weatherStatus').textContent=s.superBlizzard?'SUPER BLIZZARD / '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' / '+(safe?'SHELTERED':s.car?.driving?'ROVER PROTECTION':'EXPOSED'):'CLEAR WINDOW / NEXT BLIZZARD '+Math.floor(clearSeconds/60)+':'+String(clearSeconds%60).padStart(2,'0');
  polarScreen.dataset.weather=s.superBlizzard?'super-blizzard':'normal';polarScreen.dataset.suitHeat=s.suitHeat.toFixed(2);
}
function stepPolarHazards(dt){
  const cycle=polarState.blizzardCycle;
  if(NVAntarctica.hazardStep(polarState,dt)){polarKeys.clear();polarAutoWalk=false;polarSprint=false;polarTrail=[];polarFootprints=[];polarPhase=0;jamesPhase=0;polarPoseSpeed=0;jamesPoseSpeed=0;polarState.cameraYaw=0;$('#coldRecovery').hidden=false;playSuitRecovery();}
  if(polarState.blizzardCycle>cycle){suitWarningBeep();polarState.hazardVoiceTime=0;speakHazardText(SUIT_WEATHER_WARNING,true);stormAlertUntil=polarClock+9;$('#stormAlert').hidden=false;}
  if(NVAntarctica.inShelter(polarState)&&polarState.suitHeat>45)$('#coldRecovery').hidden=true;
}
$('#nextHazardLesson').onclick=advanceHazardLesson;
$('#hazardNarration').onclick=()=>{captureHazardVoice();hazardTutorial.voiceOn=!hazardTutorial.voiceOn;$('#hazardNarration').textContent='NARRATION / '+(hazardTutorial.voiceOn?'ON':'OFF');$('#hazardNarration').setAttribute('aria-pressed',String(hazardTutorial.voiceOn));if(hazardModalActive())showHazardTutorial();};
