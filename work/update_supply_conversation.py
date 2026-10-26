from pathlib import Path
import json
p=Path(__file__).resolve().parent
f=p/'antarctica_speech.js';s=f.read_text(encoding='utf-8')
quotes=json.loads((p/'james_supply_quotes.json').read_text(encoding='utf-8'))
s=s.replace('const jamesConversation=', 'const JAMES_SUPPLY_QUOTES='+json.dumps(quotes,ensure_ascii=False,indent=2)+';\nconst jamesConversation=')
s=s.replace("return jamesConversation.kind==='travel'?[JAMES_QUOTES[4]]:JAMES_STATION_QUOTES;", "return jamesConversation.kind==='supplies'?JAMES_SUPPLY_QUOTES:jamesConversation.kind==='travel'?[JAMES_QUOTES[4]]:JAMES_STATION_QUOTES;")
marker="  $('#systemJamesVoice').hidden=true;"
insert="""  if(jamesConversation.kind==='supplies'){
    stopJamesVoice();$('#systemJamesVoice').hidden=false;$('#conversationVoiceLabel').textContent='CAPTIONS / SUPPLY RUN';
    if(jamesSystemVoice&&window.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined'){
      const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=.94;utterance.volume=Math.max(0,Math.min(1,Number($('#jamesVolume').value)||0));
      jamesVoiceError=true;utterance.onboundary=e=>{if(token!==jamesConversation.token)return;jamesConversation.charIndex=e.charIndex;jamesConversation.boundaryClock=jamesConversation.clock;};
      utterance.onend=()=>{if(token===jamesConversation.token)jamesConversation.speechDone=true;};utterance.onerror=()=>{if(token===jamesConversation.token){jamesConversation.speechDone=true;$('#conversationVoiceLabel').textContent='VOICE UNAVAILABLE / CAPTIONS ACTIVE';}};
      $('#conversationVoiceLabel').textContent='TEMPORARY SYSTEM VOICE / SUPPLY RUN';window.speechSynthesis.speak(utterance);
    }
    return;
  }
"""
assert marker in s;s=s.replace(marker,insert+marker)
s=s.replace("||polarState.car?.driving||hazardModalActive())return;", "||(polarState.car?.driving&&kind!=='supplies')||hazardModalActive())return;",1)
s=s.replace("kind==='station'?polarState.stationDialogueIndex:0;", "kind==='station'?polarState.stationDialogueIndex:kind==='supplies'&&polarState.supplyDialogueActive?polarState.supplyDialogueIndex:0;")
s=s.replace("if(kind==='station')polarState.stationDialogueActive=true;", "if(kind==='station')polarState.stationDialogueActive=true;if(kind==='supplies'){polarState.supplyDialogueActive=true;polarState.supplyDialoguePending=false;polarState.supplyDialogueIndex=jamesConversation.index;stopHazardNarration();}")
s=s.replace("  jamesConversation.active=false;cancelJamesConversationSpeech();", "  if(jamesConversation.kind==='supplies'){polarState.supplyDialogueDone=true;polarState.supplyDialogueActive=false;polarState.supplyDialoguePending=false;polarState.supplyDialogueIndex=0;polarState.suppliesPlanKnown=true;}\n  jamesConversation.active=false;cancelJamesConversationSpeech();")
s=s.replace("polarState.stationDialogueIndex=jamesConversation.index;", "polarState.stationDialogueIndex=jamesConversation.index;if(jamesConversation.kind==='supplies')polarState.supplyDialogueIndex=jamesConversation.index;")
s=s.replace("polarState.stationFound?(polarState.stationDialogueDone?'revisit':'station'):'travel'", "polarState.suppliesPlanKnown?'supplies':polarState.stationFound?(polarState.stationDialogueDone?'revisit':'station'):'travel'")
f.write_text(s,encoding='utf-8')
f=p/'antarctica_game.js';s=f.read_text(encoding='utf-8')
s=s.replace('if(polarState.stationDialogueActive)beginJamesConversation();', "if(polarState.supplyDialogueActive||polarState.supplyDialoguePending)beginJamesConversation('supplies');else if(polarState.stationDialogueActive)beginJamesConversation();")
s=s.replace("else if(jamesConversation.active)tickJamesConversation(dt);", "else if(jamesConversation.active)tickJamesConversation(dt);else if(polarState.supplyDialoguePending)beginJamesConversation('supplies');")
s=s.replace("s.hazardStage==='complete'&&!s.superBlizzard?'Explore the station and plan your next journey'", "s.hazardStage==='complete'&&!s.superBlizzard?(s.suppliesPlanKnown?(s.suppliesCollected?'Return to the station before the next blizzard':'Gather supplies at the coastal depot'):'Talk to James about supplies')")
s=s.replace("const angle=Math.atan2(NVAntarctica.STATION.x-s.x,NVAntarctica.STATION.z-s.z)", "const destination=polarDestination(s),angle=Math.atan2(destination.x-s.x,destination.z-s.z)")
s=s.replace('d=NVAntarctica.routeDistance(s),minutes=', 'd=polarObjectiveDistance(s),minutes=')
s=s.replace('updateVehicleHUD();updateHazardHUD();}', 'updateVehicleHUD();updateHazardHUD();updateEarthMap();updateSupplyHUD();}')
s=s.replace("'KeyT','KeyM'", "'KeyG','KeyT','KeyM'")
s=s.replace("if(e.code==='KeyT'){", "if(e.code==='KeyG'){collectCoastalSupplies();return;}if(e.code==='KeyT'){")
f.write_text(s,encoding='utf-8')
f=p/'antarctica_renderer.js';s=f.read_text(encoding='utf-8').replace('if(jamesConversation.active){const j=', 'if(jamesConversation.active&&!s.car?.driving){const j=')
marker='    for(const p of polarFootprints)'
insert="""    if(Math.hypot(s.x-A.DEPOT.x,s.z-A.DEPOT.z)<250){const d=A.DEPOT,y=A.height(d.x,d.z,s.seed);object(d.x,y+1.45,d.z,7,2.9,5,[.37,.49,.54]);object(d.x,y+3,d.z,7.4,.25,5.4,[.80,.86,.88]);object(d.x,y+1.2,d.z-2.55,1.4,2.4,.08,[.19,.30,.33]);for(const offset of [-2.3,2.3])object(d.x+offset,y+.55,d.z-4,1.25,1.1,1.1,[.54,.38,.21]);object(d.x+4,y+2.5,d.z,.07,5,.07,[.33,.42,.44]);object(d.x+4.6,y+4.6,d.z,1.2,.65,.08,[.91,.51,.19]);}
"""
assert marker in s;s=s.replace(marker,insert+marker)
f.write_text(s,encoding='utf-8')
