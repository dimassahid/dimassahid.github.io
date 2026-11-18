---
title: "AllSignsPoint2Pwnage"
description: "Enum Port 139 & 445 - SMB first we do enumeration on SMB service using smbmap without any provided credential we got nothing, so let’s we provide anonymous credential to see the"
lang: "en"
translationKey: "allsignspoint2pwnage"
category: "lab-writeups"
tags: ["Lab", "SMB share with write access", "password user in local", "Seimpersonate", "Printspoofer", "Windows", "Medium"]
publishDate: "2025-09-24"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2785fca1-ed80-8012-a949-dde83e9f9015"
notionUrl: "https://app.notion.com/p/AllSignsPoint2Pwnage-2785fca1ed808012a949dde83e9f9015"
notionLastEdited: "2025-09-30T12:22:00.000Z"
---

# Enum

```javascript
nmap -Pn -p- <IP> --min-rate 1000
```

![](/images/allsignspoint2pwnage/126f4aafe46e.png)

```javascript
nmap -sCV <IP>
```

![](/images/allsignspoint2pwnage/ba143ef56e5f.png)

## Port 139 & 445 - SMB

first we do enumeration on SMB service using smbmap

![](/images/allsignspoint2pwnage/79de851829b1.png)

without any provided credential we got nothing, so let’s we provide anonymous credential to see the result.

![](/images/allsignspoint2pwnage/2574dfa94883.png)

from our enumeration we got write access on images$ shared folder, so let’s we try to upload our revshell on that shared folder. on port 443 we see that the application using php so for the apropriate result we need upload php revshell on that shared folder.

our revshell.php

![](/images/allsignspoint2pwnage/5a1f548c2eb4.png)

login into shared folder and upload our revshell.php

![](/images/allsignspoint2pwnage/b02c33d95725.png)

then accessing our revshell via port 443

## Port 443 - http

when accessing port 443 we got an application like this:

![](/images/allsignspoint2pwnage/44a76e25044d.png)

then we analyze the source code, in the source code we know that application is build using PHP, and it runs content.php and get the images from images page. 

![](/images/allsignspoint2pwnage/4cc3d3992725.png)

so let’s we visit images page, we found our revshell.php file

![](/images/allsignspoint2pwnage/2ec4f474be4c.png)

then we accesing it to trigger our revshell.

![](/images/allsignspoint2pwnage/a0f873316c82.png)

then we got our first flag

![](/images/allsignspoint2pwnage/5aeefbee60df.png)

# Winpriv

we do enumeration on our user that we have had which is sign. got the password of user

```javascript
reg query "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon"
```

![](/images/allsignspoint2pwnage/579c7645eab4.png)

then after strolling aroung we got administrator password inside installs share, install share is the share folder that we found before in first enumeration ($install)

![](/images/allsignspoint2pwnage/328844b7f858.png)

after getting administrator password we can’t crack it so we look for another way, doing enumeration we got vnc password in file .ini

![](/images/allsignspoint2pwnage/2f46662a4dd9.png)

to decrypt the password i used google as my source

![](/images/allsignspoint2pwnage/2a528fa5477a.png)

![](/images/allsignspoint2pwnage/6b306f88fe00.png)

we found one liner command to decrypt it so let’s we use to decrypt both hash, then we got final result like this.

![](/images/allsignspoint2pwnage/731b16694754.png)

after got many password but it doesn’t work at all for login as administrator so i was looking for another way then found that our user has vulnerability seimpersonate when we running command whoami /priv

![](/images/allsignspoint2pwnage/5b84c83aa6f1.png)

so we transfer printspoofer via SMB cause if we transfer it directly into our folder we don’t have an access.

![](/images/allsignspoint2pwnage/265f85aa91fc.png)

after transfer file has successfull, then running the printspoofer.exe to get administrator user.

![](/images/allsignspoint2pwnage/7f7253d5f537.png)

yey now we can accesing administrator flag

![](/images/allsignspoint2pwnage/224d8af44b8a.png)

this the prove that we can’t download the file directly into our directory which has common access as a user.

![](/images/allsignspoint2pwnage/94637cff8144.png)
