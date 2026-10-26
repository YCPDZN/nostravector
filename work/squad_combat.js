// Surface and station combat use the positions of the squad actually on screen.
const NVCombatSquad=(()=>{
 const runtime=new WeakMap();
 const station=s=>typeof NVArchiostal!=='undefined'&&NVArchiostal.active(s);
 const player=s=>station(s)?NVArchiostal.ensure(s):s;
 const key=s=>[station(s)?'archiostal':NVEris.world(s),s.space?.geo?.lat,s.space?.geo?.lon,s.space?.landingX,s.space?.landingZ].join(':');
 function state(s){let q=runtime.get(s);const id=key(s);if(!q||q.key!==id){q={key:id,clock:0,enemies:new WeakMap(),hits:new Map()};runtime.set(s,q);}return q;}
 function position(s,n){return station(s)?NVArchiostalPeople.state(s).followers.get(n.id):n.id.startsWith('custom-')?NVCustomCrew.followerPoses(s).get(n.id):NVCompanionMotion.ground(s).get(n.id);}
 function crew(s){return station(s)?NVArchiostalPeople.crew(s):[...NVParty.list(s).filter(n=>NVGovernance.follows(s,n.id)),...NVCustomCrew.followers(s)];}
 function units(s){const p=player(s);return[{id:'wanderer',pose:p},...crew(s).map(n=>({id:n.id,pose:position(s,n)})).filter(n=>n.pose&&Math.hypot(n.pose.x-p.x,n.pose.z-p.z)<85)];}
 function visible(s,from,to){if(!station(s)){if(typeof NVCarax!=='undefined'&&NVCarax.local(s)&&NVCarax.inside(s,from.x,from.z)&&NVCarax.inside(s,to.x,to.z))return true;return NVPontifex.lineOfSight(s,from,to);}const d=Math.hypot(to.x-from.x,to.z-from.z),steps=Math.max(1,Math.ceil(d/1.5));for(let i=1;i<steps;i++){const u=i/steps;if(NVArchiostal.obstacle(from.x+(to.x-from.x)*u,from.z+(to.z-from.z)*u))return false;}return true;}
 function advance(s,p,to,amount){const dx=to.x-p.x,dz=to.z-p.z,d=Math.hypot(dx,dz);if(d<.001||amount<=0)return 0;amount=Math.min(d,amount);const yaw=Math.atan2(dx,dz),ox=p.x,oz=p.z;
  // Short detours around the station fountain and buildings keep melee crew moving.
  for(const angle of [0,.55,-.55,1.1,-1.1,1.55,-1.55]){const x=ox+Math.sin(yaw+angle)*amount,z=oz+Math.cos(yaw+angle)*amount;if(!station(s)||NVArchiostalPeople.walkable(x,z)){p.x=x;p.z=z;break;}}
  const moved=Math.hypot(p.x-ox,p.z-oz);p.phase=(p.phase||0)+moved*2.2;return moved;
 }
 function enemyState(s,enemy){const q=state(s);let a=q.enemies.get(enemy);if(!a){a={focus:'',until:0,threats:new Map()};q.enemies.set(enemy,a);}return a;}
 function provoke(s,enemy,id='wanderer',damage=1){if(!enemy||damage<=0)return;const q=state(s),a=enemyState(s,enemy);a.threats.set(id,{at:q.clock,damage:Math.min(120,(a.threats.get(id)?.damage||0)+damage)});a.until=0;}
 function target(s,enemy){const q=state(s),a=enemyState(s,enemy),candidates=units(s).filter(n=>Math.hypot(n.pose.x-enemy.x,n.pose.z-enemy.z)<100),current=candidates.find(n=>n.id===a.focus);if(current&&q.clock<a.until)return current;
  const score=n=>{const t=a.threats.get(n.id),age=t?q.clock-t.at:Infinity;return Math.hypot(n.pose.x-enemy.x,n.pose.z-enemy.z)-(age<4?Math.min(18,t.damage*.15)*(1-age/4):0);};
  const selected=candidates.sort((a,b)=>score(a)-score(b))[0]||{id:'wanderer',pose:player(s)};a.focus=selected.id;a.until=q.clock+2.5;return selected;
 }
 function hurt(s,id,damage){if(id==='wanderer'){const e=NVEcology.ensure(s);e.health=Math.max(0,e.health-damage);return;}const q=state(s);q.hits.set(id,q.clock+.35);const n=units(s).find(n=>n.id===id);if(n)n.pose.hit=.35;}
 const staggered=(s,id)=>(state(s).hits.get(id)||0)>state(s).clock;
 function step(s,dt){const q=state(s);q.clock+=dt;for(const [id,until]of q.hits)if(until<=q.clock)q.hits.delete(id);}
 return{station,player,key,state,position,crew,units,visible,advance,provoke,target,hurt,staggered,step};
})();
