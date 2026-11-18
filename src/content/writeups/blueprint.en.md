---
title: "Blueprint"
description: "Enum Port 443 - https on port 443 we see that we have application oscommerce versi 2.3.4 but when we opened it we see only scratch apps inside. so from that knowledge we are"
lang: "en"
translationKey: "blueprint"
category: "lab-writeups"
tags: ["Lab", "oscommerce versi 2.3.4", "Dump hash mimikatz", "Windows", "Easy"]
publishDate: "2025-09-14"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "26e5fca1-ed80-806e-81e8-d3db78e817b4"
notionUrl: "https://app.notion.com/p/Blueprint-26e5fca1ed80806e81e8d3db78e817b4"
notionLastEdited: "2025-09-24T00:26:00.000Z"
---

# Enum

![](/images/blueprint/6e6bbce07a77.png)

![](/images/blueprint/54641276346f.png)

## Port 443 - https

![](/images/blueprint/e04e0d7b0f59.png)

on port 443 we see that we have application oscommerce versi 2.3.4 but when we opened it we see only scratch apps inside.

![](/images/blueprint/979d299e83fa.png)

so from that knowledge we are looking for public exploit using searchsploit based on apps installed on the server (oscommerce)

![](/images/blueprint/e20ea834145a.png)

we choose to try both RCE exploit.

![](/images/blueprint/977798c29c03.png)

on the first exploit script we got failed attempt cause our target using https, so we need to modify our script on post request line to have `verify=false` .

![](/images/blueprint/6b8c431d2c15.png)

![](/images/blueprint/bde77a84077f.png)

run the code after modification

![](/images/blueprint/39c98cf0e289.png)

![](/images/blueprint/9f86b56579f5.png)

the script can’t be use cause server turn off the system() command, so let’s we move into the second script.

![](/images/blueprint/901054cf57c1.png)

using the second exploit script we succeed to get webshell, let’s we upgrade it become revshell. first we generate .exe malicious and transfer it into target server.

![](/images/blueprint/88d0b7c76359.png)

![](/images/blueprint/c8d7e8b26ebc.png)

![](/images/blueprint/c40874c8fb1f.png)

cause we have been in system user, so let’s we get the flag of administrator

![](/images/blueprint/fe28317d5f6d.png)

the last task we need to get an NTLM hash of the user. so let’s we transfer mimikats based on architecture (x68) to dump NTLM

![](/images/blueprint/258ef50a40a2.png)

![](/images/blueprint/ee591dac0b46.png)

after getting the NTLM hash let’s we crack it using hashcat

```bash
hashcat -m 1000 blue.hash /usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords.txt --force
```

![](/images/blueprint/780867cc7ef4.png)

voila we succeed to crack the password (googleplus)
