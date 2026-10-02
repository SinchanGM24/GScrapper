# GMap Prospect Analyzer

GMap Prospect Analyzer membantu freelancer, web developer, digital agency, dan digital marketer menemukan serta memprioritaskan calon client dari bisnis yang ditemukan melalui Google Maps.

Project ini terdiri dari dua bagian:

- **GMap Collector:** Chrome Extension Manifest V3 untuk mengambil data bisnis yang terlihat pada hasil Google Maps.
- **GMap Analyzer:** Static Web App untuk mengimpor, menyimpan, mencari, memfilter, menganalisis, dan mengekspor dataset bisnis.

> Potential score adalah indikator prioritas berdasarkan data yang tersedia. Score bukan kepastian bahwa sebuah bisnis membutuhkan website atau jasa digital.

## Cara Menggunakan

Alur penggunaan utama:

```text
Google Maps
    -> GMap Collector Extension
    -> JSON / CSV
    -> GMap Analyzer
    -> Filter / Score / Recommendation
    -> Export
```

1. Instal extension ke Chrome.
2. Buka Google Maps dan lakukan pencarian bisnis.
3. Jalankan collection dari extension.
4. Export hasil sebagai JSON atau CSV.
5. Buka GMap Analyzer.
6. Import file hasil collection.
7. Gunakan tabel dan filter untuk memilih prospek.
8. Buka detail bisnis, Google Maps, website, atau salin nomor telepon.
9. Export hasil yang sudah dipilih atau difilter.

## Mengakses Analyzer Online

Jika GitHub Pages sudah aktif, buka:

```text
https://sinchanggm24.github.io/GScrapper/
```

Analyzer berjalan sebagai static web app. Tidak membutuhkan login, backend, atau database cloud. Dataset disimpan lokal di browser menggunakan IndexedDB.

Jika halaman belum tersedia, pemilik repository perlu memastikan GitHub Pages menggunakan source **GitHub Actions**, lalu menjalankan workflow **Deploy Analyzer to GitHub Pages** pada tab Actions.

## Menjalankan Analyzer Secara Lokal

### Prasyarat

- Node.js 20 atau lebih baru
- npm
- Google Chrome jika ingin menggunakan Collector

### Menjalankan

Dari root repository:

```bash
cd analyzer
npm install
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya:

```text
http://localhost:5173/GScrapper/
```

Perintah lain yang tersedia:

```bash
npm test       # unit dan integration tests
npm run build  # production build
npm run lint   # lint
npm run test:e2e
```

## Instalasi GMap Collector Extension

Extension belum dipasang melalui Chrome Web Store. Instal menggunakan mode **Load unpacked**.

1. Clone atau download repository ini.
2. Buka Google Chrome.
3. Buka:

   ```text
   chrome://extensions
   ```

4. Aktifkan **Developer mode** di kanan atas.
5. Klik **Load unpacked**.
6. Pilih folder berikut:

   ```text
   D:\Project\Gscrap\GScrapper Extension
   ```

   Jika repository berada di lokasi lain, pilih folder `GScrapper Extension` di dalam folder repository tersebut.

7. Pastikan extension **GMap Collector** muncul tanpa error.
8. Pin extension melalui ikon puzzle Chrome agar mudah dibuka.

Panduan khusus extension tersedia di [GScrapper Extension/README.md](GScrapper%20Extension/README.md). Checklist pengujian manual tersedia di [GScrapper Extension/SMOKE-TEST.md](GScrapper%20Extension/SMOKE-TEST.md).

## Mengumpulkan Data dari Google Maps

1. Buka Google Maps.
2. Cari bisnis, misalnya `Cafe Mataram`.
3. Scroll hasil pencarian agar lebih banyak result card terlihat.
4. Klik ikon **GMap Collector**.
5. Isi:
   - Nama dataset
   - Keyword
   - Lokasi
6. Klik **Collect hasil terlihat**.
7. Periksa jumlah:
   - Processed
   - Collected
   - Duplicate
   - Failed
8. Klik **Export JSON** untuk Analyzer atau **Export CSV** untuk spreadsheet.

Collector menghindari duplicate berdasarkan `businessId`. Struktur DOM Google Maps dapat berubah, sehingga collection hanya menjanjikan data yang berhasil dibaca dari halaman saat itu.

## Import Dataset ke Analyzer

1. Buka Analyzer online atau jalankan Analyzer secara lokal.
2. Klik **Import dataset**.
3. Pilih file `.json` atau `.csv` dari Collector.
4. Analyzer memvalidasi schema, menormalisasi data, dan menyimpan dataset di browser.
5. Setelah import, halaman Prospects akan menampilkan data bisnis.

Fixture untuk mencoba import tanpa melakukan collection tersedia di:

- [sample-dataset.json](GScrapper%20Extension/fixtures/sample-dataset.json)
- [sample-dataset.csv](GScrapper%20Extension/fixtures/sample-dataset.csv)

## Fitur Analyzer

### Overview

Menampilkan total bisnis, website availability, phone availability, dan distribusi High, Medium, serta Low potential.

### Prospects

Tabel utama menyediakan:

- Search nama, kategori, alamat, atau nomor telepon
- Filter potential
- Filter website status
- Filter kategori
- Sorting score, rating, review, atau nama
- Detail bisnis
- Open Google Maps
- Open website
- Copy phone
- Select dan export bisnis tertentu
- Export hasil filter

### Analytics

Menampilkan distribusi kategori dan ringkasan website availability dari dataset aktif.

### Datasets

Memungkinkan user memilih dan menghapus dataset yang tersimpan di browser.

### Settings

User dapat memasukkan kategori target, misalnya:

```text
Cafe, Restaurant, Hotel
```

Kategori target akan memengaruhi potential score dan recommendation.

## Potential Scoring

Scoring menggunakan rule-based calculation yang transparan.

| Indikator | Poin |
|---|---:|
| Tidak memiliki website | +25 |
| Memiliki nomor telepon | +25 |
| Memiliki social media tanpa nomor telepon | +25 |
| Termasuk kategori target | +15 |
| Rating minimal 4.0 | +5 |
| Minimal 100 review | +5 |
| Minimal 500 review | +5 |

Nomor telepon dan social media adalah jalur kontak alternatif. Jika nomor telepon tersedia, social media tidak menambah score agar contactability tidak dihitung dua kali.

Klasifikasi:

- **High:** 80-100
- **Medium:** 50-79
- **Low:** 0-49

## Data yang Dikumpulkan

Field utama yang dapat dikumpulkan:

- `businessId`
- `name`
- `category`
- `address`
- `phone`
- `socialMedia`
- `website`
- `websiteStatus`
- `mapsUrl`
- `rating`
- `reviewCount`

Field tambahan seperti opening hours, business status, latitude, longitude, dan place ID hanya digunakan jika tersedia secara reliable.

## Format File

- **JSON:** menyimpan metadata dataset dan daftar bisnis lengkap.
- **CSV:** format flat untuk spreadsheet dan export hasil filter.

Kontrak data resmi berada di [DATA-SCHEMA.md](DATA-SCHEMA.md).

## Local-first dan Privasi

- Dataset disimpan di browser user.
- Tidak ada account atau login.
- Tidak ada backend atau cloud database untuk MVP.
- Data tidak dikirim ke server oleh Analyzer.
- Collector hanya membaca data yang terlihat dan tersedia pada halaman Google Maps.
- User bertanggung jawab mematuhi terms, hukum, dan aturan platform yang berlaku.

## Batasan Project

Project ini tidak mencakup:

- Backend API
- Authentication
- Cloud database
- CRM
- Contact management
- Follow-up tracking
- Email automation
- Reminder
- Multi-user collaboration
- AI lead qualification

## Dokumentasi Teknis

- [PRD.md](PRD.md) - kebutuhan dan perilaku produk.
- [ARCHITECTURE.md](ARCHITECTURE.md) - struktur teknis.
- [DATA-SCHEMA.md](DATA-SCHEMA.md) - kontrak JSON, CSV, dan dataset.
- [SCORING.md](SCORING.md) - rule scoring dan recommendation.
- [AGENTS.md](AGENTS.md) - aturan kerja repository.
