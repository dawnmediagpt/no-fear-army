import { useState, useEffect, useRef } from 'react'
import {
  GATES, scoreAll, band, sortedGates, priorityGates, bridgeEscalated, captureDetox
} from './detoxData.js'

// ——— Emerald palette (section 10). Turquoise is reserved — never borrow it. ———
const p = {
  bg: '#111111', surface: '#1a1a1a', surface2: '#252525',
  emerald: '#0FA36B', emeraldDeep: '#0A6B47',
  gold: '#e9c31f', white: '#ffffff', muted: '#999999',
  border: '#2a2a2a',
  borderEm: 'rgba(15,163,107,0.35)', emBg: 'rgba(15,163,107,0.08)',
  borderGold: 'rgba(233,195,31,0.3)', goldBg: 'rgba(233,195,31,0.06)',
  amber: '#c98a2d'
}

const lbl = { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', color: p.emerald, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }
const inp = { width: '100%', background: p.surface2, border: `1px solid ${p.border}`, borderRadius: '10px', padding: '14px 16px', color: p.white, fontSize: '15px', outline: 'none' }
const btn = { background: p.gold, color: p.bg, fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '15px', letterSpacing: '1px', border: 'none', borderRadius: '10px', padding: '14px 28px', cursor: 'pointer', width: '100%' }
const ghostEm = { background: 'transparent', color: p.emerald, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '14px', letterSpacing: '1px', border: `1.5px solid ${p.emerald}`, borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', width: '100%' }
const card = { background: p.surface, border: `1px solid ${p.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }
const emCard = { background: p.emBg, border: `1px solid ${p.borderEm}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }
const goldCard = { background: p.goldBg, border: `1px solid ${p.borderGold}`, borderRadius: '12px', padding: '20px' }
const h2s = { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(22px,5vw,34px)', fontWeight: 700, color: p.white, lineHeight: 1.15, margin: '0 0 10px' }
const body = { fontSize: '16px', lineHeight: '1.75', color: '#cccccc', margin: '0 0 16px' }
const small = { fontSize: '13px', color: p.muted, lineHeight: '1.6' }

// Bar color: emerald intensity signals level (bright = high, deep/dim = low)
const lerp = (a, b, t) => Math.round(a + (b - a) * t)
const barColor = s => {
  const t = s / 100
  return `rgb(${lerp(10, 15, t)},${lerp(107, 163, t)},${lerp(71, 107, t)})`
}

function Gauge({ label, score }) {
  const arc = Math.PI * 54
  const filled = (Math.max(0, Math.min(100, score)) / 100) * arc
  return (
    <div style={{ flex: 1, textAlign: 'center', minWidth: '140px' }}>
      <svg viewBox="0 0 128 84" style={{ width: '100%', maxWidth: '170px' }}>
        <path d="M 10 72 A 54 54 0 0 1 118 72" fill="none" stroke={p.surface2} strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 72 A 54 54 0 0 1 118 72" fill="none" stroke={barColor(score)} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${filled} ${arc + 20}`} style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="64" y="62" textAnchor="middle" fill={p.white} fontFamily="'Oswald', sans-serif" fontWeight="700" fontSize="26">{Math.round(score)}</text>
        <text x="64" y="80" textAnchor="middle" fill={p.muted} fontFamily="'Oswald', sans-serif" fontSize="9" letterSpacing="2">{label.toUpperCase()}</text>
      </svg>
    </div>
  )
}

function GateBar({ gate, score }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '1.5px', color: '#cccccc' }}>
          <span style={{ color: p.emerald, fontWeight: 700 }}>{gate.letter}</span> · {gate.name.toUpperCase()}
          <span style={{ color: '#666', fontSize: '10px', letterSpacing: '2px' }}> {gate.layer === 'inner' ? ' INNER' : ' OUTER'}</span>
        </span>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 700, color: p.white }}>{Math.round(score)}</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: p.surface2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(2, score)}%`, borderRadius: '4px', background: barColor(score), opacity: 0.55 + 0.45 * (score / 100), transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

// Settle bookend — a guided slow breath to the Zero Point
function Breath({ prompt, buttonText, onDone }) {
  const [phase, setPhase] = useState('in')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 4000)
    const t2 = setTimeout(() => { setPhase('in') }, 10000)
    const t3 = setTimeout(() => setPhase('out'), 14000)
    const t4 = setTimeout(() => setReady(true), 20000)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <span style={{ ...lbl, textAlign: 'center' }}>THE ZERO POINT</span>
      <h2 style={{ ...h2s, textAlign: 'center' }}>{prompt}</h2>
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
        <div style={{
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,163,107,0.35), rgba(15,163,107,0.05))',
          border: `1.5px solid ${p.borderEm}`,
          transform: phase === 'in' ? 'scale(1.25)' : 'scale(0.75)',
          transition: phase === 'in' ? 'transform 4s ease-in-out' : 'transform 6s ease-in-out'
        }} />
      </div>
      <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '15px', letterSpacing: '3px', color: p.emerald, marginBottom: '32px' }}>
        {phase === 'in' ? 'BREATHE IN' : 'LONG BREATH OUT'}
      </p>
      <button style={{ ...btn, maxWidth: '340px', opacity: ready ? 1 : 0.35, transition: 'opacity 1s' }} onClick={onDone} disabled={!ready}>{buttonText}</button>
    </div>
  )
}

const RATING_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

const emptyAnswers = () => Object.fromEntries(GATES.map(g => [g.key, [0, 0]]))

export default function EntrepreneurDetox() {
  // screens: landing | settle | assess | report | ignition | ignitionBreath | ignitionResult
  const [screen, setScreen] = useState('landing')
  const [showModal, setShowModal] = useState(false)
  const [pendingMode, setPendingMode] = useState('full')
  const [firstName, setFirstName] = useState(() => localStorage.getItem('detox_firstName') || '')
  const [email, setEmail] = useState(() => localStorage.getItem('detox_email') || '')
  const [joinLoading, setJoinLoading] = useState(false)
  const [gateIdx, setGateIdx] = useState(0)
  const [answers, setAnswers] = useState(emptyAnswers)
  const [ignAnswers, setIgnAnswers] = useState(Object.fromEntries(GATES.map(g => [g.key, 3])))
  const logged = useRef(false)
  const preview = useRef(false)

  useEffect(() => { document.title = "The Entrepreneur's Detox — Doll Avant" }, [])

  // Design preview: /detox?preview=report or /detox?preview=ignition (never logged)
  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get('preview')
    if (mode === 'report') {
      preview.current = true
      logged.current = true
      setAnswers(Object.fromEntries(GATES.map((g, i) => [g.key, [(i % 5) + 1, ((i + 2) % 5) + 1]])))
      setScreen('report')
    } else if (mode === 'ignition') {
      preview.current = true
      setIgnAnswers(Object.fromEntries(GATES.map((g, i) => [g.key, (i % 5) + 1])))
      setScreen('ignitionResult')
    }
  }, [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [screen, gateIdx])

  const knownEmail = email.includes('@')

  const start = mode => {
    setPendingMode(mode)
    // The Ignition: email required on first run only — recognized emails skip straight in
    if (mode === 'ignition' && knownEmail && localStorage.getItem('detox_email')) { setScreen('ignition'); return }
    setShowModal(true)
  }

  const submitEmail = async () => {
    setJoinLoading(true)
    localStorage.setItem('detox_email', email)
    localStorage.setItem('detox_firstName', firstName)
    await captureDetox({ event: 'signup', firstName, email, type: pendingMode === 'ignition' ? 'entrepreneur_ignition' : 'entrepreneur' })
    setJoinLoading(false)
    setShowModal(false)
    setScreen(pendingMode === 'ignition' ? 'ignition' : 'settle')
  }

  const setAnswer = (gateKey, qIdx, val) => {
    setAnswers(prev => {
      const next = { ...prev, [gateKey]: [...prev[gateKey]] }
      next[gateKey][qIdx] = val
      return next
    })
  }

  const gate = GATES[gateIdx]
  const gateDone = gate && answers[gate.key].every(v => v > 0)

  const finishAssessment = () => {
    logged.current = false
    setScreen('report')
  }

  // ——— Full report data ———
  const results = screen === 'report' ? scoreAll(answers) : null
  useEffect(() => {
    if (screen === 'report' && results && !logged.current) {
      logged.current = true
      captureDetox({
        event: 'assessment', email, firstName, type: 'entrepreneur',
        gate_scores: Object.fromEntries(Object.entries(results.gateScores).map(([k, v]) => [k, Math.round(v)])),
        inner_score: Math.round(results.innerScore), outer_score: Math.round(results.outerScore),
        balance_score: Math.round(results.balanceScore), raw_inputs: answers
      })
    }
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ——— Ignition result data ———
  const ignResults = (screen === 'ignitionBreath' || screen === 'ignitionResult')
    ? scoreAll(Object.fromEntries(GATES.map(g => [g.key, [ignAnswers[g.key]]])))
    : null
  const ignLowest = ignResults ? sortedGates(ignResults.gateScores)[0] : null
  const submitIgnition = () => {
    const r = scoreAll(Object.fromEntries(GATES.map(g => [g.key, [ignAnswers[g.key]]])))
    captureDetox({
      event: 'assessment', email, firstName, type: 'entrepreneur_ignition',
      gate_scores: Object.fromEntries(Object.entries(r.gateScores).map(([k, v]) => [k, Math.round(v)])),
      inner_score: Math.round(r.innerScore), outer_score: Math.round(r.outerScore),
      balance_score: Math.round(r.balanceScore), raw_inputs: ignAnswers
    })
    setScreen('ignitionBreath')
  }

  const restart = () => {
    setAnswers(emptyAnswers()); setGateIdx(0); setScreen('landing')
  }

  return (
    <div style={{ background: p.bg, minHeight: '100vh', fontFamily: "'Lato', sans-serif", color: p.white, textAlign: 'left' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Lato:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        #root { width: 100%; max-width: 100%; border: none; text-align: left; display: block; }
        textarea, input, select { font-family: 'Lato', sans-serif !important; color: #ffffff !important; }
        ::placeholder { color: #555 !important; }
        textarea:focus, input:focus, select:focus { border-color: ${p.emerald} !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${p.emerald}; border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; background: ${p.surface2}; outline: none; border: none !important; padding: 0; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%; background: ${p.emerald}; cursor: pointer; border: 2px solid #0c7a52; }
        input[type=range]::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: ${p.emerald}; cursor: pointer; border: 2px solid #0c7a52; }
      `}</style>

      {/* Progress header — assessment only */}
      {screen === 'assess' && (
        <div style={{ background: p.surface, borderBottom: `1px solid ${p.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              {GATES.map((g, i) => (
                <div key={g.key} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= gateIdx ? p.emerald : p.border, transition: 'background 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => gateIdx === 0 ? setScreen('settle') : setGateIdx(i => i - 1)} style={{ background: 'none', border: 'none', color: p.muted, fontFamily: "'Oswald',sans-serif", fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', padding: 0 }}>← BACK</button>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '10px', letterSpacing: '2.5px', color: p.emerald }}>GATE {gateIdx + 1} OF 8 · {gate.name.toUpperCase()}</span>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '10px', color: p.muted }}>T.E.A.G.R.I.T.S.</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 120px' }}>

        {/* ——— 1 · LANDING / WORLDVIEW ——— */}
        {screen === 'landing' && (
          <div>
            <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: '11px', letterSpacing: '4px', color: p.emerald, marginBottom: '24px' }}>DOLL AVANT × DOLLHOUSE 2.0</div>
              <h1 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 'clamp(36px,9vw,64px)', fontWeight: 700, color: p.white, lineHeight: 1.1, margin: '0 0 4px' }}>THE ENTREPRENEUR'S</h1>
              <h1 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 'clamp(36px,9vw,64px)', fontWeight: 700, color: p.emerald, lineHeight: 1.1, margin: '0 0 16px' }}>DETOX.</h1>
              <p style={{ ...body, maxWidth: '520px', margin: '0 auto 8px', textAlign: 'center' }}>Eight gates. One BALANCE Score. The full read on where your business is leaking — and the exact move that closes it.</p>
              <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: '15px', letterSpacing: '1.5px', color: p.gold, textAlign: 'center', marginBottom: '32px' }}>Stuck is the enemy of cashflow. Money follows motion.</p>
            </div>

            <div style={{ ...card, borderColor: p.borderEm, marginBottom: '16px' }}>
              <span style={lbl}>WHY A BUSINESS DETOX STARTS WITH FEAR</span>
              <p style={{ ...body, margin: '0 0 14px' }}>Intuition comes from love. Fear is its natural opposite. And every gap between what you know and what you do (the strategy you're sitting on, the call you keep moving, the offer you haven't made) is fear, whatever name it's wearing today.</p>
              <p style={{ ...body, margin: '0 0 14px' }}>Fear doesn't care which door it uses. Thoughts, Emotions, Actions, Giving, Receiving, Intentionality, Time, State — it climbs through whichever one you leave unguarded. This assessment finds the open door.</p>
              <p style={{ ...body, margin: 0, color: p.white }}><strong>F.E.A.R. is Focusing your Emotional Energy and Attention on a Reality that you do not desire.</strong> The next ten minutes will help you aim your focus and attention somewhere better.</p>
            </div>

            <button style={btn} onClick={() => start('full')}>RUN THE DETOX →</button>
            <p style={{ ...small, textAlign: 'center', margin: '14px 0 40px' }}>Takes about 10 minutes. Completely free.</p>

            <div style={{ ...emCard, textAlign: 'center', padding: '28px 24px' }}>
              <span style={{ ...lbl, textAlign: 'center' }}>THE IGNITION · 2 MINUTES</span>
              <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: '24px', fontWeight: 700, color: p.white, margin: '0 0 10px' }}>Stuck? Start your engine.</h3>
              <p style={{ ...body, margin: '0 0 18px', textAlign: 'center' }}>Feels like you need jumper cables? You don't. Your engine's fine. Turn the key.</p>
              <button style={ghostEm} onClick={() => start('ignition')}>START YOUR ENGINE →</button>
            </div>

            <p style={{ ...small, textAlign: 'center', marginTop: '32px', fontSize: '12px' }}>© 2026 Doll Avant. All Rights Reserved. · dollavant.com</p>
          </div>
        )}

        {/* ——— 3 · SETTLE ——— */}
        {screen === 'settle' && (
          <Breath prompt="Before we look at anything, come back to the Zero Point." buttonText="I'M AT ZERO — RUN THE DETOX →" onDone={() => { setGateIdx(0); setScreen('assess') }} />
        )}

        {/* ——— 4 · ASSESSMENT (one gate per screen) ——— */}
        {screen === 'assess' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '54px', fontWeight: 700, color: p.emerald, lineHeight: 1 }}>{gate.letter}</span>
                <div>
                  <h2 style={{ ...h2s, margin: 0 }}>{gate.name}</h2>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '10px', letterSpacing: '2.5px', color: p.muted }}>{gate.layer === 'inner' ? 'INNER GATE' : 'OUTER GATE'}</span>
                </div>
              </div>
              <p style={{ ...small, margin: '10px 0 0' }}>Present tense. Today. Rate how true each one is right now.</p>
            </div>
            {gate.questions.map((q, qi) => (
              <div key={qi} style={card}>
                <p style={{ ...body, color: p.white, margin: '0 0 18px', fontWeight: 600 }}>{q}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(v => {
                    const sel = answers[gate.key][qi] === v
                    return (
                      <button key={v} onClick={() => setAnswer(gate.key, qi, v)} title={RATING_LABELS[v - 1]}
                        style={{ flex: 1, padding: '13px 0', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '16px', background: sel ? p.emerald : p.surface2, color: sel ? p.bg : '#cccccc', border: `1px solid ${sel ? p.emerald : p.border}`, transition: 'all 0.15s' }}>{v}</button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#666' }}>Strongly disagree</span>
                  <span style={{ fontSize: '11px', color: '#666' }}>Strongly agree</span>
                </div>
              </div>
            ))}
            <button style={{ ...btn, opacity: gateDone ? 1 : 0.5, marginTop: '8px' }} disabled={!gateDone}
              onClick={() => gateIdx < GATES.length - 1 ? setGateIdx(i => i + 1) : finishAssessment()}>
              {gateIdx < GATES.length - 1 ? `NEXT GATE · ${GATES[gateIdx + 1].name.toUpperCase()} →` : 'GET MY BALANCE SCORE →'}
            </button>
          </div>
        )}

        {/* ——— 6 · REPORT ——— */}
        {screen === 'report' && results && (() => {
          const b = band(results.balanceScore)
          const priorities = priorityGates(results.gateScores)
          const priorityKeys = priorities.map(g => g.key)
          const rest = GATES.filter(g => !priorityKeys.includes(g.key))
          const escalated = bridgeEscalated(results.gateScores)
          const bandColor = b.name === 'Depleted' ? p.amber : p.emerald
          return (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <span style={{ ...lbl, textAlign: 'center' }}>{firstName ? `${firstName.toUpperCase()}, HERE'S` : "HERE'S"} YOUR BALANCE SCORE</span>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 'clamp(72px,18vw,120px)', fontWeight: 700, color: p.gold, lineHeight: 1 }}>{Math.round(results.balanceScore)}</div>
                <div style={{ display: 'inline-block', border: `1px solid ${bandColor}`, borderRadius: '30px', padding: '7px 20px', margin: '14px 0 10px' }}>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '13px', letterSpacing: '3px', color: bandColor }}>{b.name.toUpperCase()}</span>
                </div>
                <p style={{ ...body, textAlign: 'center', margin: '0 auto', maxWidth: '400px' }}>{b.read}</p>
              </div>

              <div style={{ ...card, display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Gauge label="Inner Balance" score={results.innerScore} />
                <Gauge label="Outer Balance" score={results.outerScore} />
              </div>

              <div style={card}>
                <span style={lbl}>THE EIGHT GATES</span>
                {GATES.map(g => <GateBar key={g.key} gate={g} score={results.gateScores[g.key]} />)}
              </div>

              <div style={{ ...card, borderColor: p.borderEm }}>
                <span style={lbl}>PRIORITY MOVES — WHERE FEAR GOT IN</span>
                <p style={{ ...small, marginBottom: '16px' }}>Your lowest {priorities.length === 1 ? 'gate' : 'gates'}. Every low gate is fear wearing a different disguise — here's the move that closes the door.</p>
                {priorities.map(g => (
                  <div key={g.key} style={{ ...emCard, marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '14px', letterSpacing: '2px', color: p.emerald, fontWeight: 700 }}>{g.letter} · {g.name.toUpperCase()}</span>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '16px', fontWeight: 700, color: p.white }}>{Math.round(results.gateScores[g.key])}</span>
                    </div>
                    <p style={{ ...body, margin: 0, color: p.white }}>{g.correction}</p>
                  </div>
                ))}
              </div>

              <div style={card}>
                <span style={lbl}>THE FULL REPORT — EVERY GATE</span>
                {rest.map(g => (
                  <div key={g.key} style={{ borderTop: `1px solid ${p.border}`, padding: '14px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '12px', letterSpacing: '2px', color: '#cccccc' }}>{g.letter} · {g.name.toUpperCase()}</span>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '14px', fontWeight: 700, color: p.white }}>{Math.round(results.gateScores[g.key])}</span>
                    </div>
                    <p style={{ ...small, margin: 0 }}>{g.correction}</p>
                  </div>
                ))}
              </div>

              <div style={{ ...card, textAlign: 'center', padding: '28px 24px' }}>
                <span style={{ ...lbl, textAlign: 'center' }}>THE ZERO POINT CLOSE</span>
                <p style={{ ...body, textAlign: 'center', margin: '0 0 4px', color: p.white }}>One breath out. Long and slow.</p>
                <p style={{ ...small, textAlign: 'center' }}>You've seen the open door. Now close it from a settled body.</p>
              </div>

              {/* Universal Fear Detox bridge — gold signals "the family" */}
              <div style={{ ...goldCard, marginBottom: '16px', padding: '28px 24px' }}>
                <span style={{ ...lbl, color: p.gold }}>YOUR NEXT MOVE</span>
                {escalated ? (
                  <p style={{ ...body, color: p.white }}>Your lowest gates are the two fear touches first. Run the Fear Detox today — before the next build session, not after.</p>
                ) : (
                  <p style={{ ...body, color: p.white }}>Every low gate you just saw is fear wearing a different disguise. The Fear Detox is the deep-dive that clears it at the root — the same free reset Doll runs on herself. Take your results there.</p>
                )}
                <button style={btn} onClick={() => { window.location.href = '/' }}>RUN THE FEAR DETOX →</button>
              </div>

              <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: '14px', letterSpacing: '1.5px', color: p.emerald, textAlign: 'center', margin: '24px 0 8px' }}>Run it again tomorrow. Watch your BALANCE move.</p>
              {knownEmail && <p style={{ ...small, textAlign: 'center', marginBottom: '24px' }}>Your report is headed to {email}.</p>}
              <button style={{ ...ghostEm, maxWidth: '340px', display: 'block', margin: '0 auto' }} onClick={restart}>BACK TO THE START →</button>
              <p style={{ ...small, textAlign: 'center', marginTop: '32px', fontSize: '12px' }}>© 2026 Doll Avant. All Rights Reserved. · dollavant.com</p>
            </div>
          )
        })()}

        {/* ——— 7 · THE IGNITION ——— */}
        {screen === 'ignition' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ ...lbl, textAlign: 'center' }}>THE IGNITION</span>
              <h2 style={{ ...h2s, textAlign: 'center' }}>Stuck? Start your engine.</h2>
              <p style={{ ...small, textAlign: 'center', maxWidth: '420px', margin: '0 auto' }}>Eight keys. Gut answers, no overthinking. 1 = no. 5 = fully yes.</p>
            </div>
            {GATES.map(g => (
              <div key={g.key} style={{ ...card, padding: '18px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '11px', letterSpacing: '2px', color: p.emerald, fontWeight: 700 }}>{g.letter} · {g.name.toUpperCase()}</span>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '15px', fontWeight: 700, color: p.white }}>{ignAnswers[g.key]}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#cccccc', margin: '0 0 14px', lineHeight: 1.5 }}>{g.ignition}</p>
                <input type="range" min="1" max="5" step="1" value={ignAnswers[g.key]}
                  onChange={e => setIgnAnswers(prev => ({ ...prev, [g.key]: Number(e.target.value) }))} />
              </div>
            ))}
            <button style={{ ...btn, marginTop: '8px' }} onClick={submitIgnition}>TURN THE KEY →</button>
          </div>
        )}

        {screen === 'ignitionBreath' && (
          <Breath prompt="One breath out before you move." buttonText="SHOW ME MY KEY →" onDone={() => setScreen('ignitionResult')} />
        )}

        {screen === 'ignitionResult' && ignResults && ignLowest && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ ...lbl, textAlign: 'center' }}>YOUR STUCK POINT</span>
              <h2 style={{ ...h2s, textAlign: 'center' }}>{ignLowest.letter} · {ignLowest.name}</h2>
              <p style={{ ...small, textAlign: 'center' }}>That's the open door. Here's the one move that closes it.</p>
            </div>
            <div style={{ ...emCard, padding: '28px 24px', marginBottom: '24px' }}>
              <span style={lbl}>DO THIS ONE THING — RIGHT NOW</span>
              <p style={{ ...body, margin: 0, color: p.white, fontSize: '18px' }}>{ignLowest.correction}</p>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: 'clamp(26px,6vw,38px)', fontWeight: 700, color: p.gold, margin: '0 0 6px' }}>Go. Money follows motion.</p>
              <p style={{ ...small, textAlign: 'center' }}>Stuck is the enemy of cashflow. These are the keys that start your engine.</p>
            </div>
            <button style={{ ...ghostEm, marginBottom: '12px' }} onClick={() => setScreen('ignition')}>RUN THE IGNITION AGAIN →</button>
            <button style={btn} onClick={restart}>WANT THE FULL READ? RUN THE DETOX →</button>
            <p style={{ ...small, textAlign: 'center', marginTop: '32px', fontSize: '12px' }}>© 2026 Doll Avant. All Rights Reserved. · dollavant.com</p>
          </div>
        )}

      </div>

      {/* ——— 2 · EMAIL GATE ——— */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: p.surface, border: `1px solid ${p.borderEm}`, borderRadius: '20px', padding: '36px 28px', maxWidth: '440px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: '11px', letterSpacing: '4px', color: p.emerald, marginBottom: '12px' }}>THE ENTREPRENEUR'S DETOX</div>
              <h2 style={{ ...h2s, fontSize: '28px', marginBottom: '16px' }}>{pendingMode === 'ignition' ? "Let's start your engine." : "Let's find the open door."}</h2>
              <p style={{ ...body, margin: 0, color: p.muted }}>Enter your email and we'll send your full BALANCE report to your inbox — plus the daily detox prompt that keeps your engine running.</p>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <span style={lbl}>YOUR FIRST NAME</span>
              <input style={inp} placeholder="What do you want us to call you?" value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <span style={lbl}>YOUR EMAIL</span>
              <input style={inp} placeholder="Where should we send your report?" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button style={{ ...btn, opacity: firstName.trim() && email.includes('@') && !joinLoading ? 1 : 0.5 }} disabled={!firstName.trim() || !email.includes('@') || joinLoading} onClick={submitEmail}>{joinLoading ? 'ONE SECOND…' : "I'M IN — LET'S GO →"}</button>
            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: p.muted, fontFamily: "'Oswald',sans-serif", fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', width: '100%', marginTop: '14px' }}>← BACK</button>
            <p style={{ ...small, textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>No spam. One daily prompt. Unsubscribe anytime.</p>
          </div>
        </div>
      )}
    </div>
  )
}
