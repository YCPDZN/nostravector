# NOSTRAVECTOR

A browser-based 3D space RPG: five chapters, companion stories, faction diplomacy, procedural star systems and several galaxies. See `README.md` for the full overview.

## Working on it from anywhere

This repo is the project's home. It's edited both on the user's PC and in Claude Code cloud sessions (phone/web), so:
- Commit and push every finished change. A cloud container is thrown away after the session.
- Pull before starting work, so changes made elsewhere aren't lost.
- Don't depend on paths from the original Windows machine. Some old QA/import scripts in `work/` do; adjust them instead of assuming those paths exist.

## Running it

- Play: `python3 -m http.server 8767` in the repo root, then open http://localhost:8767 (also in `.claude/launch.json`).
- The playable release is `index.html` + `assets/` + `mobile.css` + `mobile.js`. Audio lives in `assets/audio/` as separate files.
- In a cloud session, use the pre-installed Playwright Chromium to load the page and screenshot it to check changes.

## Layout

- `work/`: original source modules, build scripts (`build_*.py`, `export_*.py`) and regression checks (`test_*.js`, many `*_browser.js`).
- `outputs/NOSTRAVECTOR_3D_Viewer.html`: model input the build needs. Everything else in `outputs/` is generated and git-ignored.
- `release-manifest.json`: release hashes and audio inventory.

## Building

- Standalone: `python3 work/build_menu.py` → `outputs/NOSTRAVECTOR_Main_Menu.html` (git-ignored, large).
- itch.io export: see README. Keep `index.html` at the ZIP root.
- Keep root `index.html` in sync with source changes in `work/` when a change should reach the playable release.

## Rules

- Reset Progress and chapter selection stay disabled in this release.
- Saves use browser storage; don't break existing save keys.
- No open-source licence; don't add one.
