const BC_COMBAT_RECORDINGS=__BC_COMBAT_RECORDINGS__;
const NVBCVoice=(()=>{
 const clips=new Map(BC_COMBAT_RECORDINGS.map(r=>[r.key,{...r,a:Object.assign(new Audio(r.source),{preload:'none',volume:.95})}]));
 let line=null,current=null,world=null,token=0,blocked=false,error=false,pending=false;
 function context(){
  // Combat speech follows the active squad, not the wildlife/exploration HUD.
  // In particular, Archiostal is walkable while the ship remains in flight mode.
  if(!gameActive||gamePaused||document.hidden||!polarState||!NVBCCombat.playable(polarState)||khazglarCutsceneActive()||imperiaArrivalActive()||jamesConversation.active||
   (typeof archamusConversation!=='undefined'&&archamusConversation)||(typeof erisConversation!=='undefined'&&erisConversation))return null;
  const c=NVBCCombat.state(polarState).caption,crew=typeof NVCombatSquad!=='undefined'?NVCombatSquad.crew(polarState):NVCustomCrew.followers(polarState);
  return c&&crew.some(n=>n.id===c.npcId)?c:null;
 }
 function suspend(){token++;pending=false;if(current){if(line)line.voiceTime=current.a.currentTime||0;current.a.pause();}}
 function stop(){suspend();line=null;current=null;world=null;blocked=false;error=false;}
 function play(){if(!current||!line||context()!==line||pending||error||!current.a.paused||current.a.ended)return;const r=current,c=line,attempt=++token;pending=true;
  try{Promise.resolve(r.a.play()).then(()=>{if(attempt!==token){if(current!==r||context()!==line)r.a.pause();return;}pending=false;blocked=false;if(context()!==c)suspend();}).catch(()=>{if(attempt===token){pending=false;blocked=true;}});}catch(e){pending=false;blocked=true;}
 }
 function sync(){const c=context();if(!c){if(current&&!current.a.paused||pending)suspend();return;}
  if(c!==line||world!==polarState){suspend();line=c;world=polarState;current=clips.get(c.voiceKey)||null;blocked=false;error=false;if(!current)return;const r=current;try{r.a.currentTime=Math.max(0,Math.min(c.voiceTime||0,r.duration-.02));}catch(e){}r.a.onloadedmetadata=()=>{if(line===c&&current===r&&c.voiceTime>0&&r.a.currentTime<c.voiceTime)r.a.currentTime=Math.min(c.voiceTime,r.duration-.02);};r.a.onended=()=>{if(line===c&&current===r){c.voiceTime=r.duration;c.time=Math.min(c.time,.4);}};r.a.onerror=()=>{if(line===c&&current===r){error=true;pending=false;}};
  }
  if(!current)return;if(!blocked)play();if(!error&&!blocked&&!current.a.ended){const remaining=current.duration-(current.a.currentTime||0);c.time=Math.max(c.time,remaining+.4);}
 }
 const speaking=()=>!!current&&context()===line&&!current.a.paused&&!current.a.ended;
 const status=()=>({key:current?.key||'',blocked,error,pending,time:current?.a.currentTime||0,paused:current?.a.paused??true});
 return{sync,suspend,stop,speaking,status,clips,retry(){if(blocked&&context()===line){blocked=false;play();}}};
})();
const bcVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{bcVoiceHUD();NVBCVoice.sync();};
const bcVoicePause=pausePolar;pausePolar=on=>{if(on)NVBCVoice.suspend();const result=bcVoicePause(on);if(!on)NVBCVoice.sync();return result;};
const bcVoiceExit=exitPolar;exitPolar=()=>{NVBCVoice.stop();return bcVoiceExit();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)NVBCVoice.suspend();else NVBCVoice.sync();});
document.addEventListener('pointerdown',()=>NVBCVoice.retry());
