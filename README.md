# NOSTRAVECTOR

A browser-based 3D space RPG spanning five chapters, companion stories, faction diplomacy, procedural star systems and multiple galaxies.

## Play locally

Serve this folder over HTTP with Python 3:

```sh
python -m http.server 8000
```

Open http://localhost:8000 in a browser. The root `index.html` is the current desktop and mobile HTML5 release, including voice recordings, music, models and the latest nightmare sequence. Reset Progress and chapter selection are disabled in this release.

Keyboard/mouse and mobile touch controls are supported. Saves use browser storage and remain separate between different sites and browser profiles.

## Project layout

- `index.html`, `assets/`, `mobile.css`, `mobile.js`: playable browser release.
- `work/`: original game source modules, build scripts, source assets and regression checks.
- `outputs/NOSTRAVECTOR_3D_Viewer.html`: source model input required by the build.
- `release-manifest.json`: release hashes and lossless audio inventory.

## Build the standalone game

```sh
python work/build_menu.py
```

The result is `outputs/NOSTRAVECTOR_Main_Menu.html`. This large standalone file and temporary QA/build outputs are excluded from Git; the playable root release uses separate audio files.

To create a fresh browser export, choose new output directories:

```sh
python work/export_itch_html5.py --dist outputs/itch-html5-new
python work/build_itch_mobile_export.py --plain outputs/itch-html5-new --dist outputs/itch-mobile-new --archive outputs/NOSTRAVECTOR_itch.zip
python work/build_itch_mobile_export.py --pack --dist outputs/itch-mobile-new --archive outputs/NOSTRAVECTOR_itch.zip
```

Upload the resulting ZIP to itch.io as an HTML game. Keep `index.html` at the ZIP root.

On the itch.io game page, tick "Mobile friendly" (either orientation works; landscape gives more room) and "Click to launch in fullscreen" so phones get the whole screen. After changing the mobile layer or the intro, run `node work/test_itch_mobile_menu_intro_browser.js` from the repo root; it checks that the main menu scrolls by touch inside a no-scroll iframe and that the Milky Way intro keeps going when narration audio is blocked or slow.

Some historical asset-import and browser QA scripts reference the original development machine. The standalone build uses the checked-in source assets; optional QA tools may need their runtime paths adjusted.

No open-source license is granted by this repository. Game code, characters, music and recordings retain their existing ownership and permissions.
