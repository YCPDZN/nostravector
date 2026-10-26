// Companion attacks share targeting, but retain distinct timing, range and animation.
const NVCompanionCombat=(()=>{
 const runtime=new WeakMap(),C={laser:[.9,.18,16,32],ice:[1.7,.65,24,28],sweep:[1.3,.62,30,5.2],slam:[1.8,.95,36,5.5],lance:[1.5,.7,25,24],hammer0:[1.4,.65,32,4],hammer1:[1.5,.75,34,4],hammer2:[1.7,.9,38,4.5],hammer3:[1.9,1,42,5],shockwave:[2.2,1.1,44,14],grinder:[1.1,.4,18,3.2],burst:[1.2,.25,12,28],dash:[1.6,.7,22,5],orb:[1.9,.85,26,22],cleave:[1.6,.75,32,6],rifle:[1.1,.3,20,30],unarmed:[.9,.35,14,2.5]};
 const playable=s=>NVBCCombat.playable(s);
 const enabled=(s,id)=>playable(s)&&NVGovernance.follows(s,id);
 function state(s){const key=NVCombatSquad.key(s);let q=runtime.get(s);if(!q||q.key!==key){q={key,actors:new Map(),effects:[],clock:0,health:NVEcology.ensure(s).health,shout:0,serial:0};runtime.set(s,q);}return q;}
 function pose(s,id){if(typeof gameActive!=='undefined'&&!gameActive)return null;return runtime.get(s)?.actors.get(id)||null;}
 function crew(s){return NVCombatSquad.crew(s).filter(n=>!NVBCCombat.kind(n));}
 function position(s,n){return NVCombatSquad.position(s,n);}
 function attack(s,n,a){if(n.id==='orion')return'laser';if(n.id==='nyrexia')return'ice';if(n.id==='khazglar')return a.count>0&&a.count%5===4?'shockwave':'hammer'+a.count%4;if(n.id==='james'||n.id.startsWith('pm-'))return['sweep','slam','lance'][a.count%3];if(n.id==='malia')return['burst','dash','orb'][a.count%3];if(n.id==='croxian')return['sweep','slam','cleave'][a.count%3];if(n.id==='charon'||n.id==='kizna')return'grinder';return NVCombatCrew.weapon(s,n)==='hammer'?'hammer'+a.count%4:NVCombatCrew.weapon(s,n)==='scythe'?['sweep','slam','lance'][a.count%3]:NVCombatCrew.weapon(s,n);}
 const alive=t=>t.type==='predator'?(t.enemy.bcHP??50)>0:t.enemy.hp>0;
 function hit(t,damage,stun=0,penetration=false,source='wanderer'){if(t.type==='pontifex'){NVPontifex.damage(polarState,damage,'player');return;}if(t.type==='commander'){NVKarribassaBosses.damage(polarState,t.enemy.id,damage);return;}if(t.type==='hawthorne'){NVSiegeOfSol.damage(polarState,damage*150);return;}if(t.type==='vengeful-orion'&&t.enemy.mode==='transform')return;if(t.type==='carax-boss'){NVCaraxBosses.hit(polarState,t,damage);return;}if(t.type==='faction-leader'){NVFactionLeaders.hit(polarState,t,damage,source);return;}if(!alive(t))return;if(t.type==='patrol')NVCombatSquad.provoke(polarState,t.enemy,source,damage);if(t.type==='catharsis'&&!penetration)damage=Math.max(1,Math.round(damage*.18));if(t.type==='predator'){t.enemy.bcHP=Math.max(0,(t.enemy.bcHP??50)-damage);if(t.enemy.bcHP===0){t.enemy.mode='dead';t.enemy.speed=0;}}else{t.enemy.hp=Math.max(0,t.enemy.hp-damage);t.enemy.hit=.25;if(t.enemy.hp===0){t.enemy.mode='dead';t.enemy.timer=0;}}if(stun>0)NVBCCombat.restrain(t.enemy,stun);if(t.type==='vengeful-orion')NVVengefulMascar.victory(polarState);}
 function effect(s,type,p,to,color,life=.45){const q=state(s);q.effects.push({type,from:{x:p.x,z:p.z},to:to?{x:to.x,z:to.z}:null,color,age:0,life});if(q.effects.length>32)q.effects.shift();}
 function step(s,dt){if(!playable(s)){runtime.delete(s);return;}if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.1,dt);NVCombatSquad.step(s,dt);if(!NVCombatSquad.station(s)){NVCompanionMotion.updateGround(s,dt);NVCustomCrew.followStep(s,0);}const player=NVCombatSquad.player(s),q=state(s);q.clock+=dt;q.shout=Math.max(0,q.shout-dt);for(const e of q.effects)e.age+=dt;q.effects=q.effects.filter(e=>e.age<e.life);const followers=crew(s),targets=NVBCCombat.targets(s).filter(alive),health=NVEcology.ensure(s).health,hurt=health<q.health;q.health=health;
  for(const id of q.actors.keys())if(!followers.some(n=>n.id===id))q.actors.delete(id);
  for(const n of followers){const p=position(s,n);if(!p)continue;let a=q.actors.get(n.id);if(!a){a={companion:true,mode:'idle',elapsed:0,duration:0,cooldown:.2,count:0,hits:0,target:null};q.actors.set(n.id,a);}a.cooldown=Math.max(0,a.cooldown-dt);if(NVCombatSquad.staggered(s,n.id)){p.speed=0;continue;}
   const enemies=targets.filter(t=>alive(t)&&Math.hypot(t.x-player.x,t.z-player.z)<70);let t=enemies.find(t=>t.enemy===a.target?.enemy)||enemies.sort((t,u)=>Math.hypot(t.x-p.x,t.z-p.z)-Math.hypot(u.x-p.x,u.z-p.z))[0];
   if(a.mode==='idle'){if(!t){a.chasing=false;a.engaged=false;a.target=null;continue;}a.engaged=true;let action=attack(s,n,a);if(n.id==='khazglar'&&hurt&&a.cooldown===0)action='shockwave';const range=C[action][3],d=Math.hypot(t.x-p.x,t.z-p.z);p.yaw+=Math.atan2(Math.sin(Math.atan2(t.x-p.x,t.z-p.z)-p.yaw),Math.cos(Math.atan2(t.x-p.x,t.z-p.z)-p.yaw))*(1-Math.exp(-dt*10));
    a.target=t;a.chasing=d>range*.85||!NVCombatSquad.visible(s,p,t);if(a.chasing){const move=Math.min(Math.max(0,d-1.5),5.5*dt);p.speed=NVCombatSquad.advance(s,p,t,move)/dt;continue;}p.speed=0;
    if(a.cooldown>0)continue;Object.assign(a,{mode:action,elapsed:0,duration:C[action][0],hits:0,target:t,count:a.count+1});if(action==='shockwave'){q.shout=3;q.serial++;NVSpace.notice(s.space,'KHAZGLAR: DO NOT TOUCH THEM!');}
   }
   a.elapsed+=dt;p.speed=0;if(t)p.yaw+=Math.atan2(Math.sin(Math.atan2(t.x-p.x,t.z-p.z)-p.yaw),Math.cos(Math.atan2(t.x-p.x,t.z-p.z)-p.yaw))*(1-Math.exp(-dt*10));const spec=C[a.mode];if(!spec)continue;const times=a.mode==='laser'?[.18,.38]:a.mode==='burst'?[.25,.4,.55]:a.mode==='grinder'?[.4,.65]:[spec[1]];
   while(a.hits<times.length&&a.elapsed>=times[a.hits]){a.hits++;const pattern=n.combat?.pattern||'balanced',damage=Math.round(spec[2]*(n.id==='croxian'?.5:n.id==='malia'?.65:1)*(pattern==='heavy'?1.2:pattern==='rapid'?.75:1));const wave=['slam','shockwave','orb'].includes(a.mode),color=a.mode==='ice'?[.48,.85,1]:a.mode==='grinder'?[.78,.82,.88]:[.15,.9,1];
    if(wave){const center=a.mode==='orb'&&t?t:p,radius=a.mode==='shockwave'?14:a.mode==='orb'?4:spec[3];for(const target of enemies)if(Math.hypot(target.x-center.x,target.z-center.z)<radius&&NVCombatSquad.visible(s,p,target))NVCompanionCombat.hit(target,damage,a.mode==='shockwave'?1.2:0,false,n.id);effect(s,'wave',center,null,color,.65);}
    else if(t&&alive(t)&&Math.hypot(t.x-p.x,t.z-p.z)<=spec[3]+.7&&NVCombatSquad.visible(s,p,t)){NVCompanionCombat.hit(t,damage,a.mode==='ice'?2:0,false,n.id);effect(s,a.mode==='ice'?'ice':spec[3]>12?'laser':a.mode==='grinder'?'sparks':'arc',p,t,color,a.mode==='ice'?.7:.35);}
   }
   if(a.elapsed>=a.duration){a.mode='idle';a.target=null;a.cooldown=n.combat?.pattern==='rapid'?.45:n.combat?.pattern==='heavy'?1.3:.8;}
  }
 }
 function animation(pose,piece){const {r,combat:a}=pose,g=r.groups.get(piece),M=NVCompanionMotion,identity=M.t(0,0,0),pivot=(p,t)=>M.mul(M.t(...p),M.mul(t,M.t(...p.map(v=>-v)))),t=Math.max(0,Math.min(1,a.elapsed/a.duration)),ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);},wind=ease(t/.42),release=ease((t-.42)/.22),recover=1-ease((t-.7)/.3),lift=wind*recover,swing=(-wind+release*2)*recover;
  let local=identity;if(!g)return pose.body;const p=g.pivot||(g.kind==='arm'?[g.side*r.h*.17,r.lo+r.h*.70,0]:g.kind==='weapon'?[0,r.lo+r.h*.58,0]:[0,r.lo+r.h*.45,0]);
  if(g.kind==='arm'||g.kind==='weapon'){
   if(['laser','burst','rifle','lance'].includes(a.mode)){const shots=a.mode==='laser'?[.18,.38]:a.mode==='burst'?[.25,.4,.55]:[C[a.mode][1]],recoil=shots.reduce((v,at)=>v+(a.elapsed>=at?Math.exp(-(a.elapsed-at)*28):0),0),lower=ease((t-.84)/.16),aim=.65+.7*(1-lower);local=pivot(p,M.mul(M.rx(-aim-recoil*.10),M.rz(g.side*(a.mode==='rifle'?.14:.06))));}
   else if(['ice','orb'].includes(a.mode))local=pivot(p,M.mul(M.rx(-1.35*lift),M.rz(g.side*.3*lift)));
   else if(a.mode==='shockwave')local=pivot(p,M.rx(-2.8*lift));
   else if(a.mode==='grinder')local=pivot(p,M.mul(M.rx(-1.2*lift+Math.sin(a.elapsed*24)*.12*lift),M.rz(g.side*.18*lift)));
   else if(a.mode==='hammer0'||a.mode==='slam')local=pivot(p,M.rx(-1.9*wind*recover+release*2.5*recover));
   else if(a.mode==='hammer1'||a.mode==='sweep')local=pivot(p,M.mul(M.ry(swing*1.5),M.rx(-.55*lift)));
   else if(a.mode==='hammer2'||a.mode==='cleave')local=pivot(p,M.mul(M.rz(g.side*swing*1.1),M.rx(-1.3*lift)));
   else if(a.mode==='hammer3')local=pivot(p,M.mul(M.rx(-2.25*lift+release*2.8*recover),M.ry(swing*.5)));
   else local=pivot(p,M.rx(-1.4*lift));
  }else if(g.kind==='body')local=pivot(p,M.mul(M.ry(['sweep','hammer1','cleave'].includes(a.mode)?swing*.38:0),M.rx((release*.25-wind*.1)*recover)));
  else if(g.kind==='leg')local=pivot(p,M.rx(g.side*.08*lift));return M.mul(pose.body,local);
 }
 return{C,state,pose,crew,position,attack,enabled,playable,hit,step,animation};
})();
const companionCombatTick=stepEcology;stepEcology=dt=>{companionCombatTick(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState&&!NVCombatSquad.station(polarState))NVCompanionCombat.step(polarState,dt);};

const companionEcologyPopulate=NVEcology.populate;NVEcology.populate=s=>{const r=companionEcologyPopulate(s);for(const a of r.animals)if(a.species.behavior==='predator'){a.maxHp=50;a.bcHP=Math.min(50,a.bcHP??50);}return r;};
