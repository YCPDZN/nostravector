function createMascarFrameScenery({mesh,object,ground,M,draw,sphere}){
 const parts=MascarFrameModel.meshes.map(m=>({...mesh({p:m.p,n:m.n,f:m.indices}),bone:m.bone,color:m.color,glow:m.emission}));
 const pivot=(p,r)=>M.mul(M.t(...p),M.mul(r,M.t(...p.map(v=>-v))));
 const dot=(x,y,z,r,c,glow=0)=>object(x,y,z,r,r,r,c,0,glow,sphere);
 function trace(from,to,color,r=.16){const count=Math.max(3,Math.min(48,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z))));for(let i=0;i<count;i++){const t=i/(count-1);dot(from.x+(to.x-from.x)*t,from.y+(to.y-from.y)*t,from.z+(to.z-from.z)*t,r,color,1);}}
 return(s,time,n,api=NVVengefulMascar)=>{const q=api.ensure(s),b=q.enemy,f=NVMascarFrame.ensure(q),pose=NVMascarFrame.pose(b,f),deploy=b.mode==='transform',fall=deploy?Math.pow(1-NVMascarFrame.progress(b),2)*12:0,y=ground(n.x,n.z,s.seed)+(b.altitude||0)+pose.drop+fall,root=M.mul(M.t(n.x,y,n.z),M.ry(b.yaw));
  const p=MascarFrameModel.pivots,t={body:M.mul(root,pivot(p.body,M.mul(M.ry(pose.twist),M.rx(pose.lean))))};
  for(const side of ['left','right']){
   const sign=side==='left'?-1:1,arm=side+'Arm',elbow=side+'Elbow',leg=side+'Leg',knee=side+'Knee';
   t[arm]=M.mul(t.body,pivot(p[arm],M.mul(M.rz(sign*pose.armSpread),M.rx(pose[arm]))));
   t[elbow]=M.mul(t[arm],pivot(p[elbow],M.rx(pose[elbow])));
   t[leg]=M.mul(root,pivot(p[leg],M.rx(pose[leg])));t[knee]=M.mul(t[leg],pivot(p[knee],M.rx(pose[knee])));
  }
  for(const part of parts)draw(part,t[part.bone]||root,part.color,b.flash>0?.2:0,part.glow||0);
  const world=(x,h,z)=>({x:n.x+Math.cos(b.yaw)*x+Math.sin(b.yaw)*z,y:y+h,z:n.z-Math.sin(b.yaw)*x+Math.cos(b.yaw)*z});
  if(pose.jets||deploy)for(const side of [-1,1]){const nozzle=world(side*.76,4.1,-1.45),length=(deploy?2.5:3.2)+Math.sin(f.time*37+side)*.4;object(nozzle.x,nozzle.y-length/2,nozzle.z,.43,length,.43,[.17,.65,1],0,1,sphere);object(nozzle.x,nozzle.y-length*.32,nozzle.z,.22,length*.68,.22,[.68,.97,1],0,1,sphere);}
  const anchor=api.anchor(s);if(!anchor)return;const a=NVMascarFrame.action(b),aim=b.aim?{x:anchor.x+b.aim.x,z:anchor.z+b.aim.z}:n,start={x:anchor.x+f.startX,z:anchor.z+f.startZ};
  const mark=(x,z)=>object(x,ground(x,z,s.seed)+.12,z,.26,.08,.26,[1,.42,.12],0,1);
  if(b.mode==='windup'){
   if(a.shape==='line'){for(const side of [-1,1]){const dx=aim.x-start.x,dz=aim.z-start.z,d=Math.hypot(dx,dz)||1;for(let i=0;i<=30;i++){const v=i/30;mark(start.x+dx*v-dz/d*a.radius*side,start.z+dz*v+dx/d*a.radius*side);}}}
   else{const c=a.shape==='target'?aim:n,count=56;for(let i=0;i<count;i++){const angle=a.shape==='cone'?b.yaw-Math.PI/2+i/(count-1)*Math.PI:i/count*Math.PI*2;mark(c.x+Math.sin(angle)*a.radius,c.z+Math.cos(angle)*a.radius);}}
  }
  if(b.mode==='release'){
   const v=NVMascarFrame.progress(b),target={x:aim.x,y:ground(aim.x,aim.z,s.seed)+1.1,z:aim.z};
   if(['arc-cannon','piston-punch'].includes(a.id))trace(world(-2.7,3.5,1.1),target,[.3,.9,1],a.id==='arc-cannon'?.22:.09);
   if(['shoulder-barrage','aerial-strafe'].includes(a.id))for(const side of [-1,1])for(let j=0;j<3;j++){const from=world(side*1.54,6.8,-.1),t=Math.max(0,Math.min(1,v*1.6-j*.16)),x=from.x+(target.x-from.x)*t,z=from.z+(target.z-from.z)*t,yy=from.y+(target.y-from.y)*t+Math.sin(t*Math.PI)*7;dot(x,yy,z,.33,[1,.77,.26],1);dot(x,yy+.7,z,.22,[.8,.34,.1],.8);}
   if(a.jump){const c=a.shape==='target'?aim:n,r=a.radius*v;for(let i=0;i<64;i++){const angle=i/64*Math.PI*2,x=c.x+Math.cos(angle)*r,z=c.z+Math.sin(angle)*r;object(x,ground(x,z,s.seed)+.18,z,.32,.20,.32,[.72,.54,.26],0,.5);}}
  }
  if(q.shot?.time>0)trace({x:s.x,y:ground(s.x,s.z,s.seed)+1.3,z:s.z},world(0,5.5,1.1),[.3,.95,1],.09);
 };
}
