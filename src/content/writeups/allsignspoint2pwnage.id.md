---
title: "AllSignsPoint2Pwnage"
description: "Enumerasi Port 139 & 445 - SMB Pertama-tama kita melakukan enumerasi pada layanan SMB menggunakan smbmap tanpa kredensial yang diberikan, kita tidak mendapatkan apa pun, jadi mari kita berikan kredensial anonim untuk melihat hasilnya."
lang: "id"
translationKey: "allsignspoint2pwnage"
category: "lab-writeups"
tags: ["Lab", "SMB share with write access", "password user in local", "Seimpersonate", "Printspoofer", "Windows", "Medium"]
publishDate: "2025-09-24"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2785fca1-ed80-8012-a949-dde83e9f9015"
notionUrl: "https://app.notion.com/p/AllSignsPoint2Pwnage-2785fca1ed808012a949dde83e9f9015"
notionLastEdited: "2025-09-30T12:22:00.000Z"
---

# Enum

```javascript
nmap -Pn -p- <IP> --min-rate 1000
```

![](/images/allsignspoint2pwnage/126f4aafe46e.png)

```javascript
nmap -sCV <IP>
```

![](/images/allsignspoint2pwnage/ba143ef56e5f.png)

## Port 139 & 445 - SMB

Pertama, kita melakukan enumerasi pada layanan SMB menggunakan smbmap.

![](/images/allsignspoint2pwnage/79de851829b1.png)

Tanpa memberikan kredensial apa pun, kita tidak mendapatkan apa pun, jadi mari kita berikan kredensial anonim untuk melihat hasilnya.

![](/images/allsignspoint2pwnage/2574dfa94883.png)

Dari enumerasi kita, kita mendapatkan akses tulis pada folder bersama images$, jadi mari kita coba mengunggah revshell kita ke folder bersama tersebut. Pada port 443, kita melihat bahwa aplikasi tersebut menggunakan PHP, jadi untuk hasil yang sesuai, kita perlu mengunggah revshell PHP ke folder bersama tersebut.

revshell.php kami

![](/images/allsignspoint2pwnage/5a1f548c2eb4.png)

Masuk ke folder bersama dan unggah file revshell.php kami.

![](/images/allsignspoint2pwnage/b02c33d95725.png)

lalu mengakses revshell kami melalui port 443

## Port 443 - http

Saat mengakses port 443, kami mendapatkan aplikasi seperti ini:

![](/images/allsignspoint2pwnage/44a76e25044d.png)

Kemudian kita menganalisis kode sumbernya, dalam kode sumber kita tahu bahwa aplikasi tersebut dibangun menggunakan PHP, dan menjalankan content.php serta mengambil gambar dari halaman gambar.

![](/images/allsignspoint2pwnage/4cc3d3992725.png)

Jadi mari kita kunjungi halaman gambar, kita menemukan file revshell.php kita.

![](/images/allsignspoint2pwnage/2ec4f474be4c.png)

lalu kita mengaksesnya untuk memicu revshell kita.

![](/images/allsignspoint2pwnage/a0f873316c82.png)

lalu kami mendapatkan bendera pertama kami

![](/images/allsignspoint2pwnage/5aeefbee60df.png)

# Winpriv

Kami melakukan enumerasi pada pengguna yang kami miliki, yaitu sign. Kami mendapatkan kata sandi pengguna tersebut.

```javascript
reg query "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon"
```

![](/images/allsignspoint2pwnage/579c7645eab4.png)

Kemudian setelah berkeliling, kami mendapatkan kata sandi administrator di dalam folder instalasi (installs share). Folder instalasi (installs share) adalah folder yang kami temukan sebelumnya pada enumerasi pertama ($install).

![](/images/allsignspoint2pwnage/328844b7f858.png)

Setelah mendapatkan kata sandi administrator, kami tidak dapat membobolnya, jadi kami mencari cara lain. Dengan melakukan enumerasi, kami mendapatkan kata sandi VNC di dalam file .ini.

![](/images/allsignspoint2pwnage/2f46662a4dd9.png)

Untuk mendekripsi kata sandi, saya menggunakan Google sebagai sumber saya.

![](/images/allsignspoint2pwnage/2a528fa5477a.png)

![](/images/allsignspoint2pwnage/6b306f88fe00.png)

Kami menemukan perintah satu baris untuk mendekripsinya, jadi mari kita gunakan untuk mendekripsi kedua hash tersebut, lalu kita mendapatkan hasil akhir seperti ini.

![](/images/allsignspoint2pwnage/731b16694754.png)

Setelah mencoba berbagai kata sandi, tetapi tidak berhasil sama sekali untuk masuk sebagai administrator, saya mencari cara lain dan menemukan bahwa pengguna kami memiliki kerentanan seimpersonate saat menjalankan perintah whoami /priv.

![](/images/allsignspoint2pwnage/5b84c83aa6f1.png)

Jadi, kami mentransfer printspoofer melalui SMB karena jika kami mentransfernya langsung ke folder kami, kami tidak memiliki akses.

![](/images/allsignspoint2pwnage/265f85aa91fc.png)

Setelah transfer file berhasil, jalankan printspoofer.exe untuk mendapatkan hak akses administrator.

![](/images/allsignspoint2pwnage/7f7253d5f537.png)

Yey, sekarang kita bisa mengakses flag administrator.

![](/images/allsignspoint2pwnage/224d8af44b8a.png)

Ini membuktikan bahwa kita tidak dapat mengunduh file langsung ke direktori kita yang memiliki akses umum sebagai pengguna.

![](/images/allsignspoint2pwnage/94637cff8144.png)
