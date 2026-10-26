// Combat runtimes are keyed by the current character world, never by model ID.
const NVBCCombat=(()=>{
 const TAUNTS={
  josiah:[
   'I came back from the grave to put you imbeciles in your place.',
   'Golden chains. Terrible odds. You should have stayed home.',
   'You brought an army. I brought your reckoning.',
   'Even the grave had better manners than you lot.',
   'Kneel if you like. The chains were going to handle that anyway.'
  ],
  peter:[
   "I'm back, fuckers! Miss me?",
   "You should've finished the job. Now it's my fucking turn.",
   "Keep running, you bastards. These chains don't get tired.",
   "All that swagger, and now you're pissing yourself.",
   "Remember my face. I'm the bastard who put you down."
  ],
  gareth:[
   'Uxbridge Top Shotter. Remember the name!',
   'Two pistols, one Gareth. You do the maths!',
   'You picked the wrong bloke to start trouble with!',
   'All that armour, and you still cannot handle the Uxbridge Top Shotter!',
   'Watch this! Actually, watch the pistols. My footwork is a separate issue.'
  ]
 };
 const runtimes=new WeakMap(),roots=new WeakMap();
 const kind=n=>{const id=n?.model?.id;return id==='glb-project-bc-josiah-richards'?'josiah':id==='glb-project-bc-peter-chambers'?'peter':['glb-project-bc-gareth-williams','glb-project-bc-gareth-tank-top'].includes(id)?'gareth':'';};
 const station=s=>typeof NVCombatSquad!=='undefined'&&NVCombatSquad.station(s);
 const center=s=>station(s)?NVCombatSquad.player(s):s;
 const visible=(s,p,t)=>typeof NVCombatSquad!=='undefined'?NVCombatSquad.visible(s,p,t):NVPontifex.lineOfSight(s,p,t);
 const playable=s=>!!s&&(station(s)||NVEris.groundPlay(s))&&!s.space?.interior?.active&&!s.space?.ecologyOcean&&!s.car?.driving&&!s.bedSleeping&&!s.aerialView;
 function state(s){let q=runtimes.get(s);const key=[station(s)?'archiostal':NVEris.world(s),s.space?.geo?.lat,s.space?.geo?.lon,s.space?.landingX,s.space?.landingZ].join(':');if(!q||q.key!==key){q={key,clock:0,actors:new Map(),patrols:new Map(),effects:[],caption:null,queue:[],serial:0};runtimes.set(s,q);}return q;}
 function actor(s,n){const q=state(s);if(!q.actors.has(n.id))q.actors.set(n.id,{kind:kind(n),mode:'idle',elapsed:0,duration:0,cooldown:0,attacks:0,taunt:0,barkCooldown:0,tripCooldown:55+(n.id.length%4)*7,shots:0});return q.actors.get(n.id);}
 function say(s,n,text,priority=false){const q=state(s),k=kind(n),voiceKey=k+':'+(text==='ALMIGHTY HEAVEN!'?'heaven':text==="OW! I'M OKAY!"?'trip':TAUNTS[k].indexOf(text)),recording=typeof BC_COMBAT_RECORDINGS!=='undefined'?BC_COMBAT_RECORDINGS.find(r=>r.key===voiceKey):null,line={name:n.name,npcId:n.id,text,voiceKey,time:Math.max(4.2,(recording?.duration||0)+.4),serial:++q.serial,kind:k};if(priority){if(q.caption)q.queue.unshift(q.caption);q.caption=line;}else if(!q.caption)q.caption=line;else if(q.queue.length<3)q.queue.push(line);q.queue=q.queue.slice(0,3);}
 function restrain(enemy,seconds){roots.set(enemy,Math.max(roots.get(enemy)||0,seconds));}
 function held(enemy,dt){const v=roots.get(enemy)||0;if(v<=0)return false;roots.set(enemy,Math.max(0,v-dt));return true;}
 const bound=enemy=>(roots.get(enemy)||0)>0;
 function patrol(s,q,i,time){const runtime=state(s),key=q.body+':'+q.lat+':'+q.lon+':'+(q.faction||'')+':'+i;let a=runtime.patrols.get(key);if(!a){const walking=i>1,angle=time*.045+(i-2)/10*Math.PI*2,r=i%2?25:30;a={x:q.x+(walking?Math.sin(angle)*r:i===0?-8:8),z:q.z+(walking?Math.cos(angle)*r:-8),yaw:walking?angle+Math.PI/2:Math.PI,phase:time*3.1+i*.8,speed:walking?1:0,hp:200,maxHp:200,mode:'patrol',cooldown:0,base:q,index:i};runtime.patrols.set(key,a);}return a;}
 function hostilePatrols(s){const result=[],q=state(s);for(const base of NVOccupation.local(s)){if(NVDiplomacy.relation(s,base.faction)!=='WAR'||Math.hypot(s.x-base.x,s.z-base.z)>95)continue;for(let i=0;i<12;i++)result.push(patrol(s,base,i,q.clock));}return result;}
 function patrolStep(s,dt){for(const a of hostilePatrols(s)){if(a.hp<=0)continue;a.cooldown=Math.max(0,a.cooldown-dt);if(held(a,dt)){a.speed=0;a.mode='bound';continue;}
  const focus=typeof NVCombatSquad!=='undefined'?NVCombatSquad.target(s,a):{id:'wanderer',pose:s},p=focus.pose,dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz);a.focusId=focus.id;a.yaw=Math.atan2(dx,dz);a.speed=0;
  if(d<36){a.mode=d<3?'attack':'chase';if(d>2.6){const move=Math.min(d-2.6,2.6*dt);a.x+=dx/d*move;a.z+=dz/d*move;a.speed=2.6;a.phase+=move*2.2;}
   if(d<3&&a.cooldown===0&&(focus.id!=='wanderer'||!(s.jumpOffset>1.2))){if(typeof NVCombatSquad!=='undefined')NVCombatSquad.hurt(s,focus.id,6);else NVEcology.ensure(s).health=Math.max(0,NVEcology.ensure(s).health-6);a.cooldown=1.8;}
  }else{a.mode='patrol';const angle=state(s).clock*.045+(a.index-2)/10*Math.PI*2,r=a.index%2?25:30,tx=a.base.x+(a.index>1?Math.sin(angle)*r:a.index===0?-8:8),tz=a.base.z+(a.index>1?Math.cos(angle)*r:-8),dist=Math.hypot(tx-a.x,tz-a.z),move=Math.min(dist,1.3*dt);if(dist>.1){a.x+=(tx-a.x)/dist*move;a.z+=(tz-a.z)/dist*move;a.speed=1.3;a.phase+=move*2.2;}}
 }}
 function targets(s){if(station(s))return NVFactionLeaders.alive(s);const list=[];
  if(NVKhazglar.troopsNearby(s)){const site=NVKhazglar.location(s);for(const a of NVKhazglar.battle(s).soldiers)if(a.hp>0)list.push({enemy:a,x:site.x+a.x,z:site.z+a.z,type:'soldier'});}
  for(const a of hostilePatrols(s))if(a.hp>0)list.push({enemy:a,x:a.x,z:a.z,type:'patrol'});
  for(const a of NVEcology.populate(s).animals)if(a.species.behavior==='predator'&&a.mode==='hunting'&&a.bcHP!==0)list.push({enemy:a,x:a.x,z:a.z,type:'predator'});
  if(typeof NVKarribassaBosses!=='undefined'&&NVKarribassaBosses.fighting(s))for(const n of NVKarribassaBosses.actors(s))list.push({enemy:n.enemy,x:n.x,z:n.z,type:'commander'});
  if(typeof NVVengefulMascar!=='undefined'&&NVVengefulMascar.fighting(s)){const n=NVVengefulMascar.local(s);if(n)list.push({enemy:n.enemy,x:n.x,z:n.z,type:'vengeful-orion'});}
  const pm=NVPontifex.local(s);if(pm)list.push({type:'pontifex',enemy:pm.boss,x:pm.x,z:pm.z});
  if(typeof solFinalPlayable==='function'&&solFinalPlayable()){const n=NVSiegeOfSol.site(s),b=NVSiegeOfSol.ensure(s).boss;if(b.hp>0)list.push({type:'hawthorne',enemy:b,x:n.x,z:n.z});}
  if(typeof NVFactionLeaders!=='undefined')list.push(...NVFactionLeaders.alive(s));return list;
 }
 function hit(target,damage,seconds=0,source='wanderer'){return NVCompanionCombat.hit(target,damage,seconds,false,source);}
 function begin(s,n,a,target){a.mode=a.kind==='gareth'?'pistols':a.kind==='josiah'&&a.attacks%3===2?'heaven':'chains';a.duration=a.mode==='heaven'?2.4:a.mode==='pistols'?.65:1.5;a.elapsed=0;a.shots=0;a.target=target;a.attacks++;if(a.mode==='heaven')say(s,n,'ALMIGHTY HEAVEN!',true);else if(a.barkCooldown<=0){say(s,n,TAUNTS[a.kind][a.taunt++%5]);a.barkCooldown=14;}}
 function trip(s,n){const a=actor(s,n);if(a.kind!=='gareth'||a.mode!=='idle')return false;a.mode='trip';a.duration=1.9;a.elapsed=0;a.tripCooldown=60;say(s,n,"OW! I'M OKAY!",true);return true;}
 function effect(s,data){state(s).effects.push({...data,age:0});}
 function step(s,dt,random=Math.random){if(!playable(s)||!Number.isFinite(dt)||dt<=0){if(s)runtimes.delete(s);return;}dt=Math.min(.1,dt);const q=state(s);q.clock+=dt;for(const e of q.effects)e.age+=dt;q.effects=q.effects.filter(e=>e.age<e.life);if(q.caption){q.caption.time-=dt;if(q.caption.time<=0)q.caption=q.queue.shift()||null;}
  const crew=(station(s)?NVArchiostalPeople.crew(s):NVCustomCrew.followers(s)).filter(n=>kind(n)),poses=station(s)?NVArchiostalPeople.state(s).followers:NVCustomCrew.followerPoses(s),player=center(s);for(const id of q.actors.keys())if(!crew.some(n=>n.id===id))q.actors.delete(id);
  if(!station(s))patrolStep(s,dt);const enemies=NVBCCombat.targets(s);
  for(const n of crew){const p=poses.get(n.id);if(!p)continue;const a=actor(s,n);a.cooldown=Math.max(0,a.cooldown-dt);a.barkCooldown=Math.max(0,a.barkCooldown-dt);a.tripCooldown=Math.max(0,a.tripCooldown-dt);if(typeof NVCombatSquad!=='undefined'&&NVCombatSquad.staggered(s,n.id)){p.speed=0;continue;}
   if(a.mode==='idle'){const target=enemies.filter(t=>Math.hypot(t.x-player.x,t.z-player.z)<70).sort((x,y)=>Math.hypot(x.x-p.x,x.z-p.z)-Math.hypot(y.x-p.x,y.z-p.z))[0];a.engaged=!!target;a.chasing=false;if(target){const d=Math.hypot(target.x-p.x,target.z-p.z);p.yaw=Math.atan2(target.x-p.x,target.z-p.z);if(d>28||!visible(s,p,target)){if(typeof NVCombatSquad!=='undefined'){a.chasing=true;p.speed=NVCombatSquad.advance(s,p,target,Math.min(Math.max(0,d-1.5),5.5*dt))/dt;}continue;}p.speed=0;}if(a.kind==='gareth'&&a.tripCooldown===0&&(target||p.speed>3)){a.tripCooldown=45+random()*45;if(random()<.3){trip(s,n);continue;}}if(target&&a.cooldown===0)begin(s,n,a,target);}
   if(a.mode==='idle')continue;a.elapsed+=dt;const t=a.target?enemies.find(e=>e.enemy===a.target.enemy&&((e.type==='predator'?(e.enemy.bcHP??50):e.enemy.hp)>0)):null;if(t&&a.mode!=='trip')p.yaw=Math.atan2(t.x-p.x,t.z-p.z);
   if(a.mode==='chains'&&a.elapsed>=.55&&a.shots===0){a.shots=1;if(t&&enemies.some(e=>e.enemy===t.enemy)&&Math.hypot(t.x-p.x,t.z-p.z)<=34){hit(t,a.kind==='josiah'?26:22,4,n.id);effect(s,{type:'chain',kind:a.kind,from:{...p},to:{x:t.x,z:t.z},enemy:t.enemy,life:4});}}
   if(a.mode==='heaven'&&a.elapsed>=1.3&&a.shots===0){a.shots=1;for(const e of enemies)if(Math.hypot(e.x-p.x,e.z-p.z)<18&&visible(s,p,e))hit(e,65,2.5,n.id);effect(s,{type:'wave',kind:a.kind,from:{...p},life:1});}
   if(a.mode==='pistols'){for(const [i,when]of [.18,.39].entries())if(a.elapsed>=when&&a.shots===i){a.shots++;if(t&&enemies.some(e=>e.enemy===t.enemy)&&Math.hypot(t.x-p.x,t.z-p.z)<=34){hit(t,15,0,n.id);effect(s,{type:'bullet',kind:a.kind,from:{...p},to:{x:t.x,z:t.z},side:i?1:-1,life:.18});}}}
   if(a.elapsed>=a.duration){a.mode='idle';a.target=null;a.cooldown=a.kind==='gareth'?.65:2.3;}
  }
  if(NVEcology.ensure(s).health<=0)NVEcology.recover(s);
 }
 function pose(s,id){return runtimes.get(s)?.actors.get(id)||null;}
 function playerAttack(s){if(!playable(s)||NVKhazglar.fighting(s)||NVPontifex.local(s))return false;const q=state(s);if((q.playerCooldown||0)>q.clock)return false;const t=targets(s).filter(t=>t.type==='patrol'&&Math.hypot(t.x-s.x,t.z-s.z)<35&&NVPontifex.lineOfSight(s,s,t)).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0];if(!t)return false;hit(t,34);q.playerCooldown=q.clock+.32;effect(s,{type:'bullet',from:{x:s.x,z:s.z,yaw:s.yaw},to:t,side:1,life:.18});return true;}
 return{TAUNTS,kind,state,actor,playable,step,pose,trip,patrol,targets,restrain,held,bound,playerAttack};
})();
