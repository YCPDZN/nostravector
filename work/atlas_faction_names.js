// Atlas details and navigation markers share Diplomacy's save-local faction names.
const namedAtlasFactionLabel=factionLabel;factionLabel=f=>{
 const s=polarState,q=s?.eris?.galacticDiplomacy;
 if(!q||!q.factions[f]?.created&&!q.administration?.names?.[f])return namedAtlasFactionLabel(f);
 const parent=NVGalacticDiplomacy.overlord(s,f);
 return'FACTION: '+NVDiplomacy.name(s,f)+(parent?' / PUPPET OF '+NVDiplomacy.name(s,parent):'');
};
const namedAtlasSites=NVSurfaceNavigation.sites;NVSurfaceNavigation.sites=s=>namedAtlasSites(s).map(site=>{
 if(!site.faction||!site.id.startsWith('base:'))return site;
 return{...site,label:NVDiplomacy.name(s,site.faction)+' base · '+NVSol.byId[site.body].name};
});
