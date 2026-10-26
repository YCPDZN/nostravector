from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'test_antarctica_runtime.js';s=f.read_text(encoding='utf-8')
s=s.replace("assert.match(element('#conversationLine').textContent,/gathering some supplies/);", "assert.match(element('#conversationLine').textContent,/gathering some supplies/);assert.equal(run('jamesVoiceIndex'),16);assert.equal(element('#conversationVoiceLabel').textContent,'RECORDED VOICE / JBW');")
s=s.replace('advanceJamesConversation();advanceJamesConversation();advanceJamesConversation();savePolarWorld(true);', 'advanceJamesConversation();advanceJamesConversation();advanceJamesConversation();currentJamesVoice().currentTime=2.3;pausePolar(true);savePolarWorld(true);pausePolar(false);')
s=s.replace("assert.equal(run('jamesConversation.kind'),'supplies');assert.equal(run('JSON.stringify(savedGame.progress)'),savedSupplyProgress);", "assert.equal(run('jamesConversation.kind'),'supplies');assert.equal(run('jamesVoiceIndex'),19);assert.equal(element('#conversationVoiceLabel').textContent,'RECORDED VOICE / JBW3');assert.equal(run('currentJamesVoice().currentTime'),2.3,'A manual save resumes the correct supply recording and offset.');assert.equal(run('JSON.stringify(savedGame.progress)'),savedSupplyProgress);")
f.write_text(s,encoding='utf-8')
