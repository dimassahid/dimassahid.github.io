---
title: "Boiler CTF"
description: "Enum Port 21 - ftp kita mendapatkan file .info.txt dari login anonim Port 80 - http Dirsearch: page /robots.txt page /joomla kita menemukan aplikasi joomla, jadi mari kita cari tahu versi berapa"
lang: "id"
translationKey: "boiler-ctf"
category: "lab-writeups"
tags: ["Lab", "Joomla", "Command Injection", "suid-find-privesc", "Linux", "Medium"]
publishDate: "2025-08-26"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "25b5fca1-ed80-8028-9fd5-fea68acb4ebc"
notionUrl: "https://app.notion.com/p/Boiler-CTF-25b5fca1ed8080289fd5fea68acb4ebc"
notionLastEdited: "2025-08-27T16:07:00.000Z"
---

# Enum

![](/images/boiler-ctf/f1f176a5ea85.png)

![](/images/boiler-ctf/85159fb5077b.png)

![](/images/boiler-ctf/ad098329be01.png)

## Port 21 - ftp

Kami mendapatkan file .info.txt dari login anonim.

![](/images/boiler-ctf/627c21ed5e43.png)

## Port 80 - http

![](/images/boiler-ctf/76ca07c31f91.png)

Dirsearch:

![](/images/boiler-ctf/34d93b0cde82.png)

halaman /robots.txt

![](/images/boiler-ctf/d2185e3c9614.png)

Di halaman /joomla, kami menemukan aplikasi Joomla, jadi mari kita cari tahu versi Joomla apa yang Anda gunakan dengan mengakses halaman ini **/administrator/manifests/files/joomla.xml**

![](/images/boiler-ctf/1c1e4330ef96.png)

![](/images/boiler-ctf/e2e6e1d5288d.png)

Kami menemukan bahwa versi Joomla adalah 3.9.12-dev. Setelah mencari di Google, kami tidak menemukan exploit publik yang menarik untuk dicoba. Jadi, mari kita cari cara lain, mari kita lakukan dirsearch lagi pada aplikasi Joomla.

![](/images/boiler-ctf/053ecd4fea50.png)

Setelah memeriksa satu per satu direktori tersebut, saya menemukan halaman menarik di /_test.

![](/images/boiler-ctf/50284c72e08a.png)

Setelah memilih Linux sebagai opsi OS, saya mendapatkan plot parameter di URL saya, jadi mari kita coba memodifikasinya menggunakan perintah Linux seperti `ls` , jika saya langsung memasukkan perintah `ls` itu tidak akan berfungsi, jadi saya menggunakan `;` untuk membuat lebih banyak perintah di Linux dan kemudian berhasil.

![](/images/boiler-ctf/31a67087d478.png)

![](/images/boiler-ctf/606ddbbbb125.png)

Jadi mari kita manfaatkan kerentanan injeksi perintah ini untuk mendapatkan revshell kita di server. Setelah mencoba satu per satu perintah dari [revshell.com](http://revshell.com/) akhirnya menggunakan busybox akan memberi kita revshell

![](/images/boiler-ctf/f98b4c28ed97.png)

Kami tidak dapat mengakses folder user di direktori home, untungnya kami mendapatkan salah satu kata sandi user yang merupakan kata sandi basterd (basted:superduperp@$$)

![](/images/boiler-ctf/ce380d95cf31.png)

Oke, sekarang kita sudah berada di user basterd, tetapi di direktori basterd tidak ada flag. Kita perlu pindah ke user lain untuk mendapatkan flag. User target kita adalah stoner. Kita punya file [backup.sh](http://backup.sh/) di dalam direktori basterd, mari kita periksa.

![](/images/boiler-ctf/2661282d8b1f.png)

Yeay, kita dapat kata sandi si pecandu ganja (stoner:#superduperp@$$no1knows), lalu mari kita dapatkan benderanya.

![](/images/boiler-ctf/a0359a8eca9a.png)

Bingo, kita tidak menemukan flag apa pun di dalam direktori stoner, tapi sebenarnya flag-nya adalah .secret hahahaha, tidak umum tapi tidak apa-apa.

# LinPriv

Sekarang mari kita lakukan enumerasi untuk mendapatkan pengguna root. Kita temukan di dalam linpeas bahwa biner tersebut memiliki SUID, sehingga dapat berguna untuk mendapatkan pengguna root.

**kacang polong**:

![](/images/boiler-ctf/bd688e4b2a69.png)

Berdasarkan gtfobin, kita dapat menjalankan perintah berikut untuk mendapatkan pengguna root.

```bash
find . -exec /bin/bash -p \; -quit
```

![](/images/boiler-ctf/7fab644776c5.png)

![](/images/boiler-ctf/12918f7aa0ef.png)

Yeay, kita dapat pengguna root dan juga flag root. Sebenarnya, dari bastard kita bisa langsung masuk sebagai pengguna root untuk mendapatkan semua flag hahaha.
