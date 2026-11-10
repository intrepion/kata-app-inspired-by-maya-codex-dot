# Inspiration research

Research checked November 10, 2026. Primary sources informed workflow concepts, not copied code, assets, or UI.

- [Autodesk: Keyframe animation and the Graph Editor](https://help.autodesk.com/cloudhelp/2025/ENU/Maya-Animation/files/GUID-9E69ABB3-E94B-4D67-9935-40F77FD2E9E0.htm) explains visual keys, time/value curves, and interpolation tangents. Kinframe borrows the teachable idea of keys plus interpolation, with only smooth, linear, and hold modes.
- [Autodesk: Graph Editor interface overview](https://help.autodesk.com/cloudhelp/2026/ENU/Maya-Animation/files/GUID-1C521455-9DF8-47D6-AD9C-6AD5C91FFAA3.htm) describes key/curve visualization and a current-time marker. Kinframe supplies a compact channel preview and timeline playhead rather than a full curve editor.
- [Autodesk: Keyframe Animation](https://help.autodesk.com/cloudhelp/2024/ENU/Maya-Animation/files/GUID-66ED4510-CC1B-4E11-918B-B7DC447E38A7.htm) describes transforming objects or skeletons over time. Kinframe makes that idea approachable through one original fixed FK puppet.

## Scope decision

A full Maya-like 3D suite would be unrealistic for a small browser kata. The functional vertical slice is character posing, full-pose key creation, interpolation, playback, and editable save files. The visible character uses original vector geometry and a deliberately friendly wooden-traveler identity. It is a 2D rigging/animation study, not native Maya support or feature parity.

## Walk and wave revision · November 10, 2026

- [Animation Mentor: Animating a Basic Human Walk Cycle](https://www.animationmentor.com/blog/tutorial-animating-human-walk-cycle/) informed contact/down/passing/up structure, a 24-frame cycle, support-foot travel, and opposing arm swing. The walk is now drawn in profile so forward motion is legible in the 2D rig. Original foot paths are solved when generating the preset and baked to ordinary FK keys; playback does not secretly override edited poses.
- [Animation Mentor: Overlap and Follow-Through](https://www.animationmentor.com/blog/tutorial-animate-overlap-and-follow-through/) informed a greeting with anticipation, arm raise, a relatively quiet shoulder during the wave, and a return/settle. The raised elbow no longer changes its bend direction. All geometry and key values remain original.

These references guide stylized animation, not a motion-capture or anatomical simulation claim. This rig has no ankle, wrist, finger, or 3D depth channels.
