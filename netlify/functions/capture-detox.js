// Entrepreneur's Detox capture — same Google Sheet plumbing as the Fear Detox,
// tagged `detox` for the Beehiiv sequence (Zapier picks up the tag).
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzjnXehgOOEP2q9O7f_JT_J3TvcvLVGOvVVzDxjpfyIr4UXn6oFCfuKhGUVZdPcZ76nKg/exec';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const data = JSON.parse(event.body);
    const payload = {
      source: 'entrepreneur-detox',
      tag: 'detox',
      created_at: new Date().toISOString(),
      ...data
    };
    await fetch(SHEET_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(err) { return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};
