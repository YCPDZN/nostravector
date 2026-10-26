const ORION_BOSS_AUDIO=__ORION_BOSS_AUDIO__;
const NVOrionCombatVoice=(()=>{
 const clips=new Map(ORION_BOSS_AUDIO.map(r=>[r.phase+':'+r.line,{...r,a:Object.assign(new Audio(r.source),{preload:'none',volume:.95})}]));
 const state={owner:null,key:'',current:null,token:0,muted:false,blocked:false,error:false,pending:false};
 function context(){
  if(!gameActive||gamePaused||document.hidden||!polarState)return null;
  const q=NVVengefulMascar.ensure(polarState);
  if(q.form===3){
   const r=NVMascarRampage.ensure(polarState);
   if(r.stage==='defeat'&&r.defeatTime>0&&!r.deathVoiceHeard&&r.system===NVGalaxy.system(polarState))return{q,phase:4,line:0};
   return NVMascarRampage.engaged(polarState)?{q,phase:3,line:r.quote}:null;
  }
  if(!NVVengefulMascar.fighting(polarState)||![1,2].includes(q.form)||q.enemy.mode==='transform')return null;
  return{q,phase:q.form,line:q.form===2?NVMascarFrame.ensure(q).quote:q.combatLine||0};
 }
 function clock(c,value,ended=false){
  if(c.phase===4){const r=NVMascarRampage.ensure(polarState);if(ended)r.deathVoiceHeard=true;else r.defeatTime=Math.max(r.defeatTime,value);}
  else if(c.phase===3){const r=NVMascarRampage.ensure(polarState);r.quoteTime=ended?value:Math.max(r.quoteTime,value);}
  else if(c.phase===2){const r=NVMascarFrame.ensure(c.q);r.quoteTime=ended?value:Math.max(r.quoteTime,value);}
  else c.q.combatTime=ended?value:Math.max(c.q.combatTime,value);
 }
 function capture(){if(state.owner===polarState&&state.current){const [phase,line]=state.key.split(':').map(Number);NVVengefulMascar.ensure(polarState).bossVoice={phase,line,time:state.current.a.currentTime||0};}}
 function stop(){capture();state.token++;for(const r of clips.values())r.a.pause();state.owner=null;state.key='';state.current=null;state.pending=false;}
 function play(){const c=context(),r=state.current;if(!c||!r||state.muted||state.pending||state.error||r.a.ended||!r.a.paused)return;const token=state.token;state.pending=true;state.blocked=false;resumeJamesAcoustics();Promise.resolve(r.a.play()).then(()=>{if(token!==state.token){if(state.current!==r||!context())r.a.pause();return;}state.pending=false;if(!context())r.a.pause();}).catch(()=>{if(token===state.token){state.pending=false;state.blocked=true;}});}
 function sync(){
  const c=context();if(!c){if(state.current)stop();return;}const key=c.phase+':'+c.line;
  if(state.owner!==polarState||state.key!==key){
   stop();state.owner=polarState;state.key=key;state.current=clips.get(key);state.error=false;state.blocked=false;
   const r=state.current;if(!r){for(const button of document.querySelectorAll('.orion-boss-voice'))button.textContent='CAPTIONS / UNRECORDED';return;}
   const token=state.token,saved=c.q.bossVoice,time=saved?.phase===c.phase&&saved?.line===c.line?saved.time:0,seek=()=>{if(token===state.token)try{r.a.currentTime=Math.min(time||0,r.duration-.02);}catch(e){}};
   seek();r.a.onloadedmetadata=seek;
   r.a.onended=()=>{if(token===state.token)clock(c,.5,true);};
   r.a.onerror=()=>{if(token===state.token){state.error=true;state.pending=false;}};
   prepareJamesAcoustics(r.a);
  }
  const r=state.current;if(!r){for(const button of document.querySelectorAll('.orion-boss-voice'))button.textContent='CAPTIONS / UNRECORDED';return;}if(!state.blocked)play();
  if(!state.muted&&!state.error&&!state.blocked&&!r.a.ended)clock(c,r.duration-(r.a.currentTime||0)+.5);
  for(const button of document.querySelectorAll('.orion-boss-voice'))button.textContent=state.blocked?'PLAY VOICE':state.muted?'VOICE OFF':'VOICE ON';
 }
 const speaking=()=>!!state.current&&!state.muted&&!!context()&&!state.current.a.paused&&!state.current.a.ended;
 let lipPose={jaw:0,width:1,round:0,teeth:0},lipClock=performance.now(),lipKey='';
 function lip(){const now=performance.now(),dt=Math.max(0,Math.min(.1,(now-lipClock)/1000));lipClock=now;if(!speaking()){lipKey='';return lipPose={jaw:0,width:1,round:0,teeth:0};}const c=context(),r=state.current,text=c.phase===4?NVMascarRampage.DEFEAT:c.phase===3?NVMascarRampage.QUOTES[c.line]:c.phase===2?NVMascarFrame.QUOTES[c.line]:NVVengefulMascar.COMBAT_QUOTES[c.line];const target=janiraRallyRecordedViseme(r.a,prepareJamesAcoustics(r.a),text);if(lipKey!==state.key){lipPose={jaw:0,width:1,round:0,teeth:0};lipKey=state.key;}const mix=Math.min(1,dt*20);for(const key of Object.keys(target))lipPose[key]+=(target[key]-lipPose[key])*mix;return lipPose;}
 function toggle(){if(state.blocked){state.blocked=false;play();return;}state.muted=!state.muted;if(state.muted)stop();sync();if(!state.muted)play();for(const button of document.querySelectorAll('.orion-boss-voice'))button.textContent=state.muted?'VOICE OFF':'VOICE ON';}
 return{clips,state,context,capture,stop,play,sync,speaking,lip,toggle};
})();
for(const panel of [mascarCombatPanel,mascarSpacePanel]){const button=document.createElement('button');button.className='polar-button orion-boss-voice';button.textContent='VOICE ON';button.onclick=NVOrionCombatVoice.toggle;panel.append(button);}
const bossVoiceRestore=NVVengefulMascar.restore;NVVengefulMascar.restore=r=>{const q=bossVoiceRestore(r),v=r?.bossVoice;q.bossVoice=v&&[1,2,3,4].includes(v.phase)?{phase:v.phase,line:Math.max(0,Math.min(v.phase===4?0:v.phase===2?14:v.phase===3?NVMascarRampage.QUOTES.length-1:9,Math.floor(Number(v.line)||0))),time:Math.max(0,Math.min(30,Number(v.time)||0))}:null;for(const key of ['bossMusicTime','bossPianoTime'])q[key]=Number.isFinite(r?.[key])?Math.max(0,r[key]):0;return q;};
const bossVoiceHUD=updatePolarHUD;updatePolarHUD=()=>{bossVoiceHUD();NVOrionCombatVoice.sync();if(NVOrionCombatVoice.speaking()&&typeof NVBCVoice!=='undefined')NVBCVoice.suspend();};
const bossVoicePause=pausePolar;pausePolar=on=>{if(on)NVOrionCombatVoice.stop();const result=bossVoicePause(on);if(!on)NVOrionCombatVoice.sync();return result;};
const bossVoiceSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true&&gameActive){NVOrionCombatVoice.capture();const q=NVVengefulMascar.ensure(polarState);q.bossMusicTime=soundtrack.trackTime('mascar');q.bossPianoTime=soundtrack.trackTime('mascar-piano');}return bossVoiceSave(manual);};
const bossVoiceStart=startAntarctica;startAntarctica=()=>{bossVoiceStart();if(gameActive){const q=NVVengefulMascar.ensure(polarState);soundtrack.seek('mascar',q.bossMusicTime||0);soundtrack.seek('mascar-piano',q.bossPianoTime||0);syncSoundtrack();}};
const bossVoiceExit=exitPolar;exitPolar=()=>{NVOrionCombatVoice.stop();return bossVoiceExit();};$('#worldToMenu').onclick=()=>exitPolar();
document.addEventListener('visibilitychange',()=>{if(document.hidden)NVOrionCombatVoice.stop();else NVOrionCombatVoice.sync();});document.addEventListener('pointerdown',e=>{if(e.target.closest('.orion-boss-voice'))return;if(NVOrionCombatVoice.state.blocked){NVOrionCombatVoice.state.blocked=false;NVOrionCombatVoice.play();}});
