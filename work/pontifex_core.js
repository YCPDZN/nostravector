// A single living nemesis belongs to each character's manually saved war state.
const NVPontifex=(()=>{
 const NAME='Imperia Pontifex Maximus',MAX_HP=24000,RANGE=32;
 const MALE_NAMES=['Adrian','Elias','Jonas','Lucas','Gabriel','Marcus','Ronan','Nathan','Samuel','Victor','Daniel','Felix','Oscar','Caleb','Leon','Isaac'];
 const FEMALE_NAMES=['Maya','Amara','Nadia','Freya','Sofia','Aisha','Clara','Zoe','Leila','Iris','Priya','Ines','Yuna','Anika','Sana','Elena','Helena'];
 function soldierGender(v){const explicit=String(v?.gender||v?.sex||'').toLowerCase();if(explicit)return explicit==='male'||explicit==='m'?'male':explicit==='female'||explicit==='f'?'female':'';const first=String(v?.captain||'').trim().split(/\s+/)[0];return MALE_NAMES.includes(first)?'male':FEMALE_NAMES.includes(first)?'female':'';}
 const maleName=(name,generation)=>FEMALE_NAMES.includes(String(name).split(/\s+/)[0])?String(name).replace(/^\S+/,MALE_NAMES[Math.abs(generation||0)%MALE_NAMES.length]):name;
 const fresh=()=>({version:2,identity:'',gender:'male',alive:false,generation:0,kills:0,name:NAME,faction:'TERRA',hp:0,maxHp:MAX_HP,body:'mercury',sourceCaptain:'',sourceShip:-1,createdAt:0,site:null,offset:{x:0,z:0},yaw:0,mode:'dormant',action:'sweep',timer:0,cooldown:0,weaponCooldown:0,hitFlash:0,shotFlash:0,deathTime:0,gait:0,speed:0,attackCount:0,aim:null,track:false,notice:'',noticeTime:0});
 const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
 function restore(raw){
  const q=fresh();if(!raw||typeof raw!=='object')return q;
  if(raw.identity==='james-brown'){q.identity='james-brown';q.name='James Brown / Pontifex Maximus';q.maxHp=32000;}q.generation=Math.max(0,Math.floor(finite(raw.generation)));q.kills=Math.min(q.generation,Math.max(0,Math.floor(finite(raw.kills))));
  q.body=!!NVSol.byId[raw.body]&&!NVSol.byId[raw.body].stellar?raw.body:'mercury';q.sourceCaptain=typeof raw.sourceCaptain==='string'?raw.sourceCaptain.slice(0,80):'';if(q.identity!=='james-brown')q.sourceCaptain=maleName(q.sourceCaptain,q.generation);q.sourceShip=Math.floor(finite(raw.sourceShip,-1));q.createdAt=Math.max(0,finite(raw.createdAt));
  q.hp=Math.max(0,Math.min(q.maxHp,finite(raw.hp)));q.alive=raw.alive===true&&q.hp>0&&q.generation>0;
  if(!q.alive)q.hp=0;
  if(raw.site&&[raw.site.x,raw.site.z,raw.site.lat,raw.site.lon].every(Number.isFinite))q.site={x:raw.site.x,z:raw.site.z,lat:Math.max(-89.9,Math.min(89.9,raw.site.lat)),lon:raw.site.lon,global:!!raw.site.global};
  q.offset={x:Math.max(-135,Math.min(135,finite(raw.offset?.x))),z:Math.max(-135,Math.min(135,finite(raw.offset?.z)))};q.yaw=finite(raw.yaw);
  q.mode=['dormant','pursuit','windup','release','recovery','dead'].includes(raw.mode)?raw.mode:q.alive?'dormant':'dead';
  q.action=['sweep','slam','lance'].includes(raw.action)?raw.action:'sweep';q.timer=Math.max(0,Math.min(3,finite(raw.timer)));q.cooldown=Math.max(0,Math.min(3,finite(raw.cooldown)));q.weaponCooldown=Math.max(0,Math.min(.5,finite(raw.weaponCooldown)));q.gait=finite(raw.gait);q.attackCount=Math.max(0,Math.floor(finite(raw.attackCount)));
  q.aim=raw.aim&&[raw.aim.x,raw.aim.z].every(Number.isFinite)?{x:raw.aim.x,z:raw.aim.z}:null;q.deathTime=Math.max(0,Math.min(7,finite(raw.deathTime)));q.track=q.alive&&raw.track!==false;
  return q;
 }
 function ensure(s){const w=NVSolWar.ensure(s);return w.pontifex||(w.pontifex=fresh());}
 function onSoldierDeath(w,v,events){
  if(!w.brownStory?.brownDefeated||!NVSolWar.active(w)||v.originFaction!=='TERRA'||v.leader||v.hp>0||soldierGender(v)!=='male')return false;
  const previous=w.pontifex||(w.pontifex=fresh());if(previous.alive)return false;
  const q=fresh();q.alive=true;q.generation=previous.generation+1;q.kills=previous.kills;q.hp=MAX_HP;q.sourceCaptain=maleName(v.captain,q.generation);q.sourceShip=v.id;q.createdAt=w.battleTime;
  const body=v.travel?.body||v.body;q.body=!!NVSol.byId[body]&&!NVSol.byId[body].stellar?body:'mercury';
  q.notice='IMPERIA PONTIFEX MAXIMUS HAS RISEN FROM A FALLEN TERRA IMPERIA SOLDIER. SIGNAL: '+NVSol.byId[q.body].name.toUpperCase()+'.';q.noticeTime=20;w.pontifex=q;
  events.push(q.notice);return true;
 }
 function surface(s){return NVEris.groundPlay(s)&&!s.space?.ecologyOcean&&!s.aerialView;}
 function local(s,includeDead=false){
  const q=ensure(s);if(q.identity==='james-brown'&&(!NVSolWar.ensure(s).brownStory?.tritonReached||!s.eris?.moonLoss?.complete))return null;if((!q.alive&&!(includeDead&&q.deathTime>0))||!surface(s)||NVEris.world(s)!==q.body)return null;
  const p=s.space,g=p?.geo;
  if(!q.site){q.site={x:s.x-(g?.global?p.landingX||0:0)+82,z:s.z-(g?.global?p.landingZ||0:0)-68,lat:g?.lat||0,lon:g?.lon||0,global:!!g?.global};q.yaw=Math.atan2(-82,68);}
  let homeX=q.site.x,homeZ=q.site.z;
  if(g?.global){homeX=(p.landingX||0)+NVWorldFlight.wrap(q.site.lon-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180))+q.site.x;homeZ=(p.landingZ||0)+(q.site.lat-g.lat)*24000+q.site.z;}
  const x=homeX+q.offset.x,z=homeZ+q.offset.z;return{boss:q,x,z,homeX,homeZ,distance:Math.hypot(x-s.x,z-s.z)};
 }
 const phase=q=>q.hp>q.maxHp*.66?1:q.hp>q.maxHp*.33?2:3;
 function damage(s,amount,source){
  const q=ensure(s);if(source!=='player'||!q.alive||!Number.isFinite(amount)||amount<=0)return false;
  q.hp=Math.max(0,q.hp-amount);q.hitFlash=.18;
  if(!q.hp){q.alive=false;q.mode='dead';q.timer=0;q.deathTime=7;q.kills++;if(q.identity==='james-brown'){NVSolWar.ensure(s).brownStory.brownDefeated=true;}q.track=false;q.notice=q.name.toUpperCase()+' DEFEATED BY THE WANDERER. RECLAIMED 40 SCRAP.';q.noticeTime=15;s.inventory=s.inventory||{};s.inventory.scrap=(Number(s.inventory.scrap)||0)+40;}
  return true;
 }
 function lineOfSight(s,from,to){
  if(typeof NVWorldFlight==='undefined'||!s.space?.geo?.global)return true;
  const start=NVWorldFlight.ground(s,from.x,from.z)+1.4,end=NVWorldFlight.ground(s,to.x,to.z)+1.5;
  for(let i=1;i<12;i++){const t=i/12,x=from.x+(to.x-from.x)*t,z=from.z+(to.z-from.z)*t;if(NVWorldFlight.ground(s,x,z)>start+(end-start)*t+.2)return false;}return true;
 }
 function strike(s,source){
  const q=ensure(s),n=local(s);if(source!=='player'||!n||n.distance>RANGE||q.weaponCooldown>0||s.car?.driving||!lineOfSight(s,s,n))return false;
  q.weaponCooldown=.45;q.shotFlash=.16;s.yaw=Math.atan2(n.x-s.x,n.z-s.z);
  // The exposed heart core is vulnerable while the polearm recovers.
  return damage(s,q.mode==='recovery'?1200:540,'player');
 }
 function hitPlayer(s,q,n){
  if(!lineOfSight(s,n,s))return;
  const d=n.distance,angle=Math.atan2(s.x-n.x,s.z-n.z)-q.yaw,jump=s.jumpOffset||0;
  const hit=q.action==='lance'?q.aim&&Math.hypot(s.x-(n.homeX+q.aim.x),s.z-(n.homeZ+q.aim.z))<3.1:q.action==='slam'?d<7&&jump<1.05:d<6&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<1.5&&jump<.7;
  if(!hit)return;const e=NVEcology.ensure(s);e.health=Math.max(0,e.health-(q.action==='slam'?32:q.action==='lance'?22:24));e.notice='PONTIFEX '+q.action.toUpperCase()+' / SUIT INTEGRITY DAMAGED';e.noticeTime=3;
  if(e.health<=0){NVEcology.recover(s);q.mode='recovery';q.timer=2.4;q.notice='SUIT EMERGENCY RETREAT. THE PONTIFEX REMAINS ALIVE.';q.noticeTime=7;}
 }
 function step(s,dt){
  if(!Number.isFinite(dt)||dt<=0)return;const q=ensure(s);dt=Math.min(dt,.1);q.noticeTime=Math.max(0,q.noticeTime-dt);q.hitFlash=Math.max(0,q.hitFlash-dt);q.shotFlash=Math.max(0,q.shotFlash-dt);q.weaponCooldown=Math.max(0,q.weaponCooldown-dt);q.deathTime=Math.max(0,q.deathTime-dt);q.speed=0;
  if(!q.alive)return;const n=local(s);if(!n)return;
  if(n.distance>65||Math.hypot(s.x-n.homeX,s.z-n.homeZ)>135){q.mode='dormant';q.timer=0;return;}
  const level=phase(q);q.cooldown=Math.max(0,q.cooldown-dt);
  if(q.mode==='windup'){q.timer=Math.max(0,q.timer-dt);if(q.timer===0){q.mode='release';q.timer=.28;hitPlayer(s,q,n);}return;}
  if(q.mode==='release'){q.timer=Math.max(0,q.timer-dt);if(q.timer===0){q.mode='recovery';q.timer=level===3?.85:1.5;}return;}
  if(q.mode==='recovery'){q.timer=Math.max(0,q.timer-dt);if(q.timer===0){q.mode='pursuit';q.cooldown=.8;}return;}
  q.mode='pursuit';q.yaw=Math.atan2(s.x-n.x,s.z-n.z);
  if(q.cooldown===0&&n.distance<28){q.attackCount++;q.action=n.distance>10?'lance':q.attackCount%3===0?'slam':'sweep';q.mode='windup';q.timer=q.action==='slam'?1.5:q.action==='lance'?1.35:1.0;q.aim={x:s.x-n.homeX,z:s.z-n.homeZ};return;}
  if(n.distance>3.8){const speed=level===3?5.4:level===2?4.4:3.5,move=Math.min(speed*dt,n.distance-3.8);q.offset.x+=(s.x-n.x)/n.distance*move;q.offset.z+=(s.z-n.z)/n.distance*move;q.speed=move/dt;q.gait+=move*3.4;}
 }
 return{NAME,MAX_HP,RANGE,MALE_NAMES,FEMALE_NAMES,soldierGender,maleName,fresh,restore,ensure,onSoldierDeath,local,phase,damage,strike,step,lineOfSight};
})();
const pontifexWarRestore=NVSolWar.restore;NVSolWar.restore=raw=>{const w=pontifexWarRestore(raw);w.pontifex=NVPontifex.restore(raw?.pontifex);return w;};
const pontifexErisStep=NVEris.step;NVEris.step=(s,dt)=>{const events=pontifexErisStep(s,dt);NVPontifex.step(s,dt);return events;};
