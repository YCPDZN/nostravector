// Resolve saved faction identities through the same names used by Diplomacy.
// The base location label predates created empires and otherwise prints their IDs.
const namedFactionMenuLocation=updateMenuLocation;
updateMenuLocation=()=>{
 const body=namedFactionMenuLocation(),label=$('#menuFaction');if(!label||!savedGame)return body;
 const location=menuLocation(),world=menuFactionWorld(location),f=label.dataset.faction,q=world.eris?.galacticDiplomacy;
 if(!q?.administration?.names?.[f]&&!q?.factions?.[f]?.name)return body;
 const name=NVDiplomacy.name(world,f);
 const parent=q.subjects[f]?.overlord,overlord=parent&&!q.eliminated[parent]?NVDiplomacy.name(world,parent):'';
 label.textContent='FACTION: '+name+(overlord?' / PUPPET OF '+overlord:'');
 if(q.factions[f]?.created||q.administration?.names?.[f])label.style.color=q.factions[f]?.color||'';
 return body;
};
// Early menu setup can cache a world before the diplomacy restore adapters load.
// Rebuild it once now; subsequent menu frames still share the normal cached world.
menuFactionStateCache=null;
if(savedGame)updateMenuLocation();
