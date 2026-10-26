const NVCaraxBosses=(()=>{
 const ZARK_QUOTES=[
  "ARCHAMUS BROUGHT YOU HERE TO DIE! I WILL BREAK HIS PRECIOUS COALITION BEFORE HIS EYES!",
  "I AM NOT AFRAID OF YOU, WANDERER! SEND EVERY CHAMPION IN THE GALAXY! THEY CANNOT DEFEAT ME!",
  "THE STARS ARE NOT YOUR INHERITANCE! THEY ARE THE EMBERS OF A UNIVERSE THAT BELONGS TO ME!",
  "YOU CALL THIS UNITY? I SEE A THOUSAND FRIGHTENED SPECIES HIDING BEHIND ONE MORTAL!",
  "NO MORE REFUGES! NO MORE SECOND CHANCES! WHEN I AM FINISHED, EVEN THE VOID WILL FORGET YOUR NAME!"
 ];
 const quoteDurations=Array(5).fill(9.5);
 const setQuoteDurations=rows=>rows.forEach((n,i)=>{if(i<5&&Number.isFinite(n)&&n>2)quoteDurations[i]=n;});
 const DEFS=[{id:'hawthorne-catharsis',name:'HAWTHORNE (CATHARSIS FORM)',floor:3,hp:1500000,height:3.7,patterns:['quad-rend','pounce','tail-sweep','neural-lance'],color:[.13,.9,.87]},
  {id:'lord-zark',name:'LORD ZARK',floor:4,hp:3000000,height:4.6,patterns:['infernal-dive','wingstorm','rift-barrage','sovereign-cleave'],color:[1,.25,.08]},
  {id:'orion-returned',name:'ORION MASCAR',floor:3,hp:750000,height:2.2,human:true,patterns:['twin-volley','laser-crossfire','combat-roll'],color:[1,.35,.16]}];
 const applicable=(s,d)=>!(typeof chapter5Unlocked==='function'&&chapter5Unlocked(s))&&(d.id!=='orion-returned'||typeof NVCaraxEndings!=='undefined'&&NVCaraxEndings.revenant(s));
 const ATTACKS={
  'twin-volley':{name:'TWIN LASER VOLLEY',duration:2.8,wind:.8,hits:[.95,1.25],radius:2.8,damage:10},
  'laser-crossfire':{name:'LASER CROSSFIRE',duration:3.5,wind:1.1,hits:[1.35,1.65,1.95],radius:3.4,damage:8},
  'combat-roll':{name:'EVASIVE ROLL',duration:2.4,wind:.7,hits:[1.55],radius:2.4,damage:12},
  'quad-rend':{name:'FOUR-ARM REND',duration:2.6,wind:1.0,hits:[1.12,1.40],radius:4.8,damage:10},
  pounce:{name:'PREDATORY POUNCE',duration:3.1,wind:1.1,hits:[1.85],radius:4,damage:16},
  'tail-sweep':{name:'BARBED TAIL SWEEP',duration:2.8,wind:1.2,hits:[1.55],radius:8,damage:14},
  'neural-lance':{name:'NEURAL LANCE',duration:3.0,wind:1.1,hits:[1.45],radius:3,damage:15},
  'infernal-dive':{name:'INFERNAL DIVE',duration:3.8,wind:1.55,hits:[2.28],radius:5.5,damage:22},
  wingstorm:{name:'WINGSTORM',duration:3.6,wind:1.25,hits:[1.7],radius:12,damage:18},
  'rift-barrage':{name:'RIFT BARRAGE',duration:3.8,wind:1.0,hits:[1.4,1.85,2.3],radius:3.8,damage:10},
  'sovereign-cleave':{name:'SOVEREIGN CLEAVE',duration:3.0,wind:1.05,hits:[1.25,1.6],radius:6,damage:12}
 };
 const clamp=(v,a,b,d=a)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):d;
 const fresh=()=>Object.fromEntries(DEFS.map(d=>[d.id,{caraxBossId:d.id,hp:d.hp,maxHp:d.hp,x:d.human?8:0,z:5,yaw:Math.PI,stage:'dormant',action:'idle',elapsed:0,cooldown:1.6,count:0,altitude:0,quote:0,quoteTime:quoteDurations[0],deathAge:0,hits:0}]));
 function restore(raw,secured=[]){const q=fresh();for(const d of DEFS){const r=raw?.[d.id],b=q[d.id];if(r){b.hp=clamp(r.hp,0,d.hp,d.hp);b.x=clamp(r.x,-17,17);b.z=clamp(r.z,-17,17,5);b.count=Math.floor(clamp(r.count,0,1e6));b.quote=Math.floor(clamp(r.quote,0,4));b.quoteTime=clamp(r.quoteTime,0,quoteDurations[b.quote],quoteDurations[b.quote]);}else if(secured[d.floor])b.hp=0;b.stage=b.hp<=0?'defeated':r?.stage==='fighting'?'fighting':'dormant';if(!b.hp)b.deathAge=6;}return q;}
 function ensure(s){const q=NVCarax.ensure(s);return q.bosses||(q.bosses=restore(null,q.secured));}
 function definitions(s){return DEFS.filter(d=>d.floor===NVCarax.ensure(s).deck&&applicable(s,d));}
 function definition(s){const ds=definitions(s),b=ensure(s);return ds.find(d=>b[d.id].hp>0)||ds[0]||null;}
 function local(s){return NVCarax.fighting(s)&&(NVCarax.inside(s)||NVCarax.ramp(s));}
 function enemies(s){if(!local(s))return[];const ds=definitions(s),b=ensure(s);return ds.filter(d=>!NVCarax.ensure(s).secured[d.floor]&&b[d.id].hp>0).map(d=>b[d.id]);}
 function targets(s){if(!local(s))return[];const c=NVCarax.center(s);return enemies(s).map(b=>{const d=DEFS.find(d=>d.id===b.caraxBossId);return{id:d.id,name:d.name,type:'carax-boss',enemy:b,x:c.x+b.x,z:c.z+b.z,height:d.height,faction:'CATHARSIS',carax:true};});}
 function begin(s,b){if(b.stage==='dormant'){b.stage='fighting';const d=DEFS.find(d=>d.id===b.caraxBossId);NVSpace.notice(s.space,d.name+' / '+d.hp.toLocaleString()+' HP');}}
 function hit(s,target,damage){const b=target.enemy;if(!Number.isFinite(damage)||damage<=0||!enemies(s).includes(b))return false;begin(s,b);const exposed=b.action!=='idle'&&b.elapsed>ATTACKS[b.action]?.hits.at(-1)+.15;
  // Match the large-HP faction boss scale; rifles and all companion weapons work.
  b.hp=Math.max(0,b.hp-damage*150*(exposed?1.5:1));b.hit=.18;if(!b.hp){b.stage='defeated';b.action='dead';b.elapsed=0;b.altitude=0;b.deathAge=0;NVSpace.notice(s.space,target.name+' DEFEATED / ACTIVATE THIS FLOOR’S SWITCH');}return true;}
 function allyHit(s,b,damage){return hit(s,{enemy:b,name:DEFS.find(d=>d.id===b.caraxBossId).name},damage);}
 function startAttack(s,b,d){const c=NVCarax.center(s),px=clamp(s.x-c.x,-16,16),pz=clamp(s.z-c.z,-16,16);b.action=d.patterns[b.count++%d.patterns.length];b.elapsed=0;b.hits=0;b.start={x:b.x,z:b.z};b.aim={x:px,z:pz};b.yaw=Math.atan2(px-b.x,pz-b.z);b.markers=['rift-barrage','laser-crossfire'].includes(b.action)?[{x:px,z:pz},{x:clamp(px+5,-16,16),z:clamp(pz-4,-16,16)},{x:clamp(px-5,-16,16),z:clamp(pz+4,-16,16)}]:[{x:['pounce','infernal-dive','neural-lance','twin-volley','combat-roll'].includes(b.action)?px:b.x,z:['pounce','infernal-dive','neural-lance','twin-volley','combat-roll'].includes(b.action)?pz:b.z}];}
 function stepOne(s,dt,d){if(!NVCarax.local(s)||!NVCarax.fighting(s))return;const b=ensure(s)[d.id];dt=clamp(dt,0,.1);if(!b.hp){b.deathAge=Math.min(6,b.deathAge+dt);return;}if(!local(s))return;begin(s,b);b.hit=Math.max(0,(b.hit||0)-dt);
  if(d.id==='lord-zark'){b.quoteTime-=dt;if(b.quoteTime<=0){b.quote=(b.quote+1)%5;b.quoteTime=quoteDurations[b.quote];}}
  if(b.action==='idle'){b.cooldown=Math.max(0,b.cooldown-dt);const c=NVCarax.center(s),dx=s.x-c.x-b.x,dz=s.z-c.z-b.z,dist=Math.hypot(dx,dz);b.yaw=Math.atan2(dx,dz);if(dist>10){const move=Math.min(dist-10,dt*(d.id==='lord-zark'?2.2:4.2));b.x=clamp(b.x+dx/dist*move,-17,17);b.z=clamp(b.z+dz/dist*move,-17,17);}if(!b.cooldown)startAttack(s,b,d);return;}
  const a=ATTACKS[b.action];if(!a)return;b.elapsed+=dt;
  if(['pounce','infernal-dive'].includes(b.action)){const t=clamp((b.elapsed-a.wind)/.7,0,1);b.x=b.start.x+(b.aim.x-b.start.x)*t;b.z=b.start.z+(b.aim.z-b.start.z)*t;b.altitude=b.action==='pounce'?Math.sin(t*Math.PI)*1.2:b.elapsed<a.wind?Math.sin(Math.min(1,b.elapsed/a.wind)*Math.PI/2)*2.4:Math.max(0,1-t)*2.4;}
  else if(b.action==='combat-roll'){const t=clamp((b.elapsed-a.wind)/.6,0,1);b.x=clamp(b.start.x+7*t,-17,17);b.altitude=Math.sin(t*Math.PI)*.15;}
  else b.altitude=b.action==='wingstorm'?Math.sin(Math.min(1,b.elapsed/a.duration)*Math.PI)*.7:0;
  while(b.hits<a.hits.length&&b.elapsed>=a.hits[b.hits]){const m=b.markers[Math.min(b.hits,b.markers.length-1)],c=NVCarax.center(s);if(Math.hypot(s.x-c.x-m.x,s.z-c.z-m.z)<a.radius&&(NVCarax.inside(s)||NVCarax.ramp(s)))NVEcology.ensure(s).health=Math.max(0,NVEcology.ensure(s).health-a.damage);b.hits++;}
  if(b.elapsed>=a.duration){b.action='idle';b.altitude=0;b.elapsed=0;b.cooldown=d.id==='lord-zark'?.9:1.0;}
 }
 function step(s,dt){if(!NVCarax.local(s)||!NVCarax.fighting(s))return;for(const d of definitions(s))stepOne(s,dt,d);}
 function blocked(s){const d=definition(s);return d&&ensure(s)[d.id].hp>0?d:null;}
 return{DEFS,ATTACKS,ZARK_QUOTES,quoteDurations,setQuoteDurations,fresh,restore,ensure,definition,definitions,applicable,local,enemies,targets,hit,allyHit,step,blocked,startAttack};
})();
