from pathlib import Path
p=Path(__file__).resolve().parent
# Progress writes happen only through the visible SAVE GAME control.
for name in ['antarctica_game.js','antarctica_speech.js','antarctica_vehicle.js','antarctica_hazards.js']:
    f=p/name;s=f.read_text(encoding='utf-8').replace('savePolarWorld();','')
    if name=='antarctica_game.js':
        s=s.replace('polarSaveClock=0,','').replace('polarSaveClock=0;','').replace('polarSaveClock+=dt;','').replace('if(polarSaveClock>10)','')
        s=s.replace("window.addEventListener('beforeunload',()=>{if(gameActive)});",'')
        s=s.replace("$('#saveWorld').onclick=savePolarWorld;", "$('#saveWorld').onclick=()=>savePolarWorld(true);")
        s=s.replace('function savePolarWorld(){if(!polarState||!savedGame)return;', 'function savePolarWorld(manual=false){if(manual!==true||!gameActive||!polarState||!savedGame)return;')
        s=s.replace("$('#worldPauseSheet').hidden=true;$('#polarMap').hidden=true;", "$('#worldSaveStatus').textContent='MANUAL SAVES ONLY / ESC → SAVE GAME';$('#pauseSaveStatus').textContent='Progress after your last save is lost when returning to the menu.';$('#worldPauseSheet').hidden=true;$('#polarMap').hidden=true;",1)
    if name=='antarctica_hazards.js':
        s=s.replace("$('#coldRecovery').hidden=false;", "$('#coldRecovery').hidden=false;playSuitRecovery();")
    f.write_text(s,encoding='utf-8')
f=p/'antarctica.html';s=f.read_text(encoding='utf-8').replace('AUTOSAVE ENABLED','MANUAL SAVES ONLY / ESC → SAVE GAME').replace('Your journey is saved.','Use ESC → SAVE GAME to save your journey.').replace('SAVE & RETURN TO MENU','RETURN TO MAIN MENU')
s=s.replace('Suit heat depleted. Warm up before leaving.</small></div>', 'Suit heat depleted. Warm up before leaving.</small><button id="enableSuitRecoveryVoice" class="polar-button" hidden>PLAY SUIT ALERT</button></div>')
f.write_text(s,encoding='utf-8')
f=p/'package_menu.py';s=f.read_text(encoding='utf-8').replace('==27','==28');s=s.replace("'NOSTRAVECTOR_Super_Blizzard_Preview.png']","'NOSTRAVECTOR_Super_Blizzard_Preview.png','NOSTRAVECTOR_Intense_Blizzard_Preview.png','NOSTRAVECTOR_Manual_Saves_Preview.png']");f.write_text(s,encoding='utf-8')
