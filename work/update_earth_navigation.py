from pathlib import Path
p=Path(__file__).resolve().parent
def atlas(dot):
    return f'''<svg class="earth-atlas" viewBox="0 0 720 360" role="img" aria-label="Earth map with all seven continents and your position at the bottom in Antarctica"><image data-earth-atlas x="0" y="0" width="720" height="360" preserveAspectRatio="none"/><path d="M0 90H720M0 180H720M0 270H720M180 0V360M360 0V360M540 0V360" stroke="#b9e2ee" stroke-opacity=".15" fill="none"/><text x="150" y="102">NORTH AMERICA</text><text x="235" y="241">SOUTH AMERICA</text><text x="365" y="89">EUROPE</text><text x="385" y="194">AFRICA</text><text x="505" y="113">ASIA</text><text x="591" y="261">AUSTRALIA</text><text class="antarctic-label" x="360" y="324">ANTARCTICA</text><circle id="{dot}" class="earth-player" cx="360" cy="345" r="7"/></svg>'''
f=p/'antarctica.html';s=f.read_text(encoding='utf-8')
s=s.replace('<div class="polar-bottom">', '<button id="earthMinimap" class="earth-minimap" aria-label="Open Earth map"><strong>EARTH / PLANETARY POSITION</strong>'+atlas('earthPlayerDot')+'<small id="earthLocation">YOU / ANTARCTICA · SOUTHERN EDGE</small></button><div class="polar-bottom">',1)
s=s.replace('<span class="world-save-status"', '<span id="supplyInventory" class="supply-inventory" hidden>SUPPLIES / FOOD · WATER · POWER CELLS</span><span class="world-save-status"',1)
start=s.index('<div id="polarMap"');end=s.index('<div class="touch-movement"',start)
s=s[:start]+'''<div id="polarMap" class="world-sheet" hidden><div class="world-sheet-card map-card planet-map-card"><span class="polar-kicker">NAVIGATION / PLANET EARTH</span><h2 id="polarMapTitle">EARTH / OUR PLACE IN THE SOL SYSTEM</h2><div class="map-tabs"><button id="showEarthMap" class="polar-button" aria-pressed="true">EARTH / CONTINENTS</button><button id="showLocalMap" class="polar-button" aria-pressed="false">LOCAL / ANTARCTICA</button></div><div id="earthMapView">'''+atlas('earthAtlasDot')+'''<p>AMBER DOT / YOU · ANTARCTICA IS AT THE BOTTOM OF THE WORLD MAP.<br>Switch to LOCAL / ANTARCTICA for the research station, coastal supply depot and rover route.</p></div><div id="localMapView" hidden><canvas id="polarMapCanvas" width="600" height="600" aria-label="Local map showing you, James, the research station and coastal supply depot"></canvas><p>CYAN / YOU · AMBER / JAMES · WHITE / STATION · ORANGE / SUPPLY DEPOT<br>Terrain continues beyond the chart. Free roam in any direction.</p></div><button id="closePolarMap" class="polar-button">RETURN TO EXPEDITION</button></div></div>
<div id="coastalSupplies" class="coastal-supplies" hidden><strong>COASTAL SUPPLY DEPOT</strong><br>Food, sealed water and spare power cells.<br><button id="collectSupplies" class="polar-button">GATHER SUPPLIES / G</button></div>
<div id="stormAlert" class="storm-alert" role="status" hidden>WEATHER WARNING! SUPER BLIZZARD INCOMING!<button id="enableWeatherVoice" class="polar-button" hidden>PLAY SUIT WARNING</button></div>
'''+s[end:]
f.write_text(s,encoding='utf-8')
f=p/'antarctica_game.js';s=f.read_text(encoding='utf-8').replace("$('#coldRecovery').hidden=true;", "$('#coldRecovery').hidden=true;$('#stormAlert').hidden=true;stormAlertUntil=0;",1)
s=s.replace("$('#polarMap').hidden=false;drawPolarMap();", "$('#polarMap').hidden=false;selectPolarMap('earth');drawPolarMap();")
s=s.replace("marker(0,NVAntarctica.STATION.z,'#f5f8fa','RESEARCH STATION');", "marker(0,NVAntarctica.STATION.z,'#f5f8fa','RESEARCH STATION');if(s.suppliesPlanKnown)marker(NVAntarctica.DEPOT.x,NVAntarctica.DEPOT.z,'#ffa95d','COASTAL SUPPLY DEPOT');")
s=s.replace("const a=px(s.x,s.z),b=px(0,NVAntarctica.STATION.z);", "const goal=polarDestination(s),a=px(s.x,s.z),b=px(goal.x,goal.z);")
f.write_text(s,encoding='utf-8')
f=p/'antarctica_hazards.js';s=f.read_text(encoding='utf-8')
s=s.replace("'STORM CLEARED / FREE ROAM'", "'CLEAR WINDOW / NEXT BLIZZARD '+Math.floor(s.nextBlizzardRemaining/60)+':'+String(Math.ceil(s.nextBlizzardRemaining)%60).padStart(2,'0')")
s=s.replace('  if(NVAntarctica.hazardStep(polarState,dt))', '  const cycle=polarState.blizzardCycle;\n  if(NVAntarctica.hazardStep(polarState,dt))')
s=s.replace("  if(NVAntarctica.inShelter(polarState)", "  if(polarState.blizzardCycle>cycle){suitWarningBeep();polarState.hazardVoiceTime=0;speakHazardText(SUIT_WEATHER_WARNING,true);stormAlertUntil=polarClock+9;$('#stormAlert').hidden=false;}\n  if(NVAntarctica.inShelter(polarState)")
f.write_text(s,encoding='utf-8')
f=p/'antarctica_hazard_voice.js';s=f.read_text(encoding='utf-8').replace("$('#enableSuitRecoveryVoice').hidden=true;", "$('#enableSuitRecoveryVoice').hidden=true;$('#enableWeatherVoice').hidden=true;")
s=s.replace("$(hazardVoiceIndex===6?'#enableSuitRecoveryVoice':'#enableHazardVoice')", "$(hazardVoiceIndex===6?'#enableSuitRecoveryVoice':!hazardModalActive()?'#enableWeatherVoice':'#enableHazardVoice')")
s+="\n$('#enableWeatherVoice').onclick=()=>playHazardVoice();\n"
f.write_text(s,encoding='utf-8')
f=p/'build_menu.py';s=f.read_text(encoding='utf-8').replace("js+='\\n'+(work/'antarctica_hazards.js').read_text(encoding='utf-8')", "js+='\\n'+(work/'antarctica_hazards.js').read_text(encoding='utf-8')\njs+='\\n'+(work/'antarctica_navigation.js').read_text(encoding='utf-8')")
s=s.replace("(work/'hazard.css').read_text(encoding='utf-8')", "(work/'hazard.css').read_text(encoding='utf-8')+'\\n'+(work/'earth_navigation.css').read_text(encoding='utf-8')")
s+="\n(out/'NOSTRAVECTOR_James_Supply_Script.txt').write_text('JAMES BROWN — AFTER THE BLIZZARD\\n\\n'+'\\n\\n'.join(str(i+1)+'. '+q for i,q in enumerate(json.loads((work/'james_supply_quotes.json').read_text(encoding='utf-8'))))+'\\n',encoding='utf-8')\n"
f.write_text(s,encoding='utf-8')
