---
title: "Wonderland"
description: "Enum Port 80 - http Mengakses port Dirsearch: periksa halaman satu per satu dan kita mendapatkan sesuatu yang menarik di halaman /r, ini memberi tahu kita untuk terus maju jadi mari kita lakukan dirsearch lagi di /r"
lang: "id"
translationKey: "wonderland"
category: "lab-writeups"
tags: ["Lab", "hard-dirsearch", "sudo as other user", "privesc-modify-module-python", "privesc-modify-binary-and-path-environment", "privesc-perl-capabilities", "Linux", "Medium"]
publishDate: "2025-08-31"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2605fca1-ed80-8096-be90-c7034a74932a"
notionUrl: "https://app.notion.com/p/Wonderland-2605fca1ed808096be90c7034a74932a"
notionLastEdited: "2025-09-02T14:04:00.000Z"
---

# Enum

![](/images/wonderland/2eb497f7690a.png)

## Port 80 - http

Mengakses pelabuhan

![](/images/wonderland/b3c05cff9ee2.png)

Dirsearch:

![](/images/wonderland/d53fc6d6bfc6.png)

periksa halaman satu per satu dan kita menemukan sesuatu yang menarik di halaman `/r`

![](/images/wonderland/3d3c0677a68a.png)

Ini menyuruh kita untuk terus maju, jadi mari kita lakukan dirsearch lagi di halaman /r.

![](/images/wonderland/1561242d7825.png)

![](/images/wonderland/bd05048ae16d.png)

Terus lakukan riset lagi sampai kita mendapatkan sesuatu seperti halaman ini /r/a/b/b/i/t yang tidak menyuruh kita untuk terus melanjutkan.

![](/images/wonderland/59df6f64573a.png)

![](/images/wonderland/8ee8f6ca655c.png)

Jika kita tidak menemukan sesuatu, mari kita periksa kode sumber situs web dengan menekan CTRL + U.

![](/images/wonderland/df553cb78b75.png)

Sekarang kita sudah mendapatkan kredensial Alice (`alice:HowDothTheLittleCrocodileImproveHisShiningTail`), mari kita masuk ke SSH menggunakan kredensial tersebut.

## Port 22 - ssh

![](/images/wonderland/025c741723d2.png)

Kita punya user.txt di direktori root, ini lucu banget.

![](/images/wonderland/fe7273474028.png)

# LinPriv

## Linpriv menjadi pengguna kelinci

Setelah masuk sebagai Alice, kami mendapatkan skrip menarik di direktori, yaitu `walrus_and_the_carpenter.py`

![](/images/wonderland/f220cd1e3692.png)

Kemudian setelah melakukan enumerasi dasar, kami menemukan bahwa kami dapat menjalankan skrip menggunakan sudo sebagai pengguna rabbit.

![](/images/wonderland/35e6905df453.png)

Setelah memeriksa skrip, kami menemukan bahwa skrip tersebut mengimpor modul random, jadi mari kita periksa apakah kita dapat memodifikasi [random.py](http://random.py/) di dalam direktori python3.6

```javascript
python3 -c 'import sys; print(sys.path)' 
```

![](/images/wonderland/17492cc943b9.png)

![](/images/wonderland/fc0a490abf06.png)

kita tidak memiliki akses tulis pada [random.py](http://random.py/) jadi mari kita cari cara lain

![](/images/wonderland/95274b49a2b8.png)

Kita dapat memanfaatkan ini dengan membuat file [random.py](http://random.py/) di direktori saat ini. Dengan melakukan itu, [random.py](http://random.py/) akan dimuat sebagai pengganti modul random yang sebenarnya. Di dalam [random.py](http://random.py/), masukkan skrip berikut:

![](/images/wonderland/371a0336cefc.png)

Setelah membuat skrip [random.py](http://random.py/) dan menjalankan skrip walrus_and_the_carpenter.py, pengguna kita langsung beralih ke pengguna rabbit.

![](/images/wonderland/442d816d8ef9.png)

## Linpriv menjadi pengguna hatter

di direktori rabbit kami menemukan ada program `teaParty` yang memiliki Izin SUID

![](/images/wonderland/84871dbdfa3b.png)

Setelah memeriksa program menggunakan Ghidra, kami menemukan bahwa program tersebut menggunakan perintah **date** (biner date) di dalam program, meskipun tampaknya tidak menggunakan jalur absolut, sehingga kita dapat mengeksploitasinya dengan membuat biner "date" dan memodifikasi lingkungan jalur sehingga skrip akan mengeksekusi skrip date yang berbahaya alih-alih yang asli.

Program tersebut menggunakan izin SUID-nya untuk mengubah ID pengguna menjadi hatter.

![](/images/wonderland/e06aceee8322.png)

![](/images/wonderland/ddc83e34e56e.png)

![](/images/wonderland/475266288351.png)

Pertama, ubah path-nya, kita tambahkan direktori /tmp ke dalam $PATH.

![](/images/wonderland/f126dfc14798.png)

Kedua, membuat biner "tanggal" yang berisi kode berikut.

```bash
#!/bin/bash
/bin/bash
#alternative and more stable 
cp /bin/bash /tmp/rf ; chmod +s /tmp/rf 
```

![](/images/wonderland/715671c523e0.png)

Yeay, kita berhasil! Sekarang kita menjadi pengguna Hatter dan di dalam direktori Hatter kita menemukan kata sandi Hatter (`hatter:WhyIsARavenLikeAWritingDesk?`)

![](/images/wonderland/53b3119abb40.png)

## Akses Linpriv ke pengguna root

Dari pengguna hatter, kami menjalankan linpeas dan menemukan kerentanan pada segmen kemampuan menggunakan pearl.

![](/images/wonderland/61f0e5487e27.png)

Berdasarkan gtfobin untuk mengakses shell melalui kemampuan menggunakan pearl, kita dapat menjalankan perintah berikut.

```bash
perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'
```

![](/images/wonderland/a2365c17fc46.png)

## **Tidak disengaja:**

Saat menjalankan linpeas, kami menemukan bahwa target kami rentan terhadap serangan pwnkit, jadi saya menjalankan skrip tersebut dan saya mendapatkan hal yang menakjubkan seperti itu.

![](/images/wonderland/af143551333a.png)

![](/images/wonderland/f588ad0fcd74.png)
