// Shared helper: talks to Netlify Blobs (built-in key-value store, no external DB needed)
const { getStore } = require('@netlify/blobs');

function store() {
  return getStore('license-keys');
}

// One key record looks like:
// {
//   key: "AB12-CD34-EF56",
//   createdAt: 1234567890,
//   blocked: false,
//   dailyLimitSeconds: 7200,       // 2 hours
//   usage: {
//     "2026-08-22": { secondsUsed: 3400, sessionStartedAt: 1234567890 or null }
//   }
// }

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

module.exports = { store, todayKey };
