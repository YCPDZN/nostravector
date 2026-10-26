const menuLocationSession=new Map();
let menuFactionStateCache=null;
function menuFactionWorld(location){
 const progress=savedGame?.progress,source=progress?.antarctica||{},body=location.body,chapter=Number(progress?.chapter)||0;
 const old=menuFactionStateCache;
 if(old&&old.progress===progress&&old.eris===location.eris&&old.body===body.id&&old.phase===location.phase&&old.chapter===chapter)return old.world;
 const space={...source.space,body:body.id,phase:location.phase,system:body.system||'sol'};
 // A legacy chapter tag must not demote a saved space journey to Chapter 1.
 const inferred=body.id!=='earth'||space.phase&&space.phase!=='off'?3:location.africa?2:1;
 const world={...source,featureChapter:Math.max(chapter,inferred),space,eris:NVEris.restore(location.eris)};
 menuFactionStateCache={progress,eris:location.eris,body:body.id,phase:location.phase,chapter,world};return world;
}
function rememberMenuLocation(){if(savedGame&&polarState)menuLocationSession.set(savedGame.id,{progress:savedGame.progress,body:polarState.space?.body||'earth',phase:polarState.space?.phase||'off',geo:polarState.space?.geo?{...polarState.space.geo}:null,ocean:!!polarState.space?.ecologyOcean,africa:!!polarState.africaStarted,eris:typeof NVEris!=='undefined'?NVEris.snapshot(polarState):null});}
function menuLocation(){
  if(!savedGame)return{body:NVSol.byId.earth,phase:'off',africa:false};
  let s=menuLocationSession.get(savedGame.id);if(s&&s.progress!==savedGame.progress){menuLocationSession.delete(savedGame.id);s=null;}
  const saved=savedGame.progress?.antarctica,location=s||{body:saved?.space?.body||'earth',phase:saved?.space?.phase||'off',geo:saved?.space?.geo||null,ocean:!!saved?.space?.ecologyOcean,africa:!!saved?.africaStarted,eris:saved?.eris||null};return{...location,body:NVSol.byId[location.body]||NVSol.byId.earth};
}
function updateMenuLocation(){const l=menuLocation(),b=l.body,p=NVLandscapes.profile(b.id),global=!!l.geo?.global,region=global&&b.id==='earth'?NVWorldFlight.earthRegion(l.geo.lat,l.geo.lon).name.toUpperCase():p.title;$('#menu').dataset.location=b.id;$('.earth-label').setAttribute('aria-label',b.name+' current location');$('.earth-label h2').textContent=b.name.toUpperCase();$('.earth-label .label').textContent='CURRENT LOCATION / SOL';$('.earth-label p').firstChild.textContent=(l.ocean?'UNDER-ICE OCEAN / ':l.phase==='atmosphere'?'ATMOSPHERIC FLIGHT / ':l.phase==='flight'?'IN ORBIT / ':l.phase==='off'&&b.id==='earth'?(l.africa?'AFRICA / ':'ANTARCTICA / '):b.giant?'CLOUD PLATFORM / ':'SURFACE / ');$('#region').textContent=global?region+' / '+l.geo.lat.toFixed(2)+'°, '+l.geo.lon.toFixed(2)+'°':b.id==='earth'?(l.africa?'AFRICAN DUNE SEA':'ANTARCTIC FRONTIER'):p.title;$('.earth-label .latitude').textContent=b.category.toUpperCase();$('.earth-marker').textContent=b.name.toUpperCase()+' / LIVE ROTATION';$('#scene').setAttribute('aria-label','Rotating '+b.name+' and '+('the Wanderer'+(menuCompanions().length?' with '+menuCompanions().map(q=>q.name).join(', '):''))+'. Drag to rotate characters.');return b;}
