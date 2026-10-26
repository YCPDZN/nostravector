from pathlib import Path
work=Path(__file__).resolve().parent
path=work/'menu_shell.html'
html=path.read_text(encoding='utf-8')
old='<span class="num">01</span>NEW GAME<span class="arrow"'
new='<span class="num">01</span><span id="primaryGameLabel">NEW GAME</span><span class="arrow"'
if old in html:html=html.replace(old,new,1)
assert 'id="primaryGameLabel"' in html
if 'id="continueGame"' not in html:
    html=html.replace('<section class="intro"', '''<dialog id="continueGame" aria-labelledby="continueTitle"><button class="close" aria-label="Close saved game">×</button><div class="kicker" id="continueSaveStatus">SAVED GAME LOADED</div><h2 id="continueTitle">CHAPTER 01</h2><p id="continueName"></p><dl><div><dt>CHECKPOINT</dt><dd>CHARACTER CREATED</dd></div><div><dt>STATUS</dt><dd>READY FOR DEPARTURE</dd></div></dl><button class="dialog-action" id="continueEdit">EDIT CHARACTER</button><button class="dialog-action" data-close>RETURN TO MENU</button></dialog>
<section class="intro"''',1)
path.write_text(html,encoding='utf-8')
