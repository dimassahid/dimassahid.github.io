---
title: "Boiler CTF"
description: "Enum Port 21 - ftp we got .info.txt file from anonymous login Port 80 - http Dirsearch: page /robots.txt page /joomla we found joomlah apps, so let’s we find out what version of"
lang: "en"
translationKey: "boiler-ctf"
category: "lab-writeups"
tags: ["Lab", "Joomla", "Command Injection", "suid-find-privesc", "Linux", "Medium"]
publishDate: "2025-08-26"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "25b5fca1-ed80-8028-9fd5-fea68acb4ebc"
notionUrl: "https://app.notion.com/p/Boiler-CTF-25b5fca1ed8080289fd5fea68acb4ebc"
notionLastEdited: "2025-08-27T16:07:00.000Z"
---

# Enum

![](/images/boiler-ctf/f1f176a5ea85.png)

![](/images/boiler-ctf/85159fb5077b.png)

![](/images/boiler-ctf/ad098329be01.png)

## Port 21 - ftp

we got .info.txt file from anonymous login

![](/images/boiler-ctf/627c21ed5e43.png)

## Port 80 - http

![](/images/boiler-ctf/76ca07c31f91.png)

Dirsearch:

![](/images/boiler-ctf/34d93b0cde82.png)

page /robots.txt

![](/images/boiler-ctf/d2185e3c9614.png)

page /joomla we found joomlah apps, so let’s we find out what version of joomla is by accesing this page **/administrator/manifests/files/joomla.xml**

![](/images/boiler-ctf/1c1e4330ef96.png)

![](/images/boiler-ctf/e2e6e1d5288d.png)

we found that joomla version is 3.9.12-dev after looking around on google we can’t find public exploit which interesting to try. so let’s we look for another way, let’s we do dirsearch again on joomla application

![](/images/boiler-ctf/053ecd4fea50.png)

after checking one by one of those directories i find interesting page on /_test

![](/images/boiler-ctf/50284c72e08a.png)

after clicking Linux as an option for OS I got parameter plot on my URL, so let’s try to tamper it using command linux like `ls` , if i directly input `ls` command it wouldn’t work, so i used `;` to make more command in linux then it works.

![](/images/boiler-ctf/31a67087d478.png)

![](/images/boiler-ctf/606ddbbbb125.png)

so let’s we utilize these command injection vulnerability to get our revshell on the server. after try one by one command form [revshell.com](http://revshell.com/) finally using busybox will give us revshell

![](/images/boiler-ctf/f98b4c28ed97.png)

we can’t accessing folder user in home directory, fortunately we got one of the user password that was basterd’s password (basted:superduperp@$$)

![](/images/boiler-ctf/ce380d95cf31.png)

oke now we have been in basterd user, but in basterd directory there is no flag. we need to move into another user to get flag. our target user is stoner. we got file [backup.sh](http://backup.sh/) inside basterd directory let’s we check it out

![](/images/boiler-ctf/2661282d8b1f.png)

yeay we got stoner’s password (stoner:#superduperp@$$no1knows), then let’s we got the flag.

![](/images/boiler-ctf/a0359a8eca9a.png)

Bingo we can’t got any flag inside stoner directory, but actually the flag is .secret hahahaha not common but that’s ok.

# LinPriv

now let’s we enumerate to get root user, we find inside linpeas that find binary has SUID so it can be useful for getting a root use**r**

**linpeas**:

![](/images/boiler-ctf/bd688e4b2a69.png)

based on gtfobin we can run the following command to get root user.

```bash
find . -exec /bin/bash -p \; -quit
```

![](/images/boiler-ctf/7fab644776c5.png)

![](/images/boiler-ctf/12918f7aa0ef.png)

yeay we got root user and also the root flag. actually from bastard we can directly into root user to get all the flag hahahaha.
