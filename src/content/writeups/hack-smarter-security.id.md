---
title: "Hack Smarter Security"
description: "Enumerasi Port 21 - login ftp anonim dan lihat file di dalamnya. Kita hanya mendapatkan 2 file yang tidak kita minati untuk saat ini, mari kita pindah ke port lain. Port 1311 - ssl/rxmon ketika kita"
lang: "id"
translationKey: "hack-smarter-security"
category: "lab-writeups"
tags: ["Lab", "Windows", "Medium"]
publishDate: "2025-10-01"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "27f5fca1-ed80-807f-99a9-d7d38f071254"
notionUrl: "https://app.notion.com/p/Hack-Smarter-Security-27f5fca1ed80807f99a9d7d38f071254"
notionLastEdited: "2025-10-08T21:07:00.000Z"
---

# Enum

```javascript
PORT     STATE    SERVICE       VERSION
21/tcp   open     ftp           Microsoft ftpd
| ftp-syst:
|_  SYST: Windows_NT
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 06-28-23  02:58PM                 3722 Credit-Cards-We-Pwned.txt
|_06-28-23  03:00PM              1022126 stolen-passport.png
22/tcp   open     ssh           OpenSSH for_Windows_7.7 (protocol 2.0)
| ssh-hostkey:
|   2048 0d:fa:da:de:c9:dd:99:8d:2e:8e:eb:3b:93:ff:e2:6c (RSA)
|   256 5d:0c:df:32:26:d3:71:a2:8e:6e:9a:1c:43:fc:1a:03 (ECDSA)
|_  256 c4:25:e7:09:d6:c9:d9:86:5f:6e:8a:8b:ec:13:4a:8b (ED25519)
80/tcp   open     http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods:
|_  Potentially risky methods: TRACE
|_http-title: HackSmarterSec
1311/tcp open     ssl/rxmon?
| fingerprint-strings:
|   GetRequest:
|     HTTP/1.1 200
|     Strict-Transport-Security: max-age=0
|     X-Frame-Options: SAMEORIGIN
|     X-Content-Type-Options: nosniff
|     X-XSS-Protection: 1; mode=block
|     vary: accept-encoding
|     Content-Type: text/html;charset=UTF-8
|     Date: Wed, 01 Oct 2025 04:18:52 GMT
|     Connection: close
|     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
|     <html>
|     <head>
|     <META http-equiv="Content-Type" content="text/html; charset=UTF-8">
|     <title>OpenManage&trade;</title>
|     <link type="text/css" rel="stylesheet" href="/oma/css/loginmaster.css">
|     <style type="text/css"></style>
|     <script type="text/javascript" src="/oma/js/prototype.js" language="javascript"></script><script type="text/javascript" src="/oma/js/gnavbar.js" language="javascript"></script><script type="text/javascript" src="/oma/js/Clarity.js" language="javascript"></script><script language="javascript">
|   HTTPOptions:
|     HTTP/1.1 200
|     Strict-Transport-Security: max-age=0
|     X-Frame-Options: SAMEORIGIN
|     X-Content-Type-Options: nosniff
|     X-XSS-Protection: 1; mode=block
|     vary: accept-encoding
|     Content-Type: text/html;charset=UTF-8
|     Date: Wed, 01 Oct 2025 04:18:58 GMT
|     Connection: close
|     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
|     <html>
|     <head>
|     <META http-equiv="Content-Type" content="text/html; charset=UTF-8">
|     <title>OpenManage&trade;</title>
|     <link type="text/css" rel="stylesheet" href="/oma/css/loginmaster.css">
|     <style type="text/css"></style>
|_    <script type="text/javascript" src="/oma/js/prototype.js" language="javascript"></script><script type="text/javascript" src="/oma/js/gnavbar.js" language="javascript"></script><script type="text/javascript" src="/oma/js/Clarity.js" language="javascript"></script><script language="javascript">
| ssl-cert: Subject: commonName=hacksmartersec/organizationName=Dell Inc/stateOrProvinceName=TX/countryName=US
| Not valid before: 2023-06-30T19:03:17
|_Not valid after:  2025-06-29T19:03:17
3389/tcp open     ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2025-10-01T04:19:31+00:00; 0s from scanner time.
| ssl-cert: Subject: commonName=hacksmartersec
| Not valid before: 2025-09-30T04:11:37
|_Not valid after:  2026-04-01T04:11:37
| rdp-ntlm-info:
|   Target_Name: HACKSMARTERSEC
|   NetBIOS_Domain_Name: HACKSMARTERSEC
|   NetBIOS_Computer_Name: HACKSMARTERSEC
|   DNS_Domain_Name: hacksmartersec
|   DNS_Computer_Name: hacksmartersec
|   Product_Version: 10.0.17763
|_  System_Time: 2025-10-01T04:19:25+00:00
7680/tcp filtered pando-pub
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port1311-TCP:V=7.95%T=SSL%I=7%D=10/1%Time=68DCABAC%P=x86_64-pc-linux-gn
SF:u%r(GetRequest,1089,"HTTP/1\.1\x20200\x20\r\nStrict-Transport-Security:
SF:\x20max-age=0\r\nX-Frame-Options:\x20SAMEORIGIN\r\nX-Content-Type-Optio
SF:ns:\x20nosniff\r\nX-XSS-Protection:\x201;\x20mode=block\r\nvary:\x20acc
SF:ept-encoding\r\nContent-Type:\x20text/html;charset=UTF-8\r\nDate:\x20We
SF:d,\x2001\x20Oct\x202025\x2004:18:52\x20GMT\r\nConnection:\x20close\r\n\
SF:r\n<!DOCTYPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\x20Str
SF:ict//EN\"\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-strict\.dtd\">\
SF:r\n<html>\r\n<head>\r\n<META\x20http-equiv=\"Content-Type\"\x20content=
SF:\"text/html;\x20charset=UTF-8\">\r\n<title>OpenManage&trade;</title>\r\
SF:n<link\x20type=\"text/css\"\x20rel=\"stylesheet\"\x20href=\"/oma/css/lo
SF:ginmaster\.css\">\r\n<style\x20type=\"text/css\"></style>\r\n<script\x2
SF:0type=\"text/javascript\"\x20src=\"/oma/js/prototype\.js\"\x20language=
SF:\"javascript\"></script><script\x20type=\"text/javascript\"\x20src=\"/o
SF:ma/js/gnavbar\.js\"\x20language=\"javascript\"></script><script\x20type
SF:=\"text/javascript\"\x20src=\"/oma/js/Clarity\.js\"\x20language=\"javas
SF:cript\"></script><script\x20language=\"javascript\">\r\n\x20")%r(HTTPOp
SF:tions,1089,"HTTP/1\.1\x20200\x20\r\nStrict-Transport-Security:\x20max-a
SF:ge=0\r\nX-Frame-Options:\x20SAMEORIGIN\r\nX-Content-Type-Options:\x20no
SF:sniff\r\nX-XSS-Protection:\x201;\x20mode=block\r\nvary:\x20accept-encod
SF:ing\r\nContent-Type:\x20text/html;charset=UTF-8\r\nDate:\x20Wed,\x2001\
SF:x20Oct\x202025\x2004:18:58\x20GMT\r\nConnection:\x20close\r\n\r\n<!DOCT
SF:YPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\x20Strict//EN\"
SF:\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-strict\.dtd\">\r\n<html>
SF:\r\n<head>\r\n<META\x20http-equiv=\"Content-Type\"\x20content=\"text/ht
SF:ml;\x20charset=UTF-8\">\r\n<title>OpenManage&trade;</title>\r\n<link\x2
SF:0type=\"text/css\"\x20rel=\"stylesheet\"\x20href=\"/oma/css/loginmaster
SF:\.css\">\r\n<style\x20type=\"text/css\"></style>\r\n<script\x20type=\"t
SF:ext/javascript\"\x20src=\"/oma/js/prototype\.js\"\x20language=\"javascr
SF:ipt\"></script><script\x20type=\"text/javascript\"\x20src=\"/oma/js/gna
SF:vbar\.js\"\x20language=\"javascript\"></script><script\x20type=\"text/j
SF:avascript\"\x20src=\"/oma/js/Clarity\.js\"\x20language=\"javascript\"><
SF:/script><script\x20language=\"javascript\">\r\n\x20");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

## Port 21 - ftp

Masuk sebagai pengguna anonim dan lihat file di dalamnya.

![](/images/hack-smarter-security/b235a34c7042.png)

Kita hanya punya 2 file yang saat ini tidak menarik, mari kita pindah ke port lain.

## Port 1311 - ssl/rxmon

Saat mengakses port 1311, kami mendapatkan pesan kesalahan "Kombinasi host dan port ini memerlukan TLS."

![](/images/hack-smarter-security/8211d8b4b08e.png)

Jadi mari kita coba menggunakan protokol https untuk mengaksesnya, dan voila, kita sampai di halaman login.

![](/images/hack-smarter-security/568fac0f55de.png)

Ada halaman Tentang, mari kita periksa dan cari tahu versi aplikasinya.

![](/images/hack-smarter-security/01bf6b11d8e1.png)

Kami menemukan versi aplikasi tersebut adalah 9.4.0.2, jadi mari kita cari celah keamanan yang terkait dengan versi tersebut.

![](/images/hack-smarter-security/beeca550881f.png)

![](/images/hack-smarter-security/66da5da70556.png)

Salin skrip eksploitasi ke lokal lalu jalankan. Masukkan jalur file umum di Windows seperti /etc/hosts.

![](/images/hack-smarter-security/d6dd45b02dd3.png)

Skrip tersebut memberi kita output berupa file /etc/hosts, yang berarti skrip eksploitasi kita berhasil. Jadi, mari kita cari file lain untuk dibaca guna mendapatkan informasi yang lebih berguna untuk masuk ke server.

applicationHost.config adalah file root dari sistem konfigurasi saat Anda menggunakan IIS 7 dan versi yang lebih baru, jadi mari kita coba membaca file applicationHost.config untuk mendapatkan konfigurasi umum untuk IIS. Lokasi file saat ini berada di direktori %windir%\system32\inetsrv\config.

File > /windows/system32/inetsrv/config/applicationHost.config Membaca isi dari /windows/system32/inetsrv/config/applicationHost.config:

![](/images/hack-smarter-security/40e731b1d598.png)

Di dalam file tersebut, kami menemukan jalur target aplikasi kami.

![](/images/hack-smarter-security/0aa889ea2395.png)

Jadi kami memeriksa file web.config di jalur tersebut, lalu kami menemukan kredensial pengguna tyler (tyler:IAmA1337h4x0randIkn0wit!)

![](/images/hack-smarter-security/2b5c9ce2ecf8.png)

Setelah mendapatkan kredensial pengguna Tyler, dari nmap kita tahu bahwa port RDP terbuka, jadi mari kita masuk ke server melalui RDP menggunakan kredensial Tyler.

## Port 3389 - RDP
