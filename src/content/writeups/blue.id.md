---
title: "Blue"
description: "Pemindaian kerentanan Enum Port 139&445 - SMB dari pemindaian nmap, kami melihat bahwa target kami teridentifikasi terpengaruh oleh kerentanan ms17-010, tetapi ketika kami melakukan enumerasi smbshare"
lang: "id"
translationKey: "blue"
category: "lab-writeups"
tags: ["Lab", "MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption", "Windows", "Easy"]
publishDate: "2025-06-12"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2105fca1-ed80-80e7-9fe7-e7cf8393bafa"
notionUrl: "https://app.notion.com/p/Blue-2105fca1ed8080e79fe7e7cf8393bafa"
notionLastEdited: "2025-06-15T08:37:00.000Z"
---

# Enum

```bash
nmap -Pn -sCV 10.10.27.16
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-12 22:03 WIB
Nmap scan report for 10.10.27.16 (10.10.27.16)
Host is up (0.25s latency).
Not shown: 992 closed tcp ports (reset)
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49158/tcp open  msrpc        Microsoft Windows RPC
49160/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: JON-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2025-06-12T15:04:31
|_  start_date: 2025-06-12T15:02:33
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: Jon-PC
|   NetBIOS computer name: JON-PC\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2025-06-12T10:04:31-05:00
|_clock-skew: mean: 1h40m04s, deviation: 2h53m12s, median: 3s
|_nbstat: NetBIOS name: JON-PC, NetBIOS user: <unknown>, NetBIOS MAC: 02:3f:cb:81:dc:9b (unknown)
| smb2-security-mode: 
|   2:1:0: 
|_    Message signing enabled but not required
```

pemindaian kerentanan

```bash
nmap -Pn -p135,139,445,49152-49160 --script vuln 10.10.27.16
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-12 22:08 WIB
Nmap scan report for 10.10.27.16
Host is up (0.23s latency).

PORT      STATE  SERVICE
135/tcp   open   msrpc
139/tcp   open   netbios-ssn
445/tcp   open   microsoft-ds
49152/tcp open   unknown
49153/tcp open   unknown
49154/tcp open   unknown
49155/tcp closed unknown
49156/tcp closed unknown
49157/tcp closed unknown
49158/tcp open   unknown
49159/tcp closed unknown
49160/tcp open   unknown

Host script results:
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_smb-vuln-ms10-054: false
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
```

## Port 139 & 445 - SMB

Dari hasil pemindaian nmap, kami melihat bahwa target kami teridentifikasi terpengaruh oleh kerentanan ms17-010, tetapi ketika kami melakukan enumerasi smbshare, kami tidak mendapatkan file share apa pun dan anehnya kami dapat masuk ke SMB jika kami tidak memberikan nama pengguna atau kata sandi, tetapi ketika kami memberikan nama pengguna acak, login kami menjadi tidak tersedia.

![](/images/blue/2ca71a37b6ea.png)

![](/images/blue/d1059e6dc274.png)

![](/images/blue/fb9ffec3ea6e.png)

Selanjutnya, mari kita cari skrip eksploitasi di Google untuk memvalidasi kerentanan ms17-010 yang teridentifikasi dalam pemindaian nmap. Pertama, mari kita uraikan apa yang kita dapatkan dari enumerasi kita.

- Sistem operasi mesin kami adalah Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
- rentan pada MS17-010
- Arsitektur Windows adalah 64 bit.
# MS17-010

## Manual

Pertama-tama, mari kita cari skrip eksploitasi kerentanan MS17-010 di Google dan kami menemukannya di GitHub.

[https://github.com/d4t4s3c/Win7Blue](https://github.com/d4t4s3c/Win7Blue)

![](/images/blue/f1cf916175ca.png)

Terlihat bagus, oke, mari kita jalankan.

Pada percobaan pertama kami gagal karena kami tidak mendapatkan revshell seperti yang kami inginkan, kemudian saya memodifikasi skrip untuk mengubah nilai numGroomConn menjadi 17, nilai defaultnya adalah 13. Dan voila, kami berhasil mendapatkan revshell sebagai administrator sistem yang berarti ms17-010 (eternal blue) berhasil mengeksploitasi.

![](/images/blue/d876503a21bb.png)

## Metasploit

Dari langkah enumerasi, kita tidak mendapatkan informasi apa pun seperti akun yang valid, hanya otentikasi anonim. Kita juga tidak memiliki nama file share dan nama pipe, jadi kemungkinan besar ini adalah MS17-010 tanpa nama pipe, yang berarti hanya bergantung pada kerusakan memori (MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption). Mari kita cari tahu menggunakan Metasploit.

```bash
use exploit/windows/smb/ms17_010_eternalblue
```

![](/images/blue/c82de8e63b44.png)

jalankan exploit

![](/images/blue/e213abc24287.png)
