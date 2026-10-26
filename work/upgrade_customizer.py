from pathlib import Path
root=Path(__file__).resolve().parents[1];work=root/'work'
p=work/'menu_shell.html';s=p.read_text(encoding='utf-8')
if 'id="editCharacter"' not in s:s=s.replace('<div class="subject-status"><span>EXPLORER CLASS</span><i></i><span>READY</span></div></section>','<div class="subject-status"><span>EXPLORER CLASS</span><i></i><span>READY</span></div><button class="edit-character" id="editCharacter">EDIT CHARACTER ↗</button></section>')
if 'id="savedNotice"' not in s:s=s.replace('<div class="edition">SOL EXPEDITION / VOLUME 01</div>','<div class="edition">SOL EXPEDITION / VOLUME 01</div><div id="savedNotice" class="saved-notice" role="status"></div>')
if 'id="narratorVolume"' not in s:s=s.replace('<button class="dialog-action" data-close>RETURN TO MENU</button></dialog>', '<div class="settings-row"><label for="narratorVolume">Narrator volume</label><input id="narratorVolume" type="range" min="0" max="1" step=".05" value=".85"></div><button class="dialog-action" data-close>RETURN TO MENU</button></dialog>',1)
if 'id="enableNarration"' not in s:s=s.replace('<button class="intro-control" id="introSkip">','<button class="intro-control intro-narration" id="enableNarration" hidden>ENABLE NARRATION</button><button class="intro-control" id="introSkip">')
s=s.replace('>SOUND OFF<','>AMBIENT OFF<');p.write_text(s,encoding='utf-8')
p=work/'menu_scene.js';s=p.read_text(encoding='utf-8').replace("if(introActive||document.querySelector('dialog[open]'))return;","if(introActive||customActive||document.querySelector('dialog[open]'))return;").replace('if(introActive){requestAnimationFrame(draw);return;}','if(introActive||customActive){requestAnimationFrame(draw);return;}').replace("on?'SOUND ON':'SOUND OFF'","on?'AMBIENT ON':'AMBIENT OFF'")
s=s.replace('gl.uniform3fv(ml.u.color,q.c)','gl.uniform3fv(ml.u.color,getWandererColor(q))')
p.write_text(s,encoding='utf-8')
p=work/'build_custom_assets.py';s=p.read_text(encoding='utf-8').replace("[0,1.55,.157]","[0,1.55,.178]").replace("[0,1.556,.173]","[0,1.556,.194]").replace("z=.160-.018","z=.186-.013");p.write_text(s,encoding='utf-8')
print('Connected customiser controls and menu profile preview.')
