from pathlib import Path
root=Path(__file__).resolve().parent
def edit(name,old,new):
    p=root/name;s=p.read_text(encoding='utf-8');assert old in s,(name,old[:80]);p.write_text(s.replace(old,new),encoding='utf-8')
edit('build_menu.py',"+'\\n'+(work/'space_core.js').read_text", "+'\\n'+(work/'planet_landscapes.js').read_text(encoding='utf-8')+'\\n'+(work/'menu_location.js').read_text(encoding='utf-8')+'\\n'+(work/'space_core.js').read_text")
edit('build_menu.py',"+'\\n'+(work/'space_game.js').read_text", "+'\\n'+(work/'planet_map.js').read_text(encoding='utf-8')+'\\n'+(work/'space_game.js').read_text")
edit('package_menu.py',"sources+=['sol_catalog.js'", "sources+=['planet_landscapes.js','planet_map.js','menu_location.js','test_planet_landscapes.js']\nsources+=['sol_catalog.js'")
edit('menu_party.js','function rememberMenuParty(){','function rememberMenuParty(){if(typeof rememberMenuLocation===\'function\')rememberMenuLocation();')
# Public space API remains compatible with all old save files and callers.
p=root/'space_core.js';s=p.read_text(encoding='utf-8');a=s.index('  function surfaceHeight(');b=s.index('  function surfaceGround(',a)
s=s[:a]+"  function surfaceHeight(x,z,seed,id){return NVLandscapes.height(x,z,seed,id);}\n  function surfaceProps(cx,cz,seed,id){return NVLandscapes.props(cx,cz,seed,id);}\n"+s[b:];p.write_text(s,encoding='utf-8')
edit('space_game.js',"  if(spaceChartOpen)refreshSolChart();", "  updatePlanetMap();if(spaceChartOpen)refreshSolChart();")
edit('space_game.js',"if(!active){$('#solChart')", "if(!active){$('#planetMinimap').hidden=true;$('#solChart')")
edit('space_game.js',"'Explore freely, gather scrap, then return to your ship.'", "NVLandscapes.profile(b.id).title+' / Explore, salvage, return to your ship.'")
edit('space.html','<div id="spaceKeys"', '<aside id="planetMinimap" aria-label="Current world terrain minimap" hidden><div class="planet-map-heading"><strong id="planetMapTitle"></strong><span>LOCAL SURVEY</span></div><canvas id="planetMapCanvas" width="176" height="176" aria-label="Terrain contours, player heading, landmarks, ship and station"></canvas><p id="planetMapBiome"></p><small id="planetMapCoords"></small><small>WHITE / YOU · CYAN / SHIP · GOLD / LANDMARK</small></aside>\n<div id="spaceKeys"')
edit('planet_landscapes.js','1-Math.abs(N(u/S,v/(S*.43),3)*2-1)','1-Math.abs(N(u/S,v/(S*.43),3))')
with (root/'space.css').open('a',encoding='utf-8') as f:f.write('''
#planetMinimap{position:absolute;right:28px;top:135px;width:190px;background:#06131bd9;border:1px solid #78ccdf44;padding:10px;box-shadow:0 10px 35px #0004}#planetMinimap[hidden]{display:none!important}.planet-map-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;gap:6px}.planet-map-heading strong{font:12px Consolas;color:#dffaff;letter-spacing:1px}.planet-map-heading span{font:7px Consolas;color:#9bb6c1}#planetMapCanvas{width:100%;aspect-ratio:1;border:1px solid #9cdae326}#planetMinimap p{font:9px/1.5 Consolas;color:#deb983;letter-spacing:1px;margin:8px 0}#planetMinimap small{display:block;font:7px/1.6 Consolas;color:#aac4cd}.earth-label .latitude{line-height:1.7}.earth-label #region{font-size:8px;letter-spacing:1px}@media(max-width:800px){#planetMinimap{right:15px;top:120px;width:140px;padding:7px}.planet-map-heading span{display:none}.space-surface .space-crew{bottom:175px}}@media(max-width:580px){#planetMinimap{top:100px;width:110px}.space-route-card{width:165px}.space-telemetry{width:165px}}
''')
for name in ['test_space.js','test_antarctica_runtime.js']:
    edit(name,"'sol_catalog.js','space_core.js'", "'sol_catalog.js','planet_landscapes.js','space_core.js'") if name=='test_space.js' else edit(name,"+'\\n'+fs.readFileSync(root+'/space_core.js'", "+'\\n'+fs.readFileSync(root+'/planet_landscapes.js','utf8')+'\\n'+fs.readFileSync(root+'/menu_location.js','utf8')+'\\n'+fs.readFileSync(root+'/space_core.js'")
# Runtime test loads the real controller near its end.
edit('test_antarctica_runtime.js',"fs.readFileSync(root+'/space_game.js','utf8')", "fs.readFileSync(root+'/planet_map.js','utf8')+'\\n'+fs.readFileSync(root+'/space_game.js','utf8')")
print('Integrated distinct terrain, maps and current menu location.')
