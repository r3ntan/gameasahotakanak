'use strict';
/* POST /api/admin  body: { secret, action, ... }
   action: generate {count} | list | reset {key} | revoke {key} | unrevoke {key}
   secret harus sama dengan env ADMIN_SECRET. */
const { getRec, setRec, listRecs } = require('./_store');

const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // tanpa huruf mudah tertukar
function rnd(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return s;
}
function makeKey() { return 'PC-' + rnd(4) + '-' + rnd(4) + '-' + rnd(4); }

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  if (!process.env.ADMIN_SECRET || body.secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  if (body.action === 'generate') {
    const count = Math.min(Math.max(parseInt(body.count, 10) || 1, 1), 200);
    const keys = [];
    for (let i = 0; i < count; i++) {
      const key = makeKey();
      await setRec(key, { status: 'active', createdAt: new Date().toISOString(), device: '', fp: '', activatedAt: '' });
      keys.push(key);
    }
    res.status(200).json({ ok: true, keys });
    return;
  }

  if (body.action === 'list') {
    const all = await listRecs();
    res.status(200).json({
      ok: true,
      keys: all.map(({ key, rec }) => ({
        key,
        status: rec.status || 'active',
        bound: !!rec.device,
        device: rec.device ? rec.device.slice(0, 8) + '…' : '-',
        activatedAt: rec.activatedAt || '-'
      }))
    });
    return;
  }

  const key = String(body.key || '').trim().toUpperCase();
  if (!key) { res.status(400).json({ ok: false, error: 'need-key' }); return; }
  const rec = await getRec(key);
  if (!rec) { res.status(404).json({ ok: false, error: 'not-found' }); return; }

  if (body.action === 'reset') {
    rec.device = ''; rec.fp = ''; rec.activatedAt = '';
    await setRec(key, rec);
    res.status(200).json({ ok: true, message: 'Binding perangkat dihapus. Key bisa dipakai di perangkat baru.' });
    return;
  }
  if (body.action === 'revoke') { rec.status = 'revoked'; await setRec(key, rec); res.status(200).json({ ok: true }); return; }
  if (body.action === 'unrevoke') { rec.status = 'active'; await setRec(key, rec); res.status(200).json({ ok: true }); return; }

  res.status(400).json({ ok: false, error: 'unknown-action' });
};
