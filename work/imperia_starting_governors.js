// These are Hawthorne's story appointments, never recruited/loaned companion posts.
const NVImperiaGovernors=(()=>{
 const IDS=['croxian','malia'];
 const outcome=(s,id)=>s?.eris?.solWar?.solFall?.expedition?.blockade?.siege?.commanders?.resolution?.choices?.[id]||'';
 const serving=(s,id)=>IDS.includes(id)&&NVChapter3Access.chapter(s)===3&&['expansion','war'].includes(s?.eris?.solWar?.stage)&&s.eris.solWar.thomasAlive!==false&&!outcome(s,id)&&!s.eris?.combatCrew?.recruited?.includes(id);
 const ensure=s=>NVEris.ensure(s).imperiaGovernorRetreats||(NVEris.ensure(s).imperiaGovernorRetreats={});
 const regrouping=(s,id)=>serving(s,id)&&(s.eris?.imperiaGovernorRetreats?.[id]?.remaining||0)>0;
 const available=(s,id)=>serving(s,id)&&!regrouping(s,id);
 const roster=s=>IDS.filter(id=>available(s,id)).map(id=>({id,name:NVParty.members.find(n=>n.id===id).name,npc:NVParty.members.find(n=>n.id===id),role:'GOVERNOR',imperialGovernor:true}));
 function retreat(s,id){if(!serving(s,id)||regrouping(s,id))return false;ensure(s)[id]={body:'mercury',remaining:90};delete s.eris?.governorTracker?.reports?.[id];for(const q of Object.values(s.eris?.commandTravel?.systems||{}))q.fleet=q.fleet.filter(v=>v.officer!==id);NVSpace.notice(s.space,(id==='croxian'?'Croxian':'Malia')+' returned to Mercury, and is regrouping.');return true;}
 function step(s,dt){if(!Number.isFinite(dt)||dt<=0)return;const all=ensure(s);for(const id of IDS){const q=all[id];if(!q)continue;if(!serving(s,id)){delete all[id];continue;}q.remaining=Math.max(0,q.remaining-Math.min(dt,.1));if(!q.remaining){delete all[id];for(const row of Object.values(s.eris?.fieldCommands||{})){delete row.hp?.['field:TERRA:'+id];delete row.regroup?.['field:TERRA:'+id];}}}}
 function restore(raw){const q={};for(const id of IDS)if(Number.isFinite(raw?.[id]?.remaining)&&raw[id].remaining>0)q[id]={body:'mercury',remaining:Math.min(90,raw[id].remaining)};return q;}
 return{IDS,outcome,serving,available,roster,ensure,regrouping,retreat,step,restore};
})();
const startingImperiaRoster=NVImperiaInnerCircle.roster;NVImperiaInnerCircle.roster=s=>startingImperiaRoster(s).map(m=>{
 if(!NVImperiaGovernors.IDS.includes(m.id))return m;
 const choice=NVImperiaGovernors.outcome(s,m.id);
 return{...m,governor:NVImperiaGovernors.serving(s,m.id),rank:choice==='spare'?'FORMER CO-GRAND GENERAL':m.rank+(NVImperiaGovernors.serving(s,m.id)?' / GOVERNOR':''),status:choice==='spare'?'DEFECTED / LEFT TERRA IMPERIA':''};
});
const imperialRetreatRestore=NVEris.restore;NVEris.restore=raw=>({...imperialRetreatRestore(raw),imperiaGovernorRetreats:NVImperiaGovernors.restore(raw?.imperiaGovernorRetreats)});
const imperialRetreatTick=stepEcology;stepEcology=dt=>{imperialRetreatTick(dt);if(gameActive&&!gamePaused&&!document.hidden&&polarState)NVImperiaGovernors.step(polarState,dt);};
