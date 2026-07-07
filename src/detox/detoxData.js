// The Entrepreneur's Detox — T.E.A.G.R.I.T.S. data + scoring engine
// Locked mapping (July 5, 2026). Language rules per BUILD_ENTREPRENEUR_DETOX.md section 14.

export const GATES = [
  {
    key: 'T', letter: 'T', name: 'Thoughts', layer: 'inner',
    questions: [
      'My thoughts today are working for me, not against me.',
      "I've caught and swapped at least one fear-story running in my head."
    ],
    ignition: 'Are your thoughts working for you, not against you?',
    correction: "Name the thought you keep rehearsing. Then choose the one you'd rather wrap. You're always myelinating something (might as well pick the wire on purpose)."
  },
  {
    key: 'E', letter: 'E', name: 'Emotions', layer: 'inner',
    questions: [
      "I know what I'm feeling right now and where it's sitting in my body.",
      'My emotions are moving through me, not running me.'
    ],
    ignition: 'Are your emotions moving through you, not running you?',
    correction: "Name it out loud. Let it move through. It's data, not a verdict."
  },
  {
    key: 'A', letter: 'A', name: 'Actions', layer: 'outer',
    questions: [
      "What I'm actually doing today matches what I said I'd do.",
      "There's no gap between my plan and my motion right now."
    ],
    ignition: "Does what you're doing match what you said you'd do?",
    correction: 'Find the gap between the plan and the day. Pick the one action that closes it. Fear lives in that gap.'
  },
  {
    key: 'G', letter: 'G', name: 'Giving', layer: 'outer',
    questions: [
      "I'm putting real value into real conversations, not hiding in busywork.",
      "I've made an offer or given something of value recently."
    ],
    ignition: 'Are you putting real value into real conversations?',
    correction: "Give the thing you've been holding back. Send it. Say it. Make the offer. All financial capital is social capital."
  },
  {
    key: 'R', letter: 'R', name: 'Receiving', layer: 'outer',
    questions: [
      "I'm letting in the feedback, help, and money coming toward me.",
      "I'm not deflecting support or downplaying my wins."
    ],
    ignition: 'Are you letting in the feedback, help, and money?',
    correction: "Name the one thing you keep deflecting. Let it land. You can't run a business you won't let get paid."
  },
  {
    key: 'I', letter: 'I', name: 'Intentionality', layer: 'inner',
    questions: [
      "I'm present and choosing on purpose, not running on autopilot.",
      "I'm harvesting awareness — catching the moment while I'm still in it."
    ],
    ignition: 'Are you present and choosing on purpose, not on autopilot?',
    correction: 'Come back to now. This breath. This choice. Harvest the awareness.'
  },
  {
    key: 'T2', letter: 'T', name: 'Time / Scheduling', layer: 'outer',
    questions: [
      'My calendar matches what I say actually matters.',
      "I'm budgeting my time the way I'd budget money (The Elephant Diet)."
    ],
    ignition: 'Does your calendar match what you say matters?',
    correction: "Find the one priority that isn't blocked anywhere. Block it. Where you spend your attention, you spend yourself. (The Elephant Diet: budget time the way you budget money.)"
  },
  {
    key: 'S', letter: 'S', name: 'State of Safety', layer: 'inner',
    questions: [
      'My body is in a state of safety, not threat, right now.',
      'I can get back to the Zero Point with my breath when I need to.'
    ],
    ignition: 'Is your body in safety, not threat, right now?',
    correction: "One more slow breath. Back to the Zero Point. You can't build from a body that thinks it's being hunted."
  }
]

export const INNER_KEYS = ['T', 'E', 'I', 'S']
export const OUTER_KEYS = ['A', 'G', 'R', 'T2']

// gateScore = ((avg(answers) - 1) / 4) * 100  — answers rated 1-5, higher = more balanced
export function gateScore(answers) {
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length
  return ((avg - 1) / 4) * 100
}

// answers: { T: [n, n], E: [n, n], ... } (Ignition passes single-element arrays)
export function scoreAll(answers) {
  const gateScores = {}
  GATES.forEach(g => { gateScores[g.key] = gateScore(answers[g.key]) })
  const mean = keys => keys.reduce((a, k) => a + gateScores[k], 0) / keys.length
  return {
    gateScores,
    innerScore: mean(INNER_KEYS),
    outerScore: mean(OUTER_KEYS),
    balanceScore: mean(GATES.map(g => g.key))
  }
}

export const BANDS = [
  { min: 85, name: 'Aligned', read: 'In flow. Keep the rhythm.' },
  { min: 70, name: 'Grounded', read: 'Steady. A tune-up or two.' },
  { min: 50, name: 'Wobbling', read: 'Two or three gates pulling you off center.' },
  { min: 30, name: 'Leaking', read: 'Multiple gates open. Prioritize before you push.' },
  { min: 0,  name: 'Depleted', read: 'Stop, settle, reset before you build anything.' }
]

export function band(score) {
  return BANDS.find(b => score >= b.min)
}

// Gates sorted lowest first (TEAGRITS order breaks ties)
export function sortedGates(gateScores) {
  return [...GATES].sort((a, b) => gateScores[a.key] - gateScores[b.key])
}

// Priority Moves: the lowest gate, plus the second-lowest unless it's already Aligned
export function priorityGates(gateScores) {
  const sorted = sortedGates(gateScores)
  return gateScores[sorted[1].key] >= 85 ? [sorted[0]] : [sorted[0], sorted[1]]
}

// Escalated Fear Detox bridge: Emotions or State is the lowest gate, or either is below 50
export function bridgeEscalated(gateScores) {
  const lowest = sortedGates(gateScores)[0]
  return lowest.key === 'E' || lowest.key === 'S' || gateScores.E < 50 || gateScores.S < 50
}

export async function captureDetox(payload) {
  try {
    await fetch('/.netlify/functions/capture-detox', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (e) { console.log('capture failed', e) }
}
