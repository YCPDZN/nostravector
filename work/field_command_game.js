function createFieldCommandScenery({M,mesh,draw,object,ground}){
 const cache=new Map(),weapons=createCompanionCombatScenery({M,mesh,draw,object,ground});
 function prepared(s,a){
  const n=a.npc,founder=a.army&&NVCustomCrew.empires(s).find(n=>NVCustomCrew.faction(n)===a.army||n.species.name===NVGalacticDiplomacy.ensure(s).factions[a.army]?.species),key=a.imperialGovernor?'imperial:'+a.sourceId:a.model||(a.army?a.army+(founder?':'+NVCustomArmies.key(founder):''):a.sourceId);
  const uniformKey=a.army==='TERRAN'?NVSiegeOfSol.ensure(s).general.color:(typeof NVPlanetEmpires!=='undefined'&&NVPlanetEmpires.record(s,a.army)?.color)||'';
  const modelKey=n?.species?NVCustomCrew.modelKey(n):n?.id+':'+NVCombatCrew.helmet(s),id=key+':'+(modelKey||'')+':'+uniformKey;if(cache.has(id))return cache.get(id);
  let list,scale=1,normalize=false;
  if(a.model==='hawthorne')list=ThomasModel.meshes;
  else if(a.imperialGovernor){list=KarribassaBossModels[a.sourceId].meshes;scale=.54;}
  else if(a.model)list=NVFactionLeaders.parts(a.model);
  else if(n){if(n.species){const profile=NVCustomCrew.profile(n);list=NVCustomCrew.parts(n).map(p=>({...p,color:getWandererColor(p,profile)}));}else{const source=NVCombatCrew.model(n.id,s);list=source.parts;scale=source.scale;}}
  else{normalize=!founder;if(founder)list=NVCustomArmies.parts(founder);else if(a.army==='CATHARSIS')list=Chapter4IntruderModel.meshes;else if(['TERRA','TERRAN'].includes(a.army)){list=ImperiaInfantryModel.detail;if(a.army==='TERRAN')list=list.map(p=>({...p,color:p.color[1]>p.color[0]*1.4&&p.color[2]>.15?NVSiegeOfSol.rgb(NVSiegeOfSol.ensure(s).general.color):p.color}));}else list=NVArmyModels.parts(a.army)||NVArmyModels.parts('HUMAN');}
  if(a.model==='hawthorne'||normalize){
   let lo=Infinity,hi=-Infinity;for(const p of list){const v=p.p.flat();for(let i=1;i<v.length;i+=3){lo=Math.min(lo,v[i]);hi=Math.max(hi,v[i]);}}
   const factor=2.4/Math.max(.01,hi-lo);list=list.map(p=>({...p,p:p.p.flat().map((v,i)=>(i%3===1?v-lo:v)*factor),...(p.rig?{rig:{...p.rig,pivot:p.rig.pivot.map((v,i)=>(i===1?v-lo:v)*factor)}}:{})}));
  }
  const parts=list.filter(p=>!/finger|knuckle|tread|pouch|buckle|pedestal|plinth|grass|meadow/i.test(p.name)).map(p=>({...p,geometry:mesh({p:p.p.flat(),n:p.n.flat(),f:p.f||p.indices}),color:p.color||p.c})),out={parts,scale};cache.set(id,out);return out;
 }
 return(s,time)=>{const q=NVFieldCommand.state(s);if(!q)return;
  for(const a of q.actors){if(a.hp<=0||Math.hypot(a.x-s.x,a.z-s.z)>180)continue;const{parts,scale}=prepared(s,a),root=M.mul(M.t(a.x,ground(a.x,a.z,s.seed),a.z),M.mul(M.ry(a.yaw),M.scale(scale,scale,scale))),pose=NVCompanionMotion.pose(parts,a.id,time,a.speed,a.phase,a.mode==='idle'?null:a);
   for(const p of parts)draw(p.geometry,M.mul(root,NVCompanionMotion.part(pose,p)),p.color,0,0);
   if(a.npc)weapons.weapons(s,a.sourceId,a,root,pose,parts);
   const color=NVOccupation.palette(s,a.faction)[1];object(a.x,ground(a.x,a.z,s.seed)+.04,a.z,.6,.06,.6,color,0,.1);
  }
  for(const e of q.effects){const dx=e.to.x-e.from.x,dz=e.to.z-e.from.z,yaw=Math.atan2(dx,dz),u=Math.min(1,e.age/.18),x=e.from.x+dx*u,z=e.from.z+dz*u;if(e.type==='beam')object(x,ground(x,z,s.seed)+1.3,z,.08,.08,.7,e.color,yaw,.2);else for(let i=0;i<12;i++){const angle=i*Math.PI/6,r=1+e.age*13;object(e.to.x+Math.sin(angle)*r,ground(e.to.x,e.to.z,s.seed)+.12,e.to.z+Math.cos(angle)*r,.25,.12,.4,e.color,angle,.15);}}
 };
}
const fieldCommandScenery=createFactionLeaderScenery;createFactionLeaderScenery=options=>{const capital=fieldCommandScenery(options),field=createFieldCommandScenery(options);return(s,time)=>{capital(s,time);field(s,time);};};

const fieldCommandHUD=document.createElement('section');fieldCommandHUD.id='fieldCommandHUD';fieldCommandHUD.hidden=true;fieldCommandHUD.innerHTML='<strong>FACTION CHARGE</strong><small>Leaders and governors on the front line</small><div></div>';$('#hudRightDock').append(fieldCommandHUD);
const fieldCommandStyle=document.createElement('style');fieldCommandStyle.textContent='#fieldCommandHUD[hidden]{display:none!important}#fieldCommandHUD{padding:12px;background:#111e30ec;border:1px solid #c7b386;border-top:3px solid #c7b386;color:#f4e3c4;font:10px/1.6 Consolas;pointer-events:none}#fieldCommandHUD>strong,#fieldCommandHUD>small,#fieldCommandHUD p>strong,#fieldCommandHUD p>small{display:block}#fieldCommandHUD small{font-size:9px}#fieldCommandHUD p{margin:7px 0 0;overflow-wrap:anywhere}#fieldCommandHUD progress{display:block;width:100%;height:4px;accent-color:#d6b66c;margin-top:3px}';document.head.append(fieldCommandStyle);
let fieldCommandHUDKey='';
function updateFieldCommandHUD(){
 const q=gameActive&&!gamePaused&&!document.hidden&&polarState&&!polarScreen.classList.contains('hud-cinematic')?NVFieldCommand.state(polarState):null;fieldCommandHUD.hidden=!q;if(!q)return;
 const key=q.key+':'+q.actors.map(a=>a.name+':'+Math.ceil(a.hp)+':'+(a.hp<=0?'REGROUPING':a.tactic||'HOLDING')).join('|');if(key===fieldCommandHUDKey)return;fieldCommandHUDKey=key;const root=fieldCommandHUD.lastElementChild;root.replaceChildren();
 for(const a of q.actors){const p=document.createElement('p'),name=document.createElement('strong'),status=document.createElement('small'),bar=document.createElement('progress');name.textContent=a.name.toUpperCase();status.textContent=a.role+' / '+NVDiplomacy.name(polarState,a.faction)+' / '+(a.hp<=0?'REGROUPING':a.tactic||'HOLDING');bar.max=a.maxHp;bar.value=a.hp;bar.setAttribute('aria-label',a.name+' field readiness');p.append(name,status,bar);root.append(p);}
}
const fieldCommandUpdate=updatePolarHUD;updatePolarHUD=()=>{fieldCommandUpdate();updateFieldCommandHUD();};
const fieldCommandExit=exitPolar;exitPolar=()=>{fieldCommandHUD.hidden=true;fieldCommandHUDKey='';return fieldCommandExit();};
