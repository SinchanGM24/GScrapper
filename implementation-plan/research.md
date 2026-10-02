# Research and Decisions - GMap Prospect Analyzer

## Decision 1: Analyzer stack

- **Decision:** Vite + React + TypeScript.
- **Rationale:** Cocok untuk static deployment ke GitHub Pages, cepat untuk SPA data-oriented, dan selaras dengan arahan PRD.
- **Alternatives considered:** Next.js ditolak karena server features tidak diperlukan untuk MVP; vanilla JavaScript ditolak karena domain model, schema, scoring, dan UI membutuhkan type safety.

## Decision 2: Browser storage

- **Decision:** IndexedDB sebagai adapter dataset utama; localStorage hanya untuk settings kecil.
- **Rationale:** Dataset dapat berisi banyak record dan harus tetap local-first. Repository interface menjaga opsi migrasi ke persistence lain.
- **Alternatives considered:** localStorage-only lebih sederhana tetapi ukuran dan synchronous API kurang cocok untuk dataset yang berkembang.

## Decision 3: CSV handling

- **Decision:** Gunakan parser/stringifier CSV teruji untuk import/export dan tambahkan contract tests untuk koma, kutip, newline, dan nilai kosong.
- **Rationale:** CSV edge cases mudah rusak bila dibuat dengan split/join sederhana.
- **Alternatives considered:** parser manual hanya dipakai bila dependency policy melarang package; bukan default.

## Decision 4: Extension integration

- **Decision:** Pertukaran file JSON/CSV menjadi integration boundary MVP.
- **Rationale:** Extension dan Analyzer dapat dipasang/deploy secara independen tanpa backend atau native messaging.
- **Known limitation:** Collector hanya membaca result card yang terlihat dan tidak menjanjikan cakupan lengkap karena DOM Google Maps dapat berubah.

## Decision 5: Testing

- **Decision:** Vitest untuk domain/import/export; React Testing Library untuk UI behavior; Playwright untuk smoke flow Analyzer; manual Chrome Load unpacked smoke test untuk extension.
- **Rationale:** Menutup risiko utama pada schema, deduplication, scoring, CSV round-trip, dan workflow import/filter/export.
