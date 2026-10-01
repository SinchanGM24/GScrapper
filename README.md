# GMap Prospect Analyzer

GMap Prospect Analyzer adalah alat prospecting untuk membantu freelancer, web developer, digital agency, dan digital marketer menemukan calon client dari bisnis yang muncul di Google Maps.

Alat ini mengurangi pekerjaan membuka dan memeriksa bisnis satu per satu. Data bisnis dikumpulkan dari hasil pencarian Google Maps, kemudian dipindahkan ke aplikasi analyzer untuk dicari, dibandingkan, difilter, dan diprioritaskan berdasarkan indikator yang tersedia.

> GMap Prospect Analyzer membantu menentukan bisnis mana yang perlu diperiksa terlebih dahulu. Potential score bukan kepastian bahwa sebuah bisnis membutuhkan website atau jasa digital.

## Kegunaan Project

Dengan project ini, user dapat:

- Mengumpulkan banyak data bisnis dari satu pencarian Google Maps.
- Mengetahui bisnis mana yang memiliki atau tidak memiliki website.
- Melihat rating, jumlah review, kategori, alamat, dan nomor telepon dalam satu tabel.
- Mencari dan memfilter bisnis berdasarkan kriteria prospecting.
- Menemukan bisnis yang masuk kategori target.
- Memprioritaskan bisnis menggunakan potential score yang transparan.
- Memahami alasan sebuah bisnis mendapatkan score tertentu.
- Membuka kembali Google Maps atau website bisnis.
- Menyalin nomor telepon untuk kebutuhan riset atau outreach manual.
- Mengekspor hasil sebagai CSV atau JSON.

## Cara Kerja Secara Umum

```text
Google Maps
    |
    v
GMap Collector
    |
    v
JSON / CSV Dataset
    |
    v
GMap Analyzer
    |
    +--> Search dan Filter
    +--> Potential Analysis
    +--> Recommendation
    +--> Export
```

1. User melakukan pencarian di Google Maps, misalnya `Cafe Mataram`.
2. GMap Collector membaca bisnis yang tersedia pada halaman hasil tersebut.
3. Data dibersihkan dan dinormalisasi agar mudah dibandingkan.
4. Bisnis duplicate dihindari menggunakan identitas bisnis yang stabil.
5. User mengekspor hasil collection dalam format JSON atau CSV.
6. Dataset diimpor ke GMap Analyzer.
7. Analyzer menyimpan data secara lokal di browser dan menghitung potential untuk setiap bisnis.
8. User menggunakan tabel, filter, dashboard, dan recommendation untuk menentukan prospek yang perlu diperiksa lebih dahulu.
9. User dapat mengekspor seluruh dataset, hasil filter, atau bisnis yang dipilih.

## Komponen Project

### GMap Collector

GMap Collector adalah Chrome Extension berbasis Chrome Extension Manifest V3. Fungsinya sebagai pengambil data, bukan sebagai dashboard analitik utama.

Data inti yang dikumpulkan jika tersedia:

- Nama bisnis
- Kategori
- Alamat
- Nomor telepon
- Website
- Google Maps URL
- Rating
- Jumlah review

Data tambahan seperti jam buka, status bisnis, koordinat, atau place identifier hanya digunakan jika dapat dibaca dengan reliable dan memang tersedia.

Collector juga melakukan beberapa pekerjaan dasar:

- Membersihkan whitespace.
- Mengubah rating dan jumlah review menjadi nilai numeric.
- Menentukan status website.
- Menghindari bisnis duplicate.
- Menampilkan progress collection.
- Melaporkan hasil berhasil, duplicate, dan data yang gagal dibaca.
- Mengekspor dataset sebagai JSON atau CSV.

### GMap Analyzer

GMap Analyzer adalah Static Web App yang menjadi pusat pengelolaan dan analisis dataset.

Fungsi utamanya:

- Import dataset JSON dan CSV.
- Menyimpan data di browser user.
- Menggabungkan beberapa dataset.
- Menghapus dataset.
- Deduplicate bisnis saat import atau merge.
- Menampilkan tabel prospects.
- Search, filter, dan sorting.
- Menghitung potential score.
- Menampilkan alasan potential.
- Menampilkan ringkasan dan analytics.
- Menampilkan recommended prospects.
- Export data sebagai CSV atau JSON.

Karena bersifat local-first, data dataset tetap berada di browser user dan tidak membutuhkan backend atau database cloud untuk penggunaan dasar.

## Data yang Dilihat User

Setiap bisnis dapat memiliki informasi berikut:

- `businessId`: identitas stabil untuk deduplication.
- `name`: nama bisnis.
- `category`: kategori bisnis.
- `address`: alamat yang ditampilkan Google Maps.
- `phone`: nomor telepon bila tersedia.
- `website`: URL website bila tersedia.
- `websiteStatus`: `present`, `none`, atau `unknown`.
- `mapsUrl`: tautan ke Google Maps.
- `rating`: rating numeric dari 0 sampai 5.
- `reviewCount`: jumlah review numeric.
- `area`: area bila dapat ditentukan secara reliable.
- Field optional lain bila tersedia dengan reliable.

Status website dibedakan dengan jelas:

- `present`: website tersedia.
- `none`: terdapat indikasi bisnis tidak memiliki website yang ditampilkan.
- `unknown`: informasi website tidak berhasil diketahui.

Status `unknown` tidak dianggap sama dengan tidak memiliki website.

## Potential Score

Potential score adalah rule-based indicator untuk membantu mengurutkan prospek. Perhitungannya dapat dijelaskan dan tidak menggunakan AI.

Default indikatornya adalah:

| Indikator | Poin |
|---|---:|
| Tidak memiliki website | +40 |
| Termasuk kategori target | +20 |
| Memiliki nomor telepon | +10 |
| Rating minimal 4.0 | +10 |
| Memiliki minimal 100 review | +10 |
| Memiliki minimal 500 review | +10 |

Label potential:

- **High:** 80-100
- **Medium:** 50-79
- **Low:** 0-49

Contoh: bisnis tanpa website, masuk kategori target, memiliki nomor telepon, rating 4.6, dan 327 review memperoleh `90` dan dikategorikan sebagai **High**.

Alasan yang ditampilkan selalu berasal dari indikator yang benar-benar terpenuhi, misalnya:

- Tidak memiliki website
- Termasuk kategori target
- Memiliki nomor telepon
- Rating minimal 4.0
- Memiliki minimal 100 review

Score ini hanya menunjukkan prioritas berdasarkan data yang tersedia. User tetap perlu melakukan pemeriksaan dan penilaian sendiri sebelum menghubungi bisnis.

## Fitur Utama Analyzer

### Overview

Memberikan ringkasan dataset aktif, seperti:

- Total bisnis.
- Bisnis tanpa website.
- Bisnis dengan website.
- Bisnis dengan nomor telepon.
- Jumlah High, Medium, dan Low potential.

### Prospects

Tabel utama untuk melihat banyak bisnis sekaligus. Tabel menampilkan informasi bisnis, website status, rating, review, potential, score, dan reason.

User dapat:

- Mencari bisnis.
- Memfilter beberapa kondisi sekaligus.
- Mengurutkan berdasarkan score, rating, atau review.
- Melihat detail bisnis.
- Membuka Google Maps.
- Membuka website bila tersedia.
- Menyalin nomor telepon.
- Mengekspor bisnis yang dipilih.

Contoh filter yang berguna:

```text
Website status: No website
Potential: High
Category: Cafe
```

### Analytics

Analytics membantu user memahami dataset secara cepat melalui jumlah dan chart yang relevan, termasuk:

- Distribusi kategori.
- Perbandingan bisnis dengan dan tanpa website.
- Distribusi High, Medium, dan Low potential.
- Bisnis dengan score tertinggi.
- Perbandingan area jika data lokasi tersedia.

Analytics tidak dimaksudkan untuk membuat klaim di luar informasi yang ada di dataset.

### Recommendations

Recommendation menampilkan bisnis yang layak diperiksa lebih dahulu berdasarkan score, label potential, dan tie-breaker yang konsisten.

Setiap recommendation dapat menampilkan:

- Nama bisnis.
- Potential dan score.
- Alasan score.
- Rating dan jumlah review.
- Status website.
- Link Google Maps bila tersedia.

Recommendation membantu menentukan urutan kerja, bukan menggantikan keputusan user.

## Format Dataset

Project ini menggunakan dua format pertukaran:

- **JSON:** menyimpan metadata dataset dan daftar bisnis secara lengkap.
- **CSV:** format flat yang mudah dibuka di spreadsheet dan digunakan untuk export hasil filter.

Dataset dapat diberi metadata seperti:

- Nama dataset.
- Keyword pencarian.
- Lokasi pencarian.
- Jumlah bisnis.
- Waktu collection.

Saat dataset digabungkan, record dengan `businessId` sama hanya disimpan satu kali. Data yang lebih lengkap dapat dipertahankan selama tidak mengarang nilai.

## Privasi dan Batasan

- Data disimpan secara lokal di browser pada penggunaan Analyzer.
- Project ini tidak membutuhkan account, login, backend, atau cloud database untuk fungsi dasarnya.
- Collector hanya mengambil data yang tersedia dan dapat dibaca dari halaman Google Maps saat itu.
- Hasil collection tidak selalu lengkap karena struktur halaman dan ketersediaan data dapat berubah.
- Project ini tidak dimaksudkan untuk bypass pembatasan platform.
- User bertanggung jawab menggunakan data secara wajar dan mematuhi terms, hukum, serta aturan platform yang berlaku.
- Potential score tidak boleh digunakan sebagai bukti pasti bahwa sebuah bisnis membutuhkan layanan tertentu.

## Batasan Fitur Saat Ini

Project ini berfokus pada collection, import, analisis, prioritas, dan export data prospek. Fitur seperti CRM, pengelolaan kontak, follow-up, reminder, email automation, kolaborasi multi-user, dan AI qualification bukan bagian dari fungsi dasar project ini.

## Dokumentasi Terkait

- [PRD.md](PRD.md) - kebutuhan dan perilaku produk.
- [ARCHITECTURE.md](ARCHITECTURE.md) - struktur teknis dan pembagian modul.
- [DATA-SCHEMA.md](DATA-SCHEMA.md) - kontrak data JSON, CSV, dan dataset.
- [SCORING.md](SCORING.md) - detail rule scoring dan recommendation.
- [AGENTS.md](AGENTS.md) - aturan kerja repository.
