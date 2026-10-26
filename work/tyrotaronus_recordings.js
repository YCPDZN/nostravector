const TYROTARONUS_AUDIO=__TYROTARONUS_AUDIO__,TAMAZ_TYROTARONUS_AUDIO=__TAMAZ_TYROTARONUS_AUDIO__;
const NVTyrotaronusVoice=(()=>{
 const audio=rows=>rows.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.95})),clips=audio(TYROTARONUS_AUDIO),tamazClips=audio(TAMAZ_TYROTARONUS_AUDIO),allClips=[...clips,...tamazClips];
 const intro={visit:false,rows:TYROTARONUS_AUDIO,clips},tamaz={visit:true,rows:TAMAZ_TYROTARONUS_AUDIO,clips:tamazClips};let group=null,owner=null,index=-1,token=0,muted=false,blocked=false;
 const context=()=>gameActive&&!!tyroScene&&tyroScene.world===polarState;
 const saved=()=>tyroScene?.visit?{state:NVCatharsisRoute.ensure(tyroScene.world),key:'visitVoiceTime'}:{state:NVTyrotaronus.ensure(tyroScene.world),key:'voiceTime'};
 const current=()=>group?.clips[index]||null;
 function capture(){const a=current();if(context()&&group?.visit===tyroScene.visit&&owner===tyroScene.world&&a&&Number.isFinite(a.currentTime)){const q=saved();q.state[q.key]=a.currentTime;}}
 function label(){const el=$('#tyroVoice');if(el){el.hidden=!context();el.textContent=blocked?'PLAY VOICE':muted?'VOICE OFF':'VOICE ON';}if(context())$('#tyroFeedback').textContent=blocked?'CLICK PLAY VOICE':muted?'CAPTIONS / VOICE MUTED':'RECORDED VOICE / '+(group?.visit?'TAMAZ':'TYRO')+(index+1);}
 function stop(remember=true){if(remember)capture();token++;for(const a of allClips){a.pause();a.onerror=null;a.onloadedmetadata=null;}group=null;owner=null;index=-1;blocked=false;}
 function play(){const a=current(),t=token;if(!context()||document.hidden||muted||!a)return;resumeJamesAcoustics();Promise.resolve(a.play()).then(()=>{if(t!==token||!context()){if(current()!==a||!context())a.pause();return;}blocked=false;label();}).catch(()=>{if(t===token&&context()){blocked=true;label();}});}
 function begin(){stop(false);if(!context()){const button=$('#tyroVoice');if(button)button.hidden=true;$('#tyroFeedback').textContent='CAPTIONS';return;}group=tyroScene.visit?tamaz:intro;owner=tyroScene.world;index=tyroScene.index;const a=current();if(!a){$('#tyroFeedback').textContent='CAPTIONS';return;}const t=token,q=saved(),duration=group.rows[index].duration,seek=()=>{if(t===token&&current()===a)try{a.currentTime=Math.min(q.state[q.key]||0,Math.max(0,duration-.05));}catch(e){}};seek();a.onloadedmetadata=seek;a.onerror=()=>{if(t===token){blocked=true;label();$('#tyroFeedback').textContent='VOICE UNAVAILABLE / RETRY OR NEXT';}};prepareJamesAcoustics(a);label();play();}
 function lip(){const a=current();if(!context()||document.hidden||muted||blocked||!a||a.paused||a.ended)return{jaw:0,round:0};return janiraRallyRecordedViseme(a,prepareJamesAcoustics(a),tyroScene.lines[tyroScene.index]);}
 function toggle(){if(blocked){blocked=false;play();return;}muted=!muted;if(muted)current()?.pause();else play();label();}
 document.addEventListener('visibilitychange',()=>{if(!context())return;if(document.hidden){capture();current()?.pause();}else play();});
 return{clips,tamazClips,allClips,context,capture,stop,begin,play,lip,toggle,current,index:()=>index,bank:()=>group?.visit?'tamaz':group?'intro':''};
})();
const tyroVoiceButton=document.createElement('button');tyroVoiceButton.id='tyroVoice';tyroVoiceButton.className='polar-button';tyroVoiceButton.textContent='VOICE ON';tyroVoiceButton.hidden=true;tyroVoiceButton.onclick=NVTyrotaronusVoice.toggle;$('#tyroCaption footer div').prepend(tyroVoiceButton);
const tyroRecordedShow=showTyroLine;showTyroLine=()=>{tyroRecordedShow();NVTyrotaronusVoice.begin();};
const tyroRecordedNext=nextTyrotaronus;nextTyrotaronus=()=>{if(!tyroScene)return;NVTyrotaronusVoice.stop();if(tyroScene.visit)NVCatharsisRoute.ensure(tyroScene.world).visitVoiceTime=0;else NVTyrotaronus.ensure(tyroScene.world).voiceTime=0;return tyroRecordedNext();};$('#tyroNext').onclick=nextTyrotaronus;
const tyroRecordedClose=closeTyrotaronus;closeTyrotaronus=(...args)=>{NVTyrotaronusVoice.stop();return tyroRecordedClose(...args);};
const tyroRecordedSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true)NVTyrotaronusVoice.capture();return tyroRecordedSave(manual);};
tyroLipPose=()=>NVTyrotaronusVoice.lip();
