from pathlib import Path
import re
root=Path(__file__).resolve().parent
p=root/'antarctica.html';s=p.read_text(encoding='utf-8');needle='<div class="polar-controls">';assert needle in s
s=s.replace(needle,'<div id="suitHeat" hidden><div class="stamina-label"><span>SUIT HEAT</span><span id="suitHeatNumber">100%</span></div><progress id="suitHeatBar" aria-label="Suit heat" max="100" value="100"></progress></div>'+needle)
p.write_text(s,encoding='utf-8')
s=(root/'antarctica_hazards.js').read_text(encoding='utf-8');text=re.search(r"const SUIT_WEATHER_WARNING='(.*?)';",s).group(1)
lessons=re.findall(r"\{title:'(.*?)',text:'(.*?)'\}",s)
(root/'hazard_script.txt').write_text('SUIT WARNING\n'+text+'\n\nNARRATOR — HAZARD TUTORIAL\n\n'+'\n\n'.join(str(i+1)+'. '+title+'\n'+line for i,(title,line) in enumerate(lessons))+'\n',encoding='utf-8')
p=root/'build_menu.py';s=p.read_text(encoding='utf-8');needle="(work/'antarctica.css').read_text(encoding='utf-8')";assert needle in s
s=s.replace(needle,needle+"+'\\n'+(work/'hazard.css').read_text(encoding='utf-8')")
p.write_text(s,encoding='utf-8')
print('Added suit heat HUD, hazard styles and narrator script.')
