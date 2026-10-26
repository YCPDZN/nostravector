// Owned bases and occupied colonies. Travel changes live state; persistence remains manual.
const NVBaseTravel=(()=>{
 function anchor(s){const p=s.space;return{system:p.system||NVSol.byId[p.body]?.system||'sol',geo:JSON.parse(JSON.stringify(NVWorldFlight.ensure(s))),landingX:p.landingX,landingZ:p.landingZ,landingElevation:Number.isFinite(p.landingElevation)?p.landingElevation:0};}
 function valid(a){return a&&typeof a.system==='string'&&a.geo&&[a.geo.lat,a.geo.lon,a.landingX,a.landingZ].every(Number.isFinite);}
 function registry(s){const e=NVEris.ensure(s);return e.baseTravel||(e.baseTravel={});}
 function candidates(s){const e=NVEris.ensure(s),out=[],seen=new Set();
  for(const p of NVConstruction.ensure(s).built){if(p.type!=='foundation'||seen.has(p.site))continue;seen.add(p.site);out.push({id:'construction:'+p.site,body:p.body,site:p.site,x:p.x,z:p.z});}
  e.bases.forEach((p,i)=>out.push({id:'field:'+i,body:p.body,x:p.x,z:p.z}));
  for(const c of Object.values(e.governance?.colonies||{}))if(!c.captured&&!out.some(q=>q.body===c.body&&Math.hypot(q.x-c.x,q.z-c.z)<40))out.push({id:'colony:'+c.body,body:c.body,x:c.x,z:c.z,colony:c});
  return out.filter(q=>NVSol.byId[q.body]&&[q.x,q.z].every(Number.isFinite)&&e.playerFaction.claims.includes(q.body)&&NVEris.faction(s,q.body)==='CUSTOM');
 }
 function remember(s){for(const q of candidates(s)){if(q.colony){const c=q.colony;registry(s)[q.id]={system:NVSol.byId[q.body].system||c.system||'sol',geo:{global:!!c.global,lat:c.lat||0,lon:c.lon||0,altitude:0,heading:0,look:-.25,course:null,landing:false,orbit:false},landingX:c.landingX||0,landingZ:c.landingZ||0,landingElevation:0};continue;}if(q.body!==s.space.body||q.site&&q.site!==NVConstruction.site(s)||registry(s)[q.id])continue;registry(s)[q.id]=anchor(s);}}
 function list(s){remember(s);return candidates(s).map((q,i)=>{const b=NVSol.byId[q.body];return{...q,label:b.name+' · '+(q.colony?'Occupied colony':q.site?'Your base':'Occupied base')+' '+(i+1)};});}
 function legacy(s,q){const p=NVSol.byId[q.body],coords=q.site?.slice(q.body.length+1).split(',').map(Number),global=coords?.length===2&&coords.every(Number.isFinite),geo={lat:global?coords[0]:q.body==='earth'?-28:0,lon:global?coords[1]:q.body==='earth'?18:0,global:!!global,altitude:0,heading:0,look:-.25,course:null,landing:false,orbit:false};return{system:p.system||'sol',geo,landingX:global?geo.lon*1000:q.x+24,landingZ:global?geo.lat*1000:q.z-24};}
 function travel(s,id){const q=list(s).find(q=>q.id===id);if(!q)return false;const stored=registry(s)[id],a=valid(stored)?stored:legacy(s,q),p=s.space;
  p.system=a.system;p.body=q.body;p.target=q.body;p.geo=NVWorldFlight.restore(a.geo,q.body);Object.assign(p.geo,{altitude:0,course:null,landing:false,orbit:false});p.phase='landed';p.landingX=a.landingX;p.landingZ=a.landingZ;p.landingElevation=Number.isFinite(a.landingElevation)?a.landingElevation:0;p.speed=0;p.throttle=0;p.autopilot=false;p.focusReleased=true;p.warp=null;p.ecologyOcean=false;p.elapsed=0;p.damageFlash=0;p.crew=s.friendQuest==='recruited';
  if(p.interior)p.interior.active=false;p.combatActive=false;
  const pieces=q.site?NVConstruction.ensure(s).built.filter(v=>v.site===q.site):[];const front=pieces.length?Math.min(...pieces.map(v=>v.z)):q.z;
  s.x=q.x+8;s.z=front-12;s.yaw=0;s.cameraYaw=0;s.cameraPitch=.3;s.jumpOffset=0;s.jumpVelocity=0;s.car=null;s.friend={...(s.friend||{}),x:s.x+2,z:s.z-2,yaw:0};
  if(s.eris.nyrexia?.recruited)Object.assign(s.eris.nyrexia,{body:q.body,x:s.x-2,z:s.z-2,yaw:0,speed:0});
  NVWorldFlight.syncPosition(s);p.landingElevation=NVWorldFlight.ground(s,p.landingX,p.landingZ);if(!p.visited.includes(q.body))p.visited.push(q.body);
  if(typeof NVGalaxy!=='undefined'){const g=NVGalaxy.ensure(s);if(!g.visited.includes(p.system))g.visited.push(p.system);if(typeof NVCluster!=='undefined')NVCluster.ensure(s);}
  if(typeof NVCustomCrew!=='undefined')NVCustomCrew.followStep(s,0);
  if(typeof NVCarax!=='undefined'&&/(?:airless|ravaged) fortress/i.test(NVSol.byId[q.body].category)){const fortress=NVCarax.ensure(s);fortress.deck=0;if(fortress.rover)fortress.rover.driving=false;}
  NVSurfaceNavigation.clear(s);NVSpace.notice(p,'TELEPORT COMPLETE / '+NVSol.byId[q.body].name.toUpperCase()+' · MANUAL SAVE TO KEEP PROGRESS');return true;
 }
 const place=NVConstruction.place;NVConstruction.place=(s,...args)=>{const result=place(s,...args);remember(s);return result;};
 const build=NVEris.build;NVEris.build=s=>{const result=build(s);if(result.ok)remember(s);return result;};
 const restore=NVEris.restore;NVEris.restore=raw=>{const e=restore(raw);e.baseTravel={};for(const [key,a]of Object.entries(raw?.baseTravel||{})){if(key.length<160&&valid(a))e.baseTravel[key]=JSON.parse(JSON.stringify(a));}return e;};
 return{list,travel,remember,anchor};
})();
const baseTravelControls=document.createElement('div');baseTravelControls.innerHTML='<label for="ownBaseDestination">YOUR BASES / FAST TRAVEL</label><select id="ownBaseDestination" aria-label="Your fast travel base"></select><button id="fastTravelOwnBase" class="polar-button">FAST TRAVEL TO YOUR BASE</button><small id="ownBaseTravelHint">Build a foundation or field base to unlock a destination. Fast travel does not save your game.</small>';surfaceNavPanel.querySelector('div').append(baseTravelControls);
const baseTravelStyle=document.createElement('style');baseTravelStyle.textContent='#ownBaseDestination{width:100%;max-width:100%;padding:9px;margin:6px 0;background:#0b1b29;color:#dcecf6;border:1px solid #567782;font:11px Consolas}#ownBaseTravelHint{display:block;font:11px/1.5 Consolas;color:#c1d9e6;margin-top:6px}#fastTravelOwnBase{width:100%}';document.head.append(baseTravelStyle);
let ownBaseListKey='';const ownBaseHUD=updatePolarHUD;updatePolarHUD=()=>{ownBaseHUD();if(!gameActive||!polarState)return;const bases=NVBaseTravel.list(polarState),key=bases.map(q=>q.id+q.label).join('|'),select=$('#ownBaseDestination');if(key!==ownBaseListKey){const old=select.value;select.replaceChildren(...bases.map(q=>{const o=document.createElement('option');o.value=q.id;o.textContent=q.label;return o;}));if(bases.some(q=>q.id===old))select.value=old;ownBaseListKey=key;}$('#fastTravelOwnBase').disabled=gamePaused||!bases.length;$('#ownBaseTravelHint').textContent=bases.length?'Travel to your base entrance. Your ship returns to its recorded landing pad. Manual saves only.':'Build a foundation or field base to unlock a destination.';};
$('#fastTravelOwnBase').onclick=()=>{if(!gameActive||gamePaused||!NVBaseTravel.travel(polarState,$('#ownBaseDestination').value))return;polarKeys.clear();polarAutoWalk=false;polarSprint=false;polarVelocity=0;polarPoseSpeed=0;polarTrail.length=0;setHUDTools(false);surfaceAtlasOpen=false;$('#surfaceAtlas').hidden=true;toggleSolChart(false);stopKhazglarGuard();updatePolarHUD();polarCanvas.focus();};
