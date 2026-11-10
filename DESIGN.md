---
name: 2D Manga Sketchbook Portfolio Wall
description: Interactive 2D hand-drawn manga sketchbook under-construction page with an Umaru-style anime chibi character and synthesized comic sound effects
colors:
  paper-bg: "#faf8f5"
  paper-cream: "#f4efe6"
  ink-primary: "#141413"
  ink-secondary: "#3a3733"
  ink-muted: "#726e67"
  tone-light: "#e8e4dc"
  tone-mid: "#c7c2b8"
  tone-dark: "#6e6a63"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Patrick Hand, Fredoka, cursive, sans-serif"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Patrick Hand, cursive, system-ui, sans-serif"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  mono:
    fontFamily: "monospace"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
  drafting:
    fontFamily: "Syne, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: "-0.035em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "24px"
  xl: "36px"
---

## Overview
A hand-drawn 2D manga sketchbook under-construction surface. Replaces artificial 3D tech tropes and navbars with a tactile ink-and-paper aesthetic featuring an authentic Umaru-chan anime chibi character (orange hamster hood with hamster face, construction hardhat, carpenter mallet), building loop animation, interactive snack break props (Potato Chips and Cola), cursor hit physics, and synthesized comic sound effects.

## Colors
- **Paper Canvas**: `#faf8f5` (warm manga manuscript paper), `#f4efe6` (card fill).
- **Ink Palette**: `#141413` (deep Sumi ink line work), `#3a3733` (secondary line & hair tone), `#726e67` (subnote pencil tone).
- **Pure Black & White Manga Palette**: Strict 100% monochrome inking without colored accents. All character shading and textures use Sumi ink screentones (`#e8e4dc`, `#c7c2b8`, `#6e6a63`) and dot patterns.
- **Strictly No Blurry Neon Halos**: Pure crisp hand-drawn ink line borders (`2.5px` to `3.5px`) with offset drop shadows (`4px 4px 0 #141413`).

## Typography
- **Headline & Manga Lettering**: `Patrick Hand` paired with `Fredoka` for hand-lettered speech bubbles and title cards.
- **Copy**: `"website is currently being built....."` with sequential wave animated dots (clean card, zero clutter/subnotes).

## Layout & Hierarchy
- **Zero Navbars & Zero Audio Toggles**: Clean open sketchbook canvas.
- **Centered Title Card**: Pinned card (`box-shadow: 6px 6px 0 #141413`) with push pins and animated dots.
- **Construction & Snack Station**: Horizon line workspace featuring a blueprint mat, wooden cornerstone `< / >` block, crinkled bag of Potato Chips, and chilled 2L Cola bottle.
- **Floor Horizon Line**: Hand-drawn sumi ink horizon line with hatching ticks across the floor.

## Physics, Animation & Interaction
- **Building Loop Animation**: Umaru rhythmically taps her wooden builder's mallet on the cornerstone building block in a synchronized 3-strike loop with impact sparks, squash-and-stretch body bobs, and brow-wiping pride breaks.
- **Interactive Snack Props**: Clickable Potato Chips bag (`*CRUNCH!*` SFX, bag pop, chip quotes) and clickable 2L Cola bottle (`*PSSSHT!*` SFX, fizzy bubble particles, cola quotes).
- **Mouse Pointer Hit**: Fast cursor swipe (>280px/s) calculates velocity vector and physically hits/shoves the chibi, triggering squash-and-stretch, comic starburst, and onomatopoeia (`*BONK!*`, `ドカッ!`).
- **Return to Workstation**: When settling on the floor after being tossed or swiped, Umaru trots/waddles back to her cornerstone block and resumes building.
- **Multi-Click Tantrum**: 4 rapid clicks triggers Umaru floor roll (`ゴロゴロ!!`).
- **Grab and Toss**: Hold click on chibi to dangle by the hood; release to fling across the screen.

## Audio Engine
- 100% procedural Web Audio API anime comedy sound effects (`playBonk`, `playBoing`, `playSqueak`, `playRollRustle`, `playDizzySwirl`, `playCrunch`, `playFizz`). Zero external audio files. Unlocks cleanly on first user gesture.
