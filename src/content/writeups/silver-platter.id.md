---
title: "SIlver Platter"
description: "Enum Port 80 - http Situs web ini sebagian besar merupakan situs web HTML statis. Saat mengklik tab yang berbeda, kita menemukan beberapa informasi berguna di tab \"kontak\": Tab kontak"
lang: "id"
translationKey: "silver-platter"
category: "lab-writeups"
tags: ["Lab", "silverpeas CMS", "adm group", "sudo privesc", "Linux", "Easy"]
publishDate: "2025-09-02"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2625fca1-ed80-80a0-a231-d929d557c0bc"
notionUrl: "https://app.notion.com/p/SIlver-Platter-2625fca1ed8080a0a231d929d557c0bc"
notionLastEdited: "2025-09-08T16:11:00.000Z"
---

# Enum

![](/images/silver-platter/2449bfbe9335.png)

## Port 80 - http

![](/images/silver-platter/99a1a3775cd3.png)

Situs web ini sebagian besar merupakan situs web HTML statis.

Saat mengklik berbagai tab, kita menemukan beberapa informasi bermanfaat di tab "kontak":

![](/images/silver-platter/4a76f7bf3299.png)

Tab kontak membocorkan kemungkinan nama pengguna, serta nama sebuah aplikasi bernama "Silverpeas".

Kita dapat mencatat hal ini, dan melanjutkan dengan penghitungan kita.

Pada titik ini, saya menjalankan Gobuster di latar belakang sambil memeriksa port 8080. Tidak ada hasil yang menarik di sana, jadi saya akan langsung melanjutkan ke port 8080.

## Port 8080 - proxy http

![](/images/silver-platter/5e5cece6e7de.png)

Sayangnya, kami mendapatkan kesalahan 404 not found saat mengunjungi port 8080.

Tidak banyak yang bisa kita lakukan di sini, jadi kita harus mencari konten lebih lanjut dengan gobuster:

![](/images/silver-platter/b7e6e8e954dd.png)

Kita mendapatkan dua endpoint yang menarik, tetapi setelah menelitinya lebih lanjut, kita menemukan bahwa keduanya kemungkinan besar adalah jalan buntu. /website mengembalikan kesalahan "Forbidden", dan /console mengarahkan kita ke halaman 404.

Jadi, sepertinya kita agak terjebak dan tidak memiliki banyak celah untuk melakukan serangan.

Namun, perlu diingat bahwa pesan pada tab kontak sebelumnya menyebutkan "Silverpeas". Bagaimana jika direktori yang kita butuhkan adalah /silverpeas?

Di port 80, kami tidak menemukan apa pun. Tetapi di port 8080…

![](/images/silver-platter/4c9e792853c0.png)

Jadi, kita dihadapkan pada halaman login. Kita bisa mencoba melakukan serangan brute-force pada pengguna "scr1ptkiddy" yang disebutkan sebelumnya, tetapi serangan ini sangat berisik dan biasanya saya menggunakannya sebagai upaya terakhir.

Kita bisa mulai dengan mencari kredensial default “SilverPeas” di Google:

![](/images/silver-platter/fc0ca1ae8f0c.png)

Setelah mencoba masuk menggunakan kredensial default, kami gagal. Oke, langkah selanjutnya adalah meneliti kerentanan apa pun di SilverPeas. Tetapi untuk melakukan pencarian secara efektif, kita perlu mengetahui versinya. Saya tidak dapat mengidentifikasi versi pastinya, tetapi halaman login memberi kita indikasi yang cukup baik:

![](/images/silver-platter/a41b2719645a.png)

Tahun 2022 disebutkan sebagai tahun berjalan. Jadi, setiap kerentanan CVE dari tahun 2023 dan 2024 seharusnya bermanfaat.

Cukup cari "SilverPeas exploit" di Google:

![](/images/silver-platter/14c5388f1318.png)

![](/images/silver-platter/a18de886dd57.png)

Tampaknya ada kerentanan bypass otentikasi dari tahun 2024 — tepat seperti yang kita butuhkan!

Membaca detailnya, sepertinya yang perlu kita lakukan hanyalah menangkap permintaan login.
di BurpSuite, dan hapus kolom kata sandi dari permintaan tersebut.

Mari kita coba menggunakan nama pengguna yang kita dapatkan di halaman sebelumnya (halaman kontak) scr1ptkiddy dan hapus parameter kata sandi:

![](/images/silver-platter/3632e0f86689.png)

![](/images/silver-platter/c055b59ac579.png)

Yeay, kita berhasil melewati otentikasi aplikasi Silverpeas. Kita mendapat notifikasi pesan belum dibaca, mari kita periksa.

![](/images/silver-platter/474123465101.png)

![](/images/silver-platter/dac491c9dd6b.png)

Saat kita memeriksa kotak masuk, kita melihat ada nomor ID yang mewakili objek yang kita lihat, sehingga kita dapat mengeksploitasinya dengan menambah atau mengurangi nomor ID untuk melihat pesan lain berdasarkan CVE 2023-47232.

![](/images/silver-platter/182a15320e1d.png)

![](/images/silver-platter/97abf6829a0c.png)

Setelah melakukan peningkatan nomor ID, kami mendapatkan kredensial pengguna **tim** pada nomor ID 6.

![](/images/silver-platter/ca02a2fcff5c.png)

Jadi berdasarkan pesan yang kita terima, kita bisa menggunakan kredensial untuk login ssh (time:cm0nt!md0ntf0rg3tth!spa$$w0rdagainlol)

![](/images/silver-platter/d47b2b9709b8.png)

# LinPriv

Kacang polong:
Dengan memeriksa keanggotaan grup untuk pengguna `tim`, kita melihat bahwa pengguna tersebut termasuk dalam grup `adm`:

![](/images/silver-platter/a80db229321f.png)

Lalu kami mencari tahu apa arti **adm**? Kemudian saya mendapatkan jawabannya dari Google seperti berikut ini.

![](/images/silver-platter/8c72e301b1d1.png)

Jadi, berdasarkan informasi di atas, mari kita coba mengakses file log di direktori /var/log dan mencari string yang kita targetkan.

```bash
cat /var/log/auth* | grep -ai -e 'tyler' -e 'pass' -e 'ssh'
```

![](/images/silver-platter/5b96596dfa89.png)

Kami hanya menemukan kata sandi DB, jadi mari kita coba masuk sebagai pengguna tyler dengan kata sandi yang sama (tyler:_Zd_zx7N823/)

![](/images/silver-platter/c7d2b63b7287.png)

Yeay, kita berhasil login! Setelah itu, mari kita lakukan enumerasi sedikit dengan menjalankan perintah sudo -l

![](/images/silver-platter/ab5bb2418cd7.png)

Dari informasi di atas, kita tahu bahwa pengguna Tyler memiliki akses ke sudo all tanpa menggunakan kata sandi, jadi mari kita ganti pengguna menjadi pengguna root dengan menjalankan perintah `sudo su`

![](/images/silver-platter/f395cfeb1508.png)

Hore, kita dapat akses pengguna root dan flag-nya!
