---
title: "Internal"
description: "Enum Nmap: Port 80 Dirsearch: kami menemukan bahwa di server terdapat aplikasi Wordpress jadi kami memindainya menggunakan alat wpscan kami menemukan pengguna jadi pertama-tama mari kita lakukan brute force. kami"
lang: "id"
translationKey: "internal"
category: "lab-writeups"
tags: ["Lab", "Unique Case Linpriv", "ssh-tunneling", "Wordpress", "Jenkins-localhost", "Linux", "Hard"]
publishDate: "2024-12-25"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1675fca1-ed80-80cc-8e3f-cd217dd047b8"
notionUrl: "https://app.notion.com/p/Internal-1675fca1ed8080cc8e3fcd217dd047b8"
notionLastEdited: "2025-10-13T16:07:00.000Z"
---

# Enum

Nmap:

![](/images/internal/6bd2e506e2c6.png)

## Pelabuhan 80

![](/images/internal/6729b2614dd0.png)

Dirsearch :

![](/images/internal/46b8b760d1df.png)

![](/images/internal/5a5f258d927f.png)

![](/images/internal/f25348f64bb5.png)

Kami menemukan bahwa di server tersebut terdapat aplikasi WordPress, jadi kami memindainya menggunakan alat wpscan.

```bash
wpscan --url http://10.10.159.81/blog/  -e --api-token HgrZozFw3YMdEMsOCxIWuKSZtsaGSti6l7qi4iLsaI0
```

![](/images/internal/cdfde20554b3.png)

Kami menemukan pengguna tersebut, jadi pertama-tama mari kita lakukan serangan brute force.

```bash
wpscan --url http://internal.thm/blog -U admin -P /usr/share/wordlists/rockyou.txt
```

![](/images/internal/232e1faf2ba3.png)

Kami menemukan kredensial yang valid `admin : my2boys`, jadi mari kita masuk dan melakukan eksploitasi untuk membuat revshell.

Pada tahap eksplorasi, kami menemukan sesuatu yang menarik di menu postingan, kami menemukan kredensial, mari kita simpan untuk digunakan nanti.

![](/images/internal/50abdde806bb.png)

Oke, setelah beberapa kali mencoba menggunakan kredensial yang telah kita temukan di bagian atas, kita tidak mendapatkan hasil apa pun, jadi mari kita coba membuat revshell dengan mengakses menu theme editor.

![](/images/internal/a35a2bc36c3c.png)

Ubah isi file 404.php menjadi revshell kita.

![](/images/internal/550d802a8220.png)

lalu mengakses tema untuk memicu revshell dan voila, kita mendapatkan revshell.

```bash
http://internal.thm/blog/wp-content/themes/twentyseventeen/404.php
```

![](/images/internal/891b746c4edf.png)

# Linpriv

Kacang polong:

![](/images/internal/8833480cf6dc.png)

Kita menemukan sesuatu yang menarik di sini, mari kita periksa lebih lanjut.

![](/images/internal/b657381452f6.png)

Wow, kita menemukan kredensial Aubreanna `aubreanna:bubb13guM!@#123`, mari kita coba menggunakannya untuk login.

![](/images/internal/5b7ede43e7ca.png)

![](/images/internal/1e4add1b2ab5.png)

Di akun pengguna aubreanna, kami menemukan file menarik, yaitu jenkins.txt, dan ketika kami membuka file tersebut, kami melihat bahwa file itu menjelaskan di mana layanan Jenkins berjalan, yaitu Jenkins berjalan di [localhost](http://localhost/) port 8080.

![](/images/internal/3238a4975f1a.png)

![](/images/internal/a4755d790a04.png)

## Port 8080

Jadi, mari kita lihat Jenkins di localhost port 8080 dengan melakukan tunneling menggunakan SSH.

```bash
ssh -L 8080:127.0.0.1:8080 aubreanna@10.10.38.172 
```

![](/images/internal/ef9ef9c40ee0.png)

Saat kami menemukan halaman login Jenkins, kami mencoba melakukan serangan brute force menggunakan Hydra.

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt 127.0.0.1 -s 8080 http-post-form "/j_acegi_security_check:j_username=^USER^&j_password=^PASS^&from=%2F&Submit=Sign+in:Invalid username or password"
```

![](/images/internal/9c31b08a87ad.png)

Setelah melakukan brute force, kita mendapatkan kredensial yang valid `admin : spongebob` mari kita gunakan untuk login ke Jenkins dan mencari cara untuk membuat revshell.

![](/images/internal/9e4e0ea761aa.png)

![](/images/internal/757fb587fa1d.png)

Setelah menjalankan linpeas untuk melakukan enumerasi guna meningkatkan hak akses menjadi pengguna root, kami menemukan sesuatu yang menarik di "/opt", mari kita periksa ini.

![](/images/internal/48cdb536f2bb.png)

![](/images/internal/3eb8317dfadc.png)

Yey, kita sudah menemukan kredensial root! Mari kita gunakan di SSH untuk mengganti pengguna menjadi pengguna root dan mendapatkan flag.

![](/images/internal/a990757b7e39.png)
