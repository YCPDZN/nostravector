// Recorded dialogue includes Gareth's exchange and Richards's five solo lines.
const WILLIAMS_AUDIO=__WILLIAMS_AUDIO__;
const NVWilliamsVoice=(()=>{
 const clips=WILLIAMS_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;});
 const state={index:-1,token:0,attempt:0,muted:false,blocked:false,error:false,pending:false,tail:0};
 let lastFrame=0,lipClock=0,lip={jaw:0,width:1,round:0,teeth:0};
 const rest=()=>{lipClock=0;return lip={jaw:0,width:1,round:0,teeth:0};};
 const active=()=>gameActive&&!!williamsConversation&&williamsConversation.world===polarState&&index()>=0&&!document.hidden;
 function index(){const q=williamsConversation;if(!q)return-1;const branch=['gareth','richards','enlistment'].includes(q.phase)?q.phase:q.phase==='reaction'?q.branch:q.phase==='speech'?(q.chapter===3?'chapter3':q.intro?'intro':null):null;return branch?WILLIAMS_AUDIO.findIndex(r=>r.branch===branch&&r.line===q.index):-1;}
 function speaker(){const q=williamsConversation;return q?.phase==='gareth'?NVJosiahWilliams.GARETH[q.index]?.speaker:q?.phase==='richards'?'richards':q?.phase==='narration'?'narration':'josiah';}
 function status(){const missing=state.index<0;$('#williamsVoice').hidden=missing;$('#williamsVoice').textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';$('#williamsVoice').setAttribute('aria-pressed',String(!state.muted));$('#williamsVoiceStatus').textContent=missing?'CAPTIONS':state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE':state.muted?'CAPTIONS / VOICE MUTED':'RECORDED VOICE';}
 function stop(){state.token++;state.attempt++;for(const a of clips){a.onended=null;a.onerror=null;a.onloadedmetadata=null;a.pause();}Object.assign(state,{index:-1,pending:false,blocked:false,error:false,tail:0});lastFrame=0;rest();status();}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.muted||state.error)return;const attempt=++state.attempt;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token||attempt!==state.attempt){if(clips[state.index]!==a||!active()||state.muted)a.pause();return;}state.pending=false;if(!active()||state.muted)a.pause();status();}).catch(()=>{if(token!==state.token||attempt!==state.attempt)return;state.pending=false;state.blocked=true;status();});status();}
 function begin(){stop();state.index=index();lastFrame=performance.now();if(state.index<0){status();return;}const a=clips[state.index],token=state.token,seek=()=>{if(token===state.token)try{a.currentTime=0;}catch(e){}};seek();a.onloadedmetadata=()=>{seek();a.onloadedmetadata=null;};a.onended=()=>{if(token===state.token&&state.index===index()&&!state.muted&&state.tail===0){state.tail=.55;rest();}};a.onerror=()=>{if(token===state.token){a.pause();state.pending=false;state.error=true;rest();status();}};prepareJamesAcoustics(a);if(!state.muted)play();status();}
 function tick(dt){if(!active()||state.muted||state.blocked||state.error||state.index!==index())return;if(state.tail>0){state.tail-=Math.max(0,Math.min(.1,dt));if(state.tail<=0)nextWilliams();}}
 function frame(now){const dt=lastFrame?Math.max(0,(now-lastFrame)/1000):0;lastFrame=now;tick(dt);}
 function pose(who='josiah'){
  if(who!==speaker())return{jaw:0,width:1,round:0,teeth:0};
  const a=clips[state.index];if(!active()||state.muted||state.blocked||state.error||state.tail>0||state.index!==index()||!a||a.paused||a.ended)return rest();
  const entry=prepareJamesAcoustics(a),r=WILLIAMS_AUDIO[state.index];let progress=a.currentTime/(Number.isFinite(a.duration)&&a.duration>0?a.duration:r.duration),energy=0;
  if(entry.envelope){const e=entry.envelope,i=Math.max(0,Math.min(e.rms.length-1,Math.floor(a.currentTime/e.hopSeconds)));energy=e.rms[i]||0;progress=e.spoken[i]||0;}
  else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
  if(energy<.075)return rest();
  const now=performance.now(),dt=lipClock?Math.max(0,Math.min(.1,(now-lipClock)/1000)):1/60,target=calculateJamesViseme(williamsConversation.lines[williamsConversation.index],progress,energy),mix=Math.min(1,dt*20);lipClock=now;
  for(const key of Object.keys(target))lip[key]+=(target[key]-lip[key])*mix;
  return lip;
 }
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted){state.attempt++;state.pending=false;clips[state.index]?.pause();state.tail=0;}else begin();status();}
 document.addEventListener('visibilitychange',()=>{lastFrame=0;const a=clips[state.index];if(document.hidden){state.attempt++;state.pending=false;a?.pause();}else if(active()&&!state.muted&&!state.error){if(state.tail===0)play();}});
 return{clips,state,active,index,status,stop,play,begin,tick,frame,pose,speaker,toggle};
})();
$('#williamsVoice').onclick=NVWilliamsVoice.toggle;
const voicedWilliamsLine=showWilliamsLine;showWilliamsLine=()=>{voicedWilliamsLine();NVWilliamsVoice.begin();};
const voicedWilliamsWheel=showWilliamsWheel;showWilliamsWheel=()=>{NVWilliamsVoice.stop();return voicedWilliamsWheel();};
const voicedWilliamsChoice=chooseWilliamsResponse;chooseWilliamsResponse=id=>{const result=voicedWilliamsChoice(id);if(result)NVWilliamsVoice.stop();return result;};
const voicedWilliamsClose=closeWilliams;closeWilliams=(...args)=>{NVWilliamsVoice.stop();return voicedWilliamsClose(...args);};
