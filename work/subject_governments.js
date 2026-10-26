// Puppet governments change their leadership, never their native army or identity.
const NVSubjectGovernments=(()=>{
 const hash=text=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
 function ensure(s){const a=NVFactionAdministration.ensure(s);a.officers||={};a.appointments||={};return a;}
 function officer(s,id){
  const row=s?.eris?.galacticDiplomacy?.administration?.officers?.[id];if(!row)return null;
  const founder=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===row.homeFaction),f=NVGalacticDiplomacy.ensure(s).factions[row.homeFaction];
  const base=({HUMAN:'human',ERISIAN:'erisian',RESISTANCE:'erisian',CHOMPY:'chompy',GREK:'grek',TERRA:'human',TERRAN:'human',CHIMAERA_SCOURGE:'reptillian2'})[row.homeFaction]||'reptilian';
  return{id,name:row.name,status:'officer',nativeOfficer:true,alignment:'Lawful Neutral',species:founder?NVSpecies.valid({...founder.species}):NVSpecies.preset(base),suit:f?.color||'#405474',trim:'#202532',accent:'#b2c5cc',weapon:'laser'};
 }
 function returnOfficer(s,f){
  const a=ensure(s),r=a.appointments[f];if(!r)return;const posts=NVCrewDiplomacy.ensure(s).assignments,post=posts[r.id];
  if(post?.faction===f){
   if(r.native)delete posts[r.id];
   else{const home=NVGalacticDiplomacy.territory(s,r.overlord).find(b=>b.id===r.homeBody)||NVCrewDiplomacy.worlds(s,r.overlord)[0];if(home)Object.assign(post,{faction:r.overlord,body:home.id,lat:0,lon:0,x:90,z:-122});else{delete posts[r.id];NVGovernance.ensure(s).roles[r.id]='ship';}}
  }
  if(a.leaders[f]===r.id)delete a.leaders[f];delete a.appointments[f];
  const founder=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);
  if(founder&&founder.headOfState===r.name){founder.headOfState=r.headOfState||founder.name;founder.headOfGovernment=r.headOfGovernment||founder.name;}
 }
 function appoint(s,overlord,f,id=''){
  const q=NVGalacticDiplomacy.ensure(s),a=ensure(s),t=q.subjects[f];
  if(!NVGalacticDiplomacy.allowed(s)||overlord==='CUSTOM'||!t||t.overlord!==overlord||!['VASSALAGE','TRIBUTARIES'].includes(t.type)||!NVGalacticDiplomacy.alive(s,overlord)||!NVGalacticDiplomacy.alive(s,f))return{ok:false,text:'Only this puppet’s current overlord may appoint its own officer.'};
  if(a.appointments[f]?.overlord===overlord)return{ok:false,text:'This puppet already has an appointed government.'};
  const world=NVFactionAdministration.leaderWorld(s,f);if(!world)return{ok:false,text:'No governor post is available in the puppet state.'};
  const posts=NVCrewDiplomacy.ensure(s).assignments,used=new Set(Object.values(a.leaders));
  const candidates=Object.values(posts).filter(p=>p.faction===overlord&&p.hp>0&&!used.has(p.id)&&NVCrewDiplomacy.owned(s).some(n=>n.id===p.id));
  const candidate=id?candidates.find(p=>p.id===id):candidates.sort((x,y)=>x.id.localeCompare(y.id))[0];
  if(id&&!candidate)return{ok:false,text:'Choose an officer currently serving the overlord’s own faction.'};
  returnOfficer(s,f);
  const incumbent=a.leaders[f];if(incumbent&&posts[incumbent]){delete posts[incumbent];NVGovernance.ensure(s).roles[incumbent]='ship';}delete a.leaders[f];
  const native=!candidate,memberId=candidate?.id||'custom-officer-'+hash(s.seed+':'+overlord+':'+f).toString(16);
  if(native){const first=['Aren','Vela','Korin','Sera','Tarek','Neris','Rovan','Ilyra'],last=['Voss','Keral','Sen','Rath','Talin','Var'],n=hash(s.seed+':officer:'+overlord+':'+f);a.officers[memberId]||={id:memberId,homeFaction:overlord,name:first[n%first.length]+' '+last[(n>>>8)%last.length]};}
  const name=NVCrewDiplomacy.member(s,memberId).name,founder=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);
  const r={id:memberId,overlord,native,name,homeBody:candidate?.body||'',defeated:false,headOfState:founder?.headOfState||'',headOfGovernment:founder?.headOfGovernment||''};
  // Move only the officer. Subject ownership, names, colours, species and guards stay intact.
  if(candidate)Object.assign(candidate,{faction:f,body:world.id,lat:0,lon:0,x:90,z:-102});
  else NVFactionAdministration.post(s,memberId,f,world.id,null,1);
  a.leaders[f]=memberId;a.appointments[f]=r;if(founder){founder.headOfState=name;founder.headOfGovernment=name;}
  const text=name+' APPOINTED TO LEAD '+NVDiplomacy.name(s,f)+' BY '+NVDiplomacy.name(s,overlord)+' / NATIVE TROOPS RETAINED';q.history.unshift(text);q.history=q.history.slice(0,80);return{ok:true,text,id:memberId};
 }
 function sync(s){
  const q=NVGalacticDiplomacy.ensure(s),a=ensure(s);if(!NVGalacticDiplomacy.allowed(s))return;
  for(const [f,r]of Object.entries(a.appointments))if(q.subjects[f]?.overlord!==r.overlord||!NVGalacticDiplomacy.alive(s,f)||!NVGalacticDiplomacy.alive(s,r.overlord))returnOfficer(s,f);
  for(const [f,t]of Object.entries(q.subjects))if(!(f==='CATHARSIS'&&typeof NVCatharsisHistory!=='undefined'&&NVCatharsisHistory.early(s))&&t.overlord!=='CUSTOM'&&!a.appointments[f]&&['VASSALAGE','TRIBUTARIES'].includes(t.type))appoint(s,t.overlord,f);
 }
 function defeat(s,id){const a=ensure(s),entry=Object.entries(a.appointments).find(([,r])=>r.id===id);if(!entry)return{ok:false,text:'Officer not found.'};const [f,r]=entry;r.defeated=true;delete NVCrewDiplomacy.ensure(s).assignments[id];if(a.leaders[f]===id)delete a.leaders[f];const founder=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);if(founder&&founder.headOfState===r.name){founder.headOfState=r.headOfState||founder.name;founder.headOfGovernment=r.headOfGovernment||founder.name;}return{ok:true,text:r.name+' DEFEATED / PUPPET GOVERNMENT VACANT'};}
 const replaceTroops=()=>({ok:false,text:'Puppet states retain their own troops. Neither the player nor another overlord may replace them.'});
 const rename=(s,actor,f,name)=>actor==='CUSTOM'?NVFactionAdministration.rename(s,f,name):{ok:false,text:'Other factions cannot rename puppet states.'};
 return{ensure,officer,appoint,sync,defeat,returnOfficer,replaceTroops,rename};
})();

// Save only officer identities and postings; species models are derived from their home faction.
const subjectGovernmentRestore=NVGalacticDiplomacy.restore;NVGalacticDiplomacy.restore=raw=>{
 const q=subjectGovernmentRestore(raw),a=q.administration;a.officers={};a.appointments={};
 for(const [id,r]of Object.entries(raw?.administration?.officers||{}))if(/^custom-officer-[0-9a-f]+$/.test(id)&&q.factions[r?.homeFaction]&&typeof r.name==='string')a.officers[id]={id,homeFaction:r.homeFaction,name:r.name.slice(0,40)};
 for(const [f,r]of Object.entries(raw?.administration?.appointments||{}))if(q.factions[f]&&q.factions[r?.overlord]&&q.subjects[f]?.overlord===r.overlord&&typeof r.id==='string'&&r.id.length<=100&&(!r.native||a.officers[r.id]))a.appointments[f]={id:r.id,overlord:r.overlord,native:r.native===true,name:String(r.name||'Officer').slice(0,40),homeBody:NVSol.byId[r.homeBody]?r.homeBody:'',defeated:r.defeated===true,headOfState:String(r.headOfState||'').slice(0,40),headOfGovernment:String(r.headOfGovernment||'').slice(0,40)};
 return q;
};
const subjectGovernmentCapture=NVGalacticDiplomacy.capture;NVGalacticDiplomacy.capture=(s,...args)=>{const r=subjectGovernmentCapture(s,...args);NVSubjectGovernments.sync(s);return r;};
const subjectGovernmentSettle=NVGalacticDiplomacy.settle;NVGalacticDiplomacy.settle=(s,...args)=>{const r=subjectGovernmentSettle(s,...args);NVSubjectGovernments.sync(s);return r;};
const subjectGovernmentAdvance=NVGalacticDiplomacy.advance;const subjectGovernmentClocks=new WeakMap();NVGalacticDiplomacy.advance=(s,...args)=>{const r=subjectGovernmentAdvance(s,...args),clock=NVGalacticDiplomacy.ensure(s).clock,last=subjectGovernmentClocks.get(s);if(last===undefined||clock<last||clock-last>=5){subjectGovernmentClocks.set(s,clock);NVSubjectGovernments.sync(s);}return r;};
const subjectGovernmentRefresh=refreshGalacticDiplomacy;refreshGalacticDiplomacy=()=>{if(galacticWorld)NVSubjectGovernments.sync(galacticWorld);subjectGovernmentRefresh();};
const subjectGovernmentCards=refreshFactionAdministration;refreshFactionAdministration=()=>{subjectGovernmentCards();const s=galacticWorld;if(!s)return;for(const card of $('#galacticFactions').children){const f=card.dataset.factionId,r=NVSubjectGovernments.ensure(s).appointments[f];if(!r)continue;const text=document.createElement('small');text.className='faction-government';text.textContent=(r.defeated?'APPOINTED GOVERNOR DEFEATED':!NVFactionAdministration.leader(s,f)?'PUPPET GOVERNOR POST VACANT':r.name+' / APPOINTED BY '+NVDiplomacy.name(s,r.overlord))+' / ORIGINAL TROOPS RETAINED';card.append(text);}};
