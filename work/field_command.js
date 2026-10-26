// Small, save-local expedition squads support ordinary wars without moving story NPCs.
const NVFieldCommand=(()=>{
 const runtime=new WeakMap(),LIMIT=6;
 const ensure=s=>NVEris.ensure(s).fieldCommands||(NVEris.ensure(s).fieldCommands={});
 const relation=(s,a,b)=>NVGalacticDiplomacy.relation(s,a,b);
 function storyRequired(s,id){
  const ch=NVChapter3Access.chapter(s);if(ch>=5)return false;
  if(ch===3&&id==='eris')return !NVSolFall.ensure(s).settled;
  if(ch===3&&['janira-prime','janira-i'].includes(id))return !NVJaniraVictory.liberated(s);
  if(ch===4){
   if(id==='archiostal')return !NVArchamus.ensure(s).contactBriefed;
   if(id==='janira-prime')return !NVCatharsisReturnHak.done(s);
   if(id==='aridaxx')return !NVCatharsisRoute.ensure(s).alphinosMet;
  }
  return false;
 }
 function reserved(s,id){
  if(NVFrontlineCampaign.storyLock(s,id))return true;
  const b=NVSol.byId[id],ch=NVChapter3Access.chapter(s);
  // Fortress floors have their own assault army, switches and governor encounters.
  if(id==='carax'||/fortress/i.test(b?.category||'')||NVFrontierFortresses.IDS.includes(id))return true;
  if(ch===3){
   if(['sol','janira-proxima','malana'].includes(b?.system||'sol'))return true;
   if(b?.system===NVJaniraExpedition.TARGETS.player&&!s.eris?.solWar?.solFall?.expedition?.conquered)return true;
  }
  if(ch===4&&(['earth','triton','janira-prime','janira-i','tamaz-p1','aridaxx','archiostal'].includes(id)||NVCatharsisField.onWorld(s)))return true;
  return false;
 }
 function context(s){
  if(!s||NVChapter3Access.chapter(s)<3||!s.eris?.galacticDiplomacy?.enabled||!NVBCCombat.playable(s)||NVArchiostal.active(s)||s.space?.phase!=='landed')return null;
  const id=NVEris.world(s);if(reserved(s,id))return null;
  const owner=NVGalacticDiplomacy.owner(s,id),q=NVGalacticDiplomacy.ensure(s);
  const colony=owner==='CUSTOM'&&NVGovernance.ensure(s).colonies[id],own=owner==='CUSTOM'?(colony?{...colony,...NVGovernance.location(s,colony),faction:'CUSTOM'}:NVEris.ensure(s).bases.find(b=>b.body===id)):null;
  const bases=own?[{...own,faction:'CUSTOM'}]:NVOccupation.local(s);
  const base=bases.filter(b=>b.faction===owner&&Math.hypot(b.x-s.x,b.z-s.z)<220).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0];if(!base)return null;
  const war=q.wars.find(w=>w.stage==='active'&&[w.aggressor,w.defender].includes(owner)&&relation(s,w.aggressor,w.defender)==='WAR'&&[w.aggressor,w.defender].every(f=>NVGalacticDiplomacy.alive(s,f)));
  if(!war)return null;const attacker=war.aggressor===owner?war.defender:war.aggressor;
  if(!customCrewSystemUnlocked(s,NVSol.byId[id]?.system||'sol')||!NVAndromeda.canConquer(s,attacker,id)||attacker==='CHIMAERA_SCOURGE'&&NVSol.byId[id]?.galaxy!=='chimaera'&&!NVChimaeraOffensive.mobilised(s))return null;
  return{body:id,base,owner,attacker,war,stamp:[war.id,owner,q.frontlineChanges?.[id]||0].join(':')};
 }
 function leaders(s,f){
  const appointed=NVFactionAdministration.leader(s,f),posts=NVCrewDiplomacy.ensure(s).assignments;
  if(appointed&&posts[appointed]?.hp>0){const n=NVCrewDiplomacy.member(s,appointed);return n?[{id:appointed,name:n.name,npc:n}]:[];}
  const founder=NVCustomCrew.empires(s).find(n=>NVCustomCrew.faction(n)===f);
  if(founder)return[{id:founder.id,name:founder.headOfState||founder.name,npc:founder}];
  if(f==='CUSTOM')return[]; // The Wanderer leads their own governors.
  if(f==='TERRA'){
   if(s.eris?.orionEmpire?.stage==='active'&&s.eris?.vengefulMascar?.stage!=='complete')return[{id:'orion',name:'ORION MASCAR',npc:NVParty.members.find(n=>n.id==='orion')}];
   return NVSolWar.ensure(s).thomasAlive?[{id:'hawthorne',name:'THOMAS HAWTHORNE',model:'hawthorne',patterns:['burst','lance','orb']}]:[];
  }
  const faction=f==='RESISTANCE'?'ERISIAN':f;
  const known=NVFactionLeaders.DEFINITIONS.filter(d=>d.faction===faction);if(known.length)return known.filter(d=>NVFactionLeaders.ensure(s)[d.id]?.stage!=='defeated').slice(0,2).map(d=>({id:d.id,name:d.name,model:d.id,patterns:d.patterns}));
  return[{id:'commander-'+f,name:f==='TERRAN'?NVSiegeOfSol.ensure(s).general.name:f==='CATHARSIS'?'CATHARSIS BROOD COMMANDER':NVDiplomacy.name(s,f)+' FIELD COMMANDER',army:f,patterns:f==='CATHARSIS'?['dash','cleave','slam']:['laser','orb']}];
 }
 function members(s,f,c){
  const list=leaders(s,f).map(n=>({...n,role:'LEADER'})),posts=NVCrewDiplomacy.ensure(s).assignments;
  if(f==='TERRA')for(const n of NVImperiaGovernors.roster(s))if(list.length<3)list.push(n);
  const candidates=f==='CUSTOM'?Object.values(NVGovernance.ensure(s).colonies).filter(g=>!g.captured).flatMap(g=>NVGovernance.governors(g).map(id=>({id,body:g.body,hp:1}))):Object.values(posts).filter(a=>a.faction===f&&a.hp>0);
  for(const a of candidates){if(list.length>=3)break;if(a.body===c.body&&f!=='CUSTOM'||list.some(n=>n.id===a.id))continue;const n=NVCrewDiplomacy.member(s,a.id);if(n)list.push({id:a.id,name:n.name,npc:n,role:'GOVERNOR'});}
  // Established factions also have native provincial governors, not copies of their ruler.
  for(let i=0;f!=='CUSTOM'&&list.length<3;i++){
   const seed=NVFrontlineCampaign.hash(s.seed+':'+f+':governor:'+i),first=['Aren','Vela','Korin','Sera','Tarek','Neris','Rovan','Ilyra'],last=['Voss','Keral','Sen','Rath','Talin','Var'];
   list.push({id:'native-'+f+'-'+i,name:first[seed%8]+' '+last[(seed>>>8)%6],army:f,role:'GOVERNOR',patterns:['laser','burst']});
  }
  return list.slice(0,3);
 }
 // Only the current owner's capital permits a compact formation. Custom founders and
 // appointed puppet rulers use their actual capital, including relocated leaders.
 function capital(s,body,f=NVGalacticDiplomacy.owner(s,body)){
  const appointed=NVFactionAdministration.leader(s,f),post=appointed&&NVCrewDiplomacy.ensure(s).assignments[appointed];
  if(post)return post.body===body;
  const founder=NVCustomCrew.empires(s).find(n=>NVCustomCrew.faction(n)===f);
  if(founder)return NVCustomCrew.capital(founder)?.id===body;
  if(f==='TERRA')return body===(s.eris?.orionEmpire?.stage==='active'?s.eris.orionEmpire.capital?.body:'mercury');
  if(f==='CHOMPY')return body===(s.eris?.catharsisCoreRoute?.briefed?'aridaxx':'janira-prime');
  return NVFactionLeaders.DEFINITIONS.some(d=>d.faction===(f==='RESISTANCE'?'ERISIAN':f)&&d.body===body);
 }
 function formation(n,compact){
  // Two officers take opposite wings; a third pins the target from the front.
  return compact?0:n.teamSize===1?0:n.teamSize===2?(n.index===0?-1:1):n.index===0?0:n.index===1?-1:1;
 }
 function state(s){
  const c=context(s);if(!c){runtime.delete(s);return null;}
  const sides=[c.attacker,c.owner],roster=sides.flatMap((f,side)=>members(s,f,c).map((n,index)=>({...n,faction:f,side,index,id:'field:'+f+':'+n.id,sourceId:n.id})));
  // A capital's existing boss or posted governor is the defender there; never draw a second copy.
  const filtered=roster.filter(n=>!NVGovernorReturns.active(s,n.sourceId)&&!(NVOrionCroxianRelief.active(s)&&['orion','croxian'].includes(n.sourceId))&&!NVFactionLeaders.local(s).some(t=>t.id===n.sourceId)&&!NVCrewDiplomacy.local(s).some(t=>t.npc.id===n.sourceId)).slice(0,LIMIT);
  const compact=capital(s,c.body,c.owner),key=[NVCombatSquad.key(s),c.stamp,compact,...filtered.map(n=>n.id)].join('|');let q=runtime.get(s);
  if(q?.key===key){q.context=c;return q;}
  let row=ensure(s)[c.body];if(!row||row.stamp!==c.stamp)row=ensure(s)[c.body]={stamp:c.stamp,hp:{},regroup:{},result:''};row.regroup||={};
  const dx=s.x-c.base.x,dz=s.z-c.base.z,d=Math.max(1,Math.hypot(dx,dz)),ux=d>1?dx/d:0,uz=d>1?dz/d:-1;
  const actors=filtered.map(n=>{const maxHp=n.role==='LEADER'?1200:600,offset=n.side===0?58:12,teamSize=filtered.filter(v=>v.faction===n.faction).length,lane=formation({...n,teamSize},compact),flank=compact?(n.index-1)*5:lane*18;return{...n,teamSize,lane,maxHp,hp:Math.max(0,Math.min(maxHp,row.hp[n.id]??maxHp)),x:c.base.x+ux*offset+uz*flank,z:c.base.z+uz*offset-ux*flank,yaw:0,speed:0,phase:0,mode:'idle',elapsed:0,duration:1,cooldown:.5+n.index*.2,count:0,fired:false,companion:true,tactic:compact?'CAPITAL FORMATION':lane<0?'LEFT FLANK':lane>0?'RIGHT FLANK':'PINNING'};});
  q={key,context:c,row,actors,effects:[],clock:0,compact,plans:new Map()};runtime.set(s,q);return q;
 }
 const local=s=>state(s)?.actors.filter(a=>a.hp>0)||[];
 const units=s=>local(s).filter(a=>relation(s,'CUSTOM',a.faction)==='ALLIED').map(a=>({id:a.id,pose:a}));
 const targets=s=>local(s).filter(a=>relation(s,'CUSTOM',a.faction)==='WAR').map(a=>({type:'field-command',id:a.id,name:a.name,enemy:a,x:a.x,z:a.z,faction:a.faction}));
 function hurt(s,id,damage,source='wanderer'){const q=state(s),a=q?.actors.find(a=>a.id===id);if(!a||a.hp<=0||!Number.isFinite(damage)||damage<=0)return;a.hp=Math.max(0,a.hp-damage);q.row.hp[a.id]=a.hp;a.hit=.2;if(a.hp===0){a.mode='idle';a.speed=0;q.row.regroup[a.id]=90;
   // A loaned companion defeated as an enemy still comes home, as at their governor post.
   const by=NVWarOutcomes.sourceFaction(s,source),post=NVCrewDiplomacy.ensure(s).assignments[a.sourceId];if(by==='CUSTOM'&&post?.faction===a.faction&&relation(s,'CUSTOM',a.faction)==='WAR')NVCrewDiplomacy.recall(s,a.sourceId,true);
   if(a.imperialGovernor&&a.faction==='TERRA')NVImperiaGovernors.retreat(s,a.sourceId);
   else if(a.role==='GOVERNOR'&&by!=='CUSTOM')NVGovernorReturns.retreat(s,a);
   if(a.role==='LEADER')NVWarOutcomes.leaderDefeated(s,a.faction,by);
  }}
 function enemies(s,q,a){
  const out=q.actors.filter(b=>b.hp>0&&relation(s,a.faction,b.faction)==='WAR').map(b=>({type:'field-command',enemy:b,x:b.x,z:b.z}));
  if(q.context.owner!=='CUSTOM'&&relation(s,a.faction,q.context.owner)==='WAR')for(let i=0;i<12;i++){const g=NVBCCombat.patrol(s,q.context.base,i,q.clock);if(g.hp>0)out.push({type:'patrol',enemy:g,x:g.x,z:g.z});}
  for(const t of fieldCommandBaseTargets(s)){
   const f=t.type==='patrol'?t.enemy.base?.faction:t.type==='foreign-governor'?t.enemy.faction:t.type==='faction-leader'?t.faction:'';
   if(f&&relation(s,a.faction,f)==='WAR'&&!out.some(v=>v.enemy===t.enemy))out.push(t);
  }
  if(relation(s,a.faction,'CUSTOM')==='WAR')for(const u of fieldCommandBaseUnits(s))out.push({type:'squad',id:u.id,x:u.pose.x,z:u.pose.z,enemy:u.pose});
  return out.filter(t=>Math.hypot(t.x-a.x,t.z-a.z)<110);
 }
 function damage(s,t,amount,source){if(t.type==='field-command')hurt(s,t.enemy.id,amount,source);else if(t.type==='squad'){NVCombatSquad.hurt(s,t.id,Math.min(10,amount));if(t.id==='wanderer'&&NVEcology.ensure(s).health<=0){NVEcology.recover(s);NVSpace.notice(s.space,'GROUND ASSAULT REPULSED / RETURNED TO YOUR SHIP');}}else NVCompanionCombat.hit(t,amount,0,false,source);}
 // Each side keeps a shared moving focus and fixed approach axis for a manoeuvre.
 // This avoids frame-by-frame target swapping and lets wings actually get behind it.
 function plan(s,q,a,candidates){
  let p=q.plans.get(a.faction);const team=q.actors.filter(b=>b.faction===a.faction&&b.hp>0),focus=p&&candidates.find(t=>t.enemy===p.enemy);
  if(!focus||q.clock-p.started>17){
   const lead=team.find(b=>b.role==='LEADER')||a,t=candidates.slice().sort((b,c)=>Math.hypot(b.x-lead.x,b.z-lead.z)-Math.hypot(c.x-lead.x,c.z-lead.z))[0];
   if(!t)return null;const dx=lead.x-t.x,dz=lead.z-t.z,d=Math.hypot(dx,dz);
   p={enemy:t.enemy,started:q.clock,ux:d>.1?dx/d:0,uz:d>.1?dz/d:-1,assaultAt:null,ready:new Set()};q.plans.set(a.faction,p);
  }
  const t=candidates.find(t=>t.enemy===p.enemy);if(!t)return null;
  const wings=team.filter(b=>b.lane!==0);
  if(p.assaultAt===null&&(q.compact||!wings.length||wings.every(b=>p.ready.has(b.id))||q.clock-p.started>=8))p.assaultAt=q.clock;
  return{p,t};
 }
 function manoeuvre(s,q,a,p,t,spec,dt){
  const assault=p.assaultAt!==null,ranged=spec[3]>8,radius=ranged?Math.min(20,Math.max(9,spec[3]*.58)):Math.max(1.6,spec[3]*.65);
  let goal=t;
  if(!q.compact){
   const angle=a.lane*(assault?2.05:1.12),r=a.lane&&!assault?Math.max(18,radius):radius;
   const forward=Math.cos(angle)*r,side=Math.sin(angle)*r;
   goal={x:t.x+p.ux*forward-p.uz*side,z:t.z+p.uz*forward+p.ux*side};
   if(a.lane&&Math.hypot(goal.x-a.x,goal.z-a.z)<3)p.ready.add(a.id);
   a.tactic=assault?'COMBINED ASSAULT':a.lane<0?'LEFT FLANK':a.lane>0?'RIGHT FLANK':'PINNING';
  }else a.tactic='CAPITAL FORMATION';
  const distance=Math.hypot(t.x-a.x,t.z-a.z),travel=Math.hypot(goal.x-a.x,goal.z-a.z);
  if(q.compact&&distance<=spec[3]*.8&&NVCombatSquad.visible(s,a,t))return;
  if(travel>1.4||!NVCombatSquad.visible(s,a,t)){
   // Keep independent firing lanes instead of stacking models in a single spot.
   if(!q.compact)for(const b of q.actors){if(b===a||b.hp<=0||b.faction!==a.faction)continue;const dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz);if(d<3.5&&d>.01){goal={x:goal.x+dx/d*(3.5-d)*3,z:goal.z+dz/d*(3.5-d)*3};}}
   const speed=q.compact?5.5:assault?7:8;
   a.speed=NVCombatSquad.advance(s,a,goal,dt*speed)/dt;
  }
 }
 function step(s,dt){
  if(!Number.isFinite(dt)||dt<=0)return;const q=state(s);if(!q)return;dt=Math.min(.1,dt);q.clock+=dt;q.effects=q.effects.filter(e=>(e.age+=dt)<e.life);
  for(const a of q.actors){
   a.speed=0;a.hit=Math.max(0,(a.hit||0)-dt);
   if(a.hp<=0){q.row.regroup[a.id]=Math.max(0,(q.row.regroup[a.id]??90)-dt);if(q.row.regroup[a.id]===0){a.hp=a.maxHp;q.row.hp[a.id]=a.hp;a.mode='idle';a.elapsed=0;a.cooldown=1;a.target=null;const rear=a.side===0?65:20;a.x=q.context.base.x+(q.compact?(a.index-1)*6:a.lane*18);a.z=q.context.base.z-rear;}continue;}
   const candidates=enemies(s,q,a),order=plan(s,q,a,candidates);
   if(!order){a.mode='idle';a.target=null;a.tactic='SEARCHING';continue;}
   const{p,t}=order;a.target=t.enemy;a.cooldown=Math.max(0,a.cooldown-dt);a.yaw=Math.atan2(t.x-a.x,t.z-a.z);
   if(a.mode==='idle'){
    const action=a.patterns?.[a.count%a.patterns.length]||(a.npc?NVCompanionCombat.attack(s,a.npc,a):'laser'),spec=NVCompanionCombat.C[action]||NVCompanionCombat.C.laser;
    manoeuvre(s,q,a,p,t,spec,dt);
    // A covering officer fires during the flank. The wings stagger their opening
    // attacks, then keep pressing; no waiting indefinitely for a blocked partner.
    const volley=p.assaultAt===null?-1:Math.floor((q.clock-p.assaultAt)/1.8),opening=p.assaultAt===null||q.clock-p.assaultAt-volley*1.8>=a.index*.28&&a.lastVolley!==p.started+':'+volley;
    if(Math.hypot(t.x-a.x,t.z-a.z)>spec[3]||!NVCombatSquad.visible(s,a,t)||a.cooldown>0||!opening)continue;
    Object.assign(a,{mode:action,duration:spec[0],elapsed:0,fired:false,count:a.count+1,lastVolley:p.started+':'+volley});
   }
   const spec=NVCompanionCombat.C[a.mode]||NVCompanionCombat.C.laser;
   if(a.speed===0&&spec[3]>8&&!q.compact)manoeuvre(s,q,a,p,t,spec,dt*.7);
   a.elapsed+=dt;
   if(!a.fired&&a.elapsed>=spec[1]){a.fired=true;const wave=['slam','shockwave','orb'].includes(a.mode),center=a.mode==='orb'?t:a,radius=a.mode==='shockwave'?12:a.mode==='orb'?4:spec[3],amount=Math.min(a.role==='LEADER'?40:26,spec[2]);
    for(const target of wave?candidates:[t])if(Math.hypot(target.x-(wave?center:a).x,target.z-(wave?center:a).z)<=(wave?radius:spec[3]+1)&&NVCombatSquad.visible(s,a,target))damage(s,target,amount,a.id);
    q.effects.push({type:wave?'wave':'beam',from:{x:a.x,z:a.z},to:{x:t.x,z:t.z},age:0,life:.35,color:NVOccupation.palette(s,a.faction)[1]});q.effects=q.effects.slice(-16);
   }
   if(a.elapsed>=a.duration){a.mode='idle';a.cooldown=q.compact?.65:p.assaultAt!==null?.3:.45;}
  }
  NVBaseAssault.flush(s);
  // NPC victories can take an ordinary world; player wars retain the explicit capture button.
  const c=q.context,guards=c.owner==='CUSTOM'||NVBaseAssault.ledger(s,c.base).hp.some(h=>h>0),posts=Object.values(NVCrewDiplomacy.ensure(s).assignments).some(a=>a.body===c.body&&a.faction===c.owner&&a.hp>0),capitalWorld=capital(s,c.body,c.owner);
  if(!q.row.result&&!guards&&!posts&&!capitalWorld&&!NVGovernance.protectedWorld(s,c.body)&&![c.war.aggressor,c.war.defender].includes('CUSTOM')&&q.actors.some(a=>a.faction===c.attacker&&a.hp>0)&&!q.actors.some(a=>a.faction===c.owner&&a.hp>0)){
   if(NVFrontlineCampaign.transfer(s,c.body,c.attacker)){q.row.result='captured';if(c.attacker===c.war.aggressor&&!c.war.captured.includes(c.body))c.war.captured.push(c.body);NVSpace.notice(s.space,NVDiplomacy.name(s,c.attacker).toUpperCase()+' CHARGE CAPTURED '+NVSol.byId[c.body].name.toUpperCase());NVGalacticDiplomacy.settle(s,c.war);}
  }
 }
 function restore(raw){const q={};for(const[id,r]of Object.entries(raw||{}))if(NVSol.byId[id]&&typeof r?.stamp==='string'){const hp={},regroup={};for(const[k,v]of Object.entries(r.hp||{}))if(k.startsWith('field:')&&k.length<180&&Number.isFinite(v)){hp[k]=Math.max(0,Math.min(1200,v));if(hp[k]===0)regroup[k]=Math.max(0,Math.min(90,Number.isFinite(r.regroup?.[k])?r.regroup[k]:90));}q[id]={stamp:r.stamp.slice(0,200),hp,regroup,result:r.result==='captured'?'captured':''};}return q;}
 return{LIMIT,ensure,storyRequired,reserved,context,leaders,members,capital,state,peek:s=>runtime.get(s)||null,local,units,targets,hurt,step,restore};
})();
const fieldCommandRestore=NVEris.restore;NVEris.restore=raw=>({...fieldCommandRestore(raw),fieldCommands:NVFieldCommand.restore(raw?.fieldCommands)});
const fieldCommandBaseTargets=NVBCCombat.targets;NVBCCombat.targets=s=>[...fieldCommandBaseTargets(s),...NVFieldCommand.targets(s)];
const fieldCommandBaseUnits=NVCombatSquad.units;NVCombatSquad.units=s=>[...fieldCommandBaseUnits(s),...NVFieldCommand.units(s)];
const fieldCommandHurt=NVCombatSquad.hurt;NVCombatSquad.hurt=(s,id,damage,source='wanderer')=>id.startsWith('field:')?NVFieldCommand.hurt(s,id,damage,source):fieldCommandHurt(s,id,damage);
const fieldCommandHit=NVCompanionCombat.hit;NVCompanionCombat.hit=(t,damage,...args)=>{if(t.type!=='field-command')return fieldCommandHit(t,damage,...args);if(damage>0&&NVWarOutcomes.sourceFaction(polarState,args[2]||'wanderer')==='CUSTOM'&&NVOrionCroxianRelief.begin(polarState,t))return;if(NVOrionCroxianRelief.active(polarState)&&['orion','croxian'].includes(t.enemy.sourceId))return;return NVFieldCommand.hurt(polarState,t.id,damage,args[2]||'wanderer');};
const fieldCommandTick=stepEcology;stepEcology=dt=>{fieldCommandTick(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState)NVFieldCommand.step(polarState,dt);};
// Hide only the friendly scenic copy while its leader is physically on this battlefield.
const fieldCommandNPCId=n=>n?.kind==='queen'?'vishara':n?.kind;
const fieldCommandErisNPC=NVEris.npc;NVEris.npc=s=>{const n=fieldCommandErisNPC(s);return n&&NVFieldCommand.local(s).some(a=>a.sourceId===fieldCommandNPCId(n))?null:n;};
const fieldCommandRefugees=NVSolFall.refugeeNPCs;NVSolFall.refugeeNPCs=s=>{const actors=NVFieldCommand.local(s);return fieldCommandRefugees(s).filter(n=>!actors.some(a=>a.sourceId===fieldCommandNPCId(n)));};
const fieldCommandFamily=NVErisFamily.npcs;NVErisFamily.npcs=s=>{const actors=NVFieldCommand.local(s);return fieldCommandFamily(s).filter(n=>!actors.some(a=>a.sourceId===fieldCommandNPCId(n)));};

const fieldCommandTransfer=NVFrontlineCampaign.transfer;NVFrontlineCampaign.transfer=(s,id,to)=>!NVFieldCommand.storyRequired(s,id)&&fieldCommandTransfer(s,id,to);
