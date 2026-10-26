from pathlib import Path
p=Path(__file__).resolve().parent/'test_antarctica_runtime.js';s=p.read_text(encoding='utf-8')
s=s.replace('audioMeta[audioSequence++%6]','audioMeta[audioSequence++%audioMeta.length]')
needle="+fs.readFileSync(root+'/antarctica_vehicle.js','utf8')";assert needle in s
s=s.replace(needle,needle+"+'\\n'+fs.readFileSync(root+'/antarctica_hazards.js','utf8')")
needle="assert.equal(element('#conversationNumber').textContent,'01 / 10');";assert needle in s
s=s.replace(needle,needle+"\nassert.equal(run('jamesVoiceIndex'),6);assert.equal(run('jamesVoiceKind'),'station');assert.equal(element('#systemJamesVoice').hidden,true);")
needle="assert.equal(run('polarState.stationDialogueIndex'),3);";assert needle in s
s=s.replace(needle,needle+"\nassert.equal(run('jamesVoiceIndex'),9);run('currentJamesVoice().currentTime=2.1;captureJamesVoice();');")
needle="assert.equal(element('#conversationNumber').textContent,'04 / 10');";assert needle in s
s=s.replace(needle,needle+"assert.ok(Math.abs(run('currentJamesVoice().currentTime')-2.1)<.01);")
needle="assert.equal(run('jamesConversation.active'),false);assert.equal(element('#antarctica').dataset.mode,'free-roam');";assert needle in s
s=s.replace(needle,"assert.equal(run('jamesConversation.active'),false);assert.equal(element('#antarctica').dataset.mode,'hazard-tutorial');assert.equal(run('polarState.hazardStage'),'warning');assert.equal(element('#hazardTitle').textContent,'WEATHER WARNING! SUPER BLIZZARD INCOMING!');run('for(let i=0;i<6;i++)advanceHazardLesson();');assert.equal(element('#antarctica').dataset.mode,'free-roam');assert.equal(run('polarState.hazardStage'),'complete');")
p.write_text(s,encoding='utf-8')
print('Updated integration tests for 16 James recordings and the hazard transition.')
