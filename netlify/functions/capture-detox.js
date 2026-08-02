// Entrepreneur's Detox capture — same Google Sheet plumbing as the Fear Detox,
// tagged `detox` for the Beehiiv sequence (Zapier picks up the tag).
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzrvCS6Rbncw7dxGIUdYkQMjbCVBLlpfGy7_P6rKHP2ZrMAjUkExENsztfiiz-XNW8p_A/exec';

// Backstop only. A normal Apps Script POST answers in ~1.5-2s.
const SHEET_TIMEOUT_MS = 8000;

// Never throws. See capture-email.js for the full reasoning: Apps Script has
// already run doPost and written the row by the time it answers 302, so
// following the redirect is a wasted DNS+TLS round trip to a second host — the
// cause of 25-31s invocations and 504s on rows that wrote fine.
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
    try { await res.text(); } catch (e) { /* nothing useful to do */ }
    if (res.status !== 302 && !res.ok) {
      console.error(`sheet: unexpected status ${res.status} ${res.statusText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `sheet: gave up waiting (${err && err.name}) — the row has probably still been written: ${err && err.message ? err.message : err}`
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const started = Date.now();
  try {
    const data = JSON.parse(event.body);
    const payload = {
      source: 'entrepreneur-detox',
      tag: 'detox',
      created_at: new Date().toISOString(),
      ...data
    };
    await writeToSheet(payload);
    console.log(`capture-detox: done in ${Date.now() - started}ms`);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(err) { return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};
