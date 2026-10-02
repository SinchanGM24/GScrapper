# PRD - GMap Prospect Analyzer

- **Status:** MVP specification
- **Tanggal:** 2026-10-02
- **Prinsip:** Collect less complexity, analyze better, help the user find promising prospects faster.

## 1. Product Overview

GMap Prospect Analyzer membantu freelancer, web developer, digital agency, dan digital marketer menemukan serta memprioritaskan calon client dari bisnis yang ditemukan melalui Google Maps.

Produk terdiri dari:

1. **GMap Collector:** Chrome Extension Manifest V3 untuk mengumpulkan data bisnis dari hasil Google Maps.
2. **GMap Analyzer:** Static Web App untuk import, penyimpanan lokal, pencarian, filtering, visualisasi, scoring, recommendation, dan export.

Website adalah pusat analisis. Extension adalah data collector, bukan dashboard utama.

## 2. Problem Statement

Prospecting manual mengharuskan user membuka bisnis satu per satu, memeriksa website, rating, review, telepon, dan relevansi kategori. Proses ini lambat, tidak konsisten, dan menyulitkan perbandingan banyak prospek.

## 3. Goals

- Mengumpulkan data bisnis Google Maps secara praktis.
- Menghindari duplicate saat collection dan import.
- Memungkinkan user menemukan bisnis tanpa website.
- Menyediakan filter dan sorting yang mempercepat prospecting.
- Menghasilkan potential score yang transparan dan dapat dijelaskan.
- Menyajikan recommendation berdasarkan indikator dataset.
- Memungkinkan export data yang dipilih atau difilter.
- Menjaga data tetap di browser user pada MVP.

## 4. Non-Goals

MVP tidak mencakup backend, authentication, cloud database, CRM, contact management, follow-up, reminder, email automation, payment, multi-user collaboration, atau AI lead qualification.

Score tidak boleh dipresentasikan sebagai kepastian bahwa bisnis membutuhkan website atau jasa digital.

## 5. Target Users

- Freelancer web developer
- Front-end atau full-stack developer yang mencari client
- Digital agency dan web development agency
- Digital marketer
- Sales atau prospecting untuk jasa digital

## 6. User Journey

1. User membuka Google Maps dan melakukan pencarian seperti `Cafe Mataram`.
2. User menjalankan GMap Collector.
3. Extension membaca hasil yang tersedia, menormalisasi record, mencegah duplicate, dan menampilkan progress.
4. User mengekspor dataset JSON atau CSV.
5. User mengimpor dataset ke GMap Analyzer.
6. Analyzer menyimpan dataset di browser, menghitung score, dan menampilkan overview.
7. User mencari, memfilter, dan mengurutkan prospects.
8. User membuka detail, Google Maps, website, atau menyalin nomor telepon.
9. User memeriksa recommendation dan alasan potential.
10. User mengekspor semua data, data terfilter, atau data terpilih.

## 7. Functional Requirements

### 7.1 Collector

| ID | Requirement | Priority |
|---|---|---|
| COL-01 | Menggunakan Chrome Extension Manifest V3. | Must |
| COL-02 | Mengambil business name, category, address, phone, public social media profile, website, Google Maps URL, rating, dan review count bila tersedia. | Must |
| COL-03 | Menormalisasi whitespace, website status, rating numeric, dan review count numeric. | Must |
| COL-04 | Mencegah duplicate berdasarkan `businessId`. | Must |
| COL-05 | Menampilkan progress, jumlah berhasil, jumlah duplicate, dan error/partial result. | Must |
| COL-06 | Export hasil collection sebagai JSON dan CSV. | Must |
| COL-07 | Mengambil opening hours, business status, latitude/longitude, atau place identifier hanya bila reliable. | Should |

### 7.2 Dataset Management

| ID | Requirement | Priority |
|---|---|---|
| DAT-01 | Import JSON dan CSV sesuai `DATA-SCHEMA.md`. | Must |
| DAT-02 | Menyimpan dataset di browser tanpa backend. | Must |
| DAT-03 | Menampilkan nama dataset, keyword, location, jumlah bisnis, dan collection date. | Should |
| DAT-04 | Merge beberapa dataset dan deduplicate berdasarkan `businessId`. | Should |
| DAT-05 | Menghapus dataset. | Must |
| DAT-06 | Export data lengkap atau data hasil filter sebagai CSV; JSON opsional. | Must |

### 7.3 Prospect Table

| ID | Requirement | Priority |
|---|---|---|
| PRO-01 | Menampilkan business, category, address, phone, social media, website, website status, rating, reviews, potential, score, dan reason. | Must |
| PRO-02 | Mendukung search, filter, sorting, dan pagination atau virtualized list. | Must |
| PRO-03 | Mendukung view details, open Google Maps, open website, copy phone, dan export selected. | Should |
| PRO-04 | Mendukung kombinasi filter, misalnya `No Website + High + Cafe`. | Must |

### 7.4 Analysis and Recommendation

| ID | Requirement | Priority |
|---|---|---|
| ANA-01 | Menghitung rule-based potential secara deterministic. | Must |
| ANA-02 | Menampilkan reason yang berasal dari rule yang terpenuhi. | Must |
| ANA-03 | Menampilkan overview total bisnis, website, phone, dan distribusi potential. | Must |
| ANA-04 | Menampilkan analisis kategori, website availability, dan potential distribution. | Must |
| ANA-05 | Menampilkan top recommended prospects berdasarkan score dan tie-breaker. | Must |
| ANA-06 | Mendukung konfigurasi target category dan scoring rules pada fase berikutnya. | Should |
| ANA-07 | Menampilkan analisis lokasi hanya jika data lokasi reliable tersedia. | Should |

## 8. Potential Semantics

Potential adalah indikator prioritas berdasarkan data yang tersedia, bukan prediksi pasti kebutuhan bisnis. UI harus menggunakan bahasa seperti **Potential berdasarkan indikator yang tersedia** dan menghindari klaim seperti **bisnis ini pasti membutuhkan website**.

Prioritas scoring dimulai dari kemungkinan user dapat menghubungi bisnis: status website, nomor telepon, dan social media. Rating dan jumlah review menjadi sinyal pendukung setelah contactability.

Rule, bobot, threshold, missing-data behavior, dan reason didefinisikan di `SCORING.md`.

## 9. UI/UX Requirements

- Gaya modern, clean, data-oriented, dan mudah dipindai.
- Navigation minimal: Overview, Prospects, Analytics, Datasets, Settings.
- High/Medium/Low mudah dikenali tanpa hanya bergantung pada warna.
- Tabel menjadi pusat workflow, bukan dashboard dekoratif.
- Filter aktif harus terlihat dan dapat dihapus satu per satu.
- Loading, empty state, import error, partial collection, dan storage error harus memiliki pesan yang jelas.
- Layout responsive untuk desktop dan viewport sempit.
- Dark/light mode boleh ditambahkan bila tidak mengganggu scope inti.

## 10. Storage and Deployment

Analyzer adalah static web app yang dapat dideploy ke GitHub Pages. Data runtime berada di browser user menggunakan IndexedDB atau localStorage. Tidak ada data yang dikirim ke server pada MVP.

Build harus mendukung base path GitHub Pages dan seluruh fitur inti harus bekerja tanpa API backend.

## 11. MVP Scope

### Must Have

MV3 collector, collection data inti, normalization, duplicate detection, JSON/CSV export, static analyzer, import, local storage, prospect table, search, filter, sort, website status, scoring, reasons, basic analytics, recommendation, dan CSV export.

### Should Have

Dataset management lengkap, multiple datasets, advanced filtering, charts yang fungsional, copy phone, open links, dan configurable scoring rules.

### Future / Out of Scope

Backend, authentication, cloud database, persistent cloud prospects, CRM, AI analysis, automated prospecting, follow-up, email, reminder, collaboration, dan subscription.

## 12. Future Roadmap

```text
MVP Static Web + Extension
        -> Cloud Database
        -> Authentication
        -> Persistent Prospect Database
        -> CRM
        -> AI Analysis
        -> Automated Prospecting
```

Setiap tahap future harus mempertahankan kontrak domain dan memindahkan persistence melalui abstraction, bukan mengikat UI langsung ke backend.

## 13. Acceptance Criteria

### Collector

- User dapat menjalankan collection pada halaman hasil Google Maps.
- Record inti yang tersedia memiliki field ter-normalisasi sesuai `DATA-SCHEMA.md`.
- Record duplicate tidak ditambahkan dua kali.
- Progress dan partial failure terlihat oleh user.
- JSON dan CSV yang dihasilkan dapat diimpor kembali ke Analyzer.

### Import and Dataset

- JSON valid dan CSV valid dapat diimpor.
- Invalid row tidak membuat seluruh aplikasi gagal; error dapat dijelaskan.
- Dataset baru dapat disimpan, dihapus, dan digabung.
- Merge dengan `businessId` sama menghasilkan satu record yang stabil.

### Prospect Table

- User dapat mencari business name, category, address, atau phone.
- User dapat menggabungkan minimal dua filter.
- Sorting score, rating, dan review count menghasilkan urutan yang benar.
- Action link membuka tujuan yang benar tanpa merusak state dataset.

### Scoring

- Score selalu berada pada rentang 0-100.
- Threshold High 80-100, Medium 50-79, Low 0-49 diterapkan tepat.
- Reason hanya mencantumkan rule yang terpenuhi.
- Data kosong tidak mendapat poin yang bergantung pada data tersebut.

### Analytics and Recommendation

- Overview menampilkan count yang sama dengan dataset aktif.
- Distribusi potential berjumlah sama dengan total bisnis.
- Recommendation mengikuti score dan tie-breaker yang terdokumentasi.
- Dashboard tidak mengklaim insight yang tidak didukung dataset.

### Export

- Export all, filtered, dan selected menghasilkan CSV dengan header konsisten.
- Nilai yang memiliki koma, kutip, atau newline di-escape sesuai standar CSV.
- File export dapat diimpor kembali tanpa kehilangan field inti.
