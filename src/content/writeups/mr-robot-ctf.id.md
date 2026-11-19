---
title: "Mr Robot CTF"
description: "InfoGath Nmap : Port 80 Port 443 Dirsearch : Kunci 1 masuk ke /fsocity.dic mengunduh file kamus bernama fsocity.dic masuk ke /license.txt dan kita mendapatkan sesuatu yang menarik."
lang: "id"
translationKey: "mr-robot-ctf"
category: "lab-writeups"
tags: ["Lab", "Wordpress", "SUID-Nmap", "Linux"]
publishDate: "2025-01-08"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1755fca1-ed80-8030-ae43-d148ecbe3ee7"
notionUrl: "https://app.notion.com/p/Mr-Robot-CTF-1755fca1ed808030ae43d148ecbe3ee7"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# InfoGath

Nmap:

![](/images/mr-robot-ctf/67e79c0dde13.png)

## Pelabuhan 80

![](/images/mr-robot-ctf/189f3131385f.png)

## Pelabuhan 443

![](/images/mr-robot-ctf/8718a39bc3f8.png)

Dirsearch :

```bash
dirsearch -u https://10.10.120.0/ -x 403,404,400

OUTPUT :                                                               
[12:50:06] 200 -    0B  - /favicon.ico                                      
[12:50:28] 200 -  158B  - /license.txt                                      
[12:50:28] 200 -  158B  - /license                                          
[12:50:29] 200 -  504KB - /intro                                            
[12:51:06] 200 -   64B  - /readme                                           
[12:51:06] 200 -   64B  - /readme.html                                      
[12:51:09] 200 -   41B  - /robots.txt                                       
[12:51:17] 200 -    0B  - /sitemap                                          
[12:51:17] 200 -    0B  - /sitemap.xml
[12:51:17] 200 -    0B  - /sitemap.xml.gz
[12:51:46] 200 -   21B  - /wp-admin/admin-ajax.php                          
[12:51:46] 200 -    0B  - /wp-config.php                                    
[12:51:47] 200 -    0B  - /wp-content/                                      
[12:51:47] 200 -    0B  - /wp-content/plugins/google-sitemap-generator/sitemap-core.php                                                                                   
[12:51:48] 200 -    0B  - /wp-cron.php                                      
[12:51:48] 200 -    1KB - /wp-login                                         
[12:51:48] 200 -    1KB - /wp-login/
[12:51:48] 200 -    1KB - /wp-login.php

```

![](/images/mr-robot-ctf/642365b79eb5.png)

# Kunci 1

![](/images/mr-robot-ctf/0f9e0da60b74.png)


masuk ke `/fsocity.dic` mengunduh file kamus bernama `fsocity.dic`

![](/images/mr-robot-ctf/2f821faae3ac.png)

memasuki `/license.txt` dan kami mendapatkan sesuatu yang menarik.

![](/images/mr-robot-ctf/98db6e1c08b7.png)

![](/images/mr-robot-ctf/3356d8961697.png)

kita mendapatkan kredensial `elliot:ER28-0652` mari kita gunakan untuk login di `wp-login.php`

![](/images/mr-robot-ctf/051c6b14aac9.png)

![](/images/mr-robot-ctf/839a49974c86.png)

## Manfaatkan WordPress

Buka Tampilan > Editor > 404.php lalu edit bagian yang berisi menjadi revshell kita seperti ini.

![](/images/mr-robot-ctf/fb5d9e51194b.png)

dan mengakses halaman untuk memicu revshell kami.

![](/images/mr-robot-ctf/530c050e9bde.png)

lalu kami mendapatkan kredensial di sini dari pengguna `robot : abcdefghijklmnopqrstuvwxyz`

![](/images/mr-robot-ctf/9f70121baaa5.png)

![](/images/mr-robot-ctf/5a09d6266af2.png)

Kemudian kita mengubah pengguna menjadi robot dan melakukan peningkatan hak akses untuk menjadi pengguna root.

![](/images/mr-robot-ctf/a292046c0c7c.png)

# Kunci 2

![](/images/mr-robot-ctf/40c6dd950f86.png)

# LinPriv

Mencari file SUID secara manual

![](/images/mr-robot-ctf/80ccd02d8d79.png)

![](/images/mr-robot-ctf/b1a3c600c4ed.png)

Oke, jadi mari kita coba opsi b), dengan memulai sesi interaktif di Nmap dan mencoba mengeksekusi shell.

# Kunci 3

![](/images/mr-robot-ctf/18a5f52be6bb.png)
