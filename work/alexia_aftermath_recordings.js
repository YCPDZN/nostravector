// Recordings 1–5 are Alexia; recordings 6–10 are Vishara. Only the speaker moves her mouth.
const ALEXIA_AFTERMATH_AUDIO=__ALEXIA_AFTERMATH_AUDIO__;
const NVAlexiaAftermathVoice=(()=>{
 const clips=ALEXIA_AFTERMATH_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.95}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false,lipClock=0,lip={jaw:0,width:1,round:0,teeth:0};
 const rest=()=>{lipClock=0;return lip={jaw:0,width:1,round:0,teeth:0};};
 const active=()=>gameActive&&!!owner&&owner===polarState&&NVAlexiaAftermath.viewing()&&!document.hidden&&!blurred&&!$('#erisDialogue').hidden&&$('#worldPauseSheet').hidden;
 function status(){if(!NVAlexiaAftermath.viewing())return;$('#retryCourtVoice').hidden=!blocked;$('#courtVoiceStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'RECORDED VOICE / '+(index+1)+' / 10';}
 function remember(){const a=clips[index];if(!owner||!a)return;const q=NVAlexiaAftermath.ensure(owner);if(q.line===index&&q.voiceLine===index&&Number.isFinite(a.currentTime))q.voiceTime=Math.min(ALEXIA_AFTERMATH_AUDIO[index].duration,a.currentTime);}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();rest();}
 function stop(){suspend();for(const a of clips){a.pause();a.onended=null;a.onerror=null;a.onloadedmetadata=null;}owner=null;index=-1;blocked=false;failed=false;}
 function play(){const a=clips[index];if(!a||!active()||pending||failed||!a.paused||a.ended||NVAlexiaAftermath.ensure(owner).voiceTime>=ALEXIA_AFTERMATH_AUDIO[index].duration-.02)return;blocked=false;pending=true;const stamp=++token;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(stamp!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();status();}).catch(()=>{if(stamp!==token)return;pending=false;blocked=true;rest();status();});status();}
 function begin(){stop();if(!gameActive||!NVAlexiaAftermath.viewing())return;owner=polarState;const q=NVAlexiaAftermath.ensure(owner);index=q.line;if(q.voiceLine!==index){q.voiceLine=index;q.voiceTime=0;}const a=clips[index],world=owner,line=index,current=()=>owner===world&&index===line&&NVAlexiaAftermath.viewing(),seek=()=>{if(current()&&index===q.line)try{a.currentTime=Math.min(q.voiceTime||0,ALEXIA_AFTERMATH_AUDIO[index].duration);}catch(ignored){}};seek();a.onloadedmetadata=()=>{seek();a.onloadedmetadata=null;};a.onended=()=>{if(owner===polarState&&index===q.line){q.voiceTime=ALEXIA_AFTERMATH_AUDIO[index].duration;rest();}};a.onerror=()=>{if(!current())return;pending=false;failed=true;rest();status();};prepareJamesAcoustics(a);play();status();}
 function pose(kind){const closed={jaw:0,width:1,round:0,teeth:0},a=clips[index],r=ALEXIA_AFTERMATH_AUDIO[index];if(!active()||!r||r.kind!==kind||blocked||failed||!a||a.paused||a.ended)return closed;const entry=prepareJamesAcoustics(a);let energy=0,progress=a.currentTime/(Number.isFinite(a.duration)&&a.duration>0?a.duration:r.duration);
  if(entry.envelope){const e=entry.envelope,i=Math.max(0,Math.min(e.rms.length-1,Math.floor(a.currentTime/e.hopSeconds)));energy=e.rms[i]||0;progress=e.spoken[i]||0;}else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}if(energy<.075)return rest();const now=performance.now(),dt=lipClock?Math.max(0,Math.min(.1,(now-lipClock)/1000)):1/60,target=calculateJamesViseme(r.text,progress,energy),mix=Math.min(1,dt*20);lipClock=now;for(const key of ['jaw','width','round','teeth'])lip[key]+=(target[key]-lip[key])*mix;return lip;
 }
 function resume(){if(active()&&!failed&&!pending&&clips[index]?.paused&&!clips[index]?.ended)play();}
 window.addEventListener('blur',()=>{blurred=true;suspend();});window.addEventListener('focus',()=>{blurred=false;resume();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else resume();});
 return{clips,active,remember,suspend,stop,begin,play,pose,resume,index:()=>index};
})();
const alexiaRecordedCourtStart=startCourtVoice;startCourtVoice=()=>{if(NVAlexiaAftermath.viewing()){alexiaRecordedCourtStop();NVAlexiaAftermathVoice.begin();return;}NVAlexiaAftermathVoice.stop();return alexiaRecordedCourtStart();};
const alexiaRecordedCourtStop=stopCourtVoice;stopCourtVoice=()=>{NVAlexiaAftermathVoice.stop();return alexiaRecordedCourtStop();};
const alexiaRecordedLip=courtRecordedLipPose;courtRecordedLipPose=kind=>NVAlexiaAftermath.viewing()?NVAlexiaAftermathVoice.pose(kind):alexiaRecordedLip(kind);
const alexiaRecordedRetry=$('#retryCourtVoice').onclick;$('#retryCourtVoice').onclick=()=>NVAlexiaAftermath.viewing()?NVAlexiaAftermathVoice.play():alexiaRecordedRetry();
const alexiaRecordedSave=savePolarWorld;savePolarWorld=(...args)=>{NVAlexiaAftermathVoice.remember();return alexiaRecordedSave(...args);};
const alexiaRecordedExit=exitPolar;exitPolar=()=>{NVAlexiaAftermathVoice.stop();return alexiaRecordedExit();};
