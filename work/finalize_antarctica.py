from pathlib import Path
import json,re
work=Path(__file__).resolve().parent
path=work/'build_menu.py'
source=path.read_text(encoding='utf-8')
start=source.index("(out/'NOSTRAVECTOR_Menu_README.txt').write_text(")
end=source.index("print('Built standalone menu:",start)
source=source[:start]+"(out/'NOSTRAVECTOR_Menu_README.txt').write_text((work/'game_readme.txt').read_text(encoding='utf-8'),encoding='utf-8')\n"+source[end:]
quotes=json.loads('['+re.search(r'const JAMES_QUOTES=\[(.*?)\];',(work/'antarctica_game.js').read_text(encoding='utf-8'),re.S).group(1)+']')
source+="\njames_quotes="+repr(quotes)+"\n(out/'NOSTRAVECTOR_James_Script.txt').write_text('JAMES BROWN — ANTARCTIC OPENING\\n\\n'+'\\n\\n'.join(str(i+1)+'. '+q for i,q in enumerate(james_quotes)),encoding='utf-8')\n"
path.write_text(source,encoding='utf-8')
print('Updated game documentation and James dialogue export.')
