// Post-story fortress recaptures never reopen or rewrite the ending.
const NVFortressCampaign=(()=>{
 const fortress=id=>/(?:airless|ravaged) fortress/i.test(NVSol.byId[id]?.category||'');
 const deck=a=>(a.fortressSlot||1)===1?4:3;
 const rows=s=>Object.values(NVCrewDiplomacy.ensure(s).assignments).filter(a=>a.body==='carax'&&a.hp>0);
 const floorRows=s=>rows(s).filter(a=>deck(a)===NVCarax.ensure(s).deck);
 function prepare(s){const all=Object.values(NVCrewDiplomacy.ensure(s).assignments).filter(a=>a.body==='carax'),used=new Set();for(const a of all){if(![1,2,3].includes(a.fortressSlot)||used.has(a.fortressSlot))a.fortressSlot=[1,2,3].find(n=>!used.has(n))||3;used.add(a.fortressSlot);const hp=a.fortressSlot===1?3000000:1000000;if(a.maxHp!==hp){a.hp=Math.max(0,Math.min(hp,Math.round(hp*(a.hp/Math.max(1,a.maxHp)))));a.maxHp=hp;}}}
 const battle=s=>active(s)&&NVCarax.local(s)&&NVCarax.inside(s)&&floorRows(s).length>0;
 function home(s){
  if(!s||!chapter5Unlocked(s))return null;
  const q=NVCatharsisRoute.ensure(s).assault||(NVCatharsisRoute.ensure(s).assault=NVCarax.fresh()),d=NVGalacticDiplomacy.ensure(s),e=NVEris.ensure(s);
  // Repair pre-sandbox ledgers, but keep genuine later gifts and conquests.
  const oldOwner=d.owners.carax;
  if(!oldOwner||['CATHARSIS','UNCLAIMED'].includes(oldOwner)){
   if(NVEris.faction(s,'carax')==='CUSTOM'){d.owners.carax='CUSTOM';q.campaign={owner:'CUSTOM',stage:'home',round:0};q.secured.fill(true);for(const f of q.guards)for(const g of f)g.hp=0;q.forces=[];q.participants=[];}
  }
  d.eliminated.CATHARSIS='ANNIHILATION';
  for(const w of d.wars)if(w.stage==='active'&&[w.aggressor,w.defender].includes('CATHARSIS')){w.stage='ended';w.clock=0;}
  delete d.subjects.CATHARSIS;
  for(const [id,t]of Object.entries(d.subjects))if(t.overlord==='CATHARSIS')delete d.subjects[id];
  if(NVEris.faction(s,'carax')!=='CUSTOM')return null;
  if(!e.playerFaction.claims.includes('carax'))e.playerFaction.claims.push('carax');
  const colonies=NVGovernance.ensure(s).colonies;
  if(!colonies.carax)colonies.carax={body:'carax',system:NVCatharsisRoute.CORE,x:0,z:128,lat:0,lon:0,global:true,landingX:0,landingZ:0,governor:'',extraGovernors:[],age:0,exposure:0,captured:''};
  colonies.carax.captured='';return colonies.carax;
 }
 function invasion(s){
  if(!active(s))return;
  const q=NVCarax.ensure(s),round=q.campaign.round;
  if(q.forces.some(a=>a.playerInvasion===round)&&q.forces.every(a=>a.faction==='CUSTOM'&&!a.leader))return;
  const species=NVCustomCrew.ensure(s).characters.find(n=>n.status==='crew'&&!n.model&&!NVCrewDiplomacy.away(s,n.id)),name=NVEris.ensure(s).playerFaction.name||'YOUR FACTION';
  q.participants=[];q.rallied=false;
  q.forces=Array.from({length:12},(_,i)=>({id:'player-carax-'+i,name:name+' assault infantry '+(i+1),faction:'CUSTOM',speciesId:species?.id||'',playerInvasion:round,leader:false,governor:false,expeditionGovernor:i<2,x:(i%6-2.5)*4,z:-95-Math.floor(i/6)*8,deck:-1,yaw:0,phase:0,speed:0,mode:'idle',elapsed:0,cooldown:.5+i*.1,count:0}));
 }
 function supportTargets(s){if(!active(s))return[];const c=NVCarax.center(s);return NVCrewDiplomacy.local(s).filter(n=>n.hostile&&n.assignment.hp>0).map(n=>{const a=NVCrewDiplomacy.actor(s,n);return{x:a.x-c.x,z:a.z-c.z,hp:n.assignment.hp,foreignGovernor:n.assignment};});}
 const fleets=new WeakMap();
 function fleet(s){if(!active(s)||NVGalaxy.system(s)!==NVCatharsisRoute.CORE)return[];let ships=fleets.get(s);if(!ships){ships=Array.from({length:5},(_,i)=>({id:35000+i,faction:'CUSTOM',originFaction:'CUSTOM',captain:(s.eris.playerFaction.name||'YOUR FACTION')+' / Assault wing '+(i+1),caraxFleet:true,hp:10000,maxHp:10000,position:[0,0,0],yaw:0,body:'carax',system:NVCatharsisRoute.CORE}));fleets.set(s,ships);}const b=NVSol.byId.carax,t=s.space.time||0;for(const [i,v]of ships.entries()){const a=i*1.256+t*.018,r=b.radius+220+i*25;v.position=[b.position[0]+Math.cos(a)*r,b.position[1]+90+i*20,b.position[2]+Math.sin(a)*r];v.yaw=-a;}return ships;}
 function sync(s){
  if(!s||!chapter5Unlocked(s))return null;
  home(s);
  prepare(s);const q=NVCatharsisRoute.ensure(s).assault||(NVCatharsisRoute.ensure(s).assault=NVCarax.fresh()),owner=NVEris.faction(s,'carax');
  if(!q.campaign)q.campaign={owner:'CUSTOM',stage:'home',round:0};
  const r=q.campaign;
  if(r.owner!==owner){r.owner=owner;r.round++;r.stage=owner==='CUSTOM'?'home':'held';
   if(owner!=='CUSTOM'){const fresh=NVCarax.fresh();q.secured=fresh.secured;q.guards=fresh.guards;for(const floor of q.guards)for(const g of floor)g.hp=g.maxHp=200;q.deck=0;q.forces=[];q.participants=[];q.rallied=false;
    for(const b of Object.values(NVCaraxBosses.ensure(s)))Object.assign(b,{hp:0,stage:'defeated',deathAge:6});
   }
  }
  if(owner==='CUSTOM'){q.secured.fill(true);for(const floor of q.guards)for(const g of floor)g.hp=0;q.forces=[];q.participants=[];q.rallied=false;}
  invasion(s);return r;
 }
 const active=s=>!['alt-zerry','obra-spira','ravus'].includes(s?.space?.body)&&chapter5Unlocked(s)&&!!s.eris?.catharsisCoreRoute?.assault?.campaign&&s.eris.catharsisCoreRoute.assault.campaign.stage==='held'&&NVEris.faction(s,'carax')!=='CUSTOM'&&NVDiplomacy.relation(s,NVEris.faction(s,'carax'))==='WAR';
 const ready=s=>NVCarax.ensure(s).secured.every(Boolean)&&rows(s).length===0;
 function finish(s){if(!active(s)||!ready(s))return false;const ok=NVFrontlineCampaign.transfer(s,'carax','CUSTOM');if(ok){sync(s);NVGovernance.register(s);NVSpace.notice(s.space,'CARAX RECAPTURED / ALL FIVE FLOORS SECURED · GOVERNORS RETURNED TO YOUR SHIP');}return ok;}
 function give(s,id,faction){
  if(!fortress(id)||id!=='carax'||!chapter5Unlocked(s)||NVEris.faction(s,id)!=='CUSTOM'||faction==='CUSTOM'||!NVGalacticDiplomacy.visible(s,faction)||!NVGalacticDiplomacy.alive(s,faction)||NVDiplomacy.relation(s,faction)==='WAR')return false;
  return NVFrontlineCampaign.transfer(s,id,faction);
 }
 return{fortress,rows,floorRows,deck,prepare,battle,home,invasion,supportTargets,fleet,sync,active,ready,finish,give};
})();
const fortressRegister=NVGovernance.register;NVGovernance.register=s=>{const c=NVFortressCampaign.home(s);return fortressRegister(s)||(s.space?.body==='carax'?c:null);};
const fortressAppoint=NVGovernance.appoint;NVGovernance.appoint=(s,id,...args)=>{if(id==='carax'){if(!chapter5Unlocked(s))return false;NVFortressCampaign.home(s);}return fortressAppoint(s,id,...args);};
const fortressWorldRestore=NVAntarctica.restored;NVAntarctica.restored=(...args)=>{const s=fortressWorldRestore(...args);NVFortressCampaign.sync(s);return s;};
const fortressTroops=NVCarax.troops;NVCarax.troops=s=>chapter5Unlocked(s)?NVCarax.local(s)&&NVFortressCampaign.active(s)?NVCarax.ensure(s).forces.filter(a=>a.faction==='CUSTOM'&&!a.leader):[]:fortressTroops(s);
const fortressShips=NVCarax.ships;NVCarax.ships=s=>chapter5Unlocked(s)?NVFortressCampaign.fleet(s):fortressShips(s);
const fortressFleet=NVSolWar.ships;NVSolWar.ships=s=>chapter5Unlocked(s)&&NVGalaxy.system(s)===NVCatharsisRoute.CORE&&NVFortressCampaign.active(s)?NVFortressCampaign.fleet(s):fortressFleet(s);
const fortressRestore=NVCarax.restore;NVCarax.restore=raw=>{const q=fortressRestore(raw),r=raw?.campaign;if(r&&typeof r.owner==='string'){q.campaign={owner:r.owner,stage:['home','held'].includes(r.stage)?r.stage:'held',round:Math.max(0,Number(r.round)||0)};for(const floor of q.guards)for(const g of floor){g.maxHp=200;g.hp=Math.min(200,g.hp);}}return q;};
const fortressTransfer=NVFrontlineCampaign.transfer;NVFrontlineCampaign.transfer=(s,id,to)=>{
 const from=NVEris.faction(s,id),post=id==='carax'&&chapter5Unlocked(s);
 if(post&&from!=='CUSTOM'&&to==='CUSTOM'&&!NVFortressCampaign.ready(s))return false;
 const c=NVGovernance.ensure(s).colonies[id],governors=post&&from==='CUSTOM'&&to!=='CUSTOM'?NVGovernance.governors(c):[];
 const ok=fortressTransfer(s,id,to);if(!ok)return false;
 for(const [i,member]of governors.entries()){
  NVGovernance.dismissGovernor(s,id,member);
  const maxHp=i===0?3000000:1000000;
  NVCrewDiplomacy.ensure(s).assignments[member]={id:member,faction:to,body:id,fortressSlot:i+1,lat:0,lon:0,x:(i-1)*8,z:164,hp:maxHp,maxHp,age:0,mode:'idle'};
 }
 if(post)NVFortressCampaign.sync(s);return true;
};
const fortressClaim=NVEris.claim;NVEris.claim=(s,id)=>id==='carax'&&chapter5Unlocked(s)&&NVEris.faction(s,id)!=='CUSTOM'?false:fortressClaim(s,id);
const fortressCapture=NVGalacticDiplomacy.capture;NVGalacticDiplomacy.capture=(s,war,id)=>id==='carax'&&chapter5Unlocked(s)&&!NVFortressCampaign.ready(s)?false:fortressCapture(s,war,id);
const fortressBaseStatus=NVBaseAssault.status;NVBaseAssault.status=s=>{const v=fortressBaseStatus(s);return v?.base.body==='carax'&&chapter5Unlocked(s)&&!NVFortressCampaign.ready(s)?{...v,ready:false,locked:'Clear all five fortress floors and defeat the governors on Floors 4 and 5.'}:v;};
const fortressSecure=NVCarax.secure;NVCarax.secure=s=>{if(NVFortressCampaign.active(s)&&NVFortressCampaign.floorRows(s).length)return false;return fortressSecure(s);};
const fortressSwitch=NVCarax.floorSwitch;NVCarax.floorSwitch=s=>{const v=fortressSwitch(s);if(NVFortressCampaign.active(s))v.defenders+=NVFortressCampaign.floorRows(s).length;return v;};
const fortressWaypoint=NVCarax.waypoint;NVCarax.waypoint=s=>{const v=fortressWaypoint(s);if(v&&NVFortressCampaign.active(s)&&NVCarax.local(s)&&NVFortressCampaign.floorRows(s).length){const c=NVCarax.center(s);return{x:c.x,z:c.z+4,label:'DEFEAT '+NVFortressCampaign.floorRows(s).length+' GOVERNOR'+(NVFortressCampaign.floorRows(s).length===1?'':'S')+' / FLOOR '+(NVCarax.ensure(s).deck+1)};}return v;};
const fortressTick=stepEcology;stepEcology=dt=>{if(gameActive&&polarState)NVFortressCampaign.sync(polarState);return fortressTick(dt);};
const fortressHUD=updatePolarHUD;updatePolarHUD=()=>{if(gameActive&&polarState)NVFortressCampaign.sync(polarState);fortressHUD();if(gameActive&&polarState&&NVCarax.local(polarState)&&NVFortressCampaign.active(polarState)){$('#hudMissionTitle').textContent='RECAPTURE CARAX / FLOOR '+(NVCarax.ensure(polarState).deck+1)+' / 5';if(NVFortressCampaign.floorRows(polarState).length)$('#hudMissionText').textContent=(NVCarax.ensure(polarState).deck===4?'Defeat Governor 1 / 3,000,000 HP, then activate the Crown Nexus.':'Defeat Governors 2 and 3 / 1,000,000 HP each to unlock Floor 5.')+' Defeated companions return to your ship.';}};

// Fortress handover is explicit and keeps all appointed companions at their posts.
const fortressGift=document.createElement('section');fortressGift.innerHTML='<label for="fortressRecipient">GIVE FORTRESS TO AN EMPIRE</label><select id="fortressRecipient" aria-label="Fortress recipient empire"></select><button id="fortressGive" class="polar-button">GIVE FORTRESS AND GOVERNORS</button><p>Appointed governors remain here for the receiving empire. During war, retaking the fortress requires all five floors. Governor 1: Floor 5 / 3,000,000 HP. Governors 2 and 3: Floor 4 / 1,000,000 HP each.</p>';governorPanel.querySelector('.governor-actions').after(fortressGift);
const fortressRefresh=refreshGovernors;refreshGovernors=()=>{NVFortressCampaign.home(polarState);fortressRefresh();const s=polarState,id=$('#governorWorld').value;fortressGift.hidden=id!=='carax'||!chapter5Unlocked(s)||NVEris.faction(s,id)!=='CUSTOM';if(fortressGift.hidden)return;NVGalacticDiplomacy.register(s);const select=$('#fortressRecipient'),old=select.value;select.replaceChildren(...Object.values(NVGalacticDiplomacy.ensure(s).factions).filter(f=>f.id!=='CUSTOM'&&NVGalacticDiplomacy.visible(s,f.id)&&NVGalacticDiplomacy.alive(s,f.id)&&NVDiplomacy.relation(s,f.id)!=='WAR').map(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.name;return o;}));if([...select.options].some(o=>o.value===old))select.value=old;$('#fortressGive').disabled=!select.value;};
$('#fortressGive').onclick=()=>{const s=polarState,ok=NVFortressCampaign.give(s,$('#governorWorld').value,$('#fortressRecipient').value);$('#governorMessage').textContent=ok?'Fortress transferred. Its governors now serve the receiving empire.':'Choose a surviving empire you are not at war with.';refreshGovernors();updatePolarHUD();};

const fortressPosting=NVCrewDiplomacy.offer;NVCrewDiplomacy.offer=(s,...args)=>{const r=fortressPosting(s,...args);if(r.ok&&args[2]==='carax')NVFortressCampaign.prepare(s);return r;};
