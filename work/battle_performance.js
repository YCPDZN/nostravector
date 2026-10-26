// Small allied escorts; the Janira blockade is the only retained hostile fleet.
var NVBattlePerformance=(()=>{
 const allowed=new Set(['HUMAN','CHOMPY','RESISTANCE','ERISIAN','TERRAN']);
 const active=s=>s?.space?.system==='janira-proxima'&&NVJaniraBlockade.active(s)||(s?.space?.system||'sol')==='sol'&&NVSiegeOfSol.raw(s)?.stage==='war';
 function ships(s,base){
  let list;if(NVMercuryFinale.active(s))list=NVMercuryFinale.ships(s);else if(NVGalaxy.system(s)==='janira-proxima'&&(NVJaniraArmada.active(s)||NVJaniraBlockade.active(s)))list=[...NVJaniraArmada.ships(s),...NVJaniraBlockade.fleet(s)];else list=base(s);
  const counts={},out=[];for(const v of list){if(v.mascarRampage||v.blockade){out.push(v);continue;}if(!allowed.has(v.faction)||(counts[v.faction]||0)>=4)continue;counts[v.faction]=(counts[v.faction]||0)+1;out.push(v);}
  if(NVMascarRampage.local(s)&&!out.some(v=>v.mascarRampage))out.push(NVMascarRampage.vessel(s));return out;
 }
 return{active,ships};
})();
const leanBattleShips=NVSolWar.ships;NVSolWar.ships=s=>NVBattlePerformance.ships(s,leanBattleShips);
const leanCampaignStep=NVSiegeOfSol.step,leanCampaignClocks=new WeakMap();NVSiegeOfSol.step=(s,dt)=>{if(!Number.isFinite(dt)||dt<=0)return[];const clock=(leanCampaignClocks.get(s)||0)+Math.min(.2,dt);if(clock<.199999){leanCampaignClocks.set(s,clock);return[];}leanCampaignClocks.set(s,clock-.2);return leanCampaignStep(s,.2);};
