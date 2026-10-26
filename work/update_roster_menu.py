from pathlib import Path
work=Path(__file__).resolve().parent
path=work/'menu_shell.html';html=path.read_text(encoding='utf-8')
if 'id="switchCharacters"' not in html:
    html=html.replace('<button class="menu-btn" data-dialog="settings"><span class="num">02</span>', '<button class="menu-btn" id="switchCharacters"><span class="num">02</span>SWITCH CHARACTER<span class="arrow" aria-hidden="true">→</span></button><button class="menu-btn" data-dialog="settings"><span class="num">03</span>',1)
    html=html.replace('data-dialog="credits"><span class="num">03</span>','data-dialog="credits"><span class="num">04</span>',1)
html=html.replace('<dd>CHARACTER CREATED</dd>','<dd id="continueCheckpoint">CHARACTER CREATED</dd>',1)
assert 'id="continueCheckpoint"' in html and 'id="switchCharacters"' in html
path.write_text(html,encoding='utf-8')
