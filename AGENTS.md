# AGENTS.md - Aturan Kerja GMap Prospect Analyzer

## Tujuan Repository

Repository ini mendokumentasikan dan mengimplementasikan **GMap Prospect Analyzer**, yaitu sistem local-first untuk mengumpulkan bisnis dari Google Maps, mengimpor dataset, menganalisis potential, dan membantu user memprioritaskan prospek.

Alur utama:

```text
Google Maps -> GMap Collector -> JSON/CSV -> GMap Analyzer -> Analysis -> Recommendation -> Export
```

## Sumber Kebenaran

- `PRD.md` adalah sumber kebutuhan produk dan acceptance criteria.
- `ARCHITECTURE.md` adalah sumber pembagian modul dan alur teknis.
- `DATA-SCHEMA.md` adalah kontrak resmi record bisnis, dataset, JSON, dan CSV.
- `SCORING.md` adalah sumber resmi rule potential, bobot, threshold, dan reason.
- Jika terjadi konflik, schema dan scoring menjadi sumber kebenaran untuk data dan perhitungan; PRD menjadi sumber kebenaran untuk prioritas fitur.
- Setiap perubahan kontrak harus memperbarui dokumen terkait dan acceptance criteria.

## Prinsip Implementasi

1. Prioritaskan alur MVP: **Collect -> Import -> Filter -> Analyze -> Prioritize -> Export**.
2. Gunakan TypeScript dan tipe eksplisit untuk data lintas modul.
3. Pisahkan logic domain dari UI: normalization, deduplication, scoring, recommendation, dan analytics tidak boleh bergantung langsung pada komponen tampilan.
4. Pertahankan field schema dalam Bahasa Inggris; teks UI dan dokumentasi boleh berbahasa Indonesia.
5. Gunakan `null` atau field yang tidak ada untuk data yang tidak tersedia sesuai aturan `DATA-SCHEMA.md`; jangan mengarang nilai.
6. Semua potential reason harus berasal dari rule yang benar-benar terpenuhi.
7. Buat perubahan kecil, mudah diuji, dan jangan melakukan refactor yang tidak diperlukan untuk MVP.

## Batasan MVP

MVP wajib local-first dan dapat dideploy sebagai static web app ke GitHub Pages. Jangan menambahkan hal berikut ke MVP:

- Backend atau API server
- Authentication dan user account
- Cloud database atau sinkronisasi cloud
- CRM, contact management, atau follow-up tracking
- Email automation, reminder, atau payment
- Multi-user collaboration
- AI lead qualification atau klaim kebutuhan bisnis yang pasti

IndexedDB atau localStorage boleh digunakan. Detail pilihan harus konsisten dengan `ARCHITECTURE.md`.

## Collector dan Data Source

- Collector menggunakan Chrome Extension Manifest V3.
- Collector hanya menjanjikan pengambilan data yang tersedia dan dapat dibaca secara reliable dari halaman Google Maps saat ini.
- DOM Google Maps dapat berubah; implementasi harus memiliki progress, partial result, duplicate prevention, dan error yang dapat dipahami user.
- Jangan menambahkan data personal atau field yang tidak diperlukan untuk prospecting MVP.
- Field optional seperti opening hours, business status, latitude/longitude, dan place identifier hanya dikumpulkan bila reliable.
- Jangan mengklaim scraper memiliki cakupan lengkap atau bypass terhadap pembatasan platform.

## Validasi Wajib

Sebelum menyelesaikan perubahan:

1. Jalankan typecheck, lint, unit test, atau build yang tersedia.
2. Uji normalization dan deduplication dengan data lengkap, data parsial, dan duplicate.
3. Uji scoring pada batas `0`, `49`, `50`, `79`, `80`, dan `100`.
4. Uji import/export untuk JSON dan CSV, termasuk koma, tanda kutip, newline, dan nilai kosong.
5. Pastikan dataset merge tidak menggandakan `businessId` yang sama.
6. Untuk perubahan UI, pastikan tabel dapat dipindai dan tetap usable pada viewport sempit.

Jika belum ada tooling, tambahkan test minimal untuk logic domain sebelum menambah kompleksitas UI.

## Konsistensi Dokumentasi

Saat menambah atau mengubah fitur:

- Tambahkan atau perbarui requirement di `PRD.md`.
- Tetapkan pemilik modul di `ARCHITECTURE.md`.
- Jika menyentuh record atau import/export, perbarui `DATA-SCHEMA.md`.
- Jika menyentuh potential atau recommendation, perbarui `SCORING.md`.
- Tulis acceptance criteria yang dapat diverifikasi, bukan deskripsi yang subjektif.

## Definition of Done

Sebuah fitur dianggap selesai apabila implementasi, kontrak data, test domain, acceptance criteria, dan dokumentasi terkait sudah konsisten. Perubahan tidak boleh memperluas scope MVP tanpa keputusan eksplisit.
