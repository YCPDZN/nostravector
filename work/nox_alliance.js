// Upgrade existing Nox saves once; later player-directed diplomacy still works normally.
const NVNoxAlliance=(()=>{
 const ALLIES=['CUSTOM','HUMAN','ERISIAN','RESISTANCE','CHOMPY'];
 function migrate(e){if(!['war','complete'].includes(e?.siegeOfSol?.stage)||e.noxAllianceVersion===1)return;e.noxAllianceVersion=1;const w=e.solWar,q=e.galacticDiplomacy,siege=e.siegeOfSol;
  e.playerFaction.relationships.TERRAN='ALLIED';e.playerFaction.allies=[...new Set([...(e.playerFaction.allies||[]),'TERRAN'])];e.playerFaction.atWar=(e.playerFaction.atWar||[]).filter(f=>f!=='TERRAN');
  if(w){const d=w.diplomacy||(w.diplomacy={});d.terranWars=['TERRA'];d.terranAllies=[...ALLIES];for(const name of ['human','erisian','resistance','chompy']){d[name+'Wars']=(d[name+'Wars']||[]).filter(f=>f!=='TERRAN');d[name+'Allies']=[...new Set([...(d[name+'Allies']||[]),'TERRAN'])];}d.galacticRelations={...(d.galacticRelations||{})};for(const f of ALLIES)d.galacticRelations[NVGalacticDiplomacy.key('TERRAN',f)]='ALLIED';d.galacticRelations[NVGalacticDiplomacy.key('TERRAN','TERRA')]='WAR';}
  if(q){for(const f of ALLIES)q.relations[NVGalacticDiplomacy.key('TERRAN',f)]='ALLIED';q.relations[NVGalacticDiplomacy.key('TERRAN','TERRA')]='WAR';for(const war of q.wars)if(war.stage==='active'&&[war.aggressor,war.defender].includes('TERRAN')&&ALLIES.includes(war.aggressor==='TERRAN'?war.defender:war.aggressor)){war.stage='ended';war.clock=0;}}
  for(const [f,n]of Object.entries(siege.fronts||{}))if(f==='TERRAN'&&siege.owners[n?.body]!=='TERRA'||ALLIES.includes(f)&&siege.owners[n?.body]==='TERRAN')delete siege.fronts[f];
  for(const ship of siege.fleet||[]){const target=siege.fleet[ship.target];if(target&&(ship.faction==='TERRAN'&&ALLIES.includes(target.faction)||target.faction==='TERRAN'&&ALLIES.includes(ship.faction))){ship.target=-1;ship.fire=0;}if(ship.faction==='TERRAN'&&ship.hp===0&&ship.respawn===-1){ship.hp=ship.maxHp||300;ship.respawn=0;}}
 }
 return{ALLIES,migrate};
})();
const noxAllianceRestore=NVEris.restore;NVEris.restore=raw=>{const e=noxAllianceRestore(raw);e.noxAllianceVersion=raw?.noxAllianceVersion===1?1:0;NVNoxAlliance.migrate(e);return e;};
const noxAllianceEnsure=NVGalacticDiplomacy.ensure;NVGalacticDiplomacy.ensure=s=>{const q=noxAllianceEnsure(s);NVNoxAlliance.migrate(s.eris);return q;};
