const HAK_ARIDAXX_AUDIO=__HAK_ARIDAXX_AUDIO__;
const NVHakAridaxxVoice=(()=>{
 const clips=HAK_ARIDAXX_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));let index=-1,token=0;
 const context=()=>gameActive&&NVAlphinos.context();
 function stop(){token++;for(const a of clips){a.pause();a.onerror=null;}index=-1;}
 function play(){const a=clips[index],t=token;if(!context()||document.hidden||!a)return;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(t!==token||!context()){if(clips[index]!==a||!context())a.pause();return;}$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='RECORDED VOICE / HAKARIDAXX'+(index+1);}).catch(()=>{if(t===token&&context()){$('#retryCourtVoice').hidden=false;$('#courtVoiceStatus').textContent='CLICK PLAY VOICE';}});}
 function begin(){stopCourtVoice();if(!context())return;index=erisConversation.index;const a=clips[index],t=token;if(!a)return;a.currentTime=0;prepareJamesAcoustics(a);a.onerror=()=>{if(t===token&&context()){$('#retryCourtVoice').hidden=false;$('#courtVoiceStatus').textContent='VOICE UNAVAILABLE / RETRY';}};$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='RECORDED VOICE / HAKARIDAXX'+(index+1);play();}
 function lip(){const a=clips[index];return !context()||document.hidden||!a||a.paused||a.muted||a.ended?{jaw:0,width:1,round:0,teeth:0}:janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),erisConversation.lines[erisConversation.index]);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clips[index]?.pause();else if(context())play();});
 return{clips,context,stop,play,begin,lip,index:()=>index};
})();
const hakAridaxxStop=stopCourtVoice;stopCourtVoice=()=>{NVHakAridaxxVoice.stop();return hakAridaxxStop();};
const hakAridaxxStart=startCourtVoice;startCourtVoice=()=>NVHakAridaxxVoice.context()?NVHakAridaxxVoice.begin():hakAridaxxStart();$('#retryCourtVoice').onclick=()=>startCourtVoice();
const hakAridaxxLip=courtRecordedLipPose;courtRecordedLipPose=kind=>kind==='hak'&&NVHakAridaxxVoice.context()?NVHakAridaxxVoice.lip():hakAridaxxLip(kind);
