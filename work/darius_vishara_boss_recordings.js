// Combat barks are independent of the friendly station conversations.
const DARIUS_BOSS_AUDIO=__DARIUS_BOSS_AUDIO__;
const NVDariusBossVoice=(()=>{
 const clips=DARIUS_BOSS_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 const fresh=()=>({line:0,time:0,gap:0,muted:false});
 function restore(raw){return{line:Math.max(0,Math.min(9,Math.floor(Number(raw?.line)||0))),time:Math.max(0,Math.min(120,Number(raw?.time)||0)),gap:Math.max(0,Math.min(5,Number(raw?.gap)||0)),muted:raw?.muted===true};}
 const ensure=s=>NVEris.ensure(s).dariusBossVoice||(NVEris.ensure(s).dariusBossVoice=fresh());
 const context=()=>gameActive&&polarState?NVFactionLeaders.engaged(polarState).find(t=>t.id==='darius')||null:null;
 const active=()=>!!context()&&!gamePaused&&!document.hidden&&!blurred&&!erisConversation;
 function remember(){if(owner&&index>=0){const q=ensure(owner),a=clips[index];if(q.line===index&&!q.muted&&q.gap===0&&a&&Number.isFinite(a.currentTime))q.time=Math.min(DARIUS_BOSS_AUDIO[index].duration,a.currentTime);}}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;blocked=false;failed=false;}
 function play(){const q=owner&&ensure(owner),a=clips[index];if(!q||!a||q.muted||q.gap>0||!active()||blocked||failed||pending||!a.paused||a.ended)return;const t=++token;pending=true;Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});}
 function sync(){if(!context()){stop();render();return;}const q=ensure(polarState);if(owner!==polarState||index!==q.line){stop();owner=polarState;index=q.line;const a=clips[index];a.currentTime=Math.min(q.time,DARIUS_BOSS_AUDIO[index].duration);a.onended=()=>{if(owner===polarState&&ensure(owner).line===index){ensure(owner).time=DARIUS_BOSS_AUDIO[index].duration;ensure(owner).gap=2.5;}};a.onerror=()=>{failed=true;pending=false;};}if(!active()){if(pending||clips[index]&&!clips[index].paused)suspend();}else play();render();}
 function next(){if(!owner)return;const q=ensure(owner);suspend();q.line=(q.line+1)%10;q.time=0;q.gap=0;index=-1;sync();}
 function tick(dt){sync();if(!active()||!owner||!Number.isFinite(dt)||dt<=0)return;const q=ensure(owner),r=DARIUS_BOSS_AUDIO[q.line],a=clips[index];dt=Math.min(.1,dt);if(q.gap>0){q.gap=Math.max(0,q.gap-dt);if(q.gap===0)next();return;}if(q.muted||failed){q.time+=dt;if(q.time>=r.duration)q.gap=2.5;}else if(!blocked&&!pending){q.time=Math.max(q.time,a.currentTime);if(a.ended)q.gap=2.5;}render();}
 const speaking=()=>active()&&!!owner&&!ensure(owner).muted&&!clips[index]?.paused&&!clips[index]?.ended;
 function retry(){if(blocked){blocked=false;sync();}}
 function render(){const visible=active()&&owner&&ensure(owner).gap===0;dariusBossCaption.hidden=!visible;if(!visible)return;const q=ensure(owner);$('#dariusBossLine').textContent=DARIUS_BOSS_AUDIO[q.line].text;$('#dariusBossCount').textContent='DARIUS / '+String(q.line+1).padStart(2,'0')+' / 10';$('#dariusBossVoiceToggle').textContent=q.muted?'VOICE OFF':'VOICE ON';$('#dariusBossRetry').hidden=!blocked;$('#dariusBossAudioStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();render();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
 return{clips,fresh,restore,ensure,context,active,remember,suspend,stop,sync,tick,next,speaking,retry,index:()=>index};
})();
const dariusBossCaption=document.createElement('section');dariusBossCaption.id='dariusBossCaption';dariusBossCaption.hidden=true;dariusBossCaption.innerHTML='<small id="dariusBossCount"></small><p id="dariusBossLine"></p><small id="dariusBossAudioStatus" aria-live="polite"></small><div><button id="dariusBossVoiceToggle" class="polar-button">VOICE ON</button><button id="dariusBossRetry" class="polar-button" hidden>PLAY VOICE</button></div>';leaderHUD.append(dariusBossCaption);
const dariusBossStyle=document.createElement('style');dariusBossStyle.textContent='#dariusBossCaption[hidden]{display:none!important}#dariusBossCaption{border-top:1px solid #d88b4260;margin-top:10px;padding-top:9px}#dariusBossCaption p{font:12px/1.65 Consolas;margin:7px 0;color:#fff1d8;overflow-wrap:anywhere}#dariusBossCaption small{font-size:9px;color:#e9bf76}#dariusBossCaption button{padding:6px 8px;font-size:9px;margin-right:6px}@media(max-width:700px){#dariusBossCaption p{font-size:10px;line-height:1.5}#dariusBossCaption small{font-size:8px}}';document.head.append(dariusBossStyle);
$('#dariusBossVoiceToggle').onclick=()=>{if(!polarState)return;const q=NVDariusBossVoice.ensure(polarState);q.muted=!q.muted;NVDariusBossVoice.suspend();NVDariusBossVoice.sync();syncSoundtrack();};$('#dariusBossRetry').onclick=()=>NVDariusBossVoice.retry();
const dariusBossRestore=NVEris.restore;NVEris.restore=raw=>({...dariusBossRestore(raw),dariusBossVoice:NVDariusBossVoice.restore(raw?.dariusBossVoice)});
const dariusBossStep=NVFactionLeaders.step;NVFactionLeaders.step=(s,dt)=>{dariusBossStep(s,dt);if(s===polarState)NVDariusBossVoice.tick(dt);};
const dariusBossHUD=updatePolarHUD;updatePolarHUD=()=>{dariusBossHUD();NVDariusBossVoice.sync();};
const dariusBossPause=pausePolar;pausePolar=on=>{if(on)NVDariusBossVoice.suspend();const result=dariusBossPause(on);NVDariusBossVoice.sync();syncSoundtrack();return result;};
const dariusBossExit=exitPolar;exitPolar=()=>{NVDariusBossVoice.stop();const result=dariusBossExit();syncSoundtrack();return result;};
const dariusBossSave=savePolarWorld;savePolarWorld=(...args)=>{NVDariusBossVoice.remember();return dariusBossSave(...args);};

// Combat barks are independent of the friendly station conversations.
const VISHARA_BOSS_AUDIO=__VISHARA_BOSS_AUDIO__;
const NVVisharaBossVoice=(()=>{
 const clips=VISHARA_BOSS_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 const fresh=()=>({line:0,time:0,gap:0,muted:false});
 function restore(raw){return{line:Math.max(0,Math.min(9,Math.floor(Number(raw?.line)||0))),time:Math.max(0,Math.min(120,Number(raw?.time)||0)),gap:Math.max(0,Math.min(5,Number(raw?.gap)||0)),muted:raw?.muted===true};}
 const ensure=s=>NVEris.ensure(s).visharaBossVoice||(NVEris.ensure(s).visharaBossVoice=fresh());
 const context=()=>gameActive&&polarState?NVFactionLeaders.engaged(polarState).find(t=>t.id==='vishara')||null:null;
 const active=()=>!!context()&&!gamePaused&&!document.hidden&&!blurred&&!erisConversation;
 function remember(){if(owner&&index>=0){const q=ensure(owner),a=clips[index];if(q.line===index&&!q.muted&&q.gap===0&&a&&Number.isFinite(a.currentTime))q.time=Math.min(VISHARA_BOSS_AUDIO[index].duration,a.currentTime);}}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;blocked=false;failed=false;}
 function play(){const q=owner&&ensure(owner),a=clips[index];if(!q||!a||q.muted||q.gap>0||!active()||blocked||failed||pending||!a.paused||a.ended)return;const t=++token;pending=true;Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});}
 function sync(){if(!context()){stop();render();return;}const q=ensure(polarState);if(owner!==polarState||index!==q.line){stop();owner=polarState;index=q.line;const a=clips[index];a.currentTime=Math.min(q.time,VISHARA_BOSS_AUDIO[index].duration);a.onended=()=>{if(owner===polarState&&ensure(owner).line===index){ensure(owner).time=VISHARA_BOSS_AUDIO[index].duration;ensure(owner).gap=2.5;}};a.onerror=()=>{failed=true;pending=false;};}if(!active()){if(pending||clips[index]&&!clips[index].paused)suspend();}else play();render();}
 function next(){if(!owner)return;const q=ensure(owner);suspend();q.line=(q.line+1)%10;q.time=0;q.gap=0;index=-1;sync();}
 function tick(dt){sync();if(!active()||!owner||!Number.isFinite(dt)||dt<=0)return;const q=ensure(owner),r=VISHARA_BOSS_AUDIO[q.line],a=clips[index];dt=Math.min(.1,dt);if(q.gap>0){q.gap=Math.max(0,q.gap-dt);if(q.gap===0)next();return;}if(q.muted||failed){q.time+=dt;if(q.time>=r.duration)q.gap=2.5;}else if(!blocked&&!pending){q.time=Math.max(q.time,a.currentTime);if(a.ended)q.gap=2.5;}render();}
 const speaking=()=>active()&&!!owner&&!ensure(owner).muted&&!clips[index]?.paused&&!clips[index]?.ended;
 function retry(){if(blocked){blocked=false;sync();}}
 function render(){const visible=active()&&owner&&ensure(owner).gap===0;visharaBossCaption.hidden=!visible;if(!visible)return;const q=ensure(owner);$('#visharaBossLine').textContent=VISHARA_BOSS_AUDIO[q.line].text;$('#visharaBossCount').textContent='VISHARA / '+String(q.line+1).padStart(2,'0')+' / 10';$('#visharaBossVoiceToggle').textContent=q.muted?'VOICE OFF':'VOICE ON';$('#visharaBossRetry').hidden=!blocked;$('#visharaBossAudioStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();render();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
 return{clips,fresh,restore,ensure,context,active,remember,suspend,stop,sync,tick,next,speaking,retry,index:()=>index};
})();
const visharaBossCaption=document.createElement('section');visharaBossCaption.id='visharaBossCaption';visharaBossCaption.hidden=true;visharaBossCaption.innerHTML='<small id="visharaBossCount"></small><p id="visharaBossLine"></p><small id="visharaBossAudioStatus" aria-live="polite"></small><div><button id="visharaBossVoiceToggle" class="polar-button">VOICE ON</button><button id="visharaBossRetry" class="polar-button" hidden>PLAY VOICE</button></div>';leaderHUD.append(visharaBossCaption);
const visharaBossStyle=document.createElement('style');visharaBossStyle.textContent='#visharaBossCaption[hidden]{display:none!important}#visharaBossCaption{border-top:1px solid #d88b4260;margin-top:10px;padding-top:9px}#visharaBossCaption p{font:12px/1.65 Consolas;margin:7px 0;color:#fff1d8;overflow-wrap:anywhere}#visharaBossCaption small{font-size:9px;color:#e9bf76}#visharaBossCaption button{padding:6px 8px;font-size:9px;margin-right:6px}@media(max-width:700px){#visharaBossCaption p{font-size:10px;line-height:1.5}#visharaBossCaption small{font-size:8px}}';document.head.append(visharaBossStyle);
$('#visharaBossVoiceToggle').onclick=()=>{if(!polarState)return;const q=NVVisharaBossVoice.ensure(polarState);q.muted=!q.muted;NVVisharaBossVoice.suspend();NVVisharaBossVoice.sync();syncSoundtrack();};$('#visharaBossRetry').onclick=()=>NVVisharaBossVoice.retry();
const visharaBossRestore=NVEris.restore;NVEris.restore=raw=>({...visharaBossRestore(raw),visharaBossVoice:NVVisharaBossVoice.restore(raw?.visharaBossVoice)});
const visharaBossStep=NVFactionLeaders.step;NVFactionLeaders.step=(s,dt)=>{visharaBossStep(s,dt);if(s===polarState)NVVisharaBossVoice.tick(dt);};
const visharaBossHUD=updatePolarHUD;updatePolarHUD=()=>{visharaBossHUD();NVVisharaBossVoice.sync();};
const visharaBossPause=pausePolar;pausePolar=on=>{if(on)NVVisharaBossVoice.suspend();const result=visharaBossPause(on);NVVisharaBossVoice.sync();syncSoundtrack();return result;};
const visharaBossExit=exitPolar;exitPolar=()=>{NVVisharaBossVoice.stop();const result=visharaBossExit();syncSoundtrack();return result;};
const visharaBossSave=savePolarWorld;savePolarWorld=(...args)=>{NVVisharaBossVoice.remember();return visharaBossSave(...args);};
