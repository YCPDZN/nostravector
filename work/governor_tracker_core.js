// Postings and observed journeys are tracked separately; looking up an officer never moves an NPC.
const NVGovernorTracker=(()=>{
 const ensure=s=>NVEris.ensure(s).governorTracker||(NVEris.ensure(s).governorTracker={tracked:'',reports:{}});
 const validBody=id=>!!NVSol.byId[id]&&!NVSol.byId[id].stellar;
 const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
 function restore(raw){const q={tracked:typeof raw?.tracked==='string'?raw.tracked.slice(0,100):'',reports:{}};for(const[id,r]of Object.entries(raw?.reports||{}).slice(-500)){if(id!==r?.id||id.length>100||typeof r.name!=='string'||typeof r.faction!=='string'||!validBody(r.body))continue;q.reports[id]={id,name:r.name.slice(0,100),faction:r.faction.slice(0,100),body:r.body,home:validBody(r.home)?r.home:r.body,system:NVSol.byId[r.body].system||'sol',to:validBody(r.to)?r.to:'',source:r.source==='field'?'field':'transport',seen:Math.max(0,Number(r.seen)||0),position:point(r.position)?r.position.slice():null,x:Number.isFinite(r.x)?r.x:0,z:Number.isFinite(r.z)?r.z:0,global:!!r.global,lat:Number.isFinite(r.lat)?r.lat:0,lon:Number.isFinite(r.lon)?r.lon:0};}return q;}
 function capture(s){if(!s?.space)return;const q=ensure(s),system=NVGalaxy.system(s),seen=Number.isFinite(s.playTime)?s.playTime:0;
  for(const v of s.eris?.commandTravel?.systems?.[system]?.fleet||[]){if(v.role!=='GOVERNOR'||!validBody(v.body)||!point(v.position)||v.imperialGovernor&&!NVImperiaGovernors.available(s,v.officer))continue;q.reports[v.officer]={id:v.officer,name:v.captain,faction:v.faction,home:v.home,body:v.body,system,to:v.travel?.body||'',position:v.position.slice(),source:'transport',seen};}
  const field=s.space.phase==='landed'&&!s.space.interior?.active?NVFieldCommand.peek(s):null;
  for(const a of field?.context?.body===s.space.body?field.actors:[]){if(a.role!=='GOVERNOR'||a.hp<=0||!validBody(s.space.body)||a.imperialGovernor&&!NVImperiaGovernors.available(s,a.sourceId))continue;const geo=NVWorldFlight.coords(s,a.x,a.z),old=q.reports[a.sourceId];q.reports[a.sourceId]={id:a.sourceId,name:a.name,faction:a.faction,home:old?.home||s.space.body,body:s.space.body,system,to:'',source:'field',seen,x:a.x,z:a.z,global:!!s.space.geo?.global,lat:geo.lat,lon:geo.lon};}
 }
 function rows(s){if(!s?.space)return[];NVGalacticDiplomacy.register(s);const map=new Map(),g=NVGovernance.ensure(s),posts=NVCrewDiplomacy.ensure(s).assignments,report=ensure(s).reports;
  for(const c of Object.values(g.colonies))if(!c.captured&&NVEris.faction(s,c.body)==='CUSTOM')for(const id of NVGovernance.governors(c))map.set(id,{id,name:NVGovernance.memberName(s,id),faction:'CUSTOM',body:c.body,home:c.body,source:'own',colony:c});
  for(const a of Object.values(posts)){const n=NVCrewDiplomacy.member(s,a.id);if(n&&a.hp>0)map.set(a.id,{id:a.id,name:n.name,faction:a.faction,body:a.body,home:a.body,source:'foreign',assignment:a});}
  for(const id of NVImperiaGovernors.IDS)if(NVImperiaGovernors.serving(s,id))map.set(id,{id,name:NVParty.members.find(n=>n.id===id).name,faction:'TERRA',body:'mercury',home:'mercury',source:'imperial',regrouping:NVImperiaGovernors.regrouping(s,id)});
  for(const[id,r]of Object.entries(s.eris?.governorReturns||{}))if(r.remaining>0&&!map.has(id))map.set(id,{id,name:r.name,faction:r.faction,body:r.body,home:r.body,source:'return'});
  for(const r of Object.values(report)){
   if(NVGovernorReturns.active(s,r.id))continue;
   if(!NVGalacticDiplomacy.visible(s,r.faction)||!NVGalacticDiplomacy.alive(s,r.faction))continue;
   const current=map.get(r.id);if(current?.regrouping||current&&current.faction!==r.faction)continue;
   // A companion who has been recalled or dismissed no longer holds this old post.
   if(!current&&(NVParty.members.some(n=>n.id===r.id)||NVCrewDiplomacy.member(s,r.id)))continue;
   if(NVImperiaGovernors.IDS.includes(r.id)&&r.faction==='TERRA'&&!NVImperiaGovernors.serving(s,r.id))continue;
   map.set(r.id,{...r,...(current?{home:current.home}:{}),post:current||null,body:r.to||r.body,from:r.body,transport:r.source==='transport'});
  }
  return[...map.values()].filter(r=>validBody(r.body)&&NVGalacticDiplomacy.visible(s,r.faction)&&NVGalacticDiplomacy.alive(s,r.faction)).map(r=>({...r,system:NVSol.byId[r.body].system||'sol',relation:r.faction==='CUSTOM'?'YOURS':NVDiplomacy.relation(s,r.faction)==='WAR'?'ENEMY':NVDiplomacy.relation(s,r.faction)==='ALLIED'?'ALLIED':'NEUTRAL',offworld:!!r.transport||!NVEris.groundPlay(s)||r.body!==NVEris.world(s),away:r.body!==r.home||!!r.to})).sort((a,b)=>a.name.localeCompare(b.name));
 }
 const selected=s=>rows(s).find(r=>r.id===ensure(s).tracked)||null;
 function choose(s,id){capture(s);if(!rows(s).some(r=>r.id===id))return false;ensure(s).tracked=id;return true;}
 function clear(s){ensure(s).tracked='';}
 function location(s,r){if(r.source==='own')return NVGovernance.location(s,r.colony);if(r.source==='foreign')return NVCrewDiplomacy.location(s,r.assignment);if(r.source==='field'){const p=s.space,g=p.geo;return r.global&&g?.global?{x:p.landingX+NVWorldFlight.wrap(r.lon-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180)),z:p.landingZ+(r.lat-g.lat)*24000}:{x:r.x,z:r.z};}return null;}
 function waypoint(s){const r=selected(s),p=s?.space;if(!r||!p)return null;const label=r.name+' / '+(r.regrouping?'Regrouping · Mercury':r.transport?'Governor transport':NVSol.byId[r.body].name),here=NVGalaxy.system(s);
  if(here!==r.system){if(['landed','cockpit','off'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label};return{galaxy:true,system:r.system,label};}
  if(r.transport&&point(r.position)&&p.phase==='flight')return{space:true,position:r.position,radius:4,label};
  if(p.body===r.body&&p.phase==='landed'){const pos=location(s,r);return pos?{...pos,label}:null;}
  if(['landed','cockpit','off'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label};
  if(p.body===r.body&&p.phase==='atmosphere'){const a=r.colony||r.assignment;if(a)return{geo:{lat:a.lat,lon:a.lon},label};return null;}
  const b=NVSol.byId[r.body];return{space:true,position:b.position,radius:b.radius,label};
 }
 return{ensure,restore,capture,rows,selected,choose,clear,location,waypoint};
})();
const governorTrackerRestore=NVEris.restore;NVEris.restore=raw=>({...governorTrackerRestore(raw),governorTracker:NVGovernorTracker.restore(raw?.governorTracker)});
const governorTrackerSnapshot=NVAntarctica.snapshot;NVAntarctica.snapshot=s=>{NVGovernorTracker.capture(s);return governorTrackerSnapshot(s);};
const governorTrackerWaypoint=missionWaypointTarget;missionWaypointTarget=s=>NVGovernorTracker.waypoint(s)||governorTrackerWaypoint(s);
let governorReportElapsed=0;
const governorReportTick=stepEcology;stepEcology=dt=>{governorReportTick(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState&&Number.isFinite(dt)&&dt>0){governorReportElapsed+=dt;if(governorReportElapsed>=1){governorReportElapsed=0;NVGovernorTracker.capture(polarState);}}};
