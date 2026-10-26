const NVMercuryFinale=(()=>{
 const COUNT=12,FIRST_ID=9000,GROUPS=[{faction:'HUMAN',start:0,count:4},{faction:'CHOMPY',start:4,count:4},{faction:'RESISTANCE',start:8,count:4}];
 const fresh=()=>({arrived:false,musicTime:0,clock:0,roster:[]});
 function restore(r){return{arrived:r?.arrived===true,musicTime:Math.max(0,Math.min(100000,Number(r?.musicTime)||0)),clock:Math.max(0,Number(r?.clock)||0),roster:Array.isArray(r?.roster)?r.roster.filter(n=>typeof n?.name==='string').slice(0,100).map(n=>({name:n.name.slice(0,120)})):[]};}
 const ensure=s=>{const q=NVSiegeOfSol.ensure(s);return q.relief||(q.relief=fresh());};
 const active=s=>NVSiegeOfSol.raw(s)?.stage==='war'&&ensure(s).arrived&&(s.space?.system||'sol')==='sol';
 function enter(s){if(NVSiegeOfSol.raw(s)?.stage!=='war'||(s.space?.system||'sol')!=='sol'||s.space?.phase!=='flight'||ensure(s).arrived)return false;const q=ensure(s);q.arrived=true;q.roster=NVGovernance.members(s).map(n=>({name:n.name})).slice(0,100);NVSpace.notice(s.space,'THE SIEGE OF SOL / 12 ALLIED SHIPS ARE SUPPORTING THE APPROACH TO MERCURY.');return true;}
 const cache=new WeakMap();
 function ships(s){if(!active(s))return[];const q=ensure(s),p=s.space;let runtime=cache.get(s);if(!runtime||runtime.state!==q){const list=Array.from({length:COUNT},(_,i)=>{const f=GROUPS.find(g=>i>=g.start&&i<g.start+g.count).faction;return{id:FIRST_ID+i,faction:f,originFaction:f,system:'sol',home:f==='RESISTANCE'?'eris':'earth',body:p.body,captain:q.roster[i]?.name||(f==='RESISTANCE'?'Vael-Nyr '+(i+1):['Ari','Mara','Kian','Sera','Lena'][i%5]+' '+['Vale','Arden','Rowe','Solano','Morgan'][Math.floor(i/5)%5]+' / '+(i+1)),hp:400,maxHp:400,position:[0,0,0],yaw:0,pitch:0,front:-1,target:-1,fire:0,mode:'mercury-relief-formation',janiraInstanced:true,mercuryEscort:true,size:q.roster[i]?2.2:i%40===0?2:1};});runtime={state:q,list};cache.set(s,runtime);}
  const b=NVSol.byId.mercury;
  for(const [i,v]of runtime.list.entries()){const a=i/COUNT*Math.PI*2+q.clock*.025,r=b.radius*3+350+(i%3)*65;v.position=[b.position[0]+Math.cos(a)*r,b.position[1]+b.radius+220+(i%3)*45,b.position[2]+Math.sin(a)*r];v.yaw=-a;v.size=1.2;v.body='mercury';}return runtime.list;
 }

 function palette(s,f){if(f==='CHOMPY')return{hull:[.32,.12,.55],accent:[.15,.55,1]};return f==='CUSTOM'?{hull:[.10,.16,.21],accent:NVSiegeOfSol.rgb(NVGovernance.ensure(s).color)}:{hull:NVSiegeOfSol.palette(s,f)[0],accent:NVSiegeOfSol.palette(s,f)[1]};}
 function shots(s){return[];}
 return{COUNT,FIRST_ID,GROUPS,fresh,restore,ensure,active,enter,ships,palette,shots};
})();
const mercuryFinaleRestore=NVSiegeOfSol.restore;NVSiegeOfSol.restore=r=>({...mercuryFinaleRestore(r),relief:NVMercuryFinale.restore(r?.relief)});
const mercuryFleet=NVSolWar.ships;NVSolWar.ships=s=>[...mercuryFleet(s),...NVMercuryFinale.ships(s)];
function syncMercuryEntry(){if(!gameActive||!polarState)return;if(NVMercuryFinale.enter(polarState))soundtrack.seek('mercury',NVMercuryFinale.ensure(polarState).musicTime);}
const mercuryFinaleHUD=updatePolarHUD;updatePolarHUD=()=>{syncMercuryEntry();mercuryFinaleHUD();if(!gameActive||!NVMercuryFinale.active(polarState))return;if(!gamePaused&&polarState.space.phase==='flight')$('#hudMissionMeta').textContent+=' · 12 ALLIED ESCORTS';syncSoundtrack();};
const mercuryFinaleStep=stepEcology;stepEcology=dt=>{mercuryFinaleStep(dt);if(gameActive&&!gamePaused&&!document.hidden&&NVMercuryFinale.active(polarState))NVMercuryFinale.ensure(polarState).clock+=Math.max(0,Math.min(.2,dt));};
const mercuryFinaleSave=savePolarWorld;savePolarWorld=manual=>{if(manual===true&&gameActive&&polarState&&NVMercuryFinale.ensure(polarState).arrived)NVMercuryFinale.ensure(polarState).musicTime=soundtrack.trackTime('mercury');return mercuryFinaleSave(manual);};
const mercuryFinaleStart=startAntarctica;startAntarctica=()=>{mercuryFinaleStart();if(gameActive&&polarState){soundtrack.seek('mercury',NVMercuryFinale.ensure(polarState).musicTime);syncMercuryEntry();syncSoundtrack();}};
const mercuryFinaleRender=renderSpaceWorld;renderSpaceWorld=(s,...args)=>{if(!NVMercuryFinale.active(s)||s.space.phase!=='flight'){polarCanvas.dataset.mercuryEscortShips='0';polarCanvas.dataset.mercuryEscortBatches='0';}return mercuryFinaleRender(s,...args);};
