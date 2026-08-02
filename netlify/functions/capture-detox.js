// Entrepreneur's Detox capture — same Google Sheet plumbing as the Fear Detox,
// tagged `detox` for the Beehiiv sequence (Zapier picks up the tag).
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzrvCS6Rbncw7dxGIUdYkQMjbCVBLlpfGy7_P6rKHP2ZrMAjUkExENsztfiiz-XNW8p_A/exec';

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
