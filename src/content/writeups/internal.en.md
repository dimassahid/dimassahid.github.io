---
title: "Internal"
description: "Enum Nmap : Port 80 Dirsearch : we found that in the server there is Wordpress application so we scanned it using wpscan tools we found user so first let’s we do bruteforce. we"
lang: "en"
translationKey: "internal"
category: "lab-writeups"
tags: ["Lab", "Unique Case Linpriv", "ssh-tunneling", "Wordpress", "Jenkins-localhost", "Linux", "Hard"]
publishDate: "2024-12-25"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1675fca1-ed80-80cc-8e3f-cd217dd047b8"
notionUrl: "https://app.notion.com/p/Internal-1675fca1ed8080cc8e3fcd217dd047b8"
notionLastEdited: "2025-10-13T16:07:00.000Z"
---

# Enum

Nmap :

![](/images/internal/6bd2e506e2c6.png)

## Port 80

![](/images/internal/6729b2614dd0.png)

Dirsearch :

![](/images/internal/46b8b760d1df.png)

![](/images/internal/5a5f258d927f.png)

![](/images/internal/f25348f64bb5.png)

we found that in the server there is Wordpress application so we scanned it using wpscan tools

```bash
wpscan --url http://10.10.159.81/blog/  -e --api-token HgrZozFw3YMdEMsOCxIWuKSZtsaGSti6l7qi4iLsaI0
```

![](/images/internal/cdfde20554b3.png)

we found user so first let’s we do bruteforce.

```bash
wpscan --url http://internal.thm/blog -U admin -P /usr/share/wordlists/rockyou.txt
```

![](/images/internal/232e1faf2ba3.png)

we found valid credentials `admin : my2boys`, so let’s we do login and exploit to establish revshell

in exploration stage we found something interesting on post menu, we found a credentials let’s we save it for later use.

![](/images/internal/50abdde806bb.png)

oke after many attempt try to use the credentials we have found in the above section, we got nothing, so let’s we try to establish revshell by accessing menu theme editor.

![](/images/internal/a35a2bc36c3c.png)

change the content of file 404.php become our revshell.

![](/images/internal/550d802a8220.png)

then accessing the theme to trigger the revshell and voila we got a revshell.

```bash
http://internal.thm/blog/wp-content/themes/twentyseventeen/404.php
```

![](/images/internal/891b746c4edf.png)

# Linpriv

Linpeas :

![](/images/internal/8833480cf6dc.png)

we found something interesting here, let’s we check this up

![](/images/internal/b657381452f6.png)

wow we found aubreanna credential `aubreanna:bubb13guM!@#123` let’s we try to use it for login

![](/images/internal/5b7ede43e7ca.png)

![](/images/internal/1e4add1b2ab5.png)

in user aubreanna we found interesting file, that was jenkins.txt and when we opened the file we see that it explains where jenkins service is running, jenkins is running on [localhost](http://localhost/) port 8080

![](/images/internal/3238a4975f1a.png)

![](/images/internal/a4755d790a04.png)

## Port 8080

so let’s we look at the jenkins on locahost port 8080 by doing tunneling using ssh

```bash
ssh -L 8080:127.0.0.1:8080 aubreanna@10.10.38.172 
```

![](/images/internal/ef9ef9c40ee0.png)

when we found jenkins login page, we tried to bruteforce it using hydra

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt 127.0.0.1 -s 8080 http-post-form "/j_acegi_security_check:j_username=^USER^&j_password=^PASS^&from=%2F&Submit=Sign+in:Invalid username or password"
```

![](/images/internal/9c31b08a87ad.png)

after bruteforcing we got a valid credentials `admin : spongebob` let’s we use it for login jenkins and looking for to establish revshell

![](/images/internal/9e4e0ea761aa.png)

![](/images/internal/757fb587fa1d.png)

after that running linpeas for doing enumeration in order to privilege escalation become root user, we found something interesting on “/opt” let’s we check this up.

![](/images/internal/48cdb536f2bb.png)

![](/images/internal/3eb8317dfadc.png)

yey we found root credential let’s we use it on ssh to switch our user become root user and get the flag.

![](/images/internal/a990757b7e39.png)
