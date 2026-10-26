// Rename recruited procedural Pontifices directly from the ship roster.
const pontifexNameRoster=refreshShipCrewBoard;refreshShipCrewBoard=()=>{
 pontifexNameRoster();if(!polarState)return;const q=NVCombatCrew.ensure(polarState);
 for(const [i,member]of NVParty.members.entries()){
  if(!/^pm-\d+$/.test(member.id)||!q.recruited.includes(member.id))continue;
  const record=q.pontifex.find(n=>n.id===member.id&&n.choice==='spare'),card=$('#shipCrewCards').children[i];if(!record||!card)continue;
  const form=document.createElement('form');form.className='pontifex-name-form';form.dataset.pontifexId=member.id;
  const label=document.createElement('label');label.textContent='PONTIFEX NAME';const input=document.createElement('input');input.value=record.name;input.maxLength=48;input.required=true;input.autocomplete='off';input.setAttribute('aria-label','Rename '+record.name);label.append(input);
  const button=document.createElement('button');button.className='polar-button';button.type='submit';button.textContent='RENAME PONTIFEX';
  form.onsubmit=e=>{e.preventDefault();if(!gameActive||gamePaused||!shipCrewBoardOpen||!NVCombatCrew.renamePontifex(polarState,member.id,input.value)){$('#shipCrewMessage').textContent='Enter a name for a recruited Pontifex Maximus.';return;}rememberMenuParty();refreshShipCrewBoard();refreshInteriorHUD();$('#shipCrewMessage').textContent='PONTIFEX RENAMED / '+NVCombatCrew.ensure(polarState).pontifex.find(n=>n.id===member.id).name+' · Use Save Game to keep this name.';};
  form.append(label,button);card.append(form);
 }
};
const pontifexNamesStyle=document.createElement('style');pontifexNamesStyle.textContent='.pontifex-name-form{display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin-top:12px}.pontifex-name-form label{flex:1;min-width:150px;font:10px Consolas;color:#b5cfdb}.pontifex-name-form input{display:block;box-sizing:border-box;width:100%;min-height:40px;margin-top:5px;padding:8px;color:#e5eff3;background:#07141f;border:1px solid #5c9fb888;font:13px Consolas}.pontifex-name-form button{min-height:40px;white-space:normal}';document.head.append(pontifexNamesStyle);
