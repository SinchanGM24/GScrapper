# Data Schema - GMap Prospect Analyzer

- **Schema name:** `gmap-prospect-dataset`
- **Current version:** `1.0`
- **Canonical encoding:** UTF-8
- **Canonical keys:** camelCase

## 1. Contract Rules

- Canonical record menggunakan field di bawah ini.
- `null` berarti field diketahui tetapi tidak tersedia; field optional boleh tidak ada saat input mentah.
- Empty string hanya boleh digunakan untuk text yang memang kosong setelah trim; normalizer sebaiknya mengubahnya menjadi `null` untuk field optional.
- Numeric field tidak boleh menyimpan simbol, separator ribuan, atau string display.
- Tanggal menggunakan ISO 8601 UTC.
- Analyzer harus menormalisasi input ke canonical form sebelum disimpan.

## 2. Dataset Envelope

```json
{
  "schemaName": "gmap-prospect-dataset",
  "schemaVersion": "1.0",
  "dataset": {
    "datasetId": "ds_20261002_cafe_mataram",
    "name": "Cafe - Mataram - 2026-10-02",
    "keyword": "Cafe",
    "location": "Mataram",
    "collectedAt": "2026-10-02T09:30:00Z",
    "source": "gmap-collector",
    "businesses": []
  }
}
```

### Dataset fields

| Field | Type | Required | Rules |
|---|---|---:|---|
| `datasetId` | string | yes | Stable within local repository; unique per dataset. |
| `name` | string | yes | Human-readable dataset name. |
| `keyword` | string or null | no | Search keyword, if known. |
| `location` | string or null | no | Search location, if known. |
| `collectedAt` | ISO datetime or null | no | Collection date/time, if known. |
| `source` | enum | yes | `gmap-collector`, `manual-import`, or `analyzer-export`. |
| `businesses` | array | yes | Canonical `BusinessRecord[]`. |

## 3. BusinessRecord

```json
{
  "businessId": "mapsurl_abc123",
  "name": "Cafe ABC",
  "category": "Cafe",
  "address": "Jl. Contoh No. 1, Mataram",
  "phone": "+62 812 0000 0000",
  "website": null,
  "websiteStatus": "none",
  "mapsUrl": "https://www.google.com/maps/place/...",
  "rating": 4.6,
  "reviewCount": 327,
  "openingHours": null,
  "businessStatus": null,
  "latitude": null,
  "longitude": null,
  "placeId": null,
  "area": "Mataram",
  "collectedAt": "2026-10-02T09:30:00Z"
}
```

### Business fields

| Field | Type | Required | Rules |
|---|---|---:|---|
| `businessId` | string | yes | Stable normalized identity; used for deduplication. |
| `name` | string | yes | Trimmed business name. |
| `category` | string or null | no | Primary category bila tersedia. |
| `address` | string or null | no | Trimmed display address. |
| `phone` | string or null | no | Normalized display phone; no invented number. |
| `website` | URL string or null | no | Canonical URL bila valid dan tersedia. |
| `websiteStatus` | enum | yes | `present`, `none`, atau `unknown`. |
| `mapsUrl` | URL string or null | no | Google Maps URL bila tersedia. |
| `rating` | number 0-5 or null | no | Numeric rating tanpa suffix. |
| `reviewCount` | integer >= 0 or null | no | Numeric count tanpa separator/suffix. |
| `openingHours` | object/string/null | no | Optional; hanya bila reliable. |
| `businessStatus` | enum/string/null | no | Optional; platform value yang dinormalisasi. |
| `latitude` | number or null | no | Optional coordinate. |
| `longitude` | number or null | no | Optional coordinate. |
| `placeId` | string or null | no | Optional stable platform identifier. |
| `area` | string or null | no | Reliable area derived from address/search context. |
| `collectedAt` | ISO datetime or null | no | Timestamp record bila tersedia. |

## 4. Website Status

- `present`: `website` valid dan tidak kosong.
- `none`: collector memiliki indikasi eksplisit bahwa bisnis tidak menampilkan website.
- `unknown`: website field tidak dapat dibaca atau status tidak dapat ditentukan.

Jangan mengubah `unknown` menjadi `none`. Rule no-website pada scoring hanya berlaku untuk `none`, bukan `unknown`.

## 5. Identity and Deduplication

Prioritas pembentukan `businessId`:

1. `placeId`, dinormalisasi dengan prefix `place_`.
2. `mapsUrl`, dinormalisasi dengan menghapus tracking parameter dan whitespace, lalu di-hash menjadi identifier stabil seperti `mapsurl_<digest>`.
3. Fallback dari kombinasi normalized `name + address + phone`; hasilnya diberi prefix `fallback_`.

Deduplication:

- Record dengan `businessId` sama adalah record yang sama.
- Saat merge, pertahankan nilai non-null yang lebih lengkap.
- Jika dua nilai konflik, prioritaskan record terbaru hanya untuk field yang memiliki `collectedAt` terbaru; jangan menggabungkan teks secara acak.
- Jangan menggunakan nama bisnis saja sebagai identity.

## 6. Normalization Rules

- Trim whitespace dan ubah whitespace berulang menjadi satu spasi.
- Rating seperti `4.6 stars` menjadi `4.6`.
- Review count seperti `1,234 reviews`, `1.2K`, atau `500+` dinormalisasi menjadi integer sesuai informasi yang tersedia; jika tidak reliable, gunakan `null`.
- URL website diberi scheme `https://` bila host valid tanpa scheme.
- Nomor telepon dibersihkan dari whitespace berlebih tetapi format display yang dapat dibaca dipertahankan.
- Field tidak tersedia menjadi `null`, bukan string `N/A`.
- Category comparison untuk scoring bersifat case-insensitive dan trim whitespace.

## 7. CSV Contract

CSV wajib memiliki header berikut dalam urutan canonical:

```text
businessId,name,category,address,phone,website,websiteStatus,mapsUrl,rating,reviewCount,openingHours,businessStatus,latitude,longitude,placeId,area,collectedAt
```

Dataset metadata dapat disimpan pada JSON; untuk CSV, metadata opsional dapat ditambahkan sebagai file companion atau tidak disertakan. Import CSV harus tetap menghasilkan dataset metadata default dengan `source: manual-import`.

CSV rules:

- UTF-8.
- Field yang berisi koma, kutip, atau newline harus diapit kutip ganda.
- Kutip ganda di dalam field di-escape menjadi dua kutip ganda.
- `null` dan cell kosong diperlakukan sebagai nilai tidak tersedia untuk field optional.
- Header yang tidak dikenal diabaikan dengan warning; header required yang hilang menghasilkan error yang dapat dijelaskan.

## 8. Import and Merge

- JSON dengan `schemaVersion` mayor yang tidak dikenal ditolak.
- Minor version yang lebih baru boleh diterima bila backward-compatible dan field unknown diabaikan.
- Import selalu divalidasi sebelum menulis storage.
- Dataset baru diberi `datasetId` unik.
- Merge ke dataset aktif melakukan deduplication berdasarkan `businessId`.
- Invalid row dilaporkan per row; row valid tetap dapat diimpor bila user menyetujui partial import.
- Import tidak boleh mengubah source file asli.

## 9. Compatibility

Perubahan yang menghapus atau mengubah arti field memerlukan major schema version. Penambahan optional field memerlukan minor version. Analyzer harus memiliki migration function untuk schema lama yang masih didukung.

## 10. Contract Acceptance Criteria

- Export JSON dapat diimpor kembali tanpa kehilangan field inti.
- Export CSV dapat diimpor kembali dengan header canonical.
- Duplicate `businessId` menghasilkan satu record setelah import atau merge.
- `websiteStatus: unknown` tidak diberi perlakuan sebagai no website.
- Rating dan review count tersimpan sebagai number/integer atau `null`.
- Nilai CSV yang mengandung koma, kutip, dan newline round-trip dengan benar.
