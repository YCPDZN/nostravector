// Williams's recruitment and the first Catharsis survey belong to this save only.
const NVStoryModels=(()=>{
 const model={asset:'glb-story-josiah-williams',source:__WILLIAMS_STORY_GLB__,motion:'williams'};
 const byAsset=id=>id===model.asset?model:null;
 function bytes(entry){const raw=atob(entry.source),data=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)data[i]=raw.charCodeAt(i);return data.buffer;}
 return{byAsset,bytes};
})();
const NVWilliamsExpedition=(()=>{
 const MODEL='glb-story-josiah-williams',QUEST='chapter4-catharsis-investigation';
 const OFFER=[
  "I've had time to think about what I can do. I can't keep asking the dead to tell me how to live. You stayed when I needed someone, and now I wish to join your party. If you'll have me, I'd like to come with you.",
  "Archamus left me a survey record from a world the Catharsis have occupied. The colony stopped answering, but its surface beacon is still transmitting. I'll give your navigation system the coordinates. Let's investigate it together, carefully."
 ];
 const fresh=()=>({recruitedId:'',target:'',briefed:false,investigated:false});
 const validTarget=id=>{const b=NVSol.byId[id];return !!b&&!b.stellar&&!b.giant&&/^cluster-\d+$/.test(b.system)&&Number(b.system.slice(8))>18&&!NVGrekEmpire.core(b.system);};
 function restore(raw){return{recruitedId:/^custom-\d+$/.test(raw?.recruitedId)?raw.recruitedId:'',target:validTarget(raw?.target)?raw.target:'',briefed:raw?.briefed===true,investigated:raw?.investigated===true&&raw?.briefed===true&&validTarget(raw?.target)};}
 const ensure=s=>NVEris.ensure(s).williamsExpedition||(NVEris.ensure(s).williamsExpedition=fresh());
 const ready=s=>NVChapter4.raw(s)?.stage==='awake'&&NVArchamus.ensure(s).williamsHelpAccepted===true&&NVArchamus.ensure(s).williamsReactionHeard===true;
 const joined=s=>!!s?.eris?.williamsExpedition?.recruitedId;
 const member=s=>{const id=s?.eris?.williamsExpedition?.recruitedId,n=id&&NVCustomCrew.record(s,id);return n?.model?.id===MODEL?n:null;};
 const pending=s=>ready(s)&&!joined(s);
 const active=s=>ready(s)&&ensure(s).briefed&&!!ensure(s).target&&!ensure(s).investigated;
 function selectTarget(s){if(typeof NVCatharsisHistory!=='undefined'){const b=NVCatharsisHistory.world(s);if(b)return b;}const q=ensure(s);if(q.target)return NVSol.byId[q.target];const choices=NVCluster.generated.flatMap(sys=>NVCluster.bodyLists[sys.id]||[]).filter(b=>validTarget(b.id)&&!NVGovernance.protectedWorld(s,b.id)&&!NVCustomCrew.empires(s).some(n=>n.system===b.system)&&!['CUSTOM','GREK'].includes(NVEris.faction(s,b.id))&&!NVEris.faction(s,b.id).startsWith('UPLIFT_'));return choices.find(b=>/Ravaged|Scorched/.test(b.category))||choices[0]||null;}
 function recruit(s){
  if(!ready(s)||joined(s))return{ok:false,text:'Finish de-escalating Williams before inviting him aboard.'};
  const target=selectTarget(s);if(!target)return{ok:false,text:'No unclaimed survey destination is available. Free a world outside the authored systems and try again.'};
  const capacity=NVParty.capacity(s);
  if(NVParty.list(s).length+NVCustomCrew.crew(s).length>=capacity)return{ok:false,text:'Your crew is full. Make room aboard before inviting Williams to join.'};
  const result=NVCustomCrew.create(s,{name:'Josiah Williams II',model:NVGLB.metadata({type:'glb',id:MODEL,file:'Josiah Williams II.glb',height:1.92,triangles:43000,yaw:0}),species:{enabled:true,name:'Human'},alignment:'Neutral Good',bio:'Archamus’s contact from Britain. A descendant of two Cabinet Secretaries, finding a purpose alongside the Wanderer.'});
  if(!result.ok)return result;
  Object.assign(ensure(s),{recruitedId:result.npc.id,target:target.id,briefed:true,investigated:false});
  NVGovernance.setRole(s,result.npc.id,'follow');NVCombatCrew.configure(s,result.npc.id,'rifle','balanced');NVGLB.load(MODEL);NVCustomCrew.followStep(s,0);
  NVQuests.update(s);NVSpace.notice(s.space,'JOSIAH WILLIAMS II HAS JOINED YOUR PARTY / INVESTIGATE '+target.name.toUpperCase());return{ok:true,npc:result.npc};
 }
 const canInvestigate=s=>active(s)&&NVGalaxy.system(s)===NVSol.byId[ensure(s).target].system&&s.space.body===ensure(s).target&&s.space.phase==='landed'&&NVEris.groundPlay(s)&&!s.space.interior?.active&&!s.aerialView&&!s.car?.driving;
 function investigate(s){if(!canInvestigate(s))return false;ensure(s).investigated=true;NVQuests.update(s);NVSpace.notice(s.space,'SURVEY COMPLETE / CATHARSIS OCCUPATION CONFIRMED / COLONY BEACON RECORDED');return true;}
 function waypoint(s){
  if(pending(s))return NVJosiahWilliams.waypoint(s)||earthWaypoint(s);
  if(!active(s))return null;const b=NVSol.byId[ensure(s).target],p=s.space,label='Investigate Catharsis world · '+b.name;
  if(NVGalaxy.system(s)!==b.system)return ['landed','off','cockpit'].includes(p.phase)?{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label}:{galaxy:true,system:b.system,label};
  if(p.body===b.id&&p.phase==='landed')return{x:s.x,z:s.z,label:'Scan the surface · Investigate Catharsis world'};
  if(['landed','off','cockpit'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label};
  return{space:true,position:b.position,radius:b.radius,label};
 }
 function earthWaypoint(s){const p=s.space,label='Speak to Josiah Williams II · Join your party';if(NVGalaxy.system(s)!=='sol')return ['landed','off','cockpit'].includes(p.phase)?{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label}:{galaxy:true,system:'sol',label};if(p.body==='earth'&&p.phase==='landed')return{...NVJosiahWilliams.local(s),label};if(['landed','off','cockpit'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+label};const b=NVSol.byId.earth;return{space:true,position:b.position,radius:b.radius,label};}
 return{MODEL,QUEST,OFFER,fresh,restore,ensure,validTarget,ready,joined,member,pending,active,selectTarget,recruit,canInvestigate,investigate,waypoint};
})();
const williamsFollowupRestore=NVEris.restore;NVEris.restore=raw=>({...williamsFollowupRestore(raw),williamsExpedition:NVWilliamsExpedition.restore(raw?.williamsExpedition)});
const williamsFollowupQuestRestore=NVQuests.restore;NVQuests.restore=raw=>{const q=williamsFollowupQuestRestore(raw);for(const id of ['chapter4-williams-recruit',NVWilliamsExpedition.QUEST])if(raw?.completed?.includes(id)&&!q.completed.includes(id))q.completed.push(id);return q;};
NVQuests.definitions.push({id:'chapter4-williams-recruit',chapter:4,title:'A purpose of his own',description:'After de-escalating Josiah Williams II, speak to him again at his home in Britain and invite him to join your party.',available:NVWilliamsExpedition.pending,done:NVWilliamsExpedition.joined},{id:NVWilliamsExpedition.QUEST,chapter:4,title:'Investigate a Catharsis world',description:'Follow Williams’s coordinates to the marked Catharsis world. Land, leave your ship and scan the surface to investigate the silent colony beacon.',available:NVWilliamsExpedition.active,done:s=>s.eris?.williamsExpedition?.investigated===true});
const williamsFollowupPresent=NVJosiahWilliams.present;NVJosiahWilliams.present=s=>!NVWilliamsExpedition.joined(s)&&williamsFollowupPresent(s);
const williamsFollowupCanTalk=NVJosiahWilliams.canTalk;NVJosiahWilliams.canTalk=s=>!NVWilliamsExpedition.joined(s)&&williamsFollowupCanTalk(s);
const williamsFollowupSites=NVSurfaceNavigation.sites;NVSurfaceNavigation.sites=s=>williamsFollowupSites(s).filter(n=>n.id!=='josiah-williams-ii'||!NVWilliamsExpedition.joined(s));
const williamsFollowupSpeak=speakWilliams;speakWilliams=()=>{
 if(!gameActive||gamePaused||!NVJosiahWilliams.canTalk(polarState)||archiostalControlsBlocked())return false;
 if(!NVWilliamsExpedition.pending(polarState))return williamsFollowupSpeak();
 williamsConversation={world:polarState,chapter:4,phase:'enlistment',index:0,intro:false,needsChoice:false,lines:NVWilliamsExpedition.OFFER.slice()};
 polarKeys.clear();polarAutoWalk=false;pausePolar(true);$('#worldPauseSheet').hidden=true;cleanHUDRoot.hidden=true;williamsSheet.hidden=false;showWilliamsLine();renderWilliamsScene(performance.now());$('#williamsNext').focus();return true;
};williamsButton.onclick=speakWilliams;
const williamsFollowupLine=showWilliamsLine;showWilliamsLine=()=>{williamsFollowupLine();if(williamsConversation?.phase==='enlistment'&&williamsConversation.index===williamsConversation.lines.length-1)$('#williamsNext').textContent='WELCOME ABOARD / ENTER';};
const williamsFollowupNext=nextWilliams;nextWilliams=()=>{
 const q=williamsConversation;if(q?.phase!=='enlistment')return williamsFollowupNext();
 if(q.world!==polarState||!NVWilliamsExpedition.pending(q.world)){closeWilliams(false);return;}
 if(q.index+1<q.lines.length){q.index++;showWilliamsLine();return;}
 const r=NVWilliamsExpedition.recruit(q.world);if(!r.ok){$('#williamsVoiceStatus').textContent=r.text;return;}
 closeWilliams(true);rememberMenuParty();
};$('#williamsNext').onclick=nextWilliams;
const williamsFollowupWaypoint=missionWaypointTarget;missionWaypointTarget=s=>s.eris?.quests?.tracked==='vengeful-mascar'?williamsFollowupWaypoint(s):NVWilliamsExpedition.waypoint(s)||williamsFollowupWaypoint(s);

const catharsisOwner=NVEris.faction;NVEris.faction=(s,id)=>s?.eris?.williamsExpedition?.briefed&&s.eris.williamsExpedition.target===id?'CATHARSIS':catharsisOwner(s,id);
const catharsisRelation=NVDiplomacy.relation;NVDiplomacy.relation=(s,f)=>f==='CATHARSIS'?'WAR':catharsisRelation(s,f);
const catharsisName=NVDiplomacy.name;NVDiplomacy.name=(s,f)=>f==='CATHARSIS'?'CATHARSIS':catharsisName(s,f);
const catharsisLabel=factionLabel;factionLabel=f=>f==='CATHARSIS'?'FACTION: CATHARSIS':catharsisLabel(f);
const catharsisColor=planetControlColor;planetControlColor=f=>f==='CATHARSIS'?'#000000':catharsisColor(f);
const catharsisSystem=NVDiplomacy.system;NVDiplomacy.system=(s,id)=>{const q=catharsisSystem(s,id),target=s?.eris?.williamsExpedition?.target;return s?.eris?.williamsExpedition?.briefed&&NVSol.byId[target]?.system===id?{...q,status:'WAR',color:NVDiplomacy.COLORS.WAR,war:true,allied:false,factions:[...new Set([...q.factions,'CATHARSIS'])]}:q;};
const catharsisPalette=NVOccupation.palette;NVOccupation.palette=(s,f)=>f==='CATHARSIS'?[[.015,.015,.02],[.17,.17,.20]]:catharsisPalette(s,f);
function makeCatharsisBox(id,parent){const box=document.createElement('section');box.id=id;box.className='atlas-player-faction catharsis-faction';box.hidden=true;box.setAttribute('aria-label','Catharsis occupied world');box.innerHTML='<small>HOSTILE OCCUPATION</small><strong>FACTION: CATHARSIS</strong><small class="atlas-faction-count"></small>';parent.prepend(box);return box;}
const catharsisAtlas=makeCatharsisBox('atlasCatharsisFactionBox',$('#solChartDetails')),catharsisSurface=makeCatharsisBox('surfaceCatharsisFactionBox',$('.surface-atlas-grid aside'));
const catharsisStyle=document.createElement('style');catharsisStyle.textContent='#atlasCatharsisFactionBox,#surfaceCatharsisFactionBox{--atlas-faction-color:#000000;background:#000;color:#e4e4e8;border:1px solid #72727b;border-left:8px solid #000;box-shadow:inset 3px 0 #38383e}.catharsis-faction strong:before{content:"";display:inline-block;background:#000;border:1px solid #999;width:10px;height:10px;margin-right:8px}';document.head.append(catharsisStyle);
function refreshCatharsisBoxes(){const s=polarState,b=NVSol.byId[s?.eris?.williamsExpedition?.target],known=!!s?.eris?.williamsExpedition?.briefed;for(const box of [catharsisAtlas,catharsisSurface]){box.hidden=!known||!b||NVGalaxy.system(s)!==b.system||box===catharsisSurface&&s.space.body!==b.id;if(!box.hidden)box.querySelector('.atlas-faction-count').textContent=b.name.toUpperCase()+' / '+NVCluster.meta[b.system].name.toUpperCase();}}
const catharsisChart=refreshSolChart;refreshSolChart=()=>{catharsisChart();refreshCatharsisBoxes();};
const catharsisSurfaceDraw=drawSurfaceAtlas;drawSurfaceAtlas=()=>{catharsisSurfaceDraw();refreshCatharsisBoxes();};
const catharsisGalaxy=refreshGalaxy;refreshGalaxy=()=>{catharsisGalaxy();const q=polarState?.eris?.williamsExpedition,b=NVSol.byId[q?.target];if(!q?.briefed||b?.system!==galaxySelected)return;$('#galaxyFaction').textContent='FACTION: CATHARSIS / HOSTILE PRESENCE';$('#galaxyFaction').dataset.relationship='WAR';$('#galaxyFaction').style.color=NVDiplomacy.COLORS.WAR;$('#galaxyNote').textContent='Williams’s survey destination: '+b.name+'. Catharsis occupation confirmed on the atlas. Land and scan its silent colony beacon.';};
const investigateButton=document.createElement('button');investigateButton.id='investigateCatharsis';investigateButton.className='polar-button';investigateButton.textContent='SCAN CATHARSIS WORLD / T';investigateButton.hidden=true;$('#hudContextDock').append(investigateButton);
function scanCatharsis(){if(!gameActive||gamePaused||archiostalControlsBlocked()||!NVWilliamsExpedition.investigate(polarState))return false;updatePolarHUD();return true;}investigateButton.onclick=scanCatharsis;
const catharsisCandidates=hudInteractionCandidates;hudInteractionCandidates=s=>[...catharsisCandidates(s),'investigateCatharsis'];
const catharsisInput=spaceInput;spaceInput=e=>{if(e.code==='KeyT'&&!e.repeat&&!gamePaused&&!['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)&&NVWilliamsExpedition.canInvestigate(polarState)){e.preventDefault();return scanCatharsis();}return catharsisInput(e);};
const williamsFollowupHUD=updatePolarHUD;updatePolarHUD=()=>{williamsFollowupHUD();investigateButton.hidden=!gameActive||gamePaused||!polarState||!NVWilliamsExpedition.canInvestigate(polarState)||archiostalControlsBlocked();if(!gameActive||gamePaused||!polarState||polarState.eris?.quests?.tracked==='vengeful-mascar')return;if(NVWilliamsExpedition.pending(polarState)){$('#hudMissionTitle').textContent='SPEAK TO JOSIAH WILLIAMS II';$('#hudMissionText').textContent='Speak to Williams again at his home in Britain. He has had time to think about joining your party.';$('#hudMissionMeta').textContent='EARTH / EUROPE · RETURN TO WILLIAMS';}else if(NVWilliamsExpedition.active(polarState)){const b=NVSol.byId[NVWilliamsExpedition.ensure(polarState).target];$('#hudMissionTitle').textContent='INVESTIGATE A CATHARSIS WORLD';$('#hudMissionText').textContent='Travel to '+b.name+' in '+NVCluster.meta[b.system].name+'. Land, leave your ship and scan the surface beacon.';$('#hudMissionMeta').textContent='FACTION: CATHARSIS / '+b.name.toUpperCase();}};
const williamsFollowupExit=exitPolar;exitPolar=()=>{investigateButton.hidden=true;return williamsFollowupExit();};
