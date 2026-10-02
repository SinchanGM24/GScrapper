# Manual Chrome Smoke Test

Jalankan checklist ini setelah memilih **Load unpacked** pada `chrome://extensions`.

- [ ] Extension tampil tanpa error pada halaman Extensions.
- [ ] Google Maps hasil pencarian `Cafe Mataram` terbuka sebelum popup digunakan.
- [ ] Popup menampilkan field dataset name, keyword, dan location.
- [ ] **Collect hasil terlihat** menampilkan jumlah processed, collected, duplicate, dan failed.
- [ ] Collection kedua tidak menambahkan `businessId` yang sama.
- [ ] Error saat popup dibuka pada halaman non-Google Maps ditampilkan sebagai pesan yang jelas.
- [ ] Export JSON menghasilkan envelope `gmap-prospect-dataset` versi `1.0`.
- [ ] Export CSV memiliki header canonical sesuai `DATA-SCHEMA.md`.
- [ ] File JSON fixture dapat diimpor Analyzer.
- [ ] File CSV fixture dapat diimpor Analyzer.
- [ ] Tombol **Hapus hasil** mengosongkan collection lokal.

Catat versi Chrome, keyword, jumlah processed, dan error yang terlihat saat pengujian.