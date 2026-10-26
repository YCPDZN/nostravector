from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1];work=root/'work'
p=work/'menu_shell.html';html=p.read_text(encoding='utf-8')
html=html.replace('data-dialog="launch"','id="newGame"').replace('BEGIN EXPEDITION','NEW GAME')
html=re.sub(r'<button class="menu-btn" data-dialog="archive">.*?</button>','',html)
html=html.replace('<span class="num">03</span>SETTINGS','<span class="num">02</span>SETTINGS').replace('<span class="num">04</span>CREDITS','<span class="num">03</span>CREDITS')
html=re.sub(r'<dialog id="(?:launch|archive)".*?</dialog>\n','',html)
html=html.replace('ENTER TO BEGIN','ENTER FOR NEW GAME')
html=html.replace('</style>','__INTRO_CSS__\n</style>')
intro='''<section class="intro" id="intro" aria-label="Milky Way prologue cutscene" hidden>
<canvas id="galaxyScene" aria-label="A luminous barred spiral galaxy rotating slowly in space"></canvas>
<div class="intro-header"><div class="intro-brand">NOSTRAVECTOR</div><div class="cutscene-controls"><button class="intro-control" id="introReturn">RETURN TO MENU</button><button class="intro-control" id="introPause" aria-pressed="false">PAUSE</button><button class="intro-control" id="introSkip">SKIP INTRO ↗</button></div></div><div class="cinema-rail" aria-hidden="true"></div>
<div class="galaxy-caption">THE MILKY WAY<span>PROLOGUE / A FIRST DEPARTURE</span></div>
<div class="quote-stage"><div class="narrator-label" id="narratorLabel"></div><p class="narrator-line" id="quoteText" aria-live="polite" aria-atomic="true"></p></div>
<div class="intro-footer"><span>EVERY LIGHT, A POSSIBILITY</span><div class="quote-progress" aria-label="Five narrator quotes"><span></span><span></span><span></span><span></span><span></span></div><span>NV-01 / ORIGIN</span></div><div class="intro-error" id="introError" role="status"></div>
<div class="intro-end" id="introEnd" hidden><div class="chapter">CHAPTER 01</div><h2>THE WANDERER</h2><div class="subject-id">NV-01 / NOSTRAVECTOR</div><div class="intro-end-actions"><button id="introReplay">REPLAY INTRO</button><button id="introEndReturn">RETURN TO MENU</button></div></div>
</section>'''
html=html.replace('<script>__SCRIPT__</script>',intro+'\n<script>__SCRIPT__</script>')
p.write_text(html,encoding='utf-8')
scene=work/'menu_scene.js';js=scene.read_text(encoding='utf-8')
js=js.replace("if(document.querySelector('dialog[open]'))return;","if(introActive||document.querySelector('dialog[open]'))return;")
js=js.replace('last=now;if(auto', 'last=now;if(introActive){requestAnimationFrame(draw);return;}if(auto')
scene.write_text(js,encoding='utf-8')
quotes=[
    'Before we could reach the stars, we gave them names.',
    'Beyond our small blue world, the galaxy kept turning.',
    'Countless lights. Unwritten histories. Worlds waiting in the dark.',
    'Into that silence, we sent a single wanderer.',
    'Every journey begins with a choice. Yours begins now.',
]
config=[dict(id=i+1,text=text,duration=7.0) for i,text in enumerate(quotes)]
(work/'intro_quotes.json').write_text(json.dumps(config,indent=2),encoding='utf-8')
print('Updated menu and created five narrator quotes.')
