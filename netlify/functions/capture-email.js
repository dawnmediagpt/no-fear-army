exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const data = JSON.parse(event.body);
    const { firstName, email, ...extra } = data;
    const payload = { firstName, email, ...extra };
    await fetch('https://script.google.com/macros/s/AKfycbzjnXehgOOEP2q9O7f_JT_J3TvcvLVGOvVVzDxjpfyIr4UXn6oFCfuKhGUVZdPcZ76nKg/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(err) { return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};
