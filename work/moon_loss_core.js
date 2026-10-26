// One story conquest, followed by a player-chosen takeover at an abandoned relay.
const NVMoonLoss=(()=>{
 const fresh=()=>({triggered:false,complete:false,target:'',site:'',x:0,z:0,lat:null,lon:null,anchorX:0,anchorZ:0});
 function restore(raw){const q=fresh();if(!raw)return q;q.triggered=raw.triggered===true;q.complete=raw.complete===true;q.target=NVSol.byId[raw.target]&&!['moon','mars','earth','mercury','eris','dysnomia'].includes(raw.target)?raw.target:'';q.site=typeof raw.site==='string'?raw.site.slice(0,120):'';q.x=Number.isFinite(raw.x)?raw.x:0;q.z=Number.isFinite(raw.z)?raw.z:0;for(const k of ['lat','lon','anchorX','anchorZ'])q[k]=Number.isFinite(raw[k])?raw[k]:k==='lat'||k==='lon'?null:0;return q;}
 const ensure=s=>NVEris.ensure(s).moonLoss||(NVEris.ensure(s).moonLoss=fresh());
 function choose(s){return 'triton';}
 function step(s){const q=ensure(s),reward=s.eris?.khazglar?.reward;if(!q.triggered&&(reward?.charonDecision||reward?.charonRecruited)){
  const e=NVEris.ensure(s),w=NVSolWar.ensure(s);q.triggered=true;if(typeof NVGovernance==='undefined'||!NVGovernance.protectedWorld(s,'moon')){e.playerFaction.claims=e.playerFaction.claims.filter(id=>id!=='moon');w.owners.moon='TERRA';}delete w.sieges.moon;const h=w.controlHistory.moon||(w.controlHistory.moon=[]);if(!h.includes('TERRA'))h.push('TERRA');q.target=choose(s);NVOccupation.sync(s);w.notice='ALERT: TERRA IMPERIA HAS CONQUERED THE MOON. FIND A NEW BASE TO TAKE OVER.';w.noticeTime=28;NVSpace.notice(s.space,w.notice);
 }
 if(q.triggered&&!q.complete&&q.target!=='triton'){q.target='triton';q.site='';q.x=0;q.z=0;q.lat=null;q.lon=null;q.anchorX=0;q.anchorZ=0;}
 if(q.triggered&&!q.target)q.target=choose(s);
 if(q.triggered&&!q.complete&&s.space?.body===q.target&&s.space.phase==='landed'&&!s.space.ecologyOcean&&!q.site){q.site=NVConstruction.site(s);q.x=s.space.landingX+120;q.z=s.space.landingZ-80;q.anchorX=s.space.landingX;q.anchorZ=s.space.landingZ;q.lat=s.space.geo?.global?s.space.geo.lat:null;q.lon=s.space.geo?.global?s.space.geo.lon:null;}
 return q;}
 function local(s){const q=ensure(s);if(!q.triggered||q.complete||s.space?.body!==q.target||s.space.phase!=='landed')return null;if(q.lat!==null&&s.space.geo?.global){const g=s.space.geo;return{...q,x:s.space.landingX+NVWorldFlight.wrap(q.lon-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180))+q.x-q.anchorX,z:s.space.landingZ+(q.lat-g.lat)*24000+q.z-q.anchorZ};}return q.site===NVConstruction.site(s)?q:null;}
 function canCapture(s){const q=local(s);return !!q&&Math.hypot(s.x-(q.x+9),s.z-(q.z-7))<6;}
 function capture(s){if(!canCapture(s))return false;const q=ensure(s),base=local(s),e=NVEris.ensure(s);if(!NVEris.claim(s,q.target))return false;if(!e.bases.some(b=>b.body===q.target&&Math.hypot(b.x-base.x,b.z-base.z)<2))e.bases.push({body:q.target,x:base.x,z:base.z});q.complete=true;NVQuests.update(s);if(typeof NVBaseTravel!=='undefined')NVBaseTravel.remember(s);NVSpace.notice(s.space,'RELAY BASE SECURED / '+NVSol.byId[q.target].name.toUpperCase()+' / YOUR FACTION');return true;}
 return{fresh,restore,ensure,step,local,canCapture,capture};
})();
const moonLossRestore=NVEris.restore;NVEris.restore=raw=>{const e=moonLossRestore(raw);e.moonLoss=NVMoonLoss.restore(raw?.moonLoss);return e;};
function createReplacementBaseDraw({object}){return(s,time,ground)=>{const q=NVMoonLoss.local(s);if(!q||Math.hypot(s.x-q.x,s.z-q.z)>900)return;const x=q.x,z=q.z,y=ground(x,z),wall=[.36,.39,.40],rust=[.32,.24,.17];object(x,y+.05,z,15,.1,13,rust);for(const side of [-1,1]){object(x+side*5,y+2,z,.25,4,9,wall);object(x+side*3.3,y+2,z-4.5,3.4,4,.2,wall);}object(x,y+2,z+4.5,10,4,.2,wall);object(x,y+4.15,z,11,.3,10,[.18,.25,.29]);object(x+9,y+1.25,z-7,1.6,2.5,1.1,[.14,.21,.26]);object(x+9,y+2,z-7.57,1.2,.65,.03,[.95,.73,.25],0,.7);object(x+9,y+4.2,z-7,.08,3.3,.08,wall);object(x+10,y+5.5,z-7,2,1,.06,[.58,.61,.61]);};}
