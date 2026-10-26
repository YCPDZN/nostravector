let pendingSaveChange=null;
function refreshRestartChapter(){
 const chapter=Number($('#restartChapter').value);
 $('#restartChapterDescription').textContent=CHAPTER_RESTARTS[chapter]?.description||'Choose a chapter or story checkpoint.';
 $('#restartStoryChoices').hidden=![31,30,4,41].includes(chapter);
 $('#restartCommanderChoices').hidden=chapter===31;
 $('#restartOrionFate').hidden=chapter!==41;
 const disabled=$('#restartCroxian').value!=='kill';
 $('#restartOrionKilled').disabled=disabled;if(disabled)$('#restartOrionKilled').value='no';
}
function requestSaveChange(kind,id=null){
  if(kind==='reset'&&!PROGRESS_RESET_ENABLED)return;
  if(!['reset','remove','erase-all'].includes(kind))return;
  const save=characterSaves.find(s=>s.id===id);if(kind!=='erase-all'&&!save)return;
  const name=save?.wanderer.name;
  pendingSaveChange={kind,id};$('#saveManagementError').textContent='';
  $('#chapterRestartOptions').hidden=kind!=='reset';
  if(kind==='reset'){
   const s=save.progress?.antarctica,e=s?.eris,c=e?.siegeOfSol?.restartChoices;
   $('#restartWandererName').value=name;
   $('#restartChapter').value=String(CHAPTER_RESTARTS[save.progress?.chapter]?save.progress.chapter:1);
   $('#restartOrion').value=(c?.orion??s?.friendQuest==='recruited')?'yes':'no';
   $('#restartJames').value=c?.james||e?.solWar?.brownStory?.resolution?.outcome||'spare';
   $('#restartNyrexia').value=(c?.nyrexia??e?.nyrexia?.recruited??true)?'yes':'no';
   $('#restartMalia').value=c?.malia||'spare';$('#restartCroxian').value=c?.croxian||'spare';
   $('#restartOrionKilled').value=e?.vengefulMascar?.stage==='complete'?'yes':'no';refreshRestartChapter();
  }
  const title=kind==='reset'?'RESET PROGRESS / CHAPTER SELECT':kind==='remove'?'REMOVE CHARACTER?':'ERASE ALL SAVE DATA?';
  const copy=kind==='reset'?'Restart '+name+' at a chapter or story checkpoint. Their appearance and your other saves will be kept.':kind==='remove'?'Permanently remove '+name+' and all of their saved progress? Your other Wanderers will be kept.':'Permanently erase all '+characterSaves.length+' saved '+(characterSaves.length===1?'Wanderer':'Wanderers')+', their appearances, and all progress in this browser?';
  $('#saveManagementTitle').textContent=title;$('#saveManagementCopy').textContent=copy;
  $('#confirmSaveChange').textContent=kind==='reset'?'RESET PROGRESS':kind==='remove'?'REMOVE CHARACTER':'ERASE ALL SAVE DATA';
  $('#saveManagement').showModal();$('#cancelSaveChange').focus();
}
function confirmSaveChange(){
  if(!pendingSaveChange||!['reset','remove','erase-all'].includes(pendingSaveChange.kind))return;
  const {kind,id}=pendingSaveChange;if(kind==='reset'&&!PROGRESS_RESET_ENABLED)return;
  const choices={orion:$('#restartOrion').value==='yes',james:$('#restartJames').value,nyrexia:$('#restartNyrexia').value==='yes',malia:$('#restartMalia').value,croxian:$('#restartCroxian').value,orionKilled:!$('#restartOrionKilled').disabled&&$('#restartOrionKilled').value==='yes'};
  const result=kind==='reset'?resetCharacterProgress(id,Number($('#restartChapter').value),$('#restartWandererName').value,choices):kind==='remove'?removeCharacterSave(id):eraseAllGameSaves();
  if(!result.ok){$('#saveManagementError').textContent=result.message;return;}
  renderCharacterList();$('#characterManagementStatus').textContent=result.message;$('#saveManagement').close();
  $('#characterSelectTitle').focus();
}
$('#confirmSaveChange').onclick=confirmSaveChange;
$('#restartChapter').onchange=refreshRestartChapter;$('#restartCroxian').onchange=refreshRestartChapter;
$('#eraseAllSaves').onclick=()=>requestSaveChange('erase-all');
$('#cancelSaveChange').onclick=()=>$('#saveManagement').close();
$('#saveManagement').addEventListener('close',()=>{if(!$('#saveManagement').open)pendingSaveChange=null;});
$('#manageSaves').onclick=()=>{$('#settings').close();openCharacterSelect();};
