// Independent weather clocks live in the character's existing manual-save snapshot.
const NVFrozenWeather=(()=>{
 const CLEAR=300,DURATION=300,FIRST=600,WARNING=30;
 const interval=id=>{const b=NVSol.byId[id];return b?.galaxy==='cyrannus'?120:['andromeda','chimaera'].includes(b?.galaxy)?1800:600;};
 const duration=id=>interval(id)===120?60:DURATION;
 const fresh=id=>({storm:false,remaining:interval(id),warned:false,heat:100,cycle:0,interval:interval(id)});
 function type(id){return id==='anaxa'?'firestorm':id==='mars'||/Terrestrial|Paradise/i.test(NVSol.byId[id]?.category||'')?'duststorm':/ravaged|scorched/i.test(NVSol.byId[id]?.category||'')?'firestorm':'blizzard';}
 function eligible(id){const b=NVSol.byId[id];return !!b&&(!['andromeda','cyrannus','triangulum','chimaera'].includes(b.galaxy)||b.atmosphere)&&id!=='earth'&&!b.giant&&(type(id)==='firestorm'||id==='mars'||b.galaxy&&b.atmosphere||b.style==='ice'||/frozen|frost|ice moon|ice planet/i.test(b.category));}
 function restore(raw){const out={};if(raw&&typeof raw==='object')for(const [id,v]of Object.entries(raw)){if(!eligible(id)||!v||typeof v!=='object')continue;out[id]={storm:v.storm===true,remaining:Number.isFinite(v.remaining)?Math.max(0,Math.min(v.storm?duration(id):interval(id),v.interval===interval(id)?v.remaining:v.remaining/(v.storm?DURATION:Number(v.interval)||FIRST)*(v.storm?duration(id):interval(id)))):interval(id),interval:interval(id),warned:v.warned===true,heat:Number.isFinite(v.heat)?Math.max(0,Math.min(100,v.heat)):100,cycle:Number.isInteger(v.cycle)?Math.max(0,v.cycle):0};}return out;}
 function ensure(s){const e=NVEris.ensure(s);return e.frozenWeather||(e.frozenWeather={});}
 function applicable(s){return !!s?.space&&eligible(s.space.body)&&['landed','cockpit','atmosphere'].includes(s.space.phase)&&!s.space.ecologyOcean;}
 function state(s){const all=ensure(s),id=s.space.body;const q=all[id]||(all[id]=fresh(id)),n=interval(id);if(q.interval!==n){q.remaining=Math.min(q.remaining,q.storm?duration(id):n);q.interval=n;}return q;}
 function safe(s){const p=s.space;if(p.phase==='cockpit'||p.phase==='atmosphere')return true;if(p.phase!=='landed')return false;
  if(p.body==='mars'&&typeof NVKhazglar!=='undefined'){const hut=NVKhazglar.location(s);if(Math.abs(s.x-hut.x)<3.1&&Math.abs(s.z-hut.z)<3.1)return true;}
  if(p.body==='charon'&&Math.abs(s.x-24)<8&&Math.abs(s.z-25)<9&&!p.geo?.global)return true;
  if(p.body==='eris'&&Math.abs(s.x)<10&&s.z>51&&s.z<67)return true;
  // A roof provides weather protection only when it is over the player's head.
  if(typeof NVConstruction!=='undefined')for(const q of NVConstruction.localPieces(s)){if(q.type!=='roof')continue;const dx=s.x-q.x,dz=s.z-q.z,c=Math.cos(q.yaw),t=Math.sin(q.yaw);if(Math.abs(dx*c-dz*t)<1.9&&Math.abs(dx*t+dz*c)<1.9&&(s.jumpOffset||0)<2)return true;}
  return false;
 }
 function view(s){if(!applicable(s))return null;const q=state(s);return{...q,safe:safe(s),id:s.space.body,type:type(s.space.body)};}
 function step(s,dt){const events=[];if(!applicable(s)||!Number.isFinite(dt)||dt<=0)return events;const q=state(s);let left=dt;while(left>1e-8){const t=Math.min(left,Math.max(0,q.remaining));q.heat=Math.max(0,Math.min(100,q.heat+(q.storm&&!safe(s)?-100/180*(s.suitInsulated?.7:1):safe(s)?1.2:.25)*t));q.remaining=Math.max(0,q.remaining-t);left-=t;
   if(!q.storm&&!q.warned&&q.remaining<=WARNING){q.warned=true;events.push('warning');}
   if(q.remaining<=1e-8){q.storm=!q.storm;q.remaining=q.storm?duration(s.space.body):interval(s.space.body)-duration(s.space.body);q.warned=false;if(q.storm){q.cycle++;events.push('start');}else events.push('clear');}
   if(q.heat<=0){q.heat=35;s.space.phase='cockpit';s.x=s.space.landingX;s.z=s.space.landingZ;NVSpace.notice(s.space,(type(s.space.body)==='firestorm'?'SUIT OVERHEATING / ':type(s.space.body)==='duststorm'?'SUIT FILTERS DEPLETED / ':'SUIT HEAT DEPLETED / ')+'EMERGENCY RECOVERY TO YOUR SHIP');events.push('recovery');}
  }return events;
 }
 const previousRestore=NVEris.restore;NVEris.restore=raw=>{const e=previousRestore(raw);e.frozenWeather=restore(raw?.frozenWeather);return e;};
 const previousStep=NVSpace.step;NVSpace.step=(s,dt,input={})=>{const motion=previousStep(s,dt,input);const events=step(s,Math.min(.1,Math.max(0,dt||0)));if(events.length&&typeof frozenWeatherEvents==='function')frozenWeatherEvents(s,events);return motion;};
 return{CLEAR,DURATION,FIRST,WARNING,interval,duration,fresh,type,eligible,restore,ensure,applicable,state,safe,view,step};
})();
