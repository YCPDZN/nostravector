// One opponent at a time in a separate, bounded arena inside the ending renderer.
function createBeamNightmareScenery({M,draw,actor,between,beam,orb,chainLink,josiahParts,player,canvas}){
 const cube=(p,size,c,e=0)=>draw(beam.geometry,M.mul(M.t(...p),M.scale(...size)),c,e);
 const ball=(p,r,c)=>draw(orb,M.mul(M.t(...p),M.scale(r,r,r)),c,.15);
 function line(a,b,c,width=.045){if(Math.hypot(...b.map((v,i)=>v-a[i]))>.001)draw(beam.geometry,M.mul(between([0,0,-.5],[0,0,.5],a,b),M.scale(width,width,1)),c,.16);}
 function ring(x,z,r,c){for(let i=0;i<32;i++){const a=i/32*Math.PI*2,b=(i+1)/32*Math.PI*2;line([x+Math.cos(a)*r,.045,z+Math.sin(a)*r],[x+Math.cos(b)*r,.045,z+Math.sin(b)*r],c,.035);}}
 const native=new Map(),playerMeshes=player().map(q=>({...q,bone:NVGroundPlayerBone(q)})),groundRig=createNVGroundPlayerRig({A:NVAntarctica,M});
 const around=(p,m)=>M.mul(M.t(...p),M.mul(m,M.t(...p.map(v=>-v))));
 function parts(id,source){if(!native.has(id))native.set(id,source.filter(p=>!/finger|knuckle|tread|buckle|cable|pouch|strand/i.test(p.name)));return native.get(id);}
 return(s,q)=>{
  const trial=NVBeamStruggle.ensure(q),b=trial.enemy,p=trial.player,d=NVBeamStruggle.definition(q),a=NVBeamStruggle.spec(q),time=trial.elapsed,dead=trial.stage==='interlude',lip=typeof NVBeamStruggleUI!=='undefined'?NVBeamStruggleUI.lip():{jaw:0,width:1};
  cube([0,-.15,0],[40,.3,40],[.035,.018,.065]);
  for(let i=-16;i<=16;i+=4){cube([i,.008,0],[.025,.015,34],[.095,.07,.15]);cube([0,.008,i],[34,.015,.025],[.095,.07,.15]);}
  for(const side of [-1,1])for(let i=-16;i<=16;i+=8){cube([side*18,1.1,i],[.55,2.2,.55],[.16,.09,.25]);cube([i,1.1,side*18],[.55,2.2,.55],[.16,.09,.25]);}
  const casting=a&&b.elapsed<a.hits.at(-1)+.25,release=a?Math.max(0,Math.min(1,b.elapsed/a.duration)):0,mode=casting?d.id==='orion'?'laser':d.id==='josiah'?'chains':'orb':'idle',hero={id:d.id,speed:casting?0:b.speed,gaitPhase:b.phase,grounded:true,combat:casting?d.id==='josiah'?{mode:'chains',elapsed:Math.min(1,b.elapsed*.5)}:{companion:true,mode,elapsed:release,duration:1}:{mode:'idle'}};
  const fall=dead?Math.min(1,b.deathAge)*1.25:0;
  if(d.id==='orion'){
   const pose=groundRig({x:0,z:0,y:0,yaw:0,aim:casting?1:.65,recoil:casting?Math.exp(-Math.max(0,b.elapsed-(a?.wind||0))*24)*.35:0},b.phase,b.speed,0,true);
   if(b.action==='shockwave')for(const side of ['L','R'])for(const limb of ['upperArm','lowerArm'])pose.bones[side+'-'+limb]=around([side==='L'?.27:-.27,1.34,0],M.rx(-2.3*Math.sin(Math.min(1,b.elapsed/(a.wind+.3))*Math.PI)));
   if(b.action==='grenade')for(const limb of ['upperArm','lowerArm'])pose.bones['R-'+limb]=around([-.27,1.34,0],M.rx(-2.4*Math.sin(Math.min(1,b.elapsed/(a.wind+.3))*Math.PI)));
   actor('nightmare-orion',parts('orion',ORION_IMPERIAL_PARTS),[b.x,0,b.z],1.15,b.yaw,time,{fall,aim:true,bossPose:pose,nativeLip:lip});
  }else if(d.id==='tyrotaronus'){
   const model=TyrotaronusModel,P=model.pivots,wind=casting?Math.sin(Math.min(1,b.elapsed/Math.max(.1,a.wind))*Math.PI/2):0,bones={body:M.t(0,Math.sin(time*1.5)*.015,0)};
   for(const side of [-1,1]){const arm=side<0?'leftArm':'rightArm',leg=side<0?'leftLeg':'rightLeg';bones[arm]=around(P[arm],M.mul(M.rx(-1.25*wind-.05),M.rz(side*.22*wind)));bones[leg]=around(P[leg],M.rx(Math.sin(b.phase+(side<0?0:Math.PI))*Math.min(1,b.speed)*.35));}bones.head=around(P.head,M.ry(Math.sin(time*.6)*.025));bones.jaw=bones.head;bones.tail=around(P.tail,M.ry(Math.sin(time*.8)*.1));
   actor('nightmare-tyrotaronus',parts('tyro',model.meshes),[b.x,0,b.z],.5,b.yaw,time,{fall,bossPose:{bones},nativeLip:lip,lipPivot:model.jawPivot||P.jaw});
  }
  else if(d.id==='josiah'){
   const meshes=josiahParts(s);if(meshes.length)actor('execution-josiah-nightmare-'+NVGLB.revision(),meshes,[b.x,0,b.z],1.12,b.yaw,time,{human:true,hero,fall,nativeLip:lip});
   if(casting)for(const side of [-1,1])for(let i=0;i<18;i++){const k=i/17,from=[b.x+side*.35,1.35,b.z+.3],end=[p.x+side*.3,.7,p.z],at=from.map((v,j)=>v+(end[j]-v)*k+(j===1?Math.sin(k*Math.PI)*.35:0));draw(chainLink,M.mul(M.t(...at),M.mul(M.ry(Math.atan2(end[0]-from[0],end[2]-from[2])),M.rx(i%2?1.57:0))),[.9,.6,.12],.17);}
  }else{
   const pose=NVCaraxBossMotion.pose(LordZarkModel,{...b,caraxBossId:'lord-zark'},time);actor('nightmare-zark',LordZarkModel.meshes,[b.x,b.altitude+pose.drop,b.z],.78,b.yaw+pose.yaw,time,{fall:pose.pitch,bossPose:pose,nativeLip:lip});
  }
  const playerPose=groundRig({x:0,z:0,y:0,yaw:0,aim:p.aim||.65,rifle:true,recoil:p.recoil||0,jumpOffset:0},p.phase,p.jump>0?0:p.speed,0,false,p.jump>0?.1:0);
  actor('nightmare-wanderer',playerMeshes,[p.x,p.jump,p.z],1,p.yaw,time,{bossPose:playerPose});
  const wrist=[-.577,.88,.016],handMatrix=playerPose.bones['R-lowerArm'],grip=[0,1,2].map(i=>handMatrix[i]*wrist[0]+handMatrix[i+4]*wrist[1]+handMatrix[i+8]*wrist[2]+handMatrix[i+12]),root=M.mul(M.t(p.x,p.jump,p.z),M.mul(M.ry(p.yaw),M.t(...grip)));
  for(const [at,size,c]of [[[0,0,.12],[.14,.15,.65],[.14,.2,.25]],[[0,.03,.55],[.075,.075,.35],[.16,.7,.86]],[[0,-.1,-.05],[.1,.2,.18],[.22,.25,.28]]])draw(beam.geometry,M.mul(root,M.mul(M.t(...at),M.scale(...size))),c);
  canvas.dataset.nightmareRig='main-game';canvas.dataset.nightmareAim=String(p.aim||.65);
  if(trial.shot)line([trial.shot.from.x,p.jump+1.4,trial.shot.from.z],[trial.shot.to.x,d.id==='zark'?2.7:1.3,trial.shot.to.z],[.35,.82,1],.06);
  if(a&&!dead)for(const [i,m]of b.markers.entries()){
   const hit=a.hits[Math.min(i,a.hits.length-1)];if(b.elapsed>hit+.4)continue;
   ring(m.x,m.z,a.radius,b.elapsed<hit?d.color:[.18,.14,.22]);
   if(b.elapsed>a.wind&&b.elapsed<hit+.15){const u=Math.max(0,Math.min(1,(b.elapsed-a.wind)/Math.max(.1,hit-a.wind))),at=[b.x+(m.x-b.x)*u,1.5*(1-u)+.2,b.z+(m.z-b.z)*u];ball(at,.18,d.color);}
  }
  canvas.dataset.nightmareBoss=d.id;canvas.dataset.nightmareAction=b.action;canvas.dataset.nightmareHP=String(b.hp);canvas.dataset.nightmareCount='1';canvas.dataset.nightmarePlayerHealth=String(p.hp);
 };
}
