"""Add responsive UI and touch input only to a new copy of the HTML5 release."""
from pathlib import Path
import argparse, json, shutil
import export_itch_html5 as base

ROOT = Path(__file__).resolve().parents[1]
PLAIN = ROOT / 'outputs/NOSTRAVECTOR_ITCH_HTML5'
MOBILE = ROOT / 'outputs/NOSTRAVECTOR_ITCH_MOBILE'
base.DIST = MOBILE
base.ARCHIVE = ROOT / 'outputs/NOSTRAVECTOR_itch_HTML5_Mobile_Release.zip'


def prepare():
    if not MOBILE.exists():
        shutil.copytree(PLAIN, MOBILE)
    manifest = json.loads((PLAIN / 'release-manifest.json').read_text(encoding='utf-8'))
    html = (PLAIN / 'index.html').read_bytes().decode('utf-8')
    assert html.count('</body>') == 1
    html = html.replace('content="width=device-width,initial-scale=1"', 'content="width=device-width,initial-scale=1,viewport-fit=cover"', 1)
    html = html.replace('</body>', '<link rel="stylesheet" href="mobile.css"><script src="mobile.js"></script>\n</body>')
    (MOBILE / 'index.html').write_text(html, encoding='utf-8', newline='')
    for source, target in [('itch_mobile.css', 'mobile.css'), ('itch_mobile_controls.js', 'mobile.js')]:
        shutil.copyfile(ROOT / 'work' / source, MOBILE / target)
    manifest['format'] = 'NOSTRAVECTOR HTML5 / desktop and mobile'
    manifest['mobile'] = {'controls': ['movement thumbstick', 'swipe camera and ship steering', 'fire', 'jump', 'sprint/boost', 'brake', 'interact', 'pause/save'],
                          'layout': ['portrait', 'landscape', 'safe areas', 'responsive maps and dialogs'],
                          'files': [{'path': p, 'sha256': base.sha(MOBILE / p)} for p in ['mobile.css', 'mobile.js']]}
    manifest['export_only_changes'].append('Responsive mobile layout and context-aware touch controls')
    manifest['index_sha256'] = base.sha(MOBILE / 'index.html')
    (MOBILE / 'release-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    readme = (PLAIN / 'README.txt').read_text(encoding='utf-8').replace('NOSTRAVECTOR_itch_HTML5.zip', base.ARCHIVE.name)
    readme += ('\nMOBILE SUPPORT\nEnable itch.io’s Mobile Friendly option. Portrait and landscape are supported; landscape gives more space. '
               'Move with the left thumbstick. Drag the game view to look or steer your ship. Hold FIRE, RUN/BOOST or BRAKE as needed. '
               'INTERACT uses the nearest available action; pause to save. The objective card expands when tapped. '
               'Extra toolbar actions scroll horizontally. Touch controls can be toggled in Settings. '
               f'All chapters, galaxies, music and {manifest["unique_audio_files"]} unchanged audio assets remain included.\n')
    (MOBILE / 'README.txt').write_text(readme, encoding='utf-8')
    base.validate()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--pack', action='store_true')
    parser.add_argument('--plain', type=Path, default=PLAIN)
    parser.add_argument('--dist', type=Path, default=MOBILE)
    parser.add_argument('--archive', type=Path, default=base.ARCHIVE)
    args = parser.parse_args()
    PLAIN, MOBILE = args.plain.resolve(), args.dist.resolve()
    base.DIST, base.ARCHIVE = MOBILE, args.archive.resolve()
    base.pack() if args.pack else prepare()
