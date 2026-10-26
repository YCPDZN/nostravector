// The combat renderers use Chapter 1's acoustic envelope and smoothed mouth shapes.
const NVCourtCombatLips=(()=>{
 const states=new Map(),closed=()=>({jaw:0,width:1,round:0,teeth:0});
 function reset(id){states.delete(id);return closed();}
 function pose(id){const voice=id==='alexia'?NVAlexiaBossVoice:id==='vishara'?NVVisharaBossVoice:null;if(!voice?.speaking())return reset(id);const index=voice.index(),a=voice.clips[index],row=(id==='alexia'?ALEXIA_BOSS_AUDIO:VISHARA_BOSS_AUDIO)[index];if(!a||!row||a.paused||a.ended)return reset(id);const entry=prepareJamesAcoustics(a);let energy=0,progress=a.currentTime/(Number.isFinite(a.duration)&&a.duration>0?a.duration:row.duration);
  if(entry.envelope){const e=entry.envelope,i=Math.max(0,Math.min(e.rms.length-1,Math.floor(a.currentTime/e.hopSeconds)));energy=e.rms[i]||0;progress=e.spoken[i]||0;}else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}if(energy<.075)return reset(id);
  let state=states.get(id);if(!state||state.clip!==a){state={clip:a,time:0,lip:closed()};states.set(id,state);}const now=performance.now(),dt=state.time?Math.max(0,Math.min(.1,(now-state.time)/1000)):1/60,target=calculateJamesViseme(row.text,progress,energy),mix=Math.min(1,dt*20);state.time=now;for(const key of ['jaw','width','round','teeth'])state.lip[key]+=(target[key]-state.lip[key])*mix;return state.lip;
 }
 return{pose,reset};
})();
