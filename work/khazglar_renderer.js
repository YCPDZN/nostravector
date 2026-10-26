function createKhazglarScenery({object,ground,mesh,M,draw}){
 let parts=null,roofMesh=null,troops=null;
 function prepareRoof(){if(roofMesh)return;const p=[],n=[],f=[];const face=(points,normal)=>{const start=p.length;p.push(...points);n.push(...points.map(()=>normal));for(let i=1;i<points.length-1;i++)f.push(start,start+i,start+i+1);};face([[-4.3,0,-4.3],[4.3,0,-4.3],[0,1.5,-4.3]],[0,0,-1]);face([[-4.3,0,4.3],[0,1.5,4.3],[4.3,0,4.3]],[0,0,1]);face([[-4.3,0,-4.3],[0,1.5,-4.3],[0,1.5,4.3],[-4.3,0,4.3]],[-.33,.94,0]);face([[0,1.5,-4.3],[4.3,0,-4.3],[4.3,0,4.3],[0,1.5,4.3]],[.33,.94,0]);face([[-4.3,0,-4.3],[-4.3,0,4.3],[4.3,0,4.3],[4.3,0,-4.3]],[0,-1,0]);roofMesh=mesh({p,n,f});}

 return(s,time)=>{
  if(!NVKhazglar.onMars(s))return;
  const n=NVKhazglar.location(s),distance=Math.hypot(s.x-n.x,s.z-n.z);if(distance>(s.aerialView?18000:1700))return;
  const y=ground(n.x,n.z,s.seed),stone=[.28,.21,.17],wood=[.22,.15,.10],roof=[.20,.23,.22],bronze=[.51,.37,.20];
  object(n.x,y+.13,n.z,8,.26,8,stone);
  object(n.x-3.5,y+1.55,n.z,.45,3,7.3,stone);object(n.x+3.5,y+1.55,n.z,.45,3,7.3,stone);object(n.x,y+1.55,n.z+3.5,7.3,3,.45,stone);
  for(const side of [-1,1])object(n.x+side*2.30,y+1.55,n.z-3.5,2.4,3,.45,stone);
  object(n.x,y+2.8,n.z-3.5,2.2,.5,.45,wood);
  prepareRoof();draw(roofMesh,M.t(n.x,y+3.02,n.z),roof);for(const side of [-1,1])for(const z of [-3.7,3.7])object(n.x+side*3.4,y+1.6,n.z+z,.22,3.2,.22,wood);
  object(n.x,y+4.54,n.z,.25,.12,8.8,bronze);
  object(n.x+2.5,y+3.5,n.z+2.5,.9,2.5,.9,stone);object(n.x+2.5,y+4.82,n.z+2.5,1.1,.13,1.1,bronze);
  for(let i=0;i<3;i++)object(n.x,y+.045+i*.06,n.z-4.8+i*.35,2.15,.09+i*.12,.5,stone);
  // A clear doorway and open floor make the summit hut traversable.
  object(n.x-2,y+.65,n.z+2.35,1.6,1.05,.7,wood);object(n.x+1.9,y+.65,n.z+1.9,1.2,1.1,1.4,wood);
  for(const side of [-1,1]){object(n.x+side*1.22,y+1.6,n.z-3.8,.16,.65,.16,bronze);object(n.x+side*1.22,y+1.7,n.z-3.8,.13,.3,.13,[1,.52,.14],0,.8);}
  if(NVKhazglar.ensure(s).siegeStage==='done'&&NVKhazglar.ensure(s).introDone&&distance<400){
   if(!troops)troops=ImperiaInfantryModel.distant.map(q=>({...q,geometry:mesh({p:q.p,n:q.n,f:q.indices})}));
   const shot=NVKhazglar.battle(s).shot;if(shot?.time>0){const sx=s.x,sz=s.z,tx=n.x+shot.x,tz=n.z+shot.z;for(let i=1;i<12;i++){const t=i/12,x=sx+(tx-sx)*t,z=sz+(tz-sz)*t;object(x,ground(x,z,s.seed)+1.3,z,.08,.08,.08,[.4,.95,1],0,1);}}
   for(const a of NVKhazglar.battle(s).soldiers){
    const x=n.x+a.x,z=n.z+a.z,dead=a.hp<=0,fall=dead?Math.min(1,a.timer)*1.45:0;
    const root=M.mul(M.t(x,ground(x,z,s.seed)+(dead?-.15:Math.abs(Math.sin(a.phase))*.025*a.speed),z),M.mul(M.ry(a.yaw),M.mul(M.rx(fall),M.scale(.52,.52,.52))));
    const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);},swing=a.mode==='windup'?-.9*ease((.85-a.timer)/.7):a.mode==='strike'?-.9+2*ease((.22-a.timer)/.22):a.mode==='recover'?1.1*(1-ease((1.5-a.timer)/1.5)):0;
    for(const part of troops){let angle=0;const leg=part.bone==='leftLeg'||part.bone==='rightLeg',arm=part.bone==='leftArm'||part.bone==='rightArm'||part.bone==='weapon';
     if(!dead&&leg)angle=Math.sin(a.phase)*(part.bone==='leftLeg'?1:-1)*Math.min(.65,a.speed*.17);
     if(!dead&&arm)angle=swing+Math.sin(a.phase)*(part.bone==='leftArm'?-.3:.3)*Math.min(1,a.speed/3);
     if(part.bone==='cape')angle=Math.sin(time*2+a.phase)*.05+Math.min(.18,a.speed*.04);
     const pivot=ImperiaInfantryModel.pivots[part.bone==='weapon'?'rightArm':part.bone];let bone=M.t(0,0,0);if(pivot)bone=M.mul(M.t(...pivot),M.mul(M.rx(angle),M.t(...pivot.map(v=>-v))));
     draw(part.geometry,M.mul(root,bone),a.hit>0?[.75,.9,1]:a.mode==='windup'&&part.emission?[1,.2,.08]:part.color,0,part.emission||0);
    }
   }
  }
  const guard=NVKhazglar.ensure(s).battle?.guardTime||0;
  if(guard>0&&guard<=.85){const radius=(1-guard/.85)*80;for(let i=0;i<72;i++){const a=i/72*Math.PI*2,x=n.x+Math.sin(a)*radius,z=n.z-7+Math.cos(a)*radius;object(x,ground(x,z,s.seed)+.18,z,.45,.3,.45,[1,.56,.10],0,.85);}}
  if(s.space?.shipId==='olympus-vanguard'&&typeof NVGovernance!=='undefined')return;
  if(NVKhazglar.ensure(s).recruited&&typeof NVGovernance!=='undefined'&&NVGovernance.role(s,'khazglar')!=='follow')return;
  const guide=typeof NVShipReward!=='undefined'?NVShipReward.guide(s):{x:n.x,z:n.z-7,yaw:Math.atan2(s.x-n.x,s.z-(n.z-7)),phase:0,speed:0};if(Math.hypot(s.x-guide.x,s.z-guide.z)>150)return;
  if(!parts)parts=KhazglarModel.meshes.map(q=>({geometry:mesh({p:q.p,n:q.n,f:q.indices}),...q}));
  const facing=guide.yaw,root=M.mul(M.t(guide.x,ground(guide.x,guide.z,s.seed),guide.z),M.mul(M.ry(facing),M.scale(.52,.52,.52)));
  const pivot=(point,rotation)=>M.mul(M.t(...point),M.mul(rotation,M.t(...point.map(v=>-v))));
  for(const part of parts){let bone=part.bone==='head'?pivot(KhazglarModel.pivots.head,M.ry(Math.sin(time*.55)*.04)):part.bone==='cape'?pivot(KhazglarModel.pivots.cape,M.rx(Math.sin(time*1.6)*.025)):M.t(0,Math.sin(time*1.4)*.012,0);if(guide.speed>0&&['leftLeg','rightLeg','leftArm','rightArm','weapon'].includes(part.bone)){const side=['leftLeg','rightArm','weapon'].includes(part.bone)?1:-1,angle=Math.sin(guide.phase)*side*(part.bone.includes('Leg')?.50:.25);bone=pivot(KhazglarModel.pivots[part.bone==='weapon'?'rightArm':part.bone]||[0,2,0],M.rx(angle));}if(guard>0&&['leftArm','rightArm','weapon'].includes(part.bone)){const angle=guard>.85?-1.15*Math.sin((1.5-guard)/.65*Math.PI/2):.65*Math.sin((.85-guard)/.85*Math.PI);bone=pivot(KhazglarModel.pivots[part.bone==='weapon'?'rightArm':part.bone]||[0,3,0],M.rx(angle));}draw(part.geometry,M.mul(root,bone),part.color,0,part.emission||0);}
 };
}
