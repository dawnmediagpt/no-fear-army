import { useState, useEffect } from "react";

const C = {
  bg: "#111111",
  surface: "#1a1a1a",
  surface2: "#252525",
  gold: "#e9c31f",
  goldDim: "#c9a427",
  white: "#ffffff",
  muted: "#999999",
  border: "#2a2a2a",
  borderGold: "rgba(233,195,31,0.3)",
};

const STEP_LABELS = ["", "YOUR MOVIE", "THE WHISPERS", "YOUR NEW IDENTITY", "LOCK IT IN", "SCHEDULE IT", "JOIN THE ARMY"];

const FEAR_WHISPERS = [
  "I don't know how to do that",
  "I don't have the money or resources",
  "I could never do that",
  "I'll get to it someday",
  "What will people think?",
  "I'm not ready yet",
  "Someone else is already doing it",
  "It probably won't work anyway",
];

const FEAR_TYPES = [
  { id: "whisper", label: "THE WHISPER", emoji: "🤫", desc: "Quiet doubt. 'Someday.' 'I'm not ready.'",
    origin: "Anticipatory fear — your brain running a threat simulation before any real danger exists.",
    looks: "It sounds like logic. 'I need more time.' 'I'll do it when I'm more prepared.' It feels like patience. It's actually avoidance dressed up as strategy.",
    regulate: "Name it out loud: 'That's a whisper. That's not data.' Then ask: 'What would I do if I already knew how?'" },
  { id: "freeze", label: "THE FREEZE", emoji: "🧊", desc: "You know what to do. You just... can't move.",
    origin: "Dorsal vagal shutdown — your nervous system's most ancient response, activating when a threat feels inescapable.",
    looks: "The open tab you don't click. The draft you don't send. The call you don't make. You know exactly what to do. Your body won't let you.",
    regulate: "Long exhale first — your nervous system responds to the exhale before the inhale. Then name ONE three-minute action. Just one." },
  { id: "spiral", label: "THE SPIRAL", emoji: "🌀", desc: "One worry becomes ten becomes catastrophe.",
    origin: "Hyperactivation of the default mode network — the brain's rumination loop running without an anchor.",
    looks: "'What if it doesn't work' becomes 'what if I lose everything' becomes 'what if I was never meant for this.' Each thought feels like evidence. None of it is.",
    regulate: "Step into Observer State. You're not the spiral — you're watching it. Write the worst case fully. Then ask: 'And then what?' Follow it to its end. The spiral loses power when it has nowhere left to go." },
  { id: "sabotage", label: "THE SABOTAGE", emoji: "🔥", desc: "You started. Then you stopped. On purpose.",
    origin: "Unconscious self-protection — the brain preventing exposure to the vulnerability that comes with actually being seen.",
    looks: "You had momentum. Then you got 'busy.' The deadline passed. The draft disappeared. You told yourself it wasn't the right time. It was never about time.",
    regulate: "Get curious, not critical. Ask: 'What am I protecting myself from?' The sabotage is not the enemy — it's a signal. Find what it's guarding and name it directly." },
];

const REGULATION = {
  whisper: "Name it out loud: 'That's a whisper. That's not data.' Then ask: 'What would I do if I already knew how?'",
  freeze: "Long exhale first — your nervous system responds to the exhale before the inhale. Then find ONE three-minute action you can take right now.",
  spiral: "Step into observer state. You are not the spiral — you're the one watching it. Write the worst case down. Then ask: 'And then what?'",
  sabotage: "Get curious, not critical. Ask yourself: 'What am I protecting myself from?' The sabotage exists for a reason. Find it. Name it. That's where the work is.",
};

async function callClaude(userPrompt, systemPrompt) {
  const resp = await fetch("/.netlify/functions/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await resp.json();
  return data.content?.[0]?.text || "";
}

const COACH_SYSTEM = `You are Doll Avant — founder of DollHouse 2.0, TEDx speaker, Harvard Business School Expert in Residence, and creator of The Year of No Fear. You coach using identity shift psychology, neuroscience, and the principle that fear announces itself as limitation, not danger. Your voice: warm, direct, specific. You write in contractions. You speak to one person at a time. You never use: "journey," "amazing," "incredible," "leverage," "paradigm," or "synergy." You ground spiritual truth in science immediately. You end sections with short declarative statements — never questions. You reference "The Only Way" as your methodology: Observer state → Expand → Lock In.`;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzjnXehgOOEP2q9O7f_JT_J3TvcvLVGOvVVzDxjpfyIr4UXn6oFCfuKhGUVZdPcZ76nKg/exec";

async function captureEmail(firstName, email) {
  try {
    await fetch("/.netlify/functions/capture-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, email }),
    });
  } catch(e) {
    console.log("capture failed", e);
  }
}

export default function NoFearArmy() {
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossaryTarget, setGlossaryTarget] = useState("observer");
  const [expandedFearType, setExpandedFearType] = useState(null);
  const [eulogy, setEulogy] = useState("");
  const [selectedWhispers, setSelectedWhispers] = useState([]);
  const [customWhisper, setCustomWhisper] = useState("");
  const [iKnowINeedTo, setIKnowINeedTo] = useState(["", "", ""]);
  const [iKnowButs, setIKnowButs] = useState(["", "", ""]);
  const [selectedWhisperType, setSelectedWhisperType] = useState(null);
  const [identityFrom, setIdentityFrom] = useState("");
  const [identityTo, setIdentityTo] = useState("");
  const [priorities, setPriorities] = useState([{ what: "", success: "", onlyWay: "" }]);
  const [schedule, setSchedule] = useState([{ day: "Monday", time: "8:00 AM" }]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [aiEulogy, setAiEulogy] = useState("");
  const [aiPriority, setAiPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [fearLog, setFearLog] = useState([]);
  const [showFearAudit, setShowFearAudit] = useState(false);
  const [fearType, setFearType] = useState("whisper");
  const [fearThought, setFearThought] = useState("");
  const [fearTrigger, setFearTrigger] = useState("");
  const [showRegulation, setShowRegulation] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  const toggleWhisper = (w) => {
    setSelectedWhispers((p) => (p.includes(w) ? p.filter((x) => x !== w) : [...p, w]));
  };

  const updatePriority = (i, field, val) => {
    const u = [...priorities];
    u[i] = { ...u[i], [field]: val };
    setPriorities(u);
  };

  const updateSchedule = (i, field, val) => {
    const u = [...schedule];
    u[i] = { ...u[i], [field]: val };
    setSchedule(u);
  };

  const syncSchedule = (pList) => {
    const s = pList.map((_, i) => schedule[i] || { day: "Monday", time: "8:00 AM" });
    setSchedule(s);
  };

  const handleGetEulogyCoach = async () => {
    if (!eulogy.trim() || loading) return;
    setLoading(true);
    try {
      const text = await callClaude(
        `Someone wrote what they want their life's movie to look like:\n\n"${eulogy}"\n\nYou are their coach using Observer State psychology. Do three things:\n1. Name the identity of the person they just described — be specific and bold.\n2. Point out the 1-2 things that carry the most emotional weight.\n3. Close with a single direct sentence that helps them feel the pull toward their top priority.\n\nMax 150 words. Warm, direct, contractions always.`,
        COACH_SYSTEM
      );
      setAiEulogy(text);
    } catch {
      setAiEulogy("What you just wrote is an identity map. The person in those words is YOU. Just your future self. Already here, just waiting on your permission.");
    }
    setLoading(false);
  };

  const handleGetPriorityCoach = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const pText = priorities
        .filter((p) => p.what.trim())
        .map((p, i) => `Priority ${i + 1}: ${p.what}\nSuccess = ${p.success}\nThe only way = ${p.onlyWay}`)
        .join("\n\n");
      const text = await callClaude(
        `Here are someone's weekly priorities in the Year of No Fear:\n\n${pText}\n\nIdentity shift:\nFrom: "${identityFrom}" To: "${identityTo}"\n\nCoach them using The Only Way framework. Max 160 words.`,
        COACH_SYSTEM
      );
      setAiPriority(text);
    } catch {
      setAiPriority("You've named what success looks like. That specificity is the work — most people never get here. Now the only thing standing between you and those outcomes is consistent execution as the person you're choosing to be.");
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  const logFear = () => {
    if (!fearThought.trim()) return;
    setFearLog([
      {
        id: Date.now(),
        type: fearType,
        thought: fearThought,
        trigger: fearTrigger,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        regulation: REGULATION[fearType],
      },
      ...fearLog,
    ]);
    setFearThought("");
    setFearTrigger("");
  };

  const label = { fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "3px", color: C.gold, textTransform: "uppercase", marginBottom: "8px", display: "block" };
  const textarea = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "16px", color: C.white, fontSize: "15px", lineHeight: "1.7", resize: "vertical", minHeight: "120px", outline: "none" };
  const input = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 16px", color: C.white, fontSize: "15px", outline: "none" };
  const btnGold = { background: C.gold, color: "#111111", fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: "15px", letterSpacing: "1px", border: "none", borderRadius: "10px", padding: "14px 28px", cursor: "pointer", width: "100%", transition: "all 0.2s" };
  const btnGhost = { background: "transparent", color: C.gold, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: "14px", letterSpacing: "1px", border: `1.5px solid ${C.gold}`, borderRadius: "10px", padding: "12px 24px", cursor: "pointer", width: "100%", transition: "all 0.2s" };
  const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "24px", marginBottom: "16px" };
  const aiBox = { background: "rgba(233,195,31,0.06)", border: `1px solid ${C.borderGold}`, borderRadius: "12px", padding: "20px", marginTop: "16px" };
  const H1 = { fontFamily: "'Oswald', sans-serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 700, color: C.white, lineHeight: 1.1, margin: "0 0 12px" };
  const H2 = { fontFamily: "'Oswald', sans-serif", fontSize: "clamp(22px,5vw,34px)", fontWeight: 700, color: C.white, lineHeight: 1.15, margin: "0 0 10px" };
  const H3 = { fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 600, color: C.white, margin: "0 0 6px" };
  const body = { fontSize: "16px", lineHeight: "1.75", color: "#cccccc", margin: "0 0 16px" };
  const muted = { fontSize: "13px", color: C.muted, lineHeight: "1.6" };

  const renderWelcome = () => (
    <div>
      <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "4px", color: C.gold, marginBottom: "24px" }}>
          DOLL AVANT × DOLLHOUSE 2.0
        </div>
        <h1 style={{ ...H1, fontSize: "clamp(40px,10vw,72px)", marginBottom: "8px" }}>YEAR OF</h1>
        <h1 style={{ ...H1, fontSize: "clamp(40px,10vw,72px)", color: C.gold, marginBottom: "4px" }}>NO FEAR.</h1>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 700, color: C.muted, letterSpacing: "5px", marginBottom: "24px" }}>
          F IMPOSSIBLE.
        </div>
        <p style={{ ...body, maxWidth: "520px", margin: "0 auto 28px", textAlign: "center" }}>
          A 365-day public experiment. A movement for brilliant visionaries, creatives, and entrepreneurs
          who are done letting fear limit their life.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          {["#NOFEARARMY", "#BOYCOTTFEAR", "#FIMPOSSIBLE"].map(tag => (
            <div key={tag} style={{ display: "inline-block", background: "rgba(233,195,31,0.1)", border: `1px solid ${C.borderGold}`, borderRadius: "30px", padding: "7px 16px" }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "1.5px", color: C.gold }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, borderColor: C.borderGold, marginBottom: "16px" }}>
        <span style={label}>THE SILENT KILLER</span>
        <p style={{ ...body, margin: "0 0 14px" }}>
          Fear has real <strong style={{ color: C.white }}>chemical, biological, neurological, physiological,
          psychological, and financial</strong> impacts on your life — and it is the one thing underneath all of it.
        </p>
        <p style={{ color: C.gold, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: "16px", margin: 0 }}>
          Fear is the dream killer. The momentum killer. The silent killer. And we don't recognize it because it doesn't yell.
        </p>
      </div>

      <div style={{ ...card, marginBottom: "32px" }}>
        <span style={label}>WHAT FEAR ACTUALLY LOOKS LIKE</span>
        <p style={{ ...body, margin: "0 0 14px" }}>
          Thoughts of limitation and lack are manifestations of fear. If you are sitting on unrealized dreams,
          unfinished projects, untested ideas — that is fear.
        </p>
        <p style={{ ...body, margin: 0 }}>
          Fear doesn't announce itself. It <em>whispers.</em> It shows up as "I don't know how to do that" —
          or "I don't have the resources" — or "I'll get to it someday." It sounds like logic. It feels like
          caution. It is neither.
        </p>
      </div>

      <button style={btnGold} onClick={() => setShowModal(true)}>
        BEGIN YOUR FEAR DETOX →
      </button>
      <p style={{ ...muted, textAlign: "center", marginTop: "16px" }}>Takes 10–15 minutes. Completely free.</p>
    </div>
  );

  const renderMovie = () => (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={label}>QUESTION 1 OF 6 · OBSERVER STATE</div>
        <h2 style={H2}>If your life was a movie, what scenes would you want people to remember?</h2>
        <p style={body}>
          What do you want to be known for? What do you wish you could build or stand for? Who do you wish
          to become? Write it all here.
        </p>
      </div>
      <div style={card}>
        <span style={label}>YOUR LIFE'S LEGACY</span>
        <textarea
          style={textarea}
          placeholder="If I could accomplish anything, I would build … I would stand for … people would remember me as someone who …"
          value={eulogy}
          onChange={(e) => setEulogy(e.target.value)}
          rows={8}
        />
        {!aiEulogy && (
          <button
            style={{ ...btnGold, marginTop: "16px", opacity: eulogy.trim() ? 1 : 0.5 }}
            onClick={handleGetEulogyCoach}
            disabled={!eulogy.trim() || loading}
          >
            {loading ? "READING YOUR WORDS..." : "OK LET'S GO →"}
          </button>
        )}
      </div>
      {aiEulogy && (
        <div style={aiBox}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "3px", color: C.gold, marginBottom: "12px" }}>
            FROM YOUR COACH, DOLL AVANT
          </div>
          <p style={{ ...body, margin: 0, fontStyle: "italic" }}>{aiEulogy}</p>
        </div>
      )}
      {aiEulogy && (
        <div style={{ marginTop: "24px" }}>
          <button style={btnGold} onClick={() => setStep(2)}>
            CONTINUE → NAME YOUR FEARS
          </button>
        </div>
      )}
    </div>
  );

  const renderWhispers = () => {
    const filledNeeds = iKnowINeedTo.filter(v => v.trim()).length;
    const canContinue = filledNeeds > 0 && (selectedWhispers.length > 0 || customWhisper.trim() || selectedWhisperType);
    return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={label}>QUESTION 2 OF 6 · THE FEAR INVENTORY</div>
        <h2 style={H2}>Your intuition has already been telling you something.</h2>
        <p style={body}>There's someone you want to be — we captured that in Question 1. And your intuition has been nudging you toward specific things that align with that person.</p>
        <p style={{ ...body, color: C.gold, fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Get in your mind right now an idea, an inspiration, something you've been wanting to do that you wouldn't normally let yourself do.
        </p>
      </div>
      <div style={{ ...card, borderColor: C.borderGold, marginBottom: "24px" }}>
        <span style={label}>THE LIST YOUR INTUITION ALREADY MADE</span>
        {iKnowINeedTo.map((val, i) => (
          <div key={i} style={{ marginBottom: i < iKnowINeedTo.length - 1 ? "20px" : "0" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", color: C.gold, paddingTop: "14px", whiteSpace: "nowrap", fontWeight: 700 }}>I know I need to</div>
              <input
                style={{ ...input, flex: 1 }}
                placeholder="Name the thing fear is sitting on…"
                value={val}
                onChange={e => { const u = [...iKnowINeedTo]; u[i] = e.target.value; setIKnowINeedTo(u); }}
              />
            </div>
            {val.trim() && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", color: C.muted, paddingTop: "14px", whiteSpace: "nowrap", fontWeight: 600 }}>BUT…</div>
                <textarea
                  style={{ ...textarea, flex: 1, minHeight: "70px", fontSize: "14px" }}
                  placeholder="Write every 'can't', 'but', 'what if', and 'not yet' that comes up…"
                  value={iKnowButs[i]}
                  onChange={e => { const u = [...iKnowButs]; u[i] = e.target.value; setIKnowButs(u); }}
                />
              </div>
            )}
          </div>
        ))}
        {iKnowINeedTo.length < 6 && (
          <button onClick={() => { setIKnowINeedTo([...iKnowINeedTo, ""]); setIKnowButs([...iKnowButs, ""]); }}
            style={{ ...btnGhost, marginTop: "16px", fontSize: "13px", padding: "10px 20px", width: "auto" }}>
            + ADD ANOTHER
          </button>
        )}
      </div>
      {filledNeeds > 0 && (
        <>
          <div style={{ ...card, marginBottom: "16px" }}>
            <span style={label}>WHICH WHISPERS SHOWED UP IN YOUR LIST OF 'CAN'TS' AND 'BUTS'?</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {FEAR_WHISPERS.map((w) => {
                const selected = selectedWhispers.includes(w);
                return (
                  <button key={w} onClick={() => toggleWhisper(w)}
                    style={{ background: selected ? "rgba(233,195,31,0.15)" : C.surface2, border: `1px solid ${selected ? C.gold : C.border}`, borderRadius: "30px", padding: "10px 16px", color: selected ? C.gold : "#cccccc", fontFamily: "'Lato', sans-serif", fontSize: "14px", cursor: "pointer" }}>
                    {selected ? "✓ " : ""}{w}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ ...card, marginBottom: "24px" }}>
            <span style={label}>ADD ANYTHING ELSE</span>
            <input style={input} placeholder="Any other fear pattern that showed up?" value={customWhisper} onChange={(e) => setCustomWhisper(e.target.value)} />
          </div>
        </>
      )}
      <button style={{ ...btnGold, opacity: canContinue ? 1 : 0.5 }} onClick={() => setStep(3)} disabled={!canContinue}>
        NOW MEET THE REAL YOU →
      </button>
    </div>
    );
  };

  const renderIdentity = () => (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={label}>QUESTION 3 OF 6 · THE IDENTITY SHIFT</div>
        <h2 style={H2}>Think of the main character in your favorite movie.</h2>
        <p style={body}>The person at the end of the movie is not the same as the person at the beginning. Choose the identity of your future self — not your current one.</p>
        <p style={{ ...body, color: C.gold, fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          You're not <em>TRYING</em> to be that person. You are <em>CHOOSING</em> to be them. Right now.
        </p>
      </div>
      <div style={card}>
        <span style={label}>THE OLD STORY — WHO YOU'VE BEEN</span>
        <textarea style={{ ...textarea, minHeight: "80px" }}
          placeholder='e.g. "Someone who waits until they feel ready"'
          value={identityFrom} onChange={(e) => setIdentityFrom(e.target.value)} />
      </div>
      <div style={{ textAlign: "center", padding: "8px 0", fontSize: "28px" }}>↓</div>
      <div style={{ ...card, borderColor: C.borderGold }}>
        <span style={label}>THE NEW CHOICE — WHO YOU ARE NOW</span>
        <p style={{ ...muted, marginBottom: "12px" }}>Write this in present tense. Not "I will be" — "I AM."</p>
        <textarea style={{ ...textarea, minHeight: "80px", borderColor: C.borderGold }}
          placeholder='e.g. "I am a founder who acts first and refines in motion"'
          value={identityTo} onChange={(e) => setIdentityTo(e.target.value)} />
      </div>
      {identityFrom && identityTo && (
        <div style={{ ...aiBox, marginBottom: "24px" }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "3px", color: C.gold, marginBottom: "12px" }}>FROM YOUR COACH, DOLL AVANT</div>
          <p style={{ ...body, margin: 0 }}>Every decision this week runs through one filter: What would someone who is <em style={{ color: C.gold }}>{identityTo.toLowerCase().replace(/^i am /i, "")}</em> do right now? That answer is your North Star.</p>
        </div>
      )}
      <button style={{ ...btnGold, opacity: identityFrom && identityTo ? 1 : 0.5 }} onClick={() => setStep(4)} disabled={!identityFrom || !identityTo}>
        LOCK IN YOUR NORTH STAR →
      </button>
    </div>
  );

  const renderPriorities = () => (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={label}>QUESTION 4 OF 6 · PRIORITY LOCK-IN</div>
        <h2 style={H2}>What are you actually doing this week?</h2>
        <p style={body}>Pull 1–3 priorities from your movie ending. Define success in a way that's undeniable — a number, a date, a deliverable. Then write The Only Way statement.</p>
      </div>
      {priorities.map((p, i) => (
        <div key={i} style={{ ...card, borderColor: i === 0 ? C.borderGold : C.border, marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "2px", color: C.gold }}>PRIORITY {i + 1}</span>
            {i > 0 && <button onClick={() => { const u = priorities.filter((_, j) => j !== i); setPriorities(u); syncSchedule(u); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "18px" }}>×</button>}
          </div>
          <span style={label}>WHAT IS IT?</span>
          <textarea style={{ ...textarea, minHeight: "70px", marginBottom: "16px" }} placeholder="Name the specific thing you're building, launching, or finishing this week." value={p.what} onChange={(e) => updatePriority(i, "what", e.target.value)} />
          <span style={label}>THE WAY I'LL KNOW I SUCCEEDED IS...</span>
          <textarea style={{ ...textarea, minHeight: "70px", marginBottom: "16px" }} placeholder="A number. A date. A thing that exists or doesn't." value={p.success} onChange={(e) => updatePriority(i, "success", e.target.value)} />
          <span style={label}>THE ONLY WAY I CAN ACHIEVE THIS IS...</span>
          <textarea style={{ ...textarea, minHeight: "70px" }} placeholder="Name the constraint that makes it inevitable." value={p.onlyWay} onChange={(e) => updatePriority(i, "onlyWay", e.target.value)} />
        </div>
      ))}
      {priorities.length < 3 && (
        <button style={{ ...btnGhost, marginBottom: "24px" }} onClick={() => { const u = [...priorities, { what: "", success: "", onlyWay: "" }]; setPriorities(u); syncSchedule(u); }}>
          + ADD PRIORITY {priorities.length + 1}
        </button>
      )}
      {!aiPriority && (
        <button style={{ ...btnGold, opacity: priorities.some(p => p.what.trim()) ? 1 : 0.5, marginBottom: "16px" }} onClick={handleGetPriorityCoach} disabled={!priorities.some(p => p.what.trim()) || loading}>
          {loading ? "READING YOUR PRIORITIES..." : "SHOW ME MY NORTH STAR PATH →"}
        </button>
      )}
      {aiPriority && (
        <>
          <div style={{ ...aiBox, marginBottom: "24px" }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "3px", color: C.gold, marginBottom: "12px" }}>FROM YOUR COACH, DOLL AVANT</div>
            <p style={{ ...body, margin: 0, fontStyle: "italic" }}>{aiPriority}</p>
          </div>
          <button style={btnGold} onClick={() => setStep(5)}>CONTINUE → SCHEDULE IT</button>
        </>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={label}>STEP 5 OF 6 · LOCK IN THE TIME</div>
        <h2 style={H2}>A decision without a date is just a dream.</h2>
        <p style={body}>For each priority, pick the day and time you're starting. Not finishing. Starting.</p>
      </div>
      {priorities.filter(p => p.what.trim()).map((p, i) => (
        <div key={i} style={card}>
          <span style={label}>PRIORITY {i + 1}</span>
          <p style={{ color: C.white, fontWeight: 600, marginBottom: "16px", fontSize: "15px" }}>{p.what}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <span style={label}>DAY</span>
              <select style={{ ...input, cursor: "pointer" }} value={schedule[i]?.day || "Monday"} onChange={(e) => updateSchedule(i, "day", e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>START TIME</span>
              <select style={{ ...input, cursor: "pointer" }} value={schedule[i]?.time || "8:00 AM"} onChange={(e) => updateSchedule(i, "time", e.target.value)}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      <div style={{ ...aiBox, marginBottom: "24px" }}>
        <p style={{ ...body, margin: 0, color: C.gold, fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>WHAT HAPPENS IN YOUR BRAIN WHEN YOU COMMIT TO A TIME:</p>
        <p style={{ ...body, margin: "8px 0 0" }}>The prefrontal cortex creates an implementation intention — a neural pre-commitment that fires automatically when the scheduled time arrives. The commitment is already in the architecture.</p>
      </div>
      <button style={btnGold} onClick={() => setStep(6)}>CONTINUE → JOIN THE #NOFEARARMY</button>
    </div>
  );

  const renderComplete = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>
        <div style={label}>YOU DID THE WORK</div>
        <h2 style={{ ...H2, textAlign: "center" }}>{firstName ? `${firstName.toUpperCase()}, WELCOME TO THE` : "WELCOME TO THE"}</h2>
        <h2 style={{ ...H2, textAlign: "center", color: C.gold }}>#NOFEARARMY.</h2>
        <p style={{ ...body, textAlign: "center", maxWidth: "440px", margin: "0 auto 8px" }}>
          You've named your fears, stepped into your identity, locked in your priorities, and scheduled your first move.
        </p>
        <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", letterSpacing: "4px", color: C.gold, textAlign: "center" }}>F IMPOSSIBLE.</p>
      </div>

      <div style={{ ...card, borderColor: C.borderGold, marginBottom: "24px" }}>
        <span style={label}>YOUR YEAR OF NO FEAR · MANIFESTO</span>
        <div style={{ ...aiBox, margin: "0 0 12px" }}>
          <p style={{ ...muted, marginBottom: "4px", fontFamily: "'Oswald', sans-serif", letterSpacing: "2px", fontSize: "10px" }}>MY NEW IDENTITY</p>
          <p style={{ color: C.white, margin: 0, fontStyle: "italic" }}>
            I am no longer {identityFrom || "who I was"}.<br />I am {identityTo || "who I'm becoming"}.
          </p>
        </div>
        {priorities.filter(p => p.what.trim()).map((p, i) => (
          <div key={i} style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px", marginTop: "12px" }}>
            <p style={{ ...muted, marginBottom: "4px", fontFamily: "'Oswald', sans-serif", letterSpacing: "2px", fontSize: "10px" }}>PRIORITY {i + 1} · {schedule[i]?.day} @ {schedule[i]?.time}</p>
            <p style={{ color: C.white, fontWeight: 600, margin: "0 0 4px" }}>{p.what}</p>
            {p.success && <p style={{ ...muted, margin: "0 0 4px" }}>✓ {p.success}</p>}
            {p.onlyWay && <p style={{ color: C.gold, margin: 0, fontSize: "13px" }}>The only way: {p.onlyWay}</p>}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <button style={{ ...btnGhost, width: "auto", padding: "12px 28px", fontSize: "13px" }}
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: "Year of No Fear", text: "I just took the Fear Detox. Join the #NoFearArmy. F Impossible.", url });
            } else {
              navigator.clipboard?.writeText(url).catch(() => {});
              setShareCopied(true);
              setTimeout(() => setShareCopied(false), 3000);
            }
          }}>
          {shareCopied ? "LINK COPIED ✓" : "SHARE THIS WITH SOMEONE WHO NEEDS IT →"}
        </button>
      </div>

      <div style={{ ...card, borderColor: C.borderGold }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "4px", color: C.gold, marginBottom: "12px" }}>YOUR NEXT MOVE</div>
        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "26px", fontWeight: 700, color: C.white, marginBottom: "12px", lineHeight: 1.15 }}>Now let AI build it with you.</h3>
        <p style={{ ...body, marginBottom: "16px" }}>You've named your North Star and your fear. The next step is to stop doing this manually. AI Fluency takes everything you just wrote and turns it into a fully AI-enabled brand engine and project dashboard.</p>
        <p style={{ ...body, color: C.gold, fontFamily: "'Oswald', sans-serif", fontWeight: 600, marginBottom: "24px" }}>The founder who understands AI doesn't just save time — they build an entirely different kind of business.</p>
        <button style={btnGold} onClick={() => window.open("https://stan.store/dollavant", "_blank")}>GET AI FLUENCY — UPGRADE NOW →</button>
        <p style={{ ...muted, textAlign: "center", marginTop: "12px", fontSize: "12px" }}>Part of The DollHouse 2.0 · dollavant.com</p>
      </div>

      <p style={{ ...muted, textAlign: "center", marginTop: "32px", fontSize: "12px" }}>© 2026 Doll Avant. All Rights Reserved. · dollavant.com</p>
    </div>
  );

  const renderFearAudit = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "2px", color: C.gold }}>FEAR AUDIT FIELD GUIDE</span>
        <button onClick={() => setShowFearAudit(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "20px" }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {FEAR_TYPES.map((ft) => (
          <button key={ft.id} onClick={() => setFearType(ft.id)}
            style={{ background: fearType === ft.id ? "rgba(233,195,31,0.12)" : C.surface2, border: `1px solid ${fearType === ft.id ? C.gold : C.border}`, borderRadius: "8px", padding: "10px 8px", color: fearType === ft.id ? C.gold : C.muted, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>{ft.emoji}</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "1.5px" }}>{ft.label}</div>
          </button>
        ))}
      </div>
      <textarea style={{ ...textarea, minHeight: "70px", fontSize: "13px", marginBottom: "10px" }} placeholder="What thought is fear sending right now?" value={fearThought} onChange={e => setFearThought(e.target.value)} />
      <input style={{ ...input, fontSize: "13px", marginBottom: "12px" }} placeholder="What triggered it? (optional)" value={fearTrigger} onChange={e => setFearTrigger(e.target.value)} />
      <button style={{ ...btnGold, fontSize: "13px", padding: "12px" }} onClick={logFear} disabled={!fearThought.trim()}>LOG THIS FEAR</button>
      {fearLog.length > 0 && (
        <div style={{ marginTop: "16px", borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
          <span style={{ ...label, marginBottom: "12px" }}>TODAY'S LOG ({fearLog.length})</span>
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {fearLog.map((entry) => (
              <div key={entry.id} style={{ ...card, padding: "12px", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "1.5px", color: C.gold }}>{FEAR_TYPES.find(f => f.id === entry.type)?.emoji} {FEAR_TYPES.find(f => f.id === entry.type)?.label}</span>
                  <span style={{ fontSize: "11px", color: C.muted }}>{entry.time}</span>
                </div>
                <p style={{ fontSize: "13px", color: C.white, margin: "0 0 8px" }}>{entry.thought}</p>
                <div style={{ background: "rgba(233,195,31,0.06)", borderRadius: "6px", padding: "8px", borderLeft: `2px solid ${C.gold}` }}>
                  <p style={{ fontSize: "12px", color: "#cccccc", margin: 0 }}><strong style={{ color: C.gold, fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "1px" }}>REGULATE: </strong>{entry.regulation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Lato', sans-serif", color: C.white }}>
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
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
              {[1,2,3,4,5,6].map(s => (
                <div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", background: step >= s ? C.gold : C.border, transition: "background 0.3s" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ background: "none", border: "none", color: C.muted, fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", padding: "0" }}>← BACK</button>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "2.5px", color: C.gold }}>{STEP_LABELS[step]}</span>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "1px", color: C.muted }}>{step} / 6</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px 140px" }}>
        {step === 0 && renderWelcome()}
        {step === 1 && renderMovie()}
        {step === 2 && renderWhispers()}
        {step === 3 && renderIdentity()}
        {step === 4 && renderPriorities()}
        {step === 5 && renderSchedule()}
        {step === 6 && renderComplete()}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderGold}`, borderRadius: "20px", padding: "36px 28px", maxWidth: "440px", width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "4px", color: C.gold, marginBottom: "12px" }}>WELCOME TO THE MOVEMENT</div>
              <h2 style={{ ...H2, fontSize: "28px", marginBottom: "8px" }}>You're joining the #NoFearArmy.</h2>
              <p style={{ ...body, margin: "0 0 12px", color: C.muted }}>This assessment is your first act of resistance. When you finish, you'll have a North Star, a named fear, a chosen identity, and your first Big Swing on the calendar.</p>
              <p style={{ ...body, margin: 0, color: C.muted }}>You'll also get a daily fear detox prompt — one question every morning to rewire your brain and bypass your biggest fears. 365 days. In public. Together.</p>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <span style={label}>YOUR FIRST NAME</span>
              <input style={input} placeholder="What do you want us to call you?" value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <span style={label}>YOUR EMAIL</span>
              <input style={input} placeholder="Where should we send your daily prompts?" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button
              style={{ ...btnGold, opacity: firstName.trim() && email.includes("@") ? 1 : 0.5 }}
              disabled={!firstName.trim() || !email.includes("@")}
              onClick={async () => {
                await captureEmail(firstName, email);
                setShowModal(false);
                setStep(1);
              }}
            >
              I'M IN — LET'S GO →
            </button>
            <p style={{ ...muted, textAlign: "center", marginTop: "14px", fontSize: "12px" }}>No spam. One daily prompt. Unsubscribe anytime.</p>
            <p style={{ textAlign: "center", marginTop: "6px" }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "3px", color: C.gold }}>F IMPOSSIBLE.</span>
            </p>
          </div>
        </div>
      )}

      {step > 0 && (
        <button onClick={() => setShowFearAudit(!showFearAudit)}
          style={{ position: "fixed", bottom: "24px", right: "20px", width: "52px", height: "52px", borderRadius: "50%", background: C.gold, border: "none", cursor: "pointer", fontSize: "20px", zIndex: 100, boxShadow: "0 4px 20px rgba(233,195,31,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          🧠
        </button>
      )}

      {showFearAudit && (
        <div style={{ position: "fixed", bottom: "84px", right: "20px", width: "min(360px, calc(100vw - 32px))", background: "#181818", border: `1px solid ${C.border}`, borderRadius: "16px", padding: "20px", zIndex: 99, maxHeight: "75vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
          {renderFearAudit()}
        </div>
      )}
    </div>
  );
}
