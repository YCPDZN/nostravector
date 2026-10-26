const NVHawthorneTransmission=(()=>{
 const QUOTES=__HAWTHORNE_QUOTES__;
 const fresh=()=>({armed:false,started:false,finished:false,line:0,voiceTime:0,marsAssigned:false,marsArrived:false});
 function restore(raw){const q=fresh();if(!raw||typeof raw!=='object')return q;for(const key of ['armed','started','finished','marsAssigned','marsArrived'])q[key]=raw[key]===true;q.line=Number.isInteger(raw.line)?Math.max(0,Math.min(9,raw.line)):0;q.voiceTime=Number.isFinite(raw.voiceTime)?Math.max(0,Math.min(600,raw.voiceTime)):0;if(q.finished||q.marsAssigned||q.marsArrived)q.started=true;if(q.started)q.marsAssigned=true;return q;}
 function ensure(s){const w=NVSolWar.ensure(s);return w.moonTransmission||(w.moonTransmission=fresh());}
 function observe(s){const q=ensure(s),p=s?.space,w=NVSolWar.ensure(s);if(!p)return q;const sol=(p.system||'sol')==='sol';
  if(!q.started&&NVSolWar.active(w)&&w.thomasAlive&&sol&&p.body==='moon'&&['landed','cockpit','atmosphere','launch','ascent'].includes(p.phase))q.armed=true;
  if(!q.started&&NVSolWar.active(w)&&w.thomasAlive&&sol&&p.body==='moon'&&p.phase==='flight'&&!p.warp&&(q.armed||p.visited?.includes('moon'))){q.started=true;q.marsAssigned=true;}
  if(q.marsAssigned&&sol&&p.body==='mars'&&p.phase==='landed')q.marsArrived=true;
  return q;
 }
 function next(s){const q=ensure(s);if(!q.started||q.finished)return false;q.voiceTime=0;if(q.line<9)q.line++;else q.finished=true;return true;}
 const oldRestore=NVSolWar.restore;NVSolWar.restore=raw=>{const w=oldRestore(raw);w.moonTransmission=restore(raw?.moonTransmission);return w;};
 const oldStep=NVSpace.step;NVSpace.step=(s,dt,input={})=>{observe(s);const motion=oldStep(s,dt,input);observe(s);return motion;};
 return{QUOTES,fresh,restore,ensure,observe,next};
})();
