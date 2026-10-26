// Relationships belong to the player, independently of faction heraldry/ownership.
const NVDiplomacy=(()=>{
 const COLORS={NEUTRAL:'#b1bfce',ALLIED:'#66e69a',WAR:'#ff626c',MIXED:'#ff626c',TURBULENT:'#ffbf69'};
 function afterDeclaration(s){return NVSolWar.active(NVSolWar.ensure(s));}
 function relation(s,f){if(f==='CUSTOM')return 'ALLIED';const root=f?.startsWith('TERRA_')?'TERRA':f;
  if(['TERRA','HUMAN','ERISIAN'].includes(root))return afterDeclaration(s)?root==='TERRA'?'WAR':'ALLIED':'NEUTRAL';
  if(root==='CHOMPY'&&NVSolWar.ensure(s).throneDeclarationApplied)return 'ALLIED';
  const custom=NVEris.ensure(s).playerFaction.relationships?.[f];return ['ALLIED','WAR'].includes(custom)?custom:'NEUTRAL';
 }
 function sync(s){const e=NVEris.ensure(s),factions=['HUMAN','ERISIAN','CHOMPY','TERRA',...Object.keys(e.playerFaction.relationships||{})];e.playerFaction.allies=[...new Set(factions.filter(f=>relation(s,f)==='ALLIED'))];e.playerFaction.atWar=[...new Set(factions.filter(f=>relation(s,f)==='WAR'))];}
 function text(status){return status==='WAR'?'AT WAR':status==='MIXED'?'AT WAR / ALLIED PRESENCE':status;}
 function name(s,f){return f==='TERRA'?'TERRA IMPERIA':f==='HUMAN'?'HUMAN FEDERATION OF SOL':f==='ERISIAN'?'ERISIAN EMPIRE':f==='CHOMPY'?(typeof NVGalaxy!=='undefined'?NVGalaxy.overlord(s):'CHOMPY EMPIRE'):NVSolWar.label(NVSolWar.ensure(s),f);}
 function system(s,id){const worlds=id==='sol'?NVSol.worlds:id==='janira-proxima'&&typeof NVGalaxy!=='undefined'?[NVGalaxy.prime,NVGalaxy.moon]:typeof NVCluster!=='undefined'?NVCluster.bodyLists[id]||[]:[];
  const factions=[...new Set(worlds.map(b=>NVEris.faction(s,b.id)).filter(f=>f!=='UNCLAIMED'&&f!=='CUSTOM'))],statuses=factions.map(f=>NVDiplomacy.relation(s,f)),war=statuses.includes('WAR'),allied=statuses.includes('ALLIED');
  const status=id==='sol'&&NVSolWar.ensure(s).throneDeclarationApplied?'WAR':id==='sol'&&afterDeclaration(s)?'TURBULENT':war&&allied?'MIXED':war?'WAR':allied?'ALLIED':'NEUTRAL';return{status,color:COLORS[status],factions,war,allied};
 }
 const previousRestore=NVEris.restore;NVEris.restore=raw=>{const e=previousRestore(raw);e.playerFaction.relationships={};for(const [f,status]of Object.entries(raw?.playerFaction?.relationships||{}))if(f.length<100&&['ALLIED','WAR','NEUTRAL'].includes(status))e.playerFaction.relationships[f]=status;sync({eris:e});return e;};
 const declaration=NVSolWar.advance;NVSolWar.advance=s=>{const result=declaration(s);sync(s);return result;};
 return{COLORS,sync,afterDeclaration,relation,text,name,system};
})();
