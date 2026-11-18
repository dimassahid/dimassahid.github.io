---
title: "Steel Mountain"
description: "Enum Nmap : Port 8080 Exploit HFS Submit Flag User WinPriv identified on winpeas we see that it started using localsystem we see that we able to do restart the service and the"
lang: "en"
translationKey: "steel-mountain"
category: "lab-writeups"
tags: ["Lab", "HttpFileServer 2.3", "winpriv-service-exploit", "HFS", "Windows"]
publishDate: "2024-12-13"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "15b5fca1-ed80-800b-9078-c46186b2ab5a"
notionUrl: "https://app.notion.com/p/Steel-Mountain-15b5fca1ed80800b9078c46186b2ab5a"
notionLastEdited: "2025-06-03T00:13:00.000Z"
---

# Enum

Nmap :

```bash
PORT      STATE SERVICE            VERSION
80/tcp    open  http               Microsoft IIS httpd 8.5
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Microsoft-IIS/8.5
| http-methods: 
|_  Potentially risky methods: TRACE
135/tcp   open  msrpc              Microsoft Windows RPC
139/tcp   open  netbios-ssn        Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds       Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
3389/tcp  open  ssl/ms-wbt-server?
| rdp-ntlm-info: 
|   Target_Name: STEELMOUNTAIN
|   NetBIOS_Domain_Name: STEELMOUNTAIN
|   NetBIOS_Computer_Name: STEELMOUNTAIN
|   DNS_Domain_Name: steelmountain
|   DNS_Computer_Name: steelmountain
|   Product_Version: 6.3.9600
|_  System_Time: 2024-12-15T03:57:22+00:00
| ssl-cert: Subject: commonName=steelmountain
| Not valid before: 2024-12-14T03:46:43
|_Not valid after:  2025-06-15T03:46:43
|_ssl-date: 2024-12-15T03:57:28+00:00; +49s from scanner time.
5985/tcp  open  http               Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8080/tcp  open  http               HttpFileServer httpd 2.3
|_http-title: HFS /
|_http-server-header: HFS 2.3
47001/tcp open  http               Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49152/tcp open  msrpc              Microsoft Windows RPC
49153/tcp open  msrpc              Microsoft Windows RPC
49154/tcp open  msrpc              Microsoft Windows RPC
49155/tcp open  msrpc              Microsoft Windows RPC
49156/tcp open  msrpc              Microsoft Windows RPC
49163/tcp open  msrpc              Microsoft Windows RPC
49164/tcp open  msrpc              Microsoft Windows RPC
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:0:2: 
|_    Message signing enabled but not required
|_nbstat: NetBIOS name: STEELMOUNTAIN, NetBIOS user: <unknown>, NetBIOS MAC: 02:b4:58:13:9d:87 (unknown)
|_clock-skew: mean: 48s, deviation: 0s, median: 48s
| smb2-time: 
|   date: 2024-12-15T03:57:24
|_  start_date: 2024-12-15T03:46:35
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 94.34 seconds
```

## Port 8080 

![](/images/steel-mountain/5f22cffa39da.png)

![](/images/steel-mountain/3b8b2eb10260.png)

![](/images/steel-mountain/eef8c236ced0.png)

### Exploit HFS 

![](/images/steel-mountain/23abbfc3dfd3.png)

### Submit Flag User

![](/images/steel-mountain/654cdfcd969b.png)

## WinPriv

identified on winpeas

![](/images/steel-mountain/2b95bb4debb0.png)

we see that it started using localsystem

![](/images/steel-mountain/bbaa7807db78.png)

we see that we able to do restart the service and the name of the service

![](/images/steel-mountain/ef3b22e34b7f.png)

oke now let’s we exploit it

making a malicious file :

![](/images/steel-mountain/93188cdf964e.png)

transfer file into the server :

![](/images/steel-mountain/36bc291c094e.png)

and move the file using **copy command **into the target directory and restart the service.

![](/images/steel-mountain/d91e5c152179.png)

yey we got a reverse with localsystem privileges.

![](/images/steel-mountain/389a2c6923bb.png)
