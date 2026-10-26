"""Build a portable Windows launcher with the standalone game embedded."""
from pathlib import Path
import gzip, hashlib, json, subprocess
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parents[1]
work=root/'work'
out=root/'outputs'
build=work/'desktop-build'
build.mkdir(exist_ok=True)
source=out/'NOSTRAVECTOR_Main_Menu.html'
html=source.read_bytes()
bridge=b'<script src="/desktop-bridge.js" defer></script>'
assert b'/desktop-bridge.js' not in html
payload=html.replace(b'</head>',bridge+b'</head>',1)
compressed=build/'game.html.gz'
with compressed.open('wb') as f:
    with gzip.GzipFile(filename='',mode='wb',fileobj=f,compresslevel=6,mtime=0) as z:
        z.write(payload)

icon=Image.new('RGBA',(256,256),(4,10,22,255))
d=ImageDraw.Draw(icon)
d.rounded_rectangle((10,10,245,245),radius=48,outline='#69e5ee',width=5)
d.ellipse((27,27,228,228),outline='#223f59',width=3)
font=ImageFont.truetype('C:/Windows/Fonts/consolab.ttf',104)
box=d.textbbox((0,0),'NV',font=font)
d.text(((256-(box[2]-box[0]))/2,66),'NV',font=font,fill='#c8f5fa')
d.line((55,197,200,197),fill='#62dae7',width=5)
icon.save(build/'nostravector.ico',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
exe=out/'nostravector.exe'
csc='C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe'
subprocess.run([csc,'/nologo','/target:winexe','/platform:x64','/optimize+',
                '/reference:System.Windows.Forms.dll','/out:'+str(exe),
                '/win32icon:'+str(build/'nostravector.ico'),
                '/resource:'+str(compressed)+',NOSTRAVECTOR.Game.gz',
                str(work/'desktop_launcher.cs')],check=True)
manifest={'exe':exe.name,'bytes':exe.stat().st_size,'sha256':hashlib.sha256(exe.read_bytes()).hexdigest(),
          'embeddedGameSha256':hashlib.sha256(html).hexdigest(),'origin':'http://127.0.0.1:17825',
          'profile':'%LOCALAPPDATA%/NOSTRAVECTOR/DesktopProfile','runtime':'Windows .NET Framework 4.5+ and Edge or Chrome'}
(out/'NOSTRAVECTOR_EXE_Build.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(out/'NOSTRAVECTOR_EXE_README.txt').write_text('''NOSTRAVECTOR / PORTABLE WINDOWS EDITION

Double-click nostravector.exe. No Python, Node, installer or separate game files are needed.
The executable embeds the current game and opens a dedicated Edge app window (Chrome fallback).
Requires 64-bit Windows with .NET Framework 4.5+ and Microsoft Edge or Google Chrome.
The game runs locally; internet is not required for its embedded assets.

SAVES
Use the game's manual Save Game button. Closing the app does not automatically save.
Desktop saves persist in %LOCALAPPDATA%/NOSTRAVECTOR/DesktopProfile.
Keep that folder when replacing the executable with a later build.
Existing browser/preview saves remain untouched and separate from desktop saves.
The local address stays http://127.0.0.1:17825 to preserve storage between launches.
Do not launch the desktop edition in InPrivate/Incognito mode or clear its profile.

CLOSING AND REOPENING
Close the game window normally. Its small local launcher stops shortly afterward.
Reopening while it is running opens the same local game origin and save profile.
If port 17825 is occupied by an unrelated program, close that program and retry.
Launcher errors are recorded in %LOCALAPPDATA%/NOSTRAVECTOR/launcher-error.txt.

This locally built executable is unsigned. It is not a native graphics-engine conversion;
it packages the full WebGL game in a Windows launcher and browser app window.
''',encoding='utf-8')
print(json.dumps(manifest,indent=2))
