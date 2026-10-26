// Victory conditions and non-player retreats are character-local, never recruitment changes.
const NVWarOutcomes=(()=>{
 const sourceFaction=(s,source='wanderer')=>String(source).match(/^field:([^:]+):/)?.[1]||'CUSTOM';
 function ready(s,w){
  if(!w||w.stage!=='active')return false;
  if(['VASSALAGE','RESTORATION'].includes(w.cb))return w.leaderDefeated===true;
  if(w.cb==='ANNIHILATION')return NVGalacticDiplomacy.territory(s,w.defender).length===0;
  return w.original.length>0&&w.original.every(id=>NVGalacticDiplomacy.owner(s,id)!==w.defender);
 }
 function leaderDefeated(s,f,by){
  if(f===by)return;
  const q=NVGalacticDiplomacy.ensure(s);
  for(const w of q.wars.slice())if(w.stage==='active'&&w.aggressor===by&&
    (w.defender===f||w.cb==='RESTORATION'&&NVGalacticDiplomacy.overlord(s,w.defender)===f)){
   if(!['VASSALAGE','RESTORATION'].includes(w.cb))continue;
   w.leaderDefeated=true;NVGalacticDiplomacy.settle(s,w);
  }
 }
 return{sourceFaction,ready,leaderDefeated};
})();
const NVGovernorReturns=(()=>{
 const ensure=s=>NVEris.ensure(s).governorReturns||(NVEris.ensure(s).governorReturns={});
 const active=(s,id)=>(s?.eris?.governorReturns?.[id]?.remaining||0)>0;
 function home(s,a){
  const id=a.sourceId||a.id,post=NVCrewDiplomacy.ensure(s).assignments[id];if(post?.faction===a.faction)return post.body;
  if(a.faction==='CUSTOM')return Object.values(NVGovernance.ensure(s).colonies).find(c=>!c.captured&&NVGovernance.governors(c).includes(id))?.body||'';
  const worlds=NVGalacticDiplomacy.territory(s,a.faction).filter(b=>!b.station);
  return worlds.length?worlds[NVFrontlineCampaign.hash(id)%worlds.length].id:'';
 }
 function retreat(s,a){
  const id=a.sourceId||a.id,body=home(s,a);if(!body||active(s,id))return false;
  ensure(s)[id]={body,faction:a.faction,name:a.name||NVCrewDiplomacy.member(s,id)?.name||id,remaining:90};
  const post=NVCrewDiplomacy.ensure(s).assignments[id];if(post)Object.assign(post,{hp:post.maxHp,mode:'idle'});
  delete s.eris?.governorTracker?.reports?.[id];
  for(const q of Object.values(s.eris?.commandTravel?.systems||{}))q.fleet=q.fleet.filter(v=>v.officer!==id);
  NVSpace.notice(s.space,ensure(s)[id].name+' returned to '+NVSol.byId[body].name);return true;
 }
 function step(s,dt){if(!Number.isFinite(dt)||dt<=0)return;for(const[id,r]of Object.entries(ensure(s))){r.remaining=Math.max(0,r.remaining-Math.min(.1,dt));if(!r.remaining){delete ensure(s)[id];for(const row of Object.values(s.eris?.fieldCommands||{})){delete row.hp?.['field:'+r.faction+':'+id];delete row.regroup?.['field:'+r.faction+':'+id];}}}}
 function restore(raw){const q={};for(const[id,r]of Object.entries(raw||{}))if(id.length<=100&&NVSol.byId[r?.body]&&typeof r.faction==='string'&&typeof r.name==='string'&&Number.isFinite(r.remaining)&&r.remaining>0)q[id]={body:r.body,faction:r.faction.slice(0,100),name:r.name.slice(0,100),remaining:Math.min(90,r.remaining)};return q;}
 return{ensure,active,home,retreat,step,restore};
})();
const returnRestore=NVEris.restore;NVEris.restore=raw=>({...returnRestore(raw),governorReturns:NVGovernorReturns.restore(raw?.governorReturns)});
const returnMembers=NVFieldCommand.members;NVFieldCommand.members=(s,...args)=>returnMembers(s,...args).filter(a=>!NVGovernorReturns.active(s,a.id));
const returnLocal=NVCrewDiplomacy.local;NVCrewDiplomacy.local=s=>returnLocal(s).filter(a=>!NVGovernorReturns.active(s,a.npc.id));
const returnRecall=NVCrewDiplomacy.recall;NVCrewDiplomacy.recall=(s,id,...args)=>{const r=returnRecall(s,id,...args);if(r.ok)delete NVGovernorReturns.ensure(s)[id];return r;};
const returnTick=stepEcology;stepEcology=dt=>{returnTick(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState)NVGovernorReturns.step(polarState,dt);};
