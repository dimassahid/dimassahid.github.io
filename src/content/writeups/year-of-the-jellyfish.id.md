---
title: "year of the jellyfish"
description: "Enumerasi Port 80 & 443 - http & https. Saat mengakses port 80, kita selalu dipaksa untuk dialihkan ke domain yang menggunakan https, yaitu 443. Jadi, mari kita daftarkan domain tersebut ke dalam enumerasi kita."
lang: "id"
translationKey: "year-of-the-jellyfish"
category: "lab-writeups"
tags: ["Lab", "monitor 1.7.6m", "Sub Domain Enum", "dirty_sock_CVE_2019_7304", "snap SUID exploit", "Pwnkit_CVE-2021-4034", "Linux", "Hard"]
publishDate: "2025-09-09"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2695fca1-ed80-803c-9735-fb2784a020b9"
notionUrl: "https://app.notion.com/p/year-of-the-jellyfish-2695fca1ed80803c9735fb2784a020b9"
notionLastEdited: "2025-10-13T16:07:00.000Z"
---

# Enum

```bash
nmap -sCV <IP>
```

![](/images/year-of-the-jellyfish/f773b0e5239a.png)

![](/images/year-of-the-jellyfish/f7ec52f74d1a.png)

## Port 80 & 443 - http & https

Saat mengakses port 80, kita selalu dipaksa untuk dialihkan ke domain [https://robyns-petshop.thm/](https://robyns-petshop.thm/) yang menggunakan https yaitu 443, jadi mari kita daftarkan domain tersebut ke dalam file /etc/hosts kita.

![](/images/year-of-the-jellyfish/09261bf77eba.png)

Setelah mendaftarkan domain di /etc/hosts, kita akan mendapatkan situs web yang sebenarnya.

![](/images/year-of-the-jellyfish/6e7aae4de1bb.png)

![](/images/year-of-the-jellyfish/e40dfa5fe89b.png)

Setelah berkeliling dan melakukan dirsearch, saya tidak menemukan hal menarik, itu hanya situs web statis, jadi saya menyadari bahwa kita mendapatkan informasi subdomain dari pemindaian nmap.

![](/images/year-of-the-jellyfish/c1612d38bfcc.png)

Kemudian, daftarkan semua subdomain tersebut ke dalam /etc/hosts dan periksa satu per satu.

![](/images/year-of-the-jellyfish/9af5446b60ac.png)

![](/images/year-of-the-jellyfish/cf737f744417.png)

![](/images/year-of-the-jellyfish/4cf9a46c8235.png)

![](/images/year-of-the-jellyfish/2144cbb8a9b6.png)

Subdomain beta sedang dalam pembangunan, subdomain dev tampaknya persis sama dengan domain utama, jadi hanya subdomain monitor yang memberi kita aplikasi berbeda dan kita juga dapat menangkap versi aplikasi yang tepat yaitu **monitor 1.7.6m** jadi mari kita cari eksploitasi yang terkait dengan versi tersebut.

![](/images/year-of-the-jellyfish/6c3387538266.png)

Di antara kedua skrip exploit tersebut, kami memilih RCE yang dapat membawa kita ke revshell. Mari kita periksa skrip dan jalankan.

![](/images/year-of-the-jellyfish/eaa371c77aec.png)

![](/images/year-of-the-jellyfish/32bada7553c0.png)

Saat menjalankan skrip, kami mendapatkan kesalahan SSL karena skrip kami tidak menangani koneksi aman (https), sedangkan target kami menggunakan https. Jadi, mari kita modifikasi skrip kita untuk menangani koneksi aman dan jalankan kembali skrip tersebut.

![](/images/year-of-the-jellyfish/ed180aa8f487.png)

![](/images/year-of-the-jellyfish/e495444faa16.png)

Tertulis “Sebuah skrip shell harus diunggah.” Menurut kode eksploitasi, file tersebut seharusnya diunggah di jalur ini: “***/assets/data/usrimg****”*. Oh, tidak ada yang terunggah:

![](/images/year-of-the-jellyfish/d89a37a3d249.png)

Mari kita cetak kode respons untuk melihat apa yang terjadi:

![](/images/year-of-the-jellyfish/a559ad04b0fa.png)

Sesuatu melacak kita dan mencegah eksploitasi ini berjalan:

![](/images/year-of-the-jellyfish/c198663a38ce.png)

Periksa browser Anda untuk cookie. Ada cookie bernama “**isHuman”: “1”**

![](/images/year-of-the-jellyfish/c55e0623b7ce.png)

Tambahkan cookie ini untuk mengirim dan menerima permintaan:

![](/images/year-of-the-jellyfish/388be1593a65.png)

Jalankan kembali skripnya:

![](/images/year-of-the-jellyfish/b37a7f98602d.png)

File yang diunggah terdeteksi bukan gambar, jadi mari kita coba melewati perlindungan ini dengan menggunakan skenario umum yaitu dengan menambahkan ekstensi ganda pada file (.gif.php)

![](/images/year-of-the-jellyfish/d6cf98c0fb58.png)

![](/images/year-of-the-jellyfish/f3f460ba8098.png)

Ini masih belum berhasil, mari kita coba apakah aplikasi tersebut menerapkan deteksi casesensitive atau tidak dengan mengubah ekstensi menjadi .gif.pHp

![](/images/year-of-the-jellyfish/72028d312172.png)

![](/images/year-of-the-jellyfish/c19bea960cea.png)

Kita berhasil mengunggah file revshell kita, tetapi gagal membuat revshell dari skrip kita, jadi mari kita buat revshell secara manual dengan mengakses file yang telah kita unggah.

![](/images/year-of-the-jellyfish/ca5e2edbe9a2.png)

Voila, kita berhasil mendapatkan revshell. Sebagai catatan, jika Anda menggunakan port lain seperti 4444 atau lainnya, revshell tidak akan berhasil dibuat, mungkin karena firewall atau hal lain. Jadi, cara yang lebih baik adalah membuat revshell kita menggunakan port umum seperti 443, atau 80 yang digunakan oleh aplikasi.

![](/images/year-of-the-jellyfish/05e50e0ae6fa.png)

# LinPriv

keluaran dari [https://github.com/The-Z-Labs/linux-exploit-suggester/blob/master/linux-exploit-suggester.sh](https://github.com/The-Z-Labs/linux-exploit-suggester/blob/master/linux-exploit-suggester.sh) :

![](/images/year-of-the-jellyfish/2cc1c1771e6e.png)

output dari linpeas:

![](/images/year-of-the-jellyfish/766c0ede2a27.png)

lalu kita periksa versi snap

![](/images/year-of-the-jellyfish/4b1a7a082752.png)

mencari celah keamanan yang terkait dengan versi snap yang terinstal.

![](/images/year-of-the-jellyfish/7606d0e3c78f.png)

lalu saya periksa satu per satu, ketika menggunakan skrip [46361.py](http://46361.py/) saya mendapat perintah untuk memasukkan nama pengguna dan kunci, karena saya tidak memiliki hal-hal tersebut, saya melewati skrip tersebut, lalu saya melanjutkan dengan [4636](http://46361.py/)2.py.

Menjalankan skrip [46362.py](http://46361.py/) akan memberikan output seperti berikut.

![](/images/year-of-the-jellyfish/e2eb7a987f96.png)

Setelah skrip selesai dijalankan, beralihlah ke pengguna dirty_sock lalu jalankan sudo su dan voila, kita mendapatkan akses root.

![](/images/year-of-the-jellyfish/7cfcf3baf5b5.png)

## Tidak disengaja

biji rami:

![](/images/year-of-the-jellyfish/a9e28825b954.png)

menjalankan skrip eksploitasi pwnkit.py

![](/images/year-of-the-jellyfish/39fa200d47b6.png)

Voila, kita mendapatkan akses root!
