from pathlib import Path
p=Path(__file__).resolve().parent/'antarctica_renderer.js';s=p.read_text(encoding='utf-8')
old="draw(q,M.mul(pose.root,pose.bones[q.bone]||pose.bones.body),isJames?(q.mat?getWandererColor(q,jamesProfile):q.c):getWandererColor(q));"
assert old in s
s=s.replace(old,"const model=M.mul(pose.root,pose.bones[q.bone]||pose.bones.body);if(isJames)jamesFacePart(q,model);else draw(q,model,getWandererColor(q));")
old="let eye,target;if(introMode)"
assert old in s
s=s.replace(old,"let eye,target;if(jamesConversation.active){const j=s.james,jy=A.ground(j.x,j.z,s.seed);target=[j.x,jy+1.58,j.z];eye=[j.x+Math.sin(j.yaw)*1.35+Math.cos(j.yaw)*.12,jy+1.77,j.z+Math.cos(j.yaw)*1.35-Math.sin(j.yaw)*.12];}else if(introMode)")
p.write_text(s,encoding='utf-8')
p=Path(__file__).resolve().parent/'test_antarctica_runtime.js';s=p.read_text(encoding='utf-8')
old="+'\\n'+voice+'\\n'+game"
assert old in s
s=s.replace(old,"+'\\n'+fs.readFileSync(root+'/antarctica_speech.js','utf8')+'\\n'+voice+'\\n'+game")
p.write_text(s,encoding='utf-8')
print('Updated mouth geometry, conversation camera and integration harness.')
