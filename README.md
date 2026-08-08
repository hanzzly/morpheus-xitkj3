# Website Kelas Cyber Security — SMK Telkom Malang

Website kelas dengan galeri kegiatan, profil anggota, jadwal piket, dan panel
admin untuk mengelola semuanya.

**Stack:** Next.js 16 (App Router) · Prisma + PostgreSQL · Cloudinary (upload
gambar) · Tailwind CSS 4

---

## 1. Persiapan sebelum mulai

Kamu butuh 3 akun gratis:

1. **Vercel** — untuk hosting (sudah kamu punya)
2. **Database Postgres** — lewat integrasi Vercel Postgres/Neon (gratis untuk skala kelas)
3. **Cloudinary** — untuk simpan foto/gambar upload (gratis, daftar di https://cloudinary.com)

---

## 2. Setup di komputer lokal

```bash
# 1. Masuk ke folder project
cd kelas-cyber-app

# 2. Install semua dependency
npm install

# 3. Salin file environment variable
cp .env.example .env
```

Buka file `.env` yang baru dibuat, lalu isi setiap nilainya (lihat bagian 3 & 4
di bawah untuk tahu cara mendapatkan nilai-nilai itu).

---

## 3. Setup Database (Vercel Postgres / Neon)

1. Buka dashboard Vercel, pilih project ini (atau buat project baru dengan
   import repo ini dulu, lihat bagian 6).
2. Masuk ke tab **Storage** lalu **Create Database**, pilih **Postgres**
   (biasanya didukung oleh Neon di belakang layar).
3. Setelah database dibuat, Vercel akan otomatis menyediakan environment
   variable `DATABASE_URL` dan `DIRECT_URL`, kamu tinggal **Connect** ke
   project ini, environment variable akan otomatis muncul di project settings.
4. Untuk kerja di lokal, buka tab `.env.local` yang disediakan Vercel di
   halaman database tersebut, salin isinya ke file `.env` di komputermu.

Setelah `DATABASE_URL` terisi, jalankan ini untuk membuat semua tabel di
database:

```bash
npm run db:push
```

Kalau berhasil, akan muncul pesan bahwa skema berhasil disinkronkan.

---

## 4. Setup Cloudinary (untuk upload gambar)

1. Daftar gratis di https://cloudinary.com
2. Setelah login, buka **Dashboard**, di sana ada 3 informasi:
   - `Cloud Name`
   - `API Key`
   - `API Secret` (klik "reveal" untuk melihatnya)
3. Salin ketiganya ke file `.env`:

```
CLOUDINARY_CLOUD_NAME="cloud_name_kamu"
CLOUDINARY_API_KEY="api_key_kamu"
CLOUDINARY_API_SECRET="api_secret_kamu"
```

---

## 5. Buat Session Secret & Akun Admin Pertama

**Session secret** adalah string acak untuk mengamankan sesi login. Generate dengan:

```bash
# Di Mac/Linux/WSL:
openssl rand -base64 32
```

Kalau tidak ada `openssl`, bisa juga pakai situs generator password acak
(minimal 32 karakter), lalu tempel hasilnya ke `.env`:

```
SESSION_SECRET="hasil_random_tadi"
```

**Membuat akun admin pertama** (username + password untuk login ke panel
admin). Setelah `DATABASE_URL` terisi dan `npm run db:push` berhasil,
jalankan:

```bash
npm run create-admin -- namauser passwordkamu
```

Contoh:

```bash
npm run create-admin -- ketuakelas RahasiaBanget123
```

Simpan baik-baik username & password ini, itu yang dipakai untuk masuk ke
`/admin/login`. Kamu bisa jalankan perintah ini lagi kapan saja untuk
mengganti password admin yang sama, atau membuat admin lain dengan username
berbeda.

---

## 6. Coba jalankan di lokal

```bash
npm run dev
```

Buka `http://localhost:3000`, website publik akan tampil. Buka
`http://localhost:3000/admin/login` untuk masuk ke panel admin dengan
username/password yang tadi dibuat.

---

## 7. Deploy ke Vercel

### Cara termudah: lewat GitHub

1. Push folder project ini ke repository GitHub baru.
2. Buka https://vercel.com/new, import repo tersebut.
3. Di halaman konfigurasi sebelum deploy, buka **Environment Variables**, isi
   semua variable yang sama seperti di `.env` lokalmu:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `SESSION_SECRET`
4. Klik **Deploy**.
5. Setelah selesai, Vercel akan otomatis menjalankan `npm install`,
   `postinstall` (generate Prisma Client), lalu `next build`.

### Setelah deploy pertama kali

Jalankan sekali dari komputer lokal (dengan `.env` yang menunjuk ke database
produksi) untuk membuat tabel dan admin pertama di database production:

```bash
npm run db:push
npm run create-admin -- namauser passwordkamu
```

Setelah itu, website sudah bisa diakses lewat domain `*.vercel.app` yang
diberikan Vercel, dan panel admin bisa langsung dipakai login.

---

## Struktur halaman

**Publik:**
- `/` — Beranda
- `/galeri` — Galeri kegiatan
- `/anggota` — Daftar anggota kelas
- `/jadwal-piket` — Jadwal piket per hari

**Admin (butuh login di `/admin/login`):**
- `/admin/dashboard` — Ringkasan
- `/admin/anggota` — Tambah/edit/hapus anggota
- `/admin/galeri` — Upload/hapus foto galeri
- `/admin/jadwal-piket` — Atur jadwal piket

---

## Catatan keamanan

- Password admin disimpan ter-enkripsi (hash bcrypt), tidak pernah dalam
  bentuk teks biasa.
- Jangan bagikan isi file `.env` ke siapa pun atau commit ke Git, file ini
  sudah otomatis diabaikan oleh `.gitignore` bawaan Next.js.
- Kalau butuh admin dengan username berbeda untuk anggota lain, jalankan lagi
  `npm run create-admin -- username_baru password_baru`.
