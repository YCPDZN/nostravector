from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'antarctica_speech.js';s=f.read_text(encoding='utf-8')
start=s.index("  if(jamesConversation.kind==='supplies'){",s.index('function showJamesConversationLine'))
end=s.index("  $('#systemJamesVoice').hidden=true;", start)
s=s[:start]+s[end:]
s=s.replace("(jamesConversation.kind==='travel'?'JB5':'JBPA'+(jamesConversation.index+1))", "(jamesConversation.kind==='travel'?'JB5':jamesConversation.kind==='supplies'?(jamesConversation.index===0?'JBW':'JBW'+jamesConversation.index):'JBPA'+(jamesConversation.index+1))")
s=s.replace("if(jamesConversation.kind==='travel')startJamesVoice('talk',0,4);else", "if(jamesConversation.kind==='supplies')startJamesVoice('supplies',time,16+jamesConversation.index);else if(jamesConversation.kind==='travel')startJamesVoice('talk',0,4);else")
s=s.replace("kind==='station'?polarState.jamesStationVoiceTime:0", "kind==='station'?polarState.jamesStationVoiceTime:kind==='supplies'?polarState.jamesSupplyVoiceTime:0")
s=s.replace("polarState.supplyDialogueIndex=0;polarState.suppliesPlanKnown=true;", "polarState.supplyDialogueIndex=0;polarState.jamesSupplyVoiceTime=0;polarState.suppliesPlanKnown=true;")
s=s.replace("if(jamesConversation.kind==='station')polarState.jamesStationVoiceTime=0;", "if(jamesConversation.kind==='station')polarState.jamesStationVoiceTime=0;if(jamesConversation.kind==='supplies')polarState.jamesSupplyVoiceTime=0;")
s=s.replace("jamesVoiceKind==='station'?JAMES_STATION_QUOTES[jamesVoiceIndex-6]:JAMES_CAR_QUOTE", "jamesVoiceKind==='station'?JAMES_STATION_QUOTES[jamesVoiceIndex-6]:jamesVoiceKind==='supplies'?JAMES_SUPPLY_QUOTES[jamesVoiceIndex-16]:JAMES_CAR_QUOTE")
f.write_text(s,encoding='utf-8')
f=p/'antarctica_voice.js';s=f.read_text(encoding='utf-8').replace("polarState.jamesStationVoiceTime=a.currentTime||0;}", "polarState.jamesStationVoiceTime=a.currentTime||0;if(jamesVoiceKind==='supplies'&&jamesConversation.kind==='supplies')polarState.jamesSupplyVoiceTime=a.currentTime||0;}");f.write_text(s,encoding='utf-8')
f=p/'antarctica_core.js';s=f.read_text(encoding='utf-8').replace('jamesStationVoiceTime:0,','jamesStationVoiceTime:0,jamesSupplyVoiceTime:0,').replace("numeric('jamesStationVoiceTime',0,120);", "numeric('jamesStationVoiceTime',0,120);numeric('jamesSupplyVoiceTime',0,120);").replace('jamesStationVoiceTime:s.jamesStationVoiceTime,','jamesStationVoiceTime:s.jamesStationVoiceTime,jamesSupplyVoiceTime:s.jamesSupplyVoiceTime,');f.write_text(s,encoding='utf-8')
f=p/'package_menu.py';s=f.read_text(encoding='utf-8').replace('==28','==38');f.write_text(s,encoding='utf-8')
f=p/'game_readme.txt';s=f.read_text(encoding='utf-8').replace("James's sixteen supplied recordings", "James's twenty-six supplied recordings").replace('All twenty-eight clips','All thirty-eight clips').replace('These new lines use optional temporary browser system speech until dedicated recordings are supplied; captions remain available.', 'JBW.mp3 plays line 1; JBW1.mp3 through JBW9.mp3 play lines 2 through 10. The supplied recordings drive James’s lip sync, pause with the game and resume from the saved playback position when you Continue after a manual save. Captions remain available if playback is muted or unavailable.')
s+='\nJAMES SUPPLY RECORDINGS\nLine 1 = JBW.mp3. Lines 2–10 = JBW1.mp3 through JBW9.mp3. These replace the temporary system voice, are embedded for offline use, and do not change manual-only saving.\n'
f.write_text(s,encoding='utf-8')
