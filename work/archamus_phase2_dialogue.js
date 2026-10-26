// Combat barks are independent of the friendly station conversations.
const ARCHAMUS_PHASE2_AUDIO=__ARCHAMUS_PHASE2_AUDIO__;
const NVArchamusPhase2Dialogue=(()=>{
 const clips=ARCHAMUS_PHASE2_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 const fresh=()=>({line:0,time:0,gap:0,muted:false});
 function restore(raw){return{line:Math.max(0,Math.min(9,Math.floor(Number(raw?.line)||0))),time:Math.max(0,Math.min(120,Number(raw?.time)||0)),gap:Math.max(0,Math.min(5,Number(raw?.gap)||0)),muted:raw?.muted===true};}
 const ensure=s=>NVEris.ensure(s).archamusPhase2Dialogue||(NVEris.ensure(s).archamusPhase2Dialogue=fresh());
 const context=()=>gameActive&&polarState?NVFactionLeaders.engaged(polarState).find(t=>t.id==='archamus'&&t.enemy.bossPhase===2)||null:null;
 const active=()=>!!context()&&!gamePaused&&!document.hidden&&!blurred&&!archamusConversation;
 function remember(){if(owner&&index>=0){const q=ensure(owner),a=clips[index];if(q.line===index&&!q.muted&&q.gap===0&&a&&Number.isFinite(a.currentTime))q.time=Math.min(ARCHAMUS_PHASE2_AUDIO[index].duration,a.currentTime);}}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;blocked=false;failed=false;}
 function play(){const q=owner&&ensure(owner),a=clips[index];if(!q||!a||q.muted||q.gap>0||!active()||blocked||failed||pending||!a.paused||a.ended)return;const t=++token;pending=true;Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});}
 function sync(){if(!context()){stop();render();return;}const q=ensure(polarState);if(owner!==polarState||index!==q.line){stop();owner=polarState;index=q.line;const a=clips[index];a.currentTime=Math.min(q.time,ARCHAMUS_PHASE2_AUDIO[index].duration);a.onended=()=>{if(owner===polarState&&ensure(owner).line===index){ensure(owner).time=ARCHAMUS_PHASE2_AUDIO[index].duration;ensure(owner).gap=2.5;}};a.onerror=()=>{failed=true;pending=false;};}if(!active()){if(pending||clips[index]&&!clips[index].paused)suspend();}else play();render();}
 function next(){if(!owner)return;const q=ensure(owner);suspend();q.line=(q.line+1)%10;q.time=0;q.gap=0;index=-1;sync();}
 function tick(dt){sync();if(!active()||!owner||!Number.isFinite(dt)||dt<=0)return;const q=ensure(owner),r=ARCHAMUS_PHASE2_AUDIO[q.line],a=clips[index];dt=Math.min(.1,dt);if(q.gap>0){q.gap=Math.max(0,q.gap-dt);if(q.gap===0)next();return;}if(q.muted||failed){q.time+=dt;if(q.time>=r.duration)q.gap=2.5;}else if(!blocked&&!pending){q.time=Math.max(q.time,a.currentTime);if(a.ended)q.gap=2.5;}render();}
 const speaking=()=>active()&&!!owner&&!ensure(owner).muted&&!clips[index]?.paused&&!clips[index]?.ended;
 function retry(){if(blocked){blocked=false;sync();}}
 function render(){if(!context())return;$('#archamusBossVoiceToggle').hidden=false;const visible=active()&&owner&&ensure(owner).gap===0;archamusBossCaption.hidden=!visible;if(!visible)return;const q=ensure(owner);$('#archamusBossLine').textContent=ARCHAMUS_PHASE2_AUDIO[q.line].text;$('#archamusBossCount').textContent='ARCHAMUS / PHASE 2 / '+String(q.line+1).padStart(2,'0')+' / 10';$('#archamusBossVoiceToggle').textContent=q.muted?'VOICE OFF':'VOICE ON';$('#archamusBossRetry').hidden=!blocked;$('#archamusBossAudioStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();render();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
 return{LINES:ARCHAMUS_PHASE2_AUDIO.map(r=>r.text),clips,fresh,restore,ensure,context,active,remember,suspend,stop,sync,tick,next,speaking,retry,index:()=>index};
})();

const phase2RecordedToggle=$('#archamusBossVoiceToggle').onclick,phase2RecordedRetry=$('#archamusBossRetry').onclick;
$('#archamusBossVoiceToggle').onclick=()=>{if(!NVArchamusPhase2Dialogue.context())return phase2RecordedToggle();const q=NVArchamusPhase2Dialogue.ensure(polarState);q.muted=!q.muted;NVArchamusPhase2Dialogue.suspend();NVArchamusPhase2Dialogue.sync();syncSoundtrack();};
$('#archamusBossRetry').onclick=()=>NVArchamusPhase2Dialogue.context()?NVArchamusPhase2Dialogue.retry():phase2RecordedRetry();
const phase2RecordedRestore=NVEris.restore;NVEris.restore=raw=>({...phase2RecordedRestore(raw),archamusPhase2Dialogue:NVArchamusPhase2Dialogue.restore(raw?.archamusPhase2Dialogue)});
const phase2RecordedStep=NVFactionLeaders.step;NVFactionLeaders.step=(s,dt)=>{phase2RecordedStep(s,dt);if(s===polarState)NVArchamusPhase2Dialogue.tick(dt);};
const phase2RecordedHUD=updatePolarHUD;updatePolarHUD=()=>{phase2RecordedHUD();NVArchamusPhase2Dialogue.sync();};
const phase2RecordedPause=pausePolar;pausePolar=on=>{if(on)NVArchamusPhase2Dialogue.suspend();const r=phase2RecordedPause(on);NVArchamusPhase2Dialogue.sync();syncSoundtrack();return r;};
const phase2RecordedExit=exitPolar;exitPolar=()=>{NVArchamusPhase2Dialogue.stop();const r=phase2RecordedExit();syncSoundtrack();return r;};
const phase2RecordedSave=savePolarWorld;savePolarWorld=(...args)=>{NVArchamusPhase2Dialogue.remember();return phase2RecordedSave(...args);};
