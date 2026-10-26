from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'antarctica_core.js';s=f.read_text(encoding='utf-8').replace("&&!s.supplyDialogueDone&&!s.suppliesPlanKnown)s.supplyDialoguePending=true;", "&&!s.supplyDialogueDone&&!s.suppliesPlanKnown&&!('supplyDialoguePending' in w))s.supplyDialoguePending=true;").replace('s.car?.driving?.6:0','s.car?.driving?0.6:0');f.write_text(s,encoding='utf-8')
f=p/'antarctica_hazards.js';s=f.read_text(encoding='utf-8').replace('seconds=Math.ceil(s.stormRemaining);', 'seconds=Math.ceil(s.stormRemaining),clearSeconds=Math.ceil(s.nextBlizzardRemaining);').replace('Math.floor(s.nextBlizzardRemaining/60)', 'Math.floor(clearSeconds/60)').replace('Math.ceil(s.nextBlizzardRemaining)%60', 'clearSeconds%60');f.write_text(s,encoding='utf-8')
f=p/'antarctica_renderer.js';s=f.read_text(encoding='utf-8').replace('severity=inside?0:s.superBlizzard?1:.45', "calm=s.hazardStage==='complete'&&!s.superBlizzard,severity=inside?0:s.superBlizzard?1:calm?.04:.45").replace('fogRange=inside?140:s.superBlizzard?12-gust*3.5:38-storm*12', 'fogRange=inside?140:s.superBlizzard?12-gust*3.5:calm?190:38-storm*12').replace('count=s.superBlizzard?flakeCount:3200', 'count=s.superBlizzard?flakeCount:calm?350:3200');f.write_text(s,encoding='utf-8')
f=p/'test_antarctica_runtime.js';s=f.read_text(encoding='utf-8').replace("fs.readFileSync(root+'/antarctica_hazards.js','utf8')+'\\nfunction", "fs.readFileSync(root+'/antarctica_hazards.js','utf8')+'\\n'+fs.readFileSync(root+'/antarctica_navigation.js','utf8')+'\\nfunction")
# Test maps use placeholders; no external imagery or storage is needed.
s=s.replace('introActive:false,intro:', "earthSource:'data:image/jpeg;base64,AA==',introActive:false,intro:")
f.write_text(s,encoding='utf-8')
f=p/'test_antarctica_hazards.js';s=f.read_text(encoding='utf-8').replace("assert.equal(run('polarState.superBlizzard'),false);assert.equal(run('polarState.stormRemaining'),0);", "assert.equal(run('polarState.superBlizzard'),false);assert.equal(run('polarState.stormRemaining'),0);assert.equal(run('polarState.supplyDialoguePending'),true);")
f.write_text(s,encoding='utf-8')
