# GMap Collector Extension

Chrome Extension Manifest V3 untuk mengumpulkan bisnis yang terlihat pada halaman hasil Google Maps.

## Instalasi Lokal

1. Buka `chrome://extensions` di Chrome.
2. Aktifkan **Developer mode**.
3. Pilih **Load unpacked**.
4. Pilih folder `GScrapper Extension`.
5. Buka halaman hasil Google Maps, misalnya pencarian `Cafe Mataram`.
6. Klik icon **GMap Collector** pada toolbar Chrome.

Fixture integrasi Analyzer tersedia di `fixtures/sample-dataset.json` dan `fixtures/sample-dataset.csv`.

## Penggunaan

1. Isi nama dataset, keyword, dan lokasi bila diperlukan.
2. Klik **Collect hasil terlihat**.
3. Extension membaca card bisnis yang tersedia pada halaman aktif.
4. Scroll halaman Google Maps terlebih dahulu bila ingin memuat lebih banyak hasil, lalu jalankan collection lagi.
5. Duplicate berdasarkan `businessId` tidak akan ditambahkan kembali.
6. Export dataset sebagai JSON untuk Analyzer atau CSV untuk spreadsheet.

Popup menampilkan jumlah card yang diproses, record baru yang terkumpul, duplicate yang dilewati, dan record yang gagal dibaca.

## Data yang Dikumpulkan

Extension mencoba membaca nama, kategori, alamat, nomor telepon, website, Google Maps URL, rating, dan jumlah review. Field yang tidak tersedia disimpan sebagai `null` atau status `unknown`.

Google Maps dapat mengubah struktur halaman. Karena itu extension hanya mengumpulkan data yang dapat dibaca dari hasil yang sedang terlihat dan tidak menjamin seluruh hasil pencarian selalu berhasil diekstrak.

## Penyimpanan

Hasil collection sementara disimpan menggunakan `chrome.storage.local` pada browser. Data tidak dikirim ke server. Gunakan tombol **Hapus hasil** untuk menghapus collection lokal extension.

File JSON dan CSV mengikuti kontrak pada `DATA-SCHEMA.md` di root repository dan dapat dipakai oleh GMap Analyzer.
