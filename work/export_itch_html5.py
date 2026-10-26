"""Create a separate, lossless HTML5 release; never rewrite the standalone game."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import argparse, base64, hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'outputs/NOSTRAVECTOR_Main_Menu.html'
DIST = ROOT / 'outputs/NOSTRAVECTOR_ITCH_HTML5'
ARCHIVE = ROOT / 'outputs/NOSTRAVECTOR_itch_HTML5.zip'
AUDIO = re.compile(r'data:audio/mpeg;base64,([A-Za-z0-9+/=]+)')
PRELOAD = re.compile(r"(\.preload\s*=\s*)(['\"])(?:auto|metadata)\2")
OLD_DECODE = """const encoded=a.src.split(',')[1],bytes=Uint8Array.from(atob(encoded),q=>q.charCodeAt(0));
    jamesAudioContext.decodeAudioData(bytes.buffer).then(buffer=>{"""
NEW_DECODE = """const decodedBytes=(a.currentSrc||a.src).startsWith('data:')
      ?Promise.resolve(Uint8Array.from(atob((a.currentSrc||a.src).split(',')[1]),q=>q.charCodeAt(0)).buffer)
      :fetch(a.currentSrc||a.src).then(response=>{if(!response.ok)throw Error('Voice recording unavailable');return response.arrayBuffer();});
    decodedBytes.then(bytes=>jamesAudioContext.decodeAudioData(bytes)).then(buffer=>{"""
DECODE_PATTERN = re.compile(re.escape(OLD_DECODE.splitlines()[0]) + r'\r?\n' + re.escape(OLD_DECODE.splitlines()[1]))


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def prepare():
    original = SOURCE.read_bytes()
    source_hash = hashlib.sha256(original).hexdigest()
    html = original.decode('utf-8')
    assert len(DECODE_PATTERN.findall(html)) == 1, 'Review the acoustic decoder before exporting a new game version.'
    DIST.mkdir(exist_ok=False)
    (DIST / 'assets/audio').mkdir(parents=True)
    clips, by_hash = [], {}

    def externalize(match):
        binary = base64.b64decode(match[1], validate=True)
        digest = hashlib.sha256(binary).hexdigest()
        if digest not in by_hash:
            name = f'assets/audio/{len(clips)+1:04d}-{digest[:16]}.mp3'
            (DIST / name).write_bytes(binary)
            clips.append({'path': name, 'bytes': len(binary), 'sha256': digest})
            by_hash[digest] = name
        return by_hash[digest]

    references = len(AUDIO.findall(html))
    exported = AUDIO.sub(externalize, html)
    # Prove that externalization preserves every original byte, including all story/game code.
    restored = re.sub(r'assets/audio/\d{4}-[0-9a-f]{16}\.mp3',
                      lambda m: 'data:audio/mpeg;base64,' + base64.b64encode((DIST / m[0]).read_bytes()).decode('ascii'),
                      exported)
    assert restored.encode('utf-8') == original, 'The export changed more than audio storage.'
    del restored, html, original
    exported = DECODE_PATTERN.sub(lambda _: NEW_DECODE, exported)
    # Recording durations are already in the game. Fetch audio only when playback needs it.
    exported, lazy = PRELOAD.subn(lambda m: m[1] + m[2] + 'none' + m[2], exported)
    (DIST / 'index.html').write_text(exported, encoding='utf-8', newline='')
    manifest = {
        'format': 'NOSTRAVECTOR HTML5 / itch.io', 'version': 1,
        'source': SOURCE.name, 'source_sha256': source_hash,
        'content': 'All game code, chapters 1–5, models, images, galaxy catalogues, music and voice recordings from the standalone build.',
        'audio_references': references, 'unique_audio_files': len(clips),
        'export_only_changes': ['Lossless external MP3 files', 'HTTP-compatible acoustic decoder', f'{lazy} audio preload assignments made lazy'],
        'index_sha256': sha(DIST / 'index.html'), 'audio': clips,
    }
    (DIST / 'release-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    (DIST / 'README.txt').write_text(
        'NOSTRAVECTOR / ITCH.IO HTML5 RELEASE\n\n'
        'Upload NOSTRAVECTOR_itch_HTML5.zip as an HTML Game and enable browser play. '
        'Choose click-to-play/fullscreen. Keep index.html at the ZIP root and include the assets folder.\n\n'
        'The complete current game is included: chapters 1–5, every recorded voice and music track, '
        'all models and all introduced galaxies. No audio was re-encoded or removed.\n'
        'The standalone game and existing saves/files were not edited. The hosted game uses browser storage for saves; '
        'saves on a different website/origin remain separate.\n\n'
        'For a local preview, serve this directory over HTTP. Direct file:// preview does not support '
        'the browser audio fetch used for acoustic lip sync.\n', encoding='utf-8')
    assert sha(SOURCE) == source_hash, 'The source changed during export; rebuild from the latest game.'
    validate()


def validate():
    m = json.loads((DIST / 'release-manifest.json').read_text(encoding='utf-8'))
    assert sha(SOURCE) == m['source_sha256'], 'The standalone game has changed since this export.'
    assert sha(DIST / 'index.html') == m['index_sha256']
    for clip in m['audio']:
        p = DIST / clip['path']
        assert p.stat().st_size == clip['bytes'] and sha(p) == clip['sha256']
    files = sorted(p for p in DIST.rglob('*') if p.is_file())
    total = sum(p.stat().st_size for p in files)
    assert len(files) <= 1000 and total < 500_000_000
    assert all(p.stat().st_size < 200_000_000 and len(p.relative_to(DIST).as_posix()) <= 240 for p in files)
    print(json.dumps({'files': len(files), 'audio_files': len(m['audio']), 'index_bytes': (DIST/'index.html').stat().st_size,
                      'total_extracted_bytes': total, 'original_unchanged': True}), flush=True)
    return files


def pack():
    files = validate()
    with ZipFile(ARCHIVE, 'x', ZIP_DEFLATED, compresslevel=9) as z:
        for p in files:
            z.write(p, p.relative_to(DIST).as_posix())
    with ZipFile(ARCHIVE) as z:
        assert 'index.html' in z.namelist() and len(z.infolist()) == len(files)
        assert z.testzip() is None
    assert ARCHIVE.stat().st_size < 1_000_000_000
    print(json.dumps({'zip': str(ARCHIVE), 'bytes': ARCHIVE.stat().st_size}), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--pack', action='store_true')
    parser.add_argument('--dist', type=Path, default=DIST)
    parser.add_argument('--archive', type=Path, default=ARCHIVE)
    args = parser.parse_args()
    DIST, ARCHIVE = args.dist.resolve(), args.archive.resolve()
    pack() if args.pack else prepare()
