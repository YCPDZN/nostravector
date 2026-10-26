const BROWN_RETURN_RECORDINGS=__BROWN_RETURN_RECORDINGS__;
const brownReturnClips=BROWN_RETURN_RECORDINGS.map(q=>({...q,a:Object.assign(new Audio(q.source),{preload:'none',volume:.95})}));
const brownReturnVoice={key:'',token:0,ended:false,blocked:false,muted:false,error:false};
function brownReturnContext(){if(!gameActive||!polarState||document.hidden)return null;const q=NVBrownBastion.ensure(polarState);if(typeof brownFateOpen!=='undefined'&&brownFateOpen&&!brownFatePaused)return{kind:'post',line:0,time:'postVoiceTime'};if(brownEncounterOpen&&!brownEncounterPaused)return{kind:'intro',line:q.line,time:'introVoiceTime'};if(!gamePaused&&NVPontifex.ensure(polarState).alive&&q.barkTime>0&&q.barkIndex>0&&NVPontifex.local(polarState))return{kind:'battle',line:q.barkIndex-1,time:'battleVoiceTime'};return null;}
function currentBrownReturnClip(){return brownReturnClips.find(r=>r.kind+':'+(r.line-1)===brownReturnVoice.key);}
function captureBrownReturnVoice(){const r=currentBrownReturnClip();if(r&&polarState)NVBrownResolution.ensure(polarState)[r.kind==='intro'?'introVoiceTime':r.kind==='post'?'postVoiceTime':'battleVoiceTime']=r.a.currentTime||0;}
function stopBrownReturnVoice(){captureBrownReturnVoice();brownReturnVoice.token++;for(const r of brownReturnClips)r.a.pause();brownReturnVoice.key='';brownReturnVoice.ended=false;resetBrownReturnLipPose();}
function playBrownReturnVoice(){const r=currentBrownReturnClip(),token=brownReturnVoice.token;if(!r||brownReturnVoice.muted||!brownReturnContext())return;prepareJamesAcoustics(r.a);resumeJamesAcoustics();Promise.resolve(r.a.play()).then(()=>{if(token!==brownReturnVoice.token||!brownReturnContext())r.a.pause();else brownReturnVoice.blocked=false;}).catch(()=>{if(token===brownReturnVoice.token)brownReturnVoice.blocked=true;});}
function startBrownReturnVoice(){const ctx=brownReturnContext();stopBrownReturnVoice();if(!ctx)return;const g=brownReturnVoice;g.key=ctx.kind+':'+ctx.line;g.error=false;g.blocked=false;const r=currentBrownReturnClip(),token=g.token,time=Math.max(0,Math.min(NVBrownResolution.ensure(polarState)[ctx.time],r.duration-.05));try{r.a.currentTime=time;}catch(e){}r.a.onloadedmetadata=()=>{if(token===g.token&&r.a.currentTime<time)r.a.currentTime=time;};r.a.onended=()=>{if(token===g.token)g.ended=true;};r.a.onerror=()=>{if(token===g.token)g.error=true;};playBrownReturnVoice();}
const brownReturnRest=()=>({jaw:0,width:1,round:0,teeth:0});
let brownReturnPose=brownReturnRest(),brownReturnPoseClock=0,brownReturnPoseKey='';
function resetBrownReturnLipPose(){brownReturnPose=brownReturnRest();brownReturnPoseClock=0;brownReturnPoseKey='';return brownReturnPose;}
function brownReturnLipPose(){
 const r=currentBrownReturnClip(),ctx=brownReturnContext(),g=brownReturnVoice;
 // Intro dialogue deliberately pauses gameplay while its recording keeps playing.
 if(!r||!ctx||g.muted||g.error||r.a.paused||r.a.ended)return resetBrownReturnLipPose();
 const now=performance.now(),dt=brownReturnPoseClock?Math.max(0,Math.min(.1,(now-brownReturnPoseClock)/1000)):1/60;
 if(brownReturnPoseKey!==g.key){brownReturnPose=brownReturnRest();brownReturnPoseKey=g.key;}
 brownReturnPoseClock=now;
 const acoustic=prepareJamesAcoustics(r.a),duration=Number.isFinite(r.a.duration)?r.a.duration:r.duration;
 let progress=r.a.currentTime/Math.max(.001,duration),energy=0;
 if(acoustic.envelope){const e=acoustic.envelope,i=Math.max(0,Math.min(e.rms.length-1,Math.floor(r.a.currentTime/e.hopSeconds)));energy=e.rms[i];progress=e.spoken[i];}
 else if(acoustic.analyser){acoustic.analyser.getByteTimeDomainData(acoustic.samples);let sum=0;for(const v of acoustic.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/acoustic.samples.length)*7);}
 const text=ctx.kind==='post'?NVBrownResolution.TAUNT:(ctx.kind==='intro'?NVBrownBastion.INTRO:NVBrownBastion.BARKS)[ctx.line]||'',target=calculateJamesViseme(text,progress,energy),mix=Math.min(1,dt*20);
 for(const key of Object.keys(target))brownReturnPose[key]+=(target[key]-brownReturnPose[key])*mix;
 return brownReturnPose;
}
const brownVoiceButton=document.createElement('button');brownVoiceButton.id='brownReturnVoiceButton';brownVoiceButton.className='polar-button';brownVoiceButton.textContent='VOICE ON';$('#brownEncounterPanel footer').prepend(brownVoiceButton);brownVoiceButton.onclick=()=>{if(brownReturnVoice.blocked){playBrownReturnVoice();return;}brownReturnVoice.muted=!brownReturnVoice.muted;if(brownReturnVoice.muted){currentBrownReturnClip()?.a.pause();resetBrownReturnLipPose();}else playBrownReturnVoice();};
const brownVoiceAdvance=advanceBrownEncounter;advanceBrownEncounter=()=>{stopBrownReturnVoice();if(polarState)NVBrownResolution.ensure(polarState).introVoiceTime=0;brownVoiceAdvance();};$('#brownEncounterNext').onclick=advanceBrownEncounter;
const brownVoicePause=pausePolar;pausePolar=on=>{if(on)stopBrownReturnVoice();brownVoicePause(on);};
const brownVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{brownVoiceHUD();const ctx=brownReturnContext(),g=brownReturnVoice;if(!ctx){if(g.key)stopBrownReturnVoice();return;}const key=ctx.kind+':'+ctx.line;if(g.key!==key){startBrownReturnVoice();}for(const id of ['#brownReturnVoiceButton','#brownFateVoice'])if($(id))$(id).textContent=g.error?'VOICE UNAVAILABLE':g.blocked?'PLAY VOICE':g.muted?'VOICE OFF':'VOICE ON';if(g.ended&&!g.muted&&ctx.kind==='intro'){g.ended=false;advanceBrownEncounter();}};
const brownVoiceSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)captureBrownReturnVoice();return brownVoiceSave(manual);};const brownVoiceExit=exitPolar;exitPolar=()=>{stopBrownReturnVoice();brownVoiceExit();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBrownReturnVoice();});
