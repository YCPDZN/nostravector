// Combat barks are independent of the friendly station conversations.
const ARCHAMUS_BOSS_AUDIO=__ARCHAMUS_BOSS_AUDIO__;
const NVArchamusBossVoice=(()=>{
 const clips=ARCHAMUS_BOSS_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 const fresh=()=>({line:0,time:0,gap:0,muted:false});
 function restore(raw){return{line:Math.max(0,Math.min(19,Math.floor(Number(raw?.line)||0))),time:Math.max(0,Math.min(120,Number(raw?.time)||0)),gap:Math.max(0,Math.min(5,Number(raw?.gap)||0)),muted:raw?.muted===true};}
 const ensure=s=>NVEris.ensure(s).archamusBossVoice||(NVEris.ensure(s).archamusBossVoice=fresh());
 const context=()=>gameActive&&polarState?NVFactionLeaders.engaged(polarState).find(t=>t.id==='archamus'&&t.enemy.bossPhase!==2)||null:null;
 const active=()=>!!context()&&!gamePaused&&!document.hidden&&!blurred&&!archamusConversation;
 function remember(){if(owner&&index>=0){const q=ensure(owner),a=clips[index];if(q.line===index&&!q.muted&&q.gap===0&&a&&Number.isFinite(a.currentTime))q.time=Math.min(ARCHAMUS_BOSS_AUDIO[index].duration,a.currentTime);}}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;blocked=false;failed=false;}
 function play(){const q=owner&&ensure(owner),a=clips[index];if(!q||!a||q.muted||q.gap>0||!active()||blocked||failed||pending||!a.paused||a.ended)return;const t=++token;pending=true;Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});}
 function sync(){if(!context()){stop();render();return;}const q=ensure(polarState);if(owner!==polarState||index!==q.line){stop();owner=polarState;index=q.line;const a=clips[index];a.currentTime=Math.min(q.time,ARCHAMUS_BOSS_AUDIO[index].duration);a.onended=()=>{if(owner===polarState&&ensure(owner).line===index){ensure(owner).time=ARCHAMUS_BOSS_AUDIO[index].duration;ensure(owner).gap=2.5;}};a.onerror=()=>{failed=true;pending=false;};}if(!active()){if(pending||clips[index]&&!clips[index].paused)suspend();}else play();render();}
 function next(){if(!owner)return;const q=ensure(owner);suspend();q.line=(q.line+1)%20;q.time=0;q.gap=0;index=-1;sync();}
 function tick(dt){sync();if(!active()||!owner||!Number.isFinite(dt)||dt<=0)return;const q=ensure(owner),r=ARCHAMUS_BOSS_AUDIO[q.line],a=clips[index];dt=Math.min(.1,dt);if(q.gap>0){q.gap=Math.max(0,q.gap-dt);if(q.gap===0)next();return;}if(q.muted||failed){q.time+=dt;if(q.time>=r.duration)q.gap=2.5;}else if(!blocked&&!pending){q.time=Math.max(q.time,a.currentTime);if(a.ended)q.gap=2.5;}render();}
 const speaking=()=>active()&&!!owner&&!ensure(owner).muted&&!clips[index]?.paused&&!clips[index]?.ended;
 function retry(){if(blocked){blocked=false;sync();}}
 function render(){const visible=active()&&owner&&ensure(owner).gap===0;archamusBossCaption.hidden=!visible;if(!visible)return;const q=ensure(owner);$('#archamusBossLine').textContent=ARCHAMUS_BOSS_AUDIO[q.line].text;$('#archamusBossCount').textContent='ARCHAMUS / '+String(q.line+1).padStart(2,'0')+' / 20';$('#archamusBossVoiceToggle').textContent=q.muted?'VOICE OFF':'VOICE ON';$('#archamusBossRetry').hidden=!blocked;$('#archamusBossAudioStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();render();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
 return{clips,fresh,restore,ensure,context,active,remember,suspend,stop,sync,tick,next,speaking,retry,index:()=>index};
})();
const archamusBossCaption=document.createElement('section');archamusBossCaption.id='archamusBossCaption';archamusBossCaption.hidden=true;archamusBossCaption.innerHTML='<small id="archamusBossCount"></small><p id="archamusBossLine"></p><small id="archamusBossAudioStatus" aria-live="polite"></small><div><button id="archamusBossVoiceToggle" class="polar-button">VOICE ON</button><button id="archamusBossRetry" class="polar-button" hidden>PLAY VOICE</button></div>';leaderHUD.append(archamusBossCaption);
const archamusBossStyle=document.createElement('style');archamusBossStyle.textContent='#archamusBossCaption[hidden]{display:none!important}#archamusBossCaption{border-top:1px solid #d88b4260;margin-top:10px;padding-top:9px}#archamusBossCaption p{font:12px/1.65 Consolas;margin:7px 0;color:#fff1d8;overflow-wrap:anywhere}#archamusBossCaption small{font-size:9px;color:#e9bf76}#archamusBossCaption button{padding:6px 8px;font-size:9px;margin-right:6px}@media(max-width:700px){#archamusBossCaption p{font-size:10px;line-height:1.5}#archamusBossCaption small{font-size:8px}}';document.head.append(archamusBossStyle);
$('#archamusBossVoiceToggle').onclick=()=>{if(!polarState)return;const q=NVArchamusBossVoice.ensure(polarState);q.muted=!q.muted;NVArchamusBossVoice.suspend();NVArchamusBossVoice.sync();syncSoundtrack();};$('#archamusBossRetry').onclick=()=>NVArchamusBossVoice.retry();
const archamusBossRestore=NVEris.restore;NVEris.restore=raw=>({...archamusBossRestore(raw),archamusBossVoice:NVArchamusBossVoice.restore(raw?.archamusBossVoice)});
const archamusBossStep=NVFactionLeaders.step;NVFactionLeaders.step=(s,dt)=>{archamusBossStep(s,dt);if(s===polarState)NVArchamusBossVoice.tick(dt);};
const archamusBossHUD=updatePolarHUD;updatePolarHUD=()=>{archamusBossHUD();NVArchamusBossVoice.sync();};
const archamusBossPause=pausePolar;pausePolar=on=>{if(on)NVArchamusBossVoice.suspend();const result=archamusBossPause(on);NVArchamusBossVoice.sync();syncSoundtrack();return result;};
const archamusBossExit=exitPolar;exitPolar=()=>{NVArchamusBossVoice.stop();const result=archamusBossExit();syncSoundtrack();return result;};
const archamusBossSave=savePolarWorld;savePolarWorld=(...args)=>{NVArchamusBossVoice.remember();return archamusBossSave(...args);};
