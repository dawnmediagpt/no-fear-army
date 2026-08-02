// Email capture → Google Sheet, plus (for podcast opt-ins only) a Transistor
// private-show subscribe so Transistor sends the feed invite automatically.
//
// GATING: this endpoint serves TWO buttons in src/App.jsx —
//   line 484  "GET THE PRIVATE FEED"   → sends podcast:'yes'
//   line 528  "I'M IN — LET'S GO"      → sends no podcast flag
// Only the first should ever reach Transistor. Subscribing the join-the-movement
// crowd to a private show they never asked for would be unsolicited.

const TRANSISTOR_SUBSCRIBERS_URL = 'https://api.transistor.fm/v1/subscribers';

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
  try {
    const data = JSON.parse(event.body);
    const { firstName, email, ...extra } = data;
    const payload = { firstName, email, ...extra };

    // 1. Sheet write FIRST. Unchanged — same URL, same shape, same semantics.
    await fetch('https://script.google.com/macros/s/AKfycbzrvCS6Rbncw7dxGIUdYkQMjbCVBLlpfGy7_P6rKHP2ZrMAjUkExENsztfiiz-XNW8p_A/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // 2. Transistor, only for private-feed opt-ins, and only after the sheet is done.
    //    Belt-and-braces try/catch: subscribeToTransistor already swallows everything,
    //    but an unexpected throw here would fall into the outer catch and turn a
    //    successful sheet write into a 500 for the user. It must not.
    if (email && String(extra.podcast).toLowerCase() === 'yes') {
      try {
        await subscribeToTransistor(email);
      } catch (err) {
        console.error(
          `transistor: UNEXPECTED throw for ${email} — ${err && err.message ? err.message : err}`
        );
      }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(err) { return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};
