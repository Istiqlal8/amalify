# Rombakan Kebun — "Kampung yang Bisa Dibaca"

Arah desain dan catatan implementasi untuk tab Kebunku dan Kebun grup.

## Masalah yang dipecahkan

1. **Dua bahasa visual menabrak.** Dunia pixel-art memakai palet aslinya, sementara semua
   chrome memakai frosted glass pastel (`frostOf`): rim putih tebal, blur, shadow tinggi, pil
   besar. Hasilnya HUD aplikasi lain yang ditempel di atas game.
2. **Kamera membuat kampung terbaca sebagai koridor.** Tinggi sel hanya 0,5 lebar dan layar
   hanya memuat sekitar satu blok, jadi pengguna tidak pernah melihat kampungnya sebagai satu
   tempat.
3. **Sepertiga bawah layar sesak.** Joystick 120 dp, tab bar mengapung 150 dp, pil Naik/Lompat,
   dan caption bertumpuk di area yang sama.
4. **336 bed tidak terbaca.** Persentase per hari hanya muncul saat karakter kebetulan
   menginjaknya.
5. **Hari tanpa catatan ditampilkan sebagai 0%.** Hari yang belum pernah dibuka terlihat sama
   dengan hari yang dicatat nol — pembacaan yang menyalahkan pengguna.
6. **Warna farm tersebar sebagai hex lepas** tanpa token.

## Arah

Dunia tetap pixel-art dan tetap bisa dijelajahi. Yang berubah: fungsi utama layar menjadi
**membaca progres dan memilih hari**, bukan mengendalikan karakter terus-menerus.

- **Overview** (default): kamera memuat seluruh kampung. Petak bulan bisa diketuk untuk membuka
  kalendernya. Tidak ada joystick.
- **Jelajah**: kamera mengikuti karakter, joystick muncul, kuda dan pet tetap seperti semula.

UI memakai lapisan terpisah dari dunia: permukaan kertas hangat solid, tepi 1 dp, shadow pendek,
radius kecil. Aset pixel-art tidak pernah di-tint massal.

## Token

`constants/farm.ts` memegang warna, radius, dan permukaan kebun. `paperOf()` menggantikan
`frostOf()` di seluruh kebun. Aksen aplikasi (pink/hijau/biru/putih) dipakai hanya untuk kontrol,
fokus, dan garis pilihan — tidak pernah untuk mewarnai rumput atau tanaman.

Status hari dibawa tiga cara sekaligus — isian warna, glyph, dan label — sehingga tidak ada
informasi yang hanya bisa dibaca lewat warna.

## Status hari

`domain/farmDay.ts` memisahkan empat keadaan yang sebelumnya menjadi satu angka:

| Status     | Arti                            | Ditampilkan sebagai |
| ---------- | ------------------------------- | ------------------- |
| `nanti`    | Tanggal belum tiba              | Belum tiba          |
| `belum`    | Tidak ada entri log sama sekali | Belum dicatat       |
| `khusus`   | Hari haid                       | Hari khusus         |
| `tercatat` | Ada entri log                   | Persentasenya       |

Rata-rata bulan dihitung **hanya dari hari tercatat non-haid**, dan selalu disertai jumlah hari
yang dihitung. Bulan yang belum pernah diisi berbunyi "Belum ada data", bukan 0%.

Hari haid bersifat privat: `buildGroupWorld` tidak pernah menandai haid anggota lain.

## Komponen

| Berkas                   | Peran                                                  |
| ------------------------ | ------------------------------------------------------ |
| `ui/Paper.tsx`           | Panel, judul, label, tombol, chip di atas kertas        |
| `ui/PaperSheet.tsx`      | Bottom sheet kertas                                     |
| `GardenHeader.tsx`       | Bar atas: judul, beruntun, poin                         |
| `TodayProgressCard.tsx`  | Panel tetap di bawah peta; juga pintu ke amal yaumi     |
| `GardenControls.tsx`     | Kontrol per mode — tidak pernah dua set sekaligus       |
| `PlotTapLayer.tsx`       | Target ketuk per petak bulan di Overview                |
| `MonthOverviewGrid.tsx`  | 12 bulan sebagai kartu, menggantikan heatmap HSL        |
| `MonthCalendarSheet.tsx` | Kalender satu bulan, 7 kolom, sel ≥ 40 × 56 dp          |
| `DayCell.tsx`            | Satu hari: isian, glyph, penanda hari ini dan haid      |
| `DayDetailSheet.tsx`     | Detail satu hari                                        |
| `BedContextCard.tsx`     | Kartu kontekstual saat berhenti di bed; hilang sendiri  |
| `GroupPresenceBar.tsx`   | Siapa yang sedang di kebun, dengan nama                 |

## Yang dihapus

- `WorldMap.tsx` — heatmap HSL tanpa angka; digantikan `MonthOverviewGrid` dan `PlotTapLayer`.
- Frame kuning berdenyut sebagai satu-satunya penanda hari ini; kini bingkai tetap.
- Caption permanen yang melayang di atas dunia.
- FAB amal yaumi yang mengambang; aksinya pindah ke panel ringkasan.
- Tombol Peta, suara, Naik dan Lompat yang muncul bersamaan apa pun modenya.

## Aset

Sprite kebun dibangun `scripts/build-farm-assets.py` dari dua pack CC0, dan harus konsisten di
empat arah hadap, kotak selebar satu sel, kaki di dasar, latar transparan, sejajar grid 3/4-view.
Gambar hasil AI tidak dapat memenuhi syarat itu. Mockup di folder ini adalah **acuan arah**, bukan
aset produksi; mengganti sprite tetap lewat pipeline Python dengan sumber yang sejajar grid.

## Mockup

- `kebunku-a.jpg` — Overview: kampung utuh, ringkasan hari ini di bawah.
- `jelajah-a.jpg` — Jelajah: joystick, label bed kontekstual.
- `kalender.jpg` — kalender bulan sebagai bottom sheet.
- `grup.jpg` — kebun grup dengan identitas anggota.
