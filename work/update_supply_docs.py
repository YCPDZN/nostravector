from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'game_readme.txt';s=f.read_text(encoding='utf-8').replace('test_antarctica_hazards.js.', 'test_antarctica_hazards.js, and test_weather_cycle.js.')
s+='''
RECURRING ANTARCTIC WEATHER AND COASTAL SUPPLIES
After the first taught super blizzard, storms start every ten minutes of active free-roam time: five minutes of super blizzard followed by five minutes of clear weather. The next-blizzard countdown appears during the clear window, and SUIT.mp3 plays when each new storm arrives. Pauses, maps, tutorial screens and conversations freeze the weather clock. Weather phase and remaining time are included only when you manually save.
When the first storm ends, James starts a ten-line conversation about gathering supplies at the nearest coastal depot. The current line resumes from a manual save. These new lines use optional temporary browser system speech until dedicated recordings are supplied; captions remain available. T / TALK revisits the briefing after you learn the plan. The briefing does not repeat automatically after later storms.
The coastal depot is a fictional location in the generated Antarctic sector, 360 metres north and 40 metres east of the station. The objective and local route point there after James's briefing. Leave the rover and approach within nine metres, then press G / GATHER SUPPLIES for food, sealed water and power cells. The objective then points back to shelter. Collecting supplies never saves automatically.
The persistent Earth minimap labels North America, South America, Europe, Africa, Asia, Australia and Antarctica. Your amber marker stays in Antarctica at the very bottom. This global orientation map shows the Antarctic region rather than surveyed coordinates for procedural terrain. Click it or press M to open the larger atlas, then LOCAL / ANTARCTICA for the station, depot, James and rover.
NOSTRAVECTOR_James_Supply_Script.txt contains the ten new dialogue lines for recording.
'''
f.write_text(s,encoding='utf-8')
f=p/'package_menu.py';s=f.read_text(encoding='utf-8').replace("sources+=['hazard_script.txt'", "sources+=['antarctica_navigation.js','earth_navigation.css','james_supply_quotes.json','test_weather_cycle.js']\nfiles+=['NOSTRAVECTOR_James_Supply_Script.txt','NOSTRAVECTOR_Earth_Map_Preview.png','NOSTRAVECTOR_Earth_Minimap_Preview.png','NOSTRAVECTOR_James_Supply_Preview.png']\nsources+=['hazard_script.txt'")
f.write_text(s,encoding='utf-8')
f=p/'antarctica.html';s=f.read_text(encoding='utf-8').replace('aria-label="Direction to station"','aria-label="Direction to current objective"');f.write_text(s,encoding='utf-8')
f=p/'earth_navigation.css';s=f.read_text(encoding='utf-8').replace('font-size:17px;fill:', 'font-size:22px;fill:');f.write_text(s,encoding='utf-8')
