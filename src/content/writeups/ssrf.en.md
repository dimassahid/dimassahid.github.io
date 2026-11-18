---
title: "SSRF"
description: "SSRF via Download File First I got the website like this, there is a download fitur which point to server secure-file-storage.com and there is admin page which only able to access"
lang: "en"
translationKey: "ssrf"
category: "lab-writeups"
tags: []
publishDate: "2024-08-29"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "d4c0e64e-3362-4ebf-967a-ef431d19ff83"
notionUrl: "https://app.notion.com/p/SSRF-d4c0e64e33624ebf967aef431d19ff83"
notionLastEdited: "2024-08-29T05:12:00.000Z"
---

# SSRF via Download File

First I got the website like this, there is a download fitur which point to server [secure-file-storage.com](http://secure-file-storage.com/) and there is admin page which only able to access via localhost.

![](/images/ssrf/4c206ed97361.png)

![](/images/ssrf/909f280c0143.png)

Then I tried to manipulate the download fitur to point on my laptop(tun0).

![](/images/ssrf/675e087ca8ad.png)

as you can see in the above image the request of the server suscceed tobe pointed on my laptop. Utilizing this vulnerability, I tried to acces the admin page by changing parameter `server` into this : [http://localhost:8087/admin%23&id=75482342](http://localhost:8087/admin%23&id=75482342)
I used %23(#) to escape the parameter id inorder to make link still work.

![](/images/ssrf/f2af3176f49b.png)

viola we got the flag.
