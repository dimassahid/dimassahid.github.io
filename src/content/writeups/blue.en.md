---
title: "Blue"
description: "Enum vulnerability scanning Port 139&445 - SMB from nmap scan we notice that our target is identified to be affected on ms17-010 vulnerability, but when we do enumerate smbshare"
lang: "en"
translationKey: "blue"
category: "lab-writeups"
tags: ["Lab", "MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption", "Windows", "Easy"]
publishDate: "2025-06-12"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
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

vulnerability scanning

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

## Port 139&445 - SMB

from nmap scan we notice that our target is identified to be affected on ms17-010 vulnerability, but when we do enumerate smbshare we don’t get any of file shares and weirdly we can login into SMB if we don’t provide any username or password but when we provide random username our login become unavailable.

![](/images/blue/2ca71a37b6ea.png)

![](/images/blue/d1059e6dc274.png)

![](/images/blue/fb9ffec3ea6e.png)

then let’s we looking for exploit scripts on google to validate ms17-010 vulnerabilty that was identified in nmap scan. first let’s break down what we got from our enumeration.

- our machine OS is Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
- vulnerable on MS17-010
- Architecture of windows is 64 bit
# MS17-010

## Manual

first let’s we looking for exploit script of MS17-010 vulnerability on google and we found this on github.

[https://github.com/d4t4s3c/Win7Blue](https://github.com/d4t4s3c/Win7Blue)

![](/images/blue/f1cf916175ca.png)

looks good, oke let’s we running it.

on first attempt we failed cause we don’t got revershell as we wish , then I modify the script to change the numGroomConn value become 17 the default value is 13. then voila we are able to get revshell as system administrator which means ms17-010(eternal blue) succedd to exploit..

![](/images/blue/d876503a21bb.png)

## Metasploit

from the enumeration step we doesn’t got any information such as valid account only anonymous auth then we don’t have share name files and pipe name so it possible to be ms17-010 with no name pipe which means it only depends on memory crash (MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption) let’s we find out using metasploit. 

```bash
use exploit/windows/smb/ms17_010_eternalblue
```

![](/images/blue/c82de8e63b44.png)

run the exploit

![](/images/blue/e213abc24287.png)
