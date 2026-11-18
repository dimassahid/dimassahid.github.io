---
title: "Blaster"
description: "Enum Port 80 Dirsearch then let’s we access /retro page we notice that we have login page in the bottom of the page, so let’s we check that out we see that we have login page of"
lang: "en"
translationKey: "blaster"
category: "lab-writeups"
tags: ["Lab", "Wordpress", "CVE-2019-1388", "Certificate Dialog Privesc", "Windows", "Easy"]
publishDate: "2025-06-08"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "20c5fca1-ed80-80ac-b1b2-cff888253ecd"
notionUrl: "https://app.notion.com/p/Blaster-20c5fca1ed8080acb1b2cff888253ecd"
notionLastEdited: "2025-09-11T04:18:00.000Z"
---

# Enum

![](/images/blaster/18578f736e6f.png)

## Port 80

![](/images/blaster/5d66fca66273.png)

Dirsearch

![](/images/blaster/fe95a0e17be7.png)

then let’s we access /retro page

![](/images/blaster/14494ff4e76a.png)

we notice that we have login page in the bottom of the page, so let’s we check that out

![](/images/blaster/6d6a42c31a24.png)

we see that we have login page of wordpress and in the previous page we found suspicious name that was **wade **so let’s we try to bruteforce the login page with **wade** as username.

then we reuse the credential for login into server via RDP

![](/images/blaster/bed83e48c2e4.png)

oke after get into the server let’s we do enumeration to do privesc

# WinPriv

we found .exe file which is interesting in desktop then we search on google what was that, it tells use that was has correlation on **CVE-2019-1388.**

![](/images/blaster/2ea4c75c114e.png)

so let’s we exploit, first click hhupd.exe > when dialog pop up comes up > choose option show more details > show information about the publisher’s certificate > click link in the “issued by” > when option browser comes up > choose your browser

![](/images/blaster/f7554b5083a4.png)

![](/images/blaster/05874f4fb643.png)

when your browser has comes up to try open the link click CTRL + S and running cmd or powershell then voila we got administration user.

![](/images/blaster/0598f0ec3aab.png)

# Addition Further Step

running this using administrator privileges

![](/images/blaster/8c7a91339707.png)

then run command `run -j` then you will got generated a payload powershell.exe……… then running it on administrator cmd, voila we got session with administrator access.

![](/images/blaster/bace4fa3d852.png)

using command `run persistence -X` to automatically establish a session when agent reboot
