const JANIRA_RALLY_AUDIO=__JANIRA_RALLY_AUDIO__;
function janiraRallyRecordedViseme(a,entry,text,quiet=false){
 const closed={jaw:0,width:1,round:0,teeth:0};if(quiet||!a||a.paused||a.ended)return closed;
 let energy=0,progress=Number.isFinite(a.duration)&&a.duration>0?a.currentTime/a.duration:0;
 if(entry.envelope){const i=Math.max(0,Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds)));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}
 else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
 return energy<.075?closed:calculateJamesViseme(text,progress,energy);
}
const NVJaniraRallyVoice=(()=>{
 const clips=JANIRA_RALLY_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;});
 const state={owner:null,index:-1,token:0,pending:false,blocked:false,error:false,muted:false,tail:0,pose:{jaw:0,width:1,round:0,teeth:0}};
 const active=()=>gameActive&&polarState&&janiraRallyScene&&!janiraRallyScene.paused&&!document.hidden&&NVJaniraSiege.ensure(polarState).stage==='speech';
 function capture(){const a=clips[state.index];if(a&&state.owner===polarState&&NVJaniraSiege.ensure(polarState).line===state.index&&Number.isFinite(a.currentTime))NVJaniraSiege.ensure(polarState).voiceTime=a.currentTime;}
 function stop(){capture();state.token++;clips.forEach(a=>a.pause());Object.assign(state,{owner:null,index:-1,pending:false,blocked:false,error:false,tail:0,pose:{jaw:0,width:1,round:0,teeth:0}});}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.error||state.muted)return;state.blocked=false;state.pending=true;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token){if(clips[state.index]!==a||!active())a.pause();return;}state.pending=false;if(!active())a.pause();}).catch(()=>{if(token!==state.token)return;state.pending=false;state.blocked=true;});}
 function sync(){const button=$('#janiraRallyVoice');if(button)button.hidden=!polarState||NVJaniraSiege.ensure(polarState).stage!=='speech';if(!active()){if(state.index>=0)stop();return;}const q=NVJaniraSiege.ensure(polarState);
  if(state.owner!==polarState||state.index!==q.line){stop();const a=clips[q.line],token=state.token;state.owner=polarState;state.index=q.line;const seek=()=>{if(token===state.token)try{a.currentTime=Math.min(q.voiceTime||0,Math.max(0,JANIRA_RALLY_AUDIO[q.line].duration-.05));}catch(e){}};seek();a.onloadedmetadata=seek;a.onerror=()=>{if(token===state.token){state.error=true;state.pending=false;}};a.onended=()=>{if(token===state.token&&active()){capture();state.tail=.65;}};prepareJamesAcoustics(a);if(!state.muted)play();}
  const audio=clips[state.index];if(!state.muted&&!state.pending&&!state.blocked&&!state.error&&audio.paused&&!audio.ended)play();
  if(button){button.textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';button.setAttribute('aria-pressed',String(!state.muted));}
  $('#janiraRallyStatus').textContent=state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE / CAPTIONS ACTIVE':state.muted?'VOICE MUTED / CAPTIONS ACTIVE':'RECORDED VOICE / HKC'+(q.line+1);
 }
 function tick(dt){sync();if(!active()||state.muted||state.error)return;if(state.tail>0){state.tail-=Math.min(.1,Math.max(0,dt));if(state.tail<=0){stop();nextJaniraRally();}}}
 function lip(dt=.05){const closed={jaw:0,width:1,round:0,teeth:0};if(!active()||state.muted||state.error||state.blocked){state.pose=closed;return closed;}const a=clips[state.index],target=janiraRallyRecordedViseme(a,a?prepareJamesAcoustics(a):{},JANIRA_RALLY_QUOTES[state.index]||'');const mix=Math.min(1,Math.max(.001,dt)*20);for(const key of Object.keys(target))state.pose[key]+=(target[key]-state.pose[key])*mix;return state.pose;}
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted)stop();sync();}
 return{clips,state,active,capture,stop,play,sync,tick,lip,toggle};
})();
const janiraVoiceButton=document.createElement('button');janiraVoiceButton.id='janiraRallyVoice';janiraVoiceButton.className='polar-button';janiraVoiceButton.textContent='VOICE ON';$('.janira-rally-caption footer div').prepend(janiraVoiceButton);janiraVoiceButton.onclick=NVJaniraRallyVoice.toggle;
const janiraRecordedNext=nextJaniraRally;nextJaniraRally=()=>{if(janiraRallyScene&&!janiraRallyScene.paused)NVJaniraRallyVoice.stop();janiraRecordedNext();NVJaniraRallyVoice.sync();};$('#janiraRallyNext').onclick=nextJaniraRally;
const janiraRecordedPause=pauseJaniraRally;pauseJaniraRally=()=>{NVJaniraRallyVoice.stop();janiraRecordedPause();};$('#janiraRallyPause').onclick=pauseJaniraRally;
const janiraRecordedSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVJaniraRallyVoice.capture();return janiraRecordedSave(manual);};
const janiraRecordedExit=exitPolar;exitPolar=()=>{NVJaniraRallyVoice.stop();janiraRecordedExit();};$('#worldToMenu').onclick=()=>exitPolar();
