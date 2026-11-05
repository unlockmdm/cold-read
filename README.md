# Cold Read

**An AI fortune-telling station that shows you how it "read" you.**
GBDA 414, Assignment 2

A visitor walks up and the screen calls them over. They agree to be sensed, give their name and answer 8 personality questions. Then they draw 3 real playing cards (Past, Present, Future) and lay them under an overhead camera. The machine recognizes each card, assigns the visitor one of 5 archetypes and tells their fortune card by card.

Then it pulls back the curtain. It shows what the visitor *said* next to what the sensors *measured*, and the simple math that picked their "type".

## The point

AI that feels like it "knows you" is mostly **categorization** plus **wording loose enough to fit anyone**. Psychologists call this the Barnum effect. Fortune tellers use the same trick and call it *cold reading*. The reveal at the end breaks the illusion on purpose:

- Your archetype comes from **4 answers** and a weighted sum. It isn't intuition.
- Your cards come from **the shuffle**.
- The rest of the fortune is template sentences written to fit almost anyone.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run the unit tests for the reading logic |

For the exhibition, run the build full-screen in Chrome kiosk mode:

```bash
npm run build && npm run preview
# then open Chrome with --kiosk http://localhost:4173
```

## Controls

| Key / control | Action |
|---|---|
| **O** | Show/hide the hidden **operator panel** |
| **1–5** | Answer the current question |
| **Space** | On the draw screen: "place" a random card (you can also tap the frame) |
| **Back** (top-left) | Go back one step |

### Operator panel (Wizard of Oz)

For A2, a teammate fakes all the sensing from the operator panel:

- **Person detected → start**: what Camera A will trigger in A3
- **Live webcam** preview (only shown on screen, never recorded)
- **Name heard**: type the visitor's name if speech recognition misses it
- **Sensed values**: sliders for glances away, speaking pace, volume and others in frame
- **Table camera**: pick the exact card for each slot (runs the same scan → flip animation)
- **Jump to** any stage, or **Reset session**
- **Experience**: reading pace (Calm / Normal / Quick), toggle the reveal, toggle the A2 notes

## How the reading works

All rules live in [`src/logic/reading.ts`](src/logic/reading.ts) and are covered by tests.

**Archetype** (from Q5–Q8: E = Q5, A = Q6, F = Q7, J = Q8, each 1–5):

```
Trailblazer = (E-3) + (A-3) + 0.7*(3-J)
Dreamer     = (F-3) + (3-J) + 0.3*(3-E)
Oracle      = (3-E) + (3-A) + 0.3*(J-3)
Architect   = (J-3) + (3-F) + 0.7*(A-3)
Guardian    = (F-3) + (3-A) + 0.5*(3-E)
```

The highest score wins, and ties go to the first one listed.

**Fortune** for each card = opener + card name + card meaning + a suit sentence for that position + an archetype line. On the Present card it also adds a personal line chosen from whichever of Q1–Q4 you answered most strongly.

**Reveal**: each measured value is mapped onto the same 1–5 scale as your answer. If they're within 1 step, it says "Agrees"; otherwise it says "Disagrees".

| Trait | Compared with | Measured by |
|---|---|---|
| Noticing others | Q1 | glances away per minute (person camera) |
| Speaking fast | Q3 | words per minute (mic) |
| Speaking loudly | Q4 | average dB (mic) |
| Social energy | Q5 | other people in frame (person camera) |
| Taking charge | Q6 | how fast you answered (timer) |

Appearance (Q2), feelings and planning are **never** measured, and the screen says so.

## Privacy

- The consent screen appears **before** any sensing, and "Without camera & mic" keeps every sensor off.
- Nothing is recorded, stored or uploaded. **Finish** wipes the whole session.
- The microphone only ever transcribes the visitor's name (Web Speech API), and only when they tap the mic.

## Project structure

```
src/
├── App.tsx                  # Stage machine: state, navigation, timers, keyboard
├── main.tsx                 # Entry point
├── styles.css               # Design tokens, keyframes, shared styles
├── content/
│   ├── content.json         # ALL copy: questions, archetypes, card meanings, sentences
│   └── index.ts             # Typed access + deck/card helpers
├── logic/
│   ├── reading.ts           # Archetype, fortune text, reveal mapping (pure functions)
│   └── reading.test.ts      # Unit tests
├── hooks/
│   ├── useSpeechName.ts     # Voice name capture (Web Speech API)
│   └── useWebcam.ts         # Operator webcam preview
├── components/              # Background, Orb, PlayingCard, Buttons, OperatorPanel
└── screens/                 # Attract, Consent, Name, Quiz, Draw, Archetype, Spread, Reveal
design_handoff_cold_read/    # Original design handoff: spec + HTML prototype
```

To change any wording, edit [`src/content/content.json`](src/content/content.json).

## Status and next steps (A3)

| | A2 (now) | A3 (planned) |
|---|---|---|
| Presence / glances / companions | Operator sliders | MediaPipe Face Detection in the browser |
| Speaking pace / volume | Operator sliders | Web Audio `AnalyserNode` (RMS → dB, energy peaks → pace) |
| Card recognition | Operator picker / Space | Image classifier trained on our deck (Teachable Machine or a small MobileNet) |
| Name | Web Speech API + typed fallback | Same |

The operator panel stays in A3 as a fallback.

## Built with

[Vite](https://vitejs.dev), [React 18](https://react.dev) and TypeScript, with plain CSS and no UI kit. The fonts are [Italiana](https://fonts.google.com/specimen/Italiana) and [Geist](https://fonts.google.com/specimen/Geist). There are no image assets: the orb, cards and background are all CSS.
