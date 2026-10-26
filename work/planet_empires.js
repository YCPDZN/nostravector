// A governor can found a subject state on one owned world, without claiming its neighbours.
const NVPlanetEmpires=(()=>{
 const ensure=s=>{const a=NVFactionAdministration.ensure(s);return a.planetEmpires||(a.planetEmpires={});};
 const record=(s,f)=>s?.eris?.galacticDiplomacy?.administration?.planetEmpires?.[f];
 function error(s,body){
  if(!s||!NVGalacticDiplomacy.allowed(s))return'Planet empires unlock with Diplomacy.';
  const b=NVSol.byId[body],c=NVGovernance.ensure(s).colonies[body];
  if(!b||b.stellar||b.station||/space station/i.test(b.category||''))return'Choose an owned planet or moon.';
  if(!customCrewSystemUnlocked(s,b.system||'sol'))return'Complete Chapter 4 before founding an empire in another galaxy.';
  if(body==='carax'&&!chapter5Unlocked(s))return'Carax can become a puppet empire only in Chapter 5.';
  const owner=NVEris.faction(s,body);
  if(owner?.startsWith('PLANET_')&&NVGalacticDiplomacy.root(s,owner)==='CUSTOM')return'This world already belongs to your puppet '+NVDiplomacy.name(s,owner)+'. Manage its empire through Diplomacy.';
  if(owner!=='CUSTOM'||!c||c.captured)return'This world must belong to your faction.';
  const lock=NVFrontlineCampaign.storyLock(s,body);if(lock)return lock;
  const ids=NVGovernance.governors(c);if(!ids.length)return'Appoint a governor on this world first.';
  for(const id of ids){const reason=NVCrewDiplomacy.eligibility(s,id);if(reason)return reason;}
  return'';
 }
 function declare(s,body,name){
  const reason=error(s,body);if(reason)return{ok:false,text:reason};
  const title=NVFactionAdministration.clean(name);if(!title)return{ok:false,text:'Enter a name for the new empire.'};
  const q=NVGalacticDiplomacy.ensure(s);NVGalacticDiplomacy.register(s);
  if(Object.values(q.factions).some(f=>NVGalacticDiplomacy.alive(s,f.id)&&NVDiplomacy.name(s,f.id).toLowerCase()===title.toLowerCase()))return{ok:false,text:'Another surviving faction already uses that name.'};
  const c=NVGovernance.ensure(s).colonies[body],ids=NVGovernance.governors(c),leader=ids[0],b=NVSol.byId[body];
  let f;do{f='PLANET_'+q.next++;}while(q.factions[f]);
  // Register before the normal territory handover, so all fortress and posting rules apply.
  const color=NVGovernance.ensure(s).color;
  q.factions[f]={id:f,name:title,species:'Human',created:true,planetEmpire:true,color};
  const result=NVFactionAdministration.gift(s,body,f);
  if(!result.ok){delete q.factions[f];return result;}
  ensure(s)[f]={body,founder:leader,color};
  q.administration.names[f]=title;q.administration.leaders[f]=leader;
  q.subjects[f]={overlord:'CUSTOM',type:'VASSALAGE',lastDay:Math.floor(q.clock/NVGalacticDiplomacy.DAY)};
  q.relations[NVGalacticDiplomacy.key('CUSTOM',f)]='ALLIED';
  s.eris.playerFaction.relationships[f]='ALLIED';
  const text=title+' FOUNDED ON '+b.name.toUpperCase()+' / LED BY '+NVCrewDiplomacy.member(s,leader).name+' / PUPPET OF '+NVDiplomacy.name(s,'CUSTOM');
  q.history.unshift(text);q.history=q.history.slice(0,80);NVDiplomacy.sync(s);NVUpliftMap.invalidate();NVSpace.notice(s.space,text);
  return{ok:true,text,faction:f,body,leader};
 }
 function mapEmpires(s){return Object.entries(ensure(s)).filter(([f])=>NVGalacticDiplomacy.alive(s,f)).map(([id,r])=>{const name=NVCrewDiplomacy.member(s,NVFactionAdministration.leader(s,id)||r.founder)?.name||'Governor';return{id,n:{name,headOfState:name,headOfGovernment:name,species:{name:NVGalacticDiplomacy.ensure(s).factions[id].species}},home:NVSol.byId[r.body].system||'sol',capitalBody:r.body};});}
 return{ensure,record,error,declare,mapEmpires};
})();
const planetEmpireRestore=NVGalacticDiplomacy.restore;NVGalacticDiplomacy.restore=raw=>{
 const q=planetEmpireRestore(raw);q.administration.planetEmpires={};
 for(const [f,r]of Object.entries(raw?.administration?.planetEmpires||{}))if(/^PLANET_\d+$/.test(f)&&q.factions[f]&&NVSol.byId[r?.body]&&!NVSol.byId[r.body].stellar&&typeof r.founder==='string'){
  q.factions[f].planetEmpire=true;q.factions[f].created=true;
  q.administration.planetEmpires[f]={body:r.body,founder:r.founder.slice(0,100),color:/^#[0-9a-f]{6}$/i.test(r.color)?r.color:q.factions[f].color};
 }
 return q;
};
const planetEmpireWorldRestore=NVEris.restore;NVEris.restore=raw=>{
 const e=planetEmpireWorldRestore(raw),q=e.galacticDiplomacy;
 for(const c of Object.values(e.governance?.colonies||{}))if(q?.owners[c.body]?.startsWith('PLANET_'))c.captured=q.owners[c.body];
 return e;
};

const planetEmpireForm=document.createElement('section');planetEmpireForm.id='planetEmpireForm';
planetEmpireForm.innerHTML='<h3>FOUND A PLANET EMPIRE</h3><p>The selected planet or moon becomes a separate empire led by its governor. It remains your puppet. Its other governors stay there, and neighbouring worlds keep their current owners.</p><label for="planetEmpireName">NEW EMPIRE NAME</label><input id="planetEmpireName" maxlength="60" autocomplete="off"><p id="planetEmpirePreview"></p><button id="declarePlanetIndependence" class="polar-button" type="button">DECLARE INDEPENDENCE</button>';
$('#governorMembers').before(planetEmpireForm);
let planetEmpireSelected='';
function refreshPlanetEmpire(){
 const s=polarState,body=$('#governorWorld').value,c=s&&NVGovernance.ensure(s).colonies[body],b=NVSol.byId[body],input=$('#planetEmpireName');
 planetEmpireForm.hidden=!s||!NVChapter3Access.allowed(s);if(planetEmpireForm.hidden)return;
 if(planetEmpireSelected!==body){planetEmpireSelected=body;input.value=b?b.name+' EMPIRE':'';}
 const owner=b&&NVEris.faction(s,body);
 if(owner?.startsWith('PLANET_')&&NVGalacticDiplomacy.root(s,owner)==='CUSTOM'){
  const leader=NVFactionAdministration.leader(s,owner);
  $('#governorWorldStatus').textContent=NVDiplomacy.name(s,owner)+' / PUPPET OF '+NVDiplomacy.name(s,'CUSTOM')+(leader?' / LED BY '+NVCrewDiplomacy.member(s,leader).name:'');
 }
 const reason=NVPlanetEmpires.error(s,body);$('#planetEmpirePreview').textContent=reason||(NVCrewDiplomacy.member(s,c.governor).name+' WILL LEAD '+b.name+' / PUPPET OF '+NVDiplomacy.name(s,'CUSTOM'));
 $('#declarePlanetIndependence').disabled=!!reason||!NVFactionAdministration.clean(input.value);input.disabled=!!reason;
}
const planetEmpireGovernors=refreshGovernors;refreshGovernors=()=>{planetEmpireGovernors();refreshPlanetEmpire();};
$('#governorWorld').addEventListener('change',refreshPlanetEmpire);$('#planetEmpireName').oninput=refreshPlanetEmpire;
$('#declarePlanetIndependence').onclick=()=>{
 if(!gameActive||!governorPanelOpen||$('#declarePlanetIndependence').disabled)return;
 const r=NVPlanetEmpires.declare(polarState,$('#governorWorld').value,$('#planetEmpireName').value);
 $('#governorMessage').textContent=r.text+(r.ok?' Use Save Game to keep this empire.':'');
 if(r.ok){refreshGovernors();if(NVShipInterior.active(polarState))refreshInteriorHUD();updatePolarHUD();}
};
const planetEmpireStyle=document.createElement('style');planetEmpireStyle.textContent='#planetEmpireForm{padding:14px;margin:12px 0;border:1px solid #65899a66;background:#10212c55}#planetEmpireForm[hidden]{display:none}#planetEmpireForm h3{font:12px Consolas;letter-spacing:1px}#planetEmpireForm input{box-sizing:border-box;width:100%;padding:11px;background:#122d3e;color:#e3eef6;border:1px solid #507288;font:12px Consolas}#planetEmpireForm button{min-height:44px}body[data-gameplay-era=chapter4] #planetEmpireForm{background:#22142155;border-color:#a1657855}body[data-gameplay-era=chapter4] #planetEmpireForm input{background:#210f1c;color:#f2dfe8;border-color:#a1657877}';document.head.append(planetEmpireStyle);

// Preserve the parent's infantry and colours after founding, including on reload.
const planetArmyCache=new Map(),planetArmyModel=NVArmyModels.model;
NVArmyModels.model=f=>{
 const s=typeof polarState!=='undefined'?polarState:null,r=NVPlanetEmpires.record(s,f);if(!r)return planetArmyModel(f);
 const key=f+':'+r.color;if(planetArmyCache.has(key))return planetArmyCache.get(key);
 const base=planetArmyModel('HUMAN'),rgb=[1,3,5].map(i=>parseInt(r.color.slice(i,i+2),16)/255);
 const model={...base,name:'Planet empire infantry',meshes:base.meshes.map(p=>({...p,color:p.color[2]>p.color[0]*1.25?rgb:p.color}))};planetArmyCache.set(key,model);return model;
};
const planetArmyParts=NVArmyModels.parts;NVArmyModels.parts=(f,distant=false)=>{
 const model=f?.startsWith('PLANET_')&&NVArmyModels.model(f);return model?model.meshes.filter(p=>!distant||!/finger|knuckle|buckle|cable|pouch/i.test(p.name)).map(p=>({...p,p:p.p.flat(),n:p.n.flat(),f:p.f||p.indices,indices:p.f||p.indices})):planetArmyParts(f,distant);
};
const planetEmpirePalette=NVOccupation.palette;NVOccupation.palette=(s,f)=>{const r=NVPlanetEmpires.record(s,f);return r?[[1,3,5].map(i=>parseInt(r.color.slice(i,i+2),16)/255),[.8,.88,.92]]:planetEmpirePalette(s,f);};

const planetEmpireControlColor=planetControlColor;planetControlColor=f=>NVPlanetEmpires.record(polarState,f)?.color||planetEmpireControlColor(f);
