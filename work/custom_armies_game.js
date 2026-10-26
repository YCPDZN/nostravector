const armyRosterRefresh=refreshCustomCrew;refreshCustomCrew=()=>{
 armyRosterRefresh();const s=customCrewWorld();
 for(const row of $('#customCrewRows').children){const n=NVCustomCrew.record(s,row.dataset.crewId);if(!n||n.model)continue;
  const label=document.createElement('label');label.className='field-label';label.textContent='FACTION SOLDIERS';const select=document.createElement('select');select.className='custom-army-choice';select.setAttribute('aria-label','Soldiers commanded by '+n.name);
  for(const [id,name]of NVCustomArmies.TYPES){const o=document.createElement('option');o.value=id;o.textContent=name;select.append(o);}select.value=NVCustomArmies.type(n);select.disabled=NVCustomArmies.locked(s,n);
  const hint=document.createElement('small');hint.textContent=select.disabled?'PUPPET STATE / ORIGINAL TROOPS RETAINED':'Your leader’s species and appearance stay the same.';
  select.onchange=()=>{const result=NVCustomArmies.set(s,n.id,select.value);if(result.ok){persistMenuCustomCrew(s);if(gameActive)rememberMenuParty();}else select.value=NVCustomArmies.type(n);$('#customCrewFeedback').textContent=result.text+(result.ok&&gameActive?' Use Save Game to keep this change.':'');};label.append(select,hint);row.append(label);
 }
};
