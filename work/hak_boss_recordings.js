// Combat barks are independent of the friendly station conversations.
const HAK_BOSS_AUDIO=__HAK_BOSS_AUDIO__;
const NVHakBossVoice=(()=>{
 const clips=HAK_BOSS_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let owner=null,index=-1,token=0,pending=false,blocked=false,failed=false,blurred=false;
 const fresh=()=>({line:0,time:0,gap:0,muted:false});
 function restore(raw){return{line:Math.max(0,Math.min(19,Math.floor(Number(raw?.line)||0))),time:Math.max(0,Math.min(120,Number(raw?.time)||0)),gap:Math.max(0,Math.min(5,Number(raw?.gap)||0)),muted:raw?.muted===true};}
 const ensure=s=>NVEris.ensure(s).hakBossVoice||(NVEris.ensure(s).hakBossVoice=fresh());
 const context=()=>gameActive&&polarState?NVFactionLeaders.engaged(polarState).find(t=>t.id==='hak')||null:null;
 const active=()=>!!context()&&!gamePaused&&!document.hidden&&!blurred&&!erisConversation;
 function remember(){if(owner&&index>=0){const q=ensure(owner),a=clips[index];if(q.line===index&&!q.muted&&q.gap===0&&a&&Number.isFinite(a.currentTime))q.time=Math.min(HAK_BOSS_AUDIO[index].duration,a.currentTime);}}
 function suspend(){remember();token++;pending=false;clips[index]?.pause();}
 function stop(){suspend();owner=null;index=-1;blocked=false;failed=false;}
 function play(){const q=owner&&ensure(owner),a=clips[index];if(!q||!a||q.muted||q.gap>0||!active()||blocked||failed||pending||!a.paused||a.ended)return;const t=++token;pending=true;Promise.resolve().then(()=>{if(t===token&&active())return a.play();}).then(()=>{if(t!==token){if(clips[index]!==a||!active())a.pause();return;}pending=false;if(!active())a.pause();}).catch(()=>{if(t===token){pending=false;blocked=true;}});}
 function sync(){if(!context()){stop();render();return;}const q=ensure(polarState);if(owner!==polarState||index!==q.line){stop();owner=polarState;index=q.line;const a=clips[index];a.currentTime=Math.min(q.time,HAK_BOSS_AUDIO[index].duration);a.onended=()=>{if(owner===polarState&&ensure(owner).line===index){ensure(owner).time=HAK_BOSS_AUDIO[index].duration;ensure(owner).gap=2.5;}};a.onerror=()=>{failed=true;pending=false;};}if(!active()){if(pending||clips[index]&&!clips[index].paused)suspend();}else play();render();}
 function next(){if(!owner)return;const q=ensure(owner);suspend();q.line=(q.line+1)%20;q.time=0;q.gap=0;index=-1;sync();}
 function tick(dt){sync();if(!active()||!owner||!Number.isFinite(dt)||dt<=0)return;const q=ensure(owner),r=HAK_BOSS_AUDIO[q.line],a=clips[index];dt=Math.min(.1,dt);if(q.gap>0){q.gap=Math.max(0,q.gap-dt);if(q.gap===0)next();return;}if(q.muted||failed){q.time+=dt;if(q.time>=r.duration)q.gap=2.5;}else if(!blocked&&!pending){q.time=Math.max(q.time,a.currentTime);if(a.ended)q.gap=2.5;}render();}
 const speaking=()=>active()&&!!owner&&!ensure(owner).muted&&!clips[index]?.paused&&!clips[index]?.ended;
 function retry(){if(blocked){blocked=false;sync();}}
 function render(){const visible=active()&&owner&&ensure(owner).gap===0;hakBossCaption.hidden=!visible;if(!visible)return;const q=ensure(owner);$('#hakBossLine').textContent=HAK_BOSS_AUDIO[q.line].text;$('#hakBossCount').textContent='HAK / '+String(q.line+1).padStart(2,'0')+' / 20';$('#hakBossVoiceToggle').textContent=q.muted?'VOICE OFF':'VOICE ON';$('#hakBossRetry').hidden=!blocked;$('#hakBossAudioStatus').textContent=failed?'VOICE UNAVAILABLE / CAPTIONS CONTINUE':blocked?'CLICK PLAY VOICE':'';}
 window.addEventListener('blur',()=>{blurred=true;suspend();render();});window.addEventListener('focus',()=>{blurred=false;sync();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
 return{clips,fresh,restore,ensure,context,active,remember,suspend,stop,sync,tick,next,speaking,retry,index:()=>index};
})();
const hakBossCaption=document.createElement('section');hakBossCaption.id='hakBossCaption';hakBossCaption.hidden=true;hakBossCaption.innerHTML='<small id="hakBossCount"></small><p id="hakBossLine"></p><small id="hakBossAudioStatus" aria-live="polite"></small><div><button id="hakBossVoiceToggle" class="polar-button">VOICE ON</button><button id="hakBossRetry" class="polar-button" hidden>PLAY VOICE</button></div>';leaderHUD.append(hakBossCaption);
const hakBossStyle=document.createElement('style');hakBossStyle.textContent='#hakBossCaption[hidden]{display:none!important}#hakBossCaption{border-top:1px solid #d88b4260;margin-top:10px;padding-top:9px}#hakBossCaption p{font:12px/1.65 Consolas;margin:7px 0;color:#fff1d8;overflow-wrap:anywhere}#hakBossCaption small{font-size:9px;color:#e9bf76}#hakBossCaption button{padding:6px 8px;font-size:9px;margin-right:6px}@media(max-width:700px){#hakBossCaption p{font-size:10px;line-height:1.5}#hakBossCaption small{font-size:8px}}';document.head.append(hakBossStyle);
$('#hakBossVoiceToggle').onclick=()=>{if(!polarState)return;const q=NVHakBossVoice.ensure(polarState);q.muted=!q.muted;NVHakBossVoice.suspend();NVHakBossVoice.sync();syncSoundtrack();};$('#hakBossRetry').onclick=()=>NVHakBossVoice.retry();
const hakBossRestore=NVEris.restore;NVEris.restore=raw=>({...hakBossRestore(raw),hakBossVoice:NVHakBossVoice.restore(raw?.hakBossVoice)});
const hakBossStep=NVFactionLeaders.step;NVFactionLeaders.step=(s,dt)=>{hakBossStep(s,dt);if(s===polarState)NVHakBossVoice.tick(dt);};
const hakBossHUD=updatePolarHUD;updatePolarHUD=()=>{hakBossHUD();NVHakBossVoice.sync();};
const hakBossPause=pausePolar;pausePolar=on=>{if(on)NVHakBossVoice.suspend();const result=hakBossPause(on);NVHakBossVoice.sync();syncSoundtrack();return result;};
const hakBossExit=exitPolar;exitPolar=()=>{NVHakBossVoice.stop();const result=hakBossExit();syncSoundtrack();return result;};
const hakBossSave=savePolarWorld;savePolarWorld=(...args)=>{NVHakBossVoice.remember();return hakBossSave(...args);};
