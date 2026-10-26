// Capture the normal manual-save pipeline without writing to its original slot.
function saveGameAs(sourceId,label){
 const source=characterSaves.find(s=>s.id===sourceId),name=String(label||'').trim().replace(/\s+/g,' ').slice(0,60);
 if(!source)return{ok:false,message:'This save is no longer available.'};
 if(!name)return{ok:false,message:'Enter a name for the new save.'};
 if(gameActive&&sourceId!==savedGame?.id)return{ok:false,message:'Save the current journey or return to the main menu first.'};
 let captured=source;
 if(gameActive){
  if(saveAsCapture)return{ok:false,message:'A save is already being created.'};
  const capture={save:null};saveAsCapture=capture;
  try{savePolarWorld(true);}catch(e){return{ok:false,message:'Could not capture this moment. Your original save is unchanged.'};}finally{saveAsCapture=null;}
  if(!capture.save)return{ok:false,message:'Saving is unavailable during this scene. Your original save is unchanged.'};
  captured=capture.save;
 }
 const progress=JSON.parse(JSON.stringify(captured.progress));
 // Older slots derive terrain from their ID. Preserve that seed before assigning a new ID.
 if(progress.antarctica&&!Number.isSafeInteger(progress.antarctica.seed))progress.antarctica.seed=NVAntarctica.seedFromId(captured.id);
 const now=new Date().toISOString(),copy=validCharacterSave({...captured,progress,id:characterId(),slotName:name,createdAt:now,updatedAt:now}),next=[...characterSaves,copy];
 // Commit storage first. Quota failures never replace or switch the original slot.
 try{localStorage.setItem(CHARACTER_SAVES_KEY,JSON.stringify({version:2,activeId:copy.id,saves:next}));}
 catch(e){return{ok:false,message:'Could not create an extra save. Browser storage may be full. Your original save is unchanged.'};}
 characterSaves=next;activeCharacterId=copy.id;savedGame=copy;savePersisted=true;creatingCharacter=false;savedWanderer=validProfile(copy.wanderer);
 if(!gameActive)syncMenuWanderer();
 // A new slot must not inherit a menu preview or restore cache from the source slot.
 menuLocationSession.delete(copy.id);menuPartySession.delete(copy.id);
 if(typeof galacticMenuSave!=='undefined'){galacticMenuSave=null;galacticMenuWorld=null;}
 syncSavedGameMenu();renderCharacterList();
 if(gameActive){const text='SAVED AS / '+name;$('#worldSaveStatus').textContent=text;$('#pauseSaveStatus').textContent=text;}
 return{ok:true,id:copy.id,message:'Created '+name+'. Future saves use this slot. Your original save is unchanged.'};
}
const saveAsButton=document.createElement('button');saveAsButton.id='saveWorldAs';saveAsButton.className='polar-button';saveAsButton.textContent='SAVE AS / NEW SLOT';$('#saveWorld').after(saveAsButton);
const saveAsDialog=document.createElement('dialog');saveAsDialog.id='saveAsDialog';saveAsDialog.setAttribute('aria-labelledby','saveAsTitle');saveAsDialog.innerHTML='<form id="saveAsForm"><h2 id="saveAsTitle">SAVE AS</h2><p>Create an extra save and continue in the new slot. Your original save stays unchanged.</p><label for="saveAsName">NEW SAVE NAME</label><input id="saveAsName" maxlength="60" required autocomplete="off"><p id="saveAsStatus" role="status" aria-live="polite"></p><div><button id="confirmSaveAs" class="polar-button" type="submit">CREATE EXTRA SAVE</button><button id="cancelSaveAs" class="polar-button" type="button">CANCEL</button></div></form>';document.body.append(saveAsDialog);
let saveAsSource=null;
function openSaveAs(id=savedGame?.id){const source=characterSaves.find(s=>s.id===id);if(!source)return;if(gameActive&&!gamePaused)pausePolar(true);saveAsSource=id;$('#saveAsName').value=(source.slotName||source.wanderer.name)+' / Copy';$('#saveAsStatus').textContent='';saveAsDialog.dataset.red=String(gameActive?chapter4VisualMood(polarState):chapter4MenuActive());if(!saveAsDialog.open)saveAsDialog.showModal();$('#saveAsName').focus();$('#saveAsName').select();}
saveAsButton.onclick=()=>openSaveAs();
$('#cancelSaveAs').onclick=()=>saveAsDialog.close();
saveAsDialog.addEventListener('keydown',e=>e.stopPropagation());
$('#saveAsForm').onsubmit=e=>{e.preventDefault();const result=saveGameAs(saveAsSource,$('#saveAsName').value);$('#saveAsStatus').textContent=result.message;if(!result.ok){if(gameActive)$('#pauseSaveStatus').textContent=result.message;return;}saveAsDialog.close();if(gameActive)$('#saveWorldAs').focus();else $('#characterManagementStatus').textContent=result.message;};
const saveAsMenuSync=syncSavedGameMenu;syncSavedGameMenu=()=>{saveAsMenuSync();if(savedGame?.slotName)$('#savedNotice').textContent+=( ' / '+savedGame.slotName);};
const saveAsStyle=document.createElement('style');saveAsStyle.textContent='#saveAsDialog{box-sizing:border-box;width:min(520px,calc(100vw - 28px));max-height:calc(100dvh - 28px);overflow:auto;padding:26px;background:#0c202df5;border:1px solid #6bcddd;color:#dcecf4;font:13px/1.65 Consolas}#saveAsDialog::backdrop{background:#000a}#saveAsDialog h2{margin-top:0}#saveAsDialog label{display:block}#saveAsName{box-sizing:border-box;width:100%;min-height:44px;margin:8px 0;padding:10px;background:#07141f;color:inherit;border:1px solid #6bcddd;font:inherit}#saveAsDialog button{margin:6px 8px 0 0;white-space:normal}#saveAsDialog[data-red="true"]{background:#200d19f5;border-color:#a35a69;color:#f0c8d1}#saveAsDialog[data-red="true"] input{background:#180914;border-color:#a35a69}#saveAsDialog[data-red="true"] button{background:#27121f;border-color:#a16578;color:#f0d4de}';document.head.append(saveAsStyle);
