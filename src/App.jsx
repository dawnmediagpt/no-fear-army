import { useState, useEffect } from 'react'
import './App.css'

const p = {
  bg: '#111111',
  surface: '#1a1a1a',
  surface2: '#252525',
  gold: '#e9c31f',
  goldDim: '#c9a427',
  white: '#ffffff',
  muted: '#999999',
  border: '#2a2a2a',
  borderGold: 'rgba(233,195,31,0.3)',
  red: '#cc2200'
}

const STEPS = ['', 'YOUR MOVIE', 'THE WHISPERS', 'YOUR NEW IDENTITY', 'LOCK IT IN', 'SCHEDULE IT', 'JOIN THE ARMY']

const FEAR_WHISPERS = [
  'I don''t know how to do that',
  'I don''t have the money or resources',
  'I could never do that',
  'I''ll get to it someday',
  'What will people think?',
  'I''m not ready yet',
  'Someone else is already doing it',
  'It probably won''t work anyway'
]
const FEAR_TYPES = [
  {
    id: 'whisper', label: 'THE WHISPER', emoji: '🤫',
    desc: 'Quiet doubt. "Someday." "I''m not ready."',
    origin: 'Anticipatory fear — your brain running a threat simulation before any real danger exists.',
    looks: 'It sounds like logic. "I need more time." "I''ll do it when I''m more prepared." It feels like patience. It''s actually avoidance dressed up as strategy.',
    regulate: 'Name it out loud: "That''s a whisper. That''s not data." Then ask: "What would I do if I already knew how?"'
  },
  {
    id: 'freeze', label: 'THE FREEZE', emoji: '🧊',
    desc: 'You know what to do. You just... can''t move.',
    origin: 'Dorsal vagal shutdown — your nervous system''s most ancient response, activating when a threat feels inescapable.',
    looks: 'The open tab you don''t click. The draft you don''t send. The call you don''t make. You know exactly what to do. Your body won''t let you.',
    regulate: 'Long exhale first — your nervous system responds to the exhale before the inhale. Then name ONE three-minute action. Just one.'
  },
  {
    id: 'spiral', label: 'THE SPIRAL', emoji: '🌀',
    desc: 'One worry becomes ten becomes catastrophe.',
    origin: 'Hyperactivation of the default mode network — the brain''s rumination loop running without an anchor.',
    looks: '"What if it doesn''t work" becomes "what if I lose everything" becomes "what if I was never meant for this." Each thought feels like evidence. None of it is.',
    regulate: 'Step into Observer State. You''re not the spiral — you''re watching it. Write the worst case fully. Then ask: "And then what?" Follow it to its end. The spiral loses power when it has nowhere left to go.'
  },
  {
    id: 'sabotage', label: 'THE SABOTAGE', emoji: '🔥',
    desc: 'You started. Then you stopped. On purpose.',
    origin: 'Unconscious self-protection — the brain preventing exposure to the vulnerability that comes with actually being seen.',
    looks: 'You had momentum. Then you got "busy." The deadline passed. The draft disappeared. You told yourself it wasn''t the right time. It was never about time.',
    regulate: 'Get curious, not critical. Ask: "What am I protecting myself from?" The sabotage is not the enemy — it''s a signal. Find what it''s guarding and name it directly.'
  }
]

const REGULATION_MAP = {
  whisper: 'Name it out loud: "That''s a whisper. That''s not data." Then ask: "What would I do if I already knew how?"',
  freeze: 'Long exhale first — your nervous system responds to the exhale before the inhale. Then find ONE three-minute action you can take right now.',
  spiral: 'Step into observer state. You are not the spiral — you''re the one watching it. Write the worst case down. Then ask: "And then what?"',
  sabotage: 'Get curious, not critical. Ask yourself: "What am I protecting myself from?" The sabotage exists for a reason. Find it. Name it. That''s where the work is.'
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM']
async function captureEmail(firstName, email) {
  try {
    await fetch('/.netlify/functions/capture-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, email })
    })
  } catch(e) { console.log('capture failed', e) }
}

const COACH_SYSTEM = `You are Doll Avant — founder of DollHouse 2.0, TEDx speaker, Harvard Business School Expert in Residence, and creator of The Year of No Fear. You coach using identity shift psychology, neuroscience, and the principle that fear announces itself as limitation, not danger. Your voice: warm, direct, specific. You write in contractions. You speak to one person at a time. You never use: "journey," "amazing," "incredible," "leverage," "paradigm," or "synergy." You ground spiritual truth in science immediately. You end sections with short declarative statements — never questions.`

const S = {
  label: { fontFamily: `'Oswald', sans-serif`, fontSize: `11px`, letterSpacing: `3px`, color: p.gold, textTransform: `uppercase`, marginBottom: `8px`, display: `block` },
  textarea: { width: `100  const canAdvanceStep2 = fearItems.filter(f => f.trim()).length > 0 && (selectedWhispers.length > 0 || otherFear.trim() || selectedFearType)

  return (
    <div style={{ background: p.bg, minHeight: '100vh', fontFamily: `'Lato', sans-serif`, color: p.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Lato:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea, input, select { font-family: 'Lato', sans-serif !important; color: #ffffff !important; }
        option { background: #1a1a1a; }
        ::placeholder { color: #555 !important; }
        textarea:focus, input:focus, select:focus { border-color: #e9c31f !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e9c31f; border-radius: 2px; }
      `}</style>

      {step > 0 && step < 7 && (
        <div style={{ background: p.surface, borderBottom: `1px solid ${p.border}`, padding: `14px 20px`, position: `sticky`, top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: `680px`, margin: `0 auto` }}>
            <div style={{ display: `flex`, gap: `4px`, marginBottom: `8px` }}>
              {[1,2,3,4,5,6].map(n => (
                <div key={n} style={{ flex: 1, height: `3px`, borderRadius: `2px`, background: step >= n ? p.gold : p.border, transition: `background 0.3s` }} />
              ))}
            </div>
            <div style={{ display: `flex`, justifyContent: `space-between`, alignItems: `center` }}>
              <button onClick={() => setStep(s => Math.max(0, s-1))} style={{ background: `none`, border: `none`, color: p.muted, fontFamily: `'Oswald', sans-serif`, fontSize: `11px`, letterSpacing: `2px`, cursor: `pointer`, padding: `0` }}>← BACK</button>
              <span style={{ fontFamily: `'Oswald', sans-serif`, fontSize: `10px`, letterSpacing: `2.5px`, color: p.gold }}>{STEPS[step]}</span>
              <span style={{ fontFamily: `'Oswald', sans-serif`, fontSize: `10px`, letterSpacing: `1px`, color: p.muted }}>{step} / 6</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: `680px`, margin: `0 auto`, padding: `32px 20px 140px` }}>

        {step === 0 && (
          <div>
            <div style={{ textAlign: `center`, padding: `48px 0 32px` }}>
              <div style={{ fontFamily: `'Oswald', sans-serif`, fontSize: `11px`, letterSpacing: `4px`, color: p.gold, marginBottom: `24px` }}>DOLL AVANT × DOLLHOUSE 2.0</div>
              <h1 style={{ ...S.h1, fontSize: `clamp(40px,10vw,72px)`, marginBottom: `8px` }}>YEAR OF</h1>
              <h1 style={{ ...S.h1, fontSize: `clamp(40px,10vw,72px)`, color: p.gold, marginBottom: `4px` }}>NO FEAR.</h1>
              <div style={{ fontFamily: `'Oswald', sans-serif`, fontSize: `clamp(16px,3.5vw,22px)`, fontWeight: 700, color: p.muted, letterSpacing: `5px`, marginBottom: `24px` }}>F IMPOSSIBLE.</div>
              <p style={{ ...S.body, maxWidth: `520px`, margin: `0 auto 28px`, textAlign: `center` }}>A 365-day public experiment. A movement for brilliant visionaries, creatives, and entrepreneurs who are done letting fear limit their life.</p>
              <div style={{ display: `flex`, gap: `10px`, justifyContent: `center`, flexWrap: `wrap`, marginBottom: `40px` }}>
                {['#NOFEARARMY','#BOYCOTTFEAR','#FIMPOSSIBLE'].map(tag => (
                  <div key={tag} style={{ display: `inline-block`, background: `rgba(233,195,31,0.1)`, border: `1px solid ${p.borderGold}`, borderRadius: `30px`, padding: `7px 16px` }}>
                    <span style={{ fontFamily: `'Oswald', sans-serif`, fontSize: `12px`, letterSpacing: `1.5px`, color: p.gold }}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...S.card, borderColor: p.borderGold, marginBottom: `16px` }}>
              <span style={S.label}>THE SILENT KILLER</span>
              <p style={{ ...S.body, margin: `0 0 14px` }}>Fear has real <strong style={{ color: p.white }}>chemical, biological, neurological, physiological, psychological, and financial</strong> impacts on your life — and it is the one thing underneath all of it.</p>
              <p style={{ color: p.gold, fontFamily: `'Oswald', sans-serif`, fontWeight: 600, fontSize: `16px`, margin: 0 }}>Fear is the dream killer. The momentum killer. The silent killer. And we don't recognize it because it doesn't yell.</p>
            </div>
            <div style={{ ...S.card, marginBottom: `32px` }}>
              <span style={S.label}>WHAT FEAR ACTUALLY LOOKS LIKE</span>
              <p style={{ ...S.body, margin: `0 0 14px` }}>Thoughts of limitation and lack are manifestations of fear. If you are sitting on unrealized dreams, unfinished projects, untested ideas — that is fear.</p>
              <p style={{ ...S.body, margin: 0 }}>Fear doesn't announce itself. It <em>whispers.</em> It shows up as "I don't know how to do that" — or "I don't have the resources" — or "I'll get to it someday." It sounds like logic. It feels like caution. It is neither.</p>
            </div>
            <button style={S.btn} onClick={() => setShowModal(true)}>BEGIN YOUR FEAR DETOX →</button>
            <p style={{ ...S.small, textAlign: `center`, marginTop: `16px` }}>Takes 10–15 minutes. Completely free.</p>
          </div>
        )}
