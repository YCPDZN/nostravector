const GOVERNOR_RECORDINGS=__GOVERNOR_RECORDINGS__;
const NVGovernorVoice=(()=>{
 const clips=new Map(GOVERNOR_RECORDINGS.map(r=>[r.key,{...r,a:null}]));
 let ctx=null,current=null,world=null,token=0,pendingPlay=false,blocked=false,error=false,muted=false;
 function context(){if(!gameActive||!polarState||!governorPanelOpen||governorPanel.hidden||governorConversation.hidden||document.hidden||!$('#worldPauseSheet').hidden)return null;
  const body=$('#governorWorld').value,c=NVGovernorDialogue.available(polarState,body);if(!c||!NVGovernorDialogue.current(polarState,body))return null;const q=NVGovernorDialogue.ensure(c),p=q.pending,profile=NVGovernorDialogue.profile(polarState,c);
  const keys=profile==='custom-species'?['custom-species:'+p.id,'custom-english:'+p.id]:[profile+':'+p.id];
  // Pending messages saved before these recordings existed were caption-only.
  // Resume them once, while preserving messages whose audio actually finished.
  if(['croxian','malia','williams','tyrotaronus'].includes(profile)&&clips.has(keys[0])&&p.voiceDone&&!p.voiceFinished?.[0])Object.assign(p,{voiceDone:false,voicePart:0,voiceTime:0});
  return{body,p,q,language:profile==='custom-species'?(q.voiceLanguage||'both'):'both',keys:keys.filter(key=>clips.has(key))};
 }
 function audio(r){if(!r.a)r.a=Object.assign(new Audio(r.source),{preload:'none',volume:.95});return r.a;}
 function capture(){if(ctx&&current?.a&&!ctx.p.voiceDone){ctx.p.voiceTime=Math.max(0,Math.min(current.duration,current.a.currentTime||0));(ctx.p.voiceTimes||(ctx.p.voiceTimes=[0,0]))[ctx.p.voicePart||0]=ctx.p.voiceTime;}}
 function suspend(){capture();token++;pendingPlay=false;current?.a?.pause();}
 function stop(){suspend();ctx=null;world=null;current=null;blocked=false;error=false;}
 function same(c){return !!c&&!!ctx&&world===polarState&&c.p===ctx.p&&c.body===ctx.body&&c.language===ctx.language&&c.keys.join('|')===ctx.keys.join('|');}
 function play(){if(!current||!ctx||ctx.p.voiceDone||muted||blocked||error||pendingPlay||!same(context()))return;const r=current,a=audio(r);if(!a.paused&&!a.ended)return;const attempt=++token,c=ctx;pendingPlay=true;
  try{Promise.resolve(a.play()).then(()=>{if(attempt!==token){if(current!==r||!same(context())||muted)a.pause();return;}pendingPlay=false;blocked=false;if(ctx!==c||!same(context())||muted)suspend();}).catch(()=>{if(attempt===token){pendingPlay=false;blocked=true;updateStatus();}});}catch(e){pendingPlay=false;blocked=true;updateStatus();}
 }
 function startSegment(){const p=ctx?.p;if(!p||p.voiceDone)return;current=clips.get(ctx.keys[p.voicePart||0])||null;if(!current){p.voiceDone=true;return;}const r=current,a=audio(r),c=ctx,attempt=++token;pendingPlay=false;blocked=false;error=false;
  const time=Math.max(0,Math.min(r.duration-.02,p.voiceTime||0));try{a.currentTime=time;}catch(e){}a.onloadedmetadata=()=>{if(ctx===c&&current===r&&attempt<=token&&a.currentTime<time)a.currentTime=time;};
  a.onended=()=>{if(ctx!==c||current!==r||!same(context()))return;const part=p.voicePart||0;(p.voiceTimes||(p.voiceTimes=[0,0]))[part]=r.duration;(p.voiceFinished||(p.voiceFinished=[false,false]))[part]=true;p.voiceTime=0;if(c.language==='both'&&part+1<c.keys.length){p.voicePart=part+1;p.voiceTime=p.voiceTimes[p.voicePart]||0;startSegment();}else{p.voiceDone=true;pendingPlay=false;updateStatus();}};
  a.onerror=()=>{if(ctx===c&&current===r){error=true;pendingPlay=false;updateStatus();}};play();updateStatus();
 }
 function sync(){const c=context();if(!c){if(current?.a&&!current.a.paused||pendingPlay)suspend();updateStatus();return;}
  if(!same(c)){suspend();ctx=c;world=polarState;current=null;blocked=false;error=false;if(!c.p.voiceDone)startSegment();}
  else if(!c.p.voiceDone&&!current)startSegment();else play();updateStatus();
 }
 function updateStatus(){const statusEl=$('#governorVoiceStatus'),button=$('#governorVoiceToggle');if(!statusEl)return;const c=context();if(button)button.textContent=blocked?'PLAY VOICE':muted?'VOICE OFF':'VOICE ON';const languages=$('#governorVoiceLanguages');if(languages){languages.hidden=c?.keys.length!==2;for(const language of ['native','english','both'])$('#governorLanguage_'+language)?.setAttribute?.('aria-pressed',String(c?.language===language));}statusEl.textContent=!c?.keys.length?'CAPTIONS / NO RECORDING':error?'VOICE UNAVAILABLE / CAPTIONS REMAIN':blocked?'CLICK PLAY VOICE':muted?'VOICE MUTED':c.p.voiceDone?'MESSAGE FINISHED / CHOOSE YOUR RESPONSE':c.keys.length===2?(c.p.voicePart===1?'ENGLISH TRANSLATION':'NATIVE TONGUE / ENGLISH CAPTIONS'):'RECORDED GOVERNOR MESSAGE';}
 function replay(){const c=context();if(!c||!c.keys.length)return;stop();const part=c.language==='english'?1:0;Object.assign(c.p,{voicePart:part,voiceTime:0,voiceDone:false});c.p.voiceTimes=c.p.voiceTimes||[0,0];c.p.voiceFinished=c.p.voiceFinished||[false,false];if(c.language==='both'){c.p.voiceTimes=[0,0];c.p.voiceFinished=[false,false];}else{c.p.voiceTimes[part]=0;c.p.voiceFinished[part]=false;}sync();}
 function selectLanguage(language){const c=context();if(!c||c.keys.length!==2||!['native','english','both'].includes(language))return false;if(c.language===language)return true;stop();c.q.voiceLanguage=language;const part=language==='english'?1:0;Object.assign(c.p,{voicePart:part,voiceTime:c.p.voiceTimes?.[part]||0,voiceDone:c.p.voiceFinished?.[part]===true});if(language==='both'&&c.p.voiceDone&&!c.p.voiceFinished?.[1])Object.assign(c.p,{voicePart:1,voiceTime:c.p.voiceTimes?.[1]||0,voiceDone:false});sync();return true;}
 function toggle(){if(blocked){blocked=false;play();}else{muted=!muted;if(muted)suspend();else sync();}updateStatus();}
 const speaking=()=>!!current?.a&&!current.a.paused&&!current.a.ended&&same(context());
 const status=()=>({key:current?.key||'',part:ctx?.p.voicePart||0,done:!!ctx?.p.voiceDone,muted,blocked,error,time:current?.a?.currentTime||0,paused:current?.a?.paused??true});
 return{clips,context,sync,suspend,stop,capture,replay,selectLanguage,toggle,speaking,status,retry(){if(blocked){blocked=false;play();}}};
})();
const governorVoiceControls=document.createElement('div');governorVoiceControls.id='governorVoiceControls';governorVoiceControls.innerHTML='<button id="governorVoiceToggle" class="polar-button">VOICE ON</button><button id="governorVoiceReplay" class="polar-button">REPLAY MESSAGE</button><small id="governorVoiceStatus" role="status"></small>';$('#governorConversationResponses').before(governorVoiceControls);
const governorVoiceLanguages=document.createElement('div');governorVoiceLanguages.id='governorVoiceLanguages';governorVoiceLanguages.hidden=true;governorVoiceLanguages.setAttribute('role','group');governorVoiceLanguages.setAttribute('aria-label','Custom governor spoken language');governorVoiceLanguages.innerHTML='<button id="governorLanguage_native" class="polar-button" aria-pressed="false">NATIVE</button><button id="governorLanguage_english" class="polar-button" aria-pressed="false">ENGLISH</button><button id="governorLanguage_both" class="polar-button" aria-pressed="true">NATIVE + ENGLISH</button>';$('#governorVoiceStatus').before(governorVoiceLanguages);for(const language of ['native','english','both'])$('#governorLanguage_'+language).onclick=()=>NVGovernorVoice.selectLanguage(language);
$('#governorVoiceToggle').onclick=()=>NVGovernorVoice.toggle();$('#governorVoiceReplay').onclick=()=>NVGovernorVoice.replay();
const governorVoiceRefresh=refreshGovernorConversation;refreshGovernorConversation=()=>{governorVoiceRefresh();NVGovernorVoice.sync();};
const governorVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{governorVoiceHUD();NVGovernorVoice.sync();};
const governorVoicePause=pausePolar;pausePolar=on=>{NVGovernorVoice.suspend();return governorVoicePause(on);};
const governorVoiceSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVGovernorVoice.capture();return governorVoiceSave(manual);};
const governorVoiceExit=exitPolar;exitPolar=()=>{NVGovernorVoice.stop();return governorVoiceExit();};
const governorVoiceClose=$('#governorClose').onclick;$('#governorClose').onclick=()=>{NVGovernorVoice.suspend();governorVoiceClose();NVGovernorVoice.sync();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)NVGovernorVoice.suspend();else NVGovernorVoice.sync();});
document.addEventListener('pointerdown',()=>NVGovernorVoice.retry());
