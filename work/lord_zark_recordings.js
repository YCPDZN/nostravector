const LORD_ZARK_AUDIO=__LORD_ZARK_AUDIO__;
const NVLordZarkVoice=(()=>{
 const clips=LORD_ZARK_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let index=-1,token=0,pending=false;
 const context=()=>gameActive&&!!zarkScene&&!zarkSheet.hidden&&NVLordZark.ensure(zarkScene).stage==='dialogue';
 const allowed=()=>context()&&!zarkPaused&&!document.hidden;
 const status=text=>{$('#lordZarkFeedback').textContent=text;};
 function sync(){const a=clips[index];if(context()&&a&&a.readyState>=1)NVLordZark.ensure(zarkScene).lineTime=a.currentTime;}
 function pause(){sync();clips[index]?.pause();}
 function stop(){token++;pending=false;for(const a of clips){a.pause();a.onloadedmetadata=null;a.onerror=null;a.onended=null;}index=-1;}
 function play(){const a=clips[index],t=token;if(!allowed()||!a||pending||a.ended)return;pending=true;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(t!==token){if(clips[index]!==a||!allowed())a.pause();return;}pending=false;if(!allowed()){a.pause();return;}$('#lordZarkVoiceRetry').hidden=true;status('RECORDED VOICE / LORDZARKH'+(index+1));}).catch(()=>{if(t!==token)return;pending=false;if(context()){$('#lordZarkVoiceRetry').hidden=false;status('CLICK PLAY VOICE');}});}
 function begin(){stop();$('#lordZarkVoiceRetry').hidden=true;if(!context()){status('CAPTIONS');return;}index=NVLordZark.ensure(zarkScene).line;const a=clips[index],t=token,offset=NVLordZark.ensure(zarkScene).lineTime;prepareJamesAcoustics(a);a.onended=()=>{if(t===token&&context()){sync();status('VOICE COMPLETE / NEXT TO CONTINUE');}};a.onerror=()=>{if(t===token&&context()){$('#lordZarkVoiceRetry').hidden=false;status('VOICE UNAVAILABLE / RETRY');}};const ready=()=>{if(t!==token||!context())return;a.currentTime=Math.min(offset,Number.isFinite(a.duration)?a.duration:offset);play();};if(a.readyState>=1)ready();else{a.onloadedmetadata=ready;a.load();}status('RECORDED VOICE / LORDZARKH'+(index+1));}
 function lip(){const a=clips[index];if(!allowed()||!a||a.paused||a.ended||a.muted)return{jaw:0};return janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),NVLordZark.LINES[index]);}
 const retry=document.createElement('button');retry.id='lordZarkVoiceRetry';retry.className='polar-button';retry.textContent='PLAY VOICE';retry.hidden=true;retry.onclick=()=>{const a=clips[index];if(a?.error)begin();else{if(a?.ended)a.currentTime=0;play();}};$('#lordZarkArrival footer').append(retry);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(allowed())play();});
 return{clips,context,index:()=>index,begin,play,pause,stop,sync,lip};
})();
