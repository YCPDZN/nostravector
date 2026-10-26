// Persistent named destinations reuse the existing orbit and spherical flight controls.
const NVSurfaceNavigation=(()=>{
 function sites(s){const system=s.space?.system||'sol',out=[];
  for(const q of NVOccupation.sync(s)){const b=NVSol.byId[q.body];if(!b||(b.system||'sol')!==system)continue;const faction=NVEris.faction(s,q.body);if(['UNCLAIMED','CUSTOM'].includes(faction))continue;
   const lat=NVAntarctica.clamp(q.lat+q.z/24000,-89.999,89.999),lon=NVWorldFlight.wrap(q.lon+q.x/(24000*Math.max(.05,Math.cos(lat*Math.PI/180))));
   out.push({id:'base:'+q.body,body:q.body,label:NVSolWar.label(NVSolWar.ensure(s),faction)+' base · '+b.name,faction,geo:{lat,lon},approach:{lat:lat-20/24000,lon},color:NVOccupation.palette(s,faction)[0]});
  }
  if(system==='sol')out.push({id:'olympus-mons',body:'mars',label:'Olympus Mons · Khazglar’s hut',geo:{...NVKhazglar.SUMMIT},approach:{lat:NVKhazglar.SUMMIT.lat-.003,lon:NVKhazglar.SUMMIT.lon},color:[1,.75,.35]});
  if(system==='sol')out.push({id:'charon-station',body:'charon',label:'Charon Space Station',geo:{...NVCharonStation.geo},approach:{...NVCharonStation.approach},color:[.3,.87,1]});
  if(system==='sol'){const bastion=!!s.eris?.solWar?.brownStory?.earthTaken,z=NVAntarctica.STATION.z;out.push({id:'antarctic-station',body:'earth',label:'Research station · '+(bastion?'Imperia bastion / Antarctica':'Antarctica'),geo:{lat:-78+z/24000,lon:20},approach:{lat:-78+(z-(bastion?230:28))/24000,lon:20},color:bastion?[.08,.85,.95]:[.85,.94,1]});}
  return out;
 }
 function restore(raw){return raw&&typeof raw.id==='string'&&raw.id.length<100?{id:raw.id,stage:['waiting','orbit','course','landing','arrived'].includes(raw.stage)?raw.stage:'waiting'}:null;}
 function current(s){const nav=NVEris.ensure(s).surfaceNavigation;return nav?sites(s).find(q=>q.id===nav.id)||null:null;}
 function clear(s){NVEris.ensure(s).surfaceNavigation=null;}
 function select(s,id){const target=sites(s).find(q=>q.id===id);if(!target)return false;const p=s.space;NVEris.ensure(s).surfaceNavigation={id,stage:'waiting'};
  if(p.phase==='flight'){NVSpace.select(s,target.body);NVSpace.cruise(s);NVEris.ensure(s).surfaceNavigation.stage='orbit';}
  else if(p.body===target.body&&p.phase==='atmosphere'){NVWorldFlight.setCourse(s,target.approach.lat,target.approach.lon);NVEris.ensure(s).surfaceNavigation.stage='course';}
  NVSpace.notice(p,'WAYPOINT / '+target.label.toUpperCase());return true;
 }
 function travel(s,id){const p=s.space,target=sites(s).find(q=>q.id===id);if(id!=='antarctic-station'||!target||!s.spaceshipFound||p.phase==='off'||p.hull<=0||p.warp)return false;
  p.body=target.body;p.target=target.body;p.phase='atmosphere';p.geo=NVWorldFlight.restore({...target.approach,altitude:1400,global:true,heading:0,look:-.25},target.body);p.ecologyOcean=false;p.autopilot=false;p.focusReleased=false;p.speed=0;p.throttle=0;p.combatActive=false;p.elapsed=0;if(p.interior)p.interior.active=false;s.aerialView=null;s.car=null;s.jumpOffset=0;s.jumpVelocity=0;
  NVEris.ensure(s).surfaceNavigation={id,stage:'landing'};NVWorldFlight.syncPosition(s);return NVWorldFlight.descendHere(s);
 }
 function step(s){const nav=NVEris.ensure(s).surfaceNavigation;if(!nav)return;const target=current(s);if(!target){clear(s);return;}const p=s.space;
  if(p.phase==='flight'&&nav.stage==='waiting'){NVSpace.select(s,target.body);NVSpace.cruise(s);nav.stage='orbit';}
  if(p.phase==='atmosphere'&&p.body===target.body){if(['waiting','orbit'].includes(nav.stage)){NVWorldFlight.setCourse(s,target.approach.lat,target.approach.lon);nav.stage='course';}else if(nav.stage==='course'&&!NVWorldFlight.ensure(s).course)nav.stage='arrived';}
  if(nav.stage==='landing'&&p.body===target.body&&p.phase==='landed')nav.stage='arrived';
 }
 function waypoint(s){const target=current(s);if(!target)return null;const p=s.space;
  if(p.body!==target.body||p.phase==='flight'){if(['landed','cockpit'].includes(p.phase))return{x:p.landingX,z:p.landingZ,label:'Return to ship · '+target.label};const b=NVSol.byId[target.body];return{space:true,position:b.position,radius:b.radius,label:target.label};}
  if(['atmosphere','ascent','descent'].includes(p.phase))return{geo:target.geo,label:target.label};
  if(target.id==='charon-station')return NVCharonStation.waypoint(s);
  if(target.id==='antarctic-station'){const g=p.geo,bastion=!!s.eris?.solWar?.brownStory?.earthTaken;let x=0,z=NVAntarctica.STATION.z-(bastion?65:12);if(g?.global){x=(p.landingX||0)+NVWorldFlight.wrap(20-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180));z+=(p.landingZ||0)+(-78-g.lat)*24000;}return{x,z,label:target.label};}
  if(target.id==='olympus-mons')return{...NVKhazglar.location(s),label:'Olympus Mons · Khazglar’s hut'};
  const base=NVOccupation.local(s).find(q=>q.body===target.body);return base?{x:base.x,z:base.z-8,label:target.label}:null;
 }
 const previousRestore=NVEris.restore;NVEris.restore=raw=>{const e=previousRestore(raw);e.surfaceNavigation=restore(raw?.surfaceNavigation);return e;};
 const selectWorld=NVSpace.select;NVSpace.select=(s,id)=>{const target=current(s);const result=selectWorld(s,id);if(result&&target&&target.body!==id)clear(s);return result;};
 const release=NVSpace.releaseCourse;NVSpace.releaseCourse=s=>{const result=release(s);if(result)clear(s);return result;};
 // Landing a tracked station must finish at its approach, rather than cancelling
 // the selected course and dropping onto the terrain currently beneath the ship.
 const descend=NVWorldFlight.descendHere;NVWorldFlight.descendHere=s=>{const target=current(s),nav=NVEris.ensure(s).surfaceNavigation;if(target?.id==='antarctic-station'&&s.space.body===target.body&&s.space.phase==='atmosphere'){const q=NVWorldFlight.ensure(s);Object.assign(q,target.approach);q.global=true;q.course=null;NVWorldFlight.syncPosition(s);const ok=descend(s);if(ok)nav.stage='landing';return ok;}return descend(s);};
 return{sites,current,select,clear,step,restore,waypoint,travel};
})();
