const administrationSection=document.createElement('section');administrationSection.id='factionAdministration';administrationSection.innerHTML=`
<h3>TERRITORY &amp; SUBJECT GOVERNMENTS</h3>
<section><h4>OFFER A PLANET OR MOON</h4><p>The world and every appointed governor will join the receiving faction. You may recall those companions through Diplomacy when you are at peace.</p>
<div class="galactic-selects"><label>YOUR WORLD<select id="diplomacyGiftBody"></select></label><label>RECEIVING FACTION<select id="diplomacyGiftFaction"></select></label></div>
<p id="diplomacyGiftPreview"></p><button id="diplomacyGiftWorld" class="polar-button">GIVE WORLD AND GOVERNORS</button></section>
<section><h4>APPOINT A VASSAL FACTION LEADER</h4><p>Win a Vassalage war and defeat the faction’s capital leaders to appoint a recruited companion as its new leader. Your appointee leaves the ship to serve that faction. Replacing an appointee returns the previous one to your ship. Other overlords also appoint their own faction officers. All puppets retain their original troops, species and colours. Only you may rename factions under your control.</p>
<div class="galactic-selects"><label>CONTROLLED FACTION<select id="subjectLeaderFaction"></select></label><label>CREW MEMBER<select id="subjectLeaderCrew"></select></label></div>
<p id="subjectLeaderPreview"></p><button id="appointSubjectLeader" class="polar-button">APPOINT CREW MEMBER AS FACTION LEADER</button></section>
<section><h4>RENAME A FACTION UNDER YOUR CONTROL</h4><div class="galactic-selects"><label>CONTROLLED FACTION<select id="controlledFactionNameTarget"></select></label><label>FACTION NAME<input id="controlledFactionName" maxlength="60" autocomplete="off"></label></div><button id="renameControlledFaction" class="polar-button">RENAME FACTION</button></section>`;
crewDiplomacySection.before(administrationSection);
const administrationStyle=document.createElement('style');administrationStyle.textContent=`
#factionAdministration>section{padding:14px;margin:12px 0;border:1px solid #7896a344;background:#10212c55}
#factionAdministration h4{margin:0;font-size:11px;letter-spacing:1px}
#factionAdministration .galactic-selects{grid-template-columns:repeat(2,minmax(0,1fr));margin:12px 0}
#factionAdministration input{display:block;box-sizing:border-box;min-width:0;width:100%;padding:11px;background:#152b39;color:#e3edf2;border:1px solid #76919e;font:11px Consolas}
#factionAdministration button{white-space:normal;max-width:100%}
.faction-government{margin-top:8px;color:#bde6da!important}
#menuRenameFaction{margin-top:8px;font-size:8px;padding:8px;letter-spacing:.5px}
#menuFactionRenameForm{margin-top:8px}#menuFactionRenameForm[hidden],#menuRenameFaction[hidden]{display:none!important}
#menuFactionRenameForm input{box-sizing:border-box;width:100%;min-width:0;padding:8px;background:#102839;color:#ecf9fe;border:1px solid #91c8d155;font:10px Consolas}
#menuFactionRenameForm button{font-size:8px;padding:8px;margin:6px 5px 0 0;letter-spacing:.3px}#menuFactionRenameStatus{display:block;font:9px/1.5 Consolas;margin-top:5px}
#menuFactionRenameDialog{box-sizing:border-box;width:min(420px,calc(100vw - 32px));max-height:calc(100dvh - 40px);overflow:auto;padding:20px;background:#0b1924;border:1px solid var(--faction-colour,#91c8d1);color:#dbeaf0;font:12px/1.7 Consolas}
#menuFactionRenameDialog::backdrop{background:#020810dd}#menuFactionRenameDialog h2{font:16px Consolas;letter-spacing:1px;margin:0 0 16px}
body[data-gameplay-era=chapter4] #factionAdministration>section{background:#22142155;border-color:#a1657855}
body[data-gameplay-era=chapter4] #factionAdministration :is(select,input){background:#210f1c;color:#f2dfe8;border-color:#a1657877}
#menu[data-era=chapter4] #menuFactionRenameForm input{background:#210f1c;color:#f2dfe8;border-color:#a1657877}
#menu[data-era=chapter4] #playerFactionBox :is(#menuRenameFaction,#menuFactionRenameForm button){background:#27121fe8;border-color:#a1657877;color:#f0d4de}
#menu[data-era=chapter4] #menuFactionRenameDialog{background:#160e19;color:#f2dfe8;border-color:#a5697a}
@media(max-width:650px){#factionAdministration .galactic-selects{grid-template-columns:1fr}#factionAdministration>section{padding:10px}}
`;document.head.append(administrationStyle);
const administrationRisk=()=>!!galacticWorld&&NVGalacticDiplomacy.chapter(galacticWorld)===3&&!$('#galacticRisk').checked;
function refreshAdministrationActions(){
 const s=galacticWorld;if(!s)return;const f=$('#diplomacyGiftFaction').value,body=$('#diplomacyGiftBody').value,ids=NVFactionAdministration.governors(s,body),error=NVFactionAdministration.giftError(s,body,f),warning=administrationRisk();
 $('#diplomacyGiftPreview').textContent=error||(NVSol.byId[body].name+' → '+NVDiplomacy.name(s,f)+' / '+(ids.length?'GOVERNORS TRANSFER WITH THIS WORLD: '+ids.map(id=>NVCrewDiplomacy.member(s,id)?.name||id).join(', '):'NO APPOINTED GOVERNORS')+(NVDiplomacy.relation(s,f)==='WAR'?' / AT WAR: TRANSFERRED GOVERNORS WILL BE HOSTILE':''));$('#diplomacyGiftWorld').disabled=!!error||warning;
 const subject=$('#subjectLeaderFaction').value,member=$('#subjectLeaderCrew').value,leaderError=NVFactionAdministration.appointError(s,subject,member),world=NVFactionAdministration.leaderWorld(s,subject);
 $('#subjectLeaderPreview').textContent=leaderError||NVCrewDiplomacy.member(s,member).name+' WILL LEAD '+NVDiplomacy.name(s,subject)+' FROM '+world.name;$('#appointSubjectLeader').disabled=!!leaderError||warning;
 $('#renameControlledFaction').disabled=warning||!NVFactionAdministration.controlled(s,$('#controlledFactionNameTarget').value)||!NVFactionAdministration.clean($('#controlledFactionName').value);
}
function refreshFactionAdministration(){
 const s=galacticWorld;if(!s)return;const factions=Object.values(NVGalacticDiplomacy.register(s)).filter(f=>NVGalacticDiplomacy.visible(s,f.id)&&NVGalacticDiplomacy.alive(s,f.id)),controlled=factions.filter(f=>NVFactionAdministration.controlled(s,f.id));
 fillGalacticSelect('diplomacyGiftBody',NVGalacticDiplomacy.territory(s,'CUSTOM').filter(b=>!b.station&&!/space station/i.test(b.category||'')).map(b=>[b.id,b.name+' / '+(NVCluster.meta[b.system||'sol']?.name||b.system||'Sol')]),$('#diplomacyGiftBody').value);
 fillGalacticSelect('diplomacyGiftFaction',factions.filter(f=>NVFactionAdministration.recipient(s,f.id)).map(f=>[f.id,f.name]),$('#diplomacyGiftFaction').value);
 fillGalacticSelect('subjectLeaderFaction',controlled.filter(f=>f.id!=='CUSTOM').map(f=>[f.id,f.name]),$('#subjectLeaderFaction').value);
 fillGalacticSelect('subjectLeaderCrew',NVCrewDiplomacy.owned(s).filter(n=>!NVCrewDiplomacy.away(s,n.id)).map(n=>[n.id,n.name]),$('#subjectLeaderCrew').value);
 fillGalacticSelect('controlledFactionNameTarget',controlled.map(f=>[f.id,f.name]),$('#controlledFactionNameTarget').value);
 const target=$('#controlledFactionNameTarget').value;$('#controlledFactionName').maxLength=target==='CUSTOM'?40:60;$('#controlledFactionName').value=target?NVDiplomacy.name(s,target):'';
 refreshAdministrationActions();
 const all=Object.values(NVGalacticDiplomacy.register(s)).filter(f=>(!f.created||f.planetEmpire||!!NVCustomCrew.record(s,f.id.slice(7)))&&NVGalacticDiplomacy.visible(s,f.id));
 for(const [i,card]of [...$('#galacticFactions').children].entries()){const f=all[i];if(!f)continue;card.dataset.factionId=f.id;const id=NVFactionAdministration.leader(s,f.id);if(id){const detail=document.createElement('small');detail.className='faction-government';detail.textContent='FACTION LEADER / '+NVCrewDiplomacy.member(s,id).name;card.append(detail);}}
 for(const row of $('#foreignCrewAssignments').children){const id=row.dataset.foreignCrewId,a=NVCrewDiplomacy.ensure(s).assignments[id];if(a&&NVFactionAdministration.leader(s,a.faction)===id){row.querySelector('strong').textContent=NVCrewDiplomacy.member(s,id).name+' / FACTION LEADER';row.querySelector('button:last-child').textContent='TRACK FACTION LEADER';}}
}
function finishAdministrationAction(result){$('#galacticFeedback').textContent=result.text+(result.ok&&gameActive?' Use Save Game to keep this change.':'');if(result.ok){persistForeignCrew();refreshGalacticDiplomacy();}}
for(const id of ['diplomacyGiftBody','diplomacyGiftFaction','subjectLeaderFaction','subjectLeaderCrew'])$('#'+id).onchange=refreshAdministrationActions;
$('#controlledFactionNameTarget').onchange=()=>{const f=$('#controlledFactionNameTarget').value;$('#controlledFactionName').maxLength=f==='CUSTOM'?40:60;$('#controlledFactionName').value=f?NVDiplomacy.name(galacticWorld,f):'';refreshAdministrationActions();};$('#controlledFactionName').oninput=refreshAdministrationActions;
$('#diplomacyGiftWorld').onclick=()=>{if(!$('#diplomacyGiftWorld').disabled&&!administrationRisk())finishAdministrationAction(NVFactionAdministration.gift(galacticWorld,$('#diplomacyGiftBody').value,$('#diplomacyGiftFaction').value));};
$('#appointSubjectLeader').onclick=()=>{if(!$('#appointSubjectLeader').disabled&&!administrationRisk())finishAdministrationAction(NVFactionAdministration.appoint(galacticWorld,$('#subjectLeaderFaction').value,$('#subjectLeaderCrew').value));};
$('#renameControlledFaction').onclick=()=>{if(!$('#renameControlledFaction').disabled&&!administrationRisk())finishAdministrationAction(NVFactionAdministration.rename(galacticWorld,$('#controlledFactionNameTarget').value,$('#controlledFactionName').value));};
const administrationRefresh=refreshGalacticDiplomacy;refreshGalacticDiplomacy=()=>{administrationRefresh();refreshFactionAdministration();};
const administrationPeaceControls=refreshGalacticPeaceControls;refreshGalacticPeaceControls=()=>{administrationPeaceControls();if(galacticWorld)refreshAdministrationActions();};
// The older Carax shortcut follows the same recipient restrictions as Diplomacy.
const administrationGovernors=refreshGovernors;refreshGovernors=()=>{administrationGovernors();for(const o of [...$('#fortressRecipient').options])if(!NVFactionAdministration.recipient(polarState,o.value))o.remove();$('#fortressGive').disabled=!$('#fortressRecipient').value;};

const menuFactionRename=document.createElement('button');menuFactionRename.id='menuRenameFaction';menuFactionRename.className='polar-button';menuFactionRename.textContent='RENAME FACTION';factionBox.append(menuFactionRename);
const menuFactionRenameDialog=document.createElement('dialog');menuFactionRenameDialog.id='menuFactionRenameDialog';menuFactionRenameDialog.setAttribute('aria-labelledby','menuFactionRenameTitle');menuFactionRenameDialog.innerHTML='<h2 id="menuFactionRenameTitle">RENAME YOUR FACTION</h2>';factionBox.append(menuFactionRenameDialog);
const menuFactionRenameForm=document.createElement('form');menuFactionRenameForm.id='menuFactionRenameForm';menuFactionRenameForm.hidden=true;menuFactionRenameForm.innerHTML='<label for="menuFactionNewName">YOUR FACTION NAME</label><input id="menuFactionNewName" maxlength="40" autocomplete="off"><button class="polar-button" type="submit">SAVE FACTION NAME</button><button id="cancelMenuFactionRename" class="polar-button" type="button">CANCEL</button><small id="menuFactionRenameStatus" role="status"></small>';menuFactionRenameDialog.append(menuFactionRenameForm);
function closeMenuFactionRename(){menuFactionRenameForm.hidden=true;if(menuFactionRenameDialog.open)menuFactionRenameDialog.close();}
menuFactionRenameDialog.addEventListener('cancel',closeMenuFactionRename);
let administrationMenuSave=null;
function refreshFactionRenameButton(){const s=!gameActive&&savedGame?galacticSource():null;menuFactionRename.hidden=!s||!NVChapter3Access.allowed(s);if(administrationMenuSave!==savedGame?.id||gameActive){administrationMenuSave=savedGame?.id;closeMenuFactionRename();}if(menuFactionRename.hidden)closeMenuFactionRename();}
menuFactionRename.onclick=()=>{const s=galacticSource();if(!s||!NVChapter3Access.allowed(s))return;menuFactionRenameForm.hidden=false;$('#menuFactionNewName').value=s.eris.playerFaction.name||'';$('#menuFactionRenameStatus').textContent='';if(!menuFactionRenameDialog.open)menuFactionRenameDialog.showModal();$('#menuFactionNewName').focus();};
$('#cancelMenuFactionRename').onclick=()=>{closeMenuFactionRename();menuFactionRename.focus();};menuFactionRenameForm.addEventListener('keydown',e=>{if(e.code!=='Escape')e.stopPropagation();});
menuFactionRenameForm.onsubmit=e=>{e.preventDefault();const s=galacticSource(),result=s&&NVFactionAdministration.rename(s,'CUSTOM',$('#menuFactionNewName').value);if(!result)return;$('#menuFactionRenameStatus').textContent=result.text;if(!result.ok)return;const previous=galacticWorld;galacticWorld=s;persistGalacticMenu();galacticWorld=previous;galacticMenuWorld=s;galacticMenuSave=savedGame;closeMenuFactionRename();refreshFactionBox();updateMenuLocation();};
const administrationMenuLocation=updateMenuLocation;updateMenuLocation=()=>{const r=administrationMenuLocation();refreshFactionRenameButton();return r;};
const administrationMenuSync=syncSavedGameMenu;syncSavedGameMenu=()=>{administrationMenuSync();refreshFactionRenameButton();};
refreshFactionRenameButton();
