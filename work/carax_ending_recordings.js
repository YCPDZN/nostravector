const CARAX_ENDING_AUDIO=__CARAX_ENDING_AUDIO__.map(r=>({...r,text:r.text||NVCaraxEndings.LINES[r.route][r.shot][1]}));
NVCaraxEndings.setJosiahDurations(CARAX_ENDING_AUDIO);
const NVCaraxEndingVoice=(()=>{
 const clips=CARAX_ENDING_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 const closedLip=()=>({jaw:0,width:1,round:0,teeth:0});let josiahPose=closedLip(),josiahPoseKey='',josiahPoseClock=0,josiahPoseTime=0;
 let owner=null,key='',index=-1,token=0,pending=false,blocked=false,failed=false,complete=false,blurred=false;
 const stamp=q=>q.route+':'+q.stage+':'+q.shot+':'+(q.beam?.stage||'none');
 const record=q=>q.nightmareDefeat&&NVCaraxEndings.fatal(q)&&q.shot===0?null:NVBeamStruggle.active(q)?q.beam.stage==='failure'?CARAX_ENDING_AUDIO.find(r=>r.route==='beam-failure'):null:q.stage==='offer'?CARAX_ENDING_AUDIO.find(r=>r.route==='shared'):q.stage==='cinematic'?CARAX_ENDING_AUDIO.find(r=>r.route===(['bad-josiah','bad-tyrotaronus'].includes(q.route)&&q.shot===0?'bad':q.route)&&r.shot===q.shot):null;
 const active=()=>!!owner&&owner===caraxEndingScene&&!caraxEndingSheet.hidden&&!caraxEndingPaused&&!document.hidden&&!blurred;
 function remember(){if(!owner||index<0)return;const q=NVCaraxEndings.ensure(owner),a=clips[index];if(stamp(q)===key&&a.readyState>=1&&!failed)q.voiceTime=Math.max(0,Math.min(CARAX_ENDING_AUDIO[index].duration,a.currentTime));}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){josiahPose=closedLip();josiahPoseKey='';josiahPoseClock=0;josiahPoseTime=0;suspend();for(const a of clips){a.pause();a.onended=null;a.onerror=null;a.onloadedmetadata=null;}owner=null;key='';index=-1;blocked=false;failed=false;complete=false;}
 function play(){const a=clips[index];if(!active()||!a||complete||pending||blocked||failed||!a.paused||a.ended)return;const t=token;pending=true;resumeJamesAcoustics();Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();render();}).catch(()=>{if(t===token){pending=false;blocked=true;render();}});}
 function sync(){const s=caraxEndingScene,q=s&&NVCaraxEndings.ensure(s),r=q&&record(q);if(!s||!r){stop();render();return;}if(owner!==s||key!==stamp(q)){stop();owner=s;key=stamp(q);index=CARAX_ENDING_AUDIO.indexOf(r);const a=clips[index],sceneKey=key,offset=Math.max(0,Math.min(r.duration,q.voiceTime||0));complete=offset>=r.duration-.01;prepareJamesAcoustics(a);a.onended=()=>{if(owner===s&&key===sceneKey){complete=true;q.voiceTime=r.duration;q.time=Math.max(q.time,r.duration);render();}};a.onerror=()=>{if(owner===s&&key===sceneKey){failed=true;pending=false;render();}};const ready=()=>{if(owner!==s||key!==sceneKey)return;a.currentTime=Math.min(offset,Number.isFinite(a.duration)?a.duration:offset);if(active())play();};if(a.readyState>=1)ready();else{a.onloadedmetadata=ready;a.load();}}
  if(!active()){if(pending||!clips[index].paused)suspend();}else play();render();
 }
 function clock(q){const r=record(q);if(!r||owner!==caraxEndingScene||stamp(q)!==key||failed)return;if(!complete&&!clips[index].ended){q.time=clips[index].readyState>=1?clips[index].currentTime:q.voiceTime||0;remember();}}
 const duration=q=>record(q)?record(q).duration+.7:NVCaraxEndings.duration(q);
 const shotMoment=q=>Math.max(4,(q.route==='bad'?CARAX_ENDING_AUDIO.find(r=>r.route==='bad'&&r.shot===3)?.duration||3.65:3.65)+.35);
 const ready=()=>index<0||failed||complete||clips[index]?.ended;
 const speaking=()=>active()&&index>=0&&!clips[index].paused&&!clips[index].ended&&!clips[index].muted;
 function lip(id){const allowed=speaking()&&CARAX_ENDING_AUDIO[index].speaker===id,target=allowed?janiraRallyRecordedViseme(clips[index],prepareJamesAcoustics(clips[index]),CARAX_ENDING_AUDIO[index].text):closedLip();if(!['josiah','tyrotaronus'].includes(id))return target;
  const now=performance.now(),time=allowed?clips[index].currentTime:0;if(!allowed){josiahPose=closedLip();josiahPoseKey='';josiahPoseClock=now;return josiahPose;}
  const dt=Math.max(0,(now-josiahPoseClock)/1000),seek=josiahPoseKey!==key||Math.abs(time-josiahPoseTime-dt)>.08,mix=seek?1:Math.min(1,dt*20);for(const k of Object.keys(target))josiahPose[k]+=(target[k]-josiahPose[k])*mix;josiahPoseKey=key;josiahPoseClock=now;josiahPoseTime=time;return{...josiahPose};
 }
 function retry(){if(blocked||failed){const a=clips[index];blocked=false;failed=false;if(a?.error){key='';sync();}else play();}}
 function render(){const status=$('#caraxEndingVoiceStatus'),retry=$('#caraxEndingVoiceRetry');if(!status)return;status.textContent=!owner?(caraxEndingScene&&NVGoodEnding.intro(NVCaraxEndings.ensure(caraxEndingScene))?'NEW DIALOGUE / CAPTIONS':caraxEndingScene&&NVCaraxEndings.ensure(caraxEndingScene).route==='bad-tyrotaronus'?'CAPTIONS':''):failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'RECORDED VOICE / '+CARAX_ENDING_AUDIO[index].file.split('/').at(-1).replace(/\.mp3$/i,'');retry.hidden=!owner||(!blocked&&!failed);}
 window.addEventListener('blur',()=>{blurred=true;if(caraxEndingScene){caraxEndingPaused=true;suspend();renderCaraxEnding();}});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else sync();});document.addEventListener('pointerdown',()=>{if(blocked)retry();});document.addEventListener('keydown',()=>{if(blocked)retry();});
 return{clips,record,active,remember,suspend,stop,sync,clock,duration,shotMoment,ready,speaking,lip,retry,index:()=>index};
})();
const caraxEndingVoiceStatus=document.createElement('small');caraxEndingVoiceStatus.id='caraxEndingVoiceStatus';caraxEndingSheet.querySelector('article').append(caraxEndingVoiceStatus);
const caraxEndingVoiceRetry=document.createElement('button');caraxEndingVoiceRetry.id='caraxEndingVoiceRetry';caraxEndingVoiceRetry.className='polar-button';caraxEndingVoiceRetry.textContent='PLAY VOICE';caraxEndingVoiceRetry.hidden=true;caraxEndingVoiceRetry.onclick=()=>NVCaraxEndingVoice.retry();caraxEndingSheet.querySelector('article').append(caraxEndingVoiceRetry);
const endingVoiceSave=savePolarWorld;savePolarWorld=(...args)=>{NVCaraxEndingVoice.remember();return endingVoiceSave(...args);};
const endingVoiceClose=closeCaraxEnding;closeCaraxEnding=()=>{NVCaraxEndingVoice.stop();return endingVoiceClose();};
const endingVoicePause=pausePolar;pausePolar=on=>{const result=endingVoicePause(on);if(caraxEndingScene)NVCaraxEndingVoice.sync();return result;};
