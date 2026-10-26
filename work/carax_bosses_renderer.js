const NVCaraxBossMotion=(()=>{
 const M=NVCompanionMotion,around=(p,m)=>M.mul(M.t(...p),M.mul(m,M.t(...p.map(v=>-v)))),clamp=x=>Math.max(0,Math.min(1,x));
 function pose(model,b,time){const P=model.pivots,a=NVCaraxBosses.ATTACKS[b.action],progress=a?clamp((b.elapsed-a.wind)/.65):0,wind=a?clamp(b.elapsed/a.wind):0,strike=Math.sin(progress*Math.PI),recover=a?1-clamp((b.elapsed-a.hits.at(-1))/.9):0,dead=b.hp<=0?clamp(b.deathAge/1.2):0,zark=b.caraxBossId==='lord-zark',bones={body:M.t(0,Math.sin(time*1.7)*.025,0)};let pitch=dead*1.18,yaw=0;
  if(b.action==='pounce')pitch=.55*Math.sin(progress*Math.PI);
  if(b.action==='infernal-dive')pitch=.9*Math.sin(progress*Math.PI);
  if(b.action==='tail-sweep')yaw=progress*Math.PI*2;
  bones.head=around(P.head,M.mul(M.ry(Math.sin(time*.55)*.045),M.rx(-wind*.10*recover)));bones.eyes=bones.head;const jaw=zark&&typeof NVZarkBossVoice!=='undefined'?NVZarkBossVoice.lip().jaw:(a?.08+strike*.20:.025*Math.max(0,Math.sin(time*2)));bones.jaw=M.mul(bones.head,around(P.jaw,M.rx(jaw*(zark?.26:.8))));
  for(const side of [-1,1]){
   const leg=side<0?'leftLeg':'rightLeg';bones[leg]=around(P[leg],M.rx(dead*.7+(b.altitude>0?.45:Math.sin(time*2.8+side)*.025)));
   if(zark){const arm=side<0?'leftArm':'rightArm',wing=side<0?'leftWing':'rightWing';let lift=-.16,spread=.06;
    if(b.action==='sovereign-cleave'){lift=-1.35*wind*recover+side*.6*strike;spread=side*.5*strike;}
    if(b.action==='rift-barrage'){lift=-2.1*wind*recover;spread=side*.3*wind;}
    if(b.action==='infernal-dive')lift=-.65*wind;
    if(b.action==='wingstorm'){lift=-1.15*wind*recover;spread=side*.8*strike;}
    bones[arm]=around(P[arm],M.mul(M.rx(lift),M.rz(spread)));
    const flap=b.action==='infernal-dive'?Math.sin(time*7)*.35:b.action==='wingstorm'?Math.sin(time*5.5)*.48:.08*Math.sin(time*1.4);
    bones[wing]=around(P[wing],M.mul(M.ry(side*(b.action==='infernal-dive'?.70:.23)),M.rz(side*(flap+(b.action==='wingstorm'?wind*.7:0)))));
   }else for(const upper of [true,false]){const arm=(upper?'upper':'lower')+(side<0?'LeftArm':'RightArm');let lift=.04*Math.sin(time*1.4+side+(upper?0:1)),splay=side*(upper?.10:.05);
    if(b.action==='quad-rend'){lift=-1.35*wind*recover+(upper?side:-side)*.8*Math.sin(progress*Math.PI*2);splay=side*(.15+.3*wind);}
    if(b.action==='pounce'){lift=-1.55*wind*recover+(upper?-.3:.4)*strike;splay=side*.25*wind;}
    if(b.action==='tail-sweep'){lift=upper?-.65*wind:-.3*wind;splay=side*.4*wind;}
    if(b.action==='neural-lance'){lift=upper?-1.3*wind*recover:-2.0*wind*recover;splay=side*(upper?.45:.06)*wind;}
    bones[arm]=around(P[arm],M.mul(M.rx(lift),M.rz(splay)));
   }
  }
  bones.tail=around(P.tail,M.ry(b.action==='tail-sweep'?Math.sin(progress*Math.PI)*1.7:Math.sin(time*1.2)*.18));
  return{bones,pitch,yaw,drop:-dead*(zark?2.6:1.8)};
 }
 return{pose};
})();
function createCaraxBossScenery({mesh,M,draw}){
 const cache=new Map(),scale=(x,y,z)=>M.scale(x,y,z);
 function compiled(d){if(cache.has(d.id))return cache.get(d.id);const model=d.human?{meshes:NVEndingModels.orion,height:2}:d.id==='lord-zark'?LordZarkModel:CatharsisHawthorneModel,row={model,batches:d.human?NVCaraxGeometry.animated(model.meshes,mesh):NVCaraxGeometry.merge(model.meshes.map(p=>({...p,f:p.indices||p.f})),mesh,p=>p.bone)};cache.set(d.id,row);return row;}
 const ring=(()=>{const p=[],n=[],f=[];for(let i=0;i<=40;i++)for(const r of [.92,1]){const a=i/40*Math.PI*2;p.push(Math.sin(a)*r,0,Math.cos(a)*r);n.push(0,1,0);if(i<40&&r===.92){const j=i*2;f.push(j,j+1,j+2,j+1,j+3,j+2);}}return mesh({p,n,f});})();
 const orb=(()=>{const p=[],n=[],f=[];for(let y=0;y<=6;y++)for(let x=0;x<=10;x++){const a=y/6*Math.PI,b=x/10*Math.PI*2,v=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];p.push(...v);n.push(...v);if(y<6&&x<10){const j=y*11+x;f.push(j,j+11,j+1,j+1,j+11,j+12);}}return mesh({p,n,f});})();
 return(s,time)=>{if(!NVCarax.local(s)||!NVCatharsisFinal.active(s))return;if(!NVCarax.inside(s)&&!NVCarax.ramp(s))return;for(const d of NVCaraxBosses.definitions(s)){const b=NVCaraxBosses.ensure(s)[d.id];if(!b.hp&&b.deathAge>=6)continue;if(!NVCarax.inside(s)&&!NVCarax.ramp(s))return;const c=NVCarax.center(s),floor=14+d.floor*6,row=compiled(d),pose=d.human?{bones:{},pitch:b.hp<=0?Math.min(1,b.deathAge)*1.4:0,yaw:0,drop:0,human:NVCompanionMotion.pose(row.model.meshes,'orion',time,0,0,b.action!=='idle'?{companion:true,mode:'laser',elapsed:b.elapsed,duration:NVCaraxBosses.ATTACKS[b.action]?.duration||1}:null)}:NVCaraxBossMotion.pose(row.model,b,time),k=d.height/row.model.height,root=M.mul(M.t(c.x+b.x,floor+b.altitude+pose.drop,c.z+b.z),M.mul(M.ry(b.yaw+pose.yaw),M.mul(M.rx(pose.pitch),scale(k,k,k))));
  for(const batch of row.batches)draw(batch.geometry,M.mul(root,d.human?NVCompanionMotion.part(pose.human,batch.representative):pose.bones[batch.representative.bone]||pose.bones.body),batch.color,0,batch.emission);
  const attack=NVCaraxBosses.ATTACKS[b.action];if(attack)for(const [i,mark]of (b.markers||[]).entries()){const hit=attack.hits[Math.min(i,attack.hits.length-1)],r=attack.radius,color=b.elapsed<hit?d.color.map(v=>v*.5+.06):[.22,.23,.25];if(b.elapsed>hit+.55)continue;draw(ring,M.mul(M.t(c.x+mark.x,floor+.07,c.z+mark.z),scale(r,1,r)),color,0,.10);
   if(['neural-lance','rift-barrage','twin-volley','laser-crossfire','combat-roll'].includes(b.action)&&b.elapsed>hit-.45&&b.elapsed<hit){const t=Math.max(0,Math.min(1,(b.elapsed-(hit-.45))/.45)),x=b.x+(mark.x-b.x)*t,z=b.z+(mark.z-b.z)*t;draw(orb,M.mul(M.t(c.x+x,floor+1.9*(1-t)+.15,c.z+z),scale(.25,.25,.25)),d.color,0,.2);}
  }
  polarCanvas.dataset.caraxBoss=d.id;polarCanvas.dataset.caraxBossAction=b.action;polarCanvas.dataset.caraxBossBatches=String(row.batches.length);
 } };
}
const caraxBossSceneryBase=createSolScenery;createSolScenery=args=>{const old=caraxBossSceneryBase(args),render=createCaraxBossScenery(args);return(s,...rest)=>{old(s,...rest);render(s,...rest);};};
