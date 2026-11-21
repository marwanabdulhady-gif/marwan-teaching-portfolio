# Grade 1 · Clock Garden prototype

**Status:** standalone digital learning prototype; not an approved Mowazi lesson or classroom-tested activity.

**Built:** 17 November 2026
**Activity:** [`games/play/g1-clock-garden.html`](../../games/play/g1-clock-garden.html)

**Launcher:** [`games/index.html`](../../games/index.html) · **Screenshots:** [`screenshots/`](../../screenshots/)

## Intended learning

The child reads **full-hour and half-hour times on an analogue clock** by using both hands: the long minute hand at 12 means “o’clock”; at 6 means “half past”; the short hour hand names the hour or sits between the current and next number. The activity deliberately works only on this time-reading objective. The supplied Grade 1 brief and standalone HTML template informed its age-appropriate, picture-led, guided-to-independent structure; the older Fikr star-scoring engine is intentionally not reused because the Mowazi activity scope calls for calm, non-competitive practice.

## Drive evidence and mapping boundary

The source read for this prototype is the Drive lesson pack [G01-U01-MAT-L06 — non-standard length measurement and time in hours and half hours](https://docs.google.com/document/d/1eEI89DSlPw4ZpKqXhGQ2KkbTKy96WdkjxecvaU-vCvU/edit). The pack identifies itself as a Grade 1, Unit 1, first-semester, 45-minute specialist lesson; it states `G01-U01-MAT-L06`, cites `1.MD.B.3` for reading/writing whole and half hours on analogue and digital clocks, and also includes a separate repeated-non-standard-unit length outcome (`1.MD.A.2`). The game supports only the clock portion; it does **not** cover the lesson’s length-measurement outcome or stand in for the integrated lesson pack.

The pack describes its readiness as an internal `P2 → P3` draft awaiting independent adjudication and classroom trial. Its lesson address is recorded here as the source document’s stated draft code—not as independent verification against the current live annual map. Accordingly, this activity is **not labelled map-aligned, curriculum-approved, or classroom-tested**. Check the live map and obtain the required reviews before making any such claim or using this as a scheduled lesson component.

The sequence bundle [G01-MAT-01:10](https://docs.google.com/document/d/1twOsYEPEctWhkOdT5HF0WxSlIDkpAORw21NfQf8cHmo/edit) is additional draft-level context only. It is not the basis for asserting a particular map assignment. The local ledger remains at [`game-source-mapping.md`](game-source-mapping.md).

## Activity shape

1. **Explore:** tap example times (3:00, 3:30, 8:30) and notice what each hand does.
2. **Try it:** four untimed, choice-based readings with calm explanations and a hint that points back to the hand clues. A wrong answer can be changed; it does not cost points. After two incorrect checks, “Show me” reveals the answer and its explanation rather than creating a fail state.
3. **Make a time:** use large, keyboard-operable hour and full/half controls to set three times. The clock begins at a different time from the target, and feedback explains the clue to adjust.
4. **Offline analogue:** draw a paper clock, mark 12 and 6, and use two paper strips as hands (adult help as needed).

This is an individual activity, not the full Mowazi lesson. It uses no timer, score, streak, leaderboard, or competitive reward. The last task includes a short grown-up check-in: listen for the child to explain what the long hand at 12/6 means and where the short hand sits at half past. This is an observation prompt, not a scored response or stored record. The Corniche illustration is a story setting, not a curriculum fact or a claim about local timekeeping.

## Access and implementation notes

- One self-contained HTML file; inline SVG/CSS/JavaScript, with no external assets or network calls.
- English/Arabic language control with RTL layout and Arabic-Indic clock-face numerals; read-aloud buttons use the browser’s speech synthesis when available.
- Interactive controls use at least 72 px touch targets; buttons provide a keyboard path and step/question changes move focus to the new heading. The clock announces its current time; feedback uses words as well as color; reduced-motion preferences are respected.
- No pupil response is stored or sent to a service.
- This prototype has not received an independent Arabic-language, accessibility, or age/content review. Browser RTL rendering is a technical check only, not a language review.

## Verification performed

Playwright/Chromium in a real browser checked: page load with no page errors; 3:30 clock-hand positions; all four practice answers and all three set-a-time tasks; the first make-a-time target is not pre-filled; the final grown-up observation cue; “Show me” after two incorrect checks; visible controls at least 72 px high; Arabic RTL switching; and no horizontal overflow at 320 px or 390 px viewports. Screenshots are saved under [`screenshots/`](../../screenshots/): desktop Explore, Try it, practice completion, half-past setting, final completion, Arabic Explore, and a 390 px mobile Explore capture. These checks verify this implementation, not teaching effectiveness, curriculum approval, or classroom readiness.
