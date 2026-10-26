const ORION_RELIEF_AUDIO=__ORION_RELIEF_AUDIO__;
const NVOrionReliefVoice=(()=>{
 const clips=ORION_RELIEF_AUDIO.map(r=>{const a=new Audio(r.source);a.preload='none';a.volume=.95;return a;}),state={owner:null,index:-1,token:0,blocked:false,muted:false,error:false,pending:false,tail:0};
 const active=()=>gameActive&&orionReliefOpen&&!orionReliefPaused&&!document.hidden&&!!polarState;
 function capture(){const a=clips[state.index];if(state.owner===polarState&&a&&Number.isFinite(a.currentTime))NVOrionRelief.ensure(polarState).voiceTime=a.currentTime;}
 function stop(){capture();state.token++;clips.forEach(a=>a.pause());state.owner=null;state.index=-1;state.pending=false;state.tail=0;}
 function play(){const a=clips[state.index],token=state.token;if(!a||!active()||state.pending||state.muted||state.error)return;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(token!==state.token){if(clips[state.index]!==a||!active())a.pause();return;}state.pending=false;if(!active())a.pause();}).catch(()=>{if(token===state.token){state.pending=false;state.blocked=true;}});}
 function sync(){if(!active()){if(state.index>=0)stop();return;}const q=NVOrionRelief.ensure(polarState),i=q.line||0;if(state.owner!==polarState||state.index!==i){stop();state.owner=polarState;state.index=i;state.error=false;state.blocked=false;const a=clips[i],token=state.token,seek=()=>{if(token===state.token)try{a.currentTime=Math.min(q.voiceTime||0,ORION_RELIEF_AUDIO[i].duration-.05);}catch(e){}};seek();a.onloadedmetadata=seek;a.onended=()=>{if(token===state.token&&active())state.tail=.5;};a.onerror=()=>{if(token===state.token)state.error=true;};prepareJamesAcoustics(a);if(!state.muted)play();}
  $('#orionReliefVoice').textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';$('#orionReliefVoiceStatus').textContent=state.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':state.blocked?'CLICK PLAY VOICE':state.muted?'CAPTIONS / VOICE MUTED':'RECORDED VOICE / OMTH'+(state.index+1);
 }
 function tick(dt){sync();if(active()&&orionReliefPortrait)orionReliefPortrait(performance.now()/1000,lip());if(active()&&!state.muted&&!state.error&&state.tail>0){state.tail-=Math.min(.1,Math.max(0,dt));if(state.tail<=0)advanceOrionRelief();}}
 function lip(){if(!active()||state.muted||state.error||state.blocked)return{open:0,round:0};const a=clips[state.index];if(!a||a.paused)return{open:0,round:0};const p=janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),NVOrionRelief.QUOTES[state.index]);return{open:p.jaw||0,round:p.round||0};}
 function toggle(){if(state.blocked){play();return;}state.muted=!state.muted;if(state.muted)stop();sync();if(!state.muted)play();}
 return{clips,state,active,capture,stop,play,sync,tick,lip,toggle};
})();
const orionReliefVoiceButton=document.createElement('button');orionReliefVoiceButton.id='orionReliefVoice';orionReliefVoiceButton.className='polar-button';orionReliefVoiceButton.textContent='VOICE ON';orionReliefVoiceButton.onclick=NVOrionReliefVoice.toggle;$('#orionRelief footer').prepend(orionReliefVoiceButton);
const orionReliefVoiceStatus=document.createElement('small');orionReliefVoiceStatus.id='orionReliefVoiceStatus';$('#orionRelief article').append(orionReliefVoiceStatus);
const orionReliefRecordedDraw=drawOrionRelief;drawOrionRelief=()=>{orionReliefRecordedDraw();NVOrionReliefVoice.sync();if(orionReliefPortrait)orionReliefPortrait(performance.now()/1000,NVOrionReliefVoice.lip());};
const orionReliefRecordedNext=advanceOrionRelief;advanceOrionRelief=()=>{if(!orionReliefOpen||orionReliefPaused)return;NVOrionReliefVoice.stop();const q=NVOrionRelief.ensure(polarState);q.voiceTime=0;orionReliefRecordedNext();NVOrionReliefVoice.sync();};$('#orionReliefNext').onclick=advanceOrionRelief;
const orionReliefRecordedSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVOrionReliefVoice.capture();return orionReliefRecordedSave(manual);};
const orionReliefRecordedExit=exitPolar;exitPolar=()=>{NVOrionReliefVoice.stop();orionReliefRecordedExit();};$('#worldToMenu').onclick=()=>exitPolar();
let orionReliefVoiceLast=performance.now();const orionReliefRecordedHUD=updatePolarHUD;updatePolarHUD=()=>{orionReliefRecordedHUD();const t=performance.now();NVOrionReliefVoice.tick((t-orionReliefVoiceLast)/1000);orionReliefVoiceLast=t;};document.addEventListener('visibilitychange',()=>{NVOrionReliefVoice.capture();if(document.hidden)NVOrionReliefVoice.stop();else NVOrionReliefVoice.sync();});


const reliefVoicePause=pausePolar;pausePolar=on=>{NVOrionReliefVoice.capture();const result=reliefVoicePause(on);NVOrionReliefVoice.sync();return result;};

function createOrionReliefPortrait(canvas=$('#orionReliefPortrait'),options={camera:[0,-1.4,-3.2]}){
 const meshes=ORION_IMPERIAL_PARTS.map(p=>({...p,p:p.p.flat(),n:p.n.flat(),indices:p.f||p.indices,color:p.c||p.color,bone:/beard|strand/i.test(p.name)?'jaw':'body'}));
 const mouth=meshes.find(p=>p.name==='Mouth neutral');
 if(mouth){mouth.p=mouth.p.map((v,i)=>i%3===1?1.551+(v-1.551)*5:v);mouth.bone='teeth';mouth.color=[.065,.018,.018];}
 return createGrekRenderer(canvas,{meshes,jawPivot:[0,1.565,.16],teethPivot:[0,1.551,.21]},options);
}
