from pathlib import Path
f=Path(__file__).resolve().parent/'test_antarctica_runtime.js';s=f.read_text(encoding='utf-8')
marker='// Execute actual renderer paths'
insert='''// Weather expiry triggers the new ten-line briefing without saving progress.
const beforeBriefing=run('JSON.stringify(savedGame.progress)');
run("polarState=NVAntarctica.fresh(123);Object.assign(polarState,{x:0,z:1698,jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:true,stormRemaining:.05,jamesCarQuoteShown:true});polarState.james={x:1.7,z:1699.5,yaw:Math.PI};stepPolarHazards(.05);polarLast=0;polarTick(1300000);polarTick(1300050);");
assert.equal(run('jamesConversation.kind'),'supplies');assert.equal(element('#conversationNumber').textContent,'01 / 10');assert.match(element('#conversationLine').textContent,/gathering some supplies/);assert.equal(run('JSON.stringify(savedGame.progress)'),beforeBriefing);
run('advanceJamesConversation();advanceJamesConversation();advanceJamesConversation();savePolarWorld(true);');const savedSupplyProgress=run('JSON.stringify(savedGame.progress)');run('advanceJamesConversation();exitPolar();continueSavedGame();');assert.equal(element('#conversationNumber').textContent,'04 / 10');assert.equal(run('jamesConversation.kind'),'supplies');assert.equal(run('JSON.stringify(savedGame.progress)'),savedSupplyProgress);
run('for(let i=0;i<7;i++)advanceJamesConversation();');assert.equal(run('polarState.suppliesPlanKnown'),true);assert.equal(run('jamesConversation.active'),false);assert.match(element('#worldObjective').textContent,/coastal depot/);
run('polarState.x=NVAntarctica.DEPOT.x;polarState.z=NVAntarctica.DEPOT.z;');element('#collectSupplies').onclick();assert.equal(run('polarState.suppliesCollected'),true);assert.equal(element('#supplyInventory').hidden,false);assert.match(element('#worldObjective').textContent,/Return to the station/);assert.equal(run('JSON.stringify(savedGame.progress)'),savedSupplyProgress,'Gathering supplies must remain unsaved until SAVE GAME.');
run('stepPolarHazards(300);updatePolarHUD();');assert.equal(run('polarState.superBlizzard'),true);assert.equal(run('hazardVoiceIndex'),0);assert.equal(element('#stormAlert').hidden,false);assert.match(element('#weatherStatus').textContent,/SUPER BLIZZARD/);
const pausedStormTime=run('polarState.stormRemaining');run('pausePolar(true);polarTick(1400000);polarTick(1400050);');assert.equal(run('polarState.stormRemaining'),pausedStormTime);run('pausePolar(false);');
'''
assert marker in s;s=s.replace(marker,insert+marker);f.write_text(s,encoding='utf-8')
