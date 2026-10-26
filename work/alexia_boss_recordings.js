// Combat barks are independent of the friendly station conversations.
const ALEXIA_BOSS_AUDIO=__ALEXIA_BOSS_AUDIO__;
const NVAlexiaBossVoice=(()=>{
 const clips=ALEXIA_BOSS_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 const fresh=()=>({line:0,time:0,gap:0,muted:false});
 function restore(raw){return{line:Math.max(0,Math.min(9,Math.floor(Number(raw?.line)||0))),time:Math.max(0,Math.min(120,Number(raw?.time)||0)),gap:Math.max(0,Math.min(5,Number(raw?.gap)||0)),muted:raw?.muted===true};}
 const ensure=s=>NVEris.ensure(s).alexiaBossVoice||(NVEris.ensure(s).alexiaBossVoice=fresh());
 const context=()=>gameActive&&polarState?NVFactionLeaders.engaged(polarState).find(t=>t.id==='alexia')||null:null;
 const active=()=>!!context()&&!gamePaused&&!document.hidden&&!blurred&&!erisConversation;
 function remember(){if(owner&&index>=0){const q=ensure(owner),a=clips[index];if(q.line===index&&!q.muted&&q.gap===0&&a&&Number.isFinite(a.currentTime))q.time=Math.min(ALEXIA_BOSS_AUDIO[index].duration,a.currentTime);}}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;blocked=false;failed=false;}
 function play(){const q=owner&&ensure(owner),a=clips[index];if(!q||!a||q.muted||q.gap>0||!active()||blocked||failed||pending||!a.paused||a.ended)return;const t=++token;pending=true;Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});}
 function sync(){if(!context()){stop();render();return;}const q=ensure(polarState);if(owner!==polarState||index!==q.line){stop();owner=polarState;index=q.line;const a=clips[index];a.currentTime=Math.min(q.time,ALEXIA_BOSS_AUDIO[index].duration);a.onended=()=>{if(owner===polarState&&ensure(owner).line===index){ensure(owner).time=ALEXIA_BOSS_AUDIO[index].duration;ensure(owner).gap=2.5;}};a.onerror=()=>{failed=true;pending=false;};}if(!active()){if(pending||clips[index]&&!clips[index].paused)suspend();}else play();render();}
 function next(){if(!owner)return;const q=ensure(owner);suspend();q.line=(q.line+1)%10;q.time=0;q.gap=0;index=-1;sync();}
 function tick(dt){sync();if(!active()||!owner||!Number.isFinite(dt)||dt<=0)return;const q=ensure(owner),r=ALEXIA_BOSS_AUDIO[q.line],a=clips[index];dt=Math.min(.1,dt);if(q.gap>0){q.gap=Math.max(0,q.gap-dt);if(q.gap===0)next();return;}if(q.muted||failed){q.time+=dt;if(q.time>=r.duration)q.gap=2.5;}else if(!blocked&&!pending){q.time=Math.max(q.time,a.currentTime);if(a.ended)q.gap=2.5;}render();}
 const speaking=()=>active()&&!!owner&&!ensure(owner).muted&&!clips[index]?.paused&&!clips[index]?.ended;
 function retry(){if(blocked){blocked=false;sync();}}
 function render(){const visible=active()&&owner&&ensure(owner).gap===0;alexiaBossCaption.hidden=!visible;if(!visible)return;const q=ensure(owner);$('#alexiaBossLine').textContent=ALEXIA_BOSS_AUDIO[q.line].text;$('#alexiaBossCount').textContent='ALEXIA / '+String(q.line+1).padStart(2,'0')+' / 10';$('#alexiaBossVoiceToggle').textContent=q.muted?'VOICE OFF':'VOICE ON';$('#alexiaBossRetry').hidden=!blocked;$('#alexiaBossAudioStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();render();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
 return{clips,fresh,restore,ensure,context,active,remember,suspend,stop,sync,tick,next,speaking,retry,index:()=>index};
})();
const alexiaBossCaption=document.createElement('section');alexiaBossCaption.id='alexiaBossCaption';alexiaBossCaption.hidden=true;alexiaBossCaption.innerHTML='<small id="alexiaBossCount"></small><p id="alexiaBossLine"></p><small id="alexiaBossAudioStatus" aria-live="polite"></small><div><button id="alexiaBossVoiceToggle" class="polar-button">VOICE ON</button><button id="alexiaBossRetry" class="polar-button" hidden>PLAY VOICE</button></div>';leaderHUD.append(alexiaBossCaption);
const alexiaBossStyle=document.createElement('style');alexiaBossStyle.textContent='#alexiaBossCaption[hidden]{display:none!important}#alexiaBossCaption{border-top:1px solid #d88b4260;margin-top:10px;padding-top:9px}#alexiaBossCaption p{font:12px/1.65 Consolas;margin:7px 0;color:#fff1d8;overflow-wrap:anywhere}#alexiaBossCaption small{font-size:9px;color:#e9bf76}#alexiaBossCaption button{padding:6px 8px;font-size:9px;margin-right:6px}@media(max-width:700px){#alexiaBossCaption p{font-size:10px;line-height:1.5}#alexiaBossCaption small{font-size:8px}}';document.head.append(alexiaBossStyle);
$('#alexiaBossVoiceToggle').onclick=()=>{if(!polarState)return;const q=NVAlexiaBossVoice.ensure(polarState);q.muted=!q.muted;NVAlexiaBossVoice.suspend();NVAlexiaBossVoice.sync();syncSoundtrack();};$('#alexiaBossRetry').onclick=()=>NVAlexiaBossVoice.retry();
const alexiaBossRestore=NVEris.restore;NVEris.restore=raw=>({...alexiaBossRestore(raw),alexiaBossVoice:NVAlexiaBossVoice.restore(raw?.alexiaBossVoice)});
const alexiaBossStep=NVFactionLeaders.step;NVFactionLeaders.step=(s,dt)=>{alexiaBossStep(s,dt);if(s===polarState)NVAlexiaBossVoice.tick(dt);};
const alexiaBossHUD=updatePolarHUD;updatePolarHUD=()=>{alexiaBossHUD();NVAlexiaBossVoice.sync();};
const alexiaBossPause=pausePolar;pausePolar=on=>{if(on)NVAlexiaBossVoice.suspend();const result=alexiaBossPause(on);NVAlexiaBossVoice.sync();syncSoundtrack();return result;};
const alexiaBossExit=exitPolar;exitPolar=()=>{NVAlexiaBossVoice.stop();const result=alexiaBossExit();syncSoundtrack();return result;};
const alexiaBossSave=savePolarWorld;savePolarWorld=(...args)=>{NVAlexiaBossVoice.remember();return alexiaBossSave(...args);};
