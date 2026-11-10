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

## Local motion revision · November 10, 2026

Base: `074d6fc` on `main`. The checks below were completed locally before publication. Publication was subsequently authorized; the repository Actions history records the deployment result.

### Changes

- Replaced the two-pose, front-facing walk with a readable profile walk, a 24-frame cycle repeated four times, short double-support intervals, grounded stance, swing clearance, consistent knee direction, weight transfer, and opposing arm swing.
- Baked the walk to 97 editable, linear FK keys. Continuous in-betweens have at most **0.253 stage pixels** of support-foot vertical error at 1/8-frame sampling. Ground tests allow under 0.3 pixels, well below a visible pixel at the normal viewport scale.
- Replaced the elbow-reversing wave with anticipation, raise, a bent-elbow wave, and return/settle. Shoulder motion is small while waving; both feet remain still.
- Removed the extra closing-frame hold from loop playback; the duplicate closing pose does not add a 97th playback frame.
- Saved profiles round-trip through project files. Legacy version-1 files without a view still render front-facing. Existing autosaves are not silently replaced; load **Little steps** or **Hello, world** to get the new presets.
- Dense timeline keys remain editable and have a compact marker treatment. Stage FPS reflects the chosen playback rate.

### Final checks

- `npm run check`: **16/16** model tests, syntax checks passed.
- `npm run build`: passed, static `dist/` generated.
- `git diff --check`: passed.
- `http://127.0.0.1:4313/tests/browser.html`: **31 passed, 0 failed** in Chromium. Includes posing, key replacement, interpolation, undo/redo, SVG/project export, ghost/rig toggles, playback, new profiles, cancellation, scrubbing interruption, imports, invalid imports, help dismissal, autosave, and 390px overflow.
- `http://127.0.0.1:4313/tests/motion.html`: reviewed eight actual app-rendered phases, plus app playback and frame scrubbing. The review page is test-only and excluded from the build. [Captured pose sheet](screenshots/motion-review.jpg).
- Browser test console contained extension metadata errors from `chrome-extension://`, but no application errors in the successful run.

The shell executor and cloud browser use separate loopback networks. The tested preview used a native-terminal Python static server bound to **127.0.0.1 only**, serving the same shared checkout. No `file://` previews were used and no externally bound server was used.

### Limits

This remains a stylized 2D FK puppet, not a production 3D animation rig or mocap system. Feet have no heel/toe-roll channel, and hands have no wrist/finger articulation. Naturalness is partly subjective; this revision fixes measurable grounding, timing, and bend-direction errors and is ready for user visual feedback. The bounce preset is unchanged. Manual pose edits can still deliberately bend joints or move feet off the stage.
