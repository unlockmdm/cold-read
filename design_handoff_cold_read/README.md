# Handoff: Cold Read — AI fortune-telling station

## Overview
Cold Read is an interactive exhibition station for a university course on critical AI. A visitor walks up and the screen calls them over. They agree to be sensed, give their name and answer 8 personality questions. Then they draw 3 real playing cards and lay them under an overhead camera, one at a time (Past, Present, Future). The machine recognizes each card, assigns the visitor one of 5 archetypes and tells a fortune card by card. Finally it reveals how it "read" them: what they said compared with what the sensors measured, and the math that picked their type.

**The critical proposition (keep this intact; it is the point of the project):** AI that feels like it "knows you" is mostly categorization plus wording loose enough to fit anyone (the Barnum effect). Fortune tellers use the same trick, called cold reading. The reveal at the end deliberately breaks the illusion.

### Physical setup
- One screen (kiosk, full-screen browser) facing the visitor.
- **Camera A (person camera):** faces the visitor. Detects presence, number of people and how often they look away.
- **Camera B (table camera):** mounted overhead, sees only the card slot on the table. Recognizes which playing card was placed.
- **Microphone:** measures only loudness (dB) and speaking pace. Never transcribes content, except optionally the visitor's name.
- A physical 52-card deck (no jokers).
- A hidden **operator** (teammate) with a control panel. For the A2 milestone, all sensing is faked by the operator ("Wizard-of-Oz"). For A3, real models replace the operator, and the operator panel stays as a fallback.

## About the design files
The files in `reference/` are **design references created in HTML**: a working prototype that shows the intended look, flow and behaviour. Do not ship that file. Recreate it in a proper app.

- **No codebase exists yet.** Recommended: **Vite + React + TypeScript**, run full-screen in Chrome kiosk mode on a laptop.
- Use plain CSS or CSS modules. No UI kit is needed, since the look is custom.
- Add a tiny local WebSocket server (Node) only if the operator panel must run on a second device. Otherwise keep the in-app hidden panel (press `O`).
- To view the reference, open `reference/Cold Read Station.dc.html` in Chrome. `support.js` must sit next to it. Press `O` for the operator panel.
- All reading text (questions, archetypes, card meanings, sentences) is in **`content.json`**, taken verbatim from the prototype. Load it rather than retyping.

## Fidelity
**High-fidelity.** Colors, typography, spacing, motion and copy are final. Recreate them pixel-accurately. The sensing and recognition back-end is not built (it is faked by the operator). See "Sensing implementation".

---

## Screen flow
`attract → consent → name → quiz (8) → draw (3 sub-steps) → reading (archetype + 3 card steps) → reveal (2 steps) → finish (wipe, back to attract)`

A global round **Back** button (top-left) appears on every stage except attract. Back rules:
- consent → attract
- name → consent
- quiz → previous question, or name from Q1
- draw → previous card slot (shown as already recognized), or quiz Q8 from slot 1
- reading → previous step, or draw slot 3 from the archetype step
- reveal step 2 → reveal step 1; reveal step 1 → the final reading step (all cards face up)

**Finish** always wipes all session state and returns to attract.

### Shared layout
- The root fills the viewport and is a flex row: the main column, plus an optional 320px operator sidebar on the right.
- **Header:** a 3-column grid (`1fr auto 1fr`), padding `22px 32px`.
  - Left: the Back button, a 46×46 circle with a 1px border `rgba(243,236,228,0.14)`, background `rgba(255,255,255,0.04)`, `backdrop-filter: blur(14px)` and an 18px chevron icon (stroke 1.6). On hover the background becomes `0.10` and it moves `translateX(-2px)`.
  - Centre: the wordmark "Cold Read", Italiana 24px, letter-spacing 0.06em.
  - Right: empty.
- **Progress hairline:** fixed at the very top, 2px high, `linear-gradient(90deg,#b6a6e6,#e39a6f)`. Width = `max(2, (stageIndex + subProgress) / 6.6 × 100)%`, transitioned over 0.9s ease (see tokens).
  - subProgress = quiz `qi/8`, draw `drawIdx/3`, reading `readStep/4`, reveal `revealStep/2`, otherwise 0.
- **Main:** flex, centred both ways, padding `8px 32px 56px`. Inner container max-width 1100px.
- **Operator toggle:** fixed bottom-right pill, 12px text, label "Operator" / "Hide operator", muted colour.
- There is no sensor indicator on screen. This was removed on purpose; consent explains the sensors instead.

### 1. Attract
- Centred column:
  - **Crystal orb**, 230px. A sphere with background `radial-gradient(circle at 50% 78%, #f0a272 0%, #c4606a 28%, #5b3c78 58%, #1d1826 100%)`.
    - Inner layers: a conic-gradient "mist" layer at 30% inset, blurred 24px and rotating 360° every 16s; a white highlight ellipse near the top-left; an inner rim light.
    - Outer halo: 2× size, copper radial glow, "breathe" animation (6s, opacity 0.65↔1, scale 0.96↔1.04).
    - A soft elliptical shadow underneath.
  - H1 "Come closer": Italiana, `clamp(64px, 9vw, 136px)`, line-height 0.92, 36px above.
  - Line "The cards have been waiting for you.": Geist 300, 20px, muted.
  - Primary button "Begin your reading →".
- The operator's "Person detected" button also advances to consent (in A3: Camera A presence).

### 2. Consent
- Eyebrow "Before we begin", H2 "What I notice" (Italiana `clamp(48px,6vw,84px)`).
- A 2×2 list (max-width 820, `grid auto-fit minmax(300px,1fr)`, column-gap 48). Each item has a 1px top hairline `rgba(243,236,228,0.12)`, padding 20px 0, a title (Geist 500 16px) and a description (Geist 300 16px, muted):
  - **Camera on you:** "Whether you are here, where you look, who is with you."
  - **Microphone:** "How loud and how fast you speak. Never your words."
  - **Camera on the table:** "Only the three cards you draw."
  - **Timer:** "How long each answer takes you."
- Note: "Nothing is recorded. Everything is erased when you finish."
- Buttons: primary "Read me →" (sets `sensingOn = true`) and secondary "Without camera & mic" (sets `sensingOn = false`; the reading still works and the reveal shows "Sensors off").

### 3. Name
- H2 "Who am I reading?".
- **Voice / Text segmented control:** 240px pill with 4px padding. The active segment has a cream background and dark text, and the transition takes 0.3s.
- **Voice mode:**
  - A 104px cream radial mic button with a copper glow (`0 0 80px rgba(227,154,111,.5)`).
  - While listening, 3 copper rings expand from it (scale 1→2, opacity 0.6→0, 2.4s, delays 0 / 0.8 / 1.6s).
  - Caption (Italiana 32px): "Tap and say your name" → "Listening…" → `I heard “{name}”`.
  - Uses the Web Speech API. It strips "my name is / I'm / I am / it's / this is" and keeps the first word, capitalized. The operator can also type the name.
- **Text mode:** a centred input, Italiana 64px, with a bottom hairline.
- Button "Continue →".

### 4. Quiz (8 questions, one per screen)
- Eyebrow `{name} · 3 / 8` (or just `3 / 8` with no name).
- Question: Italiana `clamp(38px,4.4vw,62px)`, line-height 1.12, max-width 17em, `text-wrap: balance`.
- **Answer scale:** 5 circles in a row (max-width 660, space-between):
  - Sizes 72 / 56 / 42 / 56 / 72px.
  - Borders 1.5px: lavender `#b6a6e6` for 1–2, muted `#9a948f` for 3, copper `#e39a6f` for 4–5.
  - When selected, the circle fills with its border colour and scales to 1.1. On hover it scales to 1.08. Transitions are 0.3s.
  - Under the circles: "Disagree" at the left and "Agree" at the right (15px, muted).
- Keys 1–5 also answer.
- After an answer, wait 420ms and auto-advance. After Q8, go to draw.
- **Record the answer time for each question** (seconds from when it was shown to when it was answered). The reveal uses it.

### 5. Draw (3 sub-steps: Past, Present, Future)
- Two columns (`grid auto-fit minmax(320px,1fr)`, gap `clamp(40px,7vw,120px)`).
- **Left column:**
  - Eyebrow "Card 1 of 3".
  - H2 "Your past" / "Your present" / "Your future" (Italiana `clamp(64px,8vw,124px)`, line-height 0.92).
  - Prompt (20px, muted): "{Name}, draw a card from the deck and lay it face up under the camera." Slots 2 and 3 say "draw a second card…" and "draw your final card…".
  - **Tracker:** 3 mini cards (30×42, radius 6) with labels.
    - Recognized slots show the cream card with its rank and suit.
    - The current slot has a copper border; the others have a hairline border.
  - Once the card is recognized, two buttons appear: "Next: your present →" (or "Read my cards →" on the last slot) and secondary "Not my card", which clears the slot and returns to waiting.
- **Right column: the flip frame.** 300px wide (max 70vw), aspect ratio 2.5/3.5, `perspective: 1600px`. The inner element uses `preserve-3d`, with transform transitioned over **1.1s cubic-bezier(.3,.7,.15,1)**.
  - **Front face (scan frame):**
    - Background `rgba(255,255,255,.035)`, 1px hairline border, radius 20.
    - 4 copper corner brackets (30px, 1.5px, inset 16px).
    - A scan line: a band 25% tall, transparent fading to `rgba(227,154,111,.2)`, with a 1px bright bottom edge. It moves top to bottom, slowly (3.2s) while waiting and fast (0.9s) while recognizing.
    - Centre text: "Place your card here" / "Reading the card…".
    - Do not use backdrop-filter on the flip faces; it breaks 3D rendering.
  - **Back face (card front):** rotated 180° (see the card design below).
  - **Scan states:**
    - `wait`: transform `rotateY(0)`.
    - `scan`: `rotateY(0) scale(1.03)`, for 1.8s.
    - `seen`: `rotateY(180deg)`, so the frame flips over to reveal the card.
  - **Status line under the frame (15px):**
    - "Waiting for your card" (muted).
    - Pulsing copper dot + "Recognizing" (copper).
    - "Queen of Hearts · 94% match" (cream). In A3 this shows the classifier's real confidence.
- In the prototype, tapping the frame or pressing Space draws a random card. The operator can pick an exact card.
- Cards cannot repeat within a session.

### 6a. Reading: archetype
- Eyebrow "A reading for {name}".
- Line "The cards will speak to" (muted 20px).
- Archetype name, e.g. "The Oracle": Italiana `clamp(84px,12vw,180px)`, text-shadow `0 0 90px rgba(227,154,111,.4)`.
- Description (20px, `#c9c1b9`).
- Button "Turn the cards →".

### 6b. Reading: the spread (steps 1–3, same screen)
- **Top: 3 cards in a row** (gap `clamp(18px,3vw,44px)`), each `clamp(118px,12vw,172px)` wide at 2.5/3.5, with the position label underneath (Past / Present / Future; 13px uppercase, 0.14em tracking).
  - All start **face down** (card back design below).
  - On entering step 1, after 650ms card 1 flips (`rotateY(180deg)`, 1.1s). Each later step flips the next card after 250ms.
  - **Active card:** `translateY(-14px) scale(1.07)`, opacity 1, label in copper. Already-read cards have opacity 0.7; upcoming cards have opacity 0.45. Transitions are 0.8–0.9s.
- **Below (centred, max-width 880):**
  - Card name (Italiana `clamp(34px,3.4vw,50px)`).
  - The **fortune paragraph** (Italiana `clamp(24px,2.3vw,32px)`, line-height 1.38, max-width 27em). It reveals **word by word**: each word fades from opacity 0, blur 10px and translateY 10px to normal over 0.8s. The base delay is 1.2s on step 1 and 0.85s on later steps, plus 0.028s per word.
  - On step 3 only: an advice line (18px, copper), e.g. "Maya, leave one part of the plan unplanned."
  - Buttons: "Turn the next card →" on steps 1–2. On step 3: "How did you know? →" plus secondary "Finish".
- The card name, advice and buttons animate in on each step change with delays of 0.55s, 2.4s and 1.3s (see "Entrance motion").

### 7a. Reveal: "How I read you"
- Eyebrow "Behind the curtain", H2 "How I read you", subline "What you told me, {name}, and what I saw."
- A header row: "Low" … legend (a cream dot labelled "You said" and a copper glowing dot labelled "I saw") … "High".
- **5 rows** (grid `minmax(150px,.9fr) minmax(0,2fr) 90px`, gap 28, rows 30px apart):
  - **Left:** trait name (Italiana 28px) with a small sensor reading under it (13px, muted).
  - **Middle: a track.** A 1px hairline with 5 tick marks at positions 1–5 (0/25/50/75/100%).
    - A cream 14px dot marks the visitor's answer; a copper 14px glowing dot marks the measured level.
    - A 2px segment connects them: green `rgba(188,214,194,.6)` if they agree, copper `rgba(240,178,143,.7)` if they disagree.
    - **Animation:** dots start at 50% with opacity 0, then 450ms after the screen shows they glide to their positions (left transition 1.3s), with a stagger of 0.12s per row.
  - **Right:** verdict "Agrees" (`#bcd6c2`), "Disagrees" (`#f0b28f`) or "Not measured" (muted).
- Footer: "Appearance, feelings and planning were never measured. I took your word for those."
- Button "And my type? →".

### 7b. Reveal: "Four answers chose your type"
- H2, plus the subline "Questions 5 to 8 only. The highest score won."
- **5 spheres** in a row (each column 128px wide, sphere area 150px tall, aligned to the bottom), with the archetype name (Italiana 26px) and its score (e.g. "+2.3", 13px) underneath.
  - Sphere size = `34 + clamp((score+6)/12, 0, 1) × 106` px. They start at 12px and grow over 1.4s with a stagger of 0.12s.
  - The winner uses the crystal-orb gradient and gets a `0 0 70px rgba(227,154,111,.55)` glow. The others are `rgba(255,255,255,.04)` with a hairline border.
- Copy: "Your cards came from the shuffle. The rest was written to fit almost anyone." Then, in Italiana copper: "Which part felt like being known, {name}?"
- Button "Finish & erase", with "Saved: nothing" under it.

---

## Card design
- **Face:**
  - Background `linear-gradient(160deg,#f8f2e9,#e7dac8)`, radius 20 (14 on the spread), shadow `0 30px 80px rgba(0,0,0,.55), 0 0 90px rgba(227,154,111,.3)`.
  - Inner border inset 9px, 1px `rgba(176,100,62,.35)`.
  - Corner index (rank above suit) top-left, and the same rotated 180° bottom-right. Geist 500 at 7cqw (9cqw on the spread).
  - Centre: a thin ring (58% of the card width), with the rank in Italiana at 26cqw and the suit glyph at 10cqw inside it.
  - A diagonal sheen overlay: `linear-gradient(115deg, transparent 30%, rgba(255,255,255,.45) 46%, transparent 62%)` at opacity 0.5.
  - Use `container-type: inline-size` so `cqw` units scale with the card.
  - Colours: Hearts and Diamonds `#b4482a`; Clubs and Spades `#231f27`.
  - Suit glyphs ♥ ♦ ♣ ♠ need the U+FE0E text-presentation selector so they never render as emoji.
  - Rank "1" displays as "A".
- **Back:**
  - Background `radial-gradient(circle at 50% 42%, #3b2c46, #1b1621 72%)`, 1px copper border at 0.5 alpha, inner border inset 7px at 0.3 alpha.
  - Faint copper rays: `repeating-conic-gradient(rgba(227,154,111,.14) 0 1.5deg, transparent 1.5deg 12deg)`, masked to a circle of radius 34%.
  - Two concentric copper rings (52% and 30%) with a ✦ in the centre.
- **Flips:** use `backface-visibility: hidden` on both faces; the back face rotates `rotateY(180deg)`.

## Reading logic (implement exactly)
**Archetype** (from Q5–Q8, where E = Q5, A = Q6, F = Q7, J = Q8, each answered 1–5; unanswered counts as 3):
```
Trailblazer = (E-3) + (A-3) + 0.7*(3-J)
Dreamer     = (F-3) + (3-J) + 0.3*(3-E)
Oracle      = (3-E) + (3-A) + 0.3*(J-3)
Architect   = (J-3) + (3-F) + 0.7*(A-3)
Guardian    = (F-3) + (3-A) + 0.5*(3-E)
```
The highest score wins. **Ties go to the archetype listed first**, in the order above.

**Personal line** (from Q1–Q4): pick the question whose answer is furthest from 3. On a tie, the earlier question wins. Use its `high` line if the answer is above 3 and its `low` line if below. If all four answers are 3, there is no line.

**Fortune paragraph for card k** (0 = Past, 1 = Present, 2 = Future):
```
opener + cardLabel + " speaks of " + phrase + ". " + suit_position_sentences[suit][k] + " " + tail
```
- **opener:** from `story_openers` (the with-name version when a name exists: name on Past and Future, not on Present).
- **cardLabel:** e.g. "Queen of Hearts", "2 of Spades", "Ace of Clubs".
- **phrase:** `sentence_phrase_overrides[id]` if present (id format `"9|Hearts"`, `"J|Diamonds"`, `"1|Spades"`); otherwise the card meaning with its first letter lower-cased.
- **tail:**
  - Past: `archetype.lens_past`.
  - Present: `archetype.lens_present` + " " + personal line (if any).
  - Future: `archetype.fortune`.
- **Advice** (Future only): `"{Name}, " + advice with its first letter lower-cased`, or the advice unchanged when there is no name.

**Reveal mapping** (each measured value becomes a level from 1 to 5; `lvl(v,min,max) = clamp(1 + round((v-min)/(max-min)*4), 1, 5)`):

| Trait label | Compared with | Measurement | Level |
|---|---|---|---|
| Noticing others | Q1 | glances away per minute (Camera A) | lvl(v,0,10) |
| Speaking fast | Q3 | words per minute (mic) | lvl(v,90,190) |
| Speaking loudly | Q4 | average dB (mic) | lvl(v,45,75) |
| Social energy | Q5 | other people in frame (Camera A) | 0→2, 1→3, 2→4, 3+→5 |
| Taking charge | Q6 | mean answer time (timer) | ≤1.5s→5, ≤3→4, ≤5→3, ≤8→2, else 1 |

- The verdict is **Agrees** when `|level − answer| ≤ 1`; otherwise **Disagrees**.
- If `sensingOn` is false, the four sensor rows show "Sensors off" / "Not measured". The timer row still works.
- Q2 (appearance) is **never** measured by design.

## Sensing implementation (A3; A2 uses the operator)
All processing must run locally. Do not store or upload frames or audio.
- **Camera A:** MediaPipe Face Detection or Pose (web). Measures person count and head-yaw changes to count "glances away per minute". Presence on the floor mark triggers attract → consent.
- **Microphone:** Web Audio AnalyserNode. dB from RMS; speaking pace estimated from energy-peak (syllable) rate. Sample during the name screen and the quiz.
- **Camera B:** an image classifier for the 52 cards, trained on photos of the actual deck under station lighting (Teachable Machine, or a small YOLO / MobileNet model).
  - Accept a card when confidence stays above a threshold for about 1s. Show the confidence as the "% match".
  - Reject cards already used in the session.
- **Name:** Web Speech API, with typed fallback.
- **Operator panel** (keep it in production as a fallback, toggled with `O`):
  - "Person detected → start".
  - Webcam preview on/off.
  - Name field.
  - Sliders for glances (0–10/min), pace (90–190 wpm), volume (45–75 dB) and others in frame (0–4).
  - A card picker for each slot, plus a random button. Picking a card for the current draw slot runs the same scan → flip sequence.
  - Jump to any stage, and reset.

## State (prototype shape)
```ts
stage: 'attract'|'consent'|'name'|'quiz'|'draw'|'reading'|'reveal'
name: string; nameMode: 'voice'|'text'; listening: boolean
answers: (1..5|null)[8]; times: (seconds|null)[8]; qi: 0..7
cards: (cardId|null)[3]; drawIdx: 0..2; scan: 'wait'|'scan'|'seen'
sensingOn: boolean
readStep: 0..3   // 0 = archetype screen, 1..3 = spread cards
flipped: 0..3    // how many spread cards are face up (lags readStep for the flip)
revealStep: 0|1; revAnim: boolean // false on enter, true 450ms later to trigger the track/orb transitions
sensed: { glances, pace, volume, companions }  // from sensors or operator
```
If any card slot is empty when entering reading, fill it randomly (operator safety). **Finish resets everything except operator settings.**

## Motion
- Standard easing `cubic-bezier(.2,.7,.2,1)`. Flips use `cubic-bezier(.3,.7,.15,1)`.
- **Entrance (every screen change):** elements marked as "rise" fade from opacity 0, translateY 22px and blur 8px to normal over 900ms, staggered 90ms in DOM order.
  - Screen keys: each quiz question, each draw slot, archetype vs spread, each reveal step.
  - On the spread, only the card name, advice and buttons re-animate on each step, with delays in seconds of 0.55, 2.4 and 1.3, multiplied by the pace factor.
- **Pace setting:** Calm ×1.4, Normal ×1, Quick ×0.6. It applies to the word reveal and the delayed elements.
- **Background:**
  - Base `#0f0d12`.
  - A large copper aura (78vmax circle, `radial-gradient(closest-side, rgba(214,108,62,.55), rgba(160,70,92,.26) 48%, rgba(80,50,110,.1) 68%, transparent 76%)`, blur 24px, slow drift animation over 28s). It **glides to a new position on each stage** (left, top and scale transitioned over 2.4s; positions in `content.json → background_aura`).
  - A lavender glow (56vmax, `rgba(170,150,230,.22)`, blur 40, drift 34s) that also moves (`background_lavender`).
  - A radial vignette to `rgba(5,4,8,.6)`.
  - An SVG fractal-noise grain overlay at opacity 0.07.
- **Buttons:** hover lifts by 2px and strengthens the glow (0.25s).

## Design tokens
**Colours**
- Background `#0f0d12`.
- Ink (cream) `#f3ece4`.
- Muted `#9a948f`; body-secondary `#c9c1b9`.
- Copper `#e39a6f`; lavender `#b6a6e6`.
- Hairline `rgba(243,236,228,.12)` (also .10, .14, .16).
- Agree `#bcd6c2`; disagree `#f0b28f`.
- Card red `#b4482a`; card black `#231f27`.
- Card face `#f8f2e9 → #e7dac8`; card-back plum `#3b2c46 → #1b1621`.

**Type:** Google Fonts **Italiana** (display, 400) and **Geist** (UI and body: 300, 400, 500). Use antialiased smoothing.
- Eyebrow: Geist 400, 13px, uppercase, 0.14em tracking, copper.
- Body: Geist 300, 15–20px.
- Display: Italiana at the clamps listed per screen.

**Buttons**
- **Primary:** pill, `#f3ece4` background, `#141116` text, Geist 500 15px, padding 17×30, gap 12 (with a trailing "→"), shadow `0 10px 50px rgba(227,154,111,.28)`. Hover: `translateY(-2px)` and shadow `0 14px 60px rgba(227,154,111,.45)`.
- **Secondary:** pill, transparent background, 1px `rgba(243,236,228,.16)` border, Geist 400 15px, padding 17×24. Hover background `rgba(255,255,255,.06)`.

**Radii:** pills 999; card 20 / 14; inner card border 13 / 9; tracker mini-card 6; operator controls 10–12.

**Contrast:** keep text at 4.5:1 or better. Muted `#9a948f` on `#0f0d12` passes.

## Accessibility and safety notes
- All interactive circles have aria-labels (Strongly disagree … Strongly agree; Back; Speak).
- Hit targets are at least 42px.
- Add `prefers-reduced-motion`: disable the drift, word blur and flips (crossfade instead).
- The consent screen must appear before any sensing starts. The opt-out path must keep all sensors off.

## Assets
There are no image assets. The orb, card backs, scan frame and background are all CSS. The icons (chevron, mic) are inline SVG with a 1.6 stroke. Fonts come from Google Fonts.

## Files
- `reference/Cold Read Station.dc.html`: the full working prototype. Open it in Chrome with `support.js` beside it. The logic class at the bottom of the file contains every rule above.
- `content.json`: all copy and data (questions, archetypes, card meanings, sentence parts, background positions).
