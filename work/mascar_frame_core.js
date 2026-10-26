const NVMascarFrame=(()=>{
 const HP=1000000,DAMAGE=10;
 const QUOTES=[
  'HA! You thought that was ME giving up? That was me getting into the DRIVER’S SEAT!',
  'Look at these hands! I could pick up your little ship and SHAKE THE HERO OUT OF IT!',
  'Croxian would have loved this machine. ... DON’T YOU DARE SAY HIS NAME!',
  'UP HERE! HAHAHA! You keep the dirt! I’LL TAKE THE WHOLE SKY!',
  'Warning lights? WARNING LIGHTS?! Stop blinking and GIVE ME MORE POWER!',
  'You broke my armour. Congratulations! I BROUGHT A BUILDING TO WEAR!',
  'Hear that engine? That’s the sound of me having a WONDERFUL IDEA!',
  'Left claw! Right claw! Oh, I can never choose! LET’S USE BOTH!',
  'I can see you down there! Such a little thing to have RUINED MY ENTIRE LIFE!',
  'No, no, NO! Don’t fall over yet! I HAVEN’T FINISHED SHOWING YOU WHAT IT DOES!',
  'They told me this frame needed two pilots. HA! I’M ANGRY ENOUGH FOR BOTH!',
  'Landing gear? I don’t need landing gear! I HAVE YOUR PRECIOUS GROUND TO BREAK!',
  'Every dent has your name on it! I’m going to need a BIGGER MACHINE!',
  'Croxian, watch this! ... Watch— ... WHY ARE YOU STILL STANDING?!',
  'If this frame comes apart, I’ll crawl out of it! IF I CAN STILL MOVE, I CAN STILL FIND YOU!'
 ];
 const ACTIONS=[
  {id:'piston-punch',name:'PISTON PUNCH',windup:1.25,shape:'cone',radius:12,jump:false},
  {id:'claw-sweep',name:'CLAW SWEEP',windup:1.45,shape:'cone',radius:15,jump:true},
  {id:'seismic-stomp',name:'SEISMIC STOMP',windup:1.65,shape:'ring',radius:16,jump:true},
  {id:'shoulder-barrage',name:'SHOULDER BARRAGE',windup:1.8,shape:'target',radius:7,jump:false},
  {id:'arc-cannon',name:'ARC CANNON',windup:1.6,shape:'line',radius:3.5,jump:false},
  {id:'jet-dash',name:'JET DASH',windup:1.6,shape:'line',radius:4,jump:true,flight:true},
  {id:'aerial-strafe',name:'AERIAL STRAFE',windup:2,shape:'target',radius:8,jump:false,flight:true},
  {id:'dive-slam',name:'DIVE SLAM',windup:2.4,shape:'target',radius:11,jump:true,flight:true},
  {id:'rotor-spin',name:'ROTOR SPIN',windup:1.7,shape:'ring',radius:15,jump:true},
  {id:'twin-hammer',name:'TWIN HAMMER',windup:2,shape:'target',radius:10,jump:true}
 ];
 const fresh=()=>({attackIndex:0,quote:0,quoteTime:9,time:0,startX:0,startZ:0,hitDone:false,airborne:false});
 function restore(r){const f=fresh();if(!r)return f;for(const k of ['startX','startZ'])if(Number.isFinite(r[k]))f[k]=Math.max(-45,Math.min(45,r[k]));f.attackIndex=Math.max(0,Math.floor(Number(r.attackIndex)||0))%10;f.quote=Math.max(0,Math.floor(Number(r.quote)||0))%15;f.quoteTime=Math.max(0,Math.min(9,Number(r.quoteTime)||0));f.time=Math.max(0,Number(r.time)||0);f.hitDone=r.hitDone===true;f.airborne=r.airborne===true;return f;}
 const ensure=q=>q.frame||(q.frame=fresh());
 const action=b=>ACTIONS.find(a=>a.id===b.action)||ACTIONS[0];
 function begin(s){const q=NVVengefulMascar.ensure(s);if(q.form===2||q.stage!=='hunt')return false;q.form=2;q.frame=fresh();Object.assign(q.enemy,{hp:HP,maxHp:HP,altitude:0,mode:'transform',timer:3,duration:3,action:'',speed:0,flash:0});q.weaponCooldown=1;q.notice='PHASE 2 / MASCAR FRAME / 1,000,000 HP';q.noticeTime=8;q.engaged=true;return true;}
 function progress(b){return Math.max(0,Math.min(1,1-b.timer/Math.max(.001,b.duration)));}
 function pointDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/l)):0;return Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t);}
 function hit(s,q,a,n){const b=q.enemy,f=ensure(q),spec=action(b),p={x:s.x-a.x,z:s.z-a.z},aim=b.aim||b,origin={x:f.startX,z:f.startZ},gap=Math.hypot(p.x-aim.x,p.z-aim.z),d=Math.hypot(p.x-b.x,p.z-b.z);let touches=spec.shape==='target'?gap<spec.radius:spec.shape==='line'?pointDistance(p,origin,aim)<spec.radius:d<spec.radius;
  if(spec.shape==='cone'){const dx=p.x-b.x,dz=p.z-b.z;touches=touches&&(dx*Math.sin(b.yaw)+dz*Math.cos(b.yaw))/(d||1)>=0;}
  if(spec.jump&&(s.jumpOffset||0)>1.05)touches=false;f.hitDone=true;if(!touches||!NVPontifex.lineOfSight(s,n,s))return false;
  const ecology=NVEcology.ensure(s);ecology.health=Math.max(0,ecology.health-DAMAGE);if(!ecology.health){ecology.health=100;s.x=a.x;s.z=a.z-72;Object.assign(b,{hp:HP,mode:'idle',cooldown:2,x:0,z:0,altitude:0});q.engaged=false;f.airborne=false;}return true;
 }
 function step(s,dt,held,api=NVVengefulMascar){const q=api.ensure(s),b=q.enemy,f=ensure(q);dt=Math.min(.1,dt);q.noticeTime=Math.max(0,q.noticeTime-dt);q.weaponCooldown=Math.max(0,q.weaponCooldown-dt);if(q.shot)q.shot.time=Math.max(0,q.shot.time-dt);if(api.victory(s))return;const n=api.local(s),a=api.anchor(s);if(!n||n.distance>95){q.engaged=false;return;}if(n.distance<55)q.engaged=true;if(!q.engaged)return;f.time+=dt;b.speed=0;b.flash=Math.max(0,(b.flash||0)-dt);f.quoteTime-=dt;if(f.quoteTime<=0){f.quote=(f.quote+1)%(api.quotes?.length||QUOTES.length);f.quoteTime=api.quoteDuration?.(f.quote)||9;}
  if(b.mode==='transform'){b.timer=Math.max(0,b.timer-dt);if(!b.timer){b.mode='idle';b.cooldown=1;}return;}
  if(held)api.fire(s);if(q.form===3||q.stage!=='hunt')return;if(typeof NVBCCombat!=='undefined'&&NVBCCombat.held(b,dt*2))return;const spec=action(b);
  if(b.mode==='windup'){b.timer=Math.max(0,b.timer-dt);const t=progress(b);b.altitude+=( (spec.flight?(spec.id==='dive-slam'?14:spec.id==='aerial-strafe'?10:5):0)-b.altitude)*Math.min(1,dt*5);
   if(spec.id==='aerial-strafe'){const side=Math.sin(t*Math.PI)*9;b.x=f.startX+Math.cos(b.yaw)*side;b.z=f.startZ-Math.sin(b.yaw)*side;const r=Math.hypot(b.x,b.z);if(r>44){b.x*=44/r;b.z*=44/r;}}
   if(spec.id==='dive-slam'){b.x=f.startX+(b.aim.x-f.startX)*t;b.z=f.startZ+(b.aim.z-f.startZ)*t;}
   if(!b.timer){b.mode='release';b.timer=.7;b.duration=.7;b.flash=.3;}return;
  }
  if(b.mode==='release'){b.timer=Math.max(0,b.timer-dt);const t=progress(b);if(spec.id==='jet-dash'){b.x=f.startX+(b.aim.x-f.startX)*t;b.z=f.startZ+(b.aim.z-f.startZ)*t;}
   if(spec.id==='dive-slam')b.altitude=14*(1-t)*(1-t);
   if(!f.hitDone&&t>=(['dive-slam','seismic-stomp','twin-hammer'].includes(spec.id)?.9:.5))hit(s,q,a,api.local(s));
   if(!q.engaged)return;if(!b.timer){b.mode='recovery';b.timer=1.45;b.duration=1.45;f.airborne=spec.id==='aerial-strafe';}return;
  }
  const targetHeight=f.airborne?5+Math.sin(f.time*2)*.35:0;b.altitude+=(targetHeight-b.altitude)*Math.min(1,dt*4);
  if(b.mode==='recovery'){b.timer=Math.max(0,b.timer-dt);if(!b.timer){b.mode='idle';b.cooldown=.8;}return;}
  b.cooldown=Math.max(0,b.cooldown-dt);b.yaw=Math.atan2(s.x-n.x,s.z-n.z);
  if(!b.cooldown&&n.distance<60){const next=ACTIONS[f.attackIndex];f.attackIndex=(f.attackIndex+1)%ACTIONS.length;b.action=next.id;b.mode='windup';b.timer=b.duration=next.windup;f.startX=b.x;f.startZ=b.z;f.hitDone=false;const dx=s.x-a.x,dz=s.z-a.z,k=Math.min(1,42/(Math.hypot(dx,dz)||1));b.aim={x:dx*k,z:dz*k};return;}
  if(n.distance>10){const move=Math.min(n.distance-10,6*dt);b.x+=(s.x-n.x)/n.distance*move;b.z+=(s.z-n.z)/n.distance*move;const r=Math.hypot(b.x,b.z);if(r>44){b.x*=44/r;b.z*=44/r;}b.phase+=move*1.6;b.speed=6;}
 }
 function pose(b,f){const p=progress(b),wind=b.mode==='windup',release=b.mode==='release',recovery=b.mode==='recovery',strength=wind?Math.sin(p*Math.PI/2):release?Math.cos(Math.PI*p/2):0,id=b.action;
  const out={leftArm:0,rightArm:0,leftElbow:0,rightElbow:0,leftLeg:Math.sin(b.phase||0)*(b.speed||0)*.045,rightLeg:-Math.sin(b.phase||0)*(b.speed||0)*.045,leftKnee:.08,rightKnee:.08,twist:0,lean:0,armSpread:0,drop:0,jets:b.altitude>.5};
  if(id==='piston-punch'){out.leftArm=-strength*1.55;out.leftElbow=(wind?.9:release?.9*(1-p)+.12*p:0)*strength;out.twist=-strength*.22;}
  if(id==='claw-sweep'){out.rightArm=-strength*.7;out.armSpread=(wind?.9:release?.9-1.6*Math.sin(p*Math.PI/2):0)*strength;out.twist=(wind?.5:release?.5-1.3*Math.sin(p*Math.PI/2):0)*strength;}
  if(id==='seismic-stomp'){out.leftLeg=-strength*.9;out.leftKnee=strength*1.2;out.drop=release?-.5*strength:0;}
  if(id==='shoulder-barrage'){out.leftArm=out.rightArm=-strength*.45;out.lean=(wind?-.1:release?-.1+.26*Math.sin(p*Math.PI):0)*strength;}
  if(id==='arc-cannon'){out.leftArm=-strength*1.4;out.leftElbow=strength*.28;out.twist=strength*.18;}
  if(id==='jet-dash'){out.lean=strength*.6;out.leftArm=out.rightArm=strength*.55;out.leftKnee=out.rightKnee=strength*.8;out.jets=true;}
  if(id==='aerial-strafe'){out.armSpread=strength*.85;out.leftLeg=out.rightLeg=-strength*.3;out.leftKnee=out.rightKnee=strength*.9;out.jets=true;}
  if(id==='dive-slam'){out.leftArm=out.rightArm=-strength*2.4;out.leftKnee=out.rightKnee=strength*1.1;out.drop=release?-.5*strength:0;out.jets=wind;}
  if(id==='rotor-spin'){out.twist=(wind?p*.6:release?.6+p*Math.PI*4:recovery?.6*(1-p):0);out.armSpread=strength*1.4;}
  if(id==='twin-hammer'){out.leftArm=out.rightArm=-strength*2.8;out.leftElbow=out.rightElbow=strength*.8;out.lean=(wind?-.2:release?-.2+.55*Math.sin(p*Math.PI):0)*strength;}
  return out;
 }
 return{HP,DAMAGE,QUOTES,ACTIONS,fresh,restore,ensure,action,begin,progress,pointDistance,hit,step,pose};
})();
const frameRestore=NVVengefulMascar.restore;NVVengefulMascar.restore=r=>{const q=frameRestore(r);q.frame=NVMascarFrame.restore(r?.frame);return q;};
