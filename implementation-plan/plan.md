# Implementation Plan: GMap Prospect Analyzer

**Date**: 2026-10-02 | **Spec**: `PRD.md`, `ARCHITECTURE.md`, `DATA-SCHEMA.md`, `SCORING.md`

## Summary

Menyelesaikan GMap Prospect Analyzer dari extension collector yang sudah discaffold ke static Analyzer yang dapat menerima JSON/CSV, menyimpan dataset secara lokal, menghitung potential, memfilter prospects, menampilkan analytics/recommendation, dan mengekspor hasil. Implementasi mempertahankan boundary file JSON/CSV, tidak menambahkan backend, authentication, cloud database, CRM, automation, atau AI ke MVP.

Requirement source memakai ID yang sudah ada di PRD: `COL-*`, `DAT-*`, `PRO-*`, dan `ANA-*`. Total requirement yang dipetakan: 24.

## Technical Context

**Language/Version:** TypeScript untuk Analyzer; JavaScript Manifest V3 untuk extension yang sudah ada.
**Primary Dependencies:** Vite, React, TypeScript, IndexedDB adapter, CSV parser/stringifier, Vitest, React Testing Library, Playwright.
**Storage:** IndexedDB untuk dataset; localStorage untuk settings ringan.
**Testing:** Unit/domain tests, import/export contract tests, component tests, Analyzer smoke E2E, dan manual extension smoke test.
**Target Platform:** Static web hosting di GitHub Pages; Chrome Extension MV3 untuk Chrome.
**Performance Goals:** Dataset umum dapat diimpor tanpa memblokir UI; table tetap dapat dipindai; gunakan pagination atau virtualization bila dataset besar.
**Constraints:** Local-first, file exchange JSON/CSV, schema canonical, score deterministic, partial collection, no fabricated data, responsive UI, dan base path GitHub Pages.

## Constitution Check

- **MVP flow Collect -> Import -> Filter -> Analyze -> Prioritize -> Export:** PASS. Urutan phase mengikuti flow ini.
- **Domain logic terpisah dari UI:** PASS. Schema, normalization, deduplication, scoring, recommendation, dan analytics berada di domain services.
- **English schema keys dan explicit types:** PASS. `BusinessRecord`, dataset envelope, dan service result memakai TypeScript types.
- **Unavailable data tidak dikarang:** PASS. Normalizer memakai `null` atau `unknown` sesuai schema.
- **Reasons hanya dari rule terpenuhi:** PASS. Scoring menghasilkan `appliedRules` dan `reasons` dari rule metadata.
- **Local-first static deployment:** PASS. Tidak ada API atau cloud persistence dalam plan.
- **Scope MVP:** PASS. CRM, auth, backend, email, reminder, collaboration, dan AI tidak direncanakan.

## Applied Guidelines

- Gunakan Manifest V3 permission minimum dan batasi host permission ke URL Google Maps.
- Jangan bergantung pada selector DOM tunggal; extractor harus toleran terhadap card yang partial dan melaporkan hasil gagal.
- Gunakan structured parser untuk JSON/CSV, bukan `split(',')` manual.
- Gunakan repository interface agar IndexedDB dapat diganti tanpa mengikat UI.
- Semua domain service harus pure atau memiliki dependency adapter yang eksplisit agar mudah diuji.

## Implementation Steps

### Step 1: [Cross-cutting] Analyzer project scaffold

- **Requirements:** DAT-01, DAT-02, DAT-05, PRO-01, PRO-02, ANA-03, ANA-04, ANA-05, ANA-06, ANA-07
- **Design inputs:** `ARCHITECTURE.md` sections 3.2, 6, 9; `PRD.md` sections 9-10.
- **Description:** Buat Vite React TypeScript di `analyzer/`, konfigurasi base path GitHub Pages, routing/view shell untuk Overview, Prospects, Analytics, Datasets, Settings, serta scripts untuk typecheck, lint, test, dan build.

Tasks:

- [x] T001 [Plan:1.1] Scaffold Vite React TypeScript di `analyzer/` dengan scripts `dev`, `build`, `typecheck`, `lint`, dan `test`.
- [x] T002 [P] [Plan:1.1] Tambahkan konfigurasi GitHub Pages base path dan static asset handling di `analyzer/vite.config.ts`.
- [x] T003 [P] [Plan:1.1] Buat app shell, navigation, route views, dan responsive layout di `analyzer/src/App.tsx` serta `analyzer/src/App.css`.
- [x] T004 [P] [Plan:1.1] Tambahkan konfigurasi Vitest, React Testing Library, dan Playwright smoke dependency di `analyzer/`.

### Step 2: [Cross-cutting] Canonical domain and persistence

- **Requirements:** DAT-01, DAT-02, DAT-04, DAT-05, ANA-01, ANA-02
- **Design inputs:** `DATA-SCHEMA.md` sections 1-9; `ARCHITECTURE.md` sections 5-7.
- **Description:** Implementasikan type canonical, validator, normalizer, deterministic identity, deduplication/merge, repository interface, dan IndexedDB adapter sebelum UI bergantung pada data.

Tasks:

- [x] T005 [Plan:2.1] Definisikan `BusinessRecord`, `Dataset`, JSON envelope, enum `websiteStatus`, dan schema version di `analyzer/src/domain/schema.ts`.
- [x] T006 [P] [Plan:2.1] Implementasikan canonical validation dan normalization di `analyzer/src/domain/normalization.ts`.
- [x] T007 [P] [Plan:2.1] Implementasikan deduplication dan merge conflict rules di `analyzer/src/domain/deduplication.ts`.
- [x] T008 [Plan:2.2] Definisikan `DatasetRepository` dan IndexedDB adapter di `analyzer/src/persistence/dataset-repository.ts`.
- [x] T009 [P] [Plan:2.2] Tambahkan tests untuk data lengkap, partial data, invalid data, duplicate, dan merge di `analyzer/src/domain/*.test.ts`.

### Step 3: [Cross-cutting] Import and export pipeline

- **Requirements:** COL-06, DAT-01, DAT-04, DAT-06
- **Design inputs:** `DATA-SCHEMA.md` sections 2, 7, 8; `ARCHITECTURE.md` section 8.
- **Description:** Bangun JSON/CSV importer dan exporter yang memvalidasi envelope, mendukung partial-row errors, melakukan round-trip canonical, dan melakukan merge melalui repository.

Tasks:

- [x] T010 [P] [Plan:3.1] Implementasikan JSON parser, schema/version validation, dan dataset import result di `analyzer/src/import-export/csv.ts`.
- [x] T011 [P] [Plan:3.1] Implementasikan CSV parser/stringifier dengan canonical header dan escaping di `analyzer/src/import-export/csv.ts`.
- [x] T012 [Plan:3.2] Hubungkan import validation, partial row reporting, create dataset, merge dataset, dan delete dataset ke `DatasetRepository`.
- [x] T013 [P] [Plan:3.2] Buat contract tests untuk koma, kutip, newline, nilai kosong, duplicate `businessId`, dan CSV round-trip.

### Step 4: [Cross-cutting] Scoring, recommendation, filtering, analytics

- **Requirements:** ANA-01, ANA-02, ANA-03, ANA-04, ANA-05, ANA-06, ANA-07, PRO-02, PRO-04
- **Design inputs:** `SCORING.md` sections 2-10; `ARCHITECTURE.md` section 7; `PRD.md` sections 7.3-7.4.
- **Description:** Implementasikan service domain yang deterministic dan tidak bergantung UI: scoring config/default rules, reason generation, filter/search/sort, analytics aggregate, dan recommendation tie-breaker.

Tasks:

- [x] T014 [P] [Plan:4.1] Implementasikan `ScoringConfig`, rule predicates, clamp, classification, reasons, dan `PotentialResult` di `analyzer/src/domain/scoring.ts`.
- [x] T015 [P] [Plan:4.1] Implementasikan filter kombinasi, text search, sorting, dan pagination view model di `analyzer/src/domain/filtering.ts`.
- [x] T016 [P] [Plan:4.1] Implementasikan analytics aggregate untuk overview, category, website, dan potential di `analyzer/src/domain/analytics.ts`.
- [x] T017 [P] [Plan:4.1] Implementasikan recommendation ranking dan tie-breaker di `analyzer/src/domain/recommendation.ts`.
- [x] T018 [Plan:4.2] Tambahkan target category control dan scoring config runtime di `analyzer/src/App.tsx`.
- [x] T019 [P] [Plan:4.2] Tambahkan tests untuk score boundaries, missing data, dan reasons di `analyzer/src/domain/scoring.test.ts`.

### Step 5: [Cross-cutting] Dataset and prospects UI

- **Requirements:** DAT-03, DAT-04, DAT-05, PRO-01, PRO-02, PRO-03, PRO-04
- **Design inputs:** `PRD.md` sections 7.2-7.3 and 9; `ARCHITECTURE.md` sections 3.2 and 5.
- **Description:** Bangun workflow import/manage dataset dan prospect table yang dapat dipindai, responsive, memiliki filter aktif, detail, links, copy phone, dan selected export.

Tasks:

- [x] T020 [Plan:5.1] Implementasikan dataset list/import/delete UI di `analyzer/src/App.tsx`.
- [x] T021 [Plan:5.2] Implementasikan prospect table dengan canonical columns, empty state, error notice, dan responsive states di `analyzer/src/App.tsx`.
- [x] T022 [P] [Plan:5.2] Tambahkan search, multi-filter, dan sort controls di `analyzer/src/App.tsx`.
- [x] T023 [P] [Plan:5.2] Tambahkan detail panel dan actions open Maps, open website, copy phone, serta export selected.
- [x] T024 [P] [Plan:5.2] Tambahkan component tests untuk filter kombinasi, table columns, empty state, error state, dan action links.

### Step 6: [Cross-cutting] Overview, analytics, recommendation, and settings UI

- **Requirements:** ANA-03, ANA-04, ANA-05, ANA-06, ANA-07
- **Design inputs:** `PRD.md` sections 7.4, 8, 9; `SCORING.md` section 8.
- **Description:** Hubungkan domain results ke Overview, Analytics, Recommendations, dan Settings tanpa menduplikasi scoring atau aggregate rules di komponen.

Tasks:

- [x] T025 [Plan:6.1] Implementasikan overview metrics dan potential distribution di `analyzer/src/App.tsx`.
- [x] T026 [P] [Plan:6.1] Implementasikan category, website, dan potential analytics di `analyzer/src/App.tsx`.
- [x] T027 [P] [Plan:6.1] Implementasikan recommended prospects dengan score dan reasons di `analyzer/src/App.tsx`.
- [x] T028 [P] [Plan:6.2] Implementasikan settings UI untuk target categories di `analyzer/src/App.tsx`.

### Step 7: [Cross-cutting] Collector integration hardening

- **Requirements:** COL-01, COL-02, COL-03, COL-04, COL-05, COL-07, DAT-01, COL-06
- **Design inputs:** `GScrapper Extension/`, `DATA-SCHEMA.md`, `ARCHITECTURE.md` sections 3.1 and 10.
- **Description:** Selaraskan extension yang sudah ada dengan canonical schema, perbaiki progress/partial errors, pastikan website status dan identity tidak memberi data palsu, dan verifikasi file hasil dapat diimport Analyzer.

Tasks:

- [x] T029 [Plan:7.1] Audit dan sesuaikan extractor di `GScrapper Extension/content.js` terhadap selector Google Maps yang tersedia, partial card, dan field canonical.
- [x] T030 [Plan:7.1] Perbaiki progress processed/collected/duplicate/failed di `GScrapper Extension/popup.js` dan `popup.html`.
- [x] T031 [Plan:7.2] Tambahkan manual Load unpacked smoke checklist dan fixture export di `GScrapper Extension/README.md`.
- [x] T032 [Plan:7.2] Jalankan smoke import terhadap JSON/CSV extension di Analyzer dan dokumentasikan hasilnya di test fixture.

### Step 8: [Cross-cutting] Validation and deployment

- **Requirements:** COL-05, COL-06, DAT-01, DAT-02, DAT-06, PRO-01, PRO-02, PRO-04, ANA-01, ANA-02, ANA-03, ANA-04, ANA-05
- **Design inputs:** `AGENTS.md` validation rules; `PRD.md` acceptance criteria; `ARCHITECTURE.md` deployment section.
- **Description:** Validasi end-to-end workflow Collect -> Import -> Filter -> Analyze -> Prioritize -> Export, cek responsive table, build static, dan deploy GitHub Pages.

Tasks:

- [ ] T033 [Plan:8.1] Tambahkan Playwright smoke flow import fixture, lihat overview, filter prospects, buka detail, dan export CSV di `analyzer/e2e/`.
- [ ] T034 [P] [Plan:8.1] Jalankan required domain tests untuk normalization, deduplication, scoring boundaries, import/export edge cases, dan dataset merge.
- [ ] T035 [P] [Plan:8.2] Verifikasi extension secara manual pada Chrome dengan page hasil Google Maps, partial result, duplicate collection, JSON export, dan CSV export.
- [ ] T036 [Plan:8.2] Jalankan typecheck, lint, test, build dengan GitHub Pages base path, lalu validasi output static di `analyzer/dist/`.
- [ ] T037 [Plan:8.2] Tambahkan GitHub Actions workflow untuk check dan deploy static Analyzer tanpa backend.

## Project Structure

```text
.
├── AGENTS.md
├── PRD.md
├── ARCHITECTURE.md
├── DATA-SCHEMA.md
├── SCORING.md
├── GScrapper Extension/
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   └── README.md
├── analyzer/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── app/
│   │   ├── domain/
│   │   ├── import-export/
│   │   ├── persistence/
│   │   └── ui/
│   ├── e2e/
│   └── public/
├── implementation-plan/
│   ├── plan.md
│   ├── research.md
│   └── checkpoints/
└── .github/workflows/
```

## Testing Strategy

- **appType:** SPA static web app plus browser extension.
- **Critical user journeys:** import extension JSON; import CSV with quoted values; inspect/filter/sort prospects; verify score/reasons/recommendation; export filtered/selected CSV; load extension on Google Maps and collect visible results.
- **primaryValidationStack:** Vitest + React Testing Library + Playwright + Chrome manual smoke test.
- **fallbackMatrix:** browser tier Playwright -> manual browser smoke; extension automation -> manual Chrome Load unpacked checklist. No infrastructure tier is required because MVP has no backend.
- **Environment requirements:** Node.js/npm, Chrome, GitHub Pages repository, and optional Playwright browser binaries.
- **knownGaps:** manual extension test does not guarantee all Google Maps DOM variants; Playwright fixture does not prove live Maps extraction; GitHub Pages check does not prove every browser storage quota.
- **Test data strategy:** committed canonical JSON/CSV fixtures with deterministic IDs, isolated IndexedDB per test context, and cleanup after each browser test.
- **Acceptance criteria:** every Must requirement has passing unit/component or smoke evidence; all score boundaries and CSV edge cases pass; Analyzer build works at repository base path; extension export imports without schema loss.
- **Validation review expectations:** reviewer confirms no backend/network dependency, no fabricated data, stable `businessId`, canonical headers, deterministic reasons, responsive table, and out-of-scope features remain absent.

## Requirement Mapping

| ID | Description | Plan Items | Implementation Evidence |
|---|---|---|---|
| COL-01 | Chrome Extension Manifest V3 | 7.1 | `GScrapper Extension/manifest.json` |
| COL-02 | Collect core business fields | 7.1 | `content.js`, extractor fixtures |
| COL-03 | Normalize core fields | 2.1, 7.1 | `normalization.ts`, `content.js` |
| COL-04 | Prevent duplicate businesses | 2.1, 7.1 | `deduplication.ts`, popup state |
| COL-05 | Progress and partial errors | 7.1, 8.1 | popup UI, manual smoke evidence |
| COL-06 | JSON and CSV export | 3.1, 7.2 | import/export services, extension popup |
| COL-07 | Optional reliable fields | 7.1 | extractor optional field handling |
| DAT-01 | Import JSON and CSV | 1.1, 3.1, 7.2 | importers, schema validation |
| DAT-02 | Browser-local storage | 1.1, 2.2 | IndexedDB repository |
| DAT-03 | Dataset metadata | 5.1 | dataset UI and Dataset type |
| DAT-04 | Merge and deduplicate datasets | 2.1, 3.2, 5.1 | repository merge, deduplication service |
| DAT-05 | Delete datasets | 1.1, 2.2, 5.1 | repository and dataset UI |
| DAT-06 | Export complete/filtered data | 3.1, 5.2, 8.1 | CSV/JSON exporters, export actions |
| PRO-01 | Prospect table columns | 1.1, 5.2 | prospects table components |
| PRO-02 | Search/filter/sort/pagination | 1.1, 4.1, 5.2 | filtering service and table controls |
| PRO-03 | Details and prospect actions | 5.2 | detail panel and action handlers |
| PRO-04 | Combined filters | 4.1, 5.2 | filter state and component tests |
| ANA-01 | Deterministic potential scoring | 4.1 | `scoring.ts` and unit tests |
| ANA-02 | Rule-based reasons | 4.1, 6.1 | scoring result and UI |
| ANA-03 | Overview analytics | 4.1, 6.1 | analytics service and overview UI |
| ANA-04 | Category/website/potential analytics | 4.1, 6.1 | analytics service and charts |
| ANA-05 | Recommended prospects | 4.1, 6.1 | recommendation service and UI |
| ANA-06 | Configurable target/rules | 4.2, 6.2 | settings persistence and UI |
| ANA-07 | Optional location analytics | 4.1, 6.1 | area aggregation and conditional view |

## Complexity Tracking

No constitution violations. No complexity exception required.
