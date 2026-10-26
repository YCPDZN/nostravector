const ORION_CROXIAN_AUDIO=__ORION_CROXIAN_AUDIO__;
const NVOrionCroxianVoice=(()=>{
 const clips=ORION_CROXIAN_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,key='',token=0,pending=false,blocked=false,failed=false,blurred=false;
 function selection(){if(!gameActive||!polarState)return null;const q=NVOrionCroxianRelief.ensure(polarState);if(q.stage==='arrival'&&croxianReliefOpen)return{q,stage:'arrival',line:q.line};const n=NVOrionCroxianRelief.local(polarState);return n&&n.distance<=95?{q,stage:'frame',line:q.battle.frame.quote%10}:null;}
 const field=stage=>stage==='arrival'?'arrivalVoiceTime':'frameVoiceTime';
 function matches(c){return c&&owner===c.q&&key===c.stage+':'+c.line;}
 function audible(){const c=selection();return matches(c)&&!document.hidden&&!blurred&&(c.stage==='arrival'||!gamePaused&&NVPlayerPistol.playable(polarState));}
 function capture(){const c=selection(),a=clips[index];if(a&&a.readyState>0&&matches(c)&&Number.isFinite(a.currentTime))owner[field(c.stage)]=a.currentTime;}
 function suspend(){capture();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;key='';blocked=false;failed=false;}
 function status(text){$('#croxianReliefVoiceStatus').textContent=text;}
 function play(){const a=clips[index];if(!a||!audible()||pending||blocked||failed||!a.paused||a.ended)return;const t=++token;pending=true;
  Promise.resolve().then(()=>{if(t===token&&audible())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!audible())a.pause();return;}pending=false;if(!audible())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;status('VOICE PAUSED / SELECT REPLAY VOICE');}});
 }
 function sync(){const c=selection();if(!c){stop();return;}if(!matches(c)){stop();owner=c.q;key=c.stage+':'+c.line;index=ORION_CROXIAN_AUDIO.findIndex(r=>r.stage===c.stage&&r.line===c.line);const a=clips[index],row=ORION_CROXIAN_AUDIO[index];if(!a)return;const saved=Math.max(0,Math.min(owner[field(c.stage)]||0,row.duration));a.currentTime=saved;a.onloadedmetadata=()=>{if(matches(c)&&owner[field(c.stage)]>a.currentTime+.15)a.currentTime=Math.min(owner[field(c.stage)],row.duration);};a.onended=()=>{if(matches(c)){owner[field(c.stage)]=row.duration;if(c.stage==='frame')owner.battle.frame.quoteTime=Math.min(owner.battle.frame.quoteTime,.4);else status('VOICE COMPLETE');}};a.onerror=()=>{if(matches(c)){failed=true;pending=false;status('VOICE UNAVAILABLE / SELECT REPLAY VOICE');}};status('RECORDED VOICE');}
  if(!audible()){if(pending||clips[index]&&!clips[index].paused)suspend();return;}play();capture();const a=clips[index];if(c.stage==='frame'&&a&&!a.ended&&!blocked&&!failed)c.q.battle.frame.quoteTime=Math.max(c.q.battle.frame.quoteTime,ORION_CROXIAN_AUDIO[index].duration-a.currentTime+.5);
 }
 function replay(){stop();const c=selection();if(c)c.q[field(c.stage)]=0;sync();}
 function speaking(){return !!clips[index]&&audible()&&!clips[index].paused&&!clips[index].ended;}
 function retry(){if(blocked){blocked=false;sync();}}
 window.addEventListener('blur',()=>{blurred=true;suspend();});window.addEventListener('focus',()=>{blurred=false;sync();});document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);window.addEventListener('pagehide',stop);
 return{clips,selection,sync,suspend,stop,capture,replay,speaking,index:()=>index};
})();
NVOrionCroxianRelief.api.quoteDuration=line=>(ORION_CROXIAN_AUDIO.find(r=>r.stage==='frame'&&r.line===line)?.duration||8.4)+.6;
const orionFamilyAudioControls=document.createElement('div');orionFamilyAudioControls.innerHTML='<small id="croxianReliefVoiceStatus" role="status">RECORDED VOICE</small><button id="croxianReliefReplay" class="polar-button">REPLAY VOICE</button>';$('#croxianReliefSave').after(orionFamilyAudioControls);$('#croxianReliefReplay').onclick=()=>NVOrionCroxianVoice.replay();
const orionFamilyAudioHUD=updatePolarHUD;updatePolarHUD=()=>{orionFamilyAudioHUD();NVOrionCroxianVoice.sync();};
const orionFamilyAudioTick=stepEcology;stepEcology=dt=>{orionFamilyAudioTick(dt);NVOrionCroxianVoice.sync();};
const orionFamilyAudioDraw=drawCroxianRelief;drawCroxianRelief=()=>{orionFamilyAudioDraw();NVOrionCroxianVoice.sync();};
const orionFamilyAudioPause=pausePolar;pausePolar=on=>{if(on)NVOrionCroxianVoice.suspend();const result=orionFamilyAudioPause(on);NVOrionCroxianVoice.sync();return result;};
const orionFamilyAudioSave=savePolarWorld;savePolarWorld=(...args)=>{NVOrionCroxianVoice.capture();return orionFamilyAudioSave(...args);};
const orionFamilyAudioExit=exitPolar;exitPolar=()=>{NVOrionCroxianVoice.stop();return orionFamilyAudioExit();};
const orionFamilyAudioBC=NVBCVoice.sync;NVBCVoice.sync=()=>{if(NVOrionCroxianVoice.selection())NVBCVoice.suspend();else orionFamilyAudioBC();};
