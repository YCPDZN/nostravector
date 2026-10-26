const AM_G_AUDIO=__AM_G_AUDIO__;
const NVAmGrekVoice=(()=>{
 const clips=AM_G_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;}),state={owner:null,index:-1,token:0,blocked:false,muted:false,error:false,pending:false,tail:0};
 const active=()=>gameActive&&amGrekOpen&&!document.hidden&&!!polarState;
 function capture(){const a=clips[state.index];if(state.owner===polarState&&a&&Number.isFinite(a.currentTime))NVChapter4.ensure(polarState).amGrekVoiceTime=a.currentTime;}
 function stop(){capture();state.token++;clips.forEach(a=>a.pause());state.owner=null;state.index=-1;state.pending=false;state.tail=0;}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.muted||state.error)return;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token){if(clips[state.index]!==a||!active())a.pause();return;}state.pending=false;if(!active())a.pause();}).catch(()=>{if(token===state.token){state.pending=false;state.blocked=true;}});}
 function sync(){if(!active()){if(state.index>=0)stop();return;}const q=NVChapter4.ensure(polarState),i=q.amGrekLine||0;if(state.owner!==polarState||state.index!==i){stop();state.owner=polarState;state.index=i;state.error=false;state.blocked=false;const a=clips[i],token=state.token,seek=()=>{if(token===state.token)try{a.currentTime=Math.min(q.amGrekVoiceTime||0,AM_G_AUDIO[i].duration-.05);}catch(e){}};seek();a.onloadedmetadata=seek;a.onended=()=>{if(token===state.token&&active())state.tail=.5;};a.onerror=()=>{if(token===state.token)state.error=true;};prepareJamesAcoustics(a);if(!state.muted)play();}
  $('#amGrekVoice').textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';$('#amGrekVoiceStatus').textContent=state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE':state.muted?'CAPTIONS / VOICE MUTED':'RECORDED VOICE / AMG'+(state.index+1);
 }
 function tick(dt){sync();if(active()&&!state.muted&&!state.error&&state.tail>0){state.tail-=Math.min(.1,Math.max(0,dt));if(state.tail<=0)nextAmGrek();}}
 function lip(){if(!active()||state.muted||state.error||state.blocked)return{open:0,round:0};const a=clips[state.index];if(!a||a.paused)return{open:0,round:0};const p=janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),NVAmGrek.QUOTES[state.index]);return{open:p.jaw||0,round:p.round||0};}
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted)stop();sync();}
 return{clips,state,active,capture,stop,play,sync,tick,lip,toggle};
})();
const amGrekVoiceButton=document.createElement('button');amGrekVoiceButton.id='amGrekVoice';amGrekVoiceButton.className='polar-button';amGrekVoiceButton.textContent='VOICE ON';amGrekVoiceButton.onclick=NVAmGrekVoice.toggle;$('#amGrekDialogue footer').prepend(amGrekVoiceButton);
const amGrekVoiceStatus=document.createElement('small');amGrekVoiceStatus.id='amGrekVoiceStatus';$('#amGrekDialogue article').append(amGrekVoiceStatus);
const amGrekRecordedDraw=drawAmGrek;drawAmGrek=()=>{amGrekRecordedDraw();NVAmGrekVoice.sync();if(amGrekPortrait)amGrekPortrait(performance.now()/1000,NVAmGrekVoice.lip());};
const amGrekRecordedNext=nextAmGrek;nextAmGrek=()=>{if(!amGrekOpen)return;NVAmGrekVoice.stop();const q=NVChapter4.ensure(polarState);q.amGrekVoiceTime=0;if((q.amGrekLine||0)===4)q.amGrekGiftHeard=true;amGrekRecordedNext();NVAmGrekVoice.sync();};$('#amGrekNext').onclick=nextAmGrek;
const amGrekRecordedClose=closeAmGrek;closeAmGrek=()=>{NVAmGrekVoice.stop();amGrekRecordedClose();};$('#amGrekLeave').onclick=closeAmGrek;
const amGrekRecordedSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVAmGrekVoice.capture();return amGrekRecordedSave(manual);};
const amGrekRecordedExit=exitPolar;exitPolar=()=>{NVAmGrekVoice.stop();amGrekRecordedExit();};$('#worldToMenu').onclick=()=>exitPolar();
let amGrekVoiceLast=performance.now();const amGrekRecordedHUD=updatePolarHUD;updatePolarHUD=()=>{amGrekRecordedHUD();const t=performance.now();NVAmGrekVoice.tick((t-amGrekVoiceLast)/1000);amGrekVoiceLast=t;};document.addEventListener('visibilitychange',()=>{NVAmGrekVoice.capture();if(document.hidden)NVAmGrekVoice.stop();else NVAmGrekVoice.sync();});

const amGrekGiftSpeak=speakAmGrek;speakAmGrek=()=>{const q=NVChapter4.ensure(polarState);if(q.amGrekMet&&!q.amGrekGiftHeard&&!q.amGrekGiftStarted){q.amGrekLine=0;q.amGrekVoiceTime=0;}q.amGrekGiftStarted=true;return amGrekGiftSpeak();};amGrekButton.onclick=speakAmGrek;
