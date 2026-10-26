from pathlib import Path
root=Path(__file__).resolve().parent
p=root/'menu_shell.html';s=p.read_text(encoding='utf-8')
needle='<label for="jamesVolume">James voice volume</label><input id="jamesVolume" type="range" min="0" max="1" step=".05" value=".85"></div>'
assert needle in s
s=s.replace(needle,needle+'<button class="dialog-action" id="manageSaves">MANAGE SAVES &amp; CHARACTERS</button>')
p.write_text(s,encoding='utf-8')
print('Added save management to Settings.')
