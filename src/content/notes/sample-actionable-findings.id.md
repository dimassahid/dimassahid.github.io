---
title: "Menulis Temuan yang Bisa Langsung Ditindaklanjuti"
description: "Struktur laporan temuan keamanan yang menekankan bukti yang dapat direproduksi, dampak dalam bahasa bisnis, dan langkah perbaikan yang jelas."
lang: "id"
translationKey: "sample-actionable-findings"
category: "application-security"
tags: ["reporting", "communication", "remediation"]
publishDate: 2025-07-08
sample: true
translationStatus: "original"
author: "YOUR NAME"
---

## Laporan bukan daftar skor

Laporan yang baik menjawab tiga pertanyaan pembaca: apa yang bisa terjadi, seberapa
mudah hal itu terjadi, dan apa langkah berikutnya. Skor kerentanan hanya berguna jika
ketiga pertanyaan tersebut sudah terjawab.

## Struktur yang saya pakai

1. **Ringkasan** - satu paragraf tanpa jargon.
2. **Dampak** - siapa yang terdampak dan data apa yang berisiko.
3. **Reproduksi** - langkah minimum untuk membuktikan temuan.
4. **Akar masalah** - penyebab teknis, bukan gejala.
5. **Rekomendasi** - perbaikan jangka pendek dan jangka panjang.

## Contoh ringkasan yang buruk

> Ditemukan IDOR pada endpoint invoice.

## Contoh ringkasan yang lebih baik

> Pengguna terautentikasi dapat membaca invoice milik pengguna lain dengan mengubah
> nomor invoice pada permintaan API. Data yang terekspos mencakup nama penagihan dan
> alamat email. Perbaikan dapat dilakukan pada lapisan query tanpa mengubah UI.

Perbedaannya bukan panjang, melainkan kejelasan tindakan yang bisa diambil.

## Menulis bukti

Bukti harus bisa dijalankan ulang oleh engineer yang tidak mengikuti sesi pengujian.
Saya membatasi bukti pada request minimum, menyamarkan data sensitif, dan menuliskan
asumsi lingkungan (versi, peran, konfigurasi khusus).

```http
GET /api/v1/invoices/1043 HTTP/1.1
Authorization: Bearer <token-user-a>
```

## Pelajaran

- Tulis untuk pembaca yang sibuk dan tidak hadir saat pengujian.
- Pisahkan gejala dari akar masalah.
- Sertakan verifikasi perbaikan, bukan hanya instruksi.
- Hindari dramatisasi; risiko nyata biasanya cukup meyakinkan.
