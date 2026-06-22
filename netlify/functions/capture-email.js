exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { firstName, email } = JSON.parse(event.body);
    await fetch('https://script.google.com/macros/s/AKfycbzjnXehgOOEP2q9O7f_JT_J3TvcvLVGOvVVzDxjpfyIr4UXn6oFCfuKhGUVZdPcZ76nKg/exec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, email }) });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(err) { return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};