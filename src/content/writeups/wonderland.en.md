---
title: "Wonderland"
description: "Enum Port 80 - http Accessing port Dirsearch: check the page one by one and we got something interesting on page /r it tells us to keep goind so let’s we do dirsearch again on /r"
lang: "en"
translationKey: "wonderland"
category: "lab-writeups"
tags: ["Lab", "hard-dirsearch", "sudo as other user", "privesc-modify-module-python", "privesc-modify-binary-and-path-environment", "privesc-perl-capabilities", "Linux", "Medium"]
publishDate: "2025-08-31"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2605fca1-ed80-8096-be90-c7034a74932a"
notionUrl: "https://app.notion.com/p/Wonderland-2605fca1ed808096be90c7034a74932a"
notionLastEdited: "2025-09-02T14:04:00.000Z"
---

# Enum

![](/images/wonderland/2eb497f7690a.png)

## Port 80 - http

Accessing port

![](/images/wonderland/b3c05cff9ee2.png)

Dirsearch:

![](/images/wonderland/d53fc6d6bfc6.png)

check the page one by one and we got something interesting on page `/r` 

![](/images/wonderland/3d3c0677a68a.png)

it tells us to keep goind so let’s we do dirsearch again on /r page

![](/images/wonderland/1561242d7825.png)

![](/images/wonderland/bd05048ae16d.png)

keep it going dirsearch again till we got something like this page /r/a/b/b/i/t which doesn’t tell us to keep going.

![](/images/wonderland/59df6f64573a.png)

![](/images/wonderland/8ee8f6ca655c.png)

we didn’t got something, let’s we examine the source code of the website by pressing CTRL + U.

![](/images/wonderland/df553cb78b75.png)

now we got alice’s credential (`alice:HowDothTheLittleCrocodileImproveHisShiningTail`) let’s we login into ssh using the credential.

## Port 22 - ssh

![](/images/wonderland/025c741723d2.png)

we got user.txt in directory root it’s LOL

![](/images/wonderland/fe7273474028.png)

# LinPriv

## Linpriv into rabbit user

after login become alice we got interesting script on the directory, it was `walrus_and_the_carpenter.py`

![](/images/wonderland/f220cd1e3692.png)

then after doing basic enumeration we found that we are able to run the script using sudo as rabbit user.

![](/images/wonderland/35e6905df453.png)

after examining the script, we found that it imports random module, so let’s we check weather we can modify the [random.py](http://random.py/) inside the directory of python3.6

```javascript
python3 -c 'import sys; print(sys.path)' 
```

![](/images/wonderland/17492cc943b9.png)

![](/images/wonderland/fc0a490abf06.png)

we have no write access on [random.py](http://random.py/) so let’s we look for another way

![](/images/wonderland/95274b49a2b8.png)

We can exploit this by creating a [random.py](http://random.py/) file in the current directory. By doing so, [random.py](http://random.py/) will be loaded instead of the real random module. In [random.py](http://random.py/), insert the following script:

![](/images/wonderland/371a0336cefc.png)

after making [random.py](http://random.py/) script and running the walrus_and_the_carpenter.py script our user directly switch into rabbit user.

![](/images/wonderland/442d816d8ef9.png)

## Linpriv into hatter user

in directory rabbit we found there is `teaParty` program which have SUID Permission

![](/images/wonderland/84871dbdfa3b.png)

after examine the program using ghidra, we found that program using **date** command(date binary) inside the program, although it doesn’t seem to be using an absolute path, so we can exploit it by creating “date” binary and modifying the path environment so that the script will execute the malicious date script instead of the original one.

the program using its SUID permission for changing id user become hatter.

![](/images/wonderland/e06aceee8322.png)

![](/images/wonderland/ddc83e34e56e.png)

![](/images/wonderland/475266288351.png)

first modify the path, we add /tmp directory into the $PATH. 

![](/images/wonderland/f126dfc14798.png)

second, making a “date” binary which contain the following code

```bash
#!/bin/bash
/bin/bash
#alternative and more stable 
cp /bin/bash /tmp/rf ; chmod +s /tmp/rf 
```

![](/images/wonderland/715671c523e0.png)

yeay we did it, now we become hatter user and inside hatter’s directory we found hatter password(`hatter:WhyIsARavenLikeAWritingDesk?`)

![](/images/wonderland/53b3119abb40.png)

## Linpriv into root user

from hatter user we run linpeas and found vulnerable on capabilities segment using pearl.

![](/images/wonderland/61f0e5487e27.png)

based on gtfobin to shell via capabilities using pearl we can running the following command

```bash
perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'
```

![](/images/wonderland/a2365c17fc46.png)

## **Unintended:**

running linpeas we found that our targit is vulnerable with pwnkit attack, so I run the script and I can got the amazing thing like that

![](/images/wonderland/af143551333a.png)

![](/images/wonderland/f588ad0fcd74.png)
