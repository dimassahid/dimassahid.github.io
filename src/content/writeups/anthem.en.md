---
title: "Anthem"
description: "Enum Port 80 - http dirsearch : check one by one the page of our discovery, on robots.txt we got interesting finding it was some unique phrase and the umbraco page. then we check"
lang: "en"
translationKey: "anthem"
category: "lab-writeups"
tags: ["Lab", "Umbraco", "Reuse Passwords", "Hidden Files on Windows", "Change permission access file", "Windows", "Easy"]
publishDate: "2025-09-29"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "27d5fca1-ed80-8043-bd10-cba84068b8bc"
notionUrl: "https://app.notion.com/p/Anthem-27d5fca1ed808043bd10cba84068b8bc"
notionLastEdited: "2026-11-18T14:19:00.000Z"
---

# Enum

![](/images/anthem/1f97663f1bff.png)

## Port 80 - http

![](/images/anthem/c4ac1904af58.png)

dirsearch :

![](/images/anthem/cd0a56f4c3e4.png)

check one by one the page of our discovery, on robots.txt we got interesting finding it was some unique phrase and the umbraco page.

![](/images/anthem/9b30fb2e3274.png)

then we check page /umbraco from that we know that the website running umbraco apps. here is umbraco login page.

![](/images/anthem/aed1c3a3d6ec.png)

now we enumerate the website to find login credential. we got interesting blog which consist a poem so i paste it on google and find the author of the poem. we assume it become our administrator name.

![](/images/anthem/3bde2c576514.png)

then on /archive/we-are-hiring/ page we found format email for John Doe is [JD@anthem.com](mailto:JD@anthem.com) so assume our email of administrator user would become SG@anthem.com, let’s we gather all that information for login into umbraco app(`SG@anthem.com:UmbracoIsTheBest!`).

![](/images/anthem/bebdb9f1bf1a.png)

Voila we succeed login into umbraco CMS and finding the version of umbraco CMS.

![](/images/anthem/4e67982053f7.png)

by the version let’s we looking for a related vulnerabilities. after doing searching trying every related vulnerability there is no vulnerability which can bring us into a server.

![](/images/anthem/6af55698c310.png)

so I use hanging fruit attempt like using the credential of umbraco apps into login rdp with little adjustment (`SG:UmbracoIsTheBest!`)

```javascript
xfreerdp3 /u:SG /p:UmbracoIsTheBest! /v:10.10.57.128
```

![](/images/anthem/66ef26fa1f77.png)

oke after succeed to login via RDP now we enumerate the windows machine to do priviledge escalation

# WinPriv

list all the file on directory C either it hidden or not using the following command 

```javascript
Get-ChildItem -Force
```

![](/images/anthem/d1548c494d77.png)

let’s we see backup directory. we got restrote.txt but we don’t have access into it

![](/images/anthem/1cd6c9785385.png)

so let’s we try to acces it via interface and try to change the access permission of that file.

checklist hidden items to see hidden files.

![](/images/anthem/cdde0ebaef01.png)

change the permission of the file

![](/images/anthem/61f3bafcd84a.png)

![](/images/anthem/271a0cec7898.png)

after do that checklist full control then click apply button then ok button. Voila our user has full control acces into the file.

![](/images/anthem/7410cbd1b1b2.png)

now we can access the file and got the sentences maybe we can use it for login as administrator.

![](/images/anthem/5b06f4125081.png)

so we do relogin via rdp using the information that we have gathered (Administrator:ChangeMeBaby1MoreTime) voila we now login as administrator and able to access root.txt

![](/images/anthem/4249ae43efa7.png)
