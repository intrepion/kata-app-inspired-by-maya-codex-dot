# Kata Kinframe verification record

## Automated checks · 2026-11-10

- `npm run check`: passed JavaScript syntax checks and all 10 Node model tests.
- `npm run build`: passed; generates a dependency-free static `dist/`.
- Reviewed project validation, import size limits, local storage, undo/redo, export implementation, and documented scope.

## Browser release checks

Passed in Chromium through the loopback HTTP server at `http://127.0.0.1:4387/` on 2026-11-10. The app was opened under its repository folder, never through `file://`.

- **22 browser interaction assertions passed, 0 failed.** Includes editing controls, undo/redo, presets, playback, valid import round trip, malformed import rejection with state preservation, export content, help dialog, and no horizontal overflow at 390px.
- Independent production-page playback advanced successfully and stopped/reset through the UI.
- Desktop and 390px layouts visually inspected. Real captures: [desktop](screenshots/desktop.png) and [narrow](screenshots/narrow.png). Narrow captures show the 390px app inside its centered test iframe, including surrounding blank background; these are not physical-device screenshots.
- Browser test playback waits now poll observable progress for up to five seconds instead of assuming a 140–150ms animation-frame cadence. Background cloud tabs can throttle animation; the suite passed on rerun with the app visible.
- Inspected browser error logs contained browser-extension metadata errors, with no app-origin errors observed in those logs.

Run `npm run dev` and visit `http://127.0.0.1:4313/tests/browser.html` for the self-running interaction harness. It mocks download links, validates generated export blobs, exercises import with in-memory files, and accepts replacement dialogs. These are not OS file-picker or download-dialog tests.

Visit the main app and `http://127.0.0.1:4313/tests/responsive.html` for desktop and 390px visual checks. Always serve through HTTP; do not use direct file navigation.

## Boundaries

No Safari, Firefox, physical touch device, assistive-technology audit, or long-duration performance claim. Autosave depends on browser storage; downloaded project files remain the durable backup.


## Publication

The tested runtime commit `489adff8319c13bde5612bd6ca4d7a466958e692` was pushed to [the public repository](https://github.com/intrepion/kata-app-inspired-by-maya-codex-dot). Its checks, build, and GitHub Pages deployment succeeded in [run 42748749104](https://github.com/intrepion/kata-app-inspired-by-maya-codex-dot/actions/runs/42748749104) on 2026-11-10. The app is available at [Kata Kinframe](https://intrepion.github.io/kata-app-inspired-by-maya-codex-dot/). This publication record does not expand the local device, accessibility or file-dialog verification described above.
