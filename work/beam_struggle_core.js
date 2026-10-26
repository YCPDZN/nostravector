// A recoverable good-ending challenge. This ledger never writes real companion/boss flags.
var NVBeamStruggle=(()=>{
 const RANTS={
  "orion":["YOU KILLED MY SON! DO NOT HIDE BEHIND A TOMORROW WHERE YOU LET HIM LIVE!","I HELD CROXIAN IN MY ARMS! NOW ALL I HAVE LEFT IS THE MONSTER WHO TOOK HIM!","YOUR FRIENDS CAN CALL YOU A HERO! IN MY WORLD, THEY BURIED MY BOY!","LOOK AT THE ARMOUR! LOOK AT WHAT YOUR MERCY CAME TOO LATE TO STOP!","YOU DO NOT GET TO WALK AWAY FROM ME AGAIN!"],
  "tyrotaronus":["THE OILKOUMENEUS WERE PULLING YOUR STRINGS BEFORE YOUR FIRST BREATH!","IN ANOTHER TIMELINE, YOU CALLED ME BROTHER! I CALLED YOU A USEFUL LITTLE PUPPET!","TYROMAIRON’AS! TYRONIHLUS! THE ANCIENT ONES DO NOT NEED YOUR PERMISSION!","YOU CANNOT SHOOT THE HAND THAT BUILT YOUR STAGE!","EVERY PATH YOU COULD HAVE TAKEN STILL LEADS INTO OUR HANDS!"],
  "josiah":["You remember my golden chains. You never asked how many Wanderers they have held.","Another timeline. Another hopeful little face. The same links, closing one by one.","Pull harder. I rather enjoy watching someone mistake resistance for freedom.","I have unmade reality before. What makes you think this version of you is indispensable?","When these golden chains fall silent, there will be no one left to remember your victory."]
 };
 const quoteDurations=Array.from({length:3},()=>Array(5).fill(8));
 const setQuoteDurations=rows=>rows.forEach(r=>{if(r.boss<3&&r.quote<5&&r.duration>0)quoteDurations[r.boss][r.quote]=r.duration+2;});
 const DEFS=[
  {id:'orion',name:'ORION MASCAR — NIGHTMARE',hp:750000,patterns:['burst','grenade','shockwave'],color:[1,.35,.17]},
  {id:'tyrotaronus',name:'TYROTARONUS — NIGHTMARE',hp:500000,patterns:['dark-orb','void-grip','balance-lance'],color:[.35,1,.55]},
  {id:'josiah',name:'JOSIAH RICHARDS — NIGHTMARE',hp:1000000,patterns:['golden-bind','chain-sweep','false-step'],color:[1,.73,.2]},
  {id:'zark',name:'LORD ZARK — NIGHTMARE',hp:3000000,patterns:['infernal-dive','wingstorm','rift-barrage','sovereign-cleave'],color:[1,.25,.1]}
 ];
 const ATTACKS={
  'dark-orb':{name:'DARK ORB',wind:1,duration:2.7,hits:[1.3],radius:3,damage:14},
  'void-grip':{name:'OILKOUMENEUS GRASP',wind:1.3,duration:3.3,hits:[1.65],radius:7,damage:18,jumpable:true},
  'balance-lance':{name:'DARK LANCE',wind:.9,duration:2.6,hits:[1.2],radius:2.6,damage:12},
  'golden-bind':{name:'GOLDEN CHAINS',wind:1.5,duration:3.5,hits:[1.8],radius:4,damage:18},
  'chain-sweep':{name:'CHAIN SWEEP',wind:1.2,duration:3,hits:[1.55],radius:8,damage:16,jumpable:true},
  'false-step':{name:'FALSE STEP',wind:.9,duration:2.8,hits:[1.25],radius:3.2,damage:14}
 };
 const clamp=(n,a,b,f=a)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):f;
 const enemy=index=>({hp:DEFS[index].hp,maxHp:DEFS[index].hp,x:0,z:-6,yaw:0,action:'idle',elapsed:0,cooldown:1.8,count:0,hits:0,altitude:0,phase:0,speed:0,quote:0,quoteTime:0,markers:[],start:{x:0,z:-6},aim:{x:0,z:8},deathAge:0});
 const player=()=>({x:0,z:8,yaw:Math.PI,hp:100,jump:0,vy:0,phase:0,speed:0,stamina:100,exhausted:false,cameraYaw:Math.PI,cameraPitch:.32,aim:0,recoil:0});
 const fresh=()=>({stage:'none',elapsed:0,index:0,failures:0,player:player(),enemy:enemy(0),cooldown:0,shot:null});
 function restore(raw){
  const q=fresh();if(!raw||typeof raw!=='object')return q;
  q.stage=['none','qte','firing','failure','gameover','battle','interlude','complete'].includes(raw.stage)?raw.stage:'none';q.elapsed=clamp(raw.elapsed,0,600);q.index=Math.floor(clamp(raw.index,0,3));q.failures=Math.floor(clamp(raw.failures,0,1e6));q.enemy=enemy(q.index);
  for(const k of ['x','z','yaw','phase'])q.player[k]=clamp(raw.player?.[k],k==='phase'?0:-16,k==='phase'?1e8:16,q.player[k]);q.player.hp=clamp(raw.player?.hp,0,100,100);q.player.stamina=clamp(raw.player?.stamina,0,100,100);q.player.exhausted=raw.player?.exhausted===true;q.player.cameraYaw=clamp(raw.player?.cameraYaw,-1e6,1e6,Math.PI);q.player.cameraPitch=clamp(raw.player?.cameraPitch,.08,.9,.32);q.player.jump=clamp(raw.player?.jump,0,8);q.player.vy=clamp(raw.player?.vy,-20,10);
  for(const k of ['x','z','yaw','elapsed','cooldown','count','hits','altitude','phase','quote','quoteTime','deathAge'])if(Number.isFinite(raw.enemy?.[k]))q.enemy[k]=clamp(raw.enemy[k],k==='x'||k==='z'||k==='yaw'?-16:0,k==='x'||k==='z'||k==='yaw'?16:k==='quote'?4:k==='quoteTime'?60:1e8);
  q.enemy.hp=clamp(raw.enemy?.hp,0,DEFS[q.index].hp,DEFS[q.index].hp);q.enemy.count=Math.floor(q.enemy.count);q.enemy.quote=Math.floor(q.enemy.quote);q.enemy.hits=Math.floor(q.enemy.hits);
  if(DEFS[q.index].patterns.includes(raw.enemy?.action))q.enemy.action=raw.enemy.action;
  for(const key of ['aim','start'])if([raw.enemy?.[key]?.x,raw.enemy?.[key]?.z].every(Number.isFinite))q.enemy[key]={x:clamp(raw.enemy[key].x,-16,16),z:clamp(raw.enemy[key].z,-16,16)};
  q.enemy.markers=(Array.isArray(raw.enemy?.markers)?raw.enemy.markers:[]).slice(0,3).filter(m=>[m?.x,m?.z].every(Number.isFinite)).map(m=>({x:clamp(m.x,-16,16),z:clamp(m.z,-16,16)}));q.cooldown=clamp(raw.cooldown,0,.32);
  return q;
 }
 const ensure=q=>q.beam||(q.beam=fresh());
 const active=q=>q?.route==='good'&&q.stage==='cinematic'&&!['none','complete'].includes(ensure(q).stage);
 const definition=q=>DEFS[ensure(q).index];
 const laugh='HAHAHAHA! ALL THAT POWER, AND YOU STILL FAILED! YOUR FRIENDS CANNOT SAVE YOU FROM EVERY WORLD YOU LEFT BEHIND!';
 function start(q){if(q.route!=='good'||q.stage!=='cinematic'||ensure(q).stage!=='none')return false;const failures=ensure(q).failures;q.beam={...fresh(),failures,stage:'qte'};q.time=0;q.voiceTime=0;return true;}
 function fail(q){const b=ensure(q);if(b.stage!=='qte')return false;b.stage='failure';b.elapsed=0;b.failures++;q.time=0;q.voiceTime=0;return true;}
 function fire(q){const b=ensure(q);if(b.stage!=='qte'||b.elapsed>=5)return false;b.stage='firing';b.elapsed=0;q.time=0;return true;}
 function beginBattle(q){const b=ensure(q);if(b.stage!=='gameover')return false;b.stage='battle';b.elapsed=0;b.enemy=enemy(b.index);b.player=player();b.cooldown=0;b.shot=null;q.time=0;return true;}
 function spec(q){const b=ensure(q),id=b.enemy.action;if(b.index===0){if(id==='idle')return null;const n=NVVengefulMascar.phaseOneAttack(id==='shockwave'?0:20,id==='grenade'?3:1);return{...n,name:id.toUpperCase(),duration:n.wind+n.release+n.recovery,hits:[n.wind]};}return b.index===3?NVCaraxBosses.ATTACKS[id]:ATTACKS[id];}
 function startAttack(q){const b=ensure(q),e=b.enemy,p=b.player,d=definition(q),distance=Math.hypot(p.x-e.x,p.z-e.z);e.count++;
  e.action=b.index===0?NVVengefulMascar.phaseOneAttack(distance,e.count).id:d.patterns[(e.count-1)%d.patterns.length];e.elapsed=0;e.hits=0;e.start={x:e.x,z:e.z};e.aim={x:p.x,z:p.z};
  if(e.action==='false-step'){e.x=clamp(p.x+5,-15,15);e.z=clamp(p.z-4,-15,15);}
  const radial=['shockwave','void-grip','chain-sweep','wingstorm','sovereign-cleave'].includes(e.action),mark=radial?{x:e.x,z:e.z}:e.aim;
  e.markers=e.action==='rift-barrage'?[{...mark},{x:clamp(p.x+5,-16,16),z:clamp(p.z-4,-16,16)},{x:clamp(p.x-5,-16,16),z:clamp(p.z+4,-16,16)}]:[{...mark}];
 }
 function shoot(q,targeted=null){const b=ensure(q);if(b.stage!=='battle'||b.cooldown>0||b.enemy.hp<=0||Math.hypot(b.enemy.x-b.player.x,b.enemy.z-b.player.z)>46)return false;const a=spec(q),exposed=a&&b.enemy.elapsed>a.hits.at(-1)+.1;
  const angle=Math.abs(Math.atan2(Math.sin(Math.atan2(b.enemy.x-b.player.x,b.enemy.z-b.player.z)-b.player.cameraYaw),Math.cos(Math.atan2(b.enemy.x-b.player.x,b.enemy.z-b.player.z)-b.player.cameraYaw))),hit=targeted===null?angle<.65:targeted;
  const amount=b.index===0?(exposed?10000:6000):b.index===3?(exposed?27000:18000):(exposed?18000:12000);
  b.enemy.hp=Math.max(0,b.enemy.hp-(hit?amount:0));b.cooldown=.24;b.player.yaw=hit?Math.atan2(b.enemy.x-b.player.x,b.enemy.z-b.player.z):b.player.cameraYaw;b.player.aim=1;b.player.recoil=1;b.shot={from:{x:b.player.x,z:b.player.z},to:hit?{x:b.enemy.x,z:b.enemy.z}:{x:b.player.x+Math.sin(b.player.yaw)*60,z:b.player.z+Math.cos(b.player.yaw)*60},life:.18};
  if(!b.enemy.hp){b.stage='interlude';b.elapsed=0;b.enemy.action='idle';b.enemy.altitude=0;b.enemy.deathAge=0;}return true;
 }
 const jumpWorld=()=>typeof NVSol!=='undefined'&&NVSol.byId?.carax||{id:'earth'};
 function jump(q){const b=ensure(q);if(b.stage!=='battle'||b.player.jump>0)return false;b.player.vy=typeof NVJump!=='undefined'?NVJump.start(jumpWorld()).velocity:4.5;return true;}
 function step(q,dt,input={}){
  const b=ensure(q);if(!active(q)||!Number.isFinite(dt)||dt<0)return'';
  if(b.stage==='qte'){b.elapsed=Math.min(5,b.elapsed+dt);q.time=b.elapsed;if(b.elapsed>=5){fail(q);return'qte-failed';}return'';}
  if(b.stage==='failure'){b.elapsed+=Math.min(.1,dt);q.time=b.elapsed;if(b.elapsed>=Math.max(4.5,typeof NVCaraxEndingVoice!=='undefined'?(NVCaraxEndingVoice.record(q)?.duration||0)+.7:0)&&(typeof NVCaraxEndingVoice==='undefined'||NVCaraxEndingVoice.ready())){b.stage='gameover';b.elapsed=0;return'gameover';}return'';}
  if(b.stage==='firing'){b.elapsed+=Math.min(.1,dt);q.time=b.elapsed;if(b.elapsed>=4){b.stage='complete';b.elapsed=0;q.shot=NVCaraxEndings.GOOD_INTRO.length;q.time=0;q.voiceTime=0;return'epilogue';}return'';}
  if(b.stage==='interlude'){b.elapsed+=Math.min(.1,dt);b.enemy.deathAge=b.elapsed;q.time=b.elapsed;if(b.elapsed<2.5)return'';
   if(b.index===3){const failures=b.failures;q.beam={...fresh(),failures};q.shot=0;q.time=0;q.voiceTime=0;return'cutscene-restart';}
   b.index++;b.stage='battle';b.elapsed=0;b.player=player();b.enemy=enemy(b.index);b.cooldown=0;b.shot=null;return'boss-started';
  }
  if(b.stage!=='battle')return'';dt=Math.min(.1,dt);b.elapsed+=dt;q.time=b.elapsed;const p=b.player,e=b.enemy;
  if(input.turnLeft)p.cameraYaw-=dt*1.5;if(input.turnRight)p.cameraYaw+=dt*1.5;
  const forward=Number(input.forward||0)-Number(input.back||0),right=Number(input.left||0)-Number(input.right||0),len=Math.hypot(forward,right),speed=typeof NVAntarctica!=='undefined'?NVAntarctica.staminaStep(p,!!input.sprint,len>0,dt):(input.sprint?7:1.4),old={x:p.x,z:p.z};
  if(len){const dx=(Math.sin(p.cameraYaw)*forward+Math.cos(p.cameraYaw)*right)/len,dz=(Math.cos(p.cameraYaw)*forward-Math.sin(p.cameraYaw)*right)/len;p.x=clamp(p.x+dx*speed*dt,-16,16);p.z=clamp(p.z+dz*speed*dt,-16,16);const target=Math.atan2(dx,dz);p.yaw+=Math.atan2(Math.sin(target-p.yaw),Math.cos(target-p.yaw))*Math.min(1,dt*12);}
  const actual=Math.hypot(p.x-old.x,p.z-old.z)/Math.max(.001,dt);p.speed+=(actual-p.speed)*Math.min(1,dt*9);p.phase+=typeof NVAntarctica!=='undefined'?NVAntarctica.gaitAdvance(actual,dt):actual*dt*3.7;p.aim=Math.max(.65,p.aim-dt*.4);p.recoil*=Math.exp(-dt*18);
  const gravity=typeof NVJump!=='undefined'?NVJump.gravity(jumpWorld()):9.81;if(p.jump>0||p.vy>0){p.jump+=p.vy*dt-.5*gravity*dt*dt;p.vy-=gravity*dt;if(p.jump<=0){p.jump=0;p.vy=0;}}
  b.cooldown=Math.max(0,b.cooldown-dt);if(b.shot){b.shot.life-=dt;if(b.shot.life<=0)b.shot=null;}
  if(input.fire&&shoot(q)&&b.stage==='interlude')return'boss-defeated';
  const duration=b.index===3?NVCaraxBosses.quoteDurations[e.quote]:quoteDurations[b.index][e.quote];e.quoteTime+=dt;if(e.quoteTime>=duration){e.quoteTime=0;e.quote=(e.quote+1)%5;}
  e.speed=0;e.yaw=Math.atan2(p.x-e.x,p.z-e.z);
  if(e.action==='idle'){e.cooldown=Math.max(0,e.cooldown-dt);const distance=Math.hypot(p.x-e.x,p.z-e.z),keep=b.index===0?12:b.index===3?10:11;if(distance>keep){const amount=Math.min(distance-keep,dt*(b.index===0?4.2:b.index===3?2.2:3.2));e.x=clamp(e.x+(p.x-e.x)/distance*amount,-16,16);e.z=clamp(e.z+(p.z-e.z)/distance*amount,-16,16);e.speed=amount/dt;e.phase+=amount*3.7;}if(!e.cooldown)startAttack(q);return'';}
  const a=spec(q);if(!a){e.action='idle';return'';}e.elapsed+=dt;
  if(e.action==='infernal-dive'){const u=clamp((e.elapsed-a.wind)/.7,0,1);e.x=e.start.x+(e.aim.x-e.start.x)*u;e.z=e.start.z+(e.aim.z-e.start.z)*u;e.altitude=e.elapsed<a.wind?Math.sin(Math.min(1,e.elapsed/a.wind)*Math.PI/2)*2.4:(1-u)*2.4;}else e.altitude=e.action==='wingstorm'?Math.sin(Math.min(1,e.elapsed/a.duration)*Math.PI)*.7:0;
  while(e.hits<a.hits.length&&e.elapsed>=a.hits[e.hits]){const mark=e.markers[Math.min(e.hits,e.markers.length-1)];if(mark&&Math.hypot(p.x-mark.x,p.z-mark.z)<a.radius&&(!a.jumpable||p.jump<1.05))p.hp=Math.max(0,p.hp-a.damage);e.hits++;}
  if(!p.hp){b.stage='complete';b.elapsed=0;b.shot=null;q.route=['bad','bad-tyrotaronus','bad-josiah','bad-zark'][b.index];q.nightmareDefeat=true;q.shot=1;q.time=0;q.voiceTime=0;q.betrayerId='';return'player-fell';}
  if(e.elapsed>=a.duration){e.action='idle';e.elapsed=0;e.altitude=0;e.cooldown=b.index===0?1.1:b.index===3?.9:1.1;}
  return'';
 }
 function quote(q){const b=ensure(q);return b.index===3?NVCaraxBosses.ZARK_QUOTES[b.enemy.quote]:RANTS[DEFS[b.index].id][b.enemy.quote];}
 function camera(q,mobile){const p=ensure(q).player,distance=mobile?6.4:5.4,pitch=p.cameraPitch||.32;return{eye:[p.x-Math.sin(p.cameraYaw)*distance*Math.cos(pitch),Math.max(.7,p.jump+1.2+Math.sin(pitch)*distance),p.z-Math.cos(p.cameraYaw)*distance*Math.cos(pitch)],target:[p.x,p.jump+1.2,p.z]};}
 return{RANTS,DEFS,ATTACKS,quoteDurations,setQuoteDurations,laugh,fresh,restore,ensure,active,definition,start,fail,fire,beginBattle,spec,startAttack,shoot,jump,step,quote,camera};
})();
