// Named officers use small, non-combat transports. Their journeys never move quest
// NPCs, change governor postings, capture territory, or enter military targeting.
const NVCommandTravel=(()=>{
 const LIMIT=12,cache=new WeakMap();
 const ensure=s=>NVEris.ensure(s).commandTravel||(NVEris.ensure(s).commandTravel={systems:{}});
 const validPoint=p=>Array.isArray(p)&&p.length===3&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<1e8);
 const worlds=system=>(system==='sol'?NVSol.worlds:NVCluster.bodyLists[system]||[]).filter(b=>!b.stellar&&!b.station);
 const hash=NVFrontlineCampaign.hash;
 function palette(seed,id){
  const n=hash(seed+':command-ship:'+id),h=n%360/60,s=.65+(n>>>10)%20/100,l=.53+(n>>>18)%14/100,c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h%2-1)),m=l-c/2;
  const accent=([[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h)]).map(v=>v+m);
  return{hull:accent.map(v=>.055+v*.19),accent};
 }
 function available(s){return !!s?.space&&NVChapter3Access.chapter(s)>=3&&s.africaStarted&&s.africaStage==='complete';}
 function shown(s){return available(s)&&s.space.phase==='flight'&&!s.space.warp&&!s.space.interior?.active&&!NVBlackHoleGates.state(s)&&!NVBattlePerformance.active(s)&&!NVCatharsisFinal.active(s);}
 function manifest(s,system){
  NVGalacticDiplomacy.register(s);const list=worlds(system),d=NVGalacticDiplomacy.ensure(s),factions=[...new Set(list.map(b=>NVGalacticDiplomacy.owner(s,b.id)))].filter(f=>f!=='UNCLAIMED'&&NVGalacticDiplomacy.visible(s,f)&&NVGalacticDiplomacy.alive(s,f)),out=[],seen=new Set();
  // Round-robin by faction keeps a crowded system from filling with one navy.
  const groups=factions.map(f=>{const own=list.filter(b=>NVGalacticDiplomacy.owner(s,b.id)===f);return NVFieldCommand.members(s,f,{body:''}).map(n=>{
   const post=NVCrewDiplomacy.ensure(s).assignments[n.id],colony=f==='CUSTOM'&&Object.values(NVGovernance.ensure(s).colonies).find(c=>!c.captured&&NVGovernance.governors(c).includes(n.id));
   const preferred=post?.body||colony?.body,home=own.find(b=>b.id===preferred)||own.find(b=>NVFieldCommand.capital(s,b.id,f))||own[hash(n.id)%own.length];
   return{...n,faction:f,home:home.id};
  });});
  for(let i=0;i<3;i++)for(const group of groups){const n=group[i];if(!n||out.length>=LIMIT||seen.has(n.id))continue;seen.add(n.id);out.push(n);}
  return out;
 }
 function port(body,seed){const b=NVSol.byId[body],angle=(seed%6283)/1000,r=b.radius+160+seed%90;return{position:[b.position[0]+Math.sin(angle)*r,b.position[1]+b.radius+180+(seed>>>8)%100,b.position[2]+Math.cos(angle)*r],angle,r};}
 function make(s,n,system){const id='command:'+n.id,seed=hash(s.seed+':'+id),p=port(n.home,seed);return{id,commandTransport:true,imperialGovernor:!!n.imperialGovernor,officer:n.id,captain:n.name,role:n.role,faction:n.faction,originFaction:n.faction,leader:n.role==='LEADER'?n.id:null,home:n.home,body:n.home,system,front:-1,hp:100,maxHp:100,position:p.position,yaw:0,pitch:0,speed:0,fire:0,target:-1,mode:'inspection',travel:null,orbitAngle:p.angle,orbitRadius:p.r,orbitY:p.position[1]-NVSol.byId[n.home].position[1],elapsed:seed%70/10,dwell:8+seed%12,trip:0,commandPalette:palette(s.seed,id)};}
 function state(s){
  if(!available(s))return null;const system=NVGalaxy.system(s);if(!customCrewSystemUnlocked(s,system)||!worlds(system).length)return null;
  const all=ensure(s),q=all.systems[system]||(all.systems[system]={clock:0,fleet:[]});let memo=cache.get(s);
  if(!memo||memo.system!==system||memo.row!==q||q.clock>=memo.until){
   const roster=manifest(s,system),previous=new Map(q.fleet.map(v=>[v.officer,v]));
   q.fleet=roster.map(n=>{let v=previous.get(n.id);if(!v||v.faction!==n.faction)v=make(s,n,system);Object.assign(v,{captain:n.name,role:n.role,imperialGovernor:!!n.imperialGovernor,leader:n.role==='LEADER'?n.id:null,home:n.home,commandPalette:palette(s.seed,v.id)});return v;});
   cache.set(s,{system,row:q,until:q.clock+3});
  }
  return q;
 }
 function destination(s,v){
  const list=worlds(v.system),d=NVGalacticDiplomacy.ensure(s),fronts=list.filter(b=>NVGalacticDiplomacy.relation(s,v.faction,NVGalacticDiplomacy.owner(s,b.id))==='WAR'&&!NVFrontlineCampaign.storyLock(s,b.id)&&d.wars.some(w=>w.stage==='active'&&[w.aggressor,w.defender].includes(v.faction)&&[w.aggressor,w.defender].includes(NVGalacticDiplomacy.owner(s,b.id))));
  if(v.trip%2&&v.body!==v.home)return v.home;
  const peaceful=list.filter(b=>NVGalacticDiplomacy.relation(s,v.faction,NVGalacticDiplomacy.owner(s,b.id))!=='WAR'),pool=(fronts.length&&v.trip%2===0?fronts:peaceful).filter(b=>b.id!==v.body);
  return pool.length?pool[hash(s.seed+':'+v.id+':'+v.trip)%pool.length].id:'';
 }
 function depart(s,v){const body=destination(s,v);if(!body)return;const end=port(body,hash(v.id+':'+v.trip)).position,height=Math.max(...worlds(v.system).map(b=>b.position[1]+b.radius+400),NVCluster.meta[v.system]?.starRadius+400||800,v.position[1],end[1])+350;
  const start=v.position.slice(),distance=NVSpace.distance(start,end),duration=Math.max(10,(distance+height*2)/340);
  v.travel={body,start,end,height,duration,elapsed:0};v.mode='transit';v.elapsed=0;
 }
 function step(s,dt){
  if(!available(s)||!Number.isFinite(dt)||dt<=0)return;const q=state(s);if(!q)return;dt=Math.min(.1,dt);q.clock+=dt;
   for(const v of q.fleet){const old=v.position.slice();v.fire=0;v.target=-1;
   if(v.travel){const t=v.travel;t.elapsed=Math.min(t.duration,t.elapsed+dt);const u=t.elapsed/t.duration,b=1-u,e=u*u*(3-2*u);v.position=t.start.map((x,i)=>i===1?b*b*b*x+3*b*b*u*t.height+3*b*u*u*t.height+u*u*u*t.end[i]:x+(t.end[i]-x)*e);
    if(t.elapsed===t.duration){v.body=t.body;v.travel=null;v.mode='inspection';v.elapsed=0;v.trip++;const body=NVSol.byId[v.body],dx=v.position[0]-body.position[0],dz=v.position[2]-body.position[2];v.orbitAngle=Math.atan2(dx,dz);v.orbitRadius=Math.hypot(dx,dz);v.orbitY=v.position[1]-body.position[1];}
   }else{const b=NVSol.byId[v.body];v.elapsed+=dt;v.orbitAngle+=dt*.025;v.position=[b.position[0]+Math.sin(v.orbitAngle)*v.orbitRadius,b.position[1]+v.orbitY,b.position[2]+Math.cos(v.orbitAngle)*v.orbitRadius];if(v.elapsed>=v.dwell)depart(s,v);}
   const delta=v.position.map((x,i)=>x-old[i]);v.speed=Math.hypot(...delta)/dt;if(v.speed>.001){v.yaw=NVFleetMotion.turn(v.yaw,Math.atan2(delta[0],delta[2]),.7,dt);v.pitch=NVFleetMotion.turn(v.pitch,Math.atan2(delta[1],Math.hypot(delta[0],delta[2])),.4,dt);}
  }
 }
 const ships=s=>shown(s)?(state(s)?.fleet||[]).filter(v=>NVGalacticDiplomacy.alive(s,v.faction)&&(!v.imperialGovernor||NVImperiaGovernors.available(s,v.officer))):[];
 function restore(raw){
  const systems={};for(const [id,row]of Object.entries(raw?.systems||{})){const list=worlds(id),bodies=new Set(list.map(b=>b.id));if(!list.length||!Array.isArray(row?.fleet))continue;const fleet=[],seen=new Set();
   for(const v of row.fleet.slice(0,LIMIT)){
    if(typeof v?.officer!=='string'||v.officer.length>100||seen.has(v.officer)||typeof v.faction!=='string'||v.faction.length>100||!bodies.has(v.body)||!bodies.has(v.home)||!validPoint(v.position)||![v.yaw,v.pitch,v.orbitAngle,v.orbitRadius,v.orbitY,v.elapsed,v.dwell,v.trip].every(Number.isFinite)||v.orbitRadius<=0||v.dwell<=0)continue;
    const t=v.travel;if(t&&(!bodies.has(t.body)||!validPoint(t.start)||!validPoint(t.end)||![t.height,t.duration,t.elapsed].every(Number.isFinite)||t.duration<=0||t.elapsed<0||t.elapsed>t.duration))continue;
    seen.add(v.officer);fleet.push({...v,id:'command:'+v.officer,commandTransport:true,system:id,front:-1,hp:100,maxHp:100,fire:0,target:-1,mode:t?'transit':'inspection',speed:0,captain:String(v.captain||v.officer).slice(0,100),role:v.role==='LEADER'?'LEADER':'GOVERNOR',travel:t?{...t,start:t.start.slice(),end:t.end.slice()}:null,position:v.position.slice()});
   }
   systems[id]={clock:Number.isFinite(row.clock)?Math.max(0,Math.min(1e10,row.clock)):0,fleet};
  }return{systems};
 }
 return{LIMIT,ensure,worlds,palette,available,shown,manifest,state,destination,depart,step,ships,restore};
})();
const commandTravelRestore=NVEris.restore;NVEris.restore=raw=>({...commandTravelRestore(raw),commandTravel:NVCommandTravel.restore(raw?.commandTravel)});
const commandTravelShips=NVSolWar.ships;NVSolWar.ships=s=>[...commandTravelShips(s),...NVCommandTravel.ships(s)];
const commandTravelDamage=NVSolWar.damage;NVSolWar.damage=(s,id,...args)=>String(id).startsWith('command:')?[]:commandTravelDamage(s,id,...args);
const commandTravelTick=stepEcology;stepEcology=dt=>{commandTravelTick(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState)NVCommandTravel.step(polarState,dt);};
const commandTravelHUD=updatePolarHUD;updatePolarHUD=()=>{commandTravelHUD();if(!gameActive||gamePaused||!polarState||!NVCommandTravel.shown(polarState))return;const s=polarState,closest=NVSolWar.ships(s).filter(v=>v.hp>0).map(v=>({v,d:NVSpace.distance(v.position,s.space.position)})).filter(t=>t.d<9000).sort((a,b)=>a.d-b.d)[0];if(!closest?.v.commandTransport)return;const{v,d}=closest,destination=NVSol.byId[v.travel?.body||v.body];fleetContact.hidden=false;fleetContact.textContent=v.captain.toUpperCase()+' / '+v.role+' / '+NVDiplomacy.name(s,v.faction)+' / '+(v.travel?'EN ROUTE TO ':'INSPECTING ')+destination.name.toUpperCase()+' / '+Math.round(d)+' FLIGHT UNITS';};
