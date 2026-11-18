---
title: "Zeno"
description: "Enum Port 12340 - http Dirsearch: we discovered restaurant app in page /rms, so let’s we looking for related exploit with restaurant management system we found RCE exploit so"
lang: "en"
translationKey: "zeno"
category: "lab-writeups"
tags: ["Lab", "restaurant_management_system_exploit", "database_enum", "credentail_in_fstab/mtab", "privesc_service_linux", "sudo_reboot_permission", "Pwnkit_CVE-2021-4034", "Linux", "Medium"]
publishDate: "2025-08-24"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2595fca1-ed80-806f-9e12-ff757e5b540e"
notionUrl: "https://app.notion.com/p/Zeno-2595fca1ed80806f9e12ff757e5b540e"
notionLastEdited: "2025-08-25T16:22:00.000Z"
---

# Enum

![](/images/zeno/1c088f1cddfa.png)

## Port 12340 - http

![](/images/zeno/dcf923d0b896.png)

Dirsearch:

![](/images/zeno/0812b4036b43.png)

![](/images/zeno/04f834d3befd.png)

we discovered restaurant app in page /rms, so let’s we looking for related exploit with restaurant management system

![](/images/zeno/b8c0f1b85059.png)

we found RCE exploit so let’s we examine the script and doing adjustment as we need to solve this challenge. here I’m fix some error code and add my revshell directly inside the script instead of only upload rce using cmd parameter like the default script before.

![](/images/zeno/9944a403a381.png)

![](/images/zeno/3c9c78349e8a.png)

now accessing the script to triggering the revshell.

![](/images/zeno/82933c5b55ee.png)

# LinPriv

### Database Enumeration

Linpeas:
Now we're in the machine and I decided to take a look at the `config.php` inside `connection` folder. which gave me the username and the password for accessing the database:

![](/images/zeno/976fff183cb9.png)

Then I tried to connect to the database using the credentials of last file. And I found some **Password Hashs** inside `members` table:

![](/images/zeno/202f9c274e9f.png)

![](/images/zeno/f22cd7769bc0.png)

![](/images/zeno/6beef3b4b6dc.png)

unfortunately we can’t crack edward password so i look for another way to login as edwar. on linpeas I found something like a password in permission init segemnt

![](/images/zeno/ef92a8d5e4e7.png)

let’s we try to use it for login into edward

![](/images/zeno/6067f582856c.png)

yeay we success to login as edward, so let’s we do enum on user edward

![](/images/zeno/fe63a2cdcd32.png)

![](/images/zeno/60d56b393a3d.png)

![](/images/zeno/7c188e34daaf.png)

as we can see in edward user we have access to reboot the system using sudo, and we got vulnerable service, let’s we examine the vulnerable service

![](/images/zeno/5d633e88b3bb.png)

as we can see, we have write access into file `/etc/systemd/system/zeno-monitoring.service` the other only symlink, so let’s we modify the parameter `ExecStart` to run the following command in order to get root user after rebooting the system.

```bash
#boleh pakek ini
/bin/bash -c 'echo "edward ALL=(root) NOPASSWD: ALL" > /etc/sudoers'

#saya pakai ini karna lebih pendek
/usr/bin/chmod +x /bin/bash
```

![](/images/zeno/2b35be6ca7d6.png)

after modifying the service let’s we reboot the system, the voilla we got the root user

![](/images/zeno/5cb8ccb9331d.png)

### Unintended

Linpeas:

![](/images/zeno/98787eb3a8da.png)

exploit pwnkit (CVE-2021-4034):

![](/images/zeno/723f7b9757e9.png)
