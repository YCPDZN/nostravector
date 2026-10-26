from pathlib import Path
root=Path(__file__).resolve().parent
def edit(name, pairs):
    p=root/name;s=p.read_text(encoding='utf-8')
    for old,new in pairs:
        assert old in s,(name,old[:80]);s=s.replace(old,new)
    p.write_text(s,encoding='utf-8')
edit('antarctica_voice.js',[
('const played=a.play();','prepareJamesAcoustics(a);resumeJamesAcoustics();const played=a.play();'),
("function startJamesVoice(kind,time=0)","function startJamesVoice(kind,time=0,clipIndex=5)"),
("jamesVoiceIndex=kind==='intro'?polarState.introIndex:5;","jamesVoiceIndex=kind==='intro'?polarState.introIndex:clipIndex;")])
edit('antarctica_core.js',[
('car:null,stationFound:false,cameraYaw:0','car:null,stationFound:false,stationDialogueDone:false,stationDialogueActive:false,stationDialogueIndex:0,cameraYaw:0'),
("s.stationFound=!!w.stationFound;","s.stationFound=!!w.stationFound;s.stationDialogueDone=!!w.stationDialogueDone;s.stationDialogueActive=s.stationFound&&!s.stationDialogueDone&&!!w.stationDialogueActive;numeric('stationDialogueIndex',0,9);s.stationDialogueIndex=Math.floor(s.stationDialogueIndex);"),
("stationFound:s.stationFound", "stationFound:s.stationFound,stationDialogueDone:s.stationDialogueDone,stationDialogueActive:s.stationDialogueActive,stationDialogueIndex:s.stationDialogueIndex")])
edit('antarctica_game.js',[
('if(!savedGame)return;stopJamesVoice();','if(!savedGame)return;jamesConversation.active=false;cancelJamesConversationSpeech();$(\'#jamesConversation\').hidden=true;stopJamesVoice();'),
('if(!polarRenderer){try{','if(polarState.stationDialogueActive)beginJamesConversation();\n  if(!polarRenderer){try{'),
('gamePaused=on;pauseJamesVoice(on);','gamePaused=on;pauseJamesVoice(on);pauseJamesConversation(on);'),
('function exitPolar(){savePolarWorld();stopJamesVoice();','function exitPolar(){savePolarWorld();jamesConversation.active=false;cancelJamesConversationSpeech();stopJamesVoice();'),
("s.stationFound?'Explore the station and surroundings'", "s.stationFound?'Stay in the shelter; recover and check supplies'"),
("s.stationFound?'STATION FOUND / FREE ROAM'","s.stationFound?'SURVIVAL / SHELTER'"),
("polarScreen.dataset.mode=s.jamesIntroductionDone?(gamePaused?'paused':'free-roam')", "$('#talkJames').disabled=!s.jamesIntroductionDone||gamePaused||jamesConversation.active||!!s.car?.driving||jd>6;polarScreen.dataset.mode=s.jamesIntroductionDone?(gamePaused?'paused':jamesConversation.active?'james-conversation':'free-roam')"),
("if(dt>0){if(polarState.car?.driving)drivePolarCar(dt);else polarMove(dt);updateJamesCarQuote(dt);}","if(dt>0){if(jamesConversation.active)tickJamesConversation(dt);else{if(polarState.stationFound&&!polarState.stationDialogueDone&&!polarState.car?.driving)beginJamesConversation();else{if(polarState.car?.driving)drivePolarCar(dt);else polarMove(dt);updateJamesCarQuote(dt);}}}"),
('if(polarRenderer)polarRenderer','updateJamesLipPose(dt);if(polarRenderer)polarRenderer'),
('gamePaused=true;pauseJamesVoice(true);','gamePaused=true;pauseJamesVoice(true);pauseJamesConversation(true);'),
('gamePaused=false;pauseJamesVoice(false);','gamePaused=false;pauseJamesVoice(false);pauseJamesConversation(false);'),
("if(polarState.jamesIntroductionDone&&(e.code==='Enter'", "if(polarState.jamesIntroductionDone&&!jamesConversation.active&&(e.code==='Enter'"),
("'KeyM','KeyR'","'KeyT','KeyM','KeyR'"),
("if(e.code==='KeyM'){openFieldMap();return;}","if(jamesConversation.active){if(e.code==='Enter'||e.code==='Space')advanceJamesConversation();return;}if(e.code==='KeyT'){talkToJames();return;}if(e.code==='KeyM'){openFieldMap();return;}"),
('if(!gameActive||gamePaused||!polarState.jamesIntroductionDone)return;polarCameraDrag','if(!gameActive||gamePaused||jamesConversation.active||!polarState.jamesIntroductionDone)return;polarCameraDrag'),
('if(gameActive&&!gamePaused&&polarState.jamesIntroductionDone)polarKeys.add(code)', 'if(gameActive&&!gamePaused&&!jamesConversation.active&&polarState.jamesIntroductionDone)polarKeys.add(code)')])
edit('antarctica_vehicle.js',[
('if(!gameActive||gamePaused||!polarState.jamesIntroductionDone)return;', 'if(!gameActive||gamePaused||jamesConversation.active||!polarState.jamesIntroductionDone)return;'),
('if(!gameActive||gamePaused||!NVAntarctica.switchCarDriver', 'if(!gameActive||gamePaused||jamesConversation.active||!NVAntarctica.switchCarDriver')])
edit('antarctica.html',[
('<span class="companion-dot"></span>', '<span class="companion-dot"></span><button id="talkJames" class="polar-button">TALK / T</button>'),
('M MAP · F CAR', 'T TALK · M MAP · F CAR'),
('<div id="stationMessage"', '<div id="jamesConversation" class="james-dialogue" hidden><div class="dialogue-identity"><span>CONVERSATION</span><strong>JAMES BROWN</strong><span id="conversationNumber">01 / 10</span></div><p id="conversationLine" aria-live="polite"></p><div class="conversation-actions"><span id="conversationVoiceLabel"></span><button id="systemJamesVoice" class="polar-button" aria-pressed="true">SYSTEM VOICE / ON</button><button id="nextConversation" class="polar-button">NEXT / ENTER</button></div></div>\n<div id="stationMessage"')])
edit('build_menu.py',[
("js+='\\n'+(work/'antarctica_voice.js')", "js+='\\n'+(work/'antarctica_speech.js').read_text(encoding='utf-8')\njs+='\\n'+(work/'antarctica_voice.js')"),
("car_quote,encoding='utf-8')", "car_quote+'\\n\\nAT THE RESEARCH STATION — TEN LINES\\n\\n'+'\\n\\n'.join(str(i+1)+'. '+q for i,q in enumerate(json.loads('['+re.search(r'const JAMES_STATION_QUOTES=\\[(.*?)\\];',(work/'antarctica_speech.js').read_text(encoding='utf-8'),re.S).group(1)+']')))+'\\n',encoding='utf-8')")])
edit('package_menu.py',[("sources+=['antarctica_voice.js'", "sources+=['antarctica_speech.js','test_antarctica_speech.js','antarctica_voice.js'")])
with (root/'antarctica.css').open('a',encoding='utf-8') as f:f.write('\n.companion-card{pointer-events:auto}#talkJames{width:100%;margin-top:12px}#talkJames:disabled{opacity:.45;cursor:default}.conversation-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.conversation-actions span{font:8px Consolas,monospace;letter-spacing:1px;color:#a9c7d5;flex:1}#jamesConversation{z-index:4}#antarctica[data-mode="james-conversation"] .polar-bottom,#antarctica[data-mode="james-conversation"] .polar-objective,#antarctica[data-mode="james-conversation"] .vehicle-panel,#antarctica[data-mode="james-conversation"] .station-prompt,#antarctica[data-mode="james-conversation"] .touch-movement{display:none}#antarctica[data-mode="james-conversation"] .world-key-hint{visibility:hidden}@media(max-width:700px){.conversation-actions span{flex-basis:100%}.conversation-actions button{padding:10px;font-size:8px;margin:0}.james-dialogue p{line-height:1.45}}\n')
print('Updated saved station conversations, audio hooks, controls and build packaging.')
