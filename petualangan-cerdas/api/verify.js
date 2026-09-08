'use strict';
/* POST /api/verify  body: { key, deviceId } -> { ok: true } jika key terikat ke device ini. */
const { getRec } = require('./_store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const key = String((body && body.key) || '').trim().toUpperCase();
  const deviceId = String((body && body.deviceId) || '').trim();

  if (!key || !deviceId) { res.status(400).json({ ok: false }); return; }
  const rec = await getRec(key);
  if (!rec || rec.status === 'revoked' || rec.device !== deviceId) {
    res.status(401).json({ ok: false });
    return;
  }
  res.status(200).json({ ok: true });
};
