// Station movement uses the planetary gait and per-character follower roles.
const NVArchiostalPeople=(()=>{
 const runtime=new WeakMap(),models=new Map(),followerModels=new Map();
 const walkable=(x,z)=>NVArchiostal.safe(x,z)&&!NVArchiostal.obstacle(x,z);
 function crew(s){return [...NVParty.list(s).filter(n=>(n.id!=='khazglar'||s.eris?.khazglar?.reward?.claimed)&&NVGovernance.follows(s,n.id)),...NVCustomCrew.followers(s)].filter((n,i,a)=>a.findIndex(x=>x.id===n.id)===i).slice(0,18);}
 function state(s){let r=runtime.get(s);if(!r){r={followers:new Map(),trail:[],last:null};runtime.set(s,r);}return r;}
 function step(s,dt){const q=NVArchiostal.ensure(s),r=state(s),members=crew(s),last=r.last;if(!last||Math.hypot(q.x-last.x,q.z-last.z)>35){r.followers.clear();r.trail=[{x:q.x,z:q.z}];}r.last={x:q.x,z:q.z};if(!r.trail.length||Math.hypot(q.x-r.trail[0].x,q.z-r.trail[0].z)>.3){r.trail.unshift({x:q.x,z:q.z});r.trail.length=Math.min(r.trail.length,400);}for(const id of r.followers.keys())if(!members.some(n=>n.id===id))r.followers.delete(id);
  members.forEach((n,i)=>{const side=i%2?1:-1,back=1.6+Math.floor(i/2)*1.8;let target=r.trail.at(-1),distance=0;for(let j=1;j<r.trail.length;j++){distance+=Math.hypot(r.trail[j].x-r.trail[j-1].x,r.trail[j].z-r.trail[j-1].z);if(distance>=back){target=r.trail[j];break;}}let tx=target.x+Math.cos(q.yaw)*side*2,tz=target.z-Math.sin(q.yaw)*side*2;if(!walkable(tx,tz)){tx=target.x;tz=target.z;}let p=r.followers.get(n.id);if(!p){p={x:tx,z:tz,yaw:q.yaw,phase:i*.9,speed:0};r.followers.set(n.id,p);}const attack=NVBCCombat.pose(s,n.id)||NVCompanionCombat.pose(s,n.id);if(attack&&(attack.mode!=='idle'||attack.chasing||attack.engaged))return;const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),speed=d>3?NVAntarctica.SPRINT:NVAntarctica.WALK,amount=Math.min(Math.max(0,d-.25),speed*dt),ox=p.x,oz=p.z;if(d>.001){const x=p.x+dx/d*amount,z=p.z+dz/d*amount;if(walkable(x,z)){p.x=x;p.z=z;}p.yaw+=Math.atan2(Math.sin(Math.atan2(dx,dz)-p.yaw),Math.cos(Math.atan2(dx,dz)-p.yaw))*Math.min(1,dt*8);}p.speed=dt>0?Math.hypot(p.x-ox,p.z-oz)/dt:0;p.phase+=NVAntarctica.gaitAdvance(p.speed,dt);});return r;
 }
 function normalize(raw,scale=1){return raw.map(p=>({...p,p:p.p.flat().map(v=>v*scale),n:p.n.flat(),f:p.f||p.indices,color:p.color||p.c,c:p.color||p.c}));}
 function residentModel(kind){if(models.has(kind))return models.get(kind);let raw,scale=.46;
  if(kind==='GREK')raw=GrekModel.meshes;
  else if(kind==='CHOMPY'){
   const armour=FactionInfantryModels.HUMAN.meshes.filter(p=>p.bone!=='head'&&p.bone!=='weapon').map(p=>({...p,color:p.color[2]>p.color[0]*1.4?[.30,.12,.53]:p.color[0]>.4?[.15,.49,.78]:p.color}));
   const head=HakModel.meshes.filter(p=>['head','jaw','eyes','upperLip','lowerLip','teeth'].includes(p.bone)&&!/glass|lens/i.test(p.name)).map(p=>({...p,bone:'head'}));raw=[...armour,...head];
  }else raw=FactionInfantryModels[kind].meshes.filter(p=>p.bone!=='weapon');
  const list=normalize(raw,scale).map(p=>{const name=p.name.replace(/armour/gi,'plating');let bone=p.bone;if(kind==='GREK'&&bone==='body'){if(/shoulder|upper arm|elbow|gauntlet|hand|finger|thumb/i.test(name))bone='arm';else if(/thigh|knee|shin|boot/i.test(name))bone='leg';}return{...p,name,bone};});models.set(kind,list);return list;
 }
 const kinds=['GREK','HUMAN','ERISIAN','CHOMPY'];
 function residents(time){return NVArchiostal.WARDS.flatMap((ward,w)=>kinds.map((kind,i)=>{const radius=12+i*2,a=time*(1.05/radius)+(w*4+i)*2.399;return{id:'resident-'+w+'-'+i,kind,x:ward.x+Math.sin(a)*radius,z:ward.z+Math.cos(a)*radius,yaw:a+Math.PI/2,speed:1.05,phase:NVAntarctica.gaitAdvance(1.05,time)+i*1.3};}));}
 function followerModel(s,n){const record=NVCustomCrew.record(s,n.id);if(record){const key=n.id+':'+NVCustomCrew.modelKey(record);if(!followerModels.has(key)){const profile=NVCustomCrew.profile(record);followerModels.set(key,{key,parts:NVCustomCrew.parts(record).map(p=>({...p,p:p.p.flat(),n:p.n.flat(),f:p.f,color:getWandererColor(p,profile)}))});}return followerModels.get(key);}const source=NVCombatCrew.model(n.id,{...s,space:{...s.space,body:'earth',phase:'landed'}});if(!followerModels.has(source))followerModels.set(source,{key:source,parts:normalize(source.parts,source.scale)});return followerModels.get(source);}

 return{crew,state,step,walkable,residentModel,residents,followerModel,kinds};
})();
