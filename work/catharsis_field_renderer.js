function createCatharsisFieldScenery({object,mesh,M,draw,ground,rover}){
 const material=[.13,.15,.17],edge=[.29,.32,.34],light=[.65,.14,.12];
 let aliens=null;
 function models(){if(!aliens)aliens=Chapter4IntruderModel.meshes.map(p=>{const raw=p.p.flat(),norm=p.n.flat(),points=[];for(let i=0;i<raw.length;i+=3)points.push(raw.slice(i,i+3).map(v=>v*.42));const normals=[];for(let i=0;i<norm.length;i+=3)normals.push(norm.slice(i,i+3));return{name:p.name,bone:p.bone,p:points,n:normals,f:p.indices||p.f,c:p.color||p.c,geometry:mesh({p:points,n:normals,f:p.indices||p.f})};});return aliens;}
 return(s,time)=>{
  if(!NVCatharsisField.onWorld(s))return;const r=NVCatharsisField.rover(s),b=NVCatharsisField.base(s);
  if(r&&Math.hypot(s.x-r.x,s.z-r.z)<1200&&rover)rover(r,s.seed,time,r.driving);
  if(!NVCatharsisField.discovered(s)||!b||Math.hypot(s.x-b.x,s.z-b.z)>1200)return;
  const y=ground(b.x,b.z,s.seed);
  object(b.x,y+.12,b.z,17,.24,17,edge);object(b.x,y+4.1,b.z,18,.35,18,material);
  for(const side of [-1,1]){object(b.x+side*8,y+2,b.z,.3,4,16,material);object(b.x+side*5.2,y+2,b.z-8,5.6,4,.3,material);for(let z=-6;z<=6;z+=4)object(b.x+side*7.75,y+2,b.z+z,.25,.14,1.4,light,0,.15);object(b.x+side*2.2,y+2,b.z-8,.25,4,.5,edge);}
  object(b.x,y+2,b.z+8,16,4,.3,material);object(b.x,y+3.9,b.z-8,4,.5,.5,edge);
  for(let i=0;i<4;i++){object(b.x+4.5,y+.55+i*.5,b.z+4,3,.3,1.8,material);object(b.x-5,y+1+i*.65,b.z+5,3,.15,2,edge);}
  // The rifle is immediately inside the open doorway, accessible before the guards.
  const rackZ=b.z-5;object(b.x,y+.65,rackZ,2,1.3,.8,edge);object(b.x,y+1.37,rackZ,2.15,.13,1,material);
  if(!NVCatharsisField.hasRifle(s)){object(b.x,y+1.5,rackZ,1.25,.14,.17,[.09,.12,.15]);object(b.x+.75,y+1.5,rackZ,.42,.08,.09,[.39,.48,.53]);object(b.x-.65,y+1.5,rackZ,.3,.2,.22,[.22,.26,.28]);object(b.x,y+1.64,rackZ,.32,.12,.11,[.37,.46,.48]);}
  for(const t of NVCatharsisField.targets(s)){const parts=models(),root=M.mul(M.t(t.x,ground(t.x,t.z,s.seed),t.z),M.ry(Math.atan2(s.x-t.x,s.z-t.z))),motion=NVCompanionMotion.pose(parts,'catharsis-sentinel',time,0,0,t.enemy.cooldown>0?{companion:true,mode:'cleave',elapsed:1.8-t.enemy.cooldown,duration:1.8}:null);for(const p of parts)draw(p.geometry,M.mul(root,NVCompanionMotion.part(motion,p)),p.c);}
 };
}
