'use strict';
/* POST /api/activate  body: { key, deviceId, fp }
   Mengikat key ke perangkat. 1 key = 1 deviceId. */
const { getRec, setRec } = require('./_store');

function normKey(s) {
  return String(s || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const key = normKey(body && body.key);
  const deviceId = String((body && body.deviceId) || '').trim().slice(0, 64);
  const fp = String((body && body.fp) || '').slice(0, 128);

  if (!key || !deviceId) { res.status(400).json({ ok: false, error: 'bad-request' }); return; }

  const rec = await getRec(key);
  if (!rec) { res.status(404).json({ ok: false, error: 'not-found', message: 'Key tidak ditemukan. Periksa kembali.' }); return; }
  if (rec.status === 'revoked') { res.status(403).json({ ok: false, error: 'revoked', message: 'Key ini sudah dinonaktifkan.' }); return; }

  if (!rec.device) {
    rec.device = deviceId; rec.fp = fp;
    rec.activatedAt = new Date().toISOString();
    await setRec(key, rec);
    res.status(200).json({ ok: true, newly: true });
    return;
  }
  if (rec.device === deviceId) {
    res.status(200).json({ ok: true, newly: false });
    return;
  }
  res.status(403).json({
    ok: false, error: 'used',
    message: 'Key sudah dipakai di perangkat lain. Hubungi penjual untuk reset pindah perangkat.'
  });
};
