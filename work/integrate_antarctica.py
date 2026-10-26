from pathlib import Path
work=Path(__file__).resolve().parent
path=work/'menu_scene.js';js=path.read_text(encoding='utf-8')
js=js.replace('if(introActive||customActive||document.querySelector','if(introActive||customActive||gameActive||document.querySelector')
js=js.replace('if(introActive||customActive){requestAnimationFrame(draw);return;}','if(introActive||customActive||gameActive){requestAnimationFrame(draw);return;}')
path.write_text(js,encoding='utf-8')
path=work/'antarctica_renderer.js';js=path.read_text(encoding='utf-8')
js=js.replace('precision mediump float;varying vec3 world,N;','precision highp float;varying vec3 world,N;')
js=js.replace('varying float opacity;','varying mediump float opacity;')
path.write_text(js,encoding='utf-8')
