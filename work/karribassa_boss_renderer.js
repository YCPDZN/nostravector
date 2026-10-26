function createKarribassaBossScenery({object,ground,mesh,M,draw}){
 const models=Object.fromEntries(Object.entries(KarribassaBossModels).map(([id,m])=>[id,{...m,meshes:m.meshes.map(p=>({...p,geometry:mesh({p:p.p,n:p.n,f:p.indices})}))}]));
 const pivot=(pose,v)=>M.mul(M.t(...v),M.mul(pose,M.t(-v[0],-v[1],-v[2]))),mix=(a,b,t)=>a+(b-a)*t;
 function person(s,n,time){const b=n.enemy,model=models[b.id],dead=b.hp<=0&&NVKarribassaBosses.ensure(s).resolution.choices[b.id]==='kill',downed=b.hp<=0&&!dead,progress=b.duration>0?1-b.timer/b.duration:0,attacking=b.hp>0&&['windup','release','recovery'].includes(b.mode),gait=Math.sin(b.phase),speed=b.hp>0?Math.min(1,b.speed/4):0,lean=downed?.16:b.action==='dash'&&b.mode==='release'?.4:.10*speed,fall=dead?Math.min(1,b.deathTime)*1.4:0;
  const root=M.mul(M.t(n.x,ground(n.x,n.z,s.seed)+(dead?-.12:downed?-.36:Math.abs(gait)*.035*speed),n.z),M.mul(M.ry(b.yaw),M.mul(M.rx(fall+lean),M.scale(.54,.54,.54))));
  for(const part of model.meshes){let angle=0,pose=M.t(0,0,0);const bone=part.bone,p=model.pivots[bone];if(bone==='leftLeg')angle=gait*.72*speed;if(bone==='rightLeg')angle=-gait*.72*speed;if(bone==='leftArm')angle=-gait*.35*speed;if(bone==='rightArm')angle=gait*.35*speed;if(bone==='cape')angle=.06*Math.sin(time*2)+speed*.12;
   if(downed&&bone==='leftLeg')angle=1.15;if(downed&&bone==='rightLeg')angle=.95;
   if(attacking&&b.id==='malia'&&bone==='rightArm')angle=b.mode==='windup'?mix(-.2,-1.25,progress):b.mode==='release'?-1.25:mix(-1.25,0,progress);
   if(attacking&&b.id==='croxian'&&bone==='leftArm'){const swing=b.mode==='windup'?mix(0,-1.05,progress):b.mode==='release'?mix(-1.05,1.2,progress):mix(1.2,0,progress);pose=pivot(M.mul(M.rz(swing),M.rx(-.25)),p);}
   else if(p&&angle)pose=pivot(M.rx(angle),p);
   if(bone==='head'&&!attacking&&!dead)pose=pivot(M.ry(Math.sin(time*.5)*.05),p);
   if(b.id==='croxian'&&part.name==='Centre face shield'&&typeof NVCroxianVoice!=='undefined'){const lip=NVCroxianVoice.lip();pose=M.mul(pose,M.t(0,-lip.jaw*.025,lip.round*.008));}
   draw(part.geometry,M.mul(root,pose),b.hit>0?[.70,.89,.91]:part.color,0,part.emission||0);
  }
 }
 function ring(s,x,z,r,color){for(let i=0;i<64;i++){const a=i/64*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;object(px,ground(px,pz,s.seed)+.07,pz,.16,.08,.32,color,-a,1);}}
 function beam(s,from,to,color){const distance=Math.hypot(to.x-from.x,to.z-from.z),steps=Math.max(4,Math.min(44,Math.ceil(distance/1.2)));for(let i=0;i<steps;i++){const t=i/(steps-1),x=from.x+(to.x-from.x)*t,z=from.z+(to.z-from.z)*t;object(x,ground(x,z,s.seed)+1.2,z,.10,.10,.7,color,Math.atan2(to.x-from.x,to.z-from.z),1);}}
 return(s,time)=>{if(typeof mascarSceneOpen!=='undefined'&&mascarSceneOpen&&s===polarState)return;if(!NVKarribassaBosses.available(s))return;const n=NVKarribassaBosses.arena(s);if(!n||Math.hypot(s.x-n.x,s.z-n.z)>500)return;const dark=[.07,.11,.15],steel=[.20,.30,.34],cyan=[.12,.88,.93];object(n.x,ground(n.x,n.z,s.seed)-.10,n.z,100,.25,100,dark);for(const x of [-55,55])for(const z of [-47,47]){const px=n.x+x,pz=n.z+z;object(px,ground(px,pz,s.seed)+5,pz,8,10,8,steel);object(px,ground(px,pz,s.seed)+10.2,pz,9,.4,9,dark);object(px,ground(px,pz,s.seed)+6,pz-4.1,5,5,.1,cyan,0,.65);}for(const x of [-49,49]){object(n.x+x,ground(n.x+x,n.z,s.seed)+.15,n.z,.3,.3,96,cyan,0,.7);}object(n.x,ground(n.x,n.z+44,s.seed)+.05,n.z+44,96,.1,.3,cyan,0,.7);
  for(let offset=-40;offset<=40;offset+=10){object(n.x+offset,ground(n.x,n.z,s.seed)+.04,n.z,.055,.025,98,[.12,.19,.23]);object(n.x,ground(n.x,n.z,s.seed)+.04,n.z+offset,98,.025,.055,[.12,.19,.23]);}
  const q=NVKarribassaBosses.ensure(s);for(const actor of NVKarribassaBosses.actors(s,true)){person(s,actor,time);const b=actor.enemy;if(b.hp<=0)continue;if(b.mode==='windup'){const color=b.id==='malia'?[.05,.84,1]:[1,.51,.16],a=b.aim?{x:n.x+b.aim.x,z:n.z+b.aim.z}:actor;if(b.action==='sweep'||b.action==='slam')ring(s,actor.x,actor.z,b.action==='slam'?9:7.5,color);else ring(s,a.x,a.z,b.action==='orb'?6:b.action==='cleave'?4.5:2.7,color);if(b.action==='burst'||b.action==='dash')beam(s,actor,a,color);}if(b.mode==='release'&&b.aim){const target={x:n.x+b.aim.x,z:n.z+b.aim.z};if(b.action==='burst'||b.action==='cleave')beam(s,actor,target,[.3,1,1]);else if(b.action==='orb'||b.action==='slam')ring(s,b.action==='orb'?target.x:actor.x,b.action==='orb'?target.z:actor.z,Math.max(.4,(1-b.timer/b.duration)*(b.action==='orb'?6:9)),[.25,.98,1]);}}
  if(q.shot?.time>0)beam(s,s,q.shot,[.72,.95,1]);
 };
}
