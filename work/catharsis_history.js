// The Chapter 3 enclave becomes the same world investigated with Williams in Chapter 4.
// Earlier bootstrap code queries diplomacy before this optional history module loads.
// Hoist the binding so its readiness checks see undefined instead of a const TDZ.
var NVCatharsisHistory=(()=>{
 const early=s=>NVChapter3Access.chapter(s)>=3&&!chapter5Unlocked(s)&&!NVCatharsisRoute.afterSkip(s);
 function ensure(s){const e=NVEris.ensure(s);return e.catharsisHistory||(e.catharsisHistory={world:'',independent:false});}
 function world(s){
  const r=ensure(s),target=s.eris?.williamsExpedition?.target;
  if(NVWilliamsExpedition.validTarget(target))r.world=target;
  if(NVWilliamsExpedition.validTarget(r.world))return NVSol.byId[r.world];
  const claimed=new Set(s.eris?.playerFaction?.claims||[]),choices=NVCluster.generated.flatMap(sys=>NVCluster.bodyLists[sys.id]||[]).filter(b=>NVWilliamsExpedition.validTarget(b.id)&&!claimed.has(b.id)&&!['CUSTOM','GREK'].includes(s.eris?.galacticDiplomacy?.owners?.[b.id])&&!String(s.eris?.galacticDiplomacy?.owners?.[b.id]||'').startsWith('UPLIFT_')&&!s.eris?.governance?.colonies?.[b.id]&&!s.eris?.customCrew?.characters?.some(n=>n.status==='uplifted'&&n.system===b.system));
  const b=choices.find(b=>/Ravaged|Scorched/.test(b.category))||choices[0];if(b)r.world=b.id;return b||null;
 }
 function sync(s,q){
  if(NVChapter3Access.chapter(s)<3||chapter5Unlocked(s))return q;
  const r=ensure(s),b=world(s);if(!b)return q;
  if(early(s)){r.independent=false;delete q.eliminated.CATHARSIS;q.owners[b.id]='CATHARSIS';q.subjects.CATHARSIS={overlord:'GREK',type:'VASSALAGE',lastDay:q.day||0};}
  else if(NVCatharsisRoute.afterSkip(s)&&!r.independent){
   r.independent=true;delete q.subjects.CATHARSIS;
   if(typeof NVSubjectGovernments!=='undefined')NVSubjectGovernments.returnOfficer(s,'CATHARSIS');
   for(const f of ['CUSTOM','GREK','HUMAN','CHOMPY','ERISIAN','RESISTANCE'])q.relations[NVGalacticDiplomacy.key('CATHARSIS',f)]='WAR';
   if(!Object.hasOwn(q.owners,b.id))q.owners[b.id]='CATHARSIS';
  }
  return q;
 }
 function restore(raw){return{world:NVWilliamsExpedition.validTarget(raw?.world)?raw.world:'',independent:raw?.independent===true};}
 return{early,ensure,world,sync,restore};
})();
const cathHistoryEnsure=NVGalacticDiplomacy.ensure;NVGalacticDiplomacy.ensure=s=>NVCatharsisHistory.sync(s,cathHistoryEnsure(s));
const cathHistoryFaction=NVEris.faction;NVEris.faction=(s,id)=>{if(NVCatharsisHistory.early(s)){if(id===NVCatharsisHistory.world(s)?.id)return'CATHARSIS';const old=cathHistoryFaction(s,id);return old==='CATHARSIS'?'UNCLAIMED':old;}return cathHistoryFaction(s,id);};
const cathHistoryOwner=NVGalacticDiplomacy.owner;NVGalacticDiplomacy.owner=(s,id)=>{if(NVCatharsisHistory.early(s)){if(id===NVCatharsisHistory.world(s)?.id)return'CATHARSIS';const f=cathHistoryOwner(s,id);return f==='CATHARSIS'?'UNCLAIMED':f;}return cathHistoryOwner(s,id);};
const cathHistoryRelation=NVDiplomacy.relation;NVDiplomacy.relation=(s,f)=>f==='CATHARSIS'&&NVCatharsisHistory.early(s)?NVGalacticDiplomacy.relation(s,'CUSTOM',f):cathHistoryRelation(s,f);
const cathHistorySystem=NVDiplomacy.system;NVDiplomacy.system=(s,id)=>{if(NVCatharsisHistory.early(s)&&NVCatharsisHistory.world(s)?.system===id){const factions=[...new Set((NVCluster.bodyLists[id]||[]).map(b=>NVEris.faction(s,b.id)).filter(f=>f!=='UNCLAIMED'))],relations=factions.map(f=>NVDiplomacy.relation(s,f)),war=relations.includes('WAR'),allied=relations.includes('ALLIED'),status=war&&allied?'MIXED':war?'WAR':allied?'ALLIED':'NEUTRAL';return{factions,war,allied,status,color:NVDiplomacy.COLORS[status]};}return cathHistorySystem(s,id);};
const cathHistoryOccupation=NVOccupation.sync;NVOccupation.sync=s=>{NVGalacticDiplomacy.ensure(s);return cathHistoryOccupation(s);};
const cathHistoryRestore=NVEris.restore;NVEris.restore=raw=>({...cathHistoryRestore(raw),catharsisHistory:NVCatharsisHistory.restore(raw?.catharsisHistory)});
const cathHistoryWorldRestore=NVAntarctica.restored;NVAntarctica.restored=(...args)=>{const s=cathHistoryWorldRestore(...args);if(s.space&&NVChapter3Access.chapter(s)>=3)NVGalacticDiplomacy.ensure(s);return s;};
const cathHistoryTick=stepEcology;stepEcology=dt=>{if(gameActive&&polarState&&NVChapter3Access.chapter(polarState)>=3)NVGalacticDiplomacy.ensure(polarState);return cathHistoryTick(dt);};
const cathHistoryBoxes=refreshCatharsisBoxes;refreshCatharsisBoxes=()=>{cathHistoryBoxes();const s=polarState;if(!s||NVChapter3Access.chapter(s)<3)return;if(chapter5Unlocked(s)){catharsisAtlas.hidden=catharsisSurface.hidden=true;return;}const b=NVCatharsisHistory.world(s),early=NVCatharsisHistory.early(s);for(const box of [catharsisAtlas,catharsisSurface]){box.hidden=!b||NVGalaxy.system(s)!==b.system||box===catharsisSurface&&s.space.body!==b.id;if(!box.hidden){box.setAttribute('aria-label',early?'Neutral Catharsis enclave / puppet of the Grek Empire':'Independent Catharsis / hostile occupation');box.querySelector('small').textContent=early?'NEUTRAL / PUPPET OF GREK EMPIRE':'INDEPENDENT / HOSTILE OCCUPATION';box.querySelector('.atlas-faction-count').textContent=b.name.toUpperCase()+' / '+NVCluster.meta[b.system].name.toUpperCase();}}};
const cathHistoryGalaxy=refreshGalaxy;refreshGalaxy=()=>{cathHistoryGalaxy();const s=polarState;if(!s||!NVCatharsisHistory.early(s))return;const b=NVCatharsisHistory.world(s);if(b?.system!==galaxySelected)return;$('#galaxyFaction').textContent='CATHARSIS / NEUTRAL / PUPPET OF GREK EMPIRE';$('#galaxyFaction').dataset.relationship='NEUTRAL';$('#galaxyFaction').dataset.faction='CATHARSIS';$('#galaxyFaction').style.color=NVDiplomacy.COLORS.NEUTRAL;$('#galaxyNote').textContent='The Catharsis occupy only '+b.name+'. Their neutral enclave is a puppet state of the Grek Empire.';};
