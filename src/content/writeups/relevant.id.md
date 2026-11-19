---
title: "Relevant"
description: "Enumerasi Nmap: Port 139 & 445 SMB Pemindaian Nmap: dari pemindaian kita mendapatkan file menarik yaitu passwords.txt, mari kita unduh dan buka file tersebut. Setelah membuka file, kita melihat bahwa"
lang: "id"
translationKey: "relevant"
category: "lab-writeups"
tags: ["Lab", "Unique Case SMB", "Printspoofer", "Seimpersonate", "SMB share with write access", "Windows"]
publishDate: "2024-12-24"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1665fca1-ed80-801c-a962-fcbd796c9313"
notionUrl: "https://app.notion.com/p/Relevant-1665fca1ed80801ca962fcbd796c9313"
notionLastEdited: "2025-07-12T08:57:00.000Z"
---

# Enum

Nmap:

```bash
PORT      STATE SERVICE       VERSION
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds  Windows Server 2016 Standard Evaluation 14393 microsoft-ds
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: RELEVANT
|   NetBIOS_Domain_Name: RELEVANT
|   NetBIOS_Computer_Name: RELEVANT
|   DNS_Domain_Name: Relevant
|   DNS_Computer_Name: Relevant
|   Product_Version: 10.0.14393
|_  System_Time: 2024-12-24T01:46:18+00:00
| ssl-cert: Subject: commonName=Relevant
| Not valid before: 2024-12-23T01:38:43
|_Not valid after:  2025-06-24T01:38:43
|_ssl-date: 2024-12-24T01:46:58+00:00; +38s from scanner time.
49663/tcp open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
|_http-server-header: Microsoft-IIS/10.0
49667/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows

Host script results:
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard Evaluation 14393 (Windows Server 2016 Standard Evaluation 6.3)
|   Computer name: Relevant
|   NetBIOS computer name: RELEVANT\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2024-12-23T17:46:21-08:00
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 1h36m39s, deviation: 3h34m41s, median: 38s
| smb2-time: 
|   date: 2024-12-24T01:46:22
|_  start_date: 2024-12-24T01:38:57
```

## Port 139 & 445 (SMB)

Pemindaian Nmap:

```bash
nmap --script smb-* -p139,445 10.10.185.81

OUTPUT :
Host script results:
|_smb-vuln-ms10-054: false
| smb-enum-shares: 
|   account_used: guest
|   \\10.10.185.81\ADMIN$: 
|     Type: STYPE_DISKTREE_HIDDEN
|     Comment: Remote Admin
|     Anonymous access: <none>
|     Current user access: <none>
|   \\10.10.185.81\C$: 
|     Type: STYPE_DISKTREE_HIDDEN
|     Comment: Default share
|     Anonymous access: <none>
|     Current user access: <none>
|   \\10.10.185.81\IPC$: 
|     Type: STYPE_IPC_HIDDEN
|     Comment: Remote IPC
|     Anonymous access: <none>
|     Current user access: READ/WRITE
|   \\10.10.185.81\nt4wrksv: 
|     Type: STYPE_DISKTREE
|     Comment: 
|     Anonymous access: <none>
|_    Current user access: READ/WRITE
| smb-protocols: 
|   dialects: 
|     NT LM 0.12 (SMBv1) [dangerous, but default]
|     2:0:2
|     2:1:0
|     3:0:0
|     3:0:2
|_    3:1:1
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard Evaluation 14393 (Windows Server 2016 Standard Evaluation 6.3)
|   Computer name: Relevant
|   NetBIOS computer name: RELEVANT\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2024-12-23T18:00:28-08:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb-flood: ERROR: Script execution failed (use -d to debug)
| smb-mbenum: 
|_  ERROR: Call to Browser Service failed with status = 2184
|_smb-print-text: false
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
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
| smb-brute: 
|_  guest:<blank> => Valid credentials
| smb-ls: Volume \\10.10.185.81\nt4wrksv
| SIZE   TIME                 FILENAME
| <DIR>  2020-07-25T15:10:05  .
| <DIR>  2020-07-25T15:10:05  ..
| 98     2020-07-25T15:13:05  passwords.txt
|_
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)
| smb-enum-sessions: 
|_  <nobody>
|_smb-system-info: ERROR: Script execution failed (use -d to debug)
```

Dari hasil pemindaian, kita mendapatkan sebuah file menarik bernama passwords.txt. Mari kita unduh dan buka file tersebut.

![](/images/relevant/a9d5d2f38d62.png)

buka file

![](/images/relevant/5191c1ade17f.png)

Kita melihat ada kata sandi yang dienkode dengan base64, mari kita retas menggunakan Cyberchef.

![](/images/relevant/47a438511ef8.png)

Jadi kami mendapatkan 2 kredensial:

```bash
Bob : !P@$$W0rD!123
Bill - Juw4nnaM4n420696969!$$$
```

Kami dapat mengakses share SMB `nt4wrksv` melalui webserver dan kami memiliki akses tulis di

![](/images/relevant/131c57a278bd.png)

![](/images/relevant/b445332c31a9.png)

Jadi, mari kita masukkan file berbahaya .aspx untuk membuat revshell.

referensi : [https://github.com/borjmz/aspx-reverse-shell/blob/master/shell.aspx](https://github.com/borjmz/aspx-reverse-shell/blob/master/shell.aspx)

![](/images/relevant/81edffe59a58.png)

![](/images/relevant/84b851b446ac.png)

![](/images/relevant/27e57b56cd6c.png)

###  Kirim Bendera Pengguna

![](/images/relevant/8b4b6daef182.png)

# Winpriv SeImpersonate

![](/images/relevant/18739a24fa33.png)

Dengan menggunakan PrintSpoofer.exe, kami melakukan peningkatan hak akses.

![](/images/relevant/07b412612e32.png)

# Eksploitasi MS07-010 (Cara Lain)

## Manual

![](/images/relevant/0a0128b5cf7a.png)

![](/images/relevant/aa1be1e2904d.png)

![](/images/relevant/39a771d799f3.png)

![](/images/relevant/ec618a2dd5dd.png)

## Metasploit

Pertama, kami mendapatkan kredensial di share nt4wrksrv `Bob:!P@$$W0rD!123` dan kami menggunakannya pada eksploitasi kami.

![](/images/relevant/00ab05bbf4d1.png)

![](/images/relevant/e6781174663f.png)

Referensi:
[https://offensive.run/misc/eternalblue/README.html](https://offensive.run/misc/eternalblue/README.html)
