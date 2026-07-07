# BUILD SPEC — The Entrepreneur's Detox

**Repo:** dawnmediagpt/no-fear-army
**Owner:** Doll Avant / DollHouse 2.0
**Status:** Ready for Claude Code — v1 build (rev 2, July 5, 2026)
**Last updated:** July 5, 2026

---

## 0. One-line summary

A free web assessment (sibling to the Fear Detox) that scores an entrepreneur
across the eight T.E.A.G.R.I.T.S. gates, returns a BALANCE Score with a full
report on every area, and closes with a universal bridge into the Fear Detox.
Ships with TWO modes: the full assessment and **The Ignition** — the two-minute
emergency reset (the inhaler) for the entrepreneur who is stuck, overwhelmed,
and doesn't know what to do. Email-gated start. Runs on the same rails as the
Fear Detox.

**Marketing position:** THE go-to emergency button for stuck entrepreneurs.
Stuck is the enemy of cashflow. Money follows motion. These are the keys that
start your engine.

---

## 1. The worldview (this frames EVERYTHING — read before building)

Doll's frame, and the reason a general business detox is fear-themed:

Fear is the natural opposite of intuition (which comes from love). Whatever is
keeping an entrepreneur from excelling, if there is a gap between intuition,
strategy, or the things they KNOW and the things they actually DO — that gap
is fear. Every low gate in this assessment is fear wearing a different
disguise. The eight gates are the eight doors fear climbs through.

This means:
- The opening screen establishes the fear frame BEFORE the assessment begins.
- Every gate's report copy can name fear as the thing behind the imbalance.
- The closing bridge to the Fear Detox is UNIVERSAL (every user sees it),
  because every gap surfaced by this tool is, in Doll's worldview, fear.

**Opening screen copy (screen 1, before email capture):**

> **Why a business detox starts with fear**
>
> Intuition comes from love. Fear is its natural opposite. And every gap
> between what you know and what you do (the strategy you're sitting on, the
> call you keep moving, the offer you haven't made) is fear, whatever name
> it's wearing today.
>
> Fear doesn't care which door it uses. Thoughts, Emotions, Actions, Giving,
> Receiving, Intentionality, Time, State — it climbs through whichever one you
> leave unguarded. This assessment finds the open door.
>
> F.E.A.R. is Focusing your Emotional Energy and Attention on a Reality that
> you do not desire. The next ten minutes will help you aim your focus and
> attention somewhere better.

(The F.E.A.R. definition is locked verbatim — never paraphrase it.)

---

## 2. Platform architecture

ONE platform, TWO products. Do not fork or destabilize the live Fear Detox.

- **Shared:** one repo, one scoring engine, one email identity, one data layer.
- **Distinct:** two entry routes, two keywords (NOFEAR, DETOX), two follow-up
  sequences, two palettes (gold / emerald — see section 10).
- **Bridge:** the Entrepreneur's Detox (broad panel) ends at the Fear Detox
  (deep dive) for EVERY user. Copy escalates when Emotions or State score low.

The Fear Detox is live and in market. Build the Entrepreneur's Detox as a NEW
ROUTE on the same deploy. Leave the existing Fear Detox flow untouched.

**Tech stack (reuse what the Fear Detox already runs on):**
Vite + React front end · Netlify hosting + Netlify function · Google Sheet
capture · Beehiiv + Zapier follow-up · server-side Anthropic key (v2 only).

---

## 3. Data model (decide the schema now)

One data layer from day one, shared across both products.

```
users
  email        (primary key)
  created_at

assessments
  id
  email        (fk -> users.email)
  type         ('entrepreneur' | 'entrepreneur_ignition' | 'fear')
  created_at
  gate_scores  (json: { T, E, A, G, R, I, T2, S } each 0-100)
  inner_score  (0-100)
  outer_score  (0-100)
  balance_score(0-100)
  raw_inputs   (json: every question answer)
```

v1 mirrors to the same Google Sheet pattern the Fear Detox already uses (add
columns for the eight gate scores + balance/inner/outer + type). Storing every
run keyed by email gives longitudinal tracking for free — the BALANCE-over-time
graph is the retention hook and the paid-tier upsell. Do not skip the email key.

---

## 4. The eight gates (T.E.A.G.R.I.T.S.) — LOCKED mapping

Doll's authoritative mapping (locked July 5, 2026). Publicly debuted in the
Day 22 post ("Mind Your Tea and Grits") — the tool language must match it.

| Letter | Gate | Layer |
|--------|------|-------|
| T | Thoughts | Inner |
| E | Emotions | Inner |
| A | Actions | Outer |
| G | Giving | Outer |
| R | Receiving | Outer |
| I | Intentionality (presence, choosing on purpose with every breath, "harvest awareness") | Inner |
| T | Time / scheduling (**The Elephant Diet** — proprietary Doll Avant product, always capitalized) | Outer |
| S | State of nervous system safety | Inner |

**Inner Balance** = mean of { Thoughts, Emotions, Intentionality, State }.
**Outer Balance** = mean of { Actions, Giving, Receiving, Time }.

---

## 5. Two modes (both ship in v1)

### Mode A — The Full Detox (~10 min)
The complete assessment: 16 questions (section 6), full scored report on all
eight gates, BALANCE Score, Fear Detox bridge. The daily / weekly practice run.

### Mode B — The Ignition (~2 min) — NAME CONFIRMED July 5, 2026
The emergency inhaler. For the moment an entrepreneur is stuck, overwhelmed,
and doesn't know what to do. This is the marketing wedge: THE emergency button.

Naming rationale (locked): The Ignition — you turn your own key; the power was
in your engine the whole time (you're the power source). "Jumpstart" is
reserved for MARKETING COPY only, naming the stuck feeling, never the product
(e.g. "Feels like you need jumper cables? You don't. Your engine's fine.
Turn the key.").

- Entry: one line — "Stuck? Start your engine."
- Eight sliders, one per gate (1-5, labeled with each gate's catch question in
  compressed form).
- Instant read: lowest gate + its correction move as ONE action.
- One breath out (Zero Point), then: "Go. Money follows motion."
- Same scoring formula, logged as type `entrepreneur_ignition`.
- Positioning copy: "Stuck is the enemy of cashflow. Money follows motion.
  These are the keys that start your engine."

The Ignition is the retention product (kept on the phone like an inhaler);
the Full Detox is the depth product. Both feed the same data layer.

---

## 6. Assessment questions (Full Detox — 2 per gate, rated 1-5)

Rating scale: 1 = Strongly disagree … 5 = Strongly agree.
Higher always means more balanced. All questions are present-tense, today.

**T · Thoughts**
1. My thoughts today are working for me, not against me.
2. I've caught and swapped at least one fear-story running in my head.

**E · Emotions**
1. I know what I'm feeling right now and where it's sitting in my body.
2. My emotions are moving through me, not running me.

**A · Actions**
1. What I'm actually doing today matches what I said I'd do.
2. There's no gap between my plan and my motion right now.

**G · Giving**
1. I'm putting real value into real conversations, not hiding in busywork.
2. I've made an offer or given something of value recently.

**R · Receiving**
1. I'm letting in the feedback, help, and money coming toward me.
2. I'm not deflecting support or downplaying my wins.

**I · Intentionality**
1. I'm present and choosing on purpose, not running on autopilot.
2. I'm harvesting awareness — catching the moment while I'm still in it.

**T · Time / scheduling**
1. My calendar matches what I say actually matters.
2. I'm budgeting my time the way I'd budget money (The Elephant Diet).

**S · State of nervous system safety**
1. My body is in a state of safety, not threat, right now.
2. I can get back to the Zero Point with my breath when I need to.

---

## 7. Scoring (v1 — deterministic, no API)

```
gateScore(gate)  = ((avg(gate.answers) - 1) / 4) * 100      // 0-100
innerScore       = mean(gateScore of T, E, I, S)
outerScore       = mean(gateScore of A, G, R, T-time)
balanceScore     = mean(all 8 gateScores)
```

**Bands:**

| Range | Band | Read |
|-------|------|------|
| 85-100 | Aligned | In flow. Keep the rhythm. |
| 70-84 | Grounded | Steady. A tune-up or two. |
| 50-69 | Wobbling | Two or three gates pulling you off center. |
| 30-49 | Leaking | Multiple gates open. Prioritize before you push. |
| 0-29 | Depleted | Stop, settle, reset before you build anything. |

---

## 8. Correction copy per gate (v1 — pre-written, in Doll's voice)

Shown for every gate in the report. The lowest one or two lead as "Priority
Moves." Each low gate's copy may name fear as the thing behind the imbalance
(per section 1 — every gap is fear).

- **Thoughts:** Name the thought you keep rehearsing. Then choose the one you'd
  rather wrap. You're always myelinating something (might as well pick the wire
  on purpose).
- **Emotions:** Name it out loud. Let it move through. It's data, not a verdict.
- **Actions:** Find the gap between the plan and the day. Pick the one action
  that closes it. Fear lives in that gap.
- **Giving:** Give the thing you've been holding back. Send it. Say it. Make the
  offer. All financial capital is social capital.
- **Receiving:** Name the one thing you keep deflecting. Let it land. You can't
  run a business you won't let get paid.
- **Intentionality:** Come back to now. This breath. This choice. Harvest the
  awareness.
- **Time / scheduling:** Find the one priority that isn't blocked anywhere.
  Block it. Where you spend your attention, you spend yourself. (The Elephant
  Diet: budget time the way you budget money.)
- **State of safety:** One more slow breath. Back to the Zero Point. You can't
  build from a body that thinks it's being hunted.

---

## 9. User flow / screens (Full Detox)

1. **Worldview screen** — the section-1 opening copy. Fear frame established
   before anything else. CTA: "Run the Detox."
2. **Email capture** — required to start (same gate as the Fear Detox).
3. **Settle** — guided slow breath to the Zero Point. Same front door component
   as the Fear Detox.
4. **Assessment** — the 16 questions, grouped by gate, one gate per screen (or
   a clean single-scroll — match the Fear Detox pattern).
5. **Compute** — run the scoring in section 7.
6. **Report screen:**
   - BALANCE Score (big) + band + one-line read.
   - Inner Balance and Outer Balance gauges, side by side.
   - Eight-gate bar breakdown.
   - **Priority Moves** — the lowest one or two gates with their correction.
   - Full report — the remaining gates with scores + corrections.
   - **Zero Point close** — one breath out.
   - **The Fear Detox bridge (UNIVERSAL — every user sees it):**
     > Every low gate you just saw is fear wearing a different disguise. The
     > Fear Detox is the deep-dive that clears it at the root — the same free
     > reset Doll runs on herself. Take your results there.
     > [Run the Fear Detox →]
     Escalated variant when Emotions or State is the lowest gate or below 50:
     > Your lowest gates are the two fear touches first. Run the Fear Detox
     > today — before the next build session, not after.
   - **Retention line:** "Run it again tomorrow. Watch your BALANCE move."
7. **Delivery** — email the report to the captured address, enroll in the
   Beehiiv `detox` sequence (Zapier, same plumbing as NOFEAR, tagged `detox`).

The Ignition flow (Mode B) compresses this to: entry line → 8 sliders →
lowest gate + one action → one breath → "Go. Money follows motion." Email
required on first run only (recognized emails skip straight in).

---

## 10. Brand tokens — the emerald palette

The Entrepreneur's Detox gets its own jewel tone. Same house, its own jewel.

- **Primary: Emerald** `#0FA36B` (bright) / `#0A6B47` (deep) — growth, balance,
  vitality; ties to the seed/garden canon.
- **Base: Black** `#111111` (unchanged — the house).
- **Accent: Gold** `#e9c31f` — the master-brand thread; use for the BALANCE
  Score number, CTAs, and the Fear Detox bridge (gold signals "the family").
- **Rationale:** turquoise is RESERVED (Turquoise Timeline — locked Lucidity
  canon, never borrow it). Emerald is the assigned jewel for this product.
- Headlines: Oswald. Body: Lato.
- Score bars: emerald intensity signals level (bright = high, deep/dim = low).
  Band labels carry the semantic weight; subtle amber allowed for Depleted only.

---

## 11. Keyword routing

Add **DETOX** to the DollAvant widget Netlify function alongside **NOFEAR**.
DETOX routes to the Entrepreneur's Detox worldview screen; NOFEAR stays pointed
at the Fear Detox. (Requires the widget function edit already on the backlog.)

---

## 12. Phasing

- **v1 (this build):** Full Detox + The Ignition, deterministic scoring,
  pre-written copy, universal Fear Detox bridge, emerald palette. No API
  dependency — ships without waiting on the Anthropic-key-to-Netlify wiring.
- **v2:** server-side Anthropic call reads `raw_inputs`, personalizes the
  report in Doll's voice, sharpens the Priority Moves.
- **v3:** shared account + BALANCE history graph + unified "Detox" library home
  (the seed of the paid NFNTY / Kitchen tier).

---

## 13. Build order (do it in this sequence)

1. Clone the Fear Detox flow into a new route. Leave the live Fear Detox alone.
2. Apply the emerald palette tokens to the new route only.
3. Build the worldview screen (section 1 copy) + email gate + Settle bookend.
4. Build the 16-question assessment (section 6).
5. Implement the scoring engine (section 7) and the bands.
6. Build the report screen (section 9.6) — gauges, 8 bars, Priority Moves,
   universal Fear Detox bridge (+ escalated variant), Zero Point close.
7. Build The Ignition (section 5, Mode B) as the second entry on the route.
8. Wire email capture → Google Sheet → Beehiiv (`detox` tag).
9. Add DETOX routing to the widget Netlify function.
10. Ship v1. Then layer v2 personalization.

---

## 14. Language rules (non-negotiable in all tool copy)

- **The Elephant Diet** — proprietary Doll Avant product. Always capitalized,
  always referenced as such.
- **Locked verbatim (never paraphrase):** "F.E.A.R. is Focusing your Emotional
  Energy and Attention on a Reality that you do not desire." · "Money follows
  motion." · "All financial capital is social capital." · "You don't get what
  you want, you get who you are." · "Stuck is the enemy of cashflow." ·
  "These are the keys that start your engine." (locked July 5, 2026) ·
  "harvest awareness" (the Intentionality gate).
- Write arrivals only. Contractions throughout. Parentheses for asides.
- Do not link W2 to Revenue and Makin' the Bank anywhere in copy or follow-up.
- Money is always last. The giving comes first.