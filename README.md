# KINE3D

A working English/Russian knee biomechanics learning application built with Next.js, TypeScript, React Three Fiber, Three.js, Drei, Tailwind CSS, and Zustand.

## Run locally

Use Node.js 22 LTS or newer (this environment was tested with Node.js 24.19.0) and npm.

```bash
cd Anatomy-
npm ci
npm run dev
```

The development server uses port 3000. No account, API key, database, or external anatomy asset is required.

For production:

```bash
npm run build
npm start
```

## What works

- Original procedural femur, tibia, fibula, and patella geometry; illustrative major muscle paths, cruciate/collateral ligaments, and patellar ligament.
- Orbit, zoom, anterior/lateral/posterior camera presets, reset, and browser fullscreen where supported.
- Select anatomical structures in 3D or from the searchable, keyboard-accessible structure list.
- Independent bone, muscle, ligament, label, and reference-axis visibility.
- Angle slider and numeric entry, continuous bidirectional playback, five speeds, and movement reset.
- Side-by-side reference/restricted motion with synchronized camera and requested angle.
- Adjustable restricted flexion and flexion contracture examples, with actual displayed angles and limit indication.
- Muscle highlighting indicating an illustrative movement role during playback, without claiming measured activation.
- General postoperative education in three conceptual stages, with source status and procedure-specific limitations.
- English/Russian translation of controls, explanations, source status, and error messages.
- Import self-contained GLB/glTF 2.0 files up to 20 MB as **static reference geometry**. Imported meshes are centered and uniformly scaled; motion and procedural layer controls are disabled. Choosing a knee structure restores the procedural model.
- Responsive desktop, tablet, and mobile layouts; text education remains available when WebGL cannot be initialized.

## Scientific scope

**This MVP is an educational visualization, not a validated biomechanical simulation or a clinical decision tool.** All clinical explanations need review against the specified textbook edition before clinical publication.

The primary intended references are:

1. A. I. Kapandji, _The Physiology of the Joints, Volume 2: Lower Limb_ — knee anatomy and biomechanics.
2. Maxey & Magnusson, _Rehabilitation for the Postsurgical Orthopedic Patient_ — postoperative education.
3. A. I. Kapandji, _The Physiology of the Joints, Volume 1: Upper Limb_ — reserved for future upper-limb modules, not cited as a knee source.

The books were not provided or independently accessed. No edition, chapter, page, quotation, protocol, or normative range has been invented. The interface marks the content as **requiring verification**. See [the content review checklist](docs/SCIENTIFIC_REVIEW.md).

The 0–135° control interval, default 90° restricted-flexion ceiling, default 25° contracture deficit, and 110° contracture flexion ceiling are **illustrative software parameters**, not verified normal values, diagnostic cutoffs, or postoperative precautions. A “reference” model depicts unrestricted movement within this interval, not a measured normal patient.

The femur is fixed and the tibia/fibula are the moving segment of an unloaded, open-chain demonstration. Transverse rotation is combined with a geometry-specific clearance displacement; this heuristic keeps the schematic plateau separated from the condyles and **does not simulate physiological rolling/sliding**. Patellar tracking, muscle paths, and ligament attachment sites are schematic. Menisci, articular cartilage, screw-home rotation, contact forces, muscle force, ligament strain, and patient-specific geometry are omitted. A reference axis indicates the transverse direction, not the true instantaneous axis.

Rehabilitation stages contain no timing, exercise dosage, universal angle limits, weight-bearing prescription, or return-to-activity clearance. They provide educational context only; the appropriate plan depends on the procedure and treating team.

## Validation

```bash
npm test
npm run typecheck
npm run build
```

Browser tests run against a production server on port 3100 (started automatically). Install a Playwright browser once:

```bash
npx playwright install chromium
npm run test:e2e
```

In a cloud environment with system Chromium:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

`KINE3D_TEST_PORT` changes the browser-test server port. The tests cover rendered WebGL output, motion/playback, pathology limits, camera synchronization, layers/labels, structure selection, rehabilitation navigation, translation, mobile overflow, and valid/invalid model imports. Software WebGL is enabled in the browser-test configuration to make headless checks reproducible; the application uses normal browser WebGL.

## Architecture

```text
src/app/                     Next.js route, metadata, global theme
src/components/kine-app.tsx  Workspace shell, language/mode navigation, playback clock
src/components/sidebar.tsx   Structure search, selection, and layer controls
src/components/education-panels.tsx Bilingual education and source review panels
src/components/movement-controls.tsx Angle, playback, speed, and reset controls
src/components/viewer-workspace.tsx Viewer toolbar, import UI, and camera presets
src/components/viewer.tsx    WebGL canvas, camera sync, model import display
src/components/knee-model.tsx Original selectable procedural anatomy
src/lib/knee.ts              Bilingual structure, source, and education data
src/lib/i18n.ts              Interface dictionaries
src/lib/kinematics.ts        Pure motion, constraints, and geometry transforms
src/lib/model-import.ts      Local self-contained asset validation
src/store/use-knee-store.ts  Shared interaction and camera state
tests/unit/                 Kinematics and state regression tests
tests/e2e/                  Production browser interaction tests
```

To add a pathology, define its constraints and educational content, extend the typed pathology state, and add a comparison test. To add a joint, keep its content, geometry, and kinematics in their own module rather than expanding this knee model into a whole-body mesh. Loaded GLB/glTF assets need an explicitly reviewed rig and anatomical node mapping before movement or anatomical layer selection can be applied; this MVP does not guess them.

All built-in geometry is generated from original code. No textbook illustrations or third-party anatomical meshes are distributed. Import only assets you are authorized to use; external buffer/image URLs are rejected, and imported files remain local to the browser. Draco/Meshopt-compressed or otherwise decoder-dependent assets are not supported in this MVP.

## Cloud setup

The checkout is `/workspace/Anatomy-`. If npm's default cache is not writable, use `npm ci --cache /workspace/.cache/npm`. Run in the existing checkout; each cloud task already has an isolated environment, so creating a worktree is unnecessary. The server process must restart in a new task even when dependencies and build outputs are restored. The application is published in the `kine3d-mvp` branch. Select that branch when cloning or downloading the project; the initial `main` branch does not contain the application.
