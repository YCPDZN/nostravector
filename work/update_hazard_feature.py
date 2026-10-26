from pathlib import Path
root=Path(__file__).resolve().parent
def edit(name,pairs):
    p=root/name;s=p.read_text(encoding='utf-8')
    for old,new in pairs:
        assert old in s,(name,old[:80]);s=s.replace(old,new)
    p.write_text(s,encoding='utf-8')
edit('antarctica_speech.js',[
("jamesVoiceKind==='talk'?JAMES_QUOTES[jamesVoiceIndex]:JAMES_CAR_QUOTE", "jamesVoiceKind==='talk'?JAMES_QUOTES[jamesVoiceIndex]:jamesVoiceKind==='station'?JAMES_STATION_QUOTES[jamesVoiceIndex-6]:JAMES_CAR_QUOTE"),
("}else if(jamesConversation.active&&jamesConversation.kind!=='travel'&&!jamesConversation.speechDone)","}else if(jamesConversation.active&&jamesVoiceError&&!jamesConversation.speechDone)"),
('function showJamesConversationLine(){','function showJamesConversationLine(time=0){'),
("$('#nextConversation').textContent=jamesConversation.index===conversationLines().length-1?'RETURN TO EXPEDITION / ENTER':'NEXT / ENTER';", "$('#nextConversation').textContent=jamesConversation.index===conversationLines().length-1?(jamesConversation.kind==='station'?'CONTINUE / ENTER':'RETURN TO EXPEDITION / ENTER'):'NEXT / ENTER';"),
("polarState.car?.driving)return;\n  stopJamesVoice();", "polarState.car?.driving||hazardModalActive())return;\n  stopJamesVoice();"),
("$('#jamesConversation').hidden=false;$('#stationMessage').hidden=true;showJamesConversationLine();", "$('#jamesConversation').hidden=false;$('#stationMessage').hidden=true;showJamesConversationLine(kind==='station'?polarState.jamesStationVoiceTime:0);"),
("polarState.stationDialogueIndex=9;}","polarState.stationDialogueIndex=9;polarState.jamesStationVoiceTime=0;}"),
("polarCanvas.focus();savePolarWorld();updatePolarHUD();\n}", "polarCanvas.focus();savePolarWorld();updatePolarHUD();if(jamesConversation.kind==='station')beginHazardTutorial();\n}"),
("stopJamesVoice();if(jamesConversation.index>=", "stopJamesVoice();if(jamesConversation.kind==='station')polarState.jamesStationVoiceTime=0;if(jamesConversation.index>="),
("if(q.kind==='travel'){if(currentJamesVoice()?.ended)q.speechDone=true;}\n  else if(!(jamesSystemVoice&&window.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined')&&q.clock>=conversationDuration(conversationLines()[q.index]))q.speechDone=true;", "captureJamesVoice();if(currentJamesVoice()?.ended||(jamesVoiceError&&q.clock>=conversationDuration(conversationLines()[q.index])))q.speechDone=true;"),
("gamePaused||jamesConversation.active||polarState.car?.driving||Math.hypot", "gamePaused||jamesConversation.active||hazardModalActive()||polarState.car?.driving||Math.hypot")])
p=root/'antarctica_speech.js';s=p.read_text(encoding='utf-8');start=s.index("  $('#systemJamesVoice').hidden=");end=s.index('\n}\nfunction beginJamesConversation',start)
s=s[:start]+"  $('#systemJamesVoice').hidden=true;$('#conversationVoiceLabel').textContent='RECORDED VOICE / '+(jamesConversation.kind==='travel'?'JB5':'JBPA'+(jamesConversation.index+1));\n  if(jamesConversation.kind==='travel')startJamesVoice('talk',0,4);else startJamesVoice('station',time,6+jamesConversation.index);"+s[end:]
p.write_text(s,encoding='utf-8')
edit('antarctica_voice.js',[("if(jamesVoiceKind==='car')polarState.jamesCarVoiceTime=a.currentTime||0;", "if(jamesVoiceKind==='car')polarState.jamesCarVoiceTime=a.currentTime||0;if(jamesVoiceKind==='station'&&jamesConversation.kind==='station')polarState.jamesStationVoiceTime=a.currentTime||0;")])
edit('antarctica_core.js',[
('stationDialogueIndex:0,cameraYaw:0','stationDialogueIndex:0,jamesStationVoiceTime:0,hazardStage:\'unseen\',hazardLessonIndex:0,superBlizzard:false,stormRemaining:300,suitHeat:100,cameraYaw:0'),
("numeric('introIndex',0,4);", "numeric('jamesStationVoiceTime',0,120);numeric('hazardLessonIndex',0,4);s.hazardLessonIndex=Math.floor(s.hazardLessonIndex);s.hazardStage=['warning','lesson','complete'].includes(w.hazardStage)?w.hazardStage:'unseen';s.superBlizzard=!!w.superBlizzard;numeric('stormRemaining',0,300);numeric('suitHeat',0,100);numeric('introIndex',0,4);"),
('stationDialogueIndex:s.stationDialogueIndex,cameraYaw:', 'stationDialogueIndex:s.stationDialogueIndex,jamesStationVoiceTime:s.jamesStationVoiceTime,hazardStage:s.hazardStage,hazardLessonIndex:s.hazardLessonIndex,superBlizzard:s.superBlizzard,stormRemaining:s.stormRemaining,suitHeat:s.suitHeat,cameraYaw:'),
('function routeDistance(s)', "function inShelter(s){return Math.abs(s.x-STATION.x)<5.6&&Math.abs(s.z-STATION.z)<5.0;}\n  function hazardStep(s,dt){if(s.hazardStage!=='complete'||dt<=0)return false;const exposed=s.superBlizzard&&!inShelter(s)&&!s.car?.driving,active=Math.min(dt,s.stormRemaining);s.suitHeat=clamp(s.suitHeat+(exposed?-100/180*active:inShelter(s)?1.2*dt:s.car?.driving?.6*dt:0),0,100);if(s.superBlizzard){s.stormRemaining=Math.max(0,s.stormRemaining-dt);if(s.stormRemaining===0)s.superBlizzard=false;}if(s.suitHeat>0)return false;s.x=STATION.x;s.z=STATION.z;s.yaw=0;s.james={x:s.x+1.7,z:s.z+1.5,yaw:Math.PI};s.suitHeat=35;return true;}\n  function routeDistance(s)"),
('snapshot,routeDistance,','snapshot,inShelter,hazardStep,routeDistance,')])
edit('antarctica_game.js',[
("if(!savedGame)return;jamesConversation.active=false;", "if(!savedGame)return;stopHazardNarration();$('#hazardTutorial').hidden=true;$('#coldRecovery').hidden=true;jamesConversation.active=false;"),
('if(polarState.stationDialogueActive)beginJamesConversation();', 'if(polarState.stationDialogueActive)beginJamesConversation();else if(polarState.stationDialogueDone)beginHazardTutorial();'),
('pauseJamesConversation(on);','pauseJamesConversation(on);pauseHazardNarration(on);'),
('function exitPolar(){savePolarWorld();','function exitPolar(){savePolarWorld();stopHazardNarration();'),
("s.stationFound?'Stay in the shelter; recover and check supplies'", "s.stationFound?(s.hazardStage==='complete'&&!s.superBlizzard?'Explore the station and plan your next journey':'Stay in the shelter; recover and check supplies')"),
('gamePaused||jamesConversation.active||!!s.car?.driving','gamePaused||jamesConversation.active||hazardModalActive()||!!s.car?.driving'),
("gamePaused?'paused':jamesConversation.active?'james-conversation':'free-roam'", "gamePaused?'paused':hazardModalActive()?'hazard-tutorial':jamesConversation.active?'james-conversation':'free-roam'"),
('updateVehicleHUD();}', 'updateVehicleHUD();updateHazardHUD();}'),
('if(dt>0){if(jamesConversation.active)', 'if(dt>0){if(hazardModalActive())hazardTutorial.clock+=dt;else if(polarState.stationDialogueDone&&polarState.hazardStage===\'unseen\'&&!jamesConversation.active)beginHazardTutorial();else if(jamesConversation.active)'),
('else polarMove(dt);updateJamesCarQuote(dt);', 'else polarMove(dt);updateJamesCarQuote(dt);stepPolarHazards(dt);'),
('pauseJamesConversation(true);','pauseJamesConversation(true);pauseHazardNarration(true);'),
('pauseJamesConversation(false);','pauseJamesConversation(false);pauseHazardNarration(false);'),
('polarState.jamesIntroductionDone&&!jamesConversation.active&&', 'polarState.jamesIntroductionDone&&!jamesConversation.active&&!hazardModalActive()&&'),
("if(jamesConversation.active){if(e.code==='Enter'", "if(hazardModalActive()){if(e.code==='Enter'||e.code==='Space')advanceHazardLesson();return;}if(jamesConversation.active){if(e.code==='Enter'"),
('gamePaused||jamesConversation.active||!polarState.jamesIntroductionDone', 'gamePaused||jamesConversation.active||hazardModalActive()||!polarState.jamesIntroductionDone'),
('!gamePaused&&!jamesConversation.active&&polarState.jamesIntroductionDone','!gamePaused&&!jamesConversation.active&&!hazardModalActive()&&polarState.jamesIntroductionDone')])
edit('antarctica_vehicle.js', [('gamePaused||jamesConversation.active||','gamePaused||jamesConversation.active||hazardModalActive()||')])
edit('antarctica_renderer.js',[
('const vp=M.mul(', 'const severity=s.superBlizzard?1:0;const vp=M.mul('),
('190-storm*50','190-storm*50-severity*100'),
('time*(7+hx*5)','time*(7+hx*5+severity*12)'),
('time*2.7','time*(2.7+severity*5)')])
edit('build_menu.py',[("js+='\\n'+(work/'antarctica_vehicle.js').read_text(encoding='utf-8')", "js+='\\n'+(work/'antarctica_vehicle.js').read_text(encoding='utf-8')\njs+='\\n'+(work/'antarctica_hazards.js').read_text(encoding='utf-8')")])
edit('package_menu.py',[("html.count('data:audio/mpeg;base64,')==11", "html.count('data:audio/mpeg;base64,')==21"), ("sources+=['save_management.js']", "sources+=['save_management.js','antarctica_hazards.js','test_antarctica_hazards.js','import_james_audio.py']\nfiles+=['NOSTRAVECTOR_Hazard_Script.txt','NOSTRAVECTOR_Hazard_Tutorial_Preview.png']")])
print('Connected station recordings and saved hazard tutorial to gameplay.')
