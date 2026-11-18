---
title: "Ekstensi Burp Suite Kecil untuk Mencatat Temuan"
description: "Catatan rekayasa tentang membuat ekstensi Burp Suite sederhana untuk menandai request, menyimpan catatan, dan mengekspor bukti tanpa berpindah aplikasi."
lang: "id"
translationKey: "sample-burp-notes-extension"
category: "security-tools"
tags: ["burp-suite", "tooling", "java", "notes"]
publishDate: 2025-08-19
sample: true
translationStatus: "original"
author: "YOUR NAME"
---

## Masalah kecil yang berulang

Saat pengujian, saya sering menandai request menarik lalu lupa mengapa request itu
penting. Berpindah ke aplikasi catatan memutus alur pengujian. Solusi sementara:
ekstensi kecil yang menyimpan catatan langsung di sisi request.

## Ruang lingkup yang sengaja dibatasi

- Tandai request dengan satu klik.
- Simpan catatan singkat dan tingkat keyakinan.
- Ekspor seluruh catatan ke JSON di akhir sesi.

Tidak ada fitur pelaporan otomatis, tidak ada integrasi server. Semakin kecil ruang
lingkupnya, semakin cepat ekstensi selesai dan semakin kecil risiko bug.

## Struktur data

```java
record FindingNote(
    String host,
    String path,
    String note,
    Confidence confidence,
    Instant createdAt
) {}
```

Catatan disimpan di memori selama sesi berlangsung, lalu ditulis ke disk saat diekspor.
Pendekatan ini menghindari state yang tidak jelas antar sesi.

## Titik integrasi Burp

```java
@Override
public void registerExtenderCallbacks(IBurpExtenderCallbacks callbacks) {
    this.callbacks = callbacks;
    callbacks.setExtensionName("Finding Notes");
    callbacks.registerContextMenuFactory(new NoteContextMenuFactory(this));
}
```

Menu konteks muncul pada request di Proxy history dan Repeater, sehingga alur pengujian
tidak berubah.

## Pelajaran

1. Simpan catatan sedekat mungkin dengan bukti aslinya.
2. Batasi fitur; tool internal tidak perlu sempurna.
3. Format ekspor yang sederhana lebih berguna daripada integrasi yang rumit.

## Langkah berikutnya

Ide yang belum dikerjakan: pencarian catatan berdasarkan host, dan penandaan otomatis
untuk request yang mengandung parameter mencurigakan. Keduanya sengaja ditunda sampai
kebutuhan nyata muncul dari pemakaian sehari-hari.
