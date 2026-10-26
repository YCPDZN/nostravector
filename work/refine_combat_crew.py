from pathlib import Path
w=Path('work')
p=w/'combat_crew_core.js';s=p.read_text(encoding='utf-8').replace("function register(q){for(const n of q.pontifex)if(!NVParty.members.some(m=>m.id===n.id))NVParty.members.push({id:n.id,name:n.name,detail:'RECRUITED PONTIFEX',pontifex:true});}", "function register(q){for(const n of q.pontifex){const old=NVParty.members.find(m=>m.id===n.id);if(old)old.name=n.name;else NVParty.members.push({id:n.id,name:n.name,detail:'RECRUITED PONTIFEX',pontifex:true});}}")
p.write_text(s,encoding='utf-8')
p=w/'companion_combat_core.js';s=p.read_text(encoding='utf-8').replace('function pose(s,id){return runtime.get(s)?.actors.get(id)||null;}',"function pose(s,id){if(typeof gameActive!=='undefined'&&!gameActive)return null;return runtime.get(s)?.actors.get(id)||null;}")
p.write_text(s,encoding='utf-8')
