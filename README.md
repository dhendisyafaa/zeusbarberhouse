# Zeus BarberHouse — Project Documentation

Versi: 0.1.0  
Status: Draft awal  
Terakhir diperbarui: 6 November 2026

Dokumentasi ini menjadi baseline perencanaan dan pengembangan website serta management system Zeus BarberHouse.

## Daftar dokumen

- `docs/prd.md` — kebutuhan produk, pengguna, scope, dan business rules.
- `docs/design.md` — arah UI/UX, sitemap, design system, dan state antarmuka.
- `docs/technical.md` — stack, arsitektur, lingkungan, dan keputusan teknis.
- `docs/database.md` — rancangan awal entitas, relasi, dan aturan integritas data.
- `docs/api.md` — rancangan endpoint dan kontrak API awal.
- `docs/ai_context.md` — konteks ringkas untuk AI coding assistant.
- `todo.md` — tahapan pekerjaan dan backlog awal.

## Cara membaca status informasi

- **Confirmed**: sudah diputuskan atau disampaikan secara eksplisit.
- **Proposed**: rekomendasi rancangan yang masih perlu persetujuan.
- **TBD**: belum diketahui dan perlu dikonfirmasi.
- **Assumption**: asumsi sementara untuk membantu perancangan; tidak boleh dianggap sebagai keputusan bisnis.

## Prinsip dokumentasi

1. `prd.md` menjadi sumber utama kebutuhan dan aturan bisnis.
2. `technical.md` menjadi sumber utama keputusan teknologi dan arsitektur.
3. `database.md` menjadi sumber utama rancangan skema data.
4. `api.md` menjadi sumber utama kontrak endpoint.
5. Jika keputusan berubah, perbarui dokumen sumbernya dan dokumen lain yang terdampak.
6. Jangan mengimplementasikan aturan bisnis berstatus TBD seolah-olah sudah disetujui klien.
