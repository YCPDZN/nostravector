const solFinalModelCache=new Map();
function solFinalGeneralModel(s){const color=NVSiegeOfSol.ensure(s).general.color;if(solFinalModelCache.has(color))return solFinalModelCache.get(color);const accent=NVSiegeOfSol.rgb(color),model={name:'Nox Imperia general',meshes:ImperiaInfantryModel.detail.map(p=>({...p,bone:'body',color:p.color[1]>p.color[0]*1.4&&p.color[2]>.15?accent:p.color,indices:p.indices||p.f}))};solFinalModelCache.set(color,model);return model;}
function createSolFinalScenery({object,ground,mesh,M,draw}){
 let generalParts=null,generalKey='';const refuge=typeof createChapter4RefugeScenery==='function'?createChapter4RefugeScenery({object,ground}):null;
 return(s,time)=>{
  if(refuge)refuge(s,time);
  if(!NVSiegeOfSol.started(s))return;const q=NVSiegeOfSol.ensure(s),a=NVSiegeOfSol.site(s),boss=q.boss;
  if(a&&!q.confronted){if(boss.mode==='windup'&&boss.aim){const r=5,y=ground(boss.aim.x,boss.aim.z,s.seed)+.06;for(let i=0;i<64;i++){const angle=i/64*Math.PI*2;object(boss.aim.x+Math.cos(angle)*r,y,boss.aim.z+Math.sin(angle)*r,.24,.05,.24,[1,.12,.08],0,.8);}}
   if(boss.shot>0){const dx=a.x-s.x,dz=a.z-s.z,d=Math.hypot(dx,dz);for(let i=0;i<18;i++){const t=i/18;object(s.x+dx*t,ground(s.x,s.z,s.seed)+1.1,s.z+dz*t,.08,.08,Math.max(.12,d/18),[1,.8,.2],Math.atan2(dx,dz),1);}}
  }
  const home=Object.keys(q.owners).find(id=>q.owners[id]==='TERRAN');if(NVEris.world(s)!==home||!NVEris.groundPlay(s))return;const base=NVOccupation.local(s).find(b=>b.faction==='TERRAN');if(!base||Math.hypot(s.x-base.x,s.z-base.z)>180)return;
  if(generalKey!==q.general.color){generalKey=q.general.color;generalParts=solFinalGeneralModel(s).meshes.map(p=>({...p,geometry:mesh({p:p.p,n:p.n,f:p.indices})}));}
  const root=M.mul(M.t(base.x,ground(base.x,base.z-9,s.seed),base.z-9),M.mul(M.ry(Math.PI),M.scale(.54,.54,.54)));for(const p of generalParts)draw(p.geometry,root,p.color);
 };
}
