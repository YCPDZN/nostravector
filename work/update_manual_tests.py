from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'test_antarctica_runtime.js';s=f.read_text(encoding='utf-8')
s=s.replace('savePolarWorld();', "$('#saveWorld').onclick();")
s=s.replace('exitPolar();', "$('#saveWorld').onclick();exitPolar();")
s=s.replace("assert.equal(run('savedGame.progress.antarctica.jamesCarQuoteShown'),true);", "run(\"$('#saveWorld').onclick();\");assert.equal(run('savedGame.progress.antarctica.jamesCarQuoteShown'),true);")
s=s.replace("assert.equal(run('savedGame.progress.antarctica.car.driver'),'james');", "run(\"$('#saveWorld').onclick();\");assert.equal(run('savedGame.progress.antarctica.car.driver'),'james');")
s=s.replace("assert.equal(run('savedGame.progress.antarctica.stationDialogueDone'),true);", "run(\"$('#saveWorld').onclick();\");assert.equal(run('savedGame.progress.antarctica.stationDialogueDone'),true);")
marker="const first=run('savedGame.id');"
insert='''// Automatic transitions must never change either persistent or in-memory saved progress.
const initialSavedProgress=run('JSON.stringify(savedGame.progress)'),initialStoredRoster=storage.get('nostravector.saves.v2');
run("for(let i=0;i<5;i++)advanceJames();polarKeys.add('KeyW');polarTick(1000);for(let i=1;i<=1300;i++)polarTick(1000+i*50);pausePolar(true);pausePolar(false);openFieldMap();$('#closePolarMap').onclick();interactWithCar();switchPolarDriver();polarState.stationFound=true;polarState.car.driving=false;beginJamesConversation();for(let i=0;i<10;i++)advanceJamesConversation();for(let i=0;i<6;i++)advanceHazardLesson();polarState.x=40;polarState.z=1682;polarState.suitHeat=1;stepPolarHazards(3);pausePolar(true);savePolarWorld();exitPolar();");
assert.equal(storage.get('nostravector.saves.v2'),initialStoredRoster,'Timers, pauses, map, checkpoint, driver changes, dialogue, recovery and menu exit must not persist progress.');
assert.equal(run('JSON.stringify(savedGame.progress)'),initialSavedProgress,'Automatic transitions must not silently update the last manual save in memory.');
run('continueSavedGame();');assert.equal(run('polarState.jamesIntroductionDone'),false,'Continue must restore the last manual save, discarding unsaved progress.');
run("advanceJames();$('#saveWorld').onclick();");const explicitSavedProgress=run('JSON.stringify(savedGame.progress)');
assert.notEqual(explicitSavedProgress,initialSavedProgress,'The SAVE GAME control must persist current progress.');
run('advanceJames();pausePolar(true);exitPolar();continueSavedGame();');assert.equal(run('polarState.introIndex'),1,'Continue loads the manual checkpoint instead of subsequent unsaved changes.');
run('polarState.introIndex=0;showJamesQuote();');
'''
assert marker in s;s=s.replace(marker,insert+marker)
s=s.replace("console.log('Passed: intro audio timing", "console.log('Passed: manual-only saves, unsaved rollback, intro audio timing")
f.write_text(s,encoding='utf-8')
f=p/'test_antarctica_hazards.js';s=f.read_text(encoding='utf-8').replace('assert.ok(saves>=6);','assert.equal(saves,0,"Hazard transitions must never save automatically.");')
s=s.replace("assert.equal(run('hazardVoiceClips.every(a=>a.paused)'),true);", "assert.equal(run('hazardVoiceClips.every(a=>a.paused)'),true);run('playSuitRecovery();');assert.equal(run('hazardVoiceIndex'),6);assert.equal(run('currentHazardVoice().paused'),false);run('pauseHazardNarration(true);');assert.equal(run('currentHazardVoice().paused'),true);run('pauseHazardNarration(false);');assert.equal(run('currentHazardVoice().paused'),false);run('stopHazardNarration();');")
f.write_text(s,encoding='utf-8')
