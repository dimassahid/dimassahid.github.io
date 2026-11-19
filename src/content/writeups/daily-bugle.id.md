---
title: "Daily Bugle"
description: "Enum Nmap : Dirsearch : Port 80 Joomla Referensi : Versi Joomla yang Teridentifikasi, Saya mendapatkan halaman ini dari hacktricks Exploit Joomla Versi 3.7.0 Referensi : Saat menjalankan exploit"
lang: "id"
translationKey: "daily-bugle"
category: "lab-writeups"
tags: ["Lab", "Joomla", "sudo yum", "password di config php", "Linux"]
publishDate: "2024-12-20"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1625fca1-ed80-807b-bc33-f04b7363a0ba"
notionUrl: "https://app.notion.com/p/Daily-Bugle-1625fca1ed80807bbc33f04b7363a0ba"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# Enum

Nmap:

![](/images/daily-bugle/41ce701d8e62.png)

Dirsearch :

![](/images/daily-bugle/63d81ac8f762.png)

## Port 80 (Joomla)

Referensi : [https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/joomla](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/joomla)

![](/images/daily-bugle/54d12ea4a3c5.png)

Versi Joomla yang teridentifikasi, saya mendapatkan halaman ini dari hacktricks.

![](/images/daily-bugle/49d733c4d45d.png)

![](/images/daily-bugle/b170abd228fc.png)

![](/images/daily-bugle/ef79d21d14a8.png)

## Eksploitasi Joomlah Versi 3.7.0

Referensi : [https://github.com/stefanlucas/Exploit-Joomla](https://github.com/stefanlucas/Exploit-Joomla), [https://blog.sucuri.net/2017/05/sql-injection-vulnerability-joomla-3-7.html](https://blog.sucuri.net/2017/05/sql-injection-vulnerability-joomla-3-7.html)

Saat menjalankan skrip eksploitasi, kami berhasil mengambil data super user dari basis data.

![](/images/daily-bugle/fec2dca2c16f.png)

dan kami mengetahui bahwa kata sandi tersebut dienkripsi, jadi mari kita identifikasi jenis enkripsinya.

![](/images/daily-bugle/ae2bb5211c75.png)

Selanjutnya, kami mencoba mendekripsinya menggunakan John atau HashCat.

![](/images/daily-bugle/1613fa58fcc6.png)

![](/images/daily-bugle/3928fb733f81.png)

Yey, sekarang kita sudah mendapatkan kredensial lengkap `jonah : spiderman123` mari kita coba masuk sebagai super user di halaman administrator.

![](/images/daily-bugle/74b2e9adfa7d.png)

Setelah login, mari kita cari tahu cara membuat reverse shell dari CMS ini. Pertama, buka menu template.

![](/images/daily-bugle/a8958cfe5d68.png)

Kemudian pilih salah satu templat, dan pilih opsi untuk membuat file baru dengan nama shell dan tipe .php

![](/images/daily-bugle/faf0aa12f086.png)

![](/images/daily-bugle/3084aa4e60c6.png)

![](/images/daily-bugle/438c10d0b4e2.png)

![](/images/daily-bugle/5f23f42d984d.png)

Terakhir, mari kita akses template dan tangkap revshell-nya.

![](/images/daily-bugle/3c0119d1c679.png)

# LinPriv

Kacang polong:

![](/images/daily-bugle/f23eeabc1c47.png)

Dari linpeas kita menemukan bahwa ada kata sandi di salah satu file config.php, mari kita coba menggunakannya untuk login ssh sebagai **jjameson** untuk memeriksa apakah kata sandi tersebut valid atau tidak.

![](/images/daily-bugle/be48b29bcf4c.png)

sekarang kita mendapatkan kredensial yang valid `jjameson : nv5uz9r3ZEDzVjNu` sekarang mari kita lakukan eskalasi hak akses lagi ke pengguna root. enumerasi dimulai dari yang dasar `sudo -l`

![](/images/daily-bugle/c7cd3182e76d.png)

Kita tahu yum memiliki akses sudo, jadi mari kita periksa di gtfobin.

![](/images/daily-bugle/782362951643.png)

Oke, setelah itu mari kita ulangi dengan cara yang sama seperti yang dijelaskan oleh gtfobin.

![](/images/daily-bugle/8cf6de963a7d.png)

Voila, kita berhasil mendapatkan akses root.

![](/images/daily-bugle/6c2657781a6d.png)
