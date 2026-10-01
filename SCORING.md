# Scoring Specification - GMap Prospect Analyzer

## 1. Purpose and Disclaimer

Scoring membantu user menentukan urutan pemeriksaan prospek berdasarkan indikator yang tersedia. Scoring bukan diagnosis kebutuhan bisnis, bukan prediksi keberhasilan outreach, dan bukan klaim bahwa sebuah bisnis pasti membutuhkan website.

UI wajib menggunakan frasa seperti **Potential berdasarkan indikator yang tersedia**.

## 2. Default Configuration

```json
{
  "configVersion": "1.0",
  "targetCategories": [],
  "rules": {
    "noWebsite": 40,
    "targetCategory": 20,
    "phoneAvailable": 10,
    "ratingAtLeast4": 10,
    "reviewsAtLeast100": 10,
    "reviewsAtLeast500": 10
  },
  "thresholds": {
    "lowMax": 49,
    "mediumMax": 79,
    "highMax": 100
  }
}
```

`targetCategories` kosong berarti rule target category tidak aktif. Jika berisi kategori, comparison dilakukan case-insensitive setelah trim.

## 3. Rules

| Rule ID | Predicate | Default points | Reason |
|---|---|---:|---|
| `noWebsite` | `websiteStatus === "none"` | 40 | Tidak memiliki website |
| `targetCategory` | normalized category cocok dengan `targetCategories` | 20 | Termasuk kategori target |
| `phoneAvailable` | `phone` bukan null dan tidak kosong | 10 | Memiliki nomor telepon |
| `ratingAtLeast4` | `rating !== null && rating >= 4.0` | 10 | Rating minimal 4.0 |
| `reviewsAtLeast100` | `reviewCount !== null && reviewCount >= 100` | 10 | Memiliki minimal 100 reviews |
| `reviewsAtLeast500` | `reviewCount !== null && reviewCount >= 500` | 10 | Memiliki minimal 500 reviews |

Semua rule bersifat additive. `reviewsAtLeast100` dan `reviewsAtLeast500` boleh sama-sama aktif; bisnis dengan 500 reviews mendapat kedua poin tersebut.

## 4. Classification

Score dijumlahkan dan dibatasi pada rentang 0-100.

| Score | Potential |
|---:|---|
| 80-100 | `high` |
| 50-79 | `medium` |
| 0-49 | `low` |

Threshold bersifat inclusive pada batas bawah label masing-masing.

## 5. Missing Data Behavior

- `websiteStatus: unknown` tidak memenuhi `noWebsite`.
- `phone: null` tidak memenuhi `phoneAvailable`.
- `rating: null` tidak memenuhi rule rating.
- `reviewCount: null` tidak memenuhi rule review.
- `category: null` tidak memenuhi target category.
- Missing data tidak menghasilkan penalti.
- Nilai invalid harus dinormalisasi atau dianggap missing sebelum scoring.

## 6. Result Contract

```json
{
  "businessId": "mapsurl_abc123",
  "score": 90,
  "potential": "high",
  "reasons": [
    "Tidak memiliki website",
    "Memiliki nomor telepon",
    "Rating minimal 4.0",
    "Memiliki minimal 100 reviews",
    "Memiliki minimal 500 reviews"
  ],
  "appliedRules": [
    "noWebsite",
    "phoneAvailable",
    "ratingAtLeast4",
    "reviewsAtLeast100",
    "reviewsAtLeast500"
  ],
  "configVersion": "1.0"
}
```

`reasons` harus dibuat dari metadata rule yang terpenuhi, bukan string random atau template yang tidak memiliki predicate.

## 7. Calculation Algorithm

```text
score = 0
reasons = []

for each enabled rule in deterministic rule order:
    if predicate(record) is true:
        score += rule.points
        reasons.append(rule.reason)

score = clamp(score, 0, 100)
potential = classify(score)
```

Rule order default:

1. `noWebsite`
2. `targetCategory`
3. `phoneAvailable`
4. `ratingAtLeast4`
5. `reviewsAtLeast100`
6. `reviewsAtLeast500`

Changing order tidak boleh mengubah score, hanya urutan reason.

## 8. Recommendation Logic

Recommended prospects adalah record dengan score tertinggi, dengan default filter `potential === high` bila tersedia. Jika tidak ada high potential, tampilkan medium dengan label yang jelas.

Tie-breaker deterministic:

1. score descending
2. website status `none` sebelum status lain
3. review count descending, null terakhir
4. rating descending, null terakhir
5. name ascending case-insensitive
6. `businessId` ascending sebagai tie-breaker terakhir

Recommendation harus menampilkan score, potential, minimal satu reason jika ada, dan link ke Google Maps bila tersedia. Recommendation tidak boleh mengubah atau menambah reasons.

## 9. Configurability

Settings dapat menyimpan:

- Target categories
- Rule enabled/disabled
- Rule points
- Rating threshold
- Review thresholds
- Potential thresholds

MVP boleh menggunakan default config tanpa UI konfigurasi penuh. Jika configuration UI dibuat, validasi wajib memastikan points tidak negatif, threshold tidak tumpang tindih, dan score tetap dapat dipetakan ke label.

## 10. Examples

### Example A: High

- `websiteStatus: none` = 40
- kategori target = 20
- phone tersedia = 10
- rating 4.6 = 10
- reviews 327 = 10
- total = 90 -> `high`

### Example B: Low

- website tersedia = 0
- bukan kategori target = 0
- phone tersedia = 10
- rating 4.2 = 10
- reviews 120 = 10
- total = 30 -> `low`

Jika kategori target juga cocok dan website tidak tersedia, total menjadi 90 -> `high`. Contoh ini menunjukkan score harus dihitung dari predicate, bukan label manual.

### Example C: Unknown Website

- `websiteStatus: unknown`
- phone tersedia = 10
- rating 4.8 = 10
- reviews 600 = 20
- total = 40 -> `low`

Record tidak mendapat 40 poin no website karena status website tidak diketahui.

## 11. Acceptance Tests

1. Record tanpa website, kategori target, phone, rating 4.6, dan 327 reviews menghasilkan score 90 dan `high`.
2. Score 49 menghasilkan `low`; score 50 menghasilkan `medium`.
3. Score 79 menghasilkan `medium`; score 80 menghasilkan `high`.
4. Record dengan `websiteStatus: unknown` tidak mendapat poin `noWebsite`.
5. Record dengan `reviewCount: 500` mendapat poin rule 100 dan 500.
6. Reason count sama dengan applied rule count.
7. Setiap reason memiliki applied rule yang sesuai.
8. Dua record dengan input dan config sama menghasilkan result byte-for-byte yang sama kecuali ordering object yang tidak relevan.
9. Recommendation dengan score sama mengikuti tie-breaker yang terdokumentasi.
10. Configuration invalid ditolak sebelum scoring dijalankan.
