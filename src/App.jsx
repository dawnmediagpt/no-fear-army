import { useState, useEffect } from 'react'
import './App.css'

const p = {
  bg: '#111111', surface: '#1a1a1a', surface2: '#252525',
  gold: '#e9c31f', white: '#ffffff', muted: '#999999',
  border: '#2a2a2a', borderGold: 'rgba(233,195,31,0.3)'
}

const STEPS = ['','YOUR MOVIE','THE WHISPERS','YOUR NEW IDENTITY','LOCK IT IN','SCHEDULE IT','JOIN THE ARMY']

const FEAR_WHISPERS = [
  "I don't know how to do that",
  "I don't have the money or resources",
  "I could never do that",
  "I'll get to it someday",
  "What will people think?",
  "I'm not ready yet",
  "Someone else is already doing it",
  "It probably won't work anyway"
]

const FEAR_TYPES = [
  { id:'whisper', label:'THE WHISPER', emoji:'🤫', desc:'Quiet doubt. "Someday." "I\'m not ready."',
    origin:'Anticipatory fear — your brain running a threat simulation before any real danger exists.',
    looks:'It sounds like logic. "I need more time." It feels like patience. It\'s actually avoidance dressed up as strategy.',
    regulate:'Name it out loud: "That\'s a whisper. That\'s not data." Then ask: "What would I do if I already knew how?"'},
  { id:'freeze', label:'THE FREEZE', emoji:'🧊', desc:"You know what to do. You just... can't move.",
    origin:'Dorsal vagal shutdown — your nervous system\'s most ancient response, activating when a threat feels inescapable.',
    looks:"The open tab you don't click. The draft you don't send. You know exactly what to do. Your body won't let you.",
    regulate:'Long exhale first — your nervous system responds to the exhale before the inhale. Then name ONE three-minute action. Just one.'},
  { id:'spiral', label:'THE SPIRAL', emoji:'🌀', desc:'One worry becomes ten becomes catastrophe.',
    origin:"Hyperactivation of the default mode network — the brain's rumination loop running without an anchor.",
    looks:'"What if it doesn\'t work" becomes "what if I lose everything." Each thought feels like evidence. None of it is.',
    regulate:"Step into Observer State. You're not the spiral — you're watching it. Write the worst case. Then ask: 'And then what?'"},
  { id:'sabotage', label:'THE SABOTAGE', emoji:'🔥', desc:'You started. Then you stopped. On purpose.',
    origin:'Unconscious self-protection — the brain preventing exposure to the vulnerability that comes with actually being seen.',
    looks:"You had momentum. Then you got 'busy.' The deadline passed. It was never about time.",
    regulate:"Get curious, not critical. Ask: 'What am I protecting myself from?' The sabotage is a signal. Find what it's guarding."}
]

const REGULATION_MAP = {
  whisper: "Name it out loud: 'That's a whisper. That's not data.' Then ask: 'What would I do if I already knew how?'",
  freeze: 'Long exhale first. Then find ONE three-minute action you can take right now.',
  spiral: "Step into observer state. Write the worst case down. Then ask: 'And then what?'",
  sabotage: "Get curious, not critical. Ask: 'What am I protecting myself from?' Find it. Name it."
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM']

async function captureEmail(firstName, email) {
  try {
    await fetch('/.netlify/functions/capture-email', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({firstName, email})
    })
  } catch(e) { console.log('capture failed', e) }
}

const lbl = { fontFamily:"'Oswald', sans-serif", fontSize:'11px', letterSpacing:'3px', color:'#e9c31f', textTransform:'uppercase', marginBottom:'8px', display:'block' }
const ta = { width:'100%', background:'#252525', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'16px', color:'#ffffff', fontSize:'15px', lineHeight:'1.7', resize:'vertical', minHeight:'120px', outline:'none' }
const inp = { width:'100%', background:'#252525', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'14px 16px', color:'#ffffff', fontSize:'15px', outline:'none' }
const btn = { background:'#e9c31f', color:'#111111', fontFamily:"'Oswald', sans-serif", fontWeight:700, fontSize:'15px', letterSpacing:'1px', border:'none', borderRadius:'10px', padding:'14px 28px', cursor:'pointer', width:'100%' }
const ghost = { background:'transparent', color:'#e9c31f', fontFamily:"'Oswald', sans-serif", fontWeight:600, fontSize:'14px', letterSpacing:'1px', border:'1.5px solid #e9c31f', borderRadius:'10px', padding:'12px 24px', cursor:'pointer', width:'100%' }
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'14px', padding:'24px', marginBottom:'16px' }
const goldCard = { background:'rgba(233,195,31,0.06)', border:'1px solid rgba(233,195,31,0.3)', borderRadius:'12px', padding:'20px', marginTop:'16px' }
const h2s = { fontFamily:"'Oswald', sans-serif", fontSize:'clamp(22px,5vw,34px)', fontWeight:700, color:'#ffffff', lineHeight:1.15, margin:'0 0 10px' }
const body = { fontSize:'16px', lineHeight:'1.75', color:'#cccccc', margin:'0 0 16px' }
const small = { fontSize:'13px', color:'#999999', lineHeight:'1.6' }

export default function App() {
  const [step, setStep] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [movieText, setMovieText] = useState('')
  const [movieResponse, setMovieResponse] = useState('')
  const [fearItems, setFearItems] = useState(['','',''])
  const [fearButs, setFearButs] = useState(['','',''])
  const [selectedWhispers, setSelectedWhispers] = useState([])
  const [otherFear, setOtherFear] = useState('')
  const [selectedFearType, setSelectedFearType] = useState([])
  const [expandedFearType, setExpandedFearType] = useState(null)
  const [oldStory, setOldStory] = useState('')
  const [newChoice, setNewChoice] = useState('')
  const [priorities, setPriorities] = useState([{what:'',success:'',onlyWay:'',steps:['','','']}])
  const [schedule, setSchedule] = useState([{day:'Monday',time:'8:00 AM'}])
  const [movieLoading, setMovieLoading] = useState(false)
  const [prioLoading, setPrioLoading] = useState(false)
  const [priorityResponse, setPriorityResponse] = useState('')
  const [showFieldGuide, setShowFieldGuide] = useState(false)
  const [fgType, setFgType] = useState('whisper')
  const [fgThought, setFgThought] = useState('')
  const [fgTrigger, setFgTrigger] = useState('')
  const [fearLog, setFearLog] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo({top:0,behavior:'instant'}) }, [step])

  const toggleWhisper = w => setSelectedWhispers(prev => prev.includes(w) ? prev.filter(x=>x!==w) : [...prev,w])

  const updatePri = (i,f,v) => { const a=[...priorities]; a[i]={...a[i],[f]:v}; setPriorities(a) }
  const updateSch = (i,f,v) => { const a=[...schedule]; a[i]={...a[i],[f]:v}; setSchedule(a) }
  const syncSch = arr => setSchedule(arr.map((_,i) => schedule[i]||{day:'Monday',time:'8:00 AM'}))

  const handleMovieSubmit = async () => {
    if (!movieText.trim()||movieLoading) return
    setMovieLoading(true)
    try {
      const res = await fetch('/.netlify/functions/claude-proxy', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,
          system:"You are Doll Avant — founder of DollHouse 2.0, TEDx speaker, Harvard Business School Expert in Residence. Your voice: warm, direct, specific. Contractions always. One person at a time.",
          messages:[{role:'user',content:`Someone wrote what they want their life's movie to look like:\n\n"${movieText}"\n\nDo three things:\n1. Name the identity of the person they just described — specific and bold.\n2. Point out the 1-2 things that carry the most emotional weight.\n3. Close with a single direct sentence that helps them feel the pull toward their top priority.\n\nMax 150 words. Warm, direct, contractions always.`}]})
      })
      const data = await res.json()
      setMovieResponse(data.content?.[0]?.text || 'What you just wrote is a blueprint.')
    } catch { setMovieResponse("What you just wrote is a blueprint. The person in those words is you — just your future self, already here, waiting on your permission.") }
    setMovieLoading(false)
  }

  const handlePrioSubmit = async () => {
    if (prioLoading) return
    setPrioLoading(true)
    try {
      const res = await fetch('/.netlify/functions/claude-proxy', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,
          system:"You are Doll Avant — founder of DollHouse 2.0, TEDx speaker, Harvard Business School Expert in Residence. Your voice: warm, direct, specific. Contractions always.",
          messages:[{role:'user',content:`Weekly priorities:\n\n${priorities.filter(p=>p.what.trim()).map((p,i)=>`Priority ${i+1}: ${p.what}\nSuccess = ${p.success}\nThe only way = ${p.onlyWay}`).join('\n\n')}\n\nIdentity: From "${oldStory}" To "${newChoice}"\n\nCoach them using The Only Way framework. Max 160 words.`}]})
      })
      const data = await res.json()
      setPriorityResponse(data.content?.[0]?.text || "You've named what success looks like. That specificity is the work.")
    } catch { setPriorityResponse("You've named what success looks like. That specificity is the work — most people never get here. Now execute as the person you're choosing to be.") }
    setPrioLoading(false)
  }

  const logFear = () => {
    if (!fgThought.trim()) return
    setFearLog(prev => [{id:Date.now(),type:fgType,thought:fgThought,trigger:fgTrigger,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
      regulation:REGULATION_MAP[fgType]},...prev])
    setFgThought(''); setFgTrigger('')
  }

  const canStep2 = fearItems.filter(f=>f.trim()).length>0 && (selectedWhispers.length>0||otherFear.trim()||selectedFearType.length>0)

  return (
    <div style={{background:'#111111',minHeight:'100vh',fontFamily:"'Lato', sans-serif",color:'#ffffff'}}>
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

      {step>0&&step<7&&(
        <div style={{background:'#1a1a1a',borderBottom:'1px solid #2a2a2a',padding:'14px 20px',position:'sticky',top:0,zIndex:50}}>
          <div style={{maxWidth:'680px',margin:'0 auto'}}>
            <div style={{display:'flex',gap:'4px',marginBottom:'8px'}}>
              {[1,2,3,4,5,6].map(n=>(
                <div key={n} style={{flex:1,height:'3px',borderRadius:'2px',background:step>=n?'#e9c31f':'#2a2a2a',transition:'background 0.3s'}}/>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={{background:'none',border:'none',color:'#999',fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'2px',cursor:'pointer',padding:'0'}}>← BACK</button>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'10px',letterSpacing:'2.5px',color:'#e9c31f'}}>{STEPS[step]}</span>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'10px',color:'#999'}}>{step} / 6</span>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'32px 20px 140px'}}>

        {step===0&&(
          <div>
            <div style={{textAlign:'center',padding:'48px 0 32px'}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'4px',color:'#e9c31f',marginBottom:'24px'}}>DOLL AVANT × DOLLHOUSE 2.0</div>
              <h1 style={{fontFamily:"'Oswald',sans-serif",fontSize:'clamp(40px,10vw,72px)',fontWeight:700,color:'#ffffff',lineHeight:1.1,margin:'0 0 8px'}}>YEAR OF</h1>
              <h1 style={{fontFamily:"'Oswald',sans-serif",fontSize:'clamp(40px,10vw,72px)',fontWeight:700,color:'#e9c31f',lineHeight:1.1,margin:'0 0 4px'}}>NO FEAR.</h1>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'clamp(16px,3.5vw,22px)',fontWeight:700,color:'#999',letterSpacing:'5px',marginBottom:'24px'}}>F IMPOSSIBLE.</div>
              <p style={{...body,maxWidth:'520px',margin:'0 auto 28px',textAlign:'center'}}>A 365-day public experiment. A movement for brilliant visionaries, creatives, and entrepreneurs who are done letting fear limit their life.</p>
              <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginBottom:'40px'}}>
                {['#NOFEARARMY','#BOYCOTTFEAR','#FIMPOSSIBLE'].map(tag=>(
                  <div key={tag} style={{background:'rgba(233,195,31,0.1)',border:'1px solid rgba(233,195,31,0.3)',borderRadius:'30px',padding:'7px 16px'}}>
                    <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'12px',letterSpacing:'1.5px',color:'#e9c31f'}}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{...card,borderColor:'rgba(233,195,31,0.3)',marginBottom:'16px'}}>
              <span style={lbl}>THE SILENT KILLER</span>
              <p style={{...body,margin:'0 0 14px'}}>Fear has real <strong style={{color:'#ffffff'}}>chemical, biological, neurological, physiological, psychological, and financial</strong> impacts on your life — and it is the one thing underneath all of it.</p>
              <p style={{color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:'16px',margin:0}}>Fear is the dream killer. The momentum killer. The silent killer. And we don't recognize it because it doesn't yell.</p>
            </div>
            <div style={{...card,marginBottom:'32px'}}>
              <span style={lbl}>WHAT FEAR ACTUALLY LOOKS LIKE</span>
              <p style={{...body,margin:'0 0 14px'}}>Thoughts of limitation and lack are manifestations of fear. If you are sitting on unrealized dreams, unfinished projects, untested ideas — that is fear.</p>
              <p style={{...body,margin:0}}>Fear doesn't announce itself. It <em>whispers.</em> It shows up as "I don't know how to do that" — or "I don't have the resources" — or "I'll get to it someday." It sounds like logic. It feels like caution. It is neither.</p>
            </div>
            <button style={btn} onClick={()=>setShowModal(true)}>BEGIN YOUR FEAR DETOX →</button>
            <p style={{...small,textAlign:'center',marginTop:'16px'}}>Takes 10–15 minutes. Completely free.</p>
          </div>
        )}

        {step===1&&(
          <div>
            <div style={{marginBottom:'32px'}}>
              <div style={lbl}>QUESTION 1 OF 6 · OBSERVER STATE</div>
              <h2 style={h2s}>If your life was a movie, what scenes would you want people to remember?</h2>
              <p style={body}>What do you want to be known for? What do you wish you could build or stand for? Who do you wish to become? Write it all here.</p>
            </div>
            <div style={card}>
              <span style={lbl}>YOUR LIFE'S LEGACY</span>
              <textarea style={ta} placeholder="If I could accomplish anything, I would build … I would stand for … people would remember me as someone who …" value={movieText} onChange={e=>setMovieText(e.target.value)} rows={8}/>
              {!movieResponse&&<button style={{...btn,marginTop:'16px',opacity:movieText.trim()?1:.5}} onClick={handleMovieSubmit} disabled={!movieText.trim()||movieLoading}>{movieLoading?'READING YOUR WORDS...':'OK LET\'S GO →'}</button>}
            </div>
            {movieResponse&&(
              <div style={{...goldCard,marginBottom:'24px'}}>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'3px',color:'#e9c31f',marginBottom:'12px'}}>FROM YOUR COACH, DOLL AVANT</div>
                <p style={{...body,margin:0,fontStyle:'italic'}}>{movieResponse}</p>
              </div>
            )}
            {movieResponse&&<button style={btn} onClick={()=>setStep(2)}>CONTINUE → NAME YOUR FEARS</button>}
          </div>
        )}

        {step===2&&(
          <div>
            <div style={{marginBottom:'32px'}}>
              <div style={lbl}>QUESTION 2 OF 6 · THE FEAR INVENTORY</div>
              <h2 style={h2s}>Your intuition has already been telling you something.</h2>
              <p style={body}>There's someone you want to be — we captured that in Question 1. And your intuition has been nudging you toward specific things that align with that person.</p>
              <p style={{...body,color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600}}>Get in your mind right now an idea, an inspiration, something you've been wanting to do that you wouldn't normally let yourself do.</p>
            </div>
            <div style={{...card,borderColor:'rgba(233,195,31,0.3)',marginBottom:'24px'}}>
              <span style={lbl}>THE LIST YOUR INTUITION ALREADY MADE</span>
              {fearItems.map((item,i)=>(
                <div key={i} style={{marginBottom:i<fearItems.length-1?'20px':'0'}}>
                  <div style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'8px'}}>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'13px',color:'#e9c31f',paddingTop:'14px',whiteSpace:'nowrap',fontWeight:700}}>I know I need to</div>
                    <input style={{...inp,flex:1}} placeholder="Name the thing fear is sitting on…" value={item} onChange={e=>{const a=[...fearItems];a[i]=e.target.value;setFearItems(a)}}/>
                  </div>
                  {item.trim()&&(
                    <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'13px',color:'#999',paddingTop:'14px',whiteSpace:'nowrap',fontWeight:600}}>BUT…</div>
                      <textarea style={{...ta,flex:1,minHeight:'70px',fontSize:'14px'}} placeholder="Write every 'can't', 'but', 'what if', and 'not yet' that comes up…" value={fearButs[i]} onChange={e=>{const a=[...fearButs];a[i]=e.target.value;setFearButs(a)}}/>
                    </div>
                  )}
                </div>
              ))}
              {fearItems.length<6&&<button onClick={()=>{setFearItems([...fearItems,'']);setFearButs([...fearButs,''])}} style={{...ghost,marginTop:'16px',fontSize:'13px',padding:'10px 20px',width:'auto'}}>+ ADD ANOTHER</button>}
            </div>
            {fearItems.filter(f=>f.trim()).length>0&&(
              <>
                <div style={{...card,marginBottom:'16px'}}>
                  <span style={lbl}>WHICH WHISPERS SHOWED UP IN YOUR LIST OF 'CAN'TS' AND 'BUTS'?</span>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
                    {FEAR_WHISPERS.map(w=>{
                      const sel=selectedWhispers.includes(w)
                      return <button key={w} onClick={()=>toggleWhisper(w)} style={{background:sel?'rgba(233,195,31,0.15)':'#252525',border:`1px solid ${sel?'#e9c31f':'#2a2a2a'}`,borderRadius:'30px',padding:'10px 16px',color:sel?'#e9c31f':'#cccccc',fontFamily:"'Lato',sans-serif",fontSize:'14px',cursor:'pointer'}}>{sel?'✓ ':''}{w}</button>
                    })}
                  </div>
                </div>
                <div style={{...card,marginBottom:'16px'}}>
                  <span style={lbl}>WHAT TYPE OF FEAR SHOWED UP?</span>
                  <p style={{...small,marginBottom:'14px'}}>Select the one that feels most like what you just wrote. Tap to expand, then confirm.</p>
                  {FEAR_TYPES.map(ft=>{
                    const isExpanded = expandedFearType===ft.id
                    const isSelected = selectedFearType.includes(ft.id)
                    return (
                    <div key={ft.id} style={{...card,borderColor:isSelected?'#e9c31f':'#2a2a2a',marginBottom:'10px'}}>
                      <div onClick={()=>setExpandedFearType(isExpanded?null:ft.id)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                          <span style={{fontSize:'18px'}}>{ft.emoji}</span>
                          <div>
                            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'13px',letterSpacing:'1.5px',color:isSelected?'#e9c31f':'#ffffff'}}>{ft.label}{isSelected?' ✓':''}</div>
                            <div style={{fontSize:'13px',color:'#999'}}>{ft.desc}</div>
                          </div>
                        </div>
                        <span style={{color:'#999',fontSize:'16px'}}>{isExpanded?'▲':'▼'}</span>
                      </div>
                      {isExpanded&&(
                        <div style={{marginTop:'16px',borderTop:'1px solid #2a2a2a',paddingTop:'16px'}}>
                          <div style={{...lbl,color:'#aaa'}}>WHERE IT COMES FROM</div>
                          <p style={{...small,marginBottom:'12px'}}>{ft.origin}</p>
                          <div style={{...lbl,color:'#aaa'}}>WHAT IT LOOKS LIKE</div>
                          <p style={{...small,marginBottom:'12px'}}>{ft.looks}</p>
                          <div style={{...lbl,color:'#e9c31f'}}>HOW TO REGULATE IT</div>
                          <div style={{...goldCard,marginTop:'4px'}}><p style={{...small,margin:0}}>{ft.regulate}</p></div>
                          <button style={isSelected?{...ghost,marginTop:'14px'}:{...btn,marginTop:'14px'}} onClick={()=>setSelectedFearType(prev=>prev.includes(ft.id)?prev.filter(x=>x!==ft.id):[...prev,ft.id])}>{isSelected?'SELECTED ✓ — TAP TO UNSELECT':'SELECT THIS FEAR TYPE'}</button>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
                <div style={{...card,marginBottom:'24px'}}>
                  <span style={lbl}>ADD ANYTHING ELSE</span>
                  <input style={inp} placeholder="Any other fear pattern that showed up in your writing?" value={otherFear} onChange={e=>setOtherFear(e.target.value)}/>
                </div>
              </>
            )}
            <div style={{...goldCard,marginBottom:'20px'}}>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'3px',color:'#e9c31f',display:'block',marginBottom:'10px'}}>THE TRUTH ABOUT WHAT YOU JUST NAMED</span>
              <p style={{...small,marginBottom:'8px'}}>Every one of those 'can'ts' and 'buts' has the same origin: your nervous system trying to protect you from a threat that doesn't exist. The science is clear — anticipatory fear activates the same neural circuits as actual danger. You're not weak. You're wired. And wiring can be rewired.</p>
              <p style={{color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:'15px',margin:0}}>But you just named your fear. So now let's master it.</p>
            </div>
            <button style={{...btn,opacity:canStep2?1:.5}} onClick={()=>canStep2&&setStep(3)} disabled={!canStep2}>NOW MEET YOUR FUTURE SELF →</button>
          </div>
        )}

        {step===3&&(
          <div>
            <div style={{marginBottom:'32px'}}>
              <div style={lbl}>QUESTION 3 OF 6 · THE IDENTITY SHIFT</div>
              <h2 style={h2s}>Think of the main character in your favorite movie.</h2>
              <p style={body}>The person at the end of the movie is not the same as the person at the beginning. Choose the identity of your future self — not your current one.</p>
              <p style={{...body,color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600}}>You're not <em>TRYING</em> to be that person. You are <em>CHOOSING</em> to be them. Right now.</p>
            </div>
            <div style={card}>
              <span style={lbl}>THE OLD STORY — WHO YOU'VE BEEN</span>
              <p style={{...small,marginBottom:'10px'}}>What has your old identity been telling you?</p>
              <textarea style={{...ta,minHeight:'80px'}} placeholder={'e.g. "Someone who waits until they feel ready" or "A founder who underprices herself" or "Someone who overthinks before acting"'} value={oldStory} onChange={e=>setOldStory(e.target.value)}/>
            </div>
            <div style={{textAlign:'center',padding:'8px 0',fontSize:'28px'}}>↓</div>
            <div style={{...card,borderColor:'rgba(233,195,31,0.3)'}}>
              <span style={lbl}>THE NEW CHOICE — WHO YOU ARE NOW</span>
              <p style={{...small,marginBottom:'12px'}}>Now write who you actually are. Present tense. Not "I will be" — "I AM." This is the version of you that hears the nudge and moves. That figures it out. That enjoys the road because this is who they are.</p>
              <textarea style={{...ta,minHeight:'80px',borderColor:'rgba(233,195,31,0.3)'}} placeholder={'e.g. "I am a founder who acts first and refines in motion" or "I am someone who charges what my work is actually worth" or "I am decisive"'} value={newChoice} onChange={e=>setNewChoice(e.target.value)}/>
            </div>
            {oldStory&&newChoice&&(
              <div style={{...goldCard,marginBottom:'24px'}}>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'3px',color:'#e9c31f',marginBottom:'12px'}}>FROM YOUR COACH, DOLL AVANT</div>
                <p style={{...body,margin:0}}>Every decision this week runs through one filter: What would someone who is <em style={{color:'#e9c31f'}}>{newChoice.toLowerCase().replace(/^i am /i,'')}</em> do right now? That answer is your North Star.</p>
              </div>
            )}
            <button style={{...btn,opacity:oldStory&&newChoice?1:.5}} onClick={()=>{if(oldStory&&newChoice)setStep(4)}} disabled={!oldStory||!newChoice}>LOCK IN YOUR NORTH STAR →</button>
          </div>
        )}

        {step===4&&(
          <div>
            <div style={{marginBottom:'32px'}}>
              <div style={lbl}>QUESTION 4 OF 6 · THE BIG SWING</div>
              <h2 style={h2s}>Your intuition already knows. It's been telling you the same thing. Now we're going to make a plan.</h2>
              <p style={body}>There's something your gut won't stop pointing at — the project, the move, the conversation, the launch. This is where you stop talking about it and start anchoring it.</p>
              <p style={{...body,color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600}}>Your intuition is your built-in GPS system. The thing it keeps pointing at? That's the route.</p>
            </div>
            {priorities.map((pri,i)=>(
              <div key={i} style={{...card,borderColor:i===0?'rgba(233,195,31,0.3)':'#2a2a2a',marginBottom:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                  <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'13px',letterSpacing:'2px',color:'#e9c31f'}}>PRIORITY {i+1}</span>
                  {i>0&&<button onClick={()=>{const a=priorities.filter((_,j)=>j!==i);setPriorities(a);syncSch(a)}} style={{background:'none',border:'none',color:'#999',cursor:'pointer',fontSize:'18px'}}>×</button>}
                </div>
                <span style={lbl}>THE NUDGE — WHAT IS IT?</span>
                <p style={{...small,marginBottom:'8px'}}>Your gut has been pointing at this for a while. Don't shrink it. Write the real one — the project, move, or launch you'd build if fear wasn't in the room.</p>
                <textarea style={{...ta,minHeight:'70px',marginBottom:'16px'}} placeholder="Name the specific thing you're building, launching, doing or finishing this week that leads towards your North Star." value={pri.what} onChange={e=>updatePri(i,'what',e.target.value)}/>
                <span style={lbl}>THE ONLY WAY — by Doll Avant</span>
                <p style={{...small,marginBottom:'8px'}}>This is the move most people skip. And it's the one that separates a wish from a plan.</p>
                <p style={{...small,marginBottom:'8px'}}>Constraint-based cognition: when you force your brain to operate as if failure isn't an option, it stops generating reasons you can't and starts generating the way you can. The prefrontal cortex stops deferring to the threat-detection system the moment you close the escape routes. That's when the real solutions show up.</p>
                <p style={{...small,marginBottom:'12px',color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600}}>Ask yourself: "If I had to make real progress on this in 7 days — the only way I could do that would be…"</p>
                <p style={{...small,marginBottom:'12px'}}>Name the people you'd call. The rooms you'd walk into. The things you'd say yes to. The version of you that would have to show up. No softening. No "maybe." Only the way.</p>
                <textarea style={{...ta,minHeight:'70px',marginBottom:'16px'}} placeholder="The only way I could do this in the next 7 days would be…" value={pri.onlyWay} onChange={e=>updatePri(i,'onlyWay',e.target.value)}/>
                <span style={lbl}>THE RECIPE CARD — STEPS</span>
                <p style={{...small,marginBottom:'12px'}}>Now break it down. List as many steps as you can off the top of your head — the ingredients, the order, the moves. Don't optimize. Just dump.</p>
                {(Array.isArray(pri.steps)?pri.steps:['','','']).map((stepText,s)=>(
                  <div key={s} style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'8px'}}>
                    <div style={{minWidth:'32px',height:'32px',borderRadius:'50%',background:'rgba(233,195,31,0.12)',border:'1px solid rgba(233,195,31,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Oswald',sans-serif",fontSize:'13px',color:'#e9c31f',fontWeight:700,flexShrink:0}}>{s+1}</div>
                    <input style={{...inp,flex:1}} placeholder={`Step ${s+1}`} value={stepText} onChange={e=>{const a=[...priorities];const ns=[...(Array.isArray(a[i].steps)?a[i].steps:['','',''])];ns[s]=e.target.value;a[i]={...a[i],steps:ns};setPriorities(a)}}/>
                  </div>
                ))}
                <button onClick={()=>{const a=[...priorities];const cur=Array.isArray(a[i].steps)?a[i].steps:['','',''];a[i]={...a[i],steps:[...cur,'']};setPriorities(a)}} style={{...ghost,marginTop:'4px',marginBottom:'16px',fontSize:'13px',padding:'10px 20px',width:'auto'}}>+ ADD STEP</button>
                <span style={lbl}>THE WAY I'LL KNOW I SUCCEEDED IS...</span>
                <p style={{...small,marginBottom:'8px'}}>A win needs a finish line or you'll never cross it. Name the specific, observable thing that will tell you — not feel like, tell you — that you did it. A number. A date. A thing that exists or doesn't.</p>
                <textarea style={{...ta,minHeight:'70px'}} placeholder="Be exact. Not 'I'll feel more confident' — name a deliverable." value={pri.success} onChange={e=>updatePri(i,'success',e.target.value)}/>
                <p style={{...small,marginTop:'12px',fontSize:'12px',color:'#999',fontStyle:'italic'}}>Next step: lock the day and time you'll start. Not finish — start.</p>
              </div>
            ))}
            {priorities.length<3&&(
              <button style={{...ghost,marginBottom:'24px'}} onClick={()=>{const a=[...priorities,{what:'',success:'',onlyWay:'',steps:['','','']}];setPriorities(a);syncSch(a)}}>+ ADD PRIORITY {priorities.length+1}</button>
            )}
            {!priorityResponse&&(
              <button style={{...btn,opacity:priorities.some(p=>p.what.trim())?1:.5,marginBottom:'16px'}} onClick={handlePrioSubmit} disabled={!priorities.some(p=>p.what.trim())||prioLoading}>{prioLoading?'READING YOUR PRIORITIES...':'LOCK IN PRIORITIES →'}</button>
            )}
            {priorityResponse&&(
              <>
                <div style={{...goldCard,marginBottom:'24px'}}>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'3px',color:'#e9c31f',marginBottom:'12px'}}>FROM YOUR COACH, DOLL AVANT</div>
                  <p style={{...body,margin:0,fontStyle:'italic'}}>{priorityResponse}</p>
                </div>
                <button style={btn} onClick={()=>setStep(5)}>SCHEDULE YOUR PRIORITIES →</button>
              </>
            )}
          </div>
        )}

        {step===5&&(
          <div>
            <div style={{marginBottom:'32px'}}>
              <div style={lbl}>STEP 5 OF 6 · LOCK IN THE TIME</div>
              <h2 style={h2s}>A decision without a date is just a dream.</h2>
              <p style={body}>For each priority, pick the day and time you're starting. Not finishing. Starting.</p>
            </div>
            {priorities.filter(p=>p.what.trim()).map((pri,i)=>(
              <div key={i} style={card}>
                <span style={lbl}>PRIORITY {i+1}</span>
                <p style={{color:'#ffffff',fontWeight:600,marginBottom:'16px',fontSize:'15px'}}>{pri.what}</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div>
                    <span style={lbl}>DAY</span>
                    <select style={{...inp,cursor:'pointer'}} value={schedule[i]?.day||'Monday'} onChange={e=>updateSch(i,'day',e.target.value)}>
                      {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <span style={lbl}>START TIME</span>
                    <select style={{...inp,cursor:'pointer'}} value={schedule[i]?.time||'8:00 AM'} onChange={e=>updateSch(i,'time',e.target.value)}>
                      {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div style={{...goldCard,marginBottom:'24px'}}>
              <p style={{...body,margin:0,color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600}}>WHAT HAPPENS IN YOUR BRAIN WHEN YOU COMMIT TO A TIME:</p>
              <p style={{...body,margin:'8px 0 0'}}>The prefrontal cortex creates an implementation intention — a neural pre-commitment that fires automatically when the scheduled time arrives. The commitment is already in the architecture.</p>
            </div>
            <button style={btn} onClick={()=>setStep(6)}>SEE YOUR PERSONALIZED RESULTS →</button>
          </div>
        )}

        {step===6&&(
          <div>
            <div style={{textAlign:'center',marginBottom:'32px'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>🏆</div>
              <div style={lbl}>YOU DID THE WORK</div>
              <h2 style={{...h2s,textAlign:'center'}}>{firstName?`${firstName.toUpperCase()}, WELCOME TO THE`:'WELCOME TO THE'}</h2>
              <h2 style={{...h2s,textAlign:'center',color:'#e9c31f'}}>#NOFEARARMY.</h2>
              <p style={{...body,textAlign:'center',maxWidth:'440px',margin:'0 auto 8px'}}>You've named your fears, stepped into your identity, locked in your priorities, and scheduled your first move.</p>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:'18px',letterSpacing:'4px',color:'#e9c31f',textAlign:'center'}}>F IMPOSSIBLE.</p>
            </div>
            <div style={{...card,borderColor:'rgba(233,195,31,0.3)',marginBottom:'24px'}}>
              <span style={lbl}>YOUR YEAR OF NO FEAR · MANIFESTO</span>
              <div style={{...goldCard,margin:'0 0 12px'}}>
                <p style={{...small,marginBottom:'4px',fontFamily:"'Oswald',sans-serif",letterSpacing:'2px',fontSize:'10px'}}>MY NEW IDENTITY</p>
                <p style={{color:'#ffffff',margin:0,fontStyle:'italic'}}>I am {newChoice||'who I\'m becoming'}.</p>
              </div>
              {priorities.filter(p=>p.what.trim()).map((pri,i)=>(
                <div key={i} style={{borderTop:'1px solid #2a2a2a',paddingTop:'12px',marginTop:'12px'}}>
                  <p style={{...small,marginBottom:'4px',fontFamily:"'Oswald',sans-serif",letterSpacing:'2px',fontSize:'10px'}}>PRIORITY {i+1} · {schedule[i]?.day} @ {schedule[i]?.time}</p>
                  <p style={{color:'#ffffff',fontWeight:600,margin:'0 0 4px'}}>{pri.what}</p>
                  {pri.success&&<p style={{...small,margin:'0 0 4px'}}>✓ {pri.success}</p>}
                  {pri.onlyWay&&<p style={{color:'#e9c31f',margin:0,fontSize:'13px'}}>The only way: {pri.onlyWay}</p>}
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginBottom:'32px'}}>
              <button style={{...ghost,width:'auto',padding:'12px 28px',fontSize:'13px'}} onClick={()=>{
                const url=window.location.href
                if(navigator.share)navigator.share({title:'Year of No Fear',text:'I just took the Fear Detox. Join the #NoFearArmy. F Impossible.',url})
                else{navigator.clipboard?.writeText(url).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),3000)}
              }}>{copied?'LINK COPIED ✓':'SHARE THIS WITH SOMEONE WHO NEEDS IT →'}</button>
            </div>
            <div style={{...card,borderColor:'rgba(233,195,31,0.3)'}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'4px',color:'#e9c31f',marginBottom:'12px'}}>YOUR NEXT MOVE</div>
              <h3 style={{fontFamily:"'Oswald',sans-serif",fontSize:'26px',fontWeight:700,color:'#ffffff',marginBottom:'12px',lineHeight:1.15}}>Now let AI build it with you.</h3>
              <p style={{...body,marginBottom:'16px'}}>You've named your North Star and your fear. The next step is to stop doing this manually. AI Fluency takes everything you just wrote and turns it into a fully AI-enabled brand engine and project dashboard.</p>
              <p style={{...body,color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontWeight:600,marginBottom:'24px'}}>The founder who understands AI is positioned to move at the speed of money.</p>
              <button style={btn} onClick={()=>window.open('https://stan.store/dollavant','_blank')}>GET AI FLUENCY — UPGRADE NOW →</button>
              <p style={{...small,textAlign:'center',marginTop:'12px',fontSize:'12px'}}>Part of The DollHouse 2.0 · dollavant.com</p>
            </div>
            <p style={{...small,textAlign:'center',marginTop:'32px',fontSize:'12px'}}>© 2026 Doll Avant. All Rights Reserved. · dollavant.com</p>
          </div>
        )}

      </div>

      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid rgba(233,195,31,0.3)',borderRadius:'20px',padding:'36px 28px',maxWidth:'440px',width:'100%'}}>
            <div style={{textAlign:'center',marginBottom:'28px'}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'11px',letterSpacing:'4px',color:'#e9c31f',marginBottom:'12px'}}>WELCOME TO THE MOVEMENT</div>
              <h2 style={{...h2s,fontSize:'28px',marginBottom:'16px'}}>You're joining the #NoFearArmy.</h2>
              <p style={{...body,margin:'0 0 12px',color:'#999'}}>A community of visionaries, creatives, and entrepreneurs who are done with letting fear stop you from taking BOLD ACTION. Enter your email for a free report that will immediately help you name a big fear, choose a path to conquer it, and schedule BIG BOLD action on your calendar immediately.</p>
              <p style={{...body,margin:'0 0 12px',color:'#999'}}>No more hesitation. No more fear. Join the movement.</p>
              <p style={{...body,margin:0,color:'#999'}}>You'll also get a daily fear detox prompt — one question every morning to rewire your brain and bypass your biggest fears. 365 days. Together.</p>
            </div>
            <div style={{marginBottom:'14px'}}>
              <span style={lbl}>YOUR FIRST NAME</span>
              <input style={inp} placeholder="What do you want us to call you?" value={firstName} onChange={e=>setFirstName(e.target.value)} autoFocus/>
            </div>
            <div style={{marginBottom:'24px'}}>
              <span style={lbl}>YOUR EMAIL</span>
              <input style={inp} placeholder="Where should we send your daily prompts?" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <button style={{...btn,opacity:firstName.trim()&&email.includes('@')?1:.5}} disabled={!firstName.trim()||!email.includes('@')} onClick={async()=>{await captureEmail(firstName,email);setShowModal(false);setStep(1)}}>I'M IN — LET'S GO →</button>
            <p style={{...small,textAlign:'center',marginTop:'14px',fontSize:'12px'}}>No spam. One daily prompt. Unsubscribe anytime.</p>
            <p style={{textAlign:'center',marginTop:'6px'}}><span style={{fontFamily:"'Oswald',sans-serif",fontSize:'13px',letterSpacing:'3px',color:'#e9c31f'}}>F IMPOSSIBLE.</span></p>
          </div>
        </div>
      )}

      {step>0&&(
        <button onClick={()=>setShowFieldGuide(v=>!v)} style={{position:'fixed',bottom:'24px',right:'20px',width:'52px',height:'52px',borderRadius:'50%',background:'#e9c31f',border:'none',cursor:'pointer',fontSize:'20px',zIndex:100,boxShadow:'0 4px 20px rgba(233,195,31,0.35)',display:'flex',alignItems:'center',justifyContent:'center'}}>🧠</button>
      )}

      {showFieldGuide&&(
        <div style={{position:'fixed',bottom:'84px',right:'20px',width:'min(360px, calc(100vw - 32px))',background:'#181818',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'20px',zIndex:99,maxHeight:'75vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.7)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'13px',letterSpacing:'2px',color:'#e9c31f'}}>FEAR AUDIT FIELD GUIDE</span>
            <button onClick={()=>setShowFieldGuide(false)} style={{background:'none',border:'none',color:'#999',cursor:'pointer',fontSize:'20px'}}>×</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px'}}>
            {FEAR_TYPES.map(ft=>(
              <button key={ft.id} onClick={()=>setFgType(ft.id)} style={{background:fgType===ft.id?'rgba(233,195,31,0.12)':'#252525',border:`1px solid ${fgType===ft.id?'#e9c31f':'#2a2a2a'}`,borderRadius:'8px',padding:'10px 8px',color:fgType===ft.id?'#e9c31f':'#999',cursor:'pointer',textAlign:'left'}}>
                <div style={{fontSize:'16px',marginBottom:'2px'}}>{ft.emoji}</div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'10px',letterSpacing:'1.5px'}}>{ft.label}</div>
              </button>
            ))}
          </div>
          <textarea style={{...ta,minHeight:'70px',fontSize:'13px',marginBottom:'10px'}} placeholder="What thought is fear sending right now?" value={fgThought} onChange={e=>setFgThought(e.target.value)}/>
          <input style={{...inp,fontSize:'13px',marginBottom:'12px'}} placeholder="What triggered it? (optional)" value={fgTrigger} onChange={e=>setFgTrigger(e.target.value)}/>
          <button style={{...btn,fontSize:'13px',padding:'12px'}} onClick={logFear} disabled={!fgThought.trim()}>LOG THIS FEAR</button>
          {fearLog.length>0&&(
            <div style={{marginTop:'16px',borderTop:'1px solid #2a2a2a',paddingTop:'16px'}}>
              <span style={{...lbl,marginBottom:'12px',display:'block'}}>TODAY'S LOG ({fearLog.length})</span>
              <div style={{maxHeight:'220px',overflowY:'auto'}}>
                {fearLog.map(entry=>(
                  <div key={entry.id} style={{...card,padding:'12px',marginBottom:'8px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                      <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'10px',letterSpacing:'1.5px',color:'#e9c31f'}}>{FEAR_TYPES.find(f=>f.id===entry.type)?.emoji} {FEAR_TYPES.find(f=>f.id===entry.type)?.label}</span>
                      <span style={{fontSize:'11px',color:'#999'}}>{entry.time}</span>
                    </div>
                    <p style={{fontSize:'13px',color:'#ffffff',margin:'0 0 8px'}}>{entry.thought}</p>
                    <div style={{background:'rgba(233,195,31,0.06)',borderRadius:'6px',padding:'8px',borderLeft:'2px solid #e9c31f'}}>
                      <p style={{fontSize:'12px',color:'#cccccc',margin:0}}><strong style={{color:'#e9c31f',fontFamily:"'Oswald',sans-serif",fontSize:'10px',letterSpacing:'1px'}}>REGULATE: </strong>{entry.regulation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
