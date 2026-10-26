from pathlib import Path
p=Path('work/orion_comms_renderer.js');s=p.read_text(encoding='utf-8').replace('const p=[],n=[],indices=[]','const mouthPositions=[],n=[],indices=[]').replace('p.push(...v);n.push','mouthPositions.push(...v);n.push').replace("name:'comms-speaking-mouth',p,n,indices", "name:'comms-speaking-mouth',p:mouthPositions,n,indices");p.write_text(s,encoding='utf-8')
