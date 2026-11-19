---
title: "Attacking Kerberos"
description: "Pengenalan Kerberos Apa itu Kerberos? Kerberos adalah layanan otentikasi default untuk domain Microsoft Windows. Tujuannya adalah agar lebih \"aman\" daripada NTLM dengan menggunakan..."
lang: "id"
translationKey: "attacking-kerberos"
category: "lab-writeups"
tags: ["Kerbrute", "Harvesting Ticket", "password spraying rubeus", "Kerberoasting", "AS-Rep Roasting", "pass-the-ticket", "Golden/Silver ticket", "Kerberos Backdoors", "Active Directory"]
publishDate: "2025-05-07"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1ec5fca1-ed80-802a-b22d-d7609cf6ce2c"
notionUrl: "https://app.notion.com/p/Attacking-Kerberos-1ec5fca1ed80802ab22dd7609cf6ce2c"
notionLastEdited: "2025-05-18T22:53:00.000Z"
---

# Pengenalan Kerberos

## **Apa itu Kerberos?**

Kerberos adalah layanan otentikasi default untuk domain Microsoft Windows. Tujuannya adalah agar lebih "aman" daripada NTLM dengan menggunakan otorisasi tiket pihak ketiga serta enkripsi yang lebih kuat. Meskipun NTLM memiliki lebih banyak vektor serangan, Kerberos masih memiliki beberapa kerentanan mendasar seperti NTLM yang dapat kita manfaatkan.

**Terminologi Umum -**

- **Tiket Pemberian Tiket (TGT)** - Tiket pemberian tiket adalah tiket otentikasi yang digunakan untuk meminta
tiket layanan dari TGS untuk sumber daya spesifik dari domain tersebut.
- **Pusat Distribusi Kunci (KDC)** - Pusat Distribusi Kunci adalah layanan untuk menerbitkan TGT dan tiket layanan yang terdiri dari Layanan Otentikasi dan Tiket.
Pemberian Layanan.
- **Layanan Otentikasi (AS)** - Layanan Otentikasi menerbitkan TGT yang akan digunakan oleh TGS di domain untuk meminta akses ke mesin lain dan tiket layanan.
- **Layanan Pemberian Tiket (TGS)** - Layanan Pemberian Tiket menerima TGT dan mengembalikan tiket ke mesin di domain tersebut.
- **Nama Prinsipal Layanan (SPN)** - Nama Prinsipal Layanan adalah pengidentifikasi yang diberikan kepada instance layanan untuk mengaitkan instance layanan dengan akun layanan domain. Windows
mengharuskan layanan memiliki akun layanan domain, itulah sebabnya
Layanan memerlukan pengaturan SPN.
- **Kunci Rahasia Jangka Panjang KDC (Kunci KDC LT)** Kunci KDC didasarkan pada akun layanan KRBTGT. Kunci ini digunakan untuk mengenkripsi TGT dan menandatangani PAC.
- **Kunci Rahasia Jangka Panjang Klien (Kunci LT Klien)** Kunci klien didasarkan pada akun komputer atau layanan. Kunci ini digunakan
untuk memeriksa stempel waktu terenkripsi dan mengenkripsi kunci sesi.
- **Kunci Rahasia Jangka Panjang Layanan (Kunci LT Layanan)** Kunci layanan didasarkan pada akun layanan. Kunci ini digunakan untuk mengenkripsi
Isi bagian layanan pada tiket layanan dan tanda tangani PAC.
- **Kunci Sesi** - Dikeluarkan oleh KDC saat TGT diterbitkan. Pengguna akan memberikan kunci sesi kepada KDC bersama dengan TGT saat meminta tiket layanan.
- **Sertifikat Atribut Hak Akses (PAC)** - PAC berisi semua informasi relevan pengguna, dan dikirim bersama dengan TGT ke KDC untuk ditandatangani oleh Kunci LT Target dan Kunci LT KDC guna memvalidasi pengguna.
## **SESUAI PERSYARATAN dengan Pra-Otentikasi Secara Detail**

Langkah AS-REQ dalam autentikasi Kerberos dimulai ketika pengguna meminta TGT dari KDC. Untuk memvalidasi pengguna dan membuat TGT untuk pengguna, KDC harus mengikuti langkah-langkah berikut. Langkah pertama adalah pengguna mengenkripsi hash NT stempel waktu dan mengirimkannya ke AS. KDC mencoba mendekripsi stempel waktu menggunakan hash NT dari pengguna, jika berhasil KDC akan menerbitkan TGT serta kunci sesi untuk pengguna.

## Pemberian Tiket - Isi Tiket

Untuk memahami bagaimana tiket layanan dibuat dan divalidasi, kita perlu mulai dari mana tiket tersebut berasal; TGT (Ticket Granting Ticket) diberikan oleh pengguna kepada KDC (Key Data Center), sebagai imbalannya, KDC memvalidasi TGT dan mengembalikan tiket layanan.

![](/images/attacking-kerberos/a1ece0bc4991.png)

## Isi Tiket Layanan -

Untuk memahami cara kerja otentikasi Kerberos, Anda perlu memahami terlebih dahulu apa itu tiket-tiket ini.
Isi dan bagaimana tiket layanan divalidasi. Sebuah tiket layanan terdiri dari dua bagian: bagian layanan yang diberikan dan bagian yang diberikan oleh pengguna. Saya akan menjelaskan isi dari masing-masing bagian tersebut.

- Bagian Layanan: Detail Pengguna, Kunci Sesi, Mengenkripsi tiket dengan hash NTLM akun layanan.
- Bagian Pengguna: Stempel Waktu Validitas, Kunci Sesi, Dienkripsi dengan kunci sesi TGT.
![](/images/attacking-kerberos/6b68e6f0c1d7.png)

## Gambaran Umum Otentikasi Kerberos

![](/images/attacking-kerberos/ddcc0fbd375f.png)

AS-REQ - 1.) Klien meminta Tiket Otentikasi atau Tiket Pemberian Tiket (TGT).

AS-REP - 2.) Pusat Distribusi Kunci memverifikasi klien dan mengirimkan kembali TGT yang terenkripsi.

TGS-REQ - 3.) Klien mengirimkan TGT terenkripsi ke Server Pemberian Tiket (TGS) dengan Nama Prinsipal Layanan (SPN) dari layanan yang ingin diakses klien.

TGS-REP - 4.) Pusat Distribusi Kunci (KDC) memverifikasi TGT pengguna dan memastikan bahwa pengguna memiliki akses ke layanan, kemudian mengirimkan kunci sesi yang valid untuk layanan tersebut ke klien.

AP-REQ - 5.) Klien meminta layanan dan mengirimkan kunci sesi yang valid untuk membuktikan bahwa pengguna memiliki akses.

AP-REP - 6.) Layanan ini memberikan akses

## Gambaran Umum Tiket Kerberos -

Tiket utama yang akan Anda terima adalah tiket pemberian tiket (Ticket Granting Ticket/TGT). Tiket ini dapat berupa berbagai format, seperti .kirbi untuk Rubeus dan .ccache untuk Impacket. Tiket biasanya dikodekan dalam format base64 dan dapat berupa...
Digunakan untuk berbagai serangan.

Tiket pemberian tiket (Ticket Granting Ticket/TGT) hanya digunakan untuk mendapatkan tiket layanan dari KDC. Saat meminta TGT dari KDC, pengguna akan melakukan autentikasi dengan kredensial mereka ke KDC dan meminta tiket. Server akan memvalidasi kredensial, membuat TGT, dan mengenkripsinya menggunakan kunci krbtgt. TGT yang terenkripsi dan kunci sesi akan dikirimkan kepada pengguna.

Saat pengguna perlu meminta tiket layanan, mereka akan mengirimkan TGT dan kunci sesi ke KDC, bersama dengan nama principal layanan (SPN) dari layanan yang ingin mereka akses. KDC akan memvalidasi TGT dan kunci sesi. Jika benar, KDC akan memberikan tiket layanan kepada pengguna, yang dapat digunakan untuk melakukan otentikasi ke layanan yang bersangkutan.

## Persyaratan Hak Akses Serangan

- Enumerasi Kerbrute - Tidak memerlukan akses domain
- Lewatkan Tiket - Akses sebagai pengguna ke domain yang diperlukan
- Kerberoasting - Akses sebagai pengguna mana pun yang dibutuhkan
- AS-REP Roasting - Akses sebagai pengguna mana pun yang dibutuhkan
- Tiket Emas - Diperlukan kompromi domain penuh (administrator domain)
- Tiket Perak - Diperlukan hash layanan
- Skeleton Key - Diperlukan kompromi domain penuh (administrator domain)
# Enumerasi dengan Kerbrute

![](/images/attacking-kerberos/bd013f683da0.png)

![](/images/attacking-kerberos/6ef675d8aa20.png)

# Memanen & Memaksa Tiket dengan Rubeus

## **Tiket Panen bersama Rubeus**

```bash
Rubeus.exe harvest /interval:30
```

![](/images/attacking-kerberos/2e748ba82d8f.png)

## **Serangan Brute-Forcing / Penyebaran Kata Sandi dengan Rubeus**

Rubeus dapat melakukan serangan brute force pada kata sandi maupun serangan password spray pada akun pengguna. Saat melakukan brute force pada kata sandi, Anda menggunakan satu akun pengguna dan daftar kata sandi untuk melihat kata sandi mana yang harus dicoba.
Ini berlaku untuk akun pengguna tertentu. Dalam password spraying, Anda memberikan satu kata sandi, misalnya Password1, dan "menyemprot" ke semua akun pengguna yang ditemukan di domain untuk menemukan akun mana yang mungkin memiliki kata sandi tersebut.

Serangan ini akan mengambil kata sandi berbasis Kerberos yang diberikan dan menyebarkannya ke semua pengguna yang ditemukan serta memberikan tiket .kirbi. Tiket ini adalah TGT yang dapat digunakan untuk mendapatkan tiket layanan dari KDC serta untuk digunakan dalam serangan seperti serangan "pass the ticket".

Sebelum melakukan serangan password spraying dengan Rubeus, Anda perlu menambahkan nama domain pengendali domain ke file host Windows. Anda dapat menambahkan IP dan nama domain ke file host dari mesin dengan menggunakan perintah echo:

`echo 10.10.78.105 CONTROLLER.local >> C:\Windows\System32\drivers\etc\hosts`

1.) `cd Downloads` - navigasi ke direktori tempat Rubeus berada

2.) `Rubeus.exe brute /password:Password1 /noticket` - Ini akan mengambil kata sandi yang diberikan dan "menyebarkannya" ke semua pengguna yang ditemukan, lalu memberikan TGT .kirbi untuk pengguna tersebut.

![](/images/attacking-kerberos/ab3751de06ab.png)

Kami berhasil mendapatkan file .kirbi dari pengguna machine1, tetapi ketika saya mencoba menggunakan versi Rubeus terbaru, saya tidak bisa mendapatkan file .kirbi seperti berikut. Saya tidak tahu mengapa.

![](/images/attacking-kerberos/1a98279b8871.png)

# Kerberoasting dengan Rubeus & Impacket

Dalam tugas ini, kita akan membahas salah satu serangan Kerberos yang paling populer - Kerberoasting. Kerberoasting memungkinkan pengguna untuk meminta tiket layanan untuk layanan apa pun dengan SPN terdaftar, kemudian menggunakan tiket tersebut untuk meretas kata sandi layanan. Jika layanan tersebut memiliki SPN terdaftar, maka layanan tersebut dapat di-Kerberoast, namun keberhasilan serangan bergantung pada seberapa kuat kata sandi tersebut dan apakah kata sandi tersebut dapat dilacak, serta hak akses akun layanan yang diretas. Untuk menghitung akun yang dapat di-Kerberoast, saya sarankan menggunakan alat seperti BloodHound untuk menemukan semua akun yang dapat di-Kerberoast. Alat ini akan memungkinkan Anda untuk melihat jenis akun apa yang dapat Anda kerberoast jika mereka adalah administrator domain, dan jenis akun apa yang dapat di-Kerberoast.
koneksi yang mereka miliki dengan bagian domain lainnya. Itu agak di luar cakupan ruangan ini, tetapi ini adalah alat yang hebat untuk menemukan akun yang akan ditargetkan.

Untuk melakukan serangan ini, kita akan menggunakan Rubeus dan Impacket agar Anda memahami berbagai alat yang tersedia untuk Kerberoasting. Ada juga alat lain seperti kekeo dan
Gunakan Invoke-Kerberoast, tetapi saya serahkan kepada Anda untuk melakukan riset sendiri tentang alat-alat tersebut.

## **Memanggang Kerberoast dengan Rubeus**

Kami memiliki 2 layanan yang stabil terhadap Kerberos, yaitu SQLService dan HTTPService.

![](/images/attacking-kerberos/95f014818e6b.png)

Kemudian salin hash tersebut ke mesin penyerang Anda dan masukkan ke dalam file .txt agar kami dapat memecahkannya dengan hashcat.

## **Pemanggangan Kerberoast dengan Impacket**

![](/images/attacking-kerberos/e57677832b74.png)

lalu retas menggunakan hashcat

```bash
hashcat -m 13100 kerberoast.txt Downloads/Pass.txt
```

![](/images/attacking-kerberos/9f3856a65d73.png)

# AS-REP Roasting W/ Impacket

```bash
impacket-GetNPUsers CONTROLLER.local/Machine1:Password1 -request -format hashcat -outputfile try
```

![](/images/attacking-kerberos/57a46f0eceb9.png)

Kemudian mari kita pecahkan hash menggunakan hashcat.

![](/images/attacking-kerberos/756344a481ad.png)

# Lewatkan Tiket bersama mimikatz

## **Ringkasan Tiket Lulus -**

Pass the ticket bekerja dengan mengambil TGT dari memori LSASS mesin. Local Security Authority Subsystem Service (LSASS) adalah proses memori yang menyimpan kredensial pada server direktori aktif dan dapat menyimpan tiket Kerberos bersama dengan jenis kredensial lainnya untuk bertindak sebagai penjaga gerbang dan menerima atau menolak kredensial yang diberikan. Anda dapat mengambil tiket Kerberos dari memori LSASS seperti halnya Anda dapat mengambil hash. Saat Anda mengambil tiket dengan mimikatz, itu akan memberi kita tiket .kirbi yang dapat digunakan untuk mendapatkan hak akses admin domain jika tiket admin domain ada di memori LSASS.

Serangan ini sangat bagus untuk peningkatan hak akses dan pergerakan lateral jika ada tiket akun layanan domain yang tidak aman. Serangan ini memungkinkan Anda untuk meningkatkan hak akses menjadi administrator domain jika Anda mengambil tiket administrator domain dan kemudian meniru tiket tersebut menggunakan serangan PTT mimikatz, sehingga Anda dapat bertindak sebagai administrator domain tersebut. Anda dapat membayangkan serangan "pass the ticket" seperti menggunakan kembali tiket yang sudah ada; di sini kita tidak membuat atau menghancurkan tiket apa pun, kita hanya menggunakan kembali tiket yang sudah ada dari pengguna lain di domain dan meniru tiket tersebut.

![](/images/attacking-kerberos/1209f0e8f016.png)

## **Siapkan Tiket Mimikatz & Dump**

`privilege::debug` - Pastikan ini menghasilkan [output '20' OK] jika tidak, berarti Anda melakukan
tidak memiliki hak akses administrator untuk menjalankan mimikatz dengan benar

![](/images/attacking-kerberos/b4e1280ad7b0.png)

`sekurlsa::tickets /export` - Buang tiketnya

![](/images/attacking-kerberos/ccdaa9c60756.png)

hasil dari tiket dump tersebut

![](/images/attacking-kerberos/fd8edd792561.png)

Saat mencari tiket mana yang akan diimitasi, saya sarankan untuk mencari tiket administrator dari krbtgt seperti yang digariskan merah di atas.

## Lewatkan Tiket bersama Mimikatz

Sekarang setelah kita memiliki tiket yang siap, kita dapat melakukan serangan "pass the ticket" untuk mendapatkan hak akses administrator domain.

1.) `kerberos::ptt <ticket>` - jalankan perintah ini di dalam mimikatz dengan tiket yang Anda ambil sebelumnya. Perintah ini akan menyimpan dan meniru tiket yang diberikan.

![](/images/attacking-kerberos/969e7c623817.png)

2.) `klist` - Di sini kita hanya memverifikasi bahwa kita berhasil meniru tiket dengan mencantumkan tiket yang tersimpan dalam cache. Kita tidak akan menggunakan mimikatz untuk sisa serangan.

![](/images/attacking-kerberos/d47e79d5d1b0.png)

3.) Anda sekarang telah menyamar sebagai pemegang tiket, sehingga Anda memiliki hak yang sama dengan TGT yang Anda samarkan. Untuk memverifikasi hal ini, kita dapat melihat berbagi admin.

**Sebelum menyerahkan tiket**

![](/images/attacking-kerberos/84ef37abb26b.png)

Setelah melewati pemeriksaan tiket, kita bisa masuk.

![](/images/attacking-kerberos/c608d6f604ef.png)

# Serangan Tiket Emas/Perak dengan mimikatz

## **Buang hash krbtgt**

```bash
lsadump::lsa /inject /name:krbtgt
```

Ini akan menampilkan hash serta pengidentifikasi keamanan yang dibutuhkan untuk membuat Golden Ticket. Untuk membuat tiket perak, Anda perlu mengubah /name: untuk menampilkan hash dari akun admin domain atau akun layanan seperti akun SQLService.

![](/images/attacking-kerberos/0fe904c673e2.png)

## **Buat Tiket Emas/Perak**

```bash
Kerberos::golden /user:Administrator /domain:controller.local /sid: /krbtgt: /id:
```

Ini adalah perintah untuk membuat tiket emas. Untuk membuat tiket perak, cukup masukkan hash NTLM layanan ke dalam slot krbtgt, sid akun layanan ke dalam sid, dan ubah id menjadi 1103.

Saya akan menunjukkan demonstrasi cara membuat tiket emas, terserah Anda untuk membuat tiket perak.

![](/images/attacking-kerberos/17d34ec38373.png)

## **Gunakan Tiket Emas/Perak untuk mengakses mesin lainnya**

`misc::cmd` - ini akan membuka command prompt baru dengan hak akses administrator menggunakan tiket yang diberikan di mimikatz.

![](/images/attacking-kerberos/611871ed32c6.png)

Akses ke mesin yang Anda inginkan, apa yang dapat Anda akses akan bergantung pada hak akses pengguna yang Anda pilih untuk mengambil tiket tersebut. Namun, jika Anda mengambil tiket dari krbtgt, Anda memiliki akses ke SELURUH jaringan, sesuai dengan namanya tiket emas; sedangkan tiket perak hanya memiliki akses ke mesin yang dapat diakses pengguna tersebut. Jika pengguna tersebut adalah administrator domain, tiket perak hampir dapat mengakses seluruh jaringan, meskipun hak aksesnya sedikit lebih rendah daripada tiket emas.

![](/images/attacking-kerberos/7589be212a7a.png)

Serangan ini tidak akan berhasil tanpa mesin lain di domain tersebut, namun saya menantang Anda untuk mengkonfigurasi ini di jaringan Anda sendiri dan mencoba serangan ini.

# Pintu Belakang Kerberos dengan mimikatz

Selain mempertahankan akses menggunakan tiket emas dan perak, mimikatz memiliki satu trik lagi dalam menyerang Kerberos. Tidak seperti serangan tiket emas dan perak, backdoor Kerberos jauh lebih halus karena bertindak mirip dengan rootkit dengan menanamkan dirinya ke dalam memori domain forest, sehingga memungkinkan akses ke mesin mana pun yang memiliki kata sandi utama.

Backdoor Kerberos bekerja dengan menanamkan kunci utama yang menyalahgunakan cara AS-REQ memvalidasi stempel waktu terenkripsi. Kunci utama hanya berfungsi menggunakan enkripsi Kerberos RC4.

Hash default untuk kunci kerangka mimikatz adalah *60BA4FCADC466C7A033C178194C03DF6* yang membuat kata sandinya menjadi -"*mimikatz*"

Ini hanya akan menjadi bagian gambaran umum dan tidak mengharuskan Anda melakukan apa pun pada mesin tersebut, namun saya mendorong Anda untuk melanjutkan sendiri dan menambahkan mesin lain serta menguji menggunakan kunci kerangka dengan mimikatz.

## Gambaran Umum Skeleton Key -

Kunci utama bekerja dengan memanfaatkan stempel waktu terenkripsi AS-REQ seperti yang saya sebutkan di atas, stempel waktu tersebut dienkripsi dengan hash NT pengguna. Pengontrol domain kemudian mencoba mendekripsi stempel waktu ini dengan hash NT pengguna, setelah kunci utama ditanamkan, pengontrol domain mencoba mendekripsi stempel waktu menggunakan hash NT pengguna dan hash NT kunci utama, sehingga memungkinkan Anda mengakses forest domain.

## **Cara Memasang Skeleton Key dengan mimikatz**

`misc::skeleton` - Ya! itu dia, tapi jangan remehkan perintah kecil ini, perintah ini sangat ampuh.

![](/images/attacking-kerberos/865e9d1e644f.png)

## Mengakses hutan

Kredensial defaultnya adalah: "*mimikatz*"

Contoh: `net use c:\\DOMAIN-CONTROLLER\admin$ /user:Administrator mimikatz` - Share ini sekarang dapat diakses tanpa perlu kata sandi Administrator.

Contoh: `dir \\Desktop-1\c$ /user:Machine1 mimikatz` - mengakses direktori Desktop-1 tanpa mengetahui pengguna mana yang memiliki akses ke Desktop-1

Kunci utama tidak akan tersimpan dengan sendirinya karena berjalan di memori, kunci tersebut dapat diotomatisasi dengan skrip atau disimpan menggunakan alat dan teknik lain, namun hal itu di luar cakupan pembahasan di ruangan ini.
