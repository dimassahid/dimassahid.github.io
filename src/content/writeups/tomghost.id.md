---
title: "tomghost"
description: "Enum Port 8080 - Http Dirsearch kita tidak menemukan hal menarik di dalam port ini jadi kita pindah ke port lain Port 8009 - ajp13 mencari exploit terkait dengan kata kunci ajp"
lang: "id"
translationKey: "tomghost"
category: "lab-writeups"
tags: ["Lab", "tomghost", "ajp", "crack PGP", "crack asc", "sudo zip", "Linux", "Easy"]
publishDate: "2025-08-16"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2515fca1-ed80-8012-939c-cab761291762"
notionUrl: "https://app.notion.com/p/tomghost-2515fca1ed808012939ccab761291762"
notionLastEdited: "2025-08-18T23:59:00.000Z"
---

# Enum

![](/images/tomghost/7577721805f9.png)

## Port 8080 - Http

![](/images/tomghost/801e19ef9bd1.png)

**Pencarian Langsung**

![](/images/tomghost/928822afda86.png)

Tidak ada hal menarik di pelabuhan ini, jadi kami pindah ke pelabuhan lain.

## Port 8009 - ajp13

Cari exploit terkait dengan kata kunci **ajp** service dan salin skrip exploit tersebut ke lokal Anda.

![](/images/tomghost/8e372fe2e257.png)

![](/images/tomghost/3cc5600316e0.png)

Setelah memeriksa skrip eksploitasi, kami menjalankan skrip tersebut menggunakan python2 dan hasilnya adalah kredensial yang dapat kami gunakan nanti.

![](/images/tomghost/f517534dc3a6.png)

lalu kita menggunakan kredensial (`skyfuck:8730281lkjlkjdqlksalks`) untuk login ssh voila kita mendapatkan user.txt

![](/images/tomghost/5cee50c87f52.png)

# LinPriv

## Privasi Horizontal

Setelah menelusuri kacang polong, kami tidak menemukan sesuatu yang menarik.

![](/images/tomghost/505309791c43.png)

Jadi saya mencari kemungkinan lain dan menemukan ada file .pgp & .asc di dalam direktori skyfuck.

File credential.pgp tidak dapat dibaca dalam format yang mudah dibaca, dan tryhackme.asc berisi kunci privat PGP, jadi kami memindahkan kedua file tersebut ke penyimpanan lokal kami.

![](/images/tomghost/efa1809ecbd4.png)

![](/images/tomghost/37d719390823.png)

Untuk memahami cara menggunakan kedua file tersebut, kami menemukan sesuatu di internet yang memberi tahu kami untuk melakukan sesuatu seperti ini [https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key](https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key). Jadi, kita dapat mencoba melakukan hal yang sama dengan terlebih dahulu mengimpor kunci ASC dan kemudian mendekripsi file PGP.

![](/images/tomghost/435063e8a14b.png)

Jadi, di sini kita telah mengimpor kunci `tryhakme.asc` dan selanjutnya kita mendekripsi file `credential.pgp`, tetapi di sini diminta frasa sandi yang tidak kita ketahui. Jadi, kita perlu menemukan file untuk mengekstrak frasa sandi dari salah satu dari dua file `ASC` atau `PGP`.

Setelah melakukan pencarian di Google, saya menemukan artikel ini ](https://www.ubuntuvibes.com/2012/10/recover-your-gpg-passphrase-using-john.html) yang menjelaskan bagaimana kita dapat mengekstrak frasa sandi dari kunci `ASC` dengan terlebih dahulu mengubahnya menjadi hash yang dapat dipahami oleh `john` dan kemudian mengekstrak frasa sandi dari hash tersebut menggunakan `john`.
jalankan `gpg2john` pada file ASC dan ubah menjadi hash yang dapat dipahami oleh `john`.

```bash
#Convert tryhackme.asc become john format encrypt
gpg2john tryhackme.asc > hash

#crack tryhackme.asc using john
john --format=gpg --wordlist=/usr/share/wordlists/seclists/Passwords/darkc0de.txt hash
```

![](/images/tomghost/233c6fae2beb.png)

Jadi, `john` telah memberi kita kata sandi yang dapat kita gunakan untuk mendekripsi file `credential.pgp`. Sekarang, kita dapat kembali ke mesin target dan mendekripsi file PGP.

![](/images/tomghost/39f63d2f77ec.png)

Oke, sekarang kita mendapatkan kredensial baru yaitu kredensial pengguna merlin, `merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j`. Masuk ke pengguna merlin, lalu kita menemukan bahwa pengguna merlin memiliki akses sudo untuk menggunakan zip. Ini dapat digunakan untuk menjadi pengguna root.

![](/images/tomghost/e3fea45c4110.png)

## Privasi Vertikal

GtfoBin:

![](/images/tomghost/dd326dd212df.png)

Jalankan perintah tersebut, lalu voila, Anda mendapatkan pengguna root dan flag:

```bash
sudo zip mktemp -u /etc/hosts -T -TT 'sh #'
```

![](/images/tomghost/4cfaaf93ca74.png)

Referensi:

- [https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key](https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key)
