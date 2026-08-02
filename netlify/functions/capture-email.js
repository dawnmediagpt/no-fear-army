// Email capture → Google Sheet, plus (for podcast opt-ins only) a Transistor
// private-show subscribe so Transistor sends the feed invite automatically.
//
// GATING: this endpoint serves TWO buttons in src/App.jsx —
//   line 484  "GET THE PRIVATE FEED"   → sends podcast:'yes'
//   line 528  "I'M IN — LET'S GO"      → sends source:'join-the-movement'
// Only the first should ever reach Transistor. Subscribing the join-the-movement
// crowd to a private show they never asked for would be unsolicited.

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzrvCS6Rbncw7dxGIUdYkQMjbCVBLlpfGy7_P6rKHP2ZrMAjUkExENsztfiiz-XNW8p_A/exec';
const TRANSISTOR_SUBSCRIBERS_URL = 'https://api.transistor.fm/v1/subscribers';

// Backstop only. A normal Apps Script POST answers in ~1.5-2s; this exists so a
// hung Google call can never run the function into its own timeout.
const SHEET_TIMEOUT_MS = 8000;

// Writes the row to the Google Sheet. Never throws.
//
// redirect:'manual' is the whole point. Apps Script has ALREADY executed doPost
// and written the row by the time it answers with a 302 — the redirect target
// only carries a response body we never read. Following it costs a second
// DNS+TLS round trip to script.googleusercontent.com, and that leg is what made
// invocations run 25-31s and return 504s to visitors whose rows had written
// fine. Measured: POST-without-follow 1.5-1.8s, whole function 25-31s.
async function writeToSheet(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHEET_TIMEOUT_MS);
  try {
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'manual',
      signal: controller.signal
    });

    // Drain the tiny body so the socket is released instead of left dangling.
    try { await res.text(); } catch (e) { /* nothing useful to do */ }

    // 302 is the healthy answer here. 200 would also be fine.
    if (res.status !== 302 && !res.ok) {
      console.error(`sheet: unexpected status ${res.status} ${res.statusText}`);
      return false;
    }
    return true;
  } catch (err) {
    // The request was already on the wire; Apps Script runs independently of
    // whether we wait for its answer. Observed repeatedly: rows land even when
    // the caller gives up. So this is logged loudly but not surfaced.
    console.error(
      `sheet: gave up waiting (${err && err.name}) — the row has probably still been written: ${err && err.message ? err.message : err}`
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Never throws. Every exit path is logged. Callers must not depend on a return
// value — the user's response is decided by the sheet write, not by this.
async function subscribeToTransistor(email) {
  const apiKey = process.env.TRANSISTOR_API_KEY;
  const showId = process.env.TRANSISTOR_SHOW_ID;

  const missing = [];
  if (!apiKey) missing.push('TRANSISTOR_API_KEY');
  if (!showId) missing.push('TRANSISTOR_SHOW_ID');
  if (missing.length) {
    console.error(
      `transistor: SKIPPED for ${email} — missing env var(s): ${missing.join(', ')}`
    );
    return;
  }

  let res;
  try {
    res = await fetch(TRANSISTOR_SUBSCRIBERS_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ show_id: showId, email })
    });
  } catch (err) {
    // DNS, TLS, timeout — fetch only throws on transport failure, never on 4xx/5xx.
    console.error(
      `transistor: NETWORK ERROR for ${email} — ${err && err.message ? err.message : err}`
    );
    return;
  }

  let bodyText;
  try {
    bodyText = await res.text();
  } catch (err) {
    bodyText = `<response body unreadable: ${err && err.message ? err.message : err}>`;
  }

  if (res.ok) {
    console.log(`transistor: subscribed ${email}`);
    return;
  }

  // Idempotency: a repeat email comes back as a validation error, not a crash.
  // Treat it as success — the person is already on the feed, which is the goal.
  if (res.status === 422 && /already|taken|exist/i.test(bodyText)) {
    console.log(
      `transistor: already subscribed ${email} — status ${res.status}, treated as success`
    );
    return;
  }

  console.error(
    `transistor: FAILED for ${email} — status ${res.status} ${res.statusText} — body: ${bodyText}`
  );
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const started = Date.now();
  try {
    const data = JSON.parse(event.body);
    const { firstName, email, ...extra } = data;
    const payload = { firstName, email, ...extra };

    // 1. Sheet write FIRST. Same URL, same payload as always.
    await writeToSheet(payload);

    // 2. Transistor, only for private-feed opt-ins, and only after the sheet.
    //    Belt-and-braces try/catch: subscribeToTransistor already swallows every
    //    failure internally, but an unexpected throw here would fall into the
    //    outer catch and turn a successful sheet write into a 500. It must not.
    if (email && String(extra.podcast).toLowerCase() === 'yes') {
      try {
        await subscribeToTransistor(email);
      } catch (err) {
        console.error(
          `transistor: UNEXPECTED throw for ${email} — ${err && err.message ? err.message : err}`
        );
      }
    }

    console.log(`capture-email: done in ${Date.now() - started}ms`);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(err) { return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};
