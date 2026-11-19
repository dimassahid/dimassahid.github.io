---
title: "Blueprint"
description: "Enumerasi Port 443 - https pada port 443 kita melihat bahwa kita memiliki aplikasi oscommerce versi 2.3.4 tetapi ketika kita membukanya kita hanya melihat aplikasi scratch di dalamnya. jadi dari pengetahuan itu kita"
lang: "id"
translationKey: "blueprint"
category: "lab-writeups"
tags: ["Lab", "oscommerce versi 2.3.4", "Dump hash mimikatz", "Windows", "Easy"]
publishDate: "2025-09-14"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "26e5fca1-ed80-806e-81e8-d3db78e817b4"
notionUrl: "https://app.notion.com/p/Blueprint-26e5fca1ed80806e81e8d3db78e817b4"
notionLastEdited: "2025-09-24T00:26:00.000Z"
---

# Enum

![](/images/blueprint/6e6bbce07a77.png)

![](/images/blueprint/54641276346f.png)

## Port 443 - https

![](/images/blueprint/e04e0d7b0f59.png)

Di port 443, kita melihat ada aplikasi oscommerce versi 2.3.4, tetapi ketika kita membukanya, kita hanya melihat aplikasi scratch di dalamnya.

![](/images/blueprint/979d299e83fa.png)

Jadi, berdasarkan pengetahuan tersebut, kami mencari celah keamanan publik menggunakan SearchSploit berdasarkan aplikasi yang terpasang di server (oscommerce).

![](/images/blueprint/e20ea834145a.png)

Kami memilih untuk mencoba kedua eksploitasi RCE.

![](/images/blueprint/977798c29c03.png)

Pada skrip eksploitasi pertama, kami mendapatkan upaya gagal karena target kami menggunakan https, jadi kami perlu memodifikasi skrip kami pada baris permintaan POST agar memiliki `verify=false` .

![](/images/blueprint/6b8c431d2c15.png)

![](/images/blueprint/bde77a84077f.png)

jalankan kode setelah dimodifikasi

![](/images/blueprint/39c98cf0e289.png)

![](/images/blueprint/9f86b56579f5.png)

Skrip tersebut tidak dapat digunakan karena server mematikan perintah system(), jadi mari kita beralih ke skrip kedua.

![](/images/blueprint/901054cf57c1.png)

Dengan menggunakan skrip eksploitasi kedua, kita berhasil mendapatkan webshell, mari kita tingkatkan menjadi revshell. Pertama, kita buat file .exe berbahaya dan transfer ke server target.

![](/images/blueprint/88d0b7c76359.png)

![](/images/blueprint/c8d7e8b26ebc.png)

![](/images/blueprint/c40874c8fb1f.png)

Karena kita sudah masuk sebagai pengguna sistem, jadi mari kita dapatkan hak akses administrator.

![](/images/blueprint/fe28317d5f6d.png)

Tugas terakhir yang perlu kita lakukan adalah mendapatkan hash NTLM dari pengguna. Jadi, mari kita transfer mimikat berdasarkan arsitektur (x68) untuk mendapatkan hash NTLM.

![](/images/blueprint/258ef50a40a2.png)

![](/images/blueprint/ee591dac0b46.png)

Setelah mendapatkan hash NTLM, mari kita pecahkannya menggunakan hashcat.

```bash
hashcat -m 1000 blue.hash /usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords.txt --force
```

![](/images/blueprint/780867cc7ef4.png)

Voila, kita berhasil membobol kata sandi (Google Plus)
