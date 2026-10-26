from pathlib import Path
work=Path(__file__).resolve().parent
p=work/'antarctica_core.js';s=p.read_text(encoding='utf-8')
start=s.index('  function restored(');end=s.index('  function snapshot(',start)
s=s[:start]+'''  function restored(progress,id){
    const s=fresh(seedFromId(id)),w=progress?.antarctica;if(!w||typeof w!=='object')return s;
    const numeric=(k,a,b)=>{if(Number.isFinite(w[k]))s[k]=clamp(w[k],a,b);};
    for(const k of ['x','z'])numeric(k,-1e7,1e7);for(const k of ['yaw','cameraYaw'])numeric(k,-1e6,1e6);
    numeric('cameraPitch',.08,.9);numeric('stamina',0,100);numeric('playTime',0,1e10);numeric('jamesCarQuoteRemaining',0,120);numeric('jamesIntroVoiceTime',0,120);numeric('jamesCarVoiceTime',0,120);numeric('introIndex',0,4);s.introIndex=Math.floor(s.introIndex);
    if(Number.isSafeInteger(w.seed))s.seed=w.seed>>>0;s.exhausted=!!w.exhausted;s.jamesIntroductionDone=!!w.jamesIntroductionDone;s.stationFound=!!w.stationFound;s.jamesCarQuoteShown=!!w.jamesCarQuoteShown;if(!s.jamesCarQuoteShown)s.jamesCarQuoteRemaining=0;
    if(Number.isFinite(w.james?.x)&&Number.isFinite(w.james?.z))s.james={x:clamp(w.james.x,-1e7,1e7),z:clamp(w.james.z,-1e7,1e7),yaw:Number.isFinite(w.james.yaw)?w.james.yaw:Math.PI};
    const car=w.car;
    if(car&&['x','z','yaw','startX','startZ','elapsed'].every(k=>Number.isFinite(car[k]))){s.car={x:clamp(car.x,-1e7,1e7),z:clamp(car.z,-1e7,1e7),yaw:clamp(car.yaw,-1e6,1e6),startX:clamp(car.startX,-1e7,1e7),startZ:clamp(car.startZ,-1e7,1e7),elapsed:clamp(car.elapsed,0,CAR_TRIP_SECONDS),driving:!!car.driving&&s.jamesIntroductionDone,arrived:!!car.arrived};if(s.car.arrived||s.car.elapsed>=CAR_TRIP_SECONDS)s.car.driving=false;}
    return s;
  }
'''+s[end:];p.write_text(s,encoding='utf-8')
p=work/'antarctica_game.js';s=p.read_text(encoding='utf-8')
s=s.replace('if(!savedGame)return;stopNarration();','if(!savedGame)return;stopJamesVoice();stopNarration();')
s=s.replace('showJamesQuote();}', 'showJamesQuote(polarState.jamesIntroVoiceTime);}',1)
s=s.replace("  if(!polarRenderer)","  NVAntarctica.unlockCar(polarState);if(polarState.jamesIntroductionDone&&polarState.jamesCarQuoteRemaining>0)startJamesVoice('car',polarState.jamesCarVoiceTime);\n  if(!polarRenderer)",1)
s=s.replace('function showJamesQuote(){','function showJamesQuote(time=0){startJamesVoice(\'intro\',time);')
s=s.replace('polarQuoteClock=0;if(polarState.introIndex<4)',"stopJamesVoice();polarState.jamesIntroVoiceTime=0;polarQuoteClock=0;if(polarState.introIndex<4)")
a=s.index('function updateJamesCarQuote(');b=s.index('function savePolarWorld()',a)
s=s[:a]+"function updateJamesCarQuote(dt){const s=polarState;updateCarVoiceCaption(dt);if(!s.jamesCarQuoteShown&&s.playTime>=60-1e-8){s.jamesCarQuoteShown=true;s.jamesCarVoiceTime=0;s.jamesCarQuoteRemaining=JAMES_VOICES[5].duration+1.35;NVAntarctica.unlockCar(s);$('#jamesCarLine').textContent=JAMES_CAR_QUOTE;startJamesVoice('car');savePolarWorld();}$('#jamesCarDialogue').hidden=s.jamesCarQuoteRemaining<=0;}\n"+s[b:]
s=s.replace('if(!polarState||!savedGame)return;const result=', 'if(!polarState||!savedGame)return;captureJamesVoice();const result=')
s=s.replace('gamePaused=on;polarKeys.clear();','gamePaused=on;pauseJamesVoice(on);polarKeys.clear();')
s=s.replace('function exitPolar(){savePolarWorld();','function exitPolar(){savePolarWorld();stopJamesVoice();')
s=s.replace("polarScreen.dataset.jamesDistance=jd.toFixed(2);}","polarScreen.dataset.jamesDistance=jd.toFixed(2);updateVehicleHUD();}")
s=s.replace('if(dt>0){polarMove(dt);updateJamesCarQuote(dt);}', 'if(dt>0){if(polarState.car?.driving)drivePolarCar(dt);else polarMove(dt);updateJamesCarQuote(dt);}')
s=s.replace('if(polarQuoteClock>Math.max(6,JAMES_QUOTES[polarState.introIndex].length/18+1.5))advanceJames();', 'if(jamesIntroAudioFinished(dt))advanceJames();')
s=s.replace('gamePaused=true;polarKeys.clear();', 'gamePaused=true;pauseJamesVoice(true);polarKeys.clear();')
s=s.replace("gamePaused=false;$('#polarMap').hidden=true;polarCanvas.focus();", "gamePaused=false;pauseJamesVoice(false);$('#polarMap').hidden=true;polarCanvas.focus();")
s=s.replace("'KeyR','KeyQ'", "'KeyR','KeyF','KeyQ'")
s=s.replace("if(e.code==='KeyM'){openFieldMap();return;}","if(e.code==='KeyM'){openFieldMap();return;}if(e.code==='KeyF'){interactWithCar();return;}")
s=s.replace("marker(s.x,s.z,'#8ce0ee','YOU');", "marker(s.x,s.z,'#8ce0ee','YOU');if(s.car)marker(s.car.x,s.car.z,'#f4a55d','POLAR ROVER');")
p.write_text(s,encoding='utf-8')
print('Integrated recorded James dialogue and saved vehicle travel.')
