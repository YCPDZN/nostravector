// Keep the playtest entry point available for development, hidden while resets are disabled.
const resetProgressButton=document.createElement('button');resetProgressButton.id='resetProgress';resetProgressButton.className='menu-btn';resetProgressButton.innerHTML='<span class="num">↺</span><span>RESET PROGRESS / CHAPTER SELECT</span><span class="arrow" aria-hidden="true">↗</span>';resetProgressButton.hidden=!PROGRESS_RESET_ENABLED;if(PROGRESS_RESET_ENABLED)$('.menu-nav').append(resetProgressButton);
resetProgressButton.onclick=()=>{if(PROGRESS_RESET_ENABLED&&savedGame&&!gameActive){openCharacterSelect();requestSaveChange('reset',savedGame.id);}};
function refreshResetProgressButton(){resetProgressButton.disabled=!PROGRESS_RESET_ENABLED||!savedGame||gameActive;}
const resetProgressMenu=syncSavedGameMenu;syncSavedGameMenu=()=>{resetProgressMenu();refreshResetProgressButton();};
const resetProgressLocation=updateMenuLocation;updateMenuLocation=()=>{const b=resetProgressLocation();refreshResetProgressButton();return b;};
refreshResetProgressButton();
