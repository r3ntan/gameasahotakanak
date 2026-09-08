# 🌴 Petualangan Cerdas — Petualangan Pulau Ceria

Game edukasi 2D Bahasa Indonesia untuk anak usia 4–8 tahun (PAUD/TK/SD awal).
Tanpa build step, tanpa dependensi eksternal, tanpa backend — cukup buka di browser.

## Cara Menjalankan

**Paling mudah:** buka file `index.html` langsung di browser (Chrome/Edge/Firefox/Safari),
atau jalankan server lokal agar audio & penyimpanan bekerja optimal:

```bash
cd petualangan-cerdas
npx serve .        # atau:
python -m http.server 8080
# lalu buka http://localhost:8080
```

Bisa juga di-deploy ke hosting statis apapun (Netlify, Vercel, GitHub Pages, Lynk.id):
upload seluruh folder `petualangan-cerdas`.

## Struktur Proyek

```
petualangan-cerdas/
├── index.html      # App shell: onboarding, menu, peta, game, koleksi, prestasi, pengaturan, parent mode, modal hadiah
├── css/
│   └── style.css   # Semua gaya: tema anak ceria, responsif, animasi (awan, maskot, confetti)
├── js/
│   ├── audio.js    # AudioManager: musik latar + SFX + suara hewan, 100% WebAudio prosedural
│   ├── save.js     # SaveSystem: localStorage (nama, XP, level, bintang, koin, progres, pengaturan)
│   ├── data.js     # Data: 6 area, hewan, warna, bentuk, huruf, prestasi, lencana + aturan unlock
│   ├── mascot.js   # Maskot Kiko: mood & kalimat penyemangat Bahasa Indonesia
│   ├── games.js    # 6 mini-game (5 ronde/sesi): berhitung, huruf, warna, bentuk drag-and-drop, hewan, matematika + mode campur
│   └── app.js      # Navigasi, peta pulau, hadiah, prestasi, parent mode (gerbang dewasa), pengaturan
└── README.md
```

## Fitur

- **Onboarding anak**: sapaan Kiko → isi nama → masuk peta.
- **6 mini-game penuh** (5 ronde per sesi, kesulitan bertahap):
  1. Hutan Angka — berhitung objek (🍎⭐🐱…).
  2. Desa Huruf — huruf awal kata (A=Apel…).
  3. Taman Warna — cari warna (8 warna).
  4. Dunia Bentuk — drag-and-drop bentuk ke zona cocok (Pointer Events: mouse + sentuh).
  5. Rumah Hewan — tebak hewan dari suaranya (8 hewan, tombol putar ulang 🔊).
  6. Kota Cerdas — mode campur + matematika visual (3+2=? dengan gambar).
- **Progresi**: XP → level (100 XP/level), ⭐ bintang (1–3/sesi), 🪙 koin, rentetan buka area
  (2x main area sebelumnya → area berikut terbuka).
- **Hadiah**: modal perayaan + confetti, 8 lencana hewan, 9 prestasi
  (Jago Berhitung, Sahabat Huruf, Master Warna, Ahli Bentuk, Pecinta Hewan, …).
- **Parent Mode**: gerbang matematika dewasa + dasbor (permainan, bintang, koin, akurasi, XP, waktu main, aktivitas per area).
- **Save System**: localStorage `petualanganCerdas_save_v1` — tahan refresh browser.
- **Audio**: musik loop ceria + klik/benar/salah/bintang/perayaan/suara hewan — semua disintesis WebAudio, ada ON/OFF musik & SFX.
- **UX anak**: tombol besar (min 56px), instruksi suara-teks Bahasa Indonesia, maskot reaktif (senang/sedih/rayakan), responsif desktop + mobile, dukungan sentuh/mouse/keyboard dasar (Enter).

## Testing yang sudah dilakukan

- `node --check` untuk semua file JS (lolos sintaks).
- Verifikasi manual yang disarankan: onboarding → main tiap game (jawaban benar & salah) →
  modal hadiah → refresh (progres tetap) → unlock area → prestasi → parent mode → toggle suara → responsif mobile/desktop.

## Distribusi & Lisensi per-Perangkat (Vercel) 🔑

Model jualan yang dipakai: **game di-host di Vercel, pembeli masuk pakai kode lisensi,
1 kode = 1 perangkat**. Tidak perlu server sendiri — cukup fungsi serverless + database KV.

### Arsitektur

```
Pembeli bayar di Lynk.id → dapat kode PC-XXXX-XXXX-XXXX
  → buka link Vercel → masukkan kode (aktivasi online sekali)
  → server mengikat kode ke ID perangkat itu
  → kode yang sama di HP lain = DITOLAK ("sudah dipakai di perangkat lain")
```

File terkait: `api/activate.js`, `api/verify.js`, `api/admin.js`, `api/_store.js`,
`js/license.js` (layar kunci + ID perangkat + verifikasi tiap dibuka),
`vercel.json`, `package.json`.

### Cara deploy (sekali saja)

1. Upload folder ini ke GitHub, lalu di Vercel: **Add New → Project → Import**.
2. Di dashboard Vercel: **Storage → Create Database → KV**,
   hubungkan ke project (env `KV_REST_API_URL`/`KV_REST_API_TOKEN` terisi otomatis).
3. Di **Settings → Environment Variables**, tambah `ADMIN_SECRET` (string acak panjang, rahasiakan!).
4. Deploy. Game langsung bisa dibuka, tapi terkunci sampai ada kode.

### Operasional jualan (rutinitas)

Buat kode (ganti `ADMIN_SECRET_KAMU` dan domain Vercel kamu):

```bash
# Buat 10 kode baru (simpan baik-baik, hanya tampil sekali)
curl -X POST https://NAMAMU.vercel.app/api/admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"ADMIN_SECRET_KAMU","action":"generate","count":10}'

# Lihat daftar kode + status pakai/belum
curl -X POST https://NAMAMU.vercel.app/api/admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"ADMIN_SECRET_KAMU","action":"list"}'

# Reset (pembeli ganti HP — kode bisa dipakai di perangkat baru)
curl -X POST https://NAMAMU.vercel.app/api/admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"ADMIN_SECRET_KAMU","action":"reset","key":"PC-XXXX-XXXX-XXXX"}'

# Blokir kode bocor
curl -X POST https://NAMAMU.vercel.app/api/admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"ADMIN_SECRET_KAMU","action":"revoke","key":"PC-XXXX-XXXX-XXXX"}'
```

Alur di Lynk.id: atur harga → pembeli bayar → kirim **link game + 1 kode**
(manual via chat/email, atau otomatis jika Lynk.id mendukung pengiriman file/variasi).
Tulis di deskripsi: *"1 kode untuk 1 HP. Ganti HP? Chat penjual untuk reset gratis 1x."*

### Batas yang perlu diketahui penjual

- ID perangkat = UUID yang disimpan di browser (bukan hardware). Kalau pembeli
  hapus data browser/ganti browser, terbaca perangkat baru → butuh **reset manual**.
  Ini justru titik kontrol: sharing liar ketahuan karena tiap pindah minta reset.
- Aktivasi pertama butuh internet; setelah itu ada toleransi offline 7 hari
  (verifikasi tiap dibuka saat online).
- Proteksi ini menghentikan *sharing santai* (share kode ke grup WA),
  bukan peretas. Proteksi 100% butuh aplikasi Android native + Play Licensing.

## Ide pengembangan lanjutan

- Sulih suara Bahasa Indonesia (SpeechSynthesis) untuk setiap instruksi.
- Lebih banyak level per area + bos mini di Kota Cerdas.
- Mode 2 pemain / laporan PDF untuk guru.
- Paket aset SVG orisinal & tema musiman.
