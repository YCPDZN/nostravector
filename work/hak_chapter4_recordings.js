const HAK_CHAPTER4_AUDIO=__HAK_CHAPTER4_AUDIO__;
const NVHakChapter4Voice=(()=>{
 const clips=HAK_CHAPTER4_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));let index=-1,token=0;
 const context=()=>gameActive&&NVCatharsisReturnHak.discussion(polarState,erisConversation);
 function stop(){token++;for(const a of clips){a.pause();a.onerror=null;}index=-1;}
 function play(){if(!context()||document.hidden)return;const a=clips[index],t=token;if(!a)return;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(t!==token){if(clips[index]!==a||!context())a.pause();return;}if(!context())a.pause();}).catch(()=>{if(t===token){$('#retryCourtVoice').hidden=false;$('#courtVoiceStatus').textContent='CLICK PLAY VOICE';}});}
 function begin(){stop();stopOldHakCourt();if(!context())return;index=erisConversation.index;const a=clips[index],t=token;if(!a)return;a.currentTime=0;prepareJamesAcoustics(a);a.onerror=()=>{if(t===token){$('#retryCourtVoice').hidden=false;$('#courtVoiceStatus').textContent='VOICE UNAVAILABLE / RETRY';}};$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='RECORDED VOICE';play();}
 function lip(){const a=clips[index],c=erisConversation,closed={jaw:0,width:1,round:0,teeth:0};if(!context()||document.hidden||!a||a.paused||a.ended)return closed;const entry=prepareJamesAcoustics(a);let energy=0,progress=Number.isFinite(a.duration)?a.currentTime/a.duration:0;if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}return energy<.075?closed:calculateJamesViseme(c.lines[c.index],progress,energy);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clips[index]?.pause();else if(context())play();});
 return{clips,context,stop,play,begin,lip,index:()=>index};
})();
const stopOldHakCourt=stopCourtVoice;stopCourtVoice=()=>{NVHakChapter4Voice.stop();stopOldHakCourt();};
const startOldHakCourt=startCourtVoice;startCourtVoice=()=>NVHakChapter4Voice.context()?NVHakChapter4Voice.begin():startOldHakCourt();$('#retryCourtVoice').onclick=()=>startCourtVoice();
const lipOldHakCourt=courtRecordedLipPose;courtRecordedLipPose=kind=>kind==='hak'&&NVHakChapter4Voice.context()?NVHakChapter4Voice.lip():lipOldHakCourt(kind);
