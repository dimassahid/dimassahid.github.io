---
title: "Anthem"
description: "Enum Port 80 - http dirsearch : periksa satu per satu halaman penemuan kami, di robots.txt kami mendapatkan temuan menarik berupa beberapa frasa unik dan halaman umbraco. lalu kami periksa"
lang: "id"
translationKey: "anthem"
category: "lab-writeups"
tags: ["Lab", "Umbraco", "Reuse Passwords", "Hidden Files on Windows", "Change permission access file", "Windows", "Easy"]
publishDate: "2025-09-29"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "27d5fca1-ed80-8043-bd10-cba84068b8bc"
notionUrl: "https://app.notion.com/p/Anthem-27d5fca1ed808043bd10cba84068b8bc"
notionLastEdited: "2026-11-18T14:19:00.000Z"
---

# Enum

![](/images/anthem/1f97663f1bff.png)

## Port 80 - http

![](/images/anthem/c4ac1904af58.png)

dirsearch :

![](/images/anthem/cd0a56f4c3e4.png)

Kami memeriksa satu per satu halaman penemuan kami, di robots.txt kami mendapatkan temuan menarik berupa beberapa frasa unik dan halaman Umbraco.

![](/images/anthem/9b30fb2e3274.png)

Kemudian kita periksa halaman /umbraco, dari situ kita tahu bahwa situs web tersebut menjalankan aplikasi Umbraco. Berikut adalah halaman login Umbraco.

![](/images/anthem/aed1c3a3d6ec.png)

Sekarang kita menelusuri situs web untuk menemukan kredensial login. Kita menemukan blog menarik yang berisi sebuah puisi, jadi saya menempelkannya di Google dan mencari penulis puisi tersebut. Kita berasumsi itu menjadi nama administrator kita.

![](/images/anthem/3bde2c576514.png)

Kemudian di halaman /archive/we-are-hiring/ kami menemukan format email untuk John Doe adalah [JD@anthem.com](mailto:JD@anthem.com) jadi anggaplah email pengguna administrator kita akan menjadi SG@anthem.com, mari kita kumpulkan semua informasi itu untuk masuk ke aplikasi Umbraco(`SG@anthem.com:UmbracoIsTheBest!`).

![](/images/anthem/bebdb9f1bf1a.png)

Voila, kita berhasil masuk ke Umbraco CMS dan menemukan versi Umbraco CMS.

![](/images/anthem/4e67982053f7.png)

Dengan versi ini, mari kita cari kerentanan terkait. Setelah melakukan pencarian dan mencoba setiap kerentanan terkait, tidak ada kerentanan yang dapat membawa kita masuk ke server.

![](/images/anthem/6af55698c310.png)

jadi saya menggunakan upaya "buah yang menggantung" seperti menggunakan kredensial aplikasi Umbraco ke dalam login RDP dengan sedikit penyesuaian (`SG:UmbracoIsTheBest!`)

```javascript
xfreerdp3 /u:SG /p:UmbracoIsTheBest! /v:10.10.57.128
```

![](/images/anthem/66ef26fa1f77.png)

Oke, setelah berhasil login melalui RDP, sekarang kita akan melakukan enumerasi mesin Windows untuk melakukan peningkatan hak akses.

# WinPriv

Daftar semua file di direktori C, baik yang tersembunyi maupun tidak, menggunakan perintah berikut.

```javascript
Get-ChildItem -Force
```

![](/images/anthem/d1548c494d77.png)

Mari kita lihat direktori cadangan. Kita punya restrote.txt tapi kita tidak punya akses ke dalamnya.

![](/images/anthem/1cd6c9785385.png)

Jadi, mari kita coba mengaksesnya melalui antarmuka dan mencoba mengubah izin akses file tersebut.

Daftar periksa item tersembunyi untuk melihat file tersembunyi.

![](/images/anthem/cdde0ebaef01.png)

ubah izin file

![](/images/anthem/61f3bafcd84a.png)

![](/images/anthem/271a0cec7898.png)

Setelah melakukan pengecekan pada daftar periksa, dapatkan kontrol penuh, lalu klik tombol terapkan, kemudian tombol OK. Voila, pengguna kita sekarang memiliki akses kontrol penuh ke file tersebut.

![](/images/anthem/7410cbd1b1b2.png)

Sekarang kita bisa mengakses file dan mendapatkan kalimat-kalimat tersebut, mungkin kita bisa menggunakannya untuk login sebagai administrator.

![](/images/anthem/5b06f4125081.png)

Jadi, kami melakukan login ulang melalui RDP menggunakan informasi yang telah kami kumpulkan (Administrator:ChangeMeBaby1MoreTime) dan voila, sekarang kami login sebagai administrator dan dapat mengakses root.txt.

![](/images/anthem/4249ae43efa7.png)
