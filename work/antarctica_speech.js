// Acoustic jaw timing comes from each recording; visemes are approximate without phoneme marks.
let jamesAudioContext=null;
const jamesAcoustics=new WeakMap();
function prepareJamesAcoustics(a){
  if(jamesAcoustics.has(a))return jamesAcoustics.get(a);
  const entry={analyser:null,envelope:null};jamesAcoustics.set(a,entry);
  try{
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return entry;
    jamesAudioContext=jamesAudioContext||new AudioContextClass();
    const source=jamesAudioContext.createMediaElementSource(a),analyser=jamesAudioContext.createAnalyser();
    analyser.fftSize=1024;source.connect(analyser);analyser.connect(jamesAudioContext.destination);
    entry.analyser=analyser;entry.samples=new Uint8Array(analyser.fftSize);
    const encoded=a.src.split(',')[1],bytes=Uint8Array.from(atob(encoded),q=>q.charCodeAt(0));
    jamesAudioContext.decodeAudioData(bytes.buffer).then(buffer=>{
      const hop=Math.max(1,Math.round(buffer.sampleRate*.01)),length=Math.ceil(buffer.length/hop),rms=new Float32Array(length),spoken=new Float32Array(length);let peak=.001,total=0;
      for(let i=0;i<length;i++){let sum=0,count=0;for(let channel=0;channel<buffer.numberOfChannels;channel++){const data=buffer.getChannelData(channel);for(let j=i*hop;j<Math.min(data.length,(i+1)*hop);j++){sum+=data[j]*data[j];count++;}}rms[i]=Math.sqrt(sum/Math.max(1,count));peak=Math.max(peak,rms[i]);}
      for(let i=0;i<length;i++){rms[i]=Math.min(1,rms[i]/(peak*.65));total+=rms[i]>.075?1:0;spoken[i]=total;}
      for(let i=0;i<length;i++)spoken[i]/=Math.max(1,total);
      entry.envelope={rms,spoken,hopSeconds:hop/buffer.sampleRate};
    }).catch(()=>{});
  }catch(e){/* Captions and playback still work on browsers without Web Audio. */}
  return entry;
}
function resumeJamesAcoustics(){if(jamesAudioContext?.state==='suspended')jamesAudioContext.resume().catch(()=>{});}
function calculateJamesViseme(text,progress,energy){
  const position=Math.min(Math.max(0,text.length-1),Math.floor(Math.max(0,Math.min(.999,progress))*text.length)),letter=text[position]?.toLowerCase()||' ',closed=/[mbp\s.,!?…]/.test(letter),round=/[ouw]/.test(letter),wide=/[eiyfszv]/.test(letter);
  return{jaw:closed?0:Math.max(0,Math.min(1,energy))*(wide?.58:.9),width:round?.70:wide?1.13:1,round:round?1:0,teeth:wide?1:0};
}
let jamesLipPose={jaw:0,width:1,round:0,teeth:0};
function updateJamesLipPose(dt){
  let target={jaw:0,width:1,round:0,teeth:0};
  if(gameActive&&!gamePaused&&!document.hidden){
    const a=currentJamesVoice();
    if(a&&!a.paused&&!a.ended&&!jamesVoiceError){
      const entry=prepareJamesAcoustics(a),duration=Number.isFinite(a.duration)?a.duration:JAMES_VOICES[jamesVoiceIndex].duration;
      let progress=a.currentTime/duration,energy=.4+.2*Math.sin(a.currentTime*26);
      if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}
      else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const q of entry.samples)sum+=((q-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
      const text=jamesVoiceKind==='intro'?JAMES_QUOTES[polarState.introIndex]:jamesVoiceKind==='talk'?JAMES_QUOTES[jamesVoiceIndex]:jamesVoiceKind==='station'?JAMES_STATION_QUOTES[jamesVoiceIndex-6]:jamesVoiceKind==='supplies'?JAMES_SUPPLY_QUOTES[jamesVoiceIndex-16]:jamesVoiceKind==='ferry'?JAMES_FERRY_QUOTES[jamesVoiceIndex-26]:JAMES_CAR_QUOTE;
      target=calculateJamesViseme(text,progress,energy);
    }else if(jamesConversation.active&&jamesVoiceError&&!jamesConversation.speechDone){
      const text=conversationLines()[jamesConversation.index],wordLength=jamesConversation.charIndex>=0?(text.slice(jamesConversation.charIndex).match(/^\S+/)?.[0].length||1):1;
      const character=jamesConversation.charIndex+Math.min(wordLength-.01,Math.max(0,jamesConversation.clock-jamesConversation.boundaryClock)*15),progress=jamesConversation.charIndex>=0?character/Math.max(1,text.length):jamesConversation.clock/conversationDuration(text);
      target=calculateJamesViseme(text,progress,.5+.3*Math.sin(jamesConversation.clock*25));
    }
  }
  const mix=gamePaused||document.hidden||!gameActive?1:Math.min(1,Math.max(.001,dt)*20);
  for(const key of Object.keys(target))jamesLipPose[key]+=(target[key]-jamesLipPose[key])*mix;
  return jamesLipPose;
}

const JAMES_STATION_QUOTES=[
  "There it is. Walls, a roof, and a chance to see another sunrise. We made it.",
  "Get inside and keep your suit sealed. A warm light doesn’t mean this place is safe yet.",
  "Why stop at Earth when we could explore the entirety of the Sol System?",
  "Imagine it: the red valleys of Mars, the ice beneath Europa, Saturn rising beyond the windows of our ship.",
  "Out there, every world has a story. I’d like us to live long enough to hear a few.",
  "But we have to survive on Earth before we can leave this frozen wasteland.",
  "First, we check the power. Then we find heat, clean water, and anything we can use to call for help.",
  "That storm is getting worse. Going back out now would throw away everything we fought to reach.",
  "We need to stay in this shelter. Rest, get your strength back, and let the blizzard pass.",
  "One step at a time, Wanderer. Tonight, we survive Antarctica. Someday, we reach for the rest of the Sol System."
];
const JAMES_SUPPLY_QUOTES=[
  "Have you thought about gathering some supplies before the next blizzard? We have a clear window. Let’s use it.",
  "The nearest supply depot is toward the coast, near the edge of Antarctica. It’s our best chance of finding what we need.",
  "Open your map. All seven continents are there, but look right at the bottom. That’s Antarctica. That’s where we are.",
  "The world map shows our place on Earth. Switch to the local sector map to follow the route to the coastal depot.",
  "We’re looking for food, sealed water, and spare power cells. Warm walls won’t keep us alive if we run out of supplies.",
  "Keep your suit sealed. Clear skies don’t make this place forgiving, and the next storm is already on its way.",
  "A blizzard starts every ten minutes. Each one lasts five. Watch the weather countdown and plan the return journey.",
  "Take the rover if you want to save your strength. I can drive, or I can ride beside you. Your call.",
  "When we reach the depot, gather what we can carry. Don’t wander off toward the sea just because the horizon looks clear.",
  "Then we come back to this station together. Supplies first, shelter before the whiteout. I’m staying with you."
];
const JAMES_FERRY_QUOTES=[
  "You know what? I want out of Antarctica.",
  "We’ll find a ferry and get ourselves to Africa.",
  "The coast is our way out. Once this storm passes, we’ll look for a ferry heading north across the Southern Ocean.",
  "We’ll need food, water, and charged power cells before we go. I’m not trading one survival problem for another.",
  "For now, stay in the shelter. When the whiteout clears, we move together—Antarctica behind us, Africa ahead."
];
const jamesConversation={active:false,kind:'station',index:0,clock:0,speechDone:false,charIndex:-1,boundaryClock:0,token:0};
let jamesSystemVoice=true;
function conversationLines(){return jamesConversation.kind==='ferry'?JAMES_FERRY_QUOTES:jamesConversation.kind==='supplies'?JAMES_SUPPLY_QUOTES:jamesConversation.kind==='travel'?[JAMES_QUOTES[4]]:JAMES_STATION_QUOTES;}
function conversationDuration(text){return Math.max(5,text.length/15+1.4);}
function cancelJamesConversationSpeech(){jamesConversation.token++;if(window.speechSynthesis)window.speechSynthesis.cancel();}
function showJamesConversationLine(time=0){
  cancelJamesConversationSpeech();jamesConversation.clock=0;jamesConversation.charIndex=-1;jamesConversation.speechDone=false;jamesConversation.endHold=0;
  const text=conversationLines()[jamesConversation.index],token=jamesConversation.token;
  $('#conversationLine').textContent=text;$('#conversationNumber').textContent=String(jamesConversation.index+1).padStart(2,'0')+' / '+String(conversationLines().length).padStart(2,'0');
  $('#nextConversation').textContent=jamesConversation.index===conversationLines().length-1?(jamesConversation.kind==='station'?'CONTINUE / ENTER':'RETURN TO EXPEDITION / ENTER'):'NEXT / ENTER';
  if(jamesConversation.kind==='ferry'){$('#systemJamesVoice').hidden=true;$('#conversationVoiceLabel').textContent='RECORDED VOICE / JBAA'+(jamesConversation.index+1);startJamesVoice('ferry',time,26+jamesConversation.index);return;}
  $('#systemJamesVoice').hidden=true;$('#conversationVoiceLabel').textContent='RECORDED VOICE / '+(jamesConversation.kind==='travel'?'JB5':jamesConversation.kind==='supplies'?(jamesConversation.index===0?'JBW':'JBW'+jamesConversation.index):'JBPA'+(jamesConversation.index+1));
  if(jamesConversation.kind==='supplies')startJamesVoice('supplies',time,16+jamesConversation.index);else if(jamesConversation.kind==='travel')startJamesVoice('talk',0,4);else startJamesVoice('station',time,6+jamesConversation.index);
}
function beginJamesConversation(kind='station'){
  if(!gameActive||gamePaused||betrayalActive()||polarState.jamesGone||!polarState.jamesIntroductionDone||(polarState.car?.driving&&!['supplies','ferry'].includes(kind))||hazardModalActive())return;
  stopJamesVoice();polarState.jamesCarQuoteRemaining=0;$('#jamesCarDialogue').hidden=true;
  jamesConversation.active=true;jamesConversation.kind=kind;jamesConversation.index=kind==='ferry'&&polarState.ferryDialogueActive?polarState.ferryDialogueIndex:kind==='station'?polarState.stationDialogueIndex:kind==='supplies'&&polarState.supplyDialogueActive?polarState.supplyDialogueIndex:0;
  if(kind==='ferry'){polarState.ferryDialogueActive=true;polarState.ferryDialoguePending=false;polarState.ferryDialogueIndex=jamesConversation.index;stopHazardNarration();}
  if(kind==='station')polarState.stationDialogueActive=true;if(kind==='supplies'){polarState.supplyDialogueActive=true;polarState.supplyDialoguePending=false;polarState.supplyDialogueIndex=jamesConversation.index;stopHazardNarration();}
  polarKeys.clear();polarAutoWalk=false;polarSprint=false;polarCameraDrag=false;polarPoseSpeed=0;jamesPoseSpeed=0;polarTrail=[];
  polarState.james.yaw=Math.atan2(polarState.x-polarState.james.x,polarState.z-polarState.james.z);
  $('#jamesConversation').hidden=false;$('#stationMessage').hidden=true;showJamesConversationLine(kind==='station'?polarState.jamesStationVoiceTime:kind==='supplies'?polarState.jamesSupplyVoiceTime:kind==='ferry'?polarState.jamesFerryVoiceTime:0);updatePolarHUD();
}
function finishJamesConversation(){
  if(jamesConversation.kind==='ferry'){polarState.ferryDialogueDone=true;polarState.ferryDialogueActive=false;polarState.ferryDialoguePending=false;polarState.ferryDialogueIndex=0;polarState.ferryPlanKnown=true;polarState.jamesFerryVoiceTime=0;}
  if(jamesConversation.kind==='station'){polarState.stationDialogueDone=true;polarState.stationDialogueActive=false;polarState.stationDialogueIndex=9;polarState.jamesStationVoiceTime=0;}
  if(jamesConversation.kind==='supplies'){polarState.supplyDialogueDone=true;polarState.supplyDialogueActive=false;polarState.supplyDialoguePending=false;polarState.supplyDialogueIndex=0;polarState.jamesSupplyVoiceTime=0;polarState.suppliesPlanKnown=true;}
  jamesConversation.active=false;cancelJamesConversationSpeech();stopJamesVoice();$('#jamesConversation').hidden=true;polarKeys.clear();polarCanvas.focus();updatePolarHUD();if(jamesConversation.kind==='station')beginHazardTutorial();
}
function advanceJamesConversation(){
  if(!gameActive||gamePaused||!jamesConversation.active)return;
  stopJamesVoice();if(jamesConversation.kind==='ferry')polarState.jamesFerryVoiceTime=0;if(jamesConversation.kind==='station')polarState.jamesStationVoiceTime=0;if(jamesConversation.kind==='supplies')polarState.jamesSupplyVoiceTime=0;if(jamesConversation.index>=conversationLines().length-1){finishJamesConversation();return;}
  jamesConversation.index++;if(jamesConversation.kind==='ferry')polarState.ferryDialogueIndex=jamesConversation.index;if(jamesConversation.kind==='station')polarState.stationDialogueIndex=jamesConversation.index;if(jamesConversation.kind==='supplies')polarState.supplyDialogueIndex=jamesConversation.index;
  showJamesConversationLine();
}
function tickJamesConversation(dt){
  const q=jamesConversation;q.clock+=dt;
  captureJamesVoice();if(currentJamesVoice()?.ended||(jamesVoiceError&&q.clock>=conversationDuration(conversationLines()[q.index])))q.speechDone=true;
  // The recorded departure scene flows into the bed objective after line five.
  if(q.kind==='ferry'&&q.speechDone){q.endHold+=dt;if(q.endHold>=1.1)advanceJamesConversation();}
  // Other conversations retain their caption until the player advances.
}
function pauseJamesConversation(on){if(jamesConversation.active&&window.speechSynthesis){if(on)window.speechSynthesis.pause();else window.speechSynthesis.resume();}}
function talkToJames(){if(!gameActive||gamePaused||polarState.bedSleeping||jamesConversation.active||hazardModalActive()||polarState.car?.driving||Math.hypot(polarState.x-polarState.james.x,polarState.z-polarState.james.z)>6)return;beginJamesConversation(polarState.ferryPlanKnown?'ferry':polarState.suppliesPlanKnown?'supplies':polarState.stationFound?(polarState.stationDialogueDone?'revisit':'station'):'travel');}
$('#talkJames').onclick=talkToJames;$('#nextConversation').onclick=advanceJamesConversation;
$('#systemJamesVoice').onclick=()=>{jamesSystemVoice=!jamesSystemVoice;$('#systemJamesVoice').textContent='SYSTEM VOICE / '+(jamesSystemVoice?'ON':'OFF');$('#systemJamesVoice').setAttribute('aria-pressed',String(jamesSystemVoice));if(jamesConversation.active)showJamesConversationLine();};
