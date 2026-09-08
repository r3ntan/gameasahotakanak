'use strict';
/* Penyimpanan lisensi: Vercel KV (produksi) atau file lokal (dev via `vercel dev`). */
const fs = require('fs');
const os = require('os');
const path = require('path');

const DEV_FILE = path.join(os.tmpdir(), 'pc_keys_dev.json');

function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}
function kv() {
  // require malas: tidak butuh package terinstal saat KV tidak dipakai
  return require('@vercel/kv').kv;
}
function k(key) { return 'lic:' + key; }

function readDev() {
  try { return JSON.parse(fs.readFileSync(DEV_FILE, 'utf8')); } catch (e) { return {}; }
}
function writeDev(all) {
  try { fs.writeFileSync(DEV_FILE, JSON.stringify(all)); } catch (e) {}
}

async function getRec(key) {
  if (kvAvailable()) {
    const r = await kv().hgetall(k(key));
    return r && Object.keys(r).length ? r : null;
  }
  return readDev()[key] || null;
}

async function setRec(key, rec) {
  if (kvAvailable()) { await kv().hset(k(key), rec); return; }
  const all = readDev(); all[key] = rec; writeDev(all);
}

async function listRecs() {
  if (kvAvailable()) {
    const keys = await kv().keys('lic:*');
    const out = [];
    for (const full of keys) {
      const rec = await kv().hgetall(full);
      if (rec) out.push({ key: full.slice(4), rec });
    }
    return out;
  }
  return Object.entries(readDev()).map(([key, rec]) => ({ key, rec }));
}

module.exports = { kvAvailable, getRec, setRec, listRecs };
