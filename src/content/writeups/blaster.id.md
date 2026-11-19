---
title: "Blaster"
description: "Enum Port 80 Dirsearch lalu mari kita akses halaman /retro kita perhatikan bahwa kita memiliki halaman login di bagian bawah halaman, jadi mari kita periksa itu kita melihat bahwa kita memiliki halaman login dari"
lang: "id"
translationKey: "blaster"
category: "lab-writeups"
tags: ["Lab", "Wordpress", "CVE-2019-1388", "Certificate Dialog Privesc", "Windows", "Easy"]
publishDate: "2025-06-08"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "20c5fca1-ed80-80ac-b1b2-cff888253ecd"
notionUrl: "https://app.notion.com/p/Blaster-20c5fca1ed8080acb1b2cff888253ecd"
notionLastEdited: "2025-09-11T04:18:00.000Z"
---

# Enum

![](/images/blaster/18578f736e6f.png)

## Pelabuhan 80

![](/images/blaster/5d66fca66273.png)

Dirsearch

![](/images/blaster/fe95a0e17be7.png)

lalu mari kita akses halaman /retro

![](/images/blaster/14494ff4e76a.png)

Kita perhatikan bahwa kita memiliki halaman login di bagian bawah halaman, jadi mari kita periksa.

![](/images/blaster/6d6a42c31a24.png)

Kita melihat bahwa kita memiliki halaman login WordPress dan di halaman sebelumnya kita menemukan nama yang mencurigakan yaitu **wade**. Jadi mari kita coba melakukan brute force pada halaman login dengan **wade** sebagai nama pengguna.

Kemudian kita menggunakan kembali kredensial tersebut untuk masuk ke server melalui RDP.

![](/images/blaster/bed83e48c2e4.png)

Oke, setelah masuk ke server, mari kita lakukan enumerasi untuk melakukan peningkatan hak akses.

# WinPriv

Kami menemukan file .exe yang menarik di desktop, lalu kami mencari di Google apa itu, dan hasilnya menunjukkan bahwa file tersebut memiliki korelasi dengan **CVE-2019-1388.**

![](/images/blaster/2ea4c75c114e.png)

Jadi mari kita eksploitasi, pertama klik hhupd.exe > saat dialog muncul > pilih opsi tampilkan detail selengkapnya > tampilkan informasi tentang sertifikat penerbit > klik tautan di "dikeluarkan oleh" > saat opsi browser muncul > pilih browser Anda

![](/images/blaster/f7554b5083a4.png)

![](/images/blaster/05874f4fb643.png)

Saat browser Anda terbuka dan Anda mencoba membuka tautan tersebut, tekan CTRL + S dan jalankan cmd atau powershell, lalu voila, kita mendapatkan pengguna administrator.

![](/images/blaster/0598f0ec3aab.png)

# Langkah Tambahan Selanjutnya

menjalankan ini menggunakan hak akses administrator

![](/images/blaster/8c7a91339707.png)

lalu jalankan perintah `run -j` maka Anda akan mendapatkan payload powershell.exe yang dihasilkan……… lalu jalankan di cmd administrator, voila kita mendapatkan sesi dengan akses administrator.

![](/images/blaster/bace4fa3d852.png)

menggunakan perintah `run persistence -X` untuk secara otomatis membuat sesi saat agen dihidupkan ulang
