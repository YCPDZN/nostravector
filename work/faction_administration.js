// Territory gifts, subject governments and faction names belong to this character save.
const NVFactionAdministration=(()=>{
 const clean=(name,max=60)=>typeof name==='string'?name.trim().replace(/\s+/g,' ').slice(0,max):'';
 const ensure=s=>{const q=NVGalacticDiplomacy.ensure(s);return q.administration||(q.administration={names:{},leaders:{}});};
 const controlled=(s,f)=>f==='CUSTOM'||NVGalacticDiplomacy.alive(s,f)&&NVGalacticDiplomacy.root(s,f)==='CUSTOM';
 const recipient=(s,f)=>!!f&&!['CUSTOM','CATHARSIS','TERRA','UNCLAIMED'].includes(f)&&NVGalacticDiplomacy.visible(s,f)&&NVGalacticDiplomacy.alive(s,f);
 const governors=(s,body)=>NVGovernance.governors(NVGovernance.ensure(s).colonies[body]);
 function giftError(s,body,f){
  if(!NVGalacticDiplomacy.allowed(s))return'Diplomacy is unavailable at this checkpoint.';
  NVGalacticDiplomacy.register(s);const b=NVSol.byId[body];
  if(!b||b.stellar||b.station||/space station/i.test(b.category||'')||NVGalacticDiplomacy.owner(s,body)!=='CUSTOM')return'Choose a planet or moon owned by your faction.';
  if(!recipient(s,f))return'Choose a surviving faction other than the Catharsis or Terra Imperia.';
  if(!customCrewSystemUnlocked(s,b.system||'sol'))return'Finish Chapter 4 before transferring worlds in another galaxy.';
  if(body==='carax'&&!chapter5Unlocked(s))return'Carax can be transferred only in Chapter 5.';
  const locked=NVFrontlineCampaign.storyLock(s,body);if(locked)return locked;
  if(governors(s,body).some(id=>!NVCrewDiplomacy.member(s,id)||NVCrewDiplomacy.away(s,id)))return'Resolve this world’s unavailable governor before transferring it.';
  return'';
 }
 function post(s,id,f,body,colony=null,slot=0){
  for(const c of Object.values(NVGovernance.ensure(s).colonies))if(NVGovernance.governors(c).includes(id))NVGovernance.dismissGovernor(s,c.body,id);
  NVGovernance.ensure(s).roles[id]='ship';
  const base=colony||NVOccupation.sync(s).find(b=>b.body===body),fortress=body==='carax'&&chapter5Unlocked(s),maxHp=fortress?(slot===1?3000000:1000000):id==='khazglar'?650:id==='james'||id.startsWith('pm-')?800:id==='orion'||id==='croxian'?600:500;
  const a={id,faction:f,body,fortressSlot:fortress?slot:0,lat:base?.lat||0,lon:base?.lon||0,x:(base?.x??90)-(colony?.global?colony.landingX||0:0),z:(base?.z??-90)-(colony?.global?colony.landingZ||0:0)-12,hp:maxHp,maxHp,age:colony?.age||0,mode:'idle'};
  NVCrewDiplomacy.ensure(s).assignments[id]=a;return a;
 }
 function gift(s,body,f){
  const error=giftError(s,body,f);if(error)return{ok:false,text:error};
  const ids=governors(s,body),colony=NVGovernance.ensure(s).colonies[body],location=colony?{...colony}:null;
  if(!NVFrontlineCampaign.transfer(s,body,f))return{ok:false,text:'This world cannot be transferred now.'};
  for(const [i,id]of ids.entries()){
   // Carax's existing handover also sets its saved floor slots and boss health.
   if(!NVCrewDiplomacy.away(s,id))post(s,id,f,body,location,i+1);
  }
  if(colony){colony.governor='';colony.extraGovernors=[];colony.captured=f;colony.exposure=0;}
  const text=NVSol.byId[body].name.toUpperCase()+' GIVEN TO '+NVDiplomacy.name(s,f)+(ids.length?' / '+ids.map(id=>NVCrewDiplomacy.member(s,id).name).join(', ')+' NOW SERVE THAT FACTION':'');
  const q=NVGalacticDiplomacy.ensure(s);q.history.unshift(text);q.history=q.history.slice(0,80);NVDiplomacy.sync(s);NVSpace.notice(s.space,text);return{ok:true,text,governors:ids};
 }
 function leader(s,f){const id=ensure(s).leaders[f],a=id&&NVCrewDiplomacy.ensure(s).assignments[id];return a?.faction===f&&NVCrewDiplomacy.member(s,id)?id:'';}
 function leaderError(s,f){
  if(!NVGalacticDiplomacy.allowed(s))return'Diplomacy is unavailable at this checkpoint.';
  NVGalacticDiplomacy.register(s);const q=NVGalacticDiplomacy.ensure(s);
  if(f==='CUSTOM'||!controlled(s,f)||q.subjects[f]?.type!=='VASSALAGE')return'Win a Vassalage war to appoint a leader for a faction under your control.';
  if(!q.wars.some(w=>w.stage==='won'&&w.cb==='VASSALAGE'&&w.defender===f&&w.aggressor==='CUSTOM'))return'Win your Vassalage war against this faction first.';
  const defenders=NVFactionLeaders.DEFINITIONS.filter(d=>d.faction===f&&NVChapter3Access.chapter(s)>=d.chapter),bosses=NVFactionLeaders.ensure(s);
  if(!q.wars.some(w=>w.stage==='won'&&w.cb==='VASSALAGE'&&w.defender===f&&w.aggressor==='CUSTOM'&&w.leaderDefeated)&&defenders.some(d=>bosses[d.id]?.stage!=='defeated'))return'Defeat this faction’s capital leader'+(defenders.length>1?'s':'')+' before appointing their replacement.';
  return'';
 }
 function leaderWorld(s,f){
  const current=leader(s,f),custom=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f),capital=custom?.system?NVCustomCrew.capital(custom)?.id:({HUMAN:'earth',ERISIAN:'eris',RESISTANCE:'eris',CHOMPY:s.eris?.catharsisCoreRoute?.briefed?'aridaxx':'janira-prime',GREK:'malana-p1'})[f];
  return NVGalacticDiplomacy.territory(s,f).filter(b=>!b.station&&b.id!=='archiostal'&&customCrewSystemUnlocked(s,b.system||'sol')&&Object.values(NVCrewDiplomacy.ensure(s).assignments).filter(a=>a.body===b.id&&a.id!==current).length<NVGovernance.capacity(b.id)).sort((a,b)=>Number(b.id===capital)-Number(a.id===capital))[0];
 }
 function appointError(s,f,id){const error=leaderError(s,f);if(error)return error;const crewError=NVCrewDiplomacy.eligibility(s,id);if(crewError)return crewError;if(!leaderWorld(s,f))return'Make a governor post available in this faction before appointing its leader.';return'';}
 function appoint(s,f,id){
  const error=appointError(s,f,id);if(error)return{ok:false,text:error};const b=leaderWorld(s,f),old=leader(s,f);
  if(old){delete NVCrewDiplomacy.ensure(s).assignments[old];NVGovernance.ensure(s).roles[old]='ship';if(NVCrewDiplomacy.ensure(s).tracked===old)NVCrewDiplomacy.ensure(s).tracked='';}
  post(s,id,f,b.id,null,1);ensure(s).leaders[f]=id;const founding=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);if(founding){founding.headOfState=NVCrewDiplomacy.member(s,id).name;founding.headOfGovernment=founding.headOfState;}
  const text=NVCrewDiplomacy.member(s,id).name+' APPOINTED LEADER OF '+NVDiplomacy.name(s,f)+(old?' / PREVIOUS APPOINTEE RETURNED TO YOUR SHIP':'');
  const q=NVGalacticDiplomacy.ensure(s);q.history.unshift(text);q.history=q.history.slice(0,80);NVSpace.notice(s.space,text);return{ok:true,text};
 }
 function rename(s,f,name){
  if(!NVChapter3Access.allowed(s))return{ok:false,text:'Faction management unlocks in Chapter 3.'};NVGalacticDiplomacy.register(s);
  if(!controlled(s,f))return{ok:false,text:'You can rename only your own faction or a faction under your control.'};
  const text=clean(name,f==='CUSTOM'?40:60);if(!text)return{ok:false,text:'Enter a faction name.'};
  if(f==='CUSTOM')NVEris.nameFaction(s,text);else{ensure(s).names[f]=text;const n=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);if(n)n.factionName=text;}
  NVGalacticDiplomacy.register(s);NVDiplomacy.sync(s);return{ok:true,text:'FACTION RENAMED / '+text};
 }
 return{clean,ensure,controlled,recipient,governors,giftError,gift,post,leader,leaderError,leaderWorld,appointError,appoint,rename};
})();
const administrationName=NVDiplomacy.name;NVDiplomacy.name=(s,f)=>s?.eris?.galacticDiplomacy?.administration?.names?.[f]||administrationName(s,f);
const administrationRecall=NVCrewDiplomacy.recall;NVCrewDiplomacy.recall=(s,id,...args)=>{const result=administrationRecall(s,id,...args);if(result.ok)for(const [f,member]of Object.entries(NVFactionAdministration.ensure(s).leaders))if(member===id){delete NVFactionAdministration.ensure(s).leaders[f];const n=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);if(n){n.headOfState=n.name;n.headOfGovernment=n.name;}}return result;};
const administrationStep=NVCrewDiplomacy.step;NVCrewDiplomacy.step=(s,...args)=>{const r=administrationStep(s,...args);for(const f of Object.keys(NVFactionAdministration.ensure(s).leaders))if(!NVFactionAdministration.leader(s,f)){delete NVFactionAdministration.ensure(s).leaders[f];const n=NVCustomCrew.ensure(s).characters.find(n=>NVCustomCrew.faction(n)===f);if(n){n.headOfState=n.name;n.headOfGovernment=n.name;}}return r;};
NVFortressCampaign.give=(s,body,f)=>NVFactionAdministration.gift(s,body,f).ok;
const administrationFactionLabel=factionLabel;factionLabel=f=>{const s=gameActive?polarState:galacticSource(),q=s?.eris?.galacticDiplomacy;if(!q?.administration?.names?.[f])return administrationFactionLabel(f);const parent=NVGalacticDiplomacy.overlord(s,f);return'FACTION: '+NVDiplomacy.name(s,f)+(parent?' / PUPPET OF '+NVDiplomacy.name(s,parent):'');};
