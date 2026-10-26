// Small, respawning local wings provide repeatable Chapter 3 Imperia encounters.
const NVSolHuntPatrols=(()=>{
 const FIRST=120000,PER_WORLD=4,RESPAWN=45,HP=100;
 const worlds=()=>NVSol.worlds.filter(b=>!b.stellar);
 const allowed=s=>!!s?.space&&(s.space.system||'sol')==='sol'&&NVChapter3Access.chapter(s)===3&&NVSolWar.active(NVSolWar.ensure(s))&&!NVSiegeOfSol.raw(s)?.confronted;
 const ensure=s=>NVEris.ensure(s).solHuntPatrols||(NVEris.ensure(s).solHuntPatrols={clock:0,losses:{}});
 function restore(r){const q={clock:Math.max(0,Number(r?.clock)||0),losses:{}};for(const [id,v]of Object.entries(r?.losses||{}))if(Number.isInteger(Number(id))&&Number(id)>=FIRST&&Number(id)<FIRST+worlds().length*PER_WORLD)q.losses[id]={hp:Math.max(0,Math.min(HP,Number.isFinite(v?.hp)?v.hp:HP)),readyAt:Math.max(0,Number(v?.readyAt)||0)};return q;}
 const cache=new WeakMap();
 function ships(s){if(!allowed(s))return[];let runtime=cache.get(s);if(!runtime){runtime=new Map();cache.set(s,runtime);}const q=ensure(s),p=s.space,focus=[...new Set([p.body,p.target])].filter(id=>worlds().some(b=>b.id===id)),out=[];
  for(const body of focus){const b=NVSol.byId[body],index=worlds().findIndex(v=>v.id===body);for(let slot=0;slot<PER_WORLD;slot++){const id=FIRST+index*PER_WORLD+slot,loss=q.losses[id];if(loss?.hp===0&&q.clock>=loss.readyAt)delete q.losses[id];const hp=q.losses[id]?.hp??HP,angle=slot*Math.PI/2+index*.21+q.clock*.035,r=b.radius*3.2+300+slot*35;let vessel=runtime.get(id);if(!vessel){vessel={};runtime.set(id,vessel);}Object.assign(vessel,{id,solHuntPatrol:true,faction:'TERRA',originFaction:'TERRA',gender:'male',captain:['Adrian','Marcus','Nathan','Victor'][(index+slot)%4]+' '+['Ward','Voss','Sato','Vale','Cross','Marlow'][(index*3+slot+(s.seed||0))%6],leader:null,home:body,body,system:'sol',front:-1,hp,maxHp:HP,position:[b.position[0]+Math.cos(angle)*r,b.position[1]+b.radius*.7+60+slot*25,b.position[2]+Math.sin(angle)*r],yaw:-angle,pitch:0,target:-1,fire:0,cooldown:0,mode:hp>0?'patrol':'destroyed',respawn:hp>0?0:Math.max(0,loss.readyAt-q.clock)});out.push(vessel);}}
  return out;
 }
 function damage(s,id,amount){if(!allowed(s)||!Number.isFinite(amount)||amount<=0)return[];const v=ships(s).find(v=>v.id===id),q=ensure(s),events=[];if(!v||v.hp<=0)return events;const hp=Math.max(0,v.hp-amount);v.hp=hp;q.losses[id]={hp,readyAt:hp===0?q.clock+RESPAWN:0};if(!hp){v.hp=0;const w=NVSolWar.ensure(s);w.pontifexRecruitmentAllowed=NVPontifexHunt.allowed(s)&&!NVCombatCrew.ensure(s).pending;NVPontifex.onSoldierDeath(w,v,events);if(events.length)NVSpace.notice(s.space,events.join(' '));}return events;}
 function step(s,dt){if(allowed(s)&&Number.isFinite(dt)&&dt>0)ensure(s).clock+=Math.min(.2,dt);}
 return{FIRST,PER_WORLD,RESPAWN,HP,allowed,ensure,restore,ships,damage,step};
})();
const solHuntRestore=NVEris.restore;NVEris.restore=r=>({...solHuntRestore(r),solHuntPatrols:NVSolHuntPatrols.restore(r?.solHuntPatrols)});
const solHuntFleet=NVSolWar.ships;NVSolWar.ships=s=>[...solHuntFleet(s),...NVSolHuntPatrols.ships(s)];
const solHuntDamage=NVSolWar.damage;NVSolWar.damage=(s,id,amount)=>Number.isInteger(id)&&id>=NVSolHuntPatrols.FIRST&&id<NVSolHuntPatrols.FIRST+NVSol.worlds.length*NVSolHuntPatrols.PER_WORLD?NVSolHuntPatrols.damage(s,id,amount):solHuntDamage(s,id,amount);
const solHuntStep=stepEcology;stepEcology=dt=>{solHuntStep(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState)NVSolHuntPatrols.step(polarState,dt);};
