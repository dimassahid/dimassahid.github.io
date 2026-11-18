---
title: "SIlver Platter"
description: "Enum Port 80 - http The website is a mostly static HTML website. While clicking on the different tabs, we come across some useful information in the “contact” tab: The contact tab"
lang: "en"
translationKey: "silver-platter"
category: "lab-writeups"
tags: ["Lab", "silverpeas CMS", "adm group", "sudo privesc", "Linux", "Easy"]
publishDate: "2025-09-02"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2625fca1-ed80-80a0-a231-d929d557c0bc"
notionUrl: "https://app.notion.com/p/SIlver-Platter-2625fca1ed8080a0a231d929d557c0bc"
notionLastEdited: "2025-09-08T16:11:00.000Z"
---

# Enum

![](/images/silver-platter/2449bfbe9335.png)

## Port 80 - http

![](/images/silver-platter/99a1a3775cd3.png)

The website is a mostly static HTML website.

While clicking on the different tabs, we come across some useful information in the “contact” tab:

![](/images/silver-platter/4a76f7bf3299.png)

The contact tab leaks a potential username, as well as the name of some app called “Silverpeas”.

We can take note of this, and move on with our enumeration.

At this point, I ran Gobuster in the background while taking a look at port 8080. There were no interesting results there, so I’ll just move on to port 8080.

## Port 8080 - http proxy

![](/images/silver-platter/5e5cece6e7de.png)

Unfortunately, we get a 404 not found error when we visit port 8080.

Not much we can do here, so we should look for more content with gobuster:

![](/images/silver-platter/b7e6e8e954dd.png)

We get two interesting endpoints, but upon researching them further, we discover that they are both, most likely, dead ends. /website returns a “Forbidden” error, and /console redirects us to a 404 page.

So, it seems like we are a bit stuck and don’t really have much of an attack surface.

However, recall that the message on the contact tab earlier mentioned “Silverpeas”. What if the directory that we need is /silverpeas ?

On port 80, we don’t find anything. But on port 8080…

![](/images/silver-platter/4c9e792853c0.png)

So, we are presented with a login page. We could try to brute-force the user “scr1ptkiddy” that was mentioned earlier, but these attacks are very loud and I usually save them for a last-resort.

We can begin by searching for “SilverPeas” default credentials on google:

![](/images/silver-platter/fc0ca1ae8f0c.png)

After trying login using default credential we got failed. Ok, the next step would be to research any vulnerabilities in SilverPeas. But to search effectively, we need to know the version. I was unable to identify the exact version, but the login page gives us a pretty good indication:

![](/images/silver-platter/a41b2719645a.png)

2022 is mentioned as the current year. So any CVE from 2023 and 2024 should be useful.

Simply searching for “SilverPeas exploit” on google:

![](/images/silver-platter/14c5388f1318.png)

![](/images/silver-platter/a18de886dd57.png)

Looks like there is an authentication bypass vulnerability from 2024 — just what we need!

Reading through the [details](https://github.com/advisories/GHSA-4w54-wwc9-x62c), it would seem that all we have to do, is to capture the login request
 in BurpSuite, and remove the password field from the request.

Let’s try to use username that we got in previous page (page contact) scr1ptkiddy and remove the password parameter :

![](/images/silver-platter/3632e0f86689.png)

![](/images/silver-platter/c055b59ac579.png)

yeay we success to bypass authentication of the silverpeas apps. we got unread notification, let’s check that out

![](/images/silver-platter/474123465101.png)

![](/images/silver-platter/dac491c9dd6b.png)

when we check the inbox we see that there is an ID number representing the object we see so we can exploit it by increasing or decreasing the id number to see another messages based on CVE 2023-47232.

![](/images/silver-platter/182a15320e1d.png)

![](/images/silver-platter/97abf6829a0c.png)

after doing increasing the id number we got credential of user **tim** on id number 6. 

![](/images/silver-platter/ca02a2fcff5c.png)

So based on the message we got we can use the credential for login ssh (time:cm0nt!md0ntf0rg3tth!spa$$w0rdagainlol)

![](/images/silver-platter/d47b2b9709b8.png)

# LinPriv

Linpeas:
Checking the group memberships for the `tim` user, we see that the user belongs to the `adm` group:

![](/images/silver-platter/a80db229321f.png)

then we looking for what’s the **adm **means? then I got the answer from google like the following

![](/images/silver-platter/8c72e301b1d1.png)

so from the information above let’s try to access log file in /var/log directory and looking for string as we targeted.

```bash
cat /var/log/auth* | grep -ai -e 'tyler' -e 'pass' -e 'ssh'
```

![](/images/silver-platter/5b96596dfa89.png)

we found only DB password so let’s we try to login into user tyler with the same password (tyler:_Zd_zx7N823/)

![](/images/silver-platter/c7d2b63b7287.png)

yeay we succed to login, after that let’s we do an enumeration a bit by running command sudo -l

![](/images/silver-platter/ab5bb2418cd7.png)

from the information above we know that user tyler has access to sudo all without using a password so let’s we switch the user becoming a root user by running command `sudo su`

![](/images/silver-platter/f395cfeb1508.png)

yeay we got root user and the flag.
