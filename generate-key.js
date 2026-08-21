const { store } = require('./_store');

function randomKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part()}-${part()}-${part()}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Simple admin protection: caller must send the correct admin secret.
  // Set ADMIN_SECRET in Netlify site environment variables.
  const auth = event.headers['x-admin-secret'];
  if (!auth || auth !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    // ignore, use defaults
  }

  const dailyLimitSeconds = Number(body.dailyLimitSeconds) || 2 * 60 * 60; // default: 2 hours/day
  const label = (body.label || '').toString().slice(0, 80); // optional note, e.g. "for Rehan"

  const key = randomKey();
  const record = {
    key,
    label,
    createdAt: Date.now(),
    blocked: false,
    dailyLimitSeconds,
    usage: {},
  };

  const db = store();
  await db.setJSON(key, record);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, key, dailyLimitSeconds, label }),
  };
};
