---
title: "Kenobi"
description: "Pengumpulan Informasi Nmap SMB Nmap kita melihat bahwa kita dapat terhubung menggunakan anonim ke layanan SMB jadi mari kita coba. Setelah masuk ke SMB, kita menemukan file log.txt yang berisi tentang"
lang: "id"
translationKey: "kenobi"
category: "lab-writeups"
tags: ["Lab", "ProFTPD 1.3.5", "SUID-nondefaultbinary", "Linux"]
publishDate: "2024-09-10"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "f3920dab-08dc-4a15-bfaf-6832042a21e7"
notionUrl: "https://app.notion.com/p/Kenobi-f3920dab08dc4a15bfaf6832042a21e7"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# Pengumpulan Informasi

## Nmap

```bash
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-09-07 09:33 WIB
Nmap scan report for 10.10.34.123
Host is up (0.51s latency).

PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         ProFTPD 1.3.5
22/tcp   open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 b3:ad:83:41:49:e9:5d:16:8d:3b:0f:05:7b:e2:c0:ae (RSA)
|   256 f8:27:7d:64:29:97:e6:f8:65:54:65:22:f7:c8:1d:8a (ECDSA)
|_  256 5a:06:ed:eb:b6:56:7e:4c:01:dd:ea:bc:ba:fa:33:79 (ED25519)
80/tcp   open  http        Apache httpd 2.4.18 ((Ubuntu))
| http-robots.txt: 1 disallowed entry 
|_/admin.html
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.18 (Ubuntu)
111/tcp  open  rpcbind     2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  2,3,4       2049/tcp   nfs
|   100003  2,3,4       2049/tcp6  nfs
|   100003  2,3,4       2049/udp   nfs
|   100003  2,3,4       2049/udp6  nfs
|   100005  1,2,3      43237/udp6  mountd
|   100005  1,2,3      54433/udp   mountd
|   100005  1,2,3      56319/tcp   mountd
|   100005  1,2,3      56359/tcp6  mountd
|   100021  1,3,4      33255/tcp6  nlockmgr
|   100021  1,3,4      44529/tcp   nlockmgr
|   100021  1,3,4      45479/udp   nlockmgr
|   100021  1,3,4      47030/udp6  nlockmgr
|   100227  2,3         2049/tcp   nfs_acl
|   100227  2,3         2049/tcp6  nfs_acl
|   100227  2,3         2049/udp   nfs_acl
|_  100227  2,3         2049/udp6  nfs_acl
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
2049/tcp open  nfs         2-4 (RPC #100003)
Service Info: Host: KENOBI; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 1h42m04s, deviation: 2h53m13s, median: 2m04s
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: kenobi
|   NetBIOS computer name: KENOBI\x00
|   Domain name: \x00
|   FQDN: kenobi
|_  System time: 2024-09-06T21:35:34-05:00
| smb2-time: 
|   date: 2024-09-07T02:35:34
|_  start_date: N/A
|_nbstat: NetBIOS name: KENOBI, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
```

## UKM

### Nmap

```bash
nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse 10.10.187.65

Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-09-10 13:36 WIB
Nmap scan report for 10.10.187.65
Host is up (0.37s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
| smb-enum-shares: 
|   account_used: guest
|   \\10.10.187.65\IPC$: 
|     Type: STYPE_IPC_HIDDEN
|     Comment: IPC Service (kenobi server (Samba, Ubuntu))
|     Users: 1
|     Max Users: <unlimited>
|     Path: C:\tmp
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\10.10.187.65\anonymous: 
|     Type: STYPE_DISKTREE
|     Comment: 
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\home\kenobi\share
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\10.10.187.65\print$: 
|     Type: STYPE_DISKTREE
|     Comment: Printer Drivers
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\var\lib\samba\printers
|     Anonymous access: <none>
|_    Current user access: <none>
```

Kita lihat bahwa kita dapat terhubung menggunakan anonim ke layanan SMB, jadi mari kita coba.

```bash
smbclient //10.10.187.65/anonymous
```

Setelah masuk melalui SMB, kami menemukan file log.txt yang berisi informasi tentang direktori **/home/kenobi/.ssh** tempat kami dapat menemukan kunci privat SSH dan juga beberapa informasi tentang konfigurasi server **ProFTPD**.

![](/images/kenobi/dd1e0efe3aad.png)

## FTP

### Nmap

```bash
nmap -sCV -p 21 10.10.187.65

Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-09-10 14:12 WIB
Nmap scan report for 10.10.187.65
Host is up (0.44s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     ProFTPD 1.3.5
Service Info: OS: Unix
```

```bash
sudo nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount 10.10.187.65

Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-09-10 14:00 WIB
Nmap scan report for 10.10.187.65
Host is up (0.37s latency).

PORT    STATE SERVICE
111/tcp open  rpcbind
| nfs-statfs: 
|   Filesystem  1K-blocks  Used       Available  Use%  Maxfilesize  Maxlink
|_  /var        9204224.0  1836516.0  6877112.0  22%   16.0T        32000
| nfs-showmount: 
|_  /var *
| nfs-ls: Volume /var
|   access: Read Lookup NoModify NoExtend NoDelete NoExecute
| PERMISSION  UID  GID  SIZE  TIME                 FILENAME
| rwxr-xr-x   0    0    4096  2019-09-04T08:53:24  .
| rwxr-xr-x   0    0    4096  2019-09-04T12:27:33  ..
| rwxr-xr-x   0    0    4096  2019-09-04T12:09:49  backups
| rwxr-xr-x   0    0    4096  2019-09-04T10:37:44  cache
| rwxrwxrwx   0    0    4096  2019-09-04T08:43:56  crash
| rwxrwsr-x   0    50   4096  2016-04-12T20:14:23  local
| rwxrwxrwx   0    0    9     2019-09-04T08:41:33  lock
| rwxrwxr-x   0    108  4096  2019-09-04T10:37:44  log
| rwxr-xr-x   0    0    4096  2019-01-29T23:27:41  snap
| rwxr-xr-x   0    0    4096  2019-09-04T08:53:24  www
|_
```

# Eksploitasi FTP

Setelah melakukan enumerasi pada layanan FTP, kami mendapatkan informasi menarik seperti versi layanan FTP **ProFTPD 1.3.5** dan juga kami memiliki akses ke direktori **`/var/*`**** **. Jadi setelah itu, mari kita periksa apakah versi ini rentan menggunakan searchsploit.

```bash
searchsploit ProFTPD 1.3.5 
```

![](/images/kenobi/5cacb9f60eb5.png)

Wah, kita melihat informasi bahwa perintah **`SITE CPFR`**** **dan **`SITE CPTO`**** **mungkin digunakan oleh klien yang tidak terautentikasi. Itu memungkinkan kita untuk menyalin dan menempel file dan direktori di dalam server. Bagus, tapi bagaimana cara kita menggunakannya?

Inilah saatnya kita harus melihat kembali semua potongan puzzle yang telah kita kumpulkan sejauh ini dan memperhatikan satu hal. Di `log.txt`
file yang kami unduh di awal pentest ini, ada
Beberapa informasi tentang pembuatan pasangan kunci RSA. Lihat tangkapan layar lagi:

![](/images/kenobi/d2d790e7e4fa.png)

Ingat pemindaian yang kita lakukan dengan nmap dan skrip NFS? Pemindaian itu menemukan satu direktori di server yang mungkin kita miliki
akses ke, hore!

Oke, jadi pada titik ini yang perlu kita lakukan hanyalah menyalin kunci privat ssh dari `/home/kenobi/.ssh/id_rsa` ke `/var/tmp` agar kita bisa mendapatkannya di mesin penyerang dan menggunakannya untuk masuk ke server sebagai pengguna `kenobi`. Mari kita lakukan!

Pertama, kita terhubung ke server untuk menggunakan perintah modul ProFTPD untuk menyalin pasangan kunci ke direktori `/var/tmp`. Mengapa `/var/tmp`? Karena Anda mungkin tidak memiliki izin untuk menulis di direktori `/var`. Direktori seperti `/tmp` atau `/var/tmp` biasanya paling aman jika dilihat dari segi akses kontennya oleh penyerang. Biasanya izin aksesnya tidak dibatasi seketat direktori lain.

![](/images/kenobi/ab276c4f1a78.png)

Pada tahap ini kita perlu memasang direktori `/var/tmp` ke mesin penyerang kita dan mencoba menggunakan kunci pribadi untuk masuk melalui SSH.

![](/images/kenobi/8a623ead5450.png)

![](/images/kenobi/11b757cc9ec0.png)

Hore, kita berhasil login sebagai kenobi, selanjutnya mari kita lakukan privesc untuk mendapatkan root.

# Peningkatan Hak Istimewa

### SUID

```bash
find / -perm -u=s -type f 2>/dev/null
```

![](/images/kenobi/93c43f49a08b.png)

Saat kita memeriksa isi file, kita menemukan bahwa di dalam file tersebut terdapat nama binary tanpa path yang tepat, sehingga kita dapat memanipulasinya.

![](/images/kenobi/f49779bc7e2c.png)

Mari kita buat binary berbahaya untuk mendapatkan akses root, seperti ini:

![](/images/kenobi/89b7d0be3445.png)

Karena kita memiliki akses untuk mengekspor PATH, jadi mari kita ekspor PATH tempat binary berbahaya kita berada agar dapat dipanggil oleh sistem. Saya akan menempatkannya di PATH pertama karena secara teoritis ketika memilih opsi nomor 1 (yang memanggil perintah `curl`).

![](/images/kenobi/4a2837e21ace.png)
