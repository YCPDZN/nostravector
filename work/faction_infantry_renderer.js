function createFactionInfantryScenery({ground,mesh,M,draw}){
 const cache={};
 const modelFor=f=>(typeof NVArmyModels!=='undefined'&&NVArmyModels.model(f))||(f==='CATHARSIS'&&typeof Chapter4IntruderModel!=='undefined'?Chapter4IntruderModel:f?.startsWith('RESIST_')?FactionInfantryModels.HUMAN:f==='CHOMPY'?{...FactionInfantryModels.HUMAN,meshes:FactionInfantryModels.HUMAN.meshes.map(p=>({...p,color:p.color[2]>p.color[0]*1.4?[.46,.18,.75]:p.color[0]>.4?[.18,.65,.94]:p.color}))}:FactionInfantryModels[f==='RESISTANCE'?'ERISIAN':f]||(f?.startsWith('TERRA')&&typeof ImperiaInfantryModel!=='undefined'?{meshes:ImperiaInfantryModel.detail,pivots:ImperiaInfantryModel.pivots}:null));
 function parts(faction,s){const key=faction==='TERRAN'?faction+NVSiegeOfSol.ensure(s).general.color:faction+((typeof NVPlanetEmpires!=='undefined'&&NVPlanetEmpires.record(s,faction)?.color)||'');if(!cache[key])cache[key]=modelFor(faction).meshes.map(q=>({...q,color:faction==='TERRAN'&&q.color[1]>q.color[0]*1.4&&q.color[2]>.15?NVSiegeOfSol.rgb(NVSiegeOfSol.ensure(s).general.color):q.color,geometry:mesh({p:q.p,n:q.n,f:q.indices})}));return cache[key];}
 return(s,time,q)=>{
  if(!modelFor(q.faction)||Math.hypot(q.x-s.x,q.z-s.z)>220)return;
  const model=modelFor(q.faction);
  for(let i=0;i<12;i++){
   const patrol=i>1,a=time*.045+(i-2)/10*Math.PI*2,radius=i%2?25:30,x=q.x+(patrol?Math.sin(a)*radius:i===0?-8:8),z=q.z+(patrol?Math.cos(a)*radius:-8),yaw=patrol?a+Math.PI/2:Math.PI;
   const soldier=typeof NVBCCombat!=='undefined'?NVBCCombat.patrol(s,q,i,time):null,combat=NVDiplomacy.relation(s,q.faction)==='WAR'?soldier:null;if(soldier?.hp<=0)continue;const px=combat?combat.x:x,pz=combat?combat.z:z,heading=combat?combat.yaw:yaw;const distance=Math.hypot(px-s.x,pz-s.z);if(distance>200)continue;
   const phase=combat?combat.phase:time*3.1+i*.8,speed=combat?Math.min(1,combat.speed):patrol?1:0,root=M.mul(M.t(px,ground(px,pz,s.seed)+Math.abs(Math.sin(phase))*.013*speed,pz),M.mul(M.ry(heading),M.scale(.49,.49,.49)));
   for(const part of parts(q.faction,s)){
    if(distance>65&&/Finger|Knuckle|vent|tread|buckle|cable|piping|Front hair/.test(part.name))continue;
    let angle=0,bone=part.bone;
    if(bone==='leftLeg')angle=Math.sin(phase)*.36*speed;
    if(bone==='rightLeg')angle=-Math.sin(phase)*.36*speed;
    if(bone==='leftArm')angle=-Math.sin(phase)*.22*speed;
    if(bone==='rightArm')angle=Math.sin(phase)*.22*speed;
    if(combat?.mode==='attack'&&(bone==='leftArm'||bone==='rightArm'))angle=-1.1+Math.sin(time*7)*.3;
    if(bone==='cape')angle=.04*Math.sin(time*1.5+i)+.03*speed;
    const pivot=model.pivots[bone];let pose=M.t(0,0,0);
    if(pivot&&angle)pose=M.mul(M.t(...pivot),M.mul(M.rx(angle),M.t(...pivot.map(v=>-v))));
    if(bone==='head')pose=M.mul(M.t(...pivot),M.mul(M.ry(Math.sin(time*.4+i)*.08),M.t(...pivot.map(v=>-v))));
    const color=q.faction.startsWith('TERRA_')&&part.emission>.1?q.colors[1]:part.color;
    draw(part.geometry,M.mul(root,pose),color,0,part.emission||0);
   }
  }
 };
}
