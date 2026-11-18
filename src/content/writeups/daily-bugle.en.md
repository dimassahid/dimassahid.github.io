---
title: "Daily Bugle"
description: "Enum Nmap : Dirsearch : Port 80 Joomla Referensi : Identified Joomla Version, I got this page from hacktricks Exploit Joomlah Version 3.7.0 Referensi : When running the exploit"
lang: "en"
translationKey: "daily-bugle"
category: "lab-writeups"
tags: ["Lab", "Joomla", "sudo yum", "password di config php", "Linux"]
publishDate: "2024-12-20"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1625fca1-ed80-807b-bc33-f04b7363a0ba"
notionUrl: "https://app.notion.com/p/Daily-Bugle-1625fca1ed80807bbc33f04b7363a0ba"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# Enum

Nmap :

![](/images/daily-bugle/41ce701d8e62.png)

Dirsearch :

![](/images/daily-bugle/63d81ac8f762.png)

## Port 80 (Joomla)

Referensi : [https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/joomla](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/joomla)

![](/images/daily-bugle/54d12ea4a3c5.png)

Identified Joomla Version, I got this page from hacktricks

![](/images/daily-bugle/49d733c4d45d.png)

![](/images/daily-bugle/b170abd228fc.png)

![](/images/daily-bugle/ef79d21d14a8.png)

## Exploit Joomlah Version 3.7.0

Referensi : [https://github.com/stefanlucas/Exploit-Joomla](https://github.com/stefanlucas/Exploit-Joomla), [https://blog.sucuri.net/2017/05/sql-injection-vulnerability-joomla-3-7.html](https://blog.sucuri.net/2017/05/sql-injection-vulnerability-joomla-3-7.html)

When running the exploit script we succeed to dump super user data from the database.

![](/images/daily-bugle/fec2dca2c16f.png)

and we got password was encrypted so let’s we identified the type of encryption.

![](/images/daily-bugle/ae2bb5211c75.png)

 next we tried to decrypt it using john or hashcat.

![](/images/daily-bugle/1613fa58fcc6.png)

![](/images/daily-bugle/3928fb733f81.png)

yey now we got a complete credential `jonah : spiderman123` let’s we tried to login as super user on page administrator.

![](/images/daily-bugle/74b2e9adfa7d.png)

after login, let’s we find out how to establish a reverse shell from this CMS, first go to templates menu.

![](/images/daily-bugle/a8958cfe5d68.png)

then choose one of the templates, and choose option for create new file with name shell and type .php

![](/images/daily-bugle/faf0aa12f086.png)

![](/images/daily-bugle/3084aa4e60c6.png)

![](/images/daily-bugle/438c10d0b4e2.png)

![](/images/daily-bugle/5f23f42d984d.png)

finally let’s accessing the template and catch the revshell.

![](/images/daily-bugle/3c0119d1c679.png)

# LinPriv

Linpeas :

![](/images/daily-bugle/f23eeabc1c47.png)

from linpeas we find that there is password on one of the config.php, let’s we try to use it for login ssh as **jjameson **to check whether it valid or not

![](/images/daily-bugle/be48b29bcf4c.png)

now we got a valid credential `jjameson : nv5uz9r3ZEDzVjNu` now let’s we privilege escalation again into root user. enumerate it start from basic `sudo -l`

![](/images/daily-bugle/c7cd3182e76d.png)

we got yum has access on sudo, so let’s we check on gtfobin.

![](/images/daily-bugle/782362951643.png)

oke after that let’s we reproduce using the same way as gtfobin tell us

![](/images/daily-bugle/8cf6de963a7d.png)

Voila we got root Access.

![](/images/daily-bugle/6c2657781a6d.png)
