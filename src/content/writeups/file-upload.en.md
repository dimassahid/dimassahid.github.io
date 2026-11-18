---
title: "File Upload"
description: "Bypass Filtering Extension Validation File Type Filtering in the file type validation there are two type of validation : - MIME Validation : - Magic Number Validation : Contoh"
lang: "en"
translationKey: "file-upload"
category: "lab-writeups"
tags: []
publishDate: "2024-08-30"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "3ae59529-f7cd-468d-b11b-8af20689561f"
notionUrl: "https://app.notion.com/p/File-Upload-3ae59529f7cd468db11b8af20689561f"
notionLastEdited: "2024-09-05T21:45:00.000Z"
---

# Bypass Filtering

### Extension Validation

### File Type Filtering

in the file type validation there are two type of validation :

- MIME Validation : 
![](/images/file-upload/ae428747cd15.png)

- Magic Number Validation :
![](/images/file-upload/e6e267f8f27a.png)

### Contoh Case :

### MIME Type validation diterapkan pada file javascript yang diload oleh website

![](/images/file-upload/e1ae052bba50.png)

first, doing directory searching using dirsearch to know where the file we uploaded will be saved.

![](/images/file-upload/37dc426780af.png)

Then, when you upload the file just change the extension of the file via burpsuite interception like this :

![](/images/file-upload/5fd3823daa50.png)

Then we got a shell 

![](/images/file-upload/75e643a554b7.png)

# Bypassing Server-Side Filtering: File Extensions

first we got a website which has file extension on its uploading file feature

![](/images/file-upload/53890533bfeb.png)

Then we try to dirsearch where the file was uploaded is saved in the server application. don’t rely on the tool, we need to check one by one directories which has found. in this case I found **privacy** page which the file uploaded.

![](/images/file-upload/e6a61b89457f.png)

![](/images/file-upload/71b82e14dc1a.png)

Then we do search using intruder burpsuite to know which extension is forbidden (we assume server implement blacklist in some extension).

![](/images/file-upload/9e0f34b1dff4.png)

after knowing the proper extension, then we uploaded a shell to get reverse shell into our machine.

![](/images/file-upload/4ebb9ed3e4ab.png)

![](/images/file-upload/17645feb15d7.png)

## Bypassing Server-Side Filtering: Magic Numbers

trying to bypass validation with null byte technique but failed 

![](/images/file-upload/8cb5e3012258.png)

because the prompt message states that the application only receive GIF file, so I decided to adding magic number of GIF on the top line of my file in order to be detected as GIF file, and after doing dirsearch I just get these 2 directories (/assets/,/graphics/), then we just try to accessing our file that just uploded from directoy /graphics/ like the following :

![](/images/file-upload/ad59bae9e4ca.png)

### UNIQUE CASE

pada case kali ini diberikan website yang terdapat fitur upload file dengan adanya proteksi berupa validasi pada sisi client menggunakan javascript yang terlihat pada gambar dibawah ini.

![](/images/file-upload/ae22d017a90c.png)

lalu setelah dilakukan enumerasi ditemukan bahwa aplikasi dibuat menggunakan bahasa pemrograman node.js, karna goal kita adalah mendapatkan reverseshell maka nantinya script reverseshell yang kita buat harus menggunakan node.js agar dapat di execute.

![](/images/file-upload/36b99fc373d3.png)

tahap awal mencoba melakukan bypass client side validation dengan mencegat file javascriptnya, dan menghilangkan validasi upload file-nya

![](/images/file-upload/e2b42099c39b.png)

![](/images/file-upload/496a378f9789.png)

but when we try to upload our rev_shell.js on a website I still got this response filtered

![](/images/file-upload/90c91b3c8e11.png)

it means the application also implement validation on server side, so our job is to look for what kind of validation that has bees implemented, first we change the extension become .jpg

![](/images/file-upload/cd1dcb22d17d.png)

ini artinya validasi tidak melakukan validation pada extensionnya, percobaan kedua dilakukan pengubahan pada value mime type menjadi punya image seperti berikut. 

![](/images/file-upload/615cb0530d05.png)

upload file kita berhasil, kemudian dilakukan dirsearch directory tempat file yang telah kita upload disimpan oleh aplikasi sebagai berikut

![](/images/file-upload/f922a92a1b54.png)

![](/images/file-upload/304442593661.png)

dari hasil enumerasi ditemukan bahwa di directory content terdapat gambar-gambar yang disimpan it seems interesting, so we tried to dirsearch file yang sudah di hapus menggunakan wordlists yang sudah diberikan.

![](/images/file-upload/d04547085a1d.png)

lihat size dari file yang ditemukan 379B kemungkinan besar adalah file revshell yang kita upload karna memang isi dari file kita hanyalah code revshell which means sizenya adalah yang paling kecil dari semua gambar. Lalu kita nc sesuai yang kita define sebelumnya untuk mendapatkan shell. setelah mencoba tetapi gagal, berasumsi bahwa revshell tidak bisa dilakukan jika melalui direct akses pada uploaded file sebelumnya.

![](/images/file-upload/b9e5c97992c5.png)

lalu kami mencoba melakukn trigger revshell yang sudah kita upload sebelumnya

![](/images/file-upload/cd7648ce18f6.png)
