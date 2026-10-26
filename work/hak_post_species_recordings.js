const HAK_POST_SPECIES_AUDIO=__HAK_POST_SPECIES_AUDIO__;
const NVHakPostSpeciesVoice=(()=>{
 const clips=HAK_POST_SPECIES_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));let index=-1,token=0;
 const context=()=>gameActive&&NVTyrotaronus.hakDiscussion(polarState,erisConversation);
 function stop(){token++;for(const a of clips){a.pause();a.onerror=null;}index=-1;}
 function play(){const a=clips[index],t=token;if(!context()||document.hidden||!a)return;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(t!==token||!context()){if(clips[index]!==a||!context())a.pause();return;}$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='RECORDED VOICE';}).catch(()=>{if(t===token&&context()){$('#retryCourtVoice').hidden=false;$('#courtVoiceStatus').textContent='CLICK PLAY VOICE';}});}
 function begin(){stopCourtVoice();if(!context())return;index=erisConversation.index;const a=clips[index],t=token;if(!a)return;a.currentTime=0;prepareJamesAcoustics(a);a.onerror=()=>{if(t===token&&context()){$('#retryCourtVoice').hidden=false;$('#courtVoiceStatus').textContent='VOICE UNAVAILABLE / RETRY';}};$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='RECORDED VOICE';play();}
 function lip(){const a=clips[index];return !context()||document.hidden||!a||a.paused||a.ended?{jaw:0,width:1,round:0,teeth:0}:janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),erisConversation.lines[erisConversation.index]);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clips[index]?.pause();else if(context())play();});
 return{clips,context,stop,play,begin,lip,index:()=>index};
})();
const hakPostSpeciesStop=stopCourtVoice;stopCourtVoice=()=>{NVHakPostSpeciesVoice.stop();return hakPostSpeciesStop();};
const hakPostSpeciesStart=startCourtVoice;startCourtVoice=()=>NVHakPostSpeciesVoice.context()?NVHakPostSpeciesVoice.begin():hakPostSpeciesStart();$('#retryCourtVoice').onclick=()=>startCourtVoice();
const hakPostSpeciesLip=courtRecordedLipPose;courtRecordedLipPose=kind=>kind==='hak'&&NVHakPostSpeciesVoice.context()?NVHakPostSpeciesVoice.lip():hakPostSpeciesLip(kind);
