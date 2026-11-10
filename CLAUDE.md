# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Local Preview Server**:
  ```bash
  npx serve .
  # or
  python -m http.server 8000
  ```
  The page is self-contained and directly double-clickable via `file://` with no build steps or CORS issues.

- **Syntax Check**:
  ```bash
  node -c audio.js; node -c particles.js; node -c app.js
  ```

- **Design System & Quality Detector**:
  ```bash
  & "$HOME/.claude/skills/impeccable/scripts/impeccable.cmd" detect index.html style.css
  ```

## Architecture & System Design

This project is a zero-dependency, interactive 2D manga sketchbook "under construction" landing page featuring an Umaru-chan inspired anime chibi character, 2D physics simulation, and procedural Web Audio comedy sound synthesis.

### Global Namespace & State Sharing
Everything communicates through `window.PortfolioWall`:
- `window.PortfolioWall.sound` (`audio.js`): Web Audio API procedural synthesizer for anime/cartoon bonks, spring boings, chibi squeaks, roll rustles, and dizzy warbles. Zero external audio files; unlocks cleanly on first user gesture or via corner ink sound button (`#btn-ink-sound`) / `M` key.
- `window.PortfolioWall.particles` (`particles.js`): 60fps delta-time canvas engine managing `#fx-canvas` (manga radiating impact starbursts, directional speedlines, floating onomatopoeia SFX such as `*BONK!*` and `*POKE*`, and scalloped ink dust clouds).
- `window.PortfolioWall.app` (`app.js`): Main controller managing the 2D physics engine, continuous mouse velocity tracking, pointer hit-testing, grab-and-toss mechanics, and the Chibi character state machine.

### Core Subsystems
1. **Interactive Chibi Physics & State Machine (`app.js`)**:
   - **Cursor Hit Collision**: Tracks instantaneous cursor velocity vector `(vx, vy)`. When cursor passes through the chibi's circular hitbox at speed (>280 px/s), it applies physical impulses, momentum transfer, and spring squash-and-stretch (`scaleX`, `scaleY`).
   - **Boundary & Surface Collisions**: Chibi bounces off viewport left/right edges, the sketch floor line, and the bottom edge of the manga title card (`#title-card`), triggering card jiggle animations and impact stars.
   - **States**:
     - `IDLE`: Gentle breathing bob (`#chibi-squash-root`), occasional ear twitches and waddles.
     - `HIT_AIRBORNE`: Tumbling mid-air with velocity-driven rotation and flailing limbs.
     - `DIZZY`: Triggered by heavy impacts (>750 px/s) or roof clacks; sits with `@ @` spiral eyes and warble sound.
     - `ROLLING`: Triggered by 4 rapid clicks; rolls side-to-side across the floor kicking stubby legs (Umaru-chan tantrum).
     - `POUT`: Cross anger vein (`💢`) on hood, puffed cheeks, and comic grumbles.
     - `GRABBED`: Click-and-drag picks up chibi by the scruff of its hood with pendular swing physics; releasing flings with throw velocity.

2. **2D Manga Sketchbook Stage & DOM Hierarchy (`index.html`, `style.css`)**:
   - **Monochrome Drawing Palette**: Warm manuscript paper (`#faf8f5`), Sumi ink line art (`#141413`), halftone screentones (`#e8e4dc`, `#c7c2b8`).
   - **Articulated 2D Chibi SVG (`#chibi-svg`)**: Rigged vector character with hamster hood cape, twitching ears, soft anime bangs, cheek blush hash lines (`///`), 6 switchable eye expressions, and 4 switchable mouths.
   - **Pinned Manga Title Card (`#title-card`)**: Pinned card displaying `"website is currently being built....."` with 5 sequential animated dots.
   - **Full-Screen FX Overlay (`#fx-canvas`)**: High-DPI canvas overlay with `pointer-events: none` rendering comic onomatopoeia and impact bursts.

3. **Design Authorities**:
   - `PRODUCT.md`: Product positioning, target audience, and durable constraints.
   - `DESIGN.md`: Token palette (manga ink and screentones), typography (`Patrick Hand`, `Fredoka`), and interaction specifications.
