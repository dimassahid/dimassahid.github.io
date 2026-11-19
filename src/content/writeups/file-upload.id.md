---
title: "File Upload"
description: "Melewati Pemfilteran Validasi Ekstensi Pemfilteran Tipe File Dalam validasi tipe file terdapat dua jenis validasi: - Validasi MIME: - Validasi Angka Ajaib: Contoh"
lang: "id"
translationKey: "file-upload"
category: "lab-writeups"
tags: []
publishDate: "2024-08-30"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "3ae59529-f7cd-468d-b11b-8af20689561f"
notionUrl: "https://app.notion.com/p/File-Upload-3ae59529f7cd468db11b8af20689561f"
notionLastEdited: "2024-09-05T21:45:00.000Z"
---

# Penyaringan Lewat

### Validasi Ekstensi

### Penyaringan Jenis File

Dalam validasi tipe file terdapat dua jenis validasi:

- Validasi MIME:
![](/images/file-upload/ae428747cd15.png)

- Validasi Nomor Ajaib:
![](/images/file-upload/e6e267f8f27a.png)

### Contoh Kasus:

### Validasi Tipe MIME diterapkan pada file javascript yang diunduh oleh situs web

![](/images/file-upload/e1ae052bba50.png)

Pertama, lakukan pencarian direktori menggunakan dirsearch untuk mengetahui di mana file yang kita unggah akan disimpan.

![](/images/file-upload/37dc426780af.png)

Kemudian, saat Anda mengunggah file, cukup ubah ekstensi file melalui intersep Burp Suite seperti ini:

![](/images/file-upload/5fd3823daa50.png)

Lalu kami mendapatkan cangkang

![](/images/file-upload/75e643a554b7.png)

# Melewati Pemfilteran Sisi Server: Ekstensi File

Pertama, kami menemukan sebuah situs web yang memiliki ekstensi file pada fitur pengunggahan file-nya.

![](/images/file-upload/53890533bfeb.png)

Kemudian kita coba melakukan dirsearch untuk mengetahui di mana file yang diunggah disimpan di aplikasi server. Jangan bergantung pada alat tersebut, kita perlu memeriksa satu per satu direktori yang ditemukan. Dalam kasus ini, saya menemukan halaman **privasi** tempat file diunggah.

![](/images/file-upload/e6a61b89457f.png)

![](/images/file-upload/71b82e14dc1a.png)

Kemudian kita melakukan pencarian menggunakan Intruder Burp Suite untuk mengetahui ekstensi mana yang dilarang (kita berasumsi server menerapkan daftar hitam pada beberapa ekstensi).

![](/images/file-upload/9e0f34b1dff4.png)

Setelah mengetahui ekstensi yang tepat, kami kemudian mengunggah shell untuk mendapatkan reverse shell ke mesin kami.

![](/images/file-upload/4ebb9ed3e4ab.png)

![](/images/file-upload/17645feb15d7.png)

## Melewati Pemfilteran Sisi Server: Angka Ajaib

Mencoba melewati validasi dengan teknik byte null tetapi gagal.

![](/images/file-upload/8cb5e3012258.png)

Karena pesan peringatan menyatakan bahwa aplikasi hanya menerima file GIF, jadi saya memutuskan untuk menambahkan angka ajaib GIF di baris pertama file saya agar terdeteksi sebagai file GIF, dan setelah melakukan dirsearch saya hanya mendapatkan 2 direktori ini (/assets/, /graphics/), kemudian kita coba mengakses file yang baru saja diunggah dari direktori /graphics/ seperti berikut:

![](/images/file-upload/ad59bae9e4ca.png)

### KASUS UNIK

pada case kali ini diberikan website yang fitur upload file dengan adanya proteksi berupa validasi pada sisi client menggunakan javascript yang terlihat pada gambar dibawah ini.

![](/images/file-upload/ae22d017a90c.png)

lalu setelah dilakukan enumerasi ditemukan bahwa aplikasi dibuat menggunakan bahasa pemrograman node.js, karna tujuan kita adalah mendapatkan reverseshell maka nantinya script reverseshell yang kita buat harus menggunakan node.js agar dapat di eksekusi.

![](/images/file-upload/36b99fc373d3.png)

tahap awal mencoba melakukan bypass validasi sisi klien dengan mencegat file javascriptnya, dan menghilangkan validasi upload file-nya

![](/images/file-upload/e2b42099c39b.png)

![](/images/file-upload/496a378f9789.png)

Namun, ketika kami mencoba mengunggah rev_shell.js kami ke sebuah situs web, saya masih mendapatkan respons yang difilter ini.

![](/images/file-upload/90c91b3c8e11.png)

Artinya, aplikasi tersebut juga menerapkan validasi di sisi server, jadi tugas kita adalah mencari tahu jenis validasi apa yang telah diterapkan. Pertama, kita ubah ekstensi file menjadi .jpg.

![](/images/file-upload/cd1dcb22d17d.png)

ini artinya validasi tidak melakukan validasi pada extensionnya, percobaan kedua dilakukan mengubahan pada value mime type menjadi punya image seperti berikut. 

![](/images/file-upload/615cb0530d05.png)

upload file kita berhasil, kemudian dilakukan dirsearch direktori tempat file yang telah kita upload disimpan oleh aplikasi sebagai berikut

![](/images/file-upload/f922a92a1b54.png)

![](/images/file-upload/304442593661.png)

dari hasil enumerasi ditemukan bahwa di direktori konten terdapat gambar-gambar yang disimpan sepertinya menarik, jadi kami mencoba mencari file yang sudah di hapus menggunakan wordlists yang sudah diberikan.

![](/images/file-upload/d04547085a1d.png)

lihat size dari file yang ditemukan 379B kemungkinan besar adalah file revshell yang kita upload karna memang isi dari file kita hanyalah code revshell yang artinya sizenya adalah yang paling kecil dari semua gambar. Lalu kita nc sesuai yang kita definisikan sebelumnya untuk mendapatkan shell. setelah mencoba tetapi gagal, berasumsi bahwa revshell tidak dapat dilakukan jika melalui akses langsung pada file yang diunggah sebelumnya.

![](/images/file-upload/b9e5c97992c5.png)

lalu kami mencoba melakukn trigger revshell yang sudah kita upload sebelumnya

![](/images/file-upload/cd7648ce18f6.png)
